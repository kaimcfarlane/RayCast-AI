import { StyleProp, ViewStyle } from 'react-native';
import { Pressable } from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withTiming,
    Easing,
} from 'react-native-reanimated';

const easeInOut = Easing.bezier(0.4, 0, 0.2, 1);

type AnimatedIconButtonProps = {
    children: React.ReactNode;
    onPress: () => void;
    style?: StyleProp<ViewStyle>;
};

export function AnimatedIconButton({ children, onPress, style }: AnimatedIconButtonProps) {
    const scale = useSharedValue(1);

    const onPressIn = () => {
        scale.value = withTiming(0.92, { duration: 120, easing: easeInOut });
    };

    const onPressOut = () => {
        scale.value = withTiming(1, { duration: 180, easing: easeInOut });
    };

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
    }));

    return (
        <Pressable onPress={onPress} onPressIn={onPressIn} onPressOut={onPressOut} style={style}>
            <Animated.View style={[{ width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center' }, animatedStyle]}>
                {children}
            </Animated.View>
        </Pressable>
    );
}
