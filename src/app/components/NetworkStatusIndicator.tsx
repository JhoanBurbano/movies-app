/**
 * Network status indicator component
 * Shows current network connectivity status
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNetworkStatus } from '../../hooks/useNetworkStatus';
import { useTheme } from '../../ui/theme/theme';

export function NetworkStatusIndicator() {
    const theme = useTheme();
    const { isConnected } = useNetworkStatus();
    const insets = useSafeAreaInsets();
    const styles = createStyles(theme, insets);

    if (isConnected) {
        return null; // Don't show when connected
    }

    return (
        <View style={styles.container}>
            <Ionicons name="wifi-outline" size={16} color="#FFFFFF" style={styles.icon} />
            <Text style={styles.text}>Offline</Text>
        </View>
    );
}

function createStyles(
    theme: ReturnType<typeof useTheme>,
    insets: ReturnType<typeof useSafeAreaInsets>
) {
    return StyleSheet.create({
        container: {
            backgroundColor: theme.colors.warning,
            marginTop: insets.top,
            paddingVertical: theme.spacing.xs,
            marginBottom: theme.spacing.xs,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
        },
        icon: {
            marginRight: theme.spacing.xs,
        },
        text: {
            ...theme.typography.caption,
            color: '#FFFFFF',
            fontWeight: '600',
        },
    });
}

