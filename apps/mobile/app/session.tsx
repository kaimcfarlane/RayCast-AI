import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

export default function SessionScreen() {
  return (
    <LinearGradient
      colors={['#8B7FD8', '#7B6FD0']}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.time}>9:41</Text>
          <View style={styles.notch} />
          <View style={styles.statusIcons}>
            <Ionicons name="cellular" size={16} color="white" />
            <Ionicons name="wifi" size={16} color="white" style={{ marginLeft: 4 }} />
            <Text style={styles.battery}>100%</Text>
          </View>
        </View>

        {/* Main Content */}
        <View style={styles.content}>
          <View style={styles.titleRow}>
            <Text style={styles.title}>Live Session</Text>
            <View style={styles.liveTag}>
              <View style={styles.liveDot} />
              <Text style={styles.liveText}>LIVE</Text>
            </View>
          </View>
          <Text style={styles.subtitle}>Chess Assistant Mode</Text>

          {/* POV Feed Placeholder */}
          <View style={styles.povFeed}>
            <View style={styles.povIcon}>
              <Ionicons name="videocam" size={64} color="#DDD" />
            </View>
            <Text style={styles.povText}>Live POV Feed</Text>
            <Text style={styles.povSubtext}>Processing frames...</Text>
          </View>

          {/* Scene Understanding */}
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

          {/* Live Transcript */}
          <View style={styles.transcriptCard}>
            <Text style={styles.cardTitle}>Live Transcript</Text>
            <View style={styles.transcriptBubble}>
              <Text style={styles.transcriptTime}>9:43 AM</Text>
              <Text style={styles.transcriptText}>"What should I do with my knight?"</Text>
            </View>
            <View style={styles.transcriptBubble}>
              <Text style={styles.transcriptTime}>AI ⚡</Text>
              <Text style={styles.transcriptText}>
                Based on the position, consider moving your knight to f6 to put pressure on the center.
              </Text>
            </View>
          </View>
        </View>

        {/* Bottom Navigation */}
        <View style={styles.bottomNav}>
          <View style={styles.navItem}>
            <Ionicons name="home" size={24} color="#7B6FD0" />
            <Text style={styles.navText}>Home</Text>
          </View>
          <View style={styles.navItem}>
            <Ionicons name="book" size={24} color="#999" />
            <Text style={[styles.navText, { color: '#999' }]}>Live</Text>
          </View>
          <View style={styles.navItem}>
            <Ionicons name="time" size={24} color="#999" />
            <Text style={[styles.navText, { color: '#999' }]}>History</Text>
          </View>
          <View style={styles.navItem}>
            <Ionicons name="settings" size={24} color="#999" />
            <Text style={[styles.navText, { color: '#999' }]}>Settings</Text>
          </View>
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 8,
  },
  time: {
    color: 'white',
    fontSize: 15,
    fontWeight: '600',
  },
  notch: {
    width: 120,
    height: 30,
    backgroundColor: 'black',
    borderRadius: 20,
    position: 'absolute',
    top: 0,
    left: '50%',
    marginLeft: -60,
  },
  statusIcons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  battery: {
    color: 'white',
    fontSize: 12,
    marginLeft: 4,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 40,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: 'white',
    marginRight: 12,
  },
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
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 24,
  },
  povFeed: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
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
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
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
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  transcriptBubble: {
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
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
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 12,
    paddingBottom: 28,
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  navItem: {
    alignItems: 'center',
  },
  navText: {
    fontSize: 11,
    color: '#7B6FD0',
    marginTop: 4,
  },
});
