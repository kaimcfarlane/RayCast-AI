import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { ScreenLayout } from '@/components/screen-layout';
import { GradientColors, AccentColor } from '@/constants/theme';

export default function HomeScreen() {
  return (
    <ScreenLayout title="Dashboard" subtitle="Ready to assist">
      {/* Not connected state */}
      <View style={styles.connectionCard}>
        <View style={styles.notConnectedIcon}>
          <Ionicons name="close-circle" size={24} color="#FF4444" />
        </View>
        <View style={styles.connectionInfo}>
          <Text style={styles.connectionDevice}>Meta Ray-Ban Gen 2</Text>
          <Text style={styles.connectionStatus}>Not connected</Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Select Task Mode</Text>
      <View style={styles.taskGrid}>
        <View style={styles.taskRow}>
          <TouchableOpacity style={styles.taskCard}>
            <View style={[styles.taskIcon, { backgroundColor: AccentColor }]}>
              <Ionicons name="grid" size={28} color="white" />
            </View>
            <Text style={styles.taskLabel}>Chess</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.taskCard}>
            <View style={[styles.taskIcon, { backgroundColor: '#E0E0E0' }]}>
              <Ionicons name="navigate" size={28} color="#999" />
            </View>
            <Text style={styles.taskLabel}>Navigate</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.taskRow}>
          <TouchableOpacity style={styles.taskCard}>
            <View style={[styles.taskIcon, { backgroundColor: '#E0E0E0' }]}>
              <Ionicons name="search" size={28} color="#999" />
            </View>
            <Text style={styles.taskLabel}>Find Object</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.taskCard}>
            <View style={[styles.taskIcon, { backgroundColor: '#E0E0E0' }]}>
              <Ionicons name="book" size={28} color="#999" />
            </View>
            <Text style={styles.taskLabel}>Read Text</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.taskRow}>
          <TouchableOpacity style={styles.taskCard}>
            <View style={[styles.taskIcon, { backgroundColor: '#E0E0E0' }]}>
              <Ionicons name="chatbubble" size={28} color="#999" />
            </View>
            <Text style={styles.taskLabel}>Describe</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.taskCard}>
            <View style={[styles.taskIcon, { backgroundColor: '#E0E0E0' }]}>
              <Ionicons name="bulb" size={28} color="#999" />
            </View>
            <Text style={styles.taskLabel}>General</Text>
          </TouchableOpacity>
        </View>
      </View>

      <TouchableOpacity style={styles.startButtonWrap} activeOpacity={0.8}>
        <LinearGradient colors={GradientColors} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.startButton}>
          <Text style={styles.startButtonText}>Start Session</Text>
        </LinearGradient>
      </TouchableOpacity>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  connectionCard: {
    backgroundColor: '#F8F8F8',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  notConnectedIcon: {
    marginRight: 12,
  },
  connectionInfo: {
    flex: 1,
  },
  connectionDevice: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  connectionStatus: {
    fontSize: 14,
    color: '#666',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 16,
  },
  taskGrid: {
    gap: 12,
    marginBottom: 24,
  },
  taskRow: {
    flexDirection: 'row',
    gap: 12,
  },
  taskCard: {
    flex: 1,
    backgroundColor: '#F8F8F8',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 100,
  },
  taskIcon: {
    width: 56,
    height: 56,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  taskLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    textAlign: 'center',
  },
  startButtonWrap: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  startButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  startButtonText: {
    color: 'white',
    fontSize: 17,
    fontWeight: '600',
  },
});
