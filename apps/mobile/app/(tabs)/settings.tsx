import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { ScreenLayout } from '@/components/screen-layout';
import { GradientColors, DarkTheme } from '@/constants/theme';
import { useAuth } from '@/lib/auth-context';

function SettingsIcon({ name }: { name: keyof typeof Ionicons.glyphMap }) {
  return (
    <LinearGradient
      colors={GradientColors}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0 }}
      style={styles.iconBg}
    >
      <Ionicons name={name} size={24} color="white" />
    </LinearGradient>
  );
}

export default function SettingsScreen() {
  const router = useRouter();
  const { user, signOut } = useAuth();

  function handleSignOut() {
    Alert.alert('Sign out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign out',
        style: 'destructive',
        onPress: async () => {
          await signOut();
          router.replace('/login');
        },
      },
    ]);
  }

  return (
    <ScreenLayout title="Settings" subtitle="Preferences & account">
      {user && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          <View style={styles.row}>
            <SettingsIcon name="person-outline" />
            <View style={styles.accountInfo}>
              <Text style={styles.accountName}>{user.displayName ?? 'User'}</Text>
              <Text style={styles.rowSublabel}>{user.email}</Text>
            </View>
          </View>
        </View>
      )}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Device</Text>
        <TouchableOpacity style={styles.row} onPress={() => router.push('/connect')} activeOpacity={0.7}>
          <SettingsIcon name="glasses-outline" />
          <Text style={styles.rowLabel}>Connect glasses</Text>
          <Ionicons name="chevron-forward" size={20} color={DarkTheme.textMuted} />
        </TouchableOpacity>
      </View>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>App</Text>
        <TouchableOpacity style={styles.row}>
          <SettingsIcon name="notifications-outline" />
          <Text style={styles.rowLabel}>Notifications</Text>
          <Ionicons name="chevron-forward" size={20} color={DarkTheme.textMuted} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.row}>
          <SettingsIcon name="lock-closed-outline" />
          <Text style={styles.rowLabel}>Privacy</Text>
          <Ionicons name="chevron-forward" size={20} color={DarkTheme.textMuted} />
        </TouchableOpacity>
      </View>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>About</Text>
        <View style={styles.row}>
          <SettingsIcon name="information-circle-outline" />
          <Text style={styles.rowLabel}>RayCast AI v1.0.0</Text>
        </View>
      </View>
      <View style={styles.section}>
        <TouchableOpacity style={styles.signOutRow} onPress={handleSignOut} activeOpacity={0.7}>
          <Ionicons name="log-out-outline" size={22} color="#FF6B6B" />
          <Text style={styles.signOutText}>Sign out</Text>
        </TouchableOpacity>
      </View>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: DarkTheme.textMuted,
    marginBottom: 12,
    marginLeft: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: DarkTheme.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 8,
  },
  iconBg: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  rowLabel: {
    flex: 1,
    fontSize: 16,
    color: DarkTheme.text,
    marginLeft: 12,
  },
  accountInfo: {
    flex: 1,
    marginLeft: 12,
  },
  accountName: {
    fontSize: 16,
    fontWeight: '600',
    color: DarkTheme.text,
  },
  rowSublabel: {
    fontSize: 13,
    color: DarkTheme.textMuted,
    marginTop: 2,
  },
  signOutRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 107, 107, 0.08)',
    borderRadius: 16,
    padding: 16,
    gap: 12,
  },
  signOutText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FF6B6B',
  },
});
