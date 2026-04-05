import messaging from "@react-native-firebase/messaging";

import { normalizeNotificationData } from "./types";

let isBackgroundHandlerRegistered = false;

export const registerBackgroundHandler = () => {
  if (isBackgroundHandlerRegistered) {
    return;
  }

  messaging().setBackgroundMessageHandler(async (remoteMessage) => {
    const notificationData = normalizeNotificationData(remoteMessage.data);

    if (__DEV__ && Object.keys(notificationData).length > 0) {
      console.log("Received background notification.", notificationData);
    }
  });

  isBackgroundHandlerRegistered = true;
};
