import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useMemo, useState } from "react";
import {
    Alert,
    Pressable,
    ScrollView,
    Text,
    TextInput,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { STUDENTS } from "@/data/students";

const REPORT_TYPES = [
  "Slip Test",
  "Unit Test",
  "Quarterly Test",
  "Half Yearly Test",
  "Pre Finals",
  "Preparation",
  "Other",
] as const;

const SUBJECTS = [
  "Math",
  "Science",
  "English",
  "Social",
  "Hindi",
  "Computer",
  "Other",
] as const;

const toNumber = (value: string) => {
  if (!value.trim()) {
    return null;
  }
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

export default function ReportsScreen() {
  const insets = useSafeAreaInsets();

  const [searchText, setSearchText] = useState("");
  const [selectedStudentId, setSelectedStudentId] = useState<string>(
    STUDENTS[0]?.id ?? "",
  );
  const [reportType, setReportType] =
    useState<(typeof REPORT_TYPES)[number]>("Slip Test");
  const [subject, setSubject] = useState<(typeof SUBJECTS)[number]>("Math");
  const [totalScore, setTotalScore] = useState("");
  const [scoreEarned, setScoreEarned] = useState("");
  const [highestMark, setHighestMark] = useState("");
  const [passMark, setPassMark] = useState("");

  const selectedStudent = useMemo(
    () => STUDENTS.find((student) => student.id === selectedStudentId),
    [selectedStudentId],
  );

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

  const total = toNumber(totalScore);
  const earned = toNumber(scoreEarned);
  const highest = toNumber(highestMark);
  const pass = toNumber(passMark);
  const hasResult = total !== null && earned !== null && pass !== null;
  const result = hasResult ? (earned >= pass ? "Pass" : "Fail") : "Pending";

  const onSaveReport = () => {
    if (!selectedStudent) {
      Alert.alert("Select student", "Please choose a student for this report.");
      return;
    }

    if (
      total === null ||
      earned === null ||
      highest === null ||
      pass === null
    ) {
      Alert.alert(
        "Missing marks",
        "Please enter total score, earned score, highest mark, and pass mark.",
      );
      return;
    }

    if (earned > total) {
      Alert.alert(
        "Invalid score",
        "Score earned cannot be greater than total score.",
      );
      return;
    }

    if (highest > total) {
      Alert.alert(
        "Invalid highest mark",
        "Highest mark cannot be greater than total score.",
      );
      return;
    }

    if (pass > total) {
      Alert.alert(
        "Invalid pass mark",
        "Pass mark cannot be greater than total score.",
      );
      return;
    }

    Alert.alert(
      "Report saved",
      `Demo mode only.\nStudent: ${selectedStudent.name}\nTest: ${reportType}\nSubject: ${subject}\nResult: ${result}`,
    );
  };

  const floatingBottomOffset = insets.bottom + 12;
  const scrollBottomPadding = 124 + insets.bottom;

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
          <Text className="text-[#0f172a] text-[28px] font-bold">Reports</Text>
          <Text className="text-[#475569] text-sm mt-1.5">
            Add test reports quickly for each student
          </Text>
        </View>

        <View className="border border-[#93c5fd] rounded-xl p-3 mb-3">
          <Text className="text-[#0f172a] text-base font-bold mb-2">
            Select Student
          </Text>
          <View className="flex-row items-center bg-white border border-[#93c5fd] rounded-xl mb-3 px-3">
            <MaterialCommunityIcons name="magnify" size={20} color="#64748b" />
            <TextInput
              value={searchText}
              onChangeText={setSearchText}
              placeholder="Search by name or roll no"
              placeholderTextColor="#94a3b8"
              className="text-[#0f172a] flex-1 text-sm py-2"
            />
          </View>

          {filteredStudents.map((student) => {
            const selected = selectedStudentId === student.id;

            return (
              <Pressable
                key={student.id}
                onPress={() => setSelectedStudentId(student.id)}
                className={`flex-row items-center justify-between border rounded-xl p-3 mb-2 ${
                  selected
                    ? "bg-white border-[#86efac]"
                    : "border-[#93c5fd]"
                }`}
              >
                <View>
                  <Text className="text-[#0f172a] text-[15px] font-semibold">
                    {student.name}
                  </Text>
                  <Text className="text-[#64748b] text-[13px] mt-1">{`Roll No: ${student.rollNo}`}</Text>
                </View>
                <MaterialCommunityIcons
                  name={selected ? "radiobox-marked" : "radiobox-blank"}
                  size={22}
                  color={selected ? "#16a34a" : "#94a3b8"}
                />
              </Pressable>
            );
          })}
        </View>

        <View className="border border-[#93c5fd] rounded-xl p-3 mb-3">
          <Text className="text-[#0f172a] text-base font-bold mb-2">
            Report Details
          </Text>
          <Text className="text-[#334155] text-[13px] font-semibold mb-2">
            Test Type
          </Text>
          <View className="flex-row flex-wrap gap-2 mb-3">
            {REPORT_TYPES.map((type) => {
              const isActive = reportType === type;
              return (
                <Pressable
                  key={type}
                  onPress={() => setReportType(type)}
                  className={`rounded-full border px-3 py-2 ${
                    isActive
                      ? "bg-[#dbeafe] border-[#16a34a]"
                      : "border-[#93c5fd]"
                  }`}
                >
                  <Text
                    className={`text-[12px] font-semibold ${
                      isActive ? "text-[#166534]" : "text-[#475569]"
                    }`}
                  >
                    {type}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <Text className="text-[#334155] text-[13px] font-semibold mb-2">
            Subject
          </Text>
          <View className="flex-row flex-wrap gap-2 mb-3">
            {SUBJECTS.map((item) => {
              const isActive = subject === item;
              return (
                <Pressable
                  key={item}
                  onPress={() => setSubject(item)}
                  className={`rounded-full border px-3 py-2 ${
                    isActive
                      ? "bg-[#dbeafe] border-[#16a34a]"
                      : "border-[#93c5fd]"
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

          <View className="flex-row gap-2 mb-3">
            <View className="flex-1">
              <Text className="text-[#334155] text-[13px] font-semibold mb-1">
                Total Score
              </Text>
              <TextInput
                value={totalScore}
                onChangeText={setTotalScore}
                keyboardType="numeric"
                placeholder="100"
                placeholderTextColor="#94a3b8"
                className="border border-[#93c5fd] rounded-xl text-[#0f172a] text-sm px-3 py-2"
              />
            </View>
            <View className="flex-1">
              <Text className="text-[#334155] text-[13px] font-semibold mb-1">
                Score Earned
              </Text>
              <TextInput
                value={scoreEarned}
                onChangeText={setScoreEarned}
                keyboardType="numeric"
                placeholder="78"
                placeholderTextColor="#94a3b8"
                className="border border-[#93c5fd] rounded-xl text-[#0f172a] text-sm px-3 py-2"
              />
            </View>
          </View>

          <View className="flex-row gap-2 mb-3">
            <View className="flex-1">
              <Text className="text-[#334155] text-[13px] font-semibold mb-1">
                Highest Mark
              </Text>
              <TextInput
                value={highestMark}
                onChangeText={setHighestMark}
                keyboardType="numeric"
                placeholder="95"
                placeholderTextColor="#94a3b8"
                className="border border-[#93c5fd] rounded-xl text-[#0f172a] text-sm px-3 py-2"
              />
            </View>
            <View className="flex-1">
              <Text className="text-[#334155] text-[13px] font-semibold mb-1">
                Pass Mark
              </Text>
              <TextInput
                value={passMark}
                onChangeText={setPassMark}
                keyboardType="numeric"
                placeholder="35"
                placeholderTextColor="#94a3b8"
                className="border border-[#93c5fd] rounded-xl text-[#0f172a] text-sm px-3 py-2"
              />
            </View>
          </View>
        </View>

        <View className="items-center bg-[#f8fafc] border border-[#93c5fd] rounded-xl p-3">
          <Text className="text-[#334155] text-[14px] mb-1">
            {selectedStudent
              ? `Student: ${selectedStudent.name}`
              : "Student not selected"}
          </Text>
          <Text
            className={`text-[18px] font-bold ${
              result === "Pass" ? "text-[#16a34a]" : "text-[#dc2626]"
            }`}
          >
            {`Result: ${result}`}
          </Text>
          <Text className="text-[#475569] text-[13px] mt-1">
            {`Score: ${earned ?? "-"} / ${total ?? "-"} • Highest: ${highest ?? "-"}`}
          </Text>
        </View>
      </ScrollView>

      <View pointerEvents="box-none" className="absolute inset-0">
        <Pressable
          onPress={onSaveReport}
          className="absolute left-5 right-5 rounded-xl bg-[#0f766e] py-3"
          style={{ bottom: floatingBottomOffset }}
        >
          <Text className="text-white text-base font-bold text-center">
            Save Report
          </Text>
        </Pressable>
      </View>
    </View>
  );
}


