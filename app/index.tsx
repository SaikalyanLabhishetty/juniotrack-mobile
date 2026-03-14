import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Href, router } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type Role = 'teacher' | 'parent';
type FeatureId = 'attendance' | 'homework' | 'announcements' | 'reports' | 'notifications';

type DashboardFeature = {
  id: FeatureId;
  title: string;
  shortLabel: string;
  icon: React.ComponentProps<typeof MaterialCommunityIcons>['name'];
  comingSoon: boolean;
  route?: Href;
};

type RoleMeta = {
  title: string;
  subtitle: string;
  icon: React.ComponentProps<typeof MaterialCommunityIcons>['name'];
};

let lastSelectedRole: Role = 'teacher';
let lastSelectedTabByRole: Record<Role, FeatureId> = {
  teacher: 'attendance',
  parent: 'attendance',
};

const teacherFeatures: DashboardFeature[] = [
  {
    id: 'attendance',
    title: 'Attendance',
    shortLabel: 'Attendance',
    icon: 'clipboard-check-outline',
    comingSoon: false,
    route: '/teacher/attendance',
  },
  {
    id: 'homework',
    title: 'Homework',
    shortLabel: 'Homework',
    icon: 'book-open-variant',
    comingSoon: false,
    route: '/teacher/homework',
  },
  {
    id: 'announcements',
    title: 'Announcements',
    shortLabel: 'Announce',
    icon: 'bullhorn-outline',
    comingSoon: true,
  },
  {
    id: 'reports',
    title: 'Reports',
    shortLabel: 'Reports',
    icon: 'file-chart-outline',
    comingSoon: false,
    route: '/teacher/reports',
  },
  {
    id: 'notifications',
    title: 'Class Notifications',
    shortLabel: 'Notify',
    icon: 'bell-ring-outline',
    comingSoon: true,
  },
];

const parentFeatures: DashboardFeature[] = [
  {
    id: 'attendance',
    title: 'Attendance',
    shortLabel: 'Attendance',
    icon: 'calendar-check-outline',
    comingSoon: false,
    route: '/parent/attendance',
  },
  {
    id: 'homework',
    title: 'Homework',
    shortLabel: 'Homework',
    icon: 'book-open-variant',
    comingSoon: false,
    route: '/parent/homework',
  },
  {
    id: 'announcements',
    title: 'Announcements',
    shortLabel: 'Announce',
    icon: 'bullhorn-outline',
    comingSoon: false,
    route: '/parent/announcements',
  },
  {
    id: 'reports',
    title: 'Reports',
    shortLabel: 'Reports',
    icon: 'file-chart-outline',
    comingSoon: false,
    route: '/parent/reports',
  },
  {
    id: 'notifications',
    title: 'Notifications',
    shortLabel: 'Notify',
    icon: 'bell-ring-outline',
    comingSoon: false,
    route: '/parent/notifications',
  },
];

