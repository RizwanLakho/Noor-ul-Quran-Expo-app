import React, { useState, useRef } from 'react';
import { View, ScrollView, TouchableOpacity, Image, StatusBar, Animated, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useSettings } from '../context/SettingsContext';
import { useLanguage } from '../context/LanguageContext';
import StyledText from '../components/StyledText';
import QuranAudioPlayer from '../components/QuranAudioPlayer';

export default function QuranReader() {
  const { colors, isDark } = useTheme();
  const { quranAppearance } = useSettings();
  const { t } = useLanguage();
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedSurah, setSelectedSurah] = useState(t('surahAlFatihah'));
  const [selectedJuz, setSelectedJuz] = useState('1');
  const [selectedPage, setSelectedPage] = useState('1');
  const [selectedReciter, setSelectedReciter] = useState(t('reciterAsSudais'));
  const [selectedTranslation, setSelectedTranslation] = useState(t('translationEng'));
  const [showSurahDropdown, setShowSurahDropdown] = useState(false);
  const [showJuzDropdown, setShowJuzDropdown] = useState(false);
  const [showPageDropdown, setShowPageDropdown] = useState(false);
  const [showReciterDropdown, setShowReciterDropdown] = useState(false);
  const [showTranslationDropdown, setShowTranslationDropdown] = useState(false);
  const [audioControlsExpanded, setAudioControlsExpanded] = useState(true);
  const [currentAyahIndex, setCurrentAyahIndex] = useState(0);
  const [showAudioPlayer, setShowAudioPlayer] = useState(false);
  const lastScrollY = useRef(0);
  const controlsHeight = useRef(new Animated.Value(150)).current;
  const scrollViewRef = useRef<ScrollView>(null);
  const verseRefs = useRef<{ [key: number]: View | null }>({});

  // Dropdown options
  const surahs = [t('surahAlFatihah'), t('surahAlBaqarah'), t('surahAlImran'), t('surahAnNisa'), t('surahAlMaidah'), t('surahAlAnam')];
  const juzOptions = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'];
  const pageOptions = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'];
  const reciters = [
    t('reciterAsSudais'),
    t('reciterAlAfasy'),
    t('reciterAlHusary'),
    t('reciterAlMinshawi'),
    t('reciterAlGhamdi'),
    t('reciterMisharyRashid'),
  ];
  const translations = [t('translationEng'), t('translationUrdu'), t('translationIndonesia'), t('translationTurkce'), t('translationFrancais'), t('translationDeutsch')];

  // Verses data with surah and ayah numbers for Al-Fatihah (Surah 1)
  const verses = [
    {
      id: 1,
      sura: 1,
      aya: 1,
      arabic: 'بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ',
      translation: t('fatihaAyah1'),
    },
    {
      id: 2,
      sura: 1,
      aya: 2,
      arabic: 'ٱلْحَمْدُ لِلَّهِ رَبِّ ٱلْعَٰلَمِينَ',
      translation: t('fatihaAyah2'),
    },
    {
      id: 3,
      sura: 1,
      aya: 3,
      arabic: 'ٱلرَّحْمَٰنِ ٱلرَّحِيمِ',
      translation: t('fatihaAyah3'),
    },
    {
      id: 4,
      sura: 1,
      aya: 4,
      arabic: 'مَٰلِكِ يَوْمِ ٱلدِّينِ',
      translation: t('fatihaAyah4'),
    },
    {
      id: 5,
      sura: 1,
      aya: 5,
      arabic: 'إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ',
      translation: t('fatihaAyah5'),
    },
    {
      id: 6,
      sura: 1,
      aya: 6,
      arabic: 'ٱهْدِنَا ٱلصِّرَٰطَ ٱلْمُسْتَقِيمَ',
      translation: t('fatihaAyah6'),
    },
    {
      id: 7,
      sura: 1,
      aya: 7,
      arabic:
        'صِرَٰطَ ٱلَّذِينَ أَنْعَمْتَ عَلَيْهِمْ غَيْرِ ٱلْمَغْضُوبِ عَلَيْهِمْ وَلَا ٱلضَّآلِّينَ',
      translation: t('fatihaAyah7'),
    },
  ];

  // Auto-scroll to current ayah when it changes
  React.useEffect(() => {
    if (showAudioPlayer && verseRefs.current[currentAyahIndex]) {
      verseRefs.current[currentAyahIndex]?.measureLayout(
        scrollViewRef.current as any,
        (x, y) => {
          scrollViewRef.current?.scrollTo({
            y: y - 100, // Offset to keep verse visible with some padding
            animated: true,
          });
        },
        () => {}
      );
    }
  }, [currentAyahIndex, showAudioPlayer]);

  const handleScroll = (event) => {
    const currentScrollY = event.nativeEvent.contentOffset.y;

    // Scroll DOWN (neeche) - Controls HIDE
    if (currentScrollY > lastScrollY.current && currentScrollY > 50) {
      if (audioControlsExpanded) {
        setAudioControlsExpanded(false);
        Animated.timing(controlsHeight, {
          toValue: 85,
          duration: 300,
          useNativeDriver: false,
        }).start();
      }
    }
    // Scroll UP (uper) - Controls SHOW
    else if (currentScrollY < lastScrollY.current) {
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

  const Dropdown = ({ visible, options, selected, onSelect, onClose }) => {
    if (!visible) return null;

    return (
      <View className="absolute left-0 right-0 top-full z-50 mt-2 max-h-48 rounded-lg border border-gray-100 bg-white shadow-2xl">
        <ScrollView className="py-1">
          {options.map((option, index) => (
            <TouchableOpacity
              key={index}
              className={`border-b border-gray-50 px-4 py-3 ${selected === option ? 'bg-teal-50' : ''}`}
              onPress={() => {
                onSelect(option);
                onClose();
              }}>
              <StyledText
                className={`text-sm ${selected === option ? 'font-semibold text-teal-600' : 'text-gray-700'}`}>
                {option}
              </StyledText>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

      {/* Header - ORIGINAL DESIGN */}
      <View style={{ backgroundColor: colors.surface, paddingHorizontal: 16, paddingBottom: 16, paddingTop: 48 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          {/* Left Side */}
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <TouchableOpacity style={{ marginRight: 16 }}>
              <Ionicons name="arrow-back" size={24} color={colors.text} />
            </TouchableOpacity>
            <TouchableOpacity style={{ height: 40, width: 40, alignItems: 'center', justifyContent: 'center', borderRadius: 20, backgroundColor: colors.border }}>
              <Ionicons name="person" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Center - Surah Title with Dropdown */}
          <View style={{ position: 'relative', flex: 1, alignItems: 'center' }}>
            <TouchableOpacity
              style={{ flexDirection: 'row', alignItems: 'center' }}
              onPress={() => {
                setShowSurahDropdown(!showSurahDropdown);
                setShowJuzDropdown(false);
                setShowPageDropdown(false);
              }}>
              <StyledText style={{ fontSize: 16, fontWeight: '600', color: colors.primary }}>{t('surah')} {selectedSurah}</StyledText>
              <Ionicons name="chevron-down" size={16} color={colors.primary} style={{ marginLeft: 4 }} />
            </TouchableOpacity>
            <StyledText style={{ marginTop: 2, fontSize: 12, color: colors.textSecondary }}>
              {t('page')} {selectedPage} | {t('juzFull')}{selectedJuz} | {t('hizb')} 1
            </StyledText>
            <Dropdown
              visible={showSurahDropdown}
              options={surahs}
              selected={selectedSurah}
              onSelect={setSelectedSurah}
              onClose={() => setShowSurahDropdown(false)}
            />
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

      <ScrollView
        ref={scrollViewRef}
        style={{ flex: 1, backgroundColor: colors.background }}
        onScroll={handleScroll}
        scrollEventThrottle={16}>
        {/* Surah Header Frame */}
        <View style={{ marginHorizontal: 16, marginBottom: 24, marginTop: 16 }}>
          <Image
            source={require('../../assets/surahframe.png')}
            style={{ height: 80, width: '100%' }}
            resizeMode="contain"
          />
        </View>

        {/* Verses */}
        {verses.map((verse, index) => (
          <View
            key={verse.id}
            ref={(ref) => (verseRefs.current[index] = ref)}
            style={{
              marginHorizontal: 16,
              marginBottom: 12,
              borderRadius: 12,
              backgroundColor: currentAyahIndex === index && showAudioPlayer ? colors.primaryLight : colors.surface,
              padding: 16,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 4,
              elevation: 2,
              borderWidth: currentAyahIndex === index && showAudioPlayer ? 2 : 0,
              borderColor: colors.primary,
            }}>
            {/* Verse Header - Icons, Arabic Text, Number */}
            <View style={{ marginBottom: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              {/* Left Icons */}
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <TouchableOpacity
                  style={{ marginRight: 12 }}
                  onPress={() => {
                    setCurrentAyahIndex(index);
                    setShowAudioPlayer(true);
                  }}>
                  <Ionicons name="play-circle" size={24} color={colors.primary} />
                </TouchableOpacity>
                <TouchableOpacity style={{ marginRight: 12 }}>
                  <Ionicons name="bookmark-outline" size={20} color={colors.primary} />
                </TouchableOpacity>
                <TouchableOpacity>
                  <Ionicons name="share-social-outline" size={20} color={colors.primary} />
                </TouchableOpacity>
              </View>

              {/* Center - Arabic Text with Custom Size and Color */}
              <View style={{ marginHorizontal: 12, flex: 1 }}>
                <StyledText
                  style={{
                    textAlign: 'center',
                    fontSize: quranAppearance.textSize,
                    lineHeight: quranAppearance.textSize * 1.6,
                    color: quranAppearance.textColor,
                    fontFamily: 'System'
                  }}>
                  {verse.arabic}
                </StyledText>
              </View>

              {/* Right - Verse Number */}
              <View style={{ height: 32, width: 32, alignItems: 'center', justifyContent: 'center', borderRadius: 16, backgroundColor: colors.primary }}>
                <StyledText style={{ fontSize: 12, fontWeight: '600', color: '#fff' }}>{verse.id}</StyledText>
              </View>
            </View>

            {/* English Translation - Conditional */}
            {quranAppearance.translationEnabled && (
              <StyledText style={{ marginTop: 8, fontSize: quranAppearance.textSize * 0.7, lineHeight: quranAppearance.textSize * 1.2, color: colors.textSecondary }}>
                {verse.translation}
              </StyledText>
            )}
          </View>
        ))}

        <View className="h-40" />
      </ScrollView>

      {/* QuranAudioPlayer Component */}
      {showAudioPlayer && (
        <QuranAudioPlayer
          ayahs={verses}
          currentIndex={currentAyahIndex}
          onIndexChange={setCurrentAyahIndex}
          visible={showAudioPlayer}
        />
      )}
    </View>
  );
}