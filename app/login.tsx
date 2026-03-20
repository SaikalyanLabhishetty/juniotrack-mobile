import { useRouter } from "expo-router";
import { Eye, EyeOff } from "lucide-react-native";
import { useEffect, useMemo, useRef, useState } from "react";
import {
    ActivityIndicator,
    Animated,
    Image,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    ScrollView,
    Text,
    TextInput,
    View,
} from "react-native";

import { useAuth } from "./_auth";

const LOGIN_URL = "https://juniotrack.vercel.app/api/user/login";

export default function LoginScreen() {
  const router = useRouter();
  const { token, isLoading: authLoading, signIn } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const cardScale = useRef(new Animated.Value(0.97)).current;

  useEffect(() => {
    if (token) {
      router.replace("/");
    }
  }, [token, router]);

  useEffect(() => {
    Animated.spring(cardScale, {
      toValue: 1,
      useNativeDriver: true,
      friction: 8,
      tension: 80,
    }).start();
  }, [cardScale]);

  const canSubmit = useMemo(() => {
    return email.trim().length > 0 && password.trim().length > 0;
  }, [email, password]);

  const onSubmit = async () => {
    if (!canSubmit || loading) return;

    setError(null);
    setLoading(true);

    try {
      const response = await fetch(LOGIN_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          password: password.trim(),
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        setError(
          typeof data?.message === "string"
            ? data.message
            : "Invalid credentials, please try again.",
        );
        return;
      }

      const accessToken = data?.accessToken ?? data?.token ?? data?.data?.token;
      const userData = data?.user ?? data?.data?.user;

      if (!accessToken || typeof accessToken !== "string") {
        setError("Login succeeded but no access token is returned.");
        return;
      }

      if (
        !userData ||
        typeof userData !== "object" ||
        !userData.uid ||
        !userData.role ||
        !userData.name ||
        !userData.organizationId
      ) {
        setError("Login succeeded but user data is incomplete.");
        return;
      }

      await signIn(accessToken, {
        email: userData.email ?? "",
        name: userData.name,
        role: userData.role,
        uid: userData.uid,
        organizationId: userData.organizationId,
        schoolId: userData.schoolId,
      });
      router.replace("/");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Network error, try later.",
      );
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-[#EAF6FF]">
        <ActivityIndicator size="large" color="#0369a1" />
        <Text className="mt-3 text-[#0f172a]">Checking login…</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "padding"}
      className="flex-1 bg-[#f0f9ff]"
    >
      <Text className="absolute top-16 w-full text-center text-2xl font-bold text-[#0f172a]">
        JunioTrack
      </Text>
      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingTop: 100,
          paddingBottom: 40,
        }}
        keyboardShouldPersistTaps="handled"
        scrollEnabled={true}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View
          style={{ transform: [{ scale: cardScale }] }}
          className="w-full max-w-md rounded-3xl bg-white border border-[#dbeafe] p-6 shadow-xl mx-auto"
        >
          <View className="items-center">
            <View className="h-20 w-20 rounded-full bg-gradient-to-r from-[#1d4ed8] to-[#0ea5e9] items-center justify-center shadow-lg">
              {/* <ShieldCheck size={36} color="white" /> */}
            </View>
            <Text className="text-2xl font-bold text-[#0f172a] mt-4 text-center">
              Welcome back!
            </Text>
            <Text className="text-sm text-[#475569] text-center mt-1">
              Sign in to continue to your dashboard
            </Text>
          </View>

          <View className="mt-6 space-y-4">
            <View>
              <Text className="text-xs font-semibold text-[#334155] mb-1">
                Email
              </Text>
              <TextInput
                value={email}
                onChangeText={setEmail}
                placeholder="Email address"
                placeholderTextColor="#94a3b8"
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                textContentType="username"
                className="h-12 rounded-xl border border-[#93c5fd] bg-[#eff6ff] px-3 text-sm text-[#0f172a]"
              />
            </View>

            <View>
              <Text className="text-xs font-semibold text-[#334155] mb-1 mt-2">
                Password
              </Text>
              <View className="relative">
                <TextInput
                  value={password}
                  onChangeText={setPassword}
                  placeholder="Password"
                  placeholderTextColor="#94a3b8"
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  autoComplete="password"
                  textContentType="password"
                  className="h-12 rounded-xl border border-[#93c5fd] bg-[#eff6ff] px-3 pr-10 text-sm text-[#0f172a]"
                />
                <Pressable
                  onPress={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -mt-2.5"
                  accessibilityLabel={
                    showPassword ? "Hide password" : "Show password"
                  }
                >
                  {showPassword ? (
                    <EyeOff size={18} color="#64748b" />
                  ) : (
                    <Eye size={18} color="#64748b" />
                  )}
                </Pressable>
              </View>
            </View>

            {error ? (
              <Text className="text-xs text-[#ef4444] font-medium">
                {error}
              </Text>
            ) : null}

            <Pressable
              onPress={onSubmit}
              disabled={!canSubmit || loading}
              className={`h-12 rounded-xl items-center justify-center mt-3 ${
                loading || !canSubmit
                  ? "bg-[#93c5fd]"
                  : "bg-[#0ea5e9] active:opacity-90"
              }`}
            >
              {loading ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <Text className="text-white text-base font-bold">Log in</Text>
              )}
            </Pressable>

            <View className="flex-row items-center justify-center mt-2">
              <Pressable onPress={() => router.push("/forgot-password")}>
                <Text className="text-xs text-[#0ea5e9] font-semibold">
                  Forgot Password?
                </Text>
              </Pressable>
            </View>
          </View>
          <View className="items-center">
            <Image
              source={require("../assets/images/login.png")}
              className="w-full h-40 mt-6"
              resizeMode="contain"
            />
          </View>
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
