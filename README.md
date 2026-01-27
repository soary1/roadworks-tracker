# roadworks-tracker

## Synchronisation Backend → Firebase (Firestore)

Le backend Spring Boot peut publier les signalements dans Firestore (collection `roadworks_reports`) afin que l’application mobile puisse les consommer ensuite.

### Endpoints utiles

- `POST /api/signalements/{id}/sync/firebase` : synchronise un signalement vers Firebase
- `POST /api/signalements/sync/firebase/all` : synchronise tous les signalements vers Firebase
- `POST /api/signalements/sync/firebase` : importe les signalements depuis Firebase vers la base locale

### Synchronisation automatique

Après une mise à jour du statut (`PUT /api/signalements/{id}/status`) ou l’ajout de travaux (`POST /api/signalements/{id}/work`), le backend tente aussi une synchronisation vers Firebase en “best effort” (si Firebase n’est pas configuré, l’opération principale reste OK).

