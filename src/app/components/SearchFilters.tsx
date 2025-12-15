/**
 * Search filters component
 * Displays filters for year, genre, and language when search results are shown
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    Modal,
    FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withSpring,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../../ui/theme/theme';
import type { Genre } from '../../domain/movie/movie.types';
import { fetchGenres } from '../../infrastructure/api/tmdb.client';
import { logger } from '../../utils/logger';

export interface SearchFiltersState {
    year?: number;
    genre?: number;
    language?: string;
}

interface SearchFiltersProps {
    filters: SearchFiltersState;
    onFiltersChange: (filters: SearchFiltersState) => void;
}

// Common languages for movies
const COMMON_LANGUAGES = [
    { code: 'en', name: 'English' },
    { code: 'es', name: 'Spanish' },
    { code: 'fr', name: 'French' },
    { code: 'de', name: 'German' },
    { code: 'it', name: 'Italian' },
    { code: 'pt', name: 'Portuguese' },
    { code: 'ja', name: 'Japanese' },
    { code: 'ko', name: 'Korean' },
    { code: 'zh', name: 'Chinese' },
    { code: 'ru', name: 'Russian' },
];

// Generate years from 1900 to current year
const CURRENT_YEAR = new Date().getFullYear();
const YEARS = Array.from({ length: CURRENT_YEAR - 1899 }, (_, i) => CURRENT_YEAR - i);

export function SearchFilters({ filters, onFiltersChange }: SearchFiltersProps) {
    const theme = useTheme();
    const styles = createStyles(theme);
    const [genres, setGenres] = useState<Genre[]>([]);
    const [loadingGenres, setLoadingGenres] = useState(false);
    const [showYearModal, setShowYearModal] = useState(false);
    const [showGenreModal, setShowGenreModal] = useState(false);
    const [showLanguageModal, setShowLanguageModal] = useState(false);

    const scale = useSharedValue(1);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
    }));

    // Load genres on mount
    useEffect(() => {
        const loadGenres = async () => {
            try {
                setLoadingGenres(true);
                const response = await fetchGenres();
                setGenres(response.genres);
            } catch (error) {
                logger.error('Failed to load genres', { error });
            } finally {
                setLoadingGenres(false);
            }
        };

        loadGenres();
    }, []);

    const handleFilterPress = useCallback((type: 'year' | 'genre' | 'language') => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        scale.value = withSpring(0.95);
        setTimeout(() => {
            scale.value = withSpring(1);
        }, 100);

        switch (type) {
            case 'year':
                setShowYearModal(true);
                break;
            case 'genre':
                setShowGenreModal(true);
                break;
            case 'language':
                setShowLanguageModal(true);
                break;
        }
    }, [scale]);

    const handleYearSelect = useCallback((year: number) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onFiltersChange({
            ...filters,
            year: filters.year === year ? undefined : year,
        });
        setShowYearModal(false);
    }, [filters, onFiltersChange]);

    const handleGenreSelect = useCallback((genreId: number) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onFiltersChange({
            ...filters,
            genre: filters.genre === genreId ? undefined : genreId,
        });
        setShowGenreModal(false);
    }, [filters, onFiltersChange]);

    const handleLanguageSelect = useCallback((languageCode: string) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onFiltersChange({
            ...filters,
            language: filters.language === languageCode ? undefined : languageCode,
        });
        setShowLanguageModal(false);
    }, [filters, onFiltersChange]);

    const clearFilters = useCallback(() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onFiltersChange({});
    }, [onFiltersChange]);

    const hasActiveFilters = filters.year || filters.genre || filters.language;

    const getGenreName = (genreId: number) => {
        return genres.find((g) => g.id === genreId)?.name || 'Unknown';
    };

    const getLanguageName = (code: string) => {
        return COMMON_LANGUAGES.find((l) => l.code === code)?.name || code.toUpperCase();
    };

    return (
        <View style={styles.container}>
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                <Animated.View style={animatedStyle}>
                    <TouchableOpacity
                        style={[styles.filterButton, filters.year ? styles.filterButtonActive : undefined]}
                        onPress={() => handleFilterPress('year')}
                    >
                        <Ionicons
                            name="calendar-outline"
                            size={16}
                            color={filters.year ? theme.colors.primary : theme.colors.textSecondary}
                        />
                        <Text
                            style={[
                                styles.filterText,
                                filters.year ? styles.filterTextActive : undefined,
                            ]}
                        >
                            {filters.year || 'Year'}
                        </Text>
                    </TouchableOpacity>
                </Animated.View>

                <Animated.View style={animatedStyle}>
                    <TouchableOpacity
                        style={[styles.filterButton, filters.genre ? styles.filterButtonActive : undefined]}
                        onPress={() => handleFilterPress('genre')}
                        disabled={loadingGenres}
                    >
                        <Ionicons
                            name="film-outline"
                            size={16}
                            color={filters.genre ? theme.colors.primary : theme.colors.textSecondary}
                        />
                        <Text
                            style={[
                                styles.filterText,
                                filters.genre ? styles.filterTextActive : undefined,
                            ]}
                            numberOfLines={1}
                        >
                            {filters.genre ? getGenreName(filters.genre) : 'Genre'}
                        </Text>
                    </TouchableOpacity>
                </Animated.View>

                <Animated.View style={animatedStyle}>
                    <TouchableOpacity
                        style={[styles.filterButton, filters.language && styles.filterButtonActive]}
                        onPress={() => handleFilterPress('language')}
                    >
                        <Ionicons
                            name="language-outline"
                            size={16}
                            color={filters.language ? theme.colors.primary : theme.colors.textSecondary}
                        />
                        <Text
                            style={[
                                styles.filterText,
                                filters.language && styles.filterTextActive,
                            ]}
                        >
                            {filters.language ? getLanguageName(filters.language) : 'Language'}
                        </Text>
                    </TouchableOpacity>
                </Animated.View>

                {hasActiveFilters && (
                    <TouchableOpacity
                        style={styles.clearButton}
                        onPress={clearFilters}
                    >
                        <Ionicons name="close-circle" size={18} color={theme.colors.error} />
                        <Text style={styles.clearText}>Clear</Text>
                    </TouchableOpacity>
                )}
            </ScrollView>

            {/* Year Modal */}
            <Modal
                visible={showYearModal}
                transparent
                animationType="slide"
                onRequestClose={() => setShowYearModal(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Select Year</Text>
                            <TouchableOpacity onPress={() => setShowYearModal(false)}>
                                <Ionicons name="close" size={24} color={theme.colors.text} />
                            </TouchableOpacity>
                        </View>
                        <FlatList
                            data={YEARS}
                            keyExtractor={(item) => item.toString()}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    style={[
                                        styles.modalItem,
                                        filters.year === item && styles.modalItemActive,
                                    ]}
                                    onPress={() => handleYearSelect(item)}
                                >
                                    <Text
                                        style={[
                                            styles.modalItemText,
                                            filters.year === item && styles.modalItemTextActive,
                                        ]}
                                    >
                                        {item}
                                    </Text>
                                    {filters.year === item && (
                                        <Ionicons name="checkmark" size={20} color={theme.colors.primary} />
                                    )}
                                </TouchableOpacity>
                            )}
                            initialNumToRender={20}
                            maxToRenderPerBatch={20}
                        />
                    </View>
                </View>
            </Modal>

            {/* Genre Modal */}
            <Modal
                visible={showGenreModal}
                transparent
                animationType="slide"
                onRequestClose={() => setShowGenreModal(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Select Genre</Text>
                            <TouchableOpacity onPress={() => setShowGenreModal(false)}>
                                <Ionicons name="close" size={24} color={theme.colors.text} />
                            </TouchableOpacity>
                        </View>
                        {loadingGenres ? (
                            <View style={styles.loadingContainer}>
                                <Text style={styles.loadingText}>Loading genres...</Text>
                            </View>
                        ) : (
                            <FlatList
                                data={genres}
                                keyExtractor={(item) => item.id.toString()}
                                renderItem={({ item }) => (
                                    <TouchableOpacity
                                        style={[
                                            styles.modalItem,
                                            filters.genre === item.id && styles.modalItemActive,
                                        ]}
                                        onPress={() => handleGenreSelect(item.id)}
                                    >
                                        <Text
                                            style={[
                                                styles.modalItemText,
                                                filters.genre === item.id && styles.modalItemTextActive,
                                            ]}
                                        >
                                            {item.name}
                                        </Text>
                                        {filters.genre === item.id && (
                                            <Ionicons name="checkmark" size={20} color={theme.colors.primary} />
                                        )}
                                    </TouchableOpacity>
                                )}
                            />
                        )}
                    </View>
                </View>
            </Modal>

            {/* Language Modal */}
            <Modal
                visible={showLanguageModal}
                transparent
                animationType="slide"
                onRequestClose={() => setShowLanguageModal(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Select Language</Text>
                            <TouchableOpacity onPress={() => setShowLanguageModal(false)}>
                                <Ionicons name="close" size={24} color={theme.colors.text} />
                            </TouchableOpacity>
                        </View>
                        <FlatList
                            data={COMMON_LANGUAGES}
                            keyExtractor={(item) => item.code}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    style={[
                                        styles.modalItem,
                                        filters.language === item.code && styles.modalItemActive,
                                    ]}
                                    onPress={() => handleLanguageSelect(item.code)}
                                >
                                    <Text
                                        style={[
                                            styles.modalItemText,
                                            filters.language === item.code && styles.modalItemTextActive,
                                        ]}
                                    >
                                        {item.name}
                                    </Text>
                                    {filters.language === item.code && (
                                        <Ionicons name="checkmark" size={20} color={theme.colors.primary} />
                                    )}
                                </TouchableOpacity>
                            )}
                        />
                    </View>
                </View>
            </Modal>
        </View>
    );
}

