"""Génère MDC_ERP_Base.xlsx (à importer dans Google Sheets) à partir de apps-script/Config.gs (exporté en JSON)."""
import json, sys, datetime as dt
from openpyxl import Workbook
from openpyxl.styles import Font, PatternFill, Alignment
from openpyxl.worksheet.datavalidation import DataValidation
from openpyxl.utils import get_column_letter

cfg = json.load(open(sys.argv[1]))
out = sys.argv[2]
C = cfg['COLONNES']
NOW = dt.datetime(2026, 11, 2)

# --- Données HubSpot (68 entreprises, lues le 02/11/2026) : (id, nom, ville, téléphone) ---
HS = [
 (447376985323,"RedZone","",""),(442406788323,"ABL Outsourcing","",""),(438368564411,"Welthungerhilfe","",""),
 (433468573931,"Sodim","",""),(433466760422,"SALAMA","",""),(432469803257,"Castel Afrique","",""),
 (432321238211,"Helios Towers","",""),(432293099757,"Imperial Brands","",""),(432283663575,"BYOS","",""),
 (432281248956,"SOMAPRO Madagascar","",""),(431913693415,"RAJABALI","",""),(432041197790,"Galana Madagascar","",""),
 (431893852389,"AXELLE","",""),(432020233411,"ARO","",""),(431968329940,"Airtel","",""),
 (432020901075,"Ades Solaire","",""),(431904565441,"ACEP","",""),(431951080691,"Sainte Fleur","Antananarivo",""),
 (431950329037,"FMFP","Antananarivo",""),(431865587943,"Epsilon","Antananarivo",""),(421997545667,"Water Aid","Antananarivo",""),
 (422082343159,"VISEO","Antananarivo",""),(421998265550,"ULTRAMAILLE","Antananarivo",""),(421999704273,"SOMALAVAL","Antananarivo",""),
 (421998985409,"SOFTWELL","Antananarivo",""),(421998264548,"SMILE BOX","Antananarivo",""),(421998983385,"LUCEO Group","Antananarivo",""),
 (421998263495,"SIPROMAD","Antananarivo",""),(421999702244,"SIMAD","Antananarivo",""),(421996822765,"SIDEF","Antananarivo",""),
 (422080902332,"SESAME","Antananarivo",""),(421996822740,"SEMBA","Antananarivo",""),(421996822730,"SASSEBO","Antananarivo",""),
 (422082340066,"SAHAZA Group","Antananarivo",""),(422082340032,"OMNIVESTE","Antananarivo",""),(422082339063,"NEXTHOPE","Antananarivo",""),
 (421998980330,"NEXTA","Antananarivo",""),(421997540546,"Lycheeland","Antananarivo",""),(421996820668,"LOI","Antananarivo",""),
 (421998259445,"La SEAL","Antananarivo",""),(422080898297,"IBIS","Antananarivo",""),(422082338014,"GIZ","Antananarivo",""),
 (422081618151,"TRIMETA","Antananarivo",""),(421998259391,"Croix Rouge","Antananarivo",""),(421998259389,"COLAS","Antananarivo",""),
 (421996818648,"CIMELTA","Antananarivo",""),(421625756917,"Conservation International","Antananarivo",""),(421667501264,"CFAO","Antananarivo",""),
 (421996100838,"CCIA","Antananarivo",""),(421625019598,"Capricorne","Antananarivo",""),(421626466492,"Boost","Antananarivo",""),
 (421625756858,"BOA","Antananarivo",""),(421996100805,"BatPro","Antananarivo",""),(421625018554,"AFG","Antananarivo",""),
 (217689332954,"Aigle d'or","Antananarivo","+261320530724"),(210977876177,"HV Group","Antananarivo","+261380965300"),
 (210912760013,"ArBiochem","Antananarivo","+261321278010"),(209933317369,"RADILOFE","Antananarivo","0208522540"),
 (206182937790,"SMGD","Antananarivo","+261344732280"),(206148615372,"Ibonia","Antananarivo","+261328297793"),
 (206266345673,"PILATEX","Antananarivo","+261330557050"),(206148603124,"Novotel","Antananarivo","+261387118298"),
 (206266364117,"Habibo","Antananarivo","+261321700223"),(205777819884,"Lecofruit","Antananarivo","+261320729686"),
 (206262676708,"MECABE","Nosy Be","+261320412929"),(199864203470,"OIM","Antananarivo","+261324218164"),
 (197785885925,"SIPEM","Antananarivo","+261320100640"),(197785885906,"JB","Antananarivo","+261320531559"),
]
# Groupes à plusieurs entités (d'après les factures 2026). [S] = à confirmer.
GROUPES_MULTI = {
  "RAJABALI": {"hs": 431913693415, "notes": "Factures adressées à NOVOTEL Alarobia et Sté Immobilière EDEN [S : rattachement à confirmer]",
               "membres_hs": [431913693415, 206148603124], "hors_hs": [("Société Immobilière EDEN", "Alarobia", "", "", "")]},
  "Imperial Brands": {"hs": 432293099757, "notes": "Facture 2607-F-DE-00001 adressée à PROMODIM",
               "membres_hs": [432293099757], "hors_hs": [("PROMODIM", "", "", "", "")]},
}
# Compléments connus (factures) : nom HubSpot → champs
COMPLEMENTS = {
  "PILATEX": {"Adresse": "Lot 119 A Antanetibe Antehiroka", "NIF": "0000020219", "STAT": "14106 11 1992 0 10046",
              "Contact principal": "RAHARIMIRADO Marie Ange Emilie Sandra"},
  "Novotel": {"Raison sociale": "NOVOTEL Alarobia"},
  "RADILOFE": {"Raison sociale": "Cabinet Hanta RADILOFE"},
  "Aigle d'or": {"Raison sociale": "Aigle d'Or (Groupe Basan)"},
}

wb = Workbook()
wb.remove(wb.active)
hdr_font = Font(bold=True, color="FFFFFF"); hdr_fill = PatternFill("solid", fgColor="1B2B5E")

def onglet(nom, lignes=()):
    ws = wb.create_sheet(nom[:31])
    ws.append(C[nom])
    for c in ws[1]:
        c.font = hdr_font; c.fill = hdr_fill; c.alignment = Alignment(vertical="center")
    for l in lignes:
        ws.append([l.get(k, "") for k in C[nom]] if isinstance(l, dict) else list(l))
    ws.freeze_panes = "A2"
    for i, h in enumerate(C[nom], 1):
        ws.column_dimensions[get_column_letter(i)].width = max(12, min(40, len(h) + 4))
    return ws

def liste(ws, col, valeurs, n=1000):
    j = C[ws.title].index(col) + 1
    dv = DataValidation(type="list", formula1='"' + ",".join(valeurs) + '"', allow_blank=True)
    ws.add_data_validation(dv)
    dv.add(f"{get_column_letter(j)}2:{get_column_letter(j)}{n}")

O = cfg['ONGLETS']
# Tableau de bord en premier
onglet(O['DASHBOARD'], [["Lancez MDC ERP > Actualiser le tableau de bord", "", ""]])

# Paramètres
onglet(O['PARAMS'], [list(p) for p in cfg['PARAMS_DEFAUT']])

onglet(O['COMPTEURS'])

# Groupes & entités
groupes, entites = [], []
gid = {}
def nouveau_groupe(nom, hs="", notes=""):
    g = "G%04d" % (len(groupes) + 1)
    groupes.append({"ID Groupe": g, "Nom du groupe": nom, "HubSpot ID": hs, "Notes": notes}); return g
def nouvelle_entite(**kw):
    e = "E%04d" % (len(entites) + 1)
    d = {"ID Entité": e, "Mis à jour le": NOW}; d.update(kw); entites.append(d); return e

membre_de = {}
for nom, g in GROUPES_MULTI.items():
    gid[nom] = nouveau_groupe(nom, g["hs"], g["notes"])
    for m in g["membres_hs"]: membre_de[m] = gid[nom]
for hs, nom, ville, tel in sorted(HS, key=lambda x: x[1].lower()):
    g = membre_de.get(hs) or nouveau_groupe(nom, hs)
    d = {"Raison sociale": nom, "ID Groupe": g, "Adresse": ville, "Téléphone": tel, "HubSpot ID": hs, "Source": "HubSpot (02/11/2026)"}
    d.update(COMPLEMENTS.get(nom, {}))
    nouvelle_entite(**d)
for nom, g in GROUPES_MULTI.items():
    for rs, adr, nif, stat, contact in g["hors_hs"]:
        nouvelle_entite(**{"Raison sociale": rs, "ID Groupe": gid[nom], "Adresse": adr, "Source": "Factures 2026 (hors HubSpot)"})
gpart = nouveau_groupe("Particuliers", "", "Clients individuels (MVola affiché sur les factures)")
nouvelle_entite(**{"Raison sociale": "Hanitriniaina Nadia R.", "ID Groupe": gpart, "Source": "Facture 2605-F-DE-00070 (particulier)"})
onglet(O['GROUPES'], groupes)
onglet(O['ENTITES'], entites)

# Catalogue
onglet(O['CATALOGUE'], [list(c) + [True] for c in cfg['CATALOGUE_DEFAUT']])

# Formateurs (noms issus des CV ; autres champs à compléter)
onglet(O['FORMATEURS'], [
  {"ID Formateur": "T001", "Nom": "Tiavina", "Domaines": "", "Lien CV (FMFP)": "", "Actif": True},
  {"ID Formateur": "T002", "Nom": "Lianiaina", "Actif": True},
  {"ID Formateur": "T003", "Nom": "Haja", "Actif": True},
  {"ID Formateur": "T004", "Nom": "Toky", "Actif": True},
  {"ID Formateur": "T005", "Nom": "Tsiry", "Actif": True},
])

for nom in ['PROFORMAS', 'FACTURES', 'LIGNES', 'PAIEMENTS', 'SESSIONS', 'PARTICIPANTS', 'FMFP', 'EXPORTS', 'IMPORT', 'JOURNAL']:
    onglet(O[nom])

ws = wb[O['PROFORMAS']]; liste(ws, 'Statut', cfg['STATUT_PROFORMA'])
ws = wb[O['FACTURES']]; liste(ws, 'Statut', cfg['STATUT_FACTURE'])
ws = wb[O['PAIEMENTS']]; liste(ws, 'Mode', cfg['MODES_PAIEMENT'])
ws = wb[O['SESSIONS']]; liste(ws, 'FMFP', ['Oui', 'Non'])
for p in cfg['PHASES']: liste(ws, p, cfg['STATUT_PHASE'])
ws = wb[O['FMFP']]; liste(ws, 'Étape', [e.replace(',', '') for e in cfg['ETAPES_FMFP']])

# Historique 2026 (avant ERP) — lecture seule, n'entre pas dans les calculs
H = wb.create_sheet("Historique 2026")
H.append(["N°", "Client facturé", "Date", "Montant (Ar)", "Nature", "Statut paiement", "Remarque"])
for c in H[1]: c.font = hdr_font; c.fill = hdr_fill
hist = [
 ("2602-F-DE-00065","NOVOTEL Alarobia","2026-02-26",2884000,"Excel Perfectionnement — 70 %",""),
 ("2602-F-DE-00065","NOVOTEL","2026-05-04",1236000,"30 %","Même n° réutilisé"),
 ("2602-F-DE-00065","NOVOTEL","2026-05-04",4120000,"100 %","Même n° réutilisé"),
 ("2602-F-DE-00067","NOVOTEL","2026-05-04",1236000,"30 %","Doublon probable de la précédente"),
 ("2602-F-DE-00068","Sté Immobilière EDEN","2026-05-04",5137000,"Excel Perfectionnement 10 pax — 100 %",""),
 ("2602-F-DE-00069","Sté Immobilière EDEN","2026-05-04",1541100,"30 %",""),
 ("2604-F-DE-00066","Cabinet Hanta RADILOFE","2026-04-16",740000,"Excel Pack Gold + déplacement",""),
 ("2605-F-DE-00070","Hanitriniaina Nadia R. (particulier)","2026-05-16",500000,"Power BI Découverte",""),
 ("2606-F-DE-00001","EDEN (Alarobia)","2026-06-15",2030000,"Power BI Découverte & Imprégnation — 70 %","Compteur remis à 1"),
 ("2606-F-DE-00001","EDEN","2026-08-18",870000,"30 %","Même n° réutilisé"),
 ("2606-F-DE-00001","EDEN","",2900000,"100 %","Date non lue, montant d'après ppp.xlsm [S]"),
 ("2607-F-DE-00001","PROMODIM (Imperial Brands)","2026-07-15",1650000,"Power BI Découverte 3 pax + déplacement",""),
 ("2608-F-DE-00001","ARBIOCHEM","2026-08-07",5640000,"Excel N1/N2/N4 + déplacement",""),
 ("2608-F-DE-00002","Aigle d'Or (Groupe Basan)","2026-08-10",18640000,"Excel N1–N4, Power BI N1–N2, PC, déplacement",""),
 ("2610-F-DE-00001","PILATEX","2026-10-02",470000,"Excel Imprégnation 1 pax + PC + déplacement",""),
]
for n, cl, d, m, nat, rq in hist:
    H.append([n, cl, dt.datetime.fromisoformat(d) if d else "", m, nat, "Inconnu (aucun suivi)", rq])
for i, w in enumerate([18, 34, 12, 14, 44, 22, 40], 1): H.column_dimensions[get_column_letter(i)].width = w
for r in H.iter_rows(min_row=2):
    r[2].number_format = "dd/mm/yyyy"; r[3].number_format = "#,##0"
H.freeze_panes = "A2"

# Formats
def fmt(nom, cols, f):
    ws = wb[nom]
    for col in cols:
        j = C[nom].index(col) + 1
        for r in range(2, 1001): ws.cell(r, j).number_format = f
fmt(O['CATALOGUE'], ['Prix unitaire HT'], '#,##0')
wb.save(out)
print(len(groupes), "groupes,", len(entites), "entités →", out)
