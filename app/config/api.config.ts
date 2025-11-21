/**
 * API Configuration
 *
 * 🔴 IMPORTANT: Choose the correct URL based on your device type!
 */

// ✅ For Android Emulator (Default)
// export const API_BASE_URL = 'http://10.0.2.2:5001/api';

// 📱 For Physical Android/iOS Device (Same WiFi network)
export const API_BASE_URL = 'http://192.168.1.181:5001/api';

// 🖥️ For iOS Simulator (Mac only)
// export const API_BASE_URL = 'http://localhost:5001/api';

// API Configuration Object
export const API_CONFIG = {
  BASE_URL: API_BASE_URL,
  TIMEOUT: 30000,
  HEADERS: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
};

// Log API configuration on load
console.log('🌐 API Base URL:', API_BASE_URL);

// API Endpoints
export const API_ENDPOINTS = {
  // Auth
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    REFRESH: '/auth/refresh-token',
  },

  // Quran
  QURAN: {
    SURAHS: '/quran/surahs',
    SURAH_BY_ID: (id: number) => `/quran/surahs/${id}`,
    AYAH_BY_ID: (id: number) => `/quran/ayahs/${id}`,
    AYAH_TRANSLATIONS: (id: number) => `/quran/ayahs/${id}/translations`,
    AYAH_TAFSEER: (id: number) => `/quran/ayahs/${id}/tafseer`,
    RANDOM_AYAH: '/quran/random',
    HIZB_QUARTERS: '/quran/hizb-quarters',
    MANZILS: '/quran/manzils',
    RUKUS: '/quran/rukus',
    PAGES: '/quran/pages',
    SAJDAS: '/quran/sajdas',
    METADATA_STATS: '/quran/metadata/stats',
    // Translations by translator name
    TRANSLATIONS_BY_NAME: (translatorName: string, language: string, surahNumber: number) =>
      `/translations/${encodeURIComponent(translatorName)}/${language}?surah=${surahNumber}`,
  },

  // Juz
  JUZ: {
    ALL: '/juz',
    BY_ID: (juzNumber: number) => `/juz/${juzNumber}`,
    WITH_TRANSLATION: (juzNumber: number) => `/juz/${juzNumber}/translation`,
    FIND_BY_AYAH: (surah: number, ayah: number) => `/juz/ayah/${surah}/${ayah}`,
  },

  // Quiz - User-facing endpoints (/api/quizzes)
  // Based on backend: routes/quizRoutes.js
  QUIZ: {
    // 1️⃣ Browse all quizzes (optional auth)
    ALL: '/quizzes',

    // 2️⃣ Get single quiz details + questions preview (optional auth)
    BY_ID: (id: number) => `/quizzes/${id}`,

    // 3️⃣ Start quiz attempt - creates attempt record (auth REQUIRED)
    START: (id: number) => `/quizzes/${id}/start`,

    // 4️⃣ Submit quiz answers and get score (auth REQUIRED)
    SUBMIT: (id: number) => `/quizzes/${id}/submit`,

    // 5️⃣ Get my quiz attempts (auth REQUIRED)
    MY_ATTEMPTS: '/quizzes/my/attempts',

    // 6️⃣ Review quiz with correct/wrong answers (auth REQUIRED)
    REVIEW: (attemptId: number) => `/quizzes/attempts/${attemptId}/review`,

    // 7️⃣ Get single attempt result (auth REQUIRED)
    ATTEMPT_RESULT: (attemptId: number) => `/quizzes/attempts/${attemptId}`,

    // 8️⃣ Get quiz categories for filtering (no auth)
    CATEGORIES: '/quizzes/meta/categories',
  },

  // Topics
  TOPICS: {
    ALL: '/topics',
    BY_ID: (id: number) => `/topics/${id}`,
    BY_CATEGORY: (category: string) => `/topics/category/${category}`,
  },

  // User
  USER: {
    PROFILE: '/users/me/profile',
    PREFERENCES: '/user/preferences',
    UPDATE_PROFILE: '/users/me/profile',
    UPDATE_PREFERENCES: '/user/preferences',
  },

  // Progress & Achievements
  PROGRESS: '/progress',
  BOOKMARKS: '/bookmarks',
  GOALS: '/goals',
  ACHIEVEMENTS: '/achievements',

  // Translations
  TRANSLATIONS: {
    LIST: '/translations',
    SURAH: (surahNumber: number) => `/translations/surah/${surahNumber}`,
  },

  // Translators & Mufassireen
  TRANSLATORS: '/translations',
  MUFASSIREEN: '/mufassireen',

  // Search
  SEARCH: {
    QURAN: '/search/quran',
    GLOBAL: '/search',
    SUGGESTIONS: '/search/suggestions',
  },

  // Notifications
  NOTIFICATIONS: '/notifications',
};
