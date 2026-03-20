import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Href, router } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  SafeAreaView,
  ScrollView,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useAuth } from "./_auth";

type Role = "teacher" | "parent";
type FeatureId =
  | "attendance"
  | "homework"
  | "announcements"
  | "reports"
  | "notifications";

type DashboardFeature = {
  id: FeatureId;
  title: string;
  shortLabel: string;
  icon: React.ComponentProps<typeof MaterialCommunityIcons>["name"];
  comingSoon: boolean;
  route?: Href;
};

type RoleMeta = {
  title: string;
  subtitle: string;
  icon: React.ComponentProps<typeof MaterialCommunityIcons>["name"];
};

let lastSelectedTabByRole: Record<Role, FeatureId> = {
  teacher: "attendance",
  parent: "attendance",
};

const teacherFeatures: DashboardFeature[] = [
  {
    id: "attendance",
    title: "Attendance",
    shortLabel: "Attendance",
    icon: "clipboard-check-outline",
    comingSoon: false,
    route: "/teacher/attendance",
  },
  {
    id: "homework",
    title: "Homework",
    shortLabel: "Homework",
    icon: "book-open-variant",
    comingSoon: false,
    route: "/teacher/homework",
  },
  {
    id: "announcements",
    title: "Announcements",
    shortLabel: "Announce",
    icon: "bullhorn-outline",
    comingSoon: true,
  },
  {
    id: "reports",
    title: "Reports",
    shortLabel: "Reports",
    icon: "file-chart-outline",
    comingSoon: false,
    route: "/teacher/reports",
  },
  {
    id: "notifications",
    title: "Class Notifications",
    shortLabel: "Notify",
    icon: "bell-ring-outline",
    comingSoon: true,
  },
];

const parentFeatures: DashboardFeature[] = [
  {
    id: "attendance",
    title: "Attendance",
    shortLabel: "Attendance",
    icon: "calendar-check-outline",
    comingSoon: false,
    route: "/parent/attendance",
  },
  {
    id: "homework",
    title: "Homework",
    shortLabel: "Homework",
    icon: "book-open-variant",
    comingSoon: false,
    route: "/parent/homework",
  },
  {
    id: "announcements",
    title: "Announcements",
    shortLabel: "Announce",
    icon: "bullhorn-outline",
    comingSoon: false,
    route: "/parent/announcements",
  },
  {
    id: "reports",
    title: "Reports",
    shortLabel: "Reports",
    icon: "file-chart-outline",
    comingSoon: false,
    route: "/parent/reports",
  },
  {
    id: "notifications",
    title: "Notifications",
    shortLabel: "Notify",
    icon: "bell-ring-outline",
    comingSoon: false,
    route: "/parent/notifications",
  },
];

