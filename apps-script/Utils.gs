/** MDC ERP — Fonctions utilitaires (lecture/écriture des onglets). */
function ss_() { return SpreadsheetApp.getActive(); }

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
function param_(cle, defaut) {
  const p = trouver_(ONGLETS.PARAMS, 'Clé', cle);
  return p && p['Valeur'] !== '' ? p['Valeur'] : defaut;
}

function setParam_(cle, valeur) {
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
