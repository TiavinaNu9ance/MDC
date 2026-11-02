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
