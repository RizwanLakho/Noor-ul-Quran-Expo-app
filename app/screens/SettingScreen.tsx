import React, { useState } from 'react';
import { View, TouchableOpacity, StatusBar, Switch, ScrollView, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { useSettings } from '../context/SettingsContext';
import { useCustomAlert } from '../context/CustomAlertContext';
import StyledText from '../components/StyledText';

export default function SettingsScreen({ navigation }) {
  const { themeMode, setThemeMode, colors, isDark } = useTheme();
  const { language, setLanguage, t } = useLanguage();
  const { quranAppearance, updateQuranAppearance, resetToDefaults } = useSettings();
  const { showAlert } = useCustomAlert();

  const [expandedSection, setExpandedSection] = useState(null);

  const toggleSection = (section) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  // Theme options
  const themes = [
    { value: 'light', label: t('themeLight'), icon: 'sunny' },
    { value: 'dark', label: t('themeDark'), icon: 'moon' },
    { value: 'auto', label: t('themeAuto'), icon: 'phone-portrait' },
  ];

  // Language options
  const languages = [
    { value: 'en', label: t('languageEnglish'), flag: '🇬🇧' },
    { value: 'ur', label: t('languageUrdu'), flag: '🇵🇰' },
  ];

  // Text colors for Quran
  const textColors = [
    { name: t('colorBlack'), value: '#000000' },
    { name: t('colorDarkGray'), value: '#374151' },
    { name: t('colorTeal'), value: '#14B8A6' },
    { name: t('colorBlue'), value: '#3B82F6' },
    { name: t('colorGreen'), value: '#10B981' },
    { name: t('colorBrown'), value: '#92400E' },
  ];

  const handleThemeChange = (mode) => {
    setThemeMode(mode);
    showAlert('Theme Changed', `Theme set to ${mode} mode`, 'success');
  };

  const handleLanguageChange = (lang) => {
    setLanguage(lang);
    showAlert('Language Changed', `Language changed to ${lang === 'en' ? 'English' : 'Urdu'}`, 'success');
  };

  const handleResetSettings = () => {
    showAlert('Reset Settings', 'Are you sure you want to reset all settings to default?', 'warning', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Reset',
        style: 'destructive',
        onPress: () => {
          resetToDefaults();
          showAlert('Success', 'Settings have been reset to defaults', 'success');
        },
      },
    ]);
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      <View className="items-start justify-center p-4">
        <StyledText className="ml-4 text-4xl font-bold text-[#1C2C3B]">{t('settings')}</StyledText>
      </View>

      <ScrollView style={{ flex: 1, paddingHorizontal: 20, paddingTop: 16 }}>
        {/* ========== GENERAL SETTINGS ========== */}
        <View
          style={{
            marginBottom: 12,
            borderRadius: 12,
            backgroundColor: colors.surface,
            overflow: 'hidden',
          }}>
          <TouchableOpacity
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingHorizontal: 20,
              paddingVertical: 16,
            }}
            onPress={() => toggleSection('general')}>
            <StyledText style={{ fontSize: 16, fontWeight: '600', color: colors.text }}>
              {t('generalSettings')}
            </StyledText>
            <Ionicons
              name={expandedSection === 'general' ? 'chevron-up' : 'chevron-down'}
              size={20}
              color={colors.textSecondary}
            />
          </TouchableOpacity>

          {expandedSection === 'general' && (
            <View
              style={{
                borderTopWidth: 1,
                borderTopColor: colors.border,
                paddingHorizontal: 20,
                paddingBottom: 16,
              }}>
              {/* Theme Selection */}
              <View style={{ paddingVertical: 12 }}>
                <StyledText style={{ fontSize: 14, color: colors.textSecondary, marginBottom: 12 }}>
                  {t('theme')}
                </StyledText>
                {themes.map((theme) => (
                  <TouchableOpacity
                    key={theme.value}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      paddingVertical: 12,
                      paddingHorizontal: 16,
                      marginBottom: 8,
                      borderRadius: 8,
                      backgroundColor:
                        themeMode === theme.value ? colors.primaryLight : colors.background,
                    }}
                    onPress={() => handleThemeChange(theme.value)}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <Ionicons name={theme.icon} size={20} color={colors.text} />
                      <StyledText style={{ marginLeft: 12, fontSize: 15, color: colors.text }}>
                        {theme.label}
                      </StyledText>
                    </View>
                    <View
                      style={{
                        height: 20,
                        width: 20,
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderRadius: 10,
                        borderWidth: 2,
                        borderColor: themeMode === theme.value ? colors.primary : colors.border,
                      }}>
                      {themeMode === theme.value && (
                        <View
                          style={{
                            height: 10,
                            width: 10,
                            borderRadius: 5,
                            backgroundColor: colors.primary,
                          }}
                        />
                      )}
                    </View>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Language Selection */}
              <View
                style={{ paddingVertical: 12, borderTopWidth: 1, borderTopColor: colors.border }}>
                <StyledText style={{ fontSize: 14, color: colors.textSecondary, marginBottom: 12 }}>
                  {t('language')}
                </StyledText>
                {languages.map((lang) => (
                  <TouchableOpacity
                    key={lang.value}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      paddingVertical: 12,
                      paddingHorizontal: 16,
                      marginBottom: 8,
                      borderRadius: 8,
                      backgroundColor:
                        language === lang.value ? colors.primaryLight : colors.background,
                    }}
                    onPress={() => handleLanguageChange(lang.value)}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <StyledText style={{ fontSize: 20, marginRight: 12 }}>{lang.flag}</StyledText>
                      <StyledText style={{ fontSize: 15, color: colors.text }}>{lang.label}</StyledText>
                    </View>
                    <View
                      style={{
                        height: 20,
                        width: 20,
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderRadius: 10,
                        borderWidth: 2,
                        borderColor: language === lang.value ? colors.primary : colors.border,
                      }}>
                      {language === lang.value && (
                        <View
                          style={{
                            height: 10,
                            width: 10,
                            borderRadius: 5,
                            backgroundColor: colors.primary,
                          }}
                        />
                      )}
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}
        </View>

        {/* ========== QURAN APPEARANCE ========== */}
        <View
          style={{
            marginBottom: 12,
            borderRadius: 12,
            backgroundColor: colors.surface,
            overflow: 'hidden',
          }}>
          <TouchableOpacity
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingHorizontal: 20,
              paddingVertical: 16,
            }}
            onPress={() => toggleSection('quran')}>
            <StyledText style={{ fontSize: 16, fontWeight: '600', color: colors.text }}>
              {t('quranAppearance')}
            </StyledText>
            <Ionicons
              name={expandedSection === 'quran' ? 'chevron-up' : 'chevron-down'}
              size={20}
              color={colors.textSecondary}
            />
          </TouchableOpacity>

          {expandedSection === 'quran' && (
            <View
              style={{
                borderTopWidth: 1,
                borderTopColor: colors.border,
                paddingHorizontal: 20,
                paddingBottom: 16,
              }}>
              {/* Text Size Slider */}
              <View style={{ paddingVertical: 16 }}>
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    marginBottom: 12,
                  }}>
                  <StyledText style={{ fontSize: 14, color: colors.textSecondary }}>{t('textSize')}</StyledText>
                  <StyledText style={{ fontSize: 14, fontWeight: '600', color: colors.primary }}>
                    {Math.round(quranAppearance.textSize)}px
                  </StyledText>
                </View>
                <Slider
                  style={{ width: '100%', height: 40 }}
                  minimumValue={16}
                  maximumValue={32}
                  value={quranAppearance.textSize}
                  onValueChange={(value) => updateQuranAppearance({ textSize: value })}
                  minimumTrackTintColor={colors.primary}
                  maximumTrackTintColor={colors.border}
                  thumbTintColor={colors.primary}
                />
                <View
                  style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 }}>
                  <StyledText style={{ fontSize: 12, color: colors.textSecondary }}>16px</StyledText>
                  <StyledText style={{ fontSize: 12, color: colors.textSecondary }}>32px</StyledText>
                </View>
              </View>

              {/* Text Color Selection */}
              <View
                style={{ paddingVertical: 12, borderTopWidth: 1, borderTopColor: colors.border }}>
                <StyledText style={{ fontSize: 14, color: colors.textSecondary, marginBottom: 12 }}>
                  {t('textColor')}
                </StyledText>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                  {textColors.map((colorOption) => (
                    <TouchableOpacity
                      key={colorOption.value}
                      style={{
                        width: '30%',
                        marginRight: '3.33%',
                        marginBottom: 12,
                        alignItems: 'center',
                        padding: 12,
                        borderRadius: 8,
                        backgroundColor:
                          quranAppearance.textColor === colorOption.value
                            ? colors.primaryLight
                            : colors.background,
                        borderWidth: 1,
                        borderColor:
                          quranAppearance.textColor === colorOption.value
                            ? colors.primary
                            : colors.border,
                      }}
                      onPress={() => updateQuranAppearance({ textColor: colorOption.value })}>
                      <View
                        style={{
                          width: 32,
                          height: 32,
                          borderRadius: 16,
                          backgroundColor: colorOption.value,
                          marginBottom: 8,
                          borderWidth: 2,
                          borderColor: colors.border,
                        }}
                      />
                      <StyledText style={{ fontSize: 11, color: colors.text, textAlign: 'center' }}>
                        {colorOption.name}
                      </StyledText>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Translation Toggle */}
              <View
                style={{ paddingVertical: 12, borderTopWidth: 1, borderTopColor: colors.border }}>
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}>
                  <View>
                    <StyledText style={{ fontSize: 15, color: colors.text, marginBottom: 4 }}>
                      {t('translationEnabled')}
                    </StyledText>
                    <StyledText style={{ fontSize: 12, color: colors.textSecondary }}>
                      {t('showTranslationBelowArabic')}
                    </StyledText>
                  </View>
                  <Switch
                    value={quranAppearance.translationEnabled}
                    onValueChange={(value) => updateQuranAppearance({ translationEnabled: value })}
                    trackColor={{ false: colors.border, true: colors.primaryLight }}
                    thumbColor={
                      quranAppearance.translationEnabled ? colors.primary : colors.background
                    }
                  />
                </View>
              </View>
            </View>
          )}
        </View>

        {/* Preview Section */}
        <View
          style={{
            marginBottom: 12,
            borderRadius: 12,
            backgroundColor: colors.surface,
            padding: 20,
          }}>
          <StyledText style={{ fontSize: 14, color: colors.textSecondary, marginBottom: 12 }}>
            {t('preview')}
          </StyledText>
          <View style={{ padding: 16, borderRadius: 8, backgroundColor: colors.background }}>
            <StyledText
              style={{
                fontSize: quranAppearance.textSize,
                color: quranAppearance.textColor,
                textAlign: 'center',
                fontFamily: 'serif',
              }}>
              بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
            </StyledText>
            {quranAppearance.translationEnabled && (
              <StyledText
                style={{
                  fontSize: quranAppearance.textSize * 0.7,
                  color: colors.textSecondary,
                  textAlign: 'center',
                  marginTop: 8,
                }}>
                {t('bismillahTranslation')}
              </StyledText>
            )}
          </View>
        </View>

        <View style={{ height: 80 }} />
      </ScrollView>
    </View>
  );
}