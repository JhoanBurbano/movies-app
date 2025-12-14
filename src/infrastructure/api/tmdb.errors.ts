/**
 * Centralized error handling for TMDB API
 */

export enum TMDBErrorCode {
  UNAUTHORIZED = 'UNAUTHORIZED',
  NOT_FOUND = 'NOT_FOUND',
  RATE_LIMIT = 'RATE_LIMIT',
  SERVER_ERROR = 'SERVER_ERROR',
  NETWORK_ERROR = 'NETWORK_ERROR',
  TIMEOUT = 'TIMEOUT',
  UNKNOWN = 'UNKNOWN',
}

export class TMDBError extends Error {
  constructor(
    public code: TMDBErrorCode,
    message: string,
    public statusCode?: number,
    public originalError?: unknown
  ) {
    super(message);
    this.name = 'TMDBError';
  }
}

/**
 * Maps HTTP status codes to TMDB error codes
 */
export function mapStatusCodeToError(
  statusCode: number,
  message?: string
): TMDBError {
  switch (statusCode) {
    case 401:
      return new TMDBError(
        TMDBErrorCode.UNAUTHORIZED,
        message || 'Invalid API key. Please check your configuration.',
        statusCode
      );
    case 404:
      return new TMDBError(
        TMDBErrorCode.NOT_FOUND,
        message || 'Resource not found.',
        statusCode
      );
    case 429:
      return new TMDBError(
        TMDBErrorCode.RATE_LIMIT,
        message || 'Rate limit exceeded. Please try again later.',
        statusCode
      );
    case 500:
    case 502:
    case 503:
    case 504:
      return new TMDBError(
        TMDBErrorCode.SERVER_ERROR,
        message || 'Server error. Please try again later.',
        statusCode
      );
    default:
      return new TMDBError(
        TMDBErrorCode.UNKNOWN,
        message || `Unexpected error (${statusCode})`,
        statusCode
      );
  }
}

/**
 * Creates a user-friendly error message
 */
export function getUserFriendlyMessage(error: TMDBError): string {
  switch (error.code) {
    case TMDBErrorCode.UNAUTHORIZED:
      return 'Authentication failed. Please check your API key.';
    case TMDBErrorCode.NOT_FOUND:
      return 'Movie not found.';
    case TMDBErrorCode.RATE_LIMIT:
      return 'Too many requests. Please wait a moment and try again.';
    case TMDBErrorCode.SERVER_ERROR:
      return 'Server is temporarily unavailable. Please try again later.';
    case TMDBErrorCode.NETWORK_ERROR:
      return 'Network error. Please check your connection.';
    case TMDBErrorCode.TIMEOUT:
      return 'Request timed out. Please try again.';
    default:
      return 'Something went wrong. Please try again.';
  }
}

