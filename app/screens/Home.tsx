import React, { useState, useEffect } from 'react';
import { useNavigation } from '@react-navigation/native';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ImageBackground,
  StatusBar,
  ActivityIndicator,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useTheme } from '../context/ThemeContext';
import { useDailyAyah } from '../context/DailyAyahContext';
import { useGoals } from '../context/GoalsContext';
import { apiService } from '../services/ApiService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Fontisto from '@expo/vector-icons/Fontisto';
import PrayerTimeCard from './components/home/PrayerTimeCard';
import DailyAyahCard from './components/home/DailyAyahCard';
import ProgressGrid from './components/home/ProgressGrid';
import StyledText from '../components/StyledText';
import { useLanguage } from '../context/LanguageContext';

interface HomeScreenProps {
  userName?: string;
  onProfilePress?: () => void;
  onNotificationPress?: () => void;
  onSettingsPress?: () => void;
  onStartNewGoal?: () => void;
  onReadQuran?: () => void;
  onPrayerTimes?: () => void;
  onSearch?: () => void;
}

export default function HomeScreen({
  userName,
  onProfilePress,
  onNotificationPress,
  onSettingsPress,
  onStartNewGoal,
  onReadQuran,
  onPrayerTimes,
  onSearch,
}: HomeScreenProps) {
  const { colors, isDark } = useTheme();
  const { t } = useLanguage();
  const { dailyAyah, loading, error, refreshAyah, loadDailyAyah } = useDailyAyah();
  const { goals, loading: goalsLoading, loadGoals, createGoal, deleteGoal } = useGoals();
  const [currentTime, setCurrentTime] = useState(new Date());

  // User data state
  const [userData, setUserData] = useState<any>(null);
  const [userStats, setUserStats] = useState<any>(null);
  const [userActivity, setUserActivity] = useState<any[]>([]);
  const [statsLoading, setStatsLoading] = useState(false);

  // Continue Reading - Unified history
  const [lastReadItems, setLastReadItems] = useState<any[]>([]);

  // Load daily ayah when Home screen mounts (after user has logged in)
  useEffect(() => {
    loadDailyAyah();
    loadUserData();
    loadLastReadItems();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Load user data and stats
  const loadUserData = async () => {
    try {
      setStatsLoading(true);

      // Load user profile
      try {
        const profile = await apiService.getUserProfile();
        setUserData(profile);
      } catch (error) {}

      // Load user stats - DISABLED (UI ONLY MODE)
      // const stats = await apiService.getUserStats();
      // setUserStats(stats);

      // Load user activity - DISABLED (UI ONLY MODE)
      // const activity = await apiService.getUserActivity(5);
      // setUserActivity(activity);

      // Load daily goals - DISABLED (UI ONLY MODE)
      // await loadGoals();
    } catch (error) {
    } finally {
      setStatsLoading(false);
    }
  };

  /**
   * Load unified last read history from AsyncStorage
   */
  const loadLastReadItems = async () => {
    try {
      const lastRead = await AsyncStorage.getItem('@last_read_items');
      if (lastRead) {
        const items = JSON.parse(lastRead);
        setLastReadItems(items.slice(0, 4)); // Show only 4 items on home page
      }
    } catch (error) {}
  };

  /**
   * Handle continue reading item press
   */
  const handleContinueReading = (item: any) => {
    if (item.type === 'surah') {
      navigation.navigate('QuranReader', {
        type: 'surah',
        surahNumber: item.id,
        surahName: item.name,
      });
    } else if (item.type === 'juz') {
      navigation.navigate('QuranReader', {
        type: 'juz',
        juzNumber: item.id,
        juzName: item.name,
      });
    } else if (item.type === 'topic') {
      navigation.navigate('TopicDetail', {
        topicId: item.id,
        topicTitle: item.name,
      });
    }
  };

  // Helper function to format duration (seconds to readable time)
  const formatDuration = (seconds: number) => {
    if (!seconds || seconds < 60) return `${seconds || 0}s`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    return `${hours}h ${minutes % 60}m`;
  };

  // Helper function to format clock time
  const formatTime = (date: Date) => {
    const hours = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    return { hours: displayHours.toString().padStart(2, '0'), minutes, period };
  };

  const { hours, minutes, period } = formatTime(currentTime);

  const navigation = useNavigation();

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      <SafeAreaView className="mb-2 mt-5">
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <View className="ml-4">
                <StyledText style={[styles.welcomeText, { color: colors.textSecondary }]}>
                  {t('welcomeBack')}
                </StyledText>
                <StyledText style={[styles.userName, { color: colors.primary }]}>
                  {userData?.first_name || userName || 'User'}!
                </StyledText>
              </View>
            </View>
            <View style={styles.headerRight}>
              <TouchableOpacity style={styles.iconButton} onPress={onNotificationPress}>
                <Fontisto name="bell-alt" size={24} color="black" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Prayer Time Card */}
          <ImageBackground
            source={require('../../assets/imgtime.png')}
            style={styles.prayerCard}
            imageStyle={styles.imageStyle}>
            <View style={styles.prayerCardHeader}>
              <View>
                <StyledText style={styles.prayerDate}>Friday, 20 October</StyledText>
                <StyledText style={styles.prayerHijri}>Rabi' II 4, 1445 AH</StyledText>
              </View>
            </View>

            <View style={styles.prayerTimeContainer}>
              <StyledText style={styles.prayerName}>{t('prayerNameMaghrib')}</StyledText>
              <View style={styles.timeDisplay}>
                <StyledText style={styles.timeText}>
                  {hours}:{minutes}
                </StyledText>
                <StyledText style={styles.timePeriod}>{period}</StyledText>
              </View>
              <StyledText style={styles.nextPrayer}>{t('nextPrayerIsha')}</StyledText>
            </View>

            <View style={styles.streakContainer}>
              <View style={styles.streakItem}>
                <StyledText style={styles.streakLabel}>{t('currentStreak')} 🔥</StyledText>
                <StyledText style={styles.streakValue}>
                  {userStats?.engagement?.currentStreak || 0} {t('days')}
                </StyledText>
              </View>
              <View style={styles.streakDivider} />
              <View style={styles.streakItem}>
                <StyledText style={styles.streakLabel}>{t('quizScore')}</StyledText>
                <StyledText style={styles.streakValue}>
                  {userStats?.quizzes?.avgScore || 0}%
                </StyledText>
              </View>
            </View>
          </ImageBackground>

          {/* Verse of the Day */}
          <View style={styles.VerseContainer}>
            <View style={[styles.verseCard, { backgroundColor: colors.surface }]}>
              <View style={styles.verseHeader}>
                <View style={styles.verseHeaderLeft}>
                  <Image
                    source={require('./../../assets/QuranIllustration.png')}
                    className="h-5 w-5"
                  />
                  <View>
                    <StyledText style={[styles.verseTitle, { color: colors.text }]}>
                      {t('verseOfTheDay')}
                    </StyledText>
                    {dailyAyah ? (
                      <StyledText style={[styles.verseSurah, { color: colors.textSecondary }]}>
                        {dailyAyah.surahName} - Verse {dailyAyah.ayahNumber}
                      </StyledText>
                    ) : (
                      <StyledText style={[styles.verseSurah, { color: colors.textSecondary }]}>
                        {t('loading')}...
                      </StyledText>
                    )}
                  </View>
                </View>
                <View style={styles.verseActions}>
                  <TouchableOpacity style={styles.verseActionButton}>
                    <Ionicons name="bookmark-outline" size={20} color={colors.primary} />
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.verseActionButton}>
                    <Ionicons name="share-outline" size={20} color={colors.primary} />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.verseActionButton}
                    onPress={refreshAyah}
                    disabled={loading}>
                    <Ionicons name="refresh-outline" size={20} color={colors.primary} />
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.verseContent}>
                {loading ? (
                  <ActivityIndicator size="small" color={colors.primary} />
                ) : error ? (
                  <StyledText style={[styles.translationText, { color: colors.error }]}>
                    {error}
                  </StyledText>
                ) : dailyAyah ? (
                  <>
                    <StyledText style={[styles.arabicText, { color: colors.text }]}>
                      {dailyAyah.text}
                    </StyledText>
                    <StyledText style={[styles.translationText, { color: colors.textSecondary }]}>
                      {dailyAyah.translation}
                    </StyledText>
                  </>
                ) : (
                  <StyledText style={[styles.translationText, { color: colors.textSecondary }]}>
                    {t('noVerseAvailable')}
                  </StyledText>
                )}
              </View>
            </View>
          </View>

          {/* Continue Reading Section */}
          {lastReadItems.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <StyledText style={[styles.sectionTitle, { color: colors.text }]}>
                  {t('continueReading')}
                </StyledText>
                <TouchableOpacity onPress={() => navigation.navigate('Quran' as never)}>
                  <StyledText style={[styles.seeAllText, { color: colors.primary }]}>
                    {t('seeAll')}
                  </StyledText>
                </TouchableOpacity>
              </View>

              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ gap: 12 }}>
                {lastReadItems.map((item, index) => (
                  <TouchableOpacity
                    key={index}
                    onPress={() => handleContinueReading(item)}
                    style={{
                      width: 160,
                      backgroundColor: colors.surface,
                      borderRadius: 16,
                      padding: 16,
                      borderWidth: 1,
                      borderColor: colors.border,
                      shadowColor: '#000',
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.1,
                      shadowRadius: 4,
                      elevation: 3,
                    }}
                    activeOpacity={0.7}>
                    {/* Icon */}
                    <View
                      style={{
                        width: 48,
                        height: 48,
                        borderRadius: 24,
                        backgroundColor: colors.primary + '20',
                        justifyContent: 'center',
                        alignItems: 'center',
                        marginBottom: 12,
                      }}>
                      <StyledText style={{ fontSize: 24 }}>{item.icon}</StyledText>
                    </View>

                    {/* Type Badge */}
                    <View
                      style={{
                        alignSelf: 'flex-start',
                        backgroundColor:
                          item.type === 'surah'
                            ? '#10b98120'
                            : item.type === 'juz'
                              ? '#3b82f620'
                              : '#8b5cf620',
                        paddingHorizontal: 8,
                        paddingVertical: 4,
                        borderRadius: 8,
                        marginBottom: 8,
                      }}>
                      <StyledText
                        style={{
                          fontSize: 10,
                          fontWeight: '600',
                          color:
                            item.type === 'surah'
                              ? '#10b981'
                              : item.type === 'juz'
                                ? '#3b82f6'
                                : '#8b5cf6',
                          textTransform: 'capitalize',
                        }}>
                        {item.type}
                      </StyledText>
                    </View>

                    {/* Title */}
                    <StyledText
                      style={{
                        fontSize: 14,
                        fontWeight: '600',
                        color: colors.text,
                        marginBottom: 4,
                      }}
                      numberOfLines={2}>
                      {item.name}
                    </StyledText>

                    {/* Timestamp */}
                    <StyledText
                      style={{
                        fontSize: 10,
                        color: colors.textSecondary,
                      }}>
                      {new Date(item.timestamp).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </StyledText>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}

          {/* Today's Goals */}
          <View style={styles.section}>
            <StyledText style={[styles.sectionTitle, { color: colors.text }]}>
              {t('todaysGoals')}
            </StyledText>

            {goalsLoading ? (
              <ActivityIndicator size="small" color={colors.primary} />
            ) : goals.length > 0 ? (
              <>
                {goals.map((goal) => (
                  <View
                    key={goal.id}
                    style={{
                      borderRadius: 12,
                      borderWidth: 1,
                      borderColor: colors.border,
                      padding: 12,
                      marginBottom: 8,
                      backgroundColor: goal.completed ? '#10b98120' : colors.surface,
                    }}>
                    <View
                      style={{
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}>
                      <View style={{ flex: 1 }}>
                        <StyledText style={{ fontSize: 14, fontWeight: '600', color: colors.text }}>
                          {goal.title} {goal.completed && '✅'}
                        </StyledText>
                        <StyledText
                          style={{ fontSize: 12, color: colors.textSecondary, marginTop: 4 }}>
                          {goal.current_value}/{goal.target_value}
                        </StyledText>
                      </View>
                      <TouchableOpacity onPress={() => deleteGoal(goal.id)}>
                        <Ionicons name="trash-outline" size={20} color="#ef4444" />
                      </TouchableOpacity>
                    </View>
                    {/* Progress Bar */}
                    <View
                      style={{
                        height: 4,
                        backgroundColor: colors.border,
                        borderRadius: 2,
                        marginTop: 8,
                      }}>
                      <View
                        style={{
                          height: '100%',
                          width: `${Math.min((goal.current_value / goal.target_value) * 100, 100)}%`,
                          backgroundColor: goal.completed ? '#10b981' : colors.primary,
                          borderRadius: 2,
                        }}
                      />
                    </View>
                  </View>
                ))}
                <TouchableOpacity
                  style={[styles.addGoalButton, { borderColor: colors.border, marginTop: 8 }]}
                  onPress={onStartNewGoal}>
                  <StyledText style={[styles.addGoalText, { color: colors.textSecondary }]}>
                    {t('addAnotherGoal')}
                  </StyledText>
                </TouchableOpacity>
              </>
            ) : (
              <TouchableOpacity
                style={[styles.addGoalButton, { borderColor: colors.border }]}
                onPress={onStartNewGoal}>
                <StyledText style={[styles.addGoalText, { color: colors.textSecondary }]}>
                  {t('startNewGoal')}
                </StyledText>
              </TouchableOpacity>
            )}
          </View>

          {/* Progress Section */}
          <View style={styles.section}>
            <StyledText style={[styles.sectionTitle, { color: colors.text }]}>{t('progress')}</StyledText>
            <View style={styles.progressGrid}>
              <View
                style={[
                  styles.progressCard,
                  { backgroundColor: colors.surface, borderColor: colors.border },
                ]}
                className="flex-row gap-6">
                <Image source={require('../../assets/complete.png')} />
                <View>
                  <StyledText style={[styles.progressLabel, { color: colors.textSecondary }]}>
                    {t('completion')}
                  </StyledText>
                  <StyledText style={[styles.progressValue, { color: colors.text }]}>
                    {Math.round(userStats?.topics?.avgCompletion || 0)} %
                  </StyledText>
                </View>
              </View>

              <View
                style={[
                  styles.progressCard,
                  { backgroundColor: colors.surface, borderColor: colors.border },
                ]}
                className="flex-row">
                <Image source={require('../../assets/mamorazation-sec.png')} />
                <View>
                  <StyledText style={[styles.progressLabel, { color: colors.textSecondary }]}>
                    {t('topicsDone')}
                  </StyledText>
                  <StyledText style={[styles.progressValue, { color: colors.text }]}>
                    {userStats?.topics?.completed || 0}
                  </StyledText>
                </View>
              </View>

              <View
                style={[
                  styles.progressCard,
                  { backgroundColor: colors.surface, borderColor: colors.border },
                ]}
                className="flex-row">
                <Image source={require('../../assets/engagement.png')} />
                <View>
                  <StyledText style={[styles.progressLabel, { color: colors.textSecondary }]}>
                    {t('timeSpent')}
                  </StyledText>
                  <StyledText style={[styles.progressValue, { color: colors.text }]}>
                    {formatDuration(userStats?.engagement?.totalTimeSeconds || 0)}
                  </StyledText>
                </View>
              </View>

              <View
                style={[
                  styles.progressCard,
                  { backgroundColor: colors.surface, borderColor: colors.border },
                ]}
                className="flex-row">
                <Image source={require('../../assets/recited.png')} />
                <View>
                  <StyledText style={[styles.progressLabel, { color: colors.textSecondary }]}>
                    {t('versesRead')}
                  </StyledText>
                  <StyledText style={[styles.progressValue, { color: colors.text }]}>
                    {userStats?.engagement?.versesRecited || 0}
                  </StyledText>
                </View>
              </View>
            </View>
          </View>

          {/* Activity Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <StyledText style={[styles.sectionTitle, { color: colors.text }]}>
                {t('recentActivity')}
              </StyledText>
              <TouchableOpacity>
                <StyledText style={[styles.seeAllText, { color: colors.primary }]}>
                  {t('seeAll')}
                </StyledText>
              </TouchableOpacity>
            </View>

            {statsLoading ? (
              <ActivityIndicator size="small" color={colors.primary} style={{ marginTop: 20 }} />
            ) : userActivity.length > 0 ? (
              userActivity.slice(0, 3).map((activity, index) => (
                <View
                  key={index}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 12,
                    borderRadius: 12,
                    backgroundColor:
                      activity.type === 'quiz_completed' ? '#3b82f6' : colors.primary,
                    padding: 12,
                    marginBottom: 8,
                  }}>
                  <StyledText style={{ fontSize: 28 }}>
                    {activity.type === 'quiz_completed' ? '📝' : '📖'}
                  </StyledText>
                  <View style={{ flex: 1 }}>
                    <StyledText
                      style={{ fontSize: 12, fontWeight: '500', color: 'rgba(255,255,255,0.7)' }}>
                      {activity.type === 'quiz_completed' ? 'Quiz Completed' : 'Topic Read'}
                    </StyledText>
                    <StyledText
                      style={{ fontSize: 14, fontWeight: '600', color: '#fff' }}
                      numberOfLines={1}>
                      {activity.title}
                    </StyledText>
                    {activity.type === 'quiz_completed' && activity.details?.score && (
                      <StyledText
                        style={{ fontSize: 12, color: 'rgba(255,255,255,0.8)', marginTop: 2 }}>
                        Score: {activity.details.score}% {activity.details.passed ? '✅' : '❌'}
                      </StyledText>
                    )}
                    {activity.type === 'topic_read' && activity.details?.progress && (
                      <StyledText
                        style={{ fontSize: 12, color: 'rgba(255,255,255,0.8)', marginTop: 2 }}>
                        Progress: {activity.details.progress}%
                      </StyledText>
                    )}
                  </View>
                </View>
              ))
            ) : (
              <View
                style={{
                  padding: 20,
                  alignItems: 'center',
                  backgroundColor: colors.surface,
                  borderRadius: 12,
                }}>
                <StyledText style={{ color: colors.textSecondary, fontSize: 14 }}>
                  {t('noRecentActivity')}
                </StyledText>
                <StyledText style={{ color: colors.textSecondary, fontSize: 12, marginTop: 4 }}>
                  {t('startReadingTopicsOrTakeQuiz')}
                </StyledText>
              </View>
            )}
          </View>

          {/* Quiz Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <StyledText style={[styles.sectionTitle, { color: colors.text }]}>
                {t('quizStats')}
              </StyledText>
              <TouchableOpacity>
                <StyledText style={[styles.seeAllText, { color: colors.primary }]}>
                  {t('takeQuiz')}
                </StyledText>
              </TouchableOpacity>
            </View>

            <View
              style={{
                flexDirection: 'row',
                gap: 12,
                borderRadius: 12,
                backgroundColor: colors.info,
                padding: 16,
              }}>
              <View style={{ flex: 1, alignItems: 'center' }}>
                <StyledText style={{ fontSize: 24, fontWeight: 'bold', color: '#fff' }}>
                  {userStats?.quizzes?.totalAttempts || 0}
                </StyledText>
                <StyledText style={{ fontSize: 12, color: 'rgba(255,255,255,0.8)', marginTop: 4 }}>
                  {t('attempts')}
                </StyledText>
              </View>
              <View style={{ width: 1, backgroundColor: 'rgba(255,255,255,0.3)' }} />
              <View style={{ flex: 1, alignItems: 'center' }}>
                <StyledText style={{ fontSize: 24, fontWeight: 'bold', color: '#fff' }}>
                  {userStats?.quizzes?.passed || 0}
                </StyledText>
                <StyledText style={{ fontSize: 12, color: 'rgba(255,255,255,0.8)', marginTop: 4 }}>
                  {t('passed')}
                </StyledText>
              </View>
              <View style={{ width: 1, backgroundColor: 'rgba(255,255,255,0.3)' }} />
              <View style={{ flex: 1, alignItems: 'center' }}>
                <StyledText style={{ fontSize: 24, fontWeight: 'bold', color: '#fff' }}>
                  {Math.round(userStats?.quizzes?.avgScore || 0)}%
                </StyledText>
                <StyledText style={{ fontSize: 12, color: 'rgba(255,255,255,0.8)', marginTop: 4 }}>
                  {t('avgScore')}
                </StyledText>
              </View>
            </View>
          </View>
          <View style={{ height: 40 }} />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingTop: 0,
    paddingBottom: 10,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  profileButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  profileIcon: {
    fontSize: 24,
  },
  welcomeText: {
    fontSize: 14,
  },
  userName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  headerRight: {
    flexDirection: 'row',
    gap: 8,
  },
  iconButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bellIcon: {
    fontSize: 24,
  },
  settingsIcon: {
    fontSize: 24,
  },
  prayerCard: {
    marginHorizontal: 6,
    borderRadius: 24,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 8,
  },
  imageStyle: {
    borderRadius: 25,
  },
  prayerCardHeader: {
    marginBottom: 0,
  },
  prayerDate: {
    fontSize: 14,
    color: '#FFF',
    fontWeight: '600',
  },
  prayerHijri: {
    fontSize: 12,
    color: '#E0E0E0',
    marginTop: 2,
  },
  prayerTimeContainer: {
    alignItems: 'center',
    marginBottom: 4,
    position: 'relative',
  },
  prayerName: {
    fontSize: 12,
    color: '#FFF',
    fontWeight: '600',
    marginBottom: 0,
  },
  timeDisplay: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  timeText: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#FFF',
  },
  timePeriod: {
    fontSize: 10,
    color: '#FFF',
    marginLeft: 4,
    fontWeight: '600',
  },
  nextPrayer: {
    fontSize: 10,
    color: '#E0E0E0',
    marginTop: 4,
  },
  streakContainer: {
    flexDirection: 'row',
    gap: 40,
    borderRadius: 16,
    padding: 10,
    marginBottom: 10,
  },
  streakItem: {
    flex: 1,
  },
  streakLabel: {
    fontSize: 8,
    color: '#E0E0E0',
    marginBottom: 4,
  },
  streakValue: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#FFF',
  },
  streakDivider: {
    width: 1,
    backgroundColor: 'rgba(255,255,255,0.3)',
    marginHorizontal: 16,
  },
  VerseContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    bottom: 34,
  },
  verseCard: {
    borderRadius: 16,
    width: '92%',
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  verseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  verseHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  verseIcon: {
    fontSize: 24,
  },
  verseTitle: {
    fontSize: 12,
    fontWeight: '600',
  },
  verseSurah: {
    fontSize: 10,
  },
  verseActions: {
    flexDirection: 'row',
    gap: 8,
  },
  verseActionButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  verseContent: {
    gap: 8,
  },
  arabicText: {
    fontSize: 16,
    textAlign: 'center',
    fontWeight: '600',
    lineHeight: 18,
  },
  translationText: {
    fontSize: 12,
    lineHeight: 10,
    textAlign: 'center',
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  seeAllText: {
    fontSize: 10,
    fontWeight: '600',
  },
  addGoalButton: {
    borderWidth: 2,
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: 'center',
    borderStyle: 'dashed',
  },
  addGoalText: {
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  progressGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  progressCard: {
    width: '48%',
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
  },
  progressIcon: {
    fontSize: 16,
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 13,
    marginBottom: 4,
  },
  progressValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});