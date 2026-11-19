"""Génère la base Google Sheets (MATURA_AGRI_Base.xlsx) à partir du classeur Excel v4.4.

La base ne contient QUE des données saisies (aucune formule) : tous les calculs
sont faits par le script Apps Script du tableau de bord.

Usage :
    python3 generer_base.py <SUIVI_ELEVAGE_...v4_4.xlsx> [sortie.xlsx] [--json donnees.json]
"""
import datetime as dt
import json
import sys

import openpyxl
from openpyxl.styles import Alignment, Font, PatternFill
from openpyxl.utils import get_column_letter
from openpyxl.worksheet.datavalidation import DataValidation

ENTETE = PatternFill('solid', fgColor='1F4E3D')
SAISIE = PatternFill('solid', fgColor='FFF7D6')

# Structure de la base : nom d'onglet -> colonnes (ligne 1 = en-têtes, données à partir de la ligne 2)
STRUCTURE = {
    'Parametres': ['Clé', 'Libellé', 'Valeur', 'Unité / commentaire'],
    'Races': ['Race', 'Objectif taux de ponte', 'Ration poule en ponte (kg/j)', 'Ration poulette (kg/j)', 'Stock d\'œufs à part (Oui/Non)'],
    'PrixProvende': ['Date d\'effet', 'Prix (Ar/kg)', 'Commentaire'],
    'Lots': ['Lot', 'Race', 'Date de mise en place', 'Âge à l\'entrée (sem.)', 'Onglet d\'origine', 'Remarque'],
    'Journal': ['Date', 'Lot', 'Poules entrées', 'Poules décès', 'Poules vendues / réformées', 'Poules manquantes',
                'Coqs entrés', 'Coqs décès', 'Coqs vendus / réformés', 'Œufs collectés', 'Œufs cassés',
                'Mis en couveuse', 'Observation'],
    'Ventes': ['Date', 'Client', 'Œufs achetés', 'Prix unitaire (Ar)', 'Cadeaux hors offre', 'Observation'],
    'Charges': ['Date', 'Type', 'Catégorie', 'Libellé', 'Lot', 'Montant (Ar)'],
}

CATEGORIES = ['Salaires', 'Soins vétérinaires / vaccins', 'Eau et électricité', 'Emballage / alvéoles',
              'Transport / livraison', 'Entretien / matériel', 'Loyer / amortissement', 'Achat de volailles',
              'Imprevus', 'Autre']


def jour(d):
    return d.strftime('%Y-%m-%d') if isinstance(d, (dt.date, dt.datetime)) else d


def nombre(v):
    if v in (None, ''):
        return None
    return v


