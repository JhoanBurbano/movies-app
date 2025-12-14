/**
 * Tests for useMovies hook
 */

// Set mock API key before importing
process.env.EXPO_PUBLIC_TMDB_API_KEY = 'test_api_key';

import { renderHook, waitFor, act } from '@testing-library/react-native';
import { useMovies } from './useMovies';
import {
  fetchPopularMovies,
  fetchUpcomingMovies,
  searchMovies,
} from '../infrastructure/api/tmdb.client';
import { TMDBError, TMDBErrorCode } from '../infrastructure/api/tmdb.errors';

// Mock the API client
jest.mock('../infrastructure/api/tmdb.client');

const mockFetchPopularMovies = fetchPopularMovies as jest.MockedFunction<
  typeof fetchPopularMovies
>;
const mockFetchUpcomingMovies = fetchUpcomingMovies as jest.MockedFunction<
  typeof fetchUpcomingMovies
>;
const mockSearchMovies = searchMovies as jest.MockedFunction<
  typeof searchMovies
>;

describe('useMovies', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should fetch popular and upcoming movies on mount', async () => {
    mockFetchPopularMovies.mockResolvedValue({
      page: 1,
      results: [
        {
          id: 1,
          title: 'Popular Movie',
          poster_path: '/popular.jpg',
          backdrop_path: null,
          overview: 'Popular overview',
          vote_average: 8.0,
          vote_count: 100,
          release_date: '2023-01-01',
        },
      ],
      total_pages: 1,
      total_results: 1,
    });

    mockFetchUpcomingMovies.mockResolvedValue({
      page: 1,
      results: [
        {
          id: 2,
          title: 'Upcoming Movie',
          poster_path: '/upcoming.jpg',
          backdrop_path: null,
          overview: 'Upcoming overview',
          vote_average: 7.5,
          vote_count: 50,
          release_date: '2023-12-01',
        },
      ],
      total_pages: 1,
      total_results: 1,
    });

    const { result } = renderHook(() => useMovies());

    expect(result.current.loading).toBe(true);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.popular).toHaveLength(1);
    expect(result.current.popular[0].title).toBe('Popular Movie');
    expect(result.current.upcoming).toHaveLength(1);
    expect(result.current.upcoming[0].title).toBe('Upcoming Movie');
    expect(result.current.error).toBeNull();
  });

  it('should handle API errors gracefully', async () => {
    const apiError = new TMDBError(
      TMDBErrorCode.NETWORK_ERROR,
      'Network error',
      undefined
    );

    mockFetchPopularMovies.mockRejectedValue(apiError);
    mockFetchUpcomingMovies.mockRejectedValue(apiError);

    const { result } = renderHook(() => useMovies());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBeTruthy();
    expect(result.current.popular).toEqual([]);
    expect(result.current.upcoming).toEqual([]);
  });

  it('should search movies when search is called', async () => {
    mockFetchPopularMovies.mockResolvedValue({
      page: 1,
      results: [],
      total_pages: 1,
      total_results: 0,
    });

    mockFetchUpcomingMovies.mockResolvedValue({
      page: 1,
      results: [],
      total_pages: 1,
      total_results: 0,
    });

    mockSearchMovies.mockResolvedValue({
      page: 1,
      results: [
        {
          id: 3,
          title: 'Search Result',
          poster_path: '/search.jpg',
          backdrop_path: null,
          overview: 'Search overview',
          vote_average: 9.0,
          vote_count: 200,
          release_date: '2023-05-01',
        },
      ],
      total_pages: 1,
      total_results: 1,
    });

    const { result } = renderHook(() => useMovies());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await result.current.search('test query');

    await waitFor(() => {
      expect(result.current.searchResults).toHaveLength(1);
    });

    expect(result.current.searchResults[0].title).toBe('Search Result');
    expect(mockSearchMovies).toHaveBeenCalledWith('test query', 1);
  });

  it('should clear search results when clearSearch is called', async () => {
    mockSearchMovies.mockResolvedValue({
      page: 1,
      results: [
        {
          id: 1,
          title: 'Test Movie',
          poster_path: '/test.jpg',
          backdrop_path: null,
          overview: 'Test overview',
          vote_average: 8.0,
          vote_count: 100,
          release_date: '2023-01-01',
        },
      ],
      total_pages: 1,
      total_results: 1,
    });

    const { result } = renderHook(() => useMovies());

    // Wait for initial load
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Set some search results
    await act(async () => {
      await result.current.search('test');
    });

    await waitFor(() => {
      expect(result.current.searchResults.length).toBeGreaterThan(0);
    });

    // Clear search
    act(() => {
      result.current.clearSearch();
    });

    expect(result.current.searchResults).toEqual([]);
  });

  it('should retry on error', async () => {
    mockFetchPopularMovies
      .mockRejectedValueOnce(
        new TMDBError(TMDBErrorCode.NETWORK_ERROR, 'Network error')
      )
      .mockResolvedValueOnce({
        page: 1,
        results: [],
        total_pages: 1,
        total_results: 0,
      });

    mockFetchUpcomingMovies
      .mockRejectedValueOnce(
        new TMDBError(TMDBErrorCode.NETWORK_ERROR, 'Network error')
      )
      .mockResolvedValueOnce({
        page: 1,
        results: [],
        total_pages: 1,
        total_results: 0,
      });

    const { result } = renderHook(() => useMovies());

    await waitFor(() => {
      expect(result.current.error).toBeTruthy();
    });

    await result.current.retry();

    await waitFor(() => {
      expect(result.current.error).toBeNull();
    });
  });
});

