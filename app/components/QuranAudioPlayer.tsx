import React, { useState, useEffect, useRef } from 'react';
import { View, TouchableOpacity, ActivityIndicator, StyleSheet, Share } from 'react-native';
import { useAudioPlayer, AudioSource } from 'expo-audio';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useSettings } from '../context/SettingsContext';
import { useLanguage } from '../context/LanguageContext';
import { useNavigation } from '@react-navigation/native';
import StyledText from './StyledText';

interface QuranAudioPlayerProps {
  ayahs: any[]; // Array of ayahs with surah and ayah numbers
  currentIndex: number;
  onIndexChange: (index: number) => void;
  visible?: boolean;
}

// Audio URL fetcher from AlQuran.cloud API
const getAudioUrl = async (surah: number, ayah: number, reciterEdition: string): Promise<string> => {
  try {
    // Use AlQuran.cloud API to get ayah with audio
    const response = await fetch(
      `https://api.alquran.cloud/v1/ayah/${surah}:${ayah}/${reciterEdition}`
    );
    const data = await response.json();

    if (data.code === 200 && data.data && data.data.audio) {
      return data.data.audio;
    } else {
      // Fallback to default reciter if selected reciter doesn't have audio
      const fallbackResponse = await fetch(
        `https://api.alquran.cloud/v1/ayah/${surah}:${ayah}/ar.alafasy`
      );
      const fallbackData = await fallbackResponse.json();
      if (fallbackData.code === 200 && fallbackData.data && fallbackData.data.audio) {
        console.log('⚠️ Using fallback reciter (Alafasy)');
        return fallbackData.data.audio;
      }
    }

    throw new Error('No audio URL found');
  } catch (err) {
    console.error('Error fetching audio URL:', err);
    throw err;
  }
};

