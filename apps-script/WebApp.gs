/**
 * MDC ERP — Application web. La Google Sheet sert uniquement de base de données.
 * Chaque fonction api* reçoit le jeton de session en premier argument et contrôle le rôle.
 * Déploiement : Exécuter en tant que « Moi », accès « Tout le monde » (l'accès réel est contrôlé par l'ERP).
 */
function doGet() {
  return HtmlService.createTemplateFromFile('Index').evaluate()
    .setTitle('MDC ERP')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1, viewport-fit=cover');
}

function serialiser_(rows) {
  const tz = ss_().getSpreadsheetTimeZone();
  return rows.map(function (o) {
    const r = {};
    Object.keys(o).forEach(function (k) {
      const v = o[k];
      r[k] = v instanceof Date ? Utilities.formatDate(v, tz, 'yyyy-MM-dd') : v;
    });
    return r;
  });
}

function idsFormateurs_(s) {
  return String(s['ID Formateurs'] || '').split(',').map(function (x) { return x.trim(); }).filter(String);
}

function sessionAutorisee_(moi, idSession) {
  const s = trouver_(ONGLETS.SESSIONS, 'ID Session', idSession);
  if (!s) throw new Error('Session introuvable.');
  if (moi.admin) return s;
  if (moi.formateur && idsFormateurs_(s).indexOf(moi.idFormateur) >= 0) return s;
  throw new Error('Cette formation ne vous est pas attribuée.');
}

/** Données visibles selon l'espace (admin / formateur). */
function apiCharger(jeton, espace) {
  const moi = auth_(jeton, 'connecte');
  return charger_(moi, espace);
}

function charger_(moi, espace) {
  const tz = ss_().getSpreadsheetTimeZone();
  const C = {
    PHASES: PHASES, ETAPES_FMFP: ETAPES_FMFP, STATUT_PHASE: STATUT_PHASE, STATUT_PROFORMA: STATUT_PROFORMA,
    MODES_PAIEMENT: MODES_PAIEMENT, ROLES: ROLES, SEUIL: Number(param_('SEUIL_ATTESTATION', 80)),
    AUJOURDHUI: Utilities.formatDate(new Date(), tz, 'yyyy-MM-dd'), SOCIETE: param_('SOCIETE_NOM_COURT', 'MDC')
  };
  const modeFormateur = espace === 'formateur' || !moi.admin;
  if (modeFormateur) {
    if (!moi.formateur) throw new Error('Aucune fiche formateur n\'est liée à votre compte.');
    const sessions = lire_(ONGLETS.SESSIONS).filter(function (s) { return idsFormateurs_(s).indexOf(moi.idFormateur) >= 0; });
    const ids = sessions.map(function (s) { return s['ID Session']; });
    return { moi: moi, espace: 'formateur', constantes: C,
      SESSIONS: serialiser_(sessions),
      PARTICIPANTS: serialiser_(lire_(ONGLETS.PARTICIPANTS).filter(function (p) { return ids.indexOf(p['ID Session']) >= 0; })),
      FORMATEURS: serialiser_(lire_(ONGLETS.FORMATEURS).map(function (f) { return { 'ID Formateur': f['ID Formateur'], 'Nom': f['Nom'] }; })) };
  }
  const d = { moi: moi, espace: 'admin', constantes: C };
  ['GROUPES', 'ENTITES', 'CATALOGUE', 'FORMATEURS', 'PROFORMAS', 'FACTURES', 'LIGNES', 'PAIEMENTS', 'SESSIONS',
    'PARTICIPANTS', 'FMFP', 'EXPORTS'].forEach(function (k) { d[k] = serialiser_(lire_(ONGLETS[k])); });
  C.TVA = tauxTva_(); C.TVA_DEFAUT = tvaApplicable_(); C.TAUX_TVA = Number(param_('TAUX_TVA', 0.2)) || 0;
  C.POURCENT_ACOMPTE = Number(param_('POURCENT_ACOMPTE', 70));
  C.VALIDITE = Number(param_('VALIDITE_PROFORMA_JOURS', 30));
  C.HUBSPOT = !!PropertiesService.getScriptProperties().getProperty('HUBSPOT_TOKEN');
  C.DOSSIER_PDF = param_('DOSSIER_EXPORT_ID', '') ? 'https://drive.google.com/drive/folders/' + param_('DOSSIER_EXPORT_ID', '') : '';
  C.DOC = contexteSociete_();
  if (moi.superadmin) {
    d.UTILISATEURS = serialiser_(lire_(ONGLETS.UTILISATEURS));
    d.PARAMS = serialiser_(lire_(ONGLETS.PARAMS));
    d.COMPTEURS = serialiser_(lire_(ONGLETS.COMPTEURS));
    C.SCHEMA = PARAMS_SCHEMA;
  }
  return d;
}

