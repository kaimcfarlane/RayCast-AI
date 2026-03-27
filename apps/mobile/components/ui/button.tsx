import { forwardRef } from 'react';
import { Text, StyleSheet, Pressable, View, PressableProps } from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    useAnimatedProps,
    withTiming,
    Easing,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { GradientColors, GradientBorderColors, DarkTheme } from '@/constants/theme';

const AnimatedLinearGradient = Animated.createAnimatedComponent(LinearGradient);

type ButtonVariant = 'primary' | 'secondary';

type ButtonProps = PressableProps & {
    title: string;
    variant?: ButtonVariant;
};

const BORDER_WIDTH = 2;

const easeInOut = Easing.bezier(0.4, 0, 0.2, 1);

export const Button = forwardRef<React.ElementRef<typeof Pressable>, ButtonProps>(
    ({ title, variant = 'primary', style, ...props }, ref) => {
        const scale = useSharedValue(1);
        const gradientShift = useSharedValue(0);

        const onPressIn = () => {
            scale.value = withTiming(0.97, { duration: 150, easing: easeInOut });
            gradientShift.value = withTiming(1, { duration: 150, easing: easeInOut });
        };

        const onPressOut = () => {
            scale.value = withTiming(1, { duration: 200, easing: easeInOut });
            gradientShift.value = withTiming(0, { duration: 200, easing: easeInOut });
        };

        const animatedButtonStyle = useAnimatedStyle(() => ({
            transform: [{ scale: scale.value }],
        }));

        const primaryGradientProps = useAnimatedProps<{ start: { x: number; y: number }; end: { x: number; y: number } }>(() => {
            'worklet';
            const s = gradientShift.value;
            return {
                start: { x: 0 + s * 0.1, y: 0 + s * 0.05 },
                end: { x: 1 - s * 0.1, y: s * 0.1 },
            };
        });

        const secondaryGradientProps = useAnimatedProps<{ start: { x: number; y: number }; end: { x: number; y: number } }>(() => {
            'worklet';
            const s = gradientShift.value;
            return {
                start: { x: 0 + s * 0.08, y: 0.5 },
                end: { x: 1 - s * 0.08, y: 0.5 + s * 0.1 },
            };
        });

        if (variant === 'primary') {
            return (
                <Pressable
                    ref={ref}
                    onPressIn={onPressIn}
                    onPressOut={onPressOut}
                    style={[styles.touchable, style]}
                    {...props}
                >
                    <Animated.View style={[styles.touchableInner, animatedButtonStyle]}>
                        <AnimatedLinearGradient
                            colors={[...GradientColors]}
                            animatedProps={primaryGradientProps}
                            style={styles.primaryGradient}
                        >
                            <Text style={styles.primaryText}>{title}</Text>
                        </AnimatedLinearGradient>
                    </Animated.View>
                </Pressable>
            );
        }

        // Secondary: gradient border with dark fill
        return (
            <Pressable
                ref={ref}
                onPressIn={onPressIn}
                onPressOut={onPressOut}
                style={[styles.touchable, style]}
                {...props}
            >
                <Animated.View style={[styles.touchableInner, animatedButtonStyle]}>
                    <AnimatedLinearGradient
                        colors={[...GradientBorderColors]}
                        animatedProps={secondaryGradientProps}
                        style={styles.secondaryBorder}
                    >
                        <View style={styles.secondaryInner}>
                            <Text style={styles.secondaryText}>{title}</Text>
                        </View>
                    </AnimatedLinearGradient>
                </Animated.View>
            </Pressable>
        );
    }
);

const styles = StyleSheet.create({
    touchable: {
        borderRadius: 28,
        overflow: 'hidden',
    },
    touchableInner: {
        borderRadius: 28,
        overflow: 'hidden',
    },
    primaryGradient: {
        paddingVertical: 16,
        borderRadius: 28,
        alignItems: 'center',
        justifyContent: 'center',
    },
    primaryText: {
        color: '#FFFFFF',
        fontSize: 17,
        fontWeight: '600',
    },
    secondaryBorder: {
        borderRadius: 28,
        padding: BORDER_WIDTH,
    },
    secondaryInner: {
        backgroundColor: DarkTheme.background,
        borderRadius: 28 - BORDER_WIDTH,
        paddingVertical: 14,
        alignItems: 'center',
        justifyContent: 'center',
    },
    secondaryText: {
        color: '#FFFFFF',
        fontSize: 17,
        fontWeight: '600',
    },
});
