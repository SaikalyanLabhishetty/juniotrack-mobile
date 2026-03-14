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

const REPORT_TYPES = [
  'Slip Test',
  'Unit Test',
  'Quarterly Test',
  'Half Yearly Test',
  'Pre Finals',
  'Preparation',
  'Other',
] as const;

const SUBJECTS = ['Math', 'Science', 'English', 'Social', 'Hindi', 'Computer', 'Other'] as const;

const toNumber = (value: string) => {
  if (!value.trim()) {
    return null;
  }
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

export default function ReportsScreen() {
  const insets = useSafeAreaInsets();

  const [searchText, setSearchText] = useState('');
  const [selectedStudentId, setSelectedStudentId] = useState<string>(STUDENTS[0]?.id ?? '');
  const [reportType, setReportType] = useState<(typeof REPORT_TYPES)[number]>('Slip Test');
  const [subject, setSubject] = useState<(typeof SUBJECTS)[number]>('Math');
  const [totalScore, setTotalScore] = useState('');
  const [scoreEarned, setScoreEarned] = useState('');
  const [highestMark, setHighestMark] = useState('');
  const [passMark, setPassMark] = useState('');

  const selectedStudent = useMemo(
    () => STUDENTS.find((student) => student.id === selectedStudentId),
    [selectedStudentId]
  );

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

  const total = toNumber(totalScore);
  const earned = toNumber(scoreEarned);
  const highest = toNumber(highestMark);
  const pass = toNumber(passMark);
  const hasResult = total !== null && earned !== null && pass !== null;
  const result = hasResult ? (earned >= pass ? 'Pass' : 'Fail') : 'Pending';

  const onSaveReport = () => {
    if (!selectedStudent) {
      Alert.alert('Select student', 'Please choose a student for this report.');
      return;
    }

    if (total === null || earned === null || highest === null || pass === null) {
      Alert.alert('Missing marks', 'Please enter total score, earned score, highest mark, and pass mark.');
      return;
    }

    if (earned > total) {
      Alert.alert('Invalid score', 'Score earned cannot be greater than total score.');
      return;
    }

    if (highest > total) {
      Alert.alert('Invalid highest mark', 'Highest mark cannot be greater than total score.');
      return;
    }

    if (pass > total) {
      Alert.alert('Invalid pass mark', 'Pass mark cannot be greater than total score.');
      return;
    }

    Alert.alert(
      'Report saved',
      `Demo mode only.\nStudent: ${selectedStudent.name}\nTest: ${reportType}\nSubject: ${subject}\nResult: ${result}`
    );
  };

  const floatingBottomOffset = insets.bottom + 12;
  const scrollBottomPadding = 124 + insets.bottom;

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
          <Text style={styles.title}>Reports</Text>
          <Text style={styles.subtitle}>Add test reports quickly for each student</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Select Student</Text>
          <View style={styles.searchWrap}>
            <MaterialCommunityIcons name="magnify" size={20} color="#64748b" />
            <TextInput
              value={searchText}
              onChangeText={setSearchText}
              placeholder="Search by name or roll no"
              placeholderTextColor="#94a3b8"
              style={styles.searchInput}
            />
          </View>

          {filteredStudents.map((student) => {
            const selected = selectedStudentId === student.id;

            return (
              <Pressable
                key={student.id}
                onPress={() => setSelectedStudentId(student.id)}
                style={[styles.studentRow, selected && styles.studentRowSelected]}>
                <View>
                  <Text style={styles.studentName}>{student.name}</Text>
                  <Text style={styles.rollNo}>{`Roll No: ${student.rollNo}`}</Text>
                </View>
                <MaterialCommunityIcons
                  name={selected ? 'radiobox-marked' : 'radiobox-blank'}
                  size={22}
                  color={selected ? '#16a34a' : '#94a3b8'}
                />
              </Pressable>
            );
          })}
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Report Details</Text>
          <Text style={styles.subLabel}>Test Type</Text>
          <View style={styles.chipWrap}>
            {REPORT_TYPES.map((type) => (
              <Pressable
                key={type}
                onPress={() => setReportType(type)}
                style={[styles.chip, reportType === type && styles.chipActive]}>
                <Text style={[styles.chipText, reportType === type && styles.chipTextActive]}>{type}</Text>
              </Pressable>
            ))}
          </View>

          <Text style={styles.subLabel}>Subject</Text>
          <View style={styles.chipWrap}>
            {SUBJECTS.map((item) => (
              <Pressable
                key={item}
                onPress={() => setSubject(item)}
                style={[styles.chip, subject === item && styles.chipActive]}>
                <Text style={[styles.chipText, subject === item && styles.chipTextActive]}>{item}</Text>
              </Pressable>
            ))}
          </View>

          <View style={styles.inputRow}>
            <View style={styles.inputBox}>
              <Text style={styles.inputLabel}>Total Score</Text>
              <TextInput
                value={totalScore}
                onChangeText={setTotalScore}
                keyboardType="numeric"
                placeholder="100"
                placeholderTextColor="#94a3b8"
                style={styles.input}
              />
            </View>

            <View style={styles.inputBox}>
              <Text style={styles.inputLabel}>Score Earned</Text>
              <TextInput
                value={scoreEarned}
                onChangeText={setScoreEarned}
                keyboardType="numeric"
                placeholder="78"
                placeholderTextColor="#94a3b8"
                style={styles.input}
              />
            </View>
          </View>

          <View style={styles.inputRow}>
            <View style={styles.inputBox}>
              <Text style={styles.inputLabel}>Highest Mark</Text>
              <TextInput
                value={highestMark}
                onChangeText={setHighestMark}
                keyboardType="numeric"
                placeholder="95"
                placeholderTextColor="#94a3b8"
                style={styles.input}
              />
            </View>

            <View style={styles.inputBox}>
              <Text style={styles.inputLabel}>Pass Mark</Text>
              <TextInput
                value={passMark}
                onChangeText={setPassMark}
                keyboardType="numeric"
                placeholder="35"
                placeholderTextColor="#94a3b8"
                style={styles.input}
              />
            </View>
          </View>
        </View>

        <View style={styles.previewCard}>
          <Text style={styles.previewLabel}>
            {selectedStudent ? `Student: ${selectedStudent.name}` : 'Student not selected'}
          </Text>
          <Text style={[styles.resultText, result === 'Pass' ? styles.passText : styles.failText]}>
            {`Result: ${result}`}
          </Text>
          <Text style={styles.scoreText}>
            {`Score: ${earned ?? '-'} / ${total ?? '-'} • Highest: ${highest ?? '-'}`}
          </Text>
        </View>
      </ScrollView>

      <View pointerEvents="box-none" style={styles.floatingLayer}>
        <Pressable
          onPress={onSaveReport}
          style={[styles.saveButton, { bottom: floatingBottomOffset }]}>
          <Text style={styles.saveButtonText}>Save Report</Text>
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
  card: {
    borderColor: '#e2e8f0',
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
    padding: 12,
  },
  sectionTitle: {
    color: '#0f172a',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 10,
  },
  subLabel: {
    color: '#334155',
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 8,
    marginTop: 8,
  },
  searchWrap: {
    alignItems: 'center',
    backgroundColor: '#fff',
    borderColor: '#cbd5e1',
    borderRadius: 10,
    borderWidth: 1,
    flexDirection: 'row',
    marginBottom: 10,
    paddingHorizontal: 10,
  },
  searchInput: {
    color: '#0f172a',
    flex: 1,
    fontSize: 14,
    paddingVertical: 10,
  },
  studentRow: {
    alignItems: 'center',
    borderColor: '#e2e8f0',
    borderRadius: 10,
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
    padding: 10,
  },
  studentRowSelected: {
    backgroundColor: '#f0fdf4',
    borderColor: '#86efac',
  },
  studentName: {
    color: '#0f172a',
    fontSize: 15,
    fontWeight: '600',
  },
  rollNo: {
    color: '#64748b',
    fontSize: 13,
    marginTop: 4,
  },
  chipWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    borderColor: '#cbd5e1',
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  chipActive: {
    backgroundColor: '#dcfce7',
    borderColor: '#16a34a',
  },
  chipText: {
    color: '#475569',
    fontSize: 12,
    fontWeight: '600',
  },
  chipTextActive: {
    color: '#166534',
  },
  inputRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 10,
  },
  inputBox: {
    flex: 1,
  },
  inputLabel: {
    color: '#334155',
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 6,
  },
  input: {
    borderColor: '#cbd5e1',
    borderRadius: 10,
    borderWidth: 1,
    color: '#0f172a',
    fontSize: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  previewCard: {
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderColor: '#e2e8f0',
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
  },
  previewLabel: {
    color: '#334155',
    fontSize: 14,
    marginBottom: 4,
  },
  resultText: {
    fontSize: 18,
    fontWeight: '700',
  },
  passText: {
    color: '#16a34a',
  },
  failText: {
    color: '#dc2626',
  },
  scoreText: {
    color: '#475569',
    fontSize: 13,
    marginTop: 4,
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
