/**
 * Domain types for Movie entities
 * These represent the normalized business logic models
 */

export interface Movie {
  id: number;
  title: string;
  posterUrl: string | null;
  overview: string;
  rating: number;
  releaseDate: string;
  genres: Genre[];
  runtime: number | null;
  language: string | null;
}

export interface Genre {
  id: number;
  name: string;
}

export interface SavedMovie {
  id: number;
  title: string;
  posterUrl: string | null;
  overview: string;
  rating: number;
  releaseDate: string;
  genres: Genre[];
  runtime: number | null;
  language: string | null;
  savedAt: string; // ISO timestamp
}

export type MovieListType = 'popular' | 'upcoming' | 'search';

