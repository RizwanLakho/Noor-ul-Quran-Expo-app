/**
 * DownloadService - Download Management
 * Handles all download operations with progress tracking
 */

import * as FileSystem from 'expo-file-system/legacy';
import StorageService, { DownloadMetadata } from './StorageService';

export interface DownloadProgress {
  id: string;
  progress: number; // 0-100
  bytesDownloaded: number;
  totalBytes: number;
  isComplete: boolean;
  error?: string;
}

export type DownloadProgressCallback = (progress: DownloadProgress) => void;

class DownloadService {
  private activeDownloads: Map<string, FileSystem.DownloadResumable> = new Map();
  private progressCallbacks: Map<string, DownloadProgressCallback> = new Map();

  /**
   * Download audio for a specific surah
   */
  async downloadAudio(
    reciterId: string,
    surahNumber: number,
    onProgress?: DownloadProgressCallback
  ): Promise<string> {
    const downloadId = `audio_${reciterId}_${surahNumber}`;

    try {
      console.log(`📥 downloadAudio called for: ${reciterId}, Surah ${surahNumber}`);

      // Get audio URL from API
      const audioUrl = await this.getAudioUrlFromAPI(reciterId, surahNumber);
      console.log(`🔗 Audio URL: ${audioUrl}`);

      // Create reciter directory if needed
      const reciterDir = FileSystem.documentDirectory + `noor-ul-quran/audio/${reciterId}/`;
      const dirInfo = await FileSystem.getInfoAsync(reciterDir);
      if (!dirInfo.exists) {
        await FileSystem.makeDirectoryAsync(reciterDir, { intermediates: true });
      }

      // Get destination file path
      const filePath = StorageService.getAudioFilePath(reciterId, surahNumber);
      console.log(`💾 Will save to: ${filePath}`);

      // Check if already downloaded
      if (await StorageService.fileExists(filePath)) {
        console.log('✅ Audio already downloaded:', downloadId);
        return filePath;
      }

      console.log(`⬇️ Starting download for Surah ${surahNumber}:`, downloadId);

      // Create download resumable
      const downloadResumable = FileSystem.createDownloadResumable(
        audioUrl,
        filePath,
        {},
        (downloadProgress) => {
          const progress = downloadProgress.totalBytesWritten / downloadProgress.totalBytesExpectedToWrite;
          const progressPercent = Math.round(progress * 100);

          console.log(`📊 Download progress for Surah ${surahNumber}: ${progressPercent}% (${downloadProgress.totalBytesWritten}/${downloadProgress.totalBytesExpectedToWrite} bytes)`);

          const progressData: DownloadProgress = {
            id: downloadId,
            progress: progressPercent,
            bytesDownloaded: downloadProgress.totalBytesWritten,
            totalBytes: downloadProgress.totalBytesExpectedToWrite,
            isComplete: false,
          };

          if (onProgress) {
            onProgress(progressData);
          }

          // Call registered callback if exists
          const callback = this.progressCallbacks.get(downloadId);
          if (callback) {
            callback(progressData);
          }
        }
      );

      this.activeDownloads.set(downloadId, downloadResumable);

      // Start download
      const result = await downloadResumable.downloadAsync();

      if (!result) {
        throw new Error('Download failed');
      }

      // Save metadata
      const metadata: DownloadMetadata = {
        id: downloadId,
        type: 'audio',
        reciterId,
        surahNumber,
        fileUri: result.uri,
        fileName: `surah_${surahNumber}.mp3`,
        fileSize: await StorageService.getFileSize(result.uri),
        downloadedAt: new Date().toISOString(),
        isComplete: true,
      };

      await StorageService.saveDownloadMetadata(metadata);

      // Cleanup
      this.activeDownloads.delete(downloadId);
      this.progressCallbacks.delete(downloadId);

      console.log(`✅ Download complete for Surah ${surahNumber}:`, downloadId);
      console.log(`📁 File saved: ${result.uri} (${(metadata.fileSize / 1024 / 1024).toFixed(2)} MB)`);

      // Notify completion
      if (onProgress) {
        onProgress({
          id: downloadId,
          progress: 100,
          bytesDownloaded: metadata.fileSize,
          totalBytes: metadata.fileSize,
          isComplete: true,
        });
      }

      return result.uri;
    } catch (error) {
      console.error('❌ Download failed:', downloadId, error);

      // Cleanup on error
      this.activeDownloads.delete(downloadId);
      this.progressCallbacks.delete(downloadId);

      // Notify error
      if (onProgress) {
        onProgress({
          id: downloadId,
          progress: 0,
          bytesDownloaded: 0,
          totalBytes: 0,
          isComplete: false,
          error: error instanceof Error ? error.message : 'Download failed',
        });
      }

      throw error;
    }
  }

