/**
 * Mapper functions to convert TMDB DTOs to domain models
 */

import type { Movie, SavedMovie, Genre } from './movie.types';
import type {
  TMDBMovieDTO,
  TMDBMovieDetailDTO,
  TMDBGenreDTO,
} from './movie.dto';

const TMDB_IMAGE_BASE_URL =
  process.env.EXPO_PUBLIC_TMDB_IMAGE_BASE_URL || 'https://image.tmdb.org/t/p/w500';

/**
 * Maps a TMDB movie DTO to domain Movie
 */
export function mapTMDBMovieToMovie(dto: TMDBMovieDTO): Movie {
  return {
    id: dto.id,
    title: dto.title,
    posterUrl: dto.poster_path
      ? `${TMDB_IMAGE_BASE_URL}${dto.poster_path}`
      : null,
    overview: dto.overview || '',
    rating: dto.vote_average,
    releaseDate: dto.release_date || '',
    genres: [], // Will be populated from detail endpoint
    runtime: null, // Will be populated from detail endpoint
    language: dto.original_language || null,
  };
}

/**
 * Maps a TMDB movie detail DTO to domain Movie
 */
export function mapTMDBMovieDetailToMovie(dto: TMDBMovieDetailDTO): Movie {
  return {
    id: dto.id,
    title: dto.title,
    posterUrl: dto.poster_path
      ? `${TMDB_IMAGE_BASE_URL}${dto.poster_path}`
      : null,
    overview: dto.overview || '',
    rating: dto.vote_average,
    releaseDate: dto.release_date || '',
    genres: mapGenres(dto.genres),
    runtime: dto.runtime,
    language: dto.original_language || null,
  };
}

/**
 * Maps TMDB genre DTOs to domain Genres
 */
function mapGenres(dtoGenres: TMDBGenreDTO[]): Genre[] {
  return dtoGenres.map((g) => ({
    id: g.id,
    name: g.name,
  }));
}

/**
 * Converts a Movie to SavedMovie
 */
export function movieToSavedMovie(movie: Movie): SavedMovie {
  return {
    ...movie,
    savedAt: new Date().toISOString(),
  };
}

/**
 * Converts a SavedMovie to Movie (removes savedAt)
 */
export function savedMovieToMovie(saved: SavedMovie): Movie {
  const { savedAt, ...movie } = saved;
  return movie;
}

