// Quiz Service - Integrated with Backend API
import {
  QuizCategory,
  QuizQuestion,
  ApiQuizResponse,
  ApiQuizSubmission,
  ApiQuizResultResponse,
  QuizResult,
  UserAnswer,
} from '../types/quiz.types';
import apiService from './ApiService';

// Mock Data - Replace with actual API calls
const MOCK_QUIZ_QUESTIONS: Record<number, QuizQuestion[]> = {
  1: [
    // Creed
    {
      id: 101,
      categoryId: 1,
      category: 'Creed',
      question: 'What are the six pillars of Iman (faith) in Islam?',
      options: [
        { id: 'A', text: 'Belief in Allah, Angels, Books, Prophets, Day of Judgment, Divine Decree', isCorrect: true },
        { id: 'B', text: 'Prayer, Fasting, Charity, Pilgrimage, Shahada, Jihad', isCorrect: false },
        { id: 'C', text: 'Faith, Hope, Charity, Patience, Gratitude, Submission', isCorrect: false },
        { id: 'D', text: 'Quran, Hadith, Sunnah, Ijma, Qiyas, Ijtihad', isCorrect: false },
      ],
      timeLimit: 45,
      points: 10,
    },
    {
      id: 102,
      categoryId: 1,
      category: 'Creed',
      question: 'What is Tawhid in Islamic theology?',
      options: [
        { id: 'A', text: 'The oneness and uniqueness of Allah', isCorrect: true },
        { id: 'B', text: 'The five daily prayers', isCorrect: false },
        { id: 'C', text: 'The unity of Muslim community', isCorrect: false },
        { id: 'D', text: 'The balance between faith and action', isCorrect: false },
      ],
      timeLimit: 45,
      points: 10,
    },
    {
      id: 103,
      categoryId: 1,
      category: 'Creed',
      question: 'Who was the first prophet in Islam?',
      options: [
        { id: 'A', text: 'Prophet Muhammad (PBUH)', isCorrect: false },
        { id: 'B', text: 'Prophet Adam (AS)', isCorrect: true },
        { id: 'C', text: 'Prophet Noah (AS)', isCorrect: false },
        { id: 'D', text: 'Prophet Abraham (AS)', isCorrect: false },
      ],
      timeLimit: 45,
      points: 10,
    },
    {
      id: 104,
      categoryId: 1,
      category: 'Creed',
      question: 'What is the Day of Judgment called in Arabic?',
      options: [
        { id: 'A', text: 'Yawm al-Qiyamah', isCorrect: true },
        { id: 'B', text: 'Yawm al-Jumu\'ah', isCorrect: false },
        { id: 'C', text: 'Yawm al-Arafah', isCorrect: false },
        { id: 'D', text: 'Yawm al-Ashura', isCorrect: false },
      ],
      timeLimit: 45,
      points: 10,
    },
    {
      id: 105,
      categoryId: 1,
      category: 'Creed',
      question: 'How many angels are mentioned by name in the Quran?',
      options: [
        { id: 'A', text: 'Two (Jibril and Mikail)', isCorrect: false },
        { id: 'B', text: 'Three (Jibril, Mikail, and Israfil)', isCorrect: false },
        { id: 'C', text: 'Four (Jibril, Mikail, Israfil, and Malik)', isCorrect: false },
        { id: 'D', text: 'Two (Jibril and Harut & Marut)', isCorrect: true },
      ],
      timeLimit: 45,
      points: 10,
    },
  ],
  2: [
    // Quran Mojwad
    {
      id: 201,
      categoryId: 2,
      category: 'Quran Mojwad',
      question: 'How many Surahs are there in the Holy Quran?',
      options: [
        { id: 'A', text: '110', isCorrect: false },
        { id: 'B', text: '114', isCorrect: true },
        { id: 'C', text: '120', isCorrect: false },
        { id: 'D', text: '124', isCorrect: false },
      ],
      timeLimit: 45,
      points: 10,
    },
    {
      id: 202,
      categoryId: 2,
      category: 'Quran Mojwad',
      question: 'Which Surah is called the "Heart of the Quran"?',
      options: [
        { id: 'A', text: 'Surah Al-Fatiha', isCorrect: false },
        { id: 'B', text: 'Surah Yasin', isCorrect: true },
        { id: 'C', text: 'Surah Al-Mulk', isCorrect: false },
        { id: 'D', text: 'Surah Al-Kahf', isCorrect: false },
      ],
      timeLimit: 45,
      points: 10,
    },
    {
      id: 203,
      categoryId: 2,
      category: 'Quran Mojwad',
      question: 'How many verses (Ayahs) are in Surah Al-Baqarah?',
      options: [
        { id: 'A', text: '256', isCorrect: false },
        { id: 'B', text: '286', isCorrect: true },
        { id: 'C', text: '200', isCorrect: false },
        { id: 'D', text: '176', isCorrect: false },
      ],
      timeLimit: 45,
      points: 10,
    },
    {
      id: 204,
      categoryId: 2,
      category: 'Quran Mojwad',
      question: 'Which Surah does not begin with "Bismillah"?',
      options: [
        { id: 'A', text: 'Surah Al-Fatiha', isCorrect: false },
        { id: 'B', text: 'Surah At-Tawbah', isCorrect: true },
        { id: 'C', text: 'Surah Al-Ikhlas', isCorrect: false },
        { id: 'D', text: 'Surah An-Nas', isCorrect: false },
      ],
      timeLimit: 45,
      points: 10,
    },
    {
      id: 205,
      categoryId: 2,
      category: 'Quran Mojwad',
      question: 'In which Juz (part) is Surah Al-Kahf located?',
      options: [
        { id: 'A', text: 'Juz 14', isCorrect: false },
        { id: 'B', text: 'Juz 15', isCorrect: true },
        { id: 'C', text: 'Juz 16', isCorrect: false },
        { id: 'D', text: 'Juz 17', isCorrect: false },
      ],
      timeLimit: 45,
      points: 10,
    },
  ],
  3: [
    // Expiation
    {
      id: 301,
      categoryId: 3,
      category: 'Expiation',
      question: 'What is Kaffarah in Islamic jurisprudence?',
      options: [
        { id: 'A', text: 'A form of charity', isCorrect: false },
        { id: 'B', text: 'An expiation or atonement for certain sins', isCorrect: true },
        { id: 'C', text: 'A type of prayer', isCorrect: false },
        { id: 'D', text: 'A fasting ritual', isCorrect: false },
      ],
      timeLimit: 45,
      points: 10,
    },
    {
      id: 302,
      categoryId: 3,
      category: 'Expiation',
      question: 'What is the expiation for breaking an oath (yameen)?',
      options: [
        { id: 'A', text: 'Feeding 10 poor people or fasting 3 days', isCorrect: true },
        { id: 'B', text: 'Praying 100 rakats', isCorrect: false },
        { id: 'C', text: 'Giving money to mosque', isCorrect: false },
        { id: 'D', text: 'Making Umrah', isCorrect: false },
      ],
      timeLimit: 45,
      points: 10,
    },
    {
      id: 303,
      categoryId: 3,
      category: 'Expiation',
      question: 'What is the kaffarah for intentionally breaking fast in Ramadan?',
      options: [
        { id: 'A', text: 'Fast one day', isCorrect: false },
        { id: 'B', text: 'Fast 60 consecutive days or feed 60 poor people', isCorrect: true },
        { id: 'C', text: 'Give money to charity', isCorrect: false },
        { id: 'D', text: 'Pray extra prayers', isCorrect: false },
      ],
      timeLimit: 45,
      points: 10,
    },
    {
      id: 304,
      categoryId: 3,
      category: 'Expiation',
      question: 'What is Fidyah in relation to fasting?',
      options: [
        { id: 'A', text: 'Compensation for missing fasts due to valid reasons', isCorrect: true },
        { id: 'B', text: 'Extra prayers after breaking fast', isCorrect: false },
        { id: 'C', text: 'A type of charity during Ramadan', isCorrect: false },
        { id: 'D', text: 'The pre-dawn meal', isCorrect: false },
      ],
      timeLimit: 45,
      points: 10,
    },
    {
      id: 305,
      categoryId: 3,
      category: 'Expiation',
      question: 'What is the kaffarah for accidental killing?',
      options: [
        { id: 'A', text: 'Freeing a slave and fasting two consecutive months', isCorrect: true },
        { id: 'B', text: 'Praying for forgiveness', isCorrect: false },
        { id: 'C', text: 'Giving charity', isCorrect: false },
        { id: 'D', text: 'Making Hajj', isCorrect: false },
      ],
      timeLimit: 45,
      points: 10,
    },
  ],
  4: [
    // Fiqh
    {
      id: 401,
      categoryId: 4,
      category: 'Fiqh',
      question: 'What are the five pillars of Islam?',
      options: [
        { id: 'A', text: 'Shahada, Salah, Zakat, Sawm, Hajj', isCorrect: true },
        { id: 'B', text: 'Faith, Prayer, Charity, Fasting, Pilgrimage', isCorrect: false },
        { id: 'C', text: 'Belief, Worship, Good deeds, Patience, Gratitude', isCorrect: false },
        { id: 'D', text: 'Quran, Sunnah, Ijma, Qiyas, Ijtihad', isCorrect: false },
      ],
      timeLimit: 45,
      points: 10,
    },
    {
      id: 402,
      categoryId: 4,
      category: 'Fiqh',
      question: 'How many Fard (obligatory) prayers are there daily?',
      options: [
        { id: 'A', text: 'Three', isCorrect: false },
        { id: 'B', text: 'Four', isCorrect: false },
        { id: 'C', text: 'Five', isCorrect: true },
        { id: 'D', text: 'Six', isCorrect: false },
      ],
      timeLimit: 45,
      points: 10,
    },
    {
      id: 403,
      categoryId: 4,
      category: 'Fiqh',
      question: 'What is the Nisab for Zakat on wealth?',
      options: [
        { id: 'A', text: '85 grams of gold or equivalent', isCorrect: true },
        { id: 'B', text: '100 grams of gold or equivalent', isCorrect: false },
        { id: 'C', text: '50 grams of gold or equivalent', isCorrect: false },
        { id: 'D', text: '200 grams of gold or equivalent', isCorrect: false },
      ],
      timeLimit: 45,
      points: 10,
    },
    {
      id: 404,
      categoryId: 4,
      category: 'Fiqh',
      question: 'What breaks Wudu (ablution)?',
      options: [
        { id: 'A', text: 'Eating, drinking, sleeping deeply', isCorrect: false },
        { id: 'B', text: 'Using the bathroom, passing gas, deep sleep', isCorrect: true },
        { id: 'C', text: 'Talking, walking, sitting', isCorrect: false },
        { id: 'D', text: 'Touching objects, looking around, standing', isCorrect: false },
      ],
      timeLimit: 45,
      points: 10,
    },
    {
      id: 405,
      categoryId: 4,
      category: 'Fiqh',
      question: 'What is the ruling on interest (Riba) in Islam?',
      options: [
        { id: 'A', text: 'It is permissible in small amounts', isCorrect: false },
        { id: 'B', text: 'It is strictly forbidden (Haram)', isCorrect: true },
        { id: 'C', text: 'It is discouraged but not forbidden', isCorrect: false },
        { id: 'D', text: 'It is permissible for business purposes', isCorrect: false },
      ],
      timeLimit: 45,
      points: 10,
    },
  ],
  5: [
    // Hadith
    {
      id: 501,
      categoryId: 5,
      category: 'Hadith',
      question: 'Who compiled Sahih Bukhari?',
      options: [
        { id: 'A', text: 'Imam Muslim', isCorrect: false },
        { id: 'B', text: 'Imam Bukhari', isCorrect: true },
        { id: 'C', text: 'Imam Ahmad', isCorrect: false },
        { id: 'D', text: 'Imam Tirmidhi', isCorrect: false },
      ],
      timeLimit: 45,
      points: 10,
    },
    {
      id: 502,
      categoryId: 5,
      category: 'Hadith',
      question: 'What are the six major Hadith collections called?',
      options: [
        { id: 'A', text: 'Sahih Sittah', isCorrect: false },
        { id: 'B', text: 'Kutub al-Sittah', isCorrect: true },
        { id: 'C', text: 'Al-Muwatta', isCorrect: false },
        { id: 'D', text: 'Musnad', isCorrect: false },
      ],
      timeLimit: 45,
      points: 10,
    },
    {
      id: 503,
      categoryId: 5,
      category: 'Hadith',
      question: 'What is a Hadith Qudsi?',
      options: [
        { id: 'A', text: 'A Hadith narrated by the Prophet\'s companions', isCorrect: false },
        { id: 'B', text: 'A Hadith where the Prophet relates words from Allah', isCorrect: true },
        { id: 'C', text: 'A weak Hadith', isCorrect: false },
        { id: 'D', text: 'A fabricated Hadith', isCorrect: false },
      ],
      timeLimit: 45,
      points: 10,
    },
    {
      id: 504,
      categoryId: 5,
      category: 'Hadith',
      question: 'What does "Isnad" mean in Hadith terminology?',
      options: [
        { id: 'A', text: 'The text of the Hadith', isCorrect: false },
        { id: 'B', text: 'The chain of narrators', isCorrect: true },
        { id: 'C', text: 'The reliability of the Hadith', isCorrect: false },
        { id: 'D', text: 'The book containing the Hadith', isCorrect: false },
      ],
      timeLimit: 45,
      points: 10,
    },
    {
      id: 505,
      categoryId: 5,
      category: 'Hadith',
      question: 'According to Hadith, what is the best deed in Islam?',
      options: [
        { id: 'A', text: 'Giving charity', isCorrect: false },
        { id: 'B', text: 'Prayer at its proper time', isCorrect: true },
        { id: 'C', text: 'Fasting', isCorrect: false },
        { id: 'D', text: 'Hajj', isCorrect: false },
      ],
      timeLimit: 45,
      points: 10,
    },
  ],
  6: [
    // Seerah & Muhammad
    {
      id: 601,
      categoryId: 6,
      category: 'Seerah & Muhammad',
      question: 'In which year was Prophet Muhammad (PBUH) born?',
      options: [
        { id: 'A', text: 'Year of the Elephant (570 CE)', isCorrect: true },
        { id: 'B', text: '580 CE', isCorrect: false },
        { id: 'C', text: '560 CE', isCorrect: false },
        { id: 'D', text: '590 CE', isCorrect: false },
      ],
      timeLimit: 45,
      points: 10,
    },
    {
      id: 602,
      categoryId: 6,
      category: 'Seerah & Muhammad',
      question: 'Who was the first wife of Prophet Muhammad (PBUH)?',
      options: [
        { id: 'A', text: 'Aisha (RA)', isCorrect: false },
        { id: 'B', text: 'Khadijah (RA)', isCorrect: true },
        { id: 'C', text: 'Hafsa (RA)', isCorrect: false },
        { id: 'D', text: 'Zaynab (RA)', isCorrect: false },
      ],
      timeLimit: 45,
      points: 10,
    },
    {
      id: 603,
      categoryId: 6,
      category: 'Seerah & Muhammad',
      question: 'At what age did Prophet Muhammad (PBUH) receive his first revelation?',
      options: [
        { id: 'A', text: '35 years', isCorrect: false },
        { id: 'B', text: '40 years', isCorrect: true },
        { id: 'C', text: '45 years', isCorrect: false },
        { id: 'D', text: '30 years', isCorrect: false },
      ],
      timeLimit: 45,
      points: 10,
    },
    {
      id: 604,
      categoryId: 6,
      category: 'Seerah & Muhammad',
      question: 'What was the name of the cave where Prophet Muhammad (PBUH) received the first revelation?',
      options: [
        { id: 'A', text: 'Cave of Thawr', isCorrect: false },
        { id: 'B', text: 'Cave of Hira', isCorrect: true },
        { id: 'C', text: 'Cave of Uhud', isCorrect: false },
        { id: 'D', text: 'Cave of Badr', isCorrect: false },
      ],
      timeLimit: 45,
      points: 10,
    },
    {
      id: 605,
      categoryId: 6,
      category: 'Seerah & Muhammad',
      question: 'Which battle is known as the "Battle of the Trench"?',
      options: [
        { id: 'A', text: 'Battle of Badr', isCorrect: false },
        { id: 'B', text: 'Battle of Uhud', isCorrect: false },
        { id: 'C', text: 'Battle of Khandaq', isCorrect: true },
        { id: 'D', text: 'Battle of Hunayn', isCorrect: false },
      ],
      timeLimit: 45,
      points: 10,
    },
  ],
};

