/**
 * Hook to manage sync queue operations
 * Processes pending operations when network is available
 */

import { useEffect, useCallback } from 'react';
import { useNetworkStatus } from './useNetworkStatus';
import {
  getSyncQueue,
  removeFromSyncQueue,
  incrementRetry,
  type SyncOperation,
} from '../infrastructure/storage/syncQueue.storage';
import {
  saveMovie as saveMovieToStorage,
  removeMovie as removeMovieFromStorage,
} from '../infrastructure/storage/savedMovies.storage';
import { logger } from '../utils/logger';
import type { SavedMovie } from '../domain/movie/movie.types';

/**
 * Hook to process sync queue when network is available
 */
export function useSyncQueue() {
  const { isConnected } = useNetworkStatus();

  const processQueue = useCallback(async () => {
    if (!isConnected) {
      return;
    }

    const queue = await getSyncQueue();
    if (queue.length === 0) {
      return;
    }

    logger.debug('Processing sync queue', { count: queue.length });

    for (const operation of queue) {
      try {
        if (operation.type === 'save_movie' && operation.data) {
          // Re-save movie to ensure it's in storage
          await saveMovieToStorage(operation.data as SavedMovie);
          await removeFromSyncQueue(operation.id);
          logger.debug('Synced save operation', { movieId: operation.movieId });
        } else if (operation.type === 'remove_movie') {
          // Re-remove movie to ensure consistency
          await removeMovieFromStorage(operation.movieId);
          await removeFromSyncQueue(operation.id);
          logger.debug('Synced remove operation', { movieId: operation.movieId });
        }
      } catch (error) {
        logger.error('Failed to process sync operation', {
          error,
          operationId: operation.id,
        });
        await incrementRetry(operation.id);
      }
    }
  }, [isConnected]);

  useEffect(() => {
    if (isConnected) {
      // Process queue when network becomes available
      processQueue();
      // Also process periodically while connected
      const interval = setInterval(processQueue, 30000); // Every 30 seconds
      return () => clearInterval(interval);
    }
  }, [isConnected, processQueue]);

  return { processQueue };
}

