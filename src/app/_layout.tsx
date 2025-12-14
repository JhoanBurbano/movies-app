/**
 * Root layout with navigation setup
 */

import React from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { RootTabs } from './navigation/RootTabs';
import { useTheme } from '../ui/theme/theme';
import { ThemeProvider } from '../ui/theme/ThemeContext';
import { useSyncQueue } from '../hooks/useSyncQueue';
import { NetworkStatusIndicator } from './components/NetworkStatusIndicator';
import { StyleSheet, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

export default function RootLayout() {
    return (
        <ThemeProvider>
            <AppContent />
        </ThemeProvider>
    );
}

function AppContent() {
    const theme = useTheme();
    // Initialize sync queue processing
    useSyncQueue();
    const styles = createStyles(theme);
    return (
        <SafeAreaProvider>
            <GestureHandlerRootView style={styles.container}>
                <NavigationContainer>
                    <StatusBar style={theme.isDark ? 'light' : 'dark'} />
                    <View style={styles.content}>
                        <NetworkStatusIndicator />
                        <RootTabs />
                    </View>
                </NavigationContainer>
            </GestureHandlerRootView>
        </SafeAreaProvider>
    );
}

const createStyles = (theme: ReturnType<typeof useTheme>) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    content: {
        flex: 1,
    },
});

