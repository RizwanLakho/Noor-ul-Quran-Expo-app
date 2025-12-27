/**
 * API Service
 * Handles all HTTP requests to the backend API
 */

import { API_CONFIG, API_ENDPOINTS } from '../config/api.config';

// Response Types
export interface Surah {
  id: number;
  number: number;
  name: string;
  englishName: string;
  englishNameTranslation: string;
  revelationType: 'Meccan' | 'Medinan';
  numberOfAyahs: number;
}

export interface Ayah {
  id: number;
  number: number;
  text: string;
  numberInSurah: number;
  juz: number;
  manzil: number;
  page: number;
  ruku: number;
  hizbQuarter: number;
  sajda?: boolean;
  translation?: string;
  tafseer?: string;
}

export interface SurahWithAyahs extends Surah {
  ayahs: Ayah[];
}

export interface JuzInfo {
  id: number;
  number: number;
  surahs: {
    surahNumber: number;
    surahName: string;
    fromAyah: number;
    toAyah: number;
  }[];
}

export interface ManzilInfo {
  id: number;
  number: number;
  fromSurah: number;
  fromAyah: number;
  toSurah: number;
  toAyah: number;
}

export interface PageInfo {
  id: number;
  number: number;
  ayahs: Ayah[];
}

export interface QuizCategory {
  id: number;
  name: string;
  description: string;
  questionsCount: number;
}

export interface QuizQuestion {
  id: number;
  categoryId: number;
  category: string;
  question: string;
  options: {
    id: number;
    text: string;
  }[];
  timeLimit: number;
  points: number;
  correctOptionId?: number; // Only present after submission
}

export interface QuizResult {
  quizId: number;
  categoryName: string;
  totalQuestions: number;
  answeredQuestions: number;
  correctAnswers: number;
  wrongAnswers: number;
  skippedQuestions: number;
  totalPoints: number;
  earnedPoints: number;
  percentage: number;
  timeTaken: number;
  detailedResults: {
    questionId: number;
    question: string;
    selectedOptionId: number | null;
    correctOptionId: number;
    isCorrect: boolean;
    isSkipped: boolean;
    timeTaken: number;
    pointsEarned: number;
  }[];
}

export interface UserProfile {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  emailVerified?: boolean;
  email_verified?: boolean;
  profilePicture?: string;
  profile_picture?: string;
  provider?: 'email' | 'google' | 'facebook';
  createdAt?: string;
  created_at?: string;
  lastLogin?: string;
  last_login?: string;
}

export interface ApiError {
  message: string;
  status?: number;
  details?: any;
}

class ApiService {
  private baseURL: string;
  private headers: Record<string, string>;
  private authToken: string | null = null;

  constructor() {
    this.baseURL = API_CONFIG.BASE_URL;
    this.headers = API_CONFIG.HEADERS;
  }

  /**
   * Set authentication token
   */
  setAuthToken(token: string) {
    this.authToken = token;
  }

  /**
   * Clear authentication token
   */
  clearAuthToken() {
    this.authToken = null;
  }

  /**
   * Get headers with auth token if available
   */
  private getHeaders(): Record<string, string> {
    const headers = { ...this.headers };
    if (this.authToken) {
      headers['Authorization'] = `Bearer ${this.authToken}`;
    }
    return headers;
  }

