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
import { StyleSheet } from 'react-native';
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

    return (
        <SafeAreaProvider>
            <GestureHandlerRootView style={styles.container}>
                <NavigationContainer>
                    <StatusBar style={theme.isDark ? 'light' : 'dark'} />
                    <RootTabs />
                </NavigationContainer>
            </GestureHandlerRootView>
        </SafeAreaProvider>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
});

