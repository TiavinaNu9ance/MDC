# ERP MDC — Architecture

## Périmètre
| Domaine | Outil |
|---|---|
| Prospection, clients, e-mails de suivi | **HubSpot** (source de référence) |
| Proformas, factures, paiements, formations, FMFP | **Google Sheet + Apps Script** (ce dépôt, dossier `apps-script/`) |
| Classement des PDF sur l'ordinateur | Session « Gestion et mise en place de société » → `D:\MDC\Gestion MDC` |

## Onglets
| Onglet | Rôle |
|---|---|
| Paramètres | Coordonnées MDC, TVA, RIB, compteurs de départ, logo |
| Compteurs | Dernier numéro par année et par type (PF/DE) |
| Groupes / Entités | Groupe (ex. RAJABALI) → entités facturées (NOVOTEL, EDEN…). Alimenté par HubSpot (entreprise mère = groupe) |
| Catalogue | Formations 2026 et frais annexes (PC, déplacement, fournitures, restauration, salle, remise) |
| Formateurs | Nom, domaines, lien CV FMFP, tarif |
| Proformas / Factures / Lignes | Documents et leurs lignes |
| Paiements | Encaissements ; recalcul automatique du reste à payer |
| Sessions | Une ligne par formation + statut des 6 phases MDC + alertes |
| Participants | Test de niveau, niveau validé, présence, évaluation, attestation (≥ 80 %) |
| Suivi FMFP | Étapes du dossier, factures liées, pièces envoyées, relances |
| Tableau de bord | Facturé, reste à encaisser, sessions, alertes, relances |
| Exports | Un PDF par ligne : type, session, dossier cible sur le PC, lien Drive, case « Classé sur le PC » |
| Import HubSpot | Import manuel si pas de clé API |
| Journal | Trace de chaque action |

## Flux
1. **Proforma** : menu *Nouvelle proforma…* → choix de l'entité, lignes du catalogue → *Créer et émettre* (numéro + PDF).
2. **Session** : *Formations > Créer la session depuis la proforma* → FMFP oui/non → dossier FMFP créé si oui.
3. **Factures** depuis la proforma : 100 % FMFP, acompte 70 %, solde (reste), ou totale.
4. **Paiement** : sélectionner la facture → *Enregistrer un paiement*.
5. **6 phases** : mettre à jour les colonnes P1…P6 de *Sessions* ; *Contrôler les 6 phases* signale les écarts (phase sautée, formation démarrée sans test de niveau, formateur absent, attestation < 80 %).

## Processus FMFP (décrit par Tiavina)
| Étape | Pièces |
|---|---|
| 2. Dossier envoyé | Facture 100 % + CV des formateurs prévus |
| 3. Facture 70 % envoyée | Facture d'acompte 70 % |
| 4. Acompte reçu | (ajout ERP : suivi du paiement) |
| 5. Formation réalisée | |
| 6. Post-formation envoyé | Rapports de formation + fiches de présence + facture 30 % |
| 7. Solde reçu | (ajout ERP) |
| 8. Clôturé | |

Chaque changement d'étape date l'étape et programme une relance (paramètre `DELAI_RELANCE_FMFP_JOURS`). *HubSpot > Créer les relances FMFP dues* crée une tâche « e-mail » sur l'entreprise dans HubSpot ; l'e-mail est envoyé depuis HubSpot.

## TVA
Paramètres `TVA_APPLICABLE` (Oui/Non) et `TAUX_TVA` (20 % par défaut). Tiavina indique que MDC est assujettie ; **aucune pièce ne le confirme** dans D:\MDC (récépissé DGI 2025 = impôt synthétique, factures 2026 sans TVA, ancien modèle « TVA 0 % »). À valider avec le comptable (carte fiscale 2026 / attestation d'assujettissement) avant d'émettre. Avec `TVA_APPLICABLE = Non`, les PDF n'affichent ni HT, ni TVA, ni TTC.

## PDF
Générés dans Google Drive : `MDC ERP - Exports PDF/Proformas/AAAA` et `.../Factures/AAAA`, nom `<N°> <Entité>[ - <Type>].pdf`.
Rapatriement sur l'ordinateur : Google Drive pour ordinateur (à installer par Tiavina, non installé au 02/11/2026) ou téléchargement zip. La session « Assistant MDC » **copie** ensuite les PDF dans `D:\MDC\Gestion MDC` en suivant l'onglet **Exports** :
- Proforma → `02 Finance\Proformas et devis\AAAA\`
- Toutes les factures → `02 Finance\Factures emises\AAAA\` (à plat)
- Copie de chaque document lié à une session → `04 Formations\Sessions\AAAA-MM Entité - Formation\Facturation\`
- AAAA = année du numéro. Elle coche « Classé sur le PC » une fois la copie faite (à la main ou sur instruction).

## Sécurité
- La clé HubSpot est stockée dans les propriétés du script, jamais dans la feuille.
- La synchro HubSpot n'écrase jamais NIF, STAT, e-mail, contact saisis dans l'ERP.
