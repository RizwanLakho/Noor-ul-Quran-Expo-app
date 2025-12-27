import React, { useState, useEffect } from 'react';
import { View, TouchableOpacity, StatusBar, Switch, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { useSettings } from '../context/SettingsContext';
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

export default function AudioSettingsScreen({ navigation }: any) {
  const { colors, isDark } = useTheme();
  const { t } = useLanguage();
  const { quranAppearance, updateQuranAppearance } = useSettings();
  const { showAlert } = useCustomAlert();

  const [loading, setLoading] = useState(true);
  const [quranReciters, setQuranReciters] = useState<Edition[]>([]);
  const [translationRecitersEnglish, setTranslationRecitersEnglish] = useState<Edition[]>([]);
  const [translationRecitersUrdu, setTranslationRecitersUrdu] = useState<Edition[]>([]);

  useEffect(() => {
    fetchEditions();
  }, []);

  const fetchEditions = async () => {
    try {
      setLoading(true);

      // Fetch all editions from AlQuran.cloud API
      const response = await fetch('https://api.alquran.cloud/v1/edition');
      const data = await response.json();

      if (data.code === 200 && data.data) {
        const editions: Edition[] = data.data;

        // Filter ALL audio editions
        const allAudioEditions = editions.filter(
          (edition) => edition.format === 'audio'
        );

        // ALL Arabic Quran reciters (excluding translation type)
        const arabicReciters = allAudioEditions.filter(
          e => e.language === 'ar' && e.type !== 'translation'
        );

        console.log('Arabic Reciters:', arabicReciters.length, arabicReciters.map(r => r.englishName));

        setQuranReciters(arabicReciters);
        setTranslationRecitersEnglish([]); // Hide English section
        setTranslationRecitersUrdu([]);    // Hide Urdu section
      }
    } catch (error) {
      console.error('Error fetching editions:', error);
      showAlert(t('error'), 'Failed to load audio editions', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleReciterChange = (identifier: string, name: string) => {
    updateQuranAppearance({ selectedReciter: identifier });
    showAlert(t('reciterChanged'), `${t('reciterChangedTo')} ${name}`, 'success');
  };

  const handleTranslationReciterChange = (identifier: string, name: string) => {
    updateQuranAppearance({ selectedTranslationReciter: identifier });
    showAlert(t('reciterChanged'), `${t('translationReciterChangedTo')} ${name}`, 'success');
  };

  const handleTranslatorRecitorToggle = (value: boolean) => {
    updateQuranAppearance({ translatorRecitorEnabled: value });
  };

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['top']}>
        <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

        {/* Header */}
        <View style={{ borderBottomWidth: 1, borderBottomColor: colors.border, backgroundColor: colors.surface, paddingHorizontal: 20, paddingVertical: 16 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginRight: 12 }}>
              <Ionicons name="arrow-back" size={24} color={colors.primary} />
            </TouchableOpacity>
            <StyledText style={{ fontSize: 20, fontWeight: 'bold', color: colors.text }}>
              {t('audioSettings')}
            </StyledText>
          </View>
        </View>

        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator size="large" color={colors.primary} />
          <StyledText style={{ marginTop: 16, color: colors.textSecondary }}>
            {t('loadingTranslators')}
          </StyledText>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['top']}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

      {/* Header */}
      <View style={{ borderBottomWidth: 1, borderBottomColor: colors.border, backgroundColor: colors.surface, paddingHorizontal: 20, paddingVertical: 16 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginRight: 12 }}>
            <Ionicons name="arrow-back" size={24} color={colors.primary} />
          </TouchableOpacity>
          <StyledText style={{ fontSize: 20, fontWeight: 'bold', color: colors.text }}>
            {t('audioSettings')}
          </StyledText>
        </View>
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingHorizontal: 20, paddingVertical: 20 }}>
        {/* Quran Reciters Section */}
        <View style={{ marginBottom: 24 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
            <View style={{ height: 20, width: 4, borderRadius: 2, backgroundColor: colors.primary, marginRight: 8 }} />
            <StyledText style={{ fontSize: 18, fontWeight: 'bold', color: colors.text }}>
              {t('selectReciter')}
            </StyledText>
          </View>
          <StyledText style={{ marginBottom: 12, fontSize: 12, color: colors.textSecondary }}>
            {quranReciters.length} {t('availableReciters')}
          </StyledText>

          <View style={{ borderRadius: 12, backgroundColor: colors.surface, overflow: 'hidden' }}>
            {quranReciters.map((reciter, index) => (
              <TouchableOpacity
                key={reciter.identifier}
                onPress={() => handleReciterChange(reciter.identifier, reciter.englishName)}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  paddingHorizontal: 16,
                  paddingVertical: 14,
                  borderBottomWidth: index < quranReciters.length - 1 ? 1 : 0,
                  borderBottomColor: colors.border,
                  backgroundColor: quranAppearance.selectedReciter === reciter.identifier ? colors.primaryLight : 'transparent',
                }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                  <View style={{ marginRight: 12, height: 36, width: 36, alignItems: 'center', justifyContent: 'center', borderRadius: 18, backgroundColor: quranAppearance.selectedReciter === reciter.identifier ? colors.primary : colors.border }}>
                    <Ionicons name="mic" size={18} color={quranAppearance.selectedReciter === reciter.identifier ? '#FFFFFF' : colors.textSecondary} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <StyledText style={{ fontSize: 14, fontWeight: quranAppearance.selectedReciter === reciter.identifier ? '600' : '400', color: quranAppearance.selectedReciter === reciter.identifier ? colors.primary : colors.text }}>
                      {reciter.englishName}
                    </StyledText>
                    {reciter.name !== reciter.englishName && (
                      <StyledText style={{ fontSize: 11, color: colors.textSecondary }}>
                        {reciter.name}
                      </StyledText>
                    )}
                  </View>
                </View>
                {quranAppearance.selectedReciter === reciter.identifier && (
                  <Ionicons name="checkmark-circle" size={22} color={colors.primary} />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* English Reciters */}
        {translationRecitersEnglish.length > 0 && (
          <View style={{ marginBottom: 24 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
              <View style={{ height: 20, width: 4, borderRadius: 2, backgroundColor: colors.success, marginRight: 8 }} />
              <StyledText style={{ fontSize: 18, fontWeight: 'bold', color: colors.text }}>
                {t('englishReciters')}
              </StyledText>
            </View>
            <StyledText style={{ marginBottom: 12, fontSize: 12, color: colors.textSecondary }}>
              {translationRecitersEnglish.length} {t('availableReciters')}
            </StyledText>

            <View style={{ borderRadius: 12, backgroundColor: colors.surface, overflow: 'hidden' }}>
              {translationRecitersEnglish.map((reciter, index) => (
                <TouchableOpacity
                  key={reciter.identifier}
                  onPress={() => handleTranslationReciterChange(reciter.identifier, reciter.englishName)}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    paddingHorizontal: 16,
                    paddingVertical: 14,
                    borderBottomWidth: index < translationRecitersEnglish.length - 1 ? 1 : 0,
                    borderBottomColor: colors.border,
                    backgroundColor: quranAppearance.selectedTranslationReciter === reciter.identifier ? 'rgba(16, 185, 129, 0.1)' : 'transparent',
                  }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                    <View style={{ marginRight: 12, height: 36, width: 36, alignItems: 'center', justifyContent: 'center', borderRadius: 18, backgroundColor: quranAppearance.selectedTranslationReciter === reciter.identifier ? colors.success : colors.border }}>
                      <Ionicons name="language" size={18} color={quranAppearance.selectedTranslationReciter === reciter.identifier ? '#FFFFFF' : colors.textSecondary} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <StyledText style={{ fontSize: 14, fontWeight: quranAppearance.selectedTranslationReciter === reciter.identifier ? '600' : '400', color: quranAppearance.selectedTranslationReciter === reciter.identifier ? colors.success : colors.text }}>
                        {reciter.englishName}
                      </StyledText>
                    </View>
                  </View>
                  {quranAppearance.selectedTranslationReciter === reciter.identifier && (
                    <Ionicons name="checkmark-circle" size={22} color={colors.success} />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Urdu Reciters */}
        {translationRecitersUrdu.length > 0 && (
          <View style={{ marginBottom: 24 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
              <View style={{ height: 20, width: 4, borderRadius: 2, backgroundColor: colors.info, marginRight: 8 }} />
              <StyledText style={{ fontSize: 18, fontWeight: 'bold', color: colors.text }}>
                {t('urduReciters')}
              </StyledText>
            </View>
            <StyledText style={{ marginBottom: 12, fontSize: 12, color: colors.textSecondary }}>
              {translationRecitersUrdu.length} {t('availableReciters')}
            </StyledText>

            <View style={{ borderRadius: 12, backgroundColor: colors.surface, overflow: 'hidden' }}>
              {translationRecitersUrdu.map((reciter, index) => (
                <TouchableOpacity
                  key={reciter.identifier}
                  onPress={() => handleTranslationReciterChange(reciter.identifier, reciter.englishName)}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    paddingHorizontal: 16,
                    paddingVertical: 14,
                    borderBottomWidth: index < translationRecitersUrdu.length - 1 ? 1 : 0,
                    borderBottomColor: colors.border,
                    backgroundColor: quranAppearance.selectedTranslationReciter === reciter.identifier ? 'rgba(59, 130, 246, 0.1)' : 'transparent',
                  }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                    <View style={{ marginRight: 12, height: 36, width: 36, alignItems: 'center', justifyContent: 'center', borderRadius: 18, backgroundColor: quranAppearance.selectedTranslationReciter === reciter.identifier ? colors.info : colors.border }}>
                      <Ionicons name="language" size={18} color={quranAppearance.selectedTranslationReciter === reciter.identifier ? '#FFFFFF' : colors.textSecondary} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <StyledText style={{ fontSize: 14, fontWeight: quranAppearance.selectedTranslationReciter === reciter.identifier ? '600' : '400', color: quranAppearance.selectedTranslationReciter === reciter.identifier ? colors.info : colors.text }}>
                        {reciter.englishName}
                      </StyledText>
                      {reciter.name !== reciter.englishName && (
                        <StyledText style={{ fontSize: 11, color: colors.textSecondary }}>
                          {reciter.name}
                        </StyledText>
                      )}
                    </View>
                  </View>
                  {quranAppearance.selectedTranslationReciter === reciter.identifier && (
                    <Ionicons name="checkmark-circle" size={22} color={colors.info} />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Info Box */}
        <View style={{ marginBottom: 20, borderRadius: 12, backgroundColor: isDark ? 'rgba(59, 130, 246, 0.1)' : 'rgba(59, 130, 246, 0.05)', padding: 16 }}>
          <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
            <Ionicons name="information-circle" size={20} color={colors.info} style={{ marginRight: 8, marginTop: 2 }} />
            <View style={{ flex: 1 }}>
              <StyledText style={{ fontSize: 12, lineHeight: 18, color: colors.text }}>
                {t('audioSettingsInfo')}
              </StyledText>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
