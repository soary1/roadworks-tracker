<template>

<ion-page class="auth-page">
  <!-- Header -->
  <ion-header style="display: none;">
    <ion-toolbar>
      <ion-title>S'inscrire</ion-title>
    </ion-toolbar>
  </ion-header>

  <!-- Content-->
  <ion-content class="ion-padding auth-container">
    
    <div class="auth-header">
      <div class="auth-logo"></div>
      <ion-text>
        <h1>Bienvenue!</h1>
      </ion-text>
      <p>Créez votre compte Roadworks</p>
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
            :readonly="awaitSignUp">
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
            placeholder="Minimum 6 caractères"
            v-model="password"
            :readonly="awaitSignUp">
          </ion-input>
        </ion-item>
      </div>

      <!-- Confirm Pwd -->
      <div class="form-group">
        <label class="form-label">Confirmer mot de passe *</label>
        <ion-item lines="none" style="--background: transparent; --border-color: transparent;">
          <ion-input 
            type="password"
            class="form-input"
            placeholder="Confirmez votre mot de passe"
            v-model="confirmPassword"
            :readonly="awaitSignUp">
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

      <!-- Sign up button -->
      <ion-button 
        expand="block" 
        @click="handleSignUp" 
        :disabled="isSignUpButtonDisabled"
        style="margin-top: var(--spacing-lg);">

        <ion-text v-if="!awaitSignUp">Créer un compte</ion-text>
        <ion-spinner v-else name="crescent"></ion-spinner>  
        <ion-icon v-if="!awaitSignUp" :icon="checkmarkOutline" slot="end"></ion-icon>

      </ion-button>

      <!-- Sign in link -->
      <div style="text-align: center; margin-top: var(--spacing-lg);">
        <span style="color: rgba(255, 255, 255, 0.7); font-size: 0.875rem;">
          Vous avez déjà un compte? 
          <span style="color: #FF8C00; cursor: pointer; font-weight: 600;" @click="goToSignIn">
            Se connecter
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

import { checkmarkOutline, alertCircleOutline, cloudOfflineOutline } from 'ionicons/icons';

import router from '@/router';

import { createUserWithEmailAndPassword } from 'firebase/auth';
import { FirebaseError } from 'firebase/app';

import { auth } from '@/services/firebase/routeworks-tracker';
import { showToast } from '@/utils/ui';

// Input
const email = ref<string>('');
const password = ref<string>('');
const confirmPassword = ref<string>('');

// Disable button or not
const awaitSignUp = ref<boolean>(false);

const isSignUpButtonDisabled = computed<boolean>(() => {
  return awaitSignUp.value || !email.value || !password.value || !confirmPassword.value;
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

const handleSignUp = async () => {
  clearErrors();
  
  // Validation
  if (password.value !== confirmPassword.value) {
    errors.value.simpleErrorMessage = 'Les mots de passe ne correspondent pas.';
    return;
  }

  if (password.value.length < 6) {
    errors.value.simpleErrorMessage = 'Le mot de passe doit contenir au moins 6 caractères.';
    return;
  }

  awaitSignUp.value = true;
  try {
    await createUserWithEmailAndPassword(auth, email.value, password.value);
    
    showToast('Compte créé avec succès! Redirection...', 3000, checkmarkOutline, 'success', 'bottom');
    
    email.value = '';
    password.value = '';
    confirmPassword.value = '';

    setTimeout(() => {
      router.push('/auth/signIn');
    }, 1500);
  } catch (error) {
    if (error instanceof FirebaseError) {
      switch (error.code) {
        case 'auth/network-request-failed':
          showToast('Vérifiez votre accès internet.', 5000, cloudOfflineOutline, 'danger', 'bottom')
          break;

        case 'auth/email-already-in-use':
          errors.value.errorCardTitle = 'Email déjà utilisé';
          errors.value.errorCardContent = 'Cet email est déjà associé à un compte. Veuillez utiliser un autre email ou vous connecter.';
          errors.value.displayErrorCard = true;
          break;

        case 'auth/invalid-email':
          errors.value.simpleErrorMessage = 'Veuillez entrer une adresse email valide.';
          break;

        case 'auth/weak-password':
          errors.value.simpleErrorMessage = 'Le mot de passe est trop faible. Utilisez au moins 6 caractères avec des majuscules et des chiffres.';
          break;

        default:
          errors.value.simpleErrorMessage = 'Une erreur est survenue lors de la création du compte.';
      }
    } else {
      console.log(error);
      showToast('Une erreur inattendue est survenue', 5000, alertCircleOutline, 'danger', 'bottom')
    }
  } finally {
    awaitSignUp.value = false;
  }
}

const goToSignIn = () => {
  router.push('/auth/signIn');
}

</script>
