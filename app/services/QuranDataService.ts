/**
 * QuranDataService - Quran Text Management
 * Auto-downloads and manages Arabic Quran text for offline reading
 */

import * as FileSystem from 'expo-file-system/legacy';
import AsyncStorage from '@react-native-async-storage/async-storage';
import StorageService, { DownloadMetadata } from './StorageService';
import { apiService } from './ApiService';

const QURAN_VERSION_KEY = '@quran_text_version';
const CURRENT_QURAN_VERSION = '1.0.0';

interface QuranTextData {
  surahs: Array<{
    number: number;
    name: string;
    englishName: string;
    ayahs: Array<{
      number: number;
      text: string;
      numberInSurah: number;
    }>;
  }>;
  version: string;
  downloadedAt: string;
}

class QuranDataService {
  /**
   * Check if Quran text needs to be downloaded
   */
  async needsDownload(): Promise<boolean> {
    try {
      // Check if file exists
      const filePath = StorageService.getQuranTextFilePath();
      const exists = await StorageService.fileExists(filePath);

      if (!exists) {
        return true;
      }

      // Check version
      const storedVersion = await AsyncStorage.getItem(QURAN_VERSION_KEY);
      if (storedVersion !== CURRENT_QURAN_VERSION) {
        return true;
      }

      return false;
    } catch (error) {
      console.error('❌ Error checking Quran download status:', error);
      return true;
    }
  }

  /**
   * Auto-download Quran text (runs on first launch or when outdated)
   */
  async autoDownloadQuranText(onProgress?: (progress: number) => void): Promise<void> {
    try {
      console.log('📥 Starting auto-download of Quran text...');

      const needsUpdate = await this.needsDownload();
      if (!needsUpdate) {
        console.log('✅ Quran text already up-to-date');
        return;
      }

      // Fetch complete Quran text from API
      // Using quran.com edition for Arabic text
      const quranData = await this.fetchQuranTextFromAPI(onProgress);

      // Save to file system
      const filePath = StorageService.getQuranTextFilePath();
      await FileSystem.writeAsStringAsync(filePath, JSON.stringify(quranData));

      // Save metadata
      const fileSize = await StorageService.getFileSize(filePath);
      const metadata: DownloadMetadata = {
        id: 'quran_arabic_text',
        type: 'quran',
        fileUri: filePath,
        fileName: 'quran_arabic.json',
        fileSize,
        downloadedAt: new Date().toISOString(),
        isComplete: true,
      };

      await StorageService.saveDownloadMetadata(metadata);

      // Save version
      await AsyncStorage.setItem(QURAN_VERSION_KEY, CURRENT_QURAN_VERSION);

      console.log('✅ Quran text auto-download complete');

      if (onProgress) {
        onProgress(100);
      }
    } catch (error) {
      console.error('❌ Failed to auto-download Quran text:', error);
      throw error;
    }
  }

  /**
   * Fetch Quran text from API
   */
  private async fetchQuranTextFromAPI(onProgress?: (progress: number) => void): Promise<QuranTextData> {
    try {
      const surahs: QuranTextData['surahs'] = [];
      const totalSurahs = 114;

      for (let surahNumber = 1; surahNumber <= totalSurahs; surahNumber++) {
        // Fetch each surah
        const response = await fetch(
          `https://api.alquran.cloud/v1/surah/${surahNumber}/quran-simple`
        );
        const data = await response.json();

        if (data.code === 200 && data.data) {
          const surahData = data.data;
          surahs.push({
            number: surahData.number,
            name: surahData.name,
            englishName: surahData.englishName,
            ayahs: surahData.ayahs.map((ayah: any) => ({
              number: ayah.number,
              text: ayah.text,
              numberInSurah: ayah.numberInSurah,
            })),
          });

          // Report progress
          const progress = Math.round((surahNumber / totalSurahs) * 100);
          if (onProgress) {
            onProgress(progress);
          }

          console.log(`📥 Downloaded surah ${surahNumber}/${totalSurahs}`);
        }

        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      return {
        surahs,
        version: CURRENT_QURAN_VERSION,
        downloadedAt: new Date().toISOString(),
      };
    } catch (error) {
      console.error('❌ Failed to fetch Quran from API:', error);
      throw error;
    }
  }

  /**
   * Get Quran text from local storage
   */
  async getQuranText(): Promise<QuranTextData | null> {
    try {
      const filePath = StorageService.getQuranTextFilePath();
      const exists = await StorageService.fileExists(filePath);

      if (!exists) {
        return null;
      }

      const content = await FileSystem.readAsStringAsync(filePath);
      return JSON.parse(content);
    } catch (error) {
      console.error('❌ Failed to read Quran text:', error);
      return null;
    }
  }

  /**
   * Get specific surah from local storage
   */
  async getSurah(surahNumber: number): Promise<QuranTextData['surahs'][0] | null> {
    try {
      const quranData = await this.getQuranText();
      if (!quranData) {
        return null;
      }

      return quranData.surahs.find(s => s.number === surahNumber) || null;
    } catch (error) {
      console.error('❌ Failed to get surah:', error);
      return null;
    }
  }

  /**
   * Check if Quran text is available offline
   */
  async isAvailableOffline(): Promise<boolean> {
    return await StorageService.isQuranTextDownloaded();
  }

  /**
   * Get download progress info
   */
  async getDownloadInfo(): Promise<{
    isDownloaded: boolean;
    version: string;
    downloadedAt?: string;
    fileSize?: number;
  }> {
    const isDownloaded = await this.isAvailableOffline();
    const version = (await AsyncStorage.getItem(QURAN_VERSION_KEY)) || 'Unknown';

    if (!isDownloaded) {
      return { isDownloaded: false, version };
    }

    const metadata = await StorageService.getDownloadMetadata('quran');
    const quranMeta = metadata.find(m => m.id === 'quran_arabic_text');

    return {
      isDownloaded: true,
      version,
      downloadedAt: quranMeta?.downloadedAt,
      fileSize: quranMeta?.fileSize,
    };
  }
}

export default new QuranDataService();