function rep_(message, moi, extra) {
  const r = { message: message, data: charger_(moi, 'admin') };
  Object.keys(extra || {}).forEach(function (k) { r[k] = extra[k]; });
  return r;
}

/* ---------- Documents (admin) ---------- */
function apiCreerProforma(jeton, data) {
  const moi = auth_(jeton, 'admin');
  const r = creerProforma(data);
  return rep_(r.message, moi, { id: r.id, url: r.url });
}
function apiMajBrouillon(jeton, id, data) {
  const moi = auth_(jeton, 'admin');
  const r = majBrouillon_(id, data);
  return rep_(r.message, moi, { id: id, url: r.url });
}
function apiEmettre(jeton, idProforma) {
  const moi = auth_(jeton, 'admin');
  const r = emettreProforma_(idProforma);
  return rep_(r.message, moi, { url: r.url });
}
function apiFacturer(jeton, idProforma, type) {
  const moi = auth_(jeton, 'admin');
  if (!TYPES_FACTURE[type]) throw new Error('Type de facture inconnu.');
  const r = creerFactureDepuisProforma_(idProforma, type);
  return rep_(r.message, moi, { url: r.url });
}
function apiStatutProforma(jeton, idProforma, statut) {
  const moi = auth_(jeton, 'admin');
  if (['Acceptée', 'Refusée', 'Émise'].indexOf(statut) < 0) throw new Error('Statut non autorisé.');
  const p = trouver_(ONGLETS.PROFORMAS, 'ID', idProforma);
  if (!p || !p['N°']) throw new Error('Proforma non émise.');
  maj_(ONGLETS.PROFORMAS, p._row, { 'Statut': statut });
  journal_('Statut proforma', p['N°'] + ' → ' + statut);
  return rep_('Proforma ' + p['N°'] + ' : ' + statut + '.', moi);
}
function apiAnnuler(jeton, type, id) {
  const moi = auth_(jeton, 'admin');
  const onglet = type === 'PF' ? ONGLETS.PROFORMAS : ONGLETS.FACTURES;
  const o = trouver_(onglet, 'ID', id);
  if (!o) throw new Error('Document introuvable.');
  maj_(onglet, o._row, type === 'PF' ? { 'Statut': 'Annulée' } : { 'Statut': 'Annulée', 'Reste à payer': 0, 'Statut paiement': 'Annulée' });
  journal_('Annulation', o['N°'] || o['ID']);
  return rep_((o['N°'] || o['ID']) + ' annulé(e). Le numéro ne sera jamais réutilisé.', moi);
}
function apiRegenererPdf(jeton, type, id) {
  const moi = auth_(jeton, 'admin');
  const onglet = type === 'PF' ? ONGLETS.PROFORMAS : ONGLETS.FACTURES;
  const o = trouver_(onglet, 'ID', id);
  if (!o || !o['N°']) throw new Error('Document non émis.');
  const url = genererPdf_(type, o);
  maj_(onglet, o._row, { 'Lien PDF': url });
  return rep_('PDF régénéré (même numéro).', moi, { url: url });
}
function apiPaiement(jeton, numFacture, montant, mode, reference, date) {
  const moi = auth_(jeton, 'admin');
  paiementCore_(numFacture, montant, mode, reference, date);
  return rep_('Paiement enregistré sur ' + numFacture + '.', moi);
}

/* ---------- Formations ---------- */
function apiCreerSession(jeton, idProforma, fmfp) {
  const moi = auth_(jeton, 'admin');
  const id = creerSessionCore_(idProforma, fmfp);
  controlerPhases();
  return rep_('Session ' + id + ' créée' + (fmfp ? ' avec dossier FMFP.' : '.'), moi, { id: id });
}

/** Informations de session et affectation des formateurs (admin). */
function apiSessionInfos(jeton, idSession, champs, idsForm) {
  const moi = auth_(jeton, 'admin');
  const s = sessionAutorisee_(moi, idSession);
  const autorises = ['Intitulé', 'Date début', 'Date fin', 'Lieu', 'Nb participants', 'Lien dossier', 'Notes'];
  const m = {};
  autorises.forEach(function (k) {
    if (champs[k] === undefined) return;
    let v = champs[k];
    if (/^Date/.test(k)) v = v ? new Date(v + 'T00:00:00') : '';
    m[k] = v;
  });
  if (idsForm) {
    const forms = lire_(ONGLETS.FORMATEURS);
    const ok = idsForm.filter(function (id) { return forms.some(function (f) { return f['ID Formateur'] === id; }); });
    m['ID Formateurs'] = ok.join(', ');
    m['Formateur(s)'] = ok.map(function (id) { return forms.filter(function (f) { return f['ID Formateur'] === id; })[0]['Nom']; }).join(', ');
  }
  maj_(ONGLETS.SESSIONS, s._row, m);
  controlerPhases(); actualiserExports();
  journal_('Session', idSession + ' : informations');
  return { message: 'Session enregistrée.', data: charger_(moi, 'admin') };
}

