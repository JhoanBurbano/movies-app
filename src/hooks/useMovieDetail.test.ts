/**
 * Tests for useMovieDetail hook
 */

// Set mock API key before importing
process.env.EXPO_PUBLIC_TMDB_API_KEY = 'test_api_key';

import { renderHook, waitFor, act } from '@testing-library/react-native';
import { useMovieDetail } from './useMovieDetail';
import { fetchMovieDetail } from '../infrastructure/api/tmdb.client';
import { TMDBError, TMDBErrorCode } from '../infrastructure/api/tmdb.errors';
import {
    getSavedMovieById,
    saveMovie as saveMovieToStorage,
    removeMovie as removeMovieFromStorage,
} from '../infrastructure/storage/savedMovies.storage';
import { useNetworkStatus } from './useNetworkStatus';

// Mock the API client and storage
jest.mock('../infrastructure/api/tmdb.client');
jest.mock('../infrastructure/storage/savedMovies.storage');
jest.mock('./useNetworkStatus');

const mockUseNetworkStatus = useNetworkStatus as jest.MockedFunction<
    typeof useNetworkStatus
>;

const mockFetchMovieDetail = fetchMovieDetail as jest.MockedFunction<
    typeof fetchMovieDetail
>;
const mockGetSavedMovieById = getSavedMovieById as jest.MockedFunction<
    typeof getSavedMovieById
>;
const mockSaveMovie = saveMovieToStorage as jest.MockedFunction<
    typeof saveMovieToStorage
>;
const mockRemoveMovie = removeMovieFromStorage as jest.MockedFunction<
    typeof removeMovieFromStorage
>;

