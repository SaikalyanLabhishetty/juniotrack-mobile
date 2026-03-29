import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useAuth } from "../_auth";

type ClassRouteParams = {
  classId: string;
  className?: string;
  section?: string;
  academicYear?: string;
  isClassTeacher?: string;
};

type ModuleCard = {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentProps<typeof MaterialCommunityIcons>["name"];
  teacherRoute:
    | "/teacher/attendance"
    | "/teacher/homework"
    | "/teacher/announcements"
    | "/teacher/reports";
  parentRoute:
    | "/parent/attendance"
    | "/parent/homework"
    | "/parent/announcements"
    | "/parent/reports";
};

const moduleCards: ModuleCard[] = [
  {
    id: "attendance",
    title: "Attendance",
    description: "Track student attendance for this class.",
    icon: "clipboard-check-outline",
    teacherRoute: "/teacher/attendance",
    parentRoute: "/parent/attendance",
  },
  {
    id: "homework",
    title: "Homework",
    description: "View and assign homework for this class.",
    icon: "book-open-variant",
    teacherRoute: "/teacher/homework",
    parentRoute: "/parent/homework",
  },
  {
    id: "announcements",
    title: "Announcements",
    description: "Share updates with the class.",
    icon: "bullhorn-outline",
    teacherRoute: "/teacher/announcements",
    parentRoute: "/parent/announcements",
  },
  {
    id: "reports",
    title: "Reports",
    description: "Review class progress reports.",
    icon: "file-chart-outline",
    teacherRoute: "/teacher/reports",
    parentRoute: "/parent/reports",
  },
];

export default function ClassDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<ClassRouteParams>();
  const insets = useSafeAreaInsets();
  const { user, isLoading: authLoading } = useAuth();
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace("/login");
    }
  }, [authLoading, router, user]);

  const className = params.className
    ? String(params.className)
    : "Class details";
  const section = params.section ? String(params.section) : "";
  const academicYear = params.academicYear ? String(params.academicYear) : "";

  const role = user?.role === "parent" ? "parent" : "teacher";

  const openModule = (card: ModuleCard) => {
    const route = role === "teacher" ? card.teacherRoute : card.parentRoute;

    router.push({
      pathname: route as never,
      params: {
        classId: params.classId ?? "",
        className,
        section,
        academicYear,
        isClassTeacher: params.isClassTeacher ?? "false",
      },
    } as never);
  };

  return (
    <View className="bg-[#eff6ff] flex-1">
      <ScrollView
        contentContainerStyle={{
          paddingBottom: 24,
          paddingTop: insets.top + 8,
        }}
        className="px-4"
        showsVerticalScrollIndicator={false}
      >
        <View className="mb-4">
          <Pressable
            onPress={() => router.back()}
            className="mb-2 w-[60px]"
            style={{ marginTop: insets.top > 0 ? 4 : 12 }}
          >
            <Text className="text-[#0ea5e9] text-[15px] font-semibold">
              Back
            </Text>
          </Pressable>

          <Text className="text-[#0f172a] text-[28px] font-bold">
            {className}
          </Text>
          <Text className="text-[#475569] text-sm mt-1.5">
            Section {section} • {academicYear}
          </Text>
        </View>

        <View className="rounded-2xl bg-white border border-[#93c5fd] p-4 shadow-sm mb-4 flex-row items-center justify-between">
          <Text className="text-[#0f172a] text-base font-semibold">Class modules</Text>
          <Pressable
            onPress={() =>
              setViewMode((prev) => (prev === "list" ? "grid" : "list"))
            }
            className="h-9 w-9 items-center justify-center rounded-lg border border-[#bfdbfe] bg-[#eff6ff]"
          >
            <MaterialCommunityIcons
              name={
                viewMode === "list"
                  ? "view-grid-outline"
                  : "format-list-bulleted"
              }
              size={18}
              color="#0f172a"
            />
          </Pressable>
        </View>

        {viewMode === "list" ? (
          <View>
            {moduleCards.map((card) => (
              <Pressable
                key={card.id}
                onPress={() => openModule(card)}
                className="mb-3 rounded-2xl bg-white border border-[#bfdbfe] px-4 py-3.5 shadow-sm"
              >
                <View className="flex-row items-center">
                  <View className="mr-3 h-10 w-10 items-center justify-center rounded-full bg-[#e0f2fe]">
                    <MaterialCommunityIcons name={card.icon} size={20} color="#0ea5e9" />
                  </View>
                  <View className="flex-1 pr-2">
                    <Text className="text-base font-bold text-[#0f172a]">{card.title}</Text>
                    <Text className="text-xs text-[#64748b] mt-0.5">{card.description}</Text>
                  </View>
                  <MaterialCommunityIcons name="chevron-right" size={22} color="#0ea5e9" />
                </View>
              </Pressable>
            ))}
          </View>
        ) : (
          <View className="flex-row flex-wrap justify-between">
            {moduleCards.map((card) => (
              <Pressable
                key={card.id}
                onPress={() => openModule(card)}
                className="w-[48%] mb-3 rounded-3xl bg-white border border-[#bfdbfe] p-5 shadow-sm relative overflow-hidden"
              >
                <View className="mb-3 pr-11">
                  <Text className="text-lg font-bold text-[#0f172a]">
                    {card.title}
                  </Text>
                  <Text className="text-xs text-[#64748b] mt-1">
                    {card.description}
                  </Text>
                </View>
                <View className="absolute right-4 top-4 h-9 w-9 items-center justify-center rounded-full bg-[#e0f2fe]">
                  <MaterialCommunityIcons
                    name={card.icon}
                    size={20}
                    color="#0ea5e9"
                  />
                </View>
                <View className="rounded-2xl bg-[#eff6ff] px-3 py-2">
                  <Text className="text-xs text-[#1e40af] font-semibold">
                    Open {card.title}
                  </Text>
                </View>
              </Pressable>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}
