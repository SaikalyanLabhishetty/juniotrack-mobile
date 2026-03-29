import { router } from "expo-router";
import { useMemo } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { STUDENTS } from "@/data/students";

type DailyAttendance = {
  id: string;
  date: string;
  status: "Present" | "Absent";
};

const attendanceHistory: DailyAttendance[] = [
  { id: "a1", date: "13 Mar 2026", status: "Present" },
  { id: "a2", date: "12 Mar 2026", status: "Present" },
  { id: "a3", date: "11 Mar 2026", status: "Absent" },
  { id: "a4", date: "10 Mar 2026", status: "Present" },
  { id: "a5", date: "09 Mar 2026", status: "Present" },
  { id: "a6", date: "08 Mar 2026", status: "Present" },
  { id: "a7", date: "07 Mar 2026", status: "Absent" },
];

export default function ParentAttendanceScreen() {
  const insets = useSafeAreaInsets();
  const child = STUDENTS[0];

  const summary = useMemo(() => {
    const present = attendanceHistory.filter(
      (item) => item.status === "Present",
    ).length;
    const total = attendanceHistory.length;
    const percent = total > 0 ? Math.round((present / total) * 100) : 0;
    return {
      present,
      absent: total - present,
      percent,
    };
  }, []);

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
          <Text className="text-[#475569] text-sm mt-1.5">{`${child.name} • Class 5-A`}</Text>
        </View>

        <View className="bg-white border border-[#93c5fd] rounded-xl p-3 mb-4">
          <Text className="text-[#0369a1] text-sm font-bold mb-2">
            This Week Summary
          </Text>
          <View className="flex-row justify-between">
            <Text className="text-[#166534] text-sm font-semibold">{`Present: ${summary.present}`}</Text>
            <Text className="text-[#166534] text-sm font-semibold">{`Absent: ${summary.absent}`}</Text>
            <Text className="text-[#166534] text-sm font-semibold">{`${summary.percent}%`}</Text>
          </View>
        </View>

        <Text className="text-[#0f172a] text-base font-bold mb-2">
          Daily Status
        </Text>

        {attendanceHistory.map((item) => {
          const isPresent = item.status === "Present";

          return (
            <View
              key={item.id}
              className="flex-row items-center justify-between border border-[#e2e8f0] rounded-xl p-3 mb-2"
            >
              <Text className="text-[#1e293b] text-sm font-semibold">
                {item.date}
              </Text>
              <View
                className={`rounded-full px-2.5 py-1 ${
                  isPresent ? "bg-[#16a34a]" : "bg-[#dc2626]"
                }`}
              >
                <Text className="text-white text-xs font-bold">
                  {item.status}
                </Text>
              </View>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}


