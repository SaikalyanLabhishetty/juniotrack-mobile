import { usePushNotifications } from "@/hooks/usePushNotifications";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "../global.css";
import { AuthProvider } from "./_auth";

function NotificationBootstrap() {
  usePushNotifications();
  return null;
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <NotificationBootstrap />
      <Stack screenOptions={{ headerShown: false }} />
      <StatusBar style="auto" />
    </AuthProvider>
  );
}
