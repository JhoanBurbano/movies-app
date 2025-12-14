/**
 * Top Rated movie card component
 * Larger card design with ranking number overlay
 */

import React, { memo, useEffect, useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
} from 'react-native';
import { Image as ExpoImage } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import type { Movie } from '../../domain/movie/movie.types';
import { useTheme } from '../../ui/theme/theme';
import { cacheImage, getCachedImagePath } from '../../infrastructure/storage/imageCache.storage';
import { useNetworkStatus } from '../../hooks/useNetworkStatus';

interface TopRatedCardProps {
    movie: Movie;
    rank: number;
    onPress: (movie: Movie) => void;
}

export const TopRatedCard = memo<TopRatedCardProps>(({ movie, rank, onPress }) => {
    const theme = useTheme();
    const { isConnected } = useNetworkStatus();
    const [cachedImageUri, setCachedImageUri] = useState<string | null>(null);
    const year = movie.releaseDate
        ? new Date(movie.releaseDate).getFullYear()
        : 'N/A';

    const styles = createStyles(theme);

    // Cache image when online
    useEffect(() => {
        if (movie.posterUrl && isConnected) {
            cacheImage(movie.posterUrl).catch(() => {
                // Silently fail - expo-image will handle fallback
            });
        }
    }, [movie.posterUrl, isConnected]);

    // Get cached image path when offline
    useEffect(() => {
        if (movie.posterUrl && !isConnected) {
            getCachedImagePath(movie.posterUrl).then((path) => {
                if (path) {
                    setCachedImageUri(path);
                }
            });
        } else {
            setCachedImageUri(null);
        }
    }, [movie.posterUrl, isConnected]);

    const imageUri = cachedImageUri || movie.posterUrl;

    return (
        <TouchableOpacity
            style={styles.container}
            onPress={() => onPress(movie)}
            activeOpacity={0.7}
        >
            <View style={styles.posterContainer}>
                {imageUri ? (
                    <ExpoImage
                        source={{ uri: imageUri }}
                        style={styles.poster}
                        contentFit="cover"
                        transition={200}
                        placeholderContentFit="cover"
                        cachePolicy={isConnected ? 'memory-disk' : 'disk'}
                    />
                ) : (
                    <View style={[styles.poster, styles.placeholder]}>
                        <Text style={styles.placeholderText}>No Image</Text>
                    </View>
                )}

                {/* Ranking number overlay */}
                <View style={styles.rankBadge}>
                    <Text style={styles.rankText}>{rank}</Text>
                </View>

                {/* Rating badge */}
                <View style={styles.ratingBadge}>
                    <Ionicons name="star" size={13} color="#000000" style={styles.starIcon} />
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

TopRatedCard.displayName = 'TopRatedCard';

function createStyles(theme: ReturnType<typeof useTheme>) {
    return StyleSheet.create({
        container: {
            width: 200,
            marginRight: theme.spacing.md,
        },
        posterContainer: {
            position: 'relative',
            marginBottom: theme.spacing.sm,
        },
        poster: {
            width: 200,
            height: 300,
            borderRadius: 12,
            backgroundColor: theme.colors.surface,
        },
        placeholder: {
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: theme.colors.surface,
        },
        placeholderText: {
            color: theme.colors.textSecondary,
            fontSize: 14,
        },
        rankBadge: {
            position: 'absolute',
            top: 0,
            left: 0,
            backgroundColor: theme.colors.primary,
            borderTopLeftRadius: 12,
            borderBottomRightRadius: 12,
            width: 45,
            height: 45,
            justifyContent: 'center',
            alignItems: 'center',
        },
        rankText: {
            color: '#FFFFFF',
            fontSize: 30,
            fontWeight: '800',
            letterSpacing: -0.5,
        },
        ratingBadge: {
            position: 'absolute',
            bottom: theme.spacing.sm,
            right: theme.spacing.sm,
            backgroundColor: theme.colors.rating,
            borderRadius: 8,
            paddingHorizontal: theme.spacing.xs,
            paddingVertical: 4,
            flexDirection: 'row',
            alignItems: 'center',
            shadowColor: '#000000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.3,
            shadowRadius: 4,
            elevation: 5,
        },
        starIcon: {
            marginRight: 4,
        },
        ratingText: {
            color: '#000000',
            fontSize: 13,
            fontWeight: '700',
        },
        info: {
            paddingHorizontal: theme.spacing.xs,
        },
        title: {
            ...theme.typography.body,
            color: theme.colors.text,
            marginBottom: theme.spacing.xs,
            fontWeight: '600',
            lineHeight: 20,
        },
        year: {
            ...theme.typography.caption,
            color: theme.colors.textSecondary,
            fontSize: 13,
        },
    });
}

