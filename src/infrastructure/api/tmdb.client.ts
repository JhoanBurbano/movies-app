/**
 * TMDB API client
 * Handles all HTTP requests to TMDB API
 */

import { TMDB_ENDPOINTS } from './tmdb.endpoints';
import {
  TMDBError,
  TMDBErrorCode,
  mapStatusCodeToError,
} from './tmdb.errors';
import type {
  TMDBMoviesResponseDTO,
  TMDBSearchResponseDTO,
  TMDBMovieDetailDTO,
  TMDBGenresResponseDTO,
  TMDBVideosResponseDTO,
  TMDBCreateListRequestDTO,
  TMDBCreateListResponseDTO,
  TMDBAddToListRequestDTO,
  TMDBAddToListResponseDTO,
  TMDBRemoveFromListRequestDTO,
  TMDBRemoveFromListResponseDTO,
} from '../../domain/movie/movie.dto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { logger } from '../../utils/logger';

const API_KEY = process.env.EXPO_PUBLIC_TMDB_API_KEY;

if (!API_KEY) {
  throw new Error(
    'EXPO_PUBLIC_TMDB_API_KEY is required. Please set it in your .env file.'
  );
}

const REQUEST_TIMEOUT = 10000; // 10 seconds

/**
 * Makes a fetch request with timeout and error handling
 */
async function fetchWithTimeout(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    if (error instanceof Error && error.name === 'AbortError') {
      throw new TMDBError(
        TMDBErrorCode.TIMEOUT,
        'Request timed out',
        undefined,
        error
      );
    }
    throw new TMDBError(
      TMDBErrorCode.NETWORK_ERROR,
      'Network request failed',
      undefined,
      error
    );
  }
}

/**
 * Handles API response and throws appropriate errors
 */
async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error = mapStatusCodeToError(
      response.status,
      `HTTP ${response.status}: ${response.statusText}`
    );
    logger.error('TMDB API error', {
      status: response.status,
      statusText: response.statusText,
      url: response.url,
    });
    throw error;
  }

  try {
    return await response.json();
  } catch (error) {
    logger.error('Failed to parse JSON response', { error });
    throw new TMDBError(
      TMDBErrorCode.UNKNOWN,
      'Invalid response format',
      response.status,
      error
    );
  }
}

/**
 * Fetches popular movies
 */
export async function fetchPopularMovies(
  page: number = 1
): Promise<TMDBMoviesResponseDTO> {
  const url = `${TMDB_ENDPOINTS.POPULAR}?api_key=${API_KEY}&page=${page}`;
  logger.debug('Fetching popular movies', { page });
  const response = await fetchWithTimeout(url);
  return handleResponse<TMDBMoviesResponseDTO>(response);
}

/**
 * Fetches upcoming movies
 */
export async function fetchUpcomingMovies(
  page: number = 1
): Promise<TMDBMoviesResponseDTO> {
  const url = `${TMDB_ENDPOINTS.UPCOMING}?api_key=${API_KEY}&page=${page}`;
  logger.debug('Fetching upcoming movies', { page });
  const response = await fetchWithTimeout(url);
  return handleResponse<TMDBMoviesResponseDTO>(response);
}

/**
 * Fetches top rated movies
 */
export async function fetchTopRatedMovies(
  page: number = 1
): Promise<TMDBMoviesResponseDTO> {
  const url = `${TMDB_ENDPOINTS.TOP_RATED}?api_key=${API_KEY}&page=${page}`;
  logger.debug('Fetching top rated movies', { page });
  const response = await fetchWithTimeout(url);
  return handleResponse<TMDBMoviesResponseDTO>(response);
}

/**
 * Search filters interface
 */
export interface SearchFilters {
  year?: number;
  genre?: number;
  language?: string;
}

/**
 * Searches for movies with optional filters
 */
export async function searchMovies(
  query: string,
  page: number = 1,
  filters?: SearchFilters
): Promise<TMDBSearchResponseDTO> {
  const encodedQuery = encodeURIComponent(query);
  const params = new URLSearchParams({
    api_key: API_KEY,
    query: encodedQuery,
    page: page.toString(),
  });

  if (filters?.year) {
    params.append('primary_release_year', filters.year.toString());
  }

  if (filters?.genre) {
    params.append('with_genres', filters.genre.toString());
  }

  if (filters?.language) {
    params.append('language', filters.language);
  }

  const url = `${TMDB_ENDPOINTS.SEARCH}?${params.toString()}`;
  logger.debug('Searching movies', { query, page, filters });
  const response = await fetchWithTimeout(url);
  return handleResponse<TMDBSearchResponseDTO>(response);
}

/**
 * Fetches available movie genres
 */
export async function fetchGenres(): Promise<TMDBGenresResponseDTO> {
  const url = `${TMDB_ENDPOINTS.GENRES}?api_key=${API_KEY}`;
  logger.debug('Fetching genres');
  const response = await fetchWithTimeout(url);
  return handleResponse<TMDBGenresResponseDTO>(response);
}

