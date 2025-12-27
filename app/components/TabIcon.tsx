import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { useTheme } from '../context/ThemeContext';

interface TabIconProps {
  focused: boolean;
  IconComponent: any;
  iconName: string;
  size?: number;
}

export default function TabIcon({
  focused,
  IconComponent,
  iconName,
  size = 24
}: TabIconProps) {
  const { colors } = useTheme();
  const scaleValue = useRef(new Animated.Value(1)).current;
  const opacityValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (focused) {
      // Animate in
      Animated.parallel([
        Animated.spring(scaleValue, {
          toValue: 1.1,
          friction: 4,
          tension: 40,
          useNativeDriver: true,
        }),
        Animated.timing(opacityValue, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      // Animate out
      Animated.parallel([
        Animated.spring(scaleValue, {
          toValue: 1,
          friction: 4,
          tension: 40,
          useNativeDriver: true,
        }),
        Animated.timing(opacityValue, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [focused]);

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{ scale: scaleValue }],
        },
      ]}
    >
      <Animated.View
        style={[
          styles.activeBackground,
          {
            backgroundColor: colors.primary,
            opacity: opacityValue,
          }
        ]}
      />
      <IconComponent
        name={iconName}
        size={size}
        color={focused ? '#FFFFFF' : colors.textSecondary}
        style={styles.icon}
      />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 50,
    height: 50,
  },
  activeBackground: {
    position: 'absolute',
    width: 50,
    height: 50,
    borderRadius: 25,
    shadowColor: '#2EBBC3',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  icon: {
    zIndex: 1,
  },
});
