import React from 'react';
import { View, TouchableOpacity, StatusBar, Alert, ScrollView } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useQuiz } from '../context/QuizContext';
import { useLanguage } from '../context/LanguageContext';
import StyledText from '../components/StyledText';

export default function QuizResultScreen({ navigation, route }) {
  const { resetQuiz } = useQuiz();
  const { t } = useLanguage();

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
    <View className="flex-1 bg-gray-50">
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View className="border-b border-gray-100 bg-white px-5 pb-4 pt-12">
        <View className="flex-row items-center justify-between">
          <TouchableOpacity onPress={handleHomePress}>
            <Ionicons name="arrow-back" size={24} color="#000" />
          </TouchableOpacity>
          <StyledText className="text-lg font-semibold text-gray-800">{t('quizResult')}</StyledText>
          <TouchableOpacity>
            <Ionicons name="person-circle-outline" size={28} color="#000" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView className="flex-1" contentContainerStyle={{ paddingHorizontal: 20, paddingVertical: 24, paddingBottom: 100 }}>
        {/* Result Card */}
        <View className="mb-5 rounded-2xl bg-white p-6 shadow-sm">
          {/* Trophy Icon */}
          <View className="mb-4 items-center">
            <View className="mb-3 h-24 w-24 items-center justify-center rounded-full bg-teal-100">
              <MaterialCommunityIcons name="trophy" size={50} color="#14b8a6" />
            </View>
            <View className="rounded-full bg-teal-500 px-4 py-1">
              <StyledText className="text-sm font-bold text-white">{t('result')}</StyledText>
            </View>
            <View className="mt-2 rounded-full bg-teal-100 px-4 py-1">
              <StyledText className="text-sm font-semibold text-teal-700">{getResultMessage()}</StyledText>
            </View>
          </View>

          {/* Category Name */}
          <StyledText className="mb-2 text-center text-xl font-bold text-gray-800">
            {result.category}
          </StyledText>

          {/* Pass/Fail Badge */}
          {percentage >= 70 ? (
            <View className="mb-6 items-center">
              <View className="rounded-full bg-green-100 px-6 py-2">
                <StyledText className="text-lg font-bold text-green-700">{t('passedStatus')}</StyledText>
              </View>
            </View>
          ) : (
            <View className="mb-6 items-center">
              <View className="rounded-full bg-red-100 px-6 py-2">
                <StyledText className="text-lg font-bold text-red-700">{t('failedStatus')}</StyledText>
              </View>
            </View>
          )}

          {/* Score Display */}
          <View className="mb-6 flex-row items-center justify-center">
            <View className="mr-8 items-center">
              <StyledText className="mb-1 text-sm text-gray-500">{t('totalScore')}</StyledText>
              <StyledText className="text-2xl font-bold text-gray-800">{result.totalScore}</StyledText>
            </View>
            <View className="items-center">
              <StyledText className="mb-1 text-sm text-gray-500">{t('quizScore')}</StyledText>
              <StyledText className="text-2xl font-bold text-teal-600">{result.quizScore}</StyledText>
            </View>
          </View>

          {/* Percentage Display */}
          <View className="mb-4 items-center">
            <View className="mb-2 h-20 w-20 items-center justify-center rounded-full bg-teal-50">
              <StyledText className="text-2xl font-bold text-teal-600">{percentage}%</StyledText>
            </View>
            <StyledText className="text-xs text-gray-500">{t('yourScorePercentage')}</StyledText>
          </View>

          {/* Statistics Grid */}
          <View className="mb-4 flex-row flex-wrap justify-between">
            {/* Correct Answers */}
            <View className="mb-3 w-[48%] flex-row items-center rounded-xl bg-green-50 p-3">
              <Ionicons name="checkmark-circle" size={24} color="#10b981" />
              <View className="ml-3">
                <StyledText className="text-xs text-gray-600">{t('correct')}</StyledText>
                <StyledText className="text-lg font-bold text-green-600">
                  {result.correctAnswers}
                </StyledText>
              </View>
            </View>

            {/* Wrong Answers */}
            <View className="mb-3 w-[48%] flex-row items-center rounded-xl bg-red-50 p-3">
              <Ionicons name="close-circle" size={24} color="#ef4444" />
              <View className="ml-3">
                <StyledText className="text-xs text-gray-600">{t('wrong')}</StyledText>
                <StyledText className="text-lg font-bold text-red-600">{result.wrongAnswers}</StyledText>
              </View>
            </View>

            {/* Skipped */}
            <View className="mb-3 w-[48%] flex-row items-center rounded-xl bg-gray-100 p-3">
              <Ionicons name="play-skip-forward-circle" size={24} color="#6b7280" />
              <View className="ml-3">
                <StyledText className="text-xs text-gray-600">{t('skipped')}</StyledText>
                <StyledText className="text-lg font-bold text-gray-600">{result.skipped}</StyledText>
              </View>
            </View>

            {/* Attempted */}
            <View className="mb-3 w-[48%] flex-row items-center rounded-xl bg-blue-50 p-3">
              <Ionicons name="flag" size={24} color="#3b82f6" />
              <View className="ml-3">
                <StyledText className="text-xs text-gray-600">{t('attempted')}</StyledText>
                <StyledText className="text-lg font-bold text-blue-600">{result.attempted}</StyledText>
              </View>
            </View>
          </View>

          {/* Time Statistics */}
          <View className="flex-row justify-between border-t border-gray-100 pt-4">
            <View className="flex-1 items-center">
              <Ionicons name="time" size={20} color="#14b8a6" />
              <StyledText className="mt-1 text-xs text-gray-600">{t('timeTaken')}</StyledText>
              <StyledText className="font-semibold text-gray-800">{result.timeTaken}</StyledText>
            </View>
            <View className="w-px bg-gray-200" />
            <View className="flex-1 items-center">
              <Ionicons name="timer-outline" size={20} color="#f59e0b" />
              <StyledText className="mt-1 text-xs text-gray-600">{t('timeRemaining')}</StyledText>
              <StyledText className="font-semibold text-gray-800">{result.timeRemaining}</StyledText>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Action Buttons - Fixed at bottom */}
      <View className="absolute bottom-0 left-0 right-0 bg-white px-5 py-4 border-t border-gray-200">
          {/* Review Answers Button - Full width */}
          {result.questions && result.questions.length > 0 && (
            <TouchableOpacity
              className="mb-3 w-full items-center rounded-xl bg-blue-500 py-4"
              onPress={handleDetailsPress}>
              <View className="flex-row items-center">
                <Ionicons name="eye-outline" size={20} color="#fff" />
                <StyledText className="ml-2 text-base font-bold text-white">{t('reviewAnswers')}</StyledText>
              </View>
            </TouchableOpacity>
          )}

          {/* Home and Try Again buttons */}
          <View className="flex-row items-center justify-between">
            <TouchableOpacity
              className="mr-3 flex-1 items-center rounded-xl bg-teal-500 py-4"
              onPress={handleHomePress}>
              <StyledText className="text-base font-bold text-white">{t('home')}</StyledText>
            </TouchableOpacity>

            <TouchableOpacity
              className="flex-1 items-center rounded-xl border-2 border-teal-500 bg-white py-4"
              onPress={() => {
                resetQuiz();
                navigation.navigate('Main', { screen: 'Prayer' });
              }}>
              <StyledText className="text-base font-bold text-teal-600">{t('tryAgain')}</StyledText>
            </TouchableOpacity>
          </View>
        </View>
    </View>
  );
}