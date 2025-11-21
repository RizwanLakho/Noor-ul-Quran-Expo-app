import React, { useState } from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import StyledText from '../components/StyledText';

export default function DownloadsScreen({ navigation }) {
  const { colors } = useTheme();
  const { t } = useLanguage();
  // State for section expansion
  const [isRecitersExpanded, setIsRecitersExpanded] = useState(true);
  const [isTranslationsExpanded, setIsTranslationsExpanded] = useState(true);

  // State for reciters data
  const [reciters, setReciters] = useState([
    {
      id: 1,
      name: 'Abdul Basit Abd us-Samad',
      subtitle: 'Mujawwad',
      size: '800 MB',
      isDownloaded: true,
      isDownloading: false,
      progress: 100,
    },
    {
      id: 2,
      name: 'Abdul Basit Abd us-Samad',
      subtitle: 'Mujawwad',
      size: '750 MB',
      isDownloaded: false,
      isDownloading: false,
      progress: 0,
    },
    {
      id: 3,
      name: 'Abdul Basit Abd us-Samad',
      subtitle: 'Mujawwad',
      size: '820 MB',
      isDownloaded: false,
      isDownloading: false,
      progress: 0,
    },
    {
      id: 4,
      name: 'Abdul Basit Abd us-Samad',
      subtitle: 'Murattal',
      size: '650 MB',
      isDownloaded: false,
      isDownloading: false,
      progress: 0,
    },
    {
      id: 5,
      name: 'Abdul-Rahman Al-Sudais',
      subtitle: '643.8 MB',
      size: '643.8 MB',
      isDownloaded: false,
      isDownloading: false,
      progress: 0,
    },
    {
      id: 6,
      name: 'Maher Al-Muaiqly',
      subtitle: '521.0 MB',
      size: '521.0 MB',
      isDownloaded: false,
      isDownloading: false,
      progress: 0,
    },
    {
      id: 7,
      name: 'Mahmoud Husary',
      subtitle: 'Mualim',
      size: '720 MB',
      isDownloaded: false,
      isDownloading: false,
      progress: 0,
    },
    {
      id: 8,
      name: 'Mahmoud Husary',
      subtitle: 'Murattal',
      size: '680 MB',
      isDownloaded: false,
      isDownloading: false,
      progress: 0,
    },
  ]);

  // State for translations data
  const [translations, setTranslations] = useState([
    {
      id: 1,
      name: 'Dr. Mustafa Khattab, The Clear Quran',
      language: 'English',
      size: '12 MB',
      isDownloaded: true,
      isDownloading: false,
      progress: 100,
    },
    {
      id: 2,
      name: 'Molana Sayyid Abul Ala Maududi',
      language: 'English',
      size: '14 MB',
      isDownloaded: false,
      isDownloading: false,
      progress: 0,
    },
    {
      id: 3,
      name: 'Dr. Mustafa Khattab, The Clear Quran',
      language: 'English',
      size: '12 MB',
      isDownloaded: false,
      isDownloading: false,
      progress: 0,
    },
    {
      id: 4,
      name: 'Sayyid Abul Ala Maududi',
      language: 'English',
      size: '14 MB',
      isDownloaded: false,
      isDownloading: false,
      progress: 0,
    },
    {
      id: 5,
      name: 'Professor Shaykh Hasan Al-Fatih Qaribullah',
      language: 'English',
      size: '11 MB',
      isDownloaded: false,
      isDownloading: false,
      progress: 0,
    },
    {
      id: 6,
      name: 'Rowwad Translation Center',
      language: 'English',
      size: '13 MB',
      isDownloaded: false,
      isDownloading: false,
      progress: 0,
    },
    {
      id: 7,
      name: 'Bayan Al-Quran (Dr. Israr Ahmad)',
      language: 'Urdu',
      size: '15 MB',
      isDownloaded: false,
      isDownloading: false,
      progress: 0,
    },
    {
      id: 8,
      name: 'Fatih Muhammad Jalandri',
      language: 'Urdu',
      size: '14 MB',
      isDownloaded: false,
      isDownloading: false,
      progress: 0,
    },
    {
      id: 9,
      name: 'Maulana Muhammad Jhana',
      language: 'Urdu',
      size: '13 MB',
      isDownloaded: false,
      isDownloading: false,
      progress: 0,
    },
  ]);

  // Handle reciter download
  const handleReciterDownload = (id) => {
    // TODO: Connect to backend API for download

    // Simulate download
    setReciters((prevReciters) =>
      prevReciters.map((reciter) =>
        reciter.id === id ? { ...reciter, isDownloading: true, progress: 0 } : reciter
      )
    );

    // Simulate download progress (remove in production)
    simulateDownload(id, 'reciter');
  };

  // Handle translation download
  const handleTranslationDownload = (id) => {
    // TODO: Connect to backend API for download

    // Simulate download
    setTranslations((prevTranslations) =>
      prevTranslations.map((translation) =>
        translation.id === id ? { ...translation, isDownloading: true, progress: 0 } : translation
      )
    );

    // Simulate download progress (remove in production)
    simulateDownload(id, 'translation');
  };

  // Simulate download progress (remove in production)
  const simulateDownload = (id, type) => {
    let progress = 0;
    const interval = setInterval(() => {
      progress += 10;

      if (type === 'reciter') {
        setReciters((prevReciters) =>
          prevReciters.map((reciter) => (reciter.id === id ? { ...reciter, progress } : reciter))
        );
      } else {
        setTranslations((prevTranslations) =>
          prevTranslations.map((translation) =>
            translation.id === id ? { ...translation, progress } : translation
          )
        );
      }

      if (progress >= 100) {
        clearInterval(interval);
        if (type === 'reciter') {
          setReciters((prevReciters) =>
            prevReciters.map((reciter) =>
              reciter.id === id ? { ...reciter, isDownloading: false, isDownloaded: true } : reciter
            )
          );
        } else {
          setTranslations((prevTranslations) =>
            prevTranslations.map((translation) =>
              translation.id === id
                ? { ...translation, isDownloading: false, isDownloaded: true }
                : translation
            )
          );
        }
      }
    }, 300);
  };

  // Get downloaded count
  const downloadedRecitersCount = reciters.filter((r) => r.isDownloaded).length;
  const downloadedTranslationsCount = translations.filter((t) => t.isDownloaded).length;

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
            <View className="mb-6 overflow-hidden rounded-xl border border-gray-200 bg-white">
              {/* Downloaded label */}
              <View className="border-b border-gray-100 bg-gray-50 px-4 py-2">
                <StyledText className="text-xs font-medium text-gray-500">{t('downloaded')}</StyledText>
              </View>

              {/* Reciters List */}
              {reciters.map((reciter, index) => (
                <View key={reciter.id}>
                  <View className="flex-row items-center justify-between px-4 py-4">
                    <View className="mr-4 flex-1">
                      <StyledText className="mb-1 text-base font-medium text-gray-900">
                        {reciter.name}
                      </StyledText>
                      <StyledText className="text-sm text-gray-500">{reciter.subtitle}</StyledText>
                    </View>

                    {reciter.isDownloaded ? (
                      <View className="h-6 w-6 items-center justify-center rounded-full bg-blue-600">
                        <Ionicons name="checkmark" size={16} color="#fff" />
                      </View>
                    ) : reciter.isDownloading ? (
                      <View className="items-center">
                        <ActivityIndicator size="small" color="#3B82F6" />
                      </View>
                    ) : (
                      <TouchableOpacity
                        onPress={() => handleReciterDownload(reciter.id)}
                        className="flex-row items-center">
                        <Ionicons name="download-outline" size={18} color="#9CA3AF" />
                        <StyledText className="ml-1 text-xs text-gray-400">{t('download')}</StyledText>
                      </TouchableOpacity>
                    )}
                  </View>

                  {index < reciters.length - 1 && (
                    <View className="mx-4 border-t border-gray-100" />
                  )}
                </View>
              ))}
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
            <View className="overflow-hidden rounded-xl border border-gray-200 bg-white">
              {/* Downloaded label */}
              <View className="border-b border-gray-100 bg-gray-50 px-4 py-2">
                <StyledText className="text-xs font-medium text-gray-500">{t('downloaded')}</StyledText>
              </View>

              {/* Group translations by language */}
              {(() => {
                const groupedTranslations = translations.reduce((acc, translation) => {
                  if (!acc[translation.language]) {
                    acc[translation.language] = [];
                  }
                  acc[translation.language].push(translation);
                  return acc;
                }, {});

                const languages = Object.keys(groupedTranslations);
                let itemIndex = 0;

                return languages.map((language, langIndex) => (
                  <View key={language}>
                    {/* Language Section Header */}
                    <View className="border-b border-gray-100 bg-gray-50 px-4 py-2">
                      <StyledText className="text-xs font-medium text-gray-500">{t('availableDownloads')}</StyledText>
                    </View>

                    <View className="bg-blue-50 px-4 py-2">
                      <StyledText className="text-sm font-semibold text-gray-700">{language}</StyledText>
                    </View>

                    {/* Translations for this language */}
                    {groupedTranslations[language].map((translation, index) => {
                      const isLast =
                        langIndex === languages.length - 1 &&
                        index === groupedTranslations[language].length - 1;
                      return (
                        <View key={translation.id}>
                          <View className="flex-row items-center justify-between px-4 py-4">
                            <View className="mr-4 flex-1">
                              <StyledText className="mb-1 text-base font-medium text-gray-900">
                                {translation.name}
                              </StyledText>
                              <StyledText className="text-sm text-gray-500">{translation.size}</StyledText>
                            </View>

                            {translation.isDownloaded ? (
                              <View className="h-6 w-6 items-center justify-center rounded-full bg-blue-600">
                                <Ionicons name="checkmark" size={16} color="#fff" />
                              </View>
                            ) : translation.isDownloading ? (
                              <View className="items-center">
                                <ActivityIndicator size="small" color="#3B82F6" />
                              </View>
                            ) : (
                              <TouchableOpacity
                                onPress={() => handleTranslationDownload(translation.id)}
                                className="flex-row items-center">
                                <Ionicons name="download-outline" size={18} color="#9CA3AF" />
                                <StyledText className="ml-1 text-xs text-gray-400">{t('download')}</StyledText>
                              </TouchableOpacity>
                            )}
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
      </ScrollView>
    </SafeAreaView>
  );
}