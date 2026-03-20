import { useRouter } from "expo-router";
import { useState } from "react";
import {
    Alert,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    Text,
    TextInput,
    View,
} from "react-native";

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async () => {
    if (!email.trim()) {
      Alert.alert("Enter email", "Please insert your email address.");
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      Alert.alert(
        "Reset Link Sent",
        `A password reset link has been sent to ${email.trim()}.`,
      );
    }, 1000);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1 bg-[#f0f9ff]"
    >
      <View className="flex-1 justify-center px-4 py-8">
        <View className="w-full max-w-md mx-auto rounded-3xl bg-white border border-[#dbeafe] p-6 shadow-md">
          <Text className="text-xl font-bold text-[#0f172a] text-center">
            Forgot Password
          </Text>
          <Text className="text-sm text-[#475569] text-center mt-2">
            Enter your registered email and we will send a password reset link.
          </Text>

          <View className="mt-5">
            <Text className="text-xs font-semibold text-[#334155] mb-1">
              Email
            </Text>
            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder="Enter your email"
              placeholderTextColor="#94a3b8"
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              className="h-12 rounded-xl border border-[#93c5fd] bg-[#eff6ff] px-3 text-sm text-[#0f172a]"
            />
          </View>

          <Pressable
            onPress={onSubmit}
            disabled={loading}
            className={`mt-4 h-12 rounded-xl items-center justify-center ${
              loading ? "bg-[#93c5fd]" : "bg-[#0ea5e9] active:opacity-90"
            }`}
          >
            <Text className="text-white font-bold">Submit</Text>
          </Pressable>

          <Pressable
            onPress={() => router.push("/login")}
            className="mt-3 items-center"
          >
            <Text className="text-xs text-[#0ea5e9] font-semibold">
              Back to Login
            </Text>
          </Pressable>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
