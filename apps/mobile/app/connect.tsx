import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Link } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { GradientColors, DarkTheme } from '@/constants/theme';
import { Button } from '@/components/ui/button';
import { MenuOverlay } from '@/components/menu-overlay';

export default function ConnectScreen() {
  const insets = useSafeAreaInsets();
  const [menuVisible, setMenuVisible] = useState(false);

  return (
    <View style={[styles.container, { paddingTop: insets.top + 16 }]}>
      <MenuOverlay visible={menuVisible} onClose={() => setMenuVisible(false)} />

      {/* Hamburger menu */}
      <TouchableOpacity style={styles.menuButton} onPress={() => setMenuVisible(true)}>
        <Ionicons name="menu" size={22} color="#FFF" />
      </TouchableOpacity>

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
          <Text style={styles.searchText}>Searching for devices...</Text>
        </LinearGradient>

        {/* Connection status card */}
        <View style={styles.statusCard}>
          <View style={styles.bluetoothIcon}>
            <Ionicons name="bluetooth" size={22} color="#FF4444" />
          </View>
          <Text style={styles.statusText}>Not Connected</Text>
        </View>

        {/* Setup steps card */}
        <View style={styles.setupCard}>
          <Text style={styles.stepsTitle}>Setup Steps</Text>
          <Text style={styles.stepItem}>1. Turn on your Meta Ray-Ban glasses</Text>
          <Text style={styles.stepItem}>2. Enable Bluetooth on your phone</Text>
          <Text style={styles.stepItem}>3. Hold glasses near your phone</Text>
          <Text style={styles.stepItem}>4. Tap "Start Pairing" below</Text>
        </View>

        {/* Buttons */}
        <View style={styles.buttonsContainer}>
          <Button title="Start Pairing" variant="primary" />
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
  buttonsContainer: {
    gap: 14,
  },
});
