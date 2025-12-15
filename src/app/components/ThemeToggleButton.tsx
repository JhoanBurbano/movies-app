/**
 * Compact theme toggle button for header
 * Shows current theme mode and opens theme selector
 */

import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
    FadeIn,
    FadeOut,
    useAnimatedStyle,
    useSharedValue,
    withTiming,
} from 'react-native-reanimated';
import { useTheme } from '../../ui/theme/theme';
import { useThemeContext } from '../../ui/theme/ThemeContext';
import { ThemeToggle } from './ThemeToggle';

const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);
const AnimatedView = Animated.createAnimatedComponent(View);

export function ThemeToggleButton() {
    const theme = useTheme();
    const { themeMode } = useThemeContext();
    const [modalVisible, setModalVisible] = useState(false);
    const buttonScale = useSharedValue(1);
    const styles = createStyles(theme);

    const buttonAnimatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: buttonScale.value }],
    }));

    const handlePressIn = () => {
        buttonScale.value = withTiming(0.95, { duration: 100 });
    };

    const handlePressOut = () => {
        buttonScale.value = withTiming(1, { duration: 100 });
    };

    const getIconName = (): keyof typeof Ionicons.glyphMap => {
        switch (themeMode) {
            case 'light':
                return 'sunny-outline';
            case 'dark':
                return 'moon-outline';
            default:
                return 'phone-portrait-outline';
        }
    };

    return (
        <>
            <AnimatedTouchableOpacity
                style={[styles.button, buttonAnimatedStyle]}
                onPress={() => setModalVisible(true)}
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
                activeOpacity={1}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
                <Ionicons name={getIconName()} size={22} color={theme.colors.text} />
            </AnimatedTouchableOpacity>

            <Modal
                visible={modalVisible}
                transparent
                animationType="none"
                onRequestClose={() => setModalVisible(false)}
            >
                <TouchableOpacity
                    style={styles.modalOverlay}
                    activeOpacity={1}
                    onPress={() => setModalVisible(false)}
                >
                    <AnimatedView
                        style={styles.modalContent}
                        entering={FadeIn.duration(200)}
                        exiting={FadeOut.duration(150)}
                    >
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Theme</Text>
                            <TouchableOpacity
                                onPress={() => setModalVisible(false)}
                                activeOpacity={0.7}
                                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                            >
                                <Ionicons name="close" size={24} color={theme.colors.textSecondary} />
                            </TouchableOpacity>
                        </View>
                        <ThemeToggle />
                    </AnimatedView>
                </TouchableOpacity>
            </Modal>
        </>
    );
}

function createStyles(theme: ReturnType<typeof useTheme>) {
    return StyleSheet.create({
        button: {
            padding: theme.spacing.xs,
            marginRight: theme.spacing.sm,
        },
        modalOverlay: {
            flex: 1,
            backgroundColor: theme.colors.overlay,
            justifyContent: 'center',
            alignItems: 'center',
            padding: theme.spacing.lg,
        },
        modalContent: {
            backgroundColor: theme.colors.surface,
            borderRadius: 16,
            padding: theme.spacing.lg,
            width: '100%',
            maxWidth: 400,
            shadowColor: theme.colors.shadow,
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 8,
            elevation: 8,
        },
        modalHeader: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: theme.spacing.md,
        },
        modalTitle: {
            ...theme.typography.h3,
            color: theme.colors.text,
        },
    });
}

