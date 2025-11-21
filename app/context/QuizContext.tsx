import React, { createContext, useContext, useState, useCallback } from 'react';
import {
  QuizSession,
  QuizQuestion,
  UserAnswer,
  QuizResult,
  ApiQuizSubmission,
} from '../types/quiz.types';
import QuizService from '../services/QuizService';

interface QuizContextType {
  currentSession: QuizSession | null;
  startQuiz: (categoryId: number, categoryName: string) => Promise<void>;
  answerQuestion: (questionId: number, optionId: string | null, timeTaken: number) => void;
  skipQuestion: (questionId: number, timeTaken: number) => void;
  goToNextQuestion: () => boolean;
  goToPreviousQuestion: () => boolean;
  submitQuiz: () => Promise<QuizResult | null>;
  resetQuiz: () => void;
  getCurrentQuestion: () => QuizQuestion | null;
  getQuestionAnswer: (questionId: number) => UserAnswer | null;
  isLoading: boolean;
  error: string | null;
}

const QuizContext = createContext<QuizContextType | undefined>(undefined);

export const QuizProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentSession, setCurrentSession] = useState<QuizSession | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Start a new quiz session
   */
  const startQuiz = useCallback(async (categoryId: number, categoryName: string) => {
    try {
      setIsLoading(true);
      setError(null);

      // Fetch questions from API/Service
      const questions = await QuizService.getQuizQuestions(categoryId);

      if (questions.length === 0) {
        throw new Error('No questions available for this category');
      }

      // Initialize quiz session
      const session: QuizSession = {
        categoryId,
        categoryName,
        questions,
        userAnswers: [],
        currentQuestionIndex: 0,
        startTime: Date.now(),
        status: 'in_progress',
      };

      setCurrentSession(session);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start quiz');
      console.error('Error starting quiz:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Answer a question
   */
  const answerQuestion = useCallback(
    (questionId: number, optionId: string | null, timeTaken: number) => {
      if (!currentSession) return;

      const question = currentSession.questions.find((q) => q.id === questionId);
      if (!question) return;

      const selectedOption = question.options.find((opt) => opt.id === optionId);
      const isCorrect = selectedOption?.isCorrect || false;

      const answer: UserAnswer = {
        questionId,
        selectedOptionId: optionId,
        isCorrect,
        timeTaken,
        skipped: false,
      };

      setCurrentSession((prev) => {
        if (!prev) return prev;

        // Update existing answer or add new one
        const existingIndex = prev.userAnswers.findIndex(
          (a) => a.questionId === questionId
        );

        const updatedAnswers =
          existingIndex >= 0
            ? prev.userAnswers.map((a, i) => (i === existingIndex ? answer : a))
            : [...prev.userAnswers, answer];

        return {
          ...prev,
          userAnswers: updatedAnswers,
        };
      });
    },
    [currentSession]
  );

  /**
   * Skip a question
   */
  const skipQuestion = useCallback(
    (questionId: number, timeTaken: number) => {
      answerQuestion(questionId, null, timeTaken);

      setCurrentSession((prev) => {
        if (!prev) return prev;

        const existingIndex = prev.userAnswers.findIndex(
          (a) => a.questionId === questionId
        );

        const skippedAnswer: UserAnswer = {
          questionId,
          selectedOptionId: null,
          isCorrect: false,
          timeTaken,
          skipped: true,
        };

        const updatedAnswers =
          existingIndex >= 0
            ? prev.userAnswers.map((a, i) => (i === existingIndex ? skippedAnswer : a))
            : [...prev.userAnswers, skippedAnswer];

        return {
          ...prev,
          userAnswers: updatedAnswers,
        };
      });
    },
    [answerQuestion]
  );

  /**
   * Navigate to next question
   */
  const goToNextQuestion = useCallback((): boolean => {
    if (!currentSession) return false;

    const nextIndex = currentSession.currentQuestionIndex + 1;
    if (nextIndex >= currentSession.questions.length) {
      return false; // No more questions
    }

    setCurrentSession((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        currentQuestionIndex: nextIndex,
      };
    });

    return true;
  }, [currentSession]);

  /**
   * Navigate to previous question
   */
  const goToPreviousQuestion = useCallback((): boolean => {
    if (!currentSession) return false;

    const prevIndex = currentSession.currentQuestionIndex - 1;
    if (prevIndex < 0) {
      return false; // Already at first question
    }

    setCurrentSession((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        currentQuestionIndex: prevIndex,
      };
    });

    return true;
  }, [currentSession]);

  /**
   * Submit quiz and get results
   */
  const submitQuiz = useCallback(async (): Promise<QuizResult | null> => {
    console.log('🎯 QuizContext: submitQuiz called');

    if (!currentSession) {
      console.error('❌ No current session!');
      return null;
    }

    console.log('📊 Current session:', {
      categoryId: currentSession.categoryId,
      categoryName: currentSession.categoryName,
      answersCount: currentSession.userAnswers.length,
      questionsCount: currentSession.questions.length,
    });

    try {
      setIsLoading(true);
      setError(null);

      // Prepare submission
      const submission: ApiQuizSubmission = {
        sessionId: currentSession.id,
        categoryId: currentSession.categoryId,
        answers: currentSession.userAnswers.map((answer) => ({
          questionId: answer.questionId,
          selectedOptionId: answer.selectedOptionId,
          timeTaken: answer.timeTaken,
        })),
      };

      console.log('📤 Submitting to QuizService...');
      console.log('📊 Submission:', submission);

      // Submit to API and get results
      const result = await QuizService.submitQuizAnswers(submission);

      console.log('📥 QuizContext: Result received from QuizService:', result);

      if (!result) {
        console.error('❌ QuizService returned null result');
        throw new Error('No result returned from service');
      }

      // Update session status
      setCurrentSession((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          endTime: Date.now(),
          status: 'completed',
        };
      });

      console.log('✅ QuizContext: Returning result to caller');
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to submit quiz';
      setError(errorMessage);
      console.error('❌ QuizContext: Error submitting quiz:', err);
      console.error('❌ Error details:', errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [currentSession]);

  /**
   * Reset quiz state
   */
  const resetQuiz = useCallback(() => {
    setCurrentSession(null);
    setError(null);
  }, []);

  /**
   * Get current question
   */
  const getCurrentQuestion = useCallback((): QuizQuestion | null => {
    if (!currentSession) return null;
    return currentSession.questions[currentSession.currentQuestionIndex] || null;
  }, [currentSession]);

  /**
   * Get answer for a specific question
   */
  const getQuestionAnswer = useCallback(
    (questionId: number): UserAnswer | null => {
      if (!currentSession) return null;
      return currentSession.userAnswers.find((a) => a.questionId === questionId) || null;
    },
    [currentSession]
  );

  const value: QuizContextType = {
    currentSession,
    startQuiz,
    answerQuestion,
    skipQuestion,
    goToNextQuestion,
    goToPreviousQuestion,
    submitQuiz,
    resetQuiz,
    getCurrentQuestion,
    getQuestionAnswer,
    isLoading,
    error,
  };

  return <QuizContext.Provider value={value}>{children}</QuizContext.Provider>;
};

/**
 * Hook to use Quiz context
 */
export const useQuiz = () => {
  const context = useContext(QuizContext);
  if (context === undefined) {
    throw new Error('useQuiz must be used within a QuizProvider');
  }
  return context;
};
