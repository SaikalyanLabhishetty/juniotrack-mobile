import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useAuth } from "../_auth";

type HistoryRouteParams = {
  subject?: string;
};

type HomeworkHistoryItem = {
  uid: string;
  id: string;
  classId: string;
  title: string;
  assignedDate: string;
  dueDate: string;
  subject: string;
  recordStatus: string;
  assignedStudents: {
    studentId: string;
    name: string;
    status: string;
    remarks: string;
  }[];
};

type ApiRecord = {
  uid?: string;
  id?: string;
  _id?: string;
  homeworkId?: string;
  homework?: {
    uid?: string;
    id?: string;
    _id?: string;
    homeworkId?: string;
    classId?: string;
    title?: string;
    assignedDate?: string;
    assignedOn?: string;
    date?: string;
    dueDate?: string;
    subject?: string;
    assignedStudents?: unknown;
  };
  classId?: string;
  class?: {
    classId?: string;
  };
  title?: string;
  assignedDate?: string;
  assignedOn?: string;
  date?: string;
  dueDate?: string;
  subject?: string;
  recordStatus?: string;
  status?: string;
  assignedStudents?: unknown;
};

function getStringValue(value: unknown) {
  return typeof value === "string" ? value : "";
}

function extractRecords(payload: unknown): ApiRecord[] {
  if (Array.isArray(payload)) {
    return payload as ApiRecord[];
  }

  if (!payload || typeof payload !== "object") {
    return [];
  }

  const root = payload as Record<string, unknown>;
  const possibleRootKeys = ["records", "homeworks", "items", "results", "data"];
  for (const key of possibleRootKeys) {
    const value = root[key];
    if (Array.isArray(value)) {
      return value as ApiRecord[];
    }
  }

  const nestedData = root.data;
  if (nestedData && typeof nestedData === "object") {
    const nested = nestedData as Record<string, unknown>;
    for (const key of possibleRootKeys) {
      const value = nested[key];
      if (Array.isArray(value)) {
        return value as ApiRecord[];
      }
    }
  }

  return [];
}

function mapRecord(item: ApiRecord, index: number): HomeworkHistoryItem {
  const rawAssignedStudents = Array.isArray(item.assignedStudents)
    ? item.assignedStudents
    : Array.isArray(item.homework?.assignedStudents)
      ? item.homework.assignedStudents
      : [];

  const assignedStudents = rawAssignedStudents
    .map((student) => {
      if (!student || typeof student !== "object") {
        return null;
      }

      const studentItem = student as Record<string, unknown>;
      const studentId =
        getStringValue(studentItem.studentId) ||
        getStringValue(studentItem.uid) ||
        getStringValue(studentItem.id);

      if (!studentId) {
        return null;
      }

      return {
        studentId,
        name:
          getStringValue(studentItem.name) ||
          getStringValue(studentItem.studentName) ||
          studentId,
        status:
          getStringValue(studentItem.status) ||
          getStringValue(studentItem.recordStatus) ||
          "pending",
        remarks: getStringValue(studentItem.remarks),
      };
    })
    .filter((student): student is NonNullable<typeof student> => Boolean(student));

  const uid =
    getStringValue(item.uid) ||
    getStringValue(item.id) ||
    getStringValue(item._id) ||
    getStringValue(item.homeworkId) ||
    getStringValue(item.homework?.uid) ||
    getStringValue(item.homework?.id) ||
    getStringValue(item.homework?._id) ||
    getStringValue(item.homework?.homeworkId) ||
    `record-${index}`;

  return {
    uid,
    id:
      getStringValue(item.id) ||
      getStringValue(item._id) ||
      getStringValue(item.homeworkId) ||
      getStringValue(item.homework?.id) ||
      getStringValue(item.homework?._id) ||
      getStringValue(item.homework?.homeworkId) ||
      `record-${index}`,
    classId:
      getStringValue(item.classId) ||
      getStringValue(item.class?.classId) ||
      getStringValue(item.homework?.classId),
    title:
      getStringValue(item.title) ||
      getStringValue(item.homework?.title) ||
      "Untitled homework",
    assignedDate:
      getStringValue(item.assignedDate) ||
      getStringValue(item.assignedOn) ||
      getStringValue(item.date) ||
      getStringValue(item.homework?.assignedDate) ||
      getStringValue(item.homework?.assignedOn) ||
      getStringValue(item.homework?.date) ||
      "-",
    dueDate:
      getStringValue(item.dueDate) ||
      getStringValue(item.homework?.dueDate) ||
      "-",
    subject:
      getStringValue(item.subject) ||
      getStringValue(item.homework?.subject) ||
      "-",
    recordStatus:
      getStringValue(item.recordStatus) || getStringValue(item.status) || "pending",
    assignedStudents,
  };
}

