/**
 * Image cache storage layer
 * Downloads and caches movie poster images for offline access
 */

import * as FileSystem from 'expo-file-system/legacy';
import { logger } from '../../utils/logger';

const CACHE_DIR = `${FileSystem.cacheDirectory}movie_posters/`;

/**
 * Initialize cache directory
 */
async function ensureCacheDir(): Promise<void> {
    const dirInfo = await FileSystem.getInfoAsync(CACHE_DIR);
    if (!dirInfo.exists) {
        await FileSystem.makeDirectoryAsync(CACHE_DIR, { intermediates: true });
        logger.debug('Created image cache directory');
    }
}

/**
 * Get filename from URL
 */
function getFilenameFromUrl(url: string): string {
    const urlParts = url.split('/');
    const filename = urlParts[urlParts.length - 1];
    // Remove query params if any
    return filename.split('?')[0] || 'image.jpg';
}

/**
 * Download and cache an image
 */
export async function cacheImage(url: string): Promise<string | null> {
    if (!url) {
        return null;
    }

    try {
        await ensureCacheDir();

        const filename = getFilenameFromUrl(url);
        const localPath = `${CACHE_DIR}${filename}`;

        // Check if already cached
        const fileInfo = await FileSystem.getInfoAsync(localPath);
        if (fileInfo.exists) {
            logger.debug('Image already cached', { url, localPath });
            return localPath;
        }

        // Download image
        logger.debug('Downloading image', { url });
        const downloadResult = await FileSystem.downloadAsync(url, localPath);

        if (downloadResult.status === 200) {
            logger.debug('Image cached successfully', { url, localPath });
            return localPath;
        }

        logger.warn('Failed to cache image', { url, status: downloadResult.status });
        return null;
    } catch (error) {
        logger.error('Error caching image', { error, url });
        return null;
    }
}

/**
 * Get cached image path if available
 */
export async function getCachedImagePath(url: string): Promise<string | null> {
    if (!url) {
        return null;
    }

    try {
        const filename = getFilenameFromUrl(url);
        const localPath = `${CACHE_DIR}${filename}`;

        const fileInfo = await FileSystem.getInfoAsync(localPath);
        if (fileInfo.exists) {
            return localPath;
        }

        return null;
    } catch (error) {
        logger.error('Error getting cached image', { error, url });
        return null;
    }
}

/**
 * Clear all cached images
 */
export async function clearImageCache(): Promise<void> {
    try {
        const dirInfo = await FileSystem.getInfoAsync(CACHE_DIR);
        if (dirInfo.exists) {
            await FileSystem.deleteAsync(CACHE_DIR, { idempotent: true });
            logger.debug('Image cache cleared');
        }
    } catch (error) {
        logger.error('Error clearing image cache', { error });
    }
}

/**
 * Get cache size
 */
export async function getCacheSize(): Promise<number> {
    try {
        const dirInfo = await FileSystem.getInfoAsync(CACHE_DIR);
        if (!dirInfo.exists) {
            return 0;
        }

        const files = await FileSystem.readDirectoryAsync(CACHE_DIR);
        let totalSize = 0;

        for (const file of files) {
            const filePath = `${CACHE_DIR}${file}`;
            const fileInfo = await FileSystem.getInfoAsync(filePath);
            if (fileInfo.exists && 'size' in fileInfo) {
                totalSize += fileInfo.size || 0;
            }
        }

        return totalSize;
    } catch (error) {
        logger.error('Error getting cache size', { error });
        return 0;
    }
}

