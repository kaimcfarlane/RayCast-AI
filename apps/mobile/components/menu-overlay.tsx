import { Modal, View, Text, StyleSheet, Pressable, Dimensions, Animated, Easing as RNEasing, TouchableWithoutFeedback } from 'react-native';
import AnimatedReanimated, {
    useSharedValue,
    useAnimatedStyle,
    withTiming,
    Easing,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRef, useEffect, useState } from 'react';
import { DarkTheme } from '@/constants/theme';
import { AnimatedIconButton } from '@/components/ui/animated-icon-button';

const easeInOut = Easing.bezier(0.4, 0, 0.2, 1);

type MenuOverlayProps = {
    visible: boolean;
    onClose: () => void;
};

const SCREEN_WIDTH = Dimensions.get('window').width;
const DRAWER_WIDTH = SCREEN_WIDTH * 0.8;

export function MenuOverlay({ visible, onClose }: MenuOverlayProps) {
    const insets = useSafeAreaInsets();
    const [isMounted, setIsMounted] = useState(false);
    const slideAnim = useRef(new Animated.Value(-DRAWER_WIDTH)).current;
    const fadeAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        const overlayEasing = RNEasing.bezier(0.4, 0, 0.2, 1);
        if (visible) {
            setIsMounted(true);
            Animated.parallel([
                Animated.timing(slideAnim, {
                    toValue: 0,
                    duration: 300,
                    easing: overlayEasing,
                    useNativeDriver: true,
                }),
                Animated.timing(fadeAnim, {
                    toValue: 1,
                    duration: 300,
                    easing: overlayEasing,
                    useNativeDriver: true,
                }),
            ]).start();
        } else if (isMounted) {
            Animated.parallel([
                Animated.timing(slideAnim, {
                    toValue: -DRAWER_WIDTH,
                    duration: 250,
                    easing: overlayEasing,
                    useNativeDriver: true,
                }),
                Animated.timing(fadeAnim, {
                    toValue: 0,
                    duration: 250,
                    easing: overlayEasing,
                    useNativeDriver: true,
                }),
            ]).start(() => {
                setIsMounted(false);
            });
        }
    }, [visible]);

    if (!isMounted) return null;

    return (
        <Modal
            visible={isMounted}
            transparent
            animationType="none"
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                {/* Blurred Background with Fade */}
                <Animated.View style={[styles.backdropContainer, { opacity: fadeAnim }]}>
                    <TouchableWithoutFeedback onPress={onClose}>
                        <BlurView intensity={20} tint="dark" style={StyleSheet.absoluteFill} />
                    </TouchableWithoutFeedback>
                </Animated.View>

                {/* Sliding Drawer */}
                <Animated.View
                    style={[
                        styles.drawer,
                        {
                            transform: [{ translateX: slideAnim }],
                            paddingTop: insets.top + 24,
                            paddingBottom: insets.bottom + 24,
                        },
                    ]}
                >
                    {/* Header with Close Button */}
                    <View style={styles.header}>
                        <AnimatedIconButton onPress={onClose} style={styles.closeButton}>
                            <Ionicons name="close" size={24} color="#FFF" />
                        </AnimatedIconButton>
                    </View>

                    {/* Menu Content */}
                    <View style={styles.menuItems}>
                        <MenuItem icon="glasses-outline" label="Pair Meta Glasses" onPress={() => { }} />
                        <MenuItem icon="videocam-outline" label="Start Live Session" onPress={() => { }} />
                        <MenuItem icon="notifications-outline" label="Notifications" onPress={() => { }} />
                    </View>

                    {/* History Section */}
                    <View style={styles.historySection}>
                        <Text style={styles.historyTitle}>History</Text>
                        <Text style={styles.historyText}>
                            You currently don't have any{'\n'}sessions with RayCast
                        </Text>
                    </View>

                    {/* User Account Footer */}
                    <View style={styles.footer}>
                        <View style={styles.avatar}>
                            <Ionicons name="person" size={28} color="#000" />
                        </View>
                        <Text style={styles.footerText}>User Account</Text>
                    </View>
                </Animated.View>
            </View>
        </Modal>
    );
}

function MenuItem({ icon, label, onPress }: { icon: keyof typeof Ionicons.glyphMap; label: string; onPress: () => void }) {
    return (
        <AnimatedMenuItem icon={icon} label={label} onPress={onPress} />
    );
}

function AnimatedMenuItem({ icon, label, onPress }: { icon: keyof typeof Ionicons.glyphMap; label: string; onPress: () => void }) {
    const scale = useSharedValue(1);

    const onPressIn = () => {
        scale.value = withTiming(0.97, { duration: 120, easing: easeInOut });
    };

    const onPressOut = () => {
        scale.value = withTiming(1, { duration: 180, easing: easeInOut });
    };

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
    }));

    return (
        <Pressable onPress={onPress} onPressIn={onPressIn} onPressOut={onPressOut} style={styles.menuItem}>
            <AnimatedReanimated.View style={[styles.menuItemInner, animatedStyle]}>
                <View style={styles.iconContainer}>
                    <Ionicons name={icon} size={24} color="#FFF" />
                </View>
                <Text style={styles.menuLabel}>{label}</Text>
            </AnimatedReanimated.View>
        </Pressable>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        flexDirection: 'row',
    },
    backdropContainer: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.5)', // Fallback / additional dimming
    },
    drawer: {
        width: DRAWER_WIDTH,
        height: '100%',
        backgroundColor: DarkTheme.background, // Match app background or slightly lighter
        paddingHorizontal: 24,
        borderRightWidth: 1,
        borderRightColor: DarkTheme.border,
        shadowColor: '#000',
        shadowOffset: { width: 4, height: 0 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 10,
    },
    header: {
        alignItems: 'flex-end',
        marginBottom: 32,
    },
    closeButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: DarkTheme.surface,
        alignItems: 'center',
        justifyContent: 'center',
    },
    menuItems: {
        marginTop: 10,
        gap: 28,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    menuItemInner: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconContainer: {
        width: 32,
        alignItems: 'center',
        marginRight: 12,
    },
    menuLabel: {
        fontSize: 17,
        fontWeight: '500',
        color: '#FFF',
    },
    historySection: {
        marginTop: 48,
        borderTopWidth: 1,
        borderTopColor: DarkTheme.border,
        paddingTop: 24,
    },
    historyTitle: {
        fontSize: 15,
        fontWeight: '600',
        color: DarkTheme.textMuted,
        marginBottom: 8,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    historyText: {
        fontSize: 15,
        color: DarkTheme.textSecondary,
        lineHeight: 22,
    },
    footer: {
        marginTop: 'auto',
        flexDirection: 'row',
        alignItems: 'center',
        borderTopWidth: 1,
        borderTopColor: DarkTheme.border,
        paddingTop: 24,
    },
    avatar: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: '#FFF',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    footerText: {
        fontSize: 17,
        fontWeight: '600',
        color: '#FFF',
    },
});
