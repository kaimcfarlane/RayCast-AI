import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Link } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { DarkTheme } from '@/constants/theme';
import { Button } from '@/components/ui/button';
import { AnimatedIconButton } from '@/components/ui/animated-icon-button';
import { MenuOverlay } from '@/components/menu-overlay';

export default function WelcomeScreen() {
  const insets = useSafeAreaInsets();
  const [menuVisible, setMenuVisible] = useState(false);

  return (
    <>
      <StatusBar hidden />
      <View style={[styles.container, { paddingTop: insets.top + 16 }]}>
        <MenuOverlay visible={menuVisible} onClose={() => setMenuVisible(false)} />

        {/* Hamburger menu */}
        <AnimatedIconButton style={styles.menuButton} onPress={() => setMenuVisible(true)}>
          <Ionicons name="menu" size={22} color="#FFF" />
        </AnimatedIconButton>

        {/* Title */}
        <Text style={styles.title}>Welcome to{'\n'}RayCast AI!</Text>

        {/* Feature Cards */}
        <ScrollView
          style={styles.scrollArea}
          contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 24 }]}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.featuresList}>
            <FeatureCard
              icon="eye"
              title="Real-Time Vision"
              description="AI sees what you see and understands your environment"
            />
            <FeatureCard
              icon="mic"
              title="Voice Interaction"
              description="Speak naturally and get instant, context-aware responses"
            />
            <FeatureCard
              icon="star"
              title="Smart Assistance"
              description="Task focused modes for chess, navigation, reading, and more"
            />
            <FeatureCard
              icon="shield-checkmark"
              title="Privacy First"
              description="Your data stays secure with privacy-by-design controls"
            />
          </View>

          {/* Buttons */}
          <View style={styles.buttonsContainer}>
            <Link href="/connect" asChild>
              <Button title="Get Started" variant="primary" />
            </Link>
            <Button title="Learn More" variant="secondary" />
          </View>
        </ScrollView>
      </View>
    </>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  description: string;
}) {
  return (
    <View style={styles.featureCard}>
      <View style={styles.featureIconCircle}>
        <Ionicons name={icon} size={22} color="#A0A0B8" />
      </View>
      <View style={styles.featureText}>
        <Text style={styles.featureTitle}>{title}</Text>
        <Text style={styles.featureDescription}>{description}</Text>
      </View>
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
    marginBottom: 24,
    textAlign: 'center',
  },
  scrollArea: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 4,
  },
  featuresList: {
    gap: 14,
    marginBottom: 28,
  },
  featureCard: {
    backgroundColor: DarkTheme.surface,
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  featureIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: DarkTheme.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  featureText: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: DarkTheme.text,
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 14,
    color: DarkTheme.textSecondary,
    lineHeight: 20,
  },
  buttonsContainer: {
    gap: 14,
    marginTop: 4,
  },
});
