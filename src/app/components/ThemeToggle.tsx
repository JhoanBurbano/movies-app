/**
 * Theme toggle component
 * Allows users to switch between system, light, and dark modes
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../ui/theme/theme';
import { useThemeContext, type ThemeMode } from '../../ui/theme/ThemeContext';

export function ThemeToggle() {
  const theme = useTheme();
  const { themeMode, setThemeMode } = useThemeContext();
  const styles = createStyles(theme);

  const options: { mode: ThemeMode; label: string; iconName: keyof typeof Ionicons.glyphMap }[] = [
    { mode: 'system', label: 'System', iconName: 'phone-portrait-outline' },
    { mode: 'light', label: 'Light', iconName: 'sunny-outline' },
    { mode: 'dark', label: 'Dark', iconName: 'moon-outline' },
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Theme</Text>
      <View style={styles.optionsContainer}>
        {options.map((option, index) => (
          <TouchableOpacity
            key={option.mode}
            style={[
              styles.option,
              themeMode === option.mode && styles.optionActive,
              index > 0 && styles.optionSpacing,
            ]}
            onPress={() => setThemeMode(option.mode)}
            activeOpacity={0.7}
          >
            <Ionicons
              name={option.iconName}
              size={18}
              color={themeMode === option.mode ? '#FFFFFF' : theme.colors.text}
              style={styles.optionIcon}
            />
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
    optionSpacing: {
      marginLeft: theme.spacing.sm,
    },
    optionActive: {
      backgroundColor: theme.colors.primary,
      borderColor: theme.colors.primary,
    },
    optionIcon: {
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