class QuizService {
  private attemptId: number | null = null;
  private quizId: number | null = null;
  private currentQuestions: QuizQuestion[] = []; // Store questions for fallback calculation

  /**
   * Fetch quiz questions and start attempt
   * Step 1: GET /api/quizzes/:id (get quiz details + questions)
   * Step 2: GET /api/quizzes/:id/start (create attempt)
   */
  async getQuizQuestions(quizId: number): Promise<QuizQuestion[]> {
    try {
      console.log(`🎯 Loading quiz ID: ${quizId}`);
      this.quizId = quizId;

      // Step 1: Get quiz details with questions
      const quizDetails = await apiService.getQuizById(quizId);
      console.log('📥 Received quiz details:', quizDetails);

      if (!quizDetails || !quizDetails.questions || !Array.isArray(quizDetails.questions)) {
        console.warn('⚠️ Invalid response format, no questions array found');
        throw new Error('Invalid response format');
      }

      // Step 2: Start quiz attempt (creates attempt record)
      try {
        const startResponse = await apiService.startQuiz(quizId);
        console.log('📥 Quiz attempt started:', startResponse);

        if (startResponse && startResponse.attemptId) {
          this.attemptId = startResponse.attemptId;
          console.log('✅ Quiz attempt ID:', this.attemptId);
        }
      } catch (startError) {
        console.warn('⚠️ Could not start quiz attempt (may need auth):', startError);
        // Continue anyway with questions, user can still practice
      }

      // Transform backend format to app format
      // Backend: { id, question_text, option_a, option_b, option_c, option_d, correct_answer }
      const questions: QuizQuestion[] = quizDetails.questions.map((q: any, index: number) => {
        const options = [
          { id: 'A', text: q.option_a || '', isCorrect: q.correct_answer === 'A' },
          { id: 'B', text: q.option_b || '', isCorrect: q.correct_answer === 'B' },
          { id: 'C', text: q.option_c || '', isCorrect: q.correct_answer === 'C' },
          { id: 'D', text: q.option_d || '', isCorrect: q.correct_answer === 'D' },
        ].filter(opt => opt.text); // Remove empty options

        return {
          id: q.id,
          categoryId: quizId,
          category: quizDetails.quiz?.category || 'Quiz',
          question: q.question_text,
          options: options,
          timeLimit: quizDetails.quiz?.time_limit ? quizDetails.quiz.time_limit * 60 : 900, // Convert minutes to seconds
          points: 10, // Default points
        };
      });

      console.log(`✅ Loaded ${questions.length} questions from backend`);

      // Store questions for potential fallback calculation
      this.currentQuestions = questions;

      return questions;
    } catch (error) {
      console.warn('⚠️ Backend API not available, using mock data');
      console.warn('Error details:', error);

      // Fallback to mock data if API fails
      const questions = MOCK_QUIZ_QUESTIONS[quizId] || [];
      console.log(`📚 Using ${questions.length} mock questions for quiz ${quizId}`);

      // Store questions for potential fallback calculation
      this.currentQuestions = questions;

      return questions;
    }
  }

