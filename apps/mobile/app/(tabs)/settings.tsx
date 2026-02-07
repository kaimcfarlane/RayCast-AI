import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ScreenLayout } from '@/components/screen-layout';

export default function SettingsScreen() {
  return (
    <ScreenLayout title="Settings" subtitle="Preferences & account">
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Device</Text>
        <TouchableOpacity style={styles.row}>
          <Ionicons name="glasses-outline" size={24} color="#7B6FD0" />
          <Text style={styles.rowLabel}>Connect glasses</Text>
          <Ionicons name="chevron-forward" size={20} color="#999" />
        </TouchableOpacity>
      </View>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>App</Text>
        <TouchableOpacity style={styles.row}>
          <Ionicons name="notifications-outline" size={24} color="#7B6FD0" />
          <Text style={styles.rowLabel}>Notifications</Text>
          <Ionicons name="chevron-forward" size={20} color="#999" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.row}>
          <Ionicons name="lock-closed-outline" size={24} color="#7B6FD0" />
          <Text style={styles.rowLabel}>Privacy</Text>
          <Ionicons name="chevron-forward" size={20} color="#999" />
        </TouchableOpacity>
      </View>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>About</Text>
        <View style={styles.row}>
          <Ionicons name="information-circle-outline" size={24} color="#7B6FD0" />
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
  rowLabel: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    marginLeft: 12,
  },
});
