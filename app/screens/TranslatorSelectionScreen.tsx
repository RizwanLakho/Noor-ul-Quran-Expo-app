import React, { useState, useEffect } from 'react';
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
import { useSettings } from '../context/SettingsContext';
import { useCustomAlert } from '../context/CustomAlertContext';
import StyledText from '../components/StyledText';
import { apiService } from '../services/ApiService';

// Helper: Detect text direction based on language code
const getTextDirection = (languageCode: string): 'rtl' | 'ltr' => {
  // RTL languages: Arabic, Urdu, Farsi/Persian, Hebrew
  const rtlLanguages = ['ar', 'ur', 'fa', 'he'];
  return rtlLanguages.includes(languageCode) ? 'rtl' : 'ltr';
};

interface Translator {
  translator: string; // translator name (englishName from API)
  language: string;
  total_ayahs?: string;
  identifier?: string; // AlQuran.cloud edition identifier (e.g., "en.sahih")
  format?: string;
  type?: string;
}

export default function TranslatorSelectionScreen({ navigation }) {
  const { colors } = useTheme();
  const { t, uiFont } = useLanguage();
  const { quranAppearance, updateQuranAppearance } = useSettings();
  const { showAlert } = useCustomAlert();

  const [translators, setTranslators] = useState<Translator[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTranslatorName, setSelectedTranslatorName] = useState(
    quranAppearance.selectedTranslatorName
  );
  const [selectedTranslatorLanguage, setSelectedTranslatorLanguage] = useState(
    quranAppearance.selectedTranslatorLanguage || ''
  );

  useEffect(() => {
    fetchTranslators();
  }, []);

  const fetchTranslators = async () => {
    try {
      setLoading(true);
      console.log('📚 Fetching translations from AlQuran.cloud API...');

      // Fetch from AlQuran.cloud API instead of backend
      const response = await fetch('https://api.alquran.cloud/v1/edition?format=text&type=translation');
      const data = await response.json();

      console.log('📡 AlQuran API response:', { code: data.code, count: data.data?.length });

      if (data.code === 200 && data.data && Array.isArray(data.data)) {
        // Transform AlQuran.cloud editions to our format
        const translatorList: Translator[] = data.data.map((edition: any) => ({
          translator: edition.englishName, // e.g., "Saheeh International"
          language: edition.language, // e.g., "en"
          total_ayahs: '6236', // All translations have full Quran
          identifier: edition.identifier, // e.g., "en.sahih" - IMPORTANT for API calls
          format: edition.format,
          type: edition.type
        }));

        console.log('✅ Loaded translations:', translatorList.length);
        setTranslators(translatorList);

        // Auto-select first translator if none is selected
        if (translatorList.length > 0 && !quranAppearance.selectedTranslatorName) {
          const firstTranslator = translatorList[0];
          const direction = getTextDirection(firstTranslator.language);

          setSelectedTranslatorName(firstTranslator.translator);
          setSelectedTranslatorLanguage(firstTranslator.language);
          // Auto-save the first translator as default
          updateQuranAppearance({
            selectedTranslatorName: firstTranslator.translator,
            selectedTranslatorLanguage: firstTranslator.language,
            selectedTranslatorIdentifier: firstTranslator.identifier, // Store identifier for API calls
            translationDirection: direction // Auto-detect RTL/LTR
          });
        }
      } else {
        console.error('❌ Invalid API response:', data);
        showAlert(t('error'), 'Failed to load translations from API', 'error');
      }
    } catch (error) {
      console.error('❌ Failed to fetch translations:', error);
      showAlert(t('error'), t('failedToLoadTranslators'), 'error');
    } finally {
      setLoading(false);
    }
  };

  const [selectedTranslatorIdentifier, setSelectedTranslatorIdentifier] = useState(
    quranAppearance.selectedTranslatorIdentifier || ''
  );

  const handleSelectTranslator = (translator: Translator) => {
    setSelectedTranslatorName(translator.translator);
    setSelectedTranslatorLanguage(translator.language);
    setSelectedTranslatorIdentifier(translator.identifier || '');
  };

  const handleSave = () => {
    const direction = getTextDirection(selectedTranslatorLanguage);

    updateQuranAppearance({
      selectedTranslatorName,
      selectedTranslatorLanguage,
      selectedTranslatorIdentifier,
      translationDirection: direction
    });

    console.log(`✅ Saved translator with direction: ${selectedTranslatorName} (${selectedTranslatorLanguage}) - ${direction.toUpperCase()}`);
    showAlert(t('success'), t('settingsSavedSuccess'), 'success');
    navigation.goBack();
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />

      {/* Header */}
      <View className="flex-row items-center justify-between border-b border-gray-100 bg-white px-4 py-4">
        <View className="flex-row items-center">
          <TouchableOpacity
            className="h-10 w-10 items-center justify-center"
            onPress={() => navigation?.goBack()}>
            <Ionicons name="chevron-back" size={28} color="#333" />
          </TouchableOpacity>
          <StyledText className="ml-2 text-lg font-bold text-gray-900" style={{ fontFamily: uiFont }}>
            {t('translatorSelection')}
          </StyledText>
        </View>

        {/* Save Button */}
        <TouchableOpacity
          className="rounded-lg bg-cyan-500 px-4 py-2"
          onPress={handleSave}>
          <StyledText className="text-sm font-bold text-white" style={{ fontFamily: uiFont }}>
            {t('save')}
          </StyledText>
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {loading ? (
          <View className="flex-1 items-center justify-center py-20">
            <ActivityIndicator size="large" color="#06B6D4" />
            <StyledText className="mt-4 text-gray-500" style={{ fontFamily: uiFont }}>
              {t('loadingTranslators')}
            </StyledText>
          </View>
        ) : translators.length === 0 ? (
          <View className="flex-1 items-center justify-center py-20">
            <Ionicons name="language-outline" size={64} color="#9CA3AF" />
            <StyledText className="mt-4 text-center text-lg font-bold text-gray-700" style={{ fontFamily: uiFont }}>
              {t('noTranslatorsAvailable')}
            </StyledText>
            <StyledText className="mt-2 px-6 text-center text-sm text-gray-500" style={{ fontFamily: uiFont }}>
              {t('checkConsoleLogsForApiErrors')}
            </StyledText>
          </View>
        ) : (
          <View className="px-6 py-6">
            <View className="overflow-hidden rounded-xl border border-gray-200 bg-white">
              {translators.map((translator, index) => (
                <View key={translator.identifier || `translator-${index}`}>
                  <TouchableOpacity
                    className="flex-row items-center justify-between px-4 py-4 active:bg-gray-50"
                    onPress={() => handleSelectTranslator(translator)}
                    activeOpacity={0.7}>
                    <View className="flex-1">
                      <View className="flex-row items-center gap-2 mb-1">
                        <StyledText
                          className="text-base font-semibold text-gray-900"
                          style={{ fontFamily: uiFont }}>
                          {translator.translator}
                        </StyledText>
                        <View className="rounded-md bg-blue-100 px-2 py-1">
                          <StyledText className="text-xs font-semibold text-blue-700">
                            {translator.language.toUpperCase()}
                          </StyledText>
                        </View>
                      </View>
                      {translator.total_ayahs && (
                        <StyledText
                          className="text-sm text-gray-500"
                          style={{ fontFamily: uiFont }}>
                          {translator.total_ayahs} {t('verses')} • {t('completeQuran')}
                        </StyledText>
                      )}
                    </View>

                    {/* Radio Button */}
                    <View
                      className={`ml-4 h-6 w-6 items-center justify-center rounded-full border-2 ${
                        selectedTranslatorName === translator.translator
                          ? 'border-blue-600'
                          : 'border-gray-300'
                      }`}>
                      {selectedTranslatorName === translator.translator && (
                        <View className="h-3 w-3 rounded-full bg-blue-600" />
                      )}
                    </View>
                  </TouchableOpacity>

                  {index < translators.length - 1 && <View className="mx-4 border-t border-gray-100" />}
                </View>
              ))}
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}