<template>
  <ion-modal ref="modal" trigger="open-report-modal">
    
    <ion-header>
      <ion-toolbar>
        <ion-button  fill="clear" slot="start" @click="handleCancelReport" color="medium">
          <ion-icon slot="icon-only" :icon="arrowBackOutline"></ion-icon>
        </ion-button>
      </ion-toolbar>
    </ion-header>
    
    <ion-content class="ion-padding">
      <ion-text color="primary">
        <h1>Signaler un probleme routier</h1>
      </ion-text>
    </ion-content>

  </ion-modal>
</template>

<script setup lang="ts">
import { 
  IonModal, IonHeader, IonToolbar,
  IonText, IonContent, IonButton,
  IonIcon
} from '@ionic/vue';

import { arrowBackOutline } from 'ionicons/icons';

import { ref } from 'vue';

const modal = ref();
const handleCancelReport = () => modal.value.$el.dismiss(null, 'cancel');
</script>