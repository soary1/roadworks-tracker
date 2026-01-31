# Stores Pinia

Documentation des stores de gestion d'etat avec Pinia.

## Store de Session

**Fichier** : `src/pinia/auth/session.ts`

### Description
Gere la session utilisateur avec expiration automatique.

### State

```typescript
interface State {
  expiresAt: string | null; // Date d'expiration ISO
}
```

### Getters

#### isExpired
Verifie si la session est expiree.

```typescript
isExpired(): boolean
```

**Retour** : `true` si la session est expiree ou inexistante

### Actions

#### loadSession
Charge la session depuis les preferences du device.

```typescript
async loadSession(): Promise<void>
```

**Utilisation** : Appelee au demarrage de l'application

#### setSession
Cree une nouvelle session avec duree configurable.

```typescript
async setSession(durationHours?: number): Promise<void>
```

**Parametres** :
- `durationHours` : Duree en heures (defaut: 1h via Remote Config)

**Stockage** : Capacitor Preferences (cle: `session_expires_at`)

#### clearSession
Supprime la session (deconnexion).

```typescript
async clearSession(): Promise<void>
```

### Exemple d'utilisation

```typescript
const sessionStore = useAuthSessionStore();

// Au demarrage
await sessionStore.loadSession();

// Verifier l'expiration
if (sessionStore.isExpired) {
  router.push('/auth/signIn');
}

// Apres connexion reussie
await sessionStore.setSession();

// Deconnexion
await sessionStore.clearSession();
```

---

## Store de Configuration Firebase

**Fichier** : `src/pinia/firebase/routeworks-tracker.ts`

### Description
Charge et expose la configuration Remote Config.

### State

```typescript
interface State {
  sessionDurationHours: number; // Duree de session
}
```

### Actions

#### loadConfig
Charge la configuration depuis Firebase Remote Config.

```typescript
async loadConfig(): Promise<void>
```

**Parametres charges** :
- `SESSION_DURATION_HOURS` : Duree de session en heures

### Exemple d'utilisation

```typescript
const configStore = useFirebaseConfigStore();
await configStore.loadConfig();

// Utiliser la duree configuree
await sessionStore.setSession(configStore.sessionDurationHours);
```

---

## Store de Permission Geolocalisation

**Fichier** : `src/pinia/geo-location/permission.ts`

### Description
Gere les permissions de geolocalisation du device.

### State

```typescript
interface State {
  status: PermissionState; // 'prompt' | 'granted' | 'denied'
}
```

### Getters

#### canUseGeolocation
Indique si la geolocalisation est autorisee.

```typescript
canUseGeolocation(): boolean
```

### Actions

#### checkPermission
Verifie l'etat actuel de la permission.

```typescript
async checkPermission(): Promise<void>
```

#### requestPermission
Demande la permission a l'utilisateur.

```typescript
async requestPermission(): Promise<void>
```

### Exemple d'utilisation

```typescript
const permissionStore = usePermissionStore();

await permissionStore.checkPermission();

if (!permissionStore.canUseGeolocation) {
  await permissionStore.requestPermission();
}
```

---

## Store de Position Actuelle

**Fichier** : `src/pinia/geo-location/current-location.ts`

### Description
Suit la position GPS de l'utilisateur en temps reel.

### State

```typescript
interface State {
  coords: { lat: number; lng: number } | null;
  error: string | null;
  isRefreshingCoords: boolean;
}
```

### Actions

#### refreshCoords
Actualise la position avec haute precision.

```typescript
async refreshCoords(): Promise<void>
```

**Configuration GPS** :
- `enableHighAccuracy: true`
- `timeout: 10000ms`
- `maximumAge: 0` (pas de cache)

### Gestion des erreurs

Le store gere 17 codes d'erreur differents :
- `1` : Permission refusee
- `2` : Position indisponible
- `3` : Timeout
- Codes specifiques Android/iOS (4-17)

### Exemple d'utilisation

```typescript
const locationStore = useCurrentLocationStore();

await locationStore.refreshCoords();

if (locationStore.error) {
  showToast(locationStore.error, 3000, 'warning');
} else {
  const { lat, lng } = locationStore.coords;
  map.setView([lat, lng], 15);
}
```

---

## Store des Signalements

**Fichier** : `src/pinia/geo-location/roadworks-report.ts`

### Description
Gere la liste des signalements routiers.

### State

```typescript
interface State {
  reports: RoadworksReportWithId[];
  error: string | null;
  isLoading: boolean;
  currentUserId: string | null;
}
```

### Getters

#### myReports
Filtre les signalements de l'utilisateur connecte.

```typescript
myReports(): RoadworksReportWithId[]
```

### Actions

#### loadAllReports
Charge tous les signalements depuis Firestore.

```typescript
async loadAllReports(): Promise<void>
```

#### addReport
Ajoute un nouveau signalement.

```typescript
async addReport(report: RoadworksReportData): Promise<string>
```

**Retour** : ID du nouveau signalement

### Exemple d'utilisation

```typescript
const reportStore = useRoadworksReportStore();

// Charger les signalements
await reportStore.loadAllReports();

// Afficher sur la carte
reportStore.reports.forEach(report => {
  addMarker(report.lat, report.lng, report.status);
});

// Ajouter un signalement
const id = await reportStore.addReport({
  lat: selectedCoords.lat,
  lng: selectedCoords.lng,
  status: 'pothole',
  description: 'Trou dangereux',
});

// Filtrer mes signalements
const myReports = reportStore.myReports;
```

---

## Diagramme des Stores

```
┌─────────────────────────────────────────────────────────┐
│                    Application                          │
└─────────────────────────────────────────────────────────┘
                          │
          ┌───────────────┼───────────────┐
          │               │               │
          v               v               v
┌─────────────────┐ ┌───────────┐ ┌───────────────────┐
│ Firebase Config │ │  Session  │ │   Geolocation     │
│     Store       │ │   Store   │ │     Stores        │
└────────┬────────┘ └─────┬─────┘ └─────────┬─────────┘
         │                │                 │
         │                │       ┌─────────┴─────────┐
         │                │       │                   │
         v                v       v                   v
┌─────────────────┐ ┌───────────┐ ┌─────────┐ ┌─────────────┐
│ Remote Config   │ │Preferences│ │Permission│ │ Current Loc │
│   (Firebase)    │ │ (Device)  │ │  Store   │ │   Store     │
└─────────────────┘ └───────────┘ └─────────┘ └─────────────┘
                                                    │
                                                    v
                                        ┌─────────────────┐
                                        │ Roadworks Report│
                                        │     Store       │
                                        └────────┬────────┘
                                                 │
                                                 v
                                        ┌─────────────────┐
                                        │    Firestore    │
                                        │   (Firebase)    │
                                        └─────────────────┘
```