describe('useMovieDetail', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        // Default to online for most tests
        mockUseNetworkStatus.mockReturnValue({
            isConnected: true,
            isInternetReachable: true,
            type: 'wifi',
        });
    });

    it('should fetch movie detail from API on mount', async () => {
        mockGetSavedMovieById.mockResolvedValue(null);
        mockFetchMovieDetail.mockResolvedValue({
            id: 123,
            title: 'Test Movie',
            poster_path: '/poster.jpg',
            backdrop_path: null,
            overview: 'Test overview',
            vote_average: 8.5,
            vote_count: 1000,
            release_date: '2023-01-01',
            genres: [{ id: 1, name: 'Action' }],
            runtime: 120,
            original_language: 'en',
            status: 'Released',
        });

        const { result } = renderHook(() => useMovieDetail(123));

        expect(result.current.loading).toBe(true);

        await waitFor(() => {
            expect(result.current.loading).toBe(false);
        });

        expect(result.current.movie).toBeTruthy();
        expect(result.current.movie?.title).toBe('Test Movie');
        expect(result.current.error).toBeNull();
    });

    it('should load saved movie first (offline support)', async () => {
        const savedMovie = {
            id: 456,
            title: 'Saved Movie',
            posterUrl: '/saved.jpg',
            overview: 'Saved overview',
            rating: 8.0,
            releaseDate: '2023-01-01',
            genres: [{ id: 1, name: 'Drama' }],
            runtime: 100,
            language: 'en',
            savedAt: '2023-01-01T00:00:00Z',
        };

        // Mock offline status to prevent background refresh
        mockUseNetworkStatus.mockReturnValue({
            isConnected: false,
            isInternetReachable: false,
            type: 'none',
        });

        mockGetSavedMovieById.mockResolvedValue(savedMovie);

        const { result } = renderHook(() => useMovieDetail(456));

        await waitFor(() => {
            expect(result.current.loading).toBe(false);
        }, { timeout: 3000 });

        expect(result.current.movie).toBeTruthy();
        expect(result.current.movie?.title).toBe('Saved Movie');
        expect(result.current.isSaved).toBe(true);
    });

    it('should handle API errors gracefully', async () => {
        const apiError = new TMDBError(
            TMDBErrorCode.NOT_FOUND,
            'Movie not found',
            404
        );

        mockGetSavedMovieById.mockResolvedValue(null);
        mockFetchMovieDetail.mockRejectedValue(apiError);

        const { result } = renderHook(() => useMovieDetail(999));

        await waitFor(() => {
            expect(result.current.loading).toBe(false);
        });

        expect(result.current.error).toBeTruthy();
        expect(result.current.movie).toBeNull();
    });

    it('should use saved data when API fails (offline mode)', async () => {
        const savedMovie = {
            id: 789,
            title: 'Offline Movie',
            posterUrl: '/offline.jpg',
            overview: 'Offline overview',
            rating: 7.5,
            releaseDate: '2023-01-01',
            genres: [],
            runtime: null,
            language: null,
            savedAt: '2023-01-01T00:00:00Z',
        };

        // Mock offline status
        mockUseNetworkStatus.mockReturnValue({
            isConnected: false,
            isInternetReachable: false,
            type: 'none',
        });

        mockGetSavedMovieById.mockResolvedValue(savedMovie);
        mockFetchMovieDetail.mockRejectedValue(
            new TMDBError(TMDBErrorCode.NETWORK_ERROR, 'Network error')
        );

        const { result } = renderHook(() => useMovieDetail(789));

        await waitFor(() => {
            expect(result.current.loading).toBe(false);
        });

        // Should still show saved movie even though API failed
        expect(result.current.movie).toBeTruthy();
        expect(result.current.movie?.title).toBe('Offline Movie');
        expect(result.current.isSaved).toBe(true);
    });

    it('should toggle save movie', async () => {
        mockGetSavedMovieById.mockResolvedValue(null);
        mockFetchMovieDetail.mockResolvedValue({
            id: 111,
            title: 'Toggle Movie',
            poster_path: '/toggle.jpg',
            backdrop_path: null,
            overview: 'Toggle overview',
            vote_average: 8.0,
            vote_count: 100,
            release_date: '2023-01-01',
            genres: [],
            runtime: null,
            original_language: 'en',
            status: 'Released',
        });

        const { result } = renderHook(() => useMovieDetail(111));

        await waitFor(() => {
            expect(result.current.movie).toBeTruthy();
        });

        // Save movie
        mockGetSavedMovieById.mockResolvedValueOnce(null);
        await result.current.toggleSave();

        await waitFor(() => {
            expect(result.current.isSaved).toBe(true);
        });

        expect(mockSaveMovie).toHaveBeenCalled();

        // Remove movie
        mockGetSavedMovieById.mockResolvedValueOnce({
            id: 111,
            title: 'Toggle Movie',
            posterUrl: '/toggle.jpg',
            overview: 'Toggle overview',
            rating: 8.0,
            releaseDate: '2023-01-01',
            genres: [],
            runtime: null,
            language: 'en',
            savedAt: '2023-01-01T00:00:00Z',
        });
        await result.current.toggleSave();

        await waitFor(() => {
            expect(result.current.isSaved).toBe(false);
        });

        expect(mockRemoveMovie).toHaveBeenCalled();
    });

    it('should retry on error', async () => {
        mockGetSavedMovieById.mockResolvedValue(null);
        mockFetchMovieDetail
            .mockRejectedValueOnce(
                new TMDBError(TMDBErrorCode.NETWORK_ERROR, 'Network error')
            )
            .mockResolvedValueOnce({
                id: 222,
                title: 'Retry Movie',
                poster_path: '/retry.jpg',
                backdrop_path: null,
                overview: 'Retry overview',
                vote_average: 7.0,
                vote_count: 50,
                release_date: '2023-01-01',
                genres: [],
                runtime: null,
                original_language: 'en',
                status: 'Released',
            });

        const { result } = renderHook(() => useMovieDetail(222));

        await waitFor(() => {
            expect(result.current.error).toBeTruthy();
        });

        await act(async () => {
            await result.current.retry();
        });

        await waitFor(() => {
            expect(result.current.error).toBeNull();
            expect(result.current.movie).toBeTruthy();
        });
    });
});

