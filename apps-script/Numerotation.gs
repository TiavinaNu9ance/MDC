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
