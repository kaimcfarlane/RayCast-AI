import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ScreenLayout } from '@/components/screen-layout';

export default function HistoryScreen() {
  return (
    <ScreenLayout title="History" subtitle="Past sessions">
      <View style={styles.placeholder}>
        <Ionicons name="time-outline" size={64} color="#CCC" />
        <Text style={styles.placeholderTitle}>No sessions yet</Text>
        <Text style={styles.placeholderText}>
          Your session history will appear here once you start using RayCast AI.
        </Text>
      </View>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  placeholder: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
  },
  placeholderTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
  },
  placeholderText: {
    fontSize: 15,
    color: '#666',
    textAlign: 'center',
    paddingHorizontal: 24,
    lineHeight: 22,
  },
});