/** Phases : l'admin gère les 6 phases, le formateur affecté les phases P2 à P6. */
function apiSessionPhases(jeton, espace, idSession, phases) {
  const moi = auth_(jeton, 'connecte');
  const s = sessionAutorisee_(moi, idSession);
  const modeAdmin = moi.admin && espace !== 'formateur';
  const m = {};
  PHASES.forEach(function (ph, i) {
    if (phases[ph] === undefined) return;
    if (STATUT_PHASE.indexOf(phases[ph]) < 0) throw new Error('Statut de phase invalide.');
    if (i === 0 && !modeAdmin) return;
    m[ph] = phases[ph];
  });
  maj_(ONGLETS.SESSIONS, s._row, m);
  controlerPhases();
  journal_('Phases', idSession);
  return { message: 'Phases enregistrées.', data: charger_(moi, modeAdmin ? 'admin' : 'formateur') };
}

function apiParticipant(jeton, espace, ligne, champs) {
  const moi = auth_(jeton, 'connecte');
  const autorises = ['Nom', 'Fonction', 'Email', 'Niveau test (P2)', 'Niveau validé (P3)', 'Présence (%)', 'Note évaluation (P5)', 'Attestation'];
  const m = {};
  autorises.forEach(function (k) { if (champs[k] !== undefined) m[k] = champs[k]; });
  if (ligne) {
    const p = lire_(ONGLETS.PARTICIPANTS).filter(function (x) { return x._row === Number(ligne); })[0];
    if (!p) throw new Error('Participant introuvable.');
    sessionAutorisee_(moi, p['ID Session']);
    maj_(ONGLETS.PARTICIPANTS, p._row, m);
  } else {
    sessionAutorisee_(moi, champs['ID Session']);
    if (!m['Nom']) throw new Error('Nom obligatoire.');
    m['ID Session'] = champs['ID Session'];
    ajouter_(ONGLETS.PARTICIPANTS, m);
  }
  controlerPhases();
  return { message: 'Participant enregistré.', data: charger_(moi, moi.admin && espace !== 'formateur' ? 'admin' : 'formateur') };
}

function apiSupprimerParticipant(jeton, espace, ligne) {
  const moi = auth_(jeton, 'connecte');
  const p = lire_(ONGLETS.PARTICIPANTS).filter(function (x) { return x._row === Number(ligne); })[0];
  if (!p) throw new Error('Participant introuvable.');
  sessionAutorisee_(moi, p['ID Session']);
  sh_(ONGLETS.PARTICIPANTS).deleteRow(p._row);
  journal_('Participant supprimé', p['ID Session'] + ' : ' + p['Nom']);
  return { message: 'Participant supprimé.', data: charger_(moi, moi.admin && espace !== 'formateur' ? 'admin' : 'formateur') };
}

function apiAttestations(jeton, espace, idSession) {
  const moi = auth_(jeton, 'connecte');
  sessionAutorisee_(moi, idSession);
  const seuil = Number(param_('SEUIL_ATTESTATION', 80));
  lire_(ONGLETS.PARTICIPANTS).filter(function (p) { return p['ID Session'] === idSession && p['Présence (%)'] !== ''; }).forEach(function (p) {
    const v = Number(String(p['Présence (%)']).replace('%', '').replace(',', '.'));
    const pres = v <= 1 ? v * 100 : v;
    maj_(ONGLETS.PARTICIPANTS, p._row, { 'Attestation': pres >= seuil ? 'Oui' : 'Non (présence < ' + seuil + ' %)' });
  });
  controlerPhases();
  return { message: 'Attestations calculées (présence ≥ ' + seuil + ' %).', data: charger_(moi, moi.admin && espace !== 'formateur' ? 'admin' : 'formateur') };
}

