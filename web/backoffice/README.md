# Backoffice - Tableau de Bord Administrateur

## Description

Le backoffice est une application web d'administration permettant aux gestionnaires de visualiser, gérer et traiter les signalements de problèmes de voirie soumis par les citoyens.

## Technologies Utilisées

| Technologie | Version | Description |
|-------------|---------|-------------|
| React | 19.2.3 | Framework JavaScript frontend |
| Vite | 6.0.0 | Outil de build rapide |
| React Router DOM | 7.1.1 | Gestion du routage |
| Leaflet | 1.9.4 | Bibliothèque de cartographie |
| React-Leaflet | 5.0.0 | Wrapper React pour Leaflet |
| Firebase | 10.14.1 | Données temps réel |
| STOMP.js | 7.2.1 | Messagerie WebSocket |
| SockJS-client | 1.6.1 | Fallback WebSocket |

## Structure du Projet

```
backoffice/
├── src/
│   ├── components/
│   │   ├── SignalementDetailModal.jsx  # Modal détails signalement
│   │   └── NotificationToast.jsx       # Notifications toast
│   ├── hooks/
│   │   └── useNotifications.js         # Hook notifications
│   ├── pages/
│   │   ├── LoginPage.jsx               # Page de connexion
│   │   ├── DashboardPage.jsx           # Tableau de bord principal
│   │   └── UsersPage.jsx               # Gestion des utilisateurs
│   ├── App.jsx                         # Routeur principal
│   ├── main.jsx                        # Point d'entrée
│   └── mapIcons.js                     # Icônes des problèmes
├── public/
├── package.json
└── vite.config.js
```

## Fonctionnalités

### 1. Authentification
- Connexion sécurisée avec JWT
- Protection des routes
- Déconnexion

### 2. Tableau de Bord
- Carte interactive avec tous les signalements
- Visualisation des problèmes par type (icônes différentes)
- Filtrage par statut (nouveau, en cours, résolu, rejeté)
- Mise à jour du statut des signalements

### 3. Gestion des Signalements
- Visualisation détaillée via modal
- Photos associées aux signalements
- Historique des statuts
- Assignation aux entreprises

### 4. Gestion des Utilisateurs
- Liste des utilisateurs
- Modification des rôles
- Déblocage des comptes verrouillés

### 5. Notifications Temps Réel
- Alertes WebSocket pour nouveaux signalements
- Toast notifications

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
VITE_WS_URL=http://localhost:8080/api/ws
```

### Configuration Firebase

La configuration Firebase se trouve dans le code pour la synchronisation temps réel.

## API Endpoints Utilisés

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| POST | `/api/auth/login` | Connexion |
| POST | `/api/auth/logout` | Déconnexion |
| GET | `/api/signalements` | Liste des signalements |
| GET | `/api/signalements/{id}` | Détail signalement |
| PUT | `/api/signalements/{id}/status` | Mise à jour statut |
| GET | `/api/auth/users` | Liste utilisateurs |
| PUT | `/api/auth/users/{id}` | Modifier utilisateur |

## Types de Problèmes

| Type | Icône |
|------|-------|
| Nid de poule | pothole |
| Inondation | flood |
| Fissure | crack |
| Effondrement | collapse |
| Signalisation endommagée | damaged_sign |
| Éclairage défectueux | street_light |
| Débris sur la route | debris |
| Autre | other |

## Statuts des Signalements

| Statut | Description |
|--------|-------------|
| `nouveau` | Signalement nouvellement créé |
| `en_cours` | Pris en charge par une entreprise |
| `resolu` | Problème résolu |
| `rejete` | Signalement rejeté |

## Sécurité

- Authentification par token JWT
- Routes protégées
- Validation côté serveur
- Journalisation des actions

## Scripts Disponibles

```bash
npm run dev      # Démarre le serveur de développement
npm run build    # Compile pour production
npm run preview  # Prévisualise le build
npm run lint     # Vérifie le code avec ESLint
```

## Port par Défaut

- Développement : `http://localhost:5174`

## Dépendances Docker

Dans le docker-compose, le backoffice dépend du backend :

```yaml
backoffice:
  build: ./web/backoffice
  ports:
    - "5174:5173"
  depends_on:
    - backend
```
