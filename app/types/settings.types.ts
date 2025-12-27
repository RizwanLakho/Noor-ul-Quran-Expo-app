// Settings Types

export type ThemeMode = 'light' | 'dark' | 'auto';
export type AppLanguage = 'en' | 'ur';

export interface QuranAppearanceSettings {
  textSize: number; // 9-18 (Arabic text size)
  translationTextSize: number; // 9-18 (Translation text size)
  textColor: string;
  translationEnabled: boolean;
  arabicTextEnabled: boolean; // Show/hide Arabic verses
  wordByWordEnabled: boolean; // Show word-by-word Arabic
  arabicFont: 'quranic' | 'uthman';
  selectedTranslatorName: string; // Name of selected translator
  selectedTranslatorLanguage: string; // Language of selected translator (en, ur, etc)
  selectedReciter: string; // Reciter folder name for audio (e.g., 'Alafasy_128kbps')
}

export interface AppSettings {
  theme: ThemeMode;
  language: AppLanguage;
  quranAppearance: QuranAppearanceSettings;
  notificationsEnabled: boolean;
  soundEnabled: boolean;
}

export const DEFAULT_SETTINGS: AppSettings = {
  theme: 'auto',
  language: 'en',
  quranAppearance: {
    textSize: 14, // Default Arabic text size (9-18 range)
    translationTextSize: 12, // Default translation text size (9-18 range)
    textColor: '#000000',
    translationEnabled: true,
    arabicTextEnabled: true, // Arabic verses visible by default
    wordByWordEnabled: false, // Word-by-word display disabled by default
    arabicFont: 'uthman',
    selectedTranslatorName: '', // Will be set to first available translator
    selectedTranslatorLanguage: '', // Will be set when translator is selected
    selectedReciter: 'Alafasy_128kbps', // Default reciter
  },
  notificationsEnabled: true,
  soundEnabled: true,
};

// Theme Colors
export interface ThemeColors {
  background: string;
  surface: string;
  card: string;
  text: string;
  textSecondary: string;
  primary: string;
  primaryLight: string;
  border: string;
  error: string;
  success: string;
  warning: string;
  info: string;
}

export const LIGHT_THEME: ThemeColors = {
  background: '#F9FAFB',
  surface: '#FFFFFF',
  card: '#FFFFFF',
  text: '#111827',
  textSecondary: '#6B7280',
  primary: '#2EBBC3',
  primaryLight: '#7FD9DE',
  border: '#E5E7EB',
  error: '#EF4444',
  success: '#2EBBC3',
  warning: '#F59E0B',
  info: '#3B82F6',
};

export const DARK_THEME: ThemeColors = {
  background: '#111827',
  surface: '#1F2937',
  card: '#374151',
  text: '#F9FAFB',
  textSecondary: '#D1D5DB',
  primary: '#2EBBC3',
  primaryLight: '#5FCBD1',
  border: '#4B5563',
  error: '#EF4444',
  success: '#2EBBC3',
  warning: '#F59E0B',
  info: '#3B82F6',
};

// Language Translations
export interface Translations {
  // Common
  home: string;
  settings: string;
  search: string;
  save: string;
  cancel: string;
  done: string;
  back: string;
  edit: string;
  delete: string;
  update: string;
  confirm: string;
  success: string;
  error: string;
  loading: string;
  seeAll: string;

  // Navigation
  profile: string;
  explore: string;
  bookmarks: string;
  library: string;

  // Home Screen
  welcomeBack: string;
  recentActivity: string;
  yourProgress: string;
  completion: string;
  topicsDone: string;
  timeSpent: string;
  versesRead: string;
  dailyGoal: string;
  currentStreak: string;
  totalQuizzes: string;
  passedQuizzes: string;
  availableQuizzes: string;
  verseOfTheDay: string;
  noVerseAvailable: string;
  continueReading: string;
  todaysGoals: string;
  addAnotherGoal: string;
  startNewGoal: string;
  progress: string;
  noRecentActivity: string;
  startReadingTopicsOrTakeQuiz: string;
  quizStats: string;
  takeQuiz: string;
  attempts: string;
  passed: string;
  avgScore: string;
  days: string;
  prayerNameMaghrib: string;
  nextPrayerIsha: string;
  quizScore: string;
  colorBlack: string;
  colorDarkGray: string;
  colorTeal: string;
  colorBlue: string;
  colorGreen: string;
  colorBrown: string;
  showTranslationBelowArabic: string;
  bismillahTranslation: string;
  achievements: string;
  failedToUpdateName: string;
  failedToUpdateEmail: string;
  nameChangeDescription: string;
  firstNamePlaceholder: string;
  lastNamePlaceholder: string;
  emailChangeDescription: string;
  emailPlaceholder: string;
  dateToday: string;
  dateYesterday: string;
  dateDaysAgo: string;
  dateMonth: string;
  dateMonths: string;
  dateYear: string;
  dateYears: string;
  dateNever: string;
  dateUnknown: string;
  passwordRequirementsError: string;
  enterCurrentPasswordPrompt: string;
  failedToUpdatePassword: string;
  enterPasswordPrompt: string;
  accountDeleted: string;
  accountDeletedMessage: string;
  failedToDeleteAccount: string;
  accountDeactivated: string;
  accountDeactivatedMessage: string;
  failedToDeactivateAccount: string;
  login: string;
  passwordSecurityMessage: string;
  passwordRule8Chars: string;
  passwordRuleAlphaNumeric: string;
  deactivate: string;
  deleteAccountTitle: string;
  deleteAccountMessage: string;
  enterPasswordToConfirm: string;
  deactivateAccountTitle: string;
  deactivateAccountMessage: string;
  languageChanged: string;
  appWillUseFont: string;
  urduFont: string;
  systemFont: string;
  failedToChangeLanguage: string;
  themeChanged: string;
  failedToChangeTheme: string;
  noTranslatorSelected: string;
  quranicFontName: string;
  uthmaniFontName: string;
  failedToSaveSettings: string;
  reciters: string;
  downloaded: string;
  download: string;
  translations: string;
  availableDownloads: string;
  quizCategoryCreed: string;
  quizCategoryQuranMojwad: string;
  quizCategoryExpiation: string;
  quizCategoryFiqh: string;
  quizCategoryHadith: string;
  quizCategorySeerah: string;
  failedToStartQuiz: string;
  startingQuiz: string;
  loadingCategories: string;
  details: string;
  category: string;
  question: string;
  yourAnswer: string;
  correctAnswer: string;
  time: string;
  questionSkipped: string;
  skipped: string;
  correct: string;
  wrong: string;
  noAnswerSelected: string;
  selectAnswerPrompt: string;
  exitQuiz: string;
  exitQuizConfirmation: string;
  exit: string;
  submissionError: string;
  failedToSubmitQuiz: string;
  loadingQuestion: string;
  of: string;
  skip: string;
  submit: string;
  next: string;
  readyToSubmit: string;
  allQuestionsAnswered: string;
  totalQuestions: string;
  answered: string;
  submitQuiz: string;
  reviewAnswers: string;
  noResults: string;
  noQuizResults: string;
  ok: string;
  excellent: string;
  greatJob: string;
  goodWork: string;
  keepTrying: string;
  needMorePractice: string;
  quizResult: string;
  passedStatus: string;
  failedStatus: string;
  totalScore: string;
  yourScorePercentage: string;
  attempted: string;
  timeRemaining: string;
  missingInformation: string;
  enterEmailPrompt: string;
  loginSuccessful: string;
  loginFailed: string;
  invalidCredentials: string;
  unexpectedError: string;
  emailRequired: string;
  enterEmailForVerification: string;
  resendVerificationEmail: string;
  sendVerificationLinkToEmail: string;
  send: string;
  failed: string;
  failedToSendEmail: string;
  welcomeBackLogin: string;
  enterCredentialsToSignIn: string;
  enterEmailPlaceholder: string;
  enterPasswordPlaceholder: string;
  featureSoon: string;
  signIn: string;
  continueWithGoogle: string;
  continueWithFacebook: string;
  noAccountPrompt: string;
  didNotReceiveVerificationEmail: string;
  skipForNow: string;
  enterFirstNamePrompt: string;
  enterLastNamePrompt: string;
  forgetPasswordSubtitle: string;
  weakPassword: string;
  passwordRequirementsBelow: string;
  passwordMismatch: string;
  registrationFailed: string;
  unableToCreateAccount: string;
  createAccount: string;
  connectWithQuran: string;
  passwordRequirementsTitle: string;
  passwordRule1Number: string;
  passwordRule1CapitalLetter: string;
  passwordRule1Symbol: string;
  resetPassword: string;
  resetPasswordSubtitle: string;
  enterResetCode: string;
  enterNewPassword: string;
  confirmNewPassword: string;
  passwordRequirements: string;
  passwordRequirement8Chars: string;
  passwordRequirementUppercase: string;
  passwordRequirementNumber: string;
  passwordRequirementSpecial: string;
  backToLogin: string;
  alreadyHaveAccountPrompt: string;
  invalidCode: string;
  enter6DigitCode: string;
  emailVerifiedLogin: string;
  verificationFailed: string;
  invalidOrExpiredCode: string;
  emailSent: string;
  verificationEmailResent: string;
  checkYourEmail: string;
  sentVerificationCodeTo: string;
  enterVerificationCode: string;
  verificationCodePlaceholder: string;
  verifyEmail: string;
  checkEmailForCode: string;
  codeExpiresIn24Hours: string;
  checkSpamFolder: string;
  resendCode: string;
  backToLogin: string;
  postVerificationInfo: string;
  surahYasin: string;
  surahArRahman: string;
  juz30: string;
  topicTawheed: string;
  pleaseWait: string;
  contentLoading: string;
  ayahs: string;
  juzFull: string;
  failedToLoadSurahs: string;
  failedToOpenSurah: string;
  searchTopicsPlaceholder: string;
  searchJuzPlaceholder: string;
  searchSurahPlaceholder: string;
  lastRead: string;
  quickAccess: string;
  filterAll: string;
  filterMeccan: string;
  filterMedinan: string;
  topicsFilter: string;
  juzFilter: string;
  resultSingular: string;
  resultPlural: string;
  found: string;
  noResultsFound: string;
  noSurahsAvailable: string;
  noSurahsMatchingSearch: string;
  checkConnectionAndRetry: string;
  clearSearch: string;
  loadingQuran: string;
  pullToRefresh: string;
  surahAlFatihah: string;
  surahAlBaqarah: string;
  surahAlImran: string;
  surahAnNisa: string;
  surahAlMaidah: string;
  surahAlAnam: string;
  reciterAsSudais: string;
  reciterAlAfasy: string;
  reciterAlHusary: string;
  reciterAlMinshawi: string;
  reciterAlGhamdi: string;
  reciterMisharyRashid: string;
  translationEng: string;
  translationUrdu: string;
  translationIndonesia: string;
  translationTurkce: string;
  translationFrancais: string;
  translationDeutsch: string;
  page: string;
  hizb: string;
  fatihaAyah1: string;
  fatihaAyah2: string;
  fatihaAyah3: string;
  fatihaAyah4: string;
  fatihaAyah5: string;
  fatihaAyah6: string;
  fatihaAyah7: string;
  comingSoon: string;
  pageNavigationComingSoon: string;
  failedToLoadQuranData: string;
  alQuran: string;
  translationNotAvailable: string;
  translationLabel: string;
  speed: string;
  repeat: string;
  audioLabel: string;
  defaultUserName: string;
  failedToLoadSajdas: string;
  failedToLoadPages: string;
  failedToLoadManzils: string;
  readNow: string;
  sajda: string;
  obligatory: string;
  recommended: string;
  manzil: string;
  surahsFilter: string;
  pagesFilter: string;
  manzilsFilter: string;
  sajdasFilter: string;
  stats: string;
  quranMetadataStatistics: string;
  totalHizbQuarters: string;
  totalHizbs: string;
  totalManzils: string;
  totalRukus: string;
  totalPages: string;
  totalSajdas: string;
  obligatorySajdas: string;
  recommendedSajdas: string;
  close: string;
  loadingEllipsis: string;
  adjustSearchOrFilters: string;
  noPagesAvailable: string;
  failedToLoadPagesData: string;
  noSajdasAvailable: string;
  failedToLoadSajdasData: string;
  noManzilsAvailable: string;
  failedToLoadManzilsData: string;
  assalamuAlaikum: string;
  onboardingHolyQuranTitle: string;
  onboardingHolyQuranDesc: string;
  onboardingMemorizeQuranTitle: string;
  onboardingMemorizeQuranDesc: string;
  onboardingQuranQuizzesTitle: string;
  onboardingQuranQuizzesDesc: string;
  onboardingStreaksChallengesTitle: string;
  onboardingStreaksChallengesDesc: string;
  appName: string;
  searchQuranTitle: string;
  searchPlaceholder: string;
  resultsTab: string;
  failedToSearch: string;
  searchForAyahsSurahsKeywords: string;
  trySearchingSpecificWords: string;
  searchingEllipsis: string;
  loadingMoreEllipsis: string;
  allResultsLoaded: string;
  noSearchHistory: string;
  searchHistoryWillAppear: string;
  recentSearches: string;
  clearAll: string;
  removeFromHistoryAlertTitle: string;
  removeFromHistoryAlertMessage: string;
  remove: string;
  removed: string;
  ayahRemovedFromHistory: string;
  clearHistoryAlertTitle: string;
  clearHistoryAlertMessage: string;
  cleared: string;
  searchHistoryClearedSuccessfully: string;
  verse: string;
  loadingTopicEllipsis: string;
  topicNotFound: string;
  readingProgress: string;
  quranicVerses: string;
  note: string;
  hadith: string;
  explanation: string;
  noContentForTopic: string;
  loadingError: string;
  failedToLoadTopicDetails: string;
  checkConsoleLogsForApiErrors: string;
  verses: string;
  completeQuran: string;
  playbackError: string;
  failedToLoadAudio: string;
  surahAyah: string;
  ayahNotFound: string;
  editScreenInfoTitle: string;
  editScreenInfoDescription: string;
  loadingFontsEllipsis: string;
  preparingQuranExperienceEllipsis: string;
  checkingAppStateEllipsis: string;
  appStateLabel: string;
  onboardingCompleteLabel: string;
  loggedInLabel: string;
  hasTokenLabel: string;
  authTokenLoaded: string;
  noAuthTokenFound: string;
  errorCheckingAppState: string;
  errorSavingOnboardingStatus: string;
  errorSettingLoginStatus: string;
  appDataCleared: string;
  errorClearingAppData: string;
  skip: string;

