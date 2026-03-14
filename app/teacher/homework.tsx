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

type AssignmentMode = 'all' | 'individual';

export default function HomeworkScreen() {
  const insets = useSafeAreaInsets();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [searchText, setSearchText] = useState('');
  const [mode, setMode] = useState<AssignmentMode>('all');
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);

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

  const assignedCount = mode === 'all' ? STUDENTS.length : selectedStudentIds.length;

  const toggleStudent = (studentId: string) => {
    setSelectedStudentIds((prev) =>
      prev.includes(studentId) ? prev.filter((id) => id !== studentId) : [...prev, studentId]
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
      Alert.alert('Missing title', 'Please enter homework title.');
      return;
    }

    if (!description.trim()) {
      Alert.alert('Missing description', 'Please enter homework description.');
      return;
    }

    if (mode === 'individual' && selectedStudentIds.length === 0) {
      Alert.alert('No students selected', 'Select at least one student.');
      return;
    }

    Alert.alert(
      'Homework assigned',
      `Demo mode only.\nAssigned to: ${assignedCount} students\nDue date: ${dueDate.trim() || 'Not set'}`
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
          <View style={styles.titleRow}>
            <Text style={styles.title}>Homework</Text>
            <Pressable
              onPress={() => router.push('/teacher/past-homeworks')}
              style={styles.pastButton}>
              <MaterialCommunityIcons name="history" size={24} color="#0f766e" />
            </Pressable>
          </View>
          <Text style={styles.subtitle}>Create homework and assign quickly</Text>
        </View>

        <View style={styles.formCard}>
          <Text style={styles.fieldLabel}>Homework Title</Text>
          <TextInput
            value={title}
            onChangeText={setTitle}
            placeholder="Ex: Math - Fractions Worksheet"
            placeholderTextColor="#94a3b8"
            style={styles.input}
          />

          <Text style={styles.fieldLabel}>Description</Text>
          <TextInput
            value={description}
            onChangeText={setDescription}
            placeholder="Add instruction for students"
            placeholderTextColor="#94a3b8"
            multiline
            style={[styles.input, styles.textArea]}
          />

          <Text style={styles.fieldLabel}>Due Date (Optional)</Text>
          <TextInput
            value={dueDate}
            onChangeText={setDueDate}
            placeholder="Ex: 25/03/2026"
            placeholderTextColor="#94a3b8"
            style={styles.input}
          />
        </View>

        <View style={styles.modeCard}>
          <Text style={styles.sectionTitle}>Assign To</Text>

          <View style={styles.segmentRow}>
            <Pressable
              onPress={() => setMode('all')}
              style={[styles.segmentButton, mode === 'all' && styles.segmentButtonActive]}>
              <Text style={[styles.segmentText, mode === 'all' && styles.segmentTextActive]}>
                All Students
              </Text>
            </Pressable>
            <Pressable
              onPress={() => setMode('individual')}
              style={[styles.segmentButton, mode === 'individual' && styles.segmentButtonActive]}>
              <Text style={[styles.segmentText, mode === 'individual' && styles.segmentTextActive]}>
                Individual
              </Text>
            </Pressable>
          </View>

          {mode === 'all' ? (
            <View style={styles.allInfo}>
              <Text style={styles.allInfoText}>{`This will assign homework to all ${STUDENTS.length} students.`}</Text>
            </View>
          ) : (
            <>
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

              <View style={styles.selectionActions}>
                <Pressable onPress={selectAllFiltered}>
                  <Text style={styles.selectionActionText}>Select all shown</Text>
                </Pressable>
                <Pressable onPress={clearSelection}>
                  <Text style={styles.selectionActionText}>Clear</Text>
                </Pressable>
              </View>

              {filteredStudents.map((student) => {
                const selected = selectedStudentIds.includes(student.id);

                return (
                  <Pressable
                    key={student.id}
                    onPress={() => toggleStudent(student.id)}
                    style={[styles.studentRow, selected && styles.studentRowSelected]}>
                    <View>
                      <Text style={styles.studentName}>{student.name}</Text>
                      <Text style={styles.rollNo}>{`Roll No: ${student.rollNo}`}</Text>
                    </View>

                    <MaterialCommunityIcons
                      name={selected ? 'checkbox-marked-circle' : 'checkbox-blank-circle-outline'}
                      size={24}
                      color={selected ? '#16a34a' : '#94a3b8'}
                    />
                  </Pressable>
                );
              })}

              {filteredStudents.length === 0 ? (
                <View style={styles.emptyWrap}>
                  <Text style={styles.emptyText}>{`No students found for "${searchText}".`}</Text>
                </View>
              ) : null}
            </>
          )}
        </View>

        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Ready to assign</Text>
          <Text style={styles.summaryValue}>{`${assignedCount} students`}</Text>
        </View>
      </ScrollView>

      <View pointerEvents="box-none" style={styles.floatingLayer}>
        <Pressable onPress={onAssign} style={[styles.assignButton, { bottom: floatingBottomOffset }]}>
          <Text style={styles.assignButtonText}>Assign Homework</Text>
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
  titleRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  pastButton: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  pastButtonText: {
    color: '#0f766e',
    fontSize: 12,
    fontWeight: '600',
  },
  subtitle: {
    color: '#475569',
    fontSize: 14,
    marginTop: 6,
  },
  formCard: {
    borderColor: '#e2e8f0',
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 14,
    padding: 12,
  },
  fieldLabel: {
    color: '#334155',
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 6,
    marginTop: 8,
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
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  modeCard: {
    borderColor: '#e2e8f0',
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 14,
    padding: 12,
  },
  sectionTitle: {
    color: '#0f172a',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 10,
  },
  segmentRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 12,
  },
  segmentButton: {
    alignItems: 'center',
    borderColor: '#cbd5e1',
    borderRadius: 999,
    borderWidth: 1,
    flex: 1,
    paddingVertical: 10,
  },
  segmentButtonActive: {
    backgroundColor: '#dcfce7',
    borderColor: '#16a34a',
  },
  segmentText: {
    color: '#475569',
    fontSize: 13,
    fontWeight: '600',
  },
  segmentTextActive: {
    color: '#166534',
  },
  allInfo: {
    backgroundColor: '#f0fdf4',
    borderColor: '#bbf7d0',
    borderRadius: 10,
    borderWidth: 1,
    padding: 12,
  },
  allInfoText: {
    color: '#166534',
    fontSize: 14,
    fontWeight: '500',
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
  selectionActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  selectionActionText: {
    color: '#0f766e',
    fontSize: 13,
    fontWeight: '600',
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
  emptyWrap: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  emptyText: {
    color: '#64748b',
    fontSize: 14,
  },
  summaryCard: {
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderColor: '#e2e8f0',
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
  },
  summaryLabel: {
    color: '#64748b',
    fontSize: 13,
    marginBottom: 4,
  },
  summaryValue: {
    color: '#0f172a',
    fontSize: 20,
    fontWeight: '700',
  },
  floatingLayer: {
    ...StyleSheet.absoluteFillObject,
  },
  assignButton: {
    backgroundColor: '#0f766e',
    borderRadius: 12,
    left: 20,
    position: 'absolute',
    paddingVertical: 12,
    right: 20,
  },
  assignButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
  },
});
