import { router } from 'expo-router';
import { useMemo } from 'react';
import { Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { STUDENTS } from '@/data/students';

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
    id: 'r1',
    testType: 'Slip Test',
    subject: 'Math',
    total: 20,
    earned: 16,
    highest: 19,
    passMark: 8,
    date: '11 Mar 2026',
  },
  {
    id: 'r2',
    testType: 'Unit Test',
    subject: 'Science',
    total: 50,
    earned: 41,
    highest: 47,
    passMark: 20,
    date: '06 Mar 2026',
  },
  {
    id: 'r3',
    testType: 'Quarterly Test',
    subject: 'English',
    total: 100,
    earned: 68,
    highest: 92,
    passMark: 35,
    date: '20 Feb 2026',
  },
  {
    id: 'r4',
    testType: 'Half Yearly Test',
    subject: 'Social',
    total: 100,
    earned: 31,
    highest: 88,
    passMark: 35,
    date: '10 Jan 2026',
  },
];

export default function ParentReportsScreen() {
  const insets = useSafeAreaInsets();
  const child = STUDENTS[0];

  const overview = useMemo(() => {
    const passed = reports.filter((item) => item.earned >= item.passMark).length;
    const average =
      reports.length > 0
        ? Math.round(
            reports.reduce((sum, item) => sum + (item.earned / item.total) * 100, 0) / reports.length
          )
        : 0;

    return {
      passed,
      failed: reports.length - passed,
      average,
    };
  }, []);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Pressable
            onPress={() => router.back()}
            style={[styles.backButton, { marginTop: insets.top > 0 ? 4 : 12 }]}>
            <Text style={styles.backButtonText}>Back</Text>
          </Pressable>
          <Text style={styles.title}>Reports</Text>
          <Text style={styles.subtitle}>{`${child.name} • Academic results`}</Text>
        </View>

        <View style={styles.overviewCard}>
          <Text style={styles.overviewTitle}>Performance Overview</Text>
          <View style={styles.overviewRow}>
            <Text style={styles.overviewItem}>{`Passed: ${overview.passed}`}</Text>
            <Text style={styles.overviewItem}>{`Failed: ${overview.failed}`}</Text>
            <Text style={styles.overviewItem}>{`Avg: ${overview.average}%`}</Text>
          </View>
        </View>

        {reports.map((item) => {
          const isPass = item.earned >= item.passMark;

          return (
            <View key={item.id} style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>{item.testType}</Text>
                <View style={[styles.resultBadge, isPass ? styles.passBadge : styles.failBadge]}>
                  <Text style={styles.resultBadgeText}>{isPass ? 'PASS' : 'FAIL'}</Text>
                </View>
              </View>

              <Text style={styles.metaText}>{`Subject: ${item.subject}`}</Text>
              <Text style={styles.metaText}>{`Date: ${item.date}`}</Text>
              <Text style={styles.metaText}>{`Score: ${item.earned} / ${item.total}`}</Text>
              <Text style={styles.metaText}>{`Highest Mark: ${item.highest}`}</Text>
            </View>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: '#fff',
    flex: 1,
  },
  container: {
    backgroundColor: '#fff',
    padding: 20,
  },
  header: {
    marginBottom: 16,
  },
  backButton: {
    marginBottom: 10,
    width: 58,
  },
  backButtonText: {
    color: '#0f766e',
    fontSize: 15,
    fontWeight: '600',
  },
  title: {
    color: '#0f172a',
    fontSize: 28,
    fontWeight: '700',
  },
  subtitle: {
    color: '#475569',
    fontSize: 14,
    marginTop: 6,
  },
  overviewCard: {
    backgroundColor: '#f0fdf4',
    borderColor: '#bbf7d0',
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
    padding: 12,
  },
  overviewTitle: {
    color: '#166534',
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 10,
  },
  overviewRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  overviewItem: {
    color: '#166534',
    fontSize: 14,
    fontWeight: '600',
  },
  card: {
    borderColor: '#e2e8f0',
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 10,
    padding: 12,
  },
  cardHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  cardTitle: {
    color: '#0f172a',
    flex: 1,
    fontSize: 15,
    fontWeight: '700',
    marginRight: 8,
  },
  resultBadge: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  passBadge: {
    backgroundColor: '#16a34a',
  },
  failBadge: {
    backgroundColor: '#dc2626',
  },
  resultBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
  metaText: {
    color: '#334155',
    fontSize: 13,
    marginBottom: 4,
  },
});
