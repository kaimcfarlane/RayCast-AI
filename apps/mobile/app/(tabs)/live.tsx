import { useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import { ScreenLayout } from '@/components/screen-layout';
import { DarkTheme } from '@/constants/theme';
import { Button } from '@/components/ui/button';
import { analyzeVideo } from '@/lib/api';
import type { ContextPacket } from '@/types/context-packet';

export default function LiveScreen() {
  const [packet, setPacket] = useState<ContextPacket | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const pickAndAnalyze = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'video/*',
        copyToCacheDirectory: true,
      });

      if (result.canceled || result.assets.length === 0) return;

      const videoUri = result.assets[0].uri;

      setLoading(true);
      setError(null);
      setPacket(null);

      const data = await analyzeVideo(videoUri);
      setPacket(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to analyze video');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenLayout
      title="Live Session"
      subtitle="Video Analysis"
      headerRight={
        packet ? (
          <View style={styles.liveTag}>
            <View style={styles.liveDot} />
            <Text style={styles.liveText}>DONE</Text>
          </View>
        ) : undefined
      }
    >
      {loading ? (
        <View style={styles.centerBlock}>
          <ActivityIndicator size="large" color={DarkTheme.textMuted} />
          <Text style={styles.loadingText}>Analyzing video...</Text>
          <Text style={styles.loadingHint}>Extracting frames, running vision & audio</Text>
        </View>
      ) : error ? (
        <View style={styles.centerBlock}>
          <Ionicons name="cloud-offline" size={48} color={DarkTheme.textMuted} style={{ marginBottom: 12 }} />
          <Text style={styles.errorText}>{error}</Text>
          <Text style={styles.errorHint}>Ensure the backend is running</Text>
          <TouchableOpacity style={styles.retryButton} onPress={pickAndAnalyze}>
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      ) : packet ? (
        <>
          <View style={styles.povFeed}>
            <View style={styles.povIcon}>
              <Ionicons name="checkmark-circle" size={64} color="#4CAF50" />
            </View>
            <Text style={styles.povText}>Analysis Complete</Text>
            <Text style={styles.povSubtext}>
              {packet.source_type} • {packet.video_file_name}
            </Text>
            <Text style={styles.sessionId}>{packet.session_id}</Text>
          </View>

          <View style={styles.sceneCard}>
            <Text style={styles.cardTitle}>Scene Understanding</Text>
            <Text style={styles.sceneSummary}>{packet.scene.scene_summary}</Text>
            {packet.scene.objects.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionLabel}>Objects</Text>
                <Text style={styles.sceneValue}>
                  {packet.scene.objects.map((o) => `${o.label} (${o.count})`).join(', ')}
                </Text>
              </View>
            )}
            {packet.scene.text_in_scene.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionLabel}>Text in scene</Text>
                {packet.scene.text_in_scene.map((t, i) => (
                  <Text key={i} style={styles.bulletItem}>• "{t.text}" ({Math.round(t.confidence * 100)}%)</Text>
                ))}
              </View>
            )}
            {packet.scene.key_details.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionLabel}>Key details</Text>
                {packet.scene.key_details.map((d, i) => (
                  <Text key={i} style={styles.bulletItem}>• {d}</Text>
                ))}
              </View>
            )}
            {packet.scene.uncertainties.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionLabel}>Uncertainties</Text>
                {packet.scene.uncertainties.map((u, i) => (
                  <Text key={i} style={styles.bulletItem}>• {u}</Text>
                ))}
              </View>
            )}
          </View>

          <View style={styles.transcriptCard}>
            <Text style={styles.cardTitle}>Transcript</Text>
            <View style={styles.transcriptBubble}>
              <Text style={styles.transcriptText}>
                {packet.transcript || 'No speech detected.'}
              </Text>
            </View>
          </View>

          <Button
            title="Analyze Another Video"
            variant="secondary"
            onPress={pickAndAnalyze}
            style={{ marginTop: 4 }}
          />
        </>
      ) : (
        <View style={styles.centerBlock}>
          <Ionicons name="videocam-outline" size={64} color={DarkTheme.textMuted} style={{ marginBottom: 16 }} />
          <Text style={styles.emptyTitle}>No video analyzed yet</Text>
          <Text style={styles.emptyHint}>Choose a video file (e.g. from Files or iCloud) to run through the perception pipeline</Text>
          <Button
            title="Select Video"
            variant="primary"
            onPress={pickAndAnalyze}
            style={{ marginTop: 24, width: '100%' }}
          />
        </View>
      )}
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  liveTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF4444',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'white',
    marginRight: 6,
  },
  liveText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '700',
  },
  povFeed: {
    backgroundColor: DarkTheme.surface,
    borderRadius: 16,
    padding: 40,
    alignItems: 'center',
    marginBottom: 20,
    minHeight: 200,
    justifyContent: 'center',
  },
  povIcon: {
    marginBottom: 12,
  },
  povText: {
    fontSize: 16,
    fontWeight: '600',
    color: DarkTheme.textSecondary,
    marginBottom: 4,
  },
  povSubtext: {
    fontSize: 14,
    color: DarkTheme.textMuted,
  },
  sceneCard: {
    backgroundColor: DarkTheme.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: DarkTheme.text,
    marginBottom: 12,
  },
  sceneInfo: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  sceneLabel: {
    fontSize: 14,
    color: DarkTheme.textSecondary,
    fontWeight: '500',
    width: 100,
  },
  sceneValue: {
    fontSize: 14,
    color: DarkTheme.text,
    flex: 1,
  },
  transcriptCard: {
    backgroundColor: DarkTheme.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
  },
  transcriptBubble: {
    backgroundColor: DarkTheme.surfaceElevated,
    borderRadius: 10,
    padding: 12,
    marginTop: 8,
  },
  transcriptTime: {
    fontSize: 12,
    color: DarkTheme.textMuted,
    marginBottom: 4,
  },
  transcriptText: {
    fontSize: 14,
    color: DarkTheme.text,
    lineHeight: 20,
  },
  centerBlock: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 48,
    paddingHorizontal: 24,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    fontWeight: '600',
    color: DarkTheme.text,
  },
  loadingHint: {
    marginTop: 6,
    fontSize: 13,
    color: DarkTheme.textMuted,
  },
  errorText: {
    fontSize: 16,
    color: DarkTheme.text,
    textAlign: 'center',
    marginBottom: 8,
  },
  errorHint: {
    fontSize: 13,
    color: DarkTheme.textMuted,
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: DarkTheme.surface,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  retryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: DarkTheme.text,
  },
  sceneSummary: {
    fontSize: 14,
    color: DarkTheme.text,
    lineHeight: 20,
    marginBottom: 12,
  },
  section: {
    marginTop: 12,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: DarkTheme.textMuted,
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  bulletItem: {
    fontSize: 14,
    color: DarkTheme.text,
    lineHeight: 20,
    marginTop: 2,
  },
  sessionId: {
    fontSize: 12,
    color: DarkTheme.textMuted,
    marginTop: 4,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: DarkTheme.text,
    marginBottom: 8,
  },
  emptyHint: {
    fontSize: 14,
    color: DarkTheme.textMuted,
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 16,
  },
});
