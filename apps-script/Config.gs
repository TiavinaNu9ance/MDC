/**
 * MDC ERP — Configuration : onglets, colonnes, listes de valeurs.
 */
const ONGLETS = {
  PARAMS: 'Paramètres',
  COMPTEURS: 'Compteurs',
  GROUPES: 'Groupes',
  ENTITES: 'Entités',
  CATALOGUE: 'Catalogue',
  FORMATEURS: 'Formateurs',
  PROFORMAS: 'Proformas',
  FACTURES: 'Factures',
  LIGNES: 'Lignes',
  PAIEMENTS: 'Paiements',
  SESSIONS: 'Sessions',
  PARTICIPANTS: 'Participants',
  FMFP: 'Suivi FMFP',
  DASHBOARD: 'Tableau de bord',
  EXPORTS: 'Exports',
  IMPORT: 'Import HubSpot',
  JOURNAL: 'Journal'
};

const COLONNES = {
  'Paramètres': ['Clé', 'Valeur', 'Description'],
  'Compteurs': ['Année', 'Type', 'Dernier numéro', 'Mis à jour le'],
  'Groupes': ['ID Groupe', 'Nom du groupe', 'HubSpot ID', 'Notes'],
  'Entités': ['ID Entité', 'Raison sociale', 'ID Groupe', 'Adresse', 'Email', 'Téléphone', 'NIF', 'STAT',
    'Contact principal', 'HubSpot ID', 'Source', 'Mis à jour le'],
  'Catalogue': ['Code', 'Domaine', 'Désignation', 'Niveau', 'Durée (h)', 'Prix unitaire HT', 'Unité', 'Actif'],
  'Formateurs': ['ID Formateur', 'Nom', 'Email', 'Téléphone', 'Domaines', 'Lien CV (FMFP)', 'Tarif journalier', 'Actif'],
  'Proformas': ['ID', 'N°', 'Date', 'Validité (jours)', 'ID Entité', 'Raison sociale', 'Contact client', 'Objet',
    'Lieu', 'Total HT', 'TVA', 'Total TTC', 'Statut', 'ID Session', 'Lien PDF', 'Créée le'],
  'Factures': ['ID', 'N°', 'Date', 'Type', '%', 'N° Proforma', 'ID Entité', 'Raison sociale', 'Contact client',
    'Total HT', 'TVA', 'Total TTC', 'Compte dans encaissements', 'Montant payé', 'Reste à payer',
    'Statut paiement', 'Date dernier paiement', 'Statut', 'Lien PDF', 'Créée le'],
  'Lignes': ['ID Document', 'Ordre', 'Code', 'Domaine', 'Désignation', 'Lieu', 'Durée', 'Quantité',
    'Prix unitaire HT', 'Montant HT'],
  'Paiements': ['Date', 'N° Facture', 'Montant', 'Mode', 'Référence', 'Saisi le'],
  'Sessions': ['ID Session', 'ID Entité', 'Raison sociale', 'Intitulé', 'Formateur(s)', 'Date début', 'Date fin',
    'Lieu', 'Nb participants', 'N° Proforma', 'FMFP',
    'P1 Analyse des besoins', 'P2 Test de niveau', 'P3 Validation des niveaux',
    'P4 Suivi pendant la formation', 'P5 Évaluation finale', 'P6 Clôture et compte rendu',
    'Phase actuelle', 'Alerte', 'Lien dossier', 'Notes'],
  'Participants': ['ID Session', 'Nom', 'Fonction', 'Email', 'Niveau test (P2)', 'Niveau validé (P3)',
    'Présence (%)', 'Note évaluation (P5)', 'Attestation'],
  'Suivi FMFP': ['ID Session', 'ID Entité', 'Raison sociale', 'N° Proforma', 'Étape', 'Date étape',
    'N° Facture 100 %', 'N° Facture 70 %', 'N° Facture 30 %', 'CV formateurs envoyés', 'Rapports envoyés',
    'Fiches de présence envoyées', 'Prochaine relance', 'Relance HubSpot créée', 'Commentaire'],
  'Tableau de bord': ['Indicateur', 'Valeur', 'Détail'],
  'Exports': ['N°', 'Date', 'Type', 'N° Proforma', 'ID Entité', 'Raison sociale', 'ID Session',
    'Dossier session (PC)', 'Dossier cible (PC)', 'Nom du fichier', 'Lien Drive', 'Classé sur le PC', 'Exporté le'],
  'Import HubSpot': ['Record ID', 'Company name', 'Parent company ID', 'Street address', 'City', 'Phone number', 'Email'],
  'Journal': ['Horodatage', 'Action', 'Détail', 'Utilisateur']
};

