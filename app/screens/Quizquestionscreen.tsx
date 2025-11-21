import React, { useState, useEffect } from 'react';
import { View, TouchableOpacity, StatusBar, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useQuiz } from '../context/QuizContext';
import { useTheme } from '../context/ThemeContext';
import { useCustomAlert } from '../context/CustomAlertContext';
import { useLanguage } from '../context/LanguageContext';
import StyledText from '../components/StyledText';

export default function QuizQuestionScreen({ navigation, route }) {
  const {
    currentSession,
    getCurrentQuestion,
    getQuestionAnswer,
    answerQuestion,
    skipQuestion,
    goToNextQuestion,
    goToPreviousQuestion,
    submitQuiz,
  } = useQuiz();
  const { colors, isDark } = useTheme();
  const { showAlert } = useCustomAlert();
  const { t } = useLanguage();

  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [timeLeft, setTimeLeft] = useState(45); // Default 45 seconds
  const [questionStartTime, setQuestionStartTime] = useState(Date.now());
  const [showSubmitModal, setShowSubmitModal] = useState(false);

  const currentQuestion = getCurrentQuestion();
  const currentQuestionIndex = currentSession?.currentQuestionIndex || 0;
  const totalQuestions = currentSession?.questions.length || 0;

  // Reset timer and load previous answer when question changes
  useEffect(() => {
    if (!currentQuestion) {
      // No questions available, go back
      navigation.goBack();
      return;
    }

    // Reset timer for new question
    setTimeLeft(currentQuestion.timeLimit);
    setQuestionStartTime(Date.now());

    // Load previous answer if exists
    const previousAnswer = getQuestionAnswer(currentQuestion.id);
    if (previousAnswer && previousAnswer.selectedOptionId) {
      setSelectedAnswer(previousAnswer.selectedOptionId);
    } else {
      setSelectedAnswer(null);
    }
  }, [currentQuestionIndex, currentQuestion]);

  // Timer countdown
  useEffect(() => {
    if (!currentQuestion) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          // Auto skip when time is up
          handleAutoSkip();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [currentQuestionIndex]);

  const handleAutoSkip = () => {
    if (!currentQuestion) return;

    const timeTaken = Math.floor((Date.now() - questionStartTime) / 1000);
    skipQuestion(currentQuestion.id, timeTaken);

    // Move to next question or finish
    const hasNext = goToNextQuestion();
    if (!hasNext) {
      handleQuizComplete();
    }
  };

  const handleAnswerSelect = (optionId) => {
    setSelectedAnswer(optionId);
  };

  const handleNext = () => {
    if (!currentQuestion) return;

    if (!selectedAnswer) {
      showAlert(t('noAnswerSelected'), t('selectAnswerPrompt'), 'warning');
      return;
    }

    // Calculate time taken
    const timeTaken = Math.floor((Date.now() - questionStartTime) / 1000);

    // Save answer
    answerQuestion(currentQuestion.id, selectedAnswer, timeTaken);

    // Check if this is the last question
    if (currentQuestionIndex === totalQuestions - 1) {
      // Last question - show confirmation modal instead of auto-submit
      setShowSubmitModal(true);
    } else {
      // Move to next question
      goToNextQuestion();
    }
  };

  const handleSkip = () => {
    if (!currentQuestion) return;

    const timeTaken = Math.floor((Date.now() - questionStartTime) / 1000);
    skipQuestion(currentQuestion.id, timeTaken);

    // Move to next question or finish
    const hasNext = goToNextQuestion();
    if (!hasNext) {
      handleQuizComplete();
    }
  };

  const handleBack = () => {
    if (currentQuestionIndex === 0) {
      showAlert(
        t('exitQuiz'),
        t('exitQuizConfirmation'),
        'warning',
        [
          {
            text: t('cancel'),
            style: 'cancel',
          },
          {
            text: t('exit'),
            onPress: () => navigation.goBack(),
            style: 'destructive',
          },
        ]
      );
      return;
    }

    goToPreviousQuestion();
  };

  const handleQuizComplete = async () => {
    try {

      // Submit quiz and get results
      const result = await submitQuiz();


      if (result) {

        // Navigate to results screen with the result data
        navigation.navigate('QuizResult', { result });
      } else {
        showAlert(t('submissionError'), t('failedToSubmitQuiz'), 'error');
      }
    } catch (error) {
      showAlert(t('submissionError'), t('failedToSubmitQuiz'), 'error');
    }
  };

  const handleReviewAnswers = () => {
    // Close modal and allow user to review/change answers
    setShowSubmitModal(false);
    // User can navigate back through questions
  };

  const handleConfirmSubmit = () => {
    // Close modal and submit quiz
    setShowSubmitModal(false);
    handleQuizComplete();
  };

  if (!currentQuestion || !currentSession) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background }}>
        <StyledText style={{ color: colors.textSecondary }}>{t('loadingQuestion')}</StyledText>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

      {/* Header */}
      <View style={{ borderBottomWidth: 1, borderBottomColor: colors.border, backgroundColor: colors.surface, paddingHorizontal: 20, paddingBottom: 16, paddingTop: 48 }}>
        <View style={{ marginBottom: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <TouchableOpacity onPress={handleBack}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <StyledText style={{ fontSize: 18, fontWeight: '600', color: colors.text }}>{currentSession.categoryName}</StyledText>
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
                  width: `${((currentQuestionIndex + 1) / totalQuestions) * 100}%`,
                }}
              />
            </View>
            <StyledText style={{ marginTop: 4, fontSize: 12, color: colors.textSecondary }}>
              {t('question')} {currentQuestionIndex + 1} {t('of')} {totalQuestions}
            </StyledText>
          </View>
          <View style={{ marginLeft: 16, flexDirection: 'row', alignItems: 'center' }}>
            <Ionicons name="time-outline" size={18} color={timeLeft <= 10 ? colors.error : colors.primary} />
            <StyledText
              style={{
                marginLeft: 4,
                fontSize: 14,
                fontWeight: '600',
                color: timeLeft <= 10 ? colors.error : colors.primary,
              }}>
              {String(Math.floor(timeLeft / 60)).padStart(2, '0')}:
              {String(timeLeft % 60).padStart(2, '0')}
            </StyledText>
          </View>
        </View>
      </View>

      {/* Question Section */}
      <View style={{ flex: 1, paddingHorizontal: 20, paddingTop: 24 }}>
        {/* Category Badge */}
        <View style={{ marginBottom: 16, alignSelf: 'flex-start', borderRadius: 20, backgroundColor: colors.primaryLight, paddingHorizontal: 16, paddingVertical: 8 }}>
          <StyledText style={{ fontSize: 12, fontWeight: '600', color: colors.primary }}>{currentQuestion.category}</StyledText>
        </View>

        {/* Question StyledText */}
        <View style={{ marginBottom: 24 }}>
          <StyledText style={{ marginBottom: 8, fontSize: 18, fontWeight: '600', color: colors.text }}>{t('question')}:</StyledText>
          <StyledText style={{ fontSize: 16, lineHeight: 24, color: colors.text }}>{currentQuestion.question}</StyledText>
        </View>

        {/* Options */}
        <View style={{ marginBottom: 24 }}>
          {currentQuestion.options.map((option) => (
            <TouchableOpacity
              key={option.id}
              style={{
                marginBottom: 12,
                flexDirection: 'row',
                alignItems: 'center',
                borderRadius: 12,
                borderWidth: 2,
                borderColor: selectedAnswer === option.id ? colors.primary : colors.border,
                backgroundColor: selectedAnswer === option.id ? colors.primaryLight : colors.surface,
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
              <StyledText
                style={{
                  flex: 1,
                  fontSize: 16,
                  fontWeight: selectedAnswer === option.id ? '600' : '400',
                  color: selectedAnswer === option.id ? colors.primary : colors.text,
                }}>
                {option.text}
              </StyledText>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Bottom Navigation */}
      <View style={{ borderTopWidth: 1, borderTopColor: colors.border, backgroundColor: colors.surface, paddingHorizontal: 20, paddingVertical: 16 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <TouchableOpacity
            style={{
              marginRight: 12,
              flex: 1,
              alignItems: 'center',
              borderRadius: 12,
              backgroundColor: colors.border,
              paddingVertical: 12,
            }}
            onPress={handleBack}>
            <StyledText style={{ fontWeight: '600', color: colors.textSecondary }}>
              {currentQuestionIndex === 0 ? t('exit') : t('back')}
            </StyledText>
          </TouchableOpacity>

          <TouchableOpacity
            style={{
              flex: 1,
              alignItems: 'center',
              borderRadius: 12,
              backgroundColor: colors.border,
              paddingVertical: 12,
            }}
            onPress={handleSkip}>
            <StyledText style={{ fontWeight: '600', color: colors.textSecondary }}>{t('skip')}</StyledText>
          </TouchableOpacity>

          <View style={{ width: 12 }} />

          <TouchableOpacity
            style={{
              marginLeft: 12,
              flex: 1,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: 12,
              backgroundColor: selectedAnswer ? colors.primary : colors.border,
              paddingVertical: 12,
            }}
            onPress={handleNext}
            disabled={!selectedAnswer}>
            <StyledText style={{ marginRight: 8, fontWeight: '600', color: '#fff' }}>
              {currentQuestionIndex === totalQuestions - 1 ? t('submit') : t('next')}
            </StyledText>
            <Ionicons name="arrow-forward" size={18} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Submit Confirmation Modal */}
      <Modal
        visible={showSubmitModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowSubmitModal(false)}>
        <View
          style={{
            flex: 1,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            justifyContent: 'center',
            alignItems: 'center',
            padding: 20,
          }}>
          <View
            style={{
              backgroundColor: colors.surface,
              borderRadius: 20,
              padding: 24,
              width: '100%',
              maxWidth: 400,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 8,
              elevation: 8,
            }}>
            {/* Icon */}
            <View
              style={{
                width: 64,
                height: 64,
                borderRadius: 32,
                backgroundColor: colors.primaryLight,
                alignItems: 'center',
                justifyContent: 'center',
                alignSelf: 'center',
                marginBottom: 16,
              }}>
              <Ionicons name="checkmark-circle" size={40} color={colors.primary} />
            </View>

            {/* Title */}
            <StyledText
              style={{
                fontSize: 22,
                fontWeight: '700',
                color: colors.text,
                textAlign: 'center',
                marginBottom: 8,
              }}>
              {t('readyToSubmit')}
            </StyledText>

            {/* Message */}
            <StyledText
              style={{
                fontSize: 15,
                color: colors.textSecondary,
                textAlign: 'center',
                lineHeight: 22,
                marginBottom: 24,
              }}>
              {t('allQuestionsAnswered')}
            </StyledText>

            {/* Quiz Summary */}
            <View
              style={{
                backgroundColor: colors.background,
                borderRadius: 12,
                padding: 16,
                marginBottom: 24,
              }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                <StyledText style={{ fontSize: 14, color: colors.textSecondary }}>{t('totalQuestions')}</StyledText>
                <StyledText style={{ fontSize: 14, fontWeight: '600', color: colors.text }}>
                  {totalQuestions}
                </StyledText>
              </View>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                <StyledText style={{ fontSize: 14, color: colors.textSecondary }}>{t('answered')}</StyledText>
                <StyledText style={{ fontSize: 14, fontWeight: '600', color: colors.success }}>
                  {currentSession?.userAnswers.filter((a) => !a.skipped).length || 0}
                </StyledText>
              </View>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <StyledText style={{ fontSize: 14, color: colors.textSecondary }}>{t('skipped')}:</StyledText>
                <StyledText style={{ fontSize: 14, fontWeight: '600', color: colors.error }}>
                  {currentSession?.userAnswers.filter((a) => a.skipped).length || 0}
                </StyledText>
              </View>
            </View>

            {/* Buttons */}
            <View style={{ gap: 12 }}>
              {/* Submit Button */}
              <TouchableOpacity
                style={{
                  backgroundColor: colors.primary,
                  borderRadius: 12,
                  paddingVertical: 14,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                onPress={handleConfirmSubmit}>
                <Ionicons name="checkmark-circle-outline" size={20} color="#fff" style={{ marginRight: 8 }} />
                <StyledText style={{ fontSize: 16, fontWeight: '600', color: '#fff' }}>{t('submitQuiz')}</StyledText>
              </TouchableOpacity>

              {/* Review Button */}
              <TouchableOpacity
                style={{
                  backgroundColor: colors.border,
                  borderRadius: 12,
                  paddingVertical: 14,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                onPress={handleReviewAnswers}>
                <Ionicons name="arrow-back-circle-outline" size={20} color={colors.text} style={{ marginRight: 8 }} />
                <StyledText style={{ fontSize: 16, fontWeight: '600', color: colors.text }}>{t('reviewAnswers')}</StyledText>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}