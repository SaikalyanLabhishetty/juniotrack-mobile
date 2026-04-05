import { router } from "expo-router";
import { useCallback, useEffect } from "react";

import { useAuth } from "@/app/_auth";
import { API_BASE_URL } from "@/services/api";
import {
    registerInitialNotification,
    registerNotificationListeners,
} from "@/services/notifications/listeners";
import { syncPushTokenAfterLogin } from "@/services/notifications/pushToken";
import {
    AttendanceNotificationData,
    getAttendanceNavigationParams,
} from "@/services/notifications/types";

export function usePushNotifications() {
  const { token, user, isLoading } = useAuth();

  const openAttendance = useCallback(
    (data: AttendanceNotificationData) => {
      if (user?.role !== "parent") {
        return;
      }

      router.push(
        {
          pathname: "/parent/attendance",
          params: getAttendanceNavigationParams(data, {
            studentUid: user.studentUid,
            studentName: user.studentName,
            classId: user.classId,
          }),
        } as never,
      );
    },
    [user],
  );

  useEffect(() => {
    if (isLoading || user?.role !== "parent") {
      return;
    }

    const unsubscribe = registerNotificationListeners(openAttendance);
    void registerInitialNotification(openAttendance);

    return unsubscribe;
  }, [isLoading, openAttendance, user?.role]);

  useEffect(() => {
    if (isLoading || !token || user?.role !== "parent") {
      return;
    }

    void syncPushTokenAfterLogin(API_BASE_URL, token).catch((error: unknown) => {
      if (__DEV__) {
        console.warn("Push token sync failed.", error);
      }
    });
  }, [isLoading, token, user?.role]);
}
