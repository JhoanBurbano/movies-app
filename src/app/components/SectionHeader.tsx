/**
 * Section header component for movie lists
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../ui/theme/theme';

interface SectionHeaderProps {
  title: string;
}

export function SectionHeader({ title }: SectionHeaderProps) {
  const theme = useTheme();
  const styles = createStyles(theme);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
    </View>
  );
}

function createStyles(theme: ReturnType<typeof useTheme>) {
  return StyleSheet.create({
    container: {
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.md,
    },
    title: {
      ...theme.typography.h2,
      color: theme.colors.text,
    },
  });
}