  /**
   * Download entire Quran for a reciter (all 114 surahs)
   */
  async downloadCompleteQuran(
    reciterId: string,
    onProgress?: DownloadProgressCallback
  ): Promise<void> {
    const totalSurahs = 114;
    let completedSurahs = 0;

    for (let surahNumber = 1; surahNumber <= totalSurahs; surahNumber++) {
      try {
        await this.downloadAudio(reciterId, surahNumber, (progress) => {
          // Calculate overall progress
          const overallProgress = Math.round(
            ((completedSurahs + progress.progress / 100) / totalSurahs) * 100
          );

          if (onProgress) {
            onProgress({
              id: `complete_${reciterId}`,
              progress: overallProgress,
              bytesDownloaded: 0,
              totalBytes: 0,
              isComplete: overallProgress === 100,
            });
          }
        });

        completedSurahs++;
      } catch (error) {
        console.error(`❌ Failed to download surah ${surahNumber}:`, error);
        // Continue with next surah even if one fails
      }
    }

    console.log('✅ Complete Quran download finished for', reciterId);
  }

  /**
   * Cancel active download
   */
  async cancelDownload(downloadId: string): Promise<void> {
    const download = this.activeDownloads.get(downloadId);
    if (download) {
      try {
        await download.pauseAsync();
        this.activeDownloads.delete(downloadId);
        this.progressCallbacks.delete(downloadId);
        console.log('⏸️ Download cancelled:', downloadId);
      } catch (error) {
        console.error('❌ Failed to cancel download:', error);
      }
    }
  }

  /**
   * Register progress callback
   */
  registerProgressCallback(downloadId: string, callback: DownloadProgressCallback): void {
    this.progressCallbacks.set(downloadId, callback);
  }

  /**
   * Unregister progress callback
   */
  unregisterProgressCallback(downloadId: string): void {
    this.progressCallbacks.delete(downloadId);
  }

  /**
   * Get active downloads
   */
  getActiveDownloads(): string[] {
    return Array.from(this.activeDownloads.keys());
  }

  /**
   * Check if download is active
   */
  isDownloadActive(downloadId: string): boolean {
    return this.activeDownloads.has(downloadId);
  }

  /**
   * Map AlQuran.cloud reciter IDs to EveryAyah.com folder names for FULL SURAH downloads
   */
  private readonly RECITER_CDN_MAPPING: { [key: string]: string } = {
    'ar.alafasy': 'Alafasy_128kbps',
    'ar.abdullahbasfar': 'Abdullah_Basfar_192kbps',
    'ar.abdurrahmaansudais': 'Abdurrahmaan_As-Sudais_192kbps',
    'ar.shaatree': 'Abu_Bakr_Ash-Shaatree_128kbps',
    'ar.ahmedajamy': 'Ahmed_ibn_Ali_al-Ajamy_128kbps',
    'ar.husary': 'Husary_128kbps',
    'ar.minshawi': 'Minshawy_Mujawwad_128kbps',
    'ar.muhammadayyoub': 'Muhammad_Ayyoub_128kbps',
    'ar.mahermuaiqly': 'Maher_AlMuaiqly_128kbps',
    'ar.hanirifai': 'Hani_Rifai_192kbps',
  };

  /**
   * Get FULL SURAH audio URL using CDN
   * Falls back to API if CDN not available
   */
  private async getAudioUrlFromAPI(reciterId: string, surahNumber: number): Promise<string> {
    try {
      console.log(`🔍 Fetching FULL SURAH audio for ${reciterId}, Surah ${surahNumber}...`);

      // Try CDN first for FULL SURAH (Direct, no verification to save time)
      const cdnFolder = this.RECITER_CDN_MAPPING[reciterId];
      if (cdnFolder) {
        // EveryAyah.com CDN pattern for COMPLETE SURAH files
        const surahPadded = surahNumber.toString().padStart(3, '0');
        const cdnUrl = `https://everyayah.com/data/${cdnFolder}/${surahPadded}.mp3`;

        console.log(`✅ Using CDN for FULL SURAH download (trusted URL)`);
        console.log(`🔗 CDN URL: ${cdnUrl}`);

        // Return directly without verification - let download handle errors
        return cdnUrl;
      }

      // Fallback: Use API (returns first ayah only)
      console.log(`⚠️ No CDN mapping available, using API fallback (first ayah only)`);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => {
        console.error('⏱️ Audio URL fetch timeout after 8 seconds');
        controller.abort();
      }, 8000);

      const response = await fetch(
        `https://api.alquran.cloud/v1/surah/${surahNumber}/${reciterId}`,
        { signal: controller.signal }
      );
      clearTimeout(timeoutId);

      console.log(`📡 Audio API response status: ${response.status}`);
      const data = await response.json();

      if (data.code !== 200 || !data.data || !data.data.ayahs || data.data.ayahs.length === 0) {
        throw new Error(`API returned invalid data`);
      }

      const firstAyah = data.data.ayahs[0];
      if (firstAyah && firstAyah.audio) {
        console.log(`⚠️ WARNING: Downloading FIRST AYAH only (not full surah)`);
        console.log(`🔗 Audio URL: ${firstAyah.audio}`);
        return firstAyah.audio;
      }

      throw new Error('No audio URL found');
    } catch (error: any) {
      if (error.name === 'AbortError') {
        console.error('⏱️ Audio URL fetch timed out');
        throw new Error('Request timed out while fetching audio URL');
      }
      console.error('❌ Failed to get audio URL:', error.message || error);
      throw error;
    }
  }
}

export default new DownloadService();