const roleMeta: Record<Role, RoleMeta> = {
  teacher: {
    title: 'Teacher Dashboard',
    subtitle: 'Use bottom navbar to open modules',
    icon: 'account-tie-outline',
  },
  parent: {
    title: 'Parent Dashboard',
    subtitle: 'Track your child progress and updates',
    icon: 'account-heart-outline',
  },
};

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const [role, setRole] = useState<Role>(lastSelectedRole);
  const [activeTab, setActiveTab] = useState<FeatureId>(lastSelectedTabByRole[lastSelectedRole]);

  const currentFeatures = role === 'teacher' ? teacherFeatures : parentFeatures;
  const dashboard = roleMeta[role];

  const onRoleChange = (nextRole: Role) => {
    if (role === nextRole) {
      return;
    }

    setRole(nextRole);
    lastSelectedRole = nextRole;
    setActiveTab(lastSelectedTabByRole[nextRole]);
  };

  const onPressFeature = (feature: DashboardFeature) => {
    if (feature.comingSoon) {
      Alert.alert('Coming soon', `${feature.title} will be added soon.`);
      return;
    }

    setActiveTab(feature.id);
    lastSelectedTabByRole[role] = feature.id;

    if (feature.route) {
      router.push(feature.route);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={[styles.switchWrap, { marginTop: insets.top + 8 }]}>
          <Pressable
            onPress={() => onRoleChange('teacher')}
            style={[styles.switchButton, role === 'teacher' && styles.switchButtonActive]}>
            <Text style={[styles.switchText, role === 'teacher' && styles.switchTextActive]}>Teacher</Text>
          </Pressable>
          <Pressable
            onPress={() => onRoleChange('parent')}
            style={[styles.switchButton, role === 'parent' && styles.switchButtonActive]}>
            <Text style={[styles.switchText, role === 'parent' && styles.switchTextActive]}>Parent</Text>
          </Pressable>
        </View>

        <View style={styles.centerSection}>
          <View style={styles.centerIconWrap}>
            <MaterialCommunityIcons name={dashboard.icon} size={58} color="#86efac" />
          </View>
          <Text style={styles.title}>{dashboard.title}</Text>
          <Text style={styles.subtitle}>{dashboard.subtitle}</Text>
        </View>

        <View style={styles.navBar}>
          {currentFeatures.map((feature) => {
            const isActive = activeTab === feature.id;
            const baseColor = feature.comingSoon && !isActive ? '#4e8b62' : '#86efac';
            const iconColor = isActive ? '#4ade80' : baseColor;

            return (
              <Pressable
                key={feature.id}
                onPress={() => onPressFeature(feature)}
                style={({ pressed }) => [styles.navItem, pressed && styles.navItemPressed]}>
                <View style={[styles.activeLine, isActive && styles.activeLineVisible]} />
                <MaterialCommunityIcons name={feature.icon} size={24} color={iconColor} />
                <Text
                  style={[
                    styles.navText,
                    isActive && styles.navTextActive,
                    feature.comingSoon && !isActive && styles.navTextMuted,
                  ]}>
                  {feature.shortLabel}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: '#daffd9',
    flex: 1,
  },
  container: {
    flex: 1,
    justifyContent: 'space-between',
  },
  switchWrap: {
    backgroundColor: '#d1fae5',
    borderColor: '#86efac',
    borderRadius: 999,
    borderWidth: 1,
    flexDirection: 'row',
    marginHorizontal: 16,
    padding: 4,
  },
  switchButton: {
    alignItems: 'center',
    borderRadius: 999,
    flex: 1,
    paddingVertical: 8,
  },
  switchButtonActive: {
    backgroundColor: '#064e3b',
  },
  switchText: {
    color: '#166534',
    fontSize: 14,
    fontWeight: '600',
  },
  switchTextActive: {
    color: '#bbf7d0',
  },
  centerSection: {
    alignItems: 'center',
    flex: 1,
    gap: 10,
    justifyContent: 'center',
  },
  centerIconWrap: {
    alignItems: 'center',
    backgroundColor: '#064e3b',
    borderColor: '#166534',
    borderRadius: 52,
    borderWidth: 1,
    height: 104,
    justifyContent: 'center',
    width: 104,
  },
  title: {
    color: '#064e3b',
    fontSize: 34,
    fontWeight: '700',
    textAlign: 'center',
  },
  subtitle: {
    color: '#064e3b',
    fontSize: 15,
    textAlign: 'center',
  },
  navBar: {
    backgroundColor: '#052e16',
    borderTopColor: '#166534',
    borderTopWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    overflow: 'hidden',
    paddingBottom: 12,
    paddingTop: 6,
  },
  navItem: {
    alignItems: 'center',
    flex: 1,
    gap: 5,
    paddingTop: 12,
    position: 'relative',
  },
  navItemPressed: {
    opacity: 0.75,
  },
  activeLine: {
    backgroundColor: 'transparent',
    borderRadius: 999,
    height: 3,
    left: '20%',
    position: 'absolute',
    top: 0,
    width: '60%',
  },
  activeLineVisible: {
    backgroundColor: '#4ade80',
  },
  navText: {
    color: '#86efac',
    fontSize: 11,
    fontWeight: '500',
  },
  navTextActive: {
    color: '#4ade80',
    fontWeight: '700',
  },
  navTextMuted: {
    color: '#4e8b62',
  },
});
