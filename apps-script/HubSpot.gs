/**
 * MDC ERP — Synchronisation HubSpot (lecture des entreprises + groupes via « entreprise mère »).
 * La clé (jeton d'application privée HubSpot) est stockée dans les propriétés du script, jamais dans la feuille.
 */
const HS_API = 'https://api.hubapi.com';

function configurerCleHubSpot() {
  const ui = ui_();
  const r = ui.prompt('Clé HubSpot', 'Collez le jeton d\'accès de l\'application privée HubSpot (commence par « pat- »).', ui.ButtonSet.OK_CANCEL);
  if (r.getSelectedButton() !== ui.Button.OK) return;
  const t = r.getResponseText().trim();
  if (!t) return;
  PropertiesService.getScriptProperties().setProperty('HUBSPOT_TOKEN', t);
  ui.alert('Clé enregistrée. Lancez « Synchroniser les entreprises ».');
}

function hs_(methode, chemin, corps) {
  const token = PropertiesService.getScriptProperties().getProperty('HUBSPOT_TOKEN');
  if (!token) throw new Error('Clé HubSpot absente : MDC ERP > HubSpot > Configurer la clé (ou utilisez l\'import manuel).');
  const opt = { method: methode, muteHttpExceptions: true, contentType: 'application/json', headers: { Authorization: 'Bearer ' + token } };
  if (corps) opt.payload = JSON.stringify(corps);
  const res = UrlFetchApp.fetch(HS_API + chemin, opt);
  const code = res.getResponseCode();
  if (code >= 300) throw new Error('HubSpot ' + code + ' : ' + res.getContentText().slice(0, 300));
  return res.getContentText() ? JSON.parse(res.getContentText()) : {};
}

function synchroniserEntreprises() {
  const props = ['name', 'address', 'city', 'phone', 'hs_parent_company_id'];
  const toutes = [];
  let after = '';
  do {
    const r = hs_('get', '/crm/v3/objects/companies?limit=100&archived=false&properties=' + props.join(',') + (after ? '&after=' + after : ''));
    (r.results || []).forEach(function (c) { toutes.push({ id: c.id, p: c.properties || {} }); });
    after = r.paging && r.paging.next ? r.paging.next.after : '';
  } while (after);
  const n = integrerEntreprises_(toutes.map(function (c) {
    return { id: c.id, nom: c.p.name, parent: c.p.hs_parent_company_id, adresse: [c.p.address, c.p.city].filter(String).join(', '), tel: c.p.phone };
  }), 'HubSpot API');
  ui_().alert(n.crees + ' entité(s) créée(s), ' + n.majs + ' mise(s) à jour, ' + n.groupes + ' groupe(s).');
}

/** Import manuel : collez un export HubSpot (entreprises) dans l'onglet « Import HubSpot ». */
function importerDepuisOnglet() {
  const lignes = lire_(ONGLETS.IMPORT);
  if (!lignes.length) throw new Error('Onglet « Import HubSpot » vide.');
  const n = integrerEntreprises_(lignes.map(function (l) {
    return { id: String(l['Record ID']), nom: l['Company name'], parent: String(l['Parent company ID'] || ''),
      adresse: [l['Street address'], l['City']].filter(String).join(', '), tel: l['Phone number'], email: l['Email'] };
  }), 'Import HubSpot');
  ui_().alert(n.crees + ' entité(s) créée(s), ' + n.majs + ' mise(s) à jour, ' + n.groupes + ' groupe(s).');
}

/**
 * Règle des groupes : une entreprise HubSpot qui a des filiales (ou qui est « mère ») devient un Groupe.
 * Chaque entité est rattachée au groupe de son entreprise mère ; une entreprise sans mère est son propre groupe.
 * NIF, STAT, email et contact saisis dans l'ERP ne sont jamais écrasés.
 */