  /**
   * Generic fetch wrapper with error handling
   */
  private async fetch<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    try {
      const url = `${this.baseURL}${endpoint}`;

      // Create AbortController for timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.TIMEOUT);

      const response = await fetch(url, {
        ...options,
        headers: {
          ...this.getHeaders(),
          ...options.headers,
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw {
          message: errorData?.message || `HTTP ${response.status}: ${response.statusText}`,
          status: response.status,
          details: errorData,
        } as ApiError;
      }

      const data = await response.json();
      return data;
    } catch (error: any) {
      if (error.name === 'AbortError') {
        throw {
          message: 'Request timeout. Please try again.',
          details: error,
        } as ApiError;
      }
      if (error.message === 'Network request failed') {
        throw {
          message: 'Network error. Please check your connection.',
          details: error,
        } as ApiError;
      }
      throw error;
    }
  }

  // ==================== QURAN ENDPOINTS ====================

  /**
   * Get all surahs
   */
  async getSurahs(page: number = 1, limit: number = 114): Promise<{ surahs: Surah[]; total: number }> {
    return this.fetch(`${API_ENDPOINTS.QURAN.SURAHS}?page=${page}&limit=${limit}`);
  }

  /**
   * Get surah by ID with ayahs and translations
   */
  async getSurahById(
    id: number,
    translatorName: string = '',
    translatorLanguage: string = ''
  ): Promise<SurahWithAyahs> {
    try {
      // Fetch Arabic text and surah metadata
      const arabicData = await this.fetch(API_ENDPOINTS.QURAN.SURAH_BY_ID(id));

      // If no translator selected, return just Arabic
      if (!translatorName || !translatorLanguage) {
        console.log('📖 No translator selected, returning Arabic only');
        return arabicData;
      }

      // Fetch translations
      try {
        const translationData = await this.fetch(
          `/translations/${encodeURIComponent(translatorName)}/${translatorLanguage}?surah=${id}`
        );

        // Merge Arabic and translations
        if (translationData && translationData.ayahs) {
          arabicData.ayahs = arabicData.ayahs.map((ayah: any) => {
            const translation = translationData.ayahs.find((t: any) => t.aya === ayah.aya);
            return {
              ...ayah,
              translation: translation?.text || null,
            };
          });
          console.log(`✅ Loaded ${translatorName} (${translatorLanguage}) translations for Surah ${id}`);
        }
      } catch (err) {
        console.log('⚠️ Translation not found, using Arabic only:', err);
      }

      return arabicData;
    } catch (error) {
      console.error('❌ Error fetching surah:', error);
      throw error;
    }
  }

  /**
   * Get ayah by ID
   */
  async getAyahById(id: number): Promise<Ayah> {
    return this.fetch(API_ENDPOINTS.QURAN.AYAH_BY_ID(id));
  }

  /**
   * Get ayah translations
   */
  async getAyahTranslations(id: number, translatorId?: number): Promise<any> {
    const endpoint = translatorId
      ? `${API_ENDPOINTS.QURAN.AYAH_TRANSLATIONS(id)}?translator_id=${translatorId}`
      : API_ENDPOINTS.QURAN.AYAH_TRANSLATIONS(id);
    return this.fetch(endpoint);
  }

  /**
   * Get ayah tafseer
   */
  async getAyahTafseer(id: number, mufassirId?: number): Promise<any> {
    const endpoint = mufassirId
      ? `${API_ENDPOINTS.QURAN.AYAH_TAFSEER(id)}?mufassir_id=${mufassirId}`
      : API_ENDPOINTS.QURAN.AYAH_TAFSEER(id);
    return this.fetch(endpoint);
  }

  /**
   * Get word-by-word data for a specific ayah
   */
  async getAyahWords(surahNumber: number, ayahNumber: number): Promise<any> {
    return this.fetch(`/word-by-word/${surahNumber}/${ayahNumber}`);
  }

  /**
   * Get word-by-word data for entire surah
   */
  async getSurahWords(surahNumber: number): Promise<any> {
    return this.fetch(`/word-by-word/surah/${surahNumber}`);
  }

  /**
   * Get word translations for a specific word
   */
  async getWordTranslations(wordId: number, language?: string): Promise<any> {
    const url = language
      ? `/word-by-word/word/${wordId}/translations?language=${language}`
      : `/word-by-word/word/${wordId}/translations`;
    return this.fetch(url);
  }

  /**
   * Get word-by-word statistics
   */
  async getWordByWordStats(): Promise<any> {
    return this.fetch('/word-by-word/stats');
  }

  /**
   * Get translations by translator name for a specific surah
   * @param translatorName - Name of the translator (e.g., "Ahmed Ali", "Sahih International")
   * @param language - Language code (e.g., "en", "ar", "ur")
   * @param surahNumber - Surah number (1-114)
   */
  async getTranslationsBySurah(
    translatorName: string,
    language: string,
    surahNumber: number
  ): Promise<any> {
    return this.fetch(API_ENDPOINTS.QURAN.TRANSLATIONS_BY_NAME(translatorName, language, surahNumber));
  }

  /**
   * Get Hizb Quarters (240 divisions)
   */
  async getHizbQuarters(): Promise<any[]> {
    return this.fetch(API_ENDPOINTS.QURAN.HIZB_QUARTERS);
  }

  /**
   * Get Manzils (7 weekly sections)
   */
  async getManzils(): Promise<ManzilInfo[]> {
    return this.fetch(API_ENDPOINTS.QURAN.MANZILS);
  }

  /**
   * Get Rukus (556 sections)
   */
  async getRukus(): Promise<any[]> {
    return this.fetch(API_ENDPOINTS.QURAN.RUKUS);
  }

  /**
   * Get Pages (604 Madani Mushaf pages)
   */
  async getPages(): Promise<PageInfo[]> {
    return this.fetch(API_ENDPOINTS.QURAN.PAGES);
  }

  /**
   * Get Sajdas
   */
  async getSajdas(): Promise<any[]> {
    return this.fetch(API_ENDPOINTS.QURAN.SAJDAS);
  }

  /**
   * Get Quran metadata statistics
   */
  async getMetadataStats(): Promise<any> {
    return this.fetch(API_ENDPOINTS.QURAN.METADATA_STATS);
  }

  /**
   * Get all Juz (30 sections)
   */
  async getAllJuz(): Promise<any> {
    return this.fetch(API_ENDPOINTS.JUZ.ALL);
  }

  /**
   * Get specific Juz with ayahs
   */
  async getJuzById(juzNumber: number): Promise<any> {
    return this.fetch(API_ENDPOINTS.JUZ.BY_ID(juzNumber));
  }

  /**
   * Get Juz with translation
   */
  async getJuzWithTranslation(juzNumber: number, translator?: string, language?: string): Promise<any> {
    let url = API_ENDPOINTS.JUZ.WITH_TRANSLATION(juzNumber);
    if (translator && language) {
      url += `?translator=${encodeURIComponent(translator)}&language=${language}`;
    }
    return this.fetch(url);
  }

  /**
   * Get random ayah for daily verse
   */
  async getRandomAyah(): Promise<any> {
    return this.fetch(API_ENDPOINTS.QURAN.RANDOM_AYAH);
  }

  /**
   * Get surah with translations
   * Endpoint: GET /api/translations/:translator/:language?surah=:surahNumber
   */
  async getSurahTranslations(surahNumber: number, translator: string = 'Ahmed Ali', language: string = 'en'): Promise<any> {
    const url = `/translations/${encodeURIComponent(translator)}/${language}?surah=${surahNumber}`;
    return this.fetch(url);
  }

  // ==================== QUIZ ENDPOINTS ====================

  /**
   * 1️⃣ Get all quizzes (Browse Quizzes)
   * Endpoint: GET /api/quizzes/
   * Auth: Optional
   * Response: { success: true, total: 5, quizzes: [...] }
   */
  async getAllQuizzes(): Promise<any[]> {
    try {
      const response = await this.fetch(API_ENDPOINTS.QUIZ.ALL);

      // Backend returns: { success: true, total: X, quizzes: [...] }
      if (response && response.quizzes && Array.isArray(response.quizzes)) {
        return response.quizzes;
      }

      // Fallback formats
      if (Array.isArray(response)) {
        return response;
      }

      if (response && response.data && Array.isArray(response.data)) {
        return response.data;
      }

      console.warn('Unexpected quizzes response format:', response);
      return [];
    } catch (error) {
      console.error('Failed to fetch quizzes:', error);
      throw error;
    }
  }

  /**
   * 2️⃣ Get quiz by ID (Quiz Detail Page)
   * Endpoint: GET /api/quizzes/:id
   * Auth: Optional
   * Response: { success: true, quiz: {...}, questions: [...] }
   */
  async getQuizById(id: number): Promise<any> {
    const response = await this.fetch(API_ENDPOINTS.QUIZ.BY_ID(id));
    return response;
  }

  /**
   * 3️⃣ Start a quiz attempt
   * Endpoint: GET /api/quizzes/:id/start (requires auth)
   * Response: { success: true, attemptId: 523, message: "Quiz started" }
   */
  async startQuiz(quizId: number): Promise<{ success: boolean; attemptId: number; message?: string }> {
    return this.fetch(API_ENDPOINTS.QUIZ.START(quizId), {
      method: 'GET',
    });
  }

  /**
   * 4️⃣ Submit quiz answers
   * Endpoint: POST /api/quizzes/:id/submit (requires auth)
   * Body: { attemptId: 523, answers: [{questionId, selectedAnswer}] }
   * Response: { success: true, result: {score, passed, correctAnswers, totalQuestions} }
   */
  async submitQuiz(
    quizId: number,
    attemptId: number,
    answers: { questionId: number; selectedAnswer: string }[]
  ): Promise<{
    success: boolean;
    result: {
      score: number;
      passed: boolean;
      correctAnswers: number;
      totalQuestions: number;
    };
  }> {
    return this.fetch(API_ENDPOINTS.QUIZ.SUBMIT(quizId), {
      method: 'POST',
      body: JSON.stringify({ attemptId, answers }),
    });
  }

  /**
   * 5️⃣ Get my quiz attempts
   * Endpoint: GET /api/quizzes/my/attempts (requires auth)
   * Response: { success: true, attempts: [...] }
   */
  async getMyQuizAttempts(): Promise<any[]> {
    const response = await this.fetch(API_ENDPOINTS.QUIZ.MY_ATTEMPTS);
    return response.attempts || [];
  }

  /**
   * 6️⃣ Review quiz attempt
   * Endpoint: GET /api/quizzes/attempts/:attemptId/review (requires auth)
   * Response: { success: true, attempt: {...}, questions: [...] }
   */
  async reviewQuizAttempt(attemptId: number): Promise<any> {
    return this.fetch(API_ENDPOINTS.QUIZ.REVIEW(attemptId));
  }

  /**
   * 7️⃣ Get attempt result
   * Endpoint: GET /api/quizzes/attempts/:attemptId (requires auth)
   */
  async getAttemptResult(attemptId: number): Promise<any> {
    return this.fetch(API_ENDPOINTS.QUIZ.ATTEMPT_RESULT(attemptId));
  }

  /**
   * 8️⃣ Get quiz categories
   * Endpoint: GET /api/quizzes/meta/categories
   * Auth: Not required
   */
  async getQuizCategories(): Promise<any[]> {
    try {
      const response = await this.fetch(API_ENDPOINTS.QUIZ.CATEGORIES);

      // Handle different response formats
      if (Array.isArray(response)) {
        return response;
      }

      if (response && response.categories && Array.isArray(response.categories)) {
        return response.categories;
      }

      if (response && response.data && Array.isArray(response.data)) {
        return response.data;
      }

      console.warn('Unexpected categories response format:', response);
      return [];
    } catch (error) {
      console.error('Failed to fetch quiz categories:', error);
      throw error;
    }
  }

  // ==================== TOPICS ENDPOINTS ====================

  /**
   * Get all topics
   * Endpoint: GET /api/topics
   */
  async getAllTopics(): Promise<any[]> {
    try {
      const response = await this.fetch(API_ENDPOINTS.TOPICS.ALL);

      if (response && response.topics && Array.isArray(response.topics)) {
        return response.topics;
      }

      if (Array.isArray(response)) {
        return response;
      }

      console.warn('Unexpected topics response format:', response);
      return [];
    } catch (error) {
      console.error('Failed to fetch topics:', error);
      throw error;
    }
  }

  /**
   * Get topic by ID with ayahs and hadiths
   * Endpoint: GET /api/topics/:id?translator=<name>
   */
  async getTopicById(id: number, translator?: string): Promise<any> {
    try {
      const queryParam = translator ? `?translator=${encodeURIComponent(translator)}` : '';
      const response = await this.fetch(`${API_ENDPOINTS.TOPICS.BY_ID(id)}${queryParam}`);
      return response;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get topic progress for current user
   * Endpoint: GET /api/topics/:topicId/progress
   */
  async getTopicProgress(topicId: number): Promise<any> {
    try {
      const response = await this.fetch(`/topics/${topicId}/progress`);
      return response.progress || null;
    } catch (error) {
      console.error(`Failed to fetch topic progress for ${topicId}:`, error);
      return null;
    }
  }

  /**
   * Save topic progress
   * Endpoint: POST /api/topics/:topicId/progress
   */
  async saveTopicProgress(
    topicId: number,
    data: {
      progressPercentage: number;
      completedItems?: number;
      totalItems?: number;
      ayahsRead?: number[];
      hadithRead?: number[];
      timeSpent?: number;
    }
  ): Promise<any> {
    try {
      const response = await this.fetch(`/topics/${topicId}/progress`, {
        method: 'POST',
        body: JSON.stringify(data),
      });
      return response;
    } catch (error) {
      console.error(`Failed to save topic progress for ${topicId}:`, error);
      throw error;
    }
  }

  /**
   * Get all topics progress for current user
   * Endpoint: GET /api/topics/progress/all
   */
  async getAllTopicsProgress(): Promise<any[]> {
    try {
      const response = await this.fetch('/topics/progress/all');
      return response.progress || [];
    } catch (error) {
      console.error('Failed to fetch all topics progress:', error);
      return [];
    }
  }

  /**
   * Delete/reset topic progress
   * Endpoint: DELETE /api/topics/:topicId/progress
   */
  async deleteTopicProgress(topicId: number): Promise<any> {
    try {
      const response = await this.fetch(`/topics/${topicId}/progress`, {
        method: 'DELETE',
      });
      return response;
    } catch (error) {
      console.error(`Failed to delete topic progress for ${topicId}:`, error);
      throw error;
    }
  }

  // ==================== USER ENDPOINTS ====================

  /**
   * Get user profile
   */
  async getUserProfile(): Promise<UserProfile> {
    return this.fetch(API_ENDPOINTS.USER.PROFILE);
  }

  /**
   * Update user profile (first_name, last_name)
   */
  async updateUserProfile(firstName: string, lastName: string): Promise<any> {
    return this.fetch('/users/me/profile', {
      method: 'PUT',
      body: JSON.stringify({ first_name: firstName, last_name: lastName }),
    });
  }

  /**
   * Upload profile picture
   */
  async uploadProfilePicture(formData: FormData): Promise<any> {
    const url = `${this.baseURL}/users/me/profile-picture`;

    const headers: Record<string, string> = {};
    if (this.authToken) {
      headers['Authorization'] = `Bearer ${this.authToken}`;
    }

    const response = await fetch(url, {
      method: 'POST',
      headers: headers,
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw {
        message: errorData.message || 'Failed to upload profile picture',
        status: response.status,
        details: errorData,
      };
    }

    return response.json();
  }

  /**
   * Update user email
   */
  async updateUserEmail(email: string): Promise<any> {
    return this.fetch('/users/me/email', {
      method: 'PUT',
      body: JSON.stringify({ email }),
    });
  }

  /**
   * Update user password
   */
  async updateUserPassword(currentPassword: string, newPassword: string): Promise<any> {
    return this.fetch('/users/me/password', {
      method: 'PUT',
      body: JSON.stringify({ currentPassword, newPassword }),
    });
  }

  /**
   * Delete user account
   */
  async deleteUserAccount(password: string): Promise<any> {
    return this.fetch('/users/me/account', {
      method: 'DELETE',
      body: JSON.stringify({ password }),
    });
  }

  /**
   * Deactivate user account
   */
  async deactivateUserAccount(password: string): Promise<any> {
    return this.fetch('/users/me/deactivate', {
      method: 'PUT',
      body: JSON.stringify({ password }),
    });
  }

  /**
   * Get user preferences
   */
  async getUserPreferences(): Promise<any> {
    return this.fetch(API_ENDPOINTS.USER.PREFERENCES);
  }

  /**
   * Update user preferences
   */
  async updateUserPreferences(preferences: any): Promise<any> {
    return this.fetch(API_ENDPOINTS.USER.UPDATE_PREFERENCES, {
      method: 'PUT',
      body: JSON.stringify(preferences),
    });
  }

  // ==================== AUTH ENDPOINTS ====================

  /**
   * Login
   */
  async login(email: string, password: string): Promise<{ token: string; user: UserProfile }> {
    const response = await this.fetch<{ success: boolean; message: string; data: { token: string; user: UserProfile } }>(API_ENDPOINTS.AUTH.LOGIN, {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    this.setAuthToken(response.data.token);
    return response.data;
  }

  /**
   * Register
   */
  async register(
    firstName: string,
    lastName: string,
    email: string,
    password: string
  ): Promise<{ token: string; user: UserProfile }> {
    const response = await this.fetch<{ success: boolean; message: string; data: { token: string; user: UserProfile } }>(API_ENDPOINTS.AUTH.REGISTER, {
      method: 'POST',
      body: JSON.stringify({
        first_name: firstName,
        last_name: lastName,
        email,
        password,
      }),
    });
    this.setAuthToken(response.data.token);
    return response.data;
  }

  /**
   * Refresh token
   */
  async refreshToken(): Promise<{ token: string }> {
    const response = await this.fetch<{ token: string }>(API_ENDPOINTS.AUTH.REFRESH, {
      method: 'POST',
    });
    this.setAuthToken(response.token);
    return response;
  }

  /**
   * Verify email with token
   */
  async verifyEmail(token: string): Promise<{ success: boolean; message: string }> {
    return this.fetch('/auth/verify-email', {
      method: 'POST',
      body: JSON.stringify({ token }),
    });
  }

  /**
   * Resend verification email
   */
  async resendVerification(email: string): Promise<{ success: boolean; message: string }> {
    return this.fetch('/auth/resend-verification', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }

  /**
   * Request password reset (Forgot Password)
   */
  async forgotPassword(email: string): Promise<{ success: boolean; message: string }> {
    return this.fetch('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }

  /**
   * Reset password with token
   */
  async resetPassword(token: string, newPassword: string, email?: string): Promise<{ success: boolean; message: string }> {
    return this.fetch('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ token, newPassword, email }),
    });
  }

  /**
   * Google OAuth authentication
   */
  async googleAuth(data: {
    idToken: string;
    email: string;
    firstName: string;
    lastName: string;
    profilePicture?: string;
  }): Promise<{ success: boolean; message: string; data: { user: UserProfile; token: string } }> {
    const response = await this.fetch('/auth/google', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    if (response.data?.token) {
      this.setAuthToken(response.data.token);
    }
    return response;
  }

  /**
   * Facebook OAuth authentication
   */
  async facebookAuth(data: {
    accessToken: string;
    email: string;
    firstName: string;
    lastName: string;
    profilePicture?: string;
  }): Promise<{ success: boolean; message: string; data: { user: UserProfile; token: string } }> {
    const response = await this.fetch('/auth/facebook', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    if (response.data?.token) {
      this.setAuthToken(response.data.token);
    }
    return response;
  }

  /**
   * Get current authenticated user
   */
  async getCurrentUser(): Promise<{ success: boolean; data: { user: UserProfile } }> {
    return this.fetch('/auth/me', {
      method: 'GET',
    });
  }

  // ==================== TRANSLATORS & MUFASSIREEN ====================

  /**
   * Get all translators
   */
  async getTranslators(): Promise<any[]> {
    return this.fetch(API_ENDPOINTS.TRANSLATORS);
  }

  /**
   * Get all mufassireen
   */
  async getMufassireen(): Promise<any[]> {
    return this.fetch(API_ENDPOINTS.MUFASSIREEN);
  }

  // ==================== SEARCH ====================

  /**
   * Search Quran
   */
  async searchQuran(
    query: string,
    options?: {
      translator_id?: number;
      types?: string[];
      page?: number;
      limit?: number;
    }
  ): Promise<any> {
    const params = new URLSearchParams({ q: query });
    if (options?.translator_id) {
      params.append('translator_id', options.translator_id.toString());
    }
    if (options?.types && options.types.length > 0) {
      params.append('types', options.types.join(','));
    }
    if (options?.page) {
      params.append('page', options.page.toString());
    }
    if (options?.limit) {
      params.append('limit', options.limit.toString());
    }
    // Use /quran/search endpoint (different from /search/quran)
    return this.fetch(`/quran/search?${params.toString()}`);
  }

  /**
   * Global search
   */
  async globalSearch(query: string): Promise<any> {
    return this.fetch(`${API_ENDPOINTS.SEARCH.GLOBAL}?q=${encodeURIComponent(query)}`);
  }

  /**
   * Get search suggestions
   */
  async getSearchSuggestions(query: string): Promise<{ suggestions: string[] }> {
    if (!query || query.length < 2) {
      return { suggestions: [] };
    }
    return this.fetch(`${API_ENDPOINTS.SEARCH.GLOBAL}/suggestions?q=${encodeURIComponent(query)}`);
  }

  // ==================== PROGRESS & ACHIEVEMENTS ====================

  /**
   * Get user progress
   */
  async getProgress(): Promise<any> {
    return this.fetch(API_ENDPOINTS.PROGRESS);
  }

  /**
   * Get bookmarks
   */
  async getBookmarks(): Promise<any> {
    return this.fetch(API_ENDPOINTS.BOOKMARKS);
  }

  /**
   * Add bookmark
   */
  async addBookmark(ayahId: number, note?: string): Promise<any> {
    return this.fetch(API_ENDPOINTS.BOOKMARKS, {
      method: 'POST',
      body: JSON.stringify({ ayah_id: ayahId, note }),
    });
  }

  /**
   * Delete bookmark
   */
  async deleteBookmark(bookmarkId: number): Promise<any> {
    return this.fetch(`${API_ENDPOINTS.BOOKMARKS}/${bookmarkId}`, {
      method: 'DELETE',
    });
  }

  /**
   * Get goals
   */
  async getGoals(): Promise<any> {
    return this.fetch(API_ENDPOINTS.GOALS);
  }

  /**
   * Get achievements
   */
  async getAchievements(): Promise<any> {
    return this.fetch(API_ENDPOINTS.ACHIEVEMENTS);
  }

  // ==================== USER STATS & ACTIVITY ====================

  /**
   * Get user statistics dashboard
   * GET /api/users/me/stats
   */
  async getUserStats(): Promise<{
    topics: {
      started: number;
      completed: number;
      avgCompletion: number;
    };
    quizzes: {
      totalAttempts: number;
      passed: number;
      avgScore: number;
      lastQuizDate: string | null;
    };
    engagement: {
      totalTimeSeconds: number;
      versesRecited: number;
      bookmarksCount: number;
      currentStreak: number;
    };
  }> {
    const response = await this.fetch('/users/me/stats');
    return response.data;
  }

  /**
   * Get user recent activity
   * GET /api/users/me/activity
   */
  async getUserActivity(limit: number = 10): Promise<any[]> {
    const response = await this.fetch(`/users/me/activity?limit=${limit}`);
    return response.data;
  }

  /**
   * Record Quran reading session
   * POST /api/progress/reading-session
   */
  async recordReadingSession(data: {
    type: 'surah' | 'juz' | 'topic';
    surah_number?: number;
    juz_number?: number;
    topic_id?: number;
    ayahs_read: number;
    time_spent_seconds: number;
    last_ayah_read?: number;
  }): Promise<{ success: boolean; message: string }> {
    return this.fetch('/progress/reading-session', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // ==================== DAILY GOALS ====================

  /**
   * Get user's active daily goals
   * GET /api/goals/daily
   */
  async getDailyGoals(): Promise<any[]> {
    const response = await this.fetch('/goals/daily');
    return response.data;
  }

  /**
   * Create a new daily goal
   * POST /api/goals
   */
  async createGoal(data: {
    title: string;
    description?: string;
    target_value?: number;
    goal_type: 'topic_read' | 'quiz_complete' | 'time_spent' | 'verses_read' | 'custom';
  }): Promise<any> {
    const response = await this.fetch('/goals', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return response.data;
  }

  /**
   * Update goal progress
   * PUT /api/goals/:id
   */
  async updateGoalProgress(
    goalId: number,
    data: { current_value?: number; completed?: boolean }
  ): Promise<any> {
    const response = await this.fetch(`/goals/${goalId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return response.data;
  }

  /**
   * Delete a goal
   * DELETE /api/goals/:id
   */
  async deleteGoal(goalId: number): Promise<any> {
    return this.fetch(`/goals/${goalId}`, {
      method: 'DELETE',
    });
  }

  // ==================== READING GOALS ENDPOINTS ====================

  /**
   * Get user's reading goals
   * GET /api/reading-goals
   */
  async getReadingGoals(): Promise<any> {
    return this.fetch('/reading-goals');
  }

  /**
   * Create a new reading goal
   * POST /api/reading-goals
   */
  async createReadingGoal(data: {
    title: string;
    description?: string;
    durationValue: number;
    durationUnit: 'days' | 'weeks' | 'months' | 'year';
    selectedSurahs?: { id: number; name: string }[];
    selectedJuz?: { id: number; name: string }[];
    selectedTopics?: { id: number; name: string }[];
  }): Promise<any> {
    return this.fetch('/reading-goals', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  /**
   * Update a reading goal
   * PUT /api/reading-goals/:id
   */
  async updateReadingGoal(
    goalId: string,
    data: {
      title: string;
      description?: string;
      durationValue: number;
      durationUnit: 'days' | 'weeks' | 'months' | 'year';
      selectedSurahs?: { id: number; name: string }[];
      selectedJuz?: { id: number; name: string }[];
      selectedTopics?: { id: number; name: string }[];
    }
  ): Promise<any> {
    return this.fetch(`/reading-goals/${goalId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  /**
   * Delete a reading goal
   * DELETE /api/reading-goals/:id
   */
  async deleteReadingGoal(goalId: string): Promise<any> {
    return this.fetch(`/reading-goals/${goalId}`, {
      method: 'DELETE',
    });
  }

  /**
   * Mark target as completed
   * POST /api/reading-goals/:id/complete
   */
  async markTargetCompleted(
    goalId: string,
    data: {
      type: 'surah' | 'juz' | 'topic';
      itemId: number;
    }
  ): Promise<any> {
    return this.fetch(`/reading-goals/${goalId}/complete`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // ==================== AYAH BOOKMARKS ENDPOINTS ====================

  /**
   * Get all user ayah bookmarks
   * GET /api/ayah-bookmarks
   */
  async getAyahBookmarks(): Promise<any> {
    try {
      const response = await this.fetch('/ayah-bookmarks');
      return response.bookmarks || [];
    } catch (error) {
      console.error('Failed to fetch ayah bookmarks:', error);
      throw error;
    }
  }

  /**
   * Add ayah bookmark
   * POST /api/ayah-bookmarks
   */
  async addAyahBookmark(bookmark: {
    surahNumber: number;
    ayahNumber: number;
    surahName: string;
    arabicText: string;
    translation: string;
  }): Promise<any> {
    try {
      const response = await this.fetch('/ayah-bookmarks', {
        method: 'POST',
        body: JSON.stringify(bookmark),
      });
      return response.bookmark;
    } catch (error) {
      console.error('Failed to add ayah bookmark:', error);
      throw error;
    }
  }

  /**
   * Remove ayah bookmark
   * DELETE /api/ayah-bookmarks/:id
   */
  async removeAyahBookmark(id: string): Promise<any> {
    try {
      return await this.fetch(`/ayah-bookmarks/${id}`, {
        method: 'DELETE',
      });
    } catch (error) {
      console.error('Failed to remove ayah bookmark:', error);
      throw error;
    }
  }

  /**
   * Check if ayah is bookmarked
   * GET /api/ayah-bookmarks/check/:surahNumber/:ayahNumber
   */
  async isAyahBookmarked(surahNumber: number, ayahNumber: number): Promise<boolean> {
    try {
      const response = await this.fetch(`/ayah-bookmarks/check/${surahNumber}/${ayahNumber}`);
      return response.isBookmarked || false;
    } catch (error) {
      console.error('Failed to check ayah bookmark:', error);
      return false;
    }
  }

  /**
   * Get user notifications
   * GET /api/notifications
   */
  async getNotifications(unreadOnly: boolean = false): Promise<any> {
    try {
      const query = unreadOnly ? '?unread_only=true' : '';
      const response = await this.fetch(`/notifications${query}`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
      throw error;
    }
  }

  /**
   * Mark notification as read
   * PUT /api/notifications/:id/read
   */
  async markNotificationAsRead(id: number): Promise<any> {
    try {
      const response = await this.fetch(`/notifications/${id}/read`, {
        method: 'PUT',
      });
      return response.data;
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
      throw error;
    }
  }

  /**
   * Mark all notifications as read
   * PUT /api/notifications/read-all
   */
  async markAllNotificationsAsRead(): Promise<any> {
    try {
      return await this.fetch('/notifications/read-all', {
        method: 'PUT',
      });
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
      throw error;
    }
  }

  /**
   * Delete notification
   * DELETE /api/notifications/:id
   */
  async deleteNotification(id: number): Promise<any> {
    try {
      return await this.fetch(`/notifications/${id}`, {
        method: 'DELETE',
      });
    } catch (error) {
      console.error('Failed to delete notification:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const apiService = new ApiService();
export default apiService;