def lire(source):
    wb = openpyxl.load_workbook(source, data_only=True)  # valeurs calculées (montants « =60000+... »)
    p = wb['PARAMETRES']
    o = wb['OBJECTIFS']
    params = [
        ('PRIX_OEUF', 'Prix de vente par défaut de l\'œuf', p['B5'].value, 'Ar / œuf (si le prix n\'est pas saisi dans Ventes)'),
        ('SEUIL_PONTE_SEM', 'Seuil de début de ponte', p['B6'].value, 'semaines'),
        ('PREPONTE_SEM', 'Début de la phase pré-ponte', p['B8'].value, 'semaines'),
        ('OFFRE_PALIER', 'Palier de l\'offre (œufs achetés)', p['B9'].value, 'œufs'),
        ('OFFRE_OEUFS', 'Œufs offerts par palier', p['B10'].value, 'œuf(s)'),
        ('OFFRE_DEBUT', 'Date de début de l\'offre', p['B11'].value, 'date'),
        ('DEBUT_SUIVI', 'Premier jour du suivi', p['B28'].value, 'date (début des graphiques)'),
        ('DATE_REF', 'Date de référence forcée', None, 'vide = dernier jour où des œufs ont été collectés'),
        ('CIBLE_EFFECTIF', 'Objectif effectif total de poules', o['C7'].value, 'poules'),
        ('CIBLE_PONDEUSES', 'Objectif poules en ponte', o['C8'].value, 'poules'),
        ('MORTALITE_MAX', 'Plafond de mortalité cumulée', o['C9'].value, 'ratio (0,05 = 5 %)'),
        ('CASSE_MAX', 'Plafond du taux de casse', o['C16'].value, 'ratio'),
        ('CIBLE_VENTES_MOIS', 'Objectif œufs vendus par mois', o['C19'].value, 'œufs / mois'),
        ('ECOULEMENT_MIN', 'Objectif taux d\'écoulement', o['C21'].value, 'ratio (vendus + offerts) ÷ collectés'),
        ('NOM_ELEVAGE', 'Nom affiché', 'MATURA AGRI', 'titre du tableau de bord'),
        ('SESSION_DUREE_JOURS', 'Durée d\'une session de connexion', 7, 'jours'),
        ('EXPEDITEUR_NOM', 'Nom de l\'expéditeur des e-mails', 'Matura Agri', 'codes de connexion et invitations'),
    ]
    rations = {r[0]: (r[1], r[2]) for r in p.iter_rows(min_row=22, max_row=24, min_col=6, max_col=8, values_only=True)}
    races = []
    for r in p.iter_rows(min_row=19, max_row=21, max_col=2, values_only=True):
        rp, rpo = rations.get(r[0], (0, 0))
        races.append([r[0], r[1], rp, rpo, 'Oui' if r[0] == 'Kuroiler' else 'Non'])
    prix = [[r[0], r[1], 'Prix repris du classeur v4.4'] for r in
            p.iter_rows(min_row=6, max_row=17, min_col=6, max_col=7, values_only=True) if r[0]]
    lots = [[r[0], r[1], r[3], r[4], r[2], r[16]] for r in
            wb['LOTS'].iter_rows(min_row=6, max_row=12, values_only=True) if r[0]]

    jp = list(wb['JOURNAL_POULES'].iter_rows(min_row=6, max_row=1470, values_only=True))
    jo = list(wb['JOURNAL_OEUFS'].iter_rows(min_row=6, max_row=1470, values_only=True))
    derniere = p['B14'].value
    journal = []
    for a, b in zip(jp, jo):
        if not a[0]:
            continue
        valeurs = [nombre(a[7]), nombre(a[8]), nombre(a[9]), nombre(a[10]), nombre(a[13]), nombre(a[14]),
                   nombre(a[15]), nombre(b[3]), nombre(b[4]), nombre(b[5])]
        if a[0] > derniere and not any(valeurs):
            continue  # lignes pré-remplies du futur, vides
        journal.append([a[0], a[1]] + valeurs + [None])

    ventes = []
    for r in wb['VENTES'].iter_rows(min_row=6, max_row=605, values_only=True):
        if r[0]:
            ventes.append([r[0], r[1], nombre(r[2]), nombre(r[3]), nombre(r[6]), None])
    charges = []
    for r in wb['CHARGES'].iter_rows(min_row=6, max_row=505, values_only=True):
        if r[0]:
            cat = 'Achat de volailles' if r[3] and 'poule' in r[3].lower() and r[2] == 'Autre' else r[2]
            charges.append([r[0], r[1], cat, r[3], r[4] or 'Tous', r[5]])
    return {'Parametres': params, 'Races': races, 'PrixProvende': prix, 'Lots': lots,
            'Journal': journal, 'Ventes': ventes, 'Charges': charges}


