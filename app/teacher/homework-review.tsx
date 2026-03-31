import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useAuth } from "../_auth";

type ReviewRouteParams = {
  uid?: string;
  title?: string;
  subject?: string;
  assignedDate?: string;
  classId?: string;
  assignedStudents?: string;
};

type ApiAssignedStudent = {
  studentId?: string;
  uid?: string;
  id?: string;
  name?: string;
  studentName?: string;
  status?: string;
  recordStatus?: string;
  remarks?: string;
};

type ApiHomework = {
  uid?: string;
  title?: string;
  subject?: string;
  assignedStudents?: ApiAssignedStudent[];
};

type HomeworkDetailResponse = {
  message?: string;
  homework?: ApiHomework | null;
  assignedStudents?: ApiAssignedStudent[];
  data?: {
    homework?: ApiHomework | null;
    assignedStudents?: ApiAssignedStudent[];
  };
};

type ReviewStudent = {
  studentId: string;
  name: string;
  isSelected: boolean;
  remarks: string;
};

function getStringValue(value: unknown) {
  return typeof value === "string" ? value : "";
}

function mapAssignedStudents(students: ApiAssignedStudent[] | undefined): ReviewStudent[] {
  if (!Array.isArray(students)) {
    return [];
  }

  return students
    .map((student) => {
      const studentId =
        getStringValue(student.studentId) ||
        getStringValue(student.uid) ||
        getStringValue(student.id);

      if (!studentId) {
        return null;
      }

      const incomingStatus = (
        getStringValue(student.recordStatus) || getStringValue(student.status)
      )
        .trim()
        .toLowerCase();

      return {
        studentId,
        name:
          getStringValue(student.name) ||
          getStringValue(student.studentName) ||
          studentId,
        isSelected: incomingStatus === "pending" ? false : true,
        remarks: getStringValue(student.remarks),
      };
    })
    .filter((student): student is NonNullable<typeof student> => Boolean(student));
}

function parseRouteAssignedStudents(rawParam: string): ApiAssignedStudent[] {
  if (!rawParam) {
    return [];
  }

  try {
    const parsed = JSON.parse(rawParam);
    return Array.isArray(parsed) ? (parsed as ApiAssignedStudent[]) : [];
  } catch {
    return [];
  }
}

function getHomework(payload: HomeworkDetailResponse): ApiHomework | null {
  if (payload.homework && typeof payload.homework === "object") {
    return payload.homework;
  }

  if (payload.data?.homework && typeof payload.data.homework === "object") {
    return payload.data.homework;
  }

  return null;
}

function getAssignedStudents(
  payload: HomeworkDetailResponse,
  homework: ApiHomework | null,
) {
  if (Array.isArray(homework?.assignedStudents)) {
    return homework.assignedStudents;
  }

  if (Array.isArray(payload.assignedStudents)) {
    return payload.assignedStudents;
  }

  if (Array.isArray(payload.data?.assignedStudents)) {
    return payload.data.assignedStudents;
  }

  return [];
}

