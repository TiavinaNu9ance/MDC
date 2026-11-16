/**
 * Compare les calculs du script (Code.gs) aux valeurs calculées par le classeur Excel v4.4
 * (date de référence 10/11/2026, période « Depuis le début », tous les lots).
 * Usage : node verifier.js donnees.json   (donnees.json produit par base/generer_base.py --json)
 */
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const ctx = { module: {}, console };
vm.createContext(ctx);
vm.runInContext(fs.readFileSync(path.join(__dirname, '../apps-script/Code.gs'), 'utf8'), ctx);
const { calculerTableau, controlerDonnees } = ctx.module.exports;
const brut = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'));
const r = calculerTableau(brut, { selection: 'Tous', periode: 'debut' });
const lot = n => r.lots.find(l => l.lot === n);
const race = n => r.parRace.find(x => x.race === n);
const obj = n => r.objectifs.find(o => o.libelle === n);
const attendu = [
  ['date de référence', r.filtres.ref, '2026-11-10'],
  ['poules', r.kpi.poules, 539], ['en ponte', r.kpi.enPonte, 415], ['poulettes', r.kpi.poulettes, 124], ['coqs', r.kpi.coqs, 8],
  ['taux de ponte', r.kpi.tauxPonte, 0.468275012137282], ['objectif pondéré', r.kpi.objectifPonte, 0.7823405659085542],
  ['réalisé vs attendu', r.kpi.realiseVsAttendu, 0.5985564759683157], ['collectés', r.kpi.collectes, 37617],
  ['vendus', r.kpi.vendus, 35655], ['offerts', r.kpi.offerts, 514], ['stock fin', r.kpi.stockFin, 748],
  ['stock hors Kuroiler', r.kpi.stockHorsAPart, 514], ['taux de casse', r.kpi.tauxCasse, 0.0031102958768641836],
  ['mortalité cumulée', r.kpi.mortaliteCumulee, 0.14681440443213298], ['CA', r.kpi.ca, 24680900],
  ['bilan entrées', r.bilanVolailles.poules.entrees, 722], ['bilan décès', r.bilanVolailles.poules.deces, 106], ['bilan sorties', r.bilanVolailles.poules.sorties, 77],
  ['coqs entrées', r.bilanVolailles.coqs.entrees, 15], ['bilan couveuse', r.bilanOeufs.couveuse, 583], ['bilan cassés', r.bilanOeufs.casses, 117],
  ['Kuroiler stock', race('Kuroiler').stockFin, 234], ['Kuroiler collectés', race('Kuroiler').collectes, 741], ['Kuroiler couveuse', race('Kuroiler').couveuse, 505],
  ['Kuroiler en ponte', race('Kuroiler').enPonte, 13], ['Kuroiler taux', race('Kuroiler').tauxPonte, 0.4227039361095265],
  ['Kombo couveuse', race('Kombo').couveuseCumul, 78], ['Kombo % couvés', race('Kombo').partCouvee, 0.029104477611940297],
  ['Kombo collectés', race('Kombo').collectes, 2680], ['Kombo taux', race('Kombo').tauxPonte, 0.194541231126597],
  ['IB1 taux', lot('Isa Brown 1').tauxPonte, 0.6095520156420726], ['IB1 poules', lot('Isa Brown 1').poules, 173], ['IB1 âge', lot('Isa Brown 1').age, '49 sem 2 j'],
  ['IB4 mortalité', lot('Isa Brown 4').mortalite, 0.46], ['IB5 statut', lot('Isa Brown 5').statut, 'Poulette'], ['Kombo coqs', lot('Kombo').coqs, 7],
  ['jour : collectés IB1', r.situationJour.find(s => s.lot === 'Isa Brown 1').collectes, 129],
  ['jour : taux total', r.situationJour.reduce((t, s) => t + s.collectes, 0) / r.situationJour.reduce((t, s) => t + s.enPonte, 0), 0.655421686746988],
  ['provende (Ar)', r.rentabilite.provende, 30079577], ['autres charges var.', r.rentabilite.autresVariables, 6374500],
  ['marge nette', r.rentabilite.margeNette, -11773177], ['coût de revient/œuf', r.rentabilite.coutRevientOeuf, 969.0851742563207],
  ['prix moyen provende', r.rentabilite.prixMoyenProvende, 2920],
  ['objectif : vendus du mois', obj('Œufs vendus').realise, 2332], ['objectif : écoulement', obj("Taux d'écoulement").realise, 0.846262341325811],
  ['objectif : ponte Isa Brown', obj('Taux de ponte Isa Brown').realise, 0.6935161382462154],
];
let ko = 0;
for (const [nom, val, ref] of attendu) {
  const ok = typeof ref === 'number' ? Math.abs(val - ref) <= Math.max(1e-6, Math.abs(ref) * 1e-9) : val === ref;
  if (!ok) ko++;
  console.log((ok ? 'OK  ' : 'ÉCART') + '  ' + nom + ' : ' + val + (ok ? '' : '  (Excel : ' + ref + ')'));
}
// Autres options : ne doivent pas planter
for (const sel of r.listes.selection) for (const per of ['7j', '30j', 'mois', '90j', 'debut', 'jour']) calculerTableau(brut, { selection: sel, periode: per });
calculerTableau(brut, { periode: 'perso', debut: '2026-09-01', fin: '2026-09-30', jour: '2026-10-15' });
console.log('Anomalies de saisie détectées :', controlerDonnees(brut).length);
console.log(ko ? ko + ' écart(s)' : 'Tous les contrôles concordent avec le classeur Excel.');
process.exit(ko ? 1 : 0);
