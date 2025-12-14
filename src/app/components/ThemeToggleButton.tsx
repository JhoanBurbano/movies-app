/**
 * Compact theme toggle button for header
 * Shows current theme mode and opens theme selector
 */

import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../ui/theme/theme';
import { useThemeContext } from '../../ui/theme/ThemeContext';
import { ThemeToggle } from './ThemeToggle';

export function ThemeToggleButton() {
    const theme = useTheme();
    const { themeMode } = useThemeContext();
    const [modalVisible, setModalVisible] = useState(false);
    const styles = createStyles(theme);

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
            <TouchableOpacity
                style={styles.button}
                onPress={() => setModalVisible(true)}
                activeOpacity={0.7}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
                <Ionicons name={getIconName()} size={22} color={theme.colors.text} />
            </TouchableOpacity>

            <Modal
                visible={modalVisible}
                transparent
                animationType="fade"
                onRequestClose={() => setModalVisible(false)}
            >
                <TouchableOpacity
                    style={styles.modalOverlay}
                    activeOpacity={1}
                    onPress={() => setModalVisible(false)}
                >
                    <View style={styles.modalContent}>
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
                    </View>
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
            shadowColor: '#000',
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

