/**
 * Theme toggle component
 * Allows users to switch between system, light, and dark modes
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { useTheme } from '../../ui/theme/theme';
import { useThemeContext, type ThemeMode } from '../../ui/theme/ThemeContext';

const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);

export function ThemeToggle() {
  const theme = useTheme();
  const { themeMode, setThemeMode } = useThemeContext();
  const styles = createStyles(theme);

  const options: { mode: ThemeMode; label: string; iconName: keyof typeof Ionicons.glyphMap }[] = [
    { mode: 'system', label: 'System', iconName: 'phone-portrait-outline' },
    { mode: 'light', label: 'Light', iconName: 'sunny-outline' },
    { mode: 'dark', label: 'Dark', iconName: 'moon-outline' },
  ];

  const scales = options.map(() => useSharedValue(1));

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Select a theme mode</Text>
      <View style={styles.optionsContainer}>
        {options.map((option, index) => {
          const scale = scales[index];
          const animatedStyle = useAnimatedStyle(() => ({
            transform: [{ scale: scale.value }],
          }));

          const handlePressIn = () => {
            scale.value = withTiming(0.98, { duration: 100 });
          };

          const handlePressOut = () => {
            scale.value = withTiming(1, { duration: 100 });
          };

          const handleThemeChange = async () => {
            await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            setThemeMode(option.mode);
          };

          return (
            <AnimatedTouchableOpacity
              key={option.mode}
              testID={`theme-toggle-${option.mode}`}
              style={[
                styles.option,
                themeMode === option.mode && styles.optionActive,
                index > 0 && styles.optionSpacing,
                animatedStyle,
              ]}
              onPress={handleThemeChange}
              onPressIn={handlePressIn}
              onPressOut={handlePressOut}
              activeOpacity={1}
            >
              <Ionicons
                name={option.iconName}
                size={18}
                color={themeMode === option.mode ? theme.colors.textOnDark : theme.colors.text}
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
            </AnimatedTouchableOpacity>
          );
        })}
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
      fontWeight: theme.typography.weights.medium,
    },
    optionTextActive: {
      color: theme.colors.textOnDark,
      fontWeight: theme.typography.weights.semibold,
    },
  });
}

