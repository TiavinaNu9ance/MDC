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
  UTILISATEURS: 'Utilisateurs',
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
    'Lieu', 'Total HT', 'Taux TVA', 'TVA', 'Total TTC', 'Statut', 'ID Session', 'Lien PDF', 'Créée le'],
  'Factures': ['ID', 'N°', 'Date', 'Type', '%', 'N° Proforma', 'ID Entité', 'Raison sociale', 'Contact client',
    'Total HT', 'Taux TVA', 'TVA', 'Total TTC', 'Compte dans encaissements', 'Montant payé', 'Reste à payer',
    'Statut paiement', 'Date dernier paiement', 'Statut', 'Lien PDF', 'Créée le'],
  'Lignes': ['ID Document', 'Ordre', 'Code', 'Domaine', 'Désignation', 'Lieu', 'Durée', 'Quantité',
    'Prix unitaire HT', 'Montant HT'],
  'Paiements': ['Date', 'N° Facture', 'Montant', 'Mode', 'Référence', 'Saisi le'],
  'Sessions': ['ID Session', 'ID Entité', 'Raison sociale', 'Intitulé', 'Formateur(s)', 'ID Formateurs', 'Date début', 'Date fin',
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
  'Utilisateurs': ['Email', 'Nom', 'Rôle', 'Est formateur', 'ID Formateur', 'Actif', 'Dernière connexion', 'Créé le'],
  'Journal': ['Horodatage', 'Action', 'Détail', 'Utilisateur']
};

const ROLES = ['Formateur', 'Administrateur', 'Superadmin'];

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

/**
 * Paramètres : [clé, valeur par défaut, libellé, groupe, type, aide].
 * Types : text, textarea, number, percent (stocké 0.2 = 20 %), toggle (Oui/Non), color, image (ID Drive), readonly.
 */
