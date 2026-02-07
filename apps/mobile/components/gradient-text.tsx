import { Text, TextProps, StyleSheet } from 'react-native';
import { ReactNode } from 'react';
import MaskedView from '@react-native-masked-view/masked-view';
import { LinearGradient } from 'expo-linear-gradient';
import { GradientColors } from '@/constants/theme';

type GradientTextProps = TextProps & {
  children: ReactNode;
};

export function GradientText({ children, style, ...rest }: GradientTextProps) {
  const textStyle = [style, { color: 'black' }];
  const invisibleStyle = [style, styles.invisible, styles.centered];
  return (
    <MaskedView
      style={styles.mask}
      maskElement={
        <Text style={[textStyle, styles.centered]} {...rest}>
          {children}
        </Text>
      }
    >
      <LinearGradient
        colors={GradientColors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.gradient}
      >
        <Text style={invisibleStyle} {...rest}>
          {children}
        </Text>
      </LinearGradient>
    </MaskedView>
  );
}

const styles = StyleSheet.create({
  mask: {
    flexDirection: 'row',
    alignSelf: 'stretch',
  },
  gradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  invisible: {
    opacity: 0,
  },
  centered: {
    textAlign: 'center' as const,
  },
});
