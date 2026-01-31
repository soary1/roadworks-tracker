# Composants et Vues

Documentation des composants Vue et des pages de l'application.

---

## VUES (Pages)

### SignInPage

**Fichier** : `src/views/auth/SignInPage.vue`

**Description** : Page de connexion avec gestion du blocage de compte.

**Fonctionnalites** :
- Formulaire email/mot de passe
- Verification du blocage de compte (3 tentatives max)
- Affichage des erreurs de connexion
- Redirection apres connexion reussie

**Props** : Aucune

**Events** : Aucun

**Dependances** :
- `firebase/auth` : signInWithEmailAndPassword
- `useAuthSessionStore` : Gestion de session
- `isAccountLocked`, `recordFailedAttempt`, `resetLoginAttempts`

**Flux de connexion** :
```
1. Verifier si compte bloque
2. Si bloque -> Afficher erreur
3. Si non bloque -> Tenter connexion Firebase
4. Si echec -> Enregistrer tentative echouee
5. Si succes -> Reinitialiser tentatives + Creer session
```

---

### MapPage

**Fichier** : `src/views/geo-location/MapPage.vue`

**Description** : Page principale avec carte interactive Leaflet.

**Fonctionnalites** :
- Carte OpenStreetMap centree sur Antananarivo
- Affichage des signalements avec marqueurs emoji
- Clic sur carte pour nouveau signalement
- Bouton de localisation GPS
- Filtre "Mes signalements" / "Tous"
- Popup avec details du signalement
- Bouton de deconnexion

**Props** : Aucune

**Events** : Aucun

**Composants utilises** :
- `RoadworksReportModal` : Creation de signalement
- `RoadworksReportDetailsModal` : Details du signalement

**Stores utilises** :
- `useCurrentLocationStore` : Position GPS
- `useRoadworksReportStore` : Liste des signalements
- `useAuthSessionStore` : Deconnexion

**Configuration Leaflet** :
```typescript
map = L.map('map', { zoomControl: false })
  .setView([-18.9184607, 47.5211293], 11);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png')
  .addTo(map);
```

**Marqueurs emoji** :
```typescript
const emojiIcon = L.divIcon({
  html: `<div style="font-size: 28px;">${emoji}</div>`,
  iconSize: [28, 28],
  className: 'emoji-marker',
});
```

---

### RecapPage

**Fichier** : `src/views/recap/RecapPage.vue`

**Description** : Tableau de bord avec statistiques des signalements.

**Fonctionnalites** :
- Nombre total de points signales
- Surface totale (m²)
- Budget total (Ar)
- Pourcentage d'avancement
- Repartition par statut (Nouveau, En cours, Termine)
- Pull-to-refresh

**Calculs** :
```typescript
const summary = computed(() => {
  return reportStore.reports.reduce((acc, report) => {
    acc.nbPoints += 1;
    acc.totalSurface += Number(report.work?.surface ?? 0);
    acc.totalBudget += Number(report.work?.price ?? 0);
    // ...
  }, initialState);
});

const progressPercent = computed(() => {
  return summary.value.nbPoints
    ? Math.round((summary.value.completed / summary.value.nbPoints) * 100)
    : 0;
});
```

---

### TabsPage

**Fichier** : `src/views/TabsPage.vue`

**Description** : Conteneur de navigation par onglets.

**Onglets** :
| Tab | Route | Icone | Label |
|-----|-------|-------|-------|
| 1 | `/tabs/map` | `map` | Explorer |
| 2 | `/tabs/tab2` | `bar-chart` | Recap |
| 3 | `/tabs/tab3` | `apps` | Tab 3 |

---

### AdminBlockedAccountsPage

**Fichier** : `src/views/admin/AdminBlockedAccountsPage.vue`

**Description** : Panel d'administration des comptes bloques.

**Fonctionnalites** :
- Liste des comptes bloques
- Nombre de tentatives echouees
- Date de blocage
- Recherche par email
- Actions : Debloquer / Reinitialiser

**Actions admin** :
```typescript
// Debloquer un compte
await unlockAccount(email);

// Supprimer completement les tentatives
await deleteDoc(doc(firestore, 'loginAttempts', email));
```

