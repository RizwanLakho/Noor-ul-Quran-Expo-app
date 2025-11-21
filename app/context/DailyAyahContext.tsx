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
   * Fetch random ayah from API
   */
  const fetchRandomAyah = async (): Promise<DailyAyah | null> => {
    try {
      const data = await apiService.getRandomAyah();

      // Transform the API response to match our DailyAyah interface
      const ayahData: DailyAyah = {
        id: data.ayah?.id || data.id,
        text: data.ayah?.text || data.text || '',
        translation: data.ayah?.translation || data.translation || '',
        surahName: data.surah?.name || data.surahName || '',
        surahNumber: data.surah?.number || data.surahNumber || 0,
        ayahNumber: data.ayah?.numberInSurah || data.ayahNumber || 0,
        date: getTodayDate(),
      };

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

        // Check if the stored ayah is from today
        if (parsedData.date === today) {
          setDailyAyah(parsedData);
          setInitialized(true);
          setLoading(false);
          return;
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
