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
import {
  getOrCreateSavedMoviesList,
  addMovieToList,
  removeMovieFromList,
} from '../infrastructure/api/tmdb.client';
import { logger } from '../utils/logger';
import type { SavedMovie } from '../domain/movie/movie.types';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SESSION_ID_KEY = '@collars_movies:tmdb_session_id';
const LIST_ID_KEY = '@collars_movies:tmdb_list_id';

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

    // Get or create list ID
    let listId: number | null = null;
    try {
      const storedListId = await AsyncStorage.getItem(LIST_ID_KEY);
      if (storedListId) {
        listId = parseInt(storedListId, 10);
      } else {
        // Try to get/create list (requires sessionId)
        const sessionId = await AsyncStorage.getItem(SESSION_ID_KEY);
        if (sessionId) {
          listId = await getOrCreateSavedMoviesList(sessionId);
          if (listId && listId > 0) {
            await AsyncStorage.setItem(LIST_ID_KEY, listId.toString());
          }
        }
      }
    } catch (error) {
      logger.error('Failed to get/create list', { error });
      // Continue with local-only sync if list creation fails
    }

    const sessionId = await AsyncStorage.getItem(SESSION_ID_KEY);

    for (const operation of queue) {
      try {
        if (operation.type === 'save_movie' && operation.data) {
          // Save to local storage first
          await saveMovieToStorage(operation.data as SavedMovie);
          
          // Try to sync to TMDB list if available
          if (listId && listId > 0 && sessionId) {
            try {
              await addMovieToList(listId, operation.movieId, sessionId);
              logger.debug('Synced save to TMDB list', { movieId: operation.movieId, listId });
            } catch (apiError) {
              logger.warn('Failed to sync save to TMDB, keeping in queue', {
                error: apiError,
                movieId: operation.movieId,
              });
              // Don't remove from queue if API sync fails
              continue;
            }
          }
          
          await removeFromSyncQueue(operation.id);
          logger.debug('Synced save operation', { movieId: operation.movieId });
        } else if (operation.type === 'remove_movie') {
          // Remove from local storage first
          await removeMovieFromStorage(operation.movieId);
          
          // Try to sync to TMDB list if available
          if (listId && listId > 0 && sessionId) {
            try {
              await removeMovieFromList(listId, operation.movieId, sessionId);
              logger.debug('Synced remove to TMDB list', { movieId: operation.movieId, listId });
            } catch (apiError) {
              logger.warn('Failed to sync remove to TMDB, keeping in queue', {
                error: apiError,
                movieId: operation.movieId,
              });
              // Don't remove from queue if API sync fails
              continue;
            }
          }
          
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