function createStyles(theme: ReturnType<typeof useTheme>) {
    return StyleSheet.create({
        container: {
            paddingVertical: theme.spacing.sm,
            borderBottomWidth: 1,
            borderBottomColor: theme.colors.border,
        },
        scrollContent: {
            paddingHorizontal: theme.spacing.md,
            gap: theme.spacing.sm,
        },
        filterButton: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: theme.spacing.xs,
            paddingHorizontal: theme.spacing.md,
            paddingVertical: theme.spacing.sm,
            borderRadius: 20,
            backgroundColor: theme.colors.surface,
            borderWidth: 1,
            borderColor: theme.colors.border,
            minWidth: 80,
        },
        filterButtonActive: {
            backgroundColor: theme.colors.primary + '15',
            borderColor: theme.colors.primary,
        },
        filterText: {
            ...theme.typography.caption,
            color: theme.colors.textSecondary,
            fontSize: 13, // Slightly larger than caption for readability
        },
        filterTextActive: {
            color: theme.colors.primary,
            fontWeight: theme.typography.weights.semibold,
        },
        clearButton: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: theme.spacing.xs,
            paddingHorizontal: theme.spacing.md,
            paddingVertical: theme.spacing.sm,
            borderRadius: 20,
            backgroundColor: theme.colors.surface,
        },
        clearText: {
            ...theme.typography.caption,
            color: theme.colors.error,
            fontSize: 13, // Slightly larger than caption for readability
            fontWeight: theme.typography.weights.semibold,
        },
        modalOverlay: {
            flex: 1,
            backgroundColor: theme.colors.overlay,
            justifyContent: 'flex-end',
        },
        modalContent: {
            backgroundColor: theme.colors.background,
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            maxHeight: '70%',
            paddingBottom: theme.spacing.lg,
        },
        modalHeader: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: theme.spacing.md,
            borderBottomWidth: 1,
            borderBottomColor: theme.colors.border,
        },
        modalTitle: {
            ...theme.typography.h3,
            color: theme.colors.text,
        },
        modalItem: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: theme.spacing.md,
            borderBottomWidth: 1,
            borderBottomColor: theme.colors.border,
        },
        modalItemActive: {
            backgroundColor: theme.colors.primary + '10',
        },
        modalItemText: {
            ...theme.typography.body,
            color: theme.colors.text,
        },
        modalItemTextActive: {
            color: theme.colors.primary,
            fontWeight: theme.typography.weights.semibold,
        },
        loadingContainer: {
            padding: theme.spacing.lg,
            alignItems: 'center',
        },
        loadingText: {
            ...theme.typography.body,
            color: theme.colors.textSecondary,
        },
    });
}

