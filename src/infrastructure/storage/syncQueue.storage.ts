/**
 * Sync queue for pending operations
 * Stores operations that need to be synced when network is available
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { logger } from '../../utils/logger';

const SYNC_QUEUE_KEY = '@collars_movies:sync_queue';

export type SyncOperationType = 'save_movie' | 'remove_movie';

export interface SyncOperation {
  id: string;
  type: SyncOperationType;
  movieId: number;
  data?: unknown;
  timestamp: string;
  retries: number;
}

const MAX_RETRIES = 3;

/**
 * Get all pending sync operations
 */
export async function getSyncQueue(): Promise<SyncOperation[]> {
  try {
    const data = await AsyncStorage.getItem(SYNC_QUEUE_KEY);
    if (!data) {
      return [];
    }
    return JSON.parse(data) as SyncOperation[];
  } catch (error) {
    logger.error('Failed to get sync queue', { error });
    return [];
  }
}

/**
 * Add operation to sync queue
 */
export async function addToSyncQueue(
  type: SyncOperationType,
  movieId: number,
  data?: unknown
): Promise<void> {
  try {
    const queue = await getSyncQueue();
    const operation: SyncOperation = {
      id: `${type}_${movieId}_${Date.now()}`,
      type,
      movieId,
      data,
      timestamp: new Date().toISOString(),
      retries: 0,
    };

    // Check if operation already exists
    const exists = queue.some(
      (op) => op.type === type && op.movieId === movieId
    );
    if (exists) {
      logger.debug('Operation already in queue', { type, movieId });
      return;
    }

    queue.push(operation);
    await AsyncStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify(queue));
    logger.debug('Added to sync queue', { type, movieId });
  } catch (error) {
    logger.error('Failed to add to sync queue', { error, type, movieId });
  }
}

/**
 * Remove operation from sync queue
 */
export async function removeFromSyncQueue(operationId: string): Promise<void> {
  try {
    const queue = await getSyncQueue();
    const updated = queue.filter((op) => op.id !== operationId);
    await AsyncStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify(updated));
    logger.debug('Removed from sync queue', { operationId });
  } catch (error) {
    logger.error('Failed to remove from sync queue', { error, operationId });
  }
}

/**
 * Increment retry count for an operation
 */
export async function incrementRetry(operationId: string): Promise<void> {
  try {
    const queue = await getSyncQueue();
    const updated = queue.map((op) => {
      if (op.id === operationId) {
        return { ...op, retries: op.retries + 1 };
      }
      return op;
    });
    await AsyncStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify(updated));
  } catch (error) {
    logger.error('Failed to increment retry', { error, operationId });
  }
}

/**
 * Clear all operations that exceeded max retries
 */
export async function clearFailedOperations(): Promise<void> {
  try {
    const queue = await getSyncQueue();
    const valid = queue.filter((op) => op.retries < MAX_RETRIES);
    await AsyncStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify(valid));
    logger.debug('Cleared failed operations', {
      removed: queue.length - valid.length,
    });
  } catch (error) {
    logger.error('Failed to clear failed operations', { error });
  }
}

/**
 * Clear entire sync queue
 */
export async function clearSyncQueue(): Promise<void> {
  try {
    await AsyncStorage.removeItem(SYNC_QUEUE_KEY);
    logger.debug('Sync queue cleared');
  } catch (error) {
    logger.error('Failed to clear sync queue', { error });
  }
}

