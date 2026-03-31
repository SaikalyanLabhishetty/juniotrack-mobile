import { MaterialCommunityIcons } from "@expo/vector-icons";
import {
  DateTimePickerAndroid,
  default as DateTimePicker,
} from "@react-native-community/datetimepicker";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useAuth } from "../_auth";

const SUBJECTS = ["Math", "Science", "English", "Social", "Hindi", "Computer"] as const;

type HomeworkRouteParams = {
  classId?: string;
  className?: string;
  section?: string;
  academicYear?: string;
};

type ApiAssignedStudent = {
  studentId?: string;
  uid?: string;
  id?: string;
  studentName?: string;
  name?: string;
  enrollmentNumber?: string;
  enrollmentNo?: string;
  rollNo?: string;
  rollNumber?: string;
  recordStatus?: string;
  status?: string;
};

type ApiHomework = {
  title?: string;
  description?: string;
  subject?: string;
  assignedStudents?: ApiAssignedStudent[];
};

type HomeworkPrefillResponse = {
  source?: string;
  class?: {
    classId?: string;
    className?: string;
    section?: string;
  };
  date?: string;
  homework?: ApiHomework | null;
  data?: {
    class?: {
      classId?: string;
      className?: string;
      section?: string;
    };
    date?: string;
    homework?: ApiHomework | null;
  };
  message?: string;
};

type PreviewStudent = {
  studentId: string;
  studentName: string;
  enrollmentNumber: string;
  status: string;
};

function getIsoDate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function parseIsoDate(isoDate: string) {
  const [year, month, day] = isoDate.split("-").map(Number);
  if (!year || !month || !day) {
    return new Date();
  }

  return new Date(year, month - 1, day);
}

function addDaysToIsoDate(isoDate: string, days: number) {
  const date = parseIsoDate(isoDate);
  date.setDate(date.getDate() + days);
  return getIsoDate(date);
}

function isIsoDate(value: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value);
}

function getStringValue(value: unknown) {
  return typeof value === "string" ? value : "";
}

function normalizeSubjectValue(value: string) {
  return value.trim().replace(/^['"]+|['"]+$/g, "");
}

function normalizeStudentStatus(value: string) {
  return value.trim().toLowerCase();
}

function getHomework(payload: HomeworkPrefillResponse): ApiHomework | null {
  if (payload.homework && typeof payload.homework === "object") {
    return payload.homework;
  }

  if (payload.data?.homework && typeof payload.data.homework === "object") {
    return payload.data.homework;
  }

  return null;
}

function mapAssignedStudents(students: ApiAssignedStudent[] | undefined): PreviewStudent[] {
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

      return {
        studentId,
        studentName:
          getStringValue(student.studentName) ||
          getStringValue(student.name) ||
          studentId,
        enrollmentNumber:
          getStringValue(student.enrollmentNumber) ||
          getStringValue(student.enrollmentNo) ||
          getStringValue(student.rollNumber) ||
          getStringValue(student.rollNo),
        status:
          getStringValue(student.status) ||
          getStringValue(student.recordStatus) ||
          "pending",
      };
    })
    .filter((student): student is NonNullable<typeof student> => Boolean(student));
}

