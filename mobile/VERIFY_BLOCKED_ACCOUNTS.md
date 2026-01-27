# 🔍 Comment Vérifier les Comptes Bloqués via Firebase

## ✅ Méthode 1 : Console Firebase (PLUS SIMPLE)

### Étapes :

1. **Ouvrir Firebase Console**
   - URL : https://console.firebase.google.com/
   - Connectez-vous avec votre compte Google

2. **Sélectionner le projet**
   - Cliquer sur "roadworks-tracker" dans la liste

3. **Accéder à Firestore**
   - Menu gauche → "Firestore Database"

4. **Ouvrir la collection**
   - Cliquer sur "loginAttempts" dans la liste des collections

5. **Voir les comptes bloqués**
   - Chaque ligne représente un compte
   - Chercher le champ `isLocked`

### 📊 Exemple de Document Bloqué :

```
Document ID: user@example.com
─────────────────────────────
email              : user@example.com
failedAttempts     : 3
isLocked           : true ✅ BLOQUÉ
lockedAt           : 2026-01-27 10:30:00
lastFailedAttempt  : 2026-01-27 10:30:00
userId             : null
```

### 🟢 Exemple de Document Débloqué :

```
Document ID: another@example.com
─────────────────────────────
email              : another@example.com
failedAttempts     : 0
isLocked           : false ✅ DÉBLOQUÉ
lockedAt           : (vide)
lastFailedAttempt  : (vide)
userId             : null
```

---

## 📱 Méthode 2 : Via CLI (Ligne de Commande)

### Installation :

```bash
npm install -g firebase-tools
firebase login
```

### Commandes Utiles :

```bash
# Voir tous les comptes bloqués
firebase firestore:query loginAttempts \
  --where isLocked==true \
  --project=roadworks-tracker

# Voir un compte spécifique
firebase firestore:get loginAttempts/user@example.com \
  --project=roadworks-tracker

# Voir tous les comptes avec tentatives
firebase firestore:query loginAttempts \
  --where failedAttempts>0 \
  --project=roadworks-tracker
```

---

## 🖥️ Méthode 3 : Via Script Node.js (Programmé)

### Prérequis :

1. **Télécharger la clé de service Firebase**
   - Console Firebase → ⚙️ Settings
   - Service Accounts → "Generate New Private Key"
   - Sauvegarder le fichier JSON

2. **Placer le fichier**
   - Copier dans `backend/firebase-key.json`

3. **Installer Firebase Admin**
   ```bash
   npm install firebase-admin
   ```

### Script Exemple :

```typescript
import admin from 'firebase-admin';
import fs from 'fs';

const serviceAccount = JSON.parse(fs.readFileSync('./firebase-key.json', 'utf8'));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

// Voir tous les comptes bloqués
async function showBlockedAccounts() {
  const snapshot = await db
    .collection('loginAttempts')
    .where('isLocked', '==', true)
    .get();

  snapshot.forEach(doc => {
    console.log(`🔒 ${doc.id}`, doc.data());
  });
}

showBlockedAccounts();
```

### Exécution :

```bash
npx ts-node script.ts
```

---

## 🔧 Méthode 4 : Via Admin Panel (À Faire)

Créer une page d'admin pour voir/gérer les comptes bloqués :

### Fonctionnalités :
- ✅ Liste de tous les comptes bloqués
- ✅ Voir les détails (email, tentatives, date)
- ✅ Débloquer d'un clic
- ✅ Filtrer par date, email
- ✅ Exporter en CSV

### Route proposée : `/admin/blocked-accounts`

---

## 🎯 Résumé Rapide

| Besoin | Méthode | Temps |
|--------|---------|-------|
| Vérifier rapidement | Console Firebase | 2 min ⭐ |
| Chercher un compte | CLI firebase | 3 min |
| Débloquer automatiquement | Script Node | 5 min |
| Interface complète | Admin Panel | À développer |

---

## 💡 Filtrer dans Firestore Console

Dans la Console Firebase, tu peux ajouter des filtres :

1. Cliquer sur "Add filter"
2. Sélectionner le champ : `isLocked`
3. Condition : `==` (égal à)
4. Valeur : `true`

✅ Cela affichera **UNIQUEMENT les comptes bloqués**

---

## 🚨 Actions Rapides

### Débloquer un Compte (Console)

1. Ouvrir le document bloqué
2. Cliquer sur l'icône ✏️ (Edit)
3. Modifier `isLocked` → `false`
4. Modifier `failedAttempts` → `0`
5. Cliquer "Update"

### Débloquer Plusieurs Comptes (CLI)

```bash
firebase firestore:delete loginAttempts/user1@example.com --project=roadworks-tracker
firebase firestore:delete loginAttempts/user2@example.com --project=roadworks-tracker
```

---

## 📊 Statistiques

Tu peux aussi créer des rapports :

```typescript
// Nombre de comptes bloqués
const blockedCount = await db.collection('loginAttempts')
  .where('isLocked', '==', true)
  .get();
console.log(`Total bloqués: ${blockedCount.size}`);

// Nombre de tentatives aujourd'hui
const today = new Date();
today.setHours(0, 0, 0, 0);
const failedToday = await db.collection('loginAttempts')
  .where('lastFailedAttempt', '>=', today)
  .get();
console.log(`Tentatives aujourd'hui: ${failedToday.size}`);
```

