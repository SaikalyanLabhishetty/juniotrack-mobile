import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { API_BASE_URL } from "@/services/api";
import { useAuth } from "../_auth";

type AttendanceRouteParams = {
  studentUid?: string;
  studentName?: string;
  classId?: string;
  date?: string;
};

type AttendanceSummary = {
  workingDays: number;
  present: number;
  absent: number;
  late: number;
  unmarked: number;
  percentage: number;
};

type AttendanceDay = {
  date: string;
  status: string;
};

type AttendanceApiResponse = {
  studentUid?: string;
  studentName?: string;
  classId?: string;
  month?: string;
  summary?: Partial<AttendanceSummary> | null;
  days?: Partial<AttendanceDay>[] | null;
  message?: string;
};

const ATTENDANCE_URL = `${API_BASE_URL}/api/parent/attendance`;

const MONTH_OPTIONS = [
  { value: 1, label: "January" },
  { value: 2, label: "February" },
  { value: 3, label: "March" },
  { value: 4, label: "April" },
  { value: 5, label: "May" },
  { value: 6, label: "June" },
  { value: 7, label: "July" },
  { value: 8, label: "August" },
  { value: 9, label: "September" },
  { value: 10, label: "October" },
  { value: 11, label: "November" },
  { value: 12, label: "December" },
] as const;

const getStringValue = (...values: unknown[]) => {
  const match = values.find(
    (value) => typeof value === "string" && value.trim().length > 0,
  );
  return typeof match === "string" ? match.trim() : undefined;
};

const getNumberValue = (value: unknown, fallback = 0) => {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string" && value.trim().length > 0) {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }

  return fallback;
};

