import { router } from "expo-router";
import { useMemo } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { STUDENTS } from "@/data/students";

type ReportItem = {
  id: string;
  testType: string;
  subject: string;
  total: number;
  earned: number;
  highest: number;
  passMark: number;
  date: string;
};

const reports: ReportItem[] = [
  {
    id: "r1",
    testType: "Slip Test",
    subject: "Math",
    total: 20,
    earned: 16,
    highest: 19,
    passMark: 8,
    date: "11 Mar 2026",
  },
  {
    id: "r2",
    testType: "Unit Test",
    subject: "Science",
    total: 50,
    earned: 41,
    highest: 47,
    passMark: 20,
    date: "06 Mar 2026",
  },
  {
    id: "r3",
    testType: "Quarterly Test",
    subject: "English",
    total: 100,
    earned: 68,
    highest: 92,
    passMark: 35,
    date: "20 Feb 2026",
  },
  {
    id: "r4",
    testType: "Half Yearly Test",
    subject: "Social",
    total: 100,
    earned: 31,
    highest: 88,
    passMark: 35,
    date: "10 Jan 2026",
  },
];

export default function ParentReportsScreen() {
  const insets = useSafeAreaInsets();
  const child = STUDENTS[0];

  const overview = useMemo(() => {
    const passed = reports.filter(
      (item) => item.earned >= item.passMark,
    ).length;
    const average =
      reports.length > 0
        ? Math.round(
            reports.reduce(
              (sum, item) => sum + (item.earned / item.total) * 100,
              0,
            ) / reports.length,
          )
        : 0;

    return {
      passed,
      failed: reports.length - passed,
      average,
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
            <Text className="text-[#0ea5e9] text-[15px] font-semibold">
              Back
            </Text>
          </Pressable>
          <Text className="text-[#0f172a] text-[28px] font-bold">Reports</Text>
          <Text className="text-[#475569] text-sm mt-1.5">
            {`${child.name} • Academic results`}
          </Text>
        </View>

        <View className="bg-white border border-[#bbf7d0] rounded-xl p-3 mb-3">
          <Text className="text-[#166534] text-sm font-bold mb-2">
            Performance Overview
          </Text>
          <View className="flex-row justify-between">
            <Text className="text-[#166534] text-sm font-semibold">{`Passed: ${overview.passed}`}</Text>
            <Text className="text-[#166534] text-sm font-semibold">{`Failed: ${overview.failed}`}</Text>
            <Text className="text-[#166534] text-sm font-semibold">{`Avg: ${overview.average}%`}</Text>
          </View>
        </View>

        {reports.map((item) => {
          const isPass = item.earned >= item.passMark;

          return (
            <View
              key={item.id}
              className="border border-[#93c5fd] rounded-xl p-3 mb-2"
            >
              <View className="flex-row items-center justify-between mb-2">
                <Text className="text-[#0f172a] text-[15px] font-bold flex-1 mr-2">
                  {item.testType}
                </Text>
                <View
                  className={`rounded-full px-2.5 py-1 ${
                    isPass ? "bg-[#16a34a]" : "bg-[#dc2626]"
                  }`}
                >
                  <Text className="text-white text-xs font-bold">
                    {isPass ? "PASS" : "FAIL"}
                  </Text>
                </View>
              </View>

              <Text className="text-[#334155] text-[13px] mb-1">{`Subject: ${item.subject}`}</Text>
              <Text className="text-[#334155] text-[13px] mb-1">{`Date: ${item.date}`}</Text>
              <Text className="text-[#334155] text-[13px] mb-1">{`Score: ${item.earned} / ${item.total}`}</Text>
              <Text className="text-[#334155] text-[13px]">{`Highest Mark: ${item.highest}`}</Text>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}


