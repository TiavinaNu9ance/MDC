/**
 * MDC ERP — Authentification par code à usage unique envoyé par e-mail.
 * Seules les adresses de l'onglet « Utilisateurs » (Actif) peuvent se connecter.
 * Rôles : Formateur, Administrateur, Superadmin (+ « Est formateur » pour cumuler).
 */
const OTP_TTL_S = 600, OTP_ESSAIS = 5, OTP_DELAI_S = 45;

function hash_(texte) {
  const props = PropertiesService.getScriptProperties();
  let sel = props.getProperty('AUTH_SEL');
  if (!sel) { sel = Utilities.getUuid(); props.setProperty('AUTH_SEL', sel); }
  return Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, sel + '|' + texte)
    .map(function (b) { return ((b + 256) % 256).toString(16).padStart(2, '0'); }).join('');
}

function normEmail_(e) { return String(e || '').trim().toLowerCase(); }

function utilisateurParEmail_(email) {
  email = normEmail_(email);
  return lire_(ONGLETS.UTILISATEURS).filter(function (u) { return normEmail_(u['Email']) === email; })[0] || null;
}

function estActif_(u) { return u && (u['Actif'] === true || u['Actif'] === 'Oui' || u['Actif'] === 'TRUE'); }
function estFormateurFlag_(u) { return u['Rôle'] === 'Formateur' || u['Est formateur'] === true || u['Est formateur'] === 'Oui' || u['Est formateur'] === 'TRUE'; }

function profil_(u) {
  const admin = u['Rôle'] === 'Administrateur' || u['Rôle'] === 'Superadmin';
  return {
    email: normEmail_(u['Email']), nom: u['Nom'] || u['Email'], role: u['Rôle'],
    admin: admin, superadmin: u['Rôle'] === 'Superadmin',
    formateur: estFormateurFlag_(u) && !!u['ID Formateur'], idFormateur: u['ID Formateur'] || ''
  };
}

/** Étape 1 : envoi du code. Réponse identique que l'adresse soit connue ou non. */
function apiDemanderCode(email) {
  email = normEmail_(email);
  const neutre = { message: 'Si cette adresse est autorisée, un code de connexion vient de lui être envoyé.' };
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) throw new Error('Adresse e-mail invalide.');
  const cache = CacheService.getScriptCache();
  const cleRate = 'otp-rate:' + hash_(email);
  if (cache.get(cleRate)) throw new Error('Un code vient d\'être envoyé. Patientez quelques secondes avant de redemander.');
  cache.put(cleRate, '1', OTP_DELAI_S);
  const u = utilisateurParEmail_(email);
  if (!u || !estActif_(u)) { journal_('Connexion refusée', email); return neutre; }
  const code = String(Math.floor(100000 + Math.random() * 900000));
  cache.put('otp:' + hash_(email), JSON.stringify({ h: hash_(email + ':' + code), n: 0 }), OTP_TTL_S);
  const nom = param_('EXPEDITEUR_NOM', 'MDC ERP');
  MailApp.sendEmail({
    to: email, name: nom, subject: 'Votre code de connexion ' + nom + ' : ' + code,
    htmlBody: '<div style="font-family:-apple-system,Segoe UI,Arial,sans-serif;max-width:420px;margin:auto;padding:24px;color:#1d1d1f">' +
      '<p style="font-size:15px">Bonjour ' + echapper_(u['Nom'] || '') + ',</p><p style="font-size:15px">Voici votre code de connexion :</p>' +
      '<p style="font-size:34px;letter-spacing:8px;font-weight:600;margin:18px 0">' + code + '</p>' +
      '<p style="color:#6e6e73;font-size:13px">Il est valable 10 minutes. Si vous n\'êtes pas à l\'origine de cette demande, ignorez ce message.</p></div>'
  });
  return neutre;
}

/** Étape 2 : vérification du code → jeton de session. */
function apiVerifierCode(email, code) {
  email = normEmail_(email);
  const cache = CacheService.getScriptCache();
  const cle = 'otp:' + hash_(email);
  const brut = cache.get(cle);
  if (!brut) throw new Error('Code expiré ou inexistant. Demandez un nouveau code.');
  const o = JSON.parse(brut);
  if (o.n >= OTP_ESSAIS) { cache.remove(cle); throw new Error('Trop de tentatives. Demandez un nouveau code.'); }
  if (o.h !== hash_(email + ':' + String(code || '').trim())) {
    o.n++; cache.put(cle, JSON.stringify(o), OTP_TTL_S);
    throw new Error('Code incorrect (' + (OTP_ESSAIS - o.n) + ' essai(s) restant(s)).');
  }
  cache.remove(cle);
  const u = utilisateurParEmail_(email);
  if (!u || !estActif_(u)) throw new Error('Accès non autorisé.');
  nettoyerSessions_();
  const jeton = Utilities.getUuid() + Utilities.getUuid().replace(/-/g, '');
  const duree = Number(param_('SESSION_DUREE_JOURS', 7)) || 7;
  PropertiesService.getScriptProperties().setProperty('sess_' + hash_(jeton),
    JSON.stringify({ e: email, x: Date.now() + duree * 86400000 }));
  maj_(ONGLETS.UTILISATEURS, u._row, { 'Dernière connexion': new Date() });
  journal_('Connexion', email);
  return { jeton: jeton, moi: profil_(u) };
}

