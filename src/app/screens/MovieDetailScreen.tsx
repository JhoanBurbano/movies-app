/**
 * Movie detail screen - displays full movie information
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import { Image as ExpoImage } from 'expo-image';
import * as Haptics from 'expo-haptics';
import { useMovieDetail } from '../../hooks/useMovieDetail';
import { ErrorState } from '../components/ErrorState';
import { useTheme } from '../../ui/theme/theme';

type RouteParams = {
  MovieDetail: { movieId: number };
};

export function MovieDetailScreen() {
  const route = useRoute<RouteProp<RouteParams, 'MovieDetail'>>();
  const navigation = useNavigation();
  const theme = useTheme();
  const styles = createStyles(theme);

  const { movieId } = route.params;
  const { movie, loading, error, isSaved, retry, toggleSave } =
    useMovieDetail(movieId);

  const [overviewExpanded, setOverviewExpanded] = useState(false);

  const handleToggleSave = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    await toggleSave();
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  if (error) {
    return <ErrorState message={error} onRetry={retry} />;
  }

  if (!movie) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>Movie not found</Text>
      </View>
    );
  }

  const year = movie.releaseDate
    ? new Date(movie.releaseDate).getFullYear()
    : 'N/A';
  const runtime = movie.runtime ? `${movie.runtime} min` : 'N/A';
  const genres = movie.genres.map((g) => g.name).join(', ') || 'N/A';

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {movie.posterUrl && (
        <ExpoImage
          source={{ uri: movie.posterUrl }}
          style={styles.heroImage}
          contentFit="cover"
          transition={200}
        />
      )}

      <View style={styles.content}>
        <View style={styles.header}>
          <View style={styles.titleContainer}>
            <Text style={styles.title}>{movie.title}</Text>
            <View style={styles.metaRow}>
              <Text style={styles.metaText}>{year}</Text>
              {movie.rating > 0 && (
                <>
                  <Text style={styles.metaSeparator}>•</Text>
                  <Text style={styles.metaText}>
                    ⭐ {movie.rating.toFixed(1)}
                  </Text>
                </>
              )}
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Overview</Text>
          <Text
            style={styles.overview}
            numberOfLines={overviewExpanded ? undefined : 4}
          >
            {movie.overview || 'No overview available.'}
          </Text>
          {movie.overview && movie.overview.length > 150 && (
            <TouchableOpacity
              onPress={() => setOverviewExpanded(!overviewExpanded)}
            >
              <Text style={styles.expandText}>
                {overviewExpanded ? 'Show less' : 'Show more'}
              </Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.detailsGrid}>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Genres</Text>
            <Text style={styles.detailValue}>{genres}</Text>
          </View>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Runtime</Text>
            <Text style={styles.detailValue}>{runtime}</Text>
          </View>
          {movie.language && (
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Language</Text>
              <Text style={styles.detailValue}>
                {movie.language.toUpperCase()}
              </Text>
            </View>
          )}
        </View>

        <TouchableOpacity
          style={[
            styles.saveButton,
            isSaved && styles.saveButtonActive,
          ]}
          onPress={handleToggleSave}
        >
          <Text
            style={[
              styles.saveButtonText,
              isSaved && styles.saveButtonTextActive,
            ]}
          >
            {isSaved ? '✓ Saved' : 'Save Movie'}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

function createStyles(theme: ReturnType<typeof useTheme>) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    centerContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    heroImage: {
      width: '100%',
      height: 400,
      backgroundColor: theme.colors.surface,
    },
    content: {
      padding: theme.spacing.md,
    },
    header: {
      marginBottom: theme.spacing.lg,
    },
    titleContainer: {
      marginBottom: theme.spacing.sm,
    },
    title: {
      ...theme.typography.h1,
      color: theme.colors.text,
      marginBottom: theme.spacing.xs,
    },
    metaRow: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    metaText: {
      ...theme.typography.bodySmall,
      color: theme.colors.textSecondary,
    },
    metaSeparator: {
      ...theme.typography.bodySmall,
      color: theme.colors.textTertiary,
      marginHorizontal: theme.spacing.xs,
    },
    section: {
      marginBottom: theme.spacing.lg,
    },
    sectionTitle: {
      ...theme.typography.h3,
      color: theme.colors.text,
      marginBottom: theme.spacing.sm,
    },
    overview: {
      ...theme.typography.body,
      color: theme.colors.textSecondary,
      lineHeight: 24,
    },
    expandText: {
      ...theme.typography.bodySmall,
      color: theme.colors.primary,
      marginTop: theme.spacing.xs,
    },
    detailsGrid: {
      marginBottom: theme.spacing.lg,
    },
    detailItem: {
      marginBottom: theme.spacing.md,
    },
    detailLabel: {
      ...theme.typography.caption,
      color: theme.colors.textTertiary,
      marginBottom: theme.spacing.xs,
      textTransform: 'uppercase',
    },
    detailValue: {
      ...theme.typography.body,
      color: theme.colors.text,
    },
    saveButton: {
      backgroundColor: theme.colors.primary,
      paddingVertical: theme.spacing.md,
      paddingHorizontal: theme.spacing.lg,
      borderRadius: 8,
      alignItems: 'center',
      marginTop: theme.spacing.md,
    },
    saveButtonActive: {
      backgroundColor: theme.colors.success,
    },
    saveButtonText: {
      ...theme.typography.button,
      color: '#FFFFFF',
    },
    saveButtonTextActive: {
      color: '#FFFFFF',
    },
    errorText: {
      ...theme.typography.body,
      color: theme.colors.error,
    },
  });
}

