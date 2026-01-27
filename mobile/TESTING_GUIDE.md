## Guide de Test - Système de Blocage de Compte

### Prérequis
- L'app mobile est en cours d'exécution
- Firebase est configuré et accessible
- Firestore est activé dans le projet Firebase

### Scénarios de Test

#### Scénario 1 : Blocage après 3 tentatives échouées

**Étapes :**
1. Ouvrir la page de connexion (`/auth/signIn`)
2. Entrer un email valide mais avec un mauvais mot de passe
3. Cliquer sur "Se Connecter"

**Résultat attendu à la tentative 1 :**
- ❌ Message d'erreur : "Identifiants incorrects. **2 tentative(s) restante(s)** avant blocage du compte."

**Résultat attendu à la tentative 2 :**
- ❌ Message d'erreur : "Identifiants incorrects. **1 tentative(s) restante(s)** avant blocage du compte."

**Résultat attendu à la tentative 3 :**
- ❌ Popup d'erreur (card) : 
  - Titre : "Compte bloqué"
  - Message : "Suite à trop de tentatives échouées, ce compte a été bloqué. Veuillez contacter l'administrateur pour le débloquer."

---

#### Scénario 2 : Vérifier le blocage permanent

**Étapes :**
1. Après avoir bloqué le compte au scénario 1, attendre quelques secondes
2. Essayer de se connecter avec le même email (même avec les bonnes identifiants)
3. Cliquer sur "Se Connecter"

**Résultat attendu :**
- ❌ Popup d'erreur (card) : 
  - Titre : "Compte bloqué"
  - Message : "Suite à trop de tentatives échouées, ce compte a été bloqué. Veuillez contacter l'administrateur pour le débloquer."
- ⚠️ **Le compte reste bloqué indéfiniment** jusqu'au déblocage manuel

---

#### Scénario 3 : Vérifier dans Firestore

**Étapes :**
1. Accéder à Firebase Console → Firestore
2. Naviguer vers la collection `loginAttempts`
3. Rechercher le document avec l'email utilisé

**Résultat attendu :**
```json
{
  "email": "test@example.com",
  "failedAttempts": 3,
  "isLocked": true,
  "lockedAt": "2026-01-27T10:30:00Z",
  "lastFailedAttempt": "2026-01-27T10:30:00Z",
  "userId": null
}
```

---

#### Scénario 4 : Débloquer manuellement (si admin panel existe)

**Via Firestore Console :**
1. Ouvrir le document du compte bloqué
2. Modifier `isLocked` : `true` → `false`
3. Vider ou diminuer `failedAttempts` à 0

**Via Code :**
```typescript
import { unlockAccount } from '@/services/firebase/auth-attempts';

// Débloquer un compte
await unlockAccount('email@example.com');
```

**Résultat attendu :**
- ✅ L'utilisateur peut se connecter normalement avec les bonnes identifiants
- ✅ Les tentatives échouées sont réinitialisées à 0

---

#### Scénario 5 : Réinitialisation après succès

**Étapes :**
1. Se connecter avec les bonnes identifiants
2. La connexion réussit

**Résultat attendu :**
- ✅ Redirection vers la page d'accueil (`/`)
- ✅ Dans Firestore, `failedAttempts` passe à 0

---

### Commandes de Débogage

#### Consulter les tentatives de connexion en console

```typescript
// Dans la console du navigateur (DevTools)
import { getLoginAttempt, isAccountLocked } from '@/services/firebase/auth-attempts';

// Vérifier si un compte est bloqué
const locked = await isAccountLocked('test@example.com');
console.log('Compte bloqué :', locked);

// Voir toutes les tentatives
const attempt = await getLoginAttempt('test@example.com');
console.log('Tentatives :', attempt);
```

#### Débloquer via la console

```typescript
import { unlockAccount } from '@/services/firebase/auth-attempts';

await unlockAccount('test@example.com');
console.log('Compte débloqué');
```

---

### Checklist de Vérification

- [ ] Après 1 tentative échouée → 2 tentatives restantes
- [ ] Après 2 tentatives échouées → 1 tentative restante
- [ ] Après 3 tentatives échouées → Compte bloqué
- [ ] Le compte reste bloqué sans limite de temps
- [ ] Les données sont correctement stockées dans Firestore
- [ ] Déblocage manuel réinitialise le compteur
- [ ] Connexion réussie réinitialise les tentatives
- [ ] Messages d'erreur clairs et informatifs

