/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import { Platform } from 'react-native';

const tintColorLight = '#0a7ea4';
const tintColorDark = '#fff';

/** Gradient: blue (left) → purple (right) */
export const GradientColors = ['#4F46E5', '#9333EA'] as const;
/** Secondary gradient for borders and accents */
export const GradientBorderColors = ['#4F46E5', '#9333EA', '#D946EF'] as const;
/** Accent color (matches gradient end) */
export const AccentColor = '#9333EA';

/** Dark theme surface colors */
export const DarkTheme = {
  /** Main background */
  background: '#1A1A2E',
  /** Slightly lighter surface for cards */
  surface: '#252540',
  /** Even lighter for elevated cards */
  surfaceElevated: '#2D2D4A',
  /** Border color for cards */
  border: '#3A3A5C',
  /** Primary text */
  text: '#FFFFFF',
  /** Secondary text */
  textSecondary: '#A0A0B8',
  /** Muted text */
  textMuted: '#6B6B8D',
  /** Menu icon background */
  menuIconBg: '#333355',
};

export const Colors = {
  light: {
    text: '#11181C',
    background: '#fff',
    tint: tintColorLight,
    icon: '#687076',
    tabIconDefault: '#687076',
    tabIconSelected: tintColorLight,
  },
  dark: {
    text: '#ECEDEE',
    background: '#151718',
    tint: tintColorDark,
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: tintColorDark,
  },
};

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
