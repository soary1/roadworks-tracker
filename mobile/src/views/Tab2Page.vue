<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <div style="display: flex; align-items: center; width: 100%; justify-content: space-between; padding: 0 var(--spacing-md);">
          <div style="width: 40px; height: 40px; background: url('/logo-clean.png') center / contain no-repeat;"></div>
          <ion-title style="flex-grow: 1; text-align: center; margin: 0;">Récapitulatif</ion-title>
          <div style="width: 40px;"></div>
        </div>
      </ion-toolbar>
    </ion-header>
    <ion-content :fullscreen="true" class="ion-padding">
      <ion-header collapse="condense">
        <ion-toolbar>
          <ion-title size="large">Récapitulatif</ion-title>
        </ion-toolbar>
      </ion-header>

      <!-- Statistics Cards -->
      <ion-card>
        <ion-card-header>
          <ion-card-title>Statistiques</ion-card-title>
        </ion-card-header>
        <ion-card-content>
          <ion-grid>
            <ion-row>
              <ion-col size="6">
                <div class="metric">
                  <div class="metric__label">Signalements</div>
                  <div class="metric__value">0</div>
                </div>
              </ion-col>
              <ion-col size="6">
                <div class="metric">
                  <div class="metric__label">En cours</div>
                  <div class="metric__value">0</div>
                </div>
              </ion-col>
            </ion-row>
          </ion-grid>
        </ion-card-content>
      </ion-card>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent } from '@ionic/vue';
</script>
