// Quiz Types - API Ready Structure

export interface QuizCategory {
  id: number;
  title: string;
  icon: string;
  iconType: 'MaterialCommunityIcons' | 'FontAwesome5' | 'Ionicons';
  color: string;
  bgColor: string;
  description?: string;
}

export interface QuizOption {
  id: string;
  text: string;
  isCorrect: boolean;
}

export interface QuizQuestion {
  id: number;
  categoryId: number;
  category: string;
  question: string;
  options: QuizOption[];
  timeLimit: number; // in seconds
  points: number;
}

export interface UserAnswer {
  questionId: number;
  selectedOptionId: string | null;
  isCorrect: boolean;
  timeTaken: number; // in seconds
  skipped: boolean;
}

export interface QuizSession {
  id?: string;
  categoryId: number;
  categoryName: string;
  questions: QuizQuestion[];
  userAnswers: UserAnswer[];
  currentQuestionIndex: number;
  startTime: number;
  endTime?: number;
  status: 'not_started' | 'in_progress' | 'completed';
}

export interface QuizResult {
  sessionId?: string;
  category: string;
  totalQuestions: number;
  correctAnswers: number;
  wrongAnswers: number;
  skipped: number;
  attempted: number;
  totalScore: number;
  quizScore: number;
  percentage: number;
  timeTaken: string;
  timeRemaining: string;
  questions: QuizQuestion[];
  userAnswers: UserAnswer[];
}

// API Response Types
export interface ApiQuizCategory {
  id: number;
  name: string;
  description?: string;
  iconName?: string;
  iconType?: string;
  color?: string;
  bgColor?: string;
}

export interface ApiQuizQuestion {
  id: number;
  categoryId: number;
  questionText: string;
  options: {
    id: string;
    text: string;
    isCorrect: boolean;
  }[];
  timeLimit?: number;
  points?: number;
}

export interface ApiQuizResponse {
  success: boolean;
  data: ApiQuizQuestion[];
  message?: string;
}

export interface ApiQuizSubmission {
  sessionId?: string;
  categoryId: number;
  answers: {
    questionId: number;
    selectedOptionId: string | null;
    timeTaken: number;
  }[];
}

export interface ApiQuizResultResponse {
  success: boolean;
  data: {
    totalScore: number;
    earnedScore: number;
    correctCount: number;
    wrongCount: number;
    skippedCount: number;
    percentage: number;
  };
  message?: string;
}
