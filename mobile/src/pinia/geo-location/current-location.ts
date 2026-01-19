import { defineStore } from "pinia";
import { useGeoLocationPermissionStore } from "./permission";
import { Geolocation } from "@capacitor/geolocation";
import { isPlatform } from "@ionic/vue";

// https://capacitorjs.com/docs/apis/geolocation#errors
const CAPACITOR_GEO_ERROR_MESSAGES: Record<string, string> = {
  'OS-PLUG-GLOC-0002': "Erreur lors de l'obtention de la position.",
  'OS-PLUG-GLOC-0003': "La permission de localisation a été refusée.",
  'OS-PLUG-GLOC-0004': "Paramètres d'entrée invalides pour getCurrentPosition.",
  'OS-PLUG-GLOC-0005': "Paramètres d'entrée invalides pour watchPosition.", 
  'OS-PLUG-GLOC-0006': "Paramètres d'entrée invalides pour clearWatch.",
  'OS-PLUG-GLOC-0007': "Les services de localisation sont désactivés.",
  'OS-PLUG-GLOC-0008': "L'accès à la localisation est restreint sur cet appareil.",
  'OS-PLUG-GLOC-0009': "La demande d'activation de la localisation a été refusée.",
  'OS-PLUG-GLOC-0010': "Délai d'attente (timeout) dépassé.",
  'OS-PLUG-GLOC-0011': "La valeur du timeout doit être positive.",
  'OS-PLUG-GLOC-0012': "Identifiant de suivi (WatchId) introuvable.",
  'OS-PLUG-GLOC-0013': "L'identifiant de suivi (WatchId) est requis.",
  'OS-PLUG-GLOC-0014': "Erreur Google Play Services (résoluble par l'utilisateur).",
  'OS-PLUG-GLOC-0015': "Erreur critique Google Play Services.",
  'OS-PLUG-GLOC-0016': "Erreur de configuration des paramètres de localisation.",
  'OS-PLUG-GLOC-0017': "Impossible de localiser : réseau et GPS sont tous deux désactivés."
};

const useCurrentLocationStore = defineStore('current-geo-location', {
  state: () => ({
    coords: null as { lat: number, lng: number } | null,
    isRefreshingCoords: false,
  }),

  actions: {
    async refreshCoords() {
      this.isRefreshingCoords = true;

      const permissionStore = useGeoLocationPermissionStore();

      if (isPlatform('hybrid')) { // Only there for debugging while using web platform
        await permissionStore.requestPermission();
      }
      
      if (permissionStore.isGranted || !isPlatform('hybrid')) { // Only there for debugging while using web platform
        const position = await Geolocation.getCurrentPosition({
          enableHighAccuracy: true,
          timeout: 10_000,
          maximumAge: 5_000,
        });

        if (position) {
          const lat = position.coords.altitude;
          const lng = position.coords.longitude;
          
          if (lat && lng) {
            this.coords = { lat, lng }
          }
        }
      }

      this.isRefreshingCoords = false;
    },
  },
});

export { useCurrentLocationStore }