const STATUT_PHASE = ['À faire', 'En cours', 'Fait', 'N.A.'];
const STATUT_PROFORMA = ['Brouillon', 'Émise', 'Acceptée', 'Refusée', 'Annulée'];
const STATUT_FACTURE = ['Émise', 'Annulée'];
const MODES_PAIEMENT = ['Virement', 'Chèque', 'Espèces', 'MVola', 'Autre'];

/** Types de facture créés depuis une proforma. compte = entre dans les encaissements. */
const TYPES_FACTURE = {
  FMFP_100: { libelle: 'Facture 100 % (dossier FMFP)', pct: 100, compte: false },
  ACOMPTE: { libelle: 'Acompte', pct: null, compte: true },   // % = paramètre POURCENT_ACOMPTE
  SOLDE: { libelle: 'Solde', pct: null, compte: true },       // % = 100 - acomptes déjà facturés
  TOTALE: { libelle: 'Facture totale', pct: 100, compte: true }
};

/** Étapes du dossier FMFP (processus décrit par Tiavina le 02/11/2026). */
const ETAPES_FMFP = [
  '1. À préparer',
  '2. Dossier envoyé (facture 100 % + CV formateurs)',
  '3. Facture 70 % envoyée',
  '4. Acompte 70 % reçu',
  '5. Formation réalisée',
  '6. Post-formation envoyé (rapports + présences + facture 30 %)',
  '7. Solde 30 % reçu',
  '8. Clôturé'
];

const PARAMS_DEFAUT = [
  ['SOCIETE_NOM', 'MADAGASCAR DATA CAMP SARLU', 'Raison sociale'],
  ['SOCIETE_NOM_COURT', 'Madagascar Data Camp', ''],
  ['SOCIETE_ADRESSE', 'Lot II L 4 DE Ankadivato, Antananarivo 101, Madagascar', ''],
  ['SOCIETE_EMAIL', 'contact@datacamp.business', ''],
  ['SOCIETE_TEL', '038 59 637 90', ''],
  ['SOCIETE_NIF', '4012353768', ''],
  ['SOCIETE_STAT', '70202 11 2022 0 11337', ''],
  ['SOCIETE_RCS', '2022B01295', ''],
  ['MENTION_FISCALE_SUP', '', 'Mention fiscale supplémentaire en pied de page (à valider avec le comptable)'],
  ['TVA_APPLICABLE', 'Oui', 'Oui / Non. Assujettissement à faire confirmer (récépissé 2025 = impôt synthétique, aucune pièce TVA trouvée).'],
  ['TAUX_TVA', 0.2, 'Taux de TVA si applicable (20 % = 0.2). À CONFIRMER avec le comptable.'],
  ['DEVISE', 'Ar', ''],
  ['POURCENT_ACOMPTE', 70, 'Pourcentage par défaut de la facture d\'acompte'],
  ['CONDITIONS_PAIEMENT', 'Au comptant — 70 % avant la date de la formation / 30 % après la date de fin de la formation', ''],
  ['RIB', 'Banque BMOI Tsaralalana Antananarivo 101 Madagascar — Compte N° 00004 00002 04813420101 10 — Titulaire : Madagascar Data Camp', ''],
  ['MVOLA', '038 59 637 90', 'Affiché seulement pour les particuliers'],
  ['VALIDITE_PROFORMA_JOURS', 30, 'Validité par défaut d\'une proforma'],
  ['DELAI_RELANCE_FMFP_JOURS', 7, 'Jours entre une étape FMFP et la relance'],
  ['LOGO_FILE_ID', '', 'ID Google Drive du logo MDC (PNG/JPG)'],
  ['SIGNATURE_FILE_ID', '', 'ID Google Drive de l\'image tampon + signature (optionnel)'],
  ['DOSSIER_EXPORT_ID', '', 'Rempli par l\'initialisation : dossier Drive des PDF'],
  ['COMPTEUR_DEPART_DE_2026', 70, 'Dernier n° de facture déjà utilisé en 2026 (ancienne série). Prochaine = +1'],
  ['COMPTEUR_DEPART_PF_2026', 72, 'Dernier n° de proforma utilisé en 2026 (2605-F-PF-00072 HELIOS). Prochaine = +1'],
  ['COULEUR_PRINCIPALE', '#1B2B5E', ''],
  ['COULEUR_ACCENT', '#C89B2A', '']
];

