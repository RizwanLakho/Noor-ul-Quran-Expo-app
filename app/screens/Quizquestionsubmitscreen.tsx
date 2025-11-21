import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StatusBar, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function QuizQuestionSubmitScreen({ navigation, route }) {
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [timeLeft, setTimeLeft] = useState(7); // 7 seconds timer
  const [currentQuestion, setCurrentQuestion] = useState(3);
  const totalQuestions = 5;

  // Sample question data
  const question = {
    id: 3,
    category: 'Quran',
    question: 'How one ...... Masjid Aqsa?to in Holy Quran?',
    options: [
      { id: 'A', text: '87', isCorrect: false },
      { id: 'B', text: '77', isCorrect: false },
      { id: 'C', text: '88', isCorrect: true },
      { id: 'D', text: '76', isCorrect: false },
    ],
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleAnswerSelect = (optionId) => {
    setSelectedAnswer(optionId);
  };

  const handleSubmit = () => {
    if (!selectedAnswer) {
      Alert.alert('Please select an answer', 'You must select an answer before submitting.');
      return;
    }

    // Submit answer to API
    // Then navigate to results
    navigation.navigate('QuizResult', {
      selectedAnswer,
      correctAnswer: question.options.find((opt) => opt.isCorrect).id,
    });
  };

  const handleSkip = () => {
    navigation.navigate('QuizResult');
  };

  const handleBack = () => {
    if (currentQuestion > 1) {
      setCurrentQuestion(currentQuestion - 1);
      setSelectedAnswer(null);
      setTimeLeft(7);
    }
  };

  return (
    <View className="flex-1 bg-gray-50">
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View className="border-b border-gray-100 bg-white px-5 pb-4 pt-12">
        <View className="mb-3 flex-row items-center justify-between">
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="#000" />
          </TouchableOpacity>
          <Text className="text-lg font-semibold text-gray-800">Quiz Majeed</Text>
          <TouchableOpacity>
            <Ionicons name="person-circle-outline" size={28} color="#000" />
          </TouchableOpacity>
        </View>

        {/* Progress and Timer */}
        <View className="flex-row items-center justify-between">
          <View className="flex-1">
            <View className="h-2 overflow-hidden rounded-full bg-gray-200">
              <View
                className="h-full rounded-full bg-teal-500"
                style={{ width: `${(currentQuestion / totalQuestions) * 100}%` }}
              />
            </View>
          </View>
          <View className="ml-4 flex-row items-center">
            <Ionicons name="time-outline" size={18} color="#14b8a6" />
            <Text className="ml-1 text-sm font-semibold text-teal-600">
              00:{String(timeLeft).padStart(2, '0')}
            </Text>
          </View>
        </View>
      </View>

      {/* Question Section */}
      <View className="flex-1 px-5 pt-6">
        {/* Category Badge */}
        <View className="mb-4 self-start rounded-full bg-teal-100 px-4 py-2">
          <Text className="text-xs font-semibold text-teal-700">{question.category}</Text>
        </View>

        {/* Question Text */}
        <View className="mb-6">
          <Text className="mb-2 text-lg font-semibold text-gray-800">Question:</Text>
          <Text className="text-base leading-6 text-gray-700">{question.question}</Text>
        </View>

        {/* Options */}
        <View className="mb-6">
          {question.options.map((option) => (
            <TouchableOpacity
              key={option.id}
              className={`mb-3 flex-row items-center rounded-xl border-2 p-4 ${
                selectedAnswer === option.id
                  ? 'border-teal-500 bg-teal-50'
                  : 'border-gray-200 bg-white'
              }`}
              onPress={() => handleAnswerSelect(option.id)}>
              <View
                className={`mr-3 h-6 w-6 items-center justify-center rounded-full border-2 ${
                  selectedAnswer === option.id ? 'border-teal-500 bg-teal-500' : 'border-gray-300'
                }`}>
                {selectedAnswer === option.id && <View className="h-3 w-3 rounded-full bg-white" />}
              </View>
              <Text
                className={`text-base ${
                  selectedAnswer === option.id ? 'font-semibold text-teal-700' : 'text-gray-700'
                }`}>
                {option.text}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          className={`items-center rounded-xl py-4 ${
            selectedAnswer ? 'bg-teal-500' : 'bg-gray-300'
          }`}
          onPress={handleSubmit}
          disabled={!selectedAnswer}>
          <Text className="text-base font-bold text-white">Submit</Text>
        </TouchableOpacity>
      </View>

      {/* Bottom Navigation */}
      <View className="border-t border-gray-100 bg-white px-5 py-4">
        <View className="flex-row items-center justify-between">
          <TouchableOpacity
            className="mr-3 flex-1 items-center rounded-xl bg-gray-100 py-3"
            onPress={handleBack}>
            <Text className="font-semibold text-gray-600">Back</Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="flex-1 flex-row items-center justify-center rounded-xl bg-gray-100 py-3"
            onPress={handleSkip}>
            <Text className="mr-2 font-semibold text-gray-600">Skip</Text>
            <Ionicons name="arrow-forward" size={18} color="#666" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
