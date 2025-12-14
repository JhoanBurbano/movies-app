/**
 * Theme toggle component
 * Allows users to switch between system, light, and dark modes
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '../../ui/theme/theme';
import { useThemeContext, type ThemeMode } from '../../ui/theme/ThemeContext';

export function ThemeToggle() {
  const theme = useTheme();
  const { themeMode, setThemeMode } = useThemeContext();
  const styles = createStyles(theme);

  const options: { mode: ThemeMode; label: string; icon: string }[] = [
    { mode: 'system', label: 'System', icon: '⚙️' },
    { mode: 'light', label: 'Light', icon: '☀️' },
    { mode: 'dark', label: 'Dark', icon: '🌙' },
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Theme</Text>
      <View style={styles.optionsContainer}>
        {options.map((option) => (
          <TouchableOpacity
            key={option.mode}
            style={[
              styles.option,
              themeMode === option.mode && styles.optionActive,
            ]}
            onPress={() => setThemeMode(option.mode)}
            activeOpacity={0.7}
          >
            <Text style={styles.optionIcon}>{option.icon}</Text>
            <Text
              style={[
                styles.optionText,
                themeMode === option.mode && styles.optionTextActive,
              ]}
            >
              {option.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

function createStyles(theme: ReturnType<typeof useTheme>) {
  return StyleSheet.create({
    container: {
      paddingVertical: theme.spacing.md,
    },
    label: {
      ...theme.typography.bodySmall,
      color: theme.colors.textSecondary,
      marginBottom: theme.spacing.sm,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    optionsContainer: {
      flexDirection: 'row',
      gap: theme.spacing.sm,
    },
    option: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: theme.spacing.sm,
      paddingHorizontal: theme.spacing.md,
      borderRadius: 8,
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    optionActive: {
      backgroundColor: theme.colors.primary,
      borderColor: theme.colors.primary,
    },
    optionIcon: {
      fontSize: 16,
      marginRight: theme.spacing.xs,
    },
    optionText: {
      ...theme.typography.bodySmall,
      color: theme.colors.text,
      fontWeight: '500',
    },
    optionTextActive: {
      color: '#FFFFFF',
      fontWeight: '600',
    },
  });
}

