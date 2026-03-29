import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useAuth } from "./_auth";

type Role = "teacher" | "parent";

type ApiClass = {
  _id: string;
  uid: string;
  className: string;
  section: string;
  teacherId: string;
  schoolId: string;
  academicYear: string;
  createdAt: string;
  isClassTeacher?: boolean;
};

type ClassApiResponse = {
  teacher: {
    uid: string;
    name: string;
  };
  classIds: string[];
  classes: ApiClass[];
};

const CLASSES_URL = "https://juniotrack.vercel.app/api/teacher/classes";

const roleMeta: Record<
  Role,
  {
    title: string;
    subtitle: string;
    icon: React.ComponentProps<typeof MaterialCommunityIcons>["name"];
  }
> = {
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
  const [classes, setClasses] = useState<ApiClass[]>([]);
  const [classTeacher, setClassTeacher] = useState<{
    uid: string;
    name: string;
  } | null>(null);
  const [classLoading, setClassLoading] = useState(false);
  const [classError, setClassError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !token) {
      router.replace("/login");
    }
  }, [authLoading, token]);

  useEffect(() => {
    const loadClasses = async () => {
      if (!token) {
        return;
      }

      setClassLoading(true);
      setClassError(null);

      try {
        const response = await fetch(CLASSES_URL, {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        });

        const contentType = response.headers.get("content-type") ?? "";
        let data: (ClassApiResponse & { message?: string }) | null = null;

        if (contentType.includes("application/json")) {
          data = (await response.json()) as ClassApiResponse & {
            message?: string;
          };
        } else {
          const text = await response.text();
          throw new Error(
            `Expected JSON response but got ${response.status} ${response.statusText}: ${text}`,
          );
        }

        if (!response.ok) {
          throw new Error(data?.message ?? "Failed to load classes");
        }

        setClassTeacher(data.teacher ?? null);
        setClasses(Array.isArray(data.classes) ? data.classes : []);
      } catch (error) {
        setClassTeacher(null);
        setClasses([]);
        setClassError(
          error instanceof Error ? error.message : "Unable to load classes.",
        );
      } finally {
        setClassLoading(false);
      }
    };

    loadClasses();
  }, [token]);

  if (authLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-[#f0f9ff]">
        <ActivityIndicator size="large" color="#0891b2" />
        <Text className="mt-3 text-[#0c4a6e]">Verifying user…</Text>
      </View>
    );
  }

  const dashboard = roleMeta[role];

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
        <View className="flex-row items-center justify-between mb-4">
          <View>
            <Text className="text-lg font-bold text-[#0f172a]">Juniotrack</Text>
            <Text className="text-xs text-[#1e3a8a]">
              School progress for your classes
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
          {/* <Text className="text-xs text-[#64748b] mt-2">
            Role: {role === "teacher" ? "Teacher" : "Parent"}
          </Text> */}
        </View>

        <View className="mb-4">
          <Text className="text-base font-semibold text-[#0f172a] mb-2">
            Your classes
          </Text>
          {classTeacher ? (
            <Text className="text-sm text-[#475569] mb-3">
              Teacher: {classTeacher.name}
            </Text>
          ) : null}

          {classLoading ? (
            <View className="rounded-2xl border border-[#bfdbfe] bg-white p-6 items-center justify-center">
              <ActivityIndicator size="large" color="#0ea5e9" />
              <Text className="mt-3 text-[#0f172a]">Loading classes…</Text>
            </View>
          ) : classError ? (
            <View className="rounded-2xl border border-[#fecaca] bg-[#fff1f2] p-4">
              <Text className="text-sm font-semibold text-[#b91c1c]">
                Unable to load classes
              </Text>
              <Text className="text-xs text-[#991b1b] mt-1">{classError}</Text>
            </View>
          ) : classes.length === 0 ? (
            <View className="rounded-2xl border border-[#bfdbfe] bg-white p-6">
              <Text className="text-sm text-[#64748b]">
                No classes were found for your account. Please check your login
                or try again later.
              </Text>
            </View>
          ) : (
            <View className="grid grid-cols-1 gap-3">
              {classes.map((classItem) => (
                <Pressable
                  key={classItem.uid || classItem._id}
                  onPress={() => {
                    const selectedClassId = classItem.uid || classItem._id;
                    router.push(
                      {
                        pathname: `/class/${encodeURIComponent(selectedClassId)}`,
                        params: {
                          classId: selectedClassId,
                          className: classItem.className,
                          section: classItem.section,
                          academicYear: classItem.academicYear,
                          isClassTeacher: classItem.isClassTeacher
                            ? "true"
                            : "false",
                        },
                      } as never,
                    );
                  }}
                  className="rounded-2xl border border-[#93c5fd] bg-white p-4 shadow-sm"
                >
                  <View className="flex-row items-center justify-between">
                    <View>
                      <Text className="text-base font-semibold text-[#0f172a]">
                        {classItem.className} - {classItem.section}
                      </Text>
                      <Text className="text-xs text-[#64748b] mt-2">
                        {classItem.academicYear}
                      </Text>
                    </View>
                    <MaterialCommunityIcons
                      name="chevron-right"
                      size={22}
                      color="#0ea5e9"
                    />
                  </View>
                  {/* <Text className="text-[11px] text-[#475569] mt-3">
                    ID: {classItem.uid}
                  </Text> */}
                  {/* <Text className="text-[11px] text-[#64748b] mt-2">
                    {classItem.isClassTeacher
                      ? "Mark attendance for this class"
                      : "Read-only attendance view"}
                  </Text> */}
                </Pressable>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}
