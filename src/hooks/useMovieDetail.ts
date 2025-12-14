import { useState, useEffect, useCallback } from 'react';
import { fetchMovieDetail } from '../infrastructure/api/tmdb.client';
import { mapTMDBMovieDetailToMovie } from '../domain/movie/movie.mapper';
import type { Movie } from '../domain/movie/movie.types';
import { TMDBError, getUserFriendlyMessage } from '../infrastructure/api/tmdb.errors';
import { logger } from '../utils/logger';
import {
  getSavedMovieById,
  saveMovie as saveMovieToStorage,
  removeMovie as removeMovieFromStorage,
} from '../infrastructure/storage/savedMovies.storage';
import { movieToSavedMovie, savedMovieToMovie } from '../domain/movie/movie.mapper';

interface UseMovieDetailState {
  movie: Movie | null;
  loading: boolean;
  error: string | null;
  isSaved: boolean;
}

interface UseMovieDetailReturn extends UseMovieDetailState {
  retry: () => Promise<void>;
  toggleSave: () => Promise<void>;
}

/**
 * Hook to fetch and manage movie details
 * Supports offline mode by checking saved movies first
 */
export function useMovieDetail(movieId: number): UseMovieDetailReturn {
  const [state, setState] = useState<UseMovieDetailState>({
    movie: null,
    loading: true,
    error: null,
    isSaved: false,
  });

  const fetchMovie = useCallback(async () => {
    try {
      setState((prev) => ({
        ...prev,
        loading: true,
        error: null,
      }));

      // First, check if movie is saved (offline support)
      const savedMovie = await getSavedMovieById(movieId);
      if (savedMovie) {
        const movie = savedMovieToMovie(savedMovie);
        setState((prev) => ({
          ...prev,
          movie,
          isSaved: true,
          loading: false,
        }));
      }

      // Try to fetch fresh data from API
      try {
        const detail = await fetchMovieDetail(movieId);
        const movie = mapTMDBMovieDetailToMovie(detail);
        const isSaved = await getSavedMovieById(movieId).then((m) => !!m);

        setState((prev) => ({
          ...prev,
          movie,
          isSaved,
          loading: false,
        }));
      } catch (apiError) {
        // If API fails but we have saved data, use that
        if (savedMovie) {
          logger.warn('API fetch failed, using saved data', { error: apiError });
          return;
        }
        // Otherwise, throw the error
        throw apiError;
      }
    } catch (error) {
      const errorMessage =
        error instanceof TMDBError
          ? getUserFriendlyMessage(error)
          : 'Failed to load movie details';
      logger.error('Failed to fetch movie detail', { error, movieId });
      setState((prev) => ({
        ...prev,
        error: errorMessage,
        loading: false,
      }));
    }
  }, [movieId]);

  const toggleSave = useCallback(async () => {
    if (!state.movie) {
      return;
    }

    try {
      if (state.isSaved) {
        await removeMovieFromStorage(movieId);
        setState((prev) => ({
          ...prev,
          isSaved: false,
        }));
      } else {
        const savedMovie = movieToSavedMovie(state.movie);
        await saveMovieToStorage(savedMovie);
        setState((prev) => ({
          ...prev,
          isSaved: true,
        }));
      }
    } catch (error) {
      logger.error('Failed to toggle save', { error, movieId });
      // Revert optimistic update
      setState((prev) => ({
        ...prev,
        isSaved: !prev.isSaved,
      }));
    }
  }, [state.movie, state.isSaved, movieId]);

  useEffect(() => {
    fetchMovie();
  }, [fetchMovie]);

  return {
    ...state,
    retry: fetchMovie,
    toggleSave,
  };
}

