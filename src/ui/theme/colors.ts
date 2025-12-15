/**
 * Color tokens for light and dark themes
 */

export const lightColors = {
    primary: '#007AFF',
    primaryDark: '#0051D5',
    background: '#FFFFFF',
    surface: '#F5F5F5',
    text: '#000000',
    textSecondary: '#666666',
    textTertiary: '#999999',
    textOnDark: '#FFFFFF', // Text color for use on dark backgrounds
    border: '#E0E0E0',
    error: '#FF3B30',
    success: '#34C759',
    warning: '#FF9500',
    rating: '#FFD700',
    overlay: 'rgba(0, 0, 0, 0.5)',
    shadow: '#000000', // Shadow color
} as const;

export const darkColors = {
    primary: '#0A84FF',
    primaryDark: '#0051D5',
    background: '#000000',
    surface: '#1C1C1E',
    text: '#FFFFFF',
    textSecondary: '#AEAEB2',
    textTertiary: '#8E8E93',
    textOnDark: '#FFFFFF', // Text color for use on dark backgrounds
    border: '#38383A',
    error: '#FF453A',
    success: '#32D74B',
    warning: '#FF9F0A',
    rating: '#FFD700',
    overlay: 'rgba(0, 0, 0, 0.7)',
    shadow: '#000000', // Shadow color
} as const;

// Type that represents the structure of both color schemes
export type ColorScheme = Readonly<{
    primary: string;
    primaryDark: string;
    background: string;
    surface: string;
    text: string;
    textSecondary: string;
    textTertiary: string;
    textOnDark: string;
    border: string;
    error: string;
    success: string;
    warning: string;
    rating: string;
    overlay: string;
    shadow: string;
}>;

