/**
 * Jest setup file
 * Runs before each test file
 */

// Set default environment variables for tests
process.env.EXPO_PUBLIC_TMDB_API_KEY = process.env.EXPO_PUBLIC_TMDB_API_KEY || 'test_api_key';
process.env.EXPO_PUBLIC_TMDB_BASE_URL = process.env.EXPO_PUBLIC_TMDB_BASE_URL || 'https://api.themoviedb.org/3';
process.env.EXPO_PUBLIC_TMDB_IMAGE_BASE_URL = process.env.EXPO_PUBLIC_TMDB_IMAGE_BASE_URL || 'https://image.tmdb.org/t/p/w500';

// Mock NetworkStatusContext for tests
jest.mock('./src/hooks/NetworkStatusContext', () => ({
    NetworkStatusProvider: ({ children }) => children,
    useNetworkStatus: jest.fn(() => ({
        isConnected: true,
        isInternetReachable: true,
        type: 'wifi',
    })),
}));

