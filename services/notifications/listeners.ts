import { AttendanceOpenHandler } from "./types";

export const registerNotificationListeners = (
  _onAttendanceOpen: AttendanceOpenHandler,
) => () => undefined;

export const registerInitialNotification = async (
  _onAttendanceOpen: AttendanceOpenHandler,
) => undefined;
