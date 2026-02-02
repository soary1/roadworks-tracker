export interface NetworkStatus {
  connected: boolean;
  connectionType: string;
}

/**
 * Vérifier l'état de la connexion réseau
 */
export const checkNetworkStatus = async (): Promise<NetworkStatus> => {
  return {
    connected: navigator.onLine,
    connectionType: navigator.onLine ? 'wifi' : 'none',
  };
};

/**
 * S'abonner aux changements de l'état du réseau
 */
export const subscribeToNetworkChanges = (
  callback: (status: NetworkStatus) => void
): (() => void) => {
  const handleOnlineChange = () => {
    callback({
      connected: navigator.onLine,
      connectionType: navigator.onLine ? 'wifi' : 'none',
    });
  };

  window.addEventListener('online', handleOnlineChange);
  window.addEventListener('offline', handleOnlineChange);

  return () => {
    window.removeEventListener('online', handleOnlineChange);
    window.removeEventListener('offline', handleOnlineChange);
  };
};
