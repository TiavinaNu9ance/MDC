/**
 * MATURA AGRI — Tableau de bord du suivi d'élevage (poules pondeuses).
 * Fichier unique à coller dans Apps Script (Code.gs), lié à la base Google Sheets.
 *
 * Organisation :
 *   1. Configuration (onglets, en-têtes)
 *   2. Web app, menu, installation
 *   3. API appelée par la page (lecture du tableau de bord, saisie)
 *   4. Lecture de la base
 *   5. Moteur de calcul (fonctions pures, testées hors Google avec Node)
 */

/* ===================== 1. CONFIGURATION ===================== */

const ONGLETS = {
  PARAMETRES: 'Parametres',
  RACES: 'Races',
  PRIX: 'PrixProvende',
  LOTS: 'Lots',
  JOURNAL: 'Journal',
  VENTES: 'Ventes',
  CHARGES: 'Charges'
};

const ENTETES = {
  Parametres: ['Clé', 'Libellé', 'Valeur', 'Unité / commentaire'],
  Races: ['Race', 'Objectif taux de ponte', 'Ration poule en ponte (kg/j)', 'Ration poulette (kg/j)', 'Stock d\'œufs à part (Oui/Non)'],
  PrixProvende: ['Date d\'effet', 'Prix (Ar/kg)', 'Commentaire'],
  Lots: ['Lot', 'Race', 'Date de mise en place', 'Âge à l\'entrée (sem.)', 'Onglet d\'origine', 'Remarque'],
  Journal: ['Date', 'Lot', 'Poules entrées', 'Poules décès', 'Poules vendues / réformées', 'Poules manquantes',
    'Coqs entrés', 'Coqs décès', 'Coqs vendus / réformés', 'Œufs collectés', 'Œufs cassés', 'Mis en couveuse', 'Observation'],
  Ventes: ['Date', 'Client', 'Œufs achetés', 'Prix unitaire (Ar)', 'Cadeaux hors offre', 'Observation'],
  Charges: ['Date', 'Type', 'Catégorie', 'Libellé', 'Lot', 'Montant (Ar)']
};

/** Champs du journal (clé interne -> index de colonne dans ENTETES.Journal). */
const CHAMPS_JOURNAL = ['date', 'lot', 'pEnt', 'pDec', 'pVen', 'pManq', 'cEnt', 'cDec', 'cVen', 'coll', 'casse', 'couv', 'obs'];

const PARAMETRES_DEFAUT = [
  ['PRIX_OEUF', 'Prix de vente par défaut de l\'œuf', 700, 'Ar / œuf'],
  ['SEUIL_PONTE_SEM', 'Seuil de début de ponte', 20, 'semaines'],
  ['PREPONTE_SEM', 'Début de la phase pré-ponte', 18, 'semaines'],
  ['OFFRE_PALIER', 'Palier de l\'offre (œufs achetés)', 30, 'œufs'],
  ['OFFRE_OEUFS', 'Œufs offerts par palier', 1, 'œuf(s)'],
  ['OFFRE_DEBUT', 'Date de début de l\'offre', '', 'date'],
  ['DEBUT_SUIVI', 'Premier jour du suivi', '', 'date'],
  ['DATE_REF', 'Date de référence forcée', '', 'vide = dernier jour où des œufs ont été collectés'],
  ['CIBLE_EFFECTIF', 'Objectif effectif total de poules', 800, 'poules'],
  ['CIBLE_PONDEUSES', 'Objectif poules en ponte', 600, 'poules'],
  ['MORTALITE_MAX', 'Plafond de mortalité cumulée', 0.05, 'ratio'],
  ['CASSE_MAX', 'Plafond du taux de casse', 0.02, 'ratio'],
  ['CIBLE_VENTES_MOIS', 'Objectif œufs vendus par mois', 8000, 'œufs / mois'],
  ['ECOULEMENT_MIN', 'Objectif taux d\'écoulement', 0.9, 'ratio'],
  ['NOM_ELEVAGE', 'Nom affiché', 'MATURA AGRI', ''],
  ['UTILISATEURS', 'Adresses autorisées à saisir', '', 'e-mails séparés par des virgules ; vide = pas de contrôle']
];

/* ===================== 2. WEB APP, MENU, INSTALLATION ===================== */

