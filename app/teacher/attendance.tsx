import { MaterialCommunityIcons } from "@expo/vector-icons";
import {
  default as DateTimePicker,
  DateTimePickerAndroid,
} from "@react-native-community/datetimepicker";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import {
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

type AttendanceStatus = "present" | "absent" | "unmarked";

type StudentAttendance = {
  uid: string;
  name: string;
  dob?: string;
  enrollmentNumber?: string;
  classId?: string;
  organizationId?: string;
  status: AttendanceStatus;
};

type PastAttendance = {
  date: string;
  present: number;
  absent: number;
};

type AttendanceRouteParams = {
  classId?: string;
  className?: string;
  section?: string;
  academicYear?: string;
  isClassTeacher?: string;
};

type AttendanceApiResponse = {
  source?: string;
  class?: {
    classId: string;
    className: string;
    section: string;
  };
  date?: string;
  attendance?: unknown;
  studentAttendance?: StudentAttendance[];
  history?: PastAttendance[];
  message?: string;
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

export default function AttendanceScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<AttendanceRouteParams>();
  const insets = useSafeAreaInsets();
  const { token, user, isLoading: authLoading } = useAuth();
  const [attendance, setAttendance] = useState<
    Record<string, AttendanceStatus>
  >({});
  const [students, setStudents] = useState<StudentAttendance[]>([]);
  const [history, setHistory] = useState<PastAttendance[]>([]);
  const [searchText, setSearchText] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [submittedDates, setSubmittedDates] = useState<Record<string, boolean>>(
    {},
  );

  const classId = params.classId ? String(params.classId) : "";
  const [apiClassName, setApiClassName] = useState(
    params.className ? String(params.className) : "Class details",
  );
  const [apiSection, setApiSection] = useState(
    params.section ? String(params.section) : "",
  );
  const [apiDate, setApiDate] = useState(getIsoDate(new Date()));
  const academicYear = params.academicYear ? String(params.academicYear) : "";
  const teacherId = user?.uid;
  const today = getIsoDate(new Date());
  const isClassTeacher = params.isClassTeacher === "true";

  useEffect(() => {
    if (!authLoading && !token) {
      router.replace("/login");
    }
  }, [authLoading, router, token]);

  useEffect(() => {
    const loadAttendance = async () => {
      if (!token || !teacherId || !classId) {
        return;
      }

      setLoading(true);
      setError(null);
      setSuccessMessage(null);

      try {
        const url = `https://juniotrack.vercel.app/api/teacher/attendance/students?classId=${encodeURIComponent(
          classId,
        )}&teacherId=${encodeURIComponent(teacherId)}&date=${encodeURIComponent(
          apiDate,
        )}`;

        const response = await fetch(url, {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        });

        const contentType = response.headers.get("content-type") ?? "";
        if (!contentType.includes("application/json")) {
          const text = await response.text();
          throw new Error(
            `Unexpected response format: ${response.status} ${response.statusText}. ${text}`,
          );
        }

        const data = (await response.json()) as AttendanceApiResponse;
        if (!response.ok) {
          throw new Error(data?.message ?? "Unable to load attendance.");
        }

        const fetchedStudents = Array.isArray(data.studentAttendance)
          ? data.studentAttendance
          : [];
        const resolvedDate = data.date ?? apiDate;

        setStudents(
          fetchedStudents.map((student) => ({
            ...student,
            status:
              student.status === "absent"
                ? "absent"
                : student.status === "present"
                  ? "present"
                  : "unmarked",
          })),
        );

        const initialAttendance = fetchedStudents.reduce<
          Record<string, AttendanceStatus>
        >((acc, student) => {
          acc[student.uid] =
            student.status === "absent"
              ? "absent"
              : student.status === "present"
                ? "present"
                : "unmarked";
          return acc;
        }, {});

        setAttendance(initialAttendance);
        setHistory(Array.isArray(data.history) ? data.history : []);
        setSubmittedDates((prev) => ({
          ...prev,
          [resolvedDate]:
            fetchedStudents.length > 0 &&
            fetchedStudents.every(
              (student) =>
                student.status === "present" || student.status === "absent",
            ),
        }));

        if (data.class) {
          setApiClassName(data.class.className);
          setApiSection(data.class.section);
        }

        if (data.date) {
          setApiDate(data.date);
        }
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load attendance.",
        );
      } finally {
        setLoading(false);
      }
    };

    loadAttendance();
  }, [token, teacherId, classId, apiDate]);

  const summary = useMemo(() => {
    const values = Object.values(attendance);
    const present = values.filter((status) => status === "present").length;
    const absent = values.filter((status) => status === "absent").length;
    return {
      present,
      absent,
    };
  }, [attendance]);

  const normalizedSearch = searchText.trim().toLowerCase();

  const filteredStudents = useMemo(() => {
    if (!normalizedSearch) {
      return students;
    }

    return students.filter(
      (student) =>
        student.name.toLowerCase().includes(normalizedSearch) ||
        student.enrollmentNumber?.toLowerCase().includes(normalizedSearch),
    );
  }, [normalizedSearch, students]);

  const isPastDate = apiDate < today;
  const isSubmittedForDate = Boolean(submittedDates[apiDate]);
  const canEdit = isClassTeacher && apiDate === today && !isSubmittedForDate;
  const canSubmit =
    canEdit && !loading && !submitLoading && students.length > 0;

  const onDateChange = (nextDate?: Date) => {
    if (!nextDate) {
      return;
    }

    const formattedDate = getIsoDate(nextDate);
    if (formattedDate > today) {
      return;
    }

    setApiDate(formattedDate);
  };

  const onOpenDatePicker = () => {
    const selectedDate = parseIsoDate(apiDate);
    const maxDate = parseIsoDate(today);

    if (Platform.OS === "android") {
      DateTimePickerAndroid.open({
        value: selectedDate,
        mode: "date",
        maximumDate: maxDate,
        onChange: (_, nextDate) => onDateChange(nextDate),
      });
      return;
    }

    setShowDatePicker((previous) => !previous);
  };

  const onToggleStudent = (studentId: string, status: AttendanceStatus) => {
    if (!isClassTeacher || apiDate !== today) {
      return;
    }

    setAttendance((prev) => ({
      ...prev,
      [studentId]: status,
    }));
  };

  const onConfirmSubmit = () => {
    const message = `Present - ${summary.present}\nAbsent - ${summary.absent}`;

    Alert.alert("Submit attendance", message, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Submit",
        onPress: onSubmit,
        style: "destructive",
      },
    ]);
  };

  const onSubmit = async () => {
    if (!token || !teacherId || !classId) {
      setError("Missing class or teacher details.");
      return;
    }

    if (!canEdit) {
      setError("Only the class teacher can submit today's attendance.");
      return;
    }

    setSubmitLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const unmarkedStudents = Object.values(attendance).filter(
        (status) => status === "unmarked",
      );

      if (unmarkedStudents.length > 0) {
        setError(
          "Please mark all students present or absent before submitting.",
        );
        setSubmitLoading(false);
        return;
      }

      const payload = {
        classId,
        teacherId,
        date: apiDate,
        studentAttendance: Object.entries(attendance).map(([uid, status]) => ({
          studentUid: uid,
          status,
        })),
      };

      const response = await fetch(
        "https://juniotrack.vercel.app/api/teacher/attendance/students",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify(payload),
        },
      );

      const contentType = response.headers.get("content-type") ?? "";
      let result: AttendanceApiResponse | null = null;
      if (contentType.includes("application/json")) {
        result = (await response.json()) as AttendanceApiResponse;
      }

      if (!response.ok) {
        throw new Error(result?.message ?? "Unable to submit attendance.");
      }

      setSuccessMessage("Attendance submitted successfully.");
      setSubmittedDates((prev) => ({
        ...prev,
        [apiDate]: true,
      }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Submit failed.");
    } finally {
      setSubmitLoading(false);
    }
  };

  const floatingBottomOffset = insets.bottom + 12;
  const scrollBottomPadding = 120 + insets.bottom;

  return (
    <View className="bg-[#eff6ff] flex-1">
      <ScrollView
        className="bg-[#eff6ff]"
        contentContainerStyle={{
          paddingBottom: scrollBottomPadding,
          padding: 20,
        }}
        showsVerticalScrollIndicator={false}
      >
        <View className="mb-4">
          <Pressable
            onPress={() => router.back()}
            className="mb-2 w-[58px]"
            style={{ marginTop: insets.top > 0 ? 4 : 12 }}
          >
            <Text className="text-[#0ea5e9] text-[15px] font-semibold">
              Back
            </Text>
          </Pressable>
          <Text className="text-[#0f172a] text-[28px] font-bold">
            Attendance
          </Text>
          <Text className="text-[#475569] text-sm mt-1.5">
            {apiClassName} • Section {apiSection}
            {academicYear ? ` • ${academicYear}` : ""}
          </Text>
          <View className="mt-3 rounded-2xl bg-white border border-[#c7d2fe] p-3">
            <Text className="text-[#0f172a] text-sm font-semibold mb-2">
              Select date
            </Text>
            <Pressable
              onPress={onOpenDatePicker}
              className="rounded-xl border border-[#bae6fd] bg-[#f0f9ff] px-3 py-2.5"
            >
              <Text className="text-[#0f172a] text-xs font-medium">
                Selected date
              </Text>
              <Text className="text-[#0f172a] font-semibold mt-1">
                {apiDate}
              </Text>
            </Pressable>
            {Platform.OS === "ios" && showDatePicker ? (
              <View className="mt-3 rounded-xl border border-[#bae6fd] bg-white">
                <DateTimePicker
                  value={parseIsoDate(apiDate)}
                  mode="date"
                  display="spinner"
                  maximumDate={parseIsoDate(today)}
                  onChange={(_, nextDate) => onDateChange(nextDate)}
                />
              </View>
            ) : null}
            <Text className="text-[#475569] text-xs mt-2">
              {isClassTeacher
                ? isSubmittedForDate
                  ? "Attendance for this date is already submitted."
                  : apiDate === today
                  ? "You can mark attendance for today."
                  : "Past dates are read-only."
                : "You can only view attendance for this class."}
            </Text>
          </View>
        </View>

        <View className="rounded-2xl bg-white border border-[#93c5fd] p-4 mb-4">
          <Text className="text-[#0f172a] text-base font-semibold mb-2">
            Past history attendance
          </Text>
          {loading ? (
            <Text className="text-[#64748b] text-sm">Loading history…</Text>
          ) : history.length === 0 ? (
            <Text className="text-[#64748b] text-sm">
              No past attendance records available.
            </Text>
          ) : (
            history.map((record) => (
              <View
                key={record.date}
                className="rounded-2xl bg-[#eff6ff] p-3 mb-2"
              >
                <Text className="text-[#0f172a] font-semibold">
                  {record.date}
                </Text>
                <Text className="text-[#475569] text-sm mt-1">
                  Present: {record.present} • Absent: {record.absent}
                </Text>
              </View>
            ))
          )}
        </View>

        <View className="bg-white rounded-xl flex-row justify-between mb-4 p-3">
          <Text className="text-[#1e293b] text-sm font-semibold">
            Present: {summary.present}
          </Text>
          <Text className="text-[#1e293b] text-sm font-semibold">
            Absent: {summary.absent}
          </Text>
        </View>

        <View className="flex-row items-center bg-white border border-[#93c5fd] rounded-xl mb-3 px-3">
          <MaterialCommunityIcons name="magnify" size={20} color="#64748b" />
          <TextInput
            value={searchText}
            onChangeText={setSearchText}
            placeholder="Search by student name or roll number"
            placeholderTextColor="#94a3b8"
            className="text-[#0f172a] flex-1 text-sm py-2"
          />
        </View>

        {error ? (
          <View className="rounded-2xl border border-[#fecaca] bg-[#fff1f2] p-3 mb-4">
            <Text className="text-[#b91c1c] text-sm font-semibold">
              {error}
            </Text>
          </View>
        ) : null}

        {successMessage ? (
          <View className="rounded-2xl border border-[#d1fae5] bg-[#ecfdf5] p-3 mb-4">
            <Text className="text-[#166534] text-sm font-semibold">
              {successMessage}
            </Text>
          </View>
        ) : null}

        {loading ? (
          <View className="rounded-2xl border border-[#bfdbfe] bg-white p-6 items-center justify-center">
            <Text className="text-[#64748b] text-sm">Loading students…</Text>
          </View>
        ) : filteredStudents.length === 0 ? (
          <View className="rounded-2xl border border-[#bfdbfe] bg-white p-6">
            <Text className="text-[#64748b] text-sm">
              No students available for this class.
            </Text>
          </View>
        ) : (
          filteredStudents.map((student) => {
            const status = attendance[student.uid] ?? "unmarked";
            return (
              <View
                key={student.uid}
                className="flex-row justify-between border border-[#93c5fd] rounded-xl mb-2 p-3"
              >
                <View className="flex-1 justify-center">
                  <Text className="text-[#0f172a] text-base font-semibold">
                    {student.name}
                  </Text>
                  <Text className="text-[#64748b] text-[13px] mt-1">
                    Enrollment: {student.enrollmentNumber ?? "-"}
                  </Text>
                </View>

                <View className="flex-row items-center gap-2 ml-3">
                  {isPastDate || isSubmittedForDate ? (
                    <View
                      className={`rounded-full px-3 py-2 ${
                        status === "present"
                          ? "bg-[#dcfce7]"
                          : status === "absent"
                            ? "bg-[#fee2e2]"
                            : "bg-[#e2e8f0]"
                      }`}
                    >
                      <Text
                        className={`text-[13px] font-semibold ${
                          status === "present"
                            ? "text-[#166534]"
                            : status === "absent"
                              ? "text-[#b91c1c]"
                              : "text-[#334155]"
                        }`}
                      >
                        {status === "present"
                          ? "Present"
                          : status === "absent"
                            ? "Absent"
                            : "Unmarked"}
                      </Text>
                    </View>
                  ) : (
                    <View className="flex-row rounded-full border border-[#93c5fd] bg-white p-1">
                      <Pressable
                        onPress={() => onToggleStudent(student.uid, "present")}
                        disabled={!canEdit}
                        accessibilityRole="button"
                        accessibilityLabel={`Mark ${student.name} present`}
                        className={`rounded-full px-3 py-2 ${
                          status === "present"
                            ? "bg-[#16a34a]"
                            : "bg-transparent"
                        } ${!canEdit ? "opacity-40" : ""}`}
                      >
                        <Text
                          className={`text-[13px] font-semibold ${
                            status === "present"
                              ? "text-white"
                              : "text-[#16a34a]"
                          }`}
                        >
                          Present
                        </Text>
                      </Pressable>
                      <Pressable
                        onPress={() => onToggleStudent(student.uid, "absent")}
                        disabled={!canEdit}
                        accessibilityRole="button"
                        accessibilityLabel={`Mark ${student.name} absent`}
                        className={`rounded-full px-3 py-2 ${
                          status === "absent"
                            ? "bg-[#dc2626]"
                            : "bg-transparent"
                        } ${!canEdit ? "opacity-40" : ""}`}
                      >
                        <Text
                          className={`text-[13px] font-semibold ${
                            status === "absent"
                              ? "text-white"
                              : "text-[#dc2626]"
                          }`}
                        >
                          Absent
                        </Text>
                      </Pressable>
                    </View>
                  )}
                </View>
              </View>
            );
          })
        )}
      </ScrollView>

      <View pointerEvents="box-none" className="absolute inset-0">
        <Pressable
          onPress={onConfirmSubmit}
          disabled={!canSubmit}
          className={`absolute left-5 right-5 rounded-xl py-3 ${
            !canSubmit ? "bg-[#93c5fd]" : "bg-[#0369a1]"
          }`}
          style={{ bottom: floatingBottomOffset }}
        >
          {submitLoading ? (
            <Text className="text-white text-base font-bold text-center">
              Submitting…
            </Text>
          ) : (
            <Text className="text-white text-base font-bold text-center">
              {isClassTeacher
                ? isSubmittedForDate
                  ? "Attendance Submitted"
                  : apiDate === today
                  ? "Submit Attendance"
                  : "Past date read-only"
                : "Read-only attendance"}
            </Text>
          )}
        </Pressable>
      </View>
    </View>
  );
}


