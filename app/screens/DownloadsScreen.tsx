import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { useDownloads } from '../context/DownloadsContext';
import { useCustomAlert } from '../context/CustomAlertContext';
import StyledText from '../components/StyledText';

interface Edition {
  identifier: string;
  language: string;
  name: string;
  englishName: string;
  format: string;
  type: string;
}

interface ReciterInfo {
  identifier: string;
  name: string;
  englishName: string;
  downloadedCount: number;
  totalCount: number;
}

interface TranslationInfo {
  identifier: string;
  name: string;
  language: string;
  isDownloaded: boolean;
}

export default function DownloadsScreen({ navigation }) {
  const { colors } = useTheme();
  const { t } = useLanguage();
  const { getDownloadedSurahsForReciter, totalStorageUsed, refreshDownloads } = useDownloads();
  const { showAlert } = useCustomAlert();

  // State for section expansion
  const [isRecitersExpanded, setIsRecitersExpanded] = useState(true);
  const [isTranslationsExpanded, setIsTranslationsExpanded] = useState(true);

  // State for loading
  const [loading, setLoading] = useState(true);

  // State for reciters data
  const [reciters, setReciters] = useState<ReciterInfo[]>([]);

  // State for translations data
  const [translations, setTranslations] = useState<TranslationInfo[]>([]);

  useEffect(() => {
    console.log('🔄 DownloadsScreen mounted, starting loadData...');
    loadData();
  }, []);

  // Refresh downloads when screen comes into focus (updates storage size)
  useFocusEffect(
    useCallback(() => {
      console.log('🔄 DownloadsScreen focused, refreshing storage...');
      refreshDownloads();

      // Also reload download counts for reciters
      const updateReciterCounts = async () => {
        const updatedReciters = await Promise.all(
          reciters.map(async (reciter) => {
            const downloadedSurahs = await getDownloadedSurahsForReciter(reciter.identifier);
            return {
              ...reciter,
              downloadedCount: downloadedSurahs.length,
            };
          })
        );
        setReciters(updatedReciters);
      };

      if (reciters.length > 0) {
        updateReciterCounts();
      }
    }, [reciters])
  );

  // Hardcoded popular reciters as fallback (works offline, instant load)
  const POPULAR_RECITERS = [
    { identifier: 'ar.alafasy', englishName: 'Mishary Rashid Alafasy', name: 'مشاري راشد العفاسي' },
    { identifier: 'ar.abdullahbasfar', englishName: 'Abdullah Basfar', name: 'عبدالله بصفر' },
    { identifier: 'ar.abdurrahmaansudais', englishName: 'Abdurrahman As-Sudais', name: 'عبد الرحمن السديس' },
    { identifier: 'ar.shaatree', englishName: 'Abu Bakr Al-Shatri', name: 'أبو بكر الشاطري' },
    { identifier: 'ar.ahmedajamy', englishName: 'Ahmed Al-Ajamy', name: 'أحمد العجمي' },
    { identifier: 'ar.husary', englishName: 'Mahmoud Khalil Al-Hussary', name: 'محمود خليل الحصري' },
    { identifier: 'ar.minshawi', englishName: 'Mohamed Siddiq Al-Minshawi', name: 'محمد صديق المنشاوي' },
    { identifier: 'ar.muhammadayyoub', englishName: 'Muhammad Ayyub', name: 'محمد أيوب' },
    { identifier: 'ar.mahermuaiqly', englishName: 'Maher Al-Muaiqly', name: 'ماهر المعيقلي' },
    { identifier: 'ar.hanirifai', englishName: 'Hani Ar-Rifai', name: 'هاني الرفاعي' },
  ];

  const POPULAR_TRANSLATIONS = [
    { identifier: 'en.sahih', name: 'Saheeh International', language: 'English' },
    { identifier: 'en.yusufali', name: 'Yusuf Ali', language: 'English' },
    { identifier: 'ur.jalandhry', name: 'Fateh Muhammad Jalandhri', language: 'Urdu' },
    { identifier: 'ur.jawadi', name: 'Syed Zeeshan Haider Jawadi', language: 'Urdu' },
  ];

  const loadData = async () => {
    try {
      setLoading(true);
      console.log('📥 Fetching editions from API...');

      // Fetch editions from API with longer timeout (large response)
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

      const response = await fetch('https://api.alquran.cloud/v1/edition', {
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      console.log('📡 API response received, status:', response.status);
      const data = await response.json();

      console.log('📦 API Response:', { code: data.code, dataLength: data.data?.length });

      if (data.code === 200 && data.data) {
        const editions: Edition[] = data.data;

        // Filter Arabic audio reciters
        const audioEditions = editions.filter(
          (edition) => edition.format === 'audio' && edition.language === 'ar' && edition.type !== 'translation'
        );

        console.log('🎵 Found audio reciters:', audioEditions.length);

        // Filter text translations (English and Urdu)
        const textTranslations = editions.filter(
          (edition) =>
            edition.format === 'text' &&
            edition.type === 'translation' &&
            (edition.language === 'en' || edition.language === 'ur')
        );

        console.log('📚 Found translations:', textTranslations.length);

        // Load downloaded counts for reciters
        const recitersWithCounts = await Promise.all(
          audioEditions.map(async (reciter) => {
            try {
              const downloadedSurahs = await getDownloadedSurahsForReciter(reciter.identifier);
              return {
                identifier: reciter.identifier,
                name: reciter.name,
                englishName: reciter.englishName,
                downloadedCount: downloadedSurahs.length,
                totalCount: 114,
              };
            } catch (err) {
              console.error('Error loading surah count for reciter:', reciter.identifier, err);
              return {
                identifier: reciter.identifier,
                name: reciter.name,
                englishName: reciter.englishName,
                downloadedCount: 0,
                totalCount: 114,
              };
            }
          })
        );

        // Prepare translations info
        const translationsInfo: TranslationInfo[] = textTranslations.map((trans) => ({
          identifier: trans.identifier,
          name: trans.englishName,
          language: trans.language === 'en' ? 'English' : 'Urdu',
          isDownloaded: false, // TODO: Check if actually downloaded
        }));

        console.log('✅ Setting reciters:', recitersWithCounts.length);
        console.log('✅ Setting translations:', translationsInfo.length);

        setReciters(recitersWithCounts);
        setTranslations(translationsInfo);
      } else {
        console.error('❌ API returned invalid response:', data);
        showAlert(t('error'), 'Invalid API response', 'error');
      }
    } catch (error: any) {
      console.error('❌ Failed to load downloads data:', error);

      // Use hardcoded fallback data
      console.log('🔄 Using hardcoded popular reciters as fallback');

      try {
        // Load download counts for hardcoded reciters
        const recitersWithCounts = await Promise.all(
          POPULAR_RECITERS.map(async (reciter) => {
            try {
              const downloadedSurahs = await getDownloadedSurahsForReciter(reciter.identifier);
              return {
                identifier: reciter.identifier,
                name: reciter.name,
                englishName: reciter.englishName,
                downloadedCount: downloadedSurahs.length,
                totalCount: 114,
              };
            } catch (err) {
              return {
                identifier: reciter.identifier,
                name: reciter.name,
                englishName: reciter.englishName,
                downloadedCount: 0,
                totalCount: 114,
              };
            }
          })
        );

        const translationsInfo: TranslationInfo[] = POPULAR_TRANSLATIONS.map((trans) => ({
          identifier: trans.identifier,
          name: trans.name,
          language: trans.language,
          isDownloaded: false,
        }));

        setReciters(recitersWithCounts);
        setTranslations(translationsInfo);

        console.log('✅ Loaded fallback data:', {
          reciters: recitersWithCounts.length,
          translations: translationsInfo.length
        });
      } catch (fallbackError) {
        console.error('❌ Even fallback failed:', fallbackError);
        if (error.name === 'AbortError') {
          showAlert(t('error'), 'Using offline mode with popular reciters only.', 'info');
        } else {
          showAlert(t('error'), 'Failed to load data. Showing popular reciters only.', 'error');
        }
      }
    } finally {
      setLoading(false);
      console.log('✅ Loading complete - setting loading to false');
    }
  };

  const handleReciterClick = (reciter: ReciterInfo) => {
    // Navigate to ReciterSurahsScreen
    navigation.navigate('ReciterSurahs', {
      reciter: {
        identifier: reciter.identifier,
        englishName: reciter.englishName,
        name: reciter.name,
      },
    });
  };

  const formatStorageSize = (bytes: number): string => {
    const mb = bytes / 1024 / 1024;
    const gb = mb / 1024;
    return gb >= 1 ? `${gb.toFixed(2)} GB` : `${mb.toFixed(1)} MB`;
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        <StatusBar barStyle="dark-content" backgroundColor={colors.background} />

        {/* Header */}
        <View className="flex-row items-center border-b border-gray-100 bg-white px-4 py-4">
          <TouchableOpacity
            className="h-10 w-10 items-center justify-center"
            onPress={() => navigation?.goBack()}>
            <Ionicons name="chevron-back" size={28} color="#333" />
          </TouchableOpacity>
          <StyledText className="ml-2 text-lg font-bold text-gray-900">{t('downloads')}</StyledText>
        </View>

        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={colors.primary} />
          <StyledText className="mt-4 text-sm text-gray-500">Loading downloads...</StyledText>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />

      {/* Header */}
      <View className="flex-row items-center border-b border-gray-100 bg-white px-4 py-4">
        <TouchableOpacity
          className="h-10 w-10 items-center justify-center"
          onPress={() => navigation?.goBack()}>
          <Ionicons name="chevron-back" size={28} color="#333" />
        </TouchableOpacity>
        <View className="flex-1">
          <StyledText className="ml-2 text-lg font-bold text-gray-900">{t('downloads')}</StyledText>
          {totalStorageUsed > 0 && (
            <StyledText className="ml-2 text-xs text-gray-500">
              Storage used: {formatStorageSize(totalStorageUsed)}
            </StyledText>
          )}
        </View>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Reciters Section */}
        <View className="mt-6 px-6">
          <TouchableOpacity
            className="mb-4 flex-row items-center justify-between"
            onPress={() => setIsRecitersExpanded(!isRecitersExpanded)}
            activeOpacity={0.7}>
            <View className="flex-row items-center">
              <Ionicons name="mic-outline" size={20} color="#6B7280" />
              <StyledText className="ml-2 text-base font-bold text-gray-900">{t('reciters')}</StyledText>
            </View>
            <Ionicons
              name={isRecitersExpanded ? 'chevron-up' : 'chevron-down'}
              size={20}
              color="#6B7280"
            />
          </TouchableOpacity>

          {isRecitersExpanded && (
            <View className="mb-6 space-y-4">
              {/* Downloaded Reciters */}
              {reciters.filter(r => r.downloadedCount > 0).length > 0 && (
                <View className="overflow-hidden rounded-xl border border-gray-200 bg-white">
                  <View className="border-b border-gray-100 bg-green-50 px-4 py-2">
                    <StyledText className="text-xs font-semibold text-green-700">
                      ✓ {t('downloaded')} ({reciters.filter(r => r.downloadedCount > 0).length})
                    </StyledText>
                  </View>

                  {reciters
                    .filter(r => r.downloadedCount > 0)
                    .map((reciter, index, arr) => (
                      <TouchableOpacity
                        key={reciter.identifier}
                        onPress={() => handleReciterClick(reciter)}
                        activeOpacity={0.7}>
                        <View className="flex-row items-center justify-between px-4 py-4">
                          <View className="mr-4 flex-1">
                            <StyledText className="mb-1 text-base font-medium text-gray-900">
                              {reciter.englishName}
                            </StyledText>
                            <StyledText className="text-sm text-gray-500">
                              {reciter.downloadedCount} / {reciter.totalCount} surahs
                            </StyledText>
                          </View>

                          {reciter.downloadedCount === 114 ? (
                            <View className="h-6 w-6 items-center justify-center rounded-full bg-green-600">
                              <Ionicons name="checkmark" size={16} color="#fff" />
                            </View>
                          ) : (
                            <View className="items-center">
                              <View className="h-8 w-8 items-center justify-center rounded-full bg-blue-50">
                                <StyledText className="text-xs font-semibold text-blue-600">
                                  {reciter.downloadedCount}
                                </StyledText>
                              </View>
                            </View>
                          )}
                        </View>

                        {index < arr.length - 1 && (
                          <View className="mx-4 border-t border-gray-100" />
                        )}
                      </TouchableOpacity>
                    ))}
                </View>
              )}

              {/* Available Reciters */}
              {reciters.filter(r => r.downloadedCount === 0).length > 0 && (
                <View className="overflow-hidden rounded-xl border border-gray-200 bg-white">
                  <View className="border-b border-gray-100 bg-blue-50 px-4 py-2">
                    <StyledText className="text-xs font-semibold text-blue-700">
                      📥 Available to Download ({reciters.filter(r => r.downloadedCount === 0).length})
                    </StyledText>
                  </View>

                  {reciters
                    .filter(r => r.downloadedCount === 0)
                    .map((reciter, index, arr) => (
                      <TouchableOpacity
                        key={reciter.identifier}
                        onPress={() => handleReciterClick(reciter)}
                        activeOpacity={0.7}>
                        <View className="flex-row items-center justify-between px-4 py-4">
                          <View className="mr-4 flex-1">
                            <StyledText className="mb-1 text-base font-medium text-gray-900">
                              {reciter.englishName}
                            </StyledText>
                            <StyledText className="text-sm text-gray-500">
                              {reciter.downloadedCount} / {reciter.totalCount} surahs
                            </StyledText>
                          </View>

                          <Ionicons name="cloud-download-outline" size={24} color="#3B82F6" />
                        </View>

                        {index < arr.length - 1 && (
                          <View className="mx-4 border-t border-gray-100" />
                        )}
                      </TouchableOpacity>
                    ))}
                </View>
              )}
            </View>
          )}
        </View>

        {/* Translations Section */}
        <View className="px-6 pb-8">
          <TouchableOpacity
            className="mb-4 flex-row items-center justify-between"
            onPress={() => setIsTranslationsExpanded(!isTranslationsExpanded)}
            activeOpacity={0.7}>
            <View className="flex-row items-center">
              <Ionicons name="language-outline" size={20} color="#6B7280" />
              <StyledText className="ml-2 text-base font-bold text-gray-900">{t('translations')}</StyledText>
            </View>
            <Ionicons
              name={isTranslationsExpanded ? 'chevron-up' : 'chevron-down'}
              size={20}
              color="#6B7280"
            />
          </TouchableOpacity>

          {isTranslationsExpanded && (
            <View className="space-y-4">
              {/* Downloaded Translations */}
              {translations.filter(t => t.isDownloaded).length > 0 && (
                <View className="overflow-hidden rounded-xl border border-gray-200 bg-white">
                  <View className="border-b border-gray-100 bg-green-50 px-4 py-2">
                    <StyledText className="text-xs font-semibold text-green-700">
                      ✓ {t('downloaded')} ({translations.filter(t => t.isDownloaded).length})
                    </StyledText>
                  </View>

                  {(() => {
                    const downloadedTranslations = translations.filter(t => t.isDownloaded);
                    const groupedTranslations = downloadedTranslations.reduce((acc, translation) => {
                      if (!acc[translation.language]) {
                        acc[translation.language] = [];
                      }
                      acc[translation.language].push(translation);
                      return acc;
                    }, {} as Record<string, TranslationInfo[]>);

                    const languages = Object.keys(groupedTranslations);

                    return languages.map((language, langIndex) => (
                      <View key={language}>
                        {/* Language Section Header */}
                        <View className="bg-green-50 px-4 py-3">
                          <StyledText className="text-sm font-semibold text-gray-700">{language}</StyledText>
                        </View>

                        {/* Translations for this language */}
                        {groupedTranslations[language].map((translation, index) => {
                          const isLast =
                            langIndex === languages.length - 1 &&
                            index === groupedTranslations[language].length - 1;
                          return (
                            <View key={translation.identifier}>
                              <View className="flex-row items-center justify-between px-4 py-4">
                                <View className="mr-4 flex-1">
                                  <StyledText className="mb-1 text-base font-medium text-gray-900">
                                    {translation.name}
                                  </StyledText>
                                  <StyledText className="text-xs text-gray-500">
                                    {translation.identifier}
                                  </StyledText>
                                </View>

                                <View className="h-6 w-6 items-center justify-center rounded-full bg-green-600">
                                  <Ionicons name="checkmark" size={16} color="#fff" />
                                </View>
                              </View>

                              {!isLast && <View className="mx-4 border-t border-gray-100" />}
                            </View>
                          );
                        })}
                      </View>
                    ));
                  })()}
                </View>
              )}

              {/* Available Translations */}
              {translations.filter(t => !t.isDownloaded).length > 0 && (
                <View className="overflow-hidden rounded-xl border border-gray-200 bg-white">
                  <View className="border-b border-gray-100 bg-blue-50 px-4 py-2">
                    <StyledText className="text-xs font-semibold text-blue-700">
                      📥 Available to Download ({translations.filter(t => !t.isDownloaded).length})
                    </StyledText>
                  </View>

                  {(() => {
                    const availableTranslations = translations.filter(t => !t.isDownloaded);
                    const groupedTranslations = availableTranslations.reduce((acc, translation) => {
                      if (!acc[translation.language]) {
                        acc[translation.language] = [];
                      }
                      acc[translation.language].push(translation);
                      return acc;
                    }, {} as Record<string, TranslationInfo[]>);

                    const languages = Object.keys(groupedTranslations);

                    return languages.map((language, langIndex) => (
                      <View key={language}>
                        {/* Language Section Header */}
                        <View className="bg-blue-50 px-4 py-3">
                          <StyledText className="text-sm font-semibold text-gray-700">{language}</StyledText>
                        </View>

                        {/* Translations for this language */}
                        {groupedTranslations[language].map((translation, index) => {
                          const isLast =
                            langIndex === languages.length - 1 &&
                            index === groupedTranslations[language].length - 1;
                          return (
                            <View key={translation.identifier}>
                              <View className="flex-row items-center justify-between px-4 py-4">
                                <View className="mr-4 flex-1">
                                  <StyledText className="mb-1 text-base font-medium text-gray-900">
                                    {translation.name}
                                  </StyledText>
                                  <StyledText className="text-xs text-gray-500">
                                    {translation.identifier}
                                  </StyledText>
                                </View>

                                <StyledText className="text-xs text-blue-600 font-medium">Text only</StyledText>
                              </View>

                              {!isLast && <View className="mx-4 border-t border-gray-100" />}
                            </View>
                          );
                        })}
                      </View>
                    ));
                  })()}
                </View>
              )}
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}