function doGet() {
  return HtmlService.createTemplateFromFile('Index').evaluate()
    .setTitle('Tableau de bord – Élevage')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

function onOpen() {
  SpreadsheetApp.getUi().createMenu('Élevage')
    .addItem('Ouvrir le tableau de bord', 'ouvrirTableauDeBord')
    .addItem('Vérifier les données', 'verifierDonnees')
    .addSeparator()
    .addItem('Initialiser / réparer la structure', 'initialiserBase')
    .addToUi();
}

function ouvrirTableauDeBord() {
  const url = ScriptApp.getService().getUrl();
  const html = url
    ? '<p style="font-family:sans-serif">Tableau de bord : <a href="' + url + '" target="_blank">ouvrir dans un nouvel onglet</a></p>'
    : '<p style="font-family:sans-serif">La web app n\'est pas encore déployée : Apps Script &gt; Déployer &gt; Nouveau déploiement &gt; Application Web.</p>';
  SpreadsheetApp.getUi().showModalDialog(HtmlService.createHtmlOutput(html).setWidth(420).setHeight(110), 'Tableau de bord');
}

/** Crée les onglets et en-têtes manquants (ne supprime aucune donnée). */
function initialiserBase() {
  const ss = SpreadsheetApp.getActive();
  Object.keys(ENTETES).forEach(function (nom) {
    let sh = ss.getSheetByName(nom);
    if (!sh) sh = ss.insertSheet(nom);
    const ent = ENTETES[nom];
    const actuel = sh.getRange(1, 1, 1, ent.length).getValues()[0];
    if (actuel.join('') === '') {
      sh.getRange(1, 1, 1, ent.length).setValues([ent]).setFontWeight('bold').setBackground('#1f4e3d').setFontColor('#ffffff');
      sh.setFrozenRows(1);
    }
  });
  const shP = ss.getSheetByName(ONGLETS.PARAMETRES);
  const cles = shP.getLastRow() > 1 ? shP.getRange(2, 1, shP.getLastRow() - 1, 1).getValues().map(function (r) { return r[0]; }) : [];
  PARAMETRES_DEFAUT.forEach(function (p) {
    if (cles.indexOf(p[0]) < 0) shP.appendRow(p);
  });
  SpreadsheetApp.getActive().toast('Structure vérifiée.', 'Élevage', 4);
}

/** Contrôle de cohérence des saisies (affiché dans une boîte de dialogue). */
function verifierDonnees() {
  const res = controlerDonnees(lireBase_());
  const msg = res.length ? res.slice(0, 40).join('\n') + (res.length > 40 ? '\n… (' + res.length + ' anomalies)' : '') : 'Aucune anomalie détectée.';
  SpreadsheetApp.getUi().alert('Vérification des données', msg, SpreadsheetApp.getUi().ButtonSet.OK);
}

/* ===================== 3. API (appelée par Index.html) ===================== */

function apiTableauDeBord(options) {
  return calculerTableau(lireBase_(), options || {});
}

/** Valeurs déjà saisies pour une date (une entrée par lot présent à cette date). */
function apiJournalDuJour(date) {
  const m = construireModele(lireBase_());
  const j = versJour(date);
  return {
    date: date,
    lots: m.lots.filter(function (l) { return l.debut <= j; }).map(function (l) {
      const e = (m.journal[l.nom] || {})[j] || {};
      const r = { lot: l.nom, race: l.race };
      CHAMPS_JOURNAL.slice(2).forEach(function (c) { r[c] = e[c] === undefined ? '' : e[c]; });
      return r;
    }),
    prixDefaut: m.p.PRIX_OEUF
  };
}

/** Enregistre (ou met à jour) les lignes du journal d'une date : payload = {date, lignes:[{lot, coll, ...}]} */
function apiEnregistrerJournal(payload) {
  verifierDroitSaisie_();
  const lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    const sh = feuille_(ONGLETS.JOURNAL);
    const tz = Session.getScriptTimeZone();
    const n = sh.getLastRow() - 1;
    const existants = n > 0 ? sh.getRange(2, 1, n, 2).getValues() : [];
    const index = {};
    existants.forEach(function (r, i) { index[cleJour_(r[0], tz) + '|' + r[1]] = i + 2; });
    const date = dateDepuisIso_(payload.date);
    let ajouts = 0, maj = 0;
    payload.lignes.forEach(function (l) {
      const valeurs = CHAMPS_JOURNAL.slice(2).map(function (c) {
        const v = l[c];
        if (c === 'obs') return v || '';
        return v === '' || v === null || v === undefined ? '' : Number(v);
      });
      const vide = valeurs.every(function (v) { return v === '' || v === 0; });
      const ligne = index[payload.date + '|' + l.lot];
      if (ligne) {
        sh.getRange(ligne, 3, 1, valeurs.length).setValues([valeurs]);
        maj++;
      } else if (!vide) {
        sh.appendRow([date, l.lot].concat(valeurs));
        ajouts++;
      }
    });
    return { ok: true, message: ajouts + ' ligne(s) ajoutée(s), ' + maj + ' mise(s) à jour.' };
  } finally {
    lock.releaseLock();
  }
}

function apiEnregistrerVente(v) {
  verifierDroitSaisie_();
  if (!v.date || !v.client) throw new Error('Date et client obligatoires.');
  if (!(Number(v.achetes) > 0) && !(Number(v.cadeaux) > 0)) throw new Error('Saisir un nombre d\'œufs achetés ou offerts.');
  feuille_(ONGLETS.VENTES).appendRow([dateDepuisIso_(v.date), v.client, Number(v.achetes) || '',
    v.prix === '' || v.prix === undefined ? '' : Number(v.prix), Number(v.cadeaux) || '', v.obs || '']);
  return { ok: true, message: 'Vente enregistrée.' };
}

function apiEnregistrerCharge(c) {
  verifierDroitSaisie_();
  if (!c.date || !(Number(c.montant) > 0)) throw new Error('Date et montant obligatoires.');
  feuille_(ONGLETS.CHARGES).appendRow([dateDepuisIso_(c.date), c.type || 'Variable', c.categorie || 'Autre',
    c.libelle || '', c.lot || 'Tous', Number(c.montant)]);
  return { ok: true, message: 'Charge enregistrée.' };
}

function verifierDroitSaisie_() {
  const sh = feuille_(ONGLETS.PARAMETRES);
  const lignes = sh.getDataRange().getValues();
  const l = lignes.filter(function (r) { return r[0] === 'UTILISATEURS'; })[0];
  const liste = l ? String(l[2] || '').toLowerCase().split(/[,;\s]+/).filter(String) : [];
  if (!liste.length) return;
  const email = (Session.getActiveUser().getEmail() || '').toLowerCase();
  if (!email || liste.indexOf(email) < 0) {
    throw new Error('Saisie non autorisée pour ce compte' + (email ? ' (' + email + ')' : '') + '.');
  }
}

/* ===================== 4. LECTURE DE LA BASE ===================== */

function feuille_(nom) {
  const sh = SpreadsheetApp.getActive().getSheetByName(nom);
  if (!sh) throw new Error('Onglet « ' + nom + ' » introuvable. Menu Élevage > Initialiser la structure.');
  return sh;
}

function cleJour_(v, tz) {
  if (v instanceof Date) return Utilities.formatDate(v, tz, 'yyyy-MM-dd');
  return v === '' || v === null ? '' : String(v);
}

function dateDepuisIso_(iso) {
  const p = String(iso).split('-').map(Number);
  return new Date(p[0], p[1] - 1, p[2]);
}

/** Lit chaque onglet en tableaux de lignes (sans en-tête), dates converties en 'aaaa-mm-jj'. */
function lireBase_() {
  const ss = SpreadsheetApp.getActive();
  const tz = Session.getScriptTimeZone();
  const brut = {};
  Object.keys(ENTETES).forEach(function (nom) {
    const sh = ss.getSheetByName(nom);
    if (!sh || sh.getLastRow() < 2) { brut[nom] = []; return; }
    const val = sh.getDataRange().getValues();
    const ent = val[0].map(function (h) { return String(h).trim(); });
    const pos = ENTETES[nom].map(function (h, i) { const k = ent.indexOf(h); return k >= 0 ? k : i; });
    brut[nom] = val.slice(1).map(function (r) {
      return pos.map(function (k) { return r[k] instanceof Date ? cleJour_(r[k], tz) : r[k]; });
    });
  });
  return brut;
}

/* ===================== 5. MOTEUR DE CALCUL (pur) ===================== */

const JOUR_MS = 86400000;