  // User Settings
  settingsTitle: string;
  generalSettings: string;
  editProfile: string;
  loginAndSecurity: string;
  appearance: string;
  reading: string;
  downloads: string;
  support: string;
  helpCenter: string;
  customerSupport: string;
  faqs: string;
  legal: string;
  termsOfService: string;
  privacyPolicy: string;
  logout: string;
  addAchievementsHere: string;

  // Edit Profile
  editProfileTitle: string;
  fullName: string;
  firstName: string;
  lastName: string;
  emailAddress: string;
  changeProfilePicture: string;
  personalInfo: string;
  profileUpdatedSuccess: string;
  emailUpdatedSuccess: string;
  verify: string;

  // Login & Security
  loginSecurity: string;
  password: string;
  lastUpdated: string;
  enterOldPassword: string;
  enterNewPassword: string;
  confirmNewPassword: string;
  forgotPassword: string;
  updatePassword: string;
  passwordUpdatedSuccess: string;
  mustHave8Characters: string;
  useAlphabetsAndNumbers: string;
  mustHaveUpperLower: string;
  useSpecialCharacters: string;
  accountSettings: string;
  deleteYourAccount: string;
  deactivateYourAccount: string;
  deleteAccountConfirm: string;
  deactivateAccountConfirm: string;

  // Appearance
  theme: string;
  themeLight: string;
  themeDark: string;
  themeAuto: string;
  language: string;
  languageEnglish: string;
  languageUrdu: string;

  // Reading Settings
  pageLayout: string;
  arabicVerse: string;
  translation: string;
  quranFont: string;
  fontSizeQuranicArabic: string;
  fontSizeTranslation: string;
  preview: string;
  enableArabicOrTranslation: string;
  saveSettings: string;
  settingsSavedSuccess: string;
  selectTranslator: string;
  translatorSelection: string;
  noTranslatorsAvailable: string;
  loadingTranslators: string;

  // Quran Settings
  quranSettings: string;
  quranAppearance: string;
  textSize: string;
  textColor: string;
  translationEnabled: string;
  arabicFont: string;

  // Quiz
  quiz: string;
  startQuiz: string;
  questions: string;
  score: string;
  result: string;
  quizAttempts: string;
  averageScore: string;
  topicsStarted: string;
  topicsCompleted: string;
  correctAnswers: string;
  wrongAnswers: string;
  timeTaken: string;
  viewDetails: string;
  retakeQuiz: string;

  // Topics
  topics: string;
  topicProgress: string;
  inProgress: string;
  completed: string;
  notStarted: string;
  continue: string;
  startLearning: string;

  // Downloads
  downloadedContent: string;
  noDownloads: string;
  downloadSize: string;
  downloadDate: string;

  // Error Messages
  errorOccurred: string;
  tryAgain: string;
  noInternetConnection: string;
  invalidEmail: string;
  invalidPassword: string;
  passwordsDoNotMatch: string;
  requiredField: string;

  // Goal Detail Screen
  goalDetails: string;
  overallProgress: string;
  completed: string;
  active: string;
  remaining: string;
  surahs: string;
  juz: string;
  topics: string;
  goalNotFound: string;
  goBack: string;
  deleteGoal: string;
  deleteGoalConfirm: string;
  complete: string;
  expired: string;
  lastReadOn: string;
}

