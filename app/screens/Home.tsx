import React, { useState, useEffect } from 'react';
import { useNavigation } from '@react-navigation/native';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  ActivityIndicator,
  Image,
  Share,
} from 'react-native';
import Divider from 'app/components/Divider';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useTheme } from '../context/ThemeContext';
import { useDailyAyah } from '../context/DailyAyahContext';
import { useGoals } from '../context/GoalsContext';
import { useBookmarks } from '../context/BookmarksContext';
import { useLastRead } from '../context/LastReadContext';
import { useCustomAlert } from '../context/CustomAlertContext';
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
  const { showAlert } = useCustomAlert();
  const { dailyAyah, loading, error, refreshAyah, loadDailyAyah } = useDailyAyah();
  const { goals, loading: goalsLoading, loadGoals, deleteGoal, canCreateNewGoal } = useGoals();
  const { addBookmark, removeBookmark, isBookmarked } = useBookmarks();
  const { lastRead, loading: lastReadLoading } = useLastRead();
  const [currentTime, setCurrentTime] = useState(new Date());

  // User data state
  const [userData, setUserData] = useState<any>(null);
  const [userStats, setUserStats] = useState<any>(null);
  const [userActivity, setUserActivity] = useState<any[]>([]);
  const [statsLoading, setStatsLoading] = useState(false);

  // OVERALL PROGRESS - Backend stats only (lifetime/all-time stats)
  // These are separate from Goals tracking

  // Load daily ayah when Home screen mounts (after user has logged in)
  useEffect(() => {
    loadDailyAyah();
    loadUserData();
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

      // Load user stats
      try {
        const stats = await apiService.getUserStats();
        setUserStats(stats);
        console.log('✅ User stats loaded:', stats);
      } catch (error) {
        console.log('⚠️ Could not load user stats (user may not be logged in)');
      }

      // Load user activity
      try {
        const activity = await apiService.getUserActivity(5);
        setUserActivity(activity);
        console.log('✅ User activity loaded:', activity.length, 'items');
      } catch (error) {
        console.log('⚠️ Could not load user activity');
      }

      // Load daily goals
      try {
        await loadGoals();
      } catch (error) {
        console.log('⚠️ Could not load goals');
      }
    } catch (error) {
    } finally {
      setStatsLoading(false);
    }
  };

  /**
   * Handle continue reading button press
   */
  const handleContinueReading = () => {
    if (!lastRead) return;

    navigation.navigate('QuranReader', {
      type: 'surah',
      surahNumber: lastRead.surahNumber,
      surahName: lastRead.surahName,
      initialAyah: lastRead.ayahNumber,
    });
  };

  // Helper function to format duration (seconds to readable time)
  const formatDuration = (seconds: number) => {
    if (!seconds || seconds < 60) return `${seconds || 0}s`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    return `${hours}h ${minutes % 60}m`;
  };

  /**
   * Format reading time range
   */
  const formatReadingTime = (timestamp: number, durationSeconds: number) => {
    const endTime = new Date(timestamp);
    const startTime = new Date(timestamp - durationSeconds * 1000);

    const now = new Date();
    const isToday = endTime.toDateString() === now.toDateString();
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    const isYesterday = endTime.toDateString() === yesterday.toDateString();

    const formatTime = (date: Date) => {
      const hours = date.getHours();
      const minutes = date.getMinutes();
      const period = hours >= 12 ? 'PM' : 'AM';
      const displayHours = hours % 12 || 12;
      return `${displayHours}:${minutes.toString().padStart(2, '0')}${period}`;
    };

    const dayLabel = isToday
      ? 'Today'
      : isYesterday
        ? 'Yesterday'
        : endTime.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    return `${dayLabel} ${formatTime(startTime)} - ${formatTime(endTime)}`;
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

  /**
   * Navigate to goal creation screen
   */
  const handleCreateGoal = () => {
    if (!canCreateNewGoal()) {
      showAlert(
        'Goal Limit Reached',
        'You can only have 3 active goals. Please complete or delete an existing goal to create a new one.',
        'warning'
      );
      return;
    }
    navigation.navigate('GoalCreation' as never);
  };

  /**
   * Navigate to edit goal
   */
  const handleEditGoal = (goalId: string) => {
    navigation.navigate('GoalCreation' as never, { goalId, isEdit: true } as never);
  };

  /**
   * Delete goal with confirmation
   */
  const handleDeleteGoal = (goalId: string, goalTitle: string) => {
    showAlert('Delete Goal', `Are you sure you want to delete "${goalTitle}"?`, 'warning', [
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => deleteGoal(goalId),
      },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  /**
   * Handle share ayah
   */
  const handleShareAyah = async () => {
    if (!dailyAyah) return;

    try {
      const message = `${dailyAyah.text}\n\n${dailyAyah.translation}\n\n- Surah ${dailyAyah.surahName} (${dailyAyah.surahNumber}:${dailyAyah.ayahNumber})\n\nShared from Noor-ul-Quran App`;

      await Share.share({
        message: message,
      });
    } catch (error) {
      console.error('Error sharing ayah:', error);
    }
  };

  /**
   * Handle bookmark ayah
   */
  const handleBookmarkAyah = async () => {
    if (!dailyAyah) return;

    try {
      const bookmarked = isBookmarked(dailyAyah.surahNumber, dailyAyah.ayahNumber);

      if (bookmarked) {
        showAlert('Already Bookmarked', 'This ayah is already in your bookmarks.', 'info');
      } else {
        await addBookmark({
          surahName: dailyAyah.surahName,
          surahNumber: dailyAyah.surahNumber,
          ayahNumber: dailyAyah.ayahNumber,
          arabicText: dailyAyah.text,
          translation: dailyAyah.translation,
        });

        showAlert('Bookmark Added', 'Ayah has been added to your bookmarks!', 'success');
      }
    } catch (error) {
      console.error('Error bookmarking ayah:', error);
      showAlert('Error', 'Failed to bookmark ayah. Please try again.', 'error');
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <SafeAreaView edges={['top']}>
        <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 40 }}>
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
          <PrayerTimeCard currentTime={new Date()} />

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
                        Surah {dailyAyah.surahName} ({dailyAyah.surahNumber}:{dailyAyah.ayahNumber})
                      </StyledText>
                    ) : (
                      <StyledText style={[styles.verseSurah, { color: colors.textSecondary }]}>
                        {t('loading')}...
                      </StyledText>
                    )}
                  </View>
                </View>
                <View style={styles.verseActions}>
                  <TouchableOpacity
                    style={styles.verseActionButton}
                    onPress={handleBookmarkAyah}
                    disabled={!dailyAyah}>
                    <Ionicons
                      name={
                        dailyAyah && isBookmarked(dailyAyah.surahNumber, dailyAyah.ayahNumber)
                          ? 'bookmark'
                          : 'bookmark-outline'
                      }
                      size={20}
                      color={colors.primary}
                    />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.verseActionButton}
                    onPress={handleShareAyah}
                    disabled={!dailyAyah}>
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
              <Divider />

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

          {/* Today's Goals */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <StyledText style={[styles.sectionTitle, { color: colors.text }]}>
                My Goals
              </StyledText>
              <StyledText style={[styles.goalCount, { color: colors.textSecondary }]}>
                {goals.length}/3
              </StyledText>
            </View>

            {goalsLoading ? (
              <ActivityIndicator size="small" color={colors.primary} />
            ) : goals.length > 0 ? (
              <>
                {goals.map((goal) => {
                  const totalTargets =
                    goal.targets.surahs.length +
                    goal.targets.juz.length +
                    goal.targets.topics.length +
                    goal.targets.quizzes.length;

                  const completedTargets =
                    goal.progress.surahs +
                    goal.progress.juz +
                    goal.progress.topics +
                    goal.progress.quizzes;

                  const progressPercent =
                    totalTargets > 0 ? (completedTargets / totalTargets) * 100 : 0;

                  const daysRemaining = Math.ceil(
                    (goal.endDate - Date.now()) / (1000 * 60 * 60 * 24)
                  );

                  return (
                    <TouchableOpacity
                      key={goal.id}
                      style={{
                        borderRadius: 12,
                        borderWidth: 1,
                        borderColor: goal.completed ? '#2EBBC3' : colors.border,
                        padding: 14,
                        marginBottom: 12,
                        backgroundColor: goal.completed ? '#2EBBC315' : colors.surface,
                      }}
                      onPress={() =>
                        navigation.navigate('GoalDetail' as never, { goalId: goal.id } as never)
                      }
                      activeOpacity={0.7}>
                      {/* Header */}
                      <View
                        style={{
                          flexDirection: 'row',
                          justifyContent: 'space-between',
                          marginBottom: 8,
                        }}>
                        <View style={{ flex: 1 }}>
                          <StyledText
                            style={{ fontSize: 15, fontWeight: '600', color: colors.text }}>
                            {goal.title} {goal.completed && '✅'}
                          </StyledText>
                          {goal.description && (
                            <StyledText
                              style={{ fontSize: 12, color: colors.textSecondary, marginTop: 2 }}>
                              {goal.description}
                            </StyledText>
                          )}
                        </View>
                        <View style={{ flexDirection: 'row', gap: 8, marginLeft: 8 }}>
                          <TouchableOpacity onPress={() => handleEditGoal(goal.id)}>
                            <Ionicons name="pencil-outline" size={20} color={colors.primary} />
                          </TouchableOpacity>
                          <TouchableOpacity onPress={() => handleDeleteGoal(goal.id, goal.title)}>
                            <Ionicons name="trash-outline" size={20} color="#ef4444" />
                          </TouchableOpacity>
                        </View>
                      </View>

                      {/* Target Summary */}
                      <View
                        style={{
                          flexDirection: 'row',
                          gap: 12,
                          marginBottom: 8,
                          flexWrap: 'wrap',
                        }}>
                        {goal.targets.surahs.length > 0 && (
                          <View style={styles.targetBadge}>
                            <Ionicons name="book-outline" size={14} color={colors.primary} />
                            <StyledText style={[styles.targetBadgeText, { color: colors.text }]}>
                              {goal.progress.surahs}/{goal.targets.surahs.length} Surahs
                            </StyledText>
                          </View>
                        )}
                        {goal.targets.juz.length > 0 && (
                          <View style={styles.targetBadge}>
                            <Ionicons name="albums-outline" size={14} color={colors.primary} />
                            <StyledText style={[styles.targetBadgeText, { color: colors.text }]}>
                              {goal.progress.juz}/{goal.targets.juz.length} Juz
                            </StyledText>
                          </View>
                        )}
                        {goal.targets.topics.length > 0 && (
                          <View style={styles.targetBadge}>
                            <Ionicons name="bulb-outline" size={14} color={colors.primary} />
                            <StyledText style={[styles.targetBadgeText, { color: colors.text }]}>
                              {goal.progress.topics}/{goal.targets.topics.length} Topics
                            </StyledText>
                          </View>
                        )}
                      </View>

                      {/* Progress Bar */}
                      <View style={{ marginBottom: 6 }}>
                        <View
                          style={{
                            height: 6,
                            backgroundColor: colors.border,
                            borderRadius: 3,
                          }}>
                          <View
                            style={{
                              height: '100%',
                              width: `${Math.min(progressPercent, 100)}%`,
                              backgroundColor: goal.completed ? '#2EBBC3' : colors.primary,
                              borderRadius: 3,
                            }}
                          />
                        </View>
                        <View
                          style={{
                            flexDirection: 'row',
                            justifyContent: 'space-between',
                            marginTop: 4,
                          }}>
                          <StyledText style={{ fontSize: 11, color: colors.textSecondary }}>
                            {completedTargets}/{totalTargets} completed
                          </StyledText>
                          <StyledText
                            style={{
                              fontSize: 11,
                              color:
                                daysRemaining < 3 && !goal.completed
                                  ? '#ef4444'
                                  : colors.textSecondary,
                            }}>
                            {daysRemaining > 0 ? `${daysRemaining} days left` : 'Expired'}
                          </StyledText>
                        </View>
                      </View>
                    </TouchableOpacity>
                  );
                })}
                <TouchableOpacity
                  style={[
                    styles.addGoalButton,
                    {
                      borderColor: canCreateNewGoal() ? colors.border : colors.textSecondary,
                      opacity: canCreateNewGoal() ? 1 : 0.5,
                    },
                  ]}
                  onPress={handleCreateGoal}>
                  <Ionicons
                    name="add-circle-outline"
                    size={20}
                    color={canCreateNewGoal() ? colors.primary : colors.textSecondary}
                  />
                  <StyledText
                    style={[
                      styles.addGoalText,
                      { color: canCreateNewGoal() ? colors.text : colors.textSecondary },
                    ]}>
                    {canCreateNewGoal() ? 'Add Another Goal' : 'Maximum 3 Goals Reached'}
                  </StyledText>
                </TouchableOpacity>
              </>
            ) : (
              <TouchableOpacity
                style={[styles.addGoalButton, { borderColor: colors.border }]}
                onPress={handleCreateGoal}>
                <Ionicons name="add-circle-outline" size={20} color={colors.primary} />
                <StyledText style={[styles.addGoalText, { color: colors.text }]}>
                  Start a New Goal
                </StyledText>
              </TouchableOpacity>
            )}
          </View>

          {/* Progress Section */}
          <View style={styles.section}>
            <StyledText style={[styles.sectionTitle, { color: colors.text }]}>
              {t('progress')}
            </StyledText>
            <View style={styles.progressGrid}>
              <View
                style={[
                  styles.progressCard,
                  { backgroundColor: '#2EBBC30D', borderColor: colors.border },
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
                  { backgroundColor: '#2EBBC30D', borderColor: colors.border },
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
                  { backgroundColor: '#2EBBC30D', borderColor: colors.border },
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
                  { backgroundColor: '#2EBBC30D', borderColor: colors.border },
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

          {/* Activity Section - New Design */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <StyledText style={[styles.sectionTitle, { color: colors.text }]}>
                Activity
              </StyledText>
              <TouchableOpacity>
                <StyledText style={[styles.seeAllText, { color: colors.primary }]}>
                  See All
                </StyledText>
              </TouchableOpacity>
            </View>

            {lastReadLoading ? (
              <ActivityIndicator size="small" color={colors.primary} style={{ marginTop: 20 }} />
            ) : lastRead ? (
              <View
                style={[
                  styles.activityCard,
                  { backgroundColor: colors.surface, borderColor: colors.border },
                ]}>
                {/* Reading Label */}
                <StyledText style={[styles.activityLabel, { color: colors.textSecondary }]}>
                  Reading
                </StyledText>
                <Divider />

                {/* Main Content Row */}
                <View style={styles.activityContent}>
                  {/* Book Icon */}
                  <View style={[styles.activityIcon, { backgroundColor: colors.primary + '15' }]}>
                    <Ionicons name="book" size={24} color={colors.primary} />
                  </View>

                  {/* Surah Info */}
                  <View style={styles.activityInfo}>
                    <StyledText style={[styles.activityTitle, { color: colors.text }]}>
                      {lastRead.surahName} {lastRead.surahNumber.toString().padStart(2, '0')}
                    </StyledText>
                    <StyledText style={[styles.activitySubtitle, { color: colors.textSecondary }]}>
                      {Math.floor(lastRead.timeSpent / 60)} min | {lastRead.verseCount} verse
                      {lastRead.verseCount !== 1 ? 's' : ''}
                    </StyledText>
                  </View>
                </View>
                <Divider />
                {/* Bottom Row */}
                <View style={styles.activityFooter}>
                  <StyledText style={[styles.activityTime, { color: colors.textSecondary }]}>
                    {formatReadingTime(lastRead.timestamp, lastRead.timeSpent)}
                  </StyledText>
                  <TouchableOpacity onPress={handleContinueReading}>
                    <StyledText style={[styles.continueButton, { color: colors.primary }]}>
                      Continue Reading{' '}
                      <Ionicons name="chevron-forward" size={14} color={colors.primary} />
                    </StyledText>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <View
                style={{
                  padding: 20,
                  alignItems: 'center',
                  backgroundColor: colors.surface,
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor: colors.border,
                }}>
                <Ionicons
                  name="book-outline"
                  size={48}
                  color={colors.textSecondary}
                  style={{ marginBottom: 12 }}
                />
                <StyledText
                  style={{ color: colors.textSecondary, fontSize: 14, fontWeight: '600' }}>
                  No Reading Activity
                </StyledText>
                <StyledText
                  style={{
                    color: colors.textSecondary,
                    fontSize: 12,
                    marginTop: 4,
                    textAlign: 'center',
                  }}>
                  Start reading the Quran to track your progress here
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
              <TouchableOpacity onPress={() => navigation.navigate('Quiz' as never)}>
                <StyledText style={[styles.seeAllText, { color: 'colors.primary' }]}>
                  {t('takeQuiz')}
                </StyledText>
              </TouchableOpacity>
            </View>

            <View
              style={{
                flexDirection: 'row',
                gap: 12,
                borderRadius: 12,
                backgroundColor: '#05a5b0',
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
    fontSize: 20,
    marginTop: 8,
    textAlign: 'center',
    fontFamily: 'uthman',
    lineHeight: 32,
  },
  translationText: {
    fontSize: 13,
    lineHeight: 20,
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
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2EBBC30D',
    gap: 8,
    // borderStyle: 'dashed',
  },
  addGoalText: {
    fontSize: 14,
    fontWeight: '600',
  },
  goalCount: {
    fontSize: 14,
    fontWeight: '600',
  },
  targetBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: 6,
  },
  targetBadgeText: {
    fontSize: 11,
    fontWeight: '500',
  },
  progressGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  progressCard: {
    width: '48%',
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
    borderRadius: 16,
    padding: 12,
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
  // Activity Card Styles
  activityCard: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,

    elevation: 2,
  },
  activityLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 6,
  },
  activityContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 8,
  },
  activityIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  activityInfo: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  activitySubtitle: {
    fontSize: 12,
  },
  activityFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  activityTime: {
    fontSize: 11,
  },
  continueButton: {
    fontSize: 12,
    fontWeight: '600',
  },
});
