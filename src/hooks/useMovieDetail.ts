import { useState, useEffect, useCallback } from 'react';
import { fetchMovieDetail } from '../infrastructure/api/tmdb.client';
import { mapTMDBMovieDetailToMovie } from '../domain/movie/movie.mapper';
import type { Movie } from '../domain/movie/movie.types';
import { TMDBError, TMDBErrorCode, getUserFriendlyMessage } from '../infrastructure/api/tmdb.errors';
import { logger } from '../utils/logger';
import {
  getSavedMovieById,
  saveMovie as saveMovieToStorage,
  removeMovie as removeMovieFromStorage,
} from '../infrastructure/storage/savedMovies.storage';
import { movieToSavedMovie, savedMovieToMovie } from '../domain/movie/movie.mapper';
import { useNetworkStatus } from './useNetworkStatus';
import { addToSyncQueue } from '../infrastructure/storage/syncQueue.storage';
import { cacheImage } from '../infrastructure/storage/imageCache.storage';

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
  const { isConnected } = useNetworkStatus();
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
        
        // If we have saved data and network is available, try to refresh from API in background
        if (isConnected) {
          fetchMovieDetail(movieId)
            .then((detail) => {
              const freshMovie = mapTMDBMovieDetailToMovie(detail);
              // Cache poster image
              if (freshMovie.posterUrl) {
                cacheImage(freshMovie.posterUrl).catch(() => {
                  // Silently fail
                });
              }
              return getSavedMovieById(movieId).then((m) => ({
                movie: freshMovie,
                isSaved: !!m,
              }));
            })
            .then(({ movie: freshMovie, isSaved: saved }) => {
              setState((prev) => ({
                ...prev,
                movie: freshMovie,
                isSaved: saved,
              }));
            })
            .catch((apiError) => {
              // Silently fail - we already have saved data displayed
              logger.debug('Background API refresh failed, using saved data', {
                error: apiError,
              });
            });
        }
        return; // Don't proceed with main API call if we have saved data
      }

      // No saved data - fetch from API
      if (!isConnected) {
        throw new TMDBError(
          TMDBErrorCode.NETWORK_ERROR,
          'No internet connection. Please check your network.'
        );
      }

      try {
        const detail = await fetchMovieDetail(movieId);
        const movie = mapTMDBMovieDetailToMovie(detail);
        
        // Cache poster image
        if (movie.posterUrl) {
          cacheImage(movie.posterUrl).catch(() => {
            // Silently fail
          });
        }
        
        const isSaved = await getSavedMovieById(movieId).then((m) => !!m);

        setState((prev) => ({
          ...prev,
          movie,
          isSaved,
          loading: false,
        }));
      } catch (apiError) {
        // No saved data and API failed - show error
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
        // Optimistic update
        setState((prev) => ({
          ...prev,
          isSaved: false,
        }));

        try {
          await removeMovieFromStorage(movieId);
        } catch (error) {
          // If offline, add to sync queue
          if (!isConnected) {
            await addToSyncQueue('remove_movie', movieId);
            logger.debug('Added remove to sync queue', { movieId });
          } else {
            throw error;
          }
        }
      } else {
        const savedMovie = movieToSavedMovie(state.movie);
        
        // Optimistic update
        setState((prev) => ({
          ...prev,
          isSaved: true,
        }));

        try {
          await saveMovieToStorage(savedMovie);
          // Cache poster image when saving
          if (savedMovie.posterUrl) {
            cacheImage(savedMovie.posterUrl).catch(() => {
              // Silently fail
            });
          }
        } catch (error) {
          // If offline, add to sync queue
          if (!isConnected) {
            await addToSyncQueue('save_movie', movieId, savedMovie);
            logger.debug('Added save to sync queue', { movieId });
          } else {
            throw error;
          }
        }
      }
    } catch (error) {
      logger.error('Failed to toggle save', { error, movieId });
      // Revert optimistic update
      setState((prev) => ({
        ...prev,
        isSaved: !prev.isSaved,
      }));
    }
  }, [state.movie, state.isSaved, movieId, isConnected]);

  useEffect(() => {
    fetchMovie();
  }, [fetchMovie]);

  return {
    ...state,
    retry: fetchMovie,
    toggleSave,
  };
}

