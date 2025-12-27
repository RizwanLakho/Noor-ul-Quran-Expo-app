import React, { useEffect, useState } from 'react';
import { View, Text, ImageBackground, StyleSheet, ActivityIndicator } from 'react-native';
import { useTheme } from '../../../context/ThemeContext';
import * as Location from 'expo-location';

interface PrayerTimeCardProps {
  currentTime: Date;
}

interface PrayerTimes {
  Fajr: string;
  Dhuhr: string;
  Maghrib: string;
}

interface NextPrayer {
  name: string;
  time: string;
  nameUrdu: string;
  image: any;
}

export default function PrayerTimeCard({ currentTime }: PrayerTimeCardProps) {
  const { colors } = useTheme();
  const [prayerTimes, setPrayerTimes] = useState<PrayerTimes | null>(null);
  const [nextPrayer, setNextPrayer] = useState<NextPrayer | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentDate, setCurrentDate] = useState({
    gregorian: '',
    hijri: '',
    day: '',
  });
  const [streakData, setStreakData] = useState({
    currentStreak: 0,
    longestStreak: 0,
  });

  // Fetch prayer times from Aladhan API
  const fetchPrayerTimes = async (latitude: number, longitude: number) => {
    try {
      const response = await fetch(
        `https://api.aladhan.com/v1/timings?latitude=${latitude}&longitude=${longitude}&method=7`
      );
      const data = await response.json();

      if (data.code === 200) {
        const timings = data.data.timings;
        setPrayerTimes({
          Fajr: timings.Fajr,
          Dhuhr: timings.Dhuhr,
          Maghrib: timings.Maghrib,
        });

        // Set date information
        const gregorianDate = data.data.date.gregorian;
        const hijriDate = data.data.date.hijri;
        setCurrentDate({
          gregorian: `${gregorianDate.weekday.en}, ${gregorianDate.day} ${gregorianDate.month.en}`,
          hijri: `${hijriDate.month.en} ${hijriDate.day}, ${hijriDate.year} AH`,
          day: gregorianDate.weekday.en,
        });

        // Calculate next prayer
        calculateNextPrayer(timings);
      }
    } catch (err) {
      console.error('Error fetching prayer times:', err);
      setError('Failed to load prayer times');
    } finally {
      setLoading(false);
    }
  };

  // Get user location and fetch prayer times
  const getLocationAndFetchPrayer = async () => {
    try {
      // Request permission
      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== 'granted') {
        console.log('⚠️ Location permission denied, using default location (Islamabad)');
        // Use default location: Islamabad
        await fetchPrayerTimes(33.6844, 73.0479);
        return;
      }

      // Get current location with timeout
      try {
        const location = (await Promise.race([
          Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.Balanced,
          }),
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Location timeout')), 10000)
          ),
        ])) as Location.LocationObject;

        const { latitude, longitude } = location.coords;
        console.log('📍 User Location:', latitude, longitude);

        // Fetch prayer times with user location
        await fetchPrayerTimes(latitude, longitude);
      } catch (locationError) {
        console.log('⚠️ Could not get location, using default (Islamabad):', locationError);
        // Fallback to default location: Islamabad
        await fetchPrayerTimes(33.6844, 73.0479);
      }
    } catch (err) {
      console.error('Error in location setup:', err);
      // Final fallback - use Islamabad
      console.log('⚠️ Using default location (Islamabad)');
      await fetchPrayerTimes(33.6844, 73.0479);
    }
  };

  // Calculate which prayer is next based on current time
  const calculateNextPrayer = (timings: any) => {
    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    // Convert prayer time to minutes
    const timeToMinutes = (time: string) => {
      const [hours, minutes] = time.split(':').map(Number);
      return hours * 60 + minutes;
    };

    const fajrMinutes = timeToMinutes(timings.Fajr);
    const dhuhrMinutes = timeToMinutes(timings.Dhuhr);
    const maghribMinutes = timeToMinutes(timings.Maghrib);

    // Logic: Show next prayer based on current time
    // After Fajr + 1 hour, show Dhuhr
    // After Dhuhr + 3 hours, show Maghrib
    // After Maghrib + 3 hours, show Fajr (next day)

    let prayer: NextPrayer;

    if (currentMinutes < fajrMinutes) {
      // Before Fajr - show Fajr
      prayer = {
        name: 'Fajr',
        time: timings.Fajr,
        nameUrdu: 'فجر',
        image: require('../../../../assets/fajur.jpg'),
      };
    } else if (currentMinutes < fajrMinutes + 60) {
      // Within 1 hour after Fajr - still show Fajr
      prayer = {
        name: 'Fajr',
        time: timings.Fajr,
        nameUrdu: 'فجر',
        image: require('../../../../assets/fajur.jpg'),
      };
    } else if (currentMinutes < dhuhrMinutes) {
      // After Fajr + 1 hour, before Dhuhr - show Dhuhr
      prayer = {
        name: 'Dhuhr',
        time: timings.Dhuhr,
        nameUrdu: 'ظہر',
        image: require('../../../../assets/zuhur.jpg'),
      };
    } else if (currentMinutes < dhuhrMinutes + 180) {
      // Within 3 hours after Dhuhr - still show Dhuhr
      prayer = {
        name: 'Dhuhr',
        time: timings.Dhuhr,
        nameUrdu: 'ظہر',
        image: require('../../../../assets/zuhur.jpg'),
      };
    } else if (currentMinutes < maghribMinutes) {
      // After Dhuhr + 3 hours, before Maghrib - show Maghrib
      prayer = {
        name: 'Maghrib',
        time: timings.Maghrib,
        nameUrdu: 'مغرب',
        image: require('../../../../assets/magrib.png'),
      };
    } else if (currentMinutes < maghribMinutes + 180) {
      // Within 3 hours after Maghrib - still show Maghrib
      prayer = {
        name: 'Maghrib',
        time: timings.Maghrib,
        nameUrdu: 'مغرب',
        image: require('../../../../assets/magrib.png'),
      };
    } else {
      // After Maghrib + 3 hours - show next Fajr
      prayer = {
        name: 'Fajr',
        time: timings.Fajr,
        nameUrdu: 'فجر',
        image: require('../../../../assets/fajur.jpg'),
      };
    }

    setNextPrayer(prayer);
  };

  // Get next prayer name for display
  const getNextPrayerName = () => {
    if (!nextPrayer) return '';

    const prayers = ['Fajr', 'Dhuhr', 'Maghrib'];
    const currentIndex = prayers.indexOf(nextPrayer.name);
    const nextIndex = (currentIndex + 1) % prayers.length;

    const nextPrayerNames = {
      Fajr: 'Dhuhr',
      Dhuhr: 'Maghrib',
      Maghrib: 'Fajr (Tomorrow)',
    };

    return `Next is ${nextPrayerNames[nextPrayer.name as keyof typeof nextPrayerNames]}`;
  };

  // Fetch and update user streak
  const fetchAndUpdateStreak = async () => {
    try {
      const AsyncStorage = require('@react-native-async-storage/async-storage').default;
      const authToken = await AsyncStorage.getItem('@auth_token');

      if (!authToken) {
        console.log('⚠️ No auth token, skipping streak update');
        return;
      }

      // Update streak (will increment if needed)
      const updateResponse = await fetch('http://10.0.2.2:5000/api/users/me/streak/update', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (updateResponse.ok) {
        const updateData = await updateResponse.json();
        if (updateData.success && updateData.data) {
          setStreakData({
            currentStreak: updateData.data.currentStreak,
            longestStreak: updateData.data.longestStreak,
          });
          console.log('✅ Streak updated:', updateData.data);
        }
      } else {
        console.log('⚠️ Failed to update streak');
      }
    } catch (err) {
      console.error('Error updating streak:', err);
    }
  };

  useEffect(() => {
    getLocationAndFetchPrayer();
    fetchAndUpdateStreak();

    // Refresh every minute to update next prayer
    const interval = setInterval(() => {
      if (prayerTimes) {
        calculateNextPrayer(prayerTimes);
      }
    }, 60000); // 1 minute

    return () => clearInterval(interval);
  }, []);

  const formatTime = (time24: string) => {
    if (!time24) return { hours: '00', minutes: '00', period: 'AM' };

    const [hours24, minutes] = time24.split(':').map(Number);
    const period = hours24 >= 12 ? 'PM' : 'AM';
    const hours12 = hours24 % 12 || 12;

    return {
      hours: hours12.toString().padStart(2, '0'),
      minutes: minutes.toString().padStart(2, '0'),
      period,
    };
  };

  // Create dynamic styles based on theme
  const dynamicStyles = StyleSheet.create({
    streakContainer: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      marginTop: 20,
      paddingTop: 16,
      borderTopWidth: 1,
      borderTopColor: 'rgba(255, 255, 255, 0.3)',
    },
  });

  if (loading) {
    return (
      <View
        style={[
          styles.prayerCard,
          { backgroundColor: colors.card, justifyContent: 'center', alignItems: 'center' },
        ]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={{ color: colors.text, marginTop: 12 }}>Loading prayer times...</Text>
      </View>
    );
  }

  if (error || !nextPrayer) {
    return (
      <View
        style={[
          styles.prayerCard,
          { backgroundColor: colors.card, justifyContent: 'center', alignItems: 'center' },
        ]}>
        <Text style={{ color: colors.error }}>{error || 'Unable to load prayer times'}</Text>
      </View>
    );
  }

  const { hours, minutes, period } = formatTime(nextPrayer.time);

  return (
    <ImageBackground
      source={nextPrayer.image}
      style={styles.prayerCard}
      imageStyle={styles.imageStyle}>
      <View style={styles.prayerCardHeader}>
        <View>
          <Text style={[styles.prayerDate, { color: colors.surface }]}>
            {currentDate.gregorian}
          </Text>
          <Text style={[styles.prayerHijri, { color: colors.surface }]}>{currentDate.hijri}</Text>
        </View>
      </View>

      <View style={styles.prayerTimeContainer}>
        <Text style={[styles.prayerName, { color: colors.surface }]}>
          {nextPrayer.name} ({nextPrayer.nameUrdu})
        </Text>
        <Text style={[styles.prayerTime, { color: colors.surface }]}>
          {hours}:{minutes}
        </Text>
        {/*<Text style={[styles.prayerPeriod, { color: colors.surface }]}>{period}</Text>*/}
      </View>

      <Text style={[styles.nextPrayer, { color: colors.surface }]}>{getNextPrayerName()}</Text>

      <View style={dynamicStyles.streakContainer}>
        <View style={styles.streakItem}>
          <Text style={[styles.streakLabel, { color: colors.surface }]}>Current Streak 🔥</Text>
          <Text style={[styles.streakValue, { color: colors.surface }]}>
            {streakData.currentStreak} {streakData.currentStreak === 1 ? 'Day' : 'Days'}
          </Text>
        </View>
        <View style={styles.streakItem}>
          <Text style={[styles.streakLabel, { color: colors.surface }]}>Longest Streak</Text>
          <Text style={[styles.streakValue, { color: colors.surface }]}>
            {streakData.longestStreak} {streakData.longestStreak === 1 ? 'Day' : 'Days'}
          </Text>
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
    fontSize: 14,
    fontWeight: '500',
    opacity: 0.9,
  },
  prayerHijri: {
    fontSize: 12,
    opacity: 0.7,
    marginTop: 4,
  },
  prayerTimeContainer: {
    alignItems: 'center',
    marginVertical: 12,
  },
  prayerName: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'urdu',
  },
  prayerTime: {
    fontSize: 28,
    fontWeight: 'bold',
    letterSpacing: 2,
  },
  prayerPeriod: {
    fontSize: 20,
    fontWeight: '500',
  },
  nextPrayer: {
    fontSize: 13,
    textAlign: 'center',
    opacity: 0.8,
  },
  streakItem: {
    alignItems: 'center',
    marginBottom: 20,
  },
  streakLabel: {
    fontSize: 12,
    opacity: 0.8,
  },
  streakValue: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 4,
  },
});
