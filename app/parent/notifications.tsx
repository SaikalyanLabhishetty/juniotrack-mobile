import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Pressable, SafeAreaView, ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type NotificationItem = {
  id: string;
  title: string;
  message: string;
  time: string;
  unread: boolean;
};

const notifications: NotificationItem[] = [
  {
    id: "n1",
    title: "Attendance Update",
    message: "Your child was marked present today.",
    time: "Today, 09:15 AM",
    unread: true,
  },
  {
    id: "n2",
    title: "Homework Assigned",
    message: "New Math homework has been assigned.",
    time: "Today, 08:40 AM",
    unread: true,
  },
  {
    id: "n3",
    title: "Report Published",
    message: "Unit Test report is now available.",
    time: "Yesterday, 06:10 PM",
    unread: false,
  },
  {
    id: "n4",
    title: "Fee Reminder",
    message: "Fee payment due in 5 days.",
    time: "Yesterday, 12:00 PM",
    unread: false,
  },
];

export default function ParentNotificationsScreen() {
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
            <Text className="text-[#0ea5e9] text-[15px] font-semibold">
              Back
            </Text>
          </Pressable>
          <Text className="text-[#0f172a] text-[28px] font-bold">
            Notifications
          </Text>
          <Text className="text-[#475569] text-sm mt-1.5">
            Latest updates for parents
          </Text>
        </View>

        {notifications.map((item) => (
          <View
            key={item.id}
            className={`border rounded-xl p-3 mb-2 border-[#93c5fd] ${
              item.unread ? "bg-white border-[#86efac]" : ""
            }`}
          >
            <View className="flex-row items-center justify-between mb-2">
              <View className="flex-row items-center flex-1">
                <Text className="text-[#0f172a] text-[15px] font-bold mr-2 flex-1">
                  {item.title}
                </Text>
                {item.unread ? (
                  <View className="bg-[#16a34a] rounded-full h-2 w-2" />
                ) : null}
              </View>
              <MaterialCommunityIcons
                name="bell-outline"
                size={18}
                color="#0f766e"
              />
            </View>
            <Text className="text-[#334155] text-[13px] leading-5 mb-2">
              {item.message}
            </Text>
            <Text className="text-[#166534] text-[12px]">{item.time}</Text>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}
