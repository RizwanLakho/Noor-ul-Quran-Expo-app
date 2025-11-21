import React, { useState, useRef } from 'react';
import {
  View,
  Dimensions,
  TouchableOpacity,
  FlatList,
  Animated,
  ViewToken,
  StyleSheet,
  ImageSourcePropType,
  Image,
  ImageBackground,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import StyledText from '../components/StyledText';

const { width, height } = Dimensions.get('window');
const bg = require('../../assets/bg.png'); // <-- 👈 yahan sahi path lagao

interface Slide {
  id: string;
  heading: string;
  description: string;
  bgColor: string;
  icon: string;
  imageSrc?: ImageSourcePropType;
}

interface OnboardingScreenProps {
  onComplete: () => void;
}

export default function OnboardingScreen({ onComplete }: OnboardingScreenProps) {
  const { colors } = useTheme();
  const { t } = useLanguage();
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollX = useRef(new Animated.Value(0)).current;
  const slidesRef = useRef<FlatList<Slide>>(null);

  const slides: Slide[] = [
    {
      id: '1',
      heading: t('onboardingHolyQuranTitle'),
      description: t('onboardingHolyQuranDesc'),
      bgColor: '#0D9488',
      icon: require('../../assets/Illustration.png'),
    },
    {
      id: '2',
      heading: t('onboardingMemorizeQuranTitle'),
      description: t('onboardingMemorizeQuranDesc'),
      bgColor: '#7B68EE',
      icon: require('../../assets/Mem.png'),
    },
    {
      id: '3',
      heading: t('onboardingQuranQuizzesTitle'),
      description: t('onboardingQuranQuizzesDesc'),
      bgColor: '#2EBBC3',
      icon: require('../../assets/Quiz.png'),
    },
    {
      id: '4',
      heading: t('onboardingStreaksChallengesTitle'),
      description: t('onboardingStreaksChallengesDesc'),
      bgColor: '#50C878',
      icon: require('../../assets/frame.png'),
    },
  ];

  const viewableItemsChanged = useRef(({ viewableItems }: { viewableItems: ViewToken[] }) => {
    if (viewableItems.length > 0 && viewableItems[0].index !== null) {
      setCurrentIndex(viewableItems[0].index);
    }
  }).current;

  const viewConfig = useRef({ viewAreaCoveragePercentThreshold: 50 }).current;

  const scrollTo = () => {
    if (currentIndex < slides.length - 1) {
      slidesRef.current?.scrollToIndex({ index: currentIndex + 1 });
    } else {
      onComplete();
    }
  };

  const skipToEnd = () => {
    slidesRef.current?.scrollToIndex({ index: slides.length - 1 });
  };

  const renderItem = ({ item }: { item: Slide }) => (
    <View style={[styles.slide]}>
      <View style={styles.slideContent}>
        {/* Card Container */}
        <StyledText style={styles.appName}>{t('appName')}</StyledText>
        <View style={styles.card}>
          {/* Header Section */}
          <View style={styles.headerSection}>
            <StyledText style={styles.heading}>{item.heading}</StyledText>
            <StyledText style={styles.description}>{item.description}</StyledText>
          </View>

          {/* Icon Section */}
          <View style={styles.iconSection}>
            <View style={styles.iconContainer}>
              {/* Background Circle */}
              <View style={styles.backgroundCircle} />
              {/* Icon */}
              <Image source={item.icon} style={styles.icon} resizeMode="contain" />
            </View>
          </View>

          {/* Decorative Bottom */}
          <View style={styles.decorativeBottom}>
            <View style={styles.line} />
            <View style={styles.dotsContainer}>
              <View style={[styles.dot, styles.dot1]} />
              <View style={[styles.dot, styles.dot2]} />
              <View style={[styles.dot, styles.dot3]} />
              <View style={[styles.dot, styles.dot4]} />
            </View>
            <View style={styles.line} />
          </View>
        </View>
      </View>
    </View>
  );

  const Paginator = () => (
    <View style={styles.paginatorContainer}>
      {slides.map((_, i) => {
        const inputRange = [(i - 1) * width, i * width, (i + 1) * width];
        const dotWidth = scrollX.interpolate({
          inputRange,
          outputRange: [8, 32, 8],
          extrapolate: 'clamp',
        });
        const opacity = scrollX.interpolate({
          inputRange,
          outputRange: [0.4, 1, 0.4],
          extrapolate: 'clamp',
        });

        return (
          <Animated.View
            style={[styles.paginationDot, { width: dotWidth, opacity }]}
            key={i.toString()}
          />
        );
      })}
    </View>
  );

  const ProgressBar = () => {
    const progressWidth = scrollX.interpolate({
      inputRange: [0, (slides.length - 1) * width],
      outputRange: ['0%', '100%'],
      extrapolate: 'clamp',
    });

    return (
      <View style={styles.progressBarContainer}>
        <Animated.View style={[styles.progressBar, { width: progressWidth }]} />
      </View>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-black">
      <ImageBackground
        source={bg}
        resizeMode="cover"
        className="flex-1 items-center justify-center">
        <View style={styles.container}>
          {/* Progress Bar */}
          <ProgressBar />

          {/* Header with App Name and Skip Button */}
          <View style={styles.header}>
            {currentIndex < slides.length - 1 && (
              <TouchableOpacity onPress={skipToEnd} style={styles.skipButton}>
                <StyledText style={styles.skipText}>{t('skip')}</StyledText>
              </TouchableOpacity>
            )}
          </View>

          {/* Slides */}

          <View style={styles.slidesContainer}>
            <FlatList
              data={slides}
              renderItem={renderItem}
              horizontal
              showsHorizontalScrollIndicator={false}
              pagingEnabled
              bounces={false}
              keyExtractor={(item) => item.id}
              onScroll={Animated.event([{ nativeEvent: { contentOffset: { x: scrollX } } }], {
                useNativeDriver: false,
              })}
              scrollEventThrottle={32}
              onViewableItemsChanged={viewableItemsChanged}
              viewabilityConfig={viewConfig}
              ref={slidesRef}
            />
          </View>

          {/* Footer Navigation */}
          <View style={styles.footer}>
            <Paginator />

            {/* Next/Get Started Button */}
            <TouchableOpacity style={styles.nextButton} onPress={scrollTo}>
              <StyledText style={styles.nextButtonText}>
                {currentIndex === slides.length - 1 ? t('continue') : t('next')}
              </StyledText>
            </TouchableOpacity>
          </View>
        </View>
      </ImageBackground>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  progressBarContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    zIndex: 20,
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#0D9488',
  },
  header: {
    position: 'absolute',
    top: 28,
    left: 24,
    right: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 20,
  },
  appName: {
    fontSize: 40,
    marginBottom: 25,
    fontWeight: 'bold',
    color: '#604219',
    letterSpacing: 0.5,
  },
  skipButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  skipText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0D9488',
  },
  slidesContainer: {
    flex: 1,
  },
  slide: {
    width,
    height,
    justifyContent: 'center',
    alignItems: 'center',
  },
  slideContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 0,
  },
  card: {
    width: 312,
    height: 350,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    justifyContent: 'space-between',

    // 🔥 Shadow (for both iOS & Android)
    shadowColor: '#000', // shadow ka color
    shadowOffset: { width: 0, height: 6 }, // shadow ka direction
    shadowOpacity: 0.2, // shadow ki transparency
    shadowRadius: 8, // blur effect
    elevation: 30,
  },
  headerSection: {
    marginTop: 16,
    alignItems: 'center',
  },
  heading: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0D9488',
    marginBottom: 16,
    textAlign: 'center',
  },
  description: {
    fontSize: 14,
    color: 'black',
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 8,
  },
  iconSection: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 66,
    marginBottom: 66,
  },
  iconContainer: {
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backgroundCircle: {
    position: 'absolute',
    marginTop: 0,
    width: 172,
    height: 172,
    borderRadius: 96,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    opacity: 0.5,
  },
  icon: {
    width: 120,
    zIndex: 1,
  },
  decorativeBottom: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  line: {
    width: 64,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    marginHorizontal: 8,
  },
  dotsContainer: {
    flexDirection: 'row',
    gap: 4,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  dot1: {
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
  },
  dot2: {
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
  },
  dot3: {
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
  },
  dot4: {
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
  },
  footer: {
    position: 'absolute',
    bottom: 50,
    width: '100%',
    alignItems: 'center',
  },
  paginatorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  paginationDot: {
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FFFFFF',
    marginHorizontal: 4,
  },
  nextButton: {
    borderRadius: 10,
    width: '80%',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0D9488',
    paddingHorizontal: 32,
    paddingVertical: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: 3,
    marginBottom: 3,
  },
});