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
