/**
 * Storage layer for saved movies
 * Uses AsyncStorage for persistence
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import type { SavedMovie } from '../../domain/movie/movie.types';
import { logger } from '../../utils/logger';

const STORAGE_KEY = '@collars_movies:saved';

/**
 * Retrieves all saved movies from storage
 */
export async function getSavedMovies(): Promise<SavedMovie[]> {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEY);
    if (!data) {
      return [];
    }
    const movies = JSON.parse(data) as SavedMovie[];
    logger.debug('Retrieved saved movies', { count: movies.length });
    return movies;
  } catch (error) {
    logger.error('Failed to get saved movies', { error });
    throw new Error('Failed to load saved movies');
  }
}

/**
 * Saves a movie to storage
 */
export async function saveMovie(movie: SavedMovie): Promise<void> {
  try {
    const movies = await getSavedMovies();
    // Check if already saved
    if (movies.some((m) => m.id === movie.id)) {
      logger.debug('Movie already saved', { id: movie.id });
      return;
    }
    const updated = [...movies, movie];
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    logger.debug('Movie saved', { id: movie.id });
  } catch (error) {
    logger.error('Failed to save movie', { error, movieId: movie.id });
    throw new Error('Failed to save movie');
  }
}

/**
 * Removes a movie from storage
 */
export async function removeMovie(movieId: number): Promise<void> {
  try {
    const movies = await getSavedMovies();
    const updated = movies.filter((m) => m.id !== movieId);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    logger.debug('Movie removed', { id: movieId });
  } catch (error) {
    logger.error('Failed to remove movie', { error, movieId });
    throw new Error('Failed to remove movie');
  }
}

/**
 * Checks if a movie is saved
 */
export async function isMovieSaved(movieId: number): Promise<boolean> {
  try {
    const movies = await getSavedMovies();
    return movies.some((m) => m.id === movieId);
  } catch (error) {
    logger.error('Failed to check if movie is saved', { error, movieId });
    return false;
  }
}

/**
 * Gets a saved movie by ID
 */
export async function getSavedMovieById(
  movieId: number
): Promise<SavedMovie | null> {
  try {
    const movies = await getSavedMovies();
    return movies.find((m) => m.id === movieId) || null;
  } catch (error) {
    logger.error('Failed to get saved movie by id', { error, movieId });
    return null;
  }
}

