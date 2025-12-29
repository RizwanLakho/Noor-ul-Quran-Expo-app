import React, { useState, useEffect } from 'react';
import {
  View,
  TouchableOpacity,
  StatusBar,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { useDownloads } from '../context/DownloadsContext';
import { useCustomAlert } from '../context/CustomAlertContext';
import StyledText from '../components/StyledText';

interface ReciterSurahsScreenProps {
  navigation: any;
  route: {
    params: {
      reciter: {
        identifier: string;
        englishName: string;
        name: string;
      };
    };
  };
}

interface SurahDownloadStatus {
  surahNumber: number;
  isDownloaded: boolean;
  isDownloading: boolean;
}

export default function ReciterSurahsScreen({ navigation, route }: ReciterSurahsScreenProps) {
  const { reciter } = route.params;
  const { colors, isDark } = useTheme();
  const { t } = useLanguage();
  const {
    downloadAudio,
    downloadCompleteReciter,
    isAudioDownloaded,
    getDownloadedSurahsForReciter,
    isDownloading,
    getDownloadProgress,
    cancelDownload,
  } = useDownloads();
  const { showAlert } = useCustomAlert();

  const [surahStatuses, setSurahStatuses] = useState<SurahDownloadStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [downloadingAll, setDownloadingAll] = useState(false);

  useEffect(() => {
    loadSurahStatuses();
  }, []);

  // Refresh statuses when downloads change
  useEffect(() => {
    const interval = setInterval(() => {
      updateDownloadStatuses();
    }, 500);

    return () => clearInterval(interval);
  }, []);

  const loadSurahStatuses = async () => {
    try {
      setLoading(true);
      const downloadedSurahs = await getDownloadedSurahsForReciter(reciter.identifier);

      const statuses: SurahDownloadStatus[] = [];
      for (let i = 1; i <= 114; i++) {
        statuses.push({
          surahNumber: i,
          isDownloaded: downloadedSurahs.includes(i),
          isDownloading: false,
        });
      }

      setSurahStatuses(statuses);
    } catch (error) {
      console.error('Failed to load surah statuses:', error);
      showAlert(t('error'), 'Failed to load download status', 'error');
    } finally {
      setLoading(false);
    }
  };

  const updateDownloadStatuses = () => {
    setSurahStatuses(prev =>
      prev.map(status => {
        const downloadId = `audio_${reciter.identifier}_${status.surahNumber}`;
        const progress = getDownloadProgress(downloadId);

        if (progress) {
          return {
            ...status,
            isDownloading: !progress.isComplete,
            isDownloaded: progress.isComplete || status.isDownloaded,
          };
        }

        return status;
      })
    );
  };

  const handleDownloadSurah = async (surahNumber: number) => {
    try {
      console.log(`📥 User clicked download for Surah ${surahNumber}`);

      // Update UI immediately to show downloading state
      setSurahStatuses(prev =>
        prev.map(s =>
          s.surahNumber === surahNumber
            ? { ...s, isDownloading: true }
            : s
        )
      );

      await downloadAudio(reciter.identifier, surahNumber);

      // Reload statuses after download
      await loadSurahStatuses();

      console.log(`✅ Surah ${surahNumber} download complete`);
    } catch (error: any) {
      console.error(`❌ Failed to download Surah ${surahNumber}:`, error);

      // Show user-friendly error message
      let errorMessage = `Failed to download Surah ${surahNumber}`;
      if (error.message) {
        if (error.message.includes('timeout')) {
          errorMessage = 'Download timed out. Please check your internet connection and try again.';
        } else if (error.message.includes('Network')) {
          errorMessage = 'Network error. Please check your internet connection.';
        } else {
          errorMessage = error.message;
        }
      }

      showAlert(t('error'), errorMessage, 'error');

      // Reset downloading state on error
      setSurahStatuses(prev =>
        prev.map(s =>
          s.surahNumber === surahNumber
            ? { ...s, isDownloading: false }
            : s
        )
      );
    }
  };

  const handleDownloadAll = async () => {
    try {
      setDownloadingAll(true);
      await downloadCompleteReciter(reciter.identifier);
      await loadSurahStatuses();
      showAlert(t('success'), t('allSurahsDownloaded'), 'success');
    } catch (error) {
      showAlert(t('error'), 'Failed to download all surahs', 'error');
    } finally {
      setDownloadingAll(false);
    }
  };

  const handleCancelDownload = async (surahNumber: number) => {
    try {
      console.log(`❌ User cancelled download for Surah ${surahNumber}`);
      const downloadId = `audio_${reciter.identifier}_${surahNumber}`;

      // Update UI immediately
      setSurahStatuses(prev =>
        prev.map(s =>
          s.surahNumber === surahNumber
            ? { ...s, isDownloading: false }
            : s
        )
      );

      await cancelDownload(downloadId);
      console.log(`✅ Download cancelled for Surah ${surahNumber}`);

      // Reload statuses
      await loadSurahStatuses();
    } catch (error) {
      console.error(`❌ Failed to cancel download for Surah ${surahNumber}:`, error);
      showAlert(t('error'), 'Failed to cancel download', 'error');
    }
  };

  const formatFileSize = (bytes: number): string => {
    const mb = bytes / 1024 / 1024;
    return mb.toFixed(1) + ' MB';
  };

  const getDownloadedCount = (): number => {
    return surahStatuses.filter(s => s.isDownloaded).length;
  };

  const renderSurahItem = (status: SurahDownloadStatus) => {
    const { surahNumber, isDownloaded, isDownloading } = status;

    return (
      <View
        key={surahNumber}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: 16,
          paddingVertical: 12,
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
          backgroundColor: colors.surface,
        }}>
        {/* Surah Number Badge */}
        <View
          style={{
            height: 40,
            width: 40,
            borderRadius: 20,
            backgroundColor: isDownloaded ? colors.primary : colors.border,
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: 12,
          }}>
          <StyledText
            style={{
              fontSize: 14,
              fontWeight: 'bold',
              color: isDownloaded ? '#FFFFFF' : colors.textSecondary,
            }}>
            {surahNumber}
          </StyledText>
        </View>

        {/* Surah Info */}
        <View style={{ flex: 1 }}>
          <StyledText style={{ fontSize: 14, fontWeight: '600', color: colors.text }}>
            Surah {surahNumber}
          </StyledText>
          {isDownloading && (
            <StyledText
              style={{ fontSize: 11, color: colors.primary, marginTop: 2 }}>
              Downloading...
            </StyledText>
          )}
          {isDownloaded && (
            <StyledText
              style={{ fontSize: 11, color: colors.success, marginTop: 2 }}>
              Downloaded
            </StyledText>
          )}
        </View>

        {/* Download Status/Button */}
        <View style={{ marginLeft: 12 }}>
          {isDownloaded ? (
            <Ionicons name="checkmark-circle" size={28} color={colors.success} />
          ) : isDownloading ? (
            <ActivityIndicator size="small" color={colors.primary} />
          ) : (
            <TouchableOpacity onPress={() => handleDownloadSurah(surahNumber)}>
              <Ionicons name="cloud-download-outline" size={28} color={colors.primary} />
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['top']}>
        <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

        {/* Header */}
        <View
          style={{
            borderBottomWidth: 1,
            borderBottomColor: colors.border,
            backgroundColor: colors.surface,
            paddingHorizontal: 20,
            paddingVertical: 16,
          }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginRight: 12 }}>
              <Ionicons name="arrow-back" size={24} color={colors.primary} />
            </TouchableOpacity>
            <StyledText style={{ fontSize: 20, fontWeight: 'bold', color: colors.text }}>
              {reciter.englishName}
            </StyledText>
          </View>
        </View>

        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator size="large" color={colors.primary} />
          <StyledText style={{ marginTop: 16, color: colors.textSecondary }}>
            Loading surahs...
          </StyledText>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['top']}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

      {/* Header */}
      <View
        style={{
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
          backgroundColor: colors.surface,
          paddingHorizontal: 20,
          paddingVertical: 16,
        }}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginRight: 12 }}>
            <Ionicons name="arrow-back" size={24} color={colors.primary} />
          </TouchableOpacity>
          <View style={{ flex: 1 }}>
            <StyledText style={{ fontSize: 20, fontWeight: 'bold', color: colors.text }}>
              {reciter.englishName}
            </StyledText>
            <StyledText style={{ fontSize: 12, color: colors.textSecondary, marginTop: 2 }}>
              {getDownloadedCount()}/114 surahs downloaded
            </StyledText>
          </View>
        </View>
      </View>

      {/* Download All Button */}
      <View style={{ padding: 16, backgroundColor: colors.background }}>
        <TouchableOpacity
          onPress={handleDownloadAll}
          disabled={downloadingAll || getDownloadedCount() === 114}
          style={{
            backgroundColor:
              getDownloadedCount() === 114 ? colors.border : colors.primary,
            paddingVertical: 14,
            borderRadius: 12,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            opacity: downloadingAll ? 0.6 : 1,
          }}>
          {downloadingAll ? (
            <ActivityIndicator size="small" color="#FFFFFF" style={{ marginRight: 8 }} />
          ) : (
            <Ionicons
              name={getDownloadedCount() === 114 ? 'checkmark-circle' : 'cloud-download'}
              size={20}
              color="#FFFFFF"
              style={{ marginRight: 8 }}
            />
          )}
          <StyledText style={{ fontSize: 16, fontWeight: 'bold', color: '#FFFFFF' }}>
            {getDownloadedCount() === 114
              ? 'All Surahs Downloaded'
              : downloadingAll
              ? 'Downloading All...'
              : 'Download All Surahs'}
          </StyledText>
        </TouchableOpacity>

        {/* Info Text */}
        <StyledText
          style={{
            fontSize: 11,
            color: colors.textSecondary,
            textAlign: 'center',
            marginTop: 8,
          }}>
          Downloading all 114 surahs (~500-800 MB)
        </StyledText>
      </View>

      {/* Surahs List */}
      <ScrollView style={{ flex: 1 }}>
        {surahStatuses.map(status => renderSurahItem(status))}
      </ScrollView>
    </SafeAreaView>
  );
}
