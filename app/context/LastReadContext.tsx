import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface LastReadItem {
  type: 'reading';
  surahName: string;
  surahNumber: number;
  ayahNumber: number;
  timestamp: number;
  timeSpent: number; // in seconds
  verseCount: number;
}

interface LastReadContextType {
  lastRead: LastReadItem | null;
  loading: boolean;
  updateLastRead: (item: Omit<LastReadItem, 'type' | 'timestamp'>) => Promise<void>;
  clearLastRead: () => Promise<void>;
}

const LastReadContext = createContext<LastReadContextType | undefined>(undefined);

const LAST_READ_KEY = '@last_read_item';

export const LastReadProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [lastRead, setLastRead] = useState<LastReadItem | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Load last read on mount
  useEffect(() => {
    loadLastRead();
  }, []);

  /**
   * Load last read from AsyncStorage
   */
  const loadLastRead = async () => {
    try {
      setLoading(true);
      const stored = await AsyncStorage.getItem(LAST_READ_KEY);
      if (stored) {
        const item = JSON.parse(stored);
        setLastRead(item);
        console.log('📖 Loaded last read:', item.surahName, item.ayahNumber);
      }
    } catch (error) {
      console.error('Error loading last read:', error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Update last read - replaces previous one
   */
  const updateLastRead = async (item: Omit<LastReadItem, 'type' | 'timestamp'>) => {
    try {
      const newLastRead: LastReadItem = {
        type: 'reading',
        ...item,
        timestamp: Date.now(),
      };

      setLastRead(newLastRead);
      await AsyncStorage.setItem(LAST_READ_KEY, JSON.stringify(newLastRead));
      console.log('✅ Last read updated:', newLastRead.surahName, newLastRead.ayahNumber);
    } catch (error) {
      console.error('Error updating last read:', error);
      throw error;
    }
  };

  /**
   * Clear last read
   */
  const clearLastRead = async () => {
    try {
      setLastRead(null);
      await AsyncStorage.removeItem(LAST_READ_KEY);
      console.log('🗑️ Last read cleared');
    } catch (error) {
      console.error('Error clearing last read:', error);
      throw error;
    }
  };

  const value: LastReadContextType = {
    lastRead,
    loading,
    updateLastRead,
    clearLastRead,
  };

  return <LastReadContext.Provider value={value}>{children}</LastReadContext.Provider>;
};

export const useLastRead = () => {
  const context = useContext(LastReadContext);
  if (context === undefined) {
    throw new Error('useLastRead must be used within a LastReadProvider');
  }
  return context;
};