  /**
   * Get the current attempt ID
   */
  getAttemptId(): number | null {
    return this.attemptId;
  }

  /**
   * Get the current quiz ID
   */
  getQuizId(): number | null {
    return this.quizId;
  }

  /**
   * Submit quiz answers and get results with review
   * Step 1: POST /api/quizzes/:id/submit - Get score
   * Step 2: GET /api/quizzes/attempts/:attemptId/review - Get detailed review
   */
  async submitQuizAnswers(submission: ApiQuizSubmission): Promise<QuizResult> {
    try {
      const quizId = this.quizId || submission.categoryId;
      const attemptId = this.attemptId;

      console.log(`📤 Submitting quiz answers for quiz ID: ${quizId}`);
      console.log(`📊 Attempt ID: ${attemptId}`);
      console.log(`📊 Total answers: ${submission.answers.length}`);

      // Check if we have attemptId
      if (!attemptId) {
        console.warn('⚠️ No attemptId available, calculating results locally');
        throw new Error('No attemptId available');
      }

      // Calculate total time taken
      const totalTimeTaken = submission.answers.reduce((sum, a) => sum + (a.timeTaken || 0), 0);
      const minutes = Math.floor(totalTimeTaken / 60);
      const seconds = totalTimeTaken % 60;
      const timeTakenFormatted = `${minutes}m ${seconds}s`;

      // Transform app format to backend format
      // Only send answers that were actually selected (not skipped)
      const apiAnswers = submission.answers
        .filter((answer) => answer.selectedOptionId !== null)
        .map((answer) => ({
          questionId: answer.questionId,
          selectedAnswer: answer.selectedOptionId, // "A", "B", "C", or "D"
        }));

      console.log('📤 Sending answers to backend...');

      // Step 1: Submit to backend API to get score
      const submitResponse = await apiService.submitQuiz(quizId, attemptId, apiAnswers);
      console.log('📥 Received quiz result from backend:', submitResponse);

      if (!submitResponse || !submitResponse.result) {
        throw new Error('Invalid response from backend');
      }

      const result = submitResponse.result;

      // Step 2: Fetch detailed review from backend
      console.log('📥 Fetching review data from backend...');
      let reviewData = null;
      try {
        reviewData = await apiService.reviewQuizAttempt(attemptId);
        console.log('✅ Received review data:', reviewData);
      } catch (reviewError) {
        console.warn('⚠️ Could not fetch review data:', reviewError);
      }

      // Transform backend review data to app format
      let questions: QuizQuestion[] = [];
      let userAnswers: UserAnswer[] = [];

      if (reviewData && reviewData.questions && Array.isArray(reviewData.questions)) {
        // Backend review format: { question_text, your_answer, correct_answer, is_correct, explanation }
        questions = reviewData.questions.map((q: any, index: number) => {
          const options = [
            { id: 'A', text: q.option_a || '', isCorrect: q.correct_answer === 'A' },
            { id: 'B', text: q.option_b || '', isCorrect: q.correct_answer === 'B' },
            { id: 'C', text: q.option_c || '', isCorrect: q.correct_answer === 'C' },
            { id: 'D', text: q.option_d || '', isCorrect: q.correct_answer === 'D' },
          ].filter(opt => opt.text);

          return {
            id: q.question_id || index + 1,
            categoryId: quizId,
            category: 'Quiz',
            question: q.question_text,
            options: options,
            timeLimit: 45,
            points: 10,
          };
        });

        userAnswers = reviewData.questions.map((q: any, index: number) => {
          const submittedAnswer = submission.answers.find(a => a.questionId === (q.question_id || index + 1));
          return {
            questionId: q.question_id || index + 1,
            selectedOptionId: q.your_answer || submittedAnswer?.selectedOptionId || null,
            isCorrect: q.is_correct || false,
            timeTaken: submittedAnswer?.timeTaken || 0,
            skipped: !q.your_answer,
          };
        });
      } else {
        // Fallback: use submission data with stored questions
        // Create userAnswers for ALL questions (including unanswered ones)
        questions = this.currentQuestions;

        userAnswers = questions.map((question) => {
          const submittedAnswer = submission.answers.find(a => a.questionId === question.id);

          if (submittedAnswer) {
            // Question was answered
            return {
              questionId: submittedAnswer.questionId,
              selectedOptionId: submittedAnswer.selectedOptionId,
              isCorrect: false, // Can't determine without review
              timeTaken: submittedAnswer.timeTaken,
              skipped: !submittedAnswer.selectedOptionId,
            };
          } else {
            // Question was NOT answered - mark as skipped
            return {
              questionId: question.id,
              selectedOptionId: null,
              isCorrect: false,
              timeTaken: 0,
              skipped: true,
            };
          }
        });
      }

      // Create complete quiz result
      const quizResult: QuizResult = {
        sessionId: attemptId.toString(),
        category: 'Quiz',
        totalQuestions: result.totalQuestions,
        correctAnswers: result.correctAnswers,
        wrongAnswers: result.totalQuestions - result.correctAnswers,
        skipped: userAnswers.filter(a => a.skipped).length,
        attempted: userAnswers.filter(a => !a.skipped).length,
        totalScore: result.totalQuestions * 10,
        quizScore: result.score,
        percentage: Math.round((result.correctAnswers / result.totalQuestions) * 100),
        timeTaken: timeTakenFormatted,
        timeRemaining: '0m 0s',
        questions: questions,
        userAnswers: userAnswers,
      };

      console.log(`✅ Quiz submitted successfully! Score: ${quizResult.percentage}%`);
      console.log(`✅ Result: ${result.passed ? 'PASSED ✓' : 'FAILED ✗'}`);
      console.log(`⏱️ Time taken: ${timeTakenFormatted}`);

      return quizResult;
    } catch (error) {
      console.warn('⚠️ Backend API not available, calculating results locally');
      console.warn('Error details:', error);

      // Fallback to local calculation using stored questions
      // Use currentQuestions (which were loaded earlier) instead of MOCK_QUIZ_QUESTIONS
      const questions = this.currentQuestions.length > 0
        ? this.currentQuestions
        : (MOCK_QUIZ_QUESTIONS[submission.categoryId] || []);

      console.log(`🔢 Calculating results locally for ${questions.length} questions`);

      if (questions.length === 0) {
        console.error('❌ No questions available for local calculation!');
        throw new Error('No questions available to calculate results');
      }

      return this.calculateResults(questions, submission);
    }
  }

