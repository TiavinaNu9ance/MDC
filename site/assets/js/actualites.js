/* =========================================================
   ACTUALITÉS MDC : c'est ici que vous ajoutez vos nouvelles.
   Modifiez ce fichier dans cPanel (File Manager > assets/js/actualites.js > Edit).

   Règles :
   - Une actualité = un bloc { ... }, séparé du suivant par une virgule.
   - date au format AAAA-MM-JJ (ex. '2027-02-15'). Sans date : laisser ''.
   - Les offres dont la date de fin est passée disparaissent seules.
   - Les événements passés s'affichent en « Terminé » (les 3 derniers).
   - lien : adresse externe (inscription, Facebook, Teams…) ou '' pour ouvrir le formulaire du site.
   - Les blocs avec exemple: true ne s'affichent qu'en aperçu (adresse du site suivie de ?apercu).
   ========================================================= */
window.MDC_ACTUS = {

  /* ---------- OFFRES DE FORMATION À VENIR ---------- */
  offres: [
    {
      titre: 'Plan de formation data 2027 financé FMFP',
      statut: 'Bientôt',               // ex. 'Inscriptions ouvertes', 'Places limitées', 'Complet', 'Bientôt'
      date: '', fin: '',
      domaine: 'excel',                // excel, pbi, ia, notion ou '' (logo affiché)
      lieu: 'Dans vos locaux ou en ligne',
      format: 'Intra-entreprise',
      description: 'Construisez avec nous le plan de formation Excel, Power BI et IA de vos équipes pour 2027, avec le montage du dossier FMFP.',
      prix: '',
      lien: ''
    },
    {
      exemple: true,
      titre: 'Session inter-entreprises Power BI Découverte',
      statut: 'Inscriptions ouvertes',
      date: '2027-02-15', fin: '2027-02-19',
      domaine: 'pbi',
      lieu: 'Antananarivo',
      format: 'Présentiel, 15 h',
      description: 'Exemple de présentation d\'une session : 5 demi-journées pour créer vos premiers rapports.',
      prix: '500 000 Ar / participant',
      lien: ''
    }
  ],

  /* ---------- AUTRES ÉVÉNEMENTS (webinaires, ateliers, salons, remises d'attestations…) ---------- */
  evenements: [
    {
      exemple: true,
      titre: 'Webinaire : l\'IA générative au service des PME',
      type: 'Webinaire',
      date: '2027-01-28', heure: '10h00 – 11h00',
      lieu: 'En ligne',
      description: 'Exemple d\'événement : démonstration en direct et questions-réponses.',
      lien: ''
    },
    {
      exemple: true,
      titre: 'Remise des attestations, promotion Excel',
      type: 'Cérémonie',
      date: '2026-10-30', heure: '',
      lieu: 'Antananarivo',
      description: 'Exemple d\'événement passé.',
      lien: ''
    }
  ]
};
