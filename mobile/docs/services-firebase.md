# Services Firebase

Documentation des services d'interaction avec Firebase.

## Configuration Firebase

**Fichier** : `src/services/firebase/routeworks-tracker.ts`

### Description
Initialise et exporte les instances Firebase pour l'application.

### Exports

```typescript
export const auth: Auth           // Instance Firebase Auth
export const firestore: Firestore // Instance Firestore
export const remoteConfig: RemoteConfig // Instance Remote Config
```

### Configuration Remote Config

```typescript
remoteConfig.settings = {
  minimumFetchIntervalMillis: 3600000, // 1 heure
  fetchTimeoutMillis: 60000,           // 60 secondes
};

// Valeurs par defaut
remoteConfig.defaultConfig = {
  SESSION_DURATION_HOURS: 1,
};
```

---

## Service des Signalements

**Fichier** : `src/services/firebase/roadworks-reports.ts`

### Interfaces

#### WorkData
Donnees des travaux assignes a un signalement.

```typescript
interface WorkData {
  company: string;           // Nom de l'entreprise
  companyId: number;         // ID de l'entreprise
  startDate: string;         // Date de debut (ISO)
  endDateEstimation: string; // Date de fin estimee (ISO)
  realEndDate?: string;      // Date de fin reelle (ISO)
  price: number;             // Prix des travaux (Ar)
  surface: number;           // Surface (m²)
}
```

#### RoadworksReportData
Donnees d'un signalement routier.

```typescript
interface RoadworksReportData {
  lat: number;          // Latitude
  lng: number;          // Longitude
  status: RoadworkStatus; // Type de probleme
  description?: string; // Description optionnelle
  reportStatus?: ReportStatus; // Statut du rapport
  work?: WorkData;      // Travaux assignes
  userId?: string;      // ID de l'utilisateur
  createdAt?: Timestamp; // Date de creation
  updatedAt?: Timestamp; // Date de mise a jour
}
```

#### Types de statut

```typescript
type RoadworkStatus =
  | 'pothole'       // Nid-de-poule
  | 'blocked_road'  // Route barree
  | 'accident'      // Accident
  | 'construction'  // Travaux
  | 'flooding'      // Inondation
  | 'debris'        // Debris
  | 'poor_surface'  // Mauvaise surface
  | 'other';        // Autre

type ReportStatus =
  | 'new'           // Nouveau
  | 'in_progress'   // En cours
  | 'completed';    // Termine
```

### Fonctions

#### addRoadworksReport

Ajoute un nouveau signalement dans Firestore.

```typescript
async function addRoadworksReport(
  report: RoadworksReportData
): Promise<string>
```

**Parametres** :
- `report` : Donnees du signalement

**Retour** : ID du document cree

**Exemple** :
```typescript
const reportId = await addRoadworksReport({
  lat: -18.9184607,
  lng: 47.5211293,
  status: 'pothole',
  description: 'Grand trou sur la route',
  userId: auth.currentUser?.uid,
});
```

#### getAllRoadworksReports

Recupere tous les signalements.

```typescript
async function getAllRoadworksReports(): Promise<RoadworksReportWithId[]>
```

**Retour** : Tableau de signalements avec leurs IDs

**Exemple** :
```typescript
const reports = await getAllRoadworksReports();
reports.forEach(report => {
  console.log(report.id, report.status);
});
```

#### getCurrentUserReports

Recupere les signalements de l'utilisateur connecte.

```typescript
async function getCurrentUserReports(): Promise<RoadworksReportWithId[]>
```

**Retour** : Tableau des signalements de l'utilisateur

---

## Service de Securite (Auth Attempts)

**Fichier** : `src/services/firebase/auth-attempts.ts`

### Description
Gere le blocage de compte apres plusieurs tentatives de connexion echouees.

### Interface

```typescript
interface LoginAttempt {
  userId: string;           // ID utilisateur Firebase
  email: string;            // Email de l'utilisateur
  failedAttempts: number;   // Nombre de tentatives echouees
  isLocked: boolean;        // Compte bloque ?
  lockedAt: Timestamp | null;      // Date de blocage
  lastFailedAttempt: Timestamp | null; // Derniere tentative
}
```

### Constantes

```typescript
const MAX_ATTEMPTS = 3; // Nombre max de tentatives avant blocage
```

### Fonctions

#### getLoginAttempt

Recupere les informations de tentatives pour un email.

```typescript
async function getLoginAttempt(
  email: string
): Promise<LoginAttempt | null>
```

#### isAccountLocked

Verifie si un compte est bloque.

```typescript
async function isAccountLocked(email: string): Promise<boolean>
```

**Exemple** :
```typescript
if (await isAccountLocked(email)) {
  showError('Compte bloque. Contactez l\'administrateur.');
  return;
}
```

#### recordFailedAttempt

Enregistre une tentative echouee.

```typescript
async function recordFailedAttempt(
  email: string,
  userId?: string
): Promise<void>
```

**Comportement** :
- Incremente le compteur de tentatives
- Bloque le compte si >= 3 tentatives

#### resetLoginAttempts

Reinitialise les tentatives (apres connexion reussie).

```typescript
async function resetLoginAttempts(email: string): Promise<void>
```

#### unlockAccount

Debloque un compte (admin uniquement).

```typescript
async function unlockAccount(email: string): Promise<void>
```

### Collection Firestore

**Collection** : `loginAttempts`

**Structure du document** :
```json
{
  "userId": "abc123",
  "email": "user@example.com",
  "failedAttempts": 2,
  "isLocked": false,
  "lockedAt": null,
  "lastFailedAttempt": "2024-01-15T10:30:00Z"
}
```

### Flux de blocage

```
┌──────────────┐
│ Tentative    │
│ de connexion │
└──────┬───────┘
       │
       v
┌──────────────┐    Non    ┌──────────────┐
│ Compte       │──────────>│ Verifier     │
│ bloque ?     │           │ credentials  │
└──────────────┘           └──────┬───────┘
       │ Oui                      │
       v                          v
┌──────────────┐           ┌──────────────┐
│ Afficher     │           │ Connexion    │
│ erreur       │           │ OK ?         │
└──────────────┘           └──────┬───────┘
                                  │
                    ┌─────────────┴─────────────┐
                    │ Oui                       │ Non
                    v                           v
             ┌──────────────┐           ┌──────────────┐
             │ Reinitialiser│           │ Enregistrer  │
             │ tentatives   │           │ echec        │
             └──────────────┘           └──────┬───────┘
                                               │
                                               v
                                        ┌──────────────┐
                                        │ >= 3 echecs ?│
                                        └──────┬───────┘
                                               │ Oui
                                               v
                                        ┌──────────────┐
                                        │ Bloquer      │
                                        │ compte       │
                                        └──────────────┘
```
