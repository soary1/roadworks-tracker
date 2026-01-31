<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>Test - Blocage de Compte</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <ion-text color="primary">
        <h1>🧪 Tests du Système de Blocage</h1>
      </ion-text>

      <!-- Email Input -->
      <ion-item class="ion-margin-bottom" lines="none">
        <ion-input 
          type="email" 
          label="Email de test"
          label-placement="stacked" 
          placeholder="test@example.com"
          v-model="testEmail">
        </ion-input>
      </ion-item>

      <!-- Test Buttons -->
      <div class="test-buttons">
        <ion-button expand="block" @click="testGetStatus">
          📊 Voir le statut
        </ion-button>

        <ion-button expand="block" @click="testRecordFailed">
          ❌ Enregistrer tentative échouée
        </ion-button>

        <ion-button expand="block" @click="testSimulateBlock">
          🔒 Simuler 3 tentatives (Bloquer)
        </ion-button>

        <ion-button expand="block" @click="testCheckLocked">
          🔍 Vérifier si bloqué
        </ion-button>

        <ion-button expand="block" @click="testUnlock" color="warning">
          🔓 Débloquer le compte
        </ion-button>

        <ion-button expand="block" @click="testReset" color="success">
          🔄 Réinitialiser
        </ion-button>
      </div>

      <!-- Results Card -->
      <ion-card v-if="result" class="ion-margin-top">
        <ion-card-header>
          <ion-card-title>📝 Résultats</ion-card-title>
        </ion-card-header>
        <ion-card-content>
          <pre>{{ result }}</pre>
        </ion-card-content>
      </ion-card>

      <!-- Logs Card -->
      <ion-card class="ion-margin-top">
        <ion-card-header>
          <ion-card-title>📋 Logs</ion-card-title>
        </ion-card-header>
        <ion-card-content>
          <div class="logs" v-if="logs.length > 0">
            <div v-for="(log, index) in logs" :key="index" :class="log.type">
              {{ log.message }}
            </div>
          </div>
          <p v-else style="color: #999;">Aucun log pour le moment...</p>
        </ion-card-content>
      </ion-card>

      <ion-button expand="block" @click="clearLogs" color="danger" class="ion-margin-top">
        🗑️ Effacer les logs
      </ion-button>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import {
  IonPage, IonHeader, IonContent,
  IonToolbar, IonTitle, IonText,
  IonItem, IonInput, IonButton,
  IonCard, IonCardHeader, IonCardTitle, IonCardContent
} from '@ionic/vue';

import {
  getLoginAttempt,
  isAccountLocked,
  recordFailedAttempt,
  resetLoginAttempts,
  unlockAccount
} from '@/services/firebase/auth-attempts';

const testEmail = ref<string>('test-blocage@example.com');
const result = ref<string>('');
const logs = ref<Array<{ message: string; type: string }>>([]);

const addLog = (message: string, type: string = 'info') => {
  const timestamp = new Date().toLocaleTimeString();
  logs.value.unshift({
    message: `[${timestamp}] ${message}`,
    type
  });
};

const testGetStatus = async () => {
  try {
    addLog(`Récupération du statut pour ${testEmail.value}...`);
    const attempt = await getLoginAttempt(testEmail.value);
    result.value = JSON.stringify(attempt, null, 2) || 'Aucune donnée';
    addLog('✅ Statut récupéré', 'success');
  } catch (error) {
    addLog(`❌ Erreur: ${error}`, 'error');
  }
};

const testRecordFailed = async () => {
  try {
    addLog(`Enregistrement tentative échouée pour ${testEmail.value}...`);
    const res = await recordFailedAttempt(testEmail.value);
    result.value = JSON.stringify(res, null, 2);
    addLog(`✅ Tentative enregistrée (Total: ${res.failedAttempts}/3, Bloqué: ${res.isLocked})`, 'success');
  } catch (error) {
    addLog(`❌ Erreur: ${error}`, 'error');
  }
};

const testSimulateBlock = async () => {
  try {
    addLog('🔄 Réinitialisation du compte...');
    await resetLoginAttempts(testEmail.value);
    
    addLog('Tentative 1/3...');
    let res = await recordFailedAttempt(testEmail.value);
    
    addLog('Tentative 2/3...');
    res = await recordFailedAttempt(testEmail.value);
    
    addLog('Tentative 3/3...');
    res = await recordFailedAttempt(testEmail.value);
    
    result.value = JSON.stringify(res, null, 2);
    if (res.isLocked) {
      addLog('✅ Compte bloqué avec succès!', 'success');
    } else {
      addLog('❌ Compte n\'a pas été bloqué', 'error');
    }
  } catch (error) {
    addLog(`❌ Erreur: ${error}`, 'error');
  }
};

const testCheckLocked = async () => {
  try {
    addLog(`Vérification du blocage pour ${testEmail.value}...`);
    const locked = await isAccountLocked(testEmail.value);
    result.value = `Compte bloqué: ${locked}`;
    addLog(locked ? '🔒 Compte EST bloqué' : '✅ Compte n\'est pas bloqué', locked ? 'warning' : 'success');
  } catch (error) {
    addLog(`❌ Erreur: ${error}`, 'error');
  }
};

const testUnlock = async () => {
  try {
    addLog(`Déblocage du compte ${testEmail.value}...`);
    await unlockAccount(testEmail.value);
    result.value = 'Compte débloqué';
    addLog('✅ Compte débloqué avec succès!', 'success');
  } catch (error) {
    addLog(`❌ Erreur: ${error}`, 'error');
  }
};

const testReset = async () => {
  try {
    addLog(`Réinitialisation du compte ${testEmail.value}...`);
    await resetLoginAttempts(testEmail.value);
    result.value = 'Compte réinitialisé';
    addLog('✅ Compte réinitialisé avec succès!', 'success');
  } catch (error) {
    addLog(`❌ Erreur: ${error}`, 'error');
  }
};

const clearLogs = () => {
  logs.value = [];
  addLog('Logs effacés');
};
</script>

<style scoped>
.test-buttons {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 20px;
}

.logs {
  max-height: 300px;
  overflow-y: auto;
  font-family: monospace;
  font-size: 12px;
}

.logs div {
  padding: 4px 0;
  border-bottom: 1px solid #eee;
}

.logs div.success {
  color: #2dd36f;
}

.logs div.error {
  color: #eb445a;
}

.logs div.warning {
  color: #ffc409;
}

.logs div.info {
  color: #0d47a1;
}

pre {
  background: #f5f5f5;
  padding: 12px;
  border-radius: 8px;
  overflow-x: auto;
  max-height: 300px;
}
</style>
