/**
 * Movie card component for displaying movie information
 */

import React, { memo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { Image as ExpoImage } from 'expo-image';
import type { Movie } from '../../domain/movie/movie.types';
import { useTheme } from '../../ui/theme/theme';

interface MovieCardProps {
  movie: Movie;
  onPress: (movie: Movie) => void;
}

export const MovieCard = memo<MovieCardProps>(({ movie, onPress }) => {
  const theme = useTheme();
  const year = movie.releaseDate
    ? new Date(movie.releaseDate).getFullYear()
    : 'N/A';

  const styles = createStyles(theme);

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={() => onPress(movie)}
      activeOpacity={0.7}
    >
      <View style={styles.posterContainer}>
        {movie.posterUrl ? (
          <ExpoImage
            source={{ uri: movie.posterUrl }}
            style={styles.poster}
            contentFit="cover"
            transition={200}
            placeholderContentFit="cover"
          />
        ) : (
          <View style={[styles.poster, styles.placeholder]}>
            <Text style={styles.placeholderText}>No Image</Text>
          </View>
        )}
        <View style={styles.ratingBadge}>
          <Text style={styles.ratingText}>
            {movie.rating.toFixed(1)}
          </Text>
        </View>
      </View>
      <View style={styles.info}>
        <Text style={styles.title} numberOfLines={2}>
          {movie.title}
        </Text>
        <Text style={styles.year}>{year}</Text>
      </View>
    </TouchableOpacity>
  );
});

MovieCard.displayName = 'MovieCard';

function createStyles(theme: ReturnType<typeof useTheme>) {
  return StyleSheet.create({
    container: {
      width: 150,
      marginRight: theme.spacing.md,
    },
    posterContainer: {
      position: 'relative',
      marginBottom: theme.spacing.sm,
    },
    poster: {
      width: 150,
      height: 225,
      borderRadius: 8,
      backgroundColor: theme.colors.surface,
    },
    placeholder: {
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: theme.colors.surface,
    },
    placeholderText: {
      color: theme.colors.textSecondary,
      fontSize: 12,
    },
    ratingBadge: {
      position: 'absolute',
      top: theme.spacing.xs,
      right: theme.spacing.xs,
      backgroundColor: theme.colors.rating,
      borderRadius: 4,
      paddingHorizontal: theme.spacing.xs,
      paddingVertical: 2,
    },
    ratingText: {
      color: '#000000',
      fontSize: 12,
      fontWeight: '700',
    },
    info: {
      paddingHorizontal: theme.spacing.xs,
    },
    title: {
      ...theme.typography.bodySmall,
      color: theme.colors.text,
      marginBottom: theme.spacing.xs,
      fontWeight: '600',
    },
    year: {
      ...theme.typography.caption,
      color: theme.colors.textSecondary,
    },
  });
}

