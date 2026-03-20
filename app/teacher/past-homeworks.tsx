import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { SafeAreaView, ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type PastHomework = {
  id: string;
  title: string;
  assignedOn: string;
  dueDate: string;
  assignedTo: string;
};

const pastHomeworks: PastHomework[] = [
  {
    id: "hw-1",
    title: "Math - Fractions Worksheet",
    assignedOn: "08 Mar 2026",
    dueDate: "10 Mar 2026",
    assignedTo: "All 10 students",
  },
  {
    id: "hw-2",
    title: "English - Essay Writing",
    assignedOn: "06 Mar 2026",
    dueDate: "09 Mar 2026",
    assignedTo: "Roll No 02, 04, 06",
  },
  {
    id: "hw-3",
    title: "Science - Plant Cell Diagram",
    assignedOn: "03 Mar 2026",
    dueDate: "05 Mar 2026",
    assignedTo: "All 10 students",
  },
  {
    id: "hw-4",
    title: "Social Studies - Map Marking",
    assignedOn: "27 Feb 2026",
    dueDate: "01 Mar 2026",
    assignedTo: "Roll No 01, 05, 09",
  },
  {
    id: "hw-5",
    title: "Hindi - Chapter Reading",
    assignedOn: "24 Feb 2026",
    dueDate: "26 Feb 2026",
    assignedTo: "All 10 students",
  },
];

export default function PastHomeworksScreen() {
  const insets = useSafeAreaInsets();

  return (
    <SafeAreaView className="bg-[#eff6ff] flex-1">
      <ScrollView
        className="bg-[#eff6ff]"
        contentContainerStyle={{ padding: 20 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="mb-4">
          <Text
            onPress={() => router.back()}
            className="text-[#0ea5e9] text-[15px] font-semibold mb-2 w-[58px]"
            style={{ marginTop: insets.top > 0 ? 4 : 12 }}
          >
            Back
          </Text>
          <Text className="text-[#0f172a] text-[28px] font-bold">
            Past Homeworks
          </Text>
          <Text className="text-[#475569] text-sm mt-1.5">
            Recently assigned homework list
          </Text>
        </View>

        {pastHomeworks.map((homework) => (
          <View
            key={homework.id}
            className="border border-[#93c5fd] rounded-xl p-3 mb-2"
          >
            <View className="flex-row items-center justify-between mb-2">
              <Text className="text-[#0f172a] text-[15px] font-bold flex-1 mr-2">
                {homework.title}
              </Text>
              <MaterialCommunityIcons
                name="book-open-page-variant"
                size={18}
                color="#0f766e"
              />
            </View>
            <Text className="text-[#334155] text-[13px] mb-1">{`Assigned On: ${homework.assignedOn}`}</Text>
            <Text className="text-[#334155] text-[13px] mb-1">{`Due Date: ${homework.dueDate}`}</Text>
            <Text className="text-[#166534] text-[13px] font-semibold">{`Assigned To: ${homework.assignedTo}`}</Text>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}
