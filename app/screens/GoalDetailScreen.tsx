import React from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useGoals } from '../context/GoalsContext';
import { useLanguage } from '../context/LanguageContext';
import { useCustomAlert } from '../context/CustomAlertContext';
import StyledText from '../components/StyledText';
import { Goal } from '../types/goals.types';

interface GoalDetailScreenProps {
  navigation: any;
  route: {
    params: {
      goalId: string;
    };
  };
}

export default function GoalDetailScreen({ navigation, route }: GoalDetailScreenProps) {
  const { colors } = useTheme();
  const { goals, deleteGoal } = useGoals();
  const { t, language } = useLanguage();
  const { showAlert } = useCustomAlert();
  const { goalId } = route.params;

  const goal = goals.find(g => g.id === goalId);

  if (!goal) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={64} color={colors.textSecondary} />
          <StyledText style={[styles.errorText, { color: colors.text }]}>
            {t('goalNotFound')}
          </StyledText>
          <TouchableOpacity
            style={[styles.backButton, { backgroundColor: colors.primary }]}
            onPress={() => navigation.goBack()}>
            <StyledText style={styles.backButtonText}>{t('goBack')}</StyledText>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const totalTargets =
    goal.targets.surahs.length +
    goal.targets.juz.length +
    goal.targets.topics.length;

  const completedTargets =
    goal.progress.surahs +
    goal.progress.juz +
    goal.progress.topics;

  const progressPercent = totalTargets > 0 ? (completedTargets / totalTargets) * 100 : 0;

  const daysRemaining = Math.ceil((goal.endDate - Date.now()) / (1000 * 60 * 60 * 24));
  const totalDays = Math.ceil((goal.endDate - goal.startDate) / (1000 * 60 * 60 * 24));
  const daysElapsed = totalDays - daysRemaining;

  const handleEdit = () => {
    navigation.navigate('GoalCreation', { goalId: goal.id, isEdit: true });
  };

  const handleDelete = () => {
    showAlert(
      t('deleteGoal'),
      `${t('deleteGoalConfirm')} "${goal.title}"?`,
      'warning',
      [
        {
          text: t('delete'),
          style: 'destructive',
          onPress: async () => {
            await deleteGoal(goal.id);
            navigation.goBack();
          },
        },
        { text: t('cancel'), style: 'cancel' },
      ]
    );
  };

  const handleItemClick = (item: any) => {
    console.log('📍 Navigating from Goal:', {
      type: item.type,
      id: item.id,
      name: item.name,
    });

    try {
      // Navigate based on item type
      if (item.type === 'surah') {
        navigation.navigate('QuranReader', {
          type: 'surah',
          surahNumber: item.id,
          surahName: item.name,
          surahNameArabic: item.arabicName || '',
          totalAyahs: item.totalAyahs,
          revelationType: item.revelationType,
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
    } catch (error) {
      console.error('❌ Navigation error:', error);
      showAlert(
        t('error'),
        t('navigationError') || 'Failed to navigate to reading screen',
        'error'
      );
    }
  };

  const renderItemProgress = (item: any, index: number) => {
    const isCompleted = item.completed || false;
    const readAyahs = item.readAyahs || 0;
    const totalAyahs = item.totalAyahs || 0;
    const itemProgress = totalAyahs > 0 ? (readAyahs / totalAyahs) * 100 : 0;

    return (
      <TouchableOpacity
        key={index}
        style={[
          styles.itemCard,
          {
            backgroundColor: isCompleted ? colors.primary + '10' : colors.surface,
            borderColor: isCompleted ? colors.primary : colors.border,
          },
        ]}
        onPress={() => handleItemClick(item)}
        activeOpacity={0.7}>
        {/* Item Header */}
        <View style={styles.itemHeader}>
          <View style={{ flex: 1 }}>
            {/* Show Arabic name first for surahs and juz, then English below */}
            {(item.type === 'surah' || item.type === 'juz') && item.arabicName ? (
              <>
                <StyledText
                  style={[
                    styles.itemArabicName,
                    {
                      color: isCompleted ? colors.primary : colors.text,
                      marginBottom: 2,
                    },
                  ]}>
                  {item.arabicName} {isCompleted && '✅'}
                </StyledText>
                <StyledText style={[styles.itemEnglishName, { color: colors.textSecondary }]}>
                  {item.name}
                </StyledText>
              </>
            ) : (
              <StyledText
                style={[
                  styles.itemName,
                  { color: isCompleted ? colors.primary : colors.text },
                ]}>
                {item.name} {isCompleted && '✅'}
              </StyledText>
            )}
            {totalAyahs > 0 && (
              <StyledText style={[styles.itemStats, { color: colors.textSecondary }]}>
                {readAyahs}/{totalAyahs} {t('ayahs')} • {Math.round(itemProgress)}%
              </StyledText>
            )}
            {item.lastReadAt && (
              <StyledText style={[styles.itemDate, { color: colors.textSecondary }]}>
                {t('lastReadOn')}: {new Date(item.lastReadAt).toLocaleDateString(language === 'ur' ? 'ur-PK' : 'en-US', {
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </StyledText>
            )}
          </View>
          <View style={styles.itemHeaderRight}>
            {isCompleted ? (
              <View style={[styles.completeBadge, { backgroundColor: colors.primary }]}>
                <Ionicons name="checkmark" size={20} color="#fff" />
              </View>
            ) : totalAyahs > 0 ? (
              <View style={styles.progressCircle}>
                <StyledText style={[styles.progressText, { color: colors.primary }]}>
                  {Math.round(itemProgress)}%
                </StyledText>
              </View>
            ) : null}
            <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} style={{ marginLeft: 8 }} />
          </View>
        </View>

        {/* Progress Bar for Incomplete Items */}
        {!isCompleted && totalAyahs > 0 && (
          <View style={styles.progressBarContainer}>
            <View style={[styles.progressBarBg, { backgroundColor: colors.border }]}>
              <View
                style={[
                  styles.progressBarFill,
                  {
                    backgroundColor: colors.primary,
                    width: `${Math.min(itemProgress, 100)}%`,
                  },
                ]}
              />
            </View>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <StyledText style={[styles.headerTitle, { color: colors.text }]}>
          {t('goalDetails')}
        </StyledText>
        <View style={styles.headerActions}>
          <TouchableOpacity onPress={handleEdit} style={styles.headerButton}>
            <Ionicons name="pencil" size={22} color={colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleDelete} style={styles.headerButton}>
            <Ionicons name="trash" size={22} color="#ef4444" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Goal Summary Card */}
        <View style={[styles.summaryCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.summaryHeader}>
            <View style={{ flex: 1 }}>
              <StyledText style={[styles.goalTitle, { color: colors.text }]}>
                {goal.title}
              </StyledText>
              {goal.description && (
                <StyledText style={[styles.goalDescription, { color: colors.textSecondary }]}>
                  {goal.description}
                </StyledText>
              )}
            </View>
            {goal.completed && (
              <View style={[styles.completeBadgeLarge, { backgroundColor: '#2EBBC3' }]}>
                <Ionicons name="checkmark-circle" size={32} color="#fff" />
              </View>
            )}
          </View>

          {/* Overall Progress */}
          <View style={styles.overallProgress}>
            <View style={styles.progressInfo}>
              <StyledText style={[styles.progressLabel, { color: colors.textSecondary }]}>
                {t('overallProgress')}
              </StyledText>
              <StyledText style={[styles.progressValue, { color: colors.text }]}>
                {completedTargets}/{totalTargets} {t('completed')}
              </StyledText>
            </View>
            <View style={[styles.progressBarBg, { backgroundColor: colors.border, height: 12 }]}>
              <View
                style={[
                  styles.progressBarFill,
                  {
                    backgroundColor: goal.completed ? '#2EBBC3' : colors.primary,
                    width: `${Math.min(progressPercent, 100)}%`,
                    height: 12,
                  },
                ]}
              />
            </View>
            <StyledText style={[styles.progressPercentage, { color: colors.primary }]}>
              {Math.round(progressPercent)}% {t('complete')}
            </StyledText>
          </View>

          {/* Time Stats */}
          <View style={styles.timeStats}>
            <View style={styles.timeStat}>
              <Ionicons name="calendar-outline" size={20} color={colors.primary} />
              <View style={{ marginLeft: 8 }}>
                <StyledText style={[styles.timeStatValue, { color: colors.text }]}>
                  {daysElapsed} {t('days')}
                </StyledText>
                <StyledText style={[styles.timeStatLabel, { color: colors.textSecondary }]}>
                  {t('active')}
                </StyledText>
              </View>
            </View>
            <View style={styles.timeStat}>
              <Ionicons
                name="time-outline"
                size={20}
                color={daysRemaining < 3 && !goal.completed ? '#ef4444' : colors.primary}
              />
              <View style={{ marginLeft: 8 }}>
                <StyledText
                  style={[
                    styles.timeStatValue,
                    { color: daysRemaining < 3 && !goal.completed ? '#ef4444' : colors.text },
                  ]}>
                  {daysRemaining > 0 ? `${daysRemaining} ${t('days')}` : t('expired')}
                </StyledText>
                <StyledText style={[styles.timeStatLabel, { color: colors.textSecondary }]}>
                  {t('remaining')}
                </StyledText>
              </View>
            </View>
          </View>
        </View>

        {/* Surahs Section */}
        {goal.targets.surahs.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="book" size={24} color={colors.primary} />
              <StyledText style={[styles.sectionTitle, { color: colors.text }]}>
                {t('surahs')} ({goal.progress.surahs}/{goal.targets.surahs.length})
              </StyledText>
            </View>
            {goal.targets.surahs.map((surah, index) => renderItemProgress({ ...surah, type: 'surah' }, index))}
          </View>
        )}

        {/* Juz Section */}
        {goal.targets.juz.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="albums" size={24} color={colors.primary} />
              <StyledText style={[styles.sectionTitle, { color: colors.text }]}>
                {t('juz')} ({goal.progress.juz}/{goal.targets.juz.length})
              </StyledText>
            </View>
            {goal.targets.juz.map((juz, index) => renderItemProgress({ ...juz, type: 'juz' }, index))}
          </View>
        )}

        {/* Topics Section */}
        {goal.targets.topics.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="bulb" size={24} color={colors.primary} />
              <StyledText style={[styles.sectionTitle, { color: colors.text }]}>
                {t('topics')} ({goal.progress.topics}/{goal.targets.topics.length})
              </StyledText>
            </View>
            {goal.targets.topics.map((topic, index) => renderItemProgress({ ...topic, type: 'topic' }, index))}
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 24,
  },
  backButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  headerButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 4,
  },
  scrollContent: {
    padding: 16,
  },
  summaryCard: {
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    marginBottom: 20,
  },
  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  goalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  goalDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  completeBadgeLarge: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  overallProgress: {
    marginBottom: 20,
  },
  progressInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  progressValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  progressPercentage: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 8,
  },
  timeStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  timeStat: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeStatValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  timeStatLabel: {
    fontSize: 12,
    marginTop: 2,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  itemCard: {
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    marginBottom: 12,
  },
  itemHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  itemHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  itemArabicName: {
    fontSize: 20,
    fontFamily: 'uthman',
    marginBottom: 4,
    lineHeight: 32,
    fontWeight: '600',
  },
  itemEnglishName: {
    fontSize: 14,
    marginBottom: 4,
  },
  itemStats: {
    fontSize: 13,
    marginBottom: 2,
  },
  itemDate: {
    fontSize: 11,
  },
  completeBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 3,
    borderColor: 'currentColor',
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  progressBarContainer: {
    marginTop: 12,
  },
  progressBarBg: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
});
