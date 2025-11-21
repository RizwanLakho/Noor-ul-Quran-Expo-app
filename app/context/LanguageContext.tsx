import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { I18nManager } from 'react-native';
import RNRestart from 'react-native-restart';
import {
  AppLanguage,
  Translations,
  ENGLISH_TRANSLATIONS,
  URDU_TRANSLATIONS,
} from '../types/settings.types';

interface LanguageContextType {
  language: AppLanguage;
  translations: Translations;
  setLanguage: (lang: AppLanguage) => void;
  t: (key: keyof Translations) => string;
  uiFont: string; // Font for UI text based on language
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const LANGUAGE_STORAGE_KEY = '@app_language';

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<AppLanguage>('en');

  // Load language from storage on mount
  useEffect(() => {
    loadLanguage();
  }, []);

  const loadLanguage = async () => {
    try {
      const savedLanguage = await AsyncStorage.getItem(LANGUAGE_STORAGE_KEY);
      if (savedLanguage && (savedLanguage === 'en' || savedLanguage === 'ur')) {
        setLanguageState(savedLanguage as AppLanguage);

        // Set RTL for Urdu
        if (savedLanguage === 'ur' && !I18nManager.isRTL) {
          // Note: Changing RTL requires app restart
          // I18nManager.forceRTL(true);
        }
      }
    } catch (error) {
      console.error('Error loading language:', error);
    }
  };

  const setLanguage = async (lang: AppLanguage) => {
    try {
      await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, lang);
      setLanguageState(lang);

      // Handle RTL for Urdu
      // Note: Full RTL support requires app restart
      if (lang === 'ur' && !I18nManager.isRTL) {
        I18nManager.forceRTL(true);
        RNRestart.Restart();
      } else if (lang === 'en' && I18nManager.isRTL) {
        I18nManager.forceRTL(false);
        RNRestart.Restart();
      }
    } catch (error) {
      console.error('Error saving language:', error);
    }
  };

  const translations = language === 'ur' ? URDU_TRANSLATIONS : ENGLISH_TRANSLATIONS;

  // Get UI font based on language
  const uiFont = language === 'ur' ? 'urdu' : 'System';

  const t = (key: keyof Translations): string => {
    return translations[key] || key;
  };

  const value: LanguageContextType = {
    language,
    translations,
    setLanguage,
    t,
    uiFont,
  };

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
