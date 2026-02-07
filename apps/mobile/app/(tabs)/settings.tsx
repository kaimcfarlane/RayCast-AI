import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { ScreenLayout } from '@/components/screen-layout';
import { GradientColors } from '@/constants/theme';

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
  return (
    <ScreenLayout title="Settings" subtitle="Preferences & account">
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Device</Text>
        <TouchableOpacity style={styles.row}>
          <SettingsIcon name="glasses-outline" />
          <Text style={styles.rowLabel}>Connect glasses</Text>
          <Ionicons name="chevron-forward" size={20} color="#999" />
        </TouchableOpacity>
      </View>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>App</Text>
        <TouchableOpacity style={styles.row}>
          <SettingsIcon name="notifications-outline" />
          <Text style={styles.rowLabel}>Notifications</Text>
          <Ionicons name="chevron-forward" size={20} color="#999" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.row}>
          <SettingsIcon name="lock-closed-outline" />
          <Text style={styles.rowLabel}>Privacy</Text>
          <Ionicons name="chevron-forward" size={20} color="#999" />
        </TouchableOpacity>
      </View>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>About</Text>
        <View style={styles.row}>
          <SettingsIcon name="information-circle-outline" />
          <Text style={styles.rowLabel}>RayCast AI v1.0.0</Text>
        </View>
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
    color: '#999',
    marginBottom: 12,
    marginLeft: 4,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F8F8',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
  },
  iconBg: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  rowLabel: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    marginLeft: 12,
  },
});
