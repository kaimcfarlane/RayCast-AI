import { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { ScreenLayout } from '@/components/screen-layout';
import { DarkTheme } from '@/constants/theme';
import { Button } from '@/components/ui/button';
import { TaskCard } from '@/components/task-card';

type TaskMode = 'chess' | 'navigate' | 'find-object' | 'read-text' | 'describe' | 'general' | null;

export default function HomeScreen() {
  const [selectedTask, setSelectedTask] = useState<TaskMode>(null);

  const taskModes: { id: TaskMode; icon: keyof typeof Ionicons.glyphMap; label: string }[] = [
    { id: 'chess', icon: 'grid', label: 'Chess' },
    { id: 'navigate', icon: 'navigate', label: 'Navigate' },
    { id: 'find-object', icon: 'search', label: 'Find Object' },
    { id: 'read-text', icon: 'book', label: 'Read Text' },
    { id: 'describe', icon: 'chatbubble', label: 'Describe' },
    { id: 'general', icon: 'bulb', label: 'General' },
  ];

  return (
    <ScreenLayout title="Dashboard" subtitle="Ready to assist">
      {/* Not connected state */}
      <View style={styles.connectionCard}>
        <View style={styles.notConnectedIcon}>
          <Ionicons name="close-circle" size={24} color="#FF4444" />
        </View>
        <View style={styles.connectionInfo}>
          <Text style={styles.connectionDevice}>Meta Ray-Ban Gen 2</Text>
          <Text style={styles.connectionStatus}>Not connected</Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Select Task Mode</Text>
      <View style={styles.taskGrid}>
        {[0, 1, 2].map((row) => (
          <View key={row} style={styles.taskRow}>
            {taskModes.slice(row * 2, row * 2 + 2).map((task) => (
              <TaskCard
                key={task.id}
                icon={task.icon}
                label={task.label}
                isSelected={selectedTask === task.id}
                onPress={() => setSelectedTask(task.id)}
              />
            ))}
          </View>
        ))}
      </View>

      <Button
        title="Start Session"
        variant="primary"
        onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)}
      />
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  connectionCard: {
    backgroundColor: DarkTheme.surface,
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  notConnectedIcon: {
    marginRight: 12,
  },
  connectionInfo: {
    flex: 1,
  },
  connectionDevice: {
    fontSize: 16,
    fontWeight: '600',
    color: DarkTheme.text,
    marginBottom: 4,
  },
  connectionStatus: {
    fontSize: 14,
    color: DarkTheme.textSecondary,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: DarkTheme.text,
    marginBottom: 16,
  },
  taskGrid: {
    gap: 12,
    marginBottom: 24,
  },
  taskRow: {
    flexDirection: 'row',
    gap: 12,
  },
});
