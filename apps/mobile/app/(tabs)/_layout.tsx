import { Text, StyleSheet, Platform } from 'react-native';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { DarkTheme } from '@/constants/theme';
import { GradientIcon } from '@/components/gradient-icon';
import { GradientText } from '@/components/gradient-text';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const TAB_INACTIVE = '#6B6B8D';
const LABEL_STYLE = { fontSize: 11, fontWeight: '500' as const };

function TabIcon({
  focused,
  activeName,
  inactiveName,
}: {
  focused: boolean;
  activeName: keyof typeof Ionicons.glyphMap;
  inactiveName: keyof typeof Ionicons.glyphMap;
}) {
  if (focused) {
    return <GradientIcon name={activeName} />;
  }
  return <Ionicons name={inactiveName} size={24} color={TAB_INACTIVE} />;
}

export default function TabLayout() {
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#9333EA',
        tabBarInactiveTintColor: TAB_INACTIVE,
        tabBarStyle: {
          backgroundColor: DarkTheme.surface,
          borderTopWidth: 1,
          borderTopColor: '#3A3A5C', // DarkTheme.border
          height: Platform.OS === 'ios' ? 84 : 64,
          paddingBottom: Platform.OS === 'ios' ? 24 : 8,
          paddingTop: 8,
          elevation: 0,
        },
        tabBarItemStyle: {
          paddingVertical: 8,
        },
        tabBarLabelStyle: LABEL_STYLE,
        tabBarLabel: ({ focused, color, children }) =>
          focused ? (
            <GradientText style={LABEL_STYLE}>{children}</GradientText>
          ) : (
            <Text style={[LABEL_STYLE, { color }]}>{children}</Text>
          ),
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} activeName="home" inactiveName="home-outline" />
          ),
        }}
      />
      <Tabs.Screen
        name="live"
        options={{
          title: 'Live',
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} activeName="videocam" inactiveName="videocam-outline" />
          ),
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: 'History',
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} activeName="time" inactiveName="time-outline" />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} activeName="settings" inactiveName="settings-outline" />
          ),
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}
