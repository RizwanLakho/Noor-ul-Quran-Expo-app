import React from 'react';
import { View, Text, ImageBackground, StyleSheet } from 'react-native';

interface PrayerTimeCardProps {
  currentTime: Date;
}

export default function PrayerTimeCard({ currentTime }: PrayerTimeCardProps) {
  const formatTime = (date: Date) => {
    const hours = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    return { hours: displayHours.toString().padStart(2, '0'), minutes, period };
  };

  const { hours, minutes, period } = formatTime(currentTime);

  return (
    <ImageBackground
      source={require('../../../../assets/imgtime.png')}
      style={styles.prayerCard}
      imageStyle={styles.imageStyle}>
      <View style={styles.prayerCardHeader}>
        <View>
          <Text style={styles.prayerDate}>Friday, 20 October</Text>
          <Text style={styles.prayerHijri}>Rabi' II 4, 1445 AH</Text>
        </View>
      </View>

      <View style={styles.prayerTimeContainer}>
        <Text style={styles.prayerName}>Maghrib</Text>
        <Text style={styles.prayerTime}>
          {hours}:{minutes}
        </Text>
        <Text style={styles.prayerPeriod}>{period}</Text>
      </View>

      <Text style={styles.nextPrayer}>Next is Isha</Text>

      <View style={styles.streakContainer}>
        <View style={styles.streakItem}>
          <Text style={styles.streakLabel}>Current Streak 🔥</Text>
          <Text style={styles.streakValue}>6 Days</Text>
        </View>
        <View style={styles.streakItem}>
          <Text style={styles.streakLabel}>Longest Streak</Text>
          <Text style={styles.streakValue}>32 Days</Text>
        </View>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  prayerCard: {
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 24,
    overflow: 'hidden',
    padding: 24,
    minHeight: 240,
  },
  imageStyle: {
    borderRadius: 24,
  },
  prayerCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  prayerDate: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
    opacity: 0.9,
  },
  prayerHijri: {
    color: '#FFFFFF',
    fontSize: 12,
    opacity: 0.7,
    marginTop: 4,
  },
  prayerTimeContainer: {
    alignItems: 'center',
    marginVertical: 12,
  },
  prayerName: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  prayerTime: {
    color: '#FFFFFF',
    fontSize: 48,
    fontWeight: 'bold',
    letterSpacing: 2,
  },
  prayerPeriod: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '500',
    marginTop: 4,
  },
  nextPrayer: {
    color: '#FFFFFF',
    fontSize: 13,
    textAlign: 'center',
    opacity: 0.8,
    marginTop: 8,
  },
  streakContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.2)',
  },
  streakItem: {
    alignItems: 'center',
  },
  streakLabel: {
    color: '#FFFFFF',
    fontSize: 12,
    opacity: 0.8,
  },
  streakValue: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 4,
  },
});
