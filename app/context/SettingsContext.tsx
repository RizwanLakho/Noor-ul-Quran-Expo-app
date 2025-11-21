import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { QuranAppearanceSettings, DEFAULT_SETTINGS } from '../types/settings.types';
import { apiService } from '../services/ApiService';

interface SettingsContextType {
  quranAppearance: QuranAppearanceSettings;
  notificationsEnabled: boolean;
  soundEnabled: boolean;
  updateQuranAppearance: (settings: Partial<QuranAppearanceSettings>) => void;
  setNotificationsEnabled: (enabled: boolean) => void;
  setSoundEnabled: (enabled: boolean) => void;
  resetToDefaults: () => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

const SETTINGS_STORAGE_KEY = '@app_settings';

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [quranAppearance, setQuranAppearance] = useState<QuranAppearanceSettings>(
    DEFAULT_SETTINGS.quranAppearance
  );
  const [notificationsEnabled, setNotificationsEnabledState] = useState(
    DEFAULT_SETTINGS.notificationsEnabled
  );
  const [soundEnabled, setSoundEnabledState] = useState(DEFAULT_SETTINGS.soundEnabled);

  // Load settings from storage on mount
  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const savedSettings = await AsyncStorage.getItem(SETTINGS_STORAGE_KEY);
      if (savedSettings) {
        const settings = JSON.parse(savedSettings);
        if (settings.quranAppearance) {
          setQuranAppearance(settings.quranAppearance);

          // Auto-select first translator if none is selected
          if (!settings.quranAppearance.selectedTranslatorName ||
              !settings.quranAppearance.selectedTranslatorLanguage) {
            await autoSelectDefaultTranslator();
          }
        } else {
          // No saved settings, auto-select translator
          await autoSelectDefaultTranslator();
        }
        if (settings.notificationsEnabled !== undefined) {
          setNotificationsEnabledState(settings.notificationsEnabled);
        }
        if (settings.soundEnabled !== undefined) {
          setSoundEnabledState(settings.soundEnabled);
        }
      } else {
        // First time user, auto-select translator
        await autoSelectDefaultTranslator();
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  /**
   * Auto-select first available translator from database
   * This ensures users see translations immediately without manual selection
   */
  const autoSelectDefaultTranslator = async () => {
    try {
      console.log('🔄 Auto-selecting default translator...');

      // Add timeout to prevent hanging forever
      const timeout = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('Translator API timeout')), 5000)
      );

      const response = await Promise.race([
        apiService.getTranslators(),
        timeout
      ]);

      let translatorList: any[] = [];
      if (response && response.translations && Array.isArray(response.translations)) {
        translatorList = response.translations;
      } else if (response && response.translators && Array.isArray(response.translators)) {
        translatorList = response.translators;
      } else if (Array.isArray(response)) {
        translatorList = response;
      }

      if (translatorList.length > 0) {
        // Prefer "Ahmed Ali" (English) as default, otherwise use first translator
        let defaultTranslator = translatorList.find(
          (t: any) => t.translator === 'Ahmed Ali' && t.language === 'en'
        );

        if (!defaultTranslator) {
          // Fallback: Try to find any English translator
          defaultTranslator = translatorList.find((t: any) => t.language === 'en');
        }

        if (!defaultTranslator) {
          // Fallback: Use first available translator
          defaultTranslator = translatorList[0];
        }

        console.log('✅ Auto-selected translator:', defaultTranslator.translator, defaultTranslator.language);

        const newAppearance = {
          ...DEFAULT_SETTINGS.quranAppearance,
          selectedTranslatorName: defaultTranslator.translator,
          selectedTranslatorLanguage: defaultTranslator.language,
        };

        setQuranAppearance(newAppearance);

        // Save to storage
        const savedSettings = await AsyncStorage.getItem(SETTINGS_STORAGE_KEY);
        const currentSettings = savedSettings ? JSON.parse(savedSettings) : {};

        await AsyncStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify({
          ...currentSettings,
          quranAppearance: newAppearance,
        }));
      } else {
        console.log('⚠️ No translators found in database');
      }
    } catch (error) {
      console.error('❌ Error auto-selecting translator:', error);
      // Don't block app initialization - continue with defaults
    }
  };

  const saveSettings = async (newSettings: any) => {
    try {
      await AsyncStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(newSettings));
    } catch (error) {
      console.error('Error saving settings:', error);
    }
  };

  const updateQuranAppearance = (settings: Partial<QuranAppearanceSettings>) => {
    const newAppearance = { ...quranAppearance, ...settings };
    setQuranAppearance(newAppearance);
    saveSettings({
      quranAppearance: newAppearance,
      notificationsEnabled,
      soundEnabled,
    });
  };

  const setNotificationsEnabled = (enabled: boolean) => {
    setNotificationsEnabledState(enabled);
    saveSettings({
      quranAppearance,
      notificationsEnabled: enabled,
      soundEnabled,
    });
  };

  const setSoundEnabled = (enabled: boolean) => {
    setSoundEnabledState(enabled);
    saveSettings({
      quranAppearance,
      notificationsEnabled,
      soundEnabled: enabled,
    });
  };

  const resetToDefaults = () => {
    setQuranAppearance(DEFAULT_SETTINGS.quranAppearance);
    setNotificationsEnabledState(DEFAULT_SETTINGS.notificationsEnabled);
    setSoundEnabledState(DEFAULT_SETTINGS.soundEnabled);
    saveSettings({
      quranAppearance: DEFAULT_SETTINGS.quranAppearance,
      notificationsEnabled: DEFAULT_SETTINGS.notificationsEnabled,
      soundEnabled: DEFAULT_SETTINGS.soundEnabled,
    });
  };

  const value: SettingsContextType = {
    quranAppearance,
    notificationsEnabled,
    soundEnabled,
    updateQuranAppearance,
    setNotificationsEnabled,
    setSoundEnabled,
    resetToDefaults,
  };

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};