function apiMajFmfp(jeton, ligne, champs) {
  const moi = auth_(jeton, 'admin');
  const d = lire_(ONGLETS.FMFP).filter(function (x) { return x._row === Number(ligne); })[0];
  if (!d) throw new Error('Dossier FMFP introuvable.');
  const autorises = ['Étape', 'CV formateurs envoyés', 'Rapports envoyés', 'Fiches de présence envoyées', 'Commentaire', 'Prochaine relance'];
  const m = {};
  Object.keys(champs).forEach(function (k) { if (autorises.indexOf(k) >= 0) m[k] = champs[k]; });
  if (m['Étape'] && m['Étape'] !== d['Étape']) {
    if (ETAPES_FMFP.indexOf(m['Étape']) < 0) throw new Error('Étape inconnue.');
    const now = new Date();
    m['Date étape'] = now;
    m['Prochaine relance'] = /Clôturé/.test(m['Étape']) ? '' : new Date(now.getTime() + Number(param_('DELAI_RELANCE_FMFP_JOURS', 7)) * 86400000);
    m['Relance HubSpot créée'] = false;
  } else if (m['Prochaine relance']) {
    m['Prochaine relance'] = new Date(m['Prochaine relance'] + 'T00:00:00');
  } else delete m['Prochaine relance'];
  maj_(ONGLETS.FMFP, d._row, m);
  journal_('FMFP', d['ID Session'] + ' : ' + (m['Étape'] || 'mise à jour'));
  return rep_('Dossier FMFP ' + d['ID Session'] + ' mis à jour.', moi);
}

/* ---------- Référentiels (admin) ---------- */
const EDITABLES_ = {
  'Catalogue': { proteges: [] },
  'Formateurs': { proteges: ['ID Formateur'] },
  'Groupes': { proteges: ['ID Groupe', 'HubSpot ID'] },
  'Entités': { proteges: ['ID Entité', 'HubSpot ID', 'Source'] }
};

function apiEnregistrer(jeton, nomOnglet, ligne, champs) {
  const moi = auth_(jeton, 'admin');
  const regle = EDITABLES_[nomOnglet];
  if (!regle) throw new Error('Données non modifiables depuis cet écran.');
  const h = entetes_(sh_(nomOnglet));
  const m = {};
  Object.keys(champs).forEach(function (k) {
    if (h.indexOf(k) < 0 || regle.proteges.indexOf(k) >= 0) return;
    m[k] = champs[k];
  });
  if (ligne) {
    maj_(nomOnglet, Number(ligne), m);
  } else {
    const prefixes = { 'Entités': ['ID Entité', 'E'], 'Groupes': ['ID Groupe', 'G'], 'Formateurs': ['ID Formateur', 'T'] };
    if (prefixes[nomOnglet]) m[prefixes[nomOnglet][0]] = nouvelId_(nomOnglet, prefixes[nomOnglet][0], prefixes[nomOnglet][1]);
    if (nomOnglet === ONGLETS.ENTITES) { m['Source'] = 'Saisie ERP'; }
    if (nomOnglet === ONGLETS.CATALOGUE) {
      if (!m['Code']) throw new Error('Code obligatoire.');
      if (trouver_(ONGLETS.CATALOGUE, 'Code', m['Code'])) throw new Error('Ce code existe déjà.');
    }
    ajouter_(nomOnglet, m);
  }
  if (nomOnglet === ONGLETS.ENTITES) {
    const e = ligne ? lire_(nomOnglet).filter(function (x) { return x._row === Number(ligne); })[0] : null;
    if (e) maj_(nomOnglet, e._row, { 'Mis à jour le': new Date() });
  }
  journal_('Modification', nomOnglet + (ligne ? ' ligne ' + ligne : ' (ajout)'));
  return rep_('Enregistré.', moi);
}

/* ---------- Paramètres (superadmin) ---------- */
function apiParametres(jeton, valeurs) {
  const moi = auth_(jeton, 'superadmin');
  const schema = {};
  PARAMS_SCHEMA.forEach(function (p) { schema[p[0]] = p; });
  const lignes = lire_(ONGLETS.PARAMS);
  Object.keys(valeurs).forEach(function (cle) {
    if (!/^[A-Z0-9_]{2,60}$/.test(cle)) throw new Error('Clé invalide : ' + cle);
    if (schema[cle] && schema[cle][4] === 'readonly') return;
    let v = valeurs[cle];
    if (schema[cle] && (schema[cle][4] === 'number' || schema[cle][4] === 'percent')) {
      v = Number(String(v).replace(',', '.'));
      if (isNaN(v)) throw new Error('Valeur numérique attendue : ' + schema[cle][2]);
    }
    if (schema[cle] && schema[cle][4] === 'toggle') v = v === true || v === 'Oui' ? 'Oui' : 'Non';
    const l = lignes.filter(function (x) { return x['Clé'] === cle; })[0];
    if (l) maj_(ONGLETS.PARAMS, l._row, { 'Valeur': v });
    else ajouter_(ONGLETS.PARAMS, { 'Clé': cle, 'Valeur': v, 'Description': schema[cle] ? schema[cle][2] : 'Paramètre personnalisé' });
  });
  CACHE_PARAMS_ = null;
  journal_('Paramètres', Object.keys(valeurs).join(', '));
  return rep_('Paramètres enregistrés.', moi);
}

