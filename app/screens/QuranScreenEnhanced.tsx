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
      className="flex-row items-center justify-between border-b border-gray-100 px-5 py-4"
      activeOpacity={0.7}>
      <View className="w-8">
        <StyledText className="text-sm font-medium text-gray-500">{item.surah_number}</StyledText>
      </View>

      <View className="flex-1 px-4">
        <StyledText className="mb-1 text-base font-semibold text-teal-700">
          {item.surah_name_english}
        </StyledText>
        <View className="flex-row items-center">
          <StyledText className="mr-2 text-xs text-gray-500">{item.revelation_type}</StyledText>
          <StyledText className="mr-2 text-xs">{getRevelationIcon(item.revelation_type)}</StyledText>
          <StyledText className="text-xs text-gray-400">{item.total_ayahs} {t('ayahs')}</StyledText>
        </View>
      </View>

      <View className="items-end">
        <StyledText className="text-2xl" style={{ fontFamily: 'System' }}>
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
      className="mx-2 mb-2 w-20 items-center rounded-lg border border-teal-200 bg-white p-3"
      activeOpacity={0.7}>
      <StyledText className="text-lg font-bold text-teal-700">{item.page_number}</StyledText>
      <StyledText className="mt-1 text-xs text-gray-500">{item.surah_name_english?.substring(0, 8)}</StyledText>
    </TouchableOpacity>
  );

  /**
   * Render sajda item
   */
  const renderSajdaItem = ({ item }: { item: Sajda }) => (
    <TouchableOpacity
      onPress={() => handleSajdaPress(item)}
      className="mx-4 mb-3 rounded-lg border border-gray-200 bg-white p-4"
      activeOpacity={0.7}>
      <View className="flex-row items-center justify-between mb-2">
        <StyledText className="text-base font-semibold text-teal-700">
          {t('sajda')} {item.sajda_number}
        </StyledText>
        <View className={`rounded-full px-3 py-1 ${item.sajda_type === 'obligatory' ? 'bg-red-100' : 'bg-blue-100'}`}>
          <StyledText className={`text-xs font-medium ${item.sajda_type === 'obligatory' ? 'text-red-700' : 'text-blue-700'}`}>
            {t(item.sajda_type)}
          </StyledText>
        </View>
      </View>
      <StyledText className="text-sm text-gray-600 mb-1">
        {item.surah_name_english} ({item.surah_number}:{item.ayah_number})
      </StyledText>
      {item.ayah_text && (
        <StyledText className="text-right text-base mt-2" style={{ fontFamily: 'System' }}>
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
      className="mx-4 mb-3 rounded-lg border border-gray-200 bg-white p-4"
      activeOpacity={0.7}>
      <StyledText className="text-lg font-bold text-teal-700 mb-1">
        {t('manzil')} {item.manzil_number}
      </StyledText>
      <StyledText className="text-sm text-gray-600 mb-1">
        {item.manzil_name_english || `${t('manzil')} ${item.manzil_number}`}
      </StyledText>
      <StyledText className="text-sm text-gray-500">
        {t('startsAt')}: {item.surah_name_english} ({item.surah_number}:{item.ayah_number})
      </StyledText>
    </TouchableOpacity>
  );

  /**
   * Render view mode tabs
   */
  const renderViewModeTabs = () => (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} className="border-b border-gray-200">
      <View className="flex-row px-2 py-3">
        <TouchableOpacity
          onPress={() => handleViewModeChange('surahs')}
          className={`mr-3 rounded-full px-4 py-2 ${viewMode === 'surahs' ? 'bg-teal-600' : 'bg-gray-100'}`}>
          <StyledText className={`text-sm font-medium ${viewMode === 'surahs' ? 'text-white' : 'text-gray-600'}`}>
            📖 {t('surahsFilter')}
          </StyledText>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => handleViewModeChange('pages')}
          className={`mr-3 rounded-full px-4 py-2 ${viewMode === 'pages' ? 'bg-teal-600' : 'bg-gray-100'}`}>
          <StyledText className={`text-sm font-medium ${viewMode === 'pages' ? 'text-white' : 'text-gray-600'}`}>
            📄 {t('pagesFilter')} {metadataStats && `(${metadataStats.total_pages})`}
          </StyledText>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => handleViewModeChange('manzils')}
          className={`mr-3 rounded-full px-4 py-2 ${viewMode === 'manzils' ? 'bg-teal-600' : 'bg-gray-100'}`}>
          <StyledText className={`text-sm font-medium ${viewMode === 'manzils' ? 'text-white' : 'text-gray-600'}`}>
            📚 {t('manzilsFilter')} (7)
          </StyledText>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => handleViewModeChange('sajdas')}
          className={`mr-3 rounded-full px-4 py-2 ${viewMode === 'sajdas' ? 'bg-teal-600' : 'bg-gray-100'}`}>
          <StyledText className={`text-sm font-medium ${viewMode === 'sajdas' ? 'text-white' : 'text-gray-600'}`}>
            🙇 {t('sajdasFilter')} (15)
          </StyledText>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setShowStatsModal(true)}
          className="mr-3 rounded-full bg-purple-100 px-4 py-2">
          <StyledText className="text-sm font-medium text-purple-700">📊 {t('stats')}</StyledText>
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
      <View className="flex-1 items-center justify-center bg-black/50 px-4">
        <View className="w-full max-w-md rounded-2xl bg-white p-6">
          <StyledText className="mb-4 text-xl font-bold text-teal-700">{t('quranMetadataStatistics')}</StyledText>

          {metadataStats && (
            <View className="space-y-2">
              <View className="flex-row justify-between border-b border-gray-100 py-2">
                <StyledText className="text-gray-600">{t('totalHizbQuarters')}</StyledText>
                <StyledText className="font-semibold text-teal-700">{metadataStats.total_hizb_quarters}</StyledText>
              </View>
              <View className="flex-row justify-between border-b border-gray-100 py-2">
                <StyledText className="text-gray-600">{t('totalHizbs')}</StyledText>
                <StyledText className="font-semibold text-teal-700">{metadataStats.total_hizbs}</StyledText>
              </View>
              <View className="flex-row justify-between border-b border-gray-100 py-2">
                <StyledText className="text-gray-600">{t('totalManzils')}</StyledText>
                <StyledText className="font-semibold text-teal-700">{metadataStats.total_manzils}</StyledText>
              </View>
              <View className="flex-row justify-between border-b border-gray-100 py-2">
                <StyledText className="text-gray-600">{t('totalRukus')}</StyledText>
                <StyledText className="font-semibold text-teal-700">{metadataStats.total_rukus}</StyledText>
              </View>
              <View className="flex-row justify-between border-b border-gray-100 py-2">
                <StyledText className="text-gray-600">{t('totalPages')}</StyledText>
                <StyledText className="font-semibold text-teal-700">{metadataStats.total_pages}</StyledText>
              </View>
              <View className="flex-row justify-between border-b border-gray-100 py-2">
                <StyledText className="text-gray-600">{t('totalSajdas')}</StyledText>
                <StyledText className="font-semibold text-teal-700">{metadataStats.total_sajdas}</StyledText>
              </View>
              <View className="flex-row justify-between border-b border-gray-100 py-2">
                <StyledText className="text-gray-600">{t('obligatorySajdas')}</StyledText>
                <StyledText className="font-semibold text-red-700">{metadataStats.obligatory_sajdas}</StyledText>
              </View>
              <View className="flex-row justify-between py-2">
                <StyledText className="text-gray-600">{t('recommendedSajdas')}</StyledText>
                <StyledText className="font-semibold text-blue-700">{metadataStats.recommended_sajdas}</StyledText>
              </View>
            </View>
          )}

          <TouchableOpacity
            onPress={() => setShowStatsModal(false)}
            className="mt-6 rounded-full bg-teal-600 py-3">
            <StyledText className="text-center font-semibold text-white">{t('close')}</StyledText>
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
        <ActivityIndicator size="small" color="#0d9488" />
        <StyledText className="mt-2 text-center text-xs text-gray-500">{t('loadingEllipsis')}</StyledText>
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
        <StyledText className="mb-2 text-lg font-semibold text-gray-700">{message.title}</StyledText>
        <StyledText className="mb-4 text-center text-sm text-gray-500">{message.subtitle}</StyledText>
        <TouchableOpacity
          onPress={handleRefresh}
          className="rounded-full bg-teal-600 px-6 py-3"
          activeOpacity={0.8}>
          <StyledText className="font-semibold text-white">{t('retry')}</StyledText>
        </TouchableOpacity>
      </View>
    );
  };

  /**
   * Render loading screen
   */
  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#0d9488" />
        <StyledText className="mt-4 text-base text-gray-500">{t('loadingQuran')}</StyledText>
        <StyledText className="mt-2 text-xs text-gray-400">{t('pleaseWait')}</StyledText>
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />

      {/* Header with User Greeting */}
      <View className="border-b border-gray-100 px-5 py-4">
        <StyledText className="text-2xl font-bold text-teal-700">{t('quran')}</StyledText>
        <StyledText className="text-sm text-gray-500">{t('assalamuAlaikum').replace('{userName}', userName)}</StyledText>
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
              colors={['#0d9488']}
              tintColor="#0d9488"
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
              colors={['#0d9488']}
              tintColor="#0d9488"
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
              colors={['#0d9488']}
              tintColor="#0d9488"
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
              colors={['#0d9488']}
              tintColor="#0d9488"
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