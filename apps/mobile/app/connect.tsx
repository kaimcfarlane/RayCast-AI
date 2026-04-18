import { useState } from 'react';
import { View, Text, StyleSheet, Platform, Alert, ScrollView } from 'react-native';
import { Link } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { GradientColors, DarkTheme } from '@/constants/theme';
import { startRegistration, wearablesAvailable } from '@/lib/wearables';
import { MenuOverlay } from '@/components/menu-overlay';
import { AnimatedIconButton } from '@/components/ui/animated-icon-button';
import { Button } from '@/components/ui/button';

export default function ConnectScreen() {
  const insets = useSafeAreaInsets();
  const [pairingStarted, setPairingStarted] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);

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
    <View style={[styles.container, { paddingTop: insets.top + 16 }]}>
      <MenuOverlay visible={menuVisible} onClose={() => setMenuVisible(false)} />

      {/* Hamburger menu */}
      <AnimatedIconButton style={styles.menuButton} onPress={() => setMenuVisible(true)}>
        <Ionicons name="menu" size={22} color="#FFF" />
      </AnimatedIconButton>

      {/* Title */}
      <Text style={styles.title}>Connect Your Glasses</Text>
      <Text style={styles.subtitle}>Pair Meta Ray-Ban to start</Text>

      <ScrollView
        style={styles.scrollArea}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 24 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Search card with gradient */}
        <LinearGradient
          colors={GradientColors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.searchCard}
        >
          <Ionicons name="glasses-outline" size={64} color="rgba(255,255,255,0.85)" />
          <Text style={styles.searchText}>
            {pairingStarted ? 'Connecting to glasses...' : 'Searching for devices...'}
          </Text>
        </LinearGradient>

        {/* Connection status card */}
        <View style={styles.statusCard}>
          <View style={styles.bluetoothIcon}>
            <Ionicons
              name="bluetooth"
              size={22}
              color={pairingStarted ? '#FFAA00' : '#FF4444'}
            />
          </View>
          <Text style={styles.statusText}>
            {pairingStarted ? 'Connecting...' : 'Not Connected'}
          </Text>
        </View>

        {/* Setup steps card */}
        <View style={styles.setupCard}>
          <Text style={styles.stepsTitle}>Setup Steps</Text>
          <Text style={styles.stepItem}>
            1. In Meta AI app: turn on Developer Mode (Profile → Settings → Developer mode)
          </Text>
          <Text style={styles.stepItem}>
            2. Turn on your glasses and enable Bluetooth
          </Text>
          <Text style={styles.stepItem}>
            3. Tap &ldquo;Start Pairing&rdquo; — approve connecting RayCast AI in Meta AI if prompted
          </Text>
          <Text style={styles.stepItem}>
            4. Return to this app after authorizing
          </Text>
          <Text style={[styles.stepItem, styles.stepTip]}>
            If Meta AI opens to the home screen: open Menu → Device settings and look for
            &ldquo;Connected apps&rdquo; or &ldquo;Developer&rdquo; to add or approve RayCast AI.
          </Text>
        </View>

        {/* Buttons */}
        <View style={styles.buttonsContainer}>
          <Button
            title={pairingStarted ? 'Connecting...' : 'Start Pairing'}
            variant="primary"
            onPress={onStartPairing}
            disabled={pairingStarted}
          />
          <Link href="/(tabs)" asChild>
            <Button title="Skip for now" variant="secondary" />
          </Link>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: DarkTheme.background,
    paddingHorizontal: 24,
  },
  menuButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: DarkTheme.menuIconBg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 34,
    fontWeight: 'bold',
    color: DarkTheme.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: DarkTheme.textSecondary,
    marginBottom: 24,
  },
  scrollArea: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 4,
  },
  searchCard: {
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
    marginBottom: 16,
  },
  searchText: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 12,
    textAlign: 'center',
  },
  statusCard: {
    backgroundColor: DarkTheme.surface,
    borderRadius: 16,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  bluetoothIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 68, 68, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  statusText: {
    fontSize: 16,
    fontWeight: '600',
    color: DarkTheme.text,
  },
  setupCard: {
    backgroundColor: DarkTheme.surface,
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
  },
  stepsTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: DarkTheme.text,
    marginBottom: 14,
  },
  stepItem: {
    fontSize: 14,
    color: DarkTheme.textSecondary,
    marginBottom: 8,
    lineHeight: 20,
  },
  stepTip: {
    marginTop: 4,
    fontSize: 13,
    color: DarkTheme.textMuted,
    fontStyle: 'italic',
  },
  buttonsContainer: {
    gap: 14,
  },
});
