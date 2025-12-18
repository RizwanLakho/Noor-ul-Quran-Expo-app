import React from 'react';
import { View, TouchableOpacity, StatusBar, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useQuiz } from '../context/QuizContext';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import StyledText from '../components/StyledText';

export default function QuizDetailsScreen({ navigation, route }) {
  const { resetQuiz } = useQuiz();
  const { t } = useLanguage();
  const { colors, isDark } = useTheme();
  const { result } = route.params || {};

  // If no result data, navigate back
  if (!result) {
    navigation.goBack();
    return null;
  }

  const getStatusIcon = (userAnswer) => {
    if (userAnswer.skipped) {
      return <Ionicons name="play-skip-forward-circle" size={24} color="#6b7280" />;
    }
    if (userAnswer.isCorrect) {
      return <Ionicons name="checkmark-circle" size={24} color="#10b981" />;
    }
    return <Ionicons name="close-circle" size={24} color="#ef4444" />;
  };

  const getStatusColor = (userAnswer) => {
    if (userAnswer.skipped) {
      return { backgroundColor: isDark ? '#4B5563' : '#F3F4F6' };
    }
    if (userAnswer.isCorrect) {
      return { backgroundColor: isDark ? '#064E3B' : '#ECFDF5' };
    }
    return { backgroundColor: isDark ? '#7F1D1D' : '#FEF2F2' };
  };

  const getStatusText = (userAnswer) => {
    if (userAnswer.skipped) return t('skipped');
    if (userAnswer.isCorrect) return t('correct');
    return t('wrong');
  };

  const getAnswerText = (question, optionId) => {
    const option = question.options.find((opt) => opt.id === optionId);
    return option ? option.text : 'N/A';
  };

  const getCorrectAnswer = (question) => {
    const correctOption = question.options.find((opt) => opt.isCorrect);
    return correctOption ? correctOption.text : 'N/A';
  };

  const handleHomePress = () => {
    resetQuiz();
    navigation.navigate('Main', { screen: 'Prayer' });
  };

  const handleTryAgain = () => {
    resetQuiz();
    navigation.goBack();
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />

      {/* Header */}
      <View style={{ borderBottomWidth: 1, borderBottomColor: colors.border, backgroundColor: colors.surface, paddingHorizontal: 20, paddingBottom: 16, paddingTop: 48 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <StyledText style={{ fontSize: 18, fontWeight: '600', color: colors.text }}>{t('details')}</StyledText>
          <View style={{ width: 24 }} />
        </View>
      </View>

      <ScrollView style={{ flex: 1, paddingHorizontal: 20, paddingVertical: 24 }}>
        {/* Category Header */}
        <View style={{ marginBottom: 20, borderRadius: 16, backgroundColor: colors.card, padding: 16 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <View>
              <StyledText style={{ marginBottom: 4, fontSize: 12, color: colors.textSecondary }}>{t('category')}</StyledText>
              <StyledText style={{ fontSize: 20, fontWeight: 'bold', color: colors.text }}>{result.category}</StyledText>
            </View>
            <View style={{ borderRadius: 20, backgroundColor: colors.primaryLight, paddingHorizontal: 16, paddingVertical: 8 }}>
              <StyledText style={{ fontWeight: 'bold', color: colors.primary }}>
                {result.correctAnswers}/{result.totalQuestions}
              </StyledText>
            </View>
          </View>
        </View>

        {/* Questions List */}
        {result.questions.map((question, index) => {
          // Find user's answer for this question
          const userAnswer = result.userAnswers.find((a) => a.questionId === question.id);

          // If no answer found, create a skipped answer placeholder
          const answerData = userAnswer || {
            questionId: question.id,
            selectedOptionId: null,
            isCorrect: false,
            timeTaken: 0,
            skipped: true,
          };

          return (
            <View
              key={question.id}
              style={{ marginBottom: 16, borderRadius: 16, padding: 16, ...getStatusColor(answerData) }}>
              {/* Question Header */}
              <View style={{ marginBottom: 12, flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                <View style={{ marginRight: 12, flex: 1 }}>
                  <View style={{ marginBottom: 8, flexDirection: 'row', alignItems: 'center' }}>
                    <View style={{ marginRight: 8, height: 24, width: 24, alignItems: 'center', justifyContent: 'center', borderRadius: 12, backgroundColor: colors.primary }}>
                      <StyledText style={{ fontSize: 12, fontWeight: 'bold', color: '#fff' }}>{index + 1}</StyledText>
                    </View>
                    <StyledText style={{ fontSize: 12, fontWeight: '600', color: colors.textSecondary }}>{t('question')}</StyledText>
                  </View>
                  <StyledText style={{ fontSize: 14, lineHeight: 20, color: colors.text }}>{question.question}</StyledText>
                </View>
                {getStatusIcon(answerData)}
              </View>

              {/* Answers Section */}
              <View style={{ borderTopWidth: 1, borderTopColor: colors.border, paddingTop: 12 }}>
                {!answerData.skipped ? (
                  <>
                    {/* User Answer */}
                    <View style={{ marginBottom: 8, flexDirection: 'row', alignItems: 'center' }}>
                      <Ionicons
                        name={answerData.isCorrect ? 'checkmark-circle' : 'close-circle'}
                        size={16}
                        color={answerData.isCorrect ? colors.success : colors.error}
                      />
                      <StyledText style={{ marginLeft: 8, marginRight: 8, fontSize: 12, color: colors.textSecondary }}>{t('yourAnswer')}</StyledText>
                      <StyledText style={{ flex: 1, fontSize: 14, fontWeight: '600', color: answerData.isCorrect ? colors.success : colors.error }}>
                        {getAnswerText(question, answerData.selectedOptionId)}
                      </StyledText>
                    </View>

                    {/* Correct Answer (if wrong) */}
                    {!answerData.isCorrect && (
                      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Ionicons name="checkmark-circle" size={16} color={colors.success} />
                        <StyledText style={{ marginLeft: 8, marginRight: 8, fontSize: 12, color: colors.textSecondary }}>{t('correctAnswer')}</StyledText>
                        <StyledText style={{ flex: 1, fontSize: 14, fontWeight: '600', color: colors.success }}>
                          {getCorrectAnswer(question)}
                        </StyledText>
                      </View>
                    )}

                    {/* Time Taken */}
                    <View style={{ marginTop: 8, flexDirection: 'row', alignItems: 'center' }}>
                      <Ionicons name="time-outline" size={16} color={colors.textSecondary} />
                      <StyledText style={{ marginLeft: 8, fontSize: 12, color: colors.textSecondary }}>
                        {t('time')} {answerData.timeTaken}s
                      </StyledText>
                    </View>
                  </>
                ) : (
                  <>
                    <View style={{ marginBottom: 8, flexDirection: 'row', alignItems: 'center' }}>
                      <Ionicons name="information-circle" size={16} color={colors.textSecondary} />
                      <StyledText style={{ marginLeft: 8, fontSize: 12, color: colors.textSecondary }}>{t('questionSkipped')}</StyledText>
                    </View>
                    {/* Show correct answer for skipped questions */}
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <Ionicons name="checkmark-circle" size={16} color={colors.success} />
                      <StyledText style={{ marginLeft: 8, marginRight: 8, fontSize: 12, color: colors.textSecondary }}>{t('correctAnswer')}</StyledText>
                      <StyledText style={{ flex: 1, fontSize: 14, fontWeight: '600', color: colors.success }}>
                        {getCorrectAnswer(question)}
                      </StyledText>
                    </View>
                  </>
                )}
              </View>

              {/* Status Badge */}
              <View style={{ position: 'absolute', right: 16, top: 16 }}>
                <View
                  style={{
                    borderRadius: 20,
                    paddingHorizontal: 12,
                    paddingVertical: 4,
                    backgroundColor: answerData.skipped
                      ? colors.border
                      : answerData.isCorrect
                        ? colors.success
                        : colors.error,
                  }}>
                  <StyledText
                    style={{
                      fontSize: 12,
                      fontWeight: '600',
                      color: answerData.skipped
                        ? colors.text
                        : '#fff',
                    }}>
                    {getStatusText(answerData)}
                  </StyledText>
                </View>
              </View>
            </View>
          );
        })}

        <View style={{ height: 24 }} />
      </ScrollView>

      {/* Bottom Actions */}
      <View style={{ borderTopWidth: 1, borderTopColor: colors.border, backgroundColor: colors.surface, paddingHorizontal: 20, paddingVertical: 16 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <TouchableOpacity
            style={{ marginRight: 12, flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', borderRadius: 12, backgroundColor: colors.primary, paddingVertical: 16 }}
            onPress={handleHomePress}>
            <StyledText style={{ marginRight: 8, fontSize: 16, fontWeight: 'bold', color: '#fff' }}>{t('home')}</StyledText>
          </TouchableOpacity>

          <TouchableOpacity
            style={{ flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', borderRadius: 12, borderWidth: 2, borderColor: colors.primary, backgroundColor: colors.surface, paddingVertical: 16 }}
            onPress={handleTryAgain}>
            <StyledText style={{ marginRight: 8, fontSize: 16, fontWeight: 'bold', color: colors.primary }}>{t('tryAgain')}</StyledText>
            <Ionicons name="refresh" size={18} color={colors.primary} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}