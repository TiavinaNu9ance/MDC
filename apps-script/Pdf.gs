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
  return dossier.createFile(blob).getUrl();
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
  const taux = Number(P('TAUX_TVA', 0)) || 0;
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

  let totaux = '<tr><td>Sous-total HT</td><td class="r">' + fmtMontant_(htLignes) + ' ' + devise + '</td></tr>';
  if (!estPF && pct !== 100) {
    totaux += '<tr><td>' + echapper_(doc['Type']) + ' (sur proforma ' + echapper_(doc['N° Proforma']) + ')</td><td class="r">' + fmtMontant_(doc['Total HT']) + ' ' + devise + '</td></tr>';
  }
  totaux += '<tr><td>TVA ' + Math.round(taux * 100) + ' %</td><td class="r">' + fmtMontant_(doc['TVA']) + ' ' + devise + '</td></tr>' +
    '<tr class="tot"><td>Total TTC à payer</td><td class="r">' + fmtMontant_(doc['Total TTC']) + ' ' + devise + '</td></tr>';

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
    '<table><tr><th>Domaine</th><th>Formation / Prestation</th><th class="c">Durée</th><th class="c">Qté</th><th class="r">Prix unitaire HT</th><th class="r">Montant HT</th></tr>' +
    lignesHtml + '</table>' +
    '<table class="totaux">' + totaux + '</table>' +
    '<div class="notes"><b>Arrêté' + (estPF ? 'e la présente facture proforma' : 'e la présente facture') + ' à la somme de :</b> ' +
    enLettres_(doc['Total TTC']) + ' Ariary TTC.<br>' +
    '<b>Conditions de paiement :</b> ' + echapper_(P('CONDITIONS_PAIEMENT')) + '<br>' +
    '<b>Paiement par virement bancaire :</b> ' + echapper_(P('RIB')) +
    (particulier ? '<br><b>MVola :</b> ' + echapper_(P('MVOLA')) : '') + '</div>' +
    (signature ? '<div style="text-align:right;margin-top:12px"><img src="' + signature + '" style="height:90px"></div>' : '') +
    '<div class="foot">' + echapper_(P('SOCIETE_NOM')) + ' — NIF : ' + echapper_(P('SOCIETE_NIF')) + ' — STAT : ' + echapper_(P('SOCIETE_STAT')) +
    ' — RCS : ' + echapper_(P('SOCIETE_RCS')) + (P('MENTION_FISCALE_SUP') ? ' — ' + echapper_(P('MENTION_FISCALE_SUP')) : '') + '</div>' +
    '</body></html>';
}
