declare module "@react-native-firebase/app" {
  const firebaseApp: unknown;
  export default firebaseApp;
}

declare module "@react-native-firebase/messaging" {
  export enum AuthorizationStatus {
    NOT_DETERMINED = -1,
    DENIED = 0,
    AUTHORIZED = 1,
    PROVISIONAL = 2,
    EPHEMERAL = 3,
  }

  export namespace FirebaseMessagingTypes {
    interface RemoteMessage {
      data?: Record<string, string>;
      messageId?: string;
    }
  }

  type Unsubscribe = () => void;

  interface FirebaseMessagingModule {
    requestPermission(): Promise<AuthorizationStatus>;
    registerDeviceForRemoteMessages(): Promise<void>;
    getToken(): Promise<string>;
    onTokenRefresh(listener: (token: string) => void): Unsubscribe;
    onMessage(
      listener: (message: FirebaseMessagingTypes.RemoteMessage) => void,
    ): Unsubscribe;
    onNotificationOpenedApp(
      listener: (message: FirebaseMessagingTypes.RemoteMessage) => void,
    ): Unsubscribe;
    getInitialNotification(): Promise<FirebaseMessagingTypes.RemoteMessage | null>;
    setBackgroundMessageHandler(
      handler: (message: FirebaseMessagingTypes.RemoteMessage) => Promise<void>,
    ): void;
  }

  export default function messaging(): FirebaseMessagingModule;
}