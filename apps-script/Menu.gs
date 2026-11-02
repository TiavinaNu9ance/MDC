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
