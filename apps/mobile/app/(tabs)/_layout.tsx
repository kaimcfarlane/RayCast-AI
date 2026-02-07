import { Text } from 'react-native';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { AccentColor } from '@/constants/theme';
import { GradientIcon } from '@/components/gradient-icon';
import { GradientText } from '@/components/gradient-text';

const TAB_INACTIVE = '#999';
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
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: AccentColor,
        tabBarInactiveTintColor: TAB_INACTIVE,
        tabBarStyle: {
          backgroundColor: '#fff',
          borderTopWidth: 1,
          borderTopColor: '#eee',
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
