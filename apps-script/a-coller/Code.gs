/** MDC ERP — fichier unique à coller dans Apps Script (Code.gs). Généré depuis apps-script/*.gs */

/* ===== Config.gs ===== */
/**
 * MDC ERP — Configuration : onglets, colonnes, listes de valeurs.
 */
const ONGLETS = {
  PARAMS: 'Paramètres',
  COMPTEURS: 'Compteurs',
  GROUPES: 'Groupes',
  ENTITES: 'Entités',
  CATALOGUE: 'Catalogue',
  FORMATEURS: 'Formateurs',
  PROFORMAS: 'Proformas',
  FACTURES: 'Factures',
  LIGNES: 'Lignes',
  PAIEMENTS: 'Paiements',
  SESSIONS: 'Sessions',
  PARTICIPANTS: 'Participants',
  FMFP: 'Suivi FMFP',
  DASHBOARD: 'Tableau de bord',
  EXPORTS: 'Exports',
  IMPORT: 'Import HubSpot',
  JOURNAL: 'Journal'
};

const COLONNES = {
  'Paramètres': ['Clé', 'Valeur', 'Description'],
  'Compteurs': ['Année', 'Type', 'Dernier numéro', 'Mis à jour le'],
  'Groupes': ['ID Groupe', 'Nom du groupe', 'HubSpot ID', 'Notes'],
  'Entités': ['ID Entité', 'Raison sociale', 'ID Groupe', 'Adresse', 'Email', 'Téléphone', 'NIF', 'STAT',
    'Contact principal', 'HubSpot ID', 'Source', 'Mis à jour le'],
  'Catalogue': ['Code', 'Domaine', 'Désignation', 'Niveau', 'Durée (h)', 'Prix unitaire HT', 'Unité', 'Actif'],
  'Formateurs': ['ID Formateur', 'Nom', 'Email', 'Téléphone', 'Domaines', 'Lien CV (FMFP)', 'Tarif journalier', 'Actif'],
  'Proformas': ['ID', 'N°', 'Date', 'Validité (jours)', 'ID Entité', 'Raison sociale', 'Contact client', 'Objet',
    'Lieu', 'Total HT', 'TVA', 'Total TTC', 'Statut', 'ID Session', 'Lien PDF', 'Créée le'],
  'Factures': ['ID', 'N°', 'Date', 'Type', '%', 'N° Proforma', 'ID Entité', 'Raison sociale', 'Contact client',
    'Total HT', 'TVA', 'Total TTC', 'Compte dans encaissements', 'Montant payé', 'Reste à payer',
    'Statut paiement', 'Date dernier paiement', 'Statut', 'Lien PDF', 'Créée le'],
  'Lignes': ['ID Document', 'Ordre', 'Code', 'Domaine', 'Désignation', 'Lieu', 'Durée', 'Quantité',
    'Prix unitaire HT', 'Montant HT'],
  'Paiements': ['Date', 'N° Facture', 'Montant', 'Mode', 'Référence', 'Saisi le'],
  'Sessions': ['ID Session', 'ID Entité', 'Raison sociale', 'Intitulé', 'Formateur(s)', 'Date début', 'Date fin',
    'Lieu', 'Nb participants', 'N° Proforma', 'FMFP',
    'P1 Analyse des besoins', 'P2 Test de niveau', 'P3 Validation des niveaux',
    'P4 Suivi pendant la formation', 'P5 Évaluation finale', 'P6 Clôture et compte rendu',
    'Phase actuelle', 'Alerte', 'Lien dossier', 'Notes'],
  'Participants': ['ID Session', 'Nom', 'Fonction', 'Email', 'Niveau test (P2)', 'Niveau validé (P3)',
    'Présence (%)', 'Note évaluation (P5)', 'Attestation'],
  'Suivi FMFP': ['ID Session', 'ID Entité', 'Raison sociale', 'N° Proforma', 'Étape', 'Date étape',
    'N° Facture 100 %', 'N° Facture 70 %', 'N° Facture 30 %', 'CV formateurs envoyés', 'Rapports envoyés',
    'Fiches de présence envoyées', 'Prochaine relance', 'Relance HubSpot créée', 'Commentaire'],
  'Tableau de bord': ['Indicateur', 'Valeur', 'Détail'],
  'Exports': ['N°', 'Date', 'Type', 'N° Proforma', 'ID Entité', 'Raison sociale', 'ID Session',
    'Dossier session (PC)', 'Dossier cible (PC)', 'Nom du fichier', 'Lien Drive', 'Classé sur le PC', 'Exporté le'],
  'Import HubSpot': ['Record ID', 'Company name', 'Parent company ID', 'Street address', 'City', 'Phone number', 'Email'],
  'Journal': ['Horodatage', 'Action', 'Détail', 'Utilisateur']
};

const STATUT_PHASE = ['À faire', 'En cours', 'Fait', 'N.A.'];
const STATUT_PROFORMA = ['Brouillon', 'Émise', 'Acceptée', 'Refusée', 'Annulée'];
const STATUT_FACTURE = ['Émise', 'Annulée'];
const MODES_PAIEMENT = ['Virement', 'Chèque', 'Espèces', 'MVola', 'Autre'];

/** Types de facture créés depuis une proforma. compte = entre dans les encaissements. */
const TYPES_FACTURE = {
  FMFP_100: { libelle: 'Facture 100 % (dossier FMFP)', pct: 100, compte: false },
  ACOMPTE: { libelle: 'Acompte', pct: null, compte: true },   // % = paramètre POURCENT_ACOMPTE
  SOLDE: { libelle: 'Solde', pct: null, compte: true },       // % = 100 - acomptes déjà facturés
  TOTALE: { libelle: 'Facture totale', pct: 100, compte: true }
};

/** Étapes du dossier FMFP (processus décrit par Tiavina le 02/11/2026). */
const ETAPES_FMFP = [
  '1. À préparer',
  '2. Dossier envoyé (facture 100 % + CV formateurs)',
  '3. Facture 70 % envoyée',
  '4. Acompte 70 % reçu',
  '5. Formation réalisée',
  '6. Post-formation envoyé (rapports + présences + facture 30 %)',
  '7. Solde 30 % reçu',
  '8. Clôturé'
];

const PARAMS_DEFAUT = [
  ['SOCIETE_NOM', 'MADAGASCAR DATA CAMP SARLU', 'Raison sociale'],
  ['SOCIETE_NOM_COURT', 'Madagascar Data Camp', ''],
  ['SOCIETE_ADRESSE', 'Lot II L 4 DE Ankadivato, Antananarivo 101, Madagascar', ''],
  ['SOCIETE_EMAIL', 'contact@datacamp.business', ''],
  ['SOCIETE_TEL', '038 59 637 90', ''],
  ['SOCIETE_NIF', '4012353768', ''],
  ['SOCIETE_STAT', '70202 11 2022 0 11337', ''],
  ['SOCIETE_RCS', '2022B01295', ''],
  ['MENTION_FISCALE_SUP', '', 'Mention fiscale supplémentaire en pied de page (à valider avec le comptable)'],
  ['TVA_APPLICABLE', 'Oui', 'Oui / Non. Assujettissement à faire confirmer (récépissé 2025 = impôt synthétique, aucune pièce TVA trouvée).'],
  ['TAUX_TVA', 0.2, 'Taux de TVA si applicable (20 % = 0.2). À CONFIRMER avec le comptable.'],
  ['DEVISE', 'Ar', ''],
  ['POURCENT_ACOMPTE', 70, 'Pourcentage par défaut de la facture d\'acompte'],
  ['CONDITIONS_PAIEMENT', 'Au comptant — 70 % avant la date de la formation / 30 % après la date de fin de la formation', ''],
  ['RIB', 'Banque BMOI Tsaralalana Antananarivo 101 Madagascar — Compte N° 00004 00002 04813420101 10 — Titulaire : Madagascar Data Camp', ''],
  ['MVOLA', '038 59 637 90', 'Affiché seulement pour les particuliers'],
  ['VALIDITE_PROFORMA_JOURS', 30, 'Validité par défaut d\'une proforma'],
  ['DELAI_RELANCE_FMFP_JOURS', 7, 'Jours entre une étape FMFP et la relance'],
  ['LOGO_FILE_ID', '', 'ID Google Drive du logo MDC (PNG/JPG)'],
  ['SIGNATURE_FILE_ID', '', 'ID Google Drive de l\'image tampon + signature (optionnel)'],
  ['DOSSIER_EXPORT_ID', '', 'Rempli par l\'initialisation : dossier Drive des PDF'],
  ['COMPTEUR_DEPART_DE_2026', 70, 'Dernier n° de facture déjà utilisé en 2026 (ancienne série). Prochaine = +1'],
  ['COMPTEUR_DEPART_PF_2026', 72, 'Dernier n° de proforma utilisé en 2026 (2605-F-PF-00072 HELIOS). Prochaine = +1'],
  ['COULEUR_PRINCIPALE', '#1B2B5E', ''],
  ['COULEUR_ACCENT', '#C89B2A', '']
];