/**
 * Fetches movie details by ID
 */
export async function fetchMovieDetail(
  id: number
): Promise<TMDBMovieDetailDTO> {
  const url = `${TMDB_ENDPOINTS.MOVIE_DETAIL(id)}?api_key=${API_KEY}`;
  logger.debug('Fetching movie detail', { id });
  const response = await fetchWithTimeout(url);
  return handleResponse<TMDBMovieDetailDTO>(response);
}

/**
 * Fetches videos (trailers) for a movie
 */
export async function fetchMovieVideos(
  id: number
): Promise<TMDBVideosResponseDTO> {
  const url = `${TMDB_ENDPOINTS.MOVIE_VIDEOS(id)}?api_key=${API_KEY}`;
  logger.debug('Fetching movie videos', { id });
  const response = await fetchWithTimeout(url);
  return handleResponse<TMDBVideosResponseDTO>(response);
}

/**
 * Gets or creates a user's saved movies list
 * Returns the list ID
 */
export async function getOrCreateSavedMoviesList(
  sessionId?: string
): Promise<number> {
  const STORAGE_KEY = '@collars_movies:tmdb_list_id';
  
  // If no sessionId, return a placeholder (local-only mode)
  if (!sessionId) {
    logger.debug('No session ID provided, using local-only mode');
    return 0; // 0 indicates local-only
  }

  // Check if we already have a list ID stored
  try {
    const storedListId = await AsyncStorage.getItem(STORAGE_KEY);
    if (storedListId) {
      const listId = parseInt(storedListId, 10);
      if (listId > 0) {
        logger.debug('Using existing list ID', { listId });
        return listId;
      }
    }
  } catch (error) {
    logger.warn('Failed to read stored list ID', { error });
  }

  // Create a new list
  try {
    const url = `${TMDB_ENDPOINTS.CREATE_LIST}?api_key=${API_KEY}&session_id=${sessionId}`;
    const body: TMDBCreateListRequestDTO = {
      name: 'My Saved Movies',
      description: 'Movies saved in Collars Movies app',
      language: 'en',
    };

    logger.debug('Creating new TMDB list');
    const response = await fetchWithTimeout(url, {
      method: 'POST',
      body: JSON.stringify(body),
    });

    const result = await handleResponse<TMDBCreateListResponseDTO>(response);
    
    if (result.success && result.list_id) {
      // Store the list ID for future use
      await AsyncStorage.setItem(STORAGE_KEY, result.list_id.toString());
      logger.debug('Created new TMDB list', { listId: result.list_id });
      return result.list_id;
    }

    throw new TMDBError(
      TMDBErrorCode.UNKNOWN,
      result.status_message || 'Failed to create list',
      result.status_code
    );
  } catch (error) {
    logger.error('Failed to create TMDB list', { error });
    // Return 0 to indicate local-only mode
    return 0;
  }
}

/**
 * Adds a movie to TMDB list
 */
export async function addMovieToList(
  listId: number,
  movieId: number,
  sessionId?: string
): Promise<void> {
  if (!listId || !sessionId) {
    // Local-only mode, operation will be queued
    logger.debug('Local-only mode: operation queued', { movieId });
    return;
  }

  const url = `${TMDB_ENDPOINTS.ADD_TO_LIST(listId.toString())}?api_key=${API_KEY}&session_id=${sessionId}`;
  const body: TMDBAddToListRequestDTO = {
    media_id: movieId,
  };

  logger.debug('Adding movie to list', { listId, movieId });
  const response = await fetchWithTimeout(url, {
    method: 'POST',
    body: JSON.stringify(body),
  });
  
  const result = await handleResponse<TMDBAddToListResponseDTO>(response);
  if (!result.success) {
    throw new TMDBError(
      TMDBErrorCode.UNKNOWN,
      result.status_message || 'Failed to add movie to list',
      result.status_code
    );
  }
}

/**
 * Removes a movie from TMDB list
 */
export async function removeMovieFromList(
  listId: number,
  movieId: number,
  sessionId?: string
): Promise<void> {
  if (!listId || !sessionId) {
    // Local-only mode, operation will be queued
    logger.debug('Local-only mode: operation queued', { movieId });
    return;
  }

  const url = `${TMDB_ENDPOINTS.REMOVE_FROM_LIST(listId.toString())}?api_key=${API_KEY}&session_id=${sessionId}`;
  const body: TMDBRemoveFromListRequestDTO = {
    media_id: movieId,
  };

  logger.debug('Removing movie from list', { listId, movieId });
  const response = await fetchWithTimeout(url, {
    method: 'POST',
    body: JSON.stringify(body),
  });
  
  const result = await handleResponse<TMDBRemoveFromListResponseDTO>(response);
  if (!result.success) {
    throw new TMDBError(
      TMDBErrorCode.UNKNOWN,
      result.status_message || 'Failed to remove movie from list',
      result.status_code
    );
  }
}

