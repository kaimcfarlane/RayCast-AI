import { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Platform, Alert } from 'react-native';
import { Link } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { GradientColors, AccentColor } from '@/constants/theme';
import { startRegistration, wearablesAvailable } from '@/lib/wearables';

export default function ConnectScreen() {
  const insets = useSafeAreaInsets();
  const [pairingStarted, setPairingStarted] = useState(false);

  const onStartPairing = async () => {
    console.log('[Connect] onStartPairing: wearablesAvailable=', wearablesAvailable);
    if (!wearablesAvailable) {
      if (Platform.OS !== 'ios') {
        Alert.alert('Not available', 'Glasses pairing is only supported on iOS.');
      } else {
        Alert.alert(
          'Wearables module not loaded',
          "The native Wearables code is only in the app when you build the iOS app (it's not added by the dev server). Rebuild and install with:\n\nnpx expo run:ios --device\n\nThen connect this app to your tunnel or LAN URL as usual."
        );
      }
      return;
    }
    setPairingStarted(true);
    console.log('[Connect] onStartPairing: calling startRegistration()...');
    try {
      await startRegistration();
      console.log('[Connect] onStartPairing: startRegistration() returned (Meta AI should have opened)');
      // Success: Meta AI should have opened. User returns via raycastai://
    } catch (e: unknown) {
      const message =
        typeof e === 'object' && e !== null && 'message' in e
          ? String((e as { message: string }).message)
          : e instanceof Error
            ? e.message
            : String(e);
      console.warn('[Connect] onStartPairing: startRegistration failed', e);
      console.warn('[Connect] onStartPairing: message=', message);
      setPairingStarted(false);
      Alert.alert(
        'Could not open Meta AI',
        message.includes('error 1')
          ? message
          : message + '\n\nMake sure the Meta AI app is installed (search "Meta View" or "Meta AI" in the App Store), then try again.'
      );
    }
  };

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
            <Text style={styles.statusText}>
              {pairingStarted
                ? 'Opening Meta AI… Complete registration there, then return here.'
                : 'Register this app with Meta AI, then your glasses can connect.'}
            </Text>
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
            <Text style={styles.stepItem}>1. In Meta AI app: turn on Developer Mode (Profile → Settings → Developer mode)</Text>
            <Text style={styles.stepItem}>2. Turn on your glasses and enable Bluetooth</Text>
            <Text style={styles.stepItem}>3. Tap "Start Pairing" — approve connecting RayCast AI in Meta AI if prompted</Text>
            <Text style={styles.stepItem}>4. Return to this app after authorizing</Text>
            <Text style={[styles.stepItem, styles.stepTip]}>If Meta AI opens to the home screen: open Menu → Device settings and look for “Connected apps” or “Developer” to add or approve RayCast AI.</Text>
          </View>

          <TouchableOpacity style={styles.primaryButtonWrap} activeOpacity={0.8} onPress={onStartPairing}>
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
  stepTip: {
    marginTop: 4,
    fontSize: 13,
    color: '#888',
    fontStyle: 'italic',
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
