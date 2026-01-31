# Documentation Technique - Roadworks Tracker Mobile

## Vue d'ensemble

Application mobile hybride de suivi des travaux routiers construite avec :
- **Vue 3** + **TypeScript**
- **Ionic Framework** pour l'UI mobile
- **Capacitor** pour les fonctionnalites natives
- **Firebase** (Auth, Firestore, Remote Config)
- **Pinia** pour la gestion d'etat
- **Leaflet** pour la cartographie

## Architecture du projet

```
mobile/
├── src/
│   ├── components/          # Composants reutilisables
│   │   ├── auth/            # Composants d'authentification
│   │   └── geo-location/    # Composants de geolocalisation
│   ├── pinia/               # Stores Pinia (gestion d'etat)
│   │   ├── auth/            # Store de session
│   │   ├── firebase/        # Store de configuration Firebase
│   │   └── geo-location/    # Stores de geolocalisation
│   ├── router/              # Configuration du routeur Vue
│   ├── services/            # Services externes (Firebase)
│   │   └── firebase/        # Services Firestore et Auth
│   ├── utils/               # Fonctions utilitaires
│   │   ├── ui/              # Utilitaires UI (toasts)
│   │   └── roadworks-utils.ts  # Utilitaires metier
│   └── views/               # Pages de l'application
│       ├── admin/           # Pages d'administration
│       ├── auth/            # Pages d'authentification
│       ├── geo-location/    # Page carte
│       └── recap/           # Page statistiques
├── docs/                    # Documentation technique
└── public/                  # Assets statiques
```

## Flux d'authentification

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  SignInPage │────>│  Firebase   │────>│   Session   │
│             │     │    Auth     │     │   Store     │
└─────────────┘     └─────────────┘     └─────────────┘
                           │                    │
                           v                    v
                    ┌─────────────┐     ┌─────────────┐
                    │ Auth Guard  │<────│ Expiration  │
                    │  (Router)   │     │   Check     │
                    └─────────────┘     └─────────────┘
```

1. L'utilisateur entre ses identifiants sur `SignInPage`
2. Firebase Auth verifie les credentials
3. En cas de succes, une session est creee avec date d'expiration
4. Le router guard verifie l'authentification et l'expiration
5. Apres 3 echecs de connexion, le compte est bloque

## Flux des signalements

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   MapPage   │────>│ ReportModal │────>│  Firestore  │
│  (Leaflet)  │     │   (Form)    │     │  (reports)  │
└─────────────┘     └─────────────┘     └─────────────┘
       │                                       │
       v                                       v
┌─────────────┐                        ┌─────────────┐
│  Markers    │<───────────────────────│ ReportStore │
│  (Emoji)    │                        │   (Pinia)   │
└─────────────┘                        └─────────────┘
```

1. L'utilisateur clique sur la carte (MapPage)
2. Le modal de signalement s'ouvre
3. Le signalement est envoye a Firestore
4. Le store Pinia charge les donnees
5. Les marqueurs sont affiches sur la carte

## Configuration requise

### Variables d'environnement

Creer un fichier `.env` a la racine du projet mobile :

```env
VITE_FIREBASE_API_KEY=votre_api_key
VITE_FIREBASE_AUTH_DOMAIN=votre_projet.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=votre_projet
VITE_FIREBASE_STORAGE_BUCKET=votre_projet.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=votre_app_id
```

### Firebase Remote Config

Parametres configures :
- `SESSION_DURATION_HOURS` : Duree de session en heures (defaut: 1)

## Commandes

```bash
# Installation des dependances
npm install

# Demarrage en mode developpement
npm run dev

# Build pour production
npm run build

# Synchronisation Capacitor (Android/iOS)
npx cap sync
```

## Navigation

| Route | Page | Description |
|-------|------|-------------|
| `/auth/signIn` | SignInPage | Connexion |
| `/tabs/map` | MapPage | Carte interactive |
| `/tabs/tab2` | RecapPage | Tableau de bord |
| `/admin/blocked-accounts` | AdminBlockedAccountsPage | Gestion comptes bloques |

## Securite

- **Blocage de compte** : Apres 3 tentatives echouees
- **Expiration de session** : Configurable via Remote Config
- **Auth Guard** : Protection des routes privees
- **Firestore Rules** : Regles de securite cote serveur

## Documentation detaillee

- [Services Firebase](./services-firebase.md)
- [Stores Pinia](./stores-pinia.md)
- [Composants](./composants.md)
- [Utilitaires](./utilitaires.md)
