import { useState, useEffect, useCallback } from 'react';
import { getSavedMovies } from '../infrastructure/storage/savedMovies.storage';
import { savedMovieToMovie } from '../domain/movie/movie.mapper';
import type { Movie } from '../domain/movie/movie.types';
import { logger } from '../utils/logger';

interface UseSavedMoviesState {
  movies: Movie[];
  loading: boolean;
  error: string | null;
}

interface UseSavedMoviesReturn extends UseSavedMoviesState {
  refresh: () => Promise<void>;
  retry: () => Promise<void>;
}

/**
 * Hook to fetch and manage saved movies
 */
export function useSavedMovies(): UseSavedMoviesReturn {
  const [state, setState] = useState<UseSavedMoviesState>({
    movies: [],
    loading: true,
    error: null,
  });

  const fetchSavedMovies = useCallback(async () => {
    try {
      setState((prev) => ({
        ...prev,
        loading: true,
        error: null,
      }));

      const savedMovies = await getSavedMovies();
      const movies = savedMovies.map(savedMovieToMovie);

      setState((prev) => ({
        ...prev,
        movies,
        loading: false,
      }));
    } catch (error) {
      const errorMessage = 'Failed to load saved movies';
      logger.error('Failed to fetch saved movies', { error });
      setState((prev) => ({
        ...prev,
        error: errorMessage,
        loading: false,
      }));
    }
  }, []);

  useEffect(() => {
    fetchSavedMovies();
  }, [fetchSavedMovies]);

  return {
    ...state,
    refresh: fetchSavedMovies,
    retry: fetchSavedMovies,
  };
}

