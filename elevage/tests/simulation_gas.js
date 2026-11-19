/**
 * Simulation de Google Apps Script (feuilles, cache, propriétés, e-mails, verrous)
 * pour tester TOUT le serveur Code.gs hors Google : installation, connexion par code,
 * sessions, rôles, saisie, comptes, paramètres, journal des actions.
 *
 * Usage : TZ=Indian/Antananarivo node simulation_gas.js donnees.json
 */
process.env.TZ = 'Indian/Antananarivo';
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const crypto = require('crypto');

/* ---------------- Simulation des services Google ---------------- */
function creerFeuille(nom) {
  const data = [];
  const sh = {
    nom, data,
    getName: () => nom,
    getLastRow: () => { for (let i = data.length - 1; i >= 0; i--) if (data[i].some(v => v !== '' && v !== null && v !== undefined)) return i + 1; return 0; },
    getLastColumn: () => Math.max(0, ...data.map(r => r.length)),
    getRange: (r, c, nr, nc) => plage(data, r, c, nr || 1, nc || 1),
    getDataRange: () => plage(data, 1, 1, Math.max(1, sh.getLastRow()), Math.max(1, sh.getLastColumn())),
    appendRow: (row) => { data.splice(sh.getLastRow(), 0, row.slice()); return sh; },
    deleteRow: (r) => { data.splice(r - 1, 1); },
    setFrozenRows: () => sh,
    getProtections: () => sh._prot ? [sh._prot] : [],
    protect: () => { sh._prot = { setDescription() { return this; }, setWarningOnly() { return this; } }; return sh._prot; }
  };
  return sh;
}
function plage(data, r, c, nr, nc) {
  const lire = () => { const out = []; for (let i = 0; i < nr; i++) { const row = []; for (let j = 0; j < nc; j++) { const v = (data[r - 1 + i] || [])[c - 1 + j]; row.push(v === undefined || v === null ? '' : v); } out.push(row); } return out; };
  const ecrire = (vals) => { for (let i = 0; i < nr; i++) { while (data.length < r + i) data.push([]); for (let j = 0; j < nc; j++) data[r - 1 + i][c - 1 + j] = vals[i][j]; } };
  const p = {
    getValues: lire, getValue: () => lire()[0][0],
    setValues: (v) => { if (v.length !== nr || v[0].length !== nc) throw new Error('setValues : dimensions ' + v.length + 'x' + v[0].length + ' ≠ ' + nr + 'x' + nc); ecrire(v); return p; },
    setValue: (v) => { ecrire([[v]]); return p; },
    clearContent: () => { ecrire(Array.from({ length: nr }, () => Array(nc).fill(''))); return p; },
    setFontWeight: () => p, setBackground: () => p, setFontColor: () => p
  };
  return p;
}
const feuilles = {};
const ss = {
  getSheetByName: (n) => feuilles[n] || null,
  insertSheet: (n) => (feuilles[n] = creerFeuille(n)),
  toast: () => {}
};
const mails = [];
let echecMail = null;
const cache = {}, props = {};
const contexte = {
  console, module: {},
  SpreadsheetApp: { getActive: () => ss, getActiveSpreadsheet: () => ss, ProtectionType: { SHEET: 'SHEET' },
    getUi: () => ({ createMenu: () => ({ addItem() { return this; }, addSeparator() { return this; }, addToUi() {} }), alert: () => {}, ButtonSet: { OK: 1 }, showModalDialog: () => {} }) },
  Session: { getScriptTimeZone: () => 'Indian/Antananarivo', getEffectiveUser: () => ({ getEmail: () => 'Proprietaire@Exemple.mg' }), getActiveUser: () => ({ getEmail: () => '' }) },
  Utilities: {
    getUuid: () => crypto.randomUUID(),
    DigestAlgorithm: { SHA_256: 'sha256' },
    computeDigest: (alg, s) => [...crypto.createHash('sha256').update(String(s), 'utf8').digest()].map(b => (b > 127 ? b - 256 : b)),
    formatDate: (d, tz, f) => { const z = (x) => String(x).padStart(2, '0'); return f.replace('yyyy', d.getFullYear()).replace('MM', z(d.getMonth() + 1)).replace('dd', z(d.getDate())).replace('HH', z(d.getHours())).replace('mm', z(d.getMinutes())).replace('ss', z(d.getSeconds())); }
  },
  CacheService: { getScriptCache: () => ({ get: (k) => (k in cache ? cache[k] : null), put: (k, v) => { if (k.length > 250) throw new Error('clé de cache trop longue'); cache[k] = String(v); }, remove: (k) => { delete cache[k]; } }) },
  PropertiesService: { getScriptProperties: () => ({ getProperty: (k) => (k in props ? props[k] : null), setProperty: (k, v) => { props[k] = String(v); }, deleteProperty: (k) => { delete props[k]; }, getProperties: () => Object.assign({}, props) }) },
  MailApp: { sendEmail: (o) => { if (echecMail) throw new Error(echecMail); if (!o.to || !o.subject || !o.htmlBody) throw new Error('E-mail incomplet'); mails.push(o); }, getRemainingDailyQuota: () => 100 },
  LockService: { getScriptLock: () => ({ waitLock: () => {}, releaseLock: () => {}, tryLock: () => true }) },
  ScriptApp: { getService: () => ({ getUrl: () => 'https://script.google.com/macros/s/TEST/exec' }) },
  HtmlService: { XFrameOptionsMode: { DEFAULT: 0, ALLOWALL: 1 }, createTemplateFromFile: () => ({ evaluate: () => ({ setTitle() { return this; }, addMetaTag() { return this; }, setXFrameOptionsMode() { return this; } }) }), createHtmlOutput: () => ({ setWidth() { return this; }, setHeight() { return this; } }) }
};
vm.createContext(contexte);
vm.runInContext(fs.readFileSync(path.join(__dirname, '../apps-script/Code.gs'), 'utf8'), contexte);
const G = contexte;
const DateGAS = vm.runInContext('Date', contexte); // même « royaume » que le script, comme dans Apps Script