const PARAMS_SCHEMA = [
  ['SOCIETE_NOM', 'MADAGASCAR DATA CAMP SARLU', 'Raison sociale', 'Société', 'text', ''],
  ['SOCIETE_NOM_COURT', 'Madagascar Data Camp', 'Nom commercial', 'Société', 'text', ''],
  ['SOCIETE_ADRESSE', 'Lot II L 4 DE Ankadivato, Antananarivo 101, Madagascar', 'Adresse', 'Société', 'textarea', ''],
  ['SOCIETE_EMAIL', 'contact@datacamp.business', 'E-mail', 'Société', 'text', ''],
  ['SOCIETE_TEL', '038 59 637 90', 'Téléphone', 'Société', 'text', ''],
  ['SOCIETE_NIF', '4012353768', 'NIF', 'Société', 'text', ''],
  ['SOCIETE_STAT', '70202 11 2022 0 11337', 'STAT', 'Société', 'text', ''],
  ['SOCIETE_RCS', '2022B01295', 'RCS', 'Société', 'text', ''],
  ['TVA_APPLICABLE', 'Oui', 'TVA activée par défaut', 'Facturation', 'toggle', 'Valeur proposée sur chaque nouvelle proforma (modifiable document par document).'],
  ['TAUX_TVA', 0.2, 'Taux de TVA', 'Facturation', 'percent', ''],
  ['DEVISE', 'Ar', 'Devise', 'Facturation', 'text', ''],
  ['POURCENT_ACOMPTE', 70, 'Acompte (%)', 'Facturation', 'number', 'Pourcentage de la facture d\'acompte.'],
  ['VALIDITE_PROFORMA_JOURS', 30, 'Validité des proformas (jours)', 'Facturation', 'number', ''],
  ['CONDITIONS_PAIEMENT', 'Au comptant — 70 % avant la date de la formation / 30 % après la date de fin de la formation', 'Conditions de paiement', 'Facturation', 'textarea', ''],
  ['RIB', 'Banque BMOI Tsaralalana Antananarivo 101 Madagascar — Compte N° 00004 00002 04813420101 10 — Titulaire : Madagascar Data Camp', 'Coordonnées bancaires', 'Facturation', 'textarea', ''],
  ['MVOLA', '038 59 637 90', 'Numéro MVola', 'Facturation', 'text', 'Affiché pour les clients sans NIF ni STAT (particuliers).'],
  ['MENTION_FISCALE_SUP', '', 'Mention fiscale (pied de page)', 'Facturation', 'text', 'Ex. n° d\'assujetti TVA.'],
  ['COMPTEUR_DEPART_DE_2026', 70, 'Départ compteur factures 2026', 'Numérotation', 'number', 'Utilisé seulement avant la première facture 2026 émise par l\'ERP.'],
  ['COMPTEUR_DEPART_PF_2026', 72, 'Départ compteur proformas 2026', 'Numérotation', 'number', 'Utilisé seulement avant la première proforma 2026 émise par l\'ERP.'],
  ['DELAI_RELANCE_FMFP_JOURS', 7, 'Délai de relance FMFP (jours)', 'Formation', 'number', ''],
  ['SEUIL_ATTESTATION', 80, 'Présence minimale pour l\'attestation (%)', 'Formation', 'number', ''],
  ['LOGO_FILE_ID', '', 'Logo (documents)', 'Apparence', 'image', 'PNG ou JPG.'],
  ['SIGNATURE_FILE_ID', '', 'Tampon et signature', 'Apparence', 'image', 'Optionnel, ajouté en bas des documents.'],
  ['COULEUR_PRINCIPALE', '#1B2B5E', 'Couleur principale (documents)', 'Apparence', 'color', ''],
  ['COULEUR_ACCENT', '#C89B2A', 'Couleur d\'accent (documents)', 'Apparence', 'color', ''],
  ['SESSION_DUREE_JOURS', 7, 'Durée de connexion (jours)', 'Sécurité', 'number', 'Au-delà, un nouveau code est demandé.'],
  ['EXPEDITEUR_NOM', 'MDC ERP', 'Nom d\'expéditeur des e-mails', 'Sécurité', 'text', ''],
  ['DOSSIER_EXPORT_ID', '', 'Dossier Drive des PDF', 'Système', 'readonly', 'Créé à l\'initialisation.']
];
const PARAMS_DEFAUT = PARAMS_SCHEMA.map(function (p) { return [p[0], p[1], p[2] + (p[5] ? ' — ' + p[5] : '')]; });

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
      'Utilisateur': (typeof UTILISATEUR_COURANT_ !== 'undefined' && UTILISATEUR_COURANT_) || Session.getActiveUser().getEmail()
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

  // Premier superadmin : le propriétaire du script.
  if (lire_(ONGLETS.UTILISATEURS).length === 0) {
    const proprio = Session.getEffectiveUser().getEmail();
    if (proprio) ajouter_(ONGLETS.UTILISATEURS, { 'Email': proprio.toLowerCase(), 'Nom': proprio.split('@')[0], 'Rôle': 'Superadmin',
      'Est formateur': 'Non', 'Actif': 'Oui', 'Créé le': new Date() });
  }
  appliquerValidations_();
  formats_();
  const def = ss.getSheetByName('Feuille 1') || ss.getSheetByName('Sheet1');
  if (def && def.getLastRow() === 0 && ss.getSheets().length > 1) ss.deleteSheet(def);
  journal_('Initialisation', 'Structure créée / mise à jour');
  alerte_('Structure MDC ERP prête. Superadmin : ' + Session.getEffectiveUser().getEmail() + '. Déployez ensuite l\'application web.');
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
  colRange_(ONGLETS.UTILISATEURS, 'Rôle').setDataValidation(liste_(ROLES));
  colRange_(ONGLETS.UTILISATEURS, 'Est formateur').setDataValidation(liste_(['Oui', 'Non']));
  colRange_(ONGLETS.UTILISATEURS, 'Actif').setDataValidation(liste_(['Oui', 'Non']));
  colRange_(ONGLETS.PARTICIPANTS, 'Attestation').clearDataValidations();
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
  const taux = tauxSaisi_(data);
  const totalHT = ecrireLignes_(id, data.lignes, data.lieu);
  const t = totaux_(totalHT, taux);
  ajouter_(ONGLETS.PROFORMAS, {
    'ID': id, 'N°': '', 'Date': data.date ? new Date(data.date) : new Date(),
    'Validité (jours)': data.validite || param_('VALIDITE_PROFORMA_JOURS', 30),
    'ID Entité': ent['ID Entité'], 'Raison sociale': ent['Raison sociale'],
    'Contact client': data.contact || ent['Contact principal'] || '', 'Objet': data.objet || '', 'Lieu': data.lieu || '',
    'Total HT': t.ht, 'Taux TVA': taux, 'TVA': t.tva, 'Total TTC': t.ttc, 'Statut': 'Brouillon', 'Créée le': new Date()
  });
  journal_('Proforma créée', id + ' — ' + ent['Raison sociale']);
  if (data.emettre) return emettreProforma_(id);
  return { id: id, message: 'Proforma ' + id + ' créée en brouillon.' };
}

