import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  StatusBar,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { apiService } from '../services/ApiService';
import { useCustomAlert } from '../context/CustomAlertContext';
import { useSettings } from '../context/SettingsContext';
import { useLanguage } from '../context/LanguageContext';
import StyledText from '../components/StyledText';

export default function TopicDetailScreen({ route, navigation }: any) {
  const { topicId, topicTitle } = route.params;
  const { showAlert } = useCustomAlert();
  const { quranAppearance } = useSettings();
  const { t } = useLanguage();

  const [loading, setLoading] = useState(true);
  const [topic, setTopic] = useState<any>(null);
  const [ayahs, setAyahs] = useState<any[]>([]);
  const [hadiths, setHadiths] = useState<any[]>([]);

  // Progress tracking states
  const [progressPercentage, setProgressPercentage] = useState(0);
  const [startTime, setStartTime] = useState(Date.now());
  const scrollViewRef = useRef<ScrollView>(null);
  const saveTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    loadTopicDetails();
    loadProgress();

    // Cleanup: Save progress when user leaves
    return () => {
      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current);
      }
      saveProgress(progressPercentage, false); // Final save
    };
  }, [topicId]);

  const loadTopicDetails = async () => {
    try {
      setLoading(true);
      // Pass selected translator from settings
      const translator = quranAppearance.selectedTranslatorName || 'Ahmed Ali';
      const response = await apiService.getTopicById(topicId, translator);

      if (response && response.topic) {
        setTopic(response.topic);
        setAyahs(response.ayahs || []);
        setHadiths(response.hadiths || response.hadith || []);
      }
    } catch (error) {
      showAlert(t('loadingError'), t('failedToLoadTopicDetails'), 'error');
    } finally {
      setLoading(false);
    }
  };

  const loadProgress = async () => {
    try {
      const progress = await apiService.getTopicProgress(topicId);
      if (progress && progress.progress_percentage) {
        setProgressPercentage(progress.progress_percentage);
      }
    } catch (error: any) {
      // Silently ignore auth errors (user not logged in)
    }
  };

  const saveProgress = async (percentage: number, scheduleNext = true) => {
    try {
      const timeSpent = Math.floor((Date.now() - startTime) / 1000); // seconds
      const totalItems = ayahs.length + hadiths.length;

      await apiService.saveTopicProgress(topicId, {
        progressPercentage: percentage,
        totalItems: totalItems,
        timeSpent: timeSpent,
      });

      // Schedule next auto-save in 10 seconds
      if (scheduleNext && saveTimerRef.current) {
        clearTimeout(saveTimerRef.current);
      }
      if (scheduleNext) {
        saveTimerRef.current = setTimeout(() => {
          saveProgress(progressPercentage, true);
        }, 10000);
      }
    } catch (error: any) {
      // Silently ignore auth errors (user not logged in)
    }
  };

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const { contentOffset, contentSize, layoutMeasurement } = event.nativeEvent;

    // Prevent calculation when content size is not ready
    if (contentSize.height <= layoutMeasurement.height) {
      // Content fits in one screen, mark as 100% complete
      if (progressPercentage < 100) {
        setProgressPercentage(100);
        saveProgress(100, false);
      }
      return;
    }

    // Calculate scroll percentage
    const scrollableHeight = contentSize.height - layoutMeasurement.height;
    const scrolled = contentOffset.y;
    const scrollPercentage = Math.min(100, Math.max(0, (scrolled / scrollableHeight) * 100));

    const roundedPercentage = Math.floor(scrollPercentage);

    // Only update if new percentage is HIGHER than current (progress never goes backward)
    if (roundedPercentage > progressPercentage) {
      setProgressPercentage(roundedPercentage);

      // Debounced save: Clear previous timer and set new one
      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current);
      }
      saveTimerRef.current = setTimeout(() => {
        saveProgress(roundedPercentage, false);
      }, 2000);
    }

    // Mark as 100% when user scrolls to the very bottom
    if (scrolled + layoutMeasurement.height >= contentSize.height - 20) {
      if (progressPercentage < 100) {
        setProgressPercentage(100);
        saveProgress(100, false);
      }
    }
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        <StatusBar barStyle="dark-content" />
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#14b8a6" />
          <StyledText className="mt-4 text-gray-600">{t('loadingTopicEllipsis')}</StyledText>
        </View>
      </SafeAreaView>
    );
  }

  if (!topic) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        <View className="flex-1 items-center justify-center px-6">
          <StyledText className="text-lg text-gray-700">{t('topicNotFound')}</StyledText>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            className="mt-4 rounded-lg bg-teal-500 px-6 py-3">
            <StyledText className="font-semibold text-white">{t('goBack')}</StyledText>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View className="border-b border-gray-200 bg-white px-5 pb-4 pt-2">
        <View className="flex-row items-center justify-between">
          <TouchableOpacity onPress={() => navigation.goBack()} className="mr-3">
            <Ionicons name="arrow-back" size={24} color="#0f766e" />
          </TouchableOpacity>

          <View className="flex-1">
            <StyledText className="text-lg font-bold text-gray-800" numberOfLines={1}>
              {topic.title}
            </StyledText>
            {topic.category && (
              <StyledText className="text-xs text-gray-500 capitalize">{topic.category}</StyledText>
            )}
          </View>

          <TouchableOpacity>
            <Ionicons name="bookmark-outline" size={24} color="#0f766e" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Progress Bar */}
      {progressPercentage > 0 && (
        <View className="bg-white px-5 py-3 border-b border-gray-200">
          <View className="flex-row items-center justify-between mb-2">
            <StyledText className="text-xs font-semibold text-gray-600">{t('readingProgress')}</StyledText>
            <StyledText className="text-xs font-bold text-teal-600">{progressPercentage}%</StyledText>
          </View>
          <View className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <View
              className="h-full bg-teal-500 rounded-full"
              style={{ width: `${progressPercentage}%` }}
            />
          </View>
        </View>
      )}

      <ScrollView
        ref={scrollViewRef}
        onScroll={handleScroll}
        scrollEventThrottle={400}
        showsVerticalScrollIndicator={true}>
        {/* Description */}
        {topic.description && (
          <View className="border-b border-gray-200 bg-white px-5 py-4">
            <StyledText className="text-sm leading-6 text-gray-700">{topic.description}</StyledText>
          </View>
        )}

        {/* Ayahs Section */}
        {ayahs.length > 0 && (
          <>
            <View className="mb-3 mt-4 px-5">
              <View className="flex-row items-center">
                <View className="h-6 w-1 rounded-full bg-teal-500" />
                <StyledText className="ml-2 text-base font-bold text-gray-800">
                  {t('quranicVerses')} ({ayahs.length})
                </StyledText>
              </View>
            </View>

            {ayahs.map((ayah, index) => (
              <View key={`ayah-${index}`} className="mb-3 bg-white px-5 py-4">
                {/* Surah Reference */}
                <View className="mb-2 flex-row items-center">
                  <View className="rounded-full bg-teal-100 px-3 py-1">
                    <StyledText className="text-xs font-semibold text-teal-700">
                      {t('surah')} {ayah.surah_number}:{ayah.ayah_number}
                    </StyledText>
                  </View>
                  {ayah.surah_name && (
                    <StyledText className="ml-2 text-xs text-gray-500">{ayah.surah_name}</StyledText>
                  )}
                </View>

                {/* Arabic Text */}
                <StyledText
                  className="mb-3 text-right text-2xl leading-loose text-gray-800"
                  style={{ fontFamily: 'System' }}>
                  {ayah.ayah_arabic}
                </StyledText>

                {/* Translation */}
                {ayah.translation && (
                  <StyledText className="mb-2 text-sm leading-6 text-gray-700">{ayah.translation}</StyledText>
                )}

                {/* Notes */}
                {ayah.notes && (
                  <View className="mt-2 rounded-lg bg-amber-50 p-3">
                    <StyledText className="text-xs font-semibold text-amber-800">📝 {t('note')}</StyledText>
                    <StyledText className="mt-1 text-xs leading-5 text-amber-700">{ayah.notes}</StyledText>
                  </View>
                )}
              </View>
            ))}
          </>
        )}

        {/* Hadiths Section */}
        {hadiths.length > 0 && (
          <>
            <View className="mb-3 mt-4 px-5">
              <View className="flex-row items-center">
                <View className="h-6 w-1 rounded-full bg-emerald-500" />
                <StyledText className="ml-2 text-base font-bold text-gray-800">
                  {t('hadith')} ({hadiths.length})
                </StyledText>
              </View>
            </View>

            {hadiths.map((hadith, index) => (
              <View key={`hadith-${index}`} className="mb-3 bg-white px-5 py-4">
                {/* Hadith Source */}
                <View className="mb-2 flex-row items-center">
                  <View className="rounded-full bg-emerald-100 px-3 py-1">
                    <StyledText className="text-xs font-semibold text-emerald-700">
                      {hadith.source || t('hadith')}
                    </StyledText>
                  </View>
                  {hadith.reference && (
                    <StyledText className="ml-2 text-xs text-gray-500">{hadith.reference}</StyledText>
                  )}
                </View>

                {/* Arabic Text (if available) */}
                {hadith.hadith_arabic && (
                  <StyledText
                    className="mb-3 text-right text-lg leading-loose text-gray-800"
                    style={{ fontFamily: 'System' }}>
                    {hadith.hadith_arabic}
                  </StyledText>
                )}

                {/* English Translation */}
                {hadith.hadith_english && (
                  <StyledText className="mb-2 text-sm leading-6 text-gray-700">
                    {hadith.hadith_english}
                  </StyledText>
                )}

                {/* Notes */}
                {hadith.notes && (
                  <View className="mt-2 rounded-lg bg-blue-50 p-3">
                    <StyledText className="text-xs font-semibold text-blue-800">💡 {t('explanation')}</StyledText>
                    <StyledText className="mt-1 text-xs leading-5 text-blue-700">{hadith.notes}</StyledText>
                  </View>
                )}
              </View>
            ))}
          </>
        )}

        {/* Empty State */}
        {ayahs.length === 0 && hadiths.length === 0 && !topic.description && (
          <View className="flex-1 items-center justify-center px-6 py-12">
            <StyledText className="text-center text-base text-gray-600">
              {t('noContentForTopic')}
            </StyledText>
          </View>
        )}

        {/* Footer Spacing */}
        <View className="h-8" />
      </ScrollView>
    </SafeAreaView>
  );
}