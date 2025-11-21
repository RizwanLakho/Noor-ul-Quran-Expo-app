import React, { useState, useEffect } from 'react';
import { View, ScrollView, TouchableOpacity, SafeAreaView, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { useCustomAlert } from '../context/CustomAlertContext';
import StyledText from '../components/StyledText';

export default function AppearanceScreen({ navigation }) {
  const { colors, themeMode, setThemeMode } = useTheme();
  const { language, setLanguage, t } = useLanguage();
  const { showAlert } = useCustomAlert();

  // Get language name for display
  const getLanguageName = () => {
    if (language === 'en') return t('languageEnglish');
    if (language === 'ur') return t('languageUrdu');
    return t('languageEnglish');
  };

  // State for language selection
  const [selectedLanguage, setSelectedLanguage] = useState(getLanguageName());

  // Update selected language when context changes
  useEffect(() => {
    setSelectedLanguage(getLanguageName());
  }, [language]);

  // Get current theme name for display
  const getThemeName = () => {
    if (themeMode === 'auto') return t('themeAuto');
    if (themeMode === 'light') return t('themeLight');
    if (themeMode === 'dark') return t('themeDark');
    return t('themeAuto');
  };

  const [selectedTheme, setSelectedTheme] = useState(getThemeName());

  // Language options
  const languages = [
    { id: 1, name: t('languageEnglish'), value: 'en' },
    { id: 2, name: t('languageUrdu'), value: 'ur' },
  ];

  // Theme options
  const themes = [
    { id: 1, name: t('themeAuto'), value: 'auto' },
    { id: 2, name: t('themeLight'), value: 'light' },
    { id: 3, name: t('themeDark'), value: 'dark' },
  ];

  // Handle language selection
  const handleLanguageSelect = async (lang) => {
    try {
      setSelectedLanguage(lang.name);

      // Save to LanguageContext (which saves to AsyncStorage)
      await setLanguage(lang.value as 'en' | 'ur');

      showAlert(t('success'), `${t('languageChanged')} ${lang.name}. ${t('appWillUseFont').replace('{font}', lang.value === 'ur' ? t('urduFont') : t('systemFont'))}`, 'success');

    } catch (error) {
      showAlert(t('error'), t('failedToChangeLanguage'), 'error');
    }
  };

  // Handle theme selection
  const handleThemeSelect = async (theme) => {
    try {
      setSelectedTheme(theme.name);

      // Apply theme immediately using ThemeContext (saves to AsyncStorage)
      setThemeMode(theme.value as 'light' | 'dark' | 'auto');

      showAlert(t('success'), `${t('themeChanged')} ${theme.name}`, 'success');

    } catch (error) {
      showAlert(t('error'), t('failedToChangeTheme'), 'error');
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
        <StyledText className="ml-2 text-lg font-bold text-gray-900">{t('appearance')}</StyledText>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Language Section */}
        <View className="mt-6 px-6">
          {/* Section Header */}
          <View className="mb-4 flex-row items-center">
            <Ionicons name="globe-outline" size={20} color="#6B7280" />
            <StyledText
              className="ml-2 text-base font-bold text-gray-900">
              {t('language')}
            </StyledText>
          </View>

          {/* Language Options */}
          <View className="overflow-hidden rounded-xl border border-gray-200 bg-white">
            {languages.map((languageItem, index) => (
              <View key={languageItem.id}>
                <TouchableOpacity
                  className="flex-row items-center justify-between px-4 py-4 active:bg-gray-50"
                  onPress={() => handleLanguageSelect(languageItem)}
                  activeOpacity={0.7}>
                  <StyledText
                    className="text-base font-medium text-gray-900">
                    {languageItem.name}
                  </StyledText>

                  <View
                    className={`h-6 w-6 items-center justify-center rounded-full border-2 ${
                      selectedLanguage === languageItem.name ? 'border-blue-600' : 'border-gray-300'
                    }`}>
                    {selectedLanguage === languageItem.name && (
                      <View className="h-3 w-3 rounded-full bg-blue-600" />
                    )}
                  </View>
                </TouchableOpacity>

                {index < languages.length - 1 && <View className="mx-4 border-t border-gray-100" />}
              </View>
            ))}
          </View>
        </View>

        {/* Theme Section */}
        <View className="mt-8 px-6 pb-8">
          {/* Section Header */}
          <View className="mb-4 flex-row items-center">
            <Ionicons name="contrast-outline" size={20} color="#6B7280" />
            <StyledText className="ml-2 text-base font-bold text-gray-900">{t('theme')}</StyledText>
          </View>

          {/* Theme Options */}
          <View className="overflow-hidden rounded-xl border border-gray-200 bg-white">
            {themes.map((themeItem, index) => (
              <View key={themeItem.id}>
                <TouchableOpacity
                  className="flex-row items-center justify-between px-4 py-4 active:bg-gray-50"
                  onPress={() => handleThemeSelect(themeItem)}
                  activeOpacity={0.7}>
                  <StyledText className="text-base font-medium text-gray-900">{themeItem.name}</StyledText>

                  <View
                    className={`h-6 w-6 items-center justify-center rounded-full border-2 ${
                      selectedTheme === themeItem.name ? 'border-blue-600' : 'border-gray-300'
                    }`}>
                    {selectedTheme === themeItem.name && (
                      <View className="h-3 w-3 rounded-full bg-blue-600" />
                    )}
                  </View>
                </TouchableOpacity>

                {index < themes.length - 1 && <View className="mx-4 border-t border-gray-100" />}
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}