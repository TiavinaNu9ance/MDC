# Numérotation des proformas et factures MDC

Validée par Tiavina le 02/11/2026. Appliquée automatiquement par l'ERP (`apps-script/Numerotation.gs`).

## Format

```
AAMM-F-TT-NNNNN
```

| Partie | Signification | Exemple |
|---|---|---|
| `AAMM` | Année et mois d'**émission** du document | `2611` = novembre 2026 |
| `F` | Fixe (« Facturation ») | `F` |
| `TT` | Type : `PF` = proforma, `DE` = facture définitive | `DE` |
| `NNNNN` | Compteur sur 5 chiffres | `00071` |

Exemples : `2611-F-PF-00073` (proforma), `2611-F-DE-00071` (facture).

## Règles

1. **Deux compteurs séparés** : un pour les proformas (PF), un pour les factures (DE).
2. **Compteur continu sur l'année civile** : il ne repart **pas** à 1 chaque mois. Il repart à 00001 le 1er janvier.
   - Ex. : dernière facture de novembre `2611-F-DE-00073` → première facture de décembre `2612-F-DE-00074`.
   - Première facture de 2027 : `2701-F-DE-00001`.
3. **Un numéro = un document.** Un numéro n'est **jamais réutilisé**, même pour les factures d'acompte :
   - facture 100 % (dossier FMFP), facture d'acompte 70 % et facture de solde 30 % ont **chacune leur propre numéro** ;
   - le lien entre elles se fait par la **référence à la proforma**, imprimée sur chaque facture (« Réf. proforma »).
4. **Pas de trou volontaire, pas de suppression.** Un document erroné est passé au statut « Annulée » ; son numéro reste consommé et n'est jamais réattribué. On émet ensuite un nouveau document.
5. **Le numéro est attribué à l'émission**, pas au brouillon. Une proforma en brouillon n'a pas de numéro.
6. **Toute facture est précédée d'une proforma** émise ou acceptée. L'ERP refuse de créer une facture sans proforma.
7. **Régénérer un PDF** (correction de mise en page, logo…) garde le même numéro. Une correction de montant impose une annulation + un nouveau document.

## Reprise de l'existant 2026

L'ancienne pratique a produit des doublons (compteur remis à 00001 en juin 2026, même numéro pour 70 % / 30 % / 100 %). Pour éviter toute collision :

- **Factures (DE)** : le compteur 2026 reprend à **00071** (le plus haut numéro déjà utilisé en 2026 est 00070). Paramètre `COMPTEUR_DEPART_DE_2026 = 70`.
- **Proformas (PF)** : le compteur 2026 reprend à **00073** (plus haut numéro 2026 : `2605-F-PF-00072`, HELIOS). Paramètre `COMPTEUR_DEPART_PF_2026 = 72`.
- Les factures émises avant l'ERP ne sont pas renumérotées.

## Où sont gérés les compteurs

Onglet **Compteurs** de la Google Sheet : une ligne par année et par type (dernier numéro attribué). Ne pas modifier à la main, sauf correction validée. L'attribution est protégée contre les doubles clics/accès simultanés (verrou) et contrôlée contre les doublons.

## Cycle type

| Étape | Document | Numéro |
|---|---|---|
| Offre | Proforma | `2611-F-PF-00073` |
| Dossier FMFP | Facture 100 % (non encaissée, pour le dossier) | `2611-F-DE-00071` |
| Avant formation | Facture d'acompte 70 % | `2611-F-DE-00072` |
| Après formation | Facture de solde 30 % | `2612-F-DE-00078` |

Client hors FMFP : proforma → acompte 70 % → solde 30 %, ou proforma → facture totale 100 %.
