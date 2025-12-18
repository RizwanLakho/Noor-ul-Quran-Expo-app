import React, { useState, useEffect, useRef } from 'react';
import { View, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import { useAudioPlayer, AudioSource } from 'expo-audio';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useSettings } from '../context/SettingsContext';
import { useLanguage } from '../context/LanguageContext';
import StyledText from './StyledText';

interface AudioPlayerProps {
  surahNumber: number;
  ayahNumber: number;
  onAyahComplete?: () => void;
  autoPlay?: boolean;
  visible?: boolean;
}

// Audio CDN URL builder
const getAudioUrl = (surah: number, ayah: number, reciterFolder: string): string => {
  const surahPadded = String(surah).padStart(3, '0');
  const ayahPadded = String(ayah).padStart(3, '0');
  return `https://everyayah.com/data/${reciterFolder}/${surahPadded}${ayahPadded}.mp3`;
};

export default function AudioPlayer({
  surahNumber,
  ayahNumber,
  onAyahComplete,
  autoPlay = false,
  visible = true,
}: AudioPlayerProps) {
  const { colors } = useTheme();
  const { quranAppearance } = useSettings();
  const { t } = useLanguage();

  // Get selected reciter from settings or default to Alafasy
  const selectedReciter = quranAppearance.selectedReciter || 'Alafasy_128kbps';

  const audioUrl = getAudioUrl(surahNumber, ayahNumber, selectedReciter);
  const player = useAudioPlayer(audioUrl);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const hasPlayedRef = useRef(false);

  // Auto-play when ayah changes
  useEffect(() => {
    hasPlayedRef.current = false;
    if (autoPlay && visible) {
      playAudio();
    }
  }, [surahNumber, ayahNumber, autoPlay, visible]);

  // Listen for when audio finishes
  useEffect(() => {
    if (player.status === 'idle' && hasPlayedRef.current && player.currentTime === 0) {
      if (onAyahComplete) {
        onAyahComplete();
      }
      hasPlayedRef.current = false;
    }
  }, [player.status, player.currentTime, onAyahComplete]);

  const playAudio = async () => {
    try {
      setError(null);
      setIsLoading(true);
      player.play();
      hasPlayedRef.current = true;
      setIsLoading(false);
    } catch (err) {
      setError(t('failedToLoadAudio'));
      setIsLoading(false);
    }
  };

  const pauseAudio = () => {
    player.pause();
  };

  const stopAudio = () => {
    player.pause();
    player.seekTo(0);
  };

  const togglePlayPause = () => {
    if (player.playing) {
      pauseAudio();
    } else {
      playAudio();
    }
  };

  // Format time in mm:ss
  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  if (!visible) return null;

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

      {/* Audio Controls */}
      <View style={styles.controlsContainer}>
        {/* Ayah Info */}
        <View style={styles.infoContainer}>
          <Ionicons name="volume-high" size={20} color={colors.primary} />
          <StyledText style={[styles.ayahText, { color: colors.text }]}>
            {t('surahAyah').replace('{surahNumber}', surahNumber.toString()).replace('{ayahNumber}', ayahNumber.toString())}
          </StyledText>
        </View>

        {/* Play Controls */}
        <View style={styles.buttonsContainer}>
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
                size={28}
                color="#FFFFFF"
              />
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.controlButton, { backgroundColor: colors.primaryLight }]}
            onPress={() => {
              if (onAyahComplete) onAyahComplete();
            }}
            disabled={isLoading}>
            <Ionicons name="play-skip-forward" size={20} color={colors.primary} />
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
    fontSize: 12,
    textAlign: 'center',
  },
  controlsContainer: {
    alignItems: 'center',
  },
  infoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  ayahText: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  buttonsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
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
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  timeContainer: {
    marginTop: 4,
  },
  timeText: {
    fontSize: 12,
  },
  progressBarContainer: {
    height: 3,
    width: '100%',
    marginTop: 12,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 2,
  },
});