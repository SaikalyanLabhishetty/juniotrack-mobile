import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Pressable, SafeAreaView, ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type Announcement = {
  id: string;
  title: string;
  message: string;
  date: string;
  from: string;
};

const announcements: Announcement[] = [
  {
    id: "an1",
    title: "Parent Teacher Meeting",
    message: "PTM will be held on Saturday at 10:00 AM in school auditorium.",
    date: "13 Mar 2026",
    from: "School Admin",
  },
  {
    id: "an2",
    title: "Science Exhibition",
    message: "Students should bring project materials by Monday.",
    date: "11 Mar 2026",
    from: "Class Teacher",
  },
  {
    id: "an3",
    title: "Fee Reminder",
    message: "Kindly clear remaining fee before 20 Mar 2026.",
    date: "09 Mar 2026",
    from: "Accounts Office",
  },
];

export default function ParentAnnouncementsScreen() {
  const insets = useSafeAreaInsets();

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
          <Text className="text-[#0f172a] text-[28px] font-bold">
            Announcements
          </Text>
          <Text className="text-[#475569] text-sm mt-1.5">
            Important updates from school
          </Text>
        </View>

        {announcements.map((item) => (
          <View
            key={item.id}
            className="bg-white border border-[#93c5fd] rounded-xl p-3 mb-2"
          >
            <View className="flex-row items-center justify-between mb-2">
              <Text className="text-[#0f172a] text-[15px] font-bold flex-1 mr-2">
                {item.title}
              </Text>
              <MaterialCommunityIcons
                name="bullhorn"
                size={18}
                color="#0f766e"
              />
            </View>
            <Text className="text-[#334155] text-[13px] leading-5 mb-2">
              {item.message}
            </Text>
            <Text className="text-[#166534] text-[12px] mb-1">{`From: ${item.from}`}</Text>
            <Text className="text-[#166534] text-[12px]">{`Date: ${item.date}`}</Text>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}
