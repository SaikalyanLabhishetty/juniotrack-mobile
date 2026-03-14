import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type PastHomework = {
  id: string;
  title: string;
  assignedOn: string;
  dueDate: string;
  assignedTo: string;
};

const pastHomeworks: PastHomework[] = [
  {
    id: 'hw-1',
    title: 'Math - Fractions Worksheet',
    assignedOn: '08 Mar 2026',
    dueDate: '10 Mar 2026',
    assignedTo: 'All 10 students',
  },
  {
    id: 'hw-2',
    title: 'English - Essay Writing',
    assignedOn: '06 Mar 2026',
    dueDate: '09 Mar 2026',
    assignedTo: 'Roll No 02, 04, 06',
  },
  {
    id: 'hw-3',
    title: 'Science - Plant Cell Diagram',
    assignedOn: '03 Mar 2026',
    dueDate: '05 Mar 2026',
    assignedTo: 'All 10 students',
  },
  {
    id: 'hw-4',
    title: 'Social Studies - Map Marking',
    assignedOn: '27 Feb 2026',
    dueDate: '01 Mar 2026',
    assignedTo: 'Roll No 01, 05, 09',
  },
  {
    id: 'hw-5',
    title: 'Hindi - Chapter Reading',
    assignedOn: '24 Feb 2026',
    dueDate: '26 Feb 2026',
    assignedTo: 'All 10 students',
  },
];

export default function PastHomeworksScreen() {
  const insets = useSafeAreaInsets();

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text
            onPress={() => router.back()}
            style={[styles.backButtonText, { marginTop: insets.top > 0 ? 4 : 12 }]}>
            Back
          </Text>
          <Text style={styles.title}>Past Homeworks</Text>
          <Text style={styles.subtitle}>Recently assigned homework list</Text>
        </View>

        {pastHomeworks.map((homework) => (
          <View key={homework.id} style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>{homework.title}</Text>
              <MaterialCommunityIcons name="book-open-page-variant" size={18} color="#0f766e" />
            </View>
            <Text style={styles.metaText}>{`Assigned On: ${homework.assignedOn}`}</Text>
            <Text style={styles.metaText}>{`Due Date: ${homework.dueDate}`}</Text>
            <Text style={styles.assignedToText}>{`Assigned To: ${homework.assignedTo}`}</Text>
          </View>
        ))}
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
  backButtonText: {
    color: '#0f766e',
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 10,
    width: 58,
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
  metaText: {
    color: '#334155',
    fontSize: 13,
    marginBottom: 4,
  },
  assignedToText: {
    color: '#166534',
    fontSize: 13,
    fontWeight: '600',
    marginTop: 2,
  },
});
