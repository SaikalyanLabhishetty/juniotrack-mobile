import messaging, {
    FirebaseMessagingTypes,
} from "@react-native-firebase/messaging";

import {
    AttendanceOpenHandler,
    isAttendanceNotificationData,
    normalizeNotificationData,
} from "./types";

const handleAttendanceNotification = (
  remoteMessage: FirebaseMessagingTypes.RemoteMessage | null,
  onAttendanceOpen: AttendanceOpenHandler,
) => {
  if (!remoteMessage) {
    return;
  }

  const notificationData = normalizeNotificationData(remoteMessage.data);
  if (!isAttendanceNotificationData(notificationData)) {
    return;
  }

  onAttendanceOpen(notificationData);
};

export const registerNotificationListeners = (
  onAttendanceOpen: AttendanceOpenHandler,
) => {
  const unsubscribeForeground = messaging().onMessage((remoteMessage) => {
    handleAttendanceNotification(remoteMessage, onAttendanceOpen);
  });

  const unsubscribeNotificationOpen = messaging().onNotificationOpenedApp(
    (remoteMessage) => {
      handleAttendanceNotification(remoteMessage, onAttendanceOpen);
    },
  );

  return () => {
    unsubscribeForeground();
    unsubscribeNotificationOpen();
  };
};

export const registerInitialNotification = async (
  onAttendanceOpen: AttendanceOpenHandler,
) => {
  const initialNotification = await messaging().getInitialNotification();
  handleAttendanceNotification(initialNotification, onAttendanceOpen);
};
