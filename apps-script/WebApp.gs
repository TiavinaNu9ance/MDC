/**
 * MDC ERP — Application web (interface). La Google Sheet sert uniquement de base de données.
 * Déploiement : Apps Script > Déployer > Nouveau déploiement > Application Web.
 */
function doGet() {
  return HtmlService.createHtmlOutputFromFile('Index')
    .setTitle('MDC ERP')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1');
}

const ONGLETS_WEB_ = ['GROUPES', 'ENTITES', 'CATALOGUE', 'FORMATEURS', 'PROFORMAS', 'FACTURES', 'LIGNES',
  'PAIEMENTS', 'SESSIONS', 'PARTICIPANTS', 'FMFP', 'EXPORTS', 'PARAMS'];

/** Onglets modifiables depuis l'interface, et colonnes protégées (calculées par l'ERP). */
const EDITABLES_ = {
  'Paramètres': { proteges: ['Clé', 'DOSSIER_EXPORT_ID'] },
  'Catalogue': { proteges: [] },
  'Formateurs': { proteges: ['ID Formateur'] },
  'Groupes': { proteges: ['ID Groupe', 'HubSpot ID'] },
  'Entités': { proteges: ['ID Entité', 'HubSpot ID', 'Source'] },
  'Sessions': { proteges: ['ID Session', 'ID Entité', 'N° Proforma', 'FMFP', 'Phase actuelle', 'Alerte'] },
  'Participants': { proteges: [] },
  'Proformas': { proteges: ['ID', 'N°', 'Statut', 'Date', 'ID Entité', 'Raison sociale', 'Total HT', 'TVA', 'Total TTC', 'ID Session', 'Lien PDF', 'Créée le'] }
};

function serialiser_(rows) {
  const tz = ss_().getSpreadsheetTimeZone();
  return rows.map(function (o) {
    const r = {};
    Object.keys(o).forEach(function (k) {
      const v = o[k];
      r[k] = v instanceof Date ? Utilities.formatDate(v, tz, 'yyyy-MM-dd') : v;
    });
    return r;
  });
}

/** Charge toute la base (volumes MDC : quelques centaines de lignes). */
function apiCharger() {
  const d = {};
  ONGLETS_WEB_.forEach(function (k) { d[k] = serialiser_(lire_(ONGLETS[k])); });
  d.PARAMS = d.PARAMS.filter(function (p) { return p['Clé'] !== 'DOSSIER_EXPORT_ID'; });
  d.constantes = {
    PHASES: PHASES, ETAPES_FMFP: ETAPES_FMFP, STATUT_PHASE: STATUT_PHASE, STATUT_PROFORMA: STATUT_PROFORMA,
    MODES_PAIEMENT: MODES_PAIEMENT, TVA: tauxTva_(), TVA_APPLICABLE: tvaApplicable_(),
    POURCENT_ACOMPTE: Number(param_('POURCENT_ACOMPTE', 70)), VALIDITE: Number(param_('VALIDITE_PROFORMA_JOURS', 30)),
    SOCIETE: param_('SOCIETE_NOM_COURT', 'MDC'), HUBSPOT: !!PropertiesService.getScriptProperties().getProperty('HUBSPOT_TOKEN'),
    DOSSIER_PDF: param_('DOSSIER_EXPORT_ID', '') ? 'https://drive.google.com/drive/folders/' + param_('DOSSIER_EXPORT_ID', '') : '',
    UTILISATEUR: Session.getActiveUser().getEmail(),
    AUJOURDHUI: Utilities.formatDate(new Date(), ss_().getSpreadsheetTimeZone(), 'yyyy-MM-dd')
  };
  return d;
}

function rep_(message, extra) {
  const r = { message: message, data: apiCharger() };
  Object.keys(extra || {}).forEach(function (k) { r[k] = extra[k]; });
  return r;
}

