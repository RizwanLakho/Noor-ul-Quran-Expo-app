import React from 'react';
import { View, Text, Image, StyleSheet, ImageSourcePropType } from 'react-native';
import { useTheme } from '../context/ThemeContext';

interface OnboardingCardProps {
  heading?: string;
  description?: string;
  imageSrc?: ImageSourcePropType;
}

const OnboardingCard: React.FC<OnboardingCardProps> = ({
  heading = 'Holy Quran',
  description = 'Here should be some lines about this feature of this app how a user can get facilitate from this feature of the app not more than 3 lines',
  imageSrc = require('../../assets/icon.png'),
}) => {
  const { colors } = useTheme();

  const dynamicStyles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: colors.background,
      padding: 16,
    },
    card: {
      width: 352,
      height: 474,
      backgroundColor: colors.card,
      borderRadius: 24,
      padding: 32,
      justifyContent: 'space-between',
      alignItems: 'center',
      shadowColor: colors.text,
      shadowOffset: {
        width: 0,
        height: 4,
      },
      shadowOpacity: 0.1,
      shadowRadius: 12,
      elevation: 5,
    },
    heading: {
      fontSize: 24,
      fontWeight: 'bold',
      color: colors.primary,
      marginBottom: 16,
      textAlign: 'center',
    },
    description: {
      fontSize: 14,
      color: colors.textSecondary,
      textAlign: 'center',
      lineHeight: 20,
      paddingHorizontal: 8,
    },
    backgroundCircle: {
      position: 'absolute',
      width: 192,
      height: 192,
      borderRadius: 96,
      backgroundColor: colors.primaryLight,
      opacity: 0.5,
    },
    line: {
      width: 64,
      height: 1,
      backgroundColor: colors.border,
    },
  });

  return (
    <View style={dynamicStyles.container}>
      <View style={dynamicStyles.card}>
        {/* Header Section */}
        <View style={staticStyles.headerSection}>
          <Text style={dynamicStyles.heading}>{heading}</Text>
          <Text style={dynamicStyles.description}>{description}</Text>
        </View>

        {/* Image Section */}
        <View style={staticStyles.imageSection}>
          <View style={staticStyles.imageContainer}>
            {/* Background Circle */}
            <View style={dynamicStyles.backgroundCircle} />
            {/* Image */}
            <Image source={imageSrc} style={staticStyles.image} resizeMode="contain" />
          </View>
        </View>

        {/* Decorative Bottom */}
        <View style={staticStyles.decorativeBottom}>
          <View style={dynamicStyles.line} />
          <View style={staticStyles.dotsContainer}>
            <View style={[staticStyles.dot, staticStyles.dot1]} />
            <View style={[staticStyles.dot, staticStyles.dot2]} />
            <View style={[staticStyles.dot, staticStyles.dot3]} />
            <View style={[staticStyles.dot, staticStyles.dot4]} />
          </View>
          <View style={dynamicStyles.line} />
        </View>
      </View>
    </View>
  );
};

const staticStyles = StyleSheet.create({
  headerSection: {
    marginTop: 16,
    alignItems: 'center',
  },
  imageSection: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageContainer: {
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: 160,
    height: 160,
    zIndex: 1,
  },
  decorativeBottom: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
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
    backgroundColor: '#5EEAD4',
  },
  dot2: {
    backgroundColor: '#99F6E4',
  },
  dot3: {
    backgroundColor: '#CCFBF1',
  },
  dot4: {
    backgroundColor: '#CCFBF1',
  },
});

export default OnboardingCard;
