/**
 * Movie card component for displaying movie information
 */

import React, { memo, useEffect, useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
} from 'react-native';
import { Image as ExpoImage } from 'expo-image';
import Animated, { 
    useAnimatedStyle,
    useSharedValue,
    withTiming,
} from 'react-native-reanimated';
import type { Movie } from '../../domain/movie/movie.types';
import { useTheme } from '../../ui/theme/theme';
import { cacheImage, getCachedImagePath } from '../../infrastructure/storage/imageCache.storage';
import { useNetworkStatus } from '../../hooks/useNetworkStatus';

interface MovieCardProps {
    movie: Movie;
    onPress: (movie: Movie) => void;
    index?: number;
}

export const MovieCard = memo<MovieCardProps>(({ movie, onPress, index = 0 }) => {
    const theme = useTheme();
    const { isConnected } = useNetworkStatus();
    const [cachedImageUri, setCachedImageUri] = useState<string | null>(null);
    const scale = useSharedValue(1);
    const year = movie.releaseDate
        ? new Date(movie.releaseDate).getFullYear()
        : 'N/A';

    const styles = createStyles(theme);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
    }));

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

    const handlePressIn = () => {
        scale.value = withTiming(0.98, { duration: 100 });
    };

    const handlePressOut = () => {
        scale.value = withTiming(1, { duration: 100 });
    };

    return (
        <View style={styles.container}>
            <TouchableOpacity
                onPress={() => onPress(movie)}
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
                activeOpacity={1}
            >
                <Animated.View style={animatedStyle}>
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
                </Animated.View>
            </TouchableOpacity>
        </View>
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