/** 'aaaa-mm-jj' (ou Date) -> numéro de jour entier. */
function versJour(v) {
  if (v === null || v === undefined || v === '') return null;
  if (typeof v === 'number') return v;
  if (v instanceof Date) return Math.floor(Date.UTC(v.getFullYear(), v.getMonth(), v.getDate()) / JOUR_MS);
  const m = String(v).match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (m) return Math.floor(Date.UTC(+m[1], +m[2] - 1, +m[3]) / JOUR_MS);
  const f = String(v).match(/^(\d{2})\/(\d{2})\/(\d{4})/);
  if (f) return Math.floor(Date.UTC(+f[3], +f[2] - 1, +f[1]) / JOUR_MS);
  return null;
}

function isoJour(j) {
  return new Date(j * JOUR_MS).toISOString().slice(0, 10);
}

function n_(v) {
  const x = Number(v);
  return v === '' || v === null || v === undefined || isNaN(x) ? 0 : x;
}

function div_(a, b) { return b ? a / b : 0; }

function debutMois_(j) {
  const d = new Date(j * JOUR_MS);
  return Math.floor(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), 1) / JOUR_MS);
}

function finMois_(j) {
  const d = new Date(j * JOUR_MS);
  return Math.floor(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 0) / JOUR_MS);
}

/** Transforme les lignes brutes en modèle indexé. */
function construireModele(brut) {
  const p = {};
  (brut.Parametres || []).forEach(function (r) { if (r[0]) p[String(r[0]).trim()] = r[2]; });
  PARAMETRES_DEFAUT.forEach(function (d) { if (p[d[0]] === undefined) p[d[0]] = d[2]; });
  ['PRIX_OEUF', 'SEUIL_PONTE_SEM', 'PREPONTE_SEM', 'OFFRE_PALIER', 'OFFRE_OEUFS', 'CIBLE_EFFECTIF', 'CIBLE_PONDEUSES',
    'MORTALITE_MAX', 'CASSE_MAX', 'CIBLE_VENTES_MOIS', 'ECOULEMENT_MIN'].forEach(function (k) { p[k] = n_(p[k]); });

  const races = {};
  (brut.Races || []).forEach(function (r) {
    if (!r[0]) return;
    races[r[0]] = { nom: r[0], objectif: n_(r[1]), rationPonte: n_(r[2]), rationPoulette: n_(r[3]), aPart: /^o/i.test(String(r[4] || '')) };
  });

  const prix = (brut.PrixProvende || []).filter(function (r) { return versJour(r[0]) !== null; })
    .map(function (r) { return { j: versJour(r[0]), prix: n_(r[1]) }; })
    .sort(function (a, b) { return a.j - b.j; });

  const journal = {};
  let premierJour = null, derniereCollecte = null, derniereSaisie = null;
  (brut.Journal || []).forEach(function (r) {
    const j = versJour(r[0]);
    if (j === null || !r[1]) return;
    const lot = String(r[1]).trim();
    journal[lot] = journal[lot] || {};
    const e = journal[lot][j] = journal[lot][j] || {};
    CHAMPS_JOURNAL.slice(2, 12).forEach(function (c, i) { e[c] = n_(e[c]) + n_(r[i + 2]); });
    if (r[12]) e.obs = (e.obs ? e.obs + ' ; ' : '') + r[12];
    if (premierJour === null || j < premierJour) premierJour = j;
    if (n_(r[9]) > 0 && (derniereCollecte === null || j > derniereCollecte)) derniereCollecte = j;
    if (derniereSaisie === null || j > derniereSaisie) derniereSaisie = j;
  });

  const lots = (brut.Lots || []).filter(function (r) { return r[0]; }).map(function (r) {
    const nom = String(r[0]).trim();
    const dmp = versJour(r[2]);
    const jours = Object.keys(journal[nom] || {}).map(Number);
    const premier = jours.length ? Math.min.apply(null, jours) : dmp;
    return {
      nom: nom, race: r[1], dmp: dmp, ageEntree: n_(r[3]), naissance: dmp - n_(r[3]) * 7,
      debut: Math.min(dmp === null ? premier : dmp, premier === null ? dmp : premier), remarque: r[5] || ''
    };
  }).filter(function (l) { return l.debut !== null; });

  const ventes = (brut.Ventes || []).filter(function (r) { return versJour(r[0]) !== null; }).map(function (r) {
    const j = versJour(r[0]);
    const achetes = n_(r[2]);
    const pu = r[3] === '' || r[3] === null || r[3] === undefined ? p.PRIX_OEUF : n_(r[3]);
    const debutOffre = versJour(p.OFFRE_DEBUT);
    const offerts = achetes > 0 && debutOffre !== null && j >= debutOffre && p.OFFRE_PALIER > 0
      ? Math.floor(achetes / p.OFFRE_PALIER) * p.OFFRE_OEUFS : 0;
    return { j: j, client: String(r[1] || '').trim(), achetes: achetes, prix: pu, montant: achetes * pu, offerts: offerts, cadeaux: n_(r[4]) };
  });

  const charges = (brut.Charges || []).filter(function (r) { return versJour(r[0]) !== null && n_(r[5]); }).map(function (r) {
    return { j: versJour(r[0]), type: /^f/i.test(String(r[1] || '')) ? 'Fixe' : 'Variable', categorie: r[2] || 'Autre', libelle: r[3] || '', lot: r[4] || 'Tous', montant: n_(r[5]) };
  });

  return { p: p, races: races, prix: prix, journal: journal, lots: lots, ventes: ventes, charges: charges,
    premierJour: premierJour, derniereCollecte: derniereCollecte, derniereSaisie: derniereSaisie };
}

function prixProvende_(m, j) {
  let prix = 0;
  for (let i = 0; i < m.prix.length && m.prix[i].j <= j; i++) prix = m.prix[i].prix;
  return prix;
}

/**
 * Séries journalières par lot, de j0 à jFin (index = jour - j0).
 * Règles reprises du classeur v4.4 :
 *  - stock final = stock initial + entrées − décès − vendues − manquants (chaînage par lot) ;
 *  - poules en ponte = stock final si âge ≥ seuil de ponte OU œufs collectés ce jour-là, sinon 0 ;
 *  - œufs attendus = poules en ponte × objectif de la race ;
 *  - provende = pondeuses × ration ponte + (autres poules) × ration poulette, × prix du kg à la date.
 */