export const ENGLISH_TRANSLATIONS: Translations = {
  // Common
  home: 'Home',
  settings: 'Settings',
  search: 'Search',
  save: 'Save',
  cancel: 'Cancel',
  done: 'Done',
  back: 'Back',
  edit: 'Edit',
  delete: 'Delete',
  update: 'Update',
  confirm: 'Confirm',
  success: 'Success',
  error: 'Error',
  loading: 'Loading',
  seeAll: 'See All',

  // Navigation
  profile: 'Profile',
  explore: 'Explore',
  bookmarks: 'Bookmarks',
  library: 'Library',

  // Home Screen
  welcomeBack: 'Welcome back',
  recentActivity: 'Recent Activity',
  yourProgress: 'Your Progress',
  completion: 'Completion',
  topicsDone: 'Topics Done',
  timeSpent: 'Time Spent',
  versesRead: 'Verses Read',
  dailyGoal: 'Daily Goal',
  currentStreak: 'Current Streak',
  totalQuizzes: 'Total Quizzes',
  passedQuizzes: 'Passed Quizzes',
  availableQuizzes: 'Available Quizzes',

  // New Home Screen keys
  verseOfTheDay: 'Verse of the Day',
  noVerseAvailable: 'No verse available',
  continueReading: 'Continue Reading',
  todaysGoals: "Today's Goal(s)",
  addAnotherGoal: '+ ADD ANOTHER GOAL',
  startNewGoal: '+ START A NEW GOAL',
  progress: 'Progress',
  noRecentActivity: 'No recent activity',
  startReadingTopicsOrTakeQuiz: 'Start reading topics or take a quiz!',
  quizStats: 'Quiz Stats',
  takeQuiz: 'Take Quiz',
  attempts: 'Attempts',
  passed: 'Passed',
  avgScore: 'Avg Score',
  days: 'Days',
  prayerNameMaghrib: 'Maghrib',
  nextPrayerIsha: 'Next is Isha',
  quizScore: 'Quiz Score',
  colorBlack: 'Black',
  colorDarkGray: 'Dark Gray',
  colorTeal: 'Teal',
  colorBlue: 'Blue',
  colorGreen: 'Green',
  colorBrown: 'Brown',
  showTranslationBelowArabic: 'Show translation below Arabic text',
  bismillahTranslation: 'In the name of Allah, the Most Gracious, the Most Merciful',
  achievements: 'Achievements',
  failedToUpdateName: 'Failed to update name',
  failedToUpdateEmail: 'Failed to update email',
  nameChangeDescription: 'Change how your name is displayed',
  firstNamePlaceholder: 'Enter first name',
  lastNamePlaceholder: 'Enter last name',
  emailChangeDescription: 'Update your email address',
  emailPlaceholder: 'Enter email address',
  dateToday: 'Today',
  dateYesterday: 'Yesterday',
  dateDaysAgo: 'days ago',
  dateMonth: 'month',
  dateMonths: 'months',
  dateYear: 'year',
  dateYears: 'years',
  dateNever: 'Never updated',
  dateUnknown: 'Unknown',
  forgetPasswordSubtitle:
    'Enter your email address and we will send you a code to reset your password',
  passwordRequirementsError: 'Password must meet all requirements',
  enterCurrentPasswordPrompt: 'Please enter your current password',
  failedToUpdatePassword: 'Failed to update password',
  enterPasswordPrompt: 'Please enter your password',
  accountDeleted: 'Account Deleted',
  accountDeletedMessage: 'Your account has been permanently deleted',
  failedToDeleteAccount: 'Failed to delete account. Check your password.',
  accountDeactivated: 'Account Deactivated',
  accountDeactivatedMessage: 'Your account has been deactivated',
  failedToDeactivateAccount: 'Failed to deactivate account. Check your password.',
  login: 'Login',
  passwordSecurityMessage:
    'For your security, we recommend using a strong password that you don’t use elsewhere.',
  passwordRule8Chars: 'Must have at least 8 characters.',
  passwordRuleAlphaNumeric: 'Use a mix of letters and numbers.',
  deactivate: 'Deactivate',
  deleteAccountTitle: 'Delete Account?',
  deleteAccountMessage: 'This action cannot be undone. All your data will be permanently deleted.',
  enterPasswordToConfirm: 'Enter your password to confirm',
  deactivateAccountTitle: 'Deactivate Account?',
  deactivateAccountMessage:
    'Your account will be temporarily disabled. You can reactivate it anytime by logging in.',
  languageChanged: 'Language changed',
  appWillUseFont: 'App will use {font} for UI.',
  urduFont: 'Urdu font',
  systemFont: 'System font',
  failedToChangeLanguage: 'Failed to change language',
  themeChanged: 'Theme changed',
  failedToChangeTheme: 'Failed to change theme',
  noTranslatorSelected: 'No translator selected',
  quranicFontName: 'Quranic',
  uthmaniFontName: 'Uthmani',
  failedToSaveSettings: 'Failed to save settings',
  reciters: 'Reciters',
  downloaded: 'Downloaded',
  download: 'Download',
  translations: 'Translations',
  availableDownloads: 'Available Downloads',
  quizCategoryCreed: 'Creed',
  quizCategoryQuranMojwad: 'Quran Mojwad',
  quizCategoryExpiation: 'Expiation',
  quizCategoryFiqh: 'Fiqh',
  quizCategoryHadith: 'Hadith',
  quizCategorySeerah: 'Seerah & Muhammad',
  failedToStartQuiz: 'Failed to start quiz. Please try again.',
  startingQuiz: 'Starting quiz...',
  loadingCategories: 'Loading categories...',
  details: 'Details',
  category: 'Category:',
  question: 'Question:',
  yourAnswer: 'Your answer:',
  correctAnswer: 'Correct answer:',
  time: 'Time:',
  questionSkipped: 'Question was skipped',
  skipped: 'Skipped',
  correct: 'Correct',
  wrong: 'Wrong',
  noAnswerSelected: 'No Answer Selected',
  selectAnswerPrompt: 'Please select an answer before proceeding.',
  exitQuiz: 'Exit Quiz',
  exitQuizConfirmation: 'Are you sure you want to exit the quiz? Your progress will be lost.',
  exit: 'Exit',
  submissionError: 'Submission Error',
  failedToSubmitQuiz: 'Failed to submit quiz. Please try again.',
  loadingQuestion: 'Loading question...',
  of: 'of',
  skip: 'Skip',
  submit: 'Submit',
  next: 'Next',
  readyToSubmit: 'Ready to Submit?',
  allQuestionsAnswered:
    "You've answered all questions! Would you like to review your answers or submit the quiz now?",
  totalQuestions: 'Total Questions:',
  answered: 'Answered:',
  submitQuiz: 'Submit Quiz',
  reviewAnswers: 'Review Answers',
  noResults: 'No Results',
  noQuizResults: 'No quiz results found. Please try again.',
  ok: 'OK',
  excellent: 'Excellent!',
  greatJob: 'Great Job!',
  goodWork: 'Good Work!',
  keepTrying: 'Keep Trying!',
  needMorePractice: 'Need More Practice',
  quizResult: 'Quiz Result',
  passedStatus: '✓ PASSED',
  failedStatus: '✗ FAILED',
  totalScore: 'Total Score:',
  yourScorePercentage: 'Your Score Percentage',
  attempted: 'Attempted',
  timeRemaining: 'Time Remaining',
  missingInformation: 'Missing Information',
  enterEmailPrompt: 'Please enter your email',
  loginSuccessful: 'Login successful!',
  loginFailed: 'Login Failed',
  invalidCredentials: 'Invalid credentials',
  unexpectedError: 'An unexpected error occurred. Please try again.',
  emailRequired: 'Email Required',
  enterEmailForVerification: 'Please enter your email address in the login field first',
  resendVerificationEmail: 'Resend Verification Email?',
  sendVerificationLinkToEmail: "We'll send a new verification link to {email}",
  send: 'Send',
  failed: 'Failed',
  failedToSendEmail: 'Failed to send email',
  welcomeBackLogin: 'Welcome Back!',
  enterCredentialsToSignIn: 'Enter credentials to sign in to your account.',
  enterEmailPlaceholder: 'Enter Email',
  enterPasswordPlaceholder: 'Enter Password',
  featureSoon: 'This feature will be implemented soon',
  signIn: 'Sign In',
  continueWithGoogle: 'Continue with Google',
  continueWithFacebook: 'Continue with Facebook',
  noAccountPrompt: "Don't have an account? ",
  didNotReceiveVerificationEmail: "Didn't receive verification email?",
  skipForNow: 'Skip for now',
  enterFirstNamePrompt: 'Please enter your first name',
  enterLastNamePrompt: 'Please enter your last name',
  weakPassword: 'Weak Password',
  passwordRequirementsBelow: 'Please ensure your password meets all requirements below',
  passwordMismatch: 'Password Mismatch',
  registrationFailed: 'Registration Failed',
  unableToCreateAccount: 'Unable to create account',
  createAccount: 'Create Account!',
  connectWithQuran: 'Connect with the Quran like never before.',
  passwordRequirementsTitle: 'Password Requirements:',
  passwordRule1Number: 'At least 1 number',
  passwordRule1CapitalLetter: 'At least 1 capital letter',
  passwordRule1Symbol: 'At least 1 symbol (!@#$%^&*)',
  resetPassword: 'Reset Password',
  resetPasswordSubtitle: 'Enter the 6-digit code sent to your email and your new password',
  enterResetCode: 'Enter 6-digit code',
  enterNewPassword: 'Enter new password',
  confirmNewPassword: 'Confirm new password',
  passwordRequirements: 'Password must contain:',
  passwordRequirement8Chars: 'At least 8 characters',
  passwordRequirementUppercase: 'At least one uppercase letter',
  passwordRequirementNumber: 'At least one number',
  passwordRequirementSpecial: 'At least one special character (!@#$%^&*...)',
  backToLogin: 'Back to Login',
  alreadyHaveAccountPrompt: 'Already have an account? ',
  invalidCode: 'Invalid Code',
  enter6DigitCode: 'Please enter a 6-digit verification code',
  emailVerifiedLogin: 'Your email has been verified! You can now log in.',
  verificationFailed: 'Verification Failed',
  invalidOrExpiredCode: 'Invalid or expired code',
  emailSent: 'Email Sent!',
  verificationEmailResent: 'Verification email has been resent. Please check your inbox.',
  checkYourEmail: 'Check Your Email',
  sentVerificationCodeTo: "We've sent a verification code to",
  enterVerificationCode: 'Enter Verification Code',
  verificationCodePlaceholder: 'ABC123',
  verifyEmail: 'Verify Email',
  checkEmailForCode: 'Check your email for the 6-digit code',
  codeExpiresIn24Hours: 'Code expires in 24 hours',
  checkSpamFolder: "Check spam folder if you don't see it",
  resendCode: 'Resend Code',
  backToLogin: 'Back to Login',
  postVerificationInfo:
    "After verification, you'll receive a welcome email and can log in with full access!",
  surahYasin: 'YA SIN',
  surahArRahman: 'AR-RAHMAN',
  juz30: 'Juz 30',
  topicTawheed: 'Tawheed',
  pleaseWait: 'Please wait',
  contentLoading: 'Content is still loading...',
  ayahs: 'Ayahs',
  juzFull: 'Juz',
  failedToLoadSurahs: 'Failed to load surahs. Please check your connection and try again.',
  failedToOpenSurah: 'Failed to open surah. Please try again.',
  searchTopicsPlaceholder: 'Search topics...',
  searchJuzPlaceholder: 'Search Juz by number or name...',
  searchSurahPlaceholder: 'Search Surah by name or number...',
  lastRead: 'Last Read',
  quickAccess: 'Quick Access',
  filterAll: 'All',
  filterMeccan: 'Meccan',
  filterMedinan: 'Medinan',
  topicsFilter: 'Topics',
  juzFilter: 'Juz',
  resultSingular: 'result',
  resultPlural: 'results',
  found: 'found',
  noResultsFound: 'No results found',
  noSurahsAvailable: 'No surahs available',
  noSurahsMatchingSearch: 'We couldn\'t find any surahs matching "{searchQuery}"',
  checkConnectionAndRetry: 'Please check your connection and try again',
  clearSearch: 'Clear Search',
  loadingQuran: 'Loading Quran...',
  pullToRefresh: 'Pull to refresh',
  surahAlFatihah: 'Al-Fatihah',
  surahAlBaqarah: 'Al-Baqarah',
  surahAlImran: 'Al-Imran',
  surahAnNisa: 'An-Nisa',
  surahAlMaidah: 'Al-Maidah',
  surahAlAnam: 'Al-Anam',
  reciterAsSudais: 'As-Sudais',
  reciterAlAfasy: 'Al-Afasy',
  reciterAlHusary: 'Al-Husary',
  reciterAlMinshawi: 'Al-Minshawi',
  reciterAlGhamdi: 'Al-Ghamdi',
  reciterMisharyRashid: 'Mishary Rashid',
  translationEng: 'Eng',
  translationUrdu: 'Urdu',
  translationIndonesia: 'Indonesia',
  translationTurkce: 'Türkçe',
  translationFrancais: 'Français',
  translationDeutsch: 'Deutsch',
  page: 'Page',
  hizb: 'Hizb',
  fatihaAyah1: 'In the name of Allah, the Entirely Merciful, the Especially Merciful.',
  fatihaAyah2: '[All] praise is [due] to Allah, Lord of the worlds -',
  fatihaAyah3: 'The Entirely Merciful, the Especially Merciful,',
  fatihaAyah4: 'Sovereign of the Day of Recompense.',
  fatihaAyah5: 'It is You we worship and You we ask for help.',
  fatihaAyah6: 'Guide us to the straight path -',
  fatihaAyah7:
    'The path of those upon whom You have bestowed favor, not of those who have earned [Your] anger or of those who are astray.',
  comingSoon: 'Coming Soon',
  pageNavigationComingSoon:
    'Page {pageNumber} navigation will be available when backend supports page-specific endpoints.',
  failedToLoadQuranData:
    'Failed to load Quran data. Please check your connection and ensure the backend is running.',
  alQuran: 'Al-Quran',
  translationNotAvailable: 'Translation not available',
  translationLabel: 'Translation',
  speed: 'Speed',
  repeat: 'Repeat',
  audioLabel: 'Audio',
  defaultUserName: 'User',
  failedToLoadSajdas: 'Failed to load Sajdas. Please try again.',
  failedToLoadPages: 'Failed to load Pages. Please try again.',
  failedToLoadManzils: 'Failed to load Manzils. Please try again.',
  readNow: 'Read Now',
  sajda: 'Sajda',
  obligatory: 'obligatory',
  recommended: 'recommended',
  manzil: 'Manzil',
  surahsFilter: 'Surahs',
  pagesFilter: 'Pages',
  manzilsFilter: 'Manzils',
  sajdasFilter: 'Sajdas',
  stats: 'Stats',
  quranMetadataStatistics: 'Quran Metadata Statistics',
  totalHizbQuarters: 'Total Hizb Quarters',
  totalHizbs: 'Total Hizbs',
  totalManzils: 'Total Manzils',
  totalRukus: 'Total Rukus',
  totalPages: 'Total Pages',
  totalSajdas: 'Total Sajdas',
  obligatorySajdas: 'Obligatory Sajdas',
  recommendedSajdas: 'Recommended Sajdas',
  close: 'Close',
  loadingEllipsis: 'Loading...',
  adjustSearchOrFilters: 'Try adjusting your search or filters',
  noPagesAvailable: 'No pages available',
  failedToLoadPagesData: 'Failed to load pages data',
  noSajdasAvailable: 'No sajdas available',
  failedToLoadSajdasData: 'Failed to load sajdas data',
  noManzilsAvailable: 'No manzils available',
  failedToLoadManzilsData: 'Failed to load manzils data',
  assalamuAlaikum: 'Assalamu Alaikum, {userName}',
  onboardingHolyQuranTitle: 'Holy Quran',
  onboardingHolyQuranDesc:
    'Here should be some lines about this feature of this app how a user can get facilitate from this feature of the app not more than 3 line',
  onboardingMemorizeQuranTitle: 'Memorize Quran',
  onboardingMemorizeQuranDesc:
    'Here should be some lines about this feature of thisapp how a user can get facilitate from this feature of the app not more than 3 lines',
  onboardingQuranQuizzesTitle: 'Quran Quizzes',
  onboardingQuranQuizzesDesc:
    'Here should be some lines about this feature of this app how a user can get facilitate from this feature of the app not more than 3 lines',
  onboardingStreaksChallengesTitle: 'Streaks & Challenges',
  onboardingStreaksChallengesDesc:
    'Stay motivated and inspired with badges, reminders, streaks & rewards.',
  appName: 'NOOR UL QURAN',
  searchQuranTitle: 'Search Quran',
  searchPlaceholder: 'Search ayahs, surahs, keywords...',
  resultsTab: 'Results',
  failedToSearch: 'Failed to search. Please try again.',
  searchForAyahsSurahsKeywords: 'Search for ayahs, surahs, or keywords',
  trySearchingSpecificWords: 'Try searching for specific words or phrases',
  searchingEllipsis: 'Searching...',
  loadingMoreEllipsis: 'Loading more...',
  allResultsLoaded: '✓ All results loaded',
  noSearchHistory: 'No search history',
  searchHistoryWillAppear: 'Your search history will appear here',
  recentSearches: 'Recent Searches',
  clearAll: 'Clear All',
  removeFromHistoryAlertTitle: 'Remove from History',
  removeFromHistoryAlertMessage:
    'Are you sure you want to remove this ayah from your search history?',
  remove: 'Remove',
  removed: 'Removed',
  ayahRemovedFromHistory: 'Ayah removed from history',
  clearHistoryAlertTitle: 'Clear History',
  clearHistoryAlertMessage: 'Are you sure you want to clear all search history?',
  cleared: 'Cleared',
  searchHistoryClearedSuccessfully: 'Search history cleared successfully',
  verse: 'Verse',
  loadingTopicEllipsis: 'Loading topic...',
  topicNotFound: 'Topic not found',
  readingProgress: 'Reading Progress',
  quranicVerses: 'Quranic Verses',
  note: 'Note',
  hadith: 'Hadith',
  explanation: 'Explanation',
  noContentForTopic: 'No content available for this topic yet.',
  loadingError: 'Loading Error',
  failedToLoadTopicDetails: 'Failed to load topic details. Please try again.',
  checkConsoleLogsForApiErrors: 'Check console logs for API errors',
  verses: 'verses',
  completeQuran: 'Complete Quran',
  playbackError: 'Playback error: {error}',
  failedToLoadAudio: 'Failed to load audio',
  surahAyah: 'Surah {surahNumber}, Ayah {ayahNumber}',
  ayahNotFound: 'Ayah not found',
  editScreenInfoTitle: 'Open up the code for this screen:',
  editScreenInfoDescription:
    'Change any of the text, save the file, and your app will automatically update.',
  loadingFontsEllipsis: 'Loading fonts...',
  preparingQuranExperienceEllipsis: 'Preparing your Quran experience...',
  checkingAppStateEllipsis: 'Checking app state...',
  appStateLabel: 'App state:',
  onboardingCompleteLabel: 'onboardingComplete:',
  loggedInLabel: 'loggedIn:',
  hasTokenLabel: 'hasToken:',
  authTokenLoaded: 'Auth token loaded from storage',
  noAuthTokenFound: 'No auth token found - user needs to login',
  errorCheckingAppState: 'Error checking app state:',
  errorSavingOnboardingStatus: 'Error saving onboarding status:',
  errorSettingLoginStatus: 'Error setting login status:',
  appDataCleared: 'App data cleared!',
  errorClearingAppData: 'Error clearing app data:',
  skip: 'Skip',

  // User Settings
  settingsTitle: 'Settings',
  generalSettings: 'General Settings',
  editProfile: 'Edit Profile',
  loginAndSecurity: 'Login & Security',
  appearance: 'Appearance',
  reading: 'Reading',
  downloads: 'Downloads',
  support: 'Support',
  helpCenter: 'Help Center',
  customerSupport: 'Customer Support',
  faqs: 'FAQs',
  legal: 'Legal',
  termsOfService: 'Terms of Services',
  privacyPolicy: 'Privacy Policy',
  logout: 'Logout',
  addAchievementsHere: 'Add Achievements here',

  // Edit Profile
  editProfileTitle: 'Edit Profile',
  fullName: 'Full name',
  firstName: 'First Name',
  lastName: 'Last Name',
  emailAddress: 'Email Address',
  changeProfilePicture: 'Change Profile Picture',
  personalInfo: 'Personal Info',
  profileUpdatedSuccess: 'Profile updated successfully!',
  emailUpdatedSuccess: 'Email updated successfully!',
  verify: 'Verify',

  // Login & Security
  loginSecurity: 'Login & Security',
  password: 'Password',
  lastUpdated: 'Last updated',
  enterOldPassword: 'Enter old password',
  enterNewPassword: 'Enter new password',
  confirmNewPassword: 'Confirm new password',
  forgotPassword: 'Forgot password?',
  updatePassword: 'Update Password',
  passwordUpdatedSuccess: 'Password updated successfully!',
  mustHave8Characters: 'Must have 8 characters.',
  useAlphabetsAndNumbers: 'Use alphabets A-Z and numbers 0-9 and (special characters recommended).',
  mustHaveUpperLower:
    'Must have one Uppercase one lower case letter and one number and one special character.',
  useSpecialCharacters: "Use only these special characters (! @ # $ % ^ & * ' & + ' ).",
  accountSettings: 'Account Settings',
  deleteYourAccount: 'Delete your Account',
  deactivateYourAccount: 'Deactivate your Account',
  deleteAccountConfirm:
    'Are you sure you want to delete your account? This action cannot be undone.',
  deactivateAccountConfirm:
    'Are you sure you want to deactivate your account? You can reactivate it by logging in again.',

  // Appearance
  theme: 'Theme',
  themeLight: 'Light',
  themeDark: 'Dark',
  themeAuto: 'Auto (Light/Dark)',
  language: 'Language',
  languageEnglish: 'English',
  languageUrdu: 'اردو',

  // Reading Settings
  pageLayout: 'Page Layout',
  arabicVerse: 'Arabic Verse',
  translation: 'Translation',
  quranFont: 'Quran Font',
  fontSizeQuranicArabic: 'Font Size - Quranic Arabic',
  fontSizeTranslation: 'Font Size - Translation',
  preview: 'Preview',
  enableArabicOrTranslation: 'Enable Arabic Verse or Translation to see preview',
  saveSettings: 'Save Settings',
  settingsSavedSuccess: 'Settings saved successfully!',
  selectTranslator: 'Select Translator',
  translatorSelection: 'Translator Selection',
  noTranslatorsAvailable: 'No translators available',
  loadingTranslators: 'Loading translators...',

  // Quran Settings
  quranSettings: 'Quran Settings',
  quranAppearance: 'Quran Appearance',
  textSize: 'Text Size',
  textColor: 'Text Color',
  translationEnabled: 'Show Translation',
  arabicFont: 'Arabic Font',

  // Quiz
  quiz: 'Quiz',
  startQuiz: 'Start Quiz',
  questions: 'Questions',
  score: 'Score',
  result: 'Result',
  quizAttempts: 'Quiz Attempts',
  averageScore: 'Average Score',
  topicsStarted: 'Topics Started',
  topicsCompleted: 'Topics Completed',
  correctAnswers: 'Correct Answers',
  wrongAnswers: 'Wrong Answers',
  timeTaken: 'Time Taken',
  viewDetails: 'View Details',
  retakeQuiz: 'Retake Quiz',

  // Topics
  topics: 'Topics',
  topicProgress: 'Topic Progress',
  inProgress: 'In Progress',
  completed: 'Completed',
  notStarted: 'Not Started',
  continue: 'Continue',
  startLearning: 'Start Learning',

  // Downloads
  downloadedContent: 'Downloaded Content',
  noDownloads: 'No downloads yet',
  downloadSize: 'Size',
  downloadDate: 'Downloaded on',

  // Error Messages
  errorOccurred: 'An error occurred',
  tryAgain: 'Try Again',
  noInternetConnection: 'No internet connection',
  invalidEmail: 'Invalid email address',
  invalidPassword: 'Invalid password',
  passwordsDoNotMatch: 'Passwords do not match',
  requiredField: 'This field is required',

  // Goal Detail Screen
  goalDetails: 'Goal Details',
  overallProgress: 'Overall Progress',
  completed: 'Completed',
  active: 'Active',
  remaining: 'Remaining',
  surahs: 'Surahs',
  juz: 'Juz',
  topics: 'Topics',
  goalNotFound: 'Goal not found',
  goBack: 'Go Back',
  deleteGoal: 'Delete Goal',
  deleteGoalConfirm: 'Are you sure you want to delete',
  complete: 'Complete',
  expired: 'Expired',
  lastReadOn: 'Last read',
};