function apiDeconnexion(jeton) {
  if (jeton) PropertiesService.getScriptProperties().deleteProperty('sess_' + hash_(jeton));
  return { message: 'Déconnecté.' };
}

function nettoyerSessions_() {
  const props = PropertiesService.getScriptProperties();
  const tout = props.getProperties();
  Object.keys(tout).forEach(function (k) {
    if (k.indexOf('sess_') !== 0) return;
    try { if (JSON.parse(tout[k]).x < Date.now()) props.deleteProperty(k); } catch (e) { props.deleteProperty(k); }
  });
}

/**
 * Contrôle d'accès de chaque appel. niveau : 'connecte' | 'admin' | 'superadmin'.
 * Le compte est relu à chaque appel : une désactivation est immédiate.
 */
let UTILISATEUR_COURANT_ = null;
function auth_(jeton, niveau) {
  if (!jeton) throw new Error('SESSION_EXPIREE');
  const brut = PropertiesService.getScriptProperties().getProperty('sess_' + hash_(jeton));
  if (!brut) throw new Error('SESSION_EXPIREE');
  const s = JSON.parse(brut);
  if (s.x < Date.now()) { apiDeconnexion(jeton); throw new Error('SESSION_EXPIREE'); }
  const u = utilisateurParEmail_(s.e);
  if (!u || !estActif_(u)) throw new Error('SESSION_EXPIREE');
  const p = profil_(u);
  if (niveau === 'admin' && !p.admin) throw new Error('Action réservée aux administrateurs.');
  if (niveau === 'superadmin' && !p.superadmin) throw new Error('Action réservée au superadmin.');
  UTILISATEUR_COURANT_ = p.email;
  return p;
}

function apiMoi(jeton) { return auth_(jeton, 'connecte'); }

/* ---------- Gestion des utilisateurs (superadmin) ---------- */
function apiUtilisateur(jeton, ligne, data) {
  const moi = auth_(jeton, 'superadmin');
  const email = normEmail_(data['Email']);
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) throw new Error('Adresse e-mail invalide.');
  if (ROLES.indexOf(data['Rôle']) < 0) throw new Error('Rôle invalide.');
  const tous = lire_(ONGLETS.UTILISATEURS);
  const doublon = tous.filter(function (u) { return normEmail_(u['Email']) === email && u._row !== Number(ligne); })[0];
  if (doublon) throw new Error('Cette adresse existe déjà.');
  const actif = data['Actif'] === true || data['Actif'] === 'Oui';
  const avant = ligne ? tous.filter(function (u) { return u._row === Number(ligne); })[0] : null;
  // Toujours au moins un superadmin actif.
  const supersRestants = tous.filter(function (u) {
    return u['Rôle'] === 'Superadmin' && estActif_(u) && u._row !== Number(ligne);
  }).length + (data['Rôle'] === 'Superadmin' && actif ? 1 : 0);
  if (supersRestants === 0) throw new Error('Il doit rester au moins un superadmin actif.');
  const estForm = data['Rôle'] === 'Formateur' || data['Est formateur'] === true;
  let idF = data['ID Formateur'] || (avant ? avant['ID Formateur'] : '');
  if (idF && !trouver_(ONGLETS.FORMATEURS, 'ID Formateur', idF)) throw new Error('Fiche formateur introuvable.');
  if (estForm && !idF) idF = lierFormateur_(email, data['Nom']);
  if (!estForm) idF = avant ? avant['ID Formateur'] : '';
  const obj = {
    'Email': email, 'Nom': data['Nom'] || '', 'Rôle': data['Rôle'], 'Est formateur': estForm ? 'Oui' : 'Non',
    'ID Formateur': idF, 'Actif': actif ? 'Oui' : 'Non'
  };
  if (avant) maj_(ONGLETS.UTILISATEURS, avant._row, obj);
  else { obj['Créé le'] = new Date(); ajouter_(ONGLETS.UTILISATEURS, obj); }
  journal_('Utilisateur', email + ' : ' + obj['Rôle'] + (estForm ? ' + formateur' : '') + (actif ? '' : ' (inactif)'));
  return rep_('Utilisateur ' + email + ' enregistré.', moi);
}

/** Retrouve (par e-mail) ou crée la fiche formateur liée à un utilisateur. */
function lierFormateur_(email, nom) {
  const f = lire_(ONGLETS.FORMATEURS).filter(function (x) { return normEmail_(x['Email']) === email; })[0];
  if (f) return f['ID Formateur'];
  const id = nouvelId_(ONGLETS.FORMATEURS, 'ID Formateur', 'T');
  ajouter_(ONGLETS.FORMATEURS, { 'ID Formateur': id, 'Nom': nom || email, 'Email': email, 'Actif': true });
  return id;
}