function seriesLots_(m, j0, jFin) {
  const seuilJ = m.p.SEUIL_PONTE_SEM * 7;
  const N = jFin - j0 + 1;
  const res = {};
  m.lots.forEach(function (l) {
    const race = m.races[l.race] || { objectif: 0, rationPonte: 0, rationPoulette: 0 };
    const s = { pFin: [], pEnt: [], pDec: [], pSor: [], cFin: [], cEnt: [], cDec: [], cSor: [], coll: [], casse: [], couv: [], ponte: [], attendus: [], provKg: [], provAr: [] };
    let pf = 0, cf = 0;
    const jl = m.journal[l.nom] || {};
    for (let i = 0; i < N; i++) {
      const j = j0 + i;
      const e = jl[j] || {};
      const actif = j >= l.debut;
      pf += n_(e.pEnt) - n_(e.pDec) - n_(e.pVen) - n_(e.pManq);
      cf += n_(e.cEnt) - n_(e.cDec) - n_(e.cVen);
      const coll = n_(e.coll);
      const ponte = actif && (j - l.naissance >= seuilJ || coll > 0) ? pf : 0;
      const kg = actif ? ponte * race.rationPonte + (pf - ponte) * race.rationPoulette : 0;
      s.pFin.push(pf); s.pEnt.push(n_(e.pEnt)); s.pDec.push(n_(e.pDec)); s.pSor.push(n_(e.pVen) + n_(e.pManq));
      s.cFin.push(cf); s.cEnt.push(n_(e.cEnt)); s.cDec.push(n_(e.cDec)); s.cSor.push(n_(e.cVen));
      s.coll.push(coll); s.casse.push(n_(e.casse)); s.couv.push(n_(e.couv));
      s.ponte.push(ponte); s.attendus.push(ponte * race.objectif);
      s.provKg.push(kg); s.provAr.push(kg * prixProvende_(m, j));
    }
    res[l.nom] = s;
  });
  return res;
}

function libelleAge_(jours) {
  return Math.floor(jours / 7) + ' sem ' + (jours % 7) + ' j';
}

function statut_(m, ageJ) {
  if (ageJ >= m.p.SEUIL_PONTE_SEM * 7) return 'En ponte';
  if (ageJ >= m.p.PREPONTE_SEM * 7) return 'Pré-ponte';
  return 'Poulette';
}

/**
 * Calcule tout le tableau de bord.
 * options : { selection: 'Tous' | 'Race <race>' | '<lot>', periode: '7j'|'30j'|'mois'|'90j'|'debut'|'jour'|'perso',
 *             jour: 'aaaa-mm-jj' (date de référence, vide = auto), debut, fin (période perso) }
 */
