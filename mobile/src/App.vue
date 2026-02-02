<template>
  <ion-app>
    <NoConnectionPage v-if="!networkStore.hasConnection" />
    <ion-router-outlet v-else />
  </ion-app>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { IonApp, IonRouterOutlet } from '@ionic/vue';
import NoConnectionPage from '@/views/NoConnectionPage.vue';
import { useNetworkStore } from '@/pinia/network';

const networkStore = useNetworkStore();

onMounted(async () => {
  await networkStore.initializeNetworkMonitoring();
});
</script>
