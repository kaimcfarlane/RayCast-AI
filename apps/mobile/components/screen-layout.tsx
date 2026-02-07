import { View, Text, StyleSheet, ScrollView, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ReactNode } from 'react';

type ScreenLayoutProps = {
  title: string;
  subtitle?: string;
  children: ReactNode;
  headerRight?: ReactNode;
  contentStyle?: ViewStyle;
};

export function ScreenLayout({ title, subtitle, children, headerRight, contentStyle }: ScreenLayoutProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.container}>
        <LinearGradient
          colors={['#8B7FD8', '#7B6FD0']}
          style={[styles.gradientHeader, { paddingTop: insets.top + 24, paddingBottom: 24 }]}
        >
          <View style={styles.headerRow}>
            <View style={styles.headerText}>
              <Text style={styles.title}>{title}</Text>
              {subtitle != null && <Text style={styles.subtitle}>{subtitle}</Text>}
            </View>
            {headerRight}
          </View>
        </LinearGradient>
        <ScrollView
          style={styles.whiteSection}
          contentContainerStyle={[styles.scrollContent, contentStyle, { paddingBottom: insets.bottom + 24 }]}
          showsVerticalScrollIndicator={false}
        >
          {children}
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
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
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
});
