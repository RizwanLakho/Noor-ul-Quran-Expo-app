import React from 'react';
import { View, TouchableOpacity, StatusBar, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useQuiz } from '../context/QuizContext';
import { useLanguage } from '../context/LanguageContext';
import StyledText from '../components/StyledText';

export default function QuizDetailsScreen({ navigation, route }) {
  const { resetQuiz } = useQuiz();
  const { t } = useLanguage();
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
    if (userAnswer.skipped) return 'bg-gray-100';
    if (userAnswer.isCorrect) return 'bg-green-50';
    return 'bg-red-50';
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
    <View className="flex-1 bg-gray-50">
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View className="border-b border-gray-100 bg-white px-5 pb-4 pt-12">
        <View className="flex-row items-center justify-between">
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="#000" />
          </TouchableOpacity>
          <StyledText className="text-lg font-semibold text-gray-800">{t('details')}</StyledText>
          <View className="w-6" />
        </View>
      </View>

      <ScrollView className="flex-1 px-5 py-6">
        {/* Category Header */}
        <View className="mb-5 rounded-2xl bg-white p-4 shadow-sm">
          <View className="flex-row items-center justify-between">
            <View>
              <StyledText className="mb-1 text-xs text-gray-500">{t('category')}</StyledText>
              <StyledText className="text-xl font-bold text-gray-800">{result.category}</StyledText>
            </View>
            <View className="rounded-full bg-teal-100 px-4 py-2">
              <StyledText className="font-bold text-teal-700">
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
              className={`mb-4 rounded-2xl p-4 shadow-sm ${getStatusColor(answerData)}`}>
              {/* Question Header */}
              <View className="mb-3 flex-row items-start justify-between">
                <View className="mr-3 flex-1">
                  <View className="mb-2 flex-row items-center">
                    <View className="mr-2 h-6 w-6 items-center justify-center rounded-full bg-teal-500">
                      <StyledText className="text-xs font-bold text-white">{index + 1}</StyledText>
                    </View>
                    <StyledText className="text-xs font-semibold text-gray-600">{t('question')}</StyledText>
                  </View>
                  <StyledText className="text-sm leading-5 text-gray-800">{question.question}</StyledText>
                </View>
                {getStatusIcon(answerData)}
              </View>

              {/* Answers Section */}
              <View className="border-t border-white pt-3">
                {!answerData.skipped ? (
                  <>
                    {/* User Answer */}
                    <View className="mb-2 flex-row items-center">
                      <Ionicons
                        name={answerData.isCorrect ? 'checkmark-circle' : 'close-circle'}
                        size={16}
                        color={answerData.isCorrect ? '#10b981' : '#ef4444'}
                      />
                      <StyledText className="ml-2 mr-2 text-xs text-gray-600">{t('yourAnswer')}</StyledText>
                      <StyledText
                        className={`flex-1 text-sm font-semibold ${
                          answerData.isCorrect ? 'text-green-600' : 'text-red-600'
                        }`}>
                        {getAnswerText(question, answerData.selectedOptionId)}
                      </StyledText>
                    </View>

                    {/* Correct Answer (if wrong) */}
                    {!answerData.isCorrect && (
                      <View className="flex-row items-center">
                        <Ionicons name="checkmark-circle" size={16} color="#10b981" />
                        <StyledText className="ml-2 mr-2 text-xs text-gray-600">{t('correctAnswer')}</StyledText>
                        <StyledText className="flex-1 text-sm font-semibold text-green-600">
                          {getCorrectAnswer(question)}
                        </StyledText>
                      </View>
                    )}

                    {/* Time Taken */}
                    <View className="mt-2 flex-row items-center">
                      <Ionicons name="time-outline" size={16} color="#6b7280" />
                      <StyledText className="ml-2 text-xs text-gray-500">
                        {t('time')} {answerData.timeTaken}s
                      </StyledText>
                    </View>
                  </>
                ) : (
                  <>
                    <View className="mb-2 flex-row items-center">
                      <Ionicons name="information-circle" size={16} color="#6b7280" />
                      <StyledText className="ml-2 text-xs text-gray-500">{t('questionSkipped')}</StyledText>
                    </View>
                    {/* Show correct answer for skipped questions */}
                    <View className="flex-row items-center">
                      <Ionicons name="checkmark-circle" size={16} color="#10b981" />
                      <StyledText className="ml-2 mr-2 text-xs text-gray-600">{t('correctAnswer')}</StyledText>
                      <StyledText className="flex-1 text-sm font-semibold text-green-600">
                        {getCorrectAnswer(question)}
                      </StyledText>
                    </View>
                  </>
                )}
              </View>

              {/* Status Badge */}
              <View className="absolute right-4 top-4">
                <View
                  className={`rounded-full px-3 py-1 ${
                    answerData.skipped
                      ? 'bg-gray-200'
                      : answerData.isCorrect
                        ? 'bg-green-100'
                        : 'bg-red-100'
                  }`}>
                  <StyledText
                    className={`text-xs font-semibold ${
                      answerData.skipped
                        ? 'text-gray-600'
                        : answerData.isCorrect
                          ? 'text-green-700'
                          : 'text-red-700'
                    }`}>
                    {getStatusText(answerData)}
                  </StyledText>
                </View>
              </View>
            </View>
          );
        })}

        <View className="h-6" />
      </ScrollView>

      {/* Bottom Actions */}
      <View className="border-t border-gray-100 bg-white px-5 py-4">
        <View className="flex-row items-center justify-between">
          <TouchableOpacity
            className="mr-3 flex-1 flex-row items-center justify-center rounded-xl bg-teal-500 py-4"
            onPress={handleHomePress}>
            <StyledText className="mr-2 text-base font-bold text-white">{t('home')}</StyledText>
          </TouchableOpacity>

          <TouchableOpacity
            className="flex-1 flex-row items-center justify-center rounded-xl border-2 border-teal-500 bg-white py-4"
            onPress={handleTryAgain}>
            <StyledText className="mr-2 text-base font-bold text-teal-600">{t('tryAgain')}</StyledText>
            <Ionicons name="refresh" size={18} color="#14b8a6" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}