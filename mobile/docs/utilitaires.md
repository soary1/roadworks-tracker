# Utilitaires

Documentation des fonctions utilitaires de l'application.

---

## Utilitaires Roadworks

**Fichier** : `src/utils/roadworks-utils.ts`

### Types

```typescript
type RoadworkStatus =
  | 'pothole'
  | 'blocked_road'
  | 'accident'
  | 'construction'
  | 'flooding'
  | 'debris'
  | 'poor_surface'
  | 'other';

type ReportStatus = 'new' | 'in_progress' | 'completed';
```

---

### Fonctions de mapping de statut

#### getStatusLabel

Retourne le label complet avec emoji pour un type de signalement.

```typescript
function getStatusLabel(status: string): string
```

**Mapping** :
| Status | Label |
|--------|-------|
| `pothole` | 🕳️ Nid-de-poule |
| `blocked_road` | 🚧 Route barree |
| `accident` | 🚨 Accident |
| `construction` | 🏗️ Travaux |
| `flooding` | 💧 Inondation |
| `debris` | 🪨 Debris |
| `poor_surface` | ⚠️ Mauvaise surface |
| `other` | ❓ Autre |

**Exemple** :
```typescript
getStatusLabel('pothole'); // "🕳️ Nid-de-poule"
```

---

#### getStatusEmoji

Retourne uniquement l'emoji pour un type de signalement.

```typescript
function getStatusEmoji(status: string): string
```

**Exemple** :
```typescript
getStatusEmoji('flooding'); // "💧"
getStatusEmoji('unknown');  // "📍" (defaut)
```

---

#### getReportStatusLabel

Retourne le label francais pour un statut de rapport.

```typescript
function getReportStatusLabel(status: string): string
```

**Mapping** :
| Status | Label |
|--------|-------|
| `new` | Nouveau |
| `in_progress` | En cours |
| `completed` | Termine |

---

### Fonctions de couleur

#### getStatusHexColor

Retourne la couleur hexadecimale pour un type de signalement.
Utilise pour les marqueurs sur la carte.

```typescript
function getStatusHexColor(status: string): string
```

**Mapping** :
| Status | Couleur | Hex |
|--------|---------|-----|
| `pothole` | Rouge | #FF6B6B |
| `blocked_road` | Orange fonce | #FF8C00 |
| `accident` | Cramoisi | #DC143C |
| `construction` | Or | #FFD700 |
| `flooding` | Bleu | #1E90FF |
| `debris` | Gris | #A9A9A9 |
| `poor_surface` | Orange | #FFA500 |
| `other` | Gris fonce | #808080 |

---

#### getReportStatusColor

Retourne le nom de couleur Ionic pour un statut de rapport.
Utilise pour les badges et indicateurs UI.

```typescript
function getReportStatusColor(status: string): string
```

**Mapping** :
| Status | Couleur Ionic |
|--------|---------------|
| `new` | primary (bleu) |
| `in_progress` | warning (jaune) |
| `completed` | success (vert) |
| default | medium (gris) |

**Exemple** :
```html
<ion-badge :color="getReportStatusColor('new')">
  Nouveau
</ion-badge>
```

---

### Fonctions de formatage de date

#### formatDateShort

Formate une date en format court francais (JJ/MM/AAAA).

```typescript
function formatDateShort(date: any): string
```

**Entrees acceptees** :
- Firestore Timestamp (avec methode `.toDate()`)
- Objet Date JavaScript
- Nombre (millisecondes depuis epoch)
- `null/undefined` → retourne "—"

**Exemple** :
```typescript
formatDateShort(new Date());           // "30/01/2026"
formatDateShort(firestoreTimestamp);   // "15/01/2026"
formatDateShort(null);                 // "—"
```

---

#### formatDateLong

Formate une date en format long francais avec heure.

```typescript
function formatDateLong(date: any): string
```

**Format** : `JJ mois AAAA, HH:MM`

**Exemple** :
```typescript
formatDateLong(new Date()); // "30 janvier 2026, 14:30"
```

---

#### formatSimpleDate

Formate une date ISO string en format lisible.

```typescript
function formatSimpleDate(dateString: string): string
```

**Format** : `JJ mois AAAA`

**Exemple** :
```typescript
formatSimpleDate('2026-01-30'); // "30 janvier 2026"
formatSimpleDate('');           // "N/A"
```

---

## Utilitaires UI

**Fichier** : `src/utils/ui/index.ts`

### showToast

Affiche une notification toast Ionic.

```typescript
async function showToast(
  message: string,
  duration?: number,
  icon?: string,
  color?: string,
  position?: 'top' | 'middle' | 'bottom'
): Promise<void>
```

**Parametres** :
| Parametre | Type | Defaut | Description |
|-----------|------|--------|-------------|
| `message` | string | - | Texte du toast |
| `duration` | number | 2000 | Duree en ms |
| `icon` | string | undefined | Icone ionicons |
| `color` | string | undefined | Couleur Ionic |
| `position` | string | 'bottom' | Position |

**Exemple** :
```typescript
import { showToast } from '@/utils/ui';
import { checkmarkCircle, warning } from 'ionicons/icons';

// Toast de succes
await showToast('Signalement envoye !', 3000, checkmarkCircle, 'success');

// Toast d'erreur
await showToast('Erreur de connexion', 3000, warning, 'danger', 'top');
```

---

## Resume des imports

```typescript
// Depuis roadworks-utils.ts
import {
  // Types
  RoadworkStatus,
  ReportStatus,

  // Labels
  getStatusLabel,
  getStatusEmoji,
  getReportStatusLabel,

  // Couleurs
  getStatusHexColor,
  getReportStatusColor,

  // Dates
  formatDateShort,
  formatDateLong,
  formatSimpleDate,
} from '@/utils/roadworks-utils';

// Depuis ui/index.ts
import { showToast } from '@/utils/ui';
```

---

## Diagramme d'utilisation

```
┌─────────────────────────────────────────────────────────┐
│                    roadworks-utils.ts                   │
└─────────────────────────────────────────────────────────┘
                          │
        ┌─────────────────┼─────────────────┐
        │                 │                 │
        v                 v                 v
┌───────────────┐ ┌───────────────┐ ┌───────────────┐
│   MapPage     │ │ DetailsModal  │ │  RecapPage    │
│               │ │               │ │               │
│ - getStatus   │ │ - getStatus   │ │ (utilise      │
│   Emoji       │ │   Label       │ │  report.work) │
│ - getStatus   │ │ - getStatus   │ │               │
│   Label       │ │   Color       │ │               │
│ - formatDate  │ │ - formatDate  │ │               │
│   Short       │ │   Long        │ │               │
└───────────────┘ └───────────────┘ └───────────────┘

┌─────────────────────────────────────────────────────────┐
│                      ui/index.ts                        │
└─────────────────────────────────────────────────────────┘
                          │
        ┌─────────────────┼─────────────────┐
        │                 │                 │
        v                 v                 v
┌───────────────┐ ┌───────────────┐ ┌───────────────┐
│   SignInPage  │ │   MapPage     │ │ ReportModal   │
│               │ │               │ │               │
│ - showToast   │ │ - showToast   │ │ - showToast   │
│   (erreurs)   │ │   (position)  │ │   (succes)    │
└───────────────┘ └───────────────┘ └───────────────┘
```