const CATALOGUE_DEFAUT = [
  // Code, Domaine, Désignation, Niveau, Durée, Prix, Unité
  ['XL-N1', 'Excel', 'Microsoft Excel — Niveau Découverte', 'N1', 12, 300000, 'participant'],
  ['XL-N2', 'Excel', 'Microsoft Excel — Niveau Imprégnation', 'N2', 12, 300000, 'participant'],
  ['XL-N3', 'Excel', 'Microsoft Excel — Niveau Exploitation', 'N3', 12, 350000, 'participant'],
  ['XL-N4', 'Excel', 'Microsoft Excel — Niveau Perfectionnement', 'N4', 15, 450000, 'participant'],
  ['XL-SILVER', 'Excel', 'Microsoft Excel — Pack Silver', 'Pack', 18, 500000, 'participant'],
  ['XL-GOLD', 'Excel', 'Microsoft Excel — Pack Gold', 'Pack', 21, 650000, 'participant'],
  ['XL-PREMIUM', 'Excel', 'Microsoft Excel — Pack Premium', 'Pack', 30, 900000, 'participant'],
  ['XL-ALLIN', 'Excel', 'Microsoft Excel — Pack All-In', 'Pack', 30, 1150000, 'participant'],
  ['PBI-N1', 'Power BI', 'Power BI — Niveau 1', 'N1', 15, 500000, 'participant'],
  ['PBI-N2', 'Power BI', 'Power BI — Niveau 2', 'N2', 15, 500000, 'participant'],
  ['PBI-N3', 'Power BI', 'Power BI — Niveau 3', 'N3', 15, 500000, 'participant'],
  ['PBI-N4', 'Power BI', 'Power BI — Niveau 4', 'N4', 12, 400000, 'participant'],
  ['PBI-SILVER', 'Power BI', 'Power BI — Pack Silver', 'Pack', 24, 900000, 'participant'],
  ['PBI-GOLD', 'Power BI', 'Power BI — Pack Gold', 'Pack', 27, 1350000, 'participant'],
  ['PBI-PREMIUM', 'Power BI', 'Power BI — Pack Premium', 'Pack', 30, 1650000, 'participant'],
  ['PBI-ALLIN', 'Power BI', 'Power BI — Pack All-In', 'Pack', 36, 1800000, 'participant'],
  ['IA-N1', 'IA', 'Intelligence artificielle — Niveau 1', 'N1', 12, 400000, 'participant'],
  ['IA-N2', 'IA', 'Intelligence artificielle — Niveau 2', 'N2', 12, 500000, 'participant'],
  ['IA-N3', 'IA', 'Intelligence artificielle — Niveau 3', 'N3', 15, 700000, 'participant'],
  ['IA-PACK', 'IA', 'Intelligence artificielle — Pack', 'Pack', 39, 1600000, 'participant'],
  ['NO-N1', 'Notion', 'Notion — Niveau 1', 'N1', 12, 400000, 'participant'],
  ['NO-N2', 'Notion', 'Notion — Niveau 2', 'N2', 12, 400000, 'participant'],
  ['NO-N3', 'Notion', 'Notion — Niveau 3', 'N3', 12, 500000, 'participant'],
  ['NO-PACK', 'Notion', 'Notion — Pack', 'Pack', 36, 1300000, 'participant'],
  ['DIV-PC', 'Divers', 'Location PC', '', '', 50000, 'PC'],
  ['DIV-DEPL', 'Divers', 'Frais de déplacement formateur', '', '', 30000, 'jour'],
  ['DIV-FOURN', 'Divers', 'Fournitures et supports', '', '', 15000, 'participant'],
  ['DIV-RESTO', 'Divers', 'Restauration', '', '', 20000, 'participant'],
  ['DIV-SALLE', 'Divers', 'Location salle', '', '', 0, 'jour'],
  ['DIV-PERSO', 'Divers', 'Prestation personnalisée', '', '', 0, 'forfait'],
  ['DIV-REMISE', 'Divers', 'Remise', '', '', 0, 'forfait']
];

/** Les 6 phases MDC, dans l'ordre (colonnes de l'onglet Sessions). */
const PHASES = ['P1 Analyse des besoins', 'P2 Test de niveau', 'P3 Validation des niveaux',
  'P4 Suivi pendant la formation', 'P5 Évaluation finale', 'P6 Clôture et compte rendu'];
