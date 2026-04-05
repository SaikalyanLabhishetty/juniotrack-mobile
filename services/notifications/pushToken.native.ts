import "@react-native-firebase/app";
import messaging, {
    AuthorizationStatus,
} from "@react-native-firebase/messaging";
import { PermissionsAndroid, Platform } from "react-native";

type TokenRefreshUnsubscribe = () => void;

let tokenRefreshUnsubscribe: TokenRefreshUnsubscribe | null = null;

const isSupportedPlatform = Platform.OS === "android" || Platform.OS === "ios";

const getPlatformValue = () => (Platform.OS === "ios" ? "ios" : "android");

const getAndroidApiLevel = () => {
  if (typeof Platform.Version === "number") {
    return Platform.Version;
  }

  const parsedVersion = Number.parseInt(String(Platform.Version), 10);
  return Number.isFinite(parsedVersion) ? parsedVersion : 0;
};

const getErrorMessage = async (response: Response) => {
  const contentType = response.headers.get("content-type") ?? "";

  if (contentType.includes("application/json")) {
    const payload = (await response.json()) as { message?: unknown };
    if (typeof payload.message === "string" && payload.message.trim().length > 0) {
      return payload.message;
    }
  }

  const responseText = await response.text();
  return responseText.trim().length > 0
    ? responseText
    : `Request failed with status ${response.status}.`;
};

const requestNotificationPermission = async () => {
  if (!isSupportedPlatform) {
    return false;
  }

  if (Platform.OS === "android") {
    if (getAndroidApiLevel() < 33) {
      return true;
    }

    const result = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
    );

    return result === PermissionsAndroid.RESULTS.GRANTED;
  }

  const authStatus = await messaging().requestPermission();

  return (
    authStatus === AuthorizationStatus.AUTHORIZED ||
    authStatus === AuthorizationStatus.PROVISIONAL
  );
};

const postParentPushToken = async (
  apiBaseUrl: string,
  accessToken: string,
  token: string,
) => {
  const response = await fetch(`${apiBaseUrl}/api/parent/device-token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({
      token,
      platform: getPlatformValue(),
    }),
  });

  if (!response.ok) {
    throw new Error(await getErrorMessage(response));
  }
};

export const registerParentPushToken = async (
  apiBaseUrl: string,
  accessToken: string,
) => {
  if (!isSupportedPlatform) {
    return null;
  }

  const hasPermission = await requestNotificationPermission();
  if (!hasPermission) {
    return null;
  }

  await messaging().registerDeviceForRemoteMessages();

  const token = await messaging().getToken();
  if (!token) {
    return null;
  }

  await postParentPushToken(apiBaseUrl, accessToken, token);
  return token;
};

export const subscribeParentPushTokenRefresh = (
  apiBaseUrl: string,
  accessToken: string,
) => {
  if (!isSupportedPlatform) {
    return () => undefined;
  }

  tokenRefreshUnsubscribe?.();

  tokenRefreshUnsubscribe = messaging().onTokenRefresh(async (token) => {
    if (!token) {
      return;
    }

    await postParentPushToken(apiBaseUrl, accessToken, token);
  });

  return () => {
    tokenRefreshUnsubscribe?.();
    tokenRefreshUnsubscribe = null;
  };
};

export const removeParentPushToken = async (
  apiBaseUrl: string,
  accessToken: string,
) => {
  if (!isSupportedPlatform) {
    return;
  }

  const token = await messaging().getToken();
  if (!token) {
    return;
  }

  const response = await fetch(
    `${apiBaseUrl}/api/parent/device-token?token=${encodeURIComponent(token)}`,
    {
      method: "DELETE",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
    },
  );

  if (!response.ok) {
    throw new Error(await getErrorMessage(response));
  }
};

export const syncPushTokenAfterLogin = async (
  apiBaseUrl: string,
  accessToken: string,
) => {
  await registerParentPushToken(apiBaseUrl, accessToken);
  subscribeParentPushTokenRefresh(apiBaseUrl, accessToken);
};

export const cleanupPushTokenOnLogout = async (
  apiBaseUrl: string,
  accessToken: string,
) => {
  tokenRefreshUnsubscribe?.();
  tokenRefreshUnsubscribe = null;

  await removeParentPushToken(apiBaseUrl, accessToken);
};
