import { forwardRef } from 'react';
import { Text, StyleSheet, TouchableOpacity, View, TouchableOpacityProps } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { GradientColors, GradientBorderColors, DarkTheme } from '@/constants/theme';

type ButtonVariant = 'primary' | 'secondary';

type ButtonProps = TouchableOpacityProps & {
    title: string;
    variant?: ButtonVariant;
};

const BORDER_WIDTH = 2;

export const Button = forwardRef<React.ElementRef<typeof TouchableOpacity>, ButtonProps>(
    ({ title, variant = 'primary', style, ...props }, ref) => {
        if (variant === 'primary') {
            return (
                <TouchableOpacity
                    ref={ref}
                    activeOpacity={0.8}
                    style={[styles.touchable, style]}
                    {...props}
                >
                    <LinearGradient
                        colors={GradientColors}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.primaryGradient}
                    >
                        <Text style={styles.primaryText}>{title}</Text>
                    </LinearGradient>
                </TouchableOpacity>
            );
        }

        // Secondary: gradient border with dark fill
        return (
            <TouchableOpacity
                ref={ref}
                activeOpacity={0.8}
                style={[styles.touchable, style]}
                {...props}
            >
                <LinearGradient
                    colors={[...GradientBorderColors]}
                    start={{ x: 0, y: 0.5 }}
                    end={{ x: 1, y: 0.5 }}
                    style={styles.secondaryBorder}
                >
                    <View style={styles.secondaryInner}>
                        <Text style={styles.secondaryText}>{title}</Text>
                    </View>
                </LinearGradient>
            </TouchableOpacity>
        );
    }
);

const styles = StyleSheet.create({
    touchable: {
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
