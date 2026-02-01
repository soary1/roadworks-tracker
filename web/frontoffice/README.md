# Frontoffice - Interface Publique

## Description

Le frontoffice est une application web publique permettant aux citoyens de visualiser les signalements de problèmes de voirie sur une carte interactive. Aucune authentification n'est requise pour accéder à cette interface.

## Technologies Utilisées

| Technologie | Version | Description |
|-------------|---------|-------------|
| React | 19.2.3 | Framework JavaScript frontend |
| Vite | 6.0.0 | Outil de build rapide |
| React Router DOM | 7.0.0 | Gestion du routage |
| Leaflet | 1.9.4 | Bibliothèque de cartographie |
| React-Leaflet | 5.0.0 | Wrapper React pour Leaflet |

## Structure du Projet

```
frontoffice/
├── src/
│   ├── components/
│   │   ├── MapView.jsx           # Conteneur de carte et marqueurs
│   │   └── DashboardView.jsx     # Vue statistiques
│   ├── pages/
│   │   └── MapPage.jsx           # Page principale avec carte
│   ├── App.jsx                   # Routeur simple
│   ├── main.jsx                  # Point d'entrée
│   └── mapIcons.js               # Configuration des icônes
├── public/
├── package.json
└── vite.config.js
```

## Fonctionnalités

### 1. Carte Interactive
- Affichage de tous les signalements sur une carte Leaflet
- Marqueurs personnalisés selon le type de problème
- Popups avec informations détaillées
- Navigation et zoom fluides

### 2. Vue Tableau de Bord
- Statistiques globales
- Répartition par type de problème
- Répartition par statut

### 3. Vue Liste
- Liste des signalements
- Tri et filtrage

### 4. Multi-vues
L'application propose trois vues :
- **Carte** : Visualisation géographique
- **Dashboard** : Statistiques et graphiques
- **Liste** : Vue tabulaire

## Installation

```bash
# Installer les dépendances
npm install

# Démarrer en mode développement
npm run dev

# Build pour production
npm run build

# Prévisualiser le build
npm run preview
```

## Configuration

### Variables d'Environnement

Créer un fichier `.env` à la racine :

```env
VITE_API_URL=http://localhost:8080/api
```

## API Endpoints Utilisés

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | `/api/signalements` | Récupérer tous les signalements |
| GET | `/api/signalements/status/{status}` | Filtrer par statut |

## Types de Problèmes Supportés

L'application supporte les types de problèmes en français et anglais :

| Français | Anglais | Icône |
|----------|---------|-------|
| Nid de poule | Pothole | pothole |
| Inondation | Flood | flood |
| Fissure | Crack | crack |
| Effondrement | Collapse | collapse |
| Signalisation endommagée | Damaged Sign | damaged_sign |
| Éclairage défectueux | Street Light | street_light |
| Débris sur la route | Debris | debris |
| Autre | Other | other |

## Format des Coordonnées

Les coordonnées de localisation sont parsées au format :
```
latitude,longitude
```

Exemple : `-18.8792,47.5079`

## Affichage des Statuts

| Statut | Couleur/Style |
|--------|---------------|
| nouveau | Badge bleu |
| en_cours | Badge orange |
| resolu | Badge vert |
| rejete | Badge rouge |

## Scripts Disponibles

```bash
npm run dev      # Démarre le serveur de développement
npm run build    # Compile pour production
npm run preview  # Prévisualise le build
npm run lint     # Vérifie le code avec ESLint
```

## Port par Défaut

- Développement : `http://localhost:5173`

## Dépendances Docker

Dans le docker-compose, le frontoffice dépend du backend :

```yaml
frontoffice:
  build: ./web/frontoffice
  ports:
    - "5173:5173"
  depends_on:
    - backend
```

## Accessibilité

- Interface responsive
- Navigation au clavier
- Couleurs contrastées pour les marqueurs

## Performance

- Lazy loading des composants
- Optimisation des marqueurs de carte
- Cache des tuiles de carte
