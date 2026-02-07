import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { Link } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

export default function ConnectScreen() {
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
          <Text style={styles.title}>Connect Glasses</Text>
          <Text style={styles.subtitle}>Pair your Meta Ray-Ban</Text>

          {/* Connection Status Card */}
          <View style={styles.statusCard}>
            <View style={styles.glassesIcon}>
              <Ionicons name="glasses-outline" size={60} color="#CCC" />
            </View>
            <Text style={styles.statusText}>Searching for devices...</Text>
            <ActivityIndicator size="large" color="#7B6FD0" style={{ marginTop: 16 }} />
          </View>

          {/* Error State */}
          <View style={styles.errorCard}>
            <View style={styles.errorIcon}>
              <Ionicons name="close-circle" size={24} color="#FF4444" />
            </View>
            <View style={styles.errorTextContainer}>
              <Text style={styles.errorTitle}>Connection Status</Text>
              <Text style={styles.errorMessage}>Not Connected</Text>
            </View>
          </View>

          {/* Setup Steps */}
          <View style={styles.setupSteps}>
            <Text style={styles.stepsTitle}>Setup Steps</Text>
            <Text style={styles.stepItem}>1. Turn on your Meta Ray-Ban glasses</Text>
            <Text style={styles.stepItem}>2. Enable Bluetooth on your phone</Text>
            <Text style={styles.stepItem}>3. Hold glasses near your phone</Text>
            <Text style={styles.stepItem}>4. Tap "Start Pairing" below</Text>
          </View>

          {/* Start Pairing Button */}
          <TouchableOpacity style={styles.primaryButton}>
            <Text style={styles.primaryButtonText}>Start Pairing</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.skipButton}>
            <Text style={styles.skipButtonText}>Skip for Now</Text>
          </TouchableOpacity>
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
    marginBottom: 32,
  },
  statusCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    marginBottom: 20,
  },
  glassesIcon: {
    marginBottom: 16,
  },
  statusText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  errorCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  errorIcon: {
    marginRight: 12,
  },
  errorTextContainer: {
    flex: 1,
  },
  errorTitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  errorMessage: {
    fontSize: 16,
    color: '#333',
    fontWeight: '600',
  },
  setupSteps: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
  },
  stepsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  stepItem: {
    fontSize: 15,
    color: '#555',
    marginBottom: 8,
    lineHeight: 22,
  },
  primaryButton: {
    backgroundColor: 'white',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  primaryButtonText: {
    color: '#7B6FD0',
    fontSize: 17,
    fontWeight: '600',
  },
  skipButton: {
    backgroundColor: 'transparent',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 20,
  },
  skipButtonText: {
    color: 'white',
    fontSize: 15,
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
