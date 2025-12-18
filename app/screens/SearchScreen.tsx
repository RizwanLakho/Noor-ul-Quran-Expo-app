import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  FlatList,
  Keyboard,
  Modal,
  Pressable,
  Share,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useTheme } from '../context/ThemeContext';
import { useCustomAlert } from '../context/CustomAlertContext';
import { useSearchHistory, SearchHistoryItem as HistoryItemType } from '../context/SearchHistoryContext';
import { useLanguage } from '../context/LanguageContext';
import StyledText from '../components/StyledText';
import { apiService } from '../services/ApiService';
import SearchResultItem from './components/search/SearchResultItem';
import SearchHistoryItemComponent from './components/search/SearchHistoryItem';
import AyahDetailModal from './components/search/AyahDetailModal';

interface SearchResult {
  ayahId: number;
  text: string;
  translation: string;
  surahName: string;
  surahNumber: number;
  ayahNumber: number;
  highlighted?: string;
}

export default function SearchScreen() {
  const { colors, isDark } = useTheme();
  const { showAlert } = useCustomAlert();
  const { history, addToHistory, removeFromHistory, clearHistory } = useSearchHistory();
  const { t } = useLanguage();

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'search' | 'history'>('search');
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedAyah, setSelectedAyah] = useState<SearchResult | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery.trim().length >= 2) {
        fetchSuggestions(searchQuery);
      } else {
        setSuggestions([]);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  /**
   * Fetch search suggestions
   */
  const fetchSuggestions = async (query: string) => {
    try {
      const data = await apiService.getSearchSuggestions(query);
      setSuggestions(data.suggestions || []);
    } catch (err) {
      // Suggestions are optional, don't show error to user
    }
  };

  /**
   * Perform search
   */
  const performSearch = async (query: string, page: number = 1) => {
    if (!query.trim()) return;

    try {
      if (page === 1) {
        setSearching(true);
        setLoading(true);
        setError(null);
        setSearchResults([]);
        setCurrentPage(1);
        setHasMore(true);
      } else {
        setLoadingMore(true);
      }

      Keyboard.dismiss();

      const data = await apiService.searchQuran(query, {
        types: ['ayah'],
        page: page,
        limit: 20, // Load 20 items per page
      });

      // Handle different possible response structures
      let rawResults = [];

      if (data.results) {
        rawResults = data.results;
      } else if (data.data) {
        rawResults = data.data;
      } else if (Array.isArray(data)) {
        rawResults = data;
      } else if (data.ayahs) {
        rawResults = data.ayahs;
      }

      // Transform the results based on your API response structure
      const results: SearchResult[] = rawResults.map((item: any, index: number) => {
        return {
          ayahId: item.ayah_id || item.ayahId || item.ayah?.id || item.id || index,
          text: item.ayah_text || item.text || item.ayah?.text || item.arabic || '',
          translation:
            item.translation_text ||
            item.translation ||
            item.ayah?.translation ||
            item.english ||
            '',
          surahName:
            item.surah_name ||
            item.surahName ||
            item.surah?.name ||
            item.surah?.englishName ||
            'Unknown',
          surahNumber: item.surah_number || item.surahNumber || item.surah?.number || 0,
          ayahNumber:
            item.ayah_number ||
            item.ayahNumber ||
            item.ayah?.numberInSurah ||
            item.verse_number ||
            0,
          highlighted: item.highlighted || '',
        };
      });

      if (page === 1) {
        setSearchResults(results);
      } else {
        setSearchResults(prev => [...prev, ...results]);
      }

      // Check if there are more results
      setHasMore(results.length === 20);
      setCurrentPage(page);
      setActiveTab('search');
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : t('failedToSearch');
      setError(errorMessage);
    } finally {
      setLoading(false);
      setSearching(false);
      setLoadingMore(false);
    }
  };

  /**
   * Load more results
   */
  const loadMoreResults = () => {
    if (!loadingMore && hasMore && searchQuery.trim()) {
      performSearch(searchQuery, currentPage + 1);
    }
  };

  /**
   * Handle ayah click - save to history and show details
   */
  const handleAyahClick = async (result: SearchResult) => {
    // Save to history
    await addToHistory({
      ayahId: result.ayahId,
      text: result.text,
      translation: result.translation,
      surahName: result.surahName,
      surahNumber: result.surahNumber,
      ayahNumber: result.ayahNumber,
      searchQuery: searchQuery,
    });

    // Show ayah details in modal
    setSelectedAyah(result);
    setModalVisible(true);
  };

  /**
   * Handle share ayah
   */
  const handleShare = async () => {
    if (!selectedAyah) return;

    try {
      await Share.share({
        message: `${selectedAyah.surahName} - ${t('verse')} ${selectedAyah.ayahNumber}\n\n${selectedAyah.text}\n\n${selectedAyah.translation}`,
      });
    } catch (error) {
      // Error sharing
    }
  };

  /**
   * Handle remove from history
   */
  const handleRemoveFromHistory = () => {
    if (!selectedAyah) return;

    showAlert(
      t('removeFromHistoryAlertTitle'),
      t('removeFromHistoryAlertMessage'),
      'warning',
      [
        { text: t('cancel'), style: 'cancel' },
        {
          text: t('remove'),
          style: 'destructive',
          onPress: () => {
            const historyItem = history.find((h) => h.ayahId === selectedAyah.ayahId);
            if (historyItem) {
              removeFromHistory(historyItem.id);
              setModalVisible(false);
              showAlert(t('removed'), t('ayahRemovedFromHistory'), 'success');
            }
          },
        },
      ]
    );
  };

  /**
   * Handle clear history
   */
  const handleClearHistory = () => {
    showAlert(
      t('clearHistoryAlertTitle'),
      t('clearHistoryAlertMessage'),
      'warning',
      [
        { text: t('cancel'), style: 'cancel' },
        {
          text: t('clearAll'),
          style: 'destructive',
          onPress: () => {
            clearHistory();
            showAlert(t('cleared'), t('searchHistoryClearedSuccessfully'), 'success');
          },
        },
      ]
    );
  };

  /**
   * Render search result item
   */
  const renderSearchResult = ({ item }: { item: SearchResult }) => (
    <SearchResultItem item={item} onPress={handleAyahClick} />
  );

  /**
   * Render history item
   */
  const renderHistoryItem = ({ item }: { item: HistoryItemType }) => (
    <SearchHistoryItemComponent
      item={item}
      onPress={() =>
        handleAyahClick({
          ayahId: item.ayahId,
          text: item.text,
          translation: item.translation,
          surahName: item.surahName,
          surahNumber: item.surahNumber,
          ayahNumber: item.ayahNumber,
        })
      }
      onRemove={removeFromHistory}
    />
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <StyledText style={[styles.title, { color: colors.text }]}>{t('searchQuranTitle')}</StyledText>
      </View>

      {/* Search Input */}
      <View style={styles.searchContainer}>
        <View
          style={[
            styles.searchInputWrapper,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}>
          <Ionicons name="search" size={20} color={colors.textSecondary} />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder={t('searchPlaceholder')}
            placeholderTextColor={colors.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={() => performSearch(searchQuery)}
            returnKeyType="search"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          )}
        </View>

        {searchQuery.trim().length >= 2 && (
          <TouchableOpacity
            style={[styles.searchButton, { backgroundColor: colors.primary }]}
            onPress={() => performSearch(searchQuery)}
            disabled={loading}>
            {loading ? (
              <ActivityIndicator color="#FFF" size="small" />
            ) : (
              <StyledText style={styles.searchButtonText}>{t('search')}</StyledText>
            )}
          </TouchableOpacity>
        )}
      </View>

      {/* Suggestions */}
      {suggestions.length > 0 && !searching && (
        <View style={styles.suggestionsContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {suggestions.map((suggestion, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.suggestionChip,
                  { backgroundColor: colors.surface, borderColor: colors.border },
                ]}
                onPress={() => {
                  setSearchQuery(suggestion);
                  performSearch(suggestion);
                }}>
                <StyledText style={[styles.suggestionText, { color: colors.text }]}>{suggestion}</StyledText>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Tabs */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === 'search' && { borderBottomColor: colors.primary, borderBottomWidth: 2 },
          ]}
          onPress={() => setActiveTab('search')}>
          <Ionicons
            name="search"
            size={20}
            color={activeTab === 'search' ? colors.primary : colors.textSecondary}
          />
          <StyledText
            style={[
              styles.tabText,
              { color: activeTab === 'search' ? colors.primary : colors.textSecondary },
            ]}>
            {t('resultsTab')} ({searchResults.length})
          </StyledText>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === 'history' && { borderBottomColor: colors.primary, borderBottomWidth: 2 },
          ]}
          onPress={() => setActiveTab('history')}>
          <Ionicons
            name="time-outline"
            size={20}
            color={activeTab === 'history' ? colors.primary : colors.textSecondary}
          />
          <StyledText
            style={[
              styles.tabText,
              { color: activeTab === 'history' ? colors.primary : colors.textSecondary },
            ]}>
            {t('history')} ({history.length})
          </StyledText>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <View style={styles.content}>
        {activeTab === 'search' ? (
          <>
            {error && (
              <View style={styles.errorContainer}>
                <Ionicons name="alert-circle" size={48} color={colors.error} />
                <StyledText style={[styles.errorText, { color: colors.error }]}>{error}</StyledText>
              </View>
            )}

            {!error && searchResults.length === 0 && !searching && (
              <View style={styles.emptyContainer}>
                <Ionicons name="search" size={64} color={colors.textSecondary} />
                <StyledText style={[styles.emptyText, { color: colors.textSecondary }]}>
                  {searchQuery ? t('noResultsFound') : t('searchForAyahsSurahsKeywords')}
                </StyledText>
                <StyledText style={[styles.emptySubText, { color: colors.textSecondary }]}>
                  {t('trySearchingSpecificWords')}
                </StyledText>
              </View>
            )}

            {searching && (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={colors.primary} />
                <StyledText style={[styles.loadingText, { color: colors.textSecondary }]}>
                  {t('searchingEllipsis')}
                </StyledText>
              </View>
            )}

            {!searching && searchResults.length > 0 && (
              <FlatList
                data={searchResults}
                renderItem={renderSearchResult}
                keyExtractor={(item, index) => `${item.ayahId}_${index}`}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
                onEndReached={loadMoreResults}
                onEndReachedThreshold={0.5}
                ListFooterComponent={
                  loadingMore ? (
                    <View style={styles.loadingMoreContainer}>
                      <ActivityIndicator size="small" color={colors.primary} />
                      <StyledText style={[styles.loadingMoreText, { color: colors.textSecondary }]}>
                        {t('loadingMoreEllipsis')}
                      </StyledText>
                    </View>
                  ) : !hasMore && searchResults.length > 0 ? (
                    <View style={styles.endOfResultsContainer}>
                      <StyledText style={[styles.endOfResultsText, { color: colors.textSecondary }]}>
                        {t('allResultsLoaded')}
                      </StyledText>
                    </View>
                  ) : null
                }
              />
            )}
          </>
        ) : (
          <>
            {history.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Ionicons name="time-outline" size={64} color={colors.textSecondary} />
                <StyledText style={[styles.emptyText, { color: colors.textSecondary }]}>
                  {t('noSearchHistory')}
                </StyledText>
                <StyledText style={[styles.emptySubText, { color: colors.textSecondary }]}>
                  {t('searchHistoryWillAppear')}
                </StyledText>
              </View>
            ) : (
              <>
                <View style={styles.historyHeaderContainer}>
                  <StyledText style={[styles.historyTitle, { color: colors.text }]}>{t('recentSearches')}</StyledText>
                  <TouchableOpacity onPress={handleClearHistory}>
                    <StyledText style={[styles.clearButton, { color: colors.error }]}>{t('clearAll')}</StyledText>
                  </TouchableOpacity>
                </View>
                <FlatList
                  data={history}
                  renderItem={renderHistoryItem}
                  keyExtractor={(item) => item.id}
                  contentContainerStyle={styles.listContent}
                  showsVerticalScrollIndicator={false}
                />
              </>
            )}
          </>
        )}
      </View>

      {/* Ayah Detail Modal */}
      <AyahDetailModal
        visible={modalVisible}
        ayah={selectedAyah}
        onClose={() => setModalVisible(false)}
        onShare={handleShare}
        onRemove={handleRemoveFromHistory}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  searchContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 12,
    marginBottom: 12,
  },
  searchInputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 24,
    borderWidth: 1.5,
    gap: 12,
    shadowColor: '#14B8A6',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
  },
  searchButton: {
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 80,
    shadowColor: '#14B8A6',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  searchButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  suggestionsContainer: {
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  suggestionChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 8,
  },
  suggestionText: {
    fontSize: 14,
    fontWeight: '500',
  },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    gap: 8,
  },
  tabText: {
    fontSize: 16,
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  // Result and history card styles moved to separate components
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubText: {
    fontSize: 14,
    textAlign: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  errorText: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 16,
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    marginTop: 16,
  },
  historyHeaderContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
  },
  historyTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  clearButton: {
    fontSize: 14,
    fontWeight: '600',
  },
  loadingMoreContainer: {
    paddingVertical: 20,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 12,
  },
  loadingMoreText: {
    fontSize: 14,
    fontWeight: '500',
  },
  endOfResultsContainer: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  endOfResultsText: {
    fontSize: 14,
    fontWeight: '500',
  },
  // Modal styles moved to AyahDetailModal component
});