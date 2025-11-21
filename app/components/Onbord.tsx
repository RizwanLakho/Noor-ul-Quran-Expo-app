import React from 'react';
import { View, Text, Image, StyleSheet, ImageSourcePropType } from 'react-native';

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
  return (
    <View style={styles.container}>
      <View style={styles.card}>
        {/* Header Section */}
        <View style={styles.headerSection}>
          <Text style={styles.heading}>{heading}</Text>
          <Text style={styles.description}>{description}</Text>
        </View>

        {/* Image Section */}
        <View style={styles.imageSection}>
          <View style={styles.imageContainer}>
            {/* Background Circle */}
            <View style={styles.backgroundCircle} />
            {/* Image */}
            <Image source={imageSrc} style={styles.image} resizeMode="contain" />
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
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    padding: 16,
  },
  card: {
    width: 352,
    height: 474,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 32,
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
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
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 8,
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
  backgroundCircle: {
    position: 'absolute',
    width: 192,
    height: 192,
    borderRadius: 96,
    backgroundColor: '#CCFBF1',
    opacity: 0.5,
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
  line: {
    width: 64,
    height: 1,
    backgroundColor: '#D1D5DB',
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
