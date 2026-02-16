import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ViewStyle, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ReactNode } from 'react';
import { DarkTheme } from '@/constants/theme';
import { MenuOverlay } from '@/components/menu-overlay';

type ScreenLayoutProps = {
  title: string;
  subtitle?: string;
  children: ReactNode;
  headerRight?: ReactNode;
  contentStyle?: ViewStyle;
};

export function ScreenLayout({ title, subtitle, children, headerRight, contentStyle }: ScreenLayoutProps) {
  const insets = useSafeAreaInsets();
  const [menuVisible, setMenuVisible] = useState(false);

  return (
    <View style={[styles.container, { paddingTop: insets.top + 16 }]}>
      <MenuOverlay visible={menuVisible} onClose={() => setMenuVisible(false)} />

      {/* Top row: hamburger + optional right element */}
      <View style={styles.topRow}>
        <TouchableOpacity style={styles.menuButton} onPress={() => setMenuVisible(true)}>
          <Ionicons name="menu" size={22} color="#FFF" />
        </TouchableOpacity>
        {headerRight}
      </View>

      {/* Title area */}
      <Text style={styles.title}>{title}</Text>
      {subtitle != null && <Text style={styles.subtitle}>{subtitle}</Text>}

      {/* Scrollable content */}
      <ScrollView
        style={styles.scrollArea}
        contentContainerStyle={[styles.scrollContent, contentStyle, { paddingBottom: insets.bottom + 24 }]} // Reduced padding now that navbar is not floating
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
    backgroundColor: DarkTheme.background,
    paddingHorizontal: 24,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  menuButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: DarkTheme.menuIconBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: DarkTheme.text,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: DarkTheme.textSecondary,
    marginBottom: 16,
  },
  scrollArea: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 16,
  },
});
