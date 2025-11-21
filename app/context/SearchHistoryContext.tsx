import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface SearchHistoryItem {
  id: string;
  ayahId: number;
  text: string;
  translation: string;
  surahName: string;
  surahNumber: number;
  ayahNumber: number;
  timestamp: number;
  searchQuery?: string;
}

interface SearchHistoryContextType {
  history: SearchHistoryItem[];
  addToHistory: (item: Omit<SearchHistoryItem, 'id' | 'timestamp'>) => Promise<void>;
  removeFromHistory: (id: string) => Promise<void>;
  clearHistory: () => Promise<void>;
  loading: boolean;
}

const SearchHistoryContext = createContext<SearchHistoryContextType | undefined>(undefined);

const SEARCH_HISTORY_KEY = '@search_history';
const MAX_HISTORY_ITEMS = 50;

export const SearchHistoryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [history, setHistory] = useState<SearchHistoryItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    loadHistory();
  }, []);

  /**
   * Load search history from AsyncStorage
   */
  const loadHistory = async () => {
    try {
      setLoading(true);
      const storedHistory = await AsyncStorage.getItem(SEARCH_HISTORY_KEY);

      if (storedHistory) {
        const parsedHistory: SearchHistoryItem[] = JSON.parse(storedHistory);
        // Sort by timestamp (most recent first)
        const sortedHistory = parsedHistory.sort((a, b) => b.timestamp - a.timestamp);
        setHistory(sortedHistory);
      }
    } catch (error) {
      console.error('Error loading search history:', error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Save history to AsyncStorage
   */
  const saveHistory = async (newHistory: SearchHistoryItem[]) => {
    try {
      await AsyncStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(newHistory));
    } catch (error) {
      console.error('Error saving search history:', error);
    }
  };

  /**
   * Add an item to search history
   */
  const addToHistory = async (item: Omit<SearchHistoryItem, 'id' | 'timestamp'>) => {
    try {
      const newItem: SearchHistoryItem = {
        ...item,
        id: `${item.ayahId}_${Date.now()}`,
        timestamp: Date.now(),
      };

      // Remove duplicate ayah if exists (keep only the latest)
      const filteredHistory = history.filter(h => h.ayahId !== item.ayahId);

      // Add new item at the beginning
      const updatedHistory = [newItem, ...filteredHistory];

      // Keep only MAX_HISTORY_ITEMS
      const trimmedHistory = updatedHistory.slice(0, MAX_HISTORY_ITEMS);

      setHistory(trimmedHistory);
      await saveHistory(trimmedHistory);
    } catch (error) {
      console.error('Error adding to search history:', error);
    }
  };

  /**
   * Remove an item from search history
   */
  const removeFromHistory = async (id: string) => {
    try {
      const updatedHistory = history.filter(item => item.id !== id);
      setHistory(updatedHistory);
      await saveHistory(updatedHistory);
    } catch (error) {
      console.error('Error removing from search history:', error);
    }
  };

  /**
   * Clear all search history
   */
  const clearHistory = async () => {
    try {
      setHistory([]);
      await AsyncStorage.removeItem(SEARCH_HISTORY_KEY);
    } catch (error) {
      console.error('Error clearing search history:', error);
    }
  };

  const value: SearchHistoryContextType = {
    history,
    addToHistory,
    removeFromHistory,
    clearHistory,
    loading,
  };

  return <SearchHistoryContext.Provider value={value}>{children}</SearchHistoryContext.Provider>;
};

export const useSearchHistory = () => {
  const context = useContext(SearchHistoryContext);
  if (context === undefined) {
    throw new Error('useSearchHistory must be used within a SearchHistoryProvider');
  }
  return context;
};
