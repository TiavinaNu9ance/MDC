# Site web MDC

Site statique (HTML, CSS, JavaScript), sans outil de build, dans le dossier `site/`.

## 1. Analyse du concurrent (datapiloteconsult.com, lue le 10/11/2026)

| Élément | Data Pilote Consulting |
|---|---|
| Technique | Application React (JS), contenu chargé en JavaScript : peu lisible par Google sans rendu |
| Couleurs | Bleu nuit #0A1628 (texte), vert #2D8C5A (principal), orange #F5A623 (accent), fonds gris-bleu #F1F5F9 / #E8EDF5 |
| Polices | Poppins (titres et texte), Inter (boutons) |
| Titres | h1 48 px gras, h2 42 px extra-gras, interlettrage négatif |
| Formes | Cartes blanches arrondies (≈ 20 px), ombres douces bleutées, boutons arrondis 10 px avec dégradé vert |
| Structure | Menu (8 liens) → hero (titre, texte tapé, 2 boutons, grille d'icônes outils) → chiffres (6 parcours, 16+ modules, 3 experts, 5/5) → logos partenaires défilants → outils enseignés (orbite d'icônes IA) → 6 cartes formations → 3 services (dashboards, Power BI, ERP) → qui sommes-nous + 1 témoignage → formulaire de contact → bandeau CTA → pied de page (NIF/STAT, brochure PDF) |
| Interactions | Texte qui s'écrit, apparition au défilement, logos qui défilent, reflet animé sur les boutons, flottement, mode sombre, chatbot avec avatar, carrousel d'avis |
| Points forts | Moderne, rassurant (chiffres, logos, attestation), CTA répétés, catalogue PDF, espace étudiant |
| Points faibles | Peu de preuves réelles (1 seul avis), beaucoup de liens de menu, contenu non indexable sans JS, pas de démarche pédagogique ni de FMFP mis en avant |

## 2. Choix pour MDC (style propre, rien n'est repris)

| Élément | MDC |
|---|---|
| Couleurs | Charte MDC : navy #1B2B5E, bleu nuit du logo #0E2537, or #C89B2A ; fond crème #F8F7F3 |
| Polices | Syne (titres) et DM Sans (texte), celles du catalogue 2026 |
| Message | Slogan « Former aujourd'hui pour performer demain », formateurs consultants BI, démarche en 6 étapes, montage FMFP |
| Visuel principal | Tableau de bord animé (courbe qui se trace, barres, compteurs) au lieu d'une grille d'icônes |
| Sections | Hero → chiffres vérifiés → références → catalogue par onglets → démarche 6 étapes (fond sombre) → 3 engagements → entreprises & FMFP (grille bento) → FAQ → contact → bandeau final |
| UX | 1 action principale (« Demander un devis ») partout ; clic sur une formation = formulaire pré-rempli ; WhatsApp ; menu court (5 liens) ; contenu en HTML (indexable) ; accessibilité (clavier, contraste, réduction des animations) ; mobile d'abord |

## 3. Réglages (fichier `site/assets/js/main.js`, en haut)

| Réglage | Effet |
|---|---|
| `SHOW_PRICES` | `true` affiche les prix du catalogue (Ar / participant), `false` affiche « Tarif sur demande » |
| `HUBSPOT_PORTAL_ID` + `HUBSPOT_FORM_GUID` | Envoie les demandes directement dans HubSpot (recommandé, objectif 30 leads mesurables) |
| `FORM_ENDPOINT` | Alternative : adresse Formspree |
| Aucun des deux | Le formulaire ouvre la messagerie du visiteur avec le message prêt |

Couleurs et polices : variables en haut de `site/assets/css/style.css`.

## 4. À faire avant la mise en ligne publique

- [ ] Logo : copier `D:\MDC\Logo\Logo MDC\Logo_court_sansfond.png` dans `site/assets/img/logo.png`, puis remplacer `logo.svg` par `logo.png` dans les 3 fichiers HTML (le SVG actuel est provisoire).
- [ ] Choisir entre le navy du logo (#0E2537) et celui du catalogue (#1B2B5E) : actuellement les deux sont utilisés.
- [ ] Accord des clients cités dans le bandeau « Ils nous ont fait confiance » (liste reprise du catalogue 2026).
- [ ] URL LinkedIn et Facebook (inconnues).
- [ ] Nom du directeur de la publication et hébergeur dans `mentions-legales.html`.
- [ ] Domaine : `datacamp.business` est supposé (déduit de l'e-mail). À confirmer ; sinon modifier les URL dans `index.html`, `robots.txt`, `sitemap.xml`.

## 5. Mise en ligne

### Test en 2 minutes (sans compte GitHub)
1. Aller sur https://app.netlify.com/drop (créer un compte gratuit).
2. Glisser-déposer le dossier `site` → une adresse du type `https://nom-au-hasard.netlify.app` est créée.
3. Renommer le site : *Site configuration > Change site name* (ex. `mdc-formation`).

### Version suivie (mise à jour automatique à chaque push)
1. Netlify > *Add new site > Import an existing project > GitHub* > dépôt `MDC`, branche voulue.
2. Le fichier `netlify.toml` indique de publier `site/`. Aucune commande de build.

### Brancher le domaine Namecheap
1. Netlify > *Domain management > Add a domain* > saisir le domaine (ex. `datacamp.business`).
2. Namecheap > *Domain List > Manage > Advanced DNS* :
   - supprimer les enregistrements de parking (`CNAME www → parkingpage.namecheap.com`, `URL Redirect @`) ;
   - ajouter `A Record`, Host `@`, Value `75.2.60.5` ;
   - ajouter `CNAME Record`, Host `www`, Value `<nom-du-site>.netlify.app.`
   - **ne pas toucher aux enregistrements MX et TXT** : ils font fonctionner l'adresse contact@datacamp.business.
3. Attendre la propagation DNS (souvent moins d'1 h, jusqu'à 48 h). Netlify active ensuite le HTTPS gratuit (Let's Encrypt) : *Domain management > HTTPS > Verify DNS configuration*.

### Test local
```bash
cd site && python3 -m http.server 8000
```
puis ouvrir http://localhost:8000.