/* ---------------- Chargement de la base ---------------- */
const donnees = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'));
const versDate = (v) => (typeof v === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(v) ? new DateGAS(+v.slice(0, 4), +v.slice(5, 7) - 1, +v.slice(8, 10)) : (v === null ? '' : v));
for (const nom of ['Parametres', 'Races', 'PrixProvende', 'Lots', 'Journal', 'Ventes', 'Charges']) {
  const sh = ss.insertSheet(nom);
  sh.appendRow(donnees._entetes[nom]);
  donnees[nom].forEach((r) => sh.appendRow(r.map(versDate)));
}

/* ---------------- Tests ---------------- */
let ok = 0, ko = 0;
function verif(nom, cond, info) { if (cond) { ok++; console.log('OK    ' + nom); } else { ko++; console.log('ÉCHEC ' + nom + (info !== undefined ? '  → ' + JSON.stringify(info) : '')); } }
function erreur(fn) { try { fn(); return null; } catch (e) { return e.message; } }
function codeDuMail(m) { return (m.subject.match(/^(\d{6})/) || [])[1]; }
function connecter(email) {
  Object.keys(cache).filter(k => k.indexOf('otp-rate:') === 0).forEach(k => delete cache[k]);
  const n = mails.length;
  G.apiDemanderCode(email);
  const m = mails[n];
  if (!m) throw new Error('aucun e-mail envoyé à ' + email);
  return G.apiVerifierCode(email, codeDuMail(m));
}

// 1. Installation
G.doGet();
G.onOpen();
G.initialiserBase();
const users = feuilles.Utilisateurs.data;
verif('initialiserBase crée Utilisateurs et JournalActions', !!feuilles.Utilisateurs && !!feuilles.JournalActions);
verif('le propriétaire devient Superadmin actif', users[1] && users[1][0] === 'proprietaire@exemple.mg' && users[1][2] === 'Superadmin' && users[1][3] === 'Oui', users[1]);
verif('paramètres de sécurité ajoutés', feuilles.Parametres.data.some(r => r[0] === 'SESSION_DUREE_JOURS'));
G.initialiserBase();
verif('initialiserBase relancé : pas de doublon de superadmin', users.filter(r => r[2] === 'Superadmin').length === 1);

