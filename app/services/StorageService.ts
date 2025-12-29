/**
 * StorageService - File System Management
 * Handles all local file storage operations
 */

import * as FileSystem from 'expo-file-system/legacy';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEYS = {
  QURAN_TEXT: '@quran_text_downloaded',
  DOWNLOADED_AUDIO: '@downloaded_audio',
  DOWNLOADED_TRANSLATIONS: '@downloaded_translations',
};

export interface DownloadMetadata {
  id: string;
  type: 'audio' | 'translation' | 'quran';
  reciterId?: string;
  surahNumber?: number;
  translationId?: string;
  fileUri: string;
  fileName: string;
  fileSize: number;
  downloadedAt: string;
  isComplete: boolean;
}

class StorageService {
  // Base directories
  private readonly BASE_DIR = FileSystem.documentDirectory + 'noor-ul-quran/';
  private readonly AUDIO_DIR = this.BASE_DIR + 'audio/';
  private readonly TRANSLATIONS_DIR = this.BASE_DIR + 'translations/';
  private readonly QURAN_DIR = this.BASE_DIR + 'quran/';

  /**
   * Initialize storage directories
   */
  async initialize(): Promise<void> {
    try {
      // Create base directories if they don't exist
      await this.createDirectory(this.BASE_DIR);
      await this.createDirectory(this.AUDIO_DIR);
      await this.createDirectory(this.TRANSLATIONS_DIR);
      await this.createDirectory(this.QURAN_DIR);

      console.log('✅ Storage initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize storage:', error);
      throw error;
    }
  }

  /**
   * Create directory if it doesn't exist
   */
  private async createDirectory(dirPath: string): Promise<void> {
    const dirInfo = await FileSystem.getInfoAsync(dirPath);
    if (!dirInfo.exists) {
      await FileSystem.makeDirectoryAsync(dirPath, { intermediates: true });
    }
  }

  /**
   * Get audio file path for a reciter and surah
   */
  getAudioFilePath(reciterId: string, surahNumber: number): string {
    const reciterDir = this.AUDIO_DIR + reciterId + '/';
    return reciterDir + `surah_${surahNumber}.mp3`;
  }

  /**
   * Get Quran text file path
   */
  getQuranTextFilePath(): string {
    return this.QURAN_DIR + 'quran_arabic.json';
  }

  /**
   * Get translation file path
   */
  getTranslationFilePath(translationId: string): string {
    return this.TRANSLATIONS_DIR + `${translationId}.json`;
  }

  /**
   * Check if file exists
   */
  async fileExists(filePath: string): Promise<boolean> {
    try {
      const fileInfo = await FileSystem.getInfoAsync(filePath);
      return fileInfo.exists;
    } catch {
      return false;
    }
  }

  /**
   * Get file size
   */
  async getFileSize(filePath: string): Promise<number> {
    try {
      const fileInfo = await FileSystem.getInfoAsync(filePath);
      const size = fileInfo.exists && fileInfo.size ? fileInfo.size : 0;
      console.log(`📏 File size for ${filePath.split('/').pop()}:`, {
        exists: fileInfo.exists,
        size: size,
        sizeMB: (size / 1024 / 1024).toFixed(2)
      });
      return size;
    } catch (error) {
      console.error('❌ Error getting file size:', error);
      return 0;
    }
  }

  /**
   * Delete file
   */
  async deleteFile(filePath: string): Promise<void> {
    try {
      const exists = await this.fileExists(filePath);
      if (exists) {
        await FileSystem.deleteAsync(filePath);
        console.log('🗑️ Deleted file:', filePath);
      }
    } catch (error) {
      console.error('❌ Failed to delete file:', error);
      throw error;
    }
  }

  /**
   * Save download metadata
   */
  async saveDownloadMetadata(metadata: DownloadMetadata): Promise<void> {
    try {
      const key = this.getStorageKeyForType(metadata.type);
      const existing = await this.getDownloadMetadata(metadata.type);

      // Add or update metadata
      const updated = [...existing.filter(m => m.id !== metadata.id), metadata];

      await AsyncStorage.setItem(key, JSON.stringify(updated));
      console.log('💾 Saved download metadata:', metadata.id);
    } catch (error) {
      console.error('❌ Failed to save metadata:', error);
      throw error;
    }
  }

  /**
   * Get download metadata by type
   */
  async getDownloadMetadata(type: 'audio' | 'translation' | 'quran'): Promise<DownloadMetadata[]> {
    try {
      const key = this.getStorageKeyForType(type);
      const data = await AsyncStorage.getItem(key);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('❌ Failed to get metadata:', error);
      return [];
    }
  }

  /**
   * Check if audio is downloaded
   */
  async isAudioDownloaded(reciterId: string, surahNumber: number): Promise<boolean> {
    const filePath = this.getAudioFilePath(reciterId, surahNumber);
    return await this.fileExists(filePath);
  }

  /**
   * Check if Quran text is downloaded
   */
  async isQuranTextDownloaded(): Promise<boolean> {
    const filePath = this.getQuranTextFilePath();
    return await this.fileExists(filePath);
  }

  /**
   * Get all downloaded audio for a reciter
   */
  async getDownloadedSurahsForReciter(reciterId: string): Promise<number[]> {
    try {
      const metadata = await this.getDownloadMetadata('audio');
      return metadata
        .filter(m => m.reciterId === reciterId && m.isComplete)
        .map(m => m.surahNumber!)
        .sort((a, b) => a - b);
    } catch {
      return [];
    }
  }

  /**
   * Get total storage used
   */
  async getTotalStorageUsed(): Promise<number> {
    try {
      let total = 0;
      const allMetadata = [
        ...(await this.getDownloadMetadata('audio')),
        ...(await this.getDownloadMetadata('translation')),
        ...(await this.getDownloadMetadata('quran')),
      ];

      for (const meta of allMetadata) {
        total += meta.fileSize;
      }

      return total;
    } catch {
      return 0;
    }
  }

  /**
   * Clear all downloads
   */
  async clearAllDownloads(): Promise<void> {
    try {
      await FileSystem.deleteAsync(this.BASE_DIR, { idempotent: true });
      await AsyncStorage.multiRemove(Object.values(STORAGE_KEYS));
      await this.initialize();
      console.log('🗑️ Cleared all downloads');
    } catch (error) {
      console.error('❌ Failed to clear downloads:', error);
      throw error;
    }
  }

  /**
   * Get storage key for type
   */
  private getStorageKeyForType(type: 'audio' | 'translation' | 'quran'): string {
    switch (type) {
      case 'audio':
        return STORAGE_KEYS.DOWNLOADED_AUDIO;
      case 'translation':
        return STORAGE_KEYS.DOWNLOADED_TRANSLATIONS;
      case 'quran':
        return STORAGE_KEYS.QURAN_TEXT;
      default:
        throw new Error('Invalid type');
    }
  }
}

export default new StorageService();
