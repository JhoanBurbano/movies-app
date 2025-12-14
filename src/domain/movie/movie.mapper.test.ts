/**
 * Tests for movie mapper functions
 */

import {
  mapTMDBMovieToMovie,
  mapTMDBMovieDetailToMovie,
  movieToSavedMovie,
  savedMovieToMovie,
} from './movie.mapper';
import type { TMDBMovieDTO, TMDBMovieDetailDTO } from './movie.dto';

// Mock environment variable
const originalEnv = process.env.EXPO_PUBLIC_TMDB_IMAGE_BASE_URL;
beforeAll(() => {
  process.env.EXPO_PUBLIC_TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';
});

afterAll(() => {
  if (originalEnv) {
    process.env.EXPO_PUBLIC_TMDB_IMAGE_BASE_URL = originalEnv;
  }
});

describe('movie.mapper', () => {
  describe('mapTMDBMovieToMovie', () => {
    it('should map TMDB movie DTO to domain Movie', () => {
      const dto: TMDBMovieDTO = {
        id: 123,
        title: 'Test Movie',
        poster_path: '/poster.jpg',
        backdrop_path: '/backdrop.jpg',
        overview: 'Test overview',
        vote_average: 8.5,
        vote_count: 1000,
        release_date: '2023-01-01',
        original_language: 'en',
      };

      const result = mapTMDBMovieToMovie(dto);

      expect(result.id).toBe(123);
      expect(result.title).toBe('Test Movie');
      expect(result.posterUrl).toBe('https://image.tmdb.org/t/p/w500/poster.jpg');
      expect(result.overview).toBe('Test overview');
      expect(result.rating).toBe(8.5);
      expect(result.releaseDate).toBe('2023-01-01');
      expect(result.language).toBe('en');
      expect(result.genres).toEqual([]);
      expect(result.runtime).toBeNull();
    });

    it('should handle null poster_path', () => {
      const dto: TMDBMovieDTO = {
        id: 123,
        title: 'Test Movie',
        poster_path: null,
        backdrop_path: null,
        overview: '',
        vote_average: 0,
        vote_count: 0,
        release_date: '',
      };

      const result = mapTMDBMovieToMovie(dto);

      expect(result.posterUrl).toBeNull();
    });

    it('should handle missing release_date', () => {
      const dto: TMDBMovieDTO = {
        id: 123,
        title: 'Test Movie',
        poster_path: '/poster.jpg',
        backdrop_path: null,
        overview: 'Test',
        vote_average: 7.0,
        vote_count: 100,
        release_date: '',
      };

      const result = mapTMDBMovieToMovie(dto);

      expect(result.releaseDate).toBe('');
    });
  });

  describe('mapTMDBMovieDetailToMovie', () => {
    it('should map TMDB movie detail DTO to domain Movie with genres and runtime', () => {
      const dto: TMDBMovieDetailDTO = {
        id: 456,
        title: 'Detail Movie',
        poster_path: '/detail.jpg',
        backdrop_path: '/backdrop.jpg',
        overview: 'Detail overview',
        vote_average: 9.0,
        vote_count: 2000,
        release_date: '2023-06-15',
        genres: [
          { id: 1, name: 'Action' },
          { id: 2, name: 'Drama' },
        ],
        runtime: 120,
        original_language: 'en',
        status: 'Released',
      };

      const result = mapTMDBMovieDetailToMovie(dto);

      expect(result.id).toBe(456);
      expect(result.title).toBe('Detail Movie');
      expect(result.genres).toHaveLength(2);
      expect(result.genres[0].name).toBe('Action');
      expect(result.genres[1].name).toBe('Drama');
      expect(result.runtime).toBe(120);
    });
  });

  describe('movieToSavedMovie', () => {
    it('should convert Movie to SavedMovie with savedAt timestamp', () => {
      const movie = {
        id: 789,
        title: 'Saved Movie',
        posterUrl: '/saved.jpg',
        overview: 'Saved overview',
        rating: 8.0,
        releaseDate: '2023-01-01',
        genres: [],
        runtime: null,
        language: null,
      };

      const result = movieToSavedMovie(movie);

      expect(result.id).toBe(789);
      expect(result.title).toBe('Saved Movie');
      expect(result.savedAt).toBeDefined();
      expect(new Date(result.savedAt).getTime()).toBeLessThanOrEqual(Date.now());
    });
  });

  describe('savedMovieToMovie', () => {
    it('should convert SavedMovie to Movie by removing savedAt', () => {
      const saved: ReturnType<typeof movieToSavedMovie> = {
        id: 789,
        title: 'Saved Movie',
        posterUrl: '/saved.jpg',
        overview: 'Saved overview',
        rating: 8.0,
        releaseDate: '2023-01-01',
        genres: [],
        runtime: null,
        language: null,
        savedAt: '2023-01-01T00:00:00Z',
      };

      const result = savedMovieToMovie(saved);

      expect(result.id).toBe(789);
      expect(result.title).toBe('Saved Movie');
      expect('savedAt' in result).toBe(false);
    });
  });
});

