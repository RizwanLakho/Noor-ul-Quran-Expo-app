import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { QuranAppearanceSettings, DEFAULT_SETTINGS } from '../types/settings.types';
import { apiService } from '../services/ApiService';

// Helper: Detect text direction based on language code
const getTextDirection = (languageCode: string): 'rtl' | 'ltr' => {
  // RTL languages: Arabic, Urdu, Farsi/Persian, Hebrew
  const rtlLanguages = ['ar', 'ur', 'fa', 'he'];
  return rtlLanguages.includes(languageCode) ? 'rtl' : 'ltr';
};

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
      console.log('🔄 Loading settings from AsyncStorage...');
      const savedSettings = await AsyncStorage.getItem(SETTINGS_STORAGE_KEY);

      if (savedSettings) {
        const settings = JSON.parse(savedSettings);
        console.log('📦 Loaded settings:', {
          hasQuranAppearance: !!settings.quranAppearance,
          translatorName: settings.quranAppearance?.selectedTranslatorName,
          translatorLanguage: settings.quranAppearance?.selectedTranslatorLanguage,
          translatorIdentifier: settings.quranAppearance?.selectedTranslatorIdentifier,
        });

        if (settings.quranAppearance) {
          // Merge saved settings with defaults to ensure all fields exist
          const mergedAppearance = {
            ...DEFAULT_SETTINGS.quranAppearance,
            ...settings.quranAppearance,
          };

          setQuranAppearance(mergedAppearance);

          // Auto-select first translator if none is selected OR if identifier is missing
          if (!mergedAppearance.selectedTranslatorName ||
              !mergedAppearance.selectedTranslatorLanguage ||
              !mergedAppearance.selectedTranslatorIdentifier) {
            console.log('⚠️ Missing translator info, auto-selecting...');
            await autoSelectDefaultTranslator();
          } else {
            console.log('✅ Translator already configured:', {
              name: mergedAppearance.selectedTranslatorName,
              identifier: mergedAppearance.selectedTranslatorIdentifier,
              direction: mergedAppearance.translationDirection,
            });
          }
        } else {
          // No saved settings, auto-select translator
          console.log('⚠️ No quranAppearance in saved settings, auto-selecting...');
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
        console.log('⚠️ No saved settings found, auto-selecting translator...');
        await autoSelectDefaultTranslator();
      }
    } catch (error) {
      console.error('❌ Error loading settings:', error);
    }
  };

  /**
   * Auto-select default translator from AlQuran.cloud API
   * Priority: 1) Ahmed Raza Khan (Urdu), 2) Saheeh International (English)
   * This ensures users see translations immediately without manual selection
   */
  const autoSelectDefaultTranslator = async () => {
    try {
      console.log('🔄 Auto-selecting default translator from AlQuran.cloud...');

      // Add timeout to prevent hanging forever
      const timeout = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('Translator API timeout')), 8000)
      );

      const apiCall = fetch('https://api.alquran.cloud/v1/edition?format=text&type=translation')
        .then(res => res.json());

      const data = await Promise.race([apiCall, timeout]);

      if (data.code === 200 && data.data && Array.isArray(data.data)) {
        const translatorList = data.data;
        console.log(`📚 Fetched ${translatorList.length} translations from AlQuran.cloud`);

        // Priority order for default translator
        let defaultTranslator =
          // 1st preference: Ahmed Raza Khan (Urdu) - since user mentioned "ahmed"
          translatorList.find((t: any) => t.identifier === 'ur.ahmedraza') ||
          // 2nd preference: Jalandhry (Urdu) - popular in Pakistan
          translatorList.find((t: any) => t.identifier === 'ur.jalandhry') ||
          // 3rd preference: Saheeh International (English) - most popular English
          translatorList.find((t: any) => t.identifier === 'en.sahih') ||
          // 4th preference: Any English translator
          translatorList.find((t: any) => t.language === 'en') ||
          // Fallback: First available translator
          translatorList[0];

        if (defaultTranslator) {
          const direction = getTextDirection(defaultTranslator.language);

          console.log('✅ Auto-selected translator:', {
            name: defaultTranslator.englishName,
            language: defaultTranslator.language,
            identifier: defaultTranslator.identifier,
            direction: direction.toUpperCase()
          });

          const newAppearance = {
            ...DEFAULT_SETTINGS.quranAppearance,
            selectedTranslatorName: defaultTranslator.englishName,
            selectedTranslatorLanguage: defaultTranslator.language,
            selectedTranslatorIdentifier: defaultTranslator.identifier, // Important for API calls
            translationDirection: direction, // Auto-detect RTL/LTR
          };

          console.log('💾 Saving auto-selected translator:', {
            name: newAppearance.selectedTranslatorName,
            language: newAppearance.selectedTranslatorLanguage,
            identifier: newAppearance.selectedTranslatorIdentifier,
            direction: newAppearance.translationDirection,
          });

          setQuranAppearance(newAppearance);

          // Save to storage
          const savedSettings = await AsyncStorage.getItem(SETTINGS_STORAGE_KEY);
          const currentSettings = savedSettings ? JSON.parse(savedSettings) : {};

          const settingsToSave = {
            ...currentSettings,
            quranAppearance: newAppearance,
          };

          await AsyncStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settingsToSave));
          console.log('✅ Saved translator settings to AsyncStorage');
        }
      } else {
        console.log('⚠️ Failed to fetch translators from AlQuran.cloud, using hardcoded default');
        // Hardcoded fallback
        const newAppearance = {
          ...DEFAULT_SETTINGS.quranAppearance,
          selectedTranslatorName: 'Saheeh International',
          selectedTranslatorLanguage: 'en',
          selectedTranslatorIdentifier: 'en.sahih',
          translationDirection: 'ltr', // English is LTR
        };
        setQuranAppearance(newAppearance);

        // Save fallback to storage
        const savedSettings = await AsyncStorage.getItem(SETTINGS_STORAGE_KEY);
        const currentSettings = savedSettings ? JSON.parse(savedSettings) : {};
        await AsyncStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify({
          ...currentSettings,
          quranAppearance: newAppearance,
        }));
        console.log('✅ Saved fallback translator to AsyncStorage');
      }
    } catch (error) {
      console.error('❌ Error auto-selecting translator:', error);
      // Use hardcoded default as fallback
      const newAppearance = {
        ...DEFAULT_SETTINGS.quranAppearance,
        selectedTranslatorName: 'Saheeh International',
        selectedTranslatorLanguage: 'en',
        selectedTranslatorIdentifier: 'en.sahih',
        translationDirection: 'ltr', // English is LTR
      };
      setQuranAppearance(newAppearance);

      // Save error fallback to storage
      try {
        const savedSettings = await AsyncStorage.getItem(SETTINGS_STORAGE_KEY);
        const currentSettings = savedSettings ? JSON.parse(savedSettings) : {};
        await AsyncStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify({
          ...currentSettings,
          quranAppearance: newAppearance,
        }));
        console.log('✅ Saved error fallback translator to AsyncStorage');
      } catch (saveError) {
        console.error('❌ Failed to save error fallback:', saveError);
      }
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
    let newAppearance = { ...quranAppearance, ...settings };

    // Auto-enable logic: At least one of Arabic text or Translation must be enabled
    if (settings.hasOwnProperty('arabicTextEnabled') && settings.arabicTextEnabled === false) {
      if (!newAppearance.translationEnabled) {
        // Auto-enable translation if user tries to disable both
        console.log('Auto-enabling translation to keep at least one enabled');
        newAppearance.translationEnabled = true;
      }
    }

    if (settings.hasOwnProperty('translationEnabled') && settings.translationEnabled === false) {
      if (!newAppearance.arabicTextEnabled) {
        // Auto-enable Arabic if user tries to disable both
        console.log('Auto-enabling Arabic to keep at least one enabled');
        newAppearance.arabicTextEnabled = true;
      }
    }

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
