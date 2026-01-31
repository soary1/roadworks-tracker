// Script de test - À exécuter dans la console du navigateur (F12 DevTools)
// sur la page de connexion

console.log("🧪 Démarrage des tests du système de blocage de compte...\n");

// Import des services
import { 
  getLoginAttempt, 
  isAccountLocked, 
  recordFailedAttempt, 
  resetLoginAttempts,
  unlockAccount 
} from '@/services/firebase/auth-attempts';

// Variables de test
const TEST_EMAIL = 'test-blocage@example.com';

// Test 1 : Vérifier que le service est chargé
console.log("✓ Test 1 : Services importés correctement");

// Test 2 : Vérifier l'état initial du compte
async function testInitialState() {
  console.log("\n📍 Test 2 : État initial du compte");
  const attempt = await getLoginAttempt(TEST_EMAIL);
  console.log("   Résultat :", attempt || "Aucune tentative enregistrée (normal)");
}

// Test 3 : Enregistrer une tentative échouée
async function testRecordFailedAttempt() {
  console.log("\n📍 Test 3 : Enregistrement d'une tentative échouée");
  const result = await recordFailedAttempt(TEST_EMAIL, 'test-user-id');
  console.log("   Tentatives échouées :", result.failedAttempts);
  console.log("   Compte bloqué :", result.isLocked);
  
  if (result.failedAttempts === 1 && !result.isLocked) {
    console.log("   ✅ PASS : Première tentative enregistrée correctement");
  } else {
    console.log("   ❌ FAIL : Résultat inattendu");
  }
}

// Test 4 : Vérifier les données dans Firestore
async function testFirestoreData() {
  console.log("\n📍 Test 4 : Vérification des données Firestore");
  const attempt = await getLoginAttempt(TEST_EMAIL);
  console.log("   Données stockées :", JSON.stringify(attempt, null, 2));
}

// Test 5 : Enregistrer 3 tentatives pour bloquer le compte
async function testBlockAccount() {
  console.log("\n📍 Test 5 : Blocage du compte après 3 tentatives");
  
  // Réinitialiser d'abord
  await resetLoginAttempts(TEST_EMAIL);
  
  // Tentative 1
  console.log("   Tentative 1...");
  let result = await recordFailedAttempt(TEST_EMAIL);
  console.log("     - Tentatives : " + result.failedAttempts + " / 3");
  console.log("     - Bloqué : " + result.isLocked);
  
  // Tentative 2
  console.log("   Tentative 2...");
  result = await recordFailedAttempt(TEST_EMAIL);
  console.log("     - Tentatives : " + result.failedAttempts + " / 3");
  console.log("     - Bloqué : " + result.isLocked);
  
  // Tentative 3
  console.log("   Tentative 3...");
  result = await recordFailedAttempt(TEST_EMAIL);
  console.log("     - Tentatives : " + result.failedAttempts + " / 3");
  console.log("     - Bloqué : " + result.isLocked);
  
  if (result.failedAttempts === 3 && result.isLocked) {
    console.log("   ✅ PASS : Compte bloqué après 3 tentatives");
  } else {
    console.log("   ❌ FAIL : Le compte n'a pas été bloqué correctement");
  }
}

// Test 6 : Vérifier le blocage
async function testIsAccountLocked() {
  console.log("\n📍 Test 6 : Vérification du blocage");
  const locked = await isAccountLocked(TEST_EMAIL);
  console.log("   Compte bloqué :", locked);
  
  if (locked) {
    console.log("   ✅ PASS : Compte correctement détecté comme bloqué");
  } else {
    console.log("   ❌ FAIL : Compte devrait être bloqué");
  }
}

// Test 7 : Débloquer le compte
async function testUnlockAccount() {
  console.log("\n📍 Test 7 : Déblocage du compte");
  await unlockAccount(TEST_EMAIL);
  const locked = await isAccountLocked(TEST_EMAIL);
  const attempt = await getLoginAttempt(TEST_EMAIL);
  
  console.log("   Compte bloqué après déblocage :", locked);
  console.log("   Tentatives échouées :", attempt?.failedAttempts);
  
  if (!locked && attempt?.failedAttempts === 0) {
    console.log("   ✅ PASS : Compte débloqué et réinitialisé correctement");
  } else {
    console.log("   ❌ FAIL : Le déblocage n'a pas fonctionné");
  }
}

// Test 8 : Réinitialisation après succès
async function testResetAfterSuccess() {
  console.log("\n📍 Test 8 : Réinitialisation après connexion réussie");
  
  // Créer quelques tentatives
  await recordFailedAttempt(TEST_EMAIL);
  await recordFailedAttempt(TEST_EMAIL);
  
  let attempt = await getLoginAttempt(TEST_EMAIL);
  console.log("   Avant réinitialisation - Tentatives :", attempt?.failedAttempts);
  
  // Réinitialiser (simule une connexion réussie)
  await resetLoginAttempts(TEST_EMAIL);
  
  attempt = await getLoginAttempt(TEST_EMAIL);
  console.log("   Après réinitialisation - Tentatives :", attempt?.failedAttempts);
  
  if (attempt?.failedAttempts === 0) {
    console.log("   ✅ PASS : Tentatives réinitialisées après succès");
  } else {
    console.log("   ❌ FAIL : Les tentatives n'ont pas été réinitialisées");
  }
}

// Exécuter tous les tests
async function runAllTests() {
  try {
    await testInitialState();
    await testRecordFailedAttempt();
    await testFirestoreData();
    await testBlockAccount();
    await testIsAccountLocked();
    await testUnlockAccount();
    await testResetAfterSuccess();
    
    console.log("\n✅ ================================");
    console.log("🎉 Tous les tests sont terminés !");
    console.log("================================\n");
    
    // Nettoyage
    console.log("🧹 Nettoyage : Suppression des données de test...");
    await unlockAccount(TEST_EMAIL);
    console.log("✓ Données de test supprimées\n");
    
  } catch (error) {
    console.error("\n❌ ERREUR :", error);
  }
}

// Lancer les tests
runAllTests();
