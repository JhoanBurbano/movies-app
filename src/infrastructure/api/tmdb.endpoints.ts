/**
 * TMDB API endpoint definitions
 */

const BASE_URL =
  process.env.EXPO_PUBLIC_TMDB_BASE_URL || 'https://api.themoviedb.org/3';

export const TMDB_ENDPOINTS = {
  POPULAR: `${BASE_URL}/movie/popular`,
  UPCOMING: `${BASE_URL}/movie/upcoming`,
  TOP_RATED: `${BASE_URL}/movie/top_rated`,
  SEARCH: `${BASE_URL}/search/movie`,
  MOVIE_DETAIL: (id: number) => `${BASE_URL}/movie/${id}`,
} as const;

