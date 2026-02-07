import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Link } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

export default function DashboardScreen() {
  return (
    <LinearGradient
      colors={['#8B7FD8', '#7B6FD0']}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.time}>9:41</Text>
          <View style={styles.notch} />
          <View style={styles.statusIcons}>
            <Ionicons name="cellular" size={16} color="white" />
            <Ionicons name="wifi" size={16} color="white" style={{ marginLeft: 4 }} />
            <Text style={styles.battery}>100%</Text>
          </View>
        </View>

        {/* Main Content */}
        <View style={styles.content}>
          <Text style={styles.title}>Dashboard</Text>
          <Text style={styles.subtitle}>Ready to assist</Text>

          {/* Connection Status */}
          <View style={styles.connectionCard}>
            <View style={styles.connectedIcon}>
              <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />
            </View>
            <View style={styles.connectionInfo}>
              <Text style={styles.connectionDevice}>Meta Ray-Ban Gen 2</Text>
              <Text style={styles.connectionStatus}>Connected • 89% Battery</Text>
            </View>
          </View>

          {/* Task Mode Selection */}
          <View style={styles.taskModeSection}>
            <Text style={styles.sectionTitle}>Select Task Mode</Text>
            
            <View style={styles.taskGrid}>
              <View style={styles.taskRow}>
                <TouchableOpacity style={styles.taskCard}>
                  <View style={[styles.taskIcon, { backgroundColor: '#7B6FD0' }]}>
                    <Ionicons name="grid" size={28} color="white" />
                  </View>
                  <Text style={styles.taskLabel}>Chess</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.taskCard}>
                  <View style={[styles.taskIcon, { backgroundColor: '#7B6FD0' }]}>
                    <Ionicons name="navigate" size={28} color="white" />
                  </View>
                  <Text style={styles.taskLabel}>Navigate</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.taskRow}>
                <TouchableOpacity style={styles.taskCard}>
                  <View style={[styles.taskIcon, { backgroundColor: '#7B6FD0' }]}>
                    <Ionicons name="search" size={28} color="white" />
                  </View>
                  <Text style={styles.taskLabel}>Find Object</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.taskCard}>
                  <View style={[styles.taskIcon, { backgroundColor: '#7B6FD0' }]}>
                    <Ionicons name="book" size={28} color="white" />
                  </View>
                  <Text style={styles.taskLabel}>Read Text</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.taskRow}>
                <TouchableOpacity style={styles.taskCard}>
                  <View style={[styles.taskIcon, { backgroundColor: '#7B6FD0' }]}>
                    <Ionicons name="chatbubble" size={28} color="white" />
                  </View>
                  <Text style={styles.taskLabel}>Describe</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.taskCard}>
                  <View style={[styles.taskIcon, { backgroundColor: '#7B6FD0' }]}>
                    <Ionicons name="bulb" size={28} color="white" />
                  </View>
                  <Text style={styles.taskLabel}>General</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Start Session Button */}
          <Link href="/session" asChild>
            <TouchableOpacity style={styles.startButton}>
              <Text style={styles.startButtonText}>Start Session</Text>
            </TouchableOpacity>
          </Link>
        </View>

        {/* Bottom Navigation */}
        <View style={styles.bottomNav}>
          <View style={styles.navItem}>
            <Ionicons name="home" size={24} color="#7B6FD0" />
            <Text style={styles.navText}>Home</Text>
          </View>
          <View style={styles.navItem}>
            <Ionicons name="book" size={24} color="#999" />
            <Text style={[styles.navText, { color: '#999' }]}>History</Text>
          </View>
          <View style={styles.navItem}>
            <Ionicons name="time" size={24} color="#999" />
            <Text style={[styles.navText, { color: '#999' }]}>History</Text>
          </View>
          <View style={styles.navItem}>
            <Ionicons name="settings" size={24} color="#999" />
            <Text style={[styles.navText, { color: '#999' }]}>Settings</Text>
          </View>
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 8,
  },
  time: {
    color: 'white',
    fontSize: 15,
    fontWeight: '600',
  },
  notch: {
    width: 120,
    height: 30,
    backgroundColor: 'black',
    borderRadius: 20,
    position: 'absolute',
    top: 0,
    left: '50%',
    marginLeft: -60,
  },
  statusIcons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  battery: {
    color: 'white',
    fontSize: 12,
    marginLeft: 4,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 40,
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 24,
  },
  connectionCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  connectedIcon: {
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
  taskModeSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: 'white',
    marginBottom: 16,
  },
  taskGrid: {
    gap: 12,
  },
  taskRow: {
    flexDirection: 'row',
    gap: 12,
  },
  taskCard: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
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
  startButton: {
    backgroundColor: 'white',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 20,
  },
  startButtonText: {
    color: '#7B6FD0',
    fontSize: 17,
    fontWeight: '600',
  },
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 12,
    paddingBottom: 28,
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  navItem: {
    alignItems: 'center',
  },
  navText: {
    fontSize: 11,
    color: '#7B6FD0',
    marginTop: 4,
  },
});
