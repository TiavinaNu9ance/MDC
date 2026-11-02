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