/** Téléversement du logo ou de la signature (base64) dans le dossier Drive de l'ERP. */
function apiTeleverserImage(jeton, cle, base64, mime, nom) {
  const moi = auth_(jeton, 'superadmin');
  if (['LOGO_FILE_ID', 'SIGNATURE_FILE_ID'].indexOf(cle) < 0) throw new Error('Paramètre image inconnu.');
  if (!/^image\/(png|jpeg)$/.test(mime)) throw new Error('Format accepté : PNG ou JPG.');
  const octets = Utilities.base64Decode(base64);
  if (octets.length > 2 * 1024 * 1024) throw new Error('Image trop lourde (2 Mo maximum).');
  const racine = DriveApp.getFolderById(param_('DOSSIER_EXPORT_ID'));
  const it = racine.getFoldersByName('Ressources');
  const dossier = it.hasNext() ? it.next() : racine.createFolder('Ressources');
  const f = dossier.createFile(Utilities.newBlob(octets, mime, nom || cle));
  const ancien = param_(cle, '');
  if (ancien) { try { DriveApp.getFileById(ancien).setTrashed(true); } catch (e) { /* ancien fichier absent */ } }
  setParam_(cle, f.getId());
  return rep_('Image enregistrée.', moi);
}

function apiSupprimerImage(jeton, cle) {
  const moi = auth_(jeton, 'superadmin');
  if (['LOGO_FILE_ID', 'SIGNATURE_FILE_ID'].indexOf(cle) < 0) throw new Error('Paramètre image inconnu.');
  setParam_(cle, '');
  return rep_('Image retirée.', moi);
}

/** Ajustement d'un compteur : uniquement vers le haut (jamais de numéro réutilisé). */
function apiCompteur(jeton, annee, type, valeur) {
  const moi = auth_(jeton, 'superadmin');
  valeur = Number(valeur);
  if (['PF', 'DE'].indexOf(type) < 0 || !(valeur >= 0)) throw new Error('Valeur invalide.');
  const c = lire_(ONGLETS.COMPTEURS).filter(function (x) { return Number(x['Année']) === Number(annee) && x['Type'] === type; })[0];
  if (c && valeur < Number(c['Dernier numéro'])) throw new Error('Un compteur ne peut pas redescendre (risque de doublon).');
  if (c) maj_(ONGLETS.COMPTEURS, c._row, { 'Dernier numéro': valeur, 'Mis à jour le': new Date() });
  else ajouter_(ONGLETS.COMPTEURS, { 'Année': Number(annee), 'Type': type, 'Dernier numéro': valeur, 'Mis à jour le': new Date() });
  journal_('Compteur', type + ' ' + annee + ' → ' + valeur);
  return rep_('Compteur ' + type + ' ' + annee + ' : prochain numéro ' + String(valeur + 1).padStart(5, '0') + '.', moi);
}

/* ---------- HubSpot ---------- */
function apiCleHubSpot(jeton, cle) {
  const moi = auth_(jeton, 'superadmin');
  cle = String(cle || '').trim();
  if (!/^pat-/.test(cle)) throw new Error('Le jeton doit commencer par « pat- ».');
  PropertiesService.getScriptProperties().setProperty('HUBSPOT_TOKEN', cle);
  return rep_('Clé HubSpot enregistrée.', moi);
}
function apiSyncHubSpot(jeton) {
  const moi = auth_(jeton, 'admin');
  const n = synchroniserEntreprisesCore_();
  return rep_(n.crees + ' entité(s) créée(s), ' + n.majs + ' mise(s) à jour, ' + n.groupes + ' groupe(s).', moi);
}
function apiImportHubSpot(jeton) {
  const moi = auth_(jeton, 'admin');
  const n = importerDepuisOngletCore_();
  return rep_(n.crees + ' entité(s) créée(s), ' + n.majs + ' mise(s) à jour.', moi);
}
function apiRelancesHubSpot(jeton) {
  const moi = auth_(jeton, 'admin');
  return rep_(creerRelancesHubSpotCore_() + ' tâche(s) de relance créée(s) dans HubSpot.', moi);
}