/* ---------- Documents ---------- */
function apiCreerProforma(data) { const r = creerProforma(data); return rep_(r.message, { id: r.id, url: r.url }); }
function apiEmettre(idProforma) { const r = emettreProforma_(idProforma); return rep_(r.message, { url: r.url }); }
function apiFacturer(idProforma, type) {
  if (!TYPES_FACTURE[type]) throw new Error('Type de facture inconnu.');
  const r = creerFactureDepuisProforma_(idProforma, type);
  return rep_(r.message, { url: r.url });
}
function apiStatutProforma(idProforma, statut) {
  if (['Acceptée', 'Refusée'].indexOf(statut) < 0) throw new Error('Statut non autorisé.');
  const p = trouver_(ONGLETS.PROFORMAS, 'ID', idProforma);
  if (!p || !p['N°']) throw new Error('Proforma non émise.');
  maj_(ONGLETS.PROFORMAS, p._row, { 'Statut': statut });
  journal_('Statut proforma', p['N°'] + ' → ' + statut);
  return rep_('Proforma ' + p['N°'] + ' : ' + statut + '.');
}
function apiAnnuler(type, id) {
  const onglet = type === 'PF' ? ONGLETS.PROFORMAS : ONGLETS.FACTURES;
  const o = trouver_(onglet, 'ID', id);
  if (!o) throw new Error('Document introuvable.');
  maj_(onglet, o._row, type === 'PF' ? { 'Statut': 'Annulée' } : { 'Statut': 'Annulée', 'Reste à payer': 0, 'Statut paiement': 'Annulée' });
  journal_('Annulation', o['N°'] || o['ID']);
  return rep_((o['N°'] || o['ID']) + ' annulé(e). Le numéro ne sera jamais réutilisé.');
}
function apiRegenererPdf(type, id) {
  const onglet = type === 'PF' ? ONGLETS.PROFORMAS : ONGLETS.FACTURES;
  const o = trouver_(onglet, 'ID', id);
  if (!o || !o['N°']) throw new Error('Document non émis.');
  if (type === 'DE') o._totalProformaHT = lignesDe_(id).reduce(function (a, l) { return a + Number(l['Montant HT'] || 0); }, 0);
  const url = genererPdf_(type, o);
  maj_(onglet, o._row, { 'Lien PDF': url });
  return rep_('PDF régénéré (même numéro).', { url: url });
}
function apiPaiement(numFacture, montant, mode, reference, date) {
  paiementCore_(numFacture, montant, mode, reference, date);
  return rep_('Paiement enregistré sur ' + numFacture + '.');
}

/* ---------- Formations ---------- */
function apiCreerSession(idProforma, fmfp) {
  const id = creerSessionCore_(idProforma, fmfp);
  return rep_('Session ' + id + ' créée' + (fmfp ? ' avec dossier FMFP.' : '.'), { id: id });
}
function apiControlerPhases() { controlerPhases(); return rep_('Contrôle des 6 phases effectué.'); }
function apiAttestations() { calculerAttestations(); controlerPhases(); return rep_('Attestations calculées (présence ≥ 80 %).'); }

function apiMajFmfp(ligne, champs) {
  const d = lire_(ONGLETS.FMFP).filter(function (x) { return x._row === Number(ligne); })[0];
  if (!d) throw new Error('Dossier FMFP introuvable.');
  const autorises = ['Étape', 'CV formateurs envoyés', 'Rapports envoyés', 'Fiches de présence envoyées', 'Commentaire', 'Prochaine relance'];
  const m = {};
  Object.keys(champs).forEach(function (k) { if (autorises.indexOf(k) >= 0) m[k] = champs[k]; });
  if (m['Étape'] && m['Étape'] !== d['Étape']) {
    if (ETAPES_FMFP.indexOf(m['Étape']) < 0) throw new Error('Étape inconnue.');
    const now = new Date();
    m['Date étape'] = now;
    m['Prochaine relance'] = /Clôturé/.test(m['Étape']) ? '' : new Date(now.getTime() + Number(param_('DELAI_RELANCE_FMFP_JOURS', 7)) * 86400000);
    m['Relance HubSpot créée'] = false;
  } else if (m['Prochaine relance']) {
    m['Prochaine relance'] = new Date(m['Prochaine relance']);
  }
  maj_(ONGLETS.FMFP, d._row, m);
  journal_('FMFP', d['ID Session'] + ' : ' + (m['Étape'] || 'mise à jour'));
  return rep_('Dossier FMFP ' + d['ID Session'] + ' mis à jour.');
}

