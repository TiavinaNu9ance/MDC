# Mise en route de l'ERP MDC

Architecture : **interface web** (Apps Script, `Index.html`) → **base de données** (Google Sheet). Les PDF vont dans Google Drive.

## Fichiers à coller (dossier `a-coller/`)
| Fichier | Où le coller dans Apps Script |
|---|---|
| `Code.gs` | Remplace le contenu de `Code.gs` |
| `Index.html` | Nouveau fichier HTML nommé `Index` (l'interface) |
| `NouvelleProforma.html` | Nouveau fichier HTML nommé `NouvelleProforma` (formulaire depuis la feuille, optionnel) |
| `appsscript.json` | Manifeste (Paramètres du projet > cocher « Afficher le fichier manifeste ») |

## Étapes
1. La base doit être au format Google Sheets (pas de badge .XLSX ; sinon Fichier > Enregistrer au format Google Sheets).
2. Fichier > Paramètres > Fuseau horaire : (GMT+03:00) Antananarivo.
3. Extensions > Apps Script : coller les 4 fichiers ci-dessus. Enregistrer.
4. Exécuter `initialiserStructure` et autoriser (Paramètres avancés > Accéder à … (non sécurisé) > Autoriser).
5. **Déployer > Nouveau déploiement** > type **Application Web** : Exécuter en tant que **Moi**, Accès **Seulement moi** > Déployer. Copier l'URL `…/exec` et la mettre en favori : c'est l'ERP.
6. Après chaque mise à jour du code : **Déployer > Gérer les déploiements > (crayon) > Version : Nouvelle version > Déployer** (l'URL reste la même).

## Clé HubSpot
HubSpot : Paramètres > Intégrations > Applications privées (selon la version : Développement > Applications héritées — non vérifié). Portées : `crm.objects.companies.read` + écriture des tâches pour les relances. Coller le jeton `pat-…` dans l'ERP : Réglages > HubSpot.
