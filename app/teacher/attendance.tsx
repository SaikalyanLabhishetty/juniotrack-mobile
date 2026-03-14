import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import {
  Alert,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { STUDENTS } from '@/data/students';

type AttendanceStatus = 'present' | 'absent';

const initialAttendance = STUDENTS.reduce<Record<string, AttendanceStatus>>((acc, student) => {
  acc[student.id] = 'present';
  return acc;
}, {});

export default function AttendanceScreen() {
  const [attendance, setAttendance] = useState<Record<string, AttendanceStatus>>(initialAttendance);
  const [searchText, setSearchText] = useState('');
  const insets = useSafeAreaInsets();

  const summary = useMemo(() => {
    const values = Object.values(attendance);
    const present = values.filter((status) => status === 'present').length;
    return {
      present,
      absent: values.length - present,
    };
  }, [attendance]);

  const today = new Date().toLocaleDateString();

  const onSave = () => {
    Alert.alert(
      'Attendance saved',
      `Demo mode only.\nPresent: ${summary.present}\nAbsent: ${summary.absent}`
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
        student.rollNo.includes(normalizedSearch)
    );
  }, [normalizedSearch]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={[styles.container, { paddingBottom: scrollBottomPadding }]}
        showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Pressable
            onPress={() => router.back()}
            style={[styles.backButton, { marginTop: insets.top > 0 ? 4 : 12 }]}>
            <Text style={styles.backButtonText}>Back</Text>
          </Pressable>
          <Text style={styles.title}>Attendance</Text>
          <Text style={styles.subtitle}>Class 5-A • {today}</Text>
        </View>

        <View style={styles.summaryCard}>
          <Text style={styles.summaryText}>Present: {summary.present}</Text>
          <Text style={styles.summaryText}>Absent: {summary.absent}</Text>
        </View>

        <View style={styles.searchWrap}>
          <MaterialCommunityIcons name="magnify" size={20} color="#64748b" />
          <TextInput
            value={searchText}
            onChangeText={setSearchText}
            placeholder="Search by student name or roll number"
            placeholderTextColor="#94a3b8"
            style={styles.searchInput}
          />
        </View>

        {filteredStudents.map((student) => {
          const status = attendance[student.id];

          return (
            <View key={student.id} style={styles.studentCard}>
              <View style={styles.studentInfo}>
                <Text style={styles.studentName}>{student.name}</Text>
                <Text style={styles.rollNumber}>Roll No: {student.rollNo}</Text>
              </View>

              <View style={styles.actions}>
                <Pressable
                  onPress={() =>
                    setAttendance((prev) => ({
                      ...prev,
                      [student.id]: 'present',
                    }))
                  }
                  accessibilityRole="button"
                  accessibilityLabel={`Mark ${student.name} present`}
                  style={[
                    styles.statusButton,
                    status === 'present' ? styles.presentSelected : styles.statusDefault,
                  ]}>
                  <MaterialCommunityIcons
                    name="check-circle"
                    size={20}
                    color={status === 'present' ? '#fff' : '#16a34a'}
                  />
                </Pressable>

                <Pressable
                  onPress={() =>
                    setAttendance((prev) => ({
                      ...prev,
                      [student.id]: 'absent',
                    }))
                  }
                  accessibilityRole="button"
                  accessibilityLabel={`Mark ${student.name} absent`}
                  style={[
                    styles.statusButton,
                    status === 'absent' ? styles.absentSelected : styles.statusDefault,
                  ]}>
                  <MaterialCommunityIcons
                    name="close-circle"
                    size={20}
                    color={status === 'absent' ? '#fff' : '#dc2626'}
                  />
                </Pressable>
              </View>
            </View>
          );
        })}

        {filteredStudents.length === 0 ? (
          <View style={styles.emptyWrap}>
            <Text style={styles.emptyText}>{`No students found for "${searchText}".`}</Text>
          </View>
        ) : null}
      </ScrollView>

      <View pointerEvents="box-none" style={styles.floatingLayer}>
        <Pressable onPress={onSave} style={[styles.saveButton, { bottom: floatingBottomOffset }]}>
          <Text style={styles.saveButtonText}>Save Attendance</Text>
        </Pressable>
      </View>
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
    flexGrow: 1,
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
    backgroundColor: '#f1f5f9',
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
    padding: 12,
  },
  summaryText: {
    color: '#1e293b',
    fontSize: 14,
    fontWeight: '600',
  },
  searchWrap: {
    alignItems: 'center',
    backgroundColor: '#fff',
    borderColor: '#cbd5e1',
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: 'row',
    marginBottom: 14,
    paddingHorizontal: 12,
  },
  searchInput: {
    color: '#0f172a',
    flex: 1,
    fontSize: 14,
    paddingVertical: 10,
  },
  studentCard: {
    borderColor: '#e2e8f0',
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
    padding: 12,
  },
  studentInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  studentName: {
    color: '#0f172a',
    fontSize: 16,
    fontWeight: '600',
  },
  rollNumber: {
    color: '#64748b',
    fontSize: 13,
    marginTop: 4,
  },
  actions: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
    marginLeft: 12,
  },
  statusButton: {
    alignItems: 'center',
    borderRadius: 999,
    borderWidth: 1,
    height: 42,
    justifyContent: 'center',
    width: 42,
  },
  statusDefault: {
    backgroundColor: '#fff',
    borderColor: '#cbd5e1',
  },
  presentSelected: {
    backgroundColor: '#16a34a',
    borderColor: '#16a34a',
  },
  absentSelected: {
    backgroundColor: '#dc2626',
    borderColor: '#dc2626',
  },
  emptyWrap: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  emptyText: {
    color: '#64748b',
    fontSize: 14,
    textAlign: 'center',
  },
  floatingLayer: {
    ...StyleSheet.absoluteFillObject,
  },
  saveButton: {
    backgroundColor: '#0f766e',
    borderRadius: 12,
    left: 20,
    position: 'absolute',
    paddingVertical: 12,
    right: 20,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
  },
});
