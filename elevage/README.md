# Tableau de bord – Suivi d'élevage (Matura Agri)

**Base de données** : Google Sheets (données saisies uniquement, aucune formule).
**Plateforme** : web app Apps Script (`Code.gs` + `Index.html`) qui calcule et affiche le tableau de bord, et permet la saisie.

## 1. Analyse du classeur Excel v4.4

| Onglet Excel | Rôle | Devenir |
|---|---|---|
| PARAMETRES | prix œuf, seuils de ponte, offre, objectifs par race, rations, prix provende | onglets `Parametres`, `Races`, `PrixProvende` |
| LOTS | 7 lots (race, mise en place, âge à l'entrée) | onglet `Lots` |
| JOURNAL_POULES + JOURNAL_OEUFS | saisie quotidienne par lot (entrées, décès, sorties, coqs / œufs collectés, cassés, couveuse) | fusionnés en un seul onglet `Journal` (1 ligne = 1 jour × 1 lot) |
| VENTES | 224 ventes (client, quantité, prix, cadeaux) | onglet `Ventes` (œufs offerts recalculés) |
| CHARGES | 7 charges | onglet `Charges` |
| TABLEAU DE BORD, RENTABILITE, OBJECTIFS, STOCKS, CALENDRIER, PONTE_JOUR, CALCULS, OFFRE | calculs et affichage | remplacés par la web app |

Règles de calcul reprises à l'identique :
- effectif = cumul des entrées − décès − vendues − manquantes, par lot ;
- poules en ponte (un jour donné) = effectif si âge ≥ 20 sem. **ou** œufs collectés ce jour-là ;
- taux de ponte = œufs collectés ÷ poules-en-ponte-jours ; attendus = pondeuses × objectif de la race ;
- offre : 1 œuf offert par tranche de 30 achetés, à partir de la date de début de l'offre ;
- stock d'œufs = collectés − cassés − couveuse − vendus − offerts ; les races marquées « stock à part » (Kuroiler) sont isolées ;
- provende = pondeuses × ration ponte + autres poules × ration poulette, × prix du kg à la date.

**Contrôle** : `tests/verifier.js` compare 47 indicateurs du script aux valeurs calculées par Excel (au 10/11/2026) : tous concordent.

### Points relevés dans les données
- Marge nette négative depuis le début (−11,8 M Ar) : coût de revient ≈ 969 Ar/œuf pour un prix moyen de 692 Ar. Le poste principal est la provende (122 % du CA), calculée à **2 920 Ar/kg** et 0,12 kg/poule/jour : ces valeurs restent à confirmer (LISEZ-MOI les disait provisoires).
- La charge « Achat provende » (1 511 500 Ar, 22/07) s'ajoute à la provende calculée : **double comptage probable**.
- « Achat poule Isa Brown » (4 184 000 Ar) est un investissement compté en charge variable ; classé « Achat de volailles » dans la nouvelle base.
- Mortalité cumulée 14,7 % pour un plafond de 5 % (Isa Brown 4 : 46 %, Kombo : 20 %).
- Hypothèses Excel toujours à valider : âges d'entrée Kombo et Kuroiler, objectifs de ponte Kombo/Kuroiler (50 %).

## 2. Contenu du tableau de bord

Filtres : lot / race, période (7 j, 30 j, mois, 90 j, depuis le début, journée, personnalisée), jour de référence.

| Onglet | Contenu |
|---|---|
| Synthèse | lecture rapide, 12 indicateurs, taux de ponte et œufs par semaine, points d'attention automatiques, couvaison par race |
| Production | ponte par jour et par lot, taux de ponte (moyenne 7 j) vs objectif, 14 derniers jours en couleur, production mensuelle |
| Lots & effectifs | situation des lots (âge exact, statut, taux, mortalité), bilan volailles, effectif mensuel, situation du jour |
| Ventes & stock | bilan des œufs, stock journalier, ventes mensuelles, meilleurs clients, dernières ventes |
| Rentabilité | compte de résultat, coût par œuf, seuil de rentabilité, évolution mensuelle, provende par lot, charges |
| Objectifs | avancement (effectif 800, pondeuses 600, mortalité, ponte par race, casse, ventes 8 000/mois, CA, écoulement) |
| Saisie | journal du jour (tous les lots), nouvelle vente (offre calculée), nouvelle charge |

## 3. Installation

1. Générer la base (déjà fournie : `MATURA_AGRI_Base.xlsx`) :
   ```bash
   python3 base/generer_base.py SUIVI_ELEVAGE_..._v4_4.xlsx MATURA_AGRI_Base.xlsx
   ```
2. Google Drive > Nouveau > Importer le fichier, puis l'ouvrir avec Google Sheets (Fichier > Enregistrer au format Google Sheets).
3. Fichier > Paramètres > Fuseau horaire : (GMT+03:00) Antananarivo.
4. Extensions > Apps Script :
   - remplacer le contenu de `Code.gs` par `apps-script/Code.gs` ;
   - créer un fichier HTML nommé `Index` avec `apps-script/Index.html` ;
   - Paramètres du projet > cocher « Afficher le fichier manifeste », coller `apps-script/appsscript.json`.
5. Exécuter `initialiserBase` une fois et autoriser (vérifie onglets et paramètres).
6. Déployer > Nouveau déploiement > Application Web : Exécuter en tant que **Moi** ; accès : **Seulement moi**, ou votre domaine Google Workspace, ou les comptes avec qui le classeur est partagé.
7. Ouvrir l'URL `…/exec`. Menu **Élevage** dans le Sheet : ouvrir le tableau de bord, vérifier les données.
8. Après chaque modification du code : Déployer > Gérer les déploiements > Modifier > Nouvelle version (l'URL reste la même).

Contrôle de la saisie : paramètre `UTILISATEURS` (e-mails séparés par des virgules). Vide = toute personne ayant accès à l'URL peut saisir. Rempli, il ne fonctionne que si Google transmet l'e-mail du visiteur (même domaine Workspace).

## 4. Utilisation au quotidien
- Saisie dans l'onglet **Saisie** de la web app (téléphone) ou directement dans le Sheet.
- Nouveau lot : une ligne dans `Lots`. Nouveau prix de provende : une ligne dans `PrixProvende`.
- Objectifs et seuils : onglet `Parametres` (colonne Valeur) et `Races`.
- Ne pas renommer les onglets ni les en-têtes de la ligne 1.

## 5. Tests
```bash
python3 base/generer_base.py <classeur_v4_4.xlsx> /tmp/base.xlsx --json /tmp/donnees.json
```
```bash
node tests/verifier.js /tmp/donnees.json
```
