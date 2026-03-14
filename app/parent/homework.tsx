import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type HomeworkStatus = 'Pending' | 'Completed';
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
    id: 'h1',
    title: 'Fractions Worksheet',
    subject: 'Math',
    dueDate: '15 Mar 2026',
    status: 'Pending',
    note: 'Complete Q1 to Q10 in notebook.',
  },
  {
    id: 'h2',
    title: 'Plant Cell Diagram',
    subject: 'Science',
    dueDate: '14 Mar 2026',
    status: 'Pending',
    note: 'Draw and label all parts neatly.',
  },
  {
    id: 'h3',
    title: 'Essay: My School',
    subject: 'English',
    dueDate: '12 Mar 2026',
    status: 'Completed',
    note: '250 words minimum.',
  },
  {
    id: 'h4',
    title: 'Map Marking',
    subject: 'Social',
    dueDate: '10 Mar 2026',
    status: 'Completed',
    note: 'Mark 10 important rivers.',
  },
];

type FilterMode = 'all' | 'pending' | 'completed';

export default function ParentHomeworkScreen() {
  const insets = useSafeAreaInsets();
  const [searchText, setSearchText] = useState('');
  const [filter, setFilter] = useState<FilterMode>('all');

  const normalizedSearch = searchText.trim().toLowerCase();
  const filteredHomework = useMemo(() => {
    return homeworkList.filter((item) => {
      const matchesFilter =
        filter === 'all' ||
        (filter === 'pending' && item.status === 'Pending') ||
        (filter === 'completed' && item.status === 'Completed');

      const matchesSearch =
        item.title.toLowerCase().includes(normalizedSearch) ||
        item.subject.toLowerCase().includes(normalizedSearch);

      return matchesFilter && matchesSearch;
    });
  }, [filter, normalizedSearch]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Pressable
            onPress={() => router.back()}
            style={[styles.backButton, { marginTop: insets.top > 0 ? 4 : 12 }]}>
            <Text style={styles.backButtonText}>Back</Text>
          </Pressable>
          <Text style={styles.title}>Homework</Text>
          <Text style={styles.subtitle}>Track pending and completed homework</Text>
        </View>

        <View style={styles.searchWrap}>
          <MaterialCommunityIcons name="magnify" size={20} color="#64748b" />
          <TextInput
            value={searchText}
            onChangeText={setSearchText}
            placeholder="Search by title or subject"
            placeholderTextColor="#94a3b8"
            style={styles.searchInput}
          />
        </View>

        <View style={styles.filterRow}>
          <Pressable
            onPress={() => setFilter('all')}
            style={[styles.filterButton, filter === 'all' && styles.filterButtonActive]}>
            <Text style={[styles.filterText, filter === 'all' && styles.filterTextActive]}>All</Text>
          </Pressable>
          <Pressable
            onPress={() => setFilter('pending')}
            style={[styles.filterButton, filter === 'pending' && styles.filterButtonActive]}>
            <Text style={[styles.filterText, filter === 'pending' && styles.filterTextActive]}>
              Pending
            </Text>
          </Pressable>
          <Pressable
            onPress={() => setFilter('completed')}
            style={[styles.filterButton, filter === 'completed' && styles.filterButtonActive]}>
            <Text style={[styles.filterText, filter === 'completed' && styles.filterTextActive]}>
              Completed
            </Text>
          </Pressable>
        </View>

        {filteredHomework.map((item) => (
          <View key={item.id} style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>{item.title}</Text>
              <View
                style={[
                  styles.statusBadge,
                  item.status === 'Pending' ? styles.pendingBadge : styles.completedBadge,
                ]}>
                <Text style={styles.statusText}>{item.status}</Text>
              </View>
            </View>
            <Text style={styles.metaText}>{`Subject: ${item.subject}`}</Text>
            <Text style={styles.metaText}>{`Due Date: ${item.dueDate}`}</Text>
            <Text style={styles.noteText}>{item.note}</Text>
          </View>
        ))}

        {filteredHomework.length === 0 ? (
          <View style={styles.emptyWrap}>
            <Text style={styles.emptyText}>No homework found.</Text>
          </View>
        ) : null}
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
  searchWrap: {
    alignItems: 'center',
    backgroundColor: '#fff',
    borderColor: '#cbd5e1',
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: 'row',
    marginBottom: 12,
    paddingHorizontal: 12,
  },
  searchInput: {
    color: '#0f172a',
    flex: 1,
    fontSize: 14,
    paddingVertical: 10,
  },
  filterRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 12,
  },
  filterButton: {
    alignItems: 'center',
    borderColor: '#cbd5e1',
    borderRadius: 999,
    borderWidth: 1,
    flex: 1,
    paddingVertical: 8,
  },
  filterButtonActive: {
    backgroundColor: '#dcfce7',
    borderColor: '#16a34a',
  },
  filterText: {
    color: '#475569',
    fontSize: 13,
    fontWeight: '600',
  },
  filterTextActive: {
    color: '#166534',
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
  statusBadge: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  pendingBadge: {
    backgroundColor: '#f59e0b',
  },
  completedBadge: {
    backgroundColor: '#16a34a',
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
  metaText: {
    color: '#334155',
    fontSize: 13,
    marginBottom: 4,
  },
  noteText: {
    color: '#166534',
    fontSize: 13,
    marginTop: 2,
  },
  emptyWrap: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  emptyText: {
    color: '#64748b',
    fontSize: 14,
  },
});