const roleMeta: Record<Role, RoleMeta> = {
  teacher: {
    title: "Teacher Dashboard",
    subtitle: "Daily class management and insights",
    icon: "account-tie-outline",
  },
  parent: {
    title: "Parent Dashboard",
    subtitle: "Stay up to date with your child",
    icon: "account-heart-outline",
  },
};

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const { token, user, isLoading: authLoading, signOut } = useAuth();
  const role = user?.role ?? "teacher";
  const [activeTab, setActiveTab] = useState<FeatureId>(
    lastSelectedTabByRole[role] ?? "attendance",
  );
  const [teachingClasses, setTeachingClasses] = useState(
    [] as { id: string; name: string; subject: string; section: string }[],
  );

  useEffect(() => {
    if (!authLoading && !token) {
      router.replace("/login");
    }
  }, [authLoading, token]);

  useEffect(() => {
    if (role === "teacher") {
      setTeachingClasses([
        { id: "c1", name: "Mathematics", subject: "Math", section: "5A" },
        { id: "c2", name: "Science", subject: "Science", section: "5B" },
        { id: "c3", name: "English", subject: "English", section: "5A" },
      ]);
    } else {
      setTeachingClasses([]);
    }

    const initialTab = lastSelectedTabByRole[role] ?? "attendance";
    setActiveTab(initialTab);
  }, [role]);

  if (authLoading) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-[#f0f9ff]">
        <ActivityIndicator size="large" color="#0891b2" />
        <Text className="mt-3 text-[#0c4a6e]">Verifying user…</Text>
      </SafeAreaView>
    );
  }

  const dashboard = roleMeta[role];
  const currentFeatures = role === "teacher" ? teacherFeatures : parentFeatures;

  const onPressFeature = (feature: DashboardFeature) => {
    if (feature.comingSoon) {
      Alert.alert("Coming soon", `${feature.title} is coming soon.`);
      return;
    }
    setActiveTab(feature.id);
    lastSelectedTabByRole[role] = feature.id;
    if (feature.route) router.push(feature.route);
  };

  return (
    <SafeAreaView className="bg-[#eff6ff] flex-1">
      <ScrollView
        contentContainerStyle={{
          paddingBottom: 24,
          paddingTop: insets.top + 8,
        }}
        className="px-4"
      >
        <View className="flex-row items-center justify-between mb-4">
          <View>
            <Text className="text-lg font-bold text-[#0f172a]">Juniotrack</Text>
            <Text className="text-xs text-[#1e3a8a]">
              School Progress for every parent
            </Text>
          </View>
          <Pressable
            onPress={() => signOut()}
            className="rounded-full bg-[#0369a1] px-3 py-1.5"
          >
            <Text className="text-xs text-white">Sign out</Text>
          </Pressable>
        </View>

        <View className="w-full rounded-2xl bg-white border border-[#93c5fd] p-4 shadow-sm mb-4">
          <Text className="text-2xl font-bold text-[#0f172a]">
            Hi, {user?.name ?? "User"}
          </Text>
          <Text className="text-sm text-[#475569] mt-1">
            {dashboard.subtitle}
          </Text>
          <Text className="text-xs text-[#64748b] mt-2">
            Role: {role === "teacher" ? "Teacher" : "Parent"}
          </Text>
        </View>

        {role === "teacher" && (
          <View className="mb-4">
            <Text className="text-base font-semibold text-[#0f172a] mb-2">
              Your Classes
            </Text>
            <View className="grid grid-cols-1 gap-2">
              {teachingClasses.map((classItem) => (
                <View
                  key={classItem.id}
                  className="rounded-xl border border-[#bfdbfe] bg-white p-3"
                >
                  <Text className="text-sm font-semibold text-[#0f172a]">
                    {classItem.name}
                  </Text>
                  <Text className="text-xs text-[#64748b] mt-1">
                    {classItem.subject} • Section {classItem.section}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}

        <View className="grid grid-cols-2 gap-3">
          {currentFeatures.map((feature) => {
            const active = activeTab === feature.id;
            return (
              <Pressable
                key={feature.id}
                onPress={() => onPressFeature(feature)}
                className={`rounded-xl p-4 border ${
                  active
                    ? "border-[#0ea5e9] bg-[#dbeafe]"
                    : "border-[#bfdbfe] bg-white"
                }`}
              >
                <View className="flex-row items-center gap-2">
                  <MaterialCommunityIcons
                    name={feature.icon}
                    size={20}
                    color={active ? "#0ea5e9" : "#2563eb"}
                  />
                  <Text className="text-sm font-semibold text-[#1e40af]">
                    {feature.shortLabel}
                  </Text>
                </View>
                {feature.comingSoon && (
                  <Text className="text-[11px] text-[#0284c7] mt-1">
                    Coming soon
                  </Text>
                )}
              </Pressable>
            );
          })}
        </View>

        <View className="mt-5 rounded-xl bg-[#c7d2fe] p-4">
          <Text className="text-sm text-[#1e3a8a] font-semibold">
            Quick Tips
          </Text>
          <Text className="text-xs text-[#1e40af] mt-1">
            Tap any feature to open. Use role switcher to switch view between
            teacher and parent.
          </Text>
        </View>

        <View className="mt-6 rounded-xl bg-[#93c5fd] p-4">
          <View className="flex-row items-center justify-between">
            <Text className="text-sm text-white font-bold">New UX updates</Text>
            <Text className="text-xs text-[#dbeafe]">Fast access</Text>
          </View>
          <Text className="text-xs text-[#e0f2fe] mt-2">
            App UI is refreshed to match your requested color theme and
            interaction feel.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
