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

Design inspiré d'Apple : barre latérale (ordinateur) ou barre d'onglets en bas (téléphone), mode clair / sombre, anneaux d'objectifs, chiffres animés, mini-courbes, transitions.
Filtres : lot / race, période (7 J, 30 J, Mois, 90 J, Tout, Jour, Dates), jour de référence.

| Page | Contenu | Accès |
|---|---|---|
| Synthèse | lecture rapide, 3 anneaux (ponte, effectif, ventes), 10 indicateurs, graphiques hebdomadaires, points d'attention, par race | tous |
| Production | ponte par jour et par lot, taux de ponte (moyenne 7 j), 14 derniers jours en couleur, production mensuelle | tous |
| Lots & effectifs | âge exact, statut, taux, mortalité, bilan volailles, situation du jour | tous |
| Ventes & stock | bilan des œufs, stock journalier, ventes mensuelles, meilleurs clients | tous |
| Rentabilité | compte de résultat, coût par œuf, seuil de rentabilité, évolution mensuelle, provende par lot | tous |
| Objectifs | anneaux et barres d'avancement, trajectoire effectif et ventes | tous |
| Saisie | journal du jour, ventes, charges | Admin, Superadmin |
| Utilisateurs | ajout, rôle, activation, suppression, invitation par e-mail | Superadmin |
| Journal des actions | connexions, refus, saisies, modifications (recherche) | Superadmin |
| Paramètres | prix, seuils, objectifs, races, prix de la provende | Superadmin |

## 3. Rôles et sécurité

| Rôle | Droits |
|---|---|
| Superadmin | tout : consultation, saisie, comptes, paramètres, journal des actions |
| Admin | consultation + saisie des données |
| Utilisateur | consultation seule |

- **Comptes** : identifiés par leur adresse e-mail, créés par le superadmin (onglet `Utilisateurs`). S'il n'y a aucun superadmin actif, le propriétaire du script le devient automatiquement (à `initialiserBase` ou à sa première demande de code).
- **Connexion sans mot de passe** : code à 6 chiffres envoyé par e-mail, valable 10 min, 5 essais, 1 envoi / 45 s, blocage 15 min après 10 échecs. Adresse inconnue ou compte inactif : message explicite (aucun e-mail envoyé).
- **Session** : jeton aléatoire stocké haché côté serveur, durée `SESSION_DUREE_JOURS` (7 j par défaut), déconnexion manuelle.
- **Contrôle côté serveur à chaque appel** : le compte et son rôle sont relus à chaque action. Désactiver un compte ou changer son rôle ferme immédiatement ses sessions. Il reste toujours au moins un superadmin actif.
- **Journal des actions** (onglet `JournalActions`) : connexions, refus, accès interdits, saisies, comptes et paramètres modifiés.
- Saisies validées côté serveur (dates, nombres positifs, lots existants), textes échappés à l'affichage, page non intégrable dans un autre site.
- Limite Gmail : 100 e-mails / jour avec un compte Gmail gratuit (1 500 avec Google Workspace).

## 4. Installation

1. Générer la base (déjà fournie : `MATURA_AGRI_Base.xlsx`) :
   ```bash
   python3 base/generer_base.py SUIVI_ELEVAGE_..._v4_4.xlsx MATURA_AGRI_Base.xlsx
   ```
2. Google Drive > Nouveau > Importer le fichier, puis l'ouvrir avec Google Sheets (Fichier > Enregistrer au format Google Sheets).
3. Fichier > Paramètres > Fuseau horaire : (GMT+03:00) Antananarivo.
4. Extensions > Apps Script :
   - remplacer **tout** le contenu de `Code.gs` par `apps-script/Code.gs` ;
   - créer (ou remplacer) le fichier HTML nommé `Index` avec `apps-script/Index.html` ;
   - facultatif : Paramètres du projet > « Afficher le fichier manifeste », remplacer tout `appsscript.json`.
5. Exécuter `initialiserBase` et autoriser (Paramètres avancés > Accéder à… > Autoriser). Votre adresse devient Superadmin.
6. Déployer > Nouveau déploiement > Application Web : Exécuter en tant que **Moi**, Qui a accès : **Tout le monde**.
   L'accès réel est contrôlé par la plateforme : seules les adresses actives de l'onglet `Utilisateurs` reçoivent un code.
7. Ouvrir l'URL `…/exec`, saisir votre e-mail, recevoir le code, se connecter. Ajouter les comptes dans **Utilisateurs**.
8. Après chaque modification du code : Déployer > Gérer les déploiements > crayon > Nouvelle version (l'URL reste la même).

## 5. Utilisation au quotidien
- Saisie dans **Saisie** (téléphone ou ordinateur) ; les cases modifiées passent en orange avant enregistrement.
- Nouveau lot : une ligne dans l'onglet `Lots` du Sheet.
- Prix, objectifs, races, prix de la provende : page **Paramètres** (superadmin).
- Ne pas renommer les onglets ni les en-têtes de la ligne 1.

## 6. Tests
```bash
python3 base/generer_base.py <classeur_v4_4.xlsx> /tmp/base.xlsx --json /tmp/donnees.json
```
```bash
node tests/verifier.js /tmp/donnees.json
```
