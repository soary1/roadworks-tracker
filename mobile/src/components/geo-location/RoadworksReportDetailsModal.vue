<template>
  <ion-modal
    :is-open="isOpen"
    @didDismiss="$emit('close')"
    :initial-breakpoint="0.85"
    :breakpoints="[0, 0.85, 1]"
    :backdrop-breakpoint="0.5"
  >
    <ion-header>
      <ion-toolbar>
        <ion-title>Détails du signalement</ion-title>
        <ion-buttons slot="end">
          <ion-button @click="$emit('close')">Fermer</ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding" v-if="report">
      <!-- Type et emoji -->
      <div class="report-header">
        <div class="emoji-large">{{ getStatusEmoji(report.status) }}</div>
        <div>
          <h2>{{ getStatusLabel(report.status) }}</h2>
          <p class="description" v-if="report.description">"{{ report.description }}"</p>
        </div>
      </div>

      <!-- Localisation -->
      <ion-card>
        <ion-card-header>
          <ion-card-title>📍 Localisation</ion-card-title>
        </ion-card-header>
        <ion-card-content>
          <p><strong>Latitude:</strong> {{ report.lat.toFixed(6) }}</p>
          <p><strong>Longitude:</strong> {{ report.lng.toFixed(6) }}</p>
        </ion-card-content>
      </ion-card>

      <!-- Statut du rapport -->
      <ion-card>
        <ion-card-header>
          <ion-card-title>📊 Statut</ion-card-title>
        </ion-card-header>
        <ion-card-content>
          <ion-item>
            <ion-label>État du rapport:</ion-label>
            <ion-badge :color="getReportStatusColor(report.reportStatus || 'new')">
              {{ getReportStatusLabel(report.reportStatus || 'new') }}
            </ion-badge>
          </ion-item>
        </ion-card-content>
      </ion-card>

      <!-- Travaux -->
      <ion-card class="work-card">
        <ion-card-header>
          <ion-card-title>🔧 Travaux</ion-card-title>
        </ion-card-header>
        <ion-card-content>
          <ion-item lines="none">
            <ion-label>
              <p class="work-label">Entreprise</p>
              <h3>{{ report.work?.company || '—' }}</h3>
            </ion-label>
          </ion-item>
          <ion-item lines="none">
            <ion-label>
              <p class="work-label">Surface</p>
              <h3>{{ report.work?.surface != null ? `${report.work.surface} m²` : '—' }}</h3>
            </ion-label>
          </ion-item>
          <ion-item lines="none">
            <ion-label>
              <p class="work-label">Prix</p>
              <h3>{{ report.work?.price != null ? `${report.work.price.toLocaleString()} Ar` : '—' }}</h3>
            </ion-label>
          </ion-item>
          <ion-item v-if="report.work?.startDate" lines="none">
            <ion-label>
              <p class="work-label">Date de début</p>
              <h3>{{ formatSimpleDate(report.work.startDate) }}</h3>
            </ion-label>
          </ion-item>
          <ion-item v-if="report.work?.endDateEstimation" lines="none">
            <ion-label>
              <p class="work-label">Date de fin estimée</p>
              <h3>{{ formatSimpleDate(report.work.endDateEstimation) }}</h3>
            </ion-label>
          </ion-item>
          <ion-item v-if="report.work?.realEndDate" lines="none">
            <ion-label>
              <p class="work-label">Date de fin réelle</p>
              <h3>{{ formatSimpleDate(report.work.realEndDate) }}</h3>
            </ion-label>
          </ion-item>
        </ion-card-content>
      </ion-card>

      <!-- Dates -->
      <ion-card>
        <ion-card-header>
          <ion-card-title>📅 Dates</ion-card-title>
        </ion-card-header>
        <ion-card-content>
          <p>
            <strong>Date:</strong> {{ report.createdAt ? formatDateLong(report.createdAt) : '—' }}
          </p>
          <p>
            <strong>Mis à jour:</strong> {{ report.updatedAt ? formatDateLong(report.updatedAt) : '—' }}
          </p>
        </ion-card-content>
      </ion-card>
    </ion-content>
  </ion-modal>
</template>

<script setup lang="ts">
import {
  IonModal,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonButton,
  IonButtons,
  IonItem,
  IonLabel,
  IonBadge,
} from '@ionic/vue';
import { RoadworksReportWithId } from '@/services/firebase/roadworks-reports';
import {
  getStatusLabel,
  getStatusEmoji,
  getReportStatusLabel,
  getReportStatusColor,
  formatDateLong,
  formatSimpleDate,
} from '@/utils/roadworks-utils';

interface Props {
  isOpen: boolean;
  report: RoadworksReportWithId | null;
}

defineProps<Props>();
</script>

<style scoped>
.report-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 24px;
  padding: 16px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
  color: white;
}

.emoji-large {
  font-size: 48px;
  line-height: 48px;
}

.report-header h2 {
  margin: 0;
  font-size: 20px;
}

.report-header .description {
  margin: 4px 0 0 0;
  font-size: 14px;
  opacity: 0.9;
}

ion-card {
  margin-bottom: 16px;
}

ion-badge {
  margin-left: 8px;
}

.work-card {
  border-left: 4px solid var(--ion-color-success);
}

.work-card ion-card-header {
  background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
  color: white;
}

.work-card ion-card-title {
  color: white;
}

.work-card ion-item {
  --padding-start: 0;
}

.work-label {
  color: var(--ion-color-medium);
  font-size: 12px;
  margin-bottom: 4px;
}

.work-card h3 {
  margin: 0;
  font-weight: 600;
}
</style>
