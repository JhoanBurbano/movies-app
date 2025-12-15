/**
 * Movies screen - displays Popular and Upcoming movies with search
 */

import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import {
    View,
    StyleSheet,
    FlatList,
    TextInput,
    RefreshControl,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useMovies } from '../../hooks/useMovies';
import { useDebounce } from '../../hooks/useDebounce';
import { MovieCard } from '../components/MovieCard';
import { TopRatedCard } from '../components/TopRatedCard';
import { SectionHeader } from '../components/SectionHeader';
import { ErrorState } from '../components/ErrorState';
import { EmptyState } from '../components/EmptyState';
import { LoadingSkeleton } from '../components/LoadingSkeleton';
import { SearchFilters as SearchFiltersComponent, type SearchFiltersState } from '../components/SearchFilters';
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
    const [searchFilters, setSearchFilters] = useState<SearchFiltersState>({});
    const debouncedQuery = useDebounce(searchQuery, 400);

    // Use refs to track previous values and avoid infinite loops
    const prevQueryRef = useRef<string>('');
    const prevFiltersRef = useRef<SearchFiltersState>({});

    const {
        popular,
        upcoming,
        topRated,
        searchResults,
        loading,
        error,
        refreshing,
        refresh,
        search,
        clearSearch,
        retry,
    } = useMovies();

    // Memoize filters object to avoid recreating on every render
    const filtersMemo = useMemo(() => {
        return {
            year: searchFilters.year,
            genre: searchFilters.genre,
            language: searchFilters.language,
        };
    }, [searchFilters.year, searchFilters.genre, searchFilters.language]);

    // Trigger search when debounced query or filters change
    useEffect(() => {
        const queryChanged = prevQueryRef.current !== debouncedQuery;
        const filtersChanged =
            prevFiltersRef.current.year !== searchFilters.year ||
            prevFiltersRef.current.genre !== searchFilters.genre ||
            prevFiltersRef.current.language !== searchFilters.language;

        if (debouncedQuery.trim()) {
            // Only search if query or filters actually changed
            if (queryChanged || filtersChanged) {
                search(debouncedQuery, filtersMemo);
                prevQueryRef.current = debouncedQuery;
                prevFiltersRef.current = { ...searchFilters };
            }
        } else {
            // Only clear if we had a query before
            if (prevQueryRef.current.trim()) {
                clearSearch();
                setSearchFilters({});
                prevQueryRef.current = '';
                prevFiltersRef.current = {};
            }
        }
    }, [debouncedQuery, filtersMemo, search, clearSearch]);

    const handleMoviePress = useCallback(
        (movie: Movie) => {
            navigation.navigate('MovieDetail', { movieId: movie.id });
        },
        [navigation]
    );

    const handleRefresh = useCallback(async () => {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        refresh();
    }, [refresh]);

    const renderMovie = useCallback(
        ({ item, index }: { item: Movie; index: number }) => (
            <MovieCard movie={item} onPress={handleMoviePress} index={index} />
        ),
        [handleMoviePress]
    );

    const renderTopRatedMovie = useCallback(
        ({ item, index }: { item: Movie; index: number }) => (
            <TopRatedCard
                movie={item}
                rank={index + 1}
                onPress={handleMoviePress}
            />
        ),
        [handleMoviePress]
    );

    const renderSection = useCallback(
        (title: string, movies: Movie[], isTopRated: boolean = false) => {
            if (movies.length === 0) {
                return null;
            }

            return (
                <View>
                    <SectionHeader title={title} />
                    <FlatList
                        data={movies}
                        renderItem={isTopRated ? renderTopRatedMovie : renderMovie}
                        keyExtractor={(item) => item.id.toString()}
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.listContent}
                        initialNumToRender={isTopRated ? 5 : 5}
                        windowSize={isTopRated ? 5 : 5}
                        removeClippedSubviews
                    />
                </View>
            );
        },
        [renderMovie, renderTopRatedMovie, styles.listContent]
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


    if (loading && !refreshing && popular.length === 0 && topRated.length === 0) {
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
                    testID="search-input"
                />
            </View>

            {debouncedQuery.trim() ? (
                <View style={styles.searchResultsContainer}>
                    {searchResults.length > 0 && (
                        <SearchFiltersComponent
                            filters={searchFilters}
                            onFiltersChange={setSearchFilters}
                        />
                    )}
                    {renderSearchResults}
                </View>
            ) : (
                <FlatList
                    data={[
                        { type: 'popular', movies: popular, isTopRated: false },
                        { type: 'topRated', movies: topRated, isTopRated: true },
                        { type: 'upcoming', movies: upcoming, isTopRated: false },
                    ]}
                    renderItem={({ item }) => {
                        let title = '';
                        switch (item.type) {
                            case 'popular':
                                title = 'Popular';
                                break;
                            case 'topRated':
                                title = 'Top Rated';
                                break;
                            case 'upcoming':
                                title = 'Upcoming';
                                break;
                        }
                        return renderSection(title, item.movies, item.isTopRated);
                    }}
                    keyExtractor={(item) => item.type}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
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

