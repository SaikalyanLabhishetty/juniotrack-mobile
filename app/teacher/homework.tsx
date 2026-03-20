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

type AssignmentMode = "all" | "individual";

export default function HomeworkScreen() {
  const insets = useSafeAreaInsets();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [searchText, setSearchText] = useState("");
  const [mode, setMode] = useState<AssignmentMode>("all");
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);

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

  const assignedCount =
    mode === "all" ? STUDENTS.length : selectedStudentIds.length;

  const toggleStudent = (studentId: string) => {
    setSelectedStudentIds((prev) =>
      prev.includes(studentId)
        ? prev.filter((id) => id !== studentId)
        : [...prev, studentId],
    );
  };

  const selectAllFiltered = () => {
    setSelectedStudentIds((prev) => {
      const merged = new Set(prev);
      filteredStudents.forEach((student) => merged.add(student.id));
      return [...merged];
    });
  };

  const clearSelection = () => setSelectedStudentIds([]);

  const onAssign = () => {
    if (!title.trim()) {
      Alert.alert("Missing title", "Please enter homework title.");
      return;
    }

    if (!description.trim()) {
      Alert.alert("Missing description", "Please enter homework description.");
      return;
    }

    if (mode === "individual" && selectedStudentIds.length === 0) {
      Alert.alert("No students selected", "Select at least one student.");
      return;
    }

    Alert.alert(
      "Homework assigned",
      `Demo mode only.\nAssigned to: ${assignedCount} students\nDue date: ${dueDate.trim() || "Not set"}`,
    );
  };

  const floatingBottomOffset = insets.bottom + 12;
  const scrollBottomPadding = 124 + insets.bottom;

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
          <View className="flex-row items-center justify-between">
            <Text className="text-[#0f172a] text-[28px] font-bold">
              Homework
            </Text>
            <Pressable
              onPress={() => router.push("/teacher/past-homeworks")}
              className="flex-row items-center gap-2 px-3 py-2"
            >
              <MaterialCommunityIcons
                name="history"
                size={24}
                color="#0f766e"
              />
            </Pressable>
          </View>
          <Text className="text-[#475569] text-sm mt-2">
            Create homework and assign quickly
          </Text>
        </View>

        <View className="border border-[#93c5fd] rounded-xl p-3 mb-3">
          <Text className="text-[#334155] text-[13px] font-semibold mb-1">
            Homework Title
          </Text>
          <TextInput
            value={title}
            onChangeText={setTitle}
            placeholder="Ex: Math - Fractions Worksheet"
            placeholderTextColor="#94a3b8"
            className="border border-[#93c5fd] rounded-xl text-[#0f172a] text-sm px-3 py-2"
          />

          <Text className="text-[#334155] text-[13px] font-semibold mb-1 mt-3">
            Description
          </Text>
          <TextInput
            value={description}
            onChangeText={setDescription}
            placeholder="Add instruction for students"
            placeholderTextColor="#94a3b8"
            multiline
            className="border border-[#93c5fd] rounded-xl text-[#0f172a] text-sm px-3 py-2 min-h-[80px]"
          />

          <Text className="text-[#334155] text-[13px] font-semibold mb-1 mt-3">
            Due Date (Optional)
          </Text>
          <TextInput
            value={dueDate}
            onChangeText={setDueDate}
            placeholder="Ex: 25/03/2026"
            placeholderTextColor="#94a3b8"
            className="border border-[#93c5fd] rounded-xl text-[#0f172a] text-sm px-3 py-2"
          />
        </View>

        <View className="border border-[#93c5fd] rounded-xl p-3 mb-3">
          <Text className="text-[#0f172a] text-base font-bold mb-2">
            Assign To
          </Text>

          <View className="flex-row gap-2 mb-3">
            <Pressable
              onPress={() => setMode("all")}
              className={`flex-1 items-center rounded-full border py-2 ${
                mode === "all"
                  ? "bg-[#dbeafe] border-[#16a34a]"
                  : "border-[#93c5fd]"
              }`}
            >
              <Text
                className={`text-[13px] font-semibold ${
                  mode === "all" ? "text-[#166534]" : "text-[#475569]"
                }`}
              >
                All Students
              </Text>
            </Pressable>
            <Pressable
              onPress={() => setMode("individual")}
              className={`flex-1 items-center rounded-full border py-2 ${
                mode === "individual"
                  ? "bg-[#dbeafe] border-[#16a34a]"
                  : "border-[#93c5fd]"
              }`}
            >
              <Text
                className={`text-[13px] font-semibold ${
                  mode === "individual" ? "text-[#166534]" : "text-[#475569]"
                }`}
              >
                Individual
              </Text>
            </Pressable>
          </View>

          {mode === "all" ? (
            <View className="bg-white border border-[#bbf7d0] rounded-xl p-3">
              <Text className="text-[#166534] text-[14px] font-medium">
                {`This will assign homework to all ${STUDENTS.length} students.`}
              </Text>
            </View>
          ) : (
            <>
              <View className="flex-row items-center bg-white border border-[#93c5fd] rounded-xl mb-3 px-3">
                <MaterialCommunityIcons
                  name="magnify"
                  size={20}
                  color="#64748b"
                />
                <TextInput
                  value={searchText}
                  onChangeText={setSearchText}
                  placeholder="Search by name or roll no"
                  placeholderTextColor="#94a3b8"
                  className="text-[#0f172a] flex-1 text-sm py-2"
                />
              </View>

              <View className="flex-row justify-between mb-2">
                <Pressable onPress={selectAllFiltered}>
                  <Text className="text-[#0ea5e9] text-[13px] font-semibold">
                    Select all shown
                  </Text>
                </Pressable>
                <Pressable onPress={clearSelection}>
                  <Text className="text-[#0ea5e9] text-[13px] font-semibold">
                    Clear
                  </Text>
                </Pressable>
              </View>

              {filteredStudents.map((student) => {
                const selected = selectedStudentIds.includes(student.id);

                return (
                  <Pressable
                    key={student.id}
                    onPress={() => toggleStudent(student.id)}
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
                      name={
                        selected
                          ? "checkbox-marked-circle"
                          : "checkbox-blank-circle-outline"
                      }
                      size={24}
                      color={selected ? "#16a34a" : "#94a3b8"}
                    />
                  </Pressable>
                );
              })}

              {filteredStudents.length === 0 ? (
                <View className="items-center py-3">
                  <Text className="text-[#64748b] text-sm">{`No students found for "${searchText}".`}</Text>
                </View>
              ) : null}
            </>
          )}
        </View>

        <View className="items-center bg-[#f8fafc] border border-[#93c5fd] rounded-xl p-3">
          <Text className="text-[#64748b] text-[13px] mb-1">
            Ready to assign
          </Text>
          <Text className="text-[#0f172a] text-[20px] font-bold">{`${assignedCount} students`}</Text>
        </View>
      </ScrollView>

      <View pointerEvents="box-none" className="absolute inset-0">
        <Pressable
          onPress={onAssign}
          className="absolute left-5 right-5 rounded-xl bg-[#0f766e] py-3"
          style={{ bottom: floatingBottomOffset }}
        >
          <Text className="text-white text-base font-bold text-center">
            Assign Homework
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
