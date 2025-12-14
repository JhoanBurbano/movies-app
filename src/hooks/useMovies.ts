import { useState, useEffect, useCallback } from 'react';
import {
  fetchPopularMovies,
  fetchUpcomingMovies,
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
  searchResults: Movie[];
  loading: boolean;
  error: string | null;
  refreshing: boolean;
}

interface UseMoviesReturn extends UseMoviesState {
  refresh: () => Promise<void>;
  search: (query: string) => Promise<void>;
  clearSearch: () => void;
  retry: () => Promise<void>;
}

/**
 * Hook to fetch and manage popular and upcoming movies
 */
export function useMovies(): UseMoviesReturn {
  const { isConnected } = useNetworkStatus();
  const [state, setState] = useState<UseMoviesState>({
    popular: [],
    upcoming: [],
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

      const [popularResponse, upcomingResponse] = await Promise.all([
        fetchPopularMovies(),
        fetchUpcomingMovies(),
      ]);

      const popular = popularResponse.results.map(mapTMDBMovieToMovie);
      const upcoming = upcomingResponse.results.map(mapTMDBMovieToMovie);

      setState((prev) => ({
        ...prev,
        popular,
        upcoming,
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
  }, []);

  const search = useCallback(async (query: string) => {
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

      const response = await searchMovies(query, 1);
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
      logger.error('Failed to search movies', { error, query });
      setState((prev) => ({
        ...prev,
        error: errorMessage,
        loading: false,
        searchResults: [],
      }));
    }
  }, []);

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

