/**
 * Video player component for trailers
 * Supports YouTube and direct video playback
 */

import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Modal,
    TouchableOpacity,
    ActivityIndicator,
    Linking,
} from 'react-native';
import { WebView } from 'react-native-webview';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../../ui/theme/theme';
import { logger } from '../../utils/logger';
import type { TMDBVideoDTO } from '../../domain/movie/movie.dto';

interface VideoPlayerProps {
    video: TMDBVideoDTO | null;
    visible: boolean;
    onClose: () => void;
}

const AnimatedView = Animated.createAnimatedComponent(View);

export function VideoPlayer({ video, visible, onClose }: VideoPlayerProps) {
    const theme = useTheme();
    const styles = createStyles(theme);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!visible) {
            setLoading(true);
            setError(null);
        }
    }, [visible]);

    const handleClose = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onClose();
    };

    /**
     * Gets YouTube watch URL with parameters that work after error 153
     * Uses the format that YouTube provides: watch?v=KEY&embeds_referring_origin
     */
    const getYouTubeWatchUrl = (): string => {
        if (!video || video.site !== 'YouTube') return '';
        
        const baseUrl = `https://www.youtube.com/watch?v=${video.key}`;
        const params = new URLSearchParams({
            embeds_referring_origin: 'https://www.youtube.com',
        });
        
        return `${baseUrl}&${params.toString()}`;
    };

    /**
     * Creates HTML that redirects to YouTube watch page or embeds directly
     */
    const getYouTubeEmbedHTML = (): string => {
        if (!video || video.site !== 'YouTube') return '';
        
        const watchUrl = getYouTubeWatchUrl();
        
        return `
            <!DOCTYPE html>
            <html>
            <head>
                <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
                <style>
                    * {
                        margin: 0;
                        padding: 0;
                        box-sizing: border-box;
                    }
                    html, body {
                        width: 100%;
                        height: 100%;
                        overflow: hidden;
                        background-color: #000;
                    }
                    .video-container {
                        position: absolute;
                        top: 0;
                        left: 0;
                        width: 100%;
                        height: 100%;
                    }
                    iframe {
                        width: 100%;
                        height: 100%;
                        border: none;
                    }
                </style>
            </head>
            <body>
                <div class="video-container">
                    <iframe
                        src="https://www.youtube.com/embed/${video.key}?autoplay=1&rel=0&modestbranding=1&playsinline=1&enablejsapi=1&origin=${encodeURIComponent('https://www.youtube.com')}&embeds_referring_origin=${encodeURIComponent('https://www.youtube.com')}"
                        frameborder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        allowfullscreen
                        referrerpolicy="strict-origin-when-cross-origin"
                    ></iframe>
                </div>
            </body>
            </html>
        `;
    };

    const getEmbedUrl = (): string | null => {
        if (!video) return null;

        if (video.site === 'YouTube') {
            return getYouTubeWatchUrl();
        } else if (video.site === 'Vimeo') {
            return `https://player.vimeo.com/video/${video.key}?autoplay=1&title=0&byline=0&portrait=0`;
        }

        return null;
    };

    const handleOpenInBrowser = () => {
        if (!video) return;

        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        
        let url = '';
        if (video.site === 'YouTube') {
            url = `https://www.youtube.com/watch?v=${video.key}`;
        } else if (video.site === 'Vimeo') {
            url = `https://vimeo.com/${video.key}`;
        }

        if (url) {
            Linking.openURL(url).catch((err) => {
                logger.error('Failed to open video in browser', { error: err });
                setError('Failed to open video');
            });
        }
    };

    const handleWebViewError = (syntheticEvent: any) => {
        const { nativeEvent } = syntheticEvent;
        logger.error('WebView error', { error: nativeEvent });
        setError('Failed to load video');
        setLoading(false);
    };

    const handleWebViewLoad = () => {
        setLoading(false);
        setError(null);
    };

    if (!video) {
        return null;
    }

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={handleClose}
        >
            <AnimatedView
                entering={FadeIn.duration(200)}
                exiting={FadeOut.duration(150)}
                style={styles.overlay}
            >
                <View style={styles.container}>
                    <View style={styles.header}>
                        <Text style={styles.title}>{video.name}</Text>
                        <TouchableOpacity
                            onPress={handleClose}
                            style={styles.closeButton}
                            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                        >
                            <Ionicons name="close" size={24} color={theme.colors.text} />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.videoContainer}>
                        {video.site === 'YouTube' || video.site === 'Vimeo' ? (
                            <>
                                {loading && (
                                    <View style={styles.loadingContainer}>
                                        <ActivityIndicator size="large" color={theme.colors.primary} />
                                        <Text style={styles.loadingText}>Loading trailer...</Text>
                                    </View>
                                )}
                                {error ? (
                                    <View style={styles.errorContainer}>
                                        <Ionicons
                                            name="alert-circle-outline"
                                            size={48}
                                            color={theme.colors.error}
                                        />
                                        <Text style={styles.errorText}>{error}</Text>
                                        <Text style={styles.errorSubtext}>
                                            Please try opening in browser
                                        </Text>
                                        <TouchableOpacity
                                            style={styles.openBrowserButton}
                                            onPress={handleOpenInBrowser}
                                        >
                                            <Ionicons
                                                name="open-outline"
                                                size={20}
                                                color={theme.colors.textOnDark}
                                            />
                                            <Text style={styles.openBrowserButtonText}>
                                                Open in Browser
                                            </Text>
                                        </TouchableOpacity>
                                    </View>
                                ) : (
                                    <WebView
                                        source={
                                            video.site === 'YouTube'
                                                ? { uri: getYouTubeWatchUrl() }
                                                : { uri: getEmbedUrl() || '' }
                                        }
                                        style={styles.webview}
                                        allowsFullscreenVideo
                                        mediaPlaybackRequiresUserAction={false}
                                        onError={handleWebViewError}
                                        onLoadEnd={handleWebViewLoad}
                                        onLoadStart={() => setLoading(true)}
                                        javaScriptEnabled
                                        domStorageEnabled
                                        startInLoadingState
                                        originWhitelist={['*']}
                                        mixedContentMode="always"
                                        userAgent="Mozilla/5.0 (Linux; Android 10; Mobile) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.120 Mobile Safari/537.36"
                                        renderLoading={() => (
                                            <View style={styles.loadingContainer}>
                                                <ActivityIndicator size="large" color={theme.colors.primary} />
                                            </View>
                                        )}
                                    />
                                )}
                            </>
                        ) : (
                            <View style={styles.unsupportedContainer}>
                                <Ionicons
                                    name="videocam-outline"
                                    size={48}
                                    color={theme.colors.textSecondary}
                                />
                                <Text style={styles.unsupportedText}>
                                    Video format not supported
                                </Text>
                                <Text style={styles.unsupportedSubtext}>
                                    {video.site} videos are not yet supported
                                </Text>
                            </View>
                        )}
                    </View>
                </View>
            </AnimatedView>
        </Modal>
    );
}

