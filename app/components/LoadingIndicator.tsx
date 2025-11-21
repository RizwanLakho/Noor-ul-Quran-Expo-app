import React, { useEffect, useRef } from 'react';
import { View, Animated, Easing } from 'react-native';
import { useTheme } from '../context/ThemeContext';

interface LoadingIndicatorProps {
  size?: 'small' | 'medium' | 'large';
  color?: string;
}

export default function LoadingIndicator({
  size = 'medium',
  color
}: LoadingIndicatorProps) {
  const { colors } = useTheme();
  const spinValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(spinValue, {
        toValue: 1,
        duration: 1500,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();
  }, []);

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const sizeMap = {
    small: 20,
    medium: 32,
    large: 48,
  };

  const dotSize = sizeMap[size] / 4;
  const containerSize = sizeMap[size];
  const loadingColor = color || colors.primary;

  return (
    <View style={{ width: containerSize, height: containerSize }} className="items-center justify-center">
      <Animated.View
        style={{
          width: containerSize,
          height: containerSize,
          transform: [{ rotate: spin }],
        }}
        className="items-center justify-center relative"
      >
        {/* Top Dot */}
        <View
          style={{
            position: 'absolute',
            top: 0,
            width: dotSize,
            height: dotSize,
            backgroundColor: loadingColor,
            borderRadius: dotSize / 2,
            opacity: 1,
          }}
        />

        {/* Right Dot */}
        <View
          style={{
            position: 'absolute',
            right: 0,
            width: dotSize,
            height: dotSize,
            backgroundColor: loadingColor,
            borderRadius: dotSize / 2,
            opacity: 0.7,
          }}
        />

        {/* Bottom Dot */}
        <View
          style={{
            position: 'absolute',
            bottom: 0,
            width: dotSize,
            height: dotSize,
            backgroundColor: loadingColor,
            borderRadius: dotSize / 2,
            opacity: 0.5,
          }}
        />

        {/* Left Dot */}
        <View
          style={{
            position: 'absolute',
            left: 0,
            width: dotSize,
            height: dotSize,
            backgroundColor: loadingColor,
            borderRadius: dotSize / 2,
            opacity: 0.3,
          }}
        />
      </Animated.View>
    </View>
  );
}