const CATALOGUE_DEFAUT = [
  // Code, Domaine, Désignation, Niveau, Durée, Prix, Unité
  ['XL-N1', 'Excel', 'Microsoft Excel — Niveau Découverte', 'N1', 12, 300000, 'participant'],
  ['XL-N2', 'Excel', 'Microsoft Excel — Niveau Imprégnation', 'N2', 12, 300000, 'participant'],
  ['XL-N3', 'Excel', 'Microsoft Excel — Niveau Exploitation', 'N3', 12, 350000, 'participant'],
  ['XL-N4', 'Excel', 'Microsoft Excel — Niveau Perfectionnement', 'N4', 15, 450000, 'participant'],
  ['XL-SILVER', 'Excel', 'Microsoft Excel — Pack Silver', 'Pack', 18, 500000, 'participant'],
  ['XL-GOLD', 'Excel', 'Microsoft Excel — Pack Gold', 'Pack', 21, 650000, 'participant'],
  ['XL-PREMIUM', 'Excel', 'Microsoft Excel — Pack Premium', 'Pack', 30, 900000, 'participant'],
  ['XL-ALLIN', 'Excel', 'Microsoft Excel — Pack All-In', 'Pack', 30, 1150000, 'participant'],
  ['PBI-N1', 'Power BI', 'Power BI — Niveau 1', 'N1', 15, 500000, 'participant'],
  ['PBI-N2', 'Power BI', 'Power BI — Niveau 2', 'N2', 15, 500000, 'participant'],
  ['PBI-N3', 'Power BI', 'Power BI — Niveau 3', 'N3', 15, 500000, 'participant'],
  ['PBI-N4', 'Power BI', 'Power BI — Niveau 4', 'N4', 12, 400000, 'participant'],
  ['PBI-SILVER', 'Power BI', 'Power BI — Pack Silver', 'Pack', 24, 900000, 'participant'],
  ['PBI-GOLD', 'Power BI', 'Power BI — Pack Gold', 'Pack', 27, 1350000, 'participant'],
  ['PBI-PREMIUM', 'Power BI', 'Power BI — Pack Premium', 'Pack', 30, 1650000, 'participant'],
  ['PBI-ALLIN', 'Power BI', 'Power BI — Pack All-In', 'Pack', 36, 1800000, 'participant'],
  ['IA-N1', 'IA', 'Intelligence artificielle — Niveau 1', 'N1', 12, 400000, 'participant'],
  ['IA-N2', 'IA', 'Intelligence artificielle — Niveau 2', 'N2', 12, 500000, 'participant'],
  ['IA-N3', 'IA', 'Intelligence artificielle — Niveau 3', 'N3', 15, 700000, 'participant'],
  ['IA-PACK', 'IA', 'Intelligence artificielle — Pack', 'Pack', 39, 1600000, 'participant'],
  ['NO-N1', 'Notion', 'Notion — Niveau 1', 'N1', 12, 400000, 'participant'],
  ['NO-N2', 'Notion', 'Notion — Niveau 2', 'N2', 12, 400000, 'participant'],
  ['NO-N3', 'Notion', 'Notion — Niveau 3', 'N3', 12, 500000, 'participant'],
  ['NO-PACK', 'Notion', 'Notion — Pack', 'Pack', 36, 1300000, 'participant'],
  ['DIV-PC', 'Divers', 'Location PC', '', '', 50000, 'PC'],
  ['DIV-DEPL', 'Divers', 'Frais de déplacement formateur', '', '', 30000, 'jour'],
  ['DIV-FOURN', 'Divers', 'Fournitures et supports', '', '', 15000, 'participant'],
  ['DIV-RESTO', 'Divers', 'Restauration', '', '', 20000, 'participant'],
  ['DIV-SALLE', 'Divers', 'Location salle', '', '', 0, 'jour'],
  ['DIV-PERSO', 'Divers', 'Prestation personnalisée', '', '', 0, 'forfait'],
  ['DIV-REMISE', 'Divers', 'Remise', '', '', 0, 'forfait']
];

/** Les 6 phases MDC, dans l'ordre (colonnes de l'onglet Sessions). */
const PHASES = ['P1 Analyse des besoins', 'P2 Test de niveau', 'P3 Validation des niveaux',
  'P4 Suivi pendant la formation', 'P5 Évaluation finale', 'P6 Clôture et compte rendu'];

/* ===== Utils.gs ===== */
/** MDC ERP — Fonctions utilitaires (lecture/écriture des onglets). */
function ss_() {
  let s = null;
  try { s = SpreadsheetApp.getActiveSpreadsheet(); } catch (e) { s = null; }
  if (s) return s;
  const id = PropertiesService.getScriptProperties().getProperty('SPREADSHEET_ID');
  if (!id) throw new Error('Base introuvable : lancez initialiserStructure depuis l\'éditeur Apps Script.');
  return SpreadsheetApp.openById(id);
}

/** Message à l'utilisateur : boîte de dialogue dans la feuille, sinon journal (éditeur, application web). */
function alerte_(msg) {
  try { SpreadsheetApp.getUi().alert(msg); } catch (e) { Logger.log(msg); }
}

function sh_(nom) {
  const s = ss_().getSheetByName(nom);
  if (!s) throw new Error('Onglet manquant : « ' + nom + ' ». Lancez MDC ERP > Initialiser la structure.');
  return s;
}

function entetes_(s) { return s.getRange(1, 1, 1, s.getLastColumn()).getValues()[0]; }

/** Lit un onglet en tableau d'objets {colonne: valeur, _row: n° de ligne}. */
function lire_(nom) {
  const s = sh_(nom);
  if (s.getLastRow() < 2) return [];
  const v = s.getRange(1, 1, s.getLastRow(), s.getLastColumn()).getValues();
  const h = v.shift();
  return v.map(function (r, i) {
    const o = { _row: i + 2 };
    h.forEach(function (k, j) { o[k] = r[j]; });
    return o;
  }).filter(function (o) { return h.some(function (k) { return o[k] !== '' && o[k] !== null; }); });
}

function ajouter_(nom, obj) {
  const s = sh_(nom);
  const h = entetes_(s);
  s.appendRow(h.map(function (k) { return obj[k] !== undefined ? obj[k] : ''; }));
  return s.getLastRow();
}

function maj_(nom, ligne, obj) {
  const s = sh_(nom);
  const h = entetes_(s);
  Object.keys(obj).forEach(function (k) {
    const j = h.indexOf(k);
    if (j >= 0) s.getRange(ligne, j + 1).setValue(obj[k]);
  });
}

function trouver_(nom, col, valeur) {
  return lire_(nom).filter(function (o) { return String(o[col]) === String(valeur); })[0] || null;
}

/** Paramètre (onglet Paramètres). */
let CACHE_PARAMS_ = null;
function param_(cle, defaut) {
  if (!CACHE_PARAMS_) {
    CACHE_PARAMS_ = {};
    lire_(ONGLETS.PARAMS).forEach(function (p) { CACHE_PARAMS_[p['Clé']] = p['Valeur']; });
  }
  const v = CACHE_PARAMS_[cle];
  return v !== undefined && v !== '' ? v : defaut;
}

function setParam_(cle, valeur) {
  CACHE_PARAMS_ = null;
  const p = trouver_(ONGLETS.PARAMS, 'Clé', cle);
  if (p) maj_(ONGLETS.PARAMS, p._row, { 'Valeur': valeur });
  else ajouter_(ONGLETS.PARAMS, { 'Clé': cle, 'Valeur': valeur });
}

/** Identifiant interne séquentiel (ex. P0001). Différent du n° légal. */
function nouvelId_(nom, col, prefixe) {
  let max = 0;
  lire_(nom).forEach(function (o) {
    const m = String(o[col]).match(new RegExp('^' + prefixe + '(\\d+)$'));
    if (m) max = Math.max(max, Number(m[1]));
  });
  return prefixe + String(max + 1).padStart(4, '0');
}

function journal_(action, detail) {
  try {
    ajouter_(ONGLETS.JOURNAL, {
      'Horodatage': new Date(), 'Action': action, 'Détail': detail,
      'Utilisateur': Session.getActiveUser().getEmail()
    });
  } catch (e) { /* le journal ne doit jamais bloquer */ }
}

/** Ligne sélectionnée dans l'onglet attendu. */
function ligneSelectionnee_(nomAttendu) {
  const s = ss_().getActiveSheet();
  if (s.getName() !== nomAttendu) throw new Error('Sélectionnez une ligne dans l\'onglet « ' + nomAttendu + ' ».');
  const r = s.getActiveRange().getRow();
  if (r < 2) throw new Error('Sélectionnez une ligne de données (pas l\'en-tête).');
  return lire_(nomAttendu).filter(function (o) { return o._row === r; })[0];
}

function fmtDate_(d) {
  if (!d) return '';
  return Utilities.formatDate(new Date(d), ss_().getSpreadsheetTimeZone(), 'dd/MM/yyyy');
}

function fmtMontant_(n) {
  const v = Math.round(Number(n) || 0);
  return v.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
}

function arrondi_(n) { return Math.round(Number(n) || 0); }

function ui_() { return SpreadsheetApp.getUi(); }