function createStyles(theme: ReturnType<typeof useTheme>) {
    return StyleSheet.create({
        overlay: {
            flex: 1,
            backgroundColor: theme.colors.overlay,
            justifyContent: 'center',
            alignItems: 'center',
        },
        container: {
            backgroundColor: theme.colors.background,
            borderRadius: 16,
            width: '90%',
            maxWidth: 600,
            maxHeight: '80%',
            overflow: 'hidden',
        },
        header: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: theme.spacing.md,
            borderBottomWidth: 1,
            borderBottomColor: theme.colors.border,
        },
        title: {
            ...theme.typography.h3,
            color: theme.colors.text,
            flex: 1,
            marginRight: theme.spacing.sm,
        },
        closeButton: {
            padding: theme.spacing.xs,
        },
        videoContainer: {
            width: '100%',
            aspectRatio: 16 / 9,
            backgroundColor: theme.colors.surface,
            position: 'relative',
        },
        webview: {
            flex: 1,
            backgroundColor: theme.colors.surface,
        },
        loadingContainer: {
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: theme.colors.surface,
        },
        loadingText: {
            ...theme.typography.body,
            color: theme.colors.textSecondary,
            marginTop: theme.spacing.md,
        },
        errorContainer: {
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: theme.colors.surface,
            padding: theme.spacing.xl,
        },
        errorText: {
            ...theme.typography.body,
            color: theme.colors.text,
            marginTop: theme.spacing.md,
            marginBottom: theme.spacing.xs,
            textAlign: 'center',
        },
        errorSubtext: {
            ...theme.typography.caption,
            color: theme.colors.textSecondary,
            textAlign: 'center',
            marginBottom: theme.spacing.md,
        },
        openBrowserButton: {
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: theme.colors.primary,
            paddingHorizontal: theme.spacing.lg,
            paddingVertical: theme.spacing.md,
            borderRadius: 8,
            marginTop: theme.spacing.sm,
            gap: theme.spacing.xs,
        },
        openBrowserButtonText: {
            ...theme.typography.button,
            color: theme.colors.textOnDark,
        },
        unsupportedContainer: {
            alignItems: 'center',
            padding: theme.spacing.xl,
        },
        unsupportedText: {
            ...theme.typography.body,
            color: theme.colors.text,
            marginTop: theme.spacing.md,
            marginBottom: theme.spacing.xs,
        },
        unsupportedSubtext: {
            ...theme.typography.caption,
            color: theme.colors.textSecondary,
        },
    });
}

