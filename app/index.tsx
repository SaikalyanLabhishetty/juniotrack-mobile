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

import { API_BASE_URL } from "@/services/api";
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

const CLASSES_URL = `${API_BASE_URL}/api/teacher/classes`;

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
  const isParent = role === "parent";
  const parentUser = user as
    | (typeof user & {
        student_name?: string;
        studentname?: string;
        student_uid?: string;
        studentuid?: string;
        dob?: string;
        enrollment_number?: string;
        enrollmentNumber?: string;
        school_name?: string;
        schoolName?: string;
        organization_name?: string;
        organizationName?: string;
        class_and_section?: string;
        classAndSection?: string;
      })
    | null;
  const getDisplayValue = (...values: (string | undefined)[]) => {
    const match = values.find(
      (value) => typeof value === "string" && value.trim().length > 0,
    );
    return match?.trim() ?? "NA";
  };
  const parentStudentUid =
    user?.studentUid?.trim() ||
    parentUser?.student_uid?.trim() ||
    parentUser?.studentuid?.trim() ||
    "";
  const parentStudentName = getDisplayValue(
    user?.studentName,
    parentUser?.student_name,
    parentUser?.studentname,
  );
  const parentClassId = getDisplayValue(user?.classId, parentUser?.classId);
  const parentInfoRows = [
    {
      label: "Student Name",
      value: parentStudentName,
    },
    {
      label: "DOB",
      value: getDisplayValue(user?.dob, parentUser?.dob),
    },
    {
      label: "Enrollment Number",
      value: getDisplayValue(
        user?.enrollmentNumber,
        parentUser?.enrollment_number,
        parentUser?.enrollmentNumber,
      ),
    },
    {
      label: "School Name",
      value: getDisplayValue(user?.schoolName, parentUser?.school_name, parentUser?.schoolName),
    },
    {
      label: "Organization Name",
      value: getDisplayValue(
        user?.organizationName,
        parentUser?.organization_name,
        parentUser?.organizationName,
      ),
    },
    {
      label: "Class",
      value: getDisplayValue(user?.classAndSection, parentUser?.class_and_section, parentUser?.classAndSection),
    },
  ];
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
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
      if (!token || role !== "teacher") {
        setClassTeacher(null);
        setClasses([]);
        setClassError(null);
        setClassLoading(false);
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
  }, [token, role]);

  if (authLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-[#f0f9ff]">
        <ActivityIndicator size="large" color="#0891b2" />
        <Text className="mt-3 text-[#0c4a6e]">Verifying user…</Text>
      </View>
    );
  }

  const dashboard = roleMeta[role];
  const openClass = (classItem: ApiClass) => {
    const selectedClassId = classItem.uid || classItem._id;

    router.push(
      {
        pathname: `/class/${encodeURIComponent(selectedClassId)}`,
        params: {
          classId: selectedClassId,
          className: classItem.className,
          section: classItem.section,
          academicYear: classItem.academicYear,
          isClassTeacher: classItem.isClassTeacher ? "true" : "false",
        },
      } as never,
    );
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
        <View className="flex-row items-center justify-between mb-4">
          <View>
            <Text className="text-lg font-bold text-[#0f172a]">Juniotrack</Text>
            <Text className="text-xs text-[#1e3a8a]">
              {isParent
                ? "Track your child progress"
                : "School progress for your classes"}
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

        {isParent ? (
          <View className="mb-4">
            <Text className="text-base font-semibold text-[#0f172a] mb-2">
              Student Info
            </Text>
            <View className="rounded-2xl border border-[#bfdbfe] bg-white p-4 shadow-sm">
              {parentInfoRows.map((item, index) => (
                <View
                  key={item.label}
                  className={`${index === 0 ? "" : "mt-3"} flex-row items-center justify-between`}
                >
                  <Text className="text-sm text-[#475569]">{item.label}</Text>
                  <Text className="text-sm font-semibold text-[#0f172a]">
                    {item.value}
                  </Text>
                </View>
              ))}
            </View>

            <Text className="text-base font-semibold text-[#0f172a] mt-4 mb-2">
              Features
            </Text>
            <Pressable
              onPress={() =>
                router.push({
                  pathname: "/parent/attendance",
                  params: {
                    studentUid: parentStudentUid,
                    studentName: parentStudentName === "NA" ? "" : parentStudentName,
                    classId: parentClassId === "NA" ? "" : parentClassId,
                  },
                } as never)
              }
              className="rounded-2xl border border-[#bfdbfe] bg-white p-4 shadow-sm"
            >
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center flex-1 pr-2">
                  <View className="mr-3 h-10 w-10 items-center justify-center rounded-full bg-[#e0f2fe]">
                    <MaterialCommunityIcons
                      name="clipboard-check-outline"
                      size={20}
                      color="#0ea5e9"
                    />
                  </View>
                  <View className="flex-1">
                    <Text className="text-base font-bold text-[#0f172a]">
                      Attendance
                    </Text>
                    <Text className="text-xs text-[#64748b] mt-0.5">
                      Track monthly attendance details
                    </Text>
                  </View>
                </View>
                <MaterialCommunityIcons name="chevron-right" size={22} color="#0ea5e9" />
              </View>
            </Pressable>
          </View>
        ) : (
          <View className="mb-4">
            <View className="mb-2 flex-row items-center justify-between">
              <Text className="text-base font-semibold text-[#0f172a]">
                Your classes
              </Text>
              <Pressable
                onPress={() =>
                  setViewMode((prev) => (prev === "list" ? "grid" : "list"))
                }
                className="h-9 w-9 items-center justify-center rounded-lg border border-[#bfdbfe] bg-white"
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
              <>
                {viewMode === "list" ? (
                  <View className="grid grid-cols-1 gap-3">
                    {classes.map((classItem) => (
                      <Pressable
                        key={classItem.uid || classItem._id}
                        onPress={() => openClass(classItem)}
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
                      </Pressable>
                    ))}
                  </View>
                ) : (
                  <View className="flex-row flex-wrap justify-between">
                    {classes.map((classItem) => (
                      <Pressable
                        key={classItem.uid || classItem._id}
                        onPress={() => openClass(classItem)}
                        className="mb-3 w-[48%] rounded-2xl border border-[#93c5fd] bg-white p-4 shadow-sm"
                      >
                        <View className="mb-3 flex-row items-start justify-between">
                          <Text className="text-sm font-semibold text-[#0f172a] pr-2 flex-1">
                            {classItem.className} - {classItem.section}
                          </Text>
                          <MaterialCommunityIcons
                            name="chevron-right"
                            size={18}
                            color="#0ea5e9"
                          />
                        </View>
                        <Text className="text-xs text-[#64748b]">
                          {classItem.academicYear}
                        </Text>
                      </Pressable>
                    ))}
                  </View>
                )}
              </>
            )}
          </View>
        )}
      </ScrollView>
    </View>
  );
}
