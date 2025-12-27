import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiService } from '../services/ApiService';

interface Bookmark {
  id: string;
  surahName: string;
  surahNumber: number;
  ayahNumber: number;
  arabicText: string;
  translation: string;
  timestamp: number;
  created_at?: string;
  surah_name?: string;
  surah_number?: number;
  ayah_number?: number;
  arabic_text?: string;
}

interface BookmarksContextType {
  bookmarks: Bookmark[];
  loading: boolean;
  addBookmark: (bookmark: Omit<Bookmark, 'id' | 'timestamp'>) => Promise<void>;
  removeBookmark: (id: string) => Promise<void>;
  isBookmarked: (surahNumber: number, ayahNumber: number) => boolean;
  loadBookmarks: () => Promise<void>;
}

const BookmarksContext = createContext<BookmarksContextType | undefined>(undefined);

const BOOKMARKS_STORAGE_KEY = '@quran_bookmarks';

export const BookmarksProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  // Load bookmarks on mount
  useEffect(() => {
    loadBookmarks();
  }, []);

  /**
   * Normalize backend bookmark to app format
   */
  const normalizeBookmark = (bookmark: any): Bookmark => {
    return {
      id: bookmark.id?.toString() || bookmark.id,
      surahName: bookmark.surah_name || bookmark.surahName,
      surahNumber: bookmark.surah_number || bookmark.surahNumber,
      ayahNumber: bookmark.ayah_number || bookmark.ayahNumber,
      arabicText: bookmark.arabic_text || bookmark.arabicText,
      translation: bookmark.translation,
      timestamp: bookmark.created_at ? new Date(bookmark.created_at).getTime() : bookmark.timestamp || Date.now(),
    };
  };

  /**
   * Load bookmarks from backend and fallback to AsyncStorage
   */
  const loadBookmarks = async () => {
    try {
      setLoading(true);

      // Check if user is authenticated before attempting backend fetch
      const authToken = await AsyncStorage.getItem('@auth_token');

      if (authToken) {
        // Try to load from backend if authenticated
        try {
          const backendBookmarks = await apiService.getAyahBookmarks();
          // Ensure backendBookmarks is an array
          const bookmarksArray = Array.isArray(backendBookmarks) ? backendBookmarks : [];
          const normalized = bookmarksArray.map(normalizeBookmark);
          setBookmarks(normalized);

          // Update AsyncStorage cache
          await AsyncStorage.setItem(BOOKMARKS_STORAGE_KEY, JSON.stringify(normalized));
          console.log('📚 Loaded', normalized.length, 'bookmarks from backend');
          return;
        } catch (backendError) {
          console.log('⚠️ Backend bookmarks failed, falling back to local storage');
        }
      } else {
        console.log('📖 User not authenticated, loading from local storage only');
      }

      // Fallback: Load from AsyncStorage if backend fails or user not authenticated
      const storedBookmarks = await AsyncStorage.getItem(BOOKMARKS_STORAGE_KEY);
      if (storedBookmarks) {
        try {
          const parsed = JSON.parse(storedBookmarks);
          // Ensure parsed is an array
          const bookmarksArray = Array.isArray(parsed) ? parsed : [];
          setBookmarks(bookmarksArray);
          console.log('📚 Loaded', bookmarksArray.length, 'bookmarks from local storage');
        } catch (parseError) {
          console.error('Error parsing stored bookmarks:', parseError);
          setBookmarks([]);
        }
      }
    } catch (error) {
      console.error('Error loading bookmarks:', error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Add a bookmark (syncs with backend)
   */
  const addBookmark = async (bookmark: Omit<Bookmark, 'id' | 'timestamp'>) => {
    try {
      // Check if it's a whole Surah/Juz bookmark (ayahNumber=0)
      const isWholeSurah = bookmark.ayahNumber === 0;

      // Try to add to backend only if it's NOT a whole surah (backend doesn't support ayahNumber=0)
      if (!isWholeSurah) {
        try {
          const backendBookmark = await apiService.addAyahBookmark(bookmark);
          const normalized = normalizeBookmark(backendBookmark);

          const updatedBookmarks = [normalized, ...bookmarks];
          setBookmarks(updatedBookmarks);

          // Update AsyncStorage cache
          await AsyncStorage.setItem(BOOKMARKS_STORAGE_KEY, JSON.stringify(updatedBookmarks));
          console.log('✅ Bookmark added to backend:', normalized.surahName, normalized.ayahNumber);
          return;
        } catch (backendError) {
          console.log('⚠️ Backend add failed, saving locally only');
        }
      } else {
        console.log('📖 Whole Surah/Juz bookmark - storing locally only (backend limitation)');
      }

      // Fallback: Save locally if backend fails OR if it's a whole surah bookmark
      const newBookmark: Bookmark = {
        ...bookmark,
        id: `local-${bookmark.surahNumber}-${bookmark.ayahNumber}-${Date.now()}`,
        timestamp: Date.now(),
      };

      const updatedBookmarks = [newBookmark, ...bookmarks];
      setBookmarks(updatedBookmarks);

      await AsyncStorage.setItem(BOOKMARKS_STORAGE_KEY, JSON.stringify(updatedBookmarks));
      console.log('✅ Bookmark added locally:', newBookmark.surahName, newBookmark.ayahNumber);
    } catch (error) {
      console.error('Error adding bookmark:', error);
      throw error;
    }
  };

  /**
   * Remove a bookmark (syncs with backend)
   */
  const removeBookmark = async (id: string) => {
    try {
      // Try to remove from backend first (if not a local-only bookmark)
      if (!id.startsWith('local-')) {
        try {
          await apiService.removeAyahBookmark(id);
          console.log('✅ Bookmark removed from backend:', id);
        } catch (backendError) {
          console.log('⚠️ Backend delete failed, removing locally only');
        }
      }

      // Remove locally regardless
      const updatedBookmarks = bookmarks.filter((b) => b.id !== id);
      setBookmarks(updatedBookmarks);

      await AsyncStorage.setItem(BOOKMARKS_STORAGE_KEY, JSON.stringify(updatedBookmarks));
      console.log('🗑️ Bookmark removed locally:', id);
    } catch (error) {
      console.error('Error removing bookmark:', error);
      throw error;
    }
  };

  /**
   * Check if an ayah is bookmarked
   */
  const isBookmarked = (surahNumber: number, ayahNumber: number): boolean => {
    return bookmarks.some(
      (b) => b.surahNumber === surahNumber && b.ayahNumber === ayahNumber
    );
  };

  const value: BookmarksContextType = {
    bookmarks,
    loading,
    addBookmark,
    removeBookmark,
    isBookmarked,
    loadBookmarks,
  };

  return <BookmarksContext.Provider value={value}>{children}</BookmarksContext.Provider>;
};

export const useBookmarks = () => {
  const context = useContext(BookmarksContext);
  if (context === undefined) {
    throw new Error('useBookmarks must be used within a BookmarksProvider');
  }
  return context;
};
