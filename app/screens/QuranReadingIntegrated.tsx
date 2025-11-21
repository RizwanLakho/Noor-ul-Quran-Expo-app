import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  ScrollView,
  FlatList,
  TouchableOpacity,
  Image,
  StatusBar,
  Animated,
  ActivityIndicator,
  Alert,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Audio, AVPlaybackStatus } from 'expo-av';
import { useTheme } from '../context/ThemeContext';
import { useSettings } from '../context/SettingsContext';
import { useLanguage } from '../context/LanguageContext';
import StyledText from '../components/StyledText';
import { apiService } from '../services/ApiService';
import type { Ayah } from './types/quran.types';

export default function QuranReadingIntegrated({ route, navigation }: any) {
  const { colors, isDark } = useTheme();
  const { quranAppearance } = useSettings();
  const { t } = useLanguage();

  // Audio player state - Beautiful UI
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedReciter, setSelectedReciter] = useState('Alafasy_128kbps');
  const [selectedTranslation, setSelectedTranslation] = useState(t('translationEng'));
  const [showReciterDropdown, setShowReciterDropdown] = useState(false);
  const [showTranslationDropdown, setShowTranslationDropdown] = useState(false);
  const [audioControlsExpanded, setAudioControlsExpanded] = useState(true);
  const lastScrollY = useRef(0);
  const controlsHeight = useRef(new Animated.Value(150)).current;

  // Real Audio Functionality
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [currentAyahIndex, setCurrentAyahIndex] = useState(0);
  const [isLoadingAudio, setIsLoadingAudio] = useState(false);
  const [duration, setDuration] = useState(0);
  const [position, setPosition] = useState(0);
  const [autoPlayEnabled, setAutoPlayEnabled] = useState(false);

  // API State
  const [loading, setLoading] = useState(true);
  const [ayahs, setAyahs] = useState<Ayah[]>([]);
  const [currentSurah, setCurrentSurah] = useState<any>(null);

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

  const translations = [t('translationEng'), t('translationUrdu'), t('translationIndonesia'), t('translationTurkce'), t('translationFrancais'), t('translationDeutsch')];

  // Audio CDN URL builder
  const getAudioUrl = (surah: number, ayah: number): string => {
    const surahPadded = String(surah).padStart(3, '0');
    const ayahPadded = String(ayah).padStart(3, '0');
    return `https://everyayah.com/data/${selectedReciter}/${surahPadded}${ayahPadded}.mp3`;
  };

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
            translationPreview: ayahsArray[0].translation?.substring(0, 50)
          });
        }
        setAyahs(ayahsArray);
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
            translationLength: ayahsArray[0].translation?.length
          });
        }
        setAyahs(ayahsArray);
      } else if (type === 'page' && pageNumber) {
        // For Page, similar to Juz
        Alert.alert(
          t('comingSoon'),
          t('pageNavigationComingSoon').replace('{pageNumber}', pageNumber)
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
      Alert.alert(
        t('error'),
        t('failedToLoadQuranData'),
        [
          { text: t('goBack'), onPress: () => navigation.goBack() },
          { text: t('retry'), onPress: () => fetchQuranData() },
        ]
      );
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

  // Cleanup sound on unmount
  useEffect(() => {
    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, [sound]);

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

      if (autoPlayEnabled && currentAyahIndex < ayahs.length - 1) {
        setTimeout(() => {
          playNextAyah();
        }, 500);
      }
    }
  };

  // Play specific ayah by index
  const playAyahAtIndex = async (index: number) => {
    try {
      setIsLoadingAudio(true);
      const ayah = ayahs[index];
      if (!ayah) return;

      // Unload previous sound
      if (sound) {
        await sound.unloadAsync();
      }

      // Load and play new audio
      const audioUrl = getAudioUrl(ayah.sura, ayah.aya);
      console.log('🎵 Playing:', audioUrl);

      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: audioUrl },
        { shouldPlay: true },
        onPlaybackStatusUpdate
      );

      setSound(newSound);
      setCurrentAyahIndex(index);
      setIsLoadingAudio(false);
    } catch (err) {
      console.error('Failed to load audio:', err);
      setIsLoadingAudio(false);
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

  // Scroll handler for hiding/showing audio controls
  const handleScroll = (event: any) => {
    const currentScrollY = event.nativeEvent.contentOffset.y;

    if (currentScrollY > lastScrollY.current && currentScrollY > 50) {
      if (audioControlsExpanded) {
        setAudioControlsExpanded(false);
        Animated.timing(controlsHeight, {
          toValue: 85,
          duration: 300,
          useNativeDriver: false,
        }).start();
      }
    } else if (currentScrollY < lastScrollY.current) {
      if (!audioControlsExpanded) {
        setAudioControlsExpanded(true);
        Animated.timing(controlsHeight, {
          toValue: 150,
          duration: 300,
          useNativeDriver: false,
        }).start();
      }
    }

    lastScrollY.current = currentScrollY;
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
              name={isPlaying && currentAyahIndex === index ? "pause-circle" : "play-circle"}
              size={24}
              color={colors.primary}
            />
          </TouchableOpacity>
          <TouchableOpacity style={{ marginRight: 12 }}>
            <Ionicons name="bookmark-outline" size={20} color={colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity>
            <Ionicons name="share-social-outline" size={20} color={colors.primary} />
          </TouchableOpacity>
        </View>

        {/* Center - Arabic Text */}
        <View style={{ marginHorizontal: 12, flex: 1 }}>
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
        </View>

        {/* Right - Verse Number */}
        <View
          style={{
            height: 32,
            width: 32,
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: 16,
            backgroundColor: colors.primary,
          }}>
          <StyledText
            style={{
              fontSize: 12,
              fontWeight: '600',
              color: '#000',
              fontFamily: quranAppearance.arabicFont,
            }}>
            {ayah.aya}
          </StyledText>
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
                  fontSize: quranAppearance.textSize * 0.75,
                  lineHeight: quranAppearance.textSize * 1.4,
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
        <View style={{ marginHorizontal: 16, marginBottom: 24, marginTop: 16 }}>
          <Image
            source={require('../../assets/surahframe.png')}
            style={{ height: 80, width: '100%' }}
            resizeMode="contain"
          />
        </View>
      )}

      {/* Translator Info Badge */}
      {quranAppearance.translationEnabled && quranAppearance.selectedTranslatorName && (
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
      )}
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
            const isSelected = typeof selected === 'string'
              ? selected === optionName
              : selected === option.folder;

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
          paddingBottom: 16,
          paddingTop: 48,
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
        }}>
        <View
          style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          {/* Left Side */}
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <TouchableOpacity style={{ marginRight: 16 }} onPress={() => navigation.goBack()}>
              <Ionicons name="arrow-back" size={24} color={colors.text} />
            </TouchableOpacity>
            <TouchableOpacity
              style={{
                height: 40,
                width: 40,
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: 20,
                backgroundColor: colors.border,
              }}>
              <Ionicons name="person" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Center - Surah Title */}
          <View style={{ flex: 1, alignItems: 'center' }}>
            <StyledText style={{ fontSize: 16, fontWeight: '600', color: colors.primary }}>
              {currentSurah ? currentSurah.name : t('alQuran')}
            </StyledText>
            <StyledText style={{ marginTop: 2, fontSize: 12, color: colors.textSecondary }}>
              {currentSurah &&
                `${currentSurah.numberOfAyahs} ${t('ayahs')} • ${currentSurah.revelationType}`}
            </StyledText>
          </View>

          {/* Right Side */}
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <TouchableOpacity style={{ marginRight: 12 }}>
              <Ionicons name="bookmark-outline" size={24} color={colors.primary} />
            </TouchableOpacity>
            <TouchableOpacity>
              <Ionicons name="options-outline" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* FlatList for Verses - Better Performance with Lazy Loading */}
      <FlatList
        data={ayahs}
        renderItem={renderAyahItem}
        keyExtractor={(item, index) => `${item.sura}-${item.aya}-${index}`}
        ListHeaderComponent={renderListHeader}
        ListFooterComponent={renderListFooter}
        style={{ flex: 1, backgroundColor: colors.background }}
        contentContainerStyle={{ paddingBottom: 20 }}
        onScroll={handleScroll}
        scrollEventThrottle={16}
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
                  {reciters.find(r => r.folder === selectedReciter)?.name || t('reciterAlAfasy')}
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

          <TouchableOpacity style={{ marginLeft: 8 }}>
            <Ionicons name="settings-outline" size={24} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Bottom Actions */}
        {audioControlsExpanded && (
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
                  <StyledText style={{ marginRight: 4, fontSize: 12, fontWeight: '600', color: '#fff' }}>
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
                  <StyledText style={{ fontSize: 12, color: '#fff' }}>{t('translationUrdu')}</StyledText>
                </TouchableOpacity>
                <StyledText style={{ marginTop: 4, fontSize: 10, color: '#fff' }}>{t('translationLabel')}</StyledText>
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
                  <StyledText style={{ marginTop: 2, fontSize: 9, color: '#fff' }}>{t('share')}</StyledText>
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
                  <StyledText style={{ fontSize: 12, fontWeight: '600', color: '#fff' }}>1.0 x</StyledText>
                  <StyledText style={{ marginTop: 2, fontSize: 9, color: '#fff' }}>{t('speed')}</StyledText>
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
                  <StyledText style={{ marginTop: 2, fontSize: 9, color: '#fff' }}>{t('audioLabel')}</StyledText>
                </TouchableOpacity>
              </View>
            </View>
          </Animated.View>
        )}
      </Animated.View>
    </View>
  );
}