// 2. Demande de code
const proprio = 'proprietaire@exemple.mg';
verif('apiInfo renvoie la version', G.apiInfo().version === '2026-11-19.3');
let rep = G.apiDemanderCode('  Proprietaire@Exemple.mg ');
verif('code envoyé au superadmin (adresse normalisée)', mails.length === 1 && mails[0].to === proprio, mails.map(m => m.to));
const code1 = codeDuMail(mails[0]);
verif('le code (6 chiffres) est dans l\'objet et le corps du mail', /^\d{6}$/.test(code1) && mails[0].htmlBody.indexOf(code1) > 0);
verif('message de confirmation avec l\'adresse', /Code envoyé à proprietaire@exemple.mg/.test(rep.message), rep.message);
verif('redemande immédiate bloquée (45 s)', /Patientez/.test(erreur(() => G.apiDemanderCode(proprio)) || ''));
const nMails = mails.length;
const msgInconnu = erreur(() => G.apiDemanderCode('inconnu@gmail.com')) || '';
verif('adresse inconnue : message explicite, aucun e-mail', /pas enregistrée/.test(msgInconnu) && mails.length === nMails, msgInconnu);
verif('adresse inconnue corrigée : nouvel essai possible tout de suite', /pas enregistrée/.test(erreur(() => G.apiDemanderCode('inconnu@gmail.com')) || ''));
verif('adresse inconnue : tracée dans le journal', feuilles.JournalActions.data.some(r => r[2] === 'Connexion refusée'));
verif('adresse invalide refusée', /invalide/.test(erreur(() => G.apiDemanderCode('pas-un-email')) || ''));

// 3. Vérification du code
const faux = code1 === '000000' ? '111111' : '000000';
verif('mauvais code : essais restants indiqués', /4 essai/.test(erreur(() => G.apiVerifierCode(proprio, faux)) || ''));
const sess = G.apiVerifierCode(proprio, ' ' + code1.slice(0, 3) + ' ' + code1.slice(3) + ' ');
verif('bon code (avec espaces) : jeton de session', sess && /^[0-9a-f]{64}$/.test(sess.jeton) && sess.moi.superadmin === true, sess && sess.moi);
verif('code à usage unique', /expiré/.test(erreur(() => G.apiVerifierCode(proprio, code1)) || ''));
verif('dernière connexion enregistrée', users[1][5] instanceof DateGAS);
verif('le jeton est stocké haché (pas en clair)', !Object.keys(props).some(k => k.indexOf(sess.jeton) >= 0));
const J = sess.jeton;

// 4. Tableau de bord
const tb = G.apiTableauDeBord(J, { selection: 'Tous', periode: 'debut' });
verif('tableau de bord calculé (536 poules au 16/11)', tb.kpi && tb.kpi.poules === 536 && tb.filtres.ref === '2026-11-16', tb.kpi && [tb.kpi.poules, tb.filtres.ref]);
verif('le tableau de bord renvoie le profil', tb.moi && tb.moi.role === 'Superadmin');
verif('résultat transmissible à la page (JSON pur)', JSON.stringify(tb).length > 1000 && !JSON.stringify(tb).includes('undefined'));
verif('jeton invalide refusé', /SESSION_EXPIREE/.test(erreur(() => G.apiTableauDeBord('faux', {})) || ''));
verif('sans jeton refusé', /SESSION_EXPIREE/.test(erreur(() => G.apiMoi('')) || ''));

// 5. Comptes
rep = G.apiEnregistrerUtilisateur(J, { email: 'Admin@Exemple.mg', nom: 'Aina', role: 'Admin', actif: true, inviter: true });
verif('création Admin + invitation envoyée', rep.ok && mails[mails.length - 1].to === 'admin@exemple.mg' && /exec/.test(mails[mails.length - 1].htmlBody));
G.apiEnregistrerUtilisateur(J, { email: 'lecteur@exemple.mg', nom: 'Patrick', role: 'Utilisateur', actif: true, inviter: false });
verif('doublon d\'adresse refusé', /existe/.test(erreur(() => G.apiEnregistrerUtilisateur(J, { email: 'lecteur@exemple.mg', role: 'Admin', actif: true })) || ''));
verif('rôle inconnu refusé', /Rôle/.test(erreur(() => G.apiEnregistrerUtilisateur(J, { email: 'x@exemple.mg', role: 'Chef', actif: true })) || ''));
verif('dernier superadmin non rétrogradable', /au moins un superadmin/.test(erreur(() => G.apiEnregistrerUtilisateur(J, { ancienEmail: proprio, email: proprio, nom: 'P', role: 'Admin', actif: true })) || ''));
verif('suppression de son propre compte refusée', /propre compte/.test(erreur(() => G.apiSupprimerUtilisateur(J, proprio)) || ''));
verif('liste des comptes (3)', G.apiUtilisateurs(J).length === 3);