/* ---------- Édition générique ---------- */
function apiEnregistrer(nomOnglet, ligne, champs) {
  const regle = EDITABLES_[nomOnglet];
  if (!regle) throw new Error('Onglet non modifiable depuis l\'interface.');
  const s = sh_(nomOnglet);
  const h = entetes_(s);
  const m = {};
  Object.keys(champs).forEach(function (k) {
    if (h.indexOf(k) < 0 || regle.proteges.indexOf(k) >= 0) return;
    let v = champs[k];
    if (typeof v === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(v)) v = new Date(v + 'T00:00:00');
    m[k] = v;
  });
  if (nomOnglet === ONGLETS.PARAMS) {
    const p = lire_(nomOnglet).filter(function (x) { return x._row === Number(ligne); })[0];
    if (p && regle.proteges.indexOf(p['Clé']) >= 0) throw new Error('Paramètre protégé.');
  }
  if (nomOnglet === ONGLETS.PROFORMAS) {
    const p = lire_(nomOnglet).filter(function (x) { return x._row === Number(ligne); })[0];
    if (p && p['N°']) throw new Error('Proforma émise : non modifiable (annulez et recréez).');
  }
  if (ligne) {
    maj_(nomOnglet, Number(ligne), m);
  } else {
    const prefixes = { 'Entités': ['ID Entité', 'E'], 'Groupes': ['ID Groupe', 'G'], 'Formateurs': ['ID Formateur', 'T'] };
    if (prefixes[nomOnglet]) m[prefixes[nomOnglet][0]] = nouvelId_(nomOnglet, prefixes[nomOnglet][0], prefixes[nomOnglet][1]);
    if (nomOnglet === ONGLETS.ENTITES) { m['Source'] = 'Saisie ERP'; m['Mis à jour le'] = new Date(); }
    if (nomOnglet === ONGLETS.CATALOGUE && !m['Code']) throw new Error('Code obligatoire.');
    ajouter_(nomOnglet, m);
  }
  if (nomOnglet === ONGLETS.SESSIONS || nomOnglet === ONGLETS.PARTICIPANTS) controlerPhases();
  if (nomOnglet === ONGLETS.SESSIONS) actualiserExports();
  journal_('Modification', nomOnglet + (ligne ? ' ligne ' + ligne : ' (ajout)'));
  return rep_('Enregistré.');
}

function apiSupprimerParticipant(ligne) {
  const p = lire_(ONGLETS.PARTICIPANTS).filter(function (x) { return x._row === Number(ligne); })[0];
  if (!p) throw new Error('Participant introuvable.');
  sh_(ONGLETS.PARTICIPANTS).deleteRow(p._row);
  journal_('Participant supprimé', p['ID Session'] + ' : ' + p['Nom']);
  return rep_('Participant supprimé.');
}

/* ---------- HubSpot ---------- */
function apiCleHubSpot(jeton) {
  jeton = String(jeton || '').trim();
  if (!/^pat-/.test(jeton)) throw new Error('Le jeton doit commencer par « pat- ».');
  PropertiesService.getScriptProperties().setProperty('HUBSPOT_TOKEN', jeton);
  return rep_('Clé HubSpot enregistrée.');
}
function apiSyncHubSpot() {
  const n = synchroniserEntreprisesCore_();
  return rep_(n.crees + ' entité(s) créée(s), ' + n.majs + ' mise(s) à jour, ' + n.groupes + ' groupe(s).');
}
function apiImportHubSpot() {
  const n = importerDepuisOngletCore_();
  return rep_(n.crees + ' entité(s) créée(s), ' + n.majs + ' mise(s) à jour.');
}
function apiRelancesHubSpot() { return rep_(creerRelancesHubSpotCore_() + ' tâche(s) de relance créée(s) dans HubSpot.'); }
