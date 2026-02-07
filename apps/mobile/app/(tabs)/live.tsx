import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ScreenLayout } from '@/components/screen-layout';

export default function LiveScreen() {
  return (
    <ScreenLayout
      title="Live Session"
      subtitle="Chess Assistant Mode"
      headerRight={
        <View style={styles.liveTag}>
          <View style={styles.liveDot} />
          <Text style={styles.liveText}>LIVE</Text>
        </View>
      }
    >
      <View style={styles.povFeed}>
        <View style={styles.povIcon}>
          <Ionicons name="videocam" size={64} color="#DDD" />
        </View>
        <Text style={styles.povText}>Live POV Feed</Text>
        <Text style={styles.povSubtext}>Processing frames...</Text>
      </View>

      <View style={styles.sceneCard}>
        <Text style={styles.cardTitle}>Scene Understanding</Text>
        <View style={styles.sceneInfo}>
          <Text style={styles.sceneLabel}>Board detected:</Text>
          <Text style={styles.sceneValue}>Standard 8x8 chess board</Text>
        </View>
        <View style={styles.sceneInfo}>
          <Text style={styles.sceneLabel}>Position:</Text>
          <Text style={styles.sceneValue}>Mid-game, ~15 moves in</Text>
        </View>
        <View style={styles.sceneInfo}>
          <Text style={styles.sceneLabel}>Player:</Text>
          <Text style={styles.sceneValue}>White to move</Text>
        </View>
        <View style={styles.sceneInfo}>
          <Text style={styles.sceneLabel}>Material:</Text>
          <Text style={styles.sceneValue}>Equal position</Text>
        </View>
      </View>

      <View style={styles.transcriptCard}>
        <Text style={styles.cardTitle}>Live Transcript</Text>
        <View style={styles.transcriptBubble}>
          <Text style={styles.transcriptTime}>9:43 AM</Text>
          <Text style={styles.transcriptText}>"What should I do with my knight?"</Text>
        </View>
        <View style={styles.transcriptBubble}>
          <Text style={styles.transcriptTime}>AI</Text>
          <Text style={styles.transcriptText}>
            Based on the position, consider moving your knight to f6 to put pressure on the center.
          </Text>
        </View>
      </View>
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
    backgroundColor: '#F8F8F8',
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
    color: '#666',
    marginBottom: 4,
  },
  povSubtext: {
    fontSize: 14,
    color: '#999',
  },
  sceneCard: {
    backgroundColor: '#F8F8F8',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  sceneInfo: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  sceneLabel: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
    width: 100,
  },
  sceneValue: {
    fontSize: 14,
    color: '#333',
    flex: 1,
  },
  transcriptCard: {
    backgroundColor: '#F8F8F8',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  transcriptBubble: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#eee',
  },
  transcriptTime: {
    fontSize: 12,
    color: '#999',
    marginBottom: 4,
  },
  transcriptText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
});
