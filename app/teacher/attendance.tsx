import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useMemo, useState } from "react";
import {
    Alert,
    Pressable,
    SafeAreaView,
    ScrollView,
    Text,
    TextInput,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { STUDENTS } from "@/data/students";

type AttendanceStatus = "present" | "absent";

const initialAttendance = STUDENTS.reduce<Record<string, AttendanceStatus>>(
  (acc, student) => {
    acc[student.id] = "present";
    return acc;
  },
  {},
);

export default function AttendanceScreen() {
  const [attendance, setAttendance] =
    useState<Record<string, AttendanceStatus>>(initialAttendance);
  const [searchText, setSearchText] = useState("");
  const insets = useSafeAreaInsets();

  const summary = useMemo(() => {
    const values = Object.values(attendance);
    const present = values.filter((status) => status === "present").length;
    return {
      present,
      absent: values.length - present,
    };
  }, [attendance]);

  const today = new Date().toLocaleDateString();

  const onSave = () => {
    Alert.alert(
      "Attendance saved",
      `Demo mode only.\nPresent: ${summary.present}\nAbsent: ${summary.absent}`,
    );
  };

  const floatingBottomOffset = insets.bottom + 12;
  const scrollBottomPadding = 120 + insets.bottom;
  const normalizedSearch = searchText.trim().toLowerCase();

  const filteredStudents = useMemo(() => {
    if (!normalizedSearch) {
      return STUDENTS;
    }

    return STUDENTS.filter(
      (student) =>
        student.name.toLowerCase().includes(normalizedSearch) ||
        student.rollNo.includes(normalizedSearch),
    );
  }, [normalizedSearch]);

  return (
    <SafeAreaView className="bg-[#eff6ff] flex-1">
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
            Class 5-A • {today}
          </Text>
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

        {filteredStudents.map((student) => {
          const status = attendance[student.id];

          return (
            <View
              key={student.id}
              className="flex-row justify-between border border-[#93c5fd] rounded-xl mb-2 p-3"
            >
              <View className="flex-1 justify-center">
                <Text className="text-[#0f172a] text-base font-semibold">
                  {student.name}
                </Text>
                <Text className="text-[#64748b] text-[13px] mt-1">
                  Roll No: {student.rollNo}
                </Text>
              </View>

              <View className="flex-row items-center gap-2 ml-3">
                <Pressable
                  onPress={() =>
                    setAttendance((prev) => ({
                      ...prev,
                      [student.id]: "present",
                    }))
                  }
                  accessibilityRole="button"
                  accessibilityLabel={`Mark ${student.name} present`}
                  className={`items-center rounded-full h-10 w-10 justify-center border ${
                    status === "present"
                      ? "bg-[#16a34a] border-[#16a34a]"
                      : "bg-white border-[#93c5fd]"
                  }`}
                >
                  <MaterialCommunityIcons
                    name="check-circle"
                    size={20}
                    color={status === "present" ? "#fff" : "#16a34a"}
                  />
                </Pressable>

                <Pressable
                  onPress={() =>
                    setAttendance((prev) => ({
                      ...prev,
                      [student.id]: "absent",
                    }))
                  }
                  accessibilityRole="button"
                  accessibilityLabel={`Mark ${student.name} absent`}
                  className={`items-center rounded-full h-10 w-10 justify-center border ${
                    status === "absent"
                      ? "bg-[#dc2626] border-[#dc2626]"
                      : "bg-white border-[#93c5fd]"
                  }`}
                >
                  <MaterialCommunityIcons
                    name="close-circle"
                    size={20}
                    color={status === "absent" ? "#fff" : "#dc2626"}
                  />
                </Pressable>
              </View>
            </View>
          );
        })}

        {filteredStudents.length === 0 ? (
          <View className="items-center py-4">
            <Text className="text-[#64748b] text-sm text-center">
              {`No students found for "${searchText}".`}
            </Text>
          </View>
        ) : null}
      </ScrollView>

      <View pointerEvents="box-none" className="absolute inset-0">
        <Pressable
          onPress={onSave}
          className="absolute left-5 right-5 rounded-xl bg-[#0f766e] py-3"
          style={{ bottom: floatingBottomOffset }}
        >
          <Text className="text-white text-base font-bold text-center">
            Save Attendance
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
