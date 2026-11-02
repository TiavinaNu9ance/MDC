# Installation de l'ERP MDC (Google Sheets + Apps Script)

1. Créer la base : sur drive.google.com, **Nouveau > Importer un fichier** → `base/MDC_ERP_Base.xlsx`, puis l'ouvrir et faire **Fichier > Enregistrer au format Google Sheets**. Renommer en « MDC ERP ».
   La base contient déjà : paramètres MDC, catalogue 2026, 68 entreprises HubSpot (+ EDEN, PROMODIM, 1 particulier), groupes (RAJABALI → RAJABALI, NOVOTEL Alarobia, EDEN ; Imperial Brands → PROMODIM), formateurs, historique des 15 factures 2026.
   (Sinon : partir d'une Google Sheet vide, l'étape 6 crée tous les onglets.)
2. Menu **Extensions > Apps Script**.
3. Dans l'éditeur : supprimer le contenu de `Code.gs`, puis créer un fichier par fichier `.gs` de ce dossier (même nom) et coller le contenu :
   `Config`, `Utils`, `Setup`, `Numerotation`, `Facturation`, `Pdf`, `Lettres`, `Formations`, `HubSpot`, `Menu`.
4. Créer un fichier **HTML** nommé `NouvelleProforma` et coller `NouvelleProforma.html`.
5. Paramètres du projet (roue dentée) : cocher « Afficher le fichier manifeste appsscript.json », puis coller `appsscript.json`.
6. Exécuter la fonction `initialiserStructure` (autoriser l'accès demandé par Google). Elle complète la base sans effacer les données (listes déroulantes, cases à cocher, dossier Drive des PDF).
7. Recharger la Google Sheet : le menu **MDC ERP** apparaît.
8. Onglet **Paramètres** : vérifier `TVA_APPLICABLE` / `TAUX_TVA`, ajouter `LOGO_FILE_ID` (ID Drive du logo).
9. HubSpot : **MDC ERP > HubSpot > Configurer la clé**, puis **Synchroniser les entreprises**.

## Clé HubSpot (application privée)
Dans HubSpot : Paramètres > Intégrations > Applications privées > Créer. Portées nécessaires :
- `crm.objects.companies.read` (synchronisation des entreprises) ;
- pour les relances : droit d'écriture sur les tâches (le nom exact de la portée est à vérifier dans l'écran HubSpot).
Copier le jeton (`pat-…`) et le coller dans l'ERP. Ne jamais le coller dans une cellule.

Sans clé : exporter les entreprises depuis HubSpot, coller les colonnes dans l'onglet **Import HubSpot**, puis *Importer depuis l'onglet*.