const formatDate = (value: string) => {
  const parsedDate = new Date(`${value}T00:00:00`);
  if (Number.isNaN(parsedDate.getTime())) {
    return value;
  }

  return parsedDate.toLocaleDateString("en-US", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const getStatusMeta = (statusValue: string) => {
  const normalizedStatus = statusValue.toLowerCase();

  if (normalizedStatus === "present") {
    return {
      label: "Present",
      badgeClassName: "bg-[#16a34a]",
    };
  }

  if (normalizedStatus === "absent") {
    return {
      label: "Absent",
      badgeClassName: "bg-[#dc2626]",
    };
  }

  if (normalizedStatus === "late") {
    return {
      label: "Late",
      badgeClassName: "bg-[#f59e0b]",
    };
  }

  return {
    label: "Unmarked",
    badgeClassName: "bg-[#64748b]",
  };
};

const getMonthSelectionFromDate = (value?: string) => {
  if (!value) {
    return null;
  }

  const parsedDate = new Date(`${value}T00:00:00`);
  if (Number.isNaN(parsedDate.getTime())) {
    return null;
  }

  return {
    year: parsedDate.getFullYear(),
    month: parsedDate.getMonth() + 1,
  };
};

export default function ParentAttendanceScreen() {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<AttendanceRouteParams>();
  const { token, user, isLoading: authLoading } = useAuth();
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;
  const initialMonthSelection = getMonthSelectionFromDate(getStringValue(params.date));

  const [selectedYear, setSelectedYear] = useState(
    initialMonthSelection?.year ?? currentYear,
  );
  const [selectedMonth, setSelectedMonth] = useState(
    initialMonthSelection?.month ?? currentMonth,
  );
  const [isYearDropdownOpen, setIsYearDropdownOpen] = useState(false);
  const [isMonthDropdownOpen, setIsMonthDropdownOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [attendanceData, setAttendanceData] = useState<AttendanceApiResponse | null>(
    null,
  );

  const parentUser = user as
    | (typeof user & {
        student_uid?: string;
        studentuid?: string;
        student_name?: string;
        studentname?: string;
        class_id?: string;
      })
    | null;

  const studentUid =
    getStringValue(
      params.studentUid,
      user?.studentUid,
      parentUser?.student_uid,
      parentUser?.studentuid,
    ) ?? "";

  const fallbackStudentName = getStringValue(
    params.studentName,
    user?.studentName,
    parentUser?.student_name,
    parentUser?.studentname,
  );

  const yearOptions = useMemo(
    () => Array.from({ length: 6 }, (_, index) => currentYear - index),
    [currentYear],
  );

  const monthOptions = useMemo(() => {
    return MONTH_OPTIONS.filter(
      (monthOption) =>
        selectedYear < currentYear || monthOption.value <= currentMonth,
    );
  }, [selectedYear, currentYear, currentMonth]);

  useEffect(() => {
    if (selectedYear === currentYear && selectedMonth > currentMonth) {
      setSelectedMonth(currentMonth);
    }
  }, [selectedYear, selectedMonth, currentYear, currentMonth]);

  useEffect(() => {
    const nextMonthSelection = getMonthSelectionFromDate(getStringValue(params.date));

    if (!nextMonthSelection) {
      return;
    }

    setSelectedYear(nextMonthSelection.year);
    setSelectedMonth(nextMonthSelection.month);
  }, [params.date]);

  useEffect(() => {
    if (!authLoading && !token) {
      router.replace("/login");
    }
  }, [authLoading, token]);

  const monthParam = `${selectedYear}-${String(selectedMonth).padStart(2, "0")}`;

  useEffect(() => {
    const loadAttendance = async () => {
      if (!token) {
        return;
      }

      if (!studentUid) {
        setAttendanceData(null);
        setError("Student UID is missing. Please login again.");
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `${ATTENDANCE_URL}?studentUid=${encodeURIComponent(studentUid)}&month=${encodeURIComponent(monthParam)}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: "application/json",
              Cookie: `access_token=${token}`,
            },
          },
        );

        const contentType = response.headers.get("content-type") ?? "";

        if (contentType.includes("application/json")) {
          const payload = (await response.json()) as unknown;
          const payloadObject =
            payload && typeof payload === "object"
              ? (payload as { data?: unknown; message?: unknown })
              : null;

          const normalizedPayload =
            payloadObject?.data && typeof payloadObject.data === "object"
              ? (payloadObject.data as AttendanceApiResponse)
              : ((payloadObject ?? {}) as AttendanceApiResponse);

          if (!response.ok) {
            throw new Error(
              getStringValue(
                payloadObject?.message,
                (normalizedPayload as { message?: unknown })?.message,
              ) ?? "Failed to load attendance data.",
            );
          }

          setAttendanceData(normalizedPayload);
        } else {
          const text = await response.text();
          throw new Error(
            `Expected JSON response but got ${response.status} ${response.statusText}: ${text}`,
          );
        }
      } catch (fetchError) {
        setAttendanceData(null);
        setError(
          fetchError instanceof Error
            ? fetchError.message
            : "Unable to load attendance data.",
        );
      } finally {
        setLoading(false);
      }
    };

    loadAttendance();
  }, [token, studentUid, monthParam]);

  const selectedMonthLabel =
    MONTH_OPTIONS.find((item) => item.value === selectedMonth)?.label ??
    "Select month";

  const summaryRaw =
    attendanceData?.summary && typeof attendanceData.summary === "object"
      ? attendanceData.summary
      : {};

  const summary = {
    workingDays: getNumberValue(summaryRaw.workingDays),
    present: getNumberValue(summaryRaw.present),
    absent: getNumberValue(summaryRaw.absent),
    late: getNumberValue(summaryRaw.late),
    unmarked: getNumberValue(summaryRaw.unmarked),
    percentage: getNumberValue(summaryRaw.percentage),
  };

  const dailyRecords = useMemo(() => {
    if (!Array.isArray(attendanceData?.days)) {
      return [];
    }

    return attendanceData.days.map((item, index) => {
      const date = getStringValue(item?.date) ?? `Day ${index + 1}`;
      const status = getStringValue(item?.status)?.toLowerCase() ?? "unmarked";

      return {
        key: `${date}-${index}`,
        date,
        status,
      };
    });
  }, [attendanceData?.days]);

  const infoRows = [
    {
      label: "Student Name",
      value: getStringValue(attendanceData?.studentName, fallbackStudentName) ?? "NA",
    },
    {
      label: "Month",
      value: getStringValue(attendanceData?.month, monthParam) ?? monthParam,
    },
  ];

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
            <Text className="text-[#0f766e] text-[15px] font-semibold">
              Back
            </Text>
          </Pressable>
          <Text className="text-[#0f172a] text-[28px] font-bold">
            Attendance
          </Text>
          <Text className="text-[#475569] text-sm mt-1.5">
            Track monthly attendance with year and month filters
          </Text>
        </View>

        <View className="bg-white border border-[#93c5fd] rounded-xl p-3 mb-4">
          <Text className="text-[#0369a1] text-sm font-bold mb-2">
            Filters
          </Text>

          <Text className="text-[#334155] text-xs mb-1">Year</Text>
          <Pressable
            onPress={() => {
              setIsYearDropdownOpen((prev) => !prev);
              setIsMonthDropdownOpen(false);
            }}
            className="h-11 rounded-xl border border-[#cbd5e1] bg-[#f8fafc] px-3 flex-row items-center justify-between"
          >
            <Text className="text-[#0f172a] text-sm font-semibold">
              {selectedYear}
            </Text>
            <MaterialCommunityIcons
              name={isYearDropdownOpen ? "chevron-up" : "chevron-down"}
              size={20}
              color="#475569"
            />
          </Pressable>

          {isYearDropdownOpen ? (
            <View className="mt-2 rounded-xl border border-[#dbeafe] bg-[#f8fbff] overflow-hidden">
              {yearOptions.map((year) => (
                <Pressable
                  key={year}
                  onPress={() => {
                    setSelectedYear(year);
                    setIsYearDropdownOpen(false);
                  }}
                  className={`px-3 py-2.5 ${year === selectedYear ? "bg-[#dbeafe]" : "bg-transparent"}`}
                >
                  <Text
                    className={`text-sm ${year === selectedYear ? "text-[#1d4ed8] font-semibold" : "text-[#334155]"}`}
                  >
                    {year}
                  </Text>
                </Pressable>
              ))}
            </View>
          ) : null}

          <Text className="text-[#334155] text-xs mt-3 mb-1">Month</Text>
          <Pressable
            onPress={() => {
              setIsMonthDropdownOpen((prev) => !prev);
              setIsYearDropdownOpen(false);
            }}
            className="h-11 rounded-xl border border-[#cbd5e1] bg-[#f8fafc] px-3 flex-row items-center justify-between"
          >
            <Text className="text-[#0f172a] text-sm font-semibold">
              {selectedMonthLabel}
            </Text>
            <MaterialCommunityIcons
              name={isMonthDropdownOpen ? "chevron-up" : "chevron-down"}
              size={20}
              color="#475569"
            />
          </Pressable>

          {isMonthDropdownOpen ? (
            <View className="mt-2 rounded-xl border border-[#dbeafe] bg-[#f8fbff] overflow-hidden">
              {monthOptions.map((monthOption) => (
                <Pressable
                  key={monthOption.value}
                  onPress={() => {
                    setSelectedMonth(monthOption.value);
                    setIsMonthDropdownOpen(false);
                  }}
                  className={`px-3 py-2.5 ${
                    monthOption.value === selectedMonth
                      ? "bg-[#dbeafe]"
                      : "bg-transparent"
                  }`}
                >
                  <Text
                    className={`text-sm ${
                      monthOption.value === selectedMonth
                        ? "text-[#1d4ed8] font-semibold"
                        : "text-[#334155]"
                    }`}
                  >
                    {monthOption.label}
                  </Text>
                </Pressable>
              ))}
            </View>
          ) : null}
        </View>

        <View className="bg-white border border-[#93c5fd] rounded-xl p-3 mb-4">
          <Text className="text-[#0369a1] text-sm font-bold mb-2">
            Student Attendance Info
          </Text>
          {infoRows.map((row, index) => (
            <View
              key={row.label}
              className={`${index === 0 ? "" : "mt-2"} flex-row items-center justify-between`}
            >
              <Text className="text-[#475569] text-[13px]">{row.label}</Text>
              <Text className="text-[#0f172a] text-[13px] font-semibold">
                {row.value}
              </Text>
            </View>
          ))}
        </View>

        {loading ? (
          <View className="rounded-2xl border border-[#bfdbfe] bg-white p-6 items-center justify-center mb-4">
            <ActivityIndicator size="large" color="#0ea5e9" />
            <Text className="mt-3 text-[#0f172a]">Loading attendance…</Text>
          </View>
        ) : null}

        {error ? (
          <View className="rounded-2xl border border-[#fecaca] bg-[#fff1f2] p-4 mb-4">
            <Text className="text-sm font-semibold text-[#b91c1c]">
              Unable to load attendance
            </Text>
            <Text className="text-xs text-[#991b1b] mt-1">{error}</Text>
          </View>
        ) : null}

        <View className="bg-white border border-[#93c5fd] rounded-xl p-3 mb-4">
          <Text className="text-[#0369a1] text-sm font-bold mb-2">Summary</Text>
          <View className="flex-row flex-wrap justify-between">
            <View className="w-[48%] mb-2 rounded-lg bg-[#f8fafc] p-2.5 border border-[#e2e8f0]">
              <Text className="text-[#64748b] text-xs">Working Days</Text>
              <Text className="text-[#0f172a] text-base font-bold">{summary.workingDays}</Text>
            </View>
            <View className="w-[48%] mb-2 rounded-lg bg-[#f8fafc] p-2.5 border border-[#e2e8f0]">
              <Text className="text-[#64748b] text-xs">Present</Text>
              <Text className="text-[#166534] text-base font-bold">{summary.present}</Text>
            </View>
            <View className="w-[48%] mb-2 rounded-lg bg-[#f8fafc] p-2.5 border border-[#e2e8f0]">
              <Text className="text-[#64748b] text-xs">Absent</Text>
              <Text className="text-[#b91c1c] text-base font-bold">{summary.absent}</Text>
            </View>
            <View className="w-[48%] mb-2 rounded-lg bg-[#f8fafc] p-2.5 border border-[#e2e8f0]">
              <Text className="text-[#64748b] text-xs">Late</Text>
              <Text className="text-[#b45309] text-base font-bold">{summary.late}</Text>
            </View>
            <View className="w-[48%] mb-2 rounded-lg bg-[#f8fafc] p-2.5 border border-[#e2e8f0]">
              <Text className="text-[#64748b] text-xs">Unmarked</Text>
              <Text className="text-[#334155] text-base font-bold">{summary.unmarked}</Text>
            </View>
            <View className="w-[48%] mb-2 rounded-lg bg-[#f8fafc] p-2.5 border border-[#e2e8f0]">
              <Text className="text-[#64748b] text-xs">Percentage</Text>
              <Text className="text-[#0f172a] text-base font-bold">
                {summary.percentage}%
              </Text>
            </View>
          </View>
        </View>

        <Text className="text-[#0f172a] text-base font-bold mb-2">
          Daily Status
        </Text>

        {dailyRecords.length === 0 ? (
          <View className="items-center rounded-xl border border-[#cbd5e1] bg-white p-4">
            <Text className="text-[#64748b] text-sm">
              No attendance records found for selected month.
            </Text>
          </View>
        ) : null}

        {dailyRecords.map((item) => {
          const statusMeta = getStatusMeta(item.status);

          return (
            <View
              key={item.key}
              className="flex-row items-center justify-between border border-[#e2e8f0] rounded-xl p-3 mb-2"
            >
              <Text className="text-[#1e293b] text-sm font-semibold">
                {formatDate(item.date)}
              </Text>
              <View className={`rounded-full px-2.5 py-1 ${statusMeta.badgeClassName}`}>
                <Text className="text-white text-xs font-bold">
                  {statusMeta.label}
                </Text>
              </View>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}
