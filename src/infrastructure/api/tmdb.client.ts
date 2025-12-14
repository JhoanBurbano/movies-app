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
} from '../../domain/movie/movie.dto';
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
 * Searches for movies
 */
export async function searchMovies(
  query: string,
  page: number = 1
): Promise<TMDBSearchResponseDTO> {
  const encodedQuery = encodeURIComponent(query);
  const url = `${TMDB_ENDPOINTS.SEARCH}?api_key=${API_KEY}&query=${encodedQuery}&page=${page}`;
  logger.debug('Searching movies', { query, page });
  const response = await fetchWithTimeout(url);
  return handleResponse<TMDBSearchResponseDTO>(response);
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

