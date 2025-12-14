/**
 * Loading skeleton component for movie cards
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from '../../ui/theme/theme';

interface LoadingSkeletonProps {
  count?: number;
}

export function LoadingSkeleton({ count = 5 }: LoadingSkeletonProps) {
  const theme = useTheme();
  const styles = createStyles(theme);

  return (
    <View style={styles.container}>
      {Array.from({ length: count }).map((_, index) => (
        <View key={index} style={styles.card}>
          <View style={styles.poster} />
          <View style={styles.title} />
          <View style={styles.year} />
        </View>
      ))}
    </View>
  );
}

function createStyles(theme: ReturnType<typeof useTheme>) {
  return StyleSheet.create({
    container: {
      flexDirection: 'row',
      paddingHorizontal: theme.spacing.md,
    },
    card: {
      width: 150,
      marginRight: theme.spacing.md,
    },
    poster: {
      width: 150,
      height: 225,
      borderRadius: 8,
      backgroundColor: theme.colors.surface,
      marginBottom: theme.spacing.sm,
    },
    title: {
      height: 16,
      borderRadius: 4,
      backgroundColor: theme.colors.surface,
      marginBottom: theme.spacing.xs,
    },
    year: {
      height: 12,
      width: 60,
      borderRadius: 4,
      backgroundColor: theme.colors.surface,
    },
  });
}

