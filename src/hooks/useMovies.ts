import { useState, useEffect, useCallback } from 'react';
import {
    fetchPopularMovies,
    fetchUpcomingMovies,
    fetchTopRatedMovies,
    searchMovies,
} from '../infrastructure/api/tmdb.client';
import { mapTMDBMovieToMovie } from '../domain/movie/movie.mapper';
import type { Movie } from '../domain/movie/movie.types';
import { TMDBError, getUserFriendlyMessage } from '../infrastructure/api/tmdb.errors';
import { logger } from '../utils/logger';
import { useNetworkStatus } from './useNetworkStatus';

interface UseMoviesState {
    popular: Movie[];
    upcoming: Movie[];
    topRated: Movie[];
    searchResults: Movie[];
    loading: boolean;
    error: string | null;
    refreshing: boolean;
}

export interface SearchFilters {
    year?: number;
    genre?: number;
    language?: string;
}

interface UseMoviesReturn extends UseMoviesState {
    refresh: () => Promise<void>;
    search: (query: string, filters?: SearchFilters) => Promise<void>;
    clearSearch: () => void;
    retry: () => Promise<void>;
}

/**
 * Hook to fetch and manage popular, upcoming, and top rated movies
 */
export function useMovies(): UseMoviesReturn {
    const { isConnected } = useNetworkStatus();
    const [state, setState] = useState<UseMoviesState>({
        popular: [],
        upcoming: [],
        topRated: [],
        searchResults: [],
        loading: true,
        error: null,
        refreshing: false,
    });

    const fetchMovies = useCallback(async (isRefresh = false) => {
        if (!isConnected) {
            setState((prev) => ({
                ...prev,
                loading: false,
                refreshing: false,
                error: 'No internet connection. Please check your network.',
            }));
            return;
        }

        try {
            setState((prev) => ({
                ...prev,
                loading: !isRefresh,
                refreshing: isRefresh,
                error: null,
            }));

            const [popularResponse, upcomingResponse, topRatedResponse] = await Promise.all([
                fetchPopularMovies(),
                fetchUpcomingMovies(),
                fetchTopRatedMovies(),
            ]);

            const popular = popularResponse.results.map(mapTMDBMovieToMovie);
            const upcoming = upcomingResponse.results.map(mapTMDBMovieToMovie);
            // Limit top rated to first 10 movies
            const topRated = topRatedResponse.results
                .slice(0, 10)
                .map(mapTMDBMovieToMovie);

            setState((prev) => ({
                ...prev,
                popular,
                upcoming,
                topRated,
                loading: false,
                refreshing: false,
            }));
        } catch (error) {
            const errorMessage =
                error instanceof TMDBError
                    ? getUserFriendlyMessage(error)
                    : 'Failed to load movies';
            logger.error('Failed to fetch movies', { error });
            setState((prev) => ({
                ...prev,
                error: errorMessage,
                loading: false,
                refreshing: false,
            }));
        }
    }, [isConnected]);

    const search = useCallback(async (query: string, filters?: SearchFilters) => {
        if (!query.trim()) {
            setState((prev) => ({
                ...prev,
                searchResults: [],
            }));
            return;
        }

        if (!isConnected) {
            setState((prev) => ({
                ...prev,
                loading: false,
                error: 'No internet connection. Please check your network.',
                searchResults: [],
            }));
            return;
        }

        try {
            setState((prev) => ({
                ...prev,
                loading: true,
                error: null,
            }));

            const response = await searchMovies(query, 1, filters);
            const results = response.results.map(mapTMDBMovieToMovie);

            setState((prev) => ({
                ...prev,
                searchResults: results,
                loading: false,
            }));
        } catch (error) {
            const errorMessage =
                error instanceof TMDBError
                    ? getUserFriendlyMessage(error)
                    : 'Failed to search movies';
            logger.error('Failed to search movies', { error, query, filters });
            setState((prev) => ({
                ...prev,
                error: errorMessage,
                loading: false,
                searchResults: [],
            }));
        }
    }, [isConnected]);

    const clearSearch = useCallback(() => {
        setState((prev) => ({
            ...prev,
            searchResults: [],
        }));
    }, []);

    const retry = useCallback(() => {
        return fetchMovies(false);
    }, [fetchMovies]);

    useEffect(() => {
        fetchMovies(false);
    }, [fetchMovies, isConnected]);

    return {
        ...state,
        refresh: () => fetchMovies(true),
        search,
        clearSearch,
        retry,
    };
}