  /**
   * Calculate quiz results locally
   * This will be handled by the backend API
   */
  private calculateResults(
    questions: QuizQuestion[],
    submission: ApiQuizSubmission
  ): QuizResult {
    // Create userAnswers for ALL questions (including unanswered ones)
    const userAnswers: UserAnswer[] = questions.map((question) => {
      // Find if user answered this question
      const answer = submission.answers.find((a) => a.questionId === question.id);

      if (answer) {
        // Question was answered
        const selectedOption = question.options.find(
          (opt) => opt.id === answer.selectedOptionId
        );

        return {
          questionId: answer.questionId,
          selectedOptionId: answer.selectedOptionId,
          isCorrect: selectedOption?.isCorrect || false,
          timeTaken: answer.timeTaken,
          skipped: answer.selectedOptionId === null,
        };
      } else {
        // Question was NOT answered - mark as skipped
        return {
          questionId: question.id,
          selectedOptionId: null,
          isCorrect: false,
          timeTaken: 0,
          skipped: true,
        };
      }
    });

    const correctAnswers = userAnswers.filter((a) => a.isCorrect).length;
    const wrongAnswers = userAnswers.filter((a) => !a.isCorrect && !a.skipped).length;
    const skipped = userAnswers.filter((a) => a.skipped).length;
    const attempted = userAnswers.filter((a) => !a.skipped).length;

    const totalScore = questions.reduce((sum, q) => sum + q.points, 0);
    const quizScore = userAnswers
      .filter((a) => a.isCorrect)
      .reduce((sum, a) => {
        const question = questions.find((q) => q.id === a.questionId);
        return sum + (question?.points || 0);
      }, 0);

    const percentage = totalScore > 0 ? Math.round((quizScore / totalScore) * 100) : 0;

    const totalTimeTaken = userAnswers.reduce((sum, a) => sum + a.timeTaken, 0);
    const totalTimeLimit = questions.reduce((sum, q) => sum + q.timeLimit, 0);
    const timeRemaining = Math.max(0, totalTimeLimit - totalTimeTaken);

    return {
      sessionId: submission.sessionId,
      category: questions[0]?.category || '',
      totalQuestions: questions.length,
      correctAnswers,
      wrongAnswers,
      skipped,
      attempted,
      totalScore,
      quizScore,
      percentage,
      timeTaken: this.formatTime(totalTimeTaken),
      timeRemaining: this.formatTime(timeRemaining),
      questions,
      userAnswers,
    };
  }

  /**
   * Format time in seconds to MM:SS format
   */
  private formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  }

  /**
   * Transform API response to local format
   * Use this when integrating with actual API
   */
  private transformApiQuestions(apiQuestions: any[]): QuizQuestion[] {
    return apiQuestions.map((q) => ({
      id: q.id,
      categoryId: q.categoryId,
      category: q.categoryName || '',
      question: q.questionText,
      options: q.options,
      timeLimit: q.timeLimit || 45,
      points: q.points || 10,
    }));
  }
}

export default new QuizService();
