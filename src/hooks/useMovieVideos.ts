/**
 * Hook to fetch movie videos (trailers)
 */

import { useState, useEffect, useCallback } from 'react';
import { fetchMovieVideos } from '../infrastructure/api/tmdb.client';
import type { TMDBVideoDTO } from '../domain/movie/movie.dto';
import { TMDBError, getUserFriendlyMessage } from '../infrastructure/api/tmdb.errors';
import { logger } from '../utils/logger';
import { useNetworkStatus } from './useNetworkStatus';

interface UseMovieVideosState {
    videos: TMDBVideoDTO[];
    trailers: TMDBVideoDTO[];
    loading: boolean;
    error: string | null;
}

interface UseMovieVideosReturn extends UseMovieVideosState {
    retry: () => Promise<void>;
}

/**
 * Hook to fetch videos for a movie
 * Filters trailers from YouTube
 */
export function useMovieVideos(movieId: number): UseMovieVideosReturn {
    const { isConnected } = useNetworkStatus();
    const [state, setState] = useState<UseMovieVideosState>({
        videos: [],
        trailers: [],
        loading: false,
        error: null,
    });

    const fetchVideos = useCallback(async () => {
        if (!isConnected) {
            setState((prev) => ({
                ...prev,
                loading: false,
                error: 'No internet connection. Please check your network.',
            }));
            return;
        }

        try {
            setState((prev) => ({
                ...prev,
                loading: true,
                error: null,
            }));

            const response = await fetchMovieVideos(movieId);
            
            // Filter trailers from YouTube
            const trailers = response.results.filter(
                (video) => video.type === 'Trailer' && video.site === 'YouTube'
            );

            setState({
                videos: response.results,
                trailers,
                loading: false,
                error: null,
            });
        } catch (error) {
            const errorMessage =
                error instanceof TMDBError
                    ? getUserFriendlyMessage(error)
                    : 'Failed to load trailers';
            logger.error('Failed to fetch movie videos', { error, movieId });
            setState((prev) => ({
                ...prev,
                error: errorMessage,
                loading: false,
            }));
        }
    }, [movieId, isConnected]);

    useEffect(() => {
        if (movieId) {
            fetchVideos();
        }
    }, [movieId, fetchVideos]);

    return {
        ...state,
        retry: fetchVideos,
    };
}