/** TVA choisie sur le document : data.avecTva (bool) et data.tauxTva (0.2 = 20 %). */
function tauxSaisi_(data) {
  if (data.avecTva === false) return 0;
  if (data.tauxTva !== undefined && data.tauxTva !== '' && data.tauxTva !== null) return Number(data.tauxTva) || 0;
  return tauxTva_();
}

/** Modifie une proforma en brouillon (en-tête + lignes). */
function majBrouillon_(id, data) {
  const p = trouver_(ONGLETS.PROFORMAS, 'ID', id);
  if (!p) throw new Error('Proforma introuvable.');
  if (p['Statut'] !== 'Brouillon' || p['N°']) throw new Error('Seul un brouillon peut être modifié.');
  if (!data.lignes || !data.lignes.length) throw new Error('Ajoutez au moins une ligne.');
  const ent = trouver_(ONGLETS.ENTITES, 'ID Entité', data.idEntite);
  if (!ent) throw new Error('Entité introuvable.');
  supprimerLignes_(id);
  const taux = tauxSaisi_(data);
  const t = totaux_(ecrireLignes_(id, data.lignes, data.lieu), taux);
  maj_(ONGLETS.PROFORMAS, p._row, {
    'Date': data.date ? new Date(data.date) : p['Date'], 'Validité (jours)': data.validite || p['Validité (jours)'],
    'ID Entité': ent['ID Entité'], 'Raison sociale': ent['Raison sociale'], 'Contact client': data.contact || '',
    'Objet': data.objet || '', 'Lieu': data.lieu || '', 'Total HT': t.ht, 'Taux TVA': taux, 'TVA': t.tva, 'Total TTC': t.ttc
  });
  journal_('Brouillon modifié', id);
  if (data.emettre) return emettreProforma_(id);
  return { id: id, message: 'Brouillon ' + id + ' enregistré.' };
}

