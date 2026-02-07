import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Link } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { GradientColors, AccentColor } from '@/constants/theme';

export default function WelcomeScreen() {
  const insets = useSafeAreaInsets();

  return (
    <>
      <StatusBar hidden />
      <View style={styles.container}>
        {/* Top: Blue-to-purple gradient header only */}
        <LinearGradient
          colors={GradientColors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[styles.gradientHeader, { paddingTop: insets.top + 24, paddingBottom: 32 }]}
        >
          <Text style={styles.title}>Welcome to{'\n'}RayCast AI</Text>
          <Text style={styles.subtitle}>Your intelligent glasses companion</Text>
        </LinearGradient>

        {/* Bottom: White background — features + buttons, no nav */}
        <ScrollView
          style={styles.whiteSection}
          contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 24 }]}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.featuresList}>
            <View style={styles.featureItem}>
              <LinearGradient
                colors={GradientColors}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.iconContainer}
              >
                <Ionicons name="eye" size={24} color="white" />
              </LinearGradient>
              <View style={styles.featureText}>
                <Text style={styles.featureTitle}>Real-Time Vision</Text>
                <Text style={styles.featureDescription}>
                  AI sees what you see and understands your environment
                </Text>
              </View>
            </View>

            <View style={styles.featureItem}>
              <LinearGradient
                colors={GradientColors}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.iconContainer}
              >
                <Ionicons name="mic" size={24} color="white" />
              </LinearGradient>
              <View style={styles.featureText}>
                <Text style={styles.featureTitle}>Voice Interaction</Text>
                <Text style={styles.featureDescription}>
                  Speak naturally and get instant, context-aware responses
                </Text>
              </View>
            </View>

            <View style={styles.featureItem}>
              <LinearGradient
                colors={GradientColors}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.iconContainer}
              >
                <Ionicons name="bulb" size={24} color="white" />
              </LinearGradient>
              <View style={styles.featureText}>
                <Text style={styles.featureTitle}>Smart Assistance</Text>
                <Text style={styles.featureDescription}>
                  Task-focused modes for chess, navigation, reading, and more
                </Text>
              </View>
            </View>

            <View style={styles.featureItem}>
              <LinearGradient
                colors={GradientColors}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.iconContainer}
              >
                <Ionicons name="lock-closed" size={24} color="white" />
              </LinearGradient>
              <View style={styles.featureText}>
                <Text style={styles.featureTitle}>Privacy First</Text>
                <Text style={styles.featureDescription}>
                  Your data stays secure with privacy-by-design controls
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.buttonsContainer}>
            <Link href="/connect" asChild>
              <TouchableOpacity style={styles.primaryButtonWrap} activeOpacity={0.8}>
                <LinearGradient
                  colors={GradientColors}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.primaryButton}
                >
                  <Text style={styles.primaryButtonText}>Get Started</Text>
                </LinearGradient>
              </TouchableOpacity>
            </Link>

            <TouchableOpacity style={styles.secondaryButton} activeOpacity={0.8}>
              <Text style={styles.secondaryButtonText}>Learn More</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    </>
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
    paddingTop: 32,
  },
  featuresList: {
    gap: 24,
    marginBottom: 32,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
    overflow: 'hidden',
  },
  featureText: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 15,
    color: '#666',
    lineHeight: 22,
  },
  buttonsContainer: {
    gap: 12,
    marginTop: 8,
  },
  primaryButtonWrap: {
    borderRadius: 12,
    overflow: 'hidden',
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
  secondaryButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: AccentColor,
  },
  secondaryButtonText: {
    color: AccentColor,
    fontSize: 17,
    fontWeight: '600',
  },
});
