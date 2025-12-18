import React from 'react';
import { View, TouchableOpacity, StatusBar, Alert, ScrollView } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useQuiz } from '../context/QuizContext';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import StyledText from '../components/StyledText';

export default function QuizResultScreen({ navigation, route }) {
  const { resetQuiz } = useQuiz();
  const { t } = useLanguage();
  const { colors, isDark } = useTheme();

  const { result } = route.params || {};


  // If no result data, navigate back
  if (!result) {

    Alert.alert(
      t('noResults'),
      t('noQuizResults'),
      [{ text: t('ok'), onPress: () => navigation.goBack() }]
    );
    return null;
  }


  const percentage = result.percentage;

  const getResultMessage = () => {
    if (percentage >= 90) return t('excellent');
    if (percentage >= 75) return t('greatJob');
    if (percentage >= 60) return t('goodWork');
    if (percentage >= 50) return t('keepTrying');
    return t('needMorePractice');
  };

  const getResultEmoji = () => {
    if (percentage >= 90) return '🏆';
    if (percentage >= 75) return '🌟';
    if (percentage >= 60) return '👍';
    if (percentage >= 50) return '💪';
    return '📚';
  };

  const handleHomePress = () => {
    resetQuiz();
    navigation.navigate('Main', { screen: 'Prayer' });
  };

  const handleDetailsPress = () => {
    navigation.navigate('QuizDetails', { result });
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />

      {/* Header */}
      <View style={{ borderBottomWidth: 1, borderBottomColor: colors.border, backgroundColor: colors.surface, paddingHorizontal: 20, paddingBottom: 16, paddingTop: 48 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <TouchableOpacity onPress={handleHomePress}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <StyledText style={{ fontSize: 18, fontWeight: '600', color: colors.text }}>{t('quizResult')}</StyledText>
          <TouchableOpacity>
            <Ionicons name="person-circle-outline" size={28} color={colors.text} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingHorizontal: 20, paddingVertical: 24, paddingBottom: 100 }}>
        {/* Result Card */}
        <View style={{ marginBottom: 20, borderRadius: 16, backgroundColor: colors.card, padding: 24 }}>
          {/* Trophy Icon */}
          <View style={{ marginBottom: 16, alignItems: 'center' }}>
            <View style={{ marginBottom: 12, height: 96, width: 96, alignItems: 'center', justifyContent: 'center', borderRadius: 48, backgroundColor: colors.primaryLight }}>
              <MaterialCommunityIcons name="trophy" size={50} color={colors.primary} />
            </View>
            <View style={{ borderRadius: 20, backgroundColor: colors.primary, paddingHorizontal: 16, paddingVertical: 4 }}>
              <StyledText style={{ fontSize: 14, fontWeight: 'bold', color: '#fff' }}>{t('result')}</StyledText>
            </View>
            <View style={{ marginTop: 8, borderRadius: 20, backgroundColor: colors.primaryLight, paddingHorizontal: 16, paddingVertical: 4 }}>
              <StyledText style={{ fontSize: 14, fontWeight: '600', color: colors.primary }}>{getResultMessage()}</StyledText>
            </View>
          </View>

          {/* Category Name */}
          <StyledText style={{ marginBottom: 8, textAlign: 'center', fontSize: 20, fontWeight: 'bold', color: colors.text }}>
            {result.category}
          </StyledText>

          {/* Pass/Fail Badge */}
          {percentage >= 70 ? (
            <View style={{ marginBottom: 24, alignItems: 'center' }}>
              <View style={{ borderRadius: 20, backgroundColor: colors.success, paddingHorizontal: 24, paddingVertical: 8 }}>
                <StyledText style={{ fontSize: 18, fontWeight: 'bold', color: '#fff' }}>{t('passedStatus')}</StyledText>
              </View>
            </View>
          ) : (
            <View style={{ marginBottom: 24, alignItems: 'center' }}>
              <View style={{ borderRadius: 20, backgroundColor: colors.error, paddingHorizontal: 24, paddingVertical: 8 }}>
                <StyledText style={{ fontSize: 18, fontWeight: 'bold', color: '#fff' }}>{t('failedStatus')}</StyledText>
              </View>
            </View>
          )}

          {/* Score Display */}
          <View style={{ marginBottom: 24, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
            <View style={{ marginRight: 32, alignItems: 'center' }}>
              <StyledText style={{ marginBottom: 4, fontSize: 14, color: colors.textSecondary }}>{t('totalScore')}</StyledText>
              <StyledText style={{ fontSize: 24, fontWeight: 'bold', color: colors.text }}>{result.totalScore}</StyledText>
            </View>
            <View style={{ alignItems: 'center' }}>
              <StyledText style={{ marginBottom: 4, fontSize: 14, color: colors.textSecondary }}>{t('quizScore')}</StyledText>
              <StyledText style={{ fontSize: 24, fontWeight: 'bold', color: colors.primary }}>{result.quizScore}</StyledText>
            </View>
          </View>

          {/* Percentage Display */}
          <View style={{ marginBottom: 16, alignItems: 'center' }}>
            <View style={{ marginBottom: 8, height: 80, width: 80, alignItems: 'center', justifyContent: 'center', borderRadius: 40, backgroundColor: colors.primaryLight }}>
              <StyledText style={{ fontSize: 24, fontWeight: 'bold', color: colors.primary }}>{percentage}%</StyledText>
            </View>
            <StyledText style={{ fontSize: 12, color: colors.textSecondary }}>{t('yourScorePercentage')}</StyledText>
          </View>

          {/* Statistics Grid */}
          <View style={{ marginBottom: 16, flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
            {/* Correct Answers */}
            <View style={{ marginBottom: 12, width: '48%', flexDirection: 'row', alignItems: 'center', borderRadius: 12, backgroundColor: colors.success, padding: 12, opacity: 0.15 }}>
              <Ionicons name="checkmark-circle" size={24} color={colors.success} />
              <View style={{ marginLeft: 12 }}>
                <StyledText style={{ fontSize: 12, color: colors.textSecondary }}>{t('correct')}</StyledText>
                <StyledText style={{ fontSize: 18, fontWeight: 'bold', color: colors.success }}>
                  {result.correctAnswers}
                </StyledText>
              </View>
            </View>

            {/* Wrong Answers */}
            <View style={{ marginBottom: 12, width: '48%', flexDirection: 'row', alignItems: 'center', borderRadius: 12, backgroundColor: colors.error, padding: 12, opacity: 0.15 }}>
              <Ionicons name="close-circle" size={24} color={colors.error} />
              <View style={{ marginLeft: 12 }}>
                <StyledText style={{ fontSize: 12, color: colors.textSecondary }}>{t('wrong')}</StyledText>
                <StyledText style={{ fontSize: 18, fontWeight: 'bold', color: colors.error }}>{result.wrongAnswers}</StyledText>
              </View>
            </View>

            {/* Skipped */}
            <View style={{ marginBottom: 12, width: '48%', flexDirection: 'row', alignItems: 'center', borderRadius: 12, backgroundColor: colors.border, padding: 12 }}>
              <Ionicons name="play-skip-forward-circle" size={24} color={colors.textSecondary} />
              <View style={{ marginLeft: 12 }}>
                <StyledText style={{ fontSize: 12, color: colors.textSecondary }}>{t('skipped')}</StyledText>
                <StyledText style={{ fontSize: 18, fontWeight: 'bold', color: colors.text }}>{result.skipped}</StyledText>
              </View>
            </View>

            {/* Attempted */}
            <View style={{ marginBottom: 12, width: '48%', flexDirection: 'row', alignItems: 'center', borderRadius: 12, backgroundColor: colors.info, padding: 12, opacity: 0.15 }}>
              <Ionicons name="flag" size={24} color={colors.info} />
              <View style={{ marginLeft: 12 }}>
                <StyledText style={{ fontSize: 12, color: colors.textSecondary }}>{t('attempted')}</StyledText>
                <StyledText style={{ fontSize: 18, fontWeight: 'bold', color: colors.info }}>{result.attempted}</StyledText>
              </View>
            </View>
          </View>

          {/* Time Statistics */}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', borderTopWidth: 1, borderTopColor: colors.border, paddingTop: 16 }}>
            <View style={{ flex: 1, alignItems: 'center' }}>
              <Ionicons name="time" size={20} color={colors.primary} />
              <StyledText style={{ marginTop: 4, fontSize: 12, color: colors.textSecondary }}>{t('timeTaken')}</StyledText>
              <StyledText style={{ fontWeight: '600', color: colors.text }}>{result.timeTaken}</StyledText>
            </View>
            <View style={{ width: 1, backgroundColor: colors.border }} />
            <View style={{ flex: 1, alignItems: 'center' }}>
              <Ionicons name="timer-outline" size={20} color={colors.warning} />
              <StyledText style={{ marginTop: 4, fontSize: 12, color: colors.textSecondary }}>{t('timeRemaining')}</StyledText>
              <StyledText style={{ fontWeight: '600', color: colors.text }}>{result.timeRemaining}</StyledText>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Action Buttons - Fixed at bottom */}
      <View style={{ position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: colors.surface, paddingHorizontal: 20, paddingVertical: 16, borderTopWidth: 1, borderTopColor: colors.border }}>
          {/* Review Answers Button - Full width */}
          {result.questions && result.questions.length > 0 && (
            <TouchableOpacity
              style={{ marginBottom: 12, width: '100%', alignItems: 'center', borderRadius: 12, backgroundColor: colors.info, paddingVertical: 16 }}
              onPress={handleDetailsPress}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Ionicons name="eye-outline" size={20} color="#fff" />
                <StyledText style={{ marginLeft: 8, fontSize: 16, fontWeight: 'bold', color: '#fff' }}>{t('reviewAnswers')}</StyledText>
              </View>
            </TouchableOpacity>
          )}

          {/* Home and Try Again buttons */}
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <TouchableOpacity
              style={{ marginRight: 12, flex: 1, alignItems: 'center', borderRadius: 12, backgroundColor: colors.primary, paddingVertical: 16 }}
              onPress={handleHomePress}>
              <StyledText style={{ fontSize: 16, fontWeight: 'bold', color: '#fff' }}>{t('home')}</StyledText>
            </TouchableOpacity>

            <TouchableOpacity
              style={{ flex: 1, alignItems: 'center', borderRadius: 12, borderWidth: 2, borderColor: colors.primary, backgroundColor: colors.surface, paddingVertical: 16 }}
              onPress={() => {
                resetQuiz();
                navigation.navigate('Main', { screen: 'Prayer' });
              }}>
              <StyledText style={{ fontSize: 16, fontWeight: 'bold', color: colors.primary }}>{t('tryAgain')}</StyledText>
            </TouchableOpacity>
          </View>
        </View>
    </View>
  );
}