function normalizeSubjectValue(value?: string) {
  return (value ?? "").trim().replace(/^['"]+|['"]+$/g, "");
}

function isIsoDate(value: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value);
}

export default function HomeworkReviewScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<ReviewRouteParams>();
  const insets = useSafeAreaInsets();
  const { token, user, isLoading: authLoading } = useAuth();

  const uid = params.uid ? String(params.uid) : "";
  const routeTitle = params.title ? String(params.title) : "";
  const routeSubject = normalizeSubjectValue(
    params.subject ? String(params.subject) : "",
  );
  const routeDate = params.assignedDate ? String(params.assignedDate).trim() : "";
  const routeClassId = params.classId ? String(params.classId).trim() : "";
  const routeAssignedStudents = useMemo(
    () =>
      parseRouteAssignedStudents(
        params.assignedStudents ? String(params.assignedStudents) : "",
      ),
    [params.assignedStudents],
  );
  const teacherId = user?.uid ?? "";

  const [homeworkUid, setHomeworkUid] = useState(uid);
  const [homeworkTitle, setHomeworkTitle] = useState(routeTitle);
  const [students, setStudents] = useState<ReviewStudent[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadHomework = useCallback(async () => {
    if (!token) {
      return;
    }

    if (!teacherId || !routeClassId || !isIsoDate(routeDate) || !routeSubject) {
      setStudents([]);
      setError(
        "Missing homework context. Teacher, class, date, and subject are required.",
      );
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const searchParams = new URLSearchParams({
        teacherId,
        classId: routeClassId,
        date: routeDate,
        subject: routeSubject,
      });
      if (uid) {
        searchParams.set("uid", uid);
      }

      const response = await fetch(
        `https://juniotrack.vercel.app/api/teacher/homework?${searchParams.toString()}`,
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

      const payload = (await response.json()) as HomeworkDetailResponse;
      if (!response.ok) {
        throw new Error(payload?.message ?? "Unable to load homework details.");
      }

      const homework = getHomework(payload);
      const assignedStudents = getAssignedStudents(payload, homework);
      const fallbackStudents =
        assignedStudents.length > 0 ? assignedStudents : routeAssignedStudents;
      const apiHomeworkUid = getStringValue(homework?.uid);
      setHomeworkUid(apiHomeworkUid || uid);
      setHomeworkTitle(getStringValue(homework?.title) || routeTitle || "Homework");
      setStudents(mapAssignedStudents(fallbackStudents));
    } catch (err) {
      setStudents([]);
      setError(
        err instanceof Error ? err.message : "Failed to load homework details.",
      );
    } finally {
      setLoading(false);
    }
  }, [
    routeAssignedStudents,
    routeClassId,
    routeDate,
    routeSubject,
    routeTitle,
    teacherId,
    token,
    uid,
  ]);

  useEffect(() => {
    if (!authLoading && !token) {
      router.replace("/login");
    }
  }, [authLoading, router, token]);

  useEffect(() => {
    loadHomework();
  }, [loadHomework]);

  const onToggleStudent = (studentId: string) => {
    setStudents((previous) =>
      previous.map((student) =>
        student.studentId === studentId
          ? { ...student, isSelected: !student.isSelected }
          : student,
      ),
    );
  };

  const onChangeRemarks = (studentId: string, nextRemarks: string) => {
    setStudents((previous) =>
      previous.map((student) =>
        student.studentId === studentId
          ? { ...student, remarks: nextRemarks }
          : student,
      ),
    );
  };

  const onSubmitHomework = async () => {
    if (!homeworkUid) {
      Alert.alert(
        "Missing homework",
        "No homework record found for this date and subject.",
      );
      return;
    }

    if (!token) {
      Alert.alert("Missing session", "Please login again and retry.");
      return;
    }

    if (students.length === 0) {
      Alert.alert("No students", "No students are available for this homework.");
      return;
    }

    try {
      setSubmitting(true);

      const response = await fetch("https://juniotrack.vercel.app/api/teacher/homework", {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          uid: homeworkUid,
          assignedStudents: students.map((student) => ({
            studentId: student.studentId,
            status: student.isSelected ? "completed" : "pending",
            remarks: student.remarks.trim(),
          })),
        }),
      });

      const contentType = response.headers.get("content-type") ?? "";
      let responseMessage = "Homework updated successfully.";

      if (contentType.includes("application/json")) {
        const data = (await response.json()) as { message?: string };
        if (!response.ok) {
          throw new Error(data?.message ?? "Unable to submit homework.");
        }

        if (data?.message) {
          responseMessage = data.message;
        }
      } else if (!response.ok) {
        const text = await response.text();
        throw new Error(
          `Unexpected response format: ${response.status} ${response.statusText}. ${text}`,
        );
      }

      Alert.alert("Homework submitted", responseMessage, [
        {
          text: "OK",
          onPress: () => router.back(),
        },
      ]);
    } catch (err) {
      Alert.alert(
        "Submit failed",
        err instanceof Error ? err.message : "Something went wrong.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const selectedCount = useMemo(
    () => students.filter((student) => student.isSelected).length,
    [students],
  );

  return (
    <View className="bg-[#eff6ff] flex-1">
      <ScrollView
        className="bg-[#eff6ff]"
        contentContainerStyle={{ padding: 20, paddingBottom: 120 + insets.bottom }}
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
            Homework Review
          </Text>
          <Text className="text-[#475569] text-sm mt-1.5">
            {homeworkTitle || "Update student homework status and remarks"}
          </Text>
          <Text className="text-[#166534] text-[13px] font-semibold mt-1">
            Selected: {selectedCount}/{students.length}
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
            <Text className="text-[#64748b] text-sm mt-2">Loading students...</Text>
          </View>
        ) : students.length === 0 ? (
          <View className="rounded-2xl border border-[#bfdbfe] bg-white p-5 items-center justify-center">
            <Text className="text-[#64748b] text-sm">No students found for this homework.</Text>
          </View>
        ) : (
          students.map((student) => (
            <View
              key={student.studentId}
              className="rounded-xl border border-[#93c5fd] bg-white p-3 mb-3"
            >
              <Pressable
                onPress={() => onToggleStudent(student.studentId)}
                className="flex-row items-center mb-2"
              >
                <MaterialCommunityIcons
                  name={
                    student.isSelected
                      ? "checkbox-marked-outline"
                      : "checkbox-blank-outline"
                  }
                  size={22}
                  color={student.isSelected ? "#15803d" : "#475569"}
                />
                <View className="ml-2 flex-1">
                  <Text className="text-[#0f172a] text-[15px] font-semibold">
                    {student.name}
                  </Text>
                </View>
                <Text
                  className={`text-[12px] font-semibold ${
                    student.isSelected ? "text-[#15803d]" : "text-[#b45309]"
                  }`}
                >
                  {student.isSelected ? "Completed" : "Pending"}
                </Text>
              </Pressable>

              <Text className="text-[#334155] text-[13px] font-semibold mb-1">
                Remarks
              </Text>
              <TextInput
                value={student.remarks}
                onChangeText={(value) => onChangeRemarks(student.studentId, value)}
                placeholder="Add remarks for this student"
                placeholderTextColor="#94a3b8"
                multiline
                className="border border-[#93c5fd] rounded-xl text-[#0f172a] text-sm px-3 py-2 min-h-[72px]"
              />
            </View>
          ))
        )}
      </ScrollView>

      <View pointerEvents="box-none" className="absolute inset-0">
        <Pressable
          onPress={onSubmitHomework}
          disabled={submitting || loading || students.length === 0 || !homeworkUid}
          className={`absolute left-5 right-5 rounded-xl py-3 ${
            submitting || loading || students.length === 0 || !homeworkUid
              ? "bg-[#7dd3fc]"
              : "bg-[#0369a1]"
          }`}
          style={{ bottom: insets.bottom + 12 }}
        >
          <Text className="text-white text-base font-bold text-center">
            {submitting
              ? "Submitting..."
              : homeworkUid
                ? "Submit Homework"
                : "No Homework Record"}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