---

## COMPOSANTS

### RoadworksReportModal

**Fichier** : `src/components/geo-location/RoadworksReportModal.vue`

**Description** : Modal de creation d'un nouveau signalement.

**Props** :
```typescript
interface Props {
  isOpen: boolean;
  coords: { lat: number; lng: number } | null;
}
```

**Events** :
- `close` : Fermeture du modal
- `submitted` : Signalement envoye avec succes

**Champs du formulaire** :
- Type de probleme (select avec 8 options)
- Description (textarea optionnel)

**Types de problemes** :
| Valeur | Label | Emoji |
|--------|-------|-------|
| `pothole` | Nid-de-poule | 🕳️ |
| `blocked_road` | Route barree | 🚧 |
| `accident` | Accident | 🚨 |
| `construction` | Travaux | 🏗️ |
| `flooding` | Inondation | 💧 |
| `debris` | Debris | 🪨 |
| `poor_surface` | Mauvaise surface | ⚠️ |
| `other` | Autre | ❓ |

---

### RoadworksReportDetailsModal

**Fichier** : `src/components/geo-location/RoadworksReportDetailsModal.vue`

**Description** : Modal d'affichage des details d'un signalement.

**Props** :
```typescript
interface Props {
  isOpen: boolean;
  report: RoadworksReportWithId | null;
}
```

**Events** :
- `close` : Fermeture du modal

**Sections affichees** :
1. **En-tete** : Emoji + Type + Description
2. **Localisation** : Latitude, Longitude
3. **Statut** : Badge colore (Nouveau/En cours/Termine)
4. **Travaux** : Entreprise, Surface, Prix, Dates
5. **Dates** : Creation, Mise a jour

**Utilitaires utilises** :
```typescript
import {
  getStatusLabel,
  getStatusEmoji,
  getReportStatusLabel,
  getReportStatusColor,
  formatDateLong,
  formatSimpleDate,
} from '@/utils/roadworks-utils';
```

---

### icon.ts

**Fichier** : `src/components/geo-location/icon.ts`

**Description** : Configuration des icones de marqueur Leaflet.

**Export** :
```typescript
export const defaultMarker = L.icon({
  iconUrl: '/assets/marker-icon.png',
  shadowUrl: '/assets/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});
```

---

## Diagramme des composants

```
┌─────────────────────────────────────────────────────────┐
│                      TabsPage                           │
│  ┌─────────────┬─────────────┬─────────────────────┐   │
│  │   Tab 1     │   Tab 2     │      Tab 3          │   │
│  │  (Explorer) │  (Recap)    │   (Placeholder)     │   │
│  └──────┬──────┴──────┬──────┴─────────────────────┘   │
└─────────┼─────────────┼────────────────────────────────┘
          │             │
          v             v
   ┌──────────────┐ ┌──────────────┐
   │   MapPage    │ │  RecapPage   │
   └──────┬───────┘ └──────────────┘
          │
    ┌─────┴─────┐
    │           │
    v           v
┌────────────┐ ┌─────────────────────┐
│ Report     │ │ ReportDetails       │
│ Modal      │ │ Modal               │
└────────────┘ └─────────────────────┘
```

---

## Cycle de vie des pages

### MapPage

```
onMounted()
    │
    ├── Configurer icone par defaut Leaflet
    │
    ├── mountMap()
    │       │
    │       ├── Afficher loader
    │       ├── Initialiser carte Leaflet
    │       ├── Ajouter couche OpenStreetMap
    │       └── Configurer event 'click'
    │
    ├── loadAllReports()
    │
    └── displayReportsOnMap()
            │
            ├── Supprimer anciens marqueurs
            ├── Filtrer reports (si filtre actif)
            └── Ajouter marqueurs emoji
```

### RecapPage

```
onMounted()
    │
    └── Si reports.length === 0
            │
            └── loadAllReports()

computed: summary
    │
    └── reduce() sur reports
            │
            ├── Compter par statut
            ├── Sommer surfaces
            └── Sommer budgets
```
