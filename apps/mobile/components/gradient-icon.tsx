import { View, StyleSheet } from 'react-native';
import MaskedView from '@react-native-masked-view/masked-view';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { GradientColors } from '@/constants/theme';

const SIZE = 24;

type GradientIconProps = {
  name: keyof typeof Ionicons.glyphMap;
};

export function GradientIcon({ name }: GradientIconProps) {
  return (
    <MaskedView
      style={styles.mask}
      maskElement={
        <View style={styles.maskInner}>
          <Ionicons name={name} size={SIZE} color="black" />
        </View>
      }
    >
      <LinearGradient
        colors={GradientColors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.gradient}
      />
    </MaskedView>
  );
}

const styles = StyleSheet.create({
  mask: {
    width: SIZE,
    height: SIZE,
  },
  maskInner: {
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  gradient: {
    flex: 1,
  },
});
