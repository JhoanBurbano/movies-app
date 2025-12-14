/**
 * Tests for useSavedMovies hook
 */

import { renderHook, waitFor } from '@testing-library/react-native';
import { useSavedMovies } from './useSavedMovies';
import { getSavedMovies } from '../infrastructure/storage/savedMovies.storage';

// Mock the storage
jest.mock('../infrastructure/storage/savedMovies.storage');

const mockGetSavedMovies = getSavedMovies as jest.MockedFunction<
  typeof getSavedMovies
>;

describe('useSavedMovies', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should fetch saved movies on mount', async () => {
    const savedMovies = [
      {
        id: 1,
        title: 'Saved Movie 1',
        posterUrl: '/saved1.jpg',
        overview: 'Overview 1',
        rating: 8.0,
        releaseDate: '2023-01-01',
        genres: [],
        runtime: null,
        language: null,
        savedAt: '2023-01-01T00:00:00Z',
      },
      {
        id: 2,
        title: 'Saved Movie 2',
        posterUrl: '/saved2.jpg',
        overview: 'Overview 2',
        rating: 7.5,
        releaseDate: '2023-02-01',
        genres: [],
        runtime: null,
        language: null,
        savedAt: '2023-02-01T00:00:00Z',
      },
    ];

    mockGetSavedMovies.mockResolvedValue(savedMovies);

    const { result } = renderHook(() => useSavedMovies());

    expect(result.current.loading).toBe(true);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.movies).toHaveLength(2);
    expect(result.current.movies[0].title).toBe('Saved Movie 1');
    expect(result.current.movies[1].title).toBe('Saved Movie 2');
    expect(result.current.error).toBeNull();
  });

  it('should handle empty saved movies', async () => {
    mockGetSavedMovies.mockResolvedValue([]);

    const { result } = renderHook(() => useSavedMovies());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.movies).toEqual([]);
    expect(result.current.error).toBeNull();
  });

  it('should handle storage errors gracefully', async () => {
    const storageError = new Error('Storage error');
    mockGetSavedMovies.mockRejectedValue(storageError);

    const { result } = renderHook(() => useSavedMovies());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBeTruthy();
    expect(result.current.movies).toEqual([]);
  });

  it('should refresh saved movies', async () => {
    const initialMovies = [
      {
        id: 1,
        title: 'Initial Movie',
        posterUrl: '/initial.jpg',
        overview: 'Initial overview',
        rating: 8.0,
        releaseDate: '2023-01-01',
        genres: [],
        runtime: null,
        language: null,
        savedAt: '2023-01-01T00:00:00Z',
      },
    ];

    const refreshedMovies = [
      ...initialMovies,
      {
        id: 2,
        title: 'New Movie',
        posterUrl: '/new.jpg',
        overview: 'New overview',
        rating: 7.0,
        releaseDate: '2023-02-01',
        genres: [],
        runtime: null,
        language: null,
        savedAt: '2023-02-01T00:00:00Z',
      },
    ];

    mockGetSavedMovies
      .mockResolvedValueOnce(initialMovies)
      .mockResolvedValueOnce(refreshedMovies);

    const { result } = renderHook(() => useSavedMovies());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.movies).toHaveLength(1);

    await result.current.refresh();

    await waitFor(() => {
      expect(result.current.movies).toHaveLength(2);
    });
  });

  it('should retry on error', async () => {
    mockGetSavedMovies
      .mockRejectedValueOnce(new Error('Storage error'))
      .mockResolvedValueOnce([
        {
          id: 1,
          title: 'Retry Movie',
          posterUrl: '/retry.jpg',
          overview: 'Retry overview',
          rating: 8.0,
          releaseDate: '2023-01-01',
          genres: [],
          runtime: null,
          language: null,
          savedAt: '2023-01-01T00:00:00Z',
        },
      ]);

    const { result } = renderHook(() => useSavedMovies());

    await waitFor(() => {
      expect(result.current.error).toBeTruthy();
    });

    await result.current.retry();

    await waitFor(() => {
      expect(result.current.error).toBeNull();
      expect(result.current.movies).toHaveLength(1);
    });
  });
});

