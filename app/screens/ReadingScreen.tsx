import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Switch,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { useSettings } from '../context/SettingsContext';
import { useCustomAlert } from '../context/CustomAlertContext';
import Slider from '@react-native-community/slider';
import StyledText from '../components/StyledText';

export default function ReadingScreen({ navigation }) {
  const { colors } = useTheme();
  const { t } = useLanguage();
  const { quranAppearance, updateQuranAppearance } = useSettings();
  const { showAlert } = useCustomAlert();

  // State for page layout
  const [isPageLayoutExpanded, setIsPageLayoutExpanded] = useState(true);
  const [arabicVerseEnabled, setArabicVerseEnabled] = useState(true);
  const [translationEnabled, setTranslationEnabled] = useState(quranAppearance.translationEnabled);

  // State for Arabic Verse settings
  const [isArabicVerseExpanded, setIsArabicVerseExpanded] = useState(false);
  const [selectedQuranFont, setSelectedQuranFont] = useState(quranAppearance.arabicFont);
  const [arabicFontSize, setArabicFontSize] = useState(quranAppearance.textSize);

  // State for Translation settings
  const [isTranslationExpanded, setIsTranslationExpanded] = useState(false);
  const [selectedTranslation, setSelectedTranslation] = useState(
    quranAppearance.selectedTranslatorName || t('noTranslatorSelected')
  );
  const [translationFontSize, setTranslationFontSize] = useState(16);

  // State for preview
  const [isPreviewExpanded, setIsPreviewExpanded] = useState(true);

  // Sync selected translation with settings when it changes
  useEffect(() => {
    setSelectedTranslation(quranAppearance.selectedTranslatorName || t('noTranslatorSelected'));
  }, [quranAppearance.selectedTranslatorName]);

  // Quran font options
  const quranFonts = [
    { id: 1, name: t('quranicFontName'), value: 'quranic' },
    { id: 2, name: t('uthmaniFontName'), value: 'uthman' },
  ];

  // Handle save settings
  const handleSaveSettings = async () => {
    try {
      // Save to context (which saves to AsyncStorage)
      updateQuranAppearance({
        arabicFont: selectedQuranFont,
        textSize: arabicFontSize,
        translationEnabled: translationEnabled,
        // selectedTranslation, // This is just for display, not a setting to be saved directly here
        // translationFontSize // This should be part of quranAppearance if you want to save it
      });

      showAlert(t('success'), t('settingsSavedSuccess'), 'success');
    } catch (error) {
      showAlert(t('error'), t('failedToSaveSettings'), 'error');
    }
  };

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
        <StyledText className="ml-2 text-lg font-bold text-gray-900">
          {t('reading')}
        </StyledText>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Page Layout Section */}
        <View className="mt-6 px-6">
          <TouchableOpacity
            className="mb-4 flex-row items-center justify-between"
            onPress={() => setIsPageLayoutExpanded(!isPageLayoutExpanded)}
            activeOpacity={0.7}>
            <View className="flex-row items-center">
              <Ionicons name="document-text-outline" size={20} color="#6B7280" />
              <StyledText
                className="ml-2 text-base font-bold text-gray-900">
                {t('pageLayout')}
              </StyledText>
            </View>
            <Ionicons
              name={isPageLayoutExpanded ? 'chevron-up' : 'chevron-down'}
              size={20}
              color="#6B7280"
            />
          </TouchableOpacity>

          {isPageLayoutExpanded && (
            <View className="mb-6 rounded-xl border border-2 border-blue-500 bg-white p-4">
              {/* Arabic Verse Toggle */}
              <View className="mb-4 flex-row items-center justify-between">
                <StyledText
                  className="text-base font-medium text-gray-900">
                  {t('arabicVerse')}
                </StyledText>
                <Switch
                  value={arabicVerseEnabled}
                  onValueChange={setArabicVerseEnabled}
                  trackColor={{ false: '#D1D5DB', true: '#06B6D4' }}
                  thumbColor={arabicVerseEnabled ? '#fff' : '#f4f3f4'}
                />
              </View>

              {/* Divider */}
              <View className="my-4 border-t border-gray-200" />

              {/* Translation Toggle */}
              <View className="flex-row items-center justify-between">
                <StyledText
                  className="text-base font-medium text-gray-900">
                  {t('translation')}
                </StyledText>
                <Switch
                  value={translationEnabled}
                  onValueChange={setTranslationEnabled}
                  trackColor={{ false: '#D1D5DB', true: '#06B6D4' }}
                  thumbColor={translationEnabled ? '#fff' : '#f4f3f4'}
                />
              </View>
            </View>
          )}
        </View>

        {/* Arabic Verse Settings */}
        {arabicVerseEnabled && (
          <View className="mb-6 px-6">
            <TouchableOpacity
              className="mb-4 flex-row items-center justify-between"
              onPress={() => setIsArabicVerseExpanded(!isArabicVerseExpanded)}
              activeOpacity={0.7}>
              <View className="flex-row items-center">
                <StyledText className="text-base font-bold text-gray-900">
                  {t('arabicVerse')}
                </StyledText>
              </View>
              {isArabicVerseExpanded ? (
                <Ionicons name="chevron-up" size={20} color="#6B7280" />
              ) : (
                <View className="flex-row items-center">
                  <StyledText className="mr-2 text-sm text-gray-500">
                    {selectedQuranFont}
                  </StyledText>
                  <Ionicons name="chevron-down" size={20} color="#6B7280" />
                </View>
              )}
            </TouchableOpacity>

            {isArabicVerseExpanded && (
              <View className="rounded-xl border border-gray-200 bg-white p-4">
                {/* Quran Font Selection */}
                <View className="mb-4">
                  <StyledText
                    className="mb-3 text-sm font-semibold text-gray-700">
                    {t('quranFont')}
                  </StyledText>
                  <View className="flex-row gap-3">
                    {quranFonts.map((font) => (
                      <TouchableOpacity
                        key={font.id}
                        onPress={() => setSelectedQuranFont(font.value)}
                        className={`flex-1 rounded-lg border px-4 py-3 ${
                          selectedQuranFont === font.value
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-300 bg-white'
                        }`}>
                        <View className="flex-row items-center justify-center">
                          <View
                            className={`mr-2 h-4 w-4 rounded-full border-2 ${
                              selectedQuranFont === font.value
                                ? 'border-blue-500 bg-blue-500'
                                : 'border-gray-400 bg-white'
                            }`}>
                            {selectedQuranFont === font.value && (
                              <View className="m-auto h-2 w-2 rounded-full bg-white" />
                            )}
                          </View>
                          <StyledText
                            className={`text-sm font-medium ${
                              selectedQuranFont === font.value ? 'text-blue-600' : 'text-gray-700'
                            }`}>
                            {font.name}
                          </StyledText>
                        </View>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                {/* Font Size Slider */}
                <View>
                  <View className="mb-2 flex-row items-center justify-between">
                    <StyledText
                      className="text-sm font-semibold text-gray-700">
                      {t('fontSizeQuranicArabic')}
                    </StyledText>
                  </View>
                  <View className="flex-row items-center">
                    <StyledText className="mr-2 text-xs text-gray-500">حَّ</StyledText>
                    <Slider
                      style={{ flex: 1, height: 40 }}
                      minimumValue={20}
                      maximumValue={48}
                      step={1}
                      value={arabicFontSize}
                      onValueChange={setArabicFontSize}
                      minimumTrackTintColor="#06B6D4"
                      maximumTrackTintColor="#D1D5DB"
                      thumbTintColor="#06B6D4"
                    />
                    <StyledText className="font-arabic ml-2 text-base text-gray-700">العَرَبِيَّة</StyledText>
                  </View>
                </View>
              </View>
            )}
          </View>
        )}

        {/* Translation Settings */}
        {translationEnabled && (
          <View className="mb-6 px-6">
            <TouchableOpacity
              className="mb-4 flex-row items-center justify-between"
              onPress={() => setIsTranslationExpanded(!isTranslationExpanded)}
              activeOpacity={0.7}>
              <View className="flex-row items-center">
                <StyledText className="text-base font-bold text-gray-900">
                  {t('translation')}
                </StyledText>
              </View>
              {isTranslationExpanded ? (
                <Ionicons name="chevron-up" size={20} color="#6B7280" />
              ) : (
                <TouchableOpacity className="flex-row items-center">
                  <StyledText className="mr-2 text-sm text-gray-500">
                    {selectedTranslation.substring(0, 25)}...
                  </StyledText>
                  <Ionicons name="chevron-forward" size={20} color="#6B7280" />
                </TouchableOpacity>
              )}
            </TouchableOpacity>

            {isTranslationExpanded && (
              <View className="rounded-xl border border-gray-200 bg-white p-4">
                {/* Translation Selection */}
                <TouchableOpacity
                  className="mb-4 flex-row items-center justify-between"
                  onPress={() => navigation.navigate('TranslatorSelection')}>
                  <View className="flex-1">
                    <StyledText
                      className="mb-1 text-sm font-semibold text-gray-700">
                      {t('selectTranslator')}
                    </StyledText>
                    <StyledText className="text-sm text-gray-500">
                      {selectedTranslation}
                    </StyledText>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
                </TouchableOpacity>

                {/* Font Size Slider */}
                <View>
                  <View className="mb-2 flex-row items-center justify-between">
                    <StyledText
                      className="text-sm font-semibold text-gray-700">
                      {t('fontSizeTranslation')}
                    </StyledText>
                  </View>
                  <View className="flex-row items-center">
                    <StyledText className="mr-2 text-xs text-gray-500">Aa</StyledText>
                    <Slider
                      style={{ flex: 1, height: 40 }}
                      minimumValue={12}
                      maximumValue={24}
                      step={1}
                      value={translationFontSize}
                      onValueChange={setTranslationFontSize}
                      minimumTrackTintColor="#06B6D4"
                      maximumTrackTintColor="#D1D5DB"
                      thumbTintColor="#06B6D4"
                    />
                    <StyledText className="ml-2 text-lg text-gray-700">Aa</StyledText>
                  </View>
                </View>
              </View>
            )}
          </View>
        )}

        {/* Preview Section */}
        <View className="px-6 pb-8">
          <TouchableOpacity
            className="mb-4 flex-row items-center justify-between"
            onPress={() => setIsPreviewExpanded(!isPreviewExpanded)}
            activeOpacity={0.7}>
            <View className="flex-row items-center">
              <Ionicons name="eye-outline" size={20} color="#6B7280" />
              <StyledText
                className="ml-2 text-base font-bold text-gray-900">
                {t('preview')}
              </StyledText>
            </View>
            <Ionicons
              name={isPreviewExpanded ? 'chevron-up' : 'chevron-down'}
              size={20}
              color="#6B7280"
            />
          </TouchableOpacity>

          {isPreviewExpanded && (
            <View className="rounded-xl border border-gray-200 bg-white p-4">
              {/* Arabic Verse Preview */}
              {arabicVerseEnabled && (
                <View className="mb-4">
                  <View className="mb-2 flex-row items-center justify-between">
                    <View className="flex-row items-center gap-2">
                      <Ionicons name="volume-medium-outline" size={18} color="#6B7280" />
                      <StyledText
                        className="text-right text-gray-800"
                        style={{
                          fontSize: arabicFontSize,
                          fontFamily: selectedQuranFont,
                        }}>
                        بِسۡمِ ٱللَّهِ ٱلرَّحۡمَٰنِ ٱلرَّحِيمِ
                      </StyledText>
                    </View>
                    <TouchableOpacity>
                      <Ionicons name="star-outline" size={20} color="#6B7280" />
                    </TouchableOpacity>
                  </View>
                </View>
              )}

              {/* Translation Preview */}
              {translationEnabled && (
                <View className="border-t border-gray-100 pt-3">
                  <StyledText
                    className="leading-6 text-gray-700"
                    style={{ fontSize: translationFontSize }}>
                    {t('bismillahTranslation')}
                  </StyledText>
                </View>
              )}

              {/* Show message if both disabled */}
              {!arabicVerseEnabled && !translationEnabled && (
                <View className="py-8">
                  <StyledText className="text-center text-gray-500">
                    {t('enableArabicOrTranslation')}
                  </StyledText>
                </View>
              )}
            </View>
          )}
        </View>

        {/* Save Button */}
        <View className="px-6 pb-8">
          <TouchableOpacity
            className="w-full rounded-xl bg-cyan-500 py-4 active:bg-cyan-600"
            onPress={handleSaveSettings}>
            <StyledText
              className="text-center text-base font-bold text-white">
              {t('saveSettings')}
            </StyledText>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}