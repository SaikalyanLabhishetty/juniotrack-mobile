export type NotificationData = {
  type?: string;
  attendanceUid?: string;
  classId?: string;
  date?: string;
  organizationId?: string;
  schoolId?: string;
  status?: string;
  studentName?: string;
  studentUid?: string;
};

export type AttendanceNotificationData = NotificationData & {
  type: "attendance";
};

export type AttendanceNavigationFallback = {
  studentUid?: string;
  studentName?: string;
  classId?: string;
  date?: string;
};

export type AttendanceOpenHandler = (
  data: AttendanceNotificationData,
) => void;

const NOTIFICATION_KEYS = [
  "type",
  "attendanceUid",
  "classId",
  "date",
  "organizationId",
  "schoolId",
  "status",
  "studentName",
  "studentUid",
] as const;

const toTrimmedString = (value: unknown) => {
  if (typeof value !== "string") {
    return undefined;
  }

  const trimmedValue = value.trim();
  return trimmedValue.length > 0 ? trimmedValue : undefined;
};

export const normalizeNotificationData = (value: unknown): NotificationData => {
  if (!value || typeof value !== "object") {
    return {};
  }

  const data = value as Record<string, unknown>;
  const normalizedData: NotificationData = {};

  for (const key of NOTIFICATION_KEYS) {
    normalizedData[key] = toTrimmedString(data[key]);
  }

  return normalizedData;
};

export const isAttendanceNotificationData = (
  data: NotificationData,
): data is AttendanceNotificationData => data.type?.toLowerCase() === "attendance";

export const getAttendanceNavigationParams = (
  data: AttendanceNotificationData,
  fallback?: AttendanceNavigationFallback,
) => ({
  studentUid: data.studentUid ?? fallback?.studentUid ?? "",
  studentName: data.studentName ?? fallback?.studentName ?? "",
  classId: data.classId ?? fallback?.classId ?? "",
  date: data.date ?? fallback?.date ?? "",
});