export default function HomeworkScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<HomeworkRouteParams>();
  const insets = useSafeAreaInsets();
  const { token, user, isLoading: authLoading } = useAuth();

  const classId = params.classId ? String(params.classId).trim() : "";
  const initialClassName = params.className ? String(params.className) : "Class details";
  const initialSection = params.section ? String(params.section) : "";
  const academicYear = params.academicYear ? String(params.academicYear) : "";
  const teacherId = user?.uid ?? "";
  const today = getIsoDate(new Date());

  const [apiClassName, setApiClassName] = useState(initialClassName);
  const [apiSection, setApiSection] = useState(initialSection);
  const [selectedDate, setSelectedDate] = useState(today);
  const [subject, setSubject] = useState<(typeof SUBJECTS)[number]>("Math");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [students, setStudents] = useState<PreviewStudent[]>([]);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [isAlreadyAssigned, setIsAlreadyAssigned] = useState(false);

  const dueDate = useMemo(() => addDaysToIsoDate(selectedDate, 1), [selectedDate]);

  useEffect(() => {
    if (!authLoading && !token) {
      router.replace("/login");
    }
  }, [authLoading, router, token]);

  const loadHomeworkPreview = useCallback(async () => {
    if (!token) {
      return;
    }

    if (!teacherId || !classId) {
      setStudents([]);
      setError("Missing teacher or class details.");
      setLoaded(true);
      return;
    }

    const normalizedSubject = normalizeSubjectValue(subject);
    if (!normalizedSubject) {
      setStudents([]);
      setError("Please choose a subject.");
      setLoaded(true);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const searchParams = new URLSearchParams({
        teacherId,
        classId,
        date: selectedDate,
        subject: normalizedSubject,
      });

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

      const payload = (await response.json()) as HomeworkPrefillResponse;
      if (!response.ok) {
        throw new Error(payload?.message ?? "Unable to load homework preview.");
      }

      const responseClass = payload.class ?? payload.data?.class;
      if (responseClass) {
        if (getStringValue(responseClass.className)) {
          setApiClassName(getStringValue(responseClass.className));
        }
        if (getStringValue(responseClass.section)) {
          setApiSection(getStringValue(responseClass.section));
        }
      }

      const responseDate = getStringValue(payload.date) || getStringValue(payload.data?.date);
      if (responseDate && isIsoDate(responseDate)) {
        setSelectedDate(responseDate);
      }

      const homework = getHomework(payload);
      const serverTitle = getStringValue(homework?.title);
      const serverDescription = getStringValue(homework?.description);
      if (serverTitle) {
        setTitle(serverTitle);
      }
      if (serverDescription) {
        setDescription(serverDescription);
      }

      const mappedStudents = mapAssignedStudents(homework?.assignedStudents);
      setStudents(mappedStudents);

      const hasHomeworkText =
        serverTitle.trim().length > 0 && serverDescription.trim().length > 0;
      const allStudentsAssigned =
        mappedStudents.length > 0 &&
        mappedStudents.every(
          (student) => normalizeStudentStatus(student.status) === "assigned",
        );
      setIsAlreadyAssigned(hasHomeworkText && allStudentsAssigned);
    } catch (err) {
      setStudents([]);
      setIsAlreadyAssigned(false);
      setError(err instanceof Error ? err.message : "Failed to load homework preview.");
    } finally {
      setLoading(false);
      setLoaded(true);
    }
  }, [classId, selectedDate, subject, teacherId, token]);

  useEffect(() => {
    loadHomeworkPreview();
  }, [loadHomeworkPreview]);

  const onChangeDate = (date?: Date) => {
    if (!date) {
      return;
    }

    const nextDate = getIsoDate(date);
    if (nextDate < today) {
      return;
    }

    setSelectedDate(nextDate);
  };

  const onOpenDatePicker = () => {
    if (Platform.OS === "android") {
      DateTimePickerAndroid.open({
        mode: "date",
        value: parseIsoDate(selectedDate),
        minimumDate: parseIsoDate(today),
        onChange: (_, nextDate) => onChangeDate(nextDate),
      });
      return;
    }

    setShowDatePicker((previous) => !previous);
  };

  const onAssignHomework = async () => {
    if (!token) {
      Alert.alert("Missing session", "Please login again and retry.");
      return;
    }

    if (!teacherId || !classId) {
      Alert.alert("Missing details", "Teacher or class details are missing.");
      return;
    }

    const normalizedTitle = title.trim();
    const normalizedDescription = description.trim();
    const normalizedSubject = normalizeSubjectValue(subject);

    if (!normalizedTitle || !normalizedDescription) {
      Alert.alert("Required fields", "Enter homework title and description.");
      return;
    }

    if (students.length === 0) {
      Alert.alert("No students", "No students found to assign homework.");
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      const response = await fetch("https://juniotrack.vercel.app/api/teacher/homework", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          teacherId,
          classId,
          title: normalizedTitle,
          description: normalizedDescription,
          subject: normalizedSubject,
          academicYear,
          assignedDate: selectedDate,
          dueDate,
          assignedStudents: students.map((student) => ({
            studentId: student.studentId,
            status: "pending",
            remarks: "",
          })),
        }),
      });

      const contentType = response.headers.get("content-type") ?? "";
      let responseMessage = "Homework assigned successfully.";

      if (contentType.includes("application/json")) {
        const data = (await response.json()) as { message?: string };
        if (!response.ok) {
          throw new Error(data?.message ?? "Unable to assign homework.");
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

      Alert.alert("Homework assigned", responseMessage);
      await loadHomeworkPreview();
    } catch (err) {
      Alert.alert(
        "Assign failed",
        err instanceof Error ? err.message : "Something went wrong.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const canAssign =
    !isAlreadyAssigned &&
    !submitting &&
    !loading &&
    title.trim().length > 0 &&
    description.trim().length > 0 &&
    students.length > 0 &&
    Boolean(teacherId) &&
    Boolean(classId);

  const onOpenHistory = () => {
    router.push({
      pathname: "/teacher/past-homeworks",
      params: { subject },
    });
  };

  return (
    <View className="bg-[#eff6ff] flex-1">
      <ScrollView
        className="bg-[#eff6ff]"
        contentContainerStyle={{ padding: 20, paddingBottom: 126 + insets.bottom }}
        showsVerticalScrollIndicator={false}
      >
        <View className="mb-4">
          <View
            className="mb-2 flex-row items-center justify-between"
            style={{ marginTop: insets.top > 0 ? 4 : 12 }}
          >
            <Pressable onPress={() => router.back()} className="w-[58px]">
              <Text className="text-[#0ea5e9] text-[15px] font-semibold">Back</Text>
            </Pressable>
            <Pressable
              onPress={onOpenHistory}
              accessibilityRole="button"
              accessibilityLabel="Open homework history"
              className="h-9 w-9 items-center justify-center rounded-full border border-[#93c5fd] bg-white"
            >
              <MaterialCommunityIcons name="history" size={19} color="#0369a1" />
            </Pressable>
          </View>
          <Text className="text-[#0f172a] text-[28px] font-bold">Homework</Text>
          <Text className="text-[#475569] text-sm mt-1.5">
            {apiClassName} • Section {apiSection}
            {academicYear ? ` • ${academicYear}` : ""}
          </Text>
        </View>

        <View className="rounded-2xl bg-white border border-[#93c5fd] p-3 mb-3">
          <Text className="text-[#0f172a] text-base font-semibold mb-2">Date Preview</Text>
          <Pressable
            onPress={onOpenDatePicker}
            className="rounded-xl border border-[#bae6fd] bg-[#f0f9ff] px-3 py-2.5"
          >
            <Text className="text-[#0f172a] text-xs font-medium">Assigned Date</Text>
            <Text className="text-[#0f172a] font-semibold mt-1">{selectedDate}</Text>
          </Pressable>
          {Platform.OS === "ios" && showDatePicker ? (
            <View className="mt-3 rounded-xl border border-[#bae6fd] bg-white">
              <DateTimePicker
                value={parseIsoDate(selectedDate)}
                mode="date"
                display="spinner"
                minimumDate={parseIsoDate(today)}
                onChange={(_, nextDate) => onChangeDate(nextDate)}
              />
            </View>
          ) : null}
          <View className="rounded-xl border border-[#dcfce7] bg-[#f0fdf4] px-3 py-2.5 mt-2">
            <Text className="text-[#166534] text-xs font-medium">Due Date</Text>
            <Text className="text-[#14532d] font-semibold mt-1">{dueDate}</Text>
          </View>
        </View>

        <View className="rounded-2xl bg-white border border-[#93c5fd] p-3 mb-3">
          <Text className="text-[#0f172a] text-base font-semibold mb-2">Subject</Text>
          <View className="flex-row flex-wrap gap-2">
            {SUBJECTS.map((item) => {
              const isActive = subject === item;
              return (
                <Pressable
                  key={item}
                  onPress={() => setSubject(item)}
                  className={`rounded-full border px-3 py-2 ${
                    isActive ? "bg-[#dbeafe] border-[#16a34a]" : "border-[#93c5fd]"
                  }`}
                >
                  <Text
                    className={`text-[12px] font-semibold ${
                      isActive ? "text-[#166534]" : "text-[#475569]"
                    }`}
                  >
                    {item}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        <View className="rounded-2xl bg-white border border-[#93c5fd] p-3 mb-3">
          <Text className="text-[#334155] text-[13px] font-semibold mb-1.5">
            Homework Title
          </Text>
          <TextInput
            value={title}
            onChangeText={setTitle}
            placeholder="Enter homework title"
            placeholderTextColor="#94a3b8"
            className="border border-[#93c5fd] rounded-xl text-[#0f172a] text-sm px-3 py-2"
          />

          <Text className="text-[#334155] text-[13px] font-semibold mt-3 mb-1.5">
            Description
          </Text>
          <TextInput
            value={description}
            onChangeText={setDescription}
            placeholder="Enter homework description"
            placeholderTextColor="#94a3b8"
            multiline
            className="border border-[#93c5fd] rounded-xl text-[#0f172a] text-sm px-3 py-2 min-h-[88px]"
          />
        </View>

        {error ? (
          <View className="rounded-xl border border-[#fecaca] bg-[#fff1f2] p-3 mb-3">
            <Text className="text-[#b91c1c] text-sm font-semibold">{error}</Text>
          </View>
        ) : null}

        <View className="rounded-2xl bg-white border border-[#93c5fd] p-3 mb-3">
          <View className="flex-row items-center justify-between mb-2">
            <Text className="text-[#0f172a] text-base font-semibold">Students Preview</Text>
            <Pressable
              onPress={loadHomeworkPreview}
              disabled={loading || submitting}
              className={`rounded-full px-3 py-1 ${
                loading || submitting ? "bg-[#bfdbfe]" : "bg-[#e0f2fe]"
              }`}
            >
              <Text className="text-[#0369a1] text-xs font-semibold">Refresh</Text>
            </Pressable>
          </View>

          {loading && !loaded ? (
            <View className="rounded-xl border border-[#bfdbfe] bg-[#f8fafc] p-4 items-center justify-center">
              <ActivityIndicator size="small" color="#0ea5e9" />
              <Text className="text-[#64748b] text-sm mt-2">Loading students...</Text>
            </View>
          ) : students.length === 0 ? (
            <View className="rounded-xl border border-[#bfdbfe] bg-[#f8fafc] p-4">
              <Text className="text-[#64748b] text-sm">
                No students available for the selected date and subject.
              </Text>
            </View>
          ) : (
            students.map((student) => (
              <View
                key={student.studentId}
                className="rounded-xl border border-[#bfdbfe] bg-[#f8fafc] p-3 mb-2"
              >
                <View className="flex-row items-center justify-between">
                  <View className="flex-1 pr-2">
                    <Text className="text-[#0f172a] text-[14px] font-semibold">
                      {student.studentName}
                    </Text>
                    <Text className="text-[#64748b] text-[12px] mt-0.5">
                      Enrollment No: {student.enrollmentNumber || "-"}
                    </Text>
                  </View>
                  <View className="flex-row items-center">
                    <MaterialCommunityIcons
                      name="clock-outline"
                      size={16}
                      color="#b45309"
                    />
                    <Text className="text-[#b45309] text-[12px] font-semibold ml-1">
                      {student.status || "pending"}
                    </Text>
                  </View>
                </View>
              </View>
            ))
          )}
        </View>
      </ScrollView>

      <View pointerEvents="box-none" className="absolute inset-0">
        {isAlreadyAssigned ? (
          <View
            className="absolute left-5 right-5 rounded-xl py-3 bg-[#475569]"
            style={{ bottom: insets.bottom + 12 }}
          >
            <Text className="text-white text-base font-bold text-center">
              Homework Already Assigned
            </Text>
          </View>
        ) : (
          <Pressable
            onPress={onAssignHomework}
            disabled={!canAssign}
            className={`absolute left-5 right-5 rounded-xl py-3 ${
              canAssign ? "bg-[#0369a1]" : "bg-[#93c5fd]"
            }`}
            style={{ bottom: insets.bottom + 12 }}
          >
            <Text className="text-white text-base font-bold text-center">
              {submitting ? "Assigning..." : "Assign Home Work"}
            </Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}
