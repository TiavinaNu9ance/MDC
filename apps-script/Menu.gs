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
