/**
 * Enhanced Quran Screen - With Full Metadata Integration
 * Complete Quran Surah listing with Pages, Rukus, Manzils, Sajdas
 * Professional production-ready implementation
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  StatusBar,
  TextInput,
  Alert,
  ScrollView,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiService } from '../services/ApiService';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import StyledText from '../components/StyledText';
import type {
  Surah,
  RevelationType,
  UserData,
  MetadataStats,
  Sajda,
  Page,
  Manzil,
} from './types/quran.types';

type ViewMode = 'surahs' | 'pages' | 'sajdas' | 'manzils';

export default function QuranScreenEnhanced() {
  const { t } = useLanguage();
  const { colors, isDark } = useTheme();

  // State Management
  const [surahs, setSurahs] = useState<Surah[]>([]);
  const [filteredSurahs, setFilteredSurahs] = useState<Surah[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [userName, setUserName] = useState(t('defaultUserName'));
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<RevelationType>('All');
  const [viewMode, setViewMode] = useState<ViewMode>('surahs');

  // Metadata State
  const [metadataStats, setMetadataStats] = useState<MetadataStats | null>(null);
  const [sajdas, setSajdas] = useState<Sajda[]>([]);
  const [pages, setPages] = useState<Page[]>([]);
  const [manzils, setManzils] = useState<Manzil[]>([]);
  const [loadingMetadata, setLoadingMetadata] = useState(false);
  const [showStatsModal, setShowStatsModal] = useState(false);

  // Last Read Surahs
  const [lastReadSurahs, setLastReadSurahs] = useState<string[]>([]);

  /**
   * Initialize component
   */
  useEffect(() => {
    initializeScreen();
  }, []);

  /**
   * Filter surahs when search/filter changes
   */
  useEffect(() => {
    if (viewMode === 'surahs') {
      filterSurahs();
    }
  }, [searchQuery, selectedFilter, surahs, viewMode]);

  /**
   * Initialize screen data
   */
  const initializeScreen = async () => {
    await Promise.all([
      loadUserData(),
      loadLastRead(),
      fetchSurahs(),
      fetchMetadataStats(),
    ]);
  };

  /**
   * Load user data from storage
   */
  const loadUserData = async () => {
    try {
      const userData = await AsyncStorage.getItem('@user_data');
      if (userData) {
        const user: UserData = JSON.parse(userData);
        setUserName(`${user.firstName} ${user.lastName}`);
      }
    } catch (error) {
    }
  };

  /**
   * Load last read surahs from storage
   */
  const loadLastRead = async () => {
    try {
      const lastRead = await AsyncStorage.getItem('@last_read_surahs');
      if (lastRead) {
        setLastReadSurahs(JSON.parse(lastRead));
      }
    } catch (error) {
    }
  };

  /**
   * Save surah to last read
   */
  const saveLastRead = async (surahName: string) => {
    try {
      const updated = [surahName, ...lastReadSurahs.filter((s) => s !== surahName)].slice(0, 4);

      setLastReadSurahs(updated);
      await AsyncStorage.setItem('@last_read_surahs', JSON.stringify(updated));
    } catch (error) {
    }
  };

  /**
   * Fetch surahs from API
   */
  const fetchSurahs = async () => {
    try {
      setLoading(true);

      const data = await apiService.getSurahs();
      setSurahs(data.surahs);
    } catch (error) {
      Alert.alert(t('error'), t('failedToLoadSurahs'), [
        { text: t('retry'), onPress: () => fetchSurahs() },
        { text: t('cancel'), style: 'cancel' },
      ]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  /**
   * Fetch metadata statistics
   */
  const fetchMetadataStats = async () => {
    try {
      const data = await apiService.getMetadataStats();
      setMetadataStats(data.stats);
    } catch (error) {
    }
  };

  /**
   * Fetch Sajdas
   */
  const fetchSajdas = async () => {
    try {
      setLoadingMetadata(true);
      const data = await apiService.getSajdas();
      setSajdas(data.sajdas);
    } catch (error) {
      Alert.alert(t('error'), t('failedToLoadSajdas'));
    } finally {
      setLoadingMetadata(false);
    }
  };

  /**
   * Fetch Pages
   */
  const fetchPages = async () => {
    try {
      setLoadingMetadata(true);
      const data = await apiService.getPages();
      setPages(data.pages);
    } catch (error) {
      Alert.alert(t('error'), t('failedToLoadPages'));
    } finally {
      setLoadingMetadata(false);
    }
  };

  /**
   * Fetch Manzils
   */
  const fetchManzils = async () => {
    try {
      setLoadingMetadata(true);
      const data = await apiService.getManzils();
      setManzils(data.manzils);
    } catch (error) {
      Alert.alert(t('error'), t('failedToLoadManzils'));
    } finally {
      setLoadingMetadata(false);
    }
  };

  /**
   * Filter surahs based on search and revelation type
   */
  const filterSurahs = useCallback(() => {
    let filtered = [...surahs];

    // Apply revelation type filter
    if (selectedFilter !== 'All') {
      filtered = filtered.filter((s) => s.revelation_type === selectedFilter);
    }

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (s) =>
          s.surah_name_english.toLowerCase().includes(query) ||
          s.surah_name_arabic.includes(query) ||
          s.surah_number.toString().includes(query)
      );
    }

    setFilteredSurahs(filtered);
  }, [surahs, searchQuery, selectedFilter]);

  /**
   * Handle pull to refresh
   */
  const handleRefresh = () => {
    setRefreshing(true);
    fetchSurahs();
    fetchMetadataStats();
  };

  /**
   * Handle view mode change
   */
  const handleViewModeChange = (mode: ViewMode) => {
    setViewMode(mode);
    setSearchQuery('');

    // Fetch data if not already loaded
    if (mode === 'sajdas' && sajdas.length === 0) {
      fetchSajdas();
    } else if (mode === 'pages' && pages.length === 0) {
      fetchPages();
    } else if (mode === 'manzils' && manzils.length === 0) {
      fetchManzils();
    }
  };

  /**
   * Handle surah item press
   */
  const handleSurahPress = async (surah: Surah) => {
    await saveLastRead(surah.surah_name_english.toUpperCase());

    Alert.alert(
      surah.surah_name_english,
      `${surah.surah_name_arabic}\n\n${surah.total_ayahs} ${t('ayahs')} • ${surah.revelation_type}`,
      [
        { text: t('cancel'), style: 'cancel' },
        {
          text: t('readNow'),
          onPress: () => {
          },
        },
      ]
    );
  };

  /**
   * Handle page press
   */
  const handlePagePress = (page: Page) => {
    Alert.alert(
      `${t('page')} ${page.page_number}`,
      `${t('startsAt')}: ${page.surah_name_english} (${page.surah_number}:${page.ayah_number})${page.end_surah_number ? `\n${t('endsAt')}: ${page.end_surah_number}:${page.end_ayah_number}` : ''}`,
      [
        { text: t('ok') },
      ]
    );
  };

  /**
   * Handle sajda press
   */
  const handleSajdaPress = (sajda: Sajda) => {
    Alert.alert(
      `${t('sajda')} ${sajda.sajda_number} - ${t(sajda.sajda_type)}`,
      `${sajda.surah_name_english} (${sajda.surah_number}:${sajda.ayah_number})\n\n${sajda.ayah_text || ''}`,
      [{ text: t('ok') }]
    );
  };

  /**
   * Handle manzil press
   */
  const handleManzilPress = (manzil: Manzil) => {
    Alert.alert(
      `${t('manzil')} ${manzil.manzil_number}`,
      `${manzil.manzil_name_english || `${t('manzil')} ${manzil.manzil_number}`}\n\n${t('startsAt')}: ${manzil.surah_name_english} (${manzil.surah_number}:${manzil.ayah_number})`,
      [{ text: t('ok') }]
    );
  };

  /**
   * Get revelation icon based on type
   */
  const getRevelationIcon = (type: string): string => {
    return type === 'Meccan' ? '🕋' : '🕌';
  };

  /**
   * Render individual surah item
   */
  const renderSurahItem = ({ item }: { item: Surah }) => (
    <TouchableOpacity
      onPress={() => handleSurahPress(item)}
      className="flex-row items-center justify-between px-5 py-4"
      style={{ borderBottomWidth: 1, borderBottomColor: colors.border }}
      activeOpacity={0.7}>
      <View className="w-8">
        <StyledText className="text-sm font-medium" style={{ color: colors.textSecondary }}>{item.surah_number}</StyledText>
      </View>

      <View className="flex-1 px-4">
        <StyledText className="mb-1 text-base font-semibold" style={{ color: colors.primary }}>
          {item.surah_name_english}
        </StyledText>
        <View className="flex-row items-center">
          <StyledText className="mr-2 text-xs" style={{ color: colors.textSecondary }}>{item.revelation_type}</StyledText>
          <StyledText className="mr-2 text-xs">{getRevelationIcon(item.revelation_type)}</StyledText>
          <StyledText className="text-xs" style={{ color: colors.textSecondary }}>{item.total_ayahs} {t('ayahs')}</StyledText>
        </View>
      </View>

      <View className="items-end">
        <StyledText className="text-2xl" style={{ fontFamily: 'System', color: colors.text }}>
          {item.surah_name_arabic}
        </StyledText>
      </View>
    </TouchableOpacity>
  );

  /**
   * Render page item
   */
  const renderPageItem = ({ item }: { item: Page }) => (
    <TouchableOpacity
      onPress={() => handlePagePress(item)}
      className="mx-2 mb-2 w-20 items-center rounded-lg p-3"
      style={{ borderWidth: 1, borderColor: colors.border, backgroundColor: colors.card }}
      activeOpacity={0.7}>
      <StyledText className="text-lg font-bold" style={{ color: colors.primary }}>{item.page_number}</StyledText>
      <StyledText className="mt-1 text-xs" style={{ color: colors.textSecondary }}>{item.surah_name_english?.substring(0, 8)}</StyledText>
    </TouchableOpacity>
  );

  /**
   * Render sajda item
   */
  const renderSajdaItem = ({ item }: { item: Sajda }) => (
    <TouchableOpacity
      onPress={() => handleSajdaPress(item)}
      className="mx-4 mb-3 rounded-lg p-4"
      style={{ borderWidth: 1, borderColor: colors.border, backgroundColor: colors.card }}
      activeOpacity={0.7}>
      <View className="flex-row items-center justify-between mb-2">
        <StyledText className="text-base font-semibold" style={{ color: colors.primary }}>
          {t('sajda')} {item.sajda_number}
        </StyledText>
        <View
          className="rounded-full px-3 py-1"
          style={{
            backgroundColor: item.sajda_type === 'obligatory' ? colors.error + '20' : colors.info + '20',
          }}>
          <StyledText
            className="text-xs font-medium"
            style={{
              color: item.sajda_type === 'obligatory' ? colors.error : colors.info,
            }}>
            {t(item.sajda_type)}
          </StyledText>
        </View>
      </View>
      <StyledText className="text-sm mb-1" style={{ color: colors.textSecondary }}>
        {item.surah_name_english} ({item.surah_number}:{item.ayah_number})
      </StyledText>
      {item.ayah_text && (
        <StyledText className="text-right text-base mt-2" style={{ fontFamily: 'System', color: colors.text }}>
          {item.ayah_text}
        </StyledText>
      )}
    </TouchableOpacity>
  );

  /**
   * Render manzil item
   */
  const renderManzilItem = ({ item }: { item: Manzil }) => (
    <TouchableOpacity
      onPress={() => handleManzilPress(item)}
      className="mx-4 mb-3 rounded-lg p-4"
      style={{ borderWidth: 1, borderColor: colors.border, backgroundColor: colors.card }}
      activeOpacity={0.7}>
      <StyledText className="text-lg font-bold mb-1" style={{ color: colors.primary }}>
        {t('manzil')} {item.manzil_number}
      </StyledText>
      <StyledText className="text-sm mb-1" style={{ color: colors.textSecondary }}>
        {item.manzil_name_english || `${t('manzil')} ${item.manzil_number}`}
      </StyledText>
      <StyledText className="text-sm" style={{ color: colors.textSecondary }}>
        {t('startsAt')}: {item.surah_name_english} ({item.surah_number}:{item.ayah_number})
      </StyledText>
    </TouchableOpacity>
  );

  /**
   * Render view mode tabs
   */
  const renderViewModeTabs = () => (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={{ borderBottomWidth: 1, borderBottomColor: colors.border }}>
      <View className="flex-row px-2 py-3">
        <TouchableOpacity
          onPress={() => handleViewModeChange('surahs')}
          className="mr-3 rounded-full px-4 py-2"
          style={{
            backgroundColor: viewMode === 'surahs' ? colors.primary : colors.surface,
          }}>
          <StyledText
            className="text-sm font-medium"
            style={{
              color: viewMode === 'surahs' ? colors.card : colors.text,
            }}>
            📖 {t('surahsFilter')}
          </StyledText>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => handleViewModeChange('pages')}
          className="mr-3 rounded-full px-4 py-2"
          style={{
            backgroundColor: viewMode === 'pages' ? colors.primary : colors.surface,
          }}>
          <StyledText
            className="text-sm font-medium"
            style={{
              color: viewMode === 'pages' ? colors.card : colors.text,
            }}>
            📄 {t('pagesFilter')} {metadataStats && `(${metadataStats.total_pages})`}
          </StyledText>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => handleViewModeChange('manzils')}
          className="mr-3 rounded-full px-4 py-2"
          style={{
            backgroundColor: viewMode === 'manzils' ? colors.primary : colors.surface,
          }}>
          <StyledText
            className="text-sm font-medium"
            style={{
              color: viewMode === 'manzils' ? colors.card : colors.text,
            }}>
            📚 {t('manzilsFilter')} (7)
          </StyledText>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => handleViewModeChange('sajdas')}
          className="mr-3 rounded-full px-4 py-2"
          style={{
            backgroundColor: viewMode === 'sajdas' ? colors.primary : colors.surface,
          }}>
          <StyledText
            className="text-sm font-medium"
            style={{
              color: viewMode === 'sajdas' ? colors.card : colors.text,
            }}>
            🙇 {t('sajdasFilter')} (15)
          </StyledText>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setShowStatsModal(true)}
          className="mr-3 rounded-full px-4 py-2"
          style={{
            backgroundColor: colors.primaryLight + '30',
          }}>
          <StyledText className="text-sm font-medium" style={{ color: colors.primary }}>
            📊 {t('stats')}
          </StyledText>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );

  /**
   * Render stats modal
   */
  const renderStatsModal = () => (
    <Modal
      visible={showStatsModal}
      transparent
      animationType="fade"
      onRequestClose={() => setShowStatsModal(false)}>
      <View className="flex-1 items-center justify-center px-4" style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
        <View className="w-full max-w-md rounded-2xl p-6" style={{ backgroundColor: colors.card }}>
          <StyledText className="mb-4 text-xl font-bold" style={{ color: colors.primary }}>
            {t('quranMetadataStatistics')}
          </StyledText>

          {metadataStats && (
            <View className="space-y-2">
              <View
                className="flex-row justify-between py-2"
                style={{ borderBottomWidth: 1, borderBottomColor: colors.border }}>
                <StyledText style={{ color: colors.textSecondary }}>{t('totalHizbQuarters')}</StyledText>
                <StyledText className="font-semibold" style={{ color: colors.primary }}>
                  {metadataStats.total_hizb_quarters}
                </StyledText>
              </View>
              <View
                className="flex-row justify-between py-2"
                style={{ borderBottomWidth: 1, borderBottomColor: colors.border }}>
                <StyledText style={{ color: colors.textSecondary }}>{t('totalHizbs')}</StyledText>
                <StyledText className="font-semibold" style={{ color: colors.primary }}>
                  {metadataStats.total_hizbs}
                </StyledText>
              </View>
              <View
                className="flex-row justify-between py-2"
                style={{ borderBottomWidth: 1, borderBottomColor: colors.border }}>
                <StyledText style={{ color: colors.textSecondary }}>{t('totalManzils')}</StyledText>
                <StyledText className="font-semibold" style={{ color: colors.primary }}>
                  {metadataStats.total_manzils}
                </StyledText>
              </View>
              <View
                className="flex-row justify-between py-2"
                style={{ borderBottomWidth: 1, borderBottomColor: colors.border }}>
                <StyledText style={{ color: colors.textSecondary }}>{t('totalRukus')}</StyledText>
                <StyledText className="font-semibold" style={{ color: colors.primary }}>
                  {metadataStats.total_rukus}
                </StyledText>
              </View>
              <View
                className="flex-row justify-between py-2"
                style={{ borderBottomWidth: 1, borderBottomColor: colors.border }}>
                <StyledText style={{ color: colors.textSecondary }}>{t('totalPages')}</StyledText>
                <StyledText className="font-semibold" style={{ color: colors.primary }}>
                  {metadataStats.total_pages}
                </StyledText>
              </View>
              <View
                className="flex-row justify-between py-2"
                style={{ borderBottomWidth: 1, borderBottomColor: colors.border }}>
                <StyledText style={{ color: colors.textSecondary }}>{t('totalSajdas')}</StyledText>
                <StyledText className="font-semibold" style={{ color: colors.primary }}>
                  {metadataStats.total_sajdas}
                </StyledText>
              </View>
              <View
                className="flex-row justify-between py-2"
                style={{ borderBottomWidth: 1, borderBottomColor: colors.border }}>
                <StyledText style={{ color: colors.textSecondary }}>{t('obligatorySajdas')}</StyledText>
                <StyledText className="font-semibold" style={{ color: colors.error }}>
                  {metadataStats.obligatory_sajdas}
                </StyledText>
              </View>
              <View className="flex-row justify-between py-2">
                <StyledText style={{ color: colors.textSecondary }}>{t('recommendedSajdas')}</StyledText>
                <StyledText className="font-semibold" style={{ color: colors.info }}>
                  {metadataStats.recommended_sajdas}
                </StyledText>
              </View>
            </View>
          )}

          <TouchableOpacity
            onPress={() => setShowStatsModal(false)}
            className="mt-6 rounded-full py-3"
            style={{ backgroundColor: colors.primary }}>
            <StyledText className="text-center font-semibold" style={{ color: colors.card }}>
              {t('close')}
            </StyledText>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  /**
   * Render loading footer
   */
  const renderFooter = () => {
    if (!loadingMetadata) return null;
    return (
      <View className="py-4">
        <ActivityIndicator size="small" color={colors.primary} />
        <StyledText className="mt-2 text-center text-xs" style={{ color: colors.textSecondary }}>
          {t('loadingEllipsis')}
        </StyledText>
      </View>
    );
  };

  /**
   * Render empty state
   */
  const renderEmpty = () => {
    if (loading || loadingMetadata) return null;

    const emptyMessages = {
      surahs: { emoji: '📖', title: t('noSurahsFound'), subtitle: t('adjustSearchOrFilters') },
      pages: { emoji: '📄', title: t('noPagesAvailable'), subtitle: t('failedToLoadPagesData') },
      sajdas: { emoji: '🙇', title: t('noSajdasAvailable'), subtitle: t('failedToLoadSajdasData') },
      manzils: { emoji: '📚', title: t('noManzilsAvailable'), subtitle: t('failedToLoadManzilsData') },
    };

    const message = emptyMessages[viewMode];

    return (
      <View className="items-center justify-center px-5 py-20">
        <StyledText className="mb-4 text-6xl">{message.emoji}</StyledText>
        <StyledText className="mb-2 text-lg font-semibold" style={{ color: colors.text }}>
          {message.title}
        </StyledText>
        <StyledText className="mb-4 text-center text-sm" style={{ color: colors.textSecondary }}>
          {message.subtitle}
        </StyledText>
        <TouchableOpacity
          onPress={handleRefresh}
          className="rounded-full px-6 py-3"
          style={{ backgroundColor: colors.primary }}
          activeOpacity={0.8}>
          <StyledText className="font-semibold" style={{ color: colors.card }}>
            {t('retry')}
          </StyledText>
        </TouchableOpacity>
      </View>
    );
  };

  /**
   * Render loading screen
   */
  if (loading) {
    return (
      <View className="flex-1 items-center justify-center" style={{ backgroundColor: colors.background }}>
        <ActivityIndicator size="large" color={colors.primary} />
        <StyledText className="mt-4 text-base" style={{ color: colors.textSecondary }}>
          {t('loadingQuran')}
        </StyledText>
        <StyledText className="mt-2 text-xs" style={{ color: colors.textSecondary }}>
          {t('pleaseWait')}
        </StyledText>
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: colors.background }} edges={['top']}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={colors.background} />

      {/* Header with User Greeting */}
      <View
        className="px-5 py-4"
        style={{ borderBottomWidth: 1, borderBottomColor: colors.border }}>
        <StyledText className="text-2xl font-bold" style={{ color: colors.primary }}>
          {t('quran')}
        </StyledText>
        <StyledText className="text-sm" style={{ color: colors.textSecondary }}>
          {t('assalamuAlaikum').replace('{userName}', userName)}
        </StyledText>
      </View>

      {/* View Mode Tabs */}
      {renderViewModeTabs()}

      {/* Content based on view mode */}
      {viewMode === 'surahs' && (
        <FlatList
          data={filteredSurahs}
          renderItem={renderSurahItem}
          keyExtractor={(item) => item.surah_number.toString()}
          ListFooterComponent={renderFooter}
          ListEmptyComponent={renderEmpty}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={[colors.primary]}
              tintColor={colors.primary}
            />
          }
          showsVerticalScrollIndicator={false}
        />
      )}

      {viewMode === 'pages' && (
        <FlatList
          data={pages}
          renderItem={renderPageItem}
          keyExtractor={(item) => item.id.toString()}
          numColumns={4}
          ListFooterComponent={renderFooter}
          ListEmptyComponent={renderEmpty}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={[colors.primary]}
              tintColor={colors.primary}
            />
          }
          showsVerticalScrollIndicator={false}
        />
      )}

      {viewMode === 'sajdas' && (
        <FlatList
          data={sajdas}
          renderItem={renderSajdaItem}
          keyExtractor={(item) => item.id.toString()}
          ListFooterComponent={renderFooter}
          ListEmptyComponent={renderEmpty}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={[colors.primary]}
              tintColor={colors.primary}
            />
          }
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingVertical: 12 }}
        />
      )}

      {viewMode === 'manzils' && (
        <FlatList
          data={manzils}
          renderItem={renderManzilItem}
          keyExtractor={(item) => item.id.toString()}
          ListFooterComponent={renderFooter}
          ListEmptyComponent={renderEmpty}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={[colors.primary]}
              tintColor={colors.primary}
            />
          }
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingVertical: 12 }}
        />
      )}

      {/* Stats Modal */}
      {renderStatsModal()}
    </SafeAreaView>
  );
}