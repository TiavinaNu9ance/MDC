/* Catalogue MDC 2026 : contenu recopié de Catalogue_Formation_MDC_2026.html.
   Pour modifier une formation, changer le texte ci-dessous (garder les guillemets). */
(function () {
  var INTRO = {
    excel: "De la maîtrise des bases essentielles jusqu'à l'automatisation avancée avec Power Query et Power Pivot, pour débutants, analystes, managers ou responsables financiers.",
    pbi: "L'outil incontournable de la Business Intelligence : Power BI Desktop, DAX et Power BI Service.",
    ia: "Optimiser la productivité, améliorer la prise de décision et automatiser : de la découverte des outils jusqu'à leur intégration stratégique.",
    notion: "Centraliser les données, améliorer la collaboration et piloter efficacement les activités, de la prise en main jusqu'à la construction de systèmes complets et collaboratifs."
  };
  function lvl(dom, niveau, prerequis, programme, extra) {
    var o = { niveau: niveau, prerequis: prerequis, programme: programme, intro: INTRO[dom] };
    o.resume = niveau + ' · ' + (prerequis === 'Aucun' ? 'aucun prérequis' : 'prérequis : ' + prerequis.charAt(0).toLowerCase() + prerequis.slice(1));
    for (var k in extra || {}) o[k] = extra[k];
    return o;
  }
  function pack(dom, soustitre, contient, programme, extra) {
    var o = { resume: soustitre, contient: contient, programme: programme, intro: INTRO[dom] };
    for (var k in extra || {}) o[k] = extra[k];
    return o;
  }
  var EX = { format: 'Présentiel ou en ligne' };
  var ATT = { format: 'Attestation MDC à chaque niveau' };

  window.MDC_CATALOGUE = {
    /* ---------- EXCEL ---------- */
    'excel-1': lvl('excel', 'Débutant', 'Aucun', ['Principes de calcul et formules de base', 'Formats et mise en forme des cellules', 'Identification et correction des erreurs', 'Syntaxe des fonctions essentielles', 'Les références essentielles'], EX),
    'excel-2': lvl('excel', 'Intermédiaire', 'Niveau 1 ou équivalent', ['Fonctions avancées (RECHERCHEV, INDEX, EQUIV…)', 'Imbrication de fonctions pour calculs complexes', 'Références absolues, relatives et mixtes', 'Optimisation des feuilles de calcul'], EX),
    'excel-3': lvl('excel', 'Avancé', 'Niveau 2 ou équivalent', ['Tableaux croisés dynamiques (TCD)', 'Validation de données et mise en forme conditionnelle', 'Filtres de données et sous-totaux', 'Création et personnalisation de graphiques'], EX),
    'excel-4': lvl('excel', 'Expert', 'Bonne maîtrise des TCD', ['Initiation à Power Query', 'Initiation à Power Pivot', 'Analyse de données avec les outils avancés'], EX),
    'excel-silver': pack('excel', 'Bases solides et fonctions avancées', ['Niveau 1 Découverte', 'Niveau 2 Imprégnation'], ['Les bases du logiciel Excel (valeurs, opérateurs, références)', 'Les bonnes pratiques', 'La syntaxe des fonctions', 'Les fonctions de base et imbriquées', 'Les références dans les fonctions'], EX),
    'excel-gold': pack('excel', 'Fonctions avancées, analyse et visualisation', ['Niveau 2 Imprégnation', 'Niveau 3 Exploitation'], ['Les fonctions avancées sur Excel', 'Les tableaux croisés dynamiques', 'La validation des données', 'La mise en forme conditionnelle', 'Les graphiques'], EX),
    'excel-premium': pack('excel', 'Analyse avancée, Power Query et Power Pivot', ['Niveau 2 Imprégnation', 'Niveau 3 Exploitation', 'Niveau 4 Perfectionnement'], ['Les fonctions avancées sur Excel', 'Les tableaux croisés dynamiques', 'La validation des données et les graphiques', 'Automatisation avec Power Query et Power Pivot'], EX),
    'excel-all-in': pack('excel', 'Parcours complet, du débutant à l\'expert', ['Niveau 1 Découverte', 'Niveau 2 Imprégnation', 'Niveau 3 Exploitation', 'Niveau 4 Perfectionnement'], ['Les bases d\'Excel', 'Les fonctions et tableaux croisés dynamiques', 'Les graphiques et la validation des données', 'Automatisation complète avec Power Query et Power Pivot'], EX),

    /* ---------- POWER BI ---------- */
    'pbi-1': lvl('pbi', 'Débutant', 'Bases Excel recommandées', ['Présentation de l\'outil Power BI Desktop', 'Initiation à Power Query', 'Initiation à la création de graphiques', 'Principe des liaisons entre tables', 'Initiation aux mesures DAX simples']),
    'pbi-2': lvl('pbi', 'Intermédiaire', 'Niveau 1 ou équivalent', ['Création de mesures simples et avancées', 'Fonctions DAX avancées', 'Fonctions de time intelligence', 'Fonctions imbriquées et variables']),
    'pbi-3': lvl('pbi', 'Avancé', 'Niveaux 1 et 2', ['Personnalisation des visuels', 'Partage de rapports', 'Utilisation de Power BI Service', 'Modes d\'actualisation des données', 'Création d\'applications']),
    'pbi-4': lvl('pbi', 'Expert', 'Les 3 premiers niveaux', ['Partage sur Teams et PowerPoint', 'Création de tableaux de bord avancés', 'Création d\'alertes', 'Fonctionnalités avancées de Power Query', 'Perfectionnement des visuels']),
    'pbi-silver': pack('pbi', 'ETL Power Query et fondamentaux DAX', ['Niveau 1 Découverte', 'Niveau 2 Imprégnation'], ['La base de l\'ETL avec Power Query', 'Les bases de la création de visuels', 'Les fonctions DAX de base à connaître', 'Les fonctions DAX les plus utilisées']),
    'pbi-gold': pack('pbi', 'DAX avancé et Power BI Service', ['Niveau 2 Imprégnation', 'Niveau 3 Exploitation'], ['ETL Power Query (base et avancé)', 'La base de la création de rapports', 'Les fonctions DAX les plus utiles', 'Publication et Power BI Service']),
    'pbi-premium': pack('pbi', 'Rapports complets et tableaux de bord stratégiques', ['Niveau 2 Imprégnation', 'Niveau 3 Exploitation', 'Niveau 4 Perfectionnement'], ['Création de visuels simples et élaborés', 'Fonctions DAX simples et complexes', 'Power BI Service (partage et gouvernance)']),
    'pbi-all-in': pack('pbi', 'Parcours complet Power BI, du débutant à l\'expert', ['Niveau 1 Découverte', 'Niveau 2 Imprégnation', 'Niveau 3 Exploitation', 'Niveau 4 Perfectionnement'], ['ETL Power Query basique et avancé', 'Création de visuels simples et élaborés', 'Fonctions DAX simples et complexes', 'Power BI Service : partage et pilotage']),

    /* ---------- IA ---------- */
    'ia-1': lvl('ia', 'Débutant', 'Aucun', ['Introduction approfondie à l\'IA générative', 'Exploration des outils (ChatGPT, Copilot…)', 'Initiation au prompt engineering', 'Ateliers : e-mails, synthèses, création de contenus', 'Bonnes pratiques et limites de l\'IA'], { public: 'Tous profils', format: ATT.format }),
    'ia-2': lvl('ia', 'Intermédiaire', 'Niveau 1 ou expérience équivalente', ['Prompt engineering avancé', 'Automatisation : reporting, synthèse, documents', 'Construction de workflows intelligents multi-outils', 'Mécanismes de contrôle et de validation des résultats'], { public: 'Analystes, responsables', format: ATT.format }),
    'ia-3': lvl('ia', 'Stratégique', 'Maîtrise des niveaux 1 et 2', ['Audit et cartographie des opportunités IA', 'Conception de workflows d\'entreprise intégrant l\'IA', 'Études de cas sectorielles (finance, RH, marketing…)', 'Gouvernance IA : risques, sécurité, conformité'], { public: 'Managers, DSI, chefs de projet', format: ATT.format }),
    'ia-pack': pack('ia', 'Les 3 niveaux, adapté à tous les secteurs professionnels', ['Niveau 1 Découverte (12 h)', 'Niveau 2 Imprégnation (12 h)', 'Niveau 3 Exploitation (15 h)'], null, ATT),

    /* ---------- NOTION ---------- */
    'notion-1': lvl('notion', 'Débutant', 'Aucun', ['Introduction à Notion : concepts fondamentaux', 'Prise en main de l\'interface et navigation', 'Création de contenu (textes, listes, médias, liens)', 'Structuration de pages et sous-pages', 'Création de templates simples', 'Gestion de tâches basique'], { public: 'Tous profils', format: ATT.format }),
    'notion-2': lvl('notion', 'Intermédiaire', 'Niveau 1 ou équivalent', ['Introduction aux bases de données Notion', 'Vues multiples : table, kanban, calendrier', 'Filtres, tris et organisation dynamique', 'Structuration de workflows simples', 'Atelier : gestionnaire de tâches avancé'], { public: 'Analystes, managers, responsables administratifs', format: ATT.format }),
    'notion-3': lvl('notion', 'Avancé', 'Maîtrise des niveaux 1 et 2', ['Relations entre bases de données', 'Rollups et agrégation de données', 'Création de dashboards avancés', 'Introduction aux formules Notion', 'Collaboration : partage et permissions', 'Atelier : système complet projets et suivi'], { public: 'Managers, chefs de projet, équipes avancées', format: ATT.format }),
    'notion-pack': pack('notion', 'Les 3 niveaux, adapté aux équipes opérationnelles et aux managers', ['Niveau 1 Découverte (12 h)', 'Niveau 2 Imprégnation (12 h)', 'Niveau 3 Exploitation (12 h)'], null, ATT)
  };
})();
