import React, { useState, useEffect, useRef } from 'react';
import { View, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import { Audio, AVPlaybackStatus } from 'expo-av';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useSettings } from '../context/SettingsContext';
import { useLanguage } from '../context/LanguageContext';
import StyledText from './StyledText';

interface QuranAudioPlayerProps {
  ayahs: any[]; // Array of ayahs with surah and ayah numbers
  currentIndex: number;
  onIndexChange: (index: number) => void;
  visible?: boolean;
}

// Audio CDN URL builder
const getAudioUrl = (surah: number, ayah: number, reciterFolder: string): string => {
  const surahPadded = String(surah).padStart(3, '0');
  const ayahPadded = String(ayah).padStart(3, '0');
  return `https://everyayah.com/data/${reciterFolder}/${surahPadded}${ayahPadded}.mp3`;
};

export default function QuranAudioPlayer({
  ayahs,
  currentIndex,
  onIndexChange,
  visible = true,
}: QuranAudioPlayerProps) {
  const { colors } = useTheme();
  const { quranAppearance } = useSettings();
  const { t } = useLanguage();

  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [duration, setDuration] = useState(0);
  const [position, setPosition] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [autoPlay, setAutoPlay] = useState(false);

  // Get selected reciter from settings or default
  const selectedReciter = quranAppearance.selectedReciter || 'Alafasy_128kbps';

  const currentAyah = ayahs[currentIndex];

  // Cleanup sound on unmount
  useEffect(() => {
    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, [sound]);

  // Configure audio mode
  useEffect(() => {
    const configureAudio = async () => {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: true,
        staysActiveInBackground: true,
        shouldDuckAndroid: true,
      });
    };
    configureAudio();
  }, []);

  // Handle playback status updates
  const onPlaybackStatusUpdate = (status: AVPlaybackStatus) => {
    if (!status.isLoaded) {
      if (status.error) {
        setError(t('playbackError').replace('{error}', status.error));
        setIsLoading(false);
      }
      return;
    }

    setIsPlaying(status.isPlaying);
    setPosition(status.positionMillis);
    setDuration(status.durationMillis || 0);

    // When audio finishes, go to next ayah
    if (status.didJustFinish && !status.isLooping) {
      setIsPlaying(false);
      setPosition(0);

      // Auto-play next ayah if enabled
      if (autoPlay && currentIndex < ayahs.length - 1) {
        const nextIndex = currentIndex + 1;
        onIndexChange(nextIndex);
        // Small delay before playing next
        setTimeout(() => {
          playAyahAtIndex(nextIndex);
        }, 500);
      }
    }
  };

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

      // Unload previous sound
      if (sound) {
        await sound.unloadAsync();
      }

      // Load and play new audio
      const audioUrl = getAudioUrl(ayah.sura, ayah.aya, selectedReciter);

      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: audioUrl },
        { shouldPlay: true },
        onPlaybackStatusUpdate
      );

      setSound(newSound);
      setIsLoading(false);
    } catch (err) {
      setError(t('failedToLoadAudio'));
      setIsLoading(false);
    }
  };

  const playCurrentAyah = async () => {
    if (sound) {
      const status = await sound.getStatusAsync();
      if (status.isLoaded && !status.isPlaying) {
        await sound.playAsync();
        return;
      }
    }
    await playAyahAtIndex(currentIndex);
  };

  const pauseAudio = async () => {
    if (sound) {
      await sound.pauseAsync();
    }
  };

  const stopAudio = async () => {
    if (sound) {
      await sound.stopAsync();
      await sound.setPositionAsync(0);
      setPosition(0);
      setIsPlaying(false);
    }
  };

  const togglePlayPause = async () => {
    if (isPlaying) {
      await pauseAudio();
    } else {
      await playCurrentAyah();
    }
  };

  const playPrevious = async () => {
    if (currentIndex > 0) {
      const prevIndex = currentIndex - 1;
      onIndexChange(prevIndex);
      if (isPlaying || autoPlay) {
        await playAyahAtIndex(prevIndex);
      }
    }
  };

  const playNext = async () => {
    if (currentIndex < ayahs.length - 1) {
      const nextIndex = currentIndex + 1;
      onIndexChange(nextIndex);
      if (isPlaying || autoPlay) {
        await playAyahAtIndex(nextIndex);
      }
    }
  };

  // Format time in mm:ss
  const formatTime = (millis: number): string => {
    const totalSeconds = Math.floor(millis / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  if (!visible || !currentAyah) return null;

  return (
    <View style={[styles.container, { backgroundColor: colors.surface, borderTopColor: colors.border }]}>
      {/* Error Message */}
      {error && (
        <View style={styles.errorContainer}>
          <StyledText style={[styles.errorText, { color: '#EF4444' }]}>{error}</StyledText>
        </View>
      )}

      {/* Audio Controls */}
      <View style={styles.controlsContainer}>
        {/* Ayah Info */}
        <View style={styles.infoContainer}>
          <Ionicons name="volume-high" size={18} color={colors.primary} />
          <StyledText style={[styles.ayahText, { color: colors.text }]}>
            {t('surahAyah').replace('{surahNumber}', currentAyah.sura).replace('{ayahNumber}', currentAyah.aya)}
          </StyledText>
          <StyledText style={[styles.ayahCount, { color: colors.textSecondary }]}>
            ({currentIndex + 1}/{ayahs.length})
          </StyledText>
        </View>

        {/* Play Controls */}
        <View style={styles.buttonsContainer}>
          <TouchableOpacity
            style={[styles.controlButton, { backgroundColor: colors.primaryLight }]}
            onPress={stopAudio}
            disabled={isLoading || !sound}>
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
                name={isPlaying ? 'pause' : 'play'}
                size={28}
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

          <TouchableOpacity
            style={[styles.controlButton, { backgroundColor: autoPlay ? colors.primary : colors.primaryLight }]}
            onPress={() => setAutoPlay(!autoPlay)}
            disabled={isLoading}>
            <Ionicons
              name="repeat"
              size={20}
              color={autoPlay ? '#FFFFFF' : colors.primary}
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
      </View>

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
    paddingVertical: 10,
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
  controlsContainer: {
    alignItems: 'center',
  },
  infoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  ayahText: {
    fontSize: 13,
    fontWeight: '600',
    marginLeft: 6,
  },
  ayahCount: {
    fontSize: 11,
    marginLeft: 4,
  },
  buttonsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 6,
  },
  controlButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playButton: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  timeContainer: {
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