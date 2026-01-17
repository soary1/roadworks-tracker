import { PushNotifications } from "@capacitor/push-notifications";
import { auth, db } from '@/firebase';
import { doc, setDoc } from "firebase/firestore";

export const setupPush = async () => {
  let permission = await PushNotifications.checkPermissions();

  if (permission.receive === 'prompt') {
    permission = await PushNotifications.requestPermissions();
  }

  if (permission.receive !== 'granted') {
    return;
  }

  await PushNotifications.register();

  PushNotifications.addListener('registration', async (token) => {
    const userId = auth.currentUser?.uid;

    if (userId) {
      const userRef = doc(db, 'users', userId);
      await setDoc(userRef, {
        fcmToken: token.value
      }, { merge : true });
    }
  });
};