function echapper_(t) {
  return String(t === undefined || t === null ? '' : t)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

/* ===== Setup.gs ===== */
/** MDC ERP — Initialisation : crée ou complète tous les onglets. Peut être relancé sans perte de données. */
function initialiserStructure() {
  const ss = ss_();
  PropertiesService.getScriptProperties().setProperty('SPREADSHEET_ID', ss.getId());
  Object.keys(COLONNES).forEach(function (nom) {
    let s = ss.getSheetByName(nom);
    if (!s) s = ss.insertSheet(nom);
    const cols = COLONNES[nom];
    if (s.getLastColumn() === 0) {
      s.getRange(1, 1, 1, cols.length).setValues([cols]);
    } else {
      // Ajoute les colonnes manquantes à droite, sans toucher aux existantes.
      const h = entetes_(s);
      cols.forEach(function (c) { if (h.indexOf(c) < 0) s.getRange(1, s.getLastColumn() + 1).setValue(c); });
    }
    const n = s.getLastColumn();
    s.getRange(1, 1, 1, n).setFontWeight('bold').setBackground('#1B2B5E').setFontColor('#FFFFFF');
    s.setFrozenRows(1);
  });

  // Paramètres par défaut (seulement les clés absentes).
  PARAMS_DEFAUT.forEach(function (p) {
    if (!trouver_(ONGLETS.PARAMS, 'Clé', p[0])) ajouter_(ONGLETS.PARAMS, { 'Clé': p[0], 'Valeur': p[1], 'Description': p[2] });
  });

  // Catalogue par défaut si vide.
  if (lire_(ONGLETS.CATALOGUE).length === 0) {
    const rows = CATALOGUE_DEFAUT.map(function (c) { return c.concat([true]); });
    sh_(ONGLETS.CATALOGUE).getRange(2, 1, rows.length, rows[0].length).setValues(rows);
  }

  // Dossier Drive des exports.
  if (!param_('DOSSIER_EXPORT_ID', '')) {
    const f = DriveApp.createFolder('MDC ERP - Exports PDF');
    setParam_('DOSSIER_EXPORT_ID', f.getId());
  }

  appliquerValidations_();
  formats_();
  const def = ss.getSheetByName('Feuille 1') || ss.getSheetByName('Sheet1');
  if (def && def.getLastRow() === 0 && ss.getSheets().length > 1) ss.deleteSheet(def);
  journal_('Initialisation', 'Structure créée / mise à jour');
  alerte_('Structure MDC ERP prête. Vérifiez l\'onglet Paramètres (TVA, logo), puis déployez l\'application web.');
}

function liste_(valeurs) {
  return SpreadsheetApp.newDataValidation().requireValueInList(valeurs, true).setAllowInvalid(false).build();
}

function colRange_(nom, col) {
  const s = sh_(nom);
  const j = entetes_(s).indexOf(col) + 1;
  return s.getRange(2, j, Math.max(s.getMaxRows() - 1, 1), 1);
}

function appliquerValidations_() {
  colRange_(ONGLETS.PROFORMAS, 'Statut').setDataValidation(liste_(STATUT_PROFORMA));
  colRange_(ONGLETS.FACTURES, 'Statut').setDataValidation(liste_(STATUT_FACTURE));
  colRange_(ONGLETS.PAIEMENTS, 'Mode').setDataValidation(liste_(MODES_PAIEMENT));
  colRange_(ONGLETS.SESSIONS, 'FMFP').setDataValidation(liste_(['Oui', 'Non']));
  PHASES.forEach(function (p) { colRange_(ONGLETS.SESSIONS, p).setDataValidation(liste_(STATUT_PHASE)); });
  colRange_(ONGLETS.FMFP, 'Étape').setDataValidation(liste_(ETAPES_FMFP));
  ['CV formateurs envoyés', 'Rapports envoyés', 'Fiches de présence envoyées', 'Relance HubSpot créée'].forEach(function (c) {
    colRange_(ONGLETS.FMFP, c).insertCheckboxes();
  });
  colRange_(ONGLETS.EXPORTS, 'Classé sur le PC').insertCheckboxes();
  colRange_(ONGLETS.PARTICIPANTS, 'Attestation').setDataValidation(liste_(['Oui', 'Non (présence < 80 %)', 'À vérifier']));
}

function formats_() {
  const money = '#,##0';
  [[ONGLETS.PROFORMAS, ['Total HT', 'TVA', 'Total TTC']],
   [ONGLETS.FACTURES, ['Total HT', 'TVA', 'Total TTC', 'Montant payé', 'Reste à payer']],
   [ONGLETS.LIGNES, ['Prix unitaire HT', 'Montant HT']],
   [ONGLETS.PAIEMENTS, ['Montant']],
   [ONGLETS.CATALOGUE, ['Prix unitaire HT']]].forEach(function (x) {
    x[1].forEach(function (c) { colRange_(x[0], c).setNumberFormat(money); });
  });
  [[ONGLETS.PROFORMAS, ['Date']], [ONGLETS.FACTURES, ['Date', 'Date dernier paiement']], [ONGLETS.PAIEMENTS, ['Date']], [ONGLETS.EXPORTS, ['Date']],
   [ONGLETS.SESSIONS, ['Date début', 'Date fin']], [ONGLETS.FMFP, ['Date étape', 'Prochaine relance']]].forEach(function (x) {
    x[1].forEach(function (c) { colRange_(x[0], c).setNumberFormat('dd/MM/yyyy'); });
  });
}

/* ===== Numerotation.gs ===== */
/**
 * MDC ERP — Numérotation légale des proformas (PF) et factures (DE).
 * Format : AAMM-F-<TYPE>-NNNNN
 *   AAMM  = année et mois d'émission
 *   NNNNN = compteur continu sur l'année civile, propre à chaque type, jamais réutilisé.
 * Voir docs/01-numerotation.md.
 */
function prochainNumero_(type, date) {
  if (type !== 'PF' && type !== 'DE') throw new Error('Type de numéro inconnu : ' + type);
  const lock = LockService.getDocumentLock();
  lock.waitLock(30000);
  try {
    const d = new Date(date || new Date());
    const annee = d.getFullYear();
    const ligne = lire_(ONGLETS.COMPTEURS).filter(function (c) {
      return Number(c['Année']) === annee && c['Type'] === type;
    })[0];
    let dernier;
    if (ligne) {
      dernier = Number(ligne['Dernier numéro']) || 0;
    } else {
      const depart = param_('COMPTEUR_DEPART_' + type + '_' + annee, '');
      if (depart === '' && annee === 2026 && type === 'PF') {
        throw new Error('Renseignez COMPTEUR_DEPART_PF_2026 dans Paramètres (dernier n° de proforma 2026 déjà utilisé).');
      }
      dernier = Number(depart) || 0;
    }
    const n = dernier + 1;
    if (n > 99999) throw new Error('Compteur ' + type + ' ' + annee + ' saturé.');
    if (ligne) maj_(ONGLETS.COMPTEURS, ligne._row, { 'Dernier numéro': n, 'Mis à jour le': new Date() });
    else ajouter_(ONGLETS.COMPTEURS, { 'Année': annee, 'Type': type, 'Dernier numéro': n, 'Mis à jour le': new Date() });
    SpreadsheetApp.flush();
    const aamm = Utilities.formatDate(d, ss_().getSpreadsheetTimeZone(), 'yyMM');
    const numero = aamm + '-F-' + type + '-' + String(n).padStart(5, '0');
    // Contrôle anti-doublon.
    const onglet = type === 'PF' ? ONGLETS.PROFORMAS : ONGLETS.FACTURES;
    if (trouver_(onglet, 'N°', numero)) throw new Error('Doublon détecté : ' + numero + '. Vérifiez l\'onglet Compteurs.');
    journal_('Numéro attribué', numero);
    return numero;
  } finally {
    lock.releaseLock();
  }
}

/* ===== Facturation.gs ===== */
/** MDC ERP — Proformas, factures, paiements. */

/* ---------- Données pour le formulaire « Nouvelle proforma » ---------- */
function donneesFormulaire() {
  const groupes = {};
  lire_(ONGLETS.GROUPES).forEach(function (g) { groupes[g['ID Groupe']] = g['Nom du groupe']; });
  return {
    entites: lire_(ONGLETS.ENTITES).map(function (e) {
      return { id: e['ID Entité'], nom: e['Raison sociale'], groupe: groupes[e['ID Groupe']] || '', contact: e['Contact principal'] || '' };
    }).sort(function (a, b) { return String(a.nom).localeCompare(String(b.nom)); }),
    catalogue: lire_(ONGLETS.CATALOGUE).filter(function (c) { return c['Actif'] !== false; }).map(function (c) {
      return { code: c['Code'], domaine: c['Domaine'], designation: c['Désignation'], duree: c['Durée (h)'], pu: c['Prix unitaire HT'], unite: c['Unité'] };
    }),
    validite: param_('VALIDITE_PROFORMA_JOURS', 30),
    tva: tauxTva_()
  };
}

/* ---------- Proforma ---------- */
function creerProforma(data) {
  if (!data || !data.idEntite) throw new Error('Choisissez une entité.');
  if (!data.lignes || !data.lignes.length) throw new Error('Ajoutez au moins une ligne.');
  const ent = trouver_(ONGLETS.ENTITES, 'ID Entité', data.idEntite);
  if (!ent) throw new Error('Entité introuvable : ' + data.idEntite);
  const id = nouvelId_(ONGLETS.PROFORMAS, 'ID', 'P');
  const totalHT = ecrireLignes_(id, data.lignes, data.lieu);
  const t = totaux_(totalHT);
  ajouter_(ONGLETS.PROFORMAS, {
    'ID': id, 'N°': '', 'Date': data.date ? new Date(data.date) : new Date(),
    'Validité (jours)': data.validite || param_('VALIDITE_PROFORMA_JOURS', 30),
    'ID Entité': ent['ID Entité'], 'Raison sociale': ent['Raison sociale'],
    'Contact client': data.contact || ent['Contact principal'] || '', 'Objet': data.objet || '', 'Lieu': data.lieu || '',
    'Total HT': t.ht, 'TVA': t.tva, 'Total TTC': t.ttc, 'Statut': 'Brouillon', 'Créée le': new Date()
  });
  journal_('Proforma créée', id + ' — ' + ent['Raison sociale']);
  if (data.emettre) return emettreProforma_(id);
  return { id: id, message: 'Proforma ' + id + ' créée en brouillon.' };
}

function ecrireLignes_(idDoc, lignes, lieuDefaut) {
  let total = 0;
  lignes.forEach(function (l, i) {
    const q = Number(l.quantite) || 0, pu = Number(l.pu) || 0;
    let montant = arrondi_(q * pu);
    if (l.code === 'DIV-REMISE') montant = -Math.abs(montant);
    total += montant;
    ajouter_(ONGLETS.LIGNES, {
      'ID Document': idDoc, 'Ordre': i + 1, 'Code': l.code || '', 'Domaine': l.domaine || '',
      'Désignation': l.designation || '', 'Lieu': l.lieu || lieuDefaut || '', 'Durée': l.duree || '',
      'Quantité': q, 'Prix unitaire HT': pu, 'Montant HT': montant
    });
  });
  return total;
}

function totaux_(ht) {
  const taux = tauxTva_();
  const tva = arrondi_(ht * taux);
  return { ht: arrondi_(ht), tva: tva, ttc: arrondi_(ht) + tva, taux: taux };
}

function tvaApplicable_() { return String(param_('TVA_APPLICABLE', 'Non')).toLowerCase() === 'oui'; }
function tauxTva_() { return tvaApplicable_() ? (Number(param_('TAUX_TVA', 0)) || 0) : 0; }

function lignesDe_(idDoc) {
  return lire_(ONGLETS.LIGNES).filter(function (l) { return l['ID Document'] === idDoc; })
    .sort(function (a, b) { return a['Ordre'] - b['Ordre']; });
}

function emettreProformaSelectionnee() {
  const p = ligneSelectionnee_(ONGLETS.PROFORMAS);
  const r = emettreProforma_(p['ID']);
  ui_().alert(r.message);
}

function emettreProforma_(id) {
  const p = trouver_(ONGLETS.PROFORMAS, 'ID', id);
  if (!p) throw new Error('Proforma introuvable : ' + id);
  if (p['N°']) throw new Error('Cette proforma a déjà le numéro ' + p['N°'] + '. Utilisez « Régénérer le PDF ».');
  // Recalcule les totaux depuis les lignes (si modifiées à la main en brouillon).
  const ht = lignesDe_(id).reduce(function (s, l) { return s + Number(l['Montant HT'] || 0); }, 0);
  const t = totaux_(ht);
  const numero = prochainNumero_('PF', p['Date']);
  maj_(ONGLETS.PROFORMAS, p._row, { 'N°': numero, 'Statut': 'Émise', 'Total HT': t.ht, 'TVA': t.tva, 'Total TTC': t.ttc });
  const url = genererPdf_('PF', trouver_(ONGLETS.PROFORMAS, 'ID', id));
  maj_(ONGLETS.PROFORMAS, p._row, { 'Lien PDF': url });
  return { id: id, numero: numero, url: url, message: 'Proforma ' + numero + ' émise. PDF : ' + url };
}

/* ---------- Factures ---------- */
function factureFmfp100() { creerFactureMenu_('FMFP_100'); }
function factureAcompte() { creerFactureMenu_('ACOMPTE'); }
function factureSolde() { creerFactureMenu_('SOLDE'); }
function factureTotale() { creerFactureMenu_('TOTALE'); }

function creerFactureMenu_(type) {
  const p = ligneSelectionnee_(ONGLETS.PROFORMAS);
  const r = creerFactureDepuisProforma_(p['ID'], type);
  ui_().alert(r.message);
}

function creerFactureDepuisProforma_(idProforma, type) {
  const p = trouver_(ONGLETS.PROFORMAS, 'ID', idProforma);
  if (!p) throw new Error('Proforma introuvable.');
  if (!p['N°'] || ['Émise', 'Acceptée'].indexOf(p['Statut']) < 0) {
    throw new Error('Une facture est toujours précédée d\'une proforma émise ou acceptée (statut actuel : ' + p['Statut'] + ').');
  }
  const def = TYPES_FACTURE[type];
  const existantes = lire_(ONGLETS.FACTURES).filter(function (f) {
    return f['N° Proforma'] === p['N°'] && f['Statut'] !== 'Annulée';
  });
  const dejaPct = existantes.filter(function (f) { return f['Compte dans encaissements'] === true || f['Compte dans encaissements'] === 'Oui'; })
    .reduce(function (s, f) { return s + Number(f['%'] || 0); }, 0);

  let pct = def.pct;
  if (type === 'ACOMPTE') pct = Number(param_('POURCENT_ACOMPTE', 70));
  if (type === 'SOLDE') pct = 100 - dejaPct;
  if (type === 'FMFP_100' && existantes.some(function (f) { return f['Type'] === def.libelle; })) {
    throw new Error('Une facture 100 % FMFP existe déjà pour ' + p['N°'] + '.');
  }
  if (def.compte && dejaPct + pct > 100) throw new Error('Dépassement : ' + dejaPct + ' % déjà facturé sur ' + p['N°'] + '.');
  if (pct <= 0) throw new Error('Rien à facturer : 100 % déjà facturé sur ' + p['N°'] + '.');

  const libelle = type === 'ACOMPTE' || type === 'SOLDE' ? def.libelle + ' ' + pct + ' %' : def.libelle;
  const id = nouvelId_(ONGLETS.FACTURES, 'ID', 'F');
  // Copie les lignes de la proforma (l'acompte s'applique sur le total).
  const lignes = lignesDe_(idProforma).map(function (l) {
    return { code: l['Code'], domaine: l['Domaine'], designation: l['Désignation'], lieu: l['Lieu'], duree: l['Durée'], quantite: l['Quantité'], pu: l['Prix unitaire HT'] };
  });
  const htTotal = ecrireLignes_(id, lignes, p['Lieu']);
  const t = totaux_(htTotal * pct / 100);
  const date = new Date();
  const numero = prochainNumero_('DE', date);
  const row = ajouter_(ONGLETS.FACTURES, {
    'ID': id, 'N°': numero, 'Date': date, 'Type': libelle, '%': pct, 'N° Proforma': p['N°'],
    'ID Entité': p['ID Entité'], 'Raison sociale': p['Raison sociale'], 'Contact client': p['Contact client'],
    'Total HT': t.ht, 'TVA': t.tva, 'Total TTC': t.ttc,
    'Compte dans encaissements': def.compte ? 'Oui' : 'Non',
    'Montant payé': 0, 'Reste à payer': def.compte ? t.ttc : 0,
    'Statut paiement': def.compte ? 'Impayée' : 'N.A. (dossier FMFP)', 'Statut': 'Émise', 'Créée le': new Date()
  });
  if (p['Statut'] === 'Émise') maj_(ONGLETS.PROFORMAS, p._row, { 'Statut': 'Acceptée' });
  const f = trouver_(ONGLETS.FACTURES, 'ID', id);
  f._totalProformaHT = htTotal;
  const url = genererPdf_('DE', f);
  maj_(ONGLETS.FACTURES, row, { 'Lien PDF': url });
  lierFactureFmfp_(p['N°'], type, numero);
  journal_('Facture émise', numero + ' (' + libelle + ') ← ' + p['N°']);
  return { numero: numero, url: url, message: 'Facture ' + numero + ' (' + libelle + ') émise. PDF : ' + url };
}

function regenererPdfSelection() {
  const s = ss_().getActiveSheet().getName();
  if (s === ONGLETS.PROFORMAS) {
    const p = ligneSelectionnee_(s);
    if (!p['N°']) throw new Error('Proforma non émise.');
    maj_(s, p._row, { 'Lien PDF': genererPdf_('PF', p) });
  } else if (s === ONGLETS.FACTURES) {
    const f = ligneSelectionnee_(s);
    const p = trouver_(ONGLETS.PROFORMAS, 'N°', f['N° Proforma']);
    f._totalProformaHT = lignesDe_(f['ID']).reduce(function (a, l) { return a + Number(l['Montant HT'] || 0); }, 0);
    maj_(s, f._row, { 'Lien PDF': genererPdf_('DE', f) });
  } else throw new Error('Sélectionnez une ligne dans Proformas ou Factures.');
  ui_().alert('PDF régénéré (même numéro).');
}

function annulerSelection() {
  const s = ss_().getActiveSheet().getName();
  if ([ONGLETS.PROFORMAS, ONGLETS.FACTURES].indexOf(s) < 0) throw new Error('Sélectionnez une proforma ou une facture.');
  const o = ligneSelectionnee_(s);
  const rep = ui_().alert('Annuler ' + (o['N°'] || o['ID']) + ' ? Le numéro ne sera jamais réutilisé.', ui_().ButtonSet.YES_NO);
  if (rep !== ui_().Button.YES) return;
  maj_(s, o._row, s === ONGLETS.FACTURES ? { 'Statut': 'Annulée', 'Reste à payer': 0, 'Statut paiement': 'Annulée' } : { 'Statut': 'Annulée' });
  journal_('Annulation', o['N°'] || o['ID']);
}

/* ---------- Paiements ---------- */
function enregistrerPaiement() {
  const f = ligneSelectionnee_(ONGLETS.FACTURES);
  if (f['Compte dans encaissements'] !== 'Oui') throw new Error('Cette facture (dossier FMFP 100 %) ne reçoit pas de paiement. Saisissez le paiement sur la facture d\'acompte ou de solde.');
  const ui = ui_();
  const r1 = ui.prompt('Paiement sur ' + f['N°'], 'Montant reçu (reste : ' + fmtMontant_(f['Reste à payer']) + ' Ar)', ui.ButtonSet.OK_CANCEL);
  if (r1.getSelectedButton() !== ui.Button.OK) return;
  const montant = Number(String(r1.getResponseText()).replace(/\s/g, '').replace(',', '.'));
  if (!(montant > 0)) throw new Error('Montant invalide.');
  const r2 = ui.prompt('Mode et référence', 'Ex. : Virement / OV 123456', ui.ButtonSet.OK_CANCEL);
  if (r2.getSelectedButton() !== ui.Button.OK) return;
  const parts = r2.getResponseText().split('/');
  paiementCore_(f['N°'], montant, (parts[0] || '').trim(), (parts[1] || '').trim(), new Date());
}

function paiementCore_(numFacture, montant, mode, reference, date) {
  const f = trouver_(ONGLETS.FACTURES, 'N°', numFacture);
  if (!f) throw new Error('Facture introuvable : ' + numFacture);
  if (f['Statut'] === 'Annulée') throw new Error('Facture annulée.');
  if (f['Compte dans encaissements'] !== 'Oui') throw new Error('La facture 100 % FMFP ne reçoit pas de paiement : saisissez-le sur l\'acompte ou le solde.');
  montant = Number(montant);
  if (!(montant > 0)) throw new Error('Montant invalide.');
  ajouter_(ONGLETS.PAIEMENTS, {
    'Date': date ? new Date(date) : new Date(), 'N° Facture': numFacture, 'Montant': montant,
    'Mode': mode || '', 'Référence': reference || '', 'Saisi le': new Date()
  });
  recalculerPaiements();
  journal_('Paiement', numFacture + ' : ' + montant);
}

/** Recalcule montant payé / reste / statut de toutes les factures depuis l'onglet Paiements. */
function recalculerPaiements() {
  const parFacture = {}, derniere = {};
  lire_(ONGLETS.PAIEMENTS).forEach(function (p) {
    const k = p['N° Facture'];
    parFacture[k] = (parFacture[k] || 0) + Number(p['Montant'] || 0);
    if (!derniere[k] || new Date(p['Date']) > derniere[k]) derniere[k] = new Date(p['Date']);
  });
  lire_(ONGLETS.FACTURES).forEach(function (f) {
    if (f['Compte dans encaissements'] !== 'Oui' || f['Statut'] === 'Annulée') return;
    const paye = parFacture[f['N°']] || 0;
    const reste = Number(f['Total TTC']) - paye;
    const statut = paye <= 0 ? 'Impayée' : reste > 0 ? 'Partielle' : reste < 0 ? 'Trop-perçu' : 'Payée';
    maj_(ONGLETS.FACTURES, f._row, {
      'Montant payé': paye, 'Reste à payer': Math.max(reste, 0), 'Statut paiement': statut,
      'Date dernier paiement': derniere[f['N°']] || ''
    });
  });
}

/* ===== Pdf.gs ===== */
/** MDC ERP — Génération des PDF (proforma et facture) dans Google Drive. */
function genererPdf_(type, doc) {
  const html = htmlDocument_(type, doc);
  const nomEntite = String(doc['Raison sociale'] || '').replace(/[\\\/:*?"<>|]/g, '-');
  const nom = doc['N°'] + ' ' + nomEntite + (type === 'DE' ? ' - ' + doc['Type'] : '') + '.pdf';
  const blob = Utilities.newBlob(html, 'text/html', 'doc.html').getAs('application/pdf').setName(nom);
  const dossier = dossierExport_(type === 'PF' ? 'Proformas' : 'Factures', new Date(doc['Date']).getFullYear());
  // Remplace un PDF existant du même nom (régénération).
  const ex = dossier.getFilesByName(nom);
  while (ex.hasNext()) ex.next().setTrashed(true);
  const url = dossier.createFile(blob).getUrl();
  enregistrerExport_(type, doc, nom, url);
  return url;
}

/**
 * Onglet « Exports » : une ligne par PDF, avec le dossier cible sur le PC,
 * pour que la session « Assistant MDC » classe les fichiers dans D:\MDC\Gestion MDC.
 */
function enregistrerExport_(type, doc, nom, url) {
  const numPf = type === 'PF' ? doc['N°'] : doc['N° Proforma'];
  const pf = trouver_(ONGLETS.PROFORMAS, 'N°', numPf) || {};
  const idSession = pf['ID Session'] || '';
  const annee = '20' + String(doc['N°']).slice(0, 2); // l'année vient du numéro
  const cible = type === 'PF' ? '02 Finance\\Proformas et devis\\' + annee : '02 Finance\\Factures emises\\' + annee;
  const obj = {
    'N°': doc['N°'], 'Date': doc['Date'], 'Type': type === 'PF' ? 'Proforma' : doc['Type'], 'N° Proforma': numPf,
    'ID Entité': doc['ID Entité'], 'Raison sociale': doc['Raison sociale'], 'ID Session': idSession,
    'Dossier session (PC)': idSession ? dossierSessionPc_(idSession) : '', 'Dossier cible (PC)': cible,
    'Nom du fichier': nom, 'Lien Drive': url, 'Classé sur le PC': false, 'Exporté le': new Date()
  };
  const ex = lire_(ONGLETS.EXPORTS).filter(function (e) { return e['N°'] === doc['N°']; })[0];
  if (ex) maj_(ONGLETS.EXPORTS, ex._row, obj); else ajouter_(ONGLETS.EXPORTS, obj);
}

/** « 04 Formations\Sessions\AAAA-MM Entité - Formation\Facturation » (règle du LISEZ-MOI). */
function dossierSessionPc_(idSession) {
  const s = trouver_(ONGLETS.SESSIONS, 'ID Session', idSession);
  if (!s) return '';
  const pf = trouver_(ONGLETS.PROFORMAS, 'N°', s['N° Proforma']) || {};
  const d = new Date(s['Date début'] || pf['Date'] || new Date());
  const aaaamm = Utilities.formatDate(d, ss_().getSpreadsheetTimeZone(), 'yyyy-MM');
  const nom = (aaaamm + ' ' + s['Raison sociale'] + ' - ' + s['Intitulé']).replace(/[\\\/:*?"<>|]/g, '-').slice(0, 120);
  return '04 Formations\\Sessions\\' + nom + '\\Facturation';
}

/** Recalcule la colonne « Dossier session (PC) » (après création de session ou saisie de la date de début). */
function actualiserExports() {
  lire_(ONGLETS.EXPORTS).forEach(function (e) {
    const pf = trouver_(ONGLETS.PROFORMAS, 'N°', e['N° Proforma']) || {};
    const id = pf['ID Session'] || '';
    if (id) maj_(ONGLETS.EXPORTS, e._row, { 'ID Session': id, 'Dossier session (PC)': dossierSessionPc_(id) });
  });
}

function dossierExport_(sous, annee) {
  const racine = DriveApp.getFolderById(param_('DOSSIER_EXPORT_ID'));
  function enfant(parent, nom) {
    const it = parent.getFoldersByName(nom);
    return it.hasNext() ? it.next() : parent.createFolder(nom);
  }
  return enfant(enfant(racine, sous), String(annee));
}

function imageDataUri_(fileId) {
  if (!fileId) return '';
  try {
    const b = DriveApp.getFileById(fileId).getBlob();
    return 'data:' + b.getContentType() + ';base64,' + Utilities.base64Encode(b.getBytes());
  } catch (e) { return ''; }
}

function htmlDocument_(type, doc) {
  const P = function (k, d) { return param_(k, d || ''); };
  const c1 = P('COULEUR_PRINCIPALE', '#1B2B5E'), c2 = P('COULEUR_ACCENT', '#C89B2A');
  const devise = P('DEVISE', 'Ar');
  const ent = trouver_(ONGLETS.ENTITES, 'ID Entité', doc['ID Entité']) || {};
  const lignes = lignesDe_(doc['ID']);
  const logo = imageDataUri_(P('LOGO_FILE_ID'));
  const signature = imageDataUri_(P('SIGNATURE_FILE_ID'));
  const estPF = type === 'PF';
  const titre = estPF ? 'Facture Proforma' : 'Facture';
  const avecTva = tvaApplicable_();
  const taux = tauxTva_();
  const sfx = avecTva ? ' HT' : '';
  const pct = estPF ? 100 : Number(doc['%']) || 100;
  const htLignes = lignes.reduce(function (s, l) { return s + Number(l['Montant HT'] || 0); }, 0);

  let lignesHtml = lignes.map(function (l) {
    return '<tr><td>' + echapper_(l['Domaine']) + '</td><td>' + echapper_(l['Désignation']) +
      (l['Lieu'] ? '<br><span class="lieu">Lieu : ' + echapper_(l['Lieu']) + '</span>' : '') + '</td>' +
      '<td class="c">' + echapper_(l['Durée'] ? l['Durée'] + ' h' : '') + '</td>' +
      '<td class="c">' + echapper_(l['Quantité']) + '</td>' +
      '<td class="r">' + fmtMontant_(l['Prix unitaire HT']) + '</td>' +
      '<td class="r">' + fmtMontant_(l['Montant HT']) + '</td></tr>';
  }).join('');

  let totaux = '<tr><td>Sous-total' + sfx + '</td><td class="r">' + fmtMontant_(htLignes) + ' ' + devise + '</td></tr>';
  if (!estPF && pct !== 100) {
    totaux += '<tr><td>' + echapper_(doc['Type']) + ' (sur proforma ' + echapper_(doc['N° Proforma']) + ')</td><td class="r">' + fmtMontant_(doc['Total HT']) + ' ' + devise + '</td></tr>';
  }
  if (avecTva) totaux += '<tr><td>TVA ' + Math.round(taux * 100) + ' %</td><td class="r">' + fmtMontant_(doc['TVA']) + ' ' + devise + '</td></tr>';
  totaux += '<tr class="tot"><td>Total' + (avecTva ? ' TTC' : '') + ' à payer</td><td class="r">' + fmtMontant_(doc['Total TTC']) + ' ' + devise + '</td></tr>';

  const particulier = !ent['NIF'] && !ent['STAT']; // sans NIF ni STAT : MVola affiché
  const validite = estPF ? new Date(new Date(doc['Date']).getTime() + Number(doc['Validité (jours)'] || 30) * 86400000) : null;

  return '<!DOCTYPE html><html><head><meta charset="utf-8"><style>' +
    'body{font-family:Arial,Helvetica,sans-serif;font-size:10.5px;color:#222;margin:28px}' +
    '.top{display:flex;justify-content:space-between;align-items:flex-start}' +
    'h1{color:' + c1 + ';font-size:24px;margin:0 0 6px}' +
    '.box{border:1px solid #ddd;padding:8px 10px;margin-top:10px}' +
    'table{width:100%;border-collapse:collapse;margin-top:14px}' +
    'th{background:' + c2 + ';color:#fff;padding:6px;font-size:10px;text-align:left}' +
    'td{font-size:10.5px;padding:6px;border-bottom:1px solid #eee;vertical-align:top}' +
    '.c{text-align:center}.r{text-align:right;white-space:nowrap}.lieu{color:#666;font-size:9.5px}' +
    '.totaux{width:45%;margin-left:auto}.tot td{font-weight:bold;background:#F8F6F1;border-top:2px solid ' + c1 + '}' +
    '.notes{margin-top:16px;font-size:10px;line-height:1.5}' +
    '.foot{margin-top:24px;border-top:1px solid ' + c1 + ';padding-top:6px;font-size:9px;color:#555;text-align:center}' +
    '</style></head><body>' +
    '<table style="margin:0"><tr><td style="border:0;width:55%">' +
    (logo ? '<img src="' + logo + '" style="height:60px"><br>' : '<b style="font-size:16px;color:' + c1 + '">' + echapper_(P('SOCIETE_NOM')) + '</b><br>') +
    echapper_(P('SOCIETE_ADRESSE')) + '<br>' + echapper_(P('SOCIETE_EMAIL')) + ' — ' + echapper_(P('SOCIETE_TEL')) +
    '</td><td style="border:0;text-align:right"><h1>' + titre + '</h1>' +
    '<b>N° :</b> ' + echapper_(doc['N°']) + '<br><b>Date :</b> ' + fmtDate_(doc['Date']) +
    (estPF ? '<br><b>Validité :</b> ' + fmtDate_(validite) : '<br><b>Réf. proforma :</b> ' + echapper_(doc['N° Proforma'])) +
    '<br><b>Contact client :</b> ' + echapper_(doc['Contact client']) + '</td></tr></table>' +
    '<div class="box"><b>Client</b><br><b>' + echapper_(ent['Raison sociale'] || doc['Raison sociale']) + '</b><br>' +
    echapper_(ent['Adresse']) + (ent['Email'] ? '<br>' + echapper_(ent['Email']) : '') + (ent['Téléphone'] ? ' — ' + echapper_(ent['Téléphone']) : '') +
    (ent['NIF'] ? '<br>NIF : ' + echapper_(ent['NIF']) : '') + (ent['STAT'] ? ' — STAT : ' + echapper_(ent['STAT']) : '') + '</div>' +
    (doc['Objet'] ? '<p><b>Objet :</b> ' + echapper_(doc['Objet']) + '</p>' : '') +
    '<table><tr><th>Domaine</th><th>Formation / Prestation</th><th class="c">Durée</th><th class="c">Qté</th><th class="r">Prix unitaire' + sfx + '</th><th class="r">Montant' + sfx + '</th></tr>' +
    lignesHtml + '</table>' +
    '<table class="totaux">' + totaux + '</table>' +
    '<div class="notes"><b>Arrêté' + (estPF ? 'e la présente facture proforma' : 'e la présente facture') + ' à la somme de :</b> ' +
    enLettres_(doc['Total TTC']) + ' Ariary' + (avecTva ? ' TTC' : '') + '.<br>' +
    '<b>Conditions de paiement :</b> ' + echapper_(P('CONDITIONS_PAIEMENT')) + '<br>' +
    '<b>Paiement par virement bancaire :</b> ' + echapper_(P('RIB')) +
    (particulier ? '<br><b>MVola :</b> ' + echapper_(P('MVOLA')) : '') + '</div>' +
    (signature ? '<div style="text-align:right;margin-top:12px"><img src="' + signature + '" style="height:90px"></div>' : '') +
    '<div class="foot">' + echapper_(P('SOCIETE_NOM')) + ' — NIF : ' + echapper_(P('SOCIETE_NIF')) + ' — STAT : ' + echapper_(P('SOCIETE_STAT')) +
    ' — RCS : ' + echapper_(P('SOCIETE_RCS')) + (P('MENTION_FISCALE_SUP') ? ' — ' + echapper_(P('MENTION_FISCALE_SUP')) : '') + '</div>' +
    '</body></html>';
}

/* ===== Lettres.gs ===== */
/** MDC ERP — Montant en toutes lettres (français), ex. 470000 → « quatre cent soixante-dix mille ». */
function enLettres_(n) {
  n = Math.round(Math.abs(Number(n) || 0));
  if (n === 0) return 'zéro';
  const U = ['', 'un', 'deux', 'trois', 'quatre', 'cinq', 'six', 'sept', 'huit', 'neuf', 'dix', 'onze', 'douze',
    'treize', 'quatorze', 'quinze', 'seize', 'dix-sept', 'dix-huit', 'dix-neuf'];
  const D = ['', '', 'vingt', 'trente', 'quarante', 'cinquante', 'soixante', 'soixante', 'quatre-vingt', 'quatre-vingt'];

  function moinsDeCent(x) {
    if (x < 20) return U[x];
    const d = Math.floor(x / 10), u = x % 10;
    if (d === 7 || d === 9) {
      const reste = 10 + u;
      return D[d] + (d === 7 && u === 1 ? ' et ' : '-') + U[reste];
    }
    if (u === 0) return D[d] + (d === 8 ? 's' : '');
    if (u === 1 && d !== 8) return D[d] + ' et un';
    return D[d] + '-' + U[u];
  }
  function moinsDeMille(x, final) {
    const c = Math.floor(x / 100), r = x % 100;
    let s = '';
    if (c > 0) s = (c > 1 ? U[c] + ' ' : '') + 'cent' + (c > 1 && r === 0 && final ? 's' : '');
    if (r > 0) s += (s ? ' ' : '') + moinsDeCent(r);
    return s;
  }
  const echelles = [[1e9, 'milliard'], [1e6, 'million'], [1e3, 'mille']];
  let s = '', reste = n;
  echelles.forEach(function (e) {
    const q = Math.floor(reste / e[0]);
    reste = reste % e[0];
    if (q === 0) return;
    if (e[1] === 'mille') s += (q === 1 ? '' : moinsDeMille(q, false) + ' ') + 'mille ';
    else s += moinsDeMille(q, true) + ' ' + e[1] + (q > 1 ? 's' : '') + ' ';
  });
  if (reste > 0) s += moinsDeMille(reste, true);
  s = s.trim();
  // « quatre-vingts » perd son s devant mille/millions dans certains cas : simplification conservée.
  return s.replace(/quatre-vingts (mille)/g, 'quatre-vingt $1');
}

function testLettres() {
  [470000, 18640000, 1541100, 2884000, 80, 71, 91, 200, 1000, 1001000, 2000000].forEach(function (n) {
    Logger.log(n + ' → ' + enLettres_(n));
  });
}

/* ===== Formations.gs ===== */
/** MDC ERP — Sessions de formation, 6 phases MDC, participants, suivi FMFP. */

function creerSessionDepuisProforma() {
  const p = ligneSelectionnee_(ONGLETS.PROFORMAS);
  const ui = ui_();
  const fm = ui.alert('Dossier FMFP ?', 'Cette formation est-elle financée via le FMFP ?', ui.ButtonSet.YES_NO);
  const id = creerSessionCore_(p['ID'], fm === ui.Button.YES);
  ui.alert('Session ' + id + ' créée. Complétez formateurs et dates.');
}

function creerSessionCore_(idProforma, estFmfp) {
  const p = trouver_(ONGLETS.PROFORMAS, 'ID', idProforma);
  if (!p) throw new Error('Proforma introuvable.');
  if (!p['N°']) throw new Error('Émettez d\'abord la proforma.');
  if (p['ID Session']) throw new Error('Session déjà créée : ' + p['ID Session']);
  const fmfp = estFmfp ? 'Oui' : 'Non';
  const annee = new Date(p['Date']).getFullYear();
  const id = nouvelId_(ONGLETS.SESSIONS, 'ID Session', 'S' + annee + '-');
  const nbPart = lignesDe_(p['ID']).filter(function (l) { return String(l['Code']).indexOf('DIV-') !== 0; })
    .reduce(function (m, l) { return Math.max(m, Number(l['Quantité']) || 0); }, 0);
  const obj = {
    'ID Session': id, 'ID Entité': p['ID Entité'], 'Raison sociale': p['Raison sociale'],
    'Intitulé': p['Objet'] || lignesDe_(p['ID']).map(function (l) { return l['Désignation']; }).filter(String).slice(0, 3).join(' + '),
    'Lieu': p['Lieu'], 'Nb participants': nbPart, 'N° Proforma': p['N°'], 'FMFP': fmfp
  };
  PHASES.forEach(function (ph, i) { obj[ph] = i === 0 ? 'Fait' : 'À faire'; }); // P1 = proforma issue de l'analyse des besoins
  ajouter_(ONGLETS.SESSIONS, obj);
  maj_(ONGLETS.PROFORMAS, p._row, { 'ID Session': id });
  if (fmfp === 'Oui') {
    ajouter_(ONGLETS.FMFP, {
      'ID Session': id, 'ID Entité': p['ID Entité'], 'Raison sociale': p['Raison sociale'], 'N° Proforma': p['N°'],
      'Étape': ETAPES_FMFP[0], 'Date étape': new Date(),
      'CV formateurs envoyés': false, 'Rapports envoyés': false, 'Fiches de présence envoyées': false, 'Relance HubSpot créée': false
    });
  }
  actualiserExports();
  journal_('Session créée', id + ' ← ' + p['N°'] + ' (FMFP : ' + fmfp + ')');
  // Rattache les factures déjà émises au dossier FMFP.
  lire_(ONGLETS.FACTURES).filter(function (f) { return f['N° Proforma'] === p['N°'] && f['Statut'] !== 'Annulée'; }).forEach(function (f) {
    const t = /FMFP/.test(f['Type']) ? 'FMFP_100' : /^Acompte/.test(f['Type']) ? 'ACOMPTE' : /^Solde/.test(f['Type']) ? 'SOLDE' : '';
    if (t) lierFactureFmfp_(p['N°'], t, f['N°']);
  });
  return id;
}

/** Rattache automatiquement les n° de facture au dossier FMFP. */
function lierFactureFmfp_(numProforma, type, numFacture) {
  const d = trouver_(ONGLETS.FMFP, 'N° Proforma', numProforma);
  if (!d) return;
  const col = { FMFP_100: 'N° Facture 100 %', ACOMPTE: 'N° Facture 70 %', SOLDE: 'N° Facture 30 %' }[type];
  if (col) maj_(ONGLETS.FMFP, d._row, { [col]: numFacture });
}

/**
 * Contrôle des 6 phases MDC : une phase ne peut être « Fait » que si les précédentes le sont (ou N.A.).
 * Met à jour « Phase actuelle » et « Alerte ».
 */
function controlerPhases() {
  const participants = lire_(ONGLETS.PARTICIPANTS);
  lire_(ONGLETS.SESSIONS).forEach(function (s) {
    const alertes = [];
    let actuelle = 'Terminée';
    let trou = false;
    PHASES.forEach(function (ph) {
      const v = s[ph] || 'À faire';
      const ok = v === 'Fait' || v === 'N.A.';
      if (!ok && actuelle === 'Terminée') actuelle = ph;
      if (ok && trou && v === 'Fait') alertes.push(ph.split(' ')[0] + ' faite avant une phase précédente');
      if (!ok) trou = true;
    });
    const ps = participants.filter(function (p) { return p['ID Session'] === s['ID Session']; });
    const aujourd = new Date();
    if (s['Date début'] && new Date(s['Date début']) <= aujourd && s['P2 Test de niveau'] !== 'Fait' && s['P2 Test de niveau'] !== 'N.A.') alertes.push('Formation démarrée sans test de niveau');
    if (s['Date début'] && new Date(s['Date début']) <= aujourd && s['P3 Validation des niveaux'] !== 'Fait' && s['P3 Validation des niveaux'] !== 'N.A.') alertes.push('Niveaux non validés');
    if (!s['Formateur(s)']) alertes.push('Formateur non affecté');
    if (s['P6 Clôture et compte rendu'] === 'Fait') {
      const sansAtt = ps.filter(function (p) { return !p['Attestation']; }).length;
      if (sansAtt) alertes.push(sansAtt + ' participant(s) sans statut d\'attestation');
    }
    ps.forEach(function (p) {
      const pres = Number(String(p['Présence (%)']).replace('%', ''));
      if (p['Attestation'] === 'Oui' && pres && pres < 80) alertes.push(p['Nom'] + ' : attestation avec présence < 80 %');
    });
    maj_(ONGLETS.SESSIONS, s._row, { 'Phase actuelle': actuelle, 'Alerte': alertes.join(' · ') });
  });
}

/** Calcule l'attestation (Oui si présence ≥ 80 %) pour les participants sans valeur. */
function calculerAttestations() {
  lire_(ONGLETS.PARTICIPANTS).forEach(function (p) {
    if (p['Attestation'] || p['Présence (%)'] === '') return;
    const v = Number(String(p['Présence (%)']).replace('%', ''));
    const pres = v <= 1 ? v * 100 : v; // accepte 0,85 ou 85
    maj_(ONGLETS.PARTICIPANTS, p._row, { 'Attestation': pres >= 80 ? 'Oui' : 'Non (présence < 80 %)' });
  });
}

/** Déclencheur simple : à chaque changement d'étape FMFP, date l'étape et calcule la relance. */
function onEdit(e) {
  try {
    const s = e.range.getSheet();
    if (s.getName() !== ONGLETS.FMFP || e.range.getRow() < 2) return;
    const h = entetes_(s);
    if (h[e.range.getColumn() - 1] !== 'Étape') return;
    const r = e.range.getRow();
    const delai = Number(param_('DELAI_RELANCE_FMFP_JOURS', 7));
    const now = new Date();
    s.getRange(r, h.indexOf('Date étape') + 1).setValue(now);
    const fin = /Clôturé/.test(e.value || '');
    s.getRange(r, h.indexOf('Prochaine relance') + 1).setValue(fin ? '' : new Date(now.getTime() + delai * 86400000));
    s.getRange(r, h.indexOf('Relance HubSpot créée') + 1).setValue(false);
  } catch (err) { /* silencieux */ }
}

/** Tableau de bord : factures à encaisser, sessions, alertes, relances FMFP. */
function actualiserTableauDeBord() {
  recalculerPaiements();
  controlerPhases();
  actualiserExports();
  const f = lire_(ONGLETS.FACTURES).filter(function (x) { return x['Statut'] !== 'Annulée' && x['Compte dans encaissements'] === 'Oui'; });
  const annee = new Date().getFullYear();
  const caAnnee = f.filter(function (x) { return new Date(x['Date']).getFullYear() === annee; })
    .reduce(function (s, x) { return s + Number(x['Total TTC'] || 0); }, 0);
  const impayees = f.filter(function (x) { return Number(x['Reste à payer']) > 0; });
  const reste = impayees.reduce(function (s, x) { return s + Number(x['Reste à payer']); }, 0);
  const sessions = lire_(ONGLETS.SESSIONS);
  const enCours = sessions.filter(function (s) { return s['Phase actuelle'] !== 'Terminée'; });
  const alertes = sessions.filter(function (s) { return s['Alerte']; });
  const auj = new Date();
  const relances = lire_(ONGLETS.FMFP).filter(function (d) { return d['Prochaine relance'] && new Date(d['Prochaine relance']) <= auj; });
  const pfOuvertes = lire_(ONGLETS.PROFORMAS).filter(function (p) { return p['Statut'] === 'Émise'; });

  const rows = [
    ['Facturé ' + annee + ' (TTC, hors dossiers FMFP 100 %)', caAnnee, ''],
    ['Reste à encaisser (TTC)', reste, impayees.map(function (x) { return x['N°'] + ' ' + x['Raison sociale'] + ' : ' + fmtMontant_(x['Reste à payer']); }).join('\n')],
    ['Proformas émises en attente de réponse', pfOuvertes.length, pfOuvertes.map(function (p) { return p['N°'] + ' ' + p['Raison sociale']; }).join('\n')],
    ['Sessions en cours', enCours.length, enCours.map(function (s) { return s['ID Session'] + ' ' + s['Raison sociale'] + ' — ' + s['Phase actuelle']; }).join('\n')],
    ['Sessions avec alerte (6 phases)', alertes.length, alertes.map(function (s) { return s['ID Session'] + ' : ' + s['Alerte']; }).join('\n')],
    ['Relances FMFP dues', relances.length, relances.map(function (d) { return d['ID Session'] + ' ' + d['Raison sociale'] + ' — ' + d['Étape']; }).join('\n')],
    ['Actualisé le', new Date(), '']
  ];
  const s = sh_(ONGLETS.DASHBOARD);
  if (s.getLastRow() > 1) s.getRange(2, 1, s.getLastRow() - 1, 3).clearContent();
  s.getRange(2, 1, rows.length, 3).setValues(rows).setVerticalAlignment('top').setWrap(true);
  s.getRange(2, 2, 2, 1).setNumberFormat('#,##0');
  s.setColumnWidth(1, 320); s.setColumnWidth(3, 520);
}

/* ===== HubSpot.gs ===== */
/**
 * MDC ERP — Synchronisation HubSpot (lecture des entreprises + groupes via « entreprise mère »).
 * La clé (jeton d'application privée HubSpot) est stockée dans les propriétés du script, jamais dans la feuille.
 */
const HS_API = 'https://api.hubapi.com';

function configurerCleHubSpot() {
  const ui = ui_();
  const r = ui.prompt('Clé HubSpot', 'Collez le jeton d\'accès de l\'application privée HubSpot (commence par « pat- »).', ui.ButtonSet.OK_CANCEL);
  if (r.getSelectedButton() !== ui.Button.OK) return;
  const t = r.getResponseText().trim();
  if (!t) return;
  PropertiesService.getScriptProperties().setProperty('HUBSPOT_TOKEN', t);
  ui.alert('Clé enregistrée. Lancez « Synchroniser les entreprises ».');
}

function hs_(methode, chemin, corps) {
  const token = PropertiesService.getScriptProperties().getProperty('HUBSPOT_TOKEN');
  if (!token) throw new Error('Clé HubSpot absente : MDC ERP > HubSpot > Configurer la clé (ou utilisez l\'import manuel).');
  const opt = { method: methode, muteHttpExceptions: true, contentType: 'application/json', headers: { Authorization: 'Bearer ' + token } };
  if (corps) opt.payload = JSON.stringify(corps);
  const res = UrlFetchApp.fetch(HS_API + chemin, opt);
  const code = res.getResponseCode();
  if (code >= 300) throw new Error('HubSpot ' + code + ' : ' + res.getContentText().slice(0, 300));
  return res.getContentText() ? JSON.parse(res.getContentText()) : {};
}

function synchroniserEntreprises() {
  const n = synchroniserEntreprisesCore_();
  alerte_(n.crees + ' entité(s) créée(s), ' + n.majs + ' mise(s) à jour, ' + n.groupes + ' groupe(s).');
}

function synchroniserEntreprisesCore_() {
  const props = ['name', 'address', 'city', 'phone', 'hs_parent_company_id'];
  const toutes = [];
  let after = '';
  do {
    const r = hs_('get', '/crm/v3/objects/companies?limit=100&archived=false&properties=' + props.join(',') + (after ? '&after=' + after : ''));
    (r.results || []).forEach(function (c) { toutes.push({ id: c.id, p: c.properties || {} }); });
    after = r.paging && r.paging.next ? r.paging.next.after : '';
  } while (after);
  return integrerEntreprises_(toutes.map(function (c) {
    return { id: c.id, nom: c.p.name, parent: c.p.hs_parent_company_id, adresse: [c.p.address, c.p.city].filter(String).join(', '), tel: c.p.phone };
  }), 'HubSpot API');
}

/** Import manuel : collez un export HubSpot (entreprises) dans l'onglet « Import HubSpot ». */
function importerDepuisOnglet() {
  const n = importerDepuisOngletCore_();
  alerte_(n.crees + ' entité(s) créée(s), ' + n.majs + ' mise(s) à jour, ' + n.groupes + ' groupe(s).');
}

function importerDepuisOngletCore_() {
  const lignes = lire_(ONGLETS.IMPORT);
  if (!lignes.length) throw new Error('Onglet « Import HubSpot » vide.');
  return integrerEntreprises_(lignes.map(function (l) {
    return { id: String(l['Record ID']), nom: l['Company name'], parent: String(l['Parent company ID'] || ''),
      adresse: [l['Street address'], l['City']].filter(String).join(', '), tel: l['Phone number'], email: l['Email'] };
  }), 'Import HubSpot');
}

/**
 * Règle des groupes : une entreprise HubSpot qui a des filiales (ou qui est « mère ») devient un Groupe.
 * Chaque entité est rattachée au groupe de son entreprise mère ; une entreprise sans mère est son propre groupe.
 * NIF, STAT, email et contact saisis dans l'ERP ne sont jamais écrasés.
 */
function integrerEntreprises_(liste, source) {
  const parId = {};
  liste.forEach(function (c) { if (c.id) parId[c.id] = c; });
  const groupes = lire_(ONGLETS.GROUPES);
  const entites = lire_(ONGLETS.ENTITES);
  let crees = 0, majs = 0, nbGroupes = 0;

  function groupePour_(hsId, nom) {
    let g = groupes.filter(function (x) { return String(x['HubSpot ID']) === String(hsId); })[0];
    if (g) return g['ID Groupe'];
    const id = nouvelId_(ONGLETS.GROUPES, 'ID Groupe', 'G');
    ajouter_(ONGLETS.GROUPES, { 'ID Groupe': id, 'Nom du groupe': nom, 'HubSpot ID': hsId });
    groupes.push({ 'ID Groupe': id, 'HubSpot ID': hsId, 'Nom du groupe': nom });
    nbGroupes++;
    return id;
  }

  liste.forEach(function (c) {
    if (!c.id || !c.nom) return;
    const mere = c.parent && parId[c.parent] ? parId[c.parent] : c;
    const idGroupe = groupePour_(mere.id, mere.nom);
    const ex = entites.filter(function (e) { return String(e['HubSpot ID']) === String(c.id); })[0];
    if (ex) {
      const m = { 'Raison sociale': c.nom, 'ID Groupe': idGroupe, 'Mis à jour le': new Date() };
      if (!ex['Adresse'] && c.adresse) m['Adresse'] = c.adresse;
      if (!ex['Téléphone'] && c.tel) m['Téléphone'] = c.tel;
      if (!ex['Email'] && c.email) m['Email'] = c.email;
      maj_(ONGLETS.ENTITES, ex._row, m);
      majs++;
    } else {
      const id = nouvelId_(ONGLETS.ENTITES, 'ID Entité', 'E');
      ajouter_(ONGLETS.ENTITES, {
        'ID Entité': id, 'Raison sociale': c.nom, 'ID Groupe': idGroupe, 'Adresse': c.adresse || '',
        'Téléphone': c.tel || '', 'Email': c.email || '', 'HubSpot ID': c.id, 'Source': source, 'Mis à jour le': new Date()
      });
      entites.push({ 'ID Entité': id, 'HubSpot ID': c.id });
      crees++;
    }
  });
  journal_('Synchro entreprises', source + ' : ' + crees + ' créées, ' + majs + ' MAJ');
  return { crees: crees, majs: majs, groupes: nbGroupes };
}

/** Crée dans HubSpot une tâche de relance (e-mail à envoyer depuis HubSpot) pour chaque relance FMFP due. */
function creerRelancesHubSpot() {
  alerte_(creerRelancesHubSpotCore_() + ' tâche(s) de relance créée(s) dans HubSpot.');
}

function creerRelancesHubSpotCore_() {
  const auj = new Date();
  let n = 0;
  lire_(ONGLETS.FMFP).forEach(function (d) {
    if (!d['Prochaine relance'] || new Date(d['Prochaine relance']) > auj || d['Relance HubSpot créée'] === true) return;
    const ent = trouver_(ONGLETS.ENTITES, 'ID Entité', d['ID Entité']);
    if (!ent || !ent['HubSpot ID']) return;
    const tache = hs_('post', '/crm/v3/objects/tasks', { properties: {
      hs_timestamp: new Date().toISOString(),
      hs_task_subject: 'Relance FMFP — ' + d['Raison sociale'] + ' (' + d['ID Session'] + ')',
      hs_task_body: 'Étape actuelle : ' + d['Étape'] + '\nProforma : ' + d['N° Proforma'] +
        '\nFactures : 100 % ' + (d['N° Facture 100 %'] || '-') + ' / 70 % ' + (d['N° Facture 70 %'] || '-') + ' / 30 % ' + (d['N° Facture 30 %'] || '-'),
      hs_task_status: 'NOT_STARTED', hs_task_type: 'EMAIL'
    } });
    hs_('put', '/crm/v4/objects/tasks/' + tache.id + '/associations/default/companies/' + ent['HubSpot ID']);
    maj_(ONGLETS.FMFP, d._row, { 'Relance HubSpot créée': true });
    n++;
  });
  journal_('Relances HubSpot', n + ' tâche(s)');
  return n;
}

/* ===== Menu.gs ===== */
/** MDC ERP — Menu. */
function onOpen() {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu('MDC ERP')
    .addItem('Nouvelle proforma…', 'ouvrirNouvelleProforma')
    .addItem('Émettre la proforma sélectionnée', 'emettreProformaSelectionnee')
    .addSubMenu(ui.createMenu('Facturer la proforma sélectionnée')
      .addItem('Facture 100 % (dossier FMFP)', 'factureFmfp100')
      .addItem('Facture d\'acompte (70 %)', 'factureAcompte')
      .addItem('Facture de solde (reste)', 'factureSolde')
      .addItem('Facture totale (100 %, hors FMFP)', 'factureTotale'))
    .addItem('Enregistrer un paiement (facture sélectionnée)', 'enregistrerPaiement')
    .addItem('Régénérer le PDF (ligne sélectionnée)', 'regenererPdfSelection')
    .addItem('Annuler (ligne sélectionnée)', 'annulerSelection')
    .addSeparator()
    .addSubMenu(ui.createMenu('Formations')
      .addItem('Créer la session depuis la proforma sélectionnée', 'creerSessionDepuisProforma')
      .addItem('Contrôler les 6 phases', 'controlerPhases')
      .addItem('Calculer les attestations (≥ 80 %)', 'calculerAttestations'))
    .addSubMenu(ui.createMenu('HubSpot')
      .addItem('Configurer la clé', 'configurerCleHubSpot')
      .addItem('Synchroniser les entreprises (API)', 'synchroniserEntreprises')
      .addItem('Importer depuis l\'onglet « Import HubSpot »', 'importerDepuisOnglet')
      .addItem('Créer les relances FMFP dues', 'creerRelancesHubSpot'))
    .addSeparator()
    .addItem('Actualiser le tableau de bord', 'actualiserTableauDeBord')
    .addItem('Actualiser l\'onglet Exports', 'actualiserExports')
    .addItem('Initialiser / mettre à jour la structure', 'initialiserStructure')
    .addToUi();
}

function ouvrirNouvelleProforma() {
  const html = HtmlService.createHtmlOutputFromFile('NouvelleProforma').setWidth(980).setHeight(640);
  SpreadsheetApp.getUi().showModalDialog(html, 'Nouvelle proforma');
}

/* ===== WebApp.gs ===== */
/**
 * MDC ERP — Application web (interface). La Google Sheet sert uniquement de base de données.
 * Déploiement : Apps Script > Déployer > Nouveau déploiement > Application Web.
 */
function doGet() {
  return HtmlService.createHtmlOutputFromFile('Index')
    .setTitle('MDC ERP')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1');
}

const ONGLETS_WEB_ = ['GROUPES', 'ENTITES', 'CATALOGUE', 'FORMATEURS', 'PROFORMAS', 'FACTURES', 'LIGNES',
  'PAIEMENTS', 'SESSIONS', 'PARTICIPANTS', 'FMFP', 'EXPORTS', 'PARAMS'];

/** Onglets modifiables depuis l'interface, et colonnes protégées (calculées par l'ERP). */
const EDITABLES_ = {
  'Paramètres': { proteges: ['Clé', 'DOSSIER_EXPORT_ID'] },
  'Catalogue': { proteges: [] },
  'Formateurs': { proteges: ['ID Formateur'] },
  'Groupes': { proteges: ['ID Groupe', 'HubSpot ID'] },
  'Entités': { proteges: ['ID Entité', 'HubSpot ID', 'Source'] },
  'Sessions': { proteges: ['ID Session', 'ID Entité', 'N° Proforma', 'FMFP', 'Phase actuelle', 'Alerte'] },
  'Participants': { proteges: [] },
  'Proformas': { proteges: ['ID', 'N°', 'Statut', 'Date', 'ID Entité', 'Raison sociale', 'Total HT', 'TVA', 'Total TTC', 'ID Session', 'Lien PDF', 'Créée le'] }
};

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

/** Charge toute la base (volumes MDC : quelques centaines de lignes). */
function apiCharger() {
  const d = {};
  ONGLETS_WEB_.forEach(function (k) { d[k] = serialiser_(lire_(ONGLETS[k])); });
  d.PARAMS = d.PARAMS.filter(function (p) { return p['Clé'] !== 'DOSSIER_EXPORT_ID'; });
  d.constantes = {
    PHASES: PHASES, ETAPES_FMFP: ETAPES_FMFP, STATUT_PHASE: STATUT_PHASE, STATUT_PROFORMA: STATUT_PROFORMA,
    MODES_PAIEMENT: MODES_PAIEMENT, TVA: tauxTva_(), TVA_APPLICABLE: tvaApplicable_(),
    POURCENT_ACOMPTE: Number(param_('POURCENT_ACOMPTE', 70)), VALIDITE: Number(param_('VALIDITE_PROFORMA_JOURS', 30)),
    SOCIETE: param_('SOCIETE_NOM_COURT', 'MDC'), HUBSPOT: !!PropertiesService.getScriptProperties().getProperty('HUBSPOT_TOKEN'),
    DOSSIER_PDF: param_('DOSSIER_EXPORT_ID', '') ? 'https://drive.google.com/drive/folders/' + param_('DOSSIER_EXPORT_ID', '') : '',
    UTILISATEUR: Session.getActiveUser().getEmail(),
    AUJOURDHUI: Utilities.formatDate(new Date(), ss_().getSpreadsheetTimeZone(), 'yyyy-MM-dd')
  };
  return d;
}

function rep_(message, extra) {
  const r = { message: message, data: apiCharger() };
  Object.keys(extra || {}).forEach(function (k) { r[k] = extra[k]; });
  return r;
}

/* ---------- Documents ---------- */
function apiCreerProforma(data) { const r = creerProforma(data); return rep_(r.message, { id: r.id, url: r.url }); }
function apiEmettre(idProforma) { const r = emettreProforma_(idProforma); return rep_(r.message, { url: r.url }); }
function apiFacturer(idProforma, type) {
  if (!TYPES_FACTURE[type]) throw new Error('Type de facture inconnu.');
  const r = creerFactureDepuisProforma_(idProforma, type);
  return rep_(r.message, { url: r.url });
}
function apiStatutProforma(idProforma, statut) {
  if (['Acceptée', 'Refusée'].indexOf(statut) < 0) throw new Error('Statut non autorisé.');
  const p = trouver_(ONGLETS.PROFORMAS, 'ID', idProforma);
  if (!p || !p['N°']) throw new Error('Proforma non émise.');
  maj_(ONGLETS.PROFORMAS, p._row, { 'Statut': statut });
  journal_('Statut proforma', p['N°'] + ' → ' + statut);
  return rep_('Proforma ' + p['N°'] + ' : ' + statut + '.');
}
function apiAnnuler(type, id) {
  const onglet = type === 'PF' ? ONGLETS.PROFORMAS : ONGLETS.FACTURES;
  const o = trouver_(onglet, 'ID', id);
  if (!o) throw new Error('Document introuvable.');
  maj_(onglet, o._row, type === 'PF' ? { 'Statut': 'Annulée' } : { 'Statut': 'Annulée', 'Reste à payer': 0, 'Statut paiement': 'Annulée' });
  journal_('Annulation', o['N°'] || o['ID']);
  return rep_((o['N°'] || o['ID']) + ' annulé(e). Le numéro ne sera jamais réutilisé.');
}
function apiRegenererPdf(type, id) {
  const onglet = type === 'PF' ? ONGLETS.PROFORMAS : ONGLETS.FACTURES;
  const o = trouver_(onglet, 'ID', id);
  if (!o || !o['N°']) throw new Error('Document non émis.');
  if (type === 'DE') o._totalProformaHT = lignesDe_(id).reduce(function (a, l) { return a + Number(l['Montant HT'] || 0); }, 0);
  const url = genererPdf_(type, o);
  maj_(onglet, o._row, { 'Lien PDF': url });
  return rep_('PDF régénéré (même numéro).', { url: url });
}
function apiPaiement(numFacture, montant, mode, reference, date) {
  paiementCore_(numFacture, montant, mode, reference, date);
  return rep_('Paiement enregistré sur ' + numFacture + '.');
}

/* ---------- Formations ---------- */
function apiCreerSession(idProforma, fmfp) {
  const id = creerSessionCore_(idProforma, fmfp);
  return rep_('Session ' + id + ' créée' + (fmfp ? ' avec dossier FMFP.' : '.'), { id: id });
}
function apiControlerPhases() { controlerPhases(); return rep_('Contrôle des 6 phases effectué.'); }
function apiAttestations() { calculerAttestations(); controlerPhases(); return rep_('Attestations calculées (présence ≥ 80 %).'); }

function apiMajFmfp(ligne, champs) {
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
    m['Prochaine relance'] = new Date(m['Prochaine relance']);
  }
  maj_(ONGLETS.FMFP, d._row, m);
  journal_('FMFP', d['ID Session'] + ' : ' + (m['Étape'] || 'mise à jour'));
  return rep_('Dossier FMFP ' + d['ID Session'] + ' mis à jour.');
}

/* ---------- Édition générique ---------- */
function apiEnregistrer(nomOnglet, ligne, champs) {
  const regle = EDITABLES_[nomOnglet];
  if (!regle) throw new Error('Onglet non modifiable depuis l\'interface.');
  const s = sh_(nomOnglet);
  const h = entetes_(s);
  const m = {};
  Object.keys(champs).forEach(function (k) {
    if (h.indexOf(k) < 0 || regle.proteges.indexOf(k) >= 0) return;
    let v = champs[k];
    if (typeof v === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(v)) v = new Date(v + 'T00:00:00');
    m[k] = v;
  });
  if (nomOnglet === ONGLETS.PARAMS) {
    const p = lire_(nomOnglet).filter(function (x) { return x._row === Number(ligne); })[0];
    if (p && regle.proteges.indexOf(p['Clé']) >= 0) throw new Error('Paramètre protégé.');
  }
  if (nomOnglet === ONGLETS.PROFORMAS) {
    const p = lire_(nomOnglet).filter(function (x) { return x._row === Number(ligne); })[0];
    if (p && p['N°']) throw new Error('Proforma émise : non modifiable (annulez et recréez).');
  }
  if (ligne) {
    maj_(nomOnglet, Number(ligne), m);
  } else {
    const prefixes = { 'Entités': ['ID Entité', 'E'], 'Groupes': ['ID Groupe', 'G'], 'Formateurs': ['ID Formateur', 'T'] };
    if (prefixes[nomOnglet]) m[prefixes[nomOnglet][0]] = nouvelId_(nomOnglet, prefixes[nomOnglet][0], prefixes[nomOnglet][1]);
    if (nomOnglet === ONGLETS.ENTITES) { m['Source'] = 'Saisie ERP'; m['Mis à jour le'] = new Date(); }
    if (nomOnglet === ONGLETS.CATALOGUE && !m['Code']) throw new Error('Code obligatoire.');
    ajouter_(nomOnglet, m);
  }
  if (nomOnglet === ONGLETS.SESSIONS || nomOnglet === ONGLETS.PARTICIPANTS) controlerPhases();
  if (nomOnglet === ONGLETS.SESSIONS) actualiserExports();
  journal_('Modification', nomOnglet + (ligne ? ' ligne ' + ligne : ' (ajout)'));
  return rep_('Enregistré.');
}

function apiSupprimerParticipant(ligne) {
  const p = lire_(ONGLETS.PARTICIPANTS).filter(function (x) { return x._row === Number(ligne); })[0];
  if (!p) throw new Error('Participant introuvable.');
  sh_(ONGLETS.PARTICIPANTS).deleteRow(p._row);
  journal_('Participant supprimé', p['ID Session'] + ' : ' + p['Nom']);
  return rep_('Participant supprimé.');
}

/* ---------- HubSpot ---------- */
function apiCleHubSpot(jeton) {
  jeton = String(jeton || '').trim();
  if (!/^pat-/.test(jeton)) throw new Error('Le jeton doit commencer par « pat- ».');
  PropertiesService.getScriptProperties().setProperty('HUBSPOT_TOKEN', jeton);
  return rep_('Clé HubSpot enregistrée.');
}
function apiSyncHubSpot() {
  const n = synchroniserEntreprisesCore_();
  return rep_(n.crees + ' entité(s) créée(s), ' + n.majs + ' mise(s) à jour, ' + n.groupes + ' groupe(s).');
}
function apiImportHubSpot() {
  const n = importerDepuisOngletCore_();
  return rep_(n.crees + ' entité(s) créée(s), ' + n.majs + ' mise(s) à jour.');
}
function apiRelancesHubSpot() { return rep_(creerRelancesHubSpotCore_() + ' tâche(s) de relance créée(s) dans HubSpot.'); }
