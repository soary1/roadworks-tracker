<template>

<ion-page class="auth-page">
  <!-- Header -->
  <ion-header style="display: none;">
    <ion-toolbar>
      <ion-title>Se Connecter</ion-title>
    </ion-toolbar>
  </ion-header>

  <!-- Content-->
  <ion-content class="ion-padding auth-container">
    
    <div class="auth-header">
      <div class="auth-logo"></div>
      <ion-text>
        <h1>Bienvenue!</h1>
      </ion-text>
      <p>Connectez-vous à votre compte Roadworks</p>
    </div>

    <div class="auth-form">
      <!-- Email -->
      <div class="form-group">
        <label class="form-label">Email *</label>
        <ion-item lines="none" style="--background: transparent; --border-color: transparent;">
          <ion-input 
            type="email" 
            class="form-input"
            placeholder="exemple@mail.fr"
            v-model="email"
            :readonly="awaitSignIn">
          </ion-input>
        </ion-item>
      </div>

      <!-- Pwd -->
      <div class="form-group">
        <label class="form-label">Mot de passe *</label>
        <ion-item lines="none" style="--background: transparent; --border-color: transparent;">
          <ion-input 
            type="password"
            class="form-input"
            v-model="password"
            :readonly="awaitSignIn">
          </ion-input>
        </ion-item>
      </div>

      <!-- Error card -->
      <ion-card v-if="errors.displayErrorCard" style="margin: var(--spacing-lg) 0;">
        <ion-card-header>
          <ion-card-title color="danger">{{ errors.errorCardTitle }}</ion-card-title>
        </ion-card-header>

        <ion-card-content>
          {{ errors.errorCardContent }}
        </ion-card-content>
      </ion-card>

      <!-- Simple error message -->
      <ion-text v-if="errors.simpleErrorMessage.length > 0"
        color="danger" class="error-message">
        <small v-html="errors.simpleErrorMessage"></small>
      </ion-text>

      <!-- Sign in button -->
      <ion-button 
        expand="block" 
        @click="handleSignIn" 
        :disabled="isSignInButtonDisabled"
        style="margin-top: var(--spacing-lg);">

        <ion-text v-if="!awaitSignIn">Se Connecter</ion-text>
        <ion-spinner v-else name="crescent"></ion-spinner>  
        <ion-icon v-if="!awaitSignIn" :icon="logInOutline" slot="end"></ion-icon>

      </ion-button>

      <!-- Sign up link -->
      <div style="text-align: center; margin-top: var(--spacing-lg);">
        <span style="color: rgba(255, 255, 255, 0.7); font-size: 0.875rem;">
          Pas encore de compte? 
          <span style="color: #FF8C00; cursor: pointer; font-weight: 600;" @click="goToSignUp">
            S'inscrire
          </span>
        </span>
      </div>
    </div>

  </ion-content>
</ion-page>

</template>

<script setup lang="ts">
import { computed, ref } from 'vue';

import { 
  IonPage, IonHeader, IonContent, 
  IonToolbar, IonTitle, IonText,
  IonItem, IonInput, IonButton, 
  IonIcon, IonSpinner, IonCard, 
  IonCardTitle, IonCardContent, IonCardHeader
} from '@ionic/vue';

import { logInOutline, alertCircleOutline, cloudOfflineOutline } from 'ionicons/icons';

import router from '@/router';

import { signInWithEmailAndPassword } from 'firebase/auth';
import { FirebaseError } from 'firebase/app';

import { auth } from '@/services/firebase/routeworks-tracker';
import { 
  isAccountLocked, 
  recordFailedAttempt, 
  resetLoginAttempts
} from '@/services/firebase/auth-attempts';
import { showToast } from '@/utils/ui';
import { useConfigStore } from '@/pinia/firebase/routeworks-tracker';
import { useAuthSessionStore } from '@/pinia/auth/session';

// Input
const email = ref<string>('');
const password = ref<string>('');

// Disable button or not
const awaitSignIn = ref<boolean>(false);

const isSignInButtonDisabled = computed<boolean>(() => {
  return awaitSignIn.value || !email.value || !password.value;
})

// Error management
const errors = ref({
  simpleErrorMessage: '',
  errorCardTitle: '',
  errorCardContent: '',
  displayErrorCard: false,
});

const clearErrors = () => {
  errors.value.simpleErrorMessage = '';
  errors.value.errorCardTitle = '';
  errors.value.errorCardContent = '';
  errors.value.displayErrorCard = false;
};

const handleSignIn = async () => {
  clearErrors();
  awaitSignIn.value = true;
  try {
    // Vérifier si le compte est bloqué
    const locked = await isAccountLocked(email.value);
    if (locked) {
      errors.value.errorCardTitle = 'Compte bloqué';
      errors.value.errorCardContent = 
        'Suite à trop de tentatives échouées, ce compte a été bloqué. Veuillez contacter l\'administrateur pour le débloquer.';
      errors.value.displayErrorCard = true;
      awaitSignIn.value = false;
      return;
    }

    await signInWithEmailAndPassword(auth, email.value, password.value);
    
    // Connexion réussie : réinitialiser les tentatives
    await resetLoginAttempts(email.value);
    
    const configStore = useConfigStore();
    const sessionExpiresAt = Date.now() + configStore.sessionDurationMillis;

    const authSessionStore = useAuthSessionStore();
    await authSessionStore.setSession(sessionExpiresAt);
    
    email.value = '';
    password.value = '';

    router.push('/');
  } catch (error) {
    if (error instanceof FirebaseError) {
      // Enregistrer la tentative échouée
      const result = await recordFailedAttempt(email.value);
      
      switch (error.code) {
        case 'auth/network-request-failed':
          showToast('Vérifiez votre accès internet.', 5000, cloudOfflineOutline, 'danger', 'bottom')
          break;

        case 'auth/user-disabled':
          errors.value.errorCardTitle = 'Compte suspendu';
          errors.value.errorCardContent = 'Il semblerai que ce compte a été suspendu.';
          errors.value.displayErrorCard = true;
          break;

        case 'auth/too-many-requests':
          errors.value.simpleErrorMessage = 
            "Accès temporairement bloqué suite à trop d'échecs.<br>Réessayez dans quelques minutes.";
          break;

        case 'auth/invalid-credential':
        case 'auth/user-not-found':     
        case 'auth/wrong-password':
        case 'auth/invalid-email':
          // Afficher le nombre de tentatives restantes
          const remainingAttempts = 3 - result.failedAttempts;
          if (result.isLocked) {
            errors.value.errorCardTitle = 'Compte bloqué';
            errors.value.errorCardContent = 
              'Suite à trop de tentatives échouées, ce compte a été bloqué. Veuillez contacter l\'administrateur pour le débloquer.';
            errors.value.displayErrorCard = true;
          } else if (remainingAttempts > 0) {
            errors.value.simpleErrorMessage = 
              `Identifiants incorrects.<br><strong>${remainingAttempts} tentative(s) restante(s)</strong> avant blocage du compte.`;
          } else {
            errors.value.simpleErrorMessage = 
              "Veuillez vérifier votre e-mail et votre mot de passe.";
          }
          break;
      }
    } else {
      console.log(error);
      showToast('Une erreur inattendue est survenue', 5000, alertCircleOutline, 'danger', 'bottom')
    }
  } finally {
    awaitSignIn.value = false;
  }
}

const goToSignUp = () => {
  router.push('/auth/signUp');
}

</script>