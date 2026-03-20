import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useMemo, useState } from "react";
import {
    Pressable,
    SafeAreaView,
    ScrollView,
    Text,
    TextInput,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type HomeworkStatus = "Pending" | "Completed";
type HomeworkItem = {
  id: string;
  title: string;
  subject: string;
  dueDate: string;
  status: HomeworkStatus;
  note: string;
};

const homeworkList: HomeworkItem[] = [
  {
    id: "h1",
    title: "Fractions Worksheet",
    subject: "Math",
    dueDate: "15 Mar 2026",
    status: "Pending",
    note: "Complete Q1 to Q10 in notebook.",
  },
  {
    id: "h2",
    title: "Plant Cell Diagram",
    subject: "Science",
    dueDate: "14 Mar 2026",
    status: "Pending",
    note: "Draw and label all parts neatly.",
  },
  {
    id: "h3",
    title: "Essay: My School",
    subject: "English",
    dueDate: "12 Mar 2026",
    status: "Completed",
    note: "250 words minimum.",
  },
  {
    id: "h4",
    title: "Map Marking",
    subject: "Social",
    dueDate: "10 Mar 2026",
    status: "Completed",
    note: "Mark 10 important rivers.",
  },
];

type FilterMode = "all" | "pending" | "completed";

export default function ParentHomeworkScreen() {
  const insets = useSafeAreaInsets();
  const [searchText, setSearchText] = useState("");
  const [filter, setFilter] = useState<FilterMode>("all");

  const normalizedSearch = searchText.trim().toLowerCase();
  const filteredHomework = useMemo(() => {
    return homeworkList.filter((item) => {
      const matchesFilter =
        filter === "all" ||
        (filter === "pending" && item.status === "Pending") ||
        (filter === "completed" && item.status === "Completed");

      const matchesSearch =
        item.title.toLowerCase().includes(normalizedSearch) ||
        item.subject.toLowerCase().includes(normalizedSearch);

      return matchesFilter && matchesSearch;
    });
  }, [filter, normalizedSearch]);

  return (
    <SafeAreaView className="bg-[#eff6ff] flex-1">
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
          <Text className="text-[#0f172a] text-[28px] font-bold">Homework</Text>
          <Text className="text-[#475569] text-sm mt-1.5">
            Track pending and completed homework
          </Text>
        </View>

        <View className="flex-row items-center bg-white border border-[#cbd5e1] rounded-xl mb-3 px-3">
          <MaterialCommunityIcons name="magnify" size={20} color="#64748b" />
          <TextInput
            value={searchText}
            onChangeText={setSearchText}
            placeholder="Search by title or subject"
            placeholderTextColor="#94a3b8"
            className="text-[#0f172a] flex-1 text-sm py-2"
          />
        </View>

        <View className="flex-row gap-2 mb-3">
          {(
            [
              { key: "all", label: "All" },
              { key: "pending", label: "Pending" },
              { key: "completed", label: "Completed" },
            ] as const
          ).map((item) => {
            const key = item.key as FilterMode;
            const isActive = filter === key;
            return (
              <Pressable
                key={key}
                onPress={() => setFilter(key)}
                className={`flex-1 items-center rounded-full border px-3 py-2 ${
                  isActive
                    ? "bg-[#dcfce7] border-[#16a34a]"
                    : "border-[#cbd5e1]"
                }`}
              >
                <Text
                  className={`text-[13px] font-semibold ${
                    isActive ? "text-[#166534]" : "text-[#475569]"
                  }`}
                >
                  {item.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {filteredHomework.map((item) => (
          <View
            key={item.id}
            className="border border-[#e2e8f0] rounded-xl p-3 mb-2"
          >
            <View className="flex-row items-center justify-between mb-2">
              <Text className="text-[#0f172a] text-[15px] font-bold flex-1 mr-2">
                {item.title}
              </Text>
              <View
                className={`rounded-full px-2.5 py-1 ${
                  item.status === "Pending" ? "bg-[#f59e0b]" : "bg-[#16a34a]"
                }`}
              >
                <Text className="text-white text-xs font-bold">
                  {item.status}
                </Text>
              </View>
            </View>
            <Text className="text-[#334155] text-[13px] mb-1">{`Subject: ${item.subject}`}</Text>
            <Text className="text-[#334155] text-[13px] mb-1">{`Due Date: ${item.dueDate}`}</Text>
            <Text className="text-[#166534] text-[13px]">{item.note}</Text>
          </View>
        ))}

        {filteredHomework.length === 0 ? (
          <View className="items-center py-3">
            <Text className="text-[#64748b] text-sm">No homework found.</Text>
          </View>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}
