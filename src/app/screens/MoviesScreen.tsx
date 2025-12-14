/**
 * Movies screen - displays Popular and Upcoming movies with search
 */

import React, { useState, useCallback, useMemo } from 'react';
import {
    View,
    StyleSheet,
    FlatList,
    TextInput,
    RefreshControl,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useMovies } from '../../hooks/useMovies';
import { useDebounce } from '../../hooks/useDebounce';
import { MovieCard } from '../components/MovieCard';
import { SectionHeader } from '../components/SectionHeader';
import { ErrorState } from '../components/ErrorState';
import { EmptyState } from '../components/EmptyState';
import { LoadingSkeleton } from '../components/LoadingSkeleton';
import { useTheme } from '../../ui/theme/theme';
import type { Movie } from '../../domain/movie/movie.types';

type NavigationProp = NativeStackNavigationProp<{
    MovieDetail: { movieId: number };
}>;

export function MoviesScreen() {
    const navigation = useNavigation<NavigationProp>();
    const theme = useTheme();
    const styles = createStyles(theme);

    const [searchQuery, setSearchQuery] = useState('');
    const debouncedQuery = useDebounce(searchQuery, 400);

    const {
        popular,
        upcoming,
        searchResults,
        loading,
        error,
        refreshing,
        refresh,
        search,
        clearSearch,
        retry,
    } = useMovies();

    // Trigger search when debounced query changes
    React.useEffect(() => {
        if (debouncedQuery.trim()) {
            search(debouncedQuery);
        } else {
            clearSearch();
        }
    }, [debouncedQuery, search, clearSearch]);

    const handleMoviePress = useCallback(
        (movie: Movie) => {
            navigation.navigate('MovieDetail', { movieId: movie.id });
        },
        [navigation]
    );

    const renderMovie = useCallback(
        ({ item }: { item: Movie }) => (
            <MovieCard movie={item} onPress={handleMoviePress} />
        ),
        [handleMoviePress]
    );

    const renderSection = useCallback(
        (title: string, movies: Movie[]) => (
            <View>
                <SectionHeader title={title} />
                <FlatList
                    data={movies}
                    renderItem={renderMovie}
                    keyExtractor={(item) => item.id.toString()}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.listContent}
                    initialNumToRender={5}
                    windowSize={5}
                    removeClippedSubviews
                />
            </View>
        ),
        [renderMovie, styles.listContent]
    );

    const renderSearchResults = useMemo(() => {
        if (!debouncedQuery.trim()) {
            return null;
        }

        if (loading) {
            return <LoadingSkeleton count={5} />;
        }

        if (error) {
            return <ErrorState message={error} onRetry={retry} />;
        }

        if (searchResults.length === 0) {
            return (
                <EmptyState
                    message="No movies found"
                    subtitle="Try a different search term"
                />
            );
        }

        return (
            <FlatList
                data={searchResults}
                renderItem={({ item }) => (
                    <View style={styles.searchItem}>
                        <MovieCard movie={item} onPress={handleMoviePress} />
                    </View>
                )}
                keyExtractor={(item) => item.id.toString()}
                numColumns={2}
                contentContainerStyle={styles.searchContent}
                columnWrapperStyle={styles.searchRow}
                initialNumToRender={10}
                windowSize={10}
                removeClippedSubviews
            />
        );
    }, [
        debouncedQuery,
        loading,
        error,
        searchResults,
        retry,
        handleMoviePress,
        styles.searchItem,
        styles.searchContent,
        styles.searchRow,
    ]);

    if (error && !debouncedQuery.trim()) {
        return <ErrorState message={error} onRetry={retry} />;
    }


    if (loading && !refreshing && popular.length === 0) {
        return (<View style={styles.container}>
            <LoadingSkeleton count={5} />
        </View>);
    }

    return (
        <View style={styles.container}>
            <View style={styles.searchContainer}>
                <TextInput
                    style={styles.searchInput}
                    placeholder="Search movies..."
                    placeholderTextColor={theme.colors.textTertiary}
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                />
            </View>

            {debouncedQuery.trim() ? (
                <View style={styles.searchResultsContainer}>{renderSearchResults}</View>
            ) : (
                <FlatList
                    data={[
                        { type: 'popular', movies: popular },
                        { type: 'upcoming', movies: upcoming },
                    ]}
                    renderItem={({ item }) =>
                        renderSection(
                            item.type === 'popular' ? 'Popular' : 'Upcoming',
                            item.movies
                        )
                    }
                    keyExtractor={(item) => item.type}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={refresh} />
                    }
                    showsVerticalScrollIndicator={false}
                />
            )}
        </View>
    );
}

function createStyles(theme: ReturnType<typeof useTheme>) {
    return StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: theme.colors.background,
        },
        searchContainer: {
            paddingHorizontal: theme.spacing.md,
            paddingVertical: theme.spacing.md,
            borderBottomWidth: 1,
            borderBottomColor: theme.colors.border,
        },
        searchInput: {
            ...theme.typography.body,
            color: theme.colors.text,
            backgroundColor: theme.colors.surface,
            borderRadius: 8,
            paddingHorizontal: theme.spacing.md,
            paddingVertical: theme.spacing.sm,
        },
        searchResultsContainer: {
            flex: 1,
        },
        searchContent: {
            padding: theme.spacing.md,
        },
        searchRow: {
            justifyContent: 'space-between',
        },
        searchItem: {
            width: '48%',
        },
        listContent: {
            paddingHorizontal: theme.spacing.md,
        },
    });
}

