import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "../global.css";
import { AuthProvider } from "./_auth";

export default function RootLayout() {
  return (
    <AuthProvider>
      <Stack screenOptions={{ headerShown: false }} />
      <StatusBar style="auto" />
    </AuthProvider>
  );
}
