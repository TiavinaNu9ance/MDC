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
  const totalHT = ecrireLignes_(id, data.lignes, data.lieu);
  const t = totaux_(totalHT);
  ajouter_(ONGLETS.PROFORMAS, {
    'ID': id, 'N°': '', 'Date': data.date ? new Date(data.date) : new Date(),
    'Validité (jours)': data.validite || param_('VALIDITE_PROFORMA_JOURS', 30),
    'ID Entité': ent['ID Entité'], 'Raison sociale': ent['Raison sociale'],
    'Contact client': data.contact || ent['Contact principal'] || '', 'Objet': data.objet || '', 'Lieu': data.lieu || '',
    'Total HT': t.ht, 'TVA': t.tva, 'Total TTC': t.ttc, 'Statut': 'Brouillon', 'Créée le': new Date()
  });
  journal_('Proforma créée', id + ' — ' + ent['Raison sociale']);
  if (data.emettre) return emettreProforma_(id);
  return { id: id, message: 'Proforma ' + id + ' créée en brouillon.' };
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

function totaux_(ht) {
  const taux = tauxTva_();
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
  const t = totaux_(ht);
  const numero = prochainNumero_('PF', p['Date']);
  maj_(ONGLETS.PROFORMAS, p._row, { 'N°': numero, 'Statut': 'Émise', 'Total HT': t.ht, 'TVA': t.tva, 'Total TTC': t.ttc });
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
  const t = totaux_(htTotal * pct / 100);
  const date = new Date();
  const numero = prochainNumero_('DE', date);
  const row = ajouter_(ONGLETS.FACTURES, {
    'ID': id, 'N°': numero, 'Date': date, 'Type': libelle, '%': pct, 'N° Proforma': p['N°'],
    'ID Entité': p['ID Entité'], 'Raison sociale': p['Raison sociale'], 'Contact client': p['Contact client'],
    'Total HT': t.ht, 'TVA': t.tva, 'Total TTC': t.ttc,
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
  ajouter_(ONGLETS.PAIEMENTS, {
    'Date': new Date(), 'N° Facture': f['N°'], 'Montant': montant,
    'Mode': (parts[0] || '').trim(), 'Référence': (parts[1] || '').trim(), 'Saisi le': new Date()
  });
  recalculerPaiements();
  journal_('Paiement', f['N°'] + ' : ' + montant);
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
