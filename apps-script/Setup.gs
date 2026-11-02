/** MDC ERP — Initialisation : crée ou complète tous les onglets. Peut être relancé sans perte de données. */
function initialiserStructure() {
  const ss = ss_();
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
  ui_().alert('Structure MDC ERP prête. Vérifiez l\'onglet Paramètres (TVA, compteurs de départ, logo).');
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
