## 🧪 Comment Tester le Système de Blocage

### Option 1 : Interface de Test Interactive (RECOMMANDÉ)

1. **Lancer l'app mobile :** 
   ```bash
   cd mobile
   npm run dev
   ```

2. **Accéder à la page de test :**
   - URL : `http://localhost:5173/test/blocking`
   - Ou depuis la console du navigateur, injecter cette route

3. **Utiliser les boutons :**
   - 📊 **Voir le statut** : Affiche le statut actuel du compte
   - ❌ **Enregistrer tentative** : Ajoute une tentative échouée
   - 🔒 **Simuler 3 tentatives** : Bloque automatiquement le compte
   - 🔍 **Vérifier si bloqué** : Vérifie l'état de blocage
   - 🔓 **Débloquer** : Débloque manuellement
   - 🔄 **Réinitialiser** : Réinitialise les tentatives

---

### Option 2 : Test Via la Console du Navigateur

1. **Ouvrir DevTools** (F12 ou Ctrl+Shift+I)
2. **Aller dans l'onglet Console**
3. **Copier-coller ce code :**

```javascript
import { 
  recordFailedAttempt, 
  isAccountLocked, 
  getLoginAttempt,
  unlockAccount,
  resetLoginAttempts
} from '@/services/firebase/auth-attempts';

// Test 1 : Voir le statut initial
const attempt = await getLoginAttempt('test@example.com');
console.log("Statut initial :", attempt);

// Test 2 : Enregistrer 3 tentatives échouées
console.log("\n--- Simulation de 3 tentatives échouées ---");
for (let i = 1; i <= 3; i++) {
  const result = await recordFailedAttempt('test@example.com');
  console.log(`Tentative ${i} : ${result.failedAttempts}/3, Bloqué: ${result.isLocked}`);
}

// Test 3 : Vérifier le blocage
const locked = await isAccountLocked('test@example.com');
console.log("\nCompte bloqué :", locked);

// Test 4 : Débloquer
await unlockAccount('test@example.com');
console.log("Compte débloqué ✓");
```

---

### Option 3 : Test Dans la Page de Connexion

1. **Ouvrir la page de connexion :** `http://localhost:5173/auth/signIn`
2. **Entrer un email + mauvais mot de passe**
3. **Cliquer "Se Connecter" 3 fois**
4. **Vérifier les messages d'erreur :**
   - 1ère fois : "2 tentative(s) restante(s)"
   - 2e fois : "1 tentative(s) restante(s)"
   - 3e fois : **Carte d'erreur** "Compte bloqué"

---

### Vérifier dans Firebase Firestore

1. **Aller sur [Firebase Console](https://console.firebase.google.com/)**
2. **Sélectionner le projet : roadworks-tracker**
3. **Firestore Database → Collection `loginAttempts`**
4. **Rechercher le document avec votre email**

**Vous devriez voir :**
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

### ✅ Checklist de Vérification

- [ ] 1ère tentative échouée : message avec 2 tentatives restantes
- [ ] 2e tentative échouée : message avec 1 tentative restante
- [ ] 3e tentative échouée : compte bloqué
- [ ] Tentative après blocage : même message d'erreur
- [ ] Les données apparaissent dans Firestore
- [ ] Déblocage fonctionne (via Test Page ou Firestore)
- [ ] Après déblocage : les tentatives sont réinitialisées
- [ ] Connexion réussie : tentatives remises à 0

---

### 🐛 Dépannage

**Erreur : "Cannot find module '@/services/firebase/auth-attempts'"**
- Vérifier que le fichier `mobile/src/services/firebase/auth-attempts.ts` existe
- Relancer le serveur : `npm run dev`

**Firestore vide ou collection introuvable**
- Vérifier que Firebase est connecté
- Créer manuellement la collection `loginAttempts` dans Firestore Console

**Test Page ne charge pas**
- Vérifier que la route `/test/blocking` est dans `router/index.ts`
- Relancer le serveur

---

### 📊 Résumé des Endpoints

| Fonction | Rôle | Exemple |
|----------|------|---------|
| `recordFailedAttempt(email)` | Enregistrer une tentative échouée | `await recordFailedAttempt('user@test.com')` |
| `isAccountLocked(email)` | Vérifier si bloqué | `await isAccountLocked('user@test.com')` |
| `getLoginAttempt(email)` | Voir le statut | `await getLoginAttempt('user@test.com')` |
| `resetLoginAttempts(email)` | Réinitialiser après succès | `await resetLoginAttempts('user@test.com')` |
| `unlockAccount(email)` | Débloquer manuellement | `await unlockAccount('user@test.com')` |