function calculerTableau(brut, options) {
  options = options || {};
  const m = construireModele(brut);
  const p = m.p;

  // --- Dates de référence et période ---
  const auto = versJour(p.DATE_REF) !== null ? versJour(p.DATE_REF) : (m.derniereCollecte !== null ? m.derniereCollecte : m.derniereSaisie);
  const ref = versJour(options.jour) !== null ? versJour(options.jour) : auto;
  if (ref === null) return { vide: true, message: 'Aucune donnée dans le journal.' };
  const debutSuivi = versJour(p.DEBUT_SUIVI) !== null ? versJour(p.DEBUT_SUIVI) : m.premierJour;
  const ventesJ = m.ventes.map(function (v) { return v.j; });
  const j0 = Math.min.apply(null, [debutSuivi, m.premierJour === null ? ref : m.premierJour, ref]
    .concat(m.lots.map(function (l) { return l.debut; })).concat(ventesJ.length ? [Math.min.apply(null, ventesJ)] : []));
  const periode = options.periode || 'debut';
  let debut;
  let fin = ref;
  switch (periode) {
    case '7j': debut = ref - 6; break;
    case '30j': debut = ref - 29; break;
    case 'mois': debut = debutMois_(ref); break;
    case '90j': debut = ref - 89; break;
    case 'jour': debut = ref; break;
    case 'perso':
      debut = versJour(options.debut) !== null ? versJour(options.debut) : debutSuivi;
      fin = versJour(options.fin) !== null ? Math.min(versJour(options.fin), ref) : ref;
      break;
    default: debut = debutSuivi;
  }
  debut = Math.max(debut, j0);
  if (debut > fin) debut = fin;
  const nbJours = fin - debut + 1;
  const series = seriesLots_(m, j0, ref);
  const ix = function (j) { return j - j0; };

  // --- Sélection lot / race ---
  const selection = options.selection || 'Tous';
  const lotsSel = m.lots.filter(function (l) {
    if (selection === 'Tous') return true;
    if (selection.indexOf('Race ') === 0) return l.race === selection.slice(5);
    return l.nom === selection;
  });
  const nomsSel = lotsSel.map(function (l) { return l.nom; });
  const tousNoms = m.lots.map(function (l) { return l.nom; });

  const somme = function (noms, champ, a, b) {
    let t = 0;
    noms.forEach(function (n) { const s = series[n][champ]; for (let j = Math.max(a, j0); j <= b; j++) t += s[ix(j)]; });
    return t;
  };
  const valeur = function (noms, champ, j) {
    if (j < j0) return 0;
    let t = 0;
    noms.forEach(function (n) { t += series[n][champ][ix(j)]; });
    return t;
  };

  // --- Ventes journalières (globales : les ventes ne sont pas saisies par lot) ---
  const N = ref - j0 + 1;
  const vJ = { achetes: new Array(N).fill(0), offerts: new Array(N).fill(0), cadeaux: new Array(N).fill(0), montant: new Array(N).fill(0) };
  m.ventes.forEach(function (v) {
    if (v.j < j0 || v.j > ref) return;
    vJ.achetes[ix(v.j)] += v.achetes; vJ.offerts[ix(v.j)] += v.offerts; vJ.cadeaux[ix(v.j)] += v.cadeaux; vJ.montant[ix(v.j)] += v.montant;
  });
  const sommeV = function (champ, a, b) { let t = 0; for (let j = Math.max(a, j0); j <= Math.min(b, ref); j++) t += vJ[champ][ix(j)]; return t; };

  // --- Stocks d'œufs (global, à part, hors à part) ---
  const nomsAPart = m.lots.filter(function (l) { return (m.races[l.race] || {}).aPart; }).map(function (l) { return l.nom; });
  const stockTotal = new Array(N), stockAPart = new Array(N);
  let st = 0, sa = 0;
  for (let i = 0; i < N; i++) {
    const j = j0 + i;
    st += valeur(tousNoms, 'coll', j) - valeur(tousNoms, 'casse', j) - valeur(tousNoms, 'couv', j) - vJ.achetes[i] - vJ.offerts[i] - vJ.cadeaux[i];
    sa += valeur(nomsAPart, 'coll', j) - valeur(nomsAPart, 'casse', j) - valeur(nomsAPart, 'couv', j);
    stockTotal[i] = st; stockAPart[i] = sa;
  }
  const stockA = function (arr, j) { return j < j0 ? 0 : arr[ix(Math.min(j, ref))]; };

  // --- KPI de la sélection ---
  const coll = somme(nomsSel, 'coll', debut, fin);
  const pj = somme(nomsSel, 'ponte', debut, fin);
  const att = somme(nomsSel, 'attendus', debut, fin);
  const casse = somme(nomsSel, 'casse', debut, fin);
  const couv = somme(nomsSel, 'couv', debut, fin);
  const poules = valeur(nomsSel, 'pFin', fin);
  const enPonte = valeur(nomsSel, 'ponte', fin);
  const coqs = valeur(nomsSel, 'cFin', fin);
  const entCumul = somme(nomsSel, 'pEnt', j0, fin);
  const decCumul = somme(nomsSel, 'pDec', j0, fin);
  const vendus = sommeV('achetes', debut, fin), offerts = sommeV('offerts', debut, fin), cadeaux = sommeV('cadeaux', debut, fin);
  const ca = sommeV('montant', debut, fin);
  const stockFin = stockA(stockTotal, fin), stockAPartFin = stockA(stockAPart, fin);
  const sortiesJour = div_(vendus + offerts + cadeaux, nbJours);

  const kpi = {
    poules: poules, enPonte: enPonte, poulettes: poules - enPonte, coqs: coqs,
    tauxPonte: div_(coll, pj), objectifPonte: div_(att, pj), realiseVsAttendu: div_(coll, att),
    collectes: coll, collectesParJour: div_(coll, nbJours), attendus: att, casses: casse, tauxCasse: div_(casse, coll), couveuse: couv,
    vendus: vendus, offertsOffre: offerts, cadeaux: cadeaux, offerts: offerts + cadeaux, ca: ca, prixMoyen: div_(ca, vendus),
    remiseOffre: div_(offerts, vendus + offerts),
    stockFin: stockFin, stockAPartFin: stockAPartFin, stockHorsAPart: stockFin - stockAPartFin,
    joursDeStock: div_(stockFin - stockAPartFin, sortiesJour),
    mortaliteCumulee: div_(decCumul, entCumul),
    plafondMortalite: p.MORTALITE_MAX, plafondCasse: p.CASSE_MAX
  };

  // --- Bilans ---
  const bilanVolailles = {
    poules: { initial: valeur(nomsSel, 'pFin', debut - 1), entrees: somme(nomsSel, 'pEnt', debut, fin), deces: somme(nomsSel, 'pDec', debut, fin), sorties: somme(nomsSel, 'pSor', debut, fin), final: poules },
    coqs: { initial: valeur(nomsSel, 'cFin', debut - 1), entrees: somme(nomsSel, 'cEnt', debut, fin), deces: somme(nomsSel, 'cDec', debut, fin), sorties: somme(nomsSel, 'cSor', debut, fin), final: coqs }
  };
  bilanVolailles.mortalitePeriode = div_(bilanVolailles.poules.deces, bilanVolailles.poules.initial + bilanVolailles.poules.entrees);
  const bilanOeufs = {
    initial: stockA(stockTotal, debut - 1), collectes: somme(tousNoms, 'coll', debut, fin), casses: somme(tousNoms, 'casse', debut, fin),
    couveuse: somme(tousNoms, 'couv', debut, fin), vendus: vendus, offerts: offerts + cadeaux, final: stockFin
  };

  // --- Situation des lots ---
  const lignesLots = lotsSel.map(function (l) {
    const n = [l.nom];
    const c = somme(n, 'coll', debut, fin), pjl = somme(n, 'ponte', debut, fin);
    const obj = (m.races[l.race] || {}).objectif || 0;
    const age = fin - l.naissance;
    const ent = somme(n, 'pEnt', j0, fin);
    const taux = div_(c, pjl);
    return {
      lot: l.nom, race: l.race, miseEnPlace: isoJour(l.dmp), arrive: fin >= l.dmp,
      age: fin < l.dmp ? 'pas encore arrivé' : libelleAge_(age), ageSemaines: Math.floor(age / 7), statut: fin < l.dmp ? '—' : statut_(m, age),
      poules: valeur(n, 'pFin', fin), coqs: valeur(n, 'cFin', fin), enPonte: valeur(n, 'ponte', fin),
      collectes: c, tauxPonte: taux, objectif: obj, ecartPts: pjl > 0 ? (taux - obj) * 100 : 0, aPondu: pjl > 0,
      mortalite: div_(somme(n, 'pDec', j0, fin), ent), remarque: l.remarque,
      debutPontePrevu: isoJour(l.naissance + p.SEUIL_PONTE_SEM * 7)
    };
  });

  // --- Situation journalière (jour de référence) ---
  const situationJour = lotsSel.filter(function (l) { return l.debut <= fin; }).map(function (l) {
    const n = [l.nom], c = valeur(n, 'coll', fin), po = valeur(n, 'ponte', fin);
    return {
      lot: l.nom, poules: valeur(n, 'pFin', fin), entrees: valeur(n, 'pEnt', fin), deces: valeur(n, 'pDec', fin), sorties: valeur(n, 'pSor', fin),
      coqs: valeur(n, 'cFin', fin), collectes: c, casses: valeur(n, 'casse', fin), couveuse: valeur(n, 'couv', fin), enPonte: po,
      tauxPonte: po > 0 ? c / po : null, ecart: c - valeur(n, 'attendus', fin), saisi: !!(m.journal[l.nom] || {})[fin]
    };
  });

  // --- Synthèse par race (couvaison, stock à part) ---
  const parRace = Object.keys(m.races).map(function (r) {
    const n = m.lots.filter(function (l) { return l.race === r; }).map(function (l) { return l.nom; });
    const collCumul = somme(n, 'coll', j0, fin), couvCumul = somme(n, 'couv', j0, fin);
    const pjr = somme(n, 'ponte', debut, fin), cr = somme(n, 'coll', debut, fin);
    return {
      race: r, aPart: m.races[r].aPart, objectif: m.races[r].objectif, poules: valeur(n, 'pFin', fin), enPonte: valeur(n, 'ponte', fin), coqs: valeur(n, 'cFin', fin),
      collectes: cr, casses: somme(n, 'casse', debut, fin), couveuse: somme(n, 'couv', debut, fin), couveuseCumul: couvCumul,
      partCouvee: div_(couvCumul, collCumul), tauxPonte: div_(cr, pjr),
      stockFin: somme(n, 'coll', j0, fin) - somme(n, 'casse', j0, fin) - couvCumul,
      dansSelection: lotsSel.some(function (l) { return l.race === r; })
    };
  });

  // --- Séries journalières (depuis le début du suivi) ---
  const jDeb = Math.max(debutSuivi, j0);
  const jours = [], parLotColl = {}, parLotTaux = {}, tauxGlobal = [], objectifGlobal = [], stockJ = [], venteJ = [], collJ = [];
  nomsSel.forEach(function (n) { parLotColl[n] = []; parLotTaux[n] = []; });
  for (let j = jDeb; j <= fin; j++) {
    jours.push(isoJour(j));
    nomsSel.forEach(function (n) {
      const s = series[n];
      parLotColl[n].push(j >= m.lots.filter(function (l) { return l.nom === n; })[0].debut ? s.coll[ix(j)] : null);
      parLotTaux[n].push(s.ponte[ix(j)] > 0 ? s.coll[ix(j)] / s.ponte[ix(j)] : null);
    });
    const po = valeur(nomsSel, 'ponte', j);
    tauxGlobal.push(po > 0 ? valeur(nomsSel, 'coll', j) / po : null);
    objectifGlobal.push(po > 0 ? valeur(nomsSel, 'attendus', j) / po : null);
    collJ.push(valeur(nomsSel, 'coll', j));
    stockJ.push(stockA(stockTotal, j));
    venteJ.push(vJ.achetes[ix(j)]);
  }
  const quotidien = { jours: jours, collectesParLot: parLotColl, tauxParLot: parLotTaux, tauxGlobal: tauxGlobal, objectif: objectifGlobal, collectes: collJ, stock: stockJ, vendus: venteJ };

  // 14 derniers jours (tableau)
  const derniers = [];
  for (let j = Math.max(fin - 13, j0); j <= fin; j++) {
    const ligne = { date: isoJour(j), lots: {}, total: valeur(nomsSel, 'coll', j) };
    nomsSel.forEach(function (n) {
      const po = series[n].ponte[ix(j)];
      ligne.lots[n] = { oeufs: series[n].coll[ix(j)], taux: po > 0 ? series[n].coll[ix(j)] / po : null };
    });
    const po = valeur(nomsSel, 'ponte', j);
    ligne.taux = po > 0 ? ligne.total / po : null;
    ligne.objectif = po > 0 ? valeur(nomsSel, 'attendus', j) / po : null;
    derniers.push(ligne);
  }

  // --- Séries hebdomadaires (blocs de 7 jours depuis le début du suivi) ---
  const hebdo = [];
  for (let a = jDeb; a <= fin; a += 7) {
    const b = Math.min(a + 6, fin);
    const pjw = somme(nomsSel, 'ponte', a, b), cw = somme(nomsSel, 'coll', a, b);
    hebdo.push({
      debut: isoJour(a), fin: isoJour(b), collectes: cw, tauxPonte: pjw > 0 ? cw / pjw : null, objectif: pjw > 0 ? somme(nomsSel, 'attendus', a, b) / pjw : null,
      vendus: sommeV('achetes', a, b), offerts: sommeV('offerts', a, b) + sommeV('cadeaux', a, b), ca: sommeV('montant', a, b), stock: stockA(stockTotal, b),
      deces: somme(nomsSel, 'pDec', a, b)
    });
  }

  // --- Rentabilité (période, tous lots) ---
  const chargesPeriode = m.charges.filter(function (c) { return c.j >= debut && c.j <= fin; });
  const sommeCharges = function (filtre) { return chargesPeriode.filter(filtre).reduce(function (t, c) { return t + c.montant; }, 0); };
  const provende = somme(tousNoms, 'provAr', debut, fin), provKg = somme(tousNoms, 'provKg', debut, fin);
  const autresVar = sommeCharges(function (c) { return c.type === 'Variable'; });
  const fixes = sommeCharges(function (c) { return c.type === 'Fixe'; });
  const collTous = somme(tousNoms, 'coll', debut, fin);
  const margeBrute = ca - provende - autresVar, margeNette = margeBrute - fixes;
  const margeUnitaire = div_(ca, vendus) - div_(provende + autresVar, vendus);
  const parCategorie = {};
  chargesPeriode.forEach(function (c) { parCategorie[c.categorie] = (parCategorie[c.categorie] || 0) + c.montant; });
  const rentabilite = {
    ca: ca, provende: provende, autresVariables: autresVar, margeBrute: margeBrute, fixes: fixes, margeNette: margeNette,
    collectes: collTous, vendus: vendus, prixMoyen: div_(ca, vendus), coutProvendeOeuf: div_(provende, collTous),
    coutRevientOeuf: div_(provende + autresVar + fixes, collTous), margeNetteOeuf: div_(margeNette, vendus),
    seuilRentabilite: vendus > 0 && margeUnitaire > 0 ? fixes / margeUnitaire : 0, prixMoyenProvende: div_(provende, provKg), provendeKg: provKg,
    parLot: m.lots.map(function (l) {
      const n = [l.nom], ar = somme(n, 'provAr', debut, fin), c = somme(n, 'coll', debut, fin);
      return { lot: l.nom, race: l.race, poulesJours: somme(n, 'pFin', debut, fin), pondeusesJours: somme(n, 'ponte', debut, fin), kg: somme(n, 'provKg', debut, fin), ar: ar,
        collectes: c, parOeuf: div_(ar, c), part: div_(ar, provende), autresVar: sommeCharges(function (x) { return x.type === 'Variable' && x.lot === l.nom; }) };
    }),
    nonAffectees: sommeCharges(function (c) { return c.type === 'Variable' && (c.lot === 'Tous' || tousNoms.indexOf(c.lot) < 0); }),
    parCategorie: Object.keys(parCategorie).map(function (k) { return { categorie: k, montant: parCategorie[k] }; }).sort(function (a, b) { return b.montant - a.montant; }),
    charges: chargesPeriode.sort(function (a, b) { return b.j - a.j; }).map(function (c) { return { date: isoJour(c.j), type: c.type, categorie: c.categorie, libelle: c.libelle, lot: c.lot, montant: c.montant }; })
  };

  // --- Évolution mensuelle ---
  const mensuel = [];
  for (let a = debutMois_(jDeb); a <= fin; a = finMois_(a) + 1) {
    const b = Math.min(finMois_(a), fin), aa = Math.max(a, j0);
    const caM = sommeV('montant', aa, b), prov = somme(tousNoms, 'provAr', aa, b);
    const ch = m.charges.filter(function (c) { return c.j >= aa && c.j <= b; });
    const av = ch.filter(function (c) { return c.type === 'Variable'; }).reduce(function (t, c) { return t + c.montant; }, 0);
    const fx = ch.filter(function (c) { return c.type === 'Fixe'; }).reduce(function (t, c) { return t + c.montant; }, 0);
    const pjm = somme(nomsSel, 'ponte', aa, b), cm = somme(nomsSel, 'coll', aa, b);
    const init = valeur(nomsSel, 'pFin', aa - 1), ent = somme(nomsSel, 'pEnt', aa, b), dec = somme(nomsSel, 'pDec', aa, b);
    mensuel.push({
      mois: isoJour(a).slice(0, 7), fin: isoJour(b), poules: valeur(nomsSel, 'pFin', b), enPonte: valeur(nomsSel, 'ponte', b), entrees: ent, deces: dec,
      mortalite: div_(dec, init + ent), collectes: cm, tauxPonte: div_(cm, pjm), objectif: div_(somme(nomsSel, 'attendus', aa, b), pjm),
      vendus: sommeV('achetes', aa, b), offerts: sommeV('offerts', aa, b) + sommeV('cadeaux', aa, b), ca: caM, provende: prov, autresVariables: av, fixes: fx,
      margeBrute: caM - prov - av, margeNette: caM - prov - av - fx, stockFin: stockA(stockTotal, b)
    });
  }

  // --- Objectifs (mois en cours à la date de référence) ---
  const dm = debutMois_(fin);
  const prorata = (fin - dm + 1) / (finMois_(fin) - dm + 1);
  const obj = function (groupe, libelle, sens, cible, cibleADate, realise, unite, format) {
    let pct;
    if (sens === '≥') pct = div_(realise, cibleADate);
    else pct = realise <= cibleADate ? 1 : div_(cibleADate, realise);
    return { groupe: groupe, libelle: libelle, sens: sens, cible: cible, cibleADate: cibleADate, realise: realise, ecart: realise - cibleADate,
      atteinte: pct, statut: pct >= 1 ? 'atteint' : (pct >= 0.9 ? 'proche' : 'insuffisant'), unite: unite, format: format };
  };
  const tauxRaceMois = function (r) {
    const n = m.lots.filter(function (l) { return l.race === r; }).map(function (l) { return l.nom; });
    return div_(somme(n, 'coll', dm, fin), somme(n, 'ponte', dm, fin));
  };
  const collMois = somme(tousNoms, 'coll', dm, fin);
  const vendusMois = sommeV('achetes', dm, fin), offMois = sommeV('offerts', dm, fin), cadMois = sommeV('cadeaux', dm, fin);
  const objectifs = [
    obj('Élevage', 'Effectif total de poules', '≥', p.CIBLE_EFFECTIF, p.CIBLE_EFFECTIF, valeur(tousNoms, 'pFin', fin), 'poules', 'n'),
    obj('Élevage', 'Poules en ponte', '≥', p.CIBLE_PONDEUSES, p.CIBLE_PONDEUSES, valeur(tousNoms, 'ponte', fin), 'poules', 'n'),
    obj('Élevage', 'Mortalité cumulée (poules)', '≤', p.MORTALITE_MAX, p.MORTALITE_MAX, div_(somme(tousNoms, 'pDec', j0, fin), somme(tousNoms, 'pEnt', j0, fin)), 'décès ÷ entrées', 'pct')
  ];
  Object.keys(m.races).forEach(function (r) {
    objectifs.push(obj('Production (mois)', 'Taux de ponte ' + r, '≥', m.races[r].objectif, m.races[r].objectif, tauxRaceMois(r), 'œufs ÷ poules en ponte', 'pct'));
  });
  const attMois = somme(tousNoms, 'attendus', dm, fin);
  objectifs.push(obj('Production (mois)', 'Œufs collectés vs attendus', '≥', attMois, attMois, collMois, 'œufs', 'n'));
  objectifs.push(obj('Production (mois)', 'Taux de casse', '≤', p.CASSE_MAX, p.CASSE_MAX, div_(somme(tousNoms, 'casse', dm, fin), collMois), 'cassés ÷ collectés', 'pct'));
  objectifs.push(obj('Vente (mois)', 'Œufs vendus', '≥', p.CIBLE_VENTES_MOIS, p.CIBLE_VENTES_MOIS * prorata, vendusMois, 'œufs (cible au prorata du mois)', 'n'));
  objectifs.push(obj('Vente (mois)', 'Chiffre d\'affaires', '≥', p.CIBLE_VENTES_MOIS * p.PRIX_OEUF, p.CIBLE_VENTES_MOIS * p.PRIX_OEUF * prorata, sommeV('montant', dm, fin), 'Ar (cible au prorata)', 'ar'));
  objectifs.push(obj('Vente (mois)', 'Taux d\'écoulement', '≥', p.ECOULEMENT_MIN, p.ECOULEMENT_MIN, div_(vendusMois + offMois + cadMois, collMois), '(vendus + offerts) ÷ collectés', 'pct'));

  // --- Top clients (période) ---
  const clients = {};
  m.ventes.filter(function (v) { return v.j >= debut && v.j <= fin && v.achetes > 0; }).forEach(function (v) {
    const c = clients[v.client] = clients[v.client] || { client: v.client, achats: 0, oeufs: 0, montant: 0, offerts: 0, dernier: v.j };
    c.achats++; c.oeufs += v.achetes; c.montant += v.montant; c.offerts += v.offerts; c.dernier = Math.max(c.dernier, v.j);
  });
  const topClients = Object.keys(clients).map(function (k) { const c = clients[k]; c.dernier = isoJour(c.dernier); return c; })
    .sort(function (a, b) { return b.oeufs - a.oeufs; });
  const dernieresVentes = m.ventes.filter(function (v) { return v.j <= fin; }).sort(function (a, b) { return b.j - a.j; }).slice(0, 15)
    .map(function (v) { return { date: isoJour(v.j), client: v.client, achetes: v.achetes, prix: v.prix, montant: v.montant, offerts: v.offerts, cadeaux: v.cadeaux }; });

  // --- Alertes et lecture rapide ---
  const alertes = [];
  lignesLots.forEach(function (l) {
    if (l.aPondu && l.statut === 'En ponte' && l.tauxPonte < 0.9 * l.objectif) alertes.push({ niveau: 'rouge', texte: l.lot + ' : taux de ponte ' + pct_(l.tauxPonte) + ' pour un objectif de ' + pct_(l.objectif) + '.' });
    if (l.mortalite > p.MORTALITE_MAX) alertes.push({ niveau: l.mortalite > 2 * p.MORTALITE_MAX ? 'rouge' : 'orange', texte: l.lot + ' : mortalité cumulée ' + pct_(l.mortalite) + ' (plafond ' + pct_(p.MORTALITE_MAX) + ').' });
    if (l.statut === 'Pré-ponte') alertes.push({ niveau: 'info', texte: l.lot + ' : entrée en ponte prévue le ' + frDate_(l.debutPontePrevu) + '.' });
  });
  const nonSaisis = situationJour.filter(function (s) { return !s.saisi && s.poules > 0; }).map(function (s) { return s.lot; });
  if (nonSaisis.length) alertes.push({ niveau: 'orange', texte: 'Aucune saisie le ' + frDate_(isoJour(fin)) + ' pour : ' + nonSaisis.join(', ') + '.' });
  if (kpi.tauxCasse > p.CASSE_MAX) alertes.push({ niveau: 'orange', texte: 'Taux de casse ' + pct_(kpi.tauxCasse) + ' au-dessus du plafond de ' + pct_(p.CASSE_MAX) + '.' });
  if (rentabilite.margeNette < 0) alertes.push({ niveau: 'rouge', texte: 'Marge nette négative sur la période : coût de revient ' + Math.round(rentabilite.coutRevientOeuf) + ' Ar/œuf pour un prix moyen de ' + Math.round(rentabilite.prixMoyen) + ' Ar.' });
  if (m.charges.some(function (c) { return /provende/i.test(c.libelle); })) alertes.push({ niveau: 'info', texte: 'Des achats de provende sont saisis dans Charges alors que la provende est déjà calculée (rations × prix) : risque de double comptage.' });

  const libSel = selection === 'Tous' ? 'Tous les lots' : selection;
  const lecture = libSel + ' : ' + fmt_(poules) + ' poules dont ' + fmt_(enPonte) + ' en ponte · taux de ponte ' + pct_(kpi.tauxPonte) +
    ' pour un objectif de ' + pct_(kpi.objectifPonte) + (kpi.tauxPonte >= kpi.objectifPonte ? ' → objectif atteint' : ' → en dessous de l\'objectif') +
    ' · mortalité cumulée ' + pct_(kpi.mortaliteCumulee) + '.';

  const listeSelection = ['Tous'].concat(Object.keys(m.races).map(function (r) { return 'Race ' + r; })).concat(tousNoms);

  return {
    nom: p.NOM_ELEVAGE, genereLe: new Date().toISOString(),
    filtres: { selection: selection, periode: periode, ref: isoJour(ref), auto: isoJour(auto), debut: isoJour(debut), fin: isoJour(fin), nbJours: nbJours, debutSuivi: isoJour(jDeb) },
    listes: { selection: listeSelection, lots: tousNoms, races: Object.keys(m.races), categories: ['Salaires', 'Soins vétérinaires / vaccins', 'Eau et électricité', 'Emballage / alvéoles', 'Transport / livraison', 'Entretien / matériel', 'Loyer / amortissement', 'Achat de volailles', 'Imprevus', 'Autre'] },
    lecture: lecture, alertes: alertes, kpi: kpi, bilanVolailles: bilanVolailles, bilanOeufs: bilanOeufs, lots: lignesLots, situationJour: situationJour,
    parRace: parRace, quotidien: quotidien, derniersJours: derniers, hebdo: hebdo, mensuel: mensuel, rentabilite: rentabilite,
    objectifs: objectifs, prorataMois: prorata, topClients: topClients.slice(0, 12), nbClients: topClients.length, dernieresVentes: dernieresVentes,
    parametres: { prixOeuf: p.PRIX_OEUF, offrePalier: p.OFFRE_PALIER, offreOeufs: p.OFFRE_OEUFS, offreDebut: versJour(p.OFFRE_DEBUT) !== null ? isoJour(versJour(p.OFFRE_DEBUT)) : '' }
  };
}