function integrerEntreprises_(liste, source) {
  const parId = {};
  liste.forEach(function (c) { if (c.id) parId[c.id] = c; });
  const groupes = lire_(ONGLETS.GROUPES);
  const entites = lire_(ONGLETS.ENTITES);
  let crees = 0, majs = 0, nbGroupes = 0;

  function groupePour_(hsId, nom) {
    let g = groupes.filter(function (x) { return String(x['HubSpot ID']) === String(hsId); })[0];
    if (g) return g['ID Groupe'];
    const id = nouvelId_(ONGLETS.GROUPES, 'ID Groupe', 'G');
    ajouter_(ONGLETS.GROUPES, { 'ID Groupe': id, 'Nom du groupe': nom, 'HubSpot ID': hsId });
    groupes.push({ 'ID Groupe': id, 'HubSpot ID': hsId, 'Nom du groupe': nom });
    nbGroupes++;
    return id;
  }

  liste.forEach(function (c) {
    if (!c.id || !c.nom) return;
    const mere = c.parent && parId[c.parent] ? parId[c.parent] : c;
    const idGroupe = groupePour_(mere.id, mere.nom);
    const ex = entites.filter(function (e) { return String(e['HubSpot ID']) === String(c.id); })[0];
    if (ex) {
      const m = { 'Raison sociale': c.nom, 'ID Groupe': idGroupe, 'Mis à jour le': new Date() };
      if (!ex['Adresse'] && c.adresse) m['Adresse'] = c.adresse;
      if (!ex['Téléphone'] && c.tel) m['Téléphone'] = c.tel;
      if (!ex['Email'] && c.email) m['Email'] = c.email;
      maj_(ONGLETS.ENTITES, ex._row, m);
      majs++;
    } else {
      const id = nouvelId_(ONGLETS.ENTITES, 'ID Entité', 'E');
      ajouter_(ONGLETS.ENTITES, {
        'ID Entité': id, 'Raison sociale': c.nom, 'ID Groupe': idGroupe, 'Adresse': c.adresse || '',
        'Téléphone': c.tel || '', 'Email': c.email || '', 'HubSpot ID': c.id, 'Source': source, 'Mis à jour le': new Date()
      });
      entites.push({ 'ID Entité': id, 'HubSpot ID': c.id });
      crees++;
    }
  });
  journal_('Synchro entreprises', source + ' : ' + crees + ' créées, ' + majs + ' MAJ');
  return { crees: crees, majs: majs, groupes: nbGroupes };
}

/** Crée dans HubSpot une tâche de relance (e-mail à envoyer depuis HubSpot) pour chaque relance FMFP due. */
function creerRelancesHubSpot() {
  const auj = new Date();
  let n = 0;
  lire_(ONGLETS.FMFP).forEach(function (d) {
    if (!d['Prochaine relance'] || new Date(d['Prochaine relance']) > auj || d['Relance HubSpot créée'] === true) return;
    const ent = trouver_(ONGLETS.ENTITES, 'ID Entité', d['ID Entité']);
    if (!ent || !ent['HubSpot ID']) return;
    const tache = hs_('post', '/crm/v3/objects/tasks', { properties: {
      hs_timestamp: new Date().toISOString(),
      hs_task_subject: 'Relance FMFP — ' + d['Raison sociale'] + ' (' + d['ID Session'] + ')',
      hs_task_body: 'Étape actuelle : ' + d['Étape'] + '\nProforma : ' + d['N° Proforma'] +
        '\nFactures : 100 % ' + (d['N° Facture 100 %'] || '-') + ' / 70 % ' + (d['N° Facture 70 %'] || '-') + ' / 30 % ' + (d['N° Facture 30 %'] || '-'),
      hs_task_status: 'NOT_STARTED', hs_task_type: 'EMAIL'
    } });
    hs_('put', '/crm/v4/objects/tasks/' + tache.id + '/associations/default/companies/' + ent['HubSpot ID']);
    maj_(ONGLETS.FMFP, d._row, { 'Relance HubSpot créée': true });
    n++;
  });
  journal_('Relances HubSpot', n + ' tâche(s)');
  ui_().alert(n + ' tâche(s) de relance créée(s) dans HubSpot.');
}
