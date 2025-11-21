import React, { useEffect, useRef } from 'react';
import { View, Text, Image, Animated, Easing, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface LoadingScreenProps {
  message?: string;
}

export default function LoadingScreen({ message = 'Loading...' }: LoadingScreenProps) {
  const spinValue = useRef(new Animated.Value(0)).current;
  const pulseValue = useRef(new Animated.Value(1)).current;
  const fadeValue = useRef(new Animated.Value(0)).current;
  const floatValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Spinning animation for the Quran icon
    Animated.loop(
      Animated.timing(spinValue, {
        toValue: 1,
        duration: 3000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();

    // Pulsing animation for the logo
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseValue, {
          toValue: 1.08,
          duration: 1200,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseValue, {
          toValue: 1,
          duration: 1200,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Floating animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatValue, {
          toValue: -10,
          duration: 1500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(floatValue, {
          toValue: 0,
          duration: 1500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Fade in animation
    Animated.timing(fadeValue, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, []);

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <LinearGradient
      colors={['#F0FDFA', '#CCFBF1', '#99F6E4']}
      style={styles.container}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      {/* Background Decoration */}
      <Animated.View
        style={[
          styles.decorCircle,
          styles.decorCircle1,
          { opacity: pulseValue.interpolate({ inputRange: [1, 1.08], outputRange: [0.15, 0.25] }) }
        ]}
      />
      <Animated.View
        style={[
          styles.decorCircle,
          styles.decorCircle2,
          { opacity: pulseValue.interpolate({ inputRange: [1, 1.08], outputRange: [0.2, 0.3] }) }
        ]}
      />
      <Animated.View
        style={[
          styles.decorCircle,
          styles.decorCircle3,
          { opacity: pulseValue.interpolate({ inputRange: [1, 1.08], outputRange: [0.15, 0.25] }) }
        ]}
      />

      {/* Main Content */}
      <Animated.View
        style={[
          styles.content,
          {
            opacity: fadeValue,
            transform: [{ translateY: floatValue }],
          },
        ]}
      >
        {/* Logo with Glow Effect */}
        <View style={styles.logoContainer}>
          <View style={styles.logoGlow} />
          <Animated.Image
            source={require('../../assets/logo.png')}
            style={[
              styles.logo,
              {
                transform: [{ scale: pulseValue }],
              },
            ]}
            resizeMode="contain"
          />
        </View>

        {/* Animated Quran Icon */}
        <Animated.View
          style={{
            transform: [{ rotate: spin }],
            marginBottom: 24,
          }}
        >
          <Image
            source={require('../../assets/Quran.png')}
            style={styles.quranIcon}
            resizeMode="contain"
          />
        </Animated.View>

        {/* Loading Dots */}
        <View style={styles.dotsContainer}>
          <Animated.View
            style={[
              styles.dot,
              {
                opacity: spinValue.interpolate({
                  inputRange: [0, 0.33, 0.66, 1],
                  outputRange: [0.3, 1, 0.3, 0.3],
                }),
              },
            ]}
          />
          <Animated.View
            style={[
              styles.dot,
              {
                opacity: spinValue.interpolate({
                  inputRange: [0, 0.33, 0.66, 1],
                  outputRange: [0.3, 0.3, 1, 0.3],
                }),
              },
            ]}
          />
          <Animated.View
            style={[
              styles.dot,
              {
                opacity: spinValue.interpolate({
                  inputRange: [0, 0.33, 0.66, 1],
                  outputRange: [0.3, 0.3, 0.3, 1],
                }),
              },
            ]}
          />
        </View>

        {/* Loading Text */}
        <Text style={styles.loadingText}>{message}</Text>

        {/* App Tagline */}
        <Text style={styles.appName}>Noor ul-Quran</Text>
      </Animated.View>

      {/* Bottom Tagline */}
      <View style={styles.bottomContainer}>
        <Text style={styles.tagline}>Reading the Quran, One Ayah at a Time</Text>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  decorCircle: {
    position: 'absolute',
    borderRadius: 999,
    backgroundColor: '#14B8A6',
  },
  decorCircle1: {
    top: 80,
    left: 40,
    width: 128,
    height: 128,
  },
  decorCircle2: {
    bottom: 128,
    right: 64,
    width: 160,
    height: 160,
  },
  decorCircle3: {
    top: '33%',
    right: 40,
    width: 96,
    height: 96,
  },
  content: {
    alignItems: 'center',
  },
  logoContainer: {
    marginBottom: 32,
    alignItems: 'center',
    position: 'relative',
  },
  logoGlow: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: '#14B8A6',
    opacity: 0.2,
    shadowColor: '#14B8A6',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 30,
    elevation: 10,
  },
  logo: {
    width: 120,
    height: 120,
  },
  quranIcon: {
    width: 64,
    height: 64,
  },
  dotsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#14B8A6',
  },
  loadingText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0F766E',
    marginBottom: 8,
  },
  appName: {
    fontSize: 14,
    color: '#14B8A6',
    textAlign: 'center',
    paddingHorizontal: 32,
    marginTop: 8,
    fontWeight: '500',
  },
  bottomContainer: {
    position: 'absolute',
    bottom: 32,
    alignItems: 'center',
  },
  tagline: {
    fontSize: 12,
    color: '#14B8A6',
    opacity: 0.7,
  },
});
