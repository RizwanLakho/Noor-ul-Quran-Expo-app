import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StatusBar, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

export default function QuizQuestionSubmitScreen({ navigation, route }) {
  const { colors, isDark } = useTheme();
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
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />

      {/* Header */}
      <View style={{ borderBottomWidth: 1, borderBottomColor: colors.border, backgroundColor: colors.surface, paddingHorizontal: 20, paddingBottom: 16, paddingTop: 48 }}>
        <View style={{ marginBottom: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={{ fontSize: 18, fontWeight: '600', color: colors.text }}>Quiz Majeed</Text>
          <TouchableOpacity>
            <Ionicons name="person-circle-outline" size={28} color={colors.text} />
          </TouchableOpacity>
        </View>

        {/* Progress and Timer */}
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <View style={{ flex: 1 }}>
            <View style={{ height: 8, overflow: 'hidden', borderRadius: 4, backgroundColor: colors.border }}>
              <View
                style={{
                  height: '100%',
                  borderRadius: 4,
                  backgroundColor: colors.primary,
                  width: `${(currentQuestion / totalQuestions) * 100}%`,
                }}
              />
            </View>
          </View>
          <View style={{ marginLeft: 16, flexDirection: 'row', alignItems: 'center' }}>
            <Ionicons name="time-outline" size={18} color={colors.primary} />
            <Text style={{ marginLeft: 4, fontSize: 14, fontWeight: '600', color: colors.primary }}>
              00:{String(timeLeft).padStart(2, '0')}
            </Text>
          </View>
        </View>
      </View>

      {/* Question Section */}
      <View style={{ flex: 1, paddingHorizontal: 20, paddingTop: 24 }}>
        {/* Category Badge */}
        <View style={{ marginBottom: 16, alignSelf: 'flex-start', borderRadius: 20, backgroundColor: colors.primaryLight, paddingHorizontal: 16, paddingVertical: 8 }}>
          <Text style={{ fontSize: 12, fontWeight: '600', color: colors.primary }}>{question.category}</Text>
        </View>

        {/* Question Text */}
        <View style={{ marginBottom: 24 }}>
          <Text style={{ marginBottom: 8, fontSize: 18, fontWeight: '600', color: colors.text }}>Question:</Text>
          <Text style={{ fontSize: 16, lineHeight: 24, color: colors.text }}>{question.question}</Text>
        </View>

        {/* Options */}
        <View style={{ marginBottom: 24 }}>
          {question.options.map((option) => (
            <TouchableOpacity
              key={option.id}
              style={{
                marginBottom: 12,
                flexDirection: 'row',
                alignItems: 'center',
                borderRadius: 12,
                borderWidth: 2,
                borderColor: selectedAnswer === option.id ? colors.primary : colors.border,
                backgroundColor: selectedAnswer === option.id ? (isDark ? '#0D5A47' : '#F0FDFA') : colors.card,
                padding: 16,
              }}
              onPress={() => handleAnswerSelect(option.id)}>
              <View
                style={{
                  marginRight: 12,
                  height: 24,
                  width: 24,
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: 12,
                  borderWidth: 2,
                  borderColor: selectedAnswer === option.id ? colors.primary : colors.border,
                  backgroundColor: selectedAnswer === option.id ? colors.primary : 'transparent',
                }}>
                {selectedAnswer === option.id && <View style={{ height: 12, width: 12, borderRadius: 6, backgroundColor: '#fff' }} />}
              </View>
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: selectedAnswer === option.id ? '600' : '400',
                  color: selectedAnswer === option.id ? colors.primary : colors.text,
                }}>
                {option.text}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          style={{
            alignItems: 'center',
            borderRadius: 12,
            paddingVertical: 16,
            backgroundColor: selectedAnswer ? colors.primary : colors.border,
            opacity: selectedAnswer ? 1 : 0.6,
          }}
          onPress={handleSubmit}
          disabled={!selectedAnswer}>
          <Text style={{ fontSize: 16, fontWeight: 'bold', color: selectedAnswer ? '#fff' : colors.textSecondary }}>Submit</Text>
        </TouchableOpacity>
      </View>

      {/* Bottom Navigation */}
      <View style={{ borderTopWidth: 1, borderTopColor: colors.border, backgroundColor: colors.surface, paddingHorizontal: 20, paddingVertical: 16 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <TouchableOpacity
            style={{ marginRight: 12, flex: 1, alignItems: 'center', borderRadius: 12, backgroundColor: colors.border, paddingVertical: 12 }}
            onPress={handleBack}>
            <Text style={{ fontWeight: '600', color: colors.text }}>Back</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={{ flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', borderRadius: 12, backgroundColor: colors.border, paddingVertical: 12 }}
            onPress={handleSkip}>
            <Text style={{ marginRight: 8, fontWeight: '600', color: colors.text }}>Skip</Text>
            <Ionicons name="arrow-forward" size={18} color={colors.text} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