export const URDU_TRANSLATIONS: Translations = {
  // Common
  home: 'ہوم',
  settings: 'ترتیبات',
  search: 'تلاش',
  save: 'محفوظ کریں',
  cancel: 'منسوخ',
  done: 'مکمل',
  back: 'واپس',
  edit: 'ترمیم',
  delete: 'حذف کریں',
  update: 'اپ ڈیٹ',
  confirm: 'تصدیق کریں',
  success: 'کامیابی',
  error: 'خرابی',
  loading: 'لوڈ ہو رہا ہے',
  seeAll: 'سب دیکھیں',

  // Navigation
  profile: 'پروفائل',
  explore: 'دریافت کریں',
  bookmarks: 'نشانات',
  library: 'لائبریری',

  // Home Screen
  welcomeBack: 'خوش آمدید',
  recentActivity: 'حالیہ سرگرمی',
  yourProgress: 'آپ کی پیشرفت',
  completion: 'تکمیل',
  topicsDone: 'مکمل شدہ موضوعات',
  timeSpent: 'صرف شدہ وقت',
  versesRead: 'پڑھی گئی آیات',
  dailyGoal: 'روزانہ کا ہدف',
  currentStreak: 'موجودہ سلسلہ',
  totalQuizzes: 'کل کوئزز',
  passedQuizzes: 'کامیاب کوئزز',
  availableQuizzes: 'دستیاب کوئزز',

  // New Home Screen keys
  verseOfTheDay: 'آج کی آیت',
  noVerseAvailable: 'کوئی آیت دستیاب نہیں',
  continueReading: 'پڑھنا جاری رکھیں',
  todaysGoals: 'آج کے اہداف',
  addAnotherGoal: '+ ایک اور مقصد شامل کریں',
  startNewGoal: '+ نیا مقصد شروع کریں',
  progress: 'پیشرفت',
  noRecentActivity: 'کوئی حالیہ سرگرمی نہیں',
  startReadingTopicsOrTakeQuiz: 'موضوعات پڑھنا شروع کریں یا کوئز لیں!',
  quizStats: 'کوئز کے اعدادوشمار',
  takeQuiz: 'کوئز لیں',
  attempts: 'کوششیں',
  passed: 'کامیاب',
  avgScore: 'اوسط اسکور',
  days: 'دن',
  prayerNameMaghrib: 'مغرب',
  nextPrayerIsha: 'اگلی نماز عشاء ہے',
  quizScore: 'کوئز اسکور',
  colorBlack: 'سیاہ',
  colorDarkGray: 'گہرا سرمئی',
  colorTeal: 'سبز نیلا',
  colorBlue: 'نیلا',
  colorGreen: 'سبز',
  colorBrown: 'بھورا',
  showTranslationBelowArabic: 'عربی متن کے نیچے ترجمہ دکھائیں',
  bismillahTranslation: 'شروع اللہ کے نام سے جو بڑا مہربان نہایت رحم والا ہے',
  achievements: 'کامیابیاں',
  failedToUpdateName: 'نام اپ ڈیٹ کرنے میں ناکام',
  failedToUpdateEmail: 'ای میل اپ ڈیٹ کرنے میں ناکام',
  nameChangeDescription: 'آپ کا نام کیسے ظاہر ہوتا ہے اسے تبدیل کریں',
  firstNamePlaceholder: 'پہلا نام درج کریں',
  lastNamePlaceholder: 'آخری نام درج کریں',
  emailChangeDescription: 'اپنا ای میل ایڈریس اپ ڈیٹ کریں',
  emailPlaceholder: 'ای میل ایڈریس درج کریں',
  dateToday: 'آج',
  dateYesterday: 'کل',
  dateDaysAgo: 'دن پہلے',
  dateMonth: 'مہینہ',
  dateMonths: 'مہینے',
  dateYear: 'سال',
  dateYears: 'سال',
  dateNever: 'کبھی اپ ڈیٹ نہیں ہوا',
  dateUnknown: 'نامعلوم',
  passwordRequirementsError: 'پاس ورڈ کو تمام ضروریات پوری کرنی چاہئیں',
  enterCurrentPasswordPrompt: 'براہ کرم اپنا موجودہ پاس ورڈ درج کریں',
  failedToUpdatePassword: 'پاس ورڈ اپ ڈیٹ کرنے میں ناکام',
  enterPasswordPrompt: 'براہ کرم اپنا پاس ورڈ درج کریں',
  accountDeleted: 'اکاؤنٹ حذف کر دیا گیا',
  accountDeletedMessage: 'آپ کا اکاؤنٹ مستقل طور پر حذف کر دیا گیا ہے',
  failedToDeleteAccount: 'اکاؤنٹ حذف کرنے میں ناکام۔ اپنا پاس ورڈ چیک کریں۔',
  accountDeactivated: 'اکاؤنٹ غیر فعال کر دیا گیا',
  accountDeactivatedMessage: 'آپ کا اکاؤنٹ غیر فعال کر دیا گیا ہے',
  failedToDeactivateAccount: 'اکاؤنٹ غیر فعال کرنے میں ناکام۔ اپنا پاس ورڈ چیک کریں۔',
  login: 'لاگ ان',
  passwordSecurityMessage:
    'آپ کی سیکیورٹی کے لیے، ہم ایک مضبوط پاس ورڈ استعمال کرنے کی تجویز کرتے ہیں جو آپ کہیں اور استعمال نہیں کرتے ہیں۔',
  passwordRule8Chars: 'کم از کم 8 حروف ہونے چاہئیں۔',
  passwordRuleAlphaNumeric: 'حروف اور نمبروں کا مرکب استعمال کریں۔',
  deactivate: 'غیر فعال کریں',
  deleteAccountTitle: 'اکاؤنٹ حذف کریں؟',
  deleteAccountMessage:
    'یہ عمل واپس نہیں کیا جا سکتا۔ آپ کا تمام ڈیٹا مستقل طور پر حذف کر دیا جائے گا۔',
  enterPasswordToConfirm: 'تصدیق کے لیے اپنا پاس ورڈ درج کریں',
  deactivateAccountTitle: 'اکاؤنٹ غیر فعال کریں؟',
  deactivateAccountMessage:
    'آپ کا اکاؤنٹ عارضی طور پر غیر فعال کر دیا جائے گا۔ آپ لاگ ان کر کے کسی بھی وقت اسے دوبارہ فعال کر سکتے ہیں۔',
  languageChanged: 'زبان تبدیل ہوگئی',
  appWillUseFont: 'ایپ UI کے لیے {font} فونٹ استعمال کرے گی',
  urduFont: 'اردو فونٹ',
  systemFont: 'سسٹم فونٹ',
  failedToChangeLanguage: 'زبان تبدیل کرنے میں ناکام',
  themeChanged: 'تھیم تبدیل ہوگئی',
  failedToChangeTheme: 'تھیم تبدیل کرنے میں ناکام',
  noTranslatorSelected: 'کوئی مترجم منتخب نہیں کیا گیا',
  quranicFontName: 'قرآنی',
  uthmaniFontName: 'عثمانی',
  failedToSaveSettings: 'ترتیبات محفوظ کرنے میں ناکام',
  reciters: 'قاری',
  downloaded: 'ڈاؤن لوڈ کیا گیا',
  download: 'ڈاؤن لوڈ کریں',
  translations: 'تراجم',
  availableDownloads: 'دستیاب ڈاؤن لوڈز',
  quizCategoryCreed: 'عقیدہ',
  quizCategoryQuranMojwad: 'قرآن مجود',
  quizCategoryExpiation: 'کفارہ',
  quizCategoryFiqh: 'فقہ',
  quizCategoryHadith: 'حدیث',
  quizCategorySeerah: 'سیرت و محمد',
  failedToStartQuiz: 'کوئز شروع کرنے میں ناکام۔ براہ کرم دوبارہ کوشش کریں.',
  startingQuiz: 'کوئز شروع ہو رہا ہے...',
  loadingCategories: 'زمرے لوڈ ہو رہے ہیں...',
  details: 'تفصیلات',
  category: 'زمرہ:',
  question: 'سوال:',
  yourAnswer: 'آپ کا جواب:',
  correctAnswer: 'درست جواب:',
  time: 'وقت:',
  questionSkipped: 'سوال چھوڑ دیا گیا',
  skipped: 'چھوڑ دیا',
  correct: 'درست',
  wrong: 'غلط',
  noAnswerSelected: 'کوئی جواب منتخب نہیں کیا گیا',
  selectAnswerPrompt: 'آگے بڑھنے سے پہلے براہ کرم ایک جواب منتخب کریں',
  exitQuiz: 'کوئز سے باہر نکلیں',
  exitQuizConfirmation: 'کیا آپ واقعی کوئز سے باہر نکلنا چاہتے ہیں؟ آپ کی پیشرفت ضائع ہو جائے گی',
  exit: 'باہر نکلیں',
  submissionError: 'جمع کرانے میں خرابی',
  failedToSubmitQuiz: 'کوئز جمع کرانے میں ناکام۔ براہ کرم دوبارہ کوشش کریں',
  loadingQuestion: 'سوال لوڈ ہو رہا ہے...',
  of: 'کا',
  skip: 'چھوڑ دیں',
  submit: 'جمع کرائیں',
  next: 'اگلا',
  readyToSubmit: 'جمع کرانے کے لیے تیار ہیں؟',
  allQuestionsAnswered:
    'آپ نے تمام سوالات کے جوابات دے دیے ہیں! کیا آپ اپنے جوابات کا جائزہ لینا چاہیں گے یا ابھی کوئز جمع کرائیں گے؟',
  totalQuestions: 'کل سوالات:',
  answered: 'جواب دیا:',
  submitQuiz: 'کوئز جمع کرائیں',
  reviewAnswers: 'جوابات کا جائزہ لیں',
  noResults: 'کوئی نتیجہ نہیں',
  noQuizResults: 'کوئز کے کوئی نتائج نہیں ملے۔ براہ کرم دوبارہ کوشش کریں',
  ok: 'ٹھیک ہے',
  excellent: 'بہترین!',
  greatJob: 'بہت خوب!',
  goodWork: 'اچھا کام!',
  keepTrying: 'کوشش کرتے رہیں!',
  needMorePractice: 'مزید مشق کی ضرورت ہے',
  quizResult: 'کوئز کا نتیجہ',
  passedStatus: '✓ کامیاب',
  failedStatus: '✗ ناکام',
  totalScore: 'کل اسکور:',
  yourScorePercentage: 'آپ کا اسکور فیصد',
  attempted: 'کوشش کی',
  timeRemaining: 'باقی وقت',
  missingInformation: 'معلومات غائب ہے',
  enterEmailPrompt: 'براہ کرم اپنا ای میل درج کریں',
  loginSuccessful: 'کامیاب لاگ ان!',
  loginFailed: 'لاگ ان ناکام',
  invalidCredentials: 'غلط اسناد',
  unexpectedError: 'ایک غیر متوقع خرابی پیش آگئی۔ براہ کرم دوبارہ کوشش کریں',
  emailRequired: 'ای میل درکار ہے',
  enterEmailForVerification: 'براہ کرم پہلے لاگ ان فیلڈ میں اپنا ای میل ایڈریس درج کریں',
  resendVerificationEmail: 'تصدیقی ای میل دوبارہ بھیجیں؟',
  sendVerificationLinkToEmail: 'ہم {email} پر ایک نیا تصدیقی لنک بھیجیں گے',
  send: 'بھیجیں',
  failed: 'ناکام',
  failedToSendEmail: 'ای میل بھیجنے میں ناکام',
  welcomeBackLogin: 'خوش آمدید!',
  enterCredentialsToSignIn: 'اپنے اکاؤنٹ میں سائن ان کرنے کے لیے اسناد درج کریں',
  enterEmailPlaceholder: 'ای میل درج کریں',
  enterPasswordPlaceholder: 'پاس ورڈ درج کریں',
  featureSoon: 'یہ خصوصیت جلد ہی لاگو کی جائے گی',
  signIn: 'سائن ان کریں',
  continueWithGoogle: 'گوگل کے ساتھ جاری رکھیں',
  continueWithFacebook: 'فیس بک کے ساتھ جاری رکھیں',
  noAccountPrompt: 'اکاؤنٹ نہیں ہے؟',
  didNotReceiveVerificationEmail: 'تصدیقی ای میل موصول نہیں ہوئی؟',
  skipForNow: 'ابھی کے لیے چھوڑ دیں',
  enterFirstNamePrompt: 'براہ کرم اپنا پہلا نام درج کریں',
  enterLastNamePrompt: 'براہ کرم اپنا آخری نام درج کریں',
  weakPassword: 'کمزور پاس ورڈ',
  passwordRequirementsBelow:
    'براہ کرم یقینی بنائیں کہ آپ کا پاس ورڈ نیچے دی گئی تمام ضروریات کو پورا کرتا ہے',
  passwordMismatch: 'پاس ورڈ مماثل نہیں',
  registrationFailed: 'رجسٹریشن ناکام',
  unableToCreateAccount: 'اکاؤنٹ بنانے سے قاصر',
  createAccount: 'اکاؤنٹ بنائیں!',
  connectWithQuran: 'قرآن سے ایسے جڑیں جیسے پہلے کبھی نہیں',
  passwordRequirementsTitle: 'پاس ورڈ کی ضروریات:',
  passwordRule1Number: 'کم از کم 1 نمبر',
  passwordRule1CapitalLetter: 'کم از کم 1 بڑا حرف',
  passwordRule1Symbol: 'کم از کم 1 علامت (!@#$%^&*)',
  resetPassword: 'پاس ورڈ ری سیٹ کریں',
  resetPasswordSubtitle: 'اپنے ای میل پر بھیجا گیا 6 ہندسوں کا کوڈ اور نیا پاس ورڈ درج کریں',
  enterResetCode: '6 ہندسوں کا کوڈ درج کریں',
  enterNewPassword: 'نیا پاس ورڈ درج کریں',
  confirmNewPassword: 'نیا پاس ورڈ تصدیق کریں',
  passwordRequirements: 'پاس ورڈ میں ہونا ضروری ہے:',
  passwordRequirement8Chars: 'کم از کم 8 حروف',
  passwordRequirementUppercase: 'کم از کم ایک بڑا حرف',
  passwordRequirementNumber: 'کم از کم ایک نمبر',
  passwordRequirementSpecial: 'کم از کم ایک خاص علامت (!@#$%^&*...)',
  backToLogin: 'لاگ ان پر واپس جائیں',
  alreadyHaveAccountPrompt: 'پہلے سے ہی اکاؤنٹ ہے؟',
  invalidCode: 'غلط کوڈ',
  enter6DigitCode: 'براہ کرم 6 ہندسوں کا تصدیقی کوڈ درج کریں',
  emailVerifiedLogin: 'آپ کا ای میل تصدیق ہو گیا ہے! اب آپ لاگ ان کر سکتے ہیں',
  verificationFailed: 'تصدیق ناکام',
  invalidOrExpiredCode: 'غلط یا میعاد ختم شدہ کوڈ',
  emailSent: 'ای میل بھیج دیا گیا!',
  verificationEmailResent: 'تصدیقی ای میل دوبارہ بھیج دی گئی ہے۔ براہ کرم اپنا ان باکس چیک کریں',
  checkYourEmail: 'اپنا ای میل چیک کریں',
  sentVerificationCodeTo: 'ہم نے ایک تصدیقی کوڈ بھیجا ہے',
  enterVerificationCode: 'تصدیقی کوڈ درج کریں',
  verificationCodePlaceholder: 'ABC123',
  verifyEmail: 'ای میل کی تصدیق کریں',
  checkEmailForCode: '6 ہندسوں کے کوڈ کے لیے اپنا ای میل چیک کریں',
  codeExpiresIn24Hours: 'کوڈ 24 گھنٹوں میں ختم ہو جائے گا',
  checkSpamFolder: 'اگر آپ کو یہ نظر نہیں آتا تو سپیم فولڈر چیک کریں',
  resendCode: 'کوڈ دوبارہ بھیجیں',
  backToLogin: 'لاگ ان پر واپس جائیں',
  postVerificationInfo:
    'تصدیق کے بعد، آپ کو ایک خوش آمدید ای میل موصول ہوگی اور آپ مکمل رسائی کے ساتھ لاگ ان کر سکیں گے!',
  surahYasin: 'یٰس',
  surahArRahman: 'الرحمن',
  juz30: 'پارہ 30',
  topicTawheed: 'توحید',
  pleaseWait: 'براہ کرم انتظار کریں',
  contentLoading: 'مواد لوڈ ہو رہا ہے...',
  ayahs: 'آیات',
  juzFull: 'پارہ',
  failedToLoadSurahs:
    'سورتیں لوڈ کرنے میں ناکام۔ براہ کرم اپنا کنکشن چیک کریں اور دوبارہ کوشش کریں',
  failedToOpenSurah: 'سورت کھولنے میں ناکام۔ براہ کرم دوبارہ کوشش کریں',
  searchTopicsPlaceholder: 'موضوعات تلاش کریں...',
  searchJuzPlaceholder: 'پارہ نمبر یا نام سے تلاش کریں...',
  searchSurahPlaceholder: 'سورت کا نام یا نمبر سے تلاش کریں...',
  lastRead: 'آخری پڑھی گئی',
  quickAccess: 'فوری رسائی',
  filterAll: 'تمام',
  filterMeccan: 'مکی',
  filterMedinan: 'مدنی',
  topicsFilter: 'موضوعات',
  juzFilter: 'پارہ',
  resultSingular: 'نتیجہ',
  resultPlural: 'نتائج',
  found: 'ملا',
  noResultsFound: 'کوئی نتیجہ نہیں ملا',
  noSurahsAvailable: 'کوئی سورت دستیاب نہیں',
  noSurahsMatchingSearch: 'ہمیں "{searchQuery}" سے ملتی جلتی کوئی سورت نہیں مل سکی',
  checkConnectionAndRetry: 'براہ کرم اپنا کنکشن چیک کریں اور دوبارہ کوشش کریں',
  clearSearch: 'تلاش صاف کریں',
  loadingQuran: 'قرآن لوڈ ہو رہا ہے...',
  pullToRefresh: 'ریفریش کرنے کے لیے نیچے کھینچیں',
  surahAlFatihah: 'الفاتحہ',
  surahAlBaqarah: 'البقرہ',
  surahAlImran: 'آل عمران',
  surahAnNisa: 'النساء',
  surahAlMaidah: 'المائدہ',
  surahAlAnam: 'الانعام',
  reciterAsSudais: 'السدیس',
  reciterAlAfasy: 'العفاسي',
  reciterAlHusary: 'الحصري',
  reciterAlMinshawi: 'المنشاوي',
  reciterAlGhamdi: 'الغامدي',
  reciterMisharyRashid: 'مشاري راشد',
  translationEng: 'انگریزی',
  translationUrdu: 'اردو',
  translationIndonesia: 'انڈونیشیا',
  translationTurkce: 'ترکی',
  translationFrancais: 'فرانسیسی',
  translationDeutsch: 'جرمن',
  page: 'صفحہ',
  hizb: 'حزب',
  fatihaAyah1: 'شروع اللہ کے نام سے جو بڑا مہربان نہایت رحم والا ہے',
  fatihaAyah2: 'سب تعریف اللہ ہی کے لیے ہے جو تمام جہانوں کا رب ہے',
  fatihaAyah3: 'بڑا مہربان نہایت رحم والا ہے',
  fatihaAyah4: 'روز جزا کا مالک ہے',
  fatihaAyah5: 'ہم تیری ہی عبادت کرتے ہیں اور تجھ ہی سے مدد مانگتے ہیں',
  fatihaAyah6: 'ہمیں سیدھا راستہ دکھا',
  fatihaAyah7:
    'ان لوگوں کا راستہ جن پر تو نے انعام کیا، نہ کہ ان کا جن پر غضب ہوا اور نہ گمراہوں کا',
  comingSoon: 'جلد آرہا ہے',
  pageNavigationComingSoon:
    'صفحہ {pageNumber} کی نیویگیشن جلد دستیاب ہوگی جب بیک اینڈ صفحہ مخصوص اینڈ پوائنٹس کو سپورٹ کرے گا',
  failedToLoadQuranData:
    'قرآن کا ڈیٹا لوڈ کرنے میں ناکام۔ براہ کرم اپنا کنکشن چیک کریں اور یقینی بنائیں کہ بیک اینڈ چل رہا ہے',
  alQuran: 'القرآن',
  translationNotAvailable: 'ترجمہ دستیاب نہیں',
  translationLabel: 'ترجمہ',
  speed: 'رفتار',
  repeat: 'دہرائیں',
  audioLabel: 'آڈیو',
  defaultUserName: 'صارف',
  failedToLoadSajdas: 'سجدے لوڈ کرنے میں ناکام۔ براہ کرم دوبارہ کوشش کریں',
  failedToLoadPages: 'صفحات لوڈ کرنے میں ناکام۔ براہ کرم دوبارہ کوشش کریں',
  failedToLoadManzils: 'منازل لوڈ کرنے میں ناکام۔ براہ کرم دوبارہ کوشش کریں',
  readNow: 'اب پڑھیں',
  sajda: 'سجدہ',
  obligatory: 'فرض',
  recommended: 'مستحب',
  manzil: 'منزل',
  surahsFilter: 'سورتیں',
  pagesFilter: 'صفحات',
  manzilsFilter: 'منازل',
  sajdasFilter: 'سجدے',
  stats: 'اعدادوشمار',
  quranMetadataStatistics: 'قرآن کے میٹا ڈیٹا کے اعدادوشمار',
  totalHizbQuarters: 'کل حزب کوارٹرز',
  totalHizbs: 'کل احزاب',
  totalManzils: 'کل منازل',
  totalRukus: 'کل رکوع',
  totalPages: 'کل صفحات',
  totalSajdas: 'کل سجدے',
  obligatorySajdas: 'فرض سجدے',
  recommendedSajdas: 'مستحب سجدے',
  close: 'بند کریں',
  loadingEllipsis: 'لوڈ ہو رہا ہے...',
  adjustSearchOrFilters: 'اپنی تلاش یا فلٹرز کو ایڈجسٹ کرنے کی کوشش کریں',
  noPagesAvailable: 'کوئی صفحہ دستیاب نہیں',
  failedToLoadPagesData: 'صفحات کا ڈیٹا لوڈ کرنے میں ناکام',
  noSajdasAvailable: 'کوئی سجدہ دستیاب نہیں',
  failedToLoadSajdasData: 'سجدوں کا ڈیٹا لوڈ کرنے میں ناکام',
  noManzilsAvailable: 'کوئی منزل دستیاب نہیں',
  failedToLoadManzilsData: 'منازل کا ڈیٹا لوڈ کرنے میں ناکام',
  assalamuAlaikum: 'السلام علیکم، {userName}',
  onboardingHolyQuranTitle: 'قرآن پاک',
  onboardingHolyQuranDesc:
    'یہاں اس ایپ کی اس خصوصیت کے بارے میں کچھ سطریں ہونی چاہئیں کہ صارف اس ایپ کی اس خصوصیت سے کیسے فائدہ اٹھا سکتا ہے، 3 لائنوں سے زیادہ نہیں',
  onboardingMemorizeQuranTitle: 'قرآن حفظ کریں',
  onboardingMemorizeQuranDesc:
    'یہاں اس ایپ کی اس خصوصیت کے بارے میں کچھ سطریں ہونی چاہئیں کہ صارف اس ایپ کی اس خصوصیت سے کیسے فائدہ اٹھا سکتا ہے، 3 لائنوں سے زیادہ نہیں',
  onboardingQuranQuizzesTitle: 'قرآن کوئز',
  onboardingQuranQuizzesDesc:
    'یہاں اس ایپ کی اس خصوصیت کے بارے میں کچھ سطریں ہونی چاہئیں کہ صارف اس ایپ کی اس خصوصیت سے کیسے فائدہ اٹھا سکتا ہے، 3 لائنوں سے زیادہ نہیں',
  onboardingStreaksChallengesTitle: 'اسٹریکس اور چیلنجز',
  onboardingStreaksChallengesDesc:
    'بیجز، یاد دہانیوں، اسٹریکس اور انعامات کے ساتھ حوصلہ افزائی اور متاثر رہیں۔',
  appName: 'نور القرآن',
  searchQuranTitle: 'قرآن تلاش کریں',
  searchPlaceholder: 'آیات، سورتیں، کلیدی الفاظ تلاش کریں...',
  resultsTab: 'نتائج',
  failedToSearch: 'تلاش ناکام ہو گئی۔ براہ کرم دوبارہ کوشش کریں',
  searchForAyahsSurahsKeywords: 'آیات، سورتوں، یا کلیدی الفاظ تلاش کریں',
  trySearchingSpecificWords: 'مخصوص الفاظ یا جملے تلاش کرنے کی کوشش کریں',
  searchingEllipsis: 'تلاش ہو رہی ہے...',
  loadingMoreEllipsis: 'مزید لوڈ ہو رہا ہے...',
  allResultsLoaded: '✓ تمام نتائج لوڈ ہو گئے',
  noSearchHistory: 'کوئی تلاش کی تاریخ نہیں',
  searchHistoryWillAppear: 'آپ کی تلاش کی تاریخ یہاں ظاہر ہوگی',
  recentSearches: 'حالیہ تلاشیں',
  clearAll: 'سب صاف کریں',
  removeFromHistoryAlertTitle: 'تاریخ سے ہٹائیں',
  removeFromHistoryAlertMessage: 'کیا آپ واقعی اس آیت کو اپنی تلاش کی تاریخ سے ہٹانا چاہتے ہیں؟',
  remove: 'ہٹائیں',
  removed: 'ہٹا دیا گیا',
  ayahRemovedFromHistory: 'آیت تاریخ سے ہٹا دی گئی',
  clearHistoryAlertTitle: 'تاریخ صاف کریں',
  clearHistoryAlertMessage: 'کیا آپ واقعی تمام تلاش کی تاریخ صاف کرنا چاہتے ہیں؟',
  cleared: 'صاف کر دیا گیا',
  searchHistoryClearedSuccessfully: 'تلاش کی تاریخ کامیابی سے صاف کر دی گئی',
  verse: 'آیت',
  loadingTopicEllipsis: 'موضوع لوڈ ہو رہا ہے...',
  topicNotFound: 'موضوع نہیں ملا',
  readingProgress: 'پڑھنے کی پیشرفت',
  quranicVerses: 'قرآنی آیات',
  note: 'نوٹ',
  hadith: 'حدیث',
  explanation: 'وضاحت',
  noContentForTopic: 'اس موضوع کے لیے کوئی مواد دستیاب نہیں',
  loadingError: 'لوڈنگ کی خرابی',
  failedToLoadTopicDetails: 'موضوع کی تفصیلات لوڈ کرنے میں ناکام۔ براہ کرم دوبارہ کوشش کریں',
  checkConsoleLogsForApiErrors: 'API کی خامیوں کے لیے کنسول لاگز چیک کریں',
  verses: 'آیات',
  completeQuran: 'مکمل قرآن',
  playbackError: 'پلے بیک کی خرابی: {error}',
  failedToLoadAudio: 'آڈیو لوڈ کرنے میں ناکام',
  surahAyah: 'سورت {surahNumber}، آیت {ayahNumber}',
  ayahNotFound: 'آیت نہیں ملی',
  editScreenInfoTitle: 'اس اسکرین کے لیے کوڈ کھولیں:',
  editScreenInfoDescription:
    'کسی بھی متن کو تبدیل کریں، فائل کو محفوظ کریں، اور آپ کی ایپ خود بخود اپ ڈیٹ ہو جائے گی۔',
  loadingFontsEllipsis: 'فونٹس لوڈ ہو رہے ہیں...',
  preparingQuranExperienceEllipsis: 'آپ کے قرآن کے تجربے کی تیاری ہو رہی ہے...',
  checkingAppStateEllipsis: 'ایپ کی حالت چیک کی جا رہی ہے...',
  appStateLabel: 'ایپ کی حالت:',
  onboardingCompleteLabel: 'آن بورڈنگ مکمل:',
  loggedInLabel: 'لاگ ان:',
  hasTokenLabel: 'ٹوکن ہے:',
  authTokenLoaded: 'تصدیقی ٹوکن اسٹوریج سے لوڈ ہو گیا',
  noAuthTokenFound: 'کوئی تصدیقی ٹوکن نہیں ملا - صارف کو لاگ ان کرنے کی ضرورت ہے',
  errorCheckingAppState: 'ایپ کی حالت چیک کرنے میں خرابی:',
  errorSavingOnboardingStatus: 'آن بورڈنگ کی حیثیت محفوظ کرنے میں خرابی:',
  errorSettingLoginStatus: 'لاگ ان کی حیثیت سیٹ کرنے میں خرابی:',
  appDataCleared: 'ایپ کا ڈیٹا صاف ہو گیا!',
  errorClearingAppData: 'ایپ کا ڈیٹا صاف کرنے میں خرابی:',
  skip: 'چھوڑ دیں',

  // User Settings
  settingsTitle: 'ترتیبات',
  generalSettings: 'عمومی ترتیبات',
  editProfile: 'پروفائل میں ترمیم کریں',
  loginAndSecurity: 'لاگ ان اور سیکیورٹی',
  appearance: 'ظاہری شکل',
  reading: 'پڑھنا',
  downloads: 'ڈاؤن لوڈز',
  support: 'مدد',
  helpCenter: 'مدد کا مرکز',
  customerSupport: 'کسٹمر سپورٹ',
  faqs: 'عمومی سوالات',
  legal: 'قانونی',
  termsOfService: 'سروس کی شرائط',
  privacyPolicy: 'رازداری کی پالیسی',
  logout: 'لاگ آؤٹ',
  addAchievementsHere: 'یہاں کامیابیاں شامل کریں',

  // Edit Profile
  editProfileTitle: 'پروفائل میں ترمیم کریں',
  fullName: 'پورا نام',
  firstName: 'پہلا نام',
  lastName: 'آخری نام',
  emailAddress: 'ای میل ایڈریس',
  changeProfilePicture: 'پروفائل تصویر تبدیل کریں',
  personalInfo: 'ذاتی معلومات',
  profileUpdatedSuccess: 'پروفائل کامیابی سے اپ ڈیٹ ہو گیا!',
  emailUpdatedSuccess: 'ای میل کامیابی سے اپ ڈیٹ ہو گیا!',
  verify: 'تصدیق کریں',

  // Login & Security
  loginSecurity: 'لاگ ان اور سیکیورٹی',
  password: 'پاس ورڈ',
  lastUpdated: 'آخری اپ ڈیٹ',
  enterOldPassword: 'پرانا پاس ورڈ درج کریں',
  enterNewPassword: 'نیا پاس ورڈ درج کریں',
  confirmNewPassword: 'نئے پاس ورڈ کی تصدیق کریں',
  forgotPassword: 'پاس ورڈ بھول گئے؟',
  updatePassword: 'پاس ورڈ اپ ڈیٹ کریں',
  passwordUpdatedSuccess: 'پاس ورڈ کامیابی سے اپ ڈیٹ ہو گیا!',
  mustHave8Characters: '8 حروف ہونے چاہئیں۔',
  useAlphabetsAndNumbers: 'A-Z حروف اور 0-9 نمبر استعمال کریں (خصوصی حروف تجویز کردہ)۔',
  mustHaveUpperLower: 'ایک بڑا حرف، ایک چھوٹا حرف، ایک نمبر اور ایک خصوصی حرف ہونا چاہیے۔',
  useSpecialCharacters: "صرف یہ خصوصی حروف استعمال کریں (! @ # $ % ^ & * ' & + ' )۔",
  accountSettings: 'اکاؤنٹ کی ترتیبات',
  deleteYourAccount: 'اپنا اکاؤنٹ حذف کریں',
  deactivateYourAccount: 'اپنا اکاؤنٹ غیر فعال کریں',
  deleteAccountConfirm:
    'کیا آپ واقعی اپنا اکاؤنٹ حذف کرنا چاہتے ہیں؟ یہ عمل واپس نہیں کیا جا سکتا۔',
  deactivateAccountConfirm:
    'کیا آپ واقعی اپنا اکاؤنٹ غیر فعال کرنا چاہتے ہیں؟ آپ دوبارہ لاگ ان کر کے اسے فعال کر سکتے ہیں۔',

  // Appearance
  theme: 'تھیم',
  themeLight: 'روشن',
  themeDark: 'تاریک',
  themeAuto: 'خودکار (روشن/تاریک)',
  language: 'زبان',
  languageEnglish: 'English',
  languageUrdu: 'اردو',

  // Reading Settings
  pageLayout: 'صفحہ کی ترتیب',
  arabicVerse: 'عربی آیت',
  translation: 'ترجمہ',
  quranFont: 'قرآن کا فونٹ',
  fontSizeQuranicArabic: 'فونٹ سائز - قرآنی عربی',
  fontSizeTranslation: 'فونٹ سائز - ترجمہ',
  preview: 'پیش نظارہ',
  enableArabicOrTranslation: 'پیش نظارہ دیکھنے کے لیے عربی آیت یا ترجمہ فعال کریں',
  saveSettings: 'ترتیبات محفوظ کریں',
  settingsSavedSuccess: 'ترتیبات کامیابی سے محفوظ ہو گئیں!',
  selectTranslator: 'مترجم منتخب کریں',
  translatorSelection: 'مترجم کا انتخاب',
  noTranslatorsAvailable: 'کوئی مترجم دستیاب نہیں',
  loadingTranslators: 'مترجمین لوڈ ہو رہے ہیں...',

  // Quran Settings
  quranSettings: 'قرآن کی ترتیبات',
  quranAppearance: 'قرآن کی ظاہری شکل',
  textSize: 'متن کا سائز',
  textColor: 'متن کا رنگ',
  translationEnabled: 'ترجمہ دکھائیں',
  arabicFont: 'عربی فونٹ',

  // Quiz
  quiz: 'کوئز',
  startQuiz: 'کوئز شروع کریں',
  questions: 'سوالات',
  score: 'سکور',
  result: 'نتیجہ',
  quizAttempts: 'کوئز کی کوششیں',
  averageScore: 'اوسط سکور',
  topicsStarted: 'شروع شدہ موضوعات',
  topicsCompleted: 'مکمل شدہ موضوعات',
  correctAnswers: 'صحیح جوابات',
  wrongAnswers: 'غلط جوابات',
  timeTaken: 'لیا گیا وقت',
  viewDetails: 'تفصیلات دیکھیں',
  retakeQuiz: 'کوئز دوبارہ لیں',

  // Topics
  topics: 'موضوعات',
  topicProgress: 'موضوع کی پیشرفت',
  inProgress: 'جاری ہے',
  completed: 'مکمل',
  notStarted: 'شروع نہیں کیا',
  continue: 'جاری رکھیں',
  startLearning: 'سیکھنا شروع کریں',

  // Downloads
  downloadedContent: 'ڈاؤن لوڈ شدہ مواد',
  noDownloads: 'ابھی تک کوئی ڈاؤن لوڈ نہیں',
  downloadSize: 'سائز',
  downloadDate: 'ڈاؤن لوڈ کیا گیا',

  // Error Messages
  errorOccurred: 'ایک خرابی واقع ہوئی',
  tryAgain: 'دوبارہ کوشش کریں',
  noInternetConnection: 'انٹرنیٹ کنکشن نہیں ہے',
  invalidEmail: 'غلط ای میل ایڈریس',
  invalidPassword: 'غلط پاس ورڈ',
  passwordsDoNotMatch: 'پاس ورڈ مماثل نہیں ہیں',
  requiredField: 'یہ فیلڈ ضروری ہے',

  // Goal Detail Screen
  goalDetails: 'مقصد کی تفصیلات',
  overallProgress: 'مجموعی پیشرفت',
  completed: 'مکمل',
  active: 'فعال',
  remaining: 'باقی',
  surahs: 'سورتیں',
  juz: 'پارے',
  topics: 'موضوعات',
  goalNotFound: 'مقصد نہیں ملا',
  goBack: 'واپس جائیں',
  deleteGoal: 'مقصد حذف کریں',
  deleteGoalConfirm: 'کیا آپ واقعی حذف کرنا چاہتے ہیں',
  complete: 'مکمل',
  expired: 'ختم ہو گیا',
  lastReadOn: 'آخری بار پڑھا',
};