// 6. Utilisateur (lecture seule)
const JL = connecter('lecteur@exemple.mg').jeton;
verif('Utilisateur : lecture autorisée', G.apiTableauDeBord(JL, {}).kpi.poules === 536);
verif('Utilisateur : saisie refusée', /administrateurs/.test(erreur(() => G.apiEnregistrerVente(JL, { date: '2026-11-17', client: 'X', achetes: 30 })) || ''));
verif('Utilisateur : journal du jour refusé', /administrateurs/.test(erreur(() => G.apiJournalDuJour(JL, '2026-11-16')) || ''));
verif('Utilisateur : comptes refusés', /superadmin/.test(erreur(() => G.apiUtilisateurs(JL)) || ''));

// 7. Admin (saisie)
const JA = connecter('admin@exemple.mg').jeton;
const jdj = G.apiJournalDuJour(JA, '2026-11-16');
verif('Admin : journal du jour chargé (7 lots, valeurs existantes)', jdj.lots.length === 7 && jdj.lots.some(l => Number(l.coll) > 0));
const nJ = feuilles.Journal.getLastRow();
rep = G.apiEnregistrerJournal(JA, { date: '2026-11-17', lignes: jdj.lots.map(l => ({ lot: l.lot, coll: 20, casse: '', couv: '', pDec: l.lot === 'Kombo' ? 1 : '', obs: '' })) });
verif('Admin : journal du 17/11 enregistré (7 ajouts)', rep.ok && feuilles.Journal.getLastRow() === nJ + 7, rep.message);
rep = G.apiEnregistrerJournal(JA, { date: '2026-11-17', lignes: [{ lot: 'Kombo', coll: 25 }] });
verif('Admin : correction = mise à jour, pas de doublon', /1 mise/.test(rep.message) && feuilles.Journal.getLastRow() === nJ + 7, rep.message);
verif('Admin : lot inconnu refusé', /Lot inconnu/.test(erreur(() => G.apiEnregistrerJournal(JA, { date: '2026-11-17', lignes: [{ lot: 'Fantôme', coll: 1 }] })) || ''));
verif('Admin : nombre négatif refusé', /invalide/.test(erreur(() => G.apiEnregistrerJournal(JA, { date: '2026-11-17', lignes: [{ lot: 'Kombo', coll: -3 }] })) || ''));
verif('Admin : date invalide refusée', /Date invalide/.test(erreur(() => G.apiEnregistrerVente(JA, { date: '17/11/2026', client: 'X', achetes: 3 })) || ''));
verif('Admin : vente enregistrée', G.apiEnregistrerVente(JA, { date: '2026-11-17', client: 'Mme Test', achetes: 60, prix: '', cadeaux: '' }).ok);
verif('Admin : charge enregistrée', G.apiEnregistrerCharge(JA, { date: '2026-11-17', type: 'Fixe', categorie: 'Salaires', libelle: 'Gardien', lot: 'Tous', montant: 150000 }).ok);
const tb2 = G.apiTableauDeBord(JA, { periode: 'jour' });
verif('les saisies sont prises en compte (réf. 17/11, 145 œufs, 60 vendus)', tb2.filtres.ref === '2026-11-17' && tb2.kpi.collectes === 145 && tb2.kpi.vendus === 60, [tb2.filtres.ref, tb2.kpi.collectes, tb2.kpi.vendus]);
verif('Admin : paramètres refusés', /superadmin/.test(erreur(() => G.apiParametres(JA)) || ''));

// 8. Désactivation immédiate
G.apiEnregistrerUtilisateur(J, { ancienEmail: 'admin@exemple.mg', email: 'admin@exemple.mg', nom: 'Aina', role: 'Admin', actif: false });
verif('compte désactivé : session coupée immédiatement', /SESSION_EXPIREE/.test(erreur(() => G.apiTableauDeBord(JA, {})) || ''));
const avant = mails.length;
Object.keys(cache).forEach(k => delete cache[k]);
const msgInactif = erreur(() => G.apiDemanderCode('admin@exemple.mg')) || '';
verif('compte désactivé : message explicite, pas de code', /désactivé/.test(msgInactif) && mails.length === avant, msgInactif);

