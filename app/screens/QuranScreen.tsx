/**
 * Quran Screen - Production Ready
 * Complete Quran Surah listing with search, filters, and pagination
 * Uses service layer for clean API calls
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  StatusBar,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiService } from '../services/ApiService';
import { useCustomAlert } from '../context/CustomAlertContext';
import { useLanguage } from '../context/LanguageContext';
import StyledText from '../components/StyledText';
import type { Surah, RevelationType, UserData } from './types/quran.types';

export default function QuranScreen({ navigation }: any) {
  const { showAlert } = useCustomAlert();
  const { t } = useLanguage();

  // State Management
  const [surahs, setSurahs] = useState<Surah[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [userName, setUserName] = useState('Muhammad Arsalan');
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<RevelationType | 'Topics' | 'Juz'>('All');
  const [topics, setTopics] = useState<any[]>([]);
  const [juzList, setJuzList] = useState<any[]>([]);

  // Unified Last Read History (Surahs, Juz, Topics)
  const [lastReadItems, setLastReadItems] = useState<any[]>([]);

  // Dynamic Quick Links - Changes based on user history
  const [quickLinks, setQuickLinks] = useState<any[]>([
    { type: 'surah', name: t('surahYasin'), id: 36, icon: '🕌' },
    { type: 'surah', name: t('surahArRahman'), id: 55, icon: '🕌' },
    { type: 'juz', name: t('juz30'), id: 30, icon: '📖' },
    { type: 'topic', name: t('topicTawheed'), id: 3, icon: '⭐' },
  ]);

  /**
   * Initialize component
   */
  useEffect(() => {
    initializeScreen();
  }, []);

  /**
   * Memoized filtered surahs - no infinite loop
   */
  const filteredSurahs = useMemo(() => {
    let filtered = [...surahs];

    // Apply revelation type filter
    if (selectedFilter !== 'All' && selectedFilter !== 'Topics' && selectedFilter !== 'Juz') {
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

    return filtered;
  }, [surahs, searchQuery, selectedFilter]);

  /**
   * Memoized filtered topics - no infinite loop
   */
  const filteredTopics = useMemo(() => {
    let filtered = [...topics];

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (t) =>
          t.title.toLowerCase().includes(query) ||
          (t.description && t.description.toLowerCase().includes(query)) ||
          (t.category && t.category.toLowerCase().includes(query))
      );
    }

    return filtered;
  }, [topics, searchQuery]);

  /**
   * Memoized filtered Juz - no infinite loop
   */
  const filteredJuz = useMemo(() => {
    let filtered = [...juzList];

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (j) =>
          j.juz_number.toString().includes(query) ||
          (j.juz_name_english && j.juz_name_english.toLowerCase().includes(query)) ||
          (j.juz_name_arabic && j.juz_name_arabic.includes(query))
      );
    }

    return filtered;
  }, [juzList, searchQuery]);

  /**
   * Initialize screen data
   */
  const initializeScreen = async () => {
    await Promise.all([loadUserData(), loadLastRead(), fetchSurahs(), fetchTopics(), fetchJuz()]);
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
      // Error loading user data
    }
  };

  /**
   * Load unified last read history (Surahs, Juz, Topics)
   */
  const loadLastRead = async () => {
    try {
      const lastRead = await AsyncStorage.getItem('@last_read_items');
      if (lastRead) {
        const items = JSON.parse(lastRead);
        setLastReadItems(items);

        // Update Quick Links based on reading history
        updateQuickLinksFromHistory(items);
      }
    } catch (error) {
      // Error loading last read
    }
  };

  /**
   * Save item to unified last read history
   * @param type - 'surah' | 'juz' | 'topic'
   * @param id - Item ID
   * @param name - Item name
   */
  const saveLastRead = async (type: string, id: number, name: string, icon: string = '📖') => {
    try {
      // Create new item
      const newItem = {
        type,
        id,
        name,
        icon,
        timestamp: new Date().toISOString(),
      };

      // Remove duplicate and add to front, keep only 6 items
      const updated = [
        newItem,
        ...lastReadItems.filter((item) => !(item.type === type && item.id === id)),
      ].slice(0, 6);

      setLastReadItems(updated);
      await AsyncStorage.setItem('@last_read_items', JSON.stringify(updated));

      // Update Quick Links dynamically
      updateQuickLinksFromHistory(updated);
    } catch (error) {
      // Error saving last read
    }
  };

  /**
   * Update Quick Links based on reading history
   * Mix of frequently read items and popular recommendations
   */
  const updateQuickLinksFromHistory = (history: any[]) => {
    try {
      // Get frequently read items (top 2 from history)
      const frequentItems = history.slice(0, 2);

      // Popular recommendations (if history is empty)
      const popularRecommendations = [
        { type: 'surah', name: t('surahYasin'), id: 36, icon: '🕌' },
        { type: 'surah', name: t('surahArRahman'), id: 55, icon: '🕌' },
        { type: 'juz', name: t('juz30'), id: 30, icon: '📖' },
        { type: 'topic', name: t('topicTawheed'), id: 3, icon: '⭐' },
      ];

      // Combine: frequent items + popular items (no duplicates)
      const combined = [...frequentItems];
      for (const rec of popularRecommendations) {
        if (combined.length >= 4) break;
        const exists = combined.some((item) => item.type === rec.type && item.id === rec.id);
        if (!exists) {
          combined.push(rec);
        }
      }

      setQuickLinks(combined.slice(0, 4));
    } catch (error) {
      // Error updating quick links
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
      showAlert(t('error'), t('failedToLoadSurahs'), 'error', [
        { text: t('retry'), onPress: () => fetchSurahs() },
        { text: t('cancel'), style: 'cancel' },
      ]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  /**
   * Fetch topics from API
   */
  const fetchTopics = async () => {
    try {
      const topicsData = await apiService.getAllTopics();
      setTopics(topicsData);
    } catch (error) {
      // Don't show alert for topics as it's not critical
      // Set empty array so app doesn't freeze
      setTopics([]);
    }
  };

  /**
   * Fetch Juz list from API
   */
  const fetchJuz = async () => {
    try {
      const response = await apiService.getAllJuz();
      const juzData = response.juz || [];
      setJuzList(juzData);
    } catch (error) {
      setJuzList([]);
    }
  };

  /**
   * Handle pull to refresh
   */
  const handleRefresh = () => {
    setRefreshing(true);
    fetchSurahs();
  };

  /**
   * Handle surah item press
   */
  const handleSurahPress = async (surah: Surah) => {
    try {
      // Save to unified last read history
      await saveLastRead(
        'surah',
        surah.surah_number,
        surah.surah_name_english,
        surah.revelation_type === 'Meccan' ? '🕋' : '🕌'
      );

      // Navigate to QuranReader with surah data
      navigation.navigate('QuranReader', {
        type: 'surah',
        surahNumber: surah.surah_number,
        surahName: surah.surah_name_english,
        surahNameArabic: surah.surah_name_arabic,
        totalAyahs: surah.total_ayahs,
        revelationType: surah.revelation_type,
      });
    } catch (error) {
      showAlert(t('error'), t('failedToOpenSurah'), 'error');
    }
  };

  /**
   * Handle quick link press - Unified for Surah/Juz/Topic
   */
  const handleQuickLinkPress = (item: any) => {
    if (item.type === 'surah') {
      const surah = surahs.find((s) => s.surah_number === item.id);
      if (surah) {
        handleSurahPress(surah);
      } else {
        showAlert(t('pleaseWait'), t('contentLoading'), 'info');
      }
    } else if (item.type === 'juz') {
      const juz = juzList.find((j) => j.juz_number === item.id);
      if (juz) {
        handleJuzPress(juz);
      } else {
        showAlert(t('pleaseWait'), t('contentLoading'), 'info');
      }
    } else if (item.type === 'topic') {
      const topic = topics.find((t) => t.id === item.id);
      if (topic) {
        handleTopicPress(topic);
      } else {
        showAlert(t('pleaseWait'), t('contentLoading'), 'info');
      }
    }
  };

  /**
   * Handle last read item press - Unified for Surah/Juz/Topic
   */
  const handleLastReadPress = (item: any) => {
    if (item.type === 'surah') {
      const surah = surahs.find((s) => s.surah_number === item.id);
      if (surah) {
        handleSurahPress(surah);
      }
    } else if (item.type === 'juz') {
      const juz = juzList.find((j) => j.juz_number === item.id);
      if (juz) {
        handleJuzPress(juz);
      }
    } else if (item.type === 'topic') {
      const topic = topics.find((t) => t.id === item.id);
      if (topic) {
        handleTopicPress(topic);
      }
    }
  };

  /**
   * Get revelation icon based on type
   */
  const getRevelationIcon = (type: string): string => {
    return type === 'Meccan' ? '🕋' : '🕌';
  };

  /**
   * Handle topic press
   */
  const handleTopicPress = async (topic: any) => {
    try {
      // Save to unified last read history
      await saveLastRead('topic', topic.id, topic.title, getTopicIcon(topic.icon));

      navigation.navigate('TopicDetail', {
        topicId: topic.id,
        topicTitle: topic.title,
      });
    } catch (error) {
      // Error navigating to topic
    }
  };

  /**
   * Handle Juz press
   */
  const handleJuzPress = async (juz: any) => {
    try {
      // Save to unified last read history
      await saveLastRead('juz', juz.juz_number, juz.juz_name_english || `${t('juzFull')} ${juz.juz_number}`, '📖');

      navigation.navigate('QuranReader', {
        type: 'juz',
        juzNumber: juz.juz_number,
        juzName: juz.juz_name_english || `${t('juzFull')} ${juz.juz_number}`,
        juzNameArabic: juz.juz_name_arabic || '',
      });
    } catch (error) {
      // Error navigating to juz
    }
  };

  /**
   * Get category color
   */
  const getCategoryColor = (category: string): string => {
    const colors: any = {
      spirituality: '#10B981',
      worship: '#3B82F6',
      character: '#8B5CF6',
      knowledge: '#F59E0B',
      society: '#EC4899',
      aqeedah: '#10B981',
      ibadah: '#3B82F6',
      akhlaq: '#8B5CF6',
    };
    return colors[category?.toLowerCase()] || '#6B7280';
  };

  /**
   * Get topic icon emoji
   */
  const getTopicIcon = (icon: string): string => {
    const icons: any = {
      star: '⭐',
      heart: '❤️',
      book: '📚',
      mosque: '🕌',
      peace: '☮️',
      light: '💡',
      hands: '🤲',
      growth: '🌱',
    };
    return icons[icon?.toLowerCase()] || '📚';
  };

  /**
   * Render individual surah item
   */
  const renderSurahItem = ({ item }: { item: Surah }) => (
    <TouchableOpacity
      onPress={() => handleSurahPress(item)}
      className="flex-row items-center justify-between border-b border-gray-100 px-5 py-4"
      activeOpacity={0.7}>
      {/* Surah Number */}
      <View className="w-8">
        <StyledText className="text-sm font-medium text-gray-500">{item.surah_number}</StyledText>
      </View>

      {/* Surah Info */}
      <View className="flex-1 px-4">
        <StyledText className="mb-1 text-base font-semibold text-teal-700">
          {item.surah_name_english}
        </StyledText>
        <View className="flex-row items-center">
          <StyledText className="mr-2 text-xs text-gray-500">{t(item.revelation_type.toLowerCase())}</StyledText>
          <StyledText className="mr-2 text-xs">{getRevelationIcon(item.revelation_type)}</StyledText>
          <StyledText className="text-xs text-gray-400">{item.total_ayahs} {t('ayahs')}</StyledText>
        </View>
      </View>

      {/* Arabic Name */}
      <View className="items-end">
        <StyledText className="text-2xl" style={{ fontFamily: 'System' }}>
          {item.surah_name_arabic}
        </StyledText>
      </View>
    </TouchableOpacity>
  );

  /**
   * Render individual topic item - Clean list style matching Surah/Juz theme
   */
  const renderTopicItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      onPress={() => handleTopicPress(item)}
      className="flex-row items-center justify-between border-b border-gray-100 px-5 py-4"
      activeOpacity={0.7}>
      {/* Topic Icon */}
      <View className="mr-3 w-8 items-center">
        <StyledText className="text-2xl">{getTopicIcon(item.icon)}</StyledText>
      </View>

      {/* Topic Info */}
      <View className="flex-1">
        <StyledText className="mb-1 text-base font-semibold text-teal-700">
          {item.title}
        </StyledText>
        <View className="flex-row items-center">
          {item.category && (
            <View
              className="mr-2 rounded-full px-2 py-0.5"
              style={{ backgroundColor: getCategoryColor(item.category) + '20' }}>
              <StyledText
                className="text-xs font-medium capitalize"
                style={{ color: getCategoryColor(item.category) }}>
                {item.category}
              </StyledText>
            </View>
          )}
          {item.ayah_count && item.ayah_count !== '0' && (
            <StyledText className="text-xs text-gray-400">{item.ayah_count} {t('ayahs')}</StyledText>
          )}
        </View>
      </View>

      {/* Right Arrow */}
      <View className="items-end">
        <StyledText className="text-xl text-gray-400">›</StyledText>
      </View>
    </TouchableOpacity>
  );

  /**
   * Render individual Juz item
   */
  const renderJuzItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      onPress={() => handleJuzPress(item)}
      className="mx-5 mb-3 rounded-xl border border-gray-200 bg-white p-4"
      activeOpacity={0.7}>
      <View className="flex-row items-center justify-between">
        {/* Juz Number Circle */}
        <View className="mr-4 h-12 w-12 items-center justify-center rounded-full bg-teal-100">
          <StyledText className="text-lg font-bold text-teal-700">{item.juz_number}</StyledText>
        </View>

        {/* Juz Info */}
        <View className="flex-1">
          <StyledText className="mb-1 text-base font-bold text-gray-800">
            {item.juz_name_english || `${t('juzFull')} ${item.juz_number}`}
          </StyledText>
          {item.juz_name_arabic && (
            <StyledText className="mb-2 text-sm text-gray-600" style={{ fontFamily: 'System' }}>
              {item.juz_name_arabic}
            </StyledText>
          )}
          <StyledText className="text-xs text-gray-500">
            {t('surah')} {item.starting_surah}:{item.starting_ayah} - {item.ending_surah}:{item.ending_ayah}
          </StyledText>
        </View>

        {/* Icon */}
        <View className="ml-3">
          <StyledText className="text-3xl">📖</StyledText>
        </View>
      </View>
    </TouchableOpacity>
  );

  /**
   * Render list header with user info, search, and filters
   */
  const renderHeader = () => (
    <View className="bg-white">
      {/* Search Bar */}
      {showSearch && (
        <View className="px-5 pb-3">
          <View className="flex-row items-center rounded-full bg-gray-100 px-4 py-3">
            <StyledText className="mr-2 text-gray-400">🔍</StyledText>
            <TextInput
              placeholder={
                selectedFilter === 'Topics'
                  ? t('searchTopicsPlaceholder')
                  : selectedFilter === 'Juz'
                  ? t('searchJuzPlaceholder')
                  : t('searchSurahPlaceholder')
              }
              value={searchQuery}
              onChangeText={setSearchQuery}
              className="flex-1 text-sm text-gray-700"
              placeholderTextColor="#9CA3AF"
              autoFocus
              autoCapitalize="none"
              autoCorrect={false}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <StyledText className="text-lg text-gray-400">✕</StyledText>
              </TouchableOpacity>
            )}
          </View>
        </View>
      )}

      {/* Last Read Section - Unified (Surahs, Juz, Topics) - Always Visible */}
      {!searchQuery && lastReadItems.length > 0 && (
        <View className="px-5 py-3">
          <StyledText className="mb-3 text-xs font-medium text-gray-600">📚 {t('lastRead')}</StyledText>
          <View className="flex-row flex-wrap">
            {lastReadItems.map((item, index) => (
              <TouchableOpacity
                key={index}
                onPress={() => handleLastReadPress(item)}
                className="mb-2 mr-2 flex-row items-center rounded-full border border-teal-200 bg-white px-3 py-2"
                activeOpacity={0.7}>
                <StyledText className="mr-1 text-sm">{item.icon}</StyledText>
                <StyledText className="text-xs font-medium text-teal-700">{item.name}</StyledText>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      {/* Quick Links Section - Dynamic based on history - Always Visible */}
      {!searchQuery && quickLinks.length > 0 && (
        <View className="px-5 py-3">
          <StyledText className="mb-3 text-xs font-medium text-gray-600">⭐ {t('quickAccess')}</StyledText>
          <View className="flex-row flex-wrap">
            {quickLinks.map((link, index) => (
              <TouchableOpacity
                key={index}
                onPress={() => handleQuickLinkPress(link)}
                className="mb-2 mr-2 flex-row items-center rounded-full border border-purple-200 bg-purple-50 px-3 py-2"
                activeOpacity={0.7}>
                <StyledText className="mr-1 text-sm">{link.icon}</StyledText>
                <StyledText className="text-xs font-medium text-purple-700">{link.name}</StyledText>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      {/* Filter Tabs */}
      <View className="flex-row items-center border-b border-gray-200 px-5 py-3">
        <TouchableOpacity
          onPress={() => setSelectedFilter('All')}
          className={`mr-6 pb-2 ${selectedFilter === 'All' ? 'border-b-2 border-teal-600' : ''}`}>
          <StyledText
            className={`text-sm ${
              selectedFilter === 'All' ? 'font-semibold text-teal-700' : 'text-gray-500'
            }`}>
            {t('filterAll')}
          </StyledText>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setSelectedFilter('Meccan')}
          className={`mr-6 pb-2 ${
            selectedFilter === 'Meccan' ? 'border-b-2 border-teal-600' : ''
          }`}>
          <StyledText
            className={`text-sm ${
              selectedFilter === 'Meccan' ? 'font-semibold text-teal-700' : 'text-gray-500'
            }`}>
            🕋 {t('filterMeccan')}
          </StyledText>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setSelectedFilter('Medinan')}
          className={`mr-6 pb-2 ${
            selectedFilter === 'Medinan' ? 'border-b-2 border-teal-600' : ''
          }`}>
          <StyledText
            className={`text-sm ${
              selectedFilter === 'Medinan' ? 'font-semibold text-teal-700' : 'text-gray-500'
            }`}>
            🕌 {t('filterMedinan')}
          </StyledText>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setSelectedFilter('Topics')}
          className={`mr-6 pb-2 ${selectedFilter === 'Topics' ? 'border-b-2 border-teal-600' : ''}`}>
          <StyledText
            className={`text-sm ${
              selectedFilter === 'Topics' ? 'font-semibold text-teal-700' : 'text-gray-500'
            }`}>
            📚 {t('topicsFilter')}
          </StyledText>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setSelectedFilter('Juz')}
          className={`pb-2 ${selectedFilter === 'Juz' ? 'border-b-2 border-teal-600' : ''}`}>
          <StyledText
            className={`text-sm ${
              selectedFilter === 'Juz' ? 'font-semibold text-teal-700' : 'text-gray-500'
            }`}>
            📖 {t('juzFilter')}
          </StyledText>
        </TouchableOpacity>
      </View>

      {/* Search Results Info */}
      {searchQuery && (
        <View className="border-b border-teal-100 bg-teal-50 px-5 py-2">
          <StyledText className="text-sm text-teal-700">
            {selectedFilter === 'Topics'
              ? `${filteredTopics.length} ${
                  filteredTopics.length !== 1 ? t('resultPlural') : t('resultSingular')
                } ${t('found')}`
              : selectedFilter === 'Juz'
              ? `${filteredJuz.length} ${
                  filteredJuz.length !== 1 ? t('resultPlural') : t('resultSingular')
                } ${t('found')}`
              : `${filteredSurahs.length} ${
                  filteredSurahs.length !== 1 ? t('resultPlural') : t('resultSingular')
                } ${t('found')}`}
          </StyledText>
        </View>
      )}
    </View>
  );


  /**
   * Render empty state
   */
  const renderEmpty = () => {
    if (loading) return null;

    return (
      <View className="items-center justify-center px-5 py-20">
        <StyledText className="mb-4 text-6xl">📖</StyledText>
        <StyledText className="mb-2 text-lg font-semibold text-gray-700">
          {searchQuery ? t('noResultsFound') : t('noSurahsAvailable')}
        </StyledText>
        <StyledText className="mb-4 text-center text-sm text-gray-500">
          {searchQuery
            ? t('noSurahsMatchingSearch').replace('{searchQuery}', searchQuery)
            : t('checkConnectionAndRetry')}
        </StyledText>
        {searchQuery ? (
          <TouchableOpacity
            onPress={() => setSearchQuery('')}
            className="rounded-full bg-teal-600 px-6 py-3"
            activeOpacity={0.8}>
            <StyledText className="font-semibold text-white">{t('clearSearch')}</StyledText>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            onPress={handleRefresh}
            className="rounded-full bg-teal-600 px-6 py-3"
            activeOpacity={0.8}>
            <StyledText className="font-semibold text-white">{t('retry')}</StyledText>
          </TouchableOpacity>
        )}
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

      {/* Main Content - Surah/Topics/Juz List */}
      <FlatList
        data={
          selectedFilter === 'Topics'
            ? filteredTopics
            : selectedFilter === 'Juz'
            ? filteredJuz
            : filteredSurahs
        }
        renderItem={
          selectedFilter === 'Topics'
            ? renderTopicItem
            : selectedFilter === 'Juz'
            ? renderJuzItem
            : renderSurahItem
        }
        keyExtractor={(item) =>
          selectedFilter === 'Topics'
            ? item.id.toString()
            : selectedFilter === 'Juz'
            ? item.juz_number.toString()
            : item.surah_number.toString()
        }
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmpty}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={['#0d9488']}
            tintColor="#0d9488"
            title={t('pullToRefresh')}
            titleColor="#0d9488"
          />
        }
        showsVerticalScrollIndicator={false}
        initialNumToRender={20}
        maxToRenderPerBatch={10}
        windowSize={10}
        removeClippedSubviews={true}
      />
    </SafeAreaView>
  );
}