def ecrire(donnees, sortie):
    wb = openpyxl.Workbook()
    wb.remove(wb.active)
    lisez = wb.create_sheet('LisezMoi')
    texte = [
        'BASE DE DONNÉES – SUIVI D\'ÉLEVAGE MATURA AGRI',
        '',
        'Cette base ne contient que des données saisies. Le tableau de bord (web app Apps Script) fait tous les calculs.',
        'Règles : ne pas renommer les onglets ni les en-têtes (ligne 1). Une ligne = un enregistrement.',
        '',
        'Journal : une ligne par jour et par lot. Laisser vide (ou 0) ce qui n\'a pas eu lieu.',
        '  Les effectifs (stock initial / final) se calculent seuls : il suffit des entrées, décès, sorties.',
        'Ventes : une ligne par vente. Prix vide = prix par défaut (Parametres). Les œufs offerts (offre) sont calculés.',
        'Charges : Type = Fixe ou Variable. Lot = Tous ou le nom d\'un lot.',
        'Lots : ajouter une ligne pour un nouveau lot (race, date de mise en place, âge à l\'entrée).',
        'PrixProvende : une ligne à chaque changement de prix (date d\'effet).',
        'Races : objectif de ponte, rations (kg/poule/jour). « Stock d\'œufs à part » = Oui pour une race dont',
        '  les œufs ne sont pas vendus avec les autres (ex. Kuroiler, réservés à la couveuse).',
        '',
        'La saisie peut aussi se faire depuis l\'onglet « Saisie » du tableau de bord (téléphone).',
        'Utilisateurs et JournalActions : créés par la fonction initialiserBase, gérés depuis le tableau de bord (superadmin).',
    ]
    for i, t in enumerate(texte, 1):
        lisez.cell(i, 1, t)
    lisez['A1'].font = Font(bold=True, size=14, color='1F4E3D')
    lisez.column_dimensions['A'].width = 120

    formats_date = {'PrixProvende': [1], 'Lots': [3], 'Journal': [1], 'Ventes': [1], 'Charges': [1]}
    for nom, colonnes in STRUCTURE.items():
        ws = wb.create_sheet(nom)
        ws.append(colonnes)
        for c in range(1, len(colonnes) + 1):
            cell = ws.cell(1, c)
            cell.fill = ENTETE
            cell.font = Font(bold=True, color='FFFFFF')
            cell.alignment = Alignment(wrap_text=True, vertical='center')
            ws.column_dimensions[get_column_letter(c)].width = max(14, min(40, len(colonnes[c - 1]) + 4))
        ws.freeze_panes = 'A2'
        for ligne in donnees[nom]:
            ws.append(list(ligne))
        for c in formats_date.get(nom, []):
            for r in range(2, ws.max_row + 1):
                ws.cell(r, c).number_format = 'DD/MM/YYYY'
        if nom == 'Parametres':
            for r in range(2, ws.max_row + 1):
                ws.cell(r, 3).fill = SAISIE
                if isinstance(ws.cell(r, 3).value, (dt.date, dt.datetime)):
                    ws.cell(r, 3).number_format = 'DD/MM/YYYY'
            ws.column_dimensions['B'].width = 40
            ws.column_dimensions['D'].width = 55
        ws.auto_filter.ref = ws.dimensions

    dv = DataValidation(type='list', formula1='"Fixe,Variable"', allow_blank=True)
    wb['Charges'].add_data_validation(dv)
    dv.add('B2:B2000')
    dv2 = DataValidation(type='list', formula1='"' + ','.join(CATEGORIES) + '"', allow_blank=True)
    wb['Charges'].add_data_validation(dv2)
    dv2.add('C2:C2000')
    dv3 = DataValidation(type='list', formula1='=Lots!$A$2:$A$100', allow_blank=True)
    wb['Journal'].add_data_validation(dv3)
    dv3.add('B2:B20000')
    dv4 = DataValidation(type='list', formula1='=Races!$A$2:$A$20', allow_blank=True)
    wb['Lots'].add_data_validation(dv4)
    dv4.add('B2:B100')
    wb.save(sortie)


def vers_json(donnees, chemin):
    def conv(v):
        return jour(v) if isinstance(v, (dt.date, dt.datetime)) else v
    out = {k: [[conv(x) for x in ligne] for ligne in v] for k, v in donnees.items()}
    out['_entetes'] = STRUCTURE
    with open(chemin, 'w', encoding='utf-8') as f:
        json.dump(out, f, ensure_ascii=False)


if __name__ == '__main__':
    args = sys.argv[1:]
    json_out = None
    if '--json' in args:
        i = args.index('--json')
        json_out = args[i + 1]
        del args[i:i + 2]
    source = args[0]
    sortie = args[1] if len(args) > 1 else 'MATURA_AGRI_Base.xlsx'
    d = lire(source)
    ecrire(d, sortie)
    if json_out:
        vers_json(d, json_out)
    print('Base générée :', sortie, {k: len(v) for k, v in d.items()})