/** Anomalies de saisie (stocks négatifs, lots inconnus, doublons). */
function controlerDonnees(brut) {
  const m = construireModele(brut);
  const out = [];
  const noms = m.lots.map(function (l) { return l.nom; });
  Object.keys(m.journal).forEach(function (lot) { if (noms.indexOf(lot) < 0) out.push('Journal : lot « ' + lot + ' » absent de l\'onglet Lots.'); });
  m.lots.forEach(function (l) { if (!m.races[l.race]) out.push('Lots : race « ' + l.race + ' » du lot ' + l.nom + ' absente de l\'onglet Races.'); });
  const vus = {};
  (brut.Journal || []).forEach(function (r, i) {
    const k = versJour(r[0]) + '|' + r[1];
    if (vus[k]) out.push('Journal ligne ' + (i + 2) + ' : doublon ' + r[1] + ' le ' + frDate_(isoJour(versJour(r[0]))) + ' (les valeurs sont additionnées).');
    vus[k] = true;
  });
  const fin = m.derniereSaisie;
  if (fin !== null) {
    const j0 = Math.min.apply(null, m.lots.map(function (l) { return l.debut; }).concat([fin]));
    const s = seriesLots_(m, j0, fin);
    Object.keys(s).forEach(function (lot) {
      const i = s[lot].pFin.findIndex(function (v) { return v < 0; });
      if (i >= 0) out.push(lot + ' : effectif négatif à partir du ' + frDate_(isoJour(j0 + i)) + '.');
      const k = s[lot].coll.findIndex(function (v, x) { return v > 0 && s[lot].pFin[x] > 0 && v > 1.2 * s[lot].pFin[x]; });
      if (k >= 0) out.push(lot + ' : plus d\'œufs que de poules le ' + frDate_(isoJour(j0 + k)) + ' (vérifier la saisie).');
    });
  }
  return out;
}

function pct_(x) { return (Math.round(x * 1000) / 10).toString().replace('.', ',') + ' %'; }
function fmt_(x) { return Math.round(x).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' '); }
function frDate_(iso) { return iso ? iso.slice(8, 10) + '/' + iso.slice(5, 7) + '/' + iso.slice(0, 4) : ''; }

/* Export pour les tests Node (ignoré par Apps Script). */
if (typeof module !== 'undefined') module.exports = { calculerTableau: calculerTableau, construireModele: construireModele, controlerDonnees: controlerDonnees, versJour: versJour };
