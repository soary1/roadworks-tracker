import { LocalNotifications, ScheduleOptions } from '@capacitor/local-notifications';

// Labels pour les statuts
const STATUS_LABELS: Record<string, string> = {
  'new': 'Nouveau',
  'in_progress': 'En cours',
  'completed': 'Terminé',
};

/**
 * Initialiser les permissions pour les notifications locales
 */
export const initNotifications = async (): Promise<boolean> => {
  try {
    // Vérifier si les permissions sont accordées
    const permission = await LocalNotifications.checkPermissions();

    if (permission.display === 'granted') {
      console.log('Notifications déjà autorisées');
      return true;
    }

    // Demander les permissions
    const request = await LocalNotifications.requestPermissions();

    if (request.display === 'granted') {
      console.log('Notifications autorisées');
      return true;
    }

    console.warn('Notifications refusées par l\'utilisateur');
    return false;
  } catch (error) {
    console.error('Erreur lors de l\'initialisation des notifications:', error);
    return false;
  }
};

/**
 * Envoyer une notification locale de changement de statut
 */
export const notifyStatusChange = async (
  reportId: string,
  description: string | undefined,
  oldStatus: string | undefined,
  newStatus: string
): Promise<void> => {
  try {
    const newStatusLabel = STATUS_LABELS[newStatus] || newStatus;
    const oldStatusLabel = oldStatus ? (STATUS_LABELS[oldStatus] || oldStatus) : 'Nouveau';

    const shortDescription = description
      ? description.substring(0, 50) + (description.length > 50 ? '...' : '')
      : 'Votre signalement';

    const notification: ScheduleOptions = {
      notifications: [
        {
          id: Math.floor(Math.random() * 100000), // ID unique
          title: 'Statut mis à jour',
          body: `${shortDescription}\n${oldStatusLabel} → ${newStatusLabel}`,
          largeBody: `Le statut de votre signalement "${shortDescription}" a été mis à jour de "${oldStatusLabel}" à "${newStatusLabel}".`,
          summaryText: 'Roadworks Tracker',
          smallIcon: 'ic_stat_icon_config_sample',
          largeIcon: 'ic_launcher',
          channelId: 'status-updates',
          schedule: { at: new Date(Date.now() + 100) }, // Notification immédiate
          extra: {
            reportId,
            newStatus,
          },
        },
      ],
    };

    await LocalNotifications.schedule(notification);
    console.log(`Notification envoyée pour le signalement ${reportId}`);
  } catch (error) {
    console.error('Erreur lors de l\'envoi de la notification:', error);
  }
};

/**
 * Créer le canal de notification pour Android
 */
export const createNotificationChannel = async (): Promise<void> => {
  try {
    await LocalNotifications.createChannel({
      id: 'status-updates',
      name: 'Mises à jour de statut',
      description: 'Notifications pour les changements de statut de vos signalements',
      importance: 4, // HIGH
      visibility: 1, // PUBLIC
      sound: 'default',
      vibration: true,
      lights: true,
    });
    console.log('Canal de notification créé');
  } catch (error) {
    console.error('Erreur lors de la création du canal:', error);
  }
};

/**
 * Configurer les listeners pour les notifications
 */
export const setupNotificationListeners = (): void => {
  // Quand l'utilisateur clique sur une notification
  LocalNotifications.addListener('localNotificationActionPerformed', (notification) => {
    console.log('Notification cliquée:', notification);
    const reportId = notification.notification.extra?.reportId;
    if (reportId) {

      console.log('Naviguer vers le signalement:', reportId);
    }
  });

  // Quand une notification est reçue (app au premier plan)
  LocalNotifications.addListener('localNotificationReceived', (notification) => {
    console.log('Notification reçue:', notification);
  });
};