export default function QuranAudioPlayer({
  ayahs,
  currentIndex,
  onIndexChange,
  visible = true,
}: QuranAudioPlayerProps) {
  const { colors } = useTheme();
  const { quranAppearance, updateQuranAppearance } = useSettings();
  const { t } = useLanguage();
  const navigation = useNavigation();

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedTranslationLanguage, setSelectedTranslationLanguage] = useState<'en' | 'ur'>('en');
  const [audioUrl, setAudioUrl] = useState<string>('');

  // Get settings from context
  const selectedReciter = quranAppearance.selectedReciter || 'ar.alafasy';
  const autoRepeat = quranAppearance.autoRepeat || false;
  const isMuted = quranAppearance.isMuted || false;
  const playbackSpeed = quranAppearance.playbackSpeed || 1.0;
  const translatorRecitorEnabled = quranAppearance.translatorRecitorEnabled || false;

  const currentAyah = ayahs[currentIndex];
  const player = useAudioPlayer(audioUrl);

  // Fetch audio URL when ayah or reciter changes
  useEffect(() => {
    const fetchAudioUrl = async () => {
      if (currentAyah) {
        try {
          const url = await getAudioUrl(currentAyah.sura, currentAyah.aya, selectedReciter);
          setAudioUrl(url);
        } catch (err) {
          console.error('Failed to fetch audio URL:', err);
          setError(t('failedToLoadAudio'));
        }
      }
    };
    fetchAudioUrl();
  }, [currentIndex, currentAyah, selectedReciter]);

  const hasPlayedRef = useRef(false);

  // Get reciter name from identifier (AlQuran.cloud API format)
  const getReciterName = (identifier: string): string => {
    const reciters: { [key: string]: string } = {
      // AlQuran.cloud API format
      'ar.alafasy': 'Mishary Rashid Alafasy',
      'ar.abdullahbasfar': 'Abdullah Basfar',
      'ar.abdurrahmaansudais': 'Abdurrahman As-Sudais',
      'ar.shaatree': 'Abu Bakr Al Shatri',
      'ar.ahmedajamy': 'Ahmed Al Ajmi',
      'ar.hanirifai': 'Hani Ar-Rifai',
      'ar.husary': 'Mahmoud Khalil Al-Hussary',
      'ar.minshawi': 'Mohamed Siddiq Al-Minshawi',
      'ar.muhammadayyoub': 'Muhammad Ayyub',
      'ar.muhammadjibreel': 'Muhammad Jibril',
      'ar.mahermuaiqly': 'Maher Al Muaiqly',
      'ar.parhizgar': 'Parhizgar',
      // Old format (backward compatibility)
      'Alafasy_128kbps': 'Mishary Rashid Alafasy',
      'Abdul_Basit_Murattal_192kbps': 'Abdul Basit',
      'Ghamadi_40kbps': 'Saad Al-Ghamdi',
      'Ahmed_ibn_Ali_al-Ajamy_128kbps': 'Ahmed Al Ajmi',
      'Abu_Bakr_Ash-Shaatree_128kbps': 'Abu Bakr Al Shatri',
      'Maher_AlMuaiqly_128kbps': 'Maher Al Muaiqly',
      'Hani_Rifai_192kbps': 'Hani Ar-Rifai',
      'Husary_128kbps': 'Mahmoud Khalil Al-Hussary',
    };
    return reciters[identifier] || identifier;
  };

  // Apply mute state
  useEffect(() => {
    if (player) {
      player.muted = isMuted;
    }
  }, [isMuted, player]);

  // Apply playback speed
  useEffect(() => {
    if (player && player.status !== 'idle') {
      try {
        player.playbackRate = playbackSpeed;
      } catch (err) {
        console.error('Failed to set playback rate:', err);
      }
    }
  }, [playbackSpeed, player, player.status]);

  // Listen for when audio finishes
  useEffect(() => {
    if (player.status === 'idle' && hasPlayedRef.current && player.currentTime === 0) {
      hasPlayedRef.current = false;

      // Auto-repeat current ayah or play next
      if (autoRepeat) {
        // Repeat current ayah
        setTimeout(() => {
          playAyahAtIndex(currentIndex);
        }, 500);
      } else if (currentIndex < ayahs.length - 1) {
        // Play next ayah
        const nextIndex = currentIndex + 1;
        onIndexChange(nextIndex);
        setTimeout(() => {
          playAyahAtIndex(nextIndex);
        }, 500);
      }
    }
  }, [player.status, player.currentTime, autoRepeat, currentIndex, ayahs.length]);

  const playAyahAtIndex = async (index: number) => {
    try {
      setError(null);
      setIsLoading(true);

      const ayah = ayahs[index];
      if (!ayah) {
        setError(t('ayahNotFound'));
        setIsLoading(false);
        return;
      }

      player.play();
      hasPlayedRef.current = true;
      setIsLoading(false);
    } catch (err) {
      setError(t('failedToLoadAudio'));
      setIsLoading(false);
    }
  };

  const playCurrentAyah = async () => {
    if (player.playing) {
      return;
    }
    await playAyahAtIndex(currentIndex);
  };

  const pauseAudio = () => {
    player.pause();
  };

  const stopAudio = () => {
    player.pause();
    player.seekTo(0);
  };

  const togglePlayPause = async () => {
    if (player.playing) {
      pauseAudio();
    } else {
      await playCurrentAyah();
    }
  };

  const playPrevious = async () => {
    if (currentIndex > 0) {
      const prevIndex = currentIndex - 1;
      onIndexChange(prevIndex);
      if (player.playing || autoRepeat) {
        await playAyahAtIndex(prevIndex);
      }
    }
  };

  const playNext = async () => {
    if (currentIndex < ayahs.length - 1) {
      const nextIndex = currentIndex + 1;
      onIndexChange(nextIndex);
      if (player.playing || autoRepeat) {
        await playAyahAtIndex(nextIndex);
      }
    }
  };

  const toggleMute = () => {
    updateQuranAppearance({ isMuted: !isMuted });
  };

  const toggleRepeat = () => {
    updateQuranAppearance({ autoRepeat: !autoRepeat });
  };

  const handleShare = async () => {
    try {
      const message = `${t('listeningTo')} ${t('surahAyah').replace('{surahNumber}', currentAyah.sura).replace('{ayahNumber}', currentAyah.aya)} - ${getReciterName(selectedReciter)}`;
      await Share.share({
        message: message,
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const navigateToAudioSettings = () => {
    // Navigate to audio settings screen
    navigation.navigate('AudioSettings' as never);
  };

  // Format time in mm:ss
  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  if (!visible || !currentAyah) return null;

  const duration = player.duration || 0;
  const position = player.currentTime || 0;

  return (
    <View style={[styles.container, { backgroundColor: colors.surface, borderTopColor: colors.border }]}>
      {/* Error Message */}
      {error && (
        <View style={styles.errorContainer}>
          <StyledText style={[styles.errorText, { color: '#EF4444' }]}>{error}</StyledText>
        </View>
      )}

      {/* Reciter Name - Non-clickable */}
      <View style={styles.reciterContainer}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Ionicons name="mic" size={16} color={colors.primary} />
          <StyledText style={[styles.reciterName, { color: colors.text }]}>
            {getReciterName(selectedReciter)}
          </StyledText>
        </View>
        <StyledText style={[styles.ayahInfo, { color: colors.textSecondary }]}>
          {t('surahAyah').replace('{surahNumber}', currentAyah.sura).replace('{ayahNumber}', currentAyah.aya)} ({currentIndex + 1}/{ayahs.length})
        </StyledText>
      </View>

      {/* Translation Language Selection - Only show if translator recitor is enabled */}
      {translatorRecitorEnabled && (
        <View style={styles.translationButtonsContainer}>
          <View
            style={[
              styles.translationButton,
              {
                backgroundColor: selectedTranslationLanguage === 'en' ? colors.primary : colors.border,
              }
            ]}>
            <StyledText style={[
              styles.translationButtonText,
              { color: selectedTranslationLanguage === 'en' ? '#FFFFFF' : colors.textSecondary }
            ]}>
              {t('english')}
            </StyledText>
          </View>

          <View
            style={[
              styles.translationButton,
              {
                backgroundColor: selectedTranslationLanguage === 'ur' ? colors.primary : colors.border,
              }
            ]}>
            <StyledText style={[
              styles.translationButtonText,
              { color: selectedTranslationLanguage === 'ur' ? '#FFFFFF' : colors.textSecondary }
            ]}>
              {t('urdu')}
            </StyledText>
          </View>
        </View>
      )}

      {/* Control Icons Row - Share, Audio Settings, Repeat, Mute */}
      <View style={styles.iconControlsContainer}>
        <TouchableOpacity style={styles.iconButton} onPress={handleShare}>
          <Ionicons name="share-social" size={20} color={colors.primary} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.iconButton} onPress={navigateToAudioSettings}>
          <Ionicons name="musical-notes" size={20} color={colors.primary} />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.iconButton, autoRepeat && { backgroundColor: colors.primaryLight }]}
          onPress={toggleRepeat}>
          <Ionicons name="repeat" size={20} color={autoRepeat ? colors.primary : colors.textSecondary} />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.iconButton, isMuted && { backgroundColor: colors.primaryLight }]}
          onPress={toggleMute}>
          <Ionicons name={isMuted ? 'volume-mute' : 'volume-high'} size={20} color={isMuted ? colors.error : colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Main Playback Controls - Back, Stop, Play/Pause, Next */}
      <View style={styles.playbackControlsContainer}>
        <TouchableOpacity
          style={[styles.controlButton, { backgroundColor: colors.primaryLight }]}
          onPress={playPrevious}
          disabled={isLoading || currentIndex === 0}>
          <Ionicons
            name="play-skip-back"
            size={20}
            color={currentIndex === 0 ? colors.textSecondary : colors.primary}
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.controlButton, { backgroundColor: colors.primaryLight }]}
          onPress={stopAudio}
          disabled={isLoading}>
          <Ionicons name="stop" size={20} color={colors.primary} />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.playButton, { backgroundColor: colors.primary }]}
          onPress={togglePlayPause}
          disabled={isLoading}>
          {isLoading ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Ionicons
              name={player.playing ? 'pause' : 'play'}
              size={32}
              color="#FFFFFF"
            />
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.controlButton, { backgroundColor: colors.primaryLight }]}
          onPress={playNext}
          disabled={isLoading || currentIndex === ayahs.length - 1}>
          <Ionicons
            name="play-skip-forward"
            size={20}
            color={currentIndex === ayahs.length - 1 ? colors.textSecondary : colors.primary}
          />
        </TouchableOpacity>
      </View>

      {/* Time Display */}
      {duration > 0 && (
        <View style={styles.timeContainer}>
          <StyledText style={[styles.timeText, { color: colors.textSecondary }]}>
            {formatTime(position)} / {formatTime(duration)}
          </StyledText>
        </View>
      )}

      {/* Progress Bar */}
      {duration > 0 && (
        <View style={[styles.progressBarContainer, { backgroundColor: colors.border }]}>
          <View
            style={[
              styles.progressBar,
              {
                backgroundColor: colors.primary,
                width: `${(position / duration) * 100}%`
              }
            ]}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderTopWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  errorContainer: {
    marginBottom: 8,
    padding: 8,
    backgroundColor: '#FEE2E2',
    borderRadius: 8,
  },
  errorText: {
    fontSize: 11,
    textAlign: 'center',
  },
  reciterContainer: {
    marginBottom: 12,
    alignItems: 'center',
  },
  reciterName: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  ayahInfo: {
    fontSize: 11,
    marginTop: 2,
  },
  translationButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 12,
  },
  translationButton: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 16,
  },
  translationButtonText: {
    fontSize: 12,
    fontWeight: '600',
  },
  iconControlsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
    marginBottom: 12,
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playbackControlsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 8,
  },
  controlButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
    marginHorizontal: 4,
  },
  timeContainer: {
    alignItems: 'center',
    marginTop: 2,
  },
  timeText: {
    fontSize: 11,
  },
  progressBarContainer: {
    height: 3,
    width: '100%',
    marginTop: 10,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 2,
  },
});
