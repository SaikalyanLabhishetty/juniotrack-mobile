import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type Announcement = {
  id: string;
  title: string;
  message: string;
  date: string;
  from: string;
};

const announcements: Announcement[] = [
  {
    id: 'an1',
    title: 'Parent Teacher Meeting',
    message: 'PTM will be held on Saturday at 10:00 AM in school auditorium.',
    date: '13 Mar 2026',
    from: 'School Admin',
  },
  {
    id: 'an2',
    title: 'Science Exhibition',
    message: 'Students should bring project materials by Monday.',
    date: '11 Mar 2026',
    from: 'Class Teacher',
  },
  {
    id: 'an3',
    title: 'Fee Reminder',
    message: 'Kindly clear remaining fee before 20 Mar 2026.',
    date: '09 Mar 2026',
    from: 'Accounts Office',
  },
];

export default function ParentAnnouncementsScreen() {
  const insets = useSafeAreaInsets();

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Pressable
            onPress={() => router.back()}
            style={[styles.backButton, { marginTop: insets.top > 0 ? 4 : 12 }]}>
            <Text style={styles.backButtonText}>Back</Text>
          </Pressable>
          <Text style={styles.title}>Announcements</Text>
          <Text style={styles.subtitle}>Important updates from school</Text>
        </View>

        {announcements.map((item) => (
          <View key={item.id} style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>{item.title}</Text>
              <MaterialCommunityIcons name="bullhorn" size={18} color="#0f766e" />
            </View>
            <Text style={styles.message}>{item.message}</Text>
            <Text style={styles.meta}>{`From: ${item.from}`}</Text>
            <Text style={styles.meta}>{`Date: ${item.date}`}</Text>
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
  message: {
    color: '#334155',
    fontSize: 13,
    lineHeight: 20,
    marginBottom: 8,
  },
  meta: {
    color: '#166534',
    fontSize: 12,
    marginBottom: 2,
  },
});
