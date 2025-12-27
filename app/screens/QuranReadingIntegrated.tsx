import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  ScrollView,
  FlatList,
  TouchableOpacity,
  Image,
  ImageBackground,
  StatusBar,
  Animated,
  ActivityIndicator,
  TextInput,
  Share,
  Modal,
  Switch,
} from 'react-native';
import { Ionicons, AntDesign } from '@expo/vector-icons';
import { Audio, AVPlaybackStatus } from 'expo-av';
import { useTheme } from '../context/ThemeContext';
import { useSettings } from '../context/SettingsContext';
import { useLanguage } from '../context/LanguageContext';
import { useBookmarks } from '../context/BookmarksContext';
import { useLastRead } from '../context/LastReadContext';
import { useGoals } from '../context/GoalsContext';
import { useCustomAlert } from '../context/CustomAlertContext';
import StyledText from '../components/StyledText';
import { apiService } from '../services/ApiService';
import type { Ayah } from './types/quran.types';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function QuranReadingIntegrated({ route, navigation }: any) {
  const { colors, isDark } = useTheme();
  const { quranAppearance } = useSettings();
  const { t, language } = useLanguage();
  const { showAlert } = useCustomAlert();
  const { bookmarks, addBookmark, removeBookmark, isBookmarked } = useBookmarks();
  const { updateLastRead } = useLastRead();
  const { trackSurahRead, trackJuzRead } = useGoals();

  // Audio player state - Beautiful UI
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedReciter, setSelectedReciter] = useState('Alafasy_128kbps');
  const [selectedTranslation, setSelectedTranslation] = useState(t('translationEng'));
  const [showReciterDropdown, setShowReciterDropdown] = useState(false);
  const [showTranslationDropdown, setShowTranslationDropdown] = useState(false);
  const [showReadingSettings, setShowReadingSettings] = useState(false);

  // Animated scroll-based player control (hardware accelerated)
  const scrollY = useRef(new Animated.Value(0)).current;
  const controlsHeight = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [150, 85],
    extrapolate: 'clamp',
  });

  // Real Audio Functionality
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [currentAyahIndex, setCurrentAyahIndex] = useState(0);
  const [isLoadingAudio, setIsLoadingAudio] = useState(false);
  const [duration, setDuration] = useState(0);
  const [position, setPosition] = useState(0);
  const [autoPlayEnabled, setAutoPlayEnabled] = useState(true); // Auto-play enabled by default

  // Use ref to track current index to avoid stale state in callbacks
  const currentIndexRef = useRef(0);

  // FlatList ref for scroll control
  const flatListRef = useRef<any>(null);

  // Track reading session
  const sessionStartTime = useRef(Date.now());
  const lastVisibleAyah = useRef(1);
  const lastSavedAyah = useRef(0); // Track last saved ayah to avoid duplicate saves

  /**
   * Track which ayah is currently visible
   */
  const onViewableItemsChanged = useRef(({ viewableItems }: any) => {
    if (viewableItems && viewableItems.length > 0) {
      const firstVisibleAyah = viewableItems[0]?.item;
      if (firstVisibleAyah?.aya) {
        lastVisibleAyah.current = firstVisibleAyah.aya;
      }
    }
  }).current;

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 50,
  }).current;

  // API State
  const [loading, setLoading] = useState(true);
  const [ayahs, setAyahs] = useState<Ayah[]>([]);
  const [currentSurah, setCurrentSurah] = useState<any>(null);
  const [wordByWordData, setWordByWordData] = useState<any>({}); // Word-by-word data grouped by ayah

  // Get navigation params
  const {
    type,
    surahNumber,
    surahName,
    surahNameArabic,
    totalAyahs,
    revelationType,
    juzNumber,
    pageNumber,
    initialAyah,
  } = route?.params || {};

  // Reciter options with their folder names for everyayah.com
  const reciters = [
    { name: t('reciterAsSudais'), folder: 'Abdul_Basit_Murattal_192kbps' },
    { name: t('reciterAlAfasy'), folder: 'Alafasy_128kbps' },
    { name: t('reciterAlHusary'), folder: 'Husary_128kbps' },
    { name: t('reciterAlMinshawi'), folder: 'Minshawy_Murattal_128kbps' },
    { name: t('reciterAlGhamdi'), folder: 'Ghamadi_40kbps' },
    { name: t('reciterMisharyRashid'), folder: 'Mishary_Rashid_Alafasy_128kbps' },
  ];

  const translations = [
    t('translationEng'),
    t('translationUrdu'),
    t('translationIndonesia'),
    t('translationTurkce'),
    t('translationFrancais'),
    t('translationDeutsch'),
  ];

  // Audio CDN URL builder
  const getAudioUrl = (surah: number, ayah: number): string => {
    const surahPadded = String(surah).padStart(3, '0');
    const ayahPadded = String(ayah).padStart(3, '0');
    return `https://everyayah.com/data/${selectedReciter}/${surahPadded}${ayahPadded}.mp3`;
  };

  /**
   * Reset scroll position when Surah/Juz changes
   */
  useEffect(() => {
    // Reset scroll value
    scrollY.setValue(0);

    // Scroll FlatList to top
    if (flatListRef.current) {
      setTimeout(() => {
        flatListRef.current?.scrollToOffset({ offset: 0, animated: false });
      }, 100);
    }
  }, [type, surahNumber, juzNumber, pageNumber]);

  /**
   * Fetch Quran data based on navigation type
   */
  useEffect(() => {
    fetchQuranData();
  }, [type, surahNumber, juzNumber, pageNumber]);

  const fetchQuranData = async () => {
    try {
      setLoading(true);

      if (type === 'surah' && surahNumber) {
        console.log(
          `📖 Calling getSurahById with surahNumber: ${surahNumber}, translator: ${quranAppearance.selectedTranslatorName} (${quranAppearance.selectedTranslatorLanguage})`
        );

        const response = await apiService.getSurahById(
          surahNumber,
          quranAppearance.selectedTranslatorName,
          quranAppearance.selectedTranslatorLanguage
        );

        setCurrentSurah({
          name: response.surah.surah_name_english,
          nameArabic: response.surah.surah_name_arabic,
          number: response.surah.surah_number,
          revelationType: response.surah.revelation_type,
          numberOfAyahs: response.surah.total_ayahs,
        });

        // Use ayahs with translations already merged by getSurahById
        const ayahsArray = response.ayahs || [];
        if (ayahsArray.length > 0) {
          console.log({
            number: ayahsArray[0].aya,
            hasArabic: !!ayahsArray[0].text,
            hasTranslation: !!ayahsArray[0].translation,
            translationPreview: ayahsArray[0].translation?.substring(0, 50),
          });
        }
        setAyahs(ayahsArray);

        // Fetch word-by-word data if enabled
        if (quranAppearance.wordByWordEnabled) {
          try {
            console.log(`📝 Fetching word-by-word data for Surah ${surahNumber}`);
            const wbwResponse = await apiService.getSurahWords(surahNumber);
            if (wbwResponse.success && wbwResponse.ayahs) {
              setWordByWordData(wbwResponse.ayahs);
              console.log(`✅ Loaded word-by-word data for ${wbwResponse.totalAyahs} ayahs`);
            }
          } catch (error) {
            console.error('Failed to fetch word-by-word data:', error);
            // Non-critical error, continue without word-by-word
          }
        } else {
          setWordByWordData({}); // Clear word-by-word data if disabled
        }

        // Scroll to initial ayah if provided (Continue Reading feature)
        if (initialAyah && ayahsArray.length > 0) {
          setTimeout(() => {
            const ayahIndex = ayahsArray.findIndex((a: any) => a.aya === initialAyah);
            if (ayahIndex >= 0 && flatListRef.current) {
              flatListRef.current.scrollToIndex({
                index: ayahIndex,
                animated: true,
                viewPosition: 0.2, // Show at top 20% of screen
              });
              console.log(`📍 Scrolled to ayah ${initialAyah} at index ${ayahIndex}`);
            }
          }, 500);
        }
      } else if (type === 'juz' && juzNumber) {
        // Fetch Juz with translation
        console.log(
          `📖 Calling getJuzWithTranslation with juzNumber: ${juzNumber}, translator: ${quranAppearance.selectedTranslatorName} (${quranAppearance.selectedTranslatorLanguage})`
        );
        const response = await apiService.getJuzWithTranslation(
          juzNumber,
          quranAppearance.selectedTranslatorName,
          quranAppearance.selectedTranslatorLanguage
        );

        // Set Juz info for header
        setCurrentSurah({
          name: route.params.juzName || `${t('juzFull')} ${juzNumber}`,
          nameArabic: route.params.juzNameArabic || '',
          number: juzNumber,
          revelationType: 'Juz',
          numberOfAyahs: response.ayahs?.length || 0,
        });

        // Transform Juz ayahs to match expected format
        // Juz API returns: { sura, aya, arabic_text, translation: "sura|aya|text" }
        // Component expects: { sura, aya, text, translation }
        const ayahsArray = (response.ayahs || []).map((ayah: any) => {
          // Clean translation: Remove "sura|aya|" prefix if exists
          let cleanedTranslation = ayah.translation || null;
          if (cleanedTranslation && typeof cleanedTranslation === 'string') {
            const parts = cleanedTranslation.split('|');
            if (parts.length >= 3) {
              // Format is "sura|aya|translation_text"
              cleanedTranslation = parts.slice(2).join('|').trim();
            }
          }

          return {
            ...ayah,
            text: ayah.arabic_text || ayah.text, // Map arabic_text to text
            aya: ayah.aya,
            sura: ayah.sura,
            translation: cleanedTranslation,
            surah_name_english: ayah.surah_name_english,
            surah_name_arabic: ayah.surah_name_arabic,
          };
        });

        if (ayahsArray.length > 0) {
          console.log({
            sura: ayahsArray[0].sura,
            aya: ayahsArray[0].aya,
            hasArabic: !!ayahsArray[0].text,
            arabicPreview: ayahsArray[0].text?.substring(0, 30),
            hasTranslation: !!ayahsArray[0].translation,
            translationPreview: ayahsArray[0].translation?.substring(0, 80),
            translationLength: ayahsArray[0].translation?.length,
          });
        }
        setAyahs(ayahsArray);
      } else if (type === 'page' && pageNumber) {
        // For Page, similar to Juz
        showAlert(
          t('comingSoon'),
          t('pageNavigationComingSoon').replace('{pageNumber}', pageNumber),
          'info'
        );
        navigation.goBack();
      } else {
        // Default: Load Al-Fatihah with selected translator
        const response = await apiService.getSurahById(
          1,
          quranAppearance.selectedTranslatorName,
          quranAppearance.selectedTranslatorLanguage
        );

        setCurrentSurah({
          name: response.surah.surah_name_english,
          nameArabic: response.surah.surah_name_arabic,
          number: response.surah.surah_number,
          revelationType: response.surah.revelation_type,
          numberOfAyahs: response.surah.total_ayahs,
        });

        // Use ayahs with translations already merged by getSurahById
        const ayahsArray = response.ayahs || [];
        setAyahs(ayahsArray);
      }
    } catch (error) {
      showAlert(t('error'), t('failedToLoadQuranData'), 'error', [
        { text: t('retry'), onPress: () => fetchQuranData() },
        { text: t('goBack'), onPress: () => navigation.goBack() },
      ]);
    } finally {
      setLoading(false);
    }
  };

  // ========== AUDIO FUNCTIONALITY ==========

  // Configure audio mode on mount
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

  // Cleanup sound on unmount and save reading activity
  useEffect(() => {
    return () => {
      // Cleanup audio
      if (sound) {
        sound.unloadAsync();
      }

      // Save reading activity
      if (currentSurah && ayahs.length > 0) {
        const sessionEndTime = Date.now();
        const timeSpentSeconds = Math.floor((sessionEndTime - sessionStartTime.current) / 1000);

        // Only save if user spent at least 5 seconds reading
        if (timeSpentSeconds >= 5) {
          updateLastRead({
            surahName: currentSurah.name,
            surahNumber: currentSurah.number,
            ayahNumber: lastVisibleAyah.current,
            timeSpent: timeSpentSeconds,
            verseCount: ayahs.length,
          }).catch(err => console.error('Failed to save last read:', err));

          // AUTO-TRACK: Mark surah/juz with ayah-level progress in goals (LOCAL)
          if (type === 'surah' && surahNumber) {
            // Pass last visible ayah and total ayahs for detailed tracking
            trackSurahRead(surahNumber, lastVisibleAyah.current, ayahs.length)
              .catch(err => console.error('Failed to track surah:', err));
          } else if (type === 'juz' && juzNumber) {
            // For juz, track with ayah progress
            trackJuzRead(juzNumber, lastVisibleAyah.current, ayahs.length)
              .catch(err => console.error('Failed to track juz:', err));
          }

          // BACKEND TRACKING: Send reading session to backend for overall stats
          const sendToBackend = async () => {
            try {
              const authToken = await AsyncStorage.getItem('@auth_token');
              if (!authToken) {
                console.log('⚠️ No auth token - skipping backend tracking');
                return;
              }

              const sessionData: any = {
                ayahs_read: lastVisibleAyah.current,
                time_spent_seconds: timeSpentSeconds,
                last_ayah_read: lastVisibleAyah.current,
              };

              if (type === 'surah' && surahNumber) {
                sessionData.type = 'surah';
                sessionData.surah_number = surahNumber;
              } else if (type === 'juz' && juzNumber) {
                sessionData.type = 'juz';
                sessionData.juz_number = juzNumber;
              }

              console.log('📡 Sending reading session to backend:', sessionData);
              await apiService.recordReadingSession(sessionData);
              console.log('✅ Backend tracking successful');
            } catch (error) {
              console.log('⚠️ Failed to send to backend (user may be offline):', error);
            }
          };

          sendToBackend();
        }
      }
    };
  }, [sound, currentSurah, ayahs, type, surahNumber, juzNumber]);

  // AUTO-SAVE: Periodic progress tracking (every 15 seconds)
  useEffect(() => {
    if (!currentSurah || ayahs.length === 0) return;

    const saveProgress = async () => {
      const currentAyah = lastVisibleAyah.current;

      // Only save if ayah has changed since last save
      if (currentAyah > lastSavedAyah.current) {
        console.log(`💾 Auto-saving progress: Ayah ${currentAyah}/${ayahs.length}`);

        // Track progress in goals (LOCAL)
        if (type === 'surah' && surahNumber) {
          trackSurahRead(surahNumber, currentAyah, ayahs.length)
            .then(() => {
              lastSavedAyah.current = currentAyah;
              console.log(`✅ Local progress saved: ${currentAyah}/${ayahs.length} ayahs`);
            })
            .catch(err => console.error('Failed to save local progress:', err));
        } else if (type === 'juz' && juzNumber) {
          trackJuzRead(juzNumber, currentAyah, ayahs.length)
            .then(() => {
              lastSavedAyah.current = currentAyah;
              console.log(`✅ Local progress saved: ${currentAyah}/${ayahs.length} ayahs`);
            })
            .catch(err => console.error('Failed to save local progress:', err));
        }

        // BACKEND TRACKING: Also send periodic updates to backend
        try {
          const authToken = await AsyncStorage.getItem('@auth_token');
          if (authToken) {
            const timeElapsed = Math.floor((Date.now() - sessionStartTime.current) / 1000);
            const sessionData: any = {
              ayahs_read: currentAyah,
              time_spent_seconds: 15, // Each interval is 15 seconds
              last_ayah_read: currentAyah,
            };

            if (type === 'surah' && surahNumber) {
              sessionData.type = 'surah';
              sessionData.surah_number = surahNumber;
            } else if (type === 'juz' && juzNumber) {
              sessionData.type = 'juz';
              sessionData.juz_number = juzNumber;
            }

            await apiService.recordReadingSession(sessionData);
            console.log('📡 Backend auto-save successful');
          }
        } catch (error) {
          console.log('⚠️ Backend auto-save failed (offline or no auth)');
        }
      }
    };

    // Save progress every 15 seconds
    const interval = setInterval(saveProgress, 15000);

    // Cleanup interval on unmount
    return () => clearInterval(interval);
  }, [currentSurah, ayahs, type, surahNumber, juzNumber, trackSurahRead, trackJuzRead]);

  // Handle playback status updates
  const onPlaybackStatusUpdate = (status: AVPlaybackStatus) => {
    if (!status.isLoaded) {
      if (status.error) {
        console.error('Audio error:', status.error);
        setIsLoadingAudio(false);
      }
      return;
    }

    setIsPlaying(status.isPlaying);
    setPosition(status.positionMillis);
    setDuration(status.durationMillis || 0);

    // When audio finishes, go to next ayah if auto-play is enabled
    if (status.didJustFinish && !status.isLooping) {
      setIsPlaying(false);
      setPosition(0);

      // Use ref to get the actual current index (avoid stale state)
      const nextIndex = currentIndexRef.current + 1;

      if (autoPlayEnabled && nextIndex < ayahs.length) {
        console.log(`🔄 Auto-playing next: ${nextIndex + 1}/${ayahs.length}`);
        // Auto-play next ayah with minimal delay
        setTimeout(() => {
          playAyahAtIndex(nextIndex);
        }, 100); // Minimal 100ms delay for smooth transition
      } else {
        console.log('✅ Reached end of Surah/Juz');
      }
    }
  };

  // Play specific ayah by index with retry logic
  const playAyahAtIndex = async (index: number, retryCount: number = 0) => {
    try {
      setIsLoadingAudio(true);
      const ayah = ayahs[index];
      if (!ayah) {
        setIsLoadingAudio(false);
        return;
      }

      // Unload previous sound
      if (sound) {
        await sound.unloadAsync();
      }

      // Load and play new audio
      const audioUrl = getAudioUrl(ayah.sura, ayah.aya);
      console.log(`🎵 Playing ayah ${index + 1}/${ayahs.length}: ${audioUrl}`);

      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: audioUrl },
        { shouldPlay: true },
        onPlaybackStatusUpdate
      );

      setSound(newSound);
      setCurrentAyahIndex(index);
      currentIndexRef.current = index; // Update ref immediately
      setIsLoadingAudio(false);
      console.log(`✅ Now playing ayah ${index + 1}/${ayahs.length}`);
    } catch (err) {
      console.error('Failed to load audio:', err);

      // Retry logic (max 2 retries)
      if (retryCount < 2) {
        console.log(`🔄 Retrying audio load (attempt ${retryCount + 1}/2)...`);
        setTimeout(() => {
          playAyahAtIndex(index, retryCount + 1);
        }, 1000); // Wait 1 second before retry
      } else {
        // Max retries reached
        setIsLoadingAudio(false);
        showAlert(
          'Audio Error',
          'Failed to load audio after multiple attempts. Please check your internet connection.',
          'error'
        );
      }
    }
  };

  // Toggle play/pause (main player button)
  const togglePlayPause = async () => {
    if (!sound && ayahs.length > 0) {
      // No sound loaded, play current selected ayah
      await playAyahAtIndex(currentAyahIndex);
    } else if (sound) {
      const status = await sound.getStatusAsync();
      if (status.isLoaded) {
        if (status.isPlaying) {
          // Pause current playback
          await sound.pauseAsync();
        } else {
          // Resume playback
          await sound.playAsync();
        }
      } else {
        // Sound was unloaded, play current ayah
        await playAyahAtIndex(currentAyahIndex);
      }
    }
  };

  // Handle individual ayah play button click
  const handleAyahPlayClick = async (index: number) => {
    if (currentAyahIndex === index && isPlaying) {
      // Clicking on currently playing ayah → pause it
      if (sound) {
        await sound.pauseAsync();
      }
    } else {
      // Clicking on different ayah or stopped ayah → play it
      await playAyahAtIndex(index);
    }
  };

  // Play previous ayah (smart behavior)
  const playPreviousAyah = async () => {
    if (currentAyahIndex > 0) {
      const wasPlaying = isPlaying;

      if (wasPlaying) {
        // If currently playing, play the previous ayah immediately
        await playAyahAtIndex(currentAyahIndex - 1);
      } else {
        // If stopped, just change selection without auto-playing
        setCurrentAyahIndex(currentAyahIndex - 1);
      }
    }
  };

  // Play next ayah (smart behavior)
  const playNextAyah = async () => {
    if (currentAyahIndex < ayahs.length - 1) {
      const wasPlaying = isPlaying;

      if (wasPlaying) {
        // If currently playing, play the next ayah immediately
        await playAyahAtIndex(currentAyahIndex + 1);
      } else {
        // If stopped, just change selection without auto-playing
        setCurrentAyahIndex(currentAyahIndex + 1);
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

  /**
   * Handle bookmark Surah (toggle - add or remove entire Surah with ayahNumber = 0)
   */
  const handleBookmarkSurah = async () => {
    if (!currentSurah) return;

    try {
      const wholeSurahBookmarked = isBookmarked(currentSurah.surahNumber || surahNumber, 0);

      if (wholeSurahBookmarked) {
        // Find and remove the bookmark
        const bookmarkToRemove = bookmarks.find(
          (b) => b.surahNumber === (currentSurah.surahNumber || surahNumber) && b.ayahNumber === 0
        );
        if (bookmarkToRemove) {
          await removeBookmark(bookmarkToRemove.id);
          showAlert(t('success'), t('bookmarkRemoved') || 'Bookmark removed successfully!', 'success');
        }
      } else {
        // Add bookmark
        await addBookmark({
          surahName: currentSurah.name,
          surahNumber: currentSurah.surahNumber || surahNumber,
          ayahNumber: 0, // 0 means whole Surah
          arabicText: currentSurah.nameArabic || currentSurah.name,
          translation: `${currentSurah.numberOfAyahs} ${t('ayahs')} • ${currentSurah.revelationType}`,
        });
        showAlert(t('success'), t('surahBookmarked') || 'Surah bookmarked successfully!', 'success');
      }
    } catch (error) {
      console.error('Error bookmarking Surah:', error);
      showAlert(t('error'), t('failedToBookmark') || 'Failed to bookmark Surah', 'error');
    }
  };

  /**
   * Handle bookmark individual Ayah (toggle - add or remove)
   */
  const handleBookmarkAyah = async (ayah: any, index: number) => {
    if (!currentSurah) return;

    try {
      const ayahNum = ayah.aya || ayah.ayahNumber || index + 1;
      const bookmarked = isBookmarked(currentSurah.surahNumber || surahNumber, ayahNum);

      if (bookmarked) {
        // Find and remove the bookmark
        const bookmarkToRemove = bookmarks.find(
          (b) => b.surahNumber === (currentSurah.surahNumber || surahNumber) && b.ayahNumber === ayahNum
        );
        if (bookmarkToRemove) {
          await removeBookmark(bookmarkToRemove.id);
          showAlert(t('success'), t('bookmarkRemoved') || 'Bookmark removed successfully!', 'success');
        }
      } else {
        // Add bookmark
        await addBookmark({
          surahName: currentSurah.name,
          surahNumber: currentSurah.surahNumber || surahNumber,
          ayahNumber: ayahNum,
          arabicText: ayah.arabic_text || ayah.text_arabic || '',
          translation: ayah.translation || ayah.text_english || '',
        });
        showAlert(t('success'), t('ayahBookmarked') || 'Ayah bookmarked successfully!', 'success');
      }
    } catch (error) {
      console.error('Error bookmarking Ayah:', error);
      showAlert(t('error'), t('failedToBookmark') || 'Failed to bookmark Ayah', 'error');
    }
  };

  /**
   * Handle share Ayah
   */
  const handleShareAyah = async (ayah: any, index: number) => {
    try {
      const ayahNum = ayah.aya || ayah.ayahNumber || index + 1;
      const arabicText = ayah.arabic_text || ayah.text_arabic || '';
      const translation = ayah.translation || ayah.text_english || '';
      const surahName = currentSurah?.name || '';

      const message = `${arabicText}\n\n${translation}\n\n- ${surahName} (${surahNumber}:${ayahNum})\n\nShared from Noor-ul-Quran App`;

      await Share.share({
        message: message,
      });
    } catch (error) {
      console.error('Error sharing Ayah:', error);
    }
  };

  /**
   * Render individual ayah item for FlatList
   */
  const renderAyahItem = ({ item: ayah, index }: { item: any; index: number }) => {
    const isCurrentlyPlaying = currentAyahIndex === index && isPlaying;
    const isCurrentlySelected = currentAyahIndex === index;

    return (
      <View
        style={{
          marginHorizontal: 16,
          marginBottom: 12,
          borderRadius: 12,
          backgroundColor: isCurrentlySelected ? colors.primaryLight : colors.surface,
          padding: 16,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          elevation: 2,
          borderWidth: isCurrentlyPlaying ? 2 : 0,
          borderColor: isCurrentlyPlaying ? colors.primary : 'transparent',
        }}>
        {/* Verse Header */}
        <View
          style={{
            marginBottom: 16,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}>
          {/* Left Icons */}
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <TouchableOpacity
              style={{ marginRight: 12 }}
              onPress={() => handleAyahPlayClick(index)}>
              <Ionicons
                name={isPlaying && currentAyahIndex === index ? 'pause-circle' : 'play-circle'}
                size={24}
                color={colors.primary}
              />
            </TouchableOpacity>
            <TouchableOpacity style={{ marginRight: 12 }} onPress={() => handleBookmarkAyah(ayah, index)}>
              <Ionicons
                name={isBookmarked(currentSurah?.surahNumber || surahNumber, ayah.aya || ayah.ayahNumber || index + 1) ? "bookmark" : "bookmark-outline"}
                size={20}
                color={colors.primary}
              />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handleShareAyah(ayah, index)}>
              <Ionicons name="share-social-outline" size={20} color={colors.primary} />
            </TouchableOpacity>
          </View>

          {/* Center - Arabic Text */}
          {quranAppearance.arabicTextEnabled && (
            <View style={{ marginHorizontal: 12, flex: 1 }}>
              {quranAppearance.wordByWordEnabled && wordByWordData[ayah.aya] ? (
                // Word-by-word display with translations
                <View style={{ flexDirection: 'row-reverse', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'flex-start', gap: 8 }}>
                  {wordByWordData[ayah.aya].map((word: any, wordIndex: number) => (
                    <View
                      key={word.id || `word-${wordIndex}`}
                      style={{
                        alignItems: 'center',
                        marginHorizontal: 6,
                        marginVertical: 4,
                      }}>
                      {/* Arabic Word */}
                      <StyledText
                        style={{
                          fontSize: quranAppearance.textSize,
                          lineHeight: quranAppearance.textSize * 1.8,
                          color: quranAppearance.textColor,
                          fontFamily: quranAppearance.arabicFont,
                          marginBottom: 4,
                        }}>
                        {word.arabic_text}
                      </StyledText>
                      {/* English Translation */}
                      {word.translation && (
                        <StyledText
                          style={{
                            fontSize: quranAppearance.textSize * 0.7,
                            color: colors.textSecondary,
                            textAlign: 'center',
                            maxWidth: 100,
                          }}>
                          {word.translation}
                        </StyledText>
                      )}
                    </View>
                  ))}
                </View>
              ) : (
                // Normal display (full ayah)
                <StyledText
                  style={{
                    textAlign: 'center',
                    fontSize: quranAppearance.textSize,
                    lineHeight: quranAppearance.textSize * 1.6,
                    color: quranAppearance.textColor,
                    fontFamily: quranAppearance.arabicFont,
                  }}>
                  {ayah.text}
                </StyledText>
              )}
            </View>
          )}

          {/* Right - Verse Number with Star */}
          <View style={{ position: 'relative' }}>
            <AntDesign name="star" size={36} color={colors.primary} />
            <View
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                alignItems: 'center',
                justifyContent: 'center',
              }}>
              <StyledText
                style={{
                  fontSize: 12,
                  fontWeight: '700',
                  color: '#FFFFFF',
                  fontFamily: quranAppearance.arabicFont,
                }}>
                {ayah.aya}
              </StyledText>
            </View>
          </View>
        </View>

        {/* Surah Name Badge (only for Juz view to show which Surah this ayah belongs to) */}
        {type === 'juz' && ayah.surah_name_english && (
          <View style={{ marginTop: 12, alignItems: 'flex-start' }}>
            <View
              style={{
                backgroundColor: colors.primary + '20',
                paddingHorizontal: 10,
                paddingVertical: 5,
                borderRadius: 8,
              }}>
              <StyledText style={{ fontSize: 11, color: colors.primary, fontWeight: '700' }}>
                📖 {ayah.surah_name_english} • {ayah.sura}:{ayah.aya}
              </StyledText>
            </View>
          </View>
        )}

        {/* Translation Section */}
        {quranAppearance.translationEnabled && (
          <View
            style={{
              marginTop: 12,
              paddingTop: 12,
              borderTopWidth: 1,
              borderTopColor: colors.border + '40',
            }}>
            {ayah.translation ? (
              <>
                <StyledText
                  style={{
                    fontSize: 11,
                    fontWeight: '600',
                    color: colors.primary,
                    marginBottom: 6,
                    textTransform: 'uppercase',
                    letterSpacing: 0.5,
                  }}>
                  {t('translationLabel')}
                </StyledText>
                <StyledText
                  style={{
                    fontSize: quranAppearance.translationTextSize,
                    lineHeight: quranAppearance.translationTextSize * 1.5,
                    color: colors.text,
                    textAlign: 'left',
                  }}>
                  {ayah.translation}
                </StyledText>
              </>
            ) : (
              <StyledText
                style={{
                  fontSize: 12,
                  color: colors.textSecondary,
                  fontStyle: 'italic',
                  textAlign: 'center',
                }}>
                {t('translationNotAvailable')}
              </StyledText>
            )}
          </View>
        )}
      </View>
    );
  };

  /**
   * Render list header (Surah frame + translator info)
   */
  const renderListHeader = () => (
    <>
      {currentSurah && (
        <View style={{ marginHorizontal: 16, marginBottom: 16, marginTop: 8 }}>
          <ImageBackground
            source={require('../../assets/surahframe.png')}
            style={{ height: 80, width: '100%', justifyContent: 'center', alignItems: 'center' }}
            resizeMode="contain">
            <StyledText
              style={{
                fontSize: 24,
                color: isDark ? '#FDB022' : 'black',
                textAlign: 'center',
                fontFamily: quranAppearance.arabicFont,
                marginBottom: -6.5,
              }}>
              {currentSurah.nameArabic || currentSurah.name}
            </StyledText>
          </ImageBackground>
        </View>
      )}

      {/* Translator Info Badge */}
      {/*{quranAppearance.translationEnabled && quranAppearance.selectedTranslatorName && (
        <View style={{ marginHorizontal: 16, marginBottom: 16, alignItems: 'center' }}>
          <View
            style={{
              backgroundColor: colors.primary + '15',
              paddingHorizontal: 16,
              paddingVertical: 8,
              borderRadius: 20,
              borderWidth: 1,
              borderColor: colors.primary + '30',
            }}>
            <StyledText style={{ fontSize: 12, color: colors.primary, fontWeight: '600' }}>
              📖 {t('translationLabel')}: {quranAppearance.selectedTranslatorName} ({quranAppearance.selectedTranslatorLanguage?.toUpperCase()})
            </StyledText>
          </View>
        </View>
      )}*/}
    </>
  );

  /**
   * Render list footer (spacing for audio controls)
   */
  const renderListFooter = () => <View style={{ height: 160 }} />;

  // Dropdown component for reciters and translations
  const Dropdown = ({ visible, options, selected, onSelect, onClose }: any) => {
    if (!visible) return null;

    return (
      <View
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: '100%',
          zIndex: 50,
          marginTop: 8,
          maxHeight: 192,
          borderRadius: 12,
          borderWidth: 1,
          borderColor: colors.border,
          backgroundColor: colors.surface,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.2,
          shadowRadius: 8,
          elevation: 5,
        }}>
        <ScrollView style={{ paddingVertical: 4 }}>
          {options.map((option: any, index: number) => {
            const optionName = typeof option === 'string' ? option : option.name;
            const isSelected =
              typeof selected === 'string' ? selected === optionName : selected === option.folder;

            return (
              <TouchableOpacity
                key={index}
                style={{
                  borderBottomWidth: 1,
                  borderBottomColor: colors.border,
                  paddingHorizontal: 16,
                  paddingVertical: 12,
                  backgroundColor: isSelected ? colors.primaryLight : 'transparent',
                }}
                onPress={() => {
                  onSelect(typeof option === 'string' ? option : option.folder);
                  onClose();
                }}>
                <StyledText
                  style={{
                    fontSize: 14,
                    fontWeight: isSelected ? '600' : '400',
                    color: isSelected ? colors.primary : colors.text,
                  }}>
                  {optionName}
                </StyledText>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>
    );
  };

  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: colors.background,
        }}>
        <ActivityIndicator size="large" color={colors.primary} />
        <StyledText style={{ marginTop: 16, fontSize: 16, color: colors.textSecondary }}>
          {t('loadingQuran')}
        </StyledText>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

      {/* Header */}
      <View
        style={{
          backgroundColor: colors.surface,
          paddingHorizontal: 16,
          paddingBottom: 8,
          paddingTop: 12,
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
        }}>
        <View
          style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          {/* Left Side */}
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Ionicons name="arrow-back" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          {/* Center - Surah Title */}
          <View style={{ flex: 1, alignItems: 'center' }}>
            <StyledText style={{ fontSize: 16, fontWeight: '600', color: colors.primary }}>
              {currentSurah
                ? (language === 'ur' ? currentSurah.nameArabic : currentSurah.name)
                : t('alQuran')}
            </StyledText>
            <StyledText style={{ marginTop: 2, fontSize: 12, color: colors.textSecondary }}>
              {currentSurah &&
                `${currentSurah.numberOfAyahs} ${t('ayahs')} • ${
                  currentSurah.revelationType === 'Meccan'
                    ? t('filterMeccan')
                    : t('filterMedinan')
                }`}
            </StyledText>
          </View>

          {/* Right Side */}
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <TouchableOpacity style={{ marginRight: 12 }} onPress={handleBookmarkSurah}>
              <Ionicons
                name={isBookmarked(currentSurah?.surahNumber || surahNumber, 0) ? "bookmark" : "bookmark-outline"}
                size={24}
                color={colors.primary}
              />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => navigation.navigate('ReadingScreen')}>
              <Ionicons name="options-outline" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* FlatList for Verses - Better Performance with Lazy Loading */}
      <FlatList
        ref={flatListRef}
        data={ayahs}
        renderItem={renderAyahItem}
        keyExtractor={(item, index) => `${item.sura}-${item.aya}-${index}`}
        ListHeaderComponent={renderListHeader}
        ListFooterComponent={renderListFooter}
        style={{ flex: 1, backgroundColor: colors.background }}
        contentContainerStyle={{ paddingBottom: 20 }}
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], {
          useNativeDriver: false,
        })}
        scrollEventThrottle={16}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        initialNumToRender={10}
        maxToRenderPerBatch={10}
        windowSize={10}
        removeClippedSubviews={true}
        getItemLayout={(data, index) => ({
          length: 120, // Approximate item height
          offset: 120 * index,
          index,
        })}
      />

      {/* Beautiful Audio Player with Real Functionality */}
      <Animated.View
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: controlsHeight,
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
          backgroundColor: colors.primary,
          paddingHorizontal: 24,
          paddingTop: 20,
          paddingBottom: 15,
        }}>
        {/* Reciter Info & Main Controls */}
        <View
          style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <View style={{ position: 'relative', flex: 1 }}>
            <TouchableOpacity
              style={{ flexDirection: 'row', alignItems: 'center' }}
              onPress={() => {
                setShowReciterDropdown(!showReciterDropdown);
                setShowTranslationDropdown(false);
              }}>
              <Image
                source={{ uri: 'https://via.placeholder.com/40' }}
                style={{ marginRight: 12, height: 40, width: 40, borderRadius: 20 }}
              />
              <View>
                <StyledText style={{ fontSize: 16, fontWeight: '600', color: '#fff' }}>
                  {reciters.find((r) => r.folder === selectedReciter)?.name || t('reciterAlAfasy')}
                </StyledText>
                <StyledText style={{ fontSize: 12, color: '#fff', opacity: 0.8 }}>
                  {duration > 0 ? formatTime(position) : '00:00'}
                </StyledText>
              </View>
            </TouchableOpacity>
            <Dropdown
              visible={showReciterDropdown}
              options={reciters}
              selected={selectedReciter}
              onSelect={setSelectedReciter}
              onClose={() => setShowReciterDropdown(false)}
            />
          </View>

          {/* Playback Controls */}
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <TouchableOpacity
              style={{ marginRight: 16 }}
              onPress={playPreviousAyah}
              disabled={currentAyahIndex === 0}>
              <Ionicons
                name="play-skip-back"
                size={24}
                color={currentAyahIndex === 0 ? 'rgba(255,255,255,0.3)' : '#fff'}
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={{
                height: 48,
                width: 48,
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: 24,
                backgroundColor: 'rgba(255,255,255,0.2)',
              }}
              onPress={togglePlayPause}
              disabled={isLoadingAudio}>
              {isLoadingAudio ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Ionicons name={isPlaying ? 'pause' : 'play'} size={24} color="#fff" />
              )}
            </TouchableOpacity>
            <TouchableOpacity
              style={{ marginLeft: 16 }}
              onPress={playNextAyah}
              disabled={currentAyahIndex === ayahs.length - 1}>
              <Ionicons
                name="play-skip-forward"
                size={24}
                color={currentAyahIndex === ayahs.length - 1 ? 'rgba(255,255,255,0.3)' : '#fff'}
              />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={{ marginLeft: 8 }}
            onPress={() => setShowReadingSettings(true)}>
            <Ionicons name="settings-outline" size={24} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Bottom Actions */}
        <Animated.View
          style={{
            marginTop: 16,
            opacity: controlsHeight.interpolate({
              inputRange: [85, 150],
              outputRange: [0, 1],
            }),
          }}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}>
            {/* Translation Dropdown */}
            <View style={{ position: 'relative' }}>
              <TouchableOpacity
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  borderRadius: 12,
                  backgroundColor: 'rgba(255,255,255,0.2)',
                  paddingHorizontal: 12,
                  paddingVertical: 8,
                }}
                onPress={() => {
                  setShowTranslationDropdown(!showTranslationDropdown);
                  setShowReciterDropdown(false);
                }}>
                <StyledText
                  style={{ marginRight: 4, fontSize: 12, fontWeight: '600', color: '#fff' }}>
                  {selectedTranslation}
                </StyledText>
                <View
                  style={{
                    marginHorizontal: 8,
                    height: 16,
                    width: 1,
                    backgroundColor: '#fff',
                    opacity: 0.3,
                  }}
                />
                <StyledText style={{ fontSize: 12, color: '#fff' }}>
                  {t('translationUrdu')}
                </StyledText>
              </TouchableOpacity>
              <StyledText style={{ marginTop: 4, fontSize: 10, color: '#fff' }}>
                {t('translationLabel')}
              </StyledText>
              <Dropdown
                visible={showTranslationDropdown}
                options={translations}
                selected={selectedTranslation}
                onSelect={setSelectedTranslation}
                onClose={() => setShowTranslationDropdown(false)}
              />
            </View>

            {/* Action Buttons */}
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <TouchableOpacity
                style={{
                  marginRight: 12,
                  height: 48,
                  width: 48,
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: 12,
                  backgroundColor: 'rgba(255,255,255,0.2)',
                }}>
                <Ionicons name="share-social" size={20} color="#fff" />
                <StyledText style={{ marginTop: 2, fontSize: 9, color: '#fff' }}>
                  {t('share')}
                </StyledText>
              </TouchableOpacity>

              <TouchableOpacity
                style={{
                  marginRight: 12,
                  height: 48,
                  width: 48,
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: 12,
                  backgroundColor: 'rgba(255,255,255,0.2)',
                }}>
                <StyledText style={{ fontSize: 12, fontWeight: '600', color: '#fff' }}>
                  1.0 x
                </StyledText>
                <StyledText style={{ marginTop: 2, fontSize: 9, color: '#fff' }}>
                  {t('speed')}
                </StyledText>
              </TouchableOpacity>

              <TouchableOpacity
                style={{
                  marginRight: 12,
                  height: 48,
                  width: 48,
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: 12,
                  backgroundColor: autoPlayEnabled ? '#fff' : 'rgba(255,255,255,0.2)',
                }}
                onPress={() => setAutoPlayEnabled(!autoPlayEnabled)}>
                <Ionicons
                  name="repeat"
                  size={20}
                  color={autoPlayEnabled ? colors.primary : '#fff'}
                />
                <StyledText
                  style={{
                    marginTop: 2,
                    fontSize: 9,
                    color: autoPlayEnabled ? colors.primary : '#fff',
                  }}>
                  {t('repeat')}
                </StyledText>
              </TouchableOpacity>

              <TouchableOpacity
                style={{
                  height: 48,
                  width: 48,
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: 12,
                  backgroundColor: 'rgba(255,255,255,0.2)',
                }}>
                <Ionicons name="musical-notes" size={20} color="#fff" />
                <StyledText style={{ marginTop: 2, fontSize: 9, color: '#fff' }}>
                  {t('audioLabel')}
                </StyledText>
              </TouchableOpacity>
            </View>
          </View>
        </Animated.View>
      </Animated.View>

      {/* Reading Settings Modal */}
      <Modal
        visible={showReadingSettings}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowReadingSettings(false)}>
        <TouchableOpacity
          activeOpacity={1}
          style={{
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.5)',
            justifyContent: 'flex-end',
          }}
          onPress={() => setShowReadingSettings(false)}>
          <TouchableOpacity activeOpacity={1} onPress={(e) => e.stopPropagation()}>
            <View
              style={{
                backgroundColor: colors.background,
                borderTopLeftRadius: 24,
                borderTopRightRadius: 24,
                paddingTop: 20,
                paddingBottom: 40,
                paddingHorizontal: 20,
              }}>
              {/* Header */}
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <StyledText style={{ fontSize: 20, fontWeight: 'bold', color: colors.text }}>
                  Reading Settings
                </StyledText>
                <TouchableOpacity onPress={() => setShowReadingSettings(false)}>
                  <Ionicons name="close-circle" size={28} color={colors.textSecondary} />
                </TouchableOpacity>
              </View>

              {/* Arabic Text Visibility Toggle */}
              <View style={{ paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: colors.border }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                  <View style={{ flex: 1 }}>
                    <StyledText style={{ fontSize: 15, color: colors.text, marginBottom: 4 }}>
                      Show Arabic Text
                    </StyledText>
                    <StyledText style={{ fontSize: 12, color: colors.textSecondary }}>
                      Display Arabic verses
                    </StyledText>
                  </View>
                  <Switch
                    value={quranAppearance.arabicTextEnabled}
                    onValueChange={(value) => updateQuranAppearance({ arabicTextEnabled: value })}
                    trackColor={{ false: colors.border, true: colors.primaryLight }}
                    thumbColor={quranAppearance.arabicTextEnabled ? colors.primary : colors.background}
                  />
                </View>
              </View>

              {/* Translation Toggle */}
              <View style={{ paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: colors.border }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                  <View style={{ flex: 1 }}>
                    <StyledText style={{ fontSize: 15, color: colors.text, marginBottom: 4 }}>
                      Show Translation
                    </StyledText>
                    <StyledText style={{ fontSize: 12, color: colors.textSecondary }}>
                      Display translation below Arabic
                    </StyledText>
                  </View>
                  <Switch
                    value={quranAppearance.translationEnabled}
                    onValueChange={(value) => updateQuranAppearance({ translationEnabled: value })}
                    trackColor={{ false: colors.border, true: colors.primaryLight }}
                    thumbColor={quranAppearance.translationEnabled ? colors.primary : colors.background}
                  />
                </View>
              </View>

              {/* Word-by-Word Toggle */}
              <View style={{ paddingVertical: 12 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                  <View style={{ flex: 1 }}>
                    <StyledText style={{ fontSize: 15, color: colors.text, marginBottom: 4 }}>
                      Word by Word
                    </StyledText>
                    <StyledText style={{ fontSize: 12, color: colors.textSecondary }}>
                      Show individual Arabic words with translation
                    </StyledText>
                  </View>
                  <Switch
                    value={quranAppearance.wordByWordEnabled}
                    onValueChange={(value) => updateQuranAppearance({ wordByWordEnabled: value })}
                    trackColor={{ false: colors.border, true: colors.primaryLight }}
                    thumbColor={quranAppearance.wordByWordEnabled ? colors.primary : colors.background}
                  />
                </View>
              </View>
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}
