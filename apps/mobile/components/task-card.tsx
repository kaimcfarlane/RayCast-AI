import { View, Text, StyleSheet, Pressable, StyleProp, ViewStyle } from 'react-native';
import * as Haptics from 'expo-haptics';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    useAnimatedProps,
    withTiming,
    Easing,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { GradientColors, GradientBorderColors, DarkTheme } from '@/constants/theme';

const AnimatedLinearGradient = Animated.createAnimatedComponent(LinearGradient);

const easeInOut = Easing.bezier(0.4, 0, 0.2, 1);

type TaskCardProps = {
    icon: keyof typeof Ionicons.glyphMap;
    label: string;
    isSelected: boolean;
    onPress: () => void;
    style?: StyleProp<ViewStyle>;
};

export function TaskCard({ icon, label, isSelected, onPress, style }: TaskCardProps) {
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

    const animatedCardStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
    }));

    const gradientProps = useAnimatedProps<{ start: { x: number; y: number }; end: { x: number; y: number } }>(() => {
        'worklet';
        const s = gradientShift.value;
        return {
            start: { x: 0 + s * 0.1, y: 0 + s * 0.05 },
            end: { x: 1 - s * 0.1, y: s * 0.1 },
        };
    });

    const handlePress = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onPress();
    };

    return (
        <Pressable
            onPress={handlePress}
            onPressIn={onPressIn}
            onPressOut={onPressOut}
            style={[styles.taskCard, isSelected && styles.taskCardSelected, style]}
        >
            <Animated.View style={[styles.cardInner, animatedCardStyle]}>
                {isSelected ? (
                    <AnimatedLinearGradient
                        colors={[...GradientColors]}
                        animatedProps={gradientProps}
                        style={[styles.taskIcon, styles.taskIconGradient]}
                    >
                        <Ionicons name={icon} size={28} color="white" />
                    </AnimatedLinearGradient>
                ) : (
                    <View style={[styles.taskIcon, { backgroundColor: DarkTheme.surfaceElevated }]}>
                        <Ionicons name={icon} size={28} color={DarkTheme.textSecondary} />
                    </View>
                )}
                <Text style={[styles.taskLabel, isSelected && styles.taskLabelSelected]}>{label}</Text>
            </Animated.View>
        </Pressable>
    );
}

const styles = StyleSheet.create({
    taskCard: {
        flex: 1,
        backgroundColor: DarkTheme.surface,
        borderRadius: 16,
        padding: 16,
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 100,
        borderWidth: 2,
        borderColor: 'transparent',
    },
    taskCardSelected: {
        borderColor: GradientBorderColors[0],
        backgroundColor: DarkTheme.surfaceElevated,
    },
    cardInner: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    taskIcon: {
        width: 56,
        height: 56,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 8,
    },
    taskIconGradient: {
        overflow: 'hidden',
    },
    taskLabel: {
        fontSize: 14,
        fontWeight: '500',
        color: DarkTheme.text,
        textAlign: 'center',
    },
    taskLabelSelected: {
        color: GradientBorderColors[1],
        fontWeight: '600',
    },
});
