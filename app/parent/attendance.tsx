import { router } from 'expo-router';
import { useMemo } from 'react';
import { Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { STUDENTS } from '@/data/students';

type DailyAttendance = {
  id: string;
  date: string;
  status: 'Present' | 'Absent';
};

const attendanceHistory: DailyAttendance[] = [
  { id: 'a1', date: '13 Mar 2026', status: 'Present' },
  { id: 'a2', date: '12 Mar 2026', status: 'Present' },
  { id: 'a3', date: '11 Mar 2026', status: 'Absent' },
  { id: 'a4', date: '10 Mar 2026', status: 'Present' },
  { id: 'a5', date: '09 Mar 2026', status: 'Present' },
  { id: 'a6', date: '08 Mar 2026', status: 'Present' },
  { id: 'a7', date: '07 Mar 2026', status: 'Absent' },
];

export default function ParentAttendanceScreen() {
  const insets = useSafeAreaInsets();
  const child = STUDENTS[0];

  const summary = useMemo(() => {
    const present = attendanceHistory.filter((item) => item.status === 'Present').length;
    const total = attendanceHistory.length;
    const percent = total > 0 ? Math.round((present / total) * 100) : 0;
    return {
      present,
      absent: total - present,
      percent,
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
          <Text style={styles.title}>Attendance</Text>
          <Text style={styles.subtitle}>{`${child.name} • Class 5-A`}</Text>
        </View>

        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>This Week Summary</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryText}>{`Present: ${summary.present}`}</Text>
            <Text style={styles.summaryText}>{`Absent: ${summary.absent}`}</Text>
            <Text style={styles.summaryText}>{`${summary.percent}%`}</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Daily Status</Text>

        {attendanceHistory.map((item) => {
          const isPresent = item.status === 'Present';

          return (
            <View key={item.id} style={styles.rowCard}>
              <Text style={styles.dateText}>{item.date}</Text>
              <View style={[styles.badge, isPresent ? styles.badgePresent : styles.badgeAbsent]}>
                <Text style={styles.badgeText}>{item.status}</Text>
              </View>
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
  summaryCard: {
    backgroundColor: '#f0fdf4',
    borderColor: '#bbf7d0',
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
    padding: 12,
  },
  summaryTitle: {
    color: '#166534',
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 10,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  summaryText: {
    color: '#166534',
    fontSize: 14,
    fontWeight: '600',
  },
  sectionTitle: {
    color: '#0f172a',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 10,
  },
  rowCard: {
    alignItems: 'center',
    borderColor: '#e2e8f0',
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
    padding: 12,
  },
  dateText: {
    color: '#1e293b',
    fontSize: 14,
    fontWeight: '600',
  },
  badge: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  badgePresent: {
    backgroundColor: '#16a34a',
  },
  badgeAbsent: {
    backgroundColor: '#dc2626',
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
});