function supprimerLignes_(idDoc) {
  const s = sh_(ONGLETS.LIGNES);
  lire_(ONGLETS.LIGNES).filter(function (l) { return l['ID Document'] === idDoc; })
    .map(function (l) { return l._row; }).sort(function (a, b) { return b - a; })
    .forEach(function (r) { s.deleteRow(r); });
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

function tauxDoc_(doc) {
  const t = doc ? doc['Taux TVA'] : '';
  return t === '' || t === undefined || t === null ? tauxTva_() : Number(t) || 0;
}

function totaux_(ht, tauxForce) {
  const taux = tauxForce === undefined ? tauxTva_() : Number(tauxForce) || 0;
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
  const taux = tauxDoc_(p);
  const t = totaux_(ht, taux);
  const numero = prochainNumero_('PF', p['Date']);
  maj_(ONGLETS.PROFORMAS, p._row, { 'N°': numero, 'Statut': 'Émise', 'Total HT': t.ht, 'Taux TVA': taux, 'TVA': t.tva, 'Total TTC': t.ttc });
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
  const taux = tauxDoc_(p);
  const t = totaux_(htTotal * pct / 100, taux);
  const date = new Date();
  const numero = prochainNumero_('DE', date);
  const row = ajouter_(ONGLETS.FACTURES, {
    'ID': id, 'N°': numero, 'Date': date, 'Type': libelle, '%': pct, 'N° Proforma': p['N°'],
    'ID Entité': p['ID Entité'], 'Raison sociale': p['Raison sociale'], 'Contact client': p['Contact client'],
    'Total HT': t.ht, 'Taux TVA': taux, 'TVA': t.tva, 'Total TTC': t.ttc,
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

/* ===== Gabarit.gs ===== */
/**
 * MDC ERP — Gabarit des proformas et factures.
 * Utilisé à l'identique par le serveur (PDF) et par l'interface (aperçu en direct) :
 * le code source de ces deux fonctions est injecté dans la page web.
 * Ces fonctions ne doivent dépendre de rien d'autre.
 */
function gabaritDocument(c) {
  function e(t) {
    return String(t === undefined || t === null ? '' : t)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
  function m(n) { return Math.round(Number(n) || 0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' '); }
  const s = c.societe || {}, cl = c.client || {}, dev = c.devise || 'Ar';
  const sfx = c.avecTva ? ' HT' : '';
  const lignes = (c.lignes || []).map(function (l) {
    return '<tr><td>' + e(l.domaine) + '</td><td>' + e(l.designation) +
      (l.lieu ? '<br><span class="lieu">Lieu : ' + e(l.lieu) + '</span>' : '') + '</td>' +
      '<td class="c">' + (l.duree ? e(l.duree) + ' h' : '') + '</td><td class="c">' + e(l.quantite) + '</td>' +
      '<td class="r">' + m(l.pu) + '</td><td class="r">' + m(l.montant) + '</td></tr>';
  }).join('') || '<tr><td colspan="6" class="vide">Aucune ligne</td></tr>';
  let tot = '<tr><td>Sous-total' + sfx + '</td><td class="r">' + m(c.htLignes) + ' ' + dev + '</td></tr>';
  if (c.pct && c.pct !== 100) tot += '<tr><td>' + e(c.typeLibelle) + (c.refProforma ? ' (sur proforma ' + e(c.refProforma) + ')' : '') + '</td><td class="r">' + m(c.ht) + ' ' + dev + '</td></tr>';
  if (c.avecTva) tot += '<tr><td>TVA ' + (Math.round(c.taux * 1000) / 10) + ' %</td><td class="r">' + m(c.tva) + ' ' + dev + '</td></tr>';
  tot += '<tr class="tot"><td>Total' + (c.avecTva ? ' TTC' : '') + ' à payer</td><td class="r">' + m(c.ttc) + ' ' + dev + '</td></tr>';
  const c1 = c.c1 || '#1B2B5E', c2 = c.c2 || '#C89B2A';
  return '<!DOCTYPE html><html><head><meta charset="utf-8"><style>' +
    'body{font-family:Arial,Helvetica,sans-serif;font-size:10.5px;color:#222;margin:28px;background:#fff}' +
    'h1{color:' + c1 + ';font-size:24px;margin:0 0 6px}' +
    '.box{border:1px solid #ddd;padding:8px 10px;margin-top:10px}' +
    'table{width:100%;border-collapse:collapse;margin-top:14px}' +
    'th{background:' + c2 + ';color:#fff;padding:6px;font-size:10px;text-align:left}' +
    'td{font-size:10.5px;padding:6px;border-bottom:1px solid #eee;vertical-align:top}' +
    '.c{text-align:center}.r{text-align:right;white-space:nowrap}.lieu{color:#666;font-size:9.5px}.vide{color:#999;text-align:center;padding:18px}' +
    '.totaux{width:48%;margin-left:auto}.tot td{font-weight:bold;background:#F8F6F1;border-top:2px solid ' + c1 + '}' +
    '.notes{margin-top:16px;font-size:10px;line-height:1.5}' +
    '.foot{margin-top:24px;border-top:1px solid ' + c1 + ';padding-top:6px;font-size:9px;color:#555;text-align:center}' +
    '.filigrane{position:fixed;top:40%;left:0;right:0;text-align:center;font-size:90px;color:rgba(0,0,0,.05);transform:rotate(-25deg);font-weight:bold}' +
    '</style></head><body>' + (c.brouillon ? '<div class="filigrane">APERÇU</div>' : '') +
    '<table style="margin:0"><tr><td style="border:0;width:55%">' +
    (c.logo ? '<img src="' + c.logo + '" style="height:60px"><br>' : '<b style="font-size:16px;color:' + c1 + '">' + e(s.nom) + '</b><br>') +
    e(s.adresse) + '<br>' + e(s.email) + ' — ' + e(s.tel) +
    '</td><td style="border:0;text-align:right"><h1>' + e(c.titre) + '</h1>' +
    '<b>N° :</b> ' + (c.numero ? e(c.numero) : '<i style="color:#999">attribué à l\'émission</i>') + '<br><b>Date :</b> ' + e(c.date) +
    (c.validite ? '<br><b>Validité :</b> ' + e(c.validite) : '') + (c.refProforma && c.titre !== 'Facture Proforma' ? '<br><b>Réf. proforma :</b> ' + e(c.refProforma) : '') +
    '<br><b>Contact client :</b> ' + e(c.contact) + '</td></tr></table>' +
    '<div class="box"><b>Client</b><br><b>' + e(cl.nom) + '</b>' + (cl.adresse ? '<br>' + e(cl.adresse) : '') +
    (cl.email ? '<br>' + e(cl.email) : '') + (cl.tel ? ' — ' + e(cl.tel) : '') +
    (cl.nif ? '<br>NIF : ' + e(cl.nif) : '') + (cl.stat ? ' — STAT : ' + e(cl.stat) : '') + '</div>' +
    (c.objet ? '<p><b>Objet :</b> ' + e(c.objet) + '</p>' : '') +
    '<table><tr><th>Domaine</th><th>Formation / Prestation</th><th class="c">Durée</th><th class="c">Qté</th><th class="r">Prix unitaire' + sfx + '</th><th class="r">Montant' + sfx + '</th></tr>' +
    lignes + '</table><table class="totaux">' + tot + '</table>' +
    '<div class="notes"><b>Arrêté' + (c.titre === 'Facture Proforma' ? 'e la présente facture proforma' : 'e la présente facture') + ' à la somme de :</b> ' +
    e(enLettres(c.ttc)) + ' Ariary' + (c.avecTva ? ' TTC' : '') + '.<br>' +
    (c.conditions ? '<b>Conditions de paiement :</b> ' + e(c.conditions) + '<br>' : '') +
    (c.rib ? '<b>Paiement par virement bancaire :</b> ' + e(c.rib) : '') +
    (c.particulier && c.mvola ? '<br><b>MVola :</b> ' + e(c.mvola) : '') + '</div>' +
    (c.signature ? '<div style="text-align:right;margin-top:12px"><img src="' + c.signature + '" style="height:90px"></div>' : '') +
    '<div class="foot">' + e(s.nom) + ' — NIF : ' + e(s.nif) + ' — STAT : ' + e(s.stat) + ' — RCS : ' + e(s.rcs) +
    (s.mention ? ' — ' + e(s.mention) : '') + '</div></body></html>';
}

/** Montant en toutes lettres (français). */
function enLettres(n) {
  n = Math.round(Math.abs(Number(n) || 0));
  if (n === 0) return 'zéro';
  const U = ['', 'un', 'deux', 'trois', 'quatre', 'cinq', 'six', 'sept', 'huit', 'neuf', 'dix', 'onze', 'douze',
    'treize', 'quatorze', 'quinze', 'seize', 'dix-sept', 'dix-huit', 'dix-neuf'];
  const D = ['', '', 'vingt', 'trente', 'quarante', 'cinquante', 'soixante', 'soixante', 'quatre-vingt', 'quatre-vingt'];
  function cent(x) {
    if (x < 20) return U[x];
    const d = Math.floor(x / 10), u = x % 10;
    if (d === 7 || d === 9) return D[d] + (d === 7 && u === 1 ? ' et ' : '-') + U[10 + u];
    if (u === 0) return D[d] + (d === 8 ? 's' : '');
    if (u === 1 && d !== 8) return D[d] + ' et un';
    return D[d] + '-' + U[u];
  }
  function mille(x, fin) {
    const c = Math.floor(x / 100), r = x % 100;
    let s = '';
    if (c > 0) s = (c > 1 ? U[c] + ' ' : '') + 'cent' + (c > 1 && r === 0 && fin ? 's' : '');
    if (r > 0) s += (s ? ' ' : '') + cent(r);
    return s;
  }
  let s = '', reste = n;
  [[1e9, 'milliard'], [1e6, 'million'], [1e3, 'mille']].forEach(function (k) {
    const q = Math.floor(reste / k[0]);
    reste = reste % k[0];
    if (!q) return;
    if (k[1] === 'mille') s += (q === 1 ? '' : mille(q, false) + ' ') + 'mille ';
    else s += mille(q, true) + ' ' + k[1] + (q > 1 ? 's' : '') + ' ';
  });
  if (reste > 0) s += mille(reste, true);
  return s.trim().replace(/quatre-vingts (mille)/g, 'quatre-vingt $1');
}

/** Source injectée dans la page web (aperçu identique au PDF). */
function sourceGabarit_() {
  return gabaritDocument.toString() + '\n' + enLettres.toString();
}

function enLettres_(n) { return enLettres(n); }

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

/** Partie fixe du contexte des documents (société, apparence, mentions). */
function contexteSociete_(avecImages) {
  const P = function (k, d) { return param_(k, d === undefined ? '' : d); };
  return {
    societe: { nom: P('SOCIETE_NOM'), adresse: P('SOCIETE_ADRESSE'), email: P('SOCIETE_EMAIL'), tel: P('SOCIETE_TEL'),
      nif: P('SOCIETE_NIF'), stat: P('SOCIETE_STAT'), rcs: P('SOCIETE_RCS'), mention: P('MENTION_FISCALE_SUP') },
    conditions: P('CONDITIONS_PAIEMENT'), rib: P('RIB'), mvola: P('MVOLA'), devise: P('DEVISE', 'Ar'),
    c1: P('COULEUR_PRINCIPALE', '#1B2B5E'), c2: P('COULEUR_ACCENT', '#C89B2A'),
    logo: avecImages === false ? '' : imageDataUri_(P('LOGO_FILE_ID')),
    signature: avecImages === false ? '' : imageDataUri_(P('SIGNATURE_FILE_ID'))
  };
}

/** Contexte complet d'un document enregistré (PF ou DE). */
function contexteDocument_(type, doc) {
  const c = contexteSociete_();
  const ent = trouver_(ONGLETS.ENTITES, 'ID Entité', doc['ID Entité']) || {};
  const estPF = type === 'PF';
  const lignes = lignesDe_(doc['ID']).map(function (l) {
    return { domaine: l['Domaine'], designation: l['Désignation'], lieu: l['Lieu'], duree: l['Durée'],
      quantite: l['Quantité'], pu: l['Prix unitaire HT'], montant: l['Montant HT'] };
  });
  const taux = tauxDoc_(doc);
  const validite = estPF ? new Date(new Date(doc['Date']).getTime() + Number(doc['Validité (jours)'] || 30) * 86400000) : null;
  c.titre = estPF ? 'Facture Proforma' : 'Facture';
  c.numero = doc['N°']; c.date = fmtDate_(doc['Date']); c.validite = validite ? fmtDate_(validite) : '';
  c.refProforma = estPF ? '' : doc['N° Proforma']; c.contact = doc['Contact client']; c.objet = estPF ? doc['Objet'] : (trouver_(ONGLETS.PROFORMAS, 'N°', doc['N° Proforma']) || {})['Objet'];
  c.typeLibelle = estPF ? '' : doc['Type']; c.pct = estPF ? 100 : Number(doc['%']) || 100;
  c.client = { nom: ent['Raison sociale'] || doc['Raison sociale'], adresse: ent['Adresse'], email: ent['Email'], tel: ent['Téléphone'], nif: ent['NIF'], stat: ent['STAT'] };
  c.particulier = !ent['NIF'] && !ent['STAT'];
  c.lignes = lignes;
  c.htLignes = lignes.reduce(function (s, l) { return s + Number(l.montant || 0); }, 0);
  c.ht = doc['Total HT']; c.tva = doc['TVA']; c.ttc = doc['Total TTC']; c.taux = taux; c.avecTva = taux > 0;
  return c;
}

function htmlDocument_(type, doc) { return gabaritDocument(contexteDocument_(type, doc)); }

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
  const seuil = Number(param_('SEUIL_ATTESTATION', 80));
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
      if (p['Attestation'] === 'Oui' && pres && pres < seuil) alertes.push(p['Nom'] + ' : attestation avec présence < ' + seuil + ' %');
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
    const seuil = Number(param_('SEUIL_ATTESTATION', 80));
    maj_(ONGLETS.PARTICIPANTS, p._row, { 'Attestation': pres >= seuil ? 'Oui' : 'Non (présence < ' + seuil + ' %)' });
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

/* ===== Auth.gs ===== */
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

/* ===== WebApp.gs ===== */
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

/* ===== Menu.gs ===== */
/** MDC ERP — Menu de la feuille (maintenance). L'utilisation se fait dans l'application web. */
function onOpen() {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu('MDC ERP')
    .addItem('Ouvrir l\'application', 'ouvrirApplication')
    .addSeparator()
    .addItem('Recalculer paiements, phases et exports', 'actualiserTableauDeBord')
    .addItem('Initialiser / mettre à jour la structure', 'initialiserStructure')
    .addToUi();
}

function ouvrirApplication() {
  const url = ScriptApp.getService().getUrl();
  if (!url) return alerte_('Déployez d\'abord l\'application web (Déployer > Nouveau déploiement > Application Web).');
  const html = HtmlService.createHtmlOutput('<p style="font-family:Arial">Ouvrir : <a href="' + url + '" target="_blank">' + url + '</a></p>').setWidth(520).setHeight(90);
  SpreadsheetApp.getUi().showModalDialog(html, 'MDC ERP');
}
