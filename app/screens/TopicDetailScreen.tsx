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
import { useTheme } from '../context/ThemeContext';
import StyledText from '../components/StyledText';

export default function TopicDetailScreen({ route, navigation }: any) {
  const { topicId, topicTitle } = route.params;
  const { showAlert } = useCustomAlert();
  const { quranAppearance } = useSettings();
  const { t } = useLanguage();
  const { colors, isDark } = useTheme();

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
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
        <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={colors.primary} />
          <StyledText style={{ marginTop: 16, color: colors.textSecondary }}>{t('loadingTopicEllipsis')}</StyledText>
        </View>
      </SafeAreaView>
    );
  }

  if (!topic) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
        <View className="flex-1 items-center justify-center px-6">
          <StyledText style={{ fontSize: 18, color: colors.text }}>{t('topicNotFound')}</StyledText>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={{ marginTop: 16, borderRadius: 8, backgroundColor: colors.primary, paddingHorizontal: 24, paddingVertical: 12 }}>
            <StyledText style={{ fontWeight: '600', color: '#FFFFFF' }}>{t('goBack')}</StyledText>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['top']}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />

      {/* Header */}
      <View style={{ borderBottomWidth: 1, borderBottomColor: colors.border, backgroundColor: colors.surface, paddingHorizontal: 20, paddingVertical: 16 }}>
        <View className="flex-row items-center justify-between">
          <TouchableOpacity onPress={() => navigation.goBack()} className="mr-3">
            <Ionicons name="arrow-back" size={24} color={colors.primary} />
          </TouchableOpacity>

          <View className="flex-1">
            <StyledText style={{ fontSize: 18, fontWeight: 'bold', color: colors.text }} numberOfLines={1}>
              {topic.title}
            </StyledText>
            {topic.category && (
              <StyledText style={{ fontSize: 12, color: colors.textSecondary, textTransform: 'capitalize' }}>{topic.category}</StyledText>
            )}
          </View>

          <TouchableOpacity>
            <Ionicons name="bookmark-outline" size={24} color={colors.primary} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Progress Bar */}
      {progressPercentage > 0 && (
        <View style={{ backgroundColor: colors.surface, paddingHorizontal: 20, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: colors.border }}>
          <View className="flex-row items-center justify-between mb-2">
            <StyledText style={{ fontSize: 12, fontWeight: '600', color: colors.textSecondary }}>{t('readingProgress')}</StyledText>
            <StyledText style={{ fontSize: 12, fontWeight: 'bold', color: colors.primary }}>{progressPercentage}%</StyledText>
          </View>
          <View style={{ height: 8, backgroundColor: colors.border, borderRadius: 4, overflow: 'hidden' }}>
            <View
              style={{
                height: '100%',
                backgroundColor: colors.primary,
                borderRadius: 4,
                width: `${progressPercentage}%`,
              }}
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
          <View style={{ borderBottomWidth: 1, borderBottomColor: colors.border, backgroundColor: colors.surface, paddingHorizontal: 20, paddingVertical: 16 }}>
            <StyledText style={{ fontSize: 14, lineHeight: 24, color: colors.text }}>{topic.description}</StyledText>
          </View>
        )}

        {/* Ayahs Section */}
        {ayahs.length > 0 && (
          <>
            <View style={{ marginBottom: 12, marginTop: 16, paddingHorizontal: 20 }}>
              <View className="flex-row items-center">
                <View style={{ height: 24, width: 4, borderRadius: 2, backgroundColor: colors.primary }} />
                <StyledText style={{ marginLeft: 8, fontSize: 16, fontWeight: 'bold', color: colors.text }}>
                  {t('quranicVerses')} ({ayahs.length})
                </StyledText>
              </View>
            </View>

            {ayahs.map((ayah, index) => (
              <View key={`ayah-${index}`} style={{ marginBottom: 12, backgroundColor: colors.surface, paddingHorizontal: 20, paddingVertical: 16 }}>
                {/* Surah Reference */}
                <View style={{ marginBottom: 8, flexDirection: 'row', alignItems: 'center' }}>
                  <View style={{ borderRadius: 50, backgroundColor: isDark ? 'rgba(20, 184, 166, 0.2)' : 'rgba(20, 184, 166, 0.1)', paddingHorizontal: 12, paddingVertical: 4 }}>
                    <StyledText style={{ fontSize: 12, fontWeight: '600', color: colors.primary }}>
                      {t('surah')} {ayah.surah_number}:{ayah.ayah_number}
                    </StyledText>
                  </View>
                  {ayah.surah_name && (
                    <StyledText style={{ marginLeft: 8, fontSize: 12, color: colors.textSecondary }}>{ayah.surah_name}</StyledText>
                  )}
                </View>

                {/* Arabic Text */}
                <StyledText
                  style={{
                    marginBottom: 12,
                    textAlign: 'right',
                    fontSize: 28,
                    lineHeight: 44,
                    color: colors.text,
                    fontFamily: 'System',
                  }}>
                  {ayah.ayah_arabic}
                </StyledText>

                {/* Translation */}
                {ayah.translation && (
                  <StyledText style={{ marginBottom: 8, fontSize: 14, lineHeight: 24, color: colors.text }}>{ayah.translation}</StyledText>
                )}

                {/* Notes */}
                {ayah.notes && (
                  <View style={{ marginTop: 8, borderRadius: 8, backgroundColor: isDark ? 'rgba(245, 158, 11, 0.1)' : 'rgba(245, 158, 11, 0.05)', padding: 12 }}>
                    <StyledText style={{ fontSize: 12, fontWeight: '600', color: isDark ? '#FBBF24' : '#92400e' }}>📝 {t('note')}</StyledText>
                    <StyledText style={{ marginTop: 8, fontSize: 12, lineHeight: 20, color: isDark ? '#FCD34D' : '#B45309' }}>{ayah.notes}</StyledText>
                  </View>
                )}
              </View>
            ))}
          </>
        )}

        {/* Hadiths Section */}
        {hadiths.length > 0 && (
          <>
            <View style={{ marginBottom: 12, marginTop: 16, paddingHorizontal: 20 }}>
              <View className="flex-row items-center">
                <View style={{ height: 24, width: 4, borderRadius: 2, backgroundColor: colors.success }} />
                <StyledText style={{ marginLeft: 8, fontSize: 16, fontWeight: 'bold', color: colors.text }}>
                  {t('hadith')} ({hadiths.length})
                </StyledText>
              </View>
            </View>

            {hadiths.map((hadith, index) => (
              <View key={`hadith-${index}`} style={{ marginBottom: 12, backgroundColor: colors.surface, paddingHorizontal: 20, paddingVertical: 16 }}>
                {/* Hadith Source */}
                <View style={{ marginBottom: 8, flexDirection: 'row', alignItems: 'center' }}>
                  <View style={{ borderRadius: 50, backgroundColor: isDark ? 'rgba(16, 185, 129, 0.2)' : 'rgba(16, 185, 129, 0.1)', paddingHorizontal: 12, paddingVertical: 4 }}>
                    <StyledText style={{ fontSize: 12, fontWeight: '600', color: colors.success }}>
                      {hadith.source || t('hadith')}
                    </StyledText>
                  </View>
                  {hadith.reference && (
                    <StyledText style={{ marginLeft: 8, fontSize: 12, color: colors.textSecondary }}>{hadith.reference}</StyledText>
                  )}
                </View>

                {/* Arabic Text (if available) */}
                {hadith.hadith_arabic && (
                  <StyledText
                    style={{
                      marginBottom: 12,
                      textAlign: 'right',
                      fontSize: 18,
                      lineHeight: 32,
                      color: colors.text,
                      fontFamily: 'System',
                    }}>
                    {hadith.hadith_arabic}
                  </StyledText>
                )}

                {/* English Translation */}
                {hadith.hadith_english && (
                  <StyledText style={{ marginBottom: 8, fontSize: 14, lineHeight: 24, color: colors.text }}>
                    {hadith.hadith_english}
                  </StyledText>
                )}

                {/* Notes */}
                {hadith.notes && (
                  <View style={{ marginTop: 8, borderRadius: 8, backgroundColor: isDark ? 'rgba(59, 130, 246, 0.1)' : 'rgba(59, 130, 246, 0.05)', padding: 12 }}>
                    <StyledText style={{ fontSize: 12, fontWeight: '600', color: isDark ? '#60A5FA' : '#1e40af' }}>💡 {t('explanation')}</StyledText>
                    <StyledText style={{ marginTop: 8, fontSize: 12, lineHeight: 20, color: isDark ? '#93C5FD' : '#1e3a8a' }}>{hadith.notes}</StyledText>
                  </View>
                )}
              </View>
            ))}
          </>
        )}

        {/* Empty State */}
        {ayahs.length === 0 && hadiths.length === 0 && !topic.description && (
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24, paddingVertical: 48 }}>
            <StyledText style={{ textAlign: 'center', fontSize: 16, color: colors.textSecondary }}>
              {t('noContentForTopic')}
            </StyledText>
          </View>
        )}

        {/* Footer Spacing */}
        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}