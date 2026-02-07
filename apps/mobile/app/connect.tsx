import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Link } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { GradientColors, AccentColor } from '@/constants/theme';

export default function ConnectScreen() {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.container}>
        <LinearGradient
          colors={GradientColors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[styles.gradientHeader, { paddingTop: insets.top + 24, paddingBottom: 32 }]}
        >
          <Text style={styles.title}>Connect Glasses</Text>
          <Text style={styles.subtitle}>Pair your Meta Ray-Ban</Text>
        </LinearGradient>

        <ScrollView
          style={styles.whiteSection}
          contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 24 }]}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.statusCard}>
            <View style={styles.glassesIcon}>
              <Ionicons name="glasses-outline" size={60} color="#CCC" />
            </View>
            <Text style={styles.statusText}>Searching for devices...</Text>
          </View>

          <View style={styles.errorCard}>
            <View style={styles.errorIcon}>
              <Ionicons name="close-circle" size={24} color="#FF4444" />
            </View>
            <View style={styles.errorTextContainer}>
              <Text style={styles.errorTitle}>Connection Status</Text>
              <Text style={styles.errorMessage}>Not Connected</Text>
            </View>
          </View>

          <View style={styles.setupSteps}>
            <Text style={styles.stepsTitle}>Setup Steps</Text>
            <Text style={styles.stepItem}>1. Turn on your Meta Ray-Ban glasses</Text>
            <Text style={styles.stepItem}>2. Enable Bluetooth on your phone</Text>
            <Text style={styles.stepItem}>3. Hold glasses near your phone</Text>
            <Text style={styles.stepItem}>4. Tap "Start Pairing" below</Text>
          </View>

          <TouchableOpacity style={styles.primaryButtonWrap} activeOpacity={0.8}>
            <LinearGradient colors={GradientColors} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.primaryButton}>
              <Text style={styles.primaryButtonText}>Start Pairing</Text>
            </LinearGradient>
          </TouchableOpacity>

          <Link href="/(tabs)" asChild>
            <TouchableOpacity style={styles.skipButton} activeOpacity={0.8}>
              <Text style={styles.skipButtonText}>Skip for Now</Text>
            </TouchableOpacity>
          </Link>
        </ScrollView>
      </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  gradientHeader: {
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  whiteSection: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  statusCard: {
    backgroundColor: '#F8F8F8',
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
    backgroundColor: '#F8F8F8',
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
    backgroundColor: '#F8F8F8',
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
  primaryButtonWrap: {
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 12,
  },
  primaryButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonText: {
    color: 'white',
    fontSize: 17,
    fontWeight: '600',
  },
  skipButton: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  skipButtonText: {
    color: AccentColor,
    fontSize: 15,
    fontWeight: '500',
  },
});
