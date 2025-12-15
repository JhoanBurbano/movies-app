/**
 * DTO types for TMDB API responses
 * These match the exact structure returned by the API
 */

export interface TMDBMovieDTO {
  id: number;
  title: string;
  poster_path: string | null;
  backdrop_path: string | null;
  overview: string;
  vote_average: number;
  vote_count: number;
  release_date: string;
  genre_ids?: number[];
  original_language?: string;
  popularity?: number;
}

export interface TMDBMovieDetailDTO {
  id: number;
  title: string;
  poster_path: string | null;
  backdrop_path: string | null;
  overview: string;
  vote_average: number;
  vote_count: number;
  release_date: string;
  genres: TMDBGenreDTO[];
  runtime: number | null;
  original_language: string;
  status: string;
  production_companies?: Array<{ id: number; name: string }>;
  production_countries?: Array<{ iso_3166_1: string; name: string }>;
}

export interface TMDBGenreDTO {
  id: number;
  name: string;
}

export interface TMDBMoviesResponseDTO {
  page: number;
  results: TMDBMovieDTO[];
  total_pages: number;
  total_results: number;
}

export interface TMDBSearchResponseDTO {
  page: number;
  results: TMDBMovieDTO[];
  total_pages: number;
  total_results: number;
}

export interface TMDBGenresResponseDTO {
  genres: TMDBGenreDTO[];
}

export interface TMDBVideoDTO {
  id: string;
  key: string;
  name: string;
  site: string;
  size: number;
  type: string;
  official: boolean;
  published_at: string;
}

export interface TMDBVideosResponseDTO {
  id: number;
  results: TMDBVideoDTO[];
}

// Lists API DTOs
export interface TMDBCreateListRequestDTO {
  name: string;
  description?: string;
  language?: string;
}

export interface TMDBCreateListResponseDTO {
  success: boolean;
  status_code: number;
  status_message: string;
  list_id: number;
}

export interface TMDBAddToListRequestDTO {
  media_id: number;
}

export interface TMDBAddToListResponseDTO {
  success: boolean;
  status_code: number;
  status_message: string;
}

export interface TMDBRemoveFromListRequestDTO {
  media_id: number;
}

export interface TMDBRemoveFromListResponseDTO {
  success: boolean;
  status_code: number;
  status_message: string;
}

