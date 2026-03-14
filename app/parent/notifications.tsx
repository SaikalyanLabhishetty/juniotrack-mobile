import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type NotificationItem = {
  id: string;
  title: string;
  message: string;
  time: string;
  unread: boolean;
};

const notifications: NotificationItem[] = [
  {
    id: 'n1',
    title: 'Attendance Update',
    message: 'Your child was marked present today.',
    time: 'Today, 09:15 AM',
    unread: true,
  },
  {
    id: 'n2',
    title: 'Homework Assigned',
    message: 'New Math homework has been assigned.',
    time: 'Today, 08:40 AM',
    unread: true,
  },
  {
    id: 'n3',
    title: 'Report Published',
    message: 'Unit Test report is now available.',
    time: 'Yesterday, 06:10 PM',
    unread: false,
  },
  {
    id: 'n4',
    title: 'Fee Reminder',
    message: 'Fee payment due in 5 days.',
    time: 'Yesterday, 12:00 PM',
    unread: false,
  },
];

export default function ParentNotificationsScreen() {
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
          <Text style={styles.title}>Notifications</Text>
          <Text style={styles.subtitle}>Latest updates for parents</Text>
        </View>

        {notifications.map((item) => (
          <View key={item.id} style={[styles.card, item.unread && styles.cardUnread]}>
            <View style={styles.cardHeader}>
              <View style={styles.titleRow}>
                <Text style={styles.cardTitle}>{item.title}</Text>
                {item.unread ? <View style={styles.dot} /> : null}
              </View>
              <MaterialCommunityIcons name="bell-outline" size={18} color="#0f766e" />
            </View>
            <Text style={styles.message}>{item.message}</Text>
            <Text style={styles.time}>{item.time}</Text>
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
  cardUnread: {
    backgroundColor: '#f0fdf4',
    borderColor: '#86efac',
  },
  cardHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  titleRow: {
    alignItems: 'center',
    flexDirection: 'row',
    flex: 1,
  },
  cardTitle: {
    color: '#0f172a',
    fontSize: 15,
    fontWeight: '700',
    marginRight: 6,
  },
  dot: {
    backgroundColor: '#16a34a',
    borderRadius: 999,
    height: 8,
    width: 8,
  },
  message: {
    color: '#334155',
    fontSize: 13,
    lineHeight: 20,
    marginBottom: 8,
  },
  time: {
    color: '#166534',
    fontSize: 12,
  },
});
