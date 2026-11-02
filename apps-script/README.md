# Mise en route de l'ERP MDC

**Interface web** (Apps Script) → **base de données** (Google Sheet). Les PDF sont générés dans Google Drive.

## Fichiers à coller (dossier `a-coller/`)
| Fichier | Dans Apps Script |
|---|---|
| `Code.gs` | Remplace tout le contenu de `Code.gs` (supprimez les autres fichiers .gs éventuels) |
| `Index.html` | Fichier HTML nommé `Index` |
| `appsscript.json` | Manifeste (Paramètres du projet > « Afficher le fichier manifeste ») |

Supprimez l'ancien fichier `NouvelleProforma` s'il existe.

## Installation
1. Fichier > Paramètres > Fuseau horaire : (GMT+03:00) Antananarivo. Idem dans Apps Script > Paramètres du projet.
2. Coller les 3 fichiers, enregistrer.
3. Exécuter `initialiserStructure`, autoriser (Paramètres avancés > Accéder à … > Autoriser).
   Votre adresse (propriétaire du script) devient **Superadmin** dans l'onglet `Utilisateurs`.
4. **Déployer > Nouveau déploiement > Application Web** : Exécuter en tant que **Moi**, Qui a accès : **Tout le monde**.
   L'accès réel est contrôlé par l'ERP : seules les adresses de l'onglet `Utilisateurs` (Actif) reçoivent un code.
5. Ouvrir l'URL `…/exec`, saisir votre e-mail, recevoir le code (expéditeur : votre Gmail), se connecter.
6. Après chaque mise à jour du code : Déployer > Gérer les déploiements > crayon > Nouvelle version > Déployer (même URL).

## Rôles
| Rôle | Accès |
|---|---|
| Formateur | « Mes formations » : phases 2 à 6, participants, présences, évaluations, attestations. Aucune donnée financière. |
| Administrateur | Clients, proformas, factures, paiements, formations, FMFP, catalogue, formateurs. Option « Est aussi formateur » → bascule d'espace. |
| Superadmin | Tout + Utilisateurs et rôles + Paramètres (TVA, société, numérotation, logo, HubSpot). |

## Sécurité
- Connexion par code à 6 chiffres envoyé par e-mail (10 min, 5 essais, 1 envoi / 45 s), session de 7 jours (paramètre `SESSION_DUREE_JOURS`), déconnexion manuelle.
- Chaque action est contrôlée côté serveur selon le rôle ; désactiver un utilisateur coupe son accès immédiatement.
- Gmail grand public : 100 e-mails/jour maximum via Apps Script (largement suffisant pour les codes).