// 9. Paramètres
const prm = G.apiParametres(J);
verif('paramètres lus (17 clés, 3 races)', prm.parametres.length === 17 && prm.races.length === 3, [prm.parametres.length, prm.races.length]);
rep = G.apiEnregistrerParametres(J, { parametres: [{ cle: 'PRIX_OEUF', valeur: '750' }, { cle: 'OFFRE_DEBUT', valeur: '2026-10-12' }], races: prm.races, nouveauPrix: { date: '2026-11-18', prix: 3000, commentaire: 'test' } });
verif('paramètres enregistrés (prix œuf, prix provende)', rep.ok && feuilles.Parametres.data.find(r => r[0] === 'PRIX_OEUF')[2] === 750 && feuilles.PrixProvende.getLastRow() === 3, rep.message);
verif('date non modifiée = pas de faux changement', !feuilles.JournalActions.data.some(r => /OFFRE_DEBUT/.test(r[3])));
verif('tableau de bord toujours calculable après paramètres', G.apiTableauDeBord(J, {}).kpi.poules > 0);

// 10. Journal des actions, déconnexion
const ja = G.apiJournalActions(J, 500);
verif('journal des actions lisible (connexions, saisies, comptes)', ['Connexion', 'Saisie journal', 'Saisie vente', 'Utilisateur ajouté', 'Paramètres modifiés'].every(a => ja.some(x => x.action === a)), [...new Set(ja.map(x => x.action))]);
G.apiDeconnexion(J);
verif('déconnexion : jeton invalide', /SESSION_EXPIREE/.test(erreur(() => G.apiMoi(J)) || ''));

// 11. Blocage anti-force brute
Object.keys(cache).forEach(k => delete cache[k]);
G.apiDemanderCode('lecteur@exemple.mg');
for (let i = 0; i < 5; i++) erreur(() => G.apiVerifierCode('lecteur@exemple.mg', '000001'));
verif('5 mauvais codes : code annulé', /expiré/.test(erreur(() => G.apiVerifierCode('lecteur@exemple.mg', '000001')) || ''));

// 12. Échec d'envoi de l'e-mail (autorisation, quota)
Object.keys(cache).forEach(k => delete cache[k]);
echecMail = 'You do not have permission to call MailApp.sendEmail';
const msgEchec = erreur(() => G.apiDemanderCode('lecteur@exemple.mg')) || '';
echecMail = null;
verif('échec d\'envoi : message d\'erreur explicite (pas un faux « code envoyé »)', /envoi/i.test(msgEchec), msgEchec);
verif('échec d\'envoi : on peut réessayer tout de suite', /Code envoyé/.test((G.apiDemanderCode('lecteur@exemple.mg') || {}).message || ''));
verif('échec d\'envoi : cause notée dans le journal', feuilles.JournalActions.data.some(r => r[2] === 'Échec envoi code'));
verif('fonction de test d\'envoi disponible', typeof G.testerEnvoiCode === 'function');
if (typeof G.testerEnvoiCode === 'function') { const n0 = mails.length; G.testerEnvoiCode(); verif('testerEnvoiCode envoie un e-mail au propriétaire', mails.length === n0 + 1 && mails[n0].to === proprio); }

// 13. Base sans onglet Utilisateurs (initialiserBase jamais lancé) : le propriétaire peut quand même se connecter
delete feuilles.Utilisateurs;
Object.keys(cache).forEach(k => delete cache[k]);
const n13 = mails.length;
rep = G.apiDemanderCode('proprietaire@exemple.mg');
verif('sans onglet Utilisateurs : propriétaire créé Superadmin et code envoyé', mails.length === n13 + 1 && feuilles.Utilisateurs && feuilles.Utilisateurs.data[1][2] === 'Superadmin', rep);
// 14. Rôle et Actif saisis à la main dans le Sheet (minuscules, case cochée)
feuilles.Utilisateurs.appendRow(['  Main@Exemple.mg ', 'Saisi main', 'admin', true, '', '']);
Object.keys(cache).forEach(k => delete cache[k]);
const s14 = connecter('main@exemple.mg');
verif('compte saisi à la main (rôle « admin », case cochée) : connexion OK', s14.moi.role === 'Admin' && s14.moi.peutSaisir);

console.log('\n' + ok + ' réussis, ' + ko + ' échec(s)');
process.exit(ko ? 1 : 0);
