/**
 * DownloadsContext - Global Download State Management
 * Manages all download operations and progress tracking
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import DownloadService, { DownloadProgress } from '../services/DownloadService';
import StorageService, { DownloadMetadata } from '../services/StorageService';
import QuranDataService from '../services/QuranDataService';

interface DownloadState {
  [downloadId: string]: DownloadProgress;
}

interface DownloadsContextType {
  // Download State
  downloads: DownloadState;
  isDownloading: (downloadId: string) => boolean;
  getDownloadProgress: (downloadId: string) => DownloadProgress | null;

  // Audio Downloads
  downloadAudio: (reciterId: string, surahNumber: number) => Promise<void>;
  downloadCompleteReciter: (reciterId: string) => Promise<void>;
  isAudioDownloaded: (reciterId: string, surahNumber: number) => Promise<boolean>;
  getDownloadedSurahsForReciter: (reciterId: string) => Promise<number[]>;
  cancelDownload: (downloadId: string) => Promise<void>;

  // Quran Text
  isQuranTextDownloaded: boolean;
  quranDownloadProgress: number;
  downloadQuranText: () => Promise<void>;

  // Storage Info
  downloadedAudio: DownloadMetadata[];
  downloadedTranslations: DownloadMetadata[];
  totalStorageUsed: number;
  refreshDownloads: () => Promise<void>;

  // Initialization
  isInitialized: boolean;
}

const DownloadsContext = createContext<DownloadsContextType | undefined>(undefined);

export const DownloadsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [downloads, setDownloads] = useState<DownloadState>({});
  const [downloadedAudio, setDownloadedAudio] = useState<DownloadMetadata[]>([]);
  const [downloadedTranslations, setDownloadedTranslations] = useState<DownloadMetadata[]>([]);
  const [totalStorageUsed, setTotalStorageUsed] = useState(0);
  const [isQuranTextDownloaded, setIsQuranTextDownloaded] = useState(false);
  const [quranDownloadProgress, setQuranDownloadProgress] = useState(0);
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize storage and check Quran text status
  useEffect(() => {
    initializeDownloads();
  }, []);

  const initializeDownloads = async () => {
    try {
      console.log('📦 Initializing downloads...');

      // Initialize storage directories
      await StorageService.initialize();

      // Check if Quran text is downloaded
      const isQuranDownloaded = await QuranDataService.isAvailableOffline();
      setIsQuranTextDownloaded(isQuranDownloaded);

      // Don't auto-download on startup - let user download manually from Downloads screen
      // This prevents background downloads from interfering with user experience
      if (!isQuranDownloaded) {
        console.log('ℹ️ Quran text not downloaded. User can download from Downloads screen.');
      }

      // Load existing downloads
      await refreshDownloads();

      setIsInitialized(true);
      console.log('✅ Downloads initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize downloads:', error);
      setIsInitialized(true); // Set to true anyway to not block the app
    }
  };

  const refreshDownloads = async () => {
    try {
      console.log('🔄 Starting refreshDownloads...');

      // Get all download metadata
      const audio = await StorageService.getDownloadMetadata('audio');
      const translations = await StorageService.getDownloadMetadata('translation');

      console.log('📥 Audio metadata:', audio.map(a => ({
        id: a.id,
        fileSize: a.fileSize,
        fileSizeMB: (a.fileSize / 1024 / 1024).toFixed(2)
      })));

      setDownloadedAudio(audio);
      setDownloadedTranslations(translations);

      // Calculate total storage
      const total = await StorageService.getTotalStorageUsed();
      setTotalStorageUsed(total);

      console.log('💾 Total storage calculated:', {
        totalBytes: total,
        totalMB: (total / 1024 / 1024).toFixed(2),
        totalGB: (total / 1024 / 1024 / 1024).toFixed(3)
      });

      // Check Quran text status
      const isQuranDownloaded = await QuranDataService.isAvailableOffline();
      setIsQuranTextDownloaded(isQuranDownloaded);

      console.log('✅ Downloads refreshed:', {
        audioFiles: audio.length,
        translationFiles: translations.length,
        totalStorageMB: (total / 1024 / 1024).toFixed(2),
      });
    } catch (error) {
      console.error('❌ Failed to refresh downloads:', error);
    }
  };

  const updateDownloadProgress = (progress: DownloadProgress) => {
    setDownloads(prev => ({
      ...prev,
      [progress.id]: progress,
    }));

    // Remove from state when complete
    if (progress.isComplete) {
      setTimeout(() => {
        setDownloads(prev => {
          const newState = { ...prev };
          delete newState[progress.id];
          return newState;
        });
        refreshDownloads(); // Refresh metadata after completion
      }, 2000);
    }
  };

  const downloadAudio = async (reciterId: string, surahNumber: number) => {
    const downloadId = `audio_${reciterId}_${surahNumber}`;

    try {
      // Check if already downloaded
      const isDownloaded = await StorageService.isAudioDownloaded(reciterId, surahNumber);
      if (isDownloaded) {
        console.log('✅ Audio already downloaded:', downloadId);
        return;
      }

      console.log(`📥 Starting audio download: ${downloadId}`);

      await DownloadService.downloadAudio(
        reciterId,
        surahNumber,
        updateDownloadProgress
      );

      console.log(`✅ Audio download complete: ${downloadId}`);
    } catch (error: any) {
      console.error(`❌ Audio download failed for ${downloadId}:`, error.message || error);

      // Clear progress state on error
      setDownloads(prev => {
        const newState = { ...prev };
        delete newState[downloadId];
        return newState;
      });

      throw new Error(`Failed to download Surah ${surahNumber}: ${error.message || 'Unknown error'}`);
    }
  };

  const downloadCompleteReciter = async (reciterId: string) => {
    try {
      console.log('📥 Starting complete reciter download:', reciterId);

      await DownloadService.downloadCompleteQuran(
        reciterId,
        updateDownloadProgress
      );

      console.log('✅ Complete reciter download finished:', reciterId);
      await refreshDownloads();
    } catch (error) {
      console.error('❌ Complete reciter download failed:', error);
      throw error;
    }
  };

  const downloadQuranText = async () => {
    try {
      console.log('📥 Starting Quran text download...');

      await QuranDataService.autoDownloadQuranText((progress) => {
        setQuranDownloadProgress(progress);
        console.log('📊 Quran download progress:', progress + '%');
      });

      setIsQuranTextDownloaded(true);
      setQuranDownloadProgress(100);
      await refreshDownloads();

      console.log('✅ Quran text download complete');
    } catch (error) {
      console.error('❌ Quran text download failed:', error);
      setQuranDownloadProgress(0);
      throw error;
    }
  };

  const isAudioDownloaded = async (reciterId: string, surahNumber: number): Promise<boolean> => {
    return await StorageService.isAudioDownloaded(reciterId, surahNumber);
  };

  const getDownloadedSurahsForReciter = async (reciterId: string): Promise<number[]> => {
    return await StorageService.getDownloadedSurahsForReciter(reciterId);
  };

  const cancelDownload = async (downloadId: string) => {
    try {
      await DownloadService.cancelDownload(downloadId);
      setDownloads(prev => {
        const newState = { ...prev };
        delete newState[downloadId];
        return newState;
      });
      console.log('⏸️ Download cancelled:', downloadId);
    } catch (error) {
      console.error('❌ Failed to cancel download:', error);
      throw error;
    }
  };

  const isDownloading = (downloadId: string): boolean => {
    return downloads[downloadId] !== undefined && !downloads[downloadId].isComplete;
  };

  const getDownloadProgress = (downloadId: string): DownloadProgress | null => {
    return downloads[downloadId] || null;
  };

  const value: DownloadsContextType = {
    downloads,
    isDownloading,
    getDownloadProgress,
    downloadAudio,
    downloadCompleteReciter,
    isAudioDownloaded,
    getDownloadedSurahsForReciter,
    cancelDownload,
    isQuranTextDownloaded,
    quranDownloadProgress,
    downloadQuranText,
    downloadedAudio,
    downloadedTranslations,
    totalStorageUsed,
    refreshDownloads,
    isInitialized,
  };

  return (
    <DownloadsContext.Provider value={value}>
      {children}
    </DownloadsContext.Provider>
  );
};

export const useDownloads = (): DownloadsContextType => {
  const context = useContext(DownloadsContext);
  if (context === undefined) {
    throw new Error('useDownloads must be used within a DownloadsProvider');
  }
  return context;
};
