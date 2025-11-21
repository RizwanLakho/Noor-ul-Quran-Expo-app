import React, { useState, useEffect } from 'react';
import { View, TouchableOpacity, Image, StatusBar, ScrollView, ActivityIndicator, Alert, RefreshControl } from 'react-native';
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import { useQuiz } from '../context/QuizContext';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
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
}

export default function Quiz({ navigation }: any) {
  const { startQuiz, isLoading: quizStarting, error } = useQuiz();
  const { colors, isDark } = useTheme();
  const { t } = useLanguage();

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


      // Check if response is valid
      if (!response || !Array.isArray(response)) {
        setQuizCategories(DEFAULT_CATEGORIES);
        return;
      }

      // Map backend quizzes to UI format
      // Backend: { id, title, description, difficulty, category, total_questions }
      // UI: { id, name, description, questionsCount, icon, color, bgColor }
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
        };
      });

      setQuizCategories(mappedQuizzes);
    } catch (err) {
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
      Alert.alert(t('error'), t('failedToStartQuiz'));
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
          style={{ flex: 1, paddingHorizontal: 20, paddingVertical: 24 }}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              tintColor={colors.primary}
              colors={[colors.primary]}
            />
          }>
          {/* Quiz Categories Grid */}
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
            {quizCategories.map((category) => (
              <TouchableOpacity
                key={category.id}
                style={{
                  marginBottom: 16,
                  width: '48%',
                  alignItems: 'center',
                  borderRadius: 16,
                  backgroundColor: category.bgColor,
                  padding: 20,
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.1,
                  shadowRadius: 4,
                  elevation: 3,
                }}
                onPress={() => handleCategoryPress(category)}
                disabled={quizStarting}>
                <View
                  style={{
                    marginBottom: 12,
                    height: 64,
                    width: 64,
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: 32,
                    backgroundColor: 'white',
                  }}>
                  {renderIcon(category.icon, category.iconType, category.color, 32)}
                </View>
                <StyledText style={{ textAlign: 'center', fontSize: 14, fontWeight: '600', color: '#333' }}>
                  {category.name}
                </StyledText>
                {category.questionsCount && (
                  <StyledText style={{ marginTop: 4, fontSize: 12, color: '#666' }}>
                    {category.questionsCount} {t('questions')}
                  </StyledText>
                )}
                {category.timeLimit && (
                  <StyledText style={{ marginTop: 2, fontSize: 11, color: '#888' }}>
                    ⏱️ {category.timeLimit} mins
                  </StyledText>
                )}
                {category.difficulty && (
                  <StyledText style={{ marginTop: 2, fontSize: 11, color: '#888', textTransform: 'capitalize' }}>
                    {category.difficulty}
                  </StyledText>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      )}
    </View>
  );
}