export default function PastHomeworksScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<HistoryRouteParams>();
  const insets = useSafeAreaInsets();
  const { token, isLoading: authLoading } = useAuth();

  const subject = useMemo(
    () => (params.subject ? String(params.subject).trim() : ""),
    [params.subject],
  );
  const [historyItems, setHistoryItems] = useState<HomeworkHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const getStatusMeta = (statusValue: string) => {
    const normalized = statusValue
      .trim()
      .toLowerCase()
      .replace(/[\s_-]+/g, "");
    if (normalized === "completed") {
      return {
        label: "Completed",
        icon: "check-circle",
        color: "#15803d",
      } as const;
    }

    if (normalized === "inprogress") {
      return {
        label: "In Progress",
        icon: "progress-clock",
        color: "#0369a1",
      } as const;
    }

    return {
      label: "Pending",
      icon: "clock-outline",
      color: "#b45309",
    } as const;
  };

  const loadHistory = useCallback(async () => {
    if (!token) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const searchParams = new URLSearchParams({ page: "1" });
      if (subject) {
        searchParams.set("subject", subject);
      }

      const response = await fetch(
        `https://juniotrack.vercel.app/api/teacher/homework/all?${searchParams.toString()}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        },
      );

      const contentType = response.headers.get("content-type") ?? "";
      if (!contentType.includes("application/json")) {
        const text = await response.text();
        throw new Error(
          `Unexpected response format: ${response.status} ${response.statusText}. ${text}`,
        );
      }

      const payload = (await response.json()) as { message?: string };
      if (!response.ok) {
        throw new Error(payload?.message ?? "Unable to load homework history.");
      }

      const records = extractRecords(payload).map(mapRecord);
      setHistoryItems(records);
    } catch (err) {
      setHistoryItems([]);
      setError(
        err instanceof Error ? err.message : "Failed to load homework history.",
      );
    } finally {
      setLoading(false);
    }
  }, [subject, token]);

  useEffect(() => {
    if (!authLoading && !token) {
      router.replace("/login");
    }
  }, [authLoading, router, token]);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  return (
    <View className="bg-[#eff6ff] flex-1">
      <ScrollView
        className="bg-[#eff6ff]"
        contentContainerStyle={{ padding: 20 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="mb-4">
          <Pressable
            onPress={() => router.back()}
            className="mb-2 w-[58px]"
            style={{ marginTop: insets.top > 0 ? 4 : 12 }}
          >
            <Text className="text-[#0ea5e9] text-[15px] font-semibold">Back</Text>
          </Pressable>
          <Text className="text-[#0f172a] text-[28px] font-bold">
            Past Homeworks
          </Text>
          <Text className="text-[#475569] text-sm mt-1.5">
            {subject
              ? `History for subject: ${subject}`
              : "Recently assigned homework list"}
          </Text>
        </View>

        {error ? (
          <View className="rounded-xl border border-[#fecaca] bg-[#fff1f2] p-3 mb-3">
            <Text className="text-[#b91c1c] text-sm font-semibold">{error}</Text>
          </View>
        ) : null}

        {loading ? (
          <View className="rounded-2xl border border-[#bfdbfe] bg-white p-5 items-center justify-center">
            <ActivityIndicator size="small" color="#0ea5e9" />
            <Text className="text-[#64748b] text-sm mt-2">
              Loading history...
            </Text>
          </View>
        ) : historyItems.length === 0 ? (
          <View className="rounded-2xl border border-[#bfdbfe] bg-white p-5 items-center justify-center">
            <Text className="text-[#64748b] text-sm">No homework history found.</Text>
          </View>
        ) : (
          historyItems.map((homework) => {
            const statusMeta = getStatusMeta(homework.recordStatus);

            return (
              <Pressable
                key={homework.id}
                onPress={() =>
                  router.push({
                    pathname: "/teacher/homework-review",
                    params: {
                      uid: homework.uid,
                      title: homework.title,
                      subject: homework.subject,
                      assignedDate: homework.assignedDate,
                      classId: homework.classId,
                      assignedStudents: JSON.stringify(homework.assignedStudents),
                    },
                  })
                }
                className="border border-[#93c5fd] rounded-xl p-3 mb-2 bg-white"
              >
                <View className="flex-row items-center justify-between mb-2">
                  <Text className="text-[#0f172a] text-[15px] font-bold flex-1 mr-2">
                    {homework.title}
                  </Text>
                  <View className="flex-row items-center">
                    <MaterialCommunityIcons
                      name={statusMeta.icon}
                      size={18}
                      color={statusMeta.color}
                    />
                    <Text
                      className="text-[12px] font-semibold ml-1"
                      style={{ color: statusMeta.color }}
                    >
                      {statusMeta.label}
                    </Text>
                  </View>
                </View>
                <Text className="text-[#334155] text-[13px] mb-1">{`Assigned Date: ${homework.assignedDate}`}</Text>
                <Text className="text-[#334155] text-[13px] mb-1">{`Due Date: ${homework.dueDate}`}</Text>
                <Text className="text-[#166534] text-[13px] font-semibold">{`Subject: ${homework.subject}`}</Text>
              </Pressable>
            );
          })
        )}

        {!loading && historyItems.length > 0 ? (
          <View className="mt-2">
            <Pressable
              onPress={loadHistory}
              className="border border-[#93c5fd] rounded-xl bg-white py-2"
            >
              <Text className="text-center text-[#0369a1] text-sm font-semibold">
                Refresh
              </Text>
            </Pressable>
            <View className="h-3" />
          </View>
        ) : (
          <View className="h-3" />
        )}
      </ScrollView>
    </View>
  );
}
