import React, { useState, useEffect } from 'react';
import { View, TouchableOpacity, Image, StatusBar, ScrollView, ActivityIndicator, RefreshControl } from 'react-native';
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import { useQuiz } from '../context/QuizContext';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { useCustomAlert } from '../context/CustomAlertContext';
import apiService from '../services/ApiService';
import StyledText from '../components/StyledText';

// Quiz UI type (for displaying quizzes as cards)
interface QuizCategoryUI {
  id: number;
  name: string;
  description?: string;
  questionsCount?: number;
  difficulty?: string;
  timeLimit?: number;
  category?: string;
  icon: string;
  iconType: string;
  color: string;
  bgColor: string;
  hasCompleted?: boolean;
  bestScore?: number;
  userAttempts?: number;
}

export default function Quiz({ navigation }: any) {
  const { startQuiz, isLoading: quizStarting, error } = useQuiz();
  const { colors, isDark } = useTheme();
  const { t } = useLanguage();
  const { showAlert } = useCustomAlert();

  // Default categories with UI styling (fallback)
  const DEFAULT_CATEGORIES: QuizCategoryUI[] = [
    {
      id: 1,
      name: t('quizCategoryCreed'),
      icon: 'book',
      iconType: 'MaterialCommunityIcons',
      color: '#FDB022',
      bgColor: '#FFF9E6',
    },
    {
      id: 2,
      name: t('quizCategoryQuranMojwad'),
      icon: 'book-open-variant',
      iconType: 'MaterialCommunityIcons',
      color: '#8B4513',
      bgColor: '#F5E6D3',
    },
    {
      id: 3,
      name: t('quizCategoryExpiation'),
      icon: 'scale-balance',
      iconType: 'MaterialCommunityIcons',
      color: '#D4AF37',
      bgColor: '#FFF8DC',
    },
    {
      id: 4,
      name: t('quizCategoryFiqh'),
      icon: 'gavel',
      iconType: 'MaterialCommunityIcons',
      color: '#DAA520',
      bgColor: '#FFFACD',
    },
    {
      id: 5,
      name: t('quizCategoryHadith'),
      icon: 'book-heart',
      iconType: 'MaterialCommunityIcons',
      color: '#20B2AA',
      bgColor: '#E0F7F4',
    },
    {
      id: 6,
      name: t('quizCategorySeerah'),
      icon: 'mosque',
      iconType: 'MaterialCommunityIcons',
      color: '#228B22',
      bgColor: '#E8F5E8',
    },
  ];

  const [quizCategories, setQuizCategories] = useState<QuizCategoryUI[]>(DEFAULT_CATEGORIES);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Fetch quizzes from API
  const fetchQuizzes = async () => {
    try {
      setIsLoading(true);

      const response = await apiService.getAllQuizzes();

      console.log('📥 API Response:', JSON.stringify(response, null, 2));

      // Check if response is valid
      if (!response || !Array.isArray(response)) {
        console.log('⚠️ Invalid response, using default categories');
        setQuizCategories(DEFAULT_CATEGORIES);
        return;
      }

      // Map backend quizzes to UI format
      // Backend now returns: { id, title, description, difficulty, category, total_questions, time_limit, has_completed, best_score, user_attempts }
      // UI needs: { id, name, description, questionsCount, timeLimit, difficulty, icon, color, bgColor, hasCompleted, bestScore, userAttempts }
      const mappedQuizzes = response.map((quiz, index) => {
        const defaultCat = DEFAULT_CATEGORIES[index % DEFAULT_CATEGORIES.length];
        return {
          id: quiz.id,
          name: quiz.title,
          description: quiz.description,
          questionsCount: quiz.total_questions,
          difficulty: quiz.difficulty,
          timeLimit: quiz.time_limit,
          category: quiz.category,
          icon: defaultCat.icon,
          iconType: defaultCat.iconType,
          color: defaultCat.color,
          bgColor: defaultCat.bgColor,
          hasCompleted: Boolean(quiz.has_completed), // Convert to boolean explicitly
          bestScore: quiz.best_score ? Math.round(quiz.best_score) : null,
          userAttempts: quiz.user_attempts || 0,
        };
      });

      console.log('🎯 Mapped Quizzes:', mappedQuizzes.map(q => ({
        id: q.id,
        name: q.name,
        hasCompleted: q.hasCompleted,
        bestScore: q.bestScore,
        userAttempts: q.userAttempts
      })));

      const availableQuizzes = mappedQuizzes.filter(q => !q.hasCompleted);
      const completedQuizzes = mappedQuizzes.filter(q => q.hasCompleted);

      console.log(`✅ Available: ${availableQuizzes.length}, Completed: ${completedQuizzes.length}`);

      setQuizCategories(mappedQuizzes);
    } catch (err) {
      console.error('❌ Error fetching quizzes:', err);
      // Keep default categories on error
      setQuizCategories(DEFAULT_CATEGORIES);
    } finally {
      setIsLoading(false);
    }
  };

  // Refresh quizzes
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchQuizzes();
    setIsRefreshing(false);
  };

  // Load quizzes on mount
  useEffect(() => {
    fetchQuizzes();
  }, []);

  const handleCategoryPress = async (category: QuizCategoryUI) => {
    try {
      await startQuiz(category.id, category.name);
      navigation.navigate('QuizQuestion');
    } catch (err) {
      showAlert(t('error'), t('failedToStartQuiz'), 'error');
    }
  };

  const renderIcon = (iconName: any, iconType: string, color: string, size: number = 40) => {
    if (iconType === 'MaterialCommunityIcons') {
      return <MaterialCommunityIcons name={iconName} size={size} color={color} />;
    } else if (iconType === 'FontAwesome5') {
      return <FontAwesome5 name={iconName} size={size} color={color} />;
    }
    return <Ionicons name={iconName} size={size} color={color} />;
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

      {/* Quiz starting overlay */}
      {quizStarting && (
        <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 50, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.2)' }}>
          <View style={{ borderRadius: 16, backgroundColor: colors.surface, padding: 24 }}>
            <ActivityIndicator size="large" color={colors.primary} />
            <StyledText style={{ marginTop: 12, color: colors.text }}>{t('startingQuiz')}</StyledText>
          </View>
        </View>
      )}

      {/* Initial loading state */}
      {isLoading && !isRefreshing ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator size="large" color={colors.primary} />
          <StyledText style={{ marginTop: 12, color: colors.text }}>{t('loadingCategories')}</StyledText>
        </View>
      ) : (
        <ScrollView
          style={{ flex: 1 }}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              tintColor={colors.primary}
              colors={[colors.primary]}
            />
          }>
          {/* Available Quizzes Section - 70% of screen */}
          <View style={{ paddingHorizontal: 20, paddingTop: 24 }}>
            <StyledText style={{ fontSize: 18, fontWeight: 'bold', color: colors.text, marginBottom: 16 }}>
              {t('availableQuizzes') || 'Available Quizzes'}
            </StyledText>

            {quizCategories.filter(q => !q.hasCompleted).length > 0 ? (
              <View>
                {quizCategories.filter(q => !q.hasCompleted).map((category) => (
                  <View
                    key={category.id}
                    style={{
                      backgroundColor: colors.surface,
                      borderRadius: 16,
                      borderWidth: 1,
                      borderColor: colors.border,
                      padding: 16,
                      marginBottom: 12,
                      shadowColor: '#000',
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.05,
                      shadowRadius: 4,
                      elevation: 2,
                    }}>
                    {/* Label */}
                    <StyledText style={{ fontSize: 12, fontWeight: '600', color: colors.textSecondary, marginBottom: 6 }}>
                      Quiz
                    </StyledText>

                    {/* Divider */}
                    <View style={{ height: 1, backgroundColor: colors.border, marginBottom: 8 }} />

                    {/* Main Content Row */}
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                      {/* Icon */}
                      <View style={{
                        width: 48,
                        height: 48,
                        borderRadius: 12,
                        backgroundColor: colors.primary + '15',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginRight: 12
                      }}>
                        {renderIcon(category.icon, category.iconType, colors.primary, 24)}
                      </View>

                      {/* Quiz Info */}
                      <View style={{ flex: 1 }}>
                        <StyledText style={{ fontSize: 16, fontWeight: '600', color: colors.text, marginBottom: 4 }}>
                          {category.name}
                        </StyledText>
                        <StyledText style={{ fontSize: 12, color: colors.textSecondary }}>
                          {category.questionsCount || 0} questions | {category.timeLimit || 0} min
                        </StyledText>
                      </View>
                    </View>

                    {/* Divider */}
                    <View style={{ height: 1, backgroundColor: colors.border, marginBottom: 8 }} />

                    {/* Bottom Row */}
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                      <StyledText style={{ fontSize: 11, color: colors.textSecondary }}>
                        {category.difficulty ? `Difficulty: ${category.difficulty}` : 'New Quiz'}
                      </StyledText>
                      <TouchableOpacity onPress={() => handleCategoryPress(category)} disabled={quizStarting}>
                        <StyledText style={{ fontSize: 12, fontWeight: '600', color: colors.primary }}>
                          Start Quiz <Ionicons name="chevron-forward" size={14} color={colors.primary} />
                        </StyledText>
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}
              </View>
            ) : (
              <View style={{
                backgroundColor: colors.surface,
                borderRadius: 16,
                padding: 24,
                alignItems: 'center',
                borderWidth: 1,
                borderColor: colors.border,
                marginBottom: 12
              }}>
                <MaterialCommunityIcons name="clipboard-check-outline" size={48} color={colors.textSecondary} />
                <StyledText style={{ fontSize: 14, color: colors.textSecondary, marginTop: 12, textAlign: 'center' }}>
                  No quizzes available at the moment
                </StyledText>
              </View>
            )}
          </View>

          {/* Divider between sections */}
          <View style={{ height: 24, backgroundColor: colors.background }} />

          {/* Completed Quizzes Section */}
          <View style={{ paddingHorizontal: 20, paddingBottom: 24 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
              <MaterialCommunityIcons name="check-circle" size={24} color="#22c55e" style={{ marginRight: 8 }} />
              <StyledText style={{ fontSize: 18, fontWeight: 'bold', color: colors.text }}>
                {t('completedQuizzes') || 'Completed Quizzes'}
              </StyledText>
            </View>

            {quizCategories.filter(q => q.hasCompleted).length > 0 ? (
              <View>
                {quizCategories.filter(q => q.hasCompleted).map((category) => (
                  <View
                    key={category.id}
                    style={{
                      backgroundColor: colors.surface,
                      borderRadius: 16,
                      borderWidth: 1,
                      borderColor: '#22c55e' + '40',
                      padding: 16,
                      marginBottom: 12,
                      shadowColor: '#000',
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.05,
                      shadowRadius: 4,
                      elevation: 2,
                    }}>
                    {/* Label */}
                    <StyledText style={{ fontSize: 12, fontWeight: '600', color: colors.textSecondary, marginBottom: 6 }}>
                      Quiz
                    </StyledText>

                    {/* Divider */}
                    <View style={{ height: 1, backgroundColor: colors.border, marginBottom: 8 }} />

                    {/* Main Content Row */}
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                      {/* Icon */}
                      <View style={{
                        width: 48,
                        height: 48,
                        borderRadius: 12,
                        backgroundColor: '#22c55e' + '15',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginRight: 12
                      }}>
                        <MaterialCommunityIcons name="check-circle" size={24} color="#22c55e" />
                      </View>

                      {/* Quiz Info */}
                      <View style={{ flex: 1 }}>
                        <StyledText style={{ fontSize: 16, fontWeight: '600', color: colors.text, marginBottom: 4 }}>
                          {category.name}
                        </StyledText>
                        <StyledText style={{ fontSize: 12, color: colors.textSecondary }}>
                          {category.questionsCount || 0} questions | {category.timeLimit || 0} min
                        </StyledText>
                      </View>
                    </View>

                    {/* Divider */}
                    <View style={{ height: 1, backgroundColor: colors.border, marginBottom: 8 }} />

                    {/* Bottom Row */}
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                      <StyledText style={{ fontSize: 11, color: '#22c55e', fontWeight: '600' }}>
                        Score: {category.bestScore || 0}% ⭐
                      </StyledText>
                      <StyledText style={{ fontSize: 11, color: colors.textSecondary }}>
                        Completed ✓
                      </StyledText>
                    </View>
                  </View>
                ))}
              </View>
            ) : (
              <View style={{
                backgroundColor: colors.surface,
                borderRadius: 16,
                padding: 24,
                alignItems: 'center',
                borderWidth: 1,
                borderColor: colors.border
              }}>
                <MaterialCommunityIcons name="trophy-outline" size={48} color={colors.textSecondary} />
                <StyledText style={{ fontSize: 14, color: colors.textSecondary, marginTop: 12, textAlign: 'center' }}>
                  Complete your first quiz to see it here!
                </StyledText>
                <StyledText style={{ fontSize: 12, color: colors.textSecondary, marginTop: 4, textAlign: 'center' }}>
                  Each user can take each quiz only once
                </StyledText>
              </View>
            )}
          </View>
        </ScrollView>
      )}
    </View>
  );
}