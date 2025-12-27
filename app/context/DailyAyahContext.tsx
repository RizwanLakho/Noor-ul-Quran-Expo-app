import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiService } from '../services/ApiService';

interface DailyAyah {
  id: number;
  text: string;
  translation: string;
  surahName: string;
  surahNumber: number;
  ayahNumber: number;
  date: string;
}

interface DailyAyahContextType {
  dailyAyah: DailyAyah | null;
  loading: boolean;
  error: string | null;
  refreshAyah: () => Promise<void>;
  loadDailyAyah: () => Promise<void>;
}

const DailyAyahContext = createContext<DailyAyahContextType | undefined>(undefined);

const DAILY_AYAH_STORAGE_KEY = '@daily_ayah_data';

export const DailyAyahProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [dailyAyah, setDailyAyah] = useState<DailyAyah | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [initialized, setInitialized] = useState<boolean>(false);

  // Don't auto-load on mount - let components load it when needed
  // This prevents blocking the app startup for unauthenticated users

  /**
   * Get today's date in YYYY-MM-DD format
   */
  const getTodayDate = (): string => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  /**
   * Fetch random ayah from API with translation
   */
  const fetchRandomAyah = async (): Promise<DailyAyah | null> => {
    try {
      // 1. Get random ayah (Arabic text)
      const data = await apiService.getRandomAyah();

      const surahNumber = data.ayah?.sura || data.sura || 0;
      const ayahNumber = data.ayah?.aya || data.aya || 0;

      let translation = '';

      // 2. Fetch translation for this ayah
      try {
        // Get translations for the entire surah (with default translator: Ahmed Ali, language: en)
        const translationData = await apiService.getSurahTranslations(surahNumber, 'Ahmed Ali', 'en');

        // Find the matching ayah in the translations
        const matchingAyah = translationData?.ayahs?.find((t: any) => t.aya === ayahNumber);
        translation = matchingAyah?.text || 'Translation not available';
      } catch (translationError) {
        console.log('⚠️ Could not fetch translation, using placeholder');
        translation = 'Translation not available';
      }

      // Transform the API response to match our DailyAyah interface
      const ayahData: DailyAyah = {
        id: data.ayah?.index || data.index || 0,
        text: data.ayah?.text || data.text || '',
        translation: translation,
        surahName: data.ayah?.surah_name_english || data.surah_name_english || '',
        surahNumber: surahNumber,
        ayahNumber: ayahNumber,
        date: getTodayDate(),
      };

      console.log('✅ Daily Ayah fetched:', {
        surah: ayahData.surahName,
        surahNumber: ayahData.surahNumber,
        ayahNumber: ayahData.ayahNumber,
        hasTranslation: !!ayahData.translation,
        translation: ayahData.translation.substring(0, 50) + '...'
      });

      return ayahData;
    } catch (err) {
      console.error('Error fetching random ayah:', err);
      throw err;
    }
  };

  /**
   * Load daily ayah from storage or fetch new one
   * Only runs when called (lazy loading)
   */
  const loadDailyAyah = async () => {
    // Don't load again if already initialized
    if (initialized) {
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Try to load from storage first (works offline)
      const storedData = await AsyncStorage.getItem(DAILY_AYAH_STORAGE_KEY);
      const today = getTodayDate();

      if (storedData) {
        const parsedData: DailyAyah = JSON.parse(storedData);

        // Check if the stored ayah is from today AND has translation
        if (parsedData.date === today && parsedData.translation) {
          console.log('📦 Using cached ayah from today');
          setDailyAyah(parsedData);
          setInitialized(true);
          setLoading(false);
          return;
        } else {
          console.log('🔄 Cached ayah is old or missing translation, fetching new one');
        }
      }

      // If no stored data or date is old, try to fetch new ayah
      try {
        const newAyah = await fetchRandomAyah();

        if (newAyah) {
          await AsyncStorage.setItem(DAILY_AYAH_STORAGE_KEY, JSON.stringify(newAyah));
          setDailyAyah(newAyah);
        }
      } catch (fetchError) {
        // If fetch fails (no auth, network error), just use cached data if available
        console.log('⚠️ Could not fetch new ayah, using cached data if available');
        if (storedData) {
          const parsedData: DailyAyah = JSON.parse(storedData);
          setDailyAyah(parsedData); // Use old data rather than showing error
        }
      }

      setInitialized(true);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load daily ayah';
      setError(errorMessage);
      console.error('Error loading daily ayah:', err);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Manually refresh the ayah (for refresh button)
   */
  const refreshAyah = async () => {
    try {
      setLoading(true);
      setError(null);

      const newAyah = await fetchRandomAyah();

      if (newAyah) {
        await AsyncStorage.setItem(DAILY_AYAH_STORAGE_KEY, JSON.stringify(newAyah));
        setDailyAyah(newAyah);
        console.log('🔄 Ayah refreshed successfully');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to refresh ayah';
      setError(errorMessage);
      console.error('Error refreshing ayah:', err);
    } finally {
      setLoading(false);
    }
  };

  const value: DailyAyahContextType = {
    dailyAyah,
    loading,
    error,
    refreshAyah,
    loadDailyAyah,
  };

  return <DailyAyahContext.Provider value={value}>{children}</DailyAyahContext.Provider>;
};

export const useDailyAyah = () => {
  const context = useContext(DailyAyahContext);
  if (context === undefined) {
    throw new Error('useDailyAyah must be used within a DailyAyahProvider');
  }
  return context;
};
