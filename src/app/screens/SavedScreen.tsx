/**
 * Saved movies screen - displays offline-saved movies
 */

import React, { useCallback, useMemo } from 'react';
import {
    View,
    StyleSheet,
    FlatList,
    RefreshControl,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSavedMovies } from '../../hooks/useSavedMovies';
import { MovieCard } from '../components/MovieCard';
import { ErrorState } from '../components/ErrorState';
import { EmptyState } from '../components/EmptyState';
import { LoadingSkeleton } from '../components/LoadingSkeleton';
import { useTheme } from '../../ui/theme/theme';
import type { Movie } from '../../domain/movie/movie.types';

type NavigationProp = NativeStackNavigationProp<{
    MovieDetail: { movieId: number };
}>;

export function SavedScreen() {
    const navigation = useNavigation<NavigationProp>();
    const theme = useTheme();
    const styles = createStyles(theme);

    const { movies, loading, error, refresh, retry } = useSavedMovies();

    // Refresh when screen comes into focus
    useFocusEffect(
        useCallback(() => {
            refresh();
        }, [refresh])
    );

    const handleMoviePress = useCallback(
        (movie: Movie) => {
            navigation.navigate('MovieDetail', { movieId: movie.id });
        },
        [navigation]
    );

    const renderMovie = useCallback(
        ({ item }: { item: Movie }) => (
            <View style={styles.cardWrapper}>
                <MovieCard movie={item} onPress={handleMoviePress} />
            </View>
        ),
        [handleMoviePress, styles.cardWrapper]
    );

    const renderContent = useMemo(() => {
        if (loading && movies.length === 0) {
            return <LoadingSkeleton count={5} />;
        }

        if (error) {
            return <ErrorState message={error} onRetry={retry} />;
        }

        if (movies.length === 0) {
            return (
                <EmptyState
                    message="No saved movies"
                    subtitle="Save movies from the Movies tab to view them here"
                />
            );
        }

        return (
            <FlatList
                data={movies}
                renderItem={renderMovie}
                keyExtractor={(item) => item.id.toString()}
                numColumns={2}
                contentContainerStyle={styles.listContent}
                columnWrapperStyle={styles.row}
                refreshControl={
                    <RefreshControl refreshing={loading} onRefresh={refresh} />
                }
                initialNumToRender={10}
                windowSize={10}
                removeClippedSubviews
            />
        );
    }, [loading, error, movies, retry, refresh, renderMovie, styles]);

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            {renderContent}
        </SafeAreaView>
    );
}

function createStyles(theme: ReturnType<typeof useTheme>) {
    return StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: theme.colors.background,
        },
        listContent: {
            padding: theme.spacing.md,
        },
        row: {
            justifyContent: 'space-between',
        },
        cardWrapper: {
            width: '48%',
            marginBottom: theme.spacing.md,
        },
    });
}

