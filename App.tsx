import React, { useState, useEffect } from 'react';
import { View, TouchableOpacity, Text, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Font from 'expo-font';
import { NavigationContainer } from '@react-navigation/native';
import {
  createNativeStackNavigator,
  NativeStackNavigationOptions,
} from '@react-navigation/native-stack';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

import './global.css';
import LoadingScreen from './app/components/LoadingScreen';
import OnboardingScreen from './app/screens/Onboarding';
import LoginScreen from './app/screens/auth/Login';
import SignUpScreen from './app/screens/auth/SignUp';
import EmailVerificationScreen from './app/screens/auth/EmailVerification';
import BottomTabNavigator from './app/navigation/BottomTabNavigator';
import QuranReadingIntegrated from './app/screens/QuranReadingIntegrated';
// Import all screens
import QuizQuestionScreen from './app/screens/Quizquestionscreen';
import QuizQuestionSubmitScreen from './app/screens/Quizquestionsubmitscreen';
import QuizResultScreen from './app/screens/Quizresultscreen';
import QuizDetailsScreen from './app/screens/Quizdetailsscreen';
import TopicDetailScreen from './app/screens/TopicDetailScreen';
// Context Providers
import { QuizProvider } from './app/context/QuizContext';
import { ThemeProvider } from './app/context/ThemeContext';
import { LanguageProvider } from './app/context/LanguageContext'; // Removed useLanguage import
import { SettingsProvider } from './app/context/SettingsContext';
import { DailyAyahProvider } from './app/context/DailyAyahContext';
import { SearchHistoryProvider } from './app/context/SearchHistoryContext';
import { GoalsProvider } from './app/context/GoalsContext';
import { CustomAlertProvider } from './app/context/CustomAlertContext';
import UserSettingScreen from 'app/screens/UserSettingScreen';
import CustomHeader from 'app/components/Header';
import EditProfile from 'app/screens/EditProfile';
import LoginSecurityScreen from 'app/screens/LoginSecurityScreen';
import DownloadsScreen from 'app/screens/DownloadsScreen';
import ReadingScreen from 'app/screens/ReadingScreen';
import AppearanceScreen from 'app/screens/AppearanceScreen';
import TranslatorSelectionScreen from 'app/screens/TranslatorSelectionScreen';
import { apiService } from './app/services/ApiService';

type RootStackParamList = {
  Onboarding: undefined;
  Login: undefined;
  SignUp: undefined;
  EmailVerification: { email: string };
  Main: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  const [showOnboarding, setShowOnboarding] = useState<boolean | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [fontsLoaded, setFontsLoaded] = useState<boolean>(false);
  // const { t } = useLanguage(); // Removed useLanguage hook call

  // Load fonts
  useEffect(() => {
    const loadFonts = async () => {
      try {
        await Font.loadAsync({
          quranic: require('./assets/fonts/quranic.ttf'),
          uthman: require('./assets/fonts/uthman.ttf'),
          urdu: require('./assets/fonts/urdu.ttf'),
        });
        console.log('✅ Fonts loaded successfully');
        setFontsLoaded(true);
      } catch (error) {
        console.error('❌ Error loading fonts:', error);
        setFontsLoaded(true); // Continue anyway
      }
    };
    loadFonts();
  }, []);

  useEffect(() => {
    const checkAppState = async () => {
      try {
        console.log('📱 Checking app state...'); // Hardcoded for console log
        const onboarding = await AsyncStorage.getItem('@onboarding_complete');
        const loginStatus = await AsyncStorage.getItem('@logged_in');
        const authToken = await AsyncStorage.getItem('@auth_token');

        console.log('App state:', { // Hardcoded for console log
          onboardingComplete: onboarding === 'true',
          loggedIn: loginStatus === 'true',
          hasToken: !!authToken
        });

        // Load auth token into apiService if it exists
        if (authToken) {
          apiService.setAuthToken(authToken);
          console.log('✅ Auth token loaded from storage'); // Hardcoded for console log
        } else {
          console.log('⚠️ No auth token found - user needs to login'); // Hardcoded for console log
        }

        setShowOnboarding(onboarding !== 'true');
        setIsLoggedIn(loginStatus === 'true' && !!authToken);
      } catch (error) {
        console.log('❌ Error checking app state:', error); // Hardcoded for console log
        // On error, reset to fresh state
        setShowOnboarding(true);
        setIsLoggedIn(false);
      }
    };

    checkAppState();
  }, []);

  const handleOnboardingComplete = async () => {
    try {
      await AsyncStorage.setItem('@onboarding_complete', 'true');
      setShowOnboarding(false);
    } catch (error) {
      console.log('Error saving onboarding status:', error); // Hardcoded for console log
    }
  };

  const handleLogin = async () => {
    try {
      await AsyncStorage.setItem('@logged_in', 'true');
      setIsLoggedIn(true);
    } catch (error) {
      console.log('Error setting login status:', error); // Hardcoded for console log
    }
  };

  const handleReset = async () => {
    try {
      await AsyncStorage.clear();
      console.log('✅ App data cleared!'); // Hardcoded for console log
      // Force reload by resetting state
      setShowOnboarding(true);
      setIsLoggedIn(false);
    } catch (error) {
      console.log('Error clearing app data:', error); // Hardcoded for console log
    }
  };

  if (showOnboarding === null || !fontsLoaded) {
    return (
      <LoadingScreen
        message={!fontsLoaded ? 'Loading fonts...' : 'Preparing your Quran experience...'}
      />
    );
  }

  return (
    <CustomAlertProvider>
      <ThemeProvider>
        <LanguageProvider>
          <SettingsProvider>
            <DailyAyahProvider>
              <SearchHistoryProvider>
                <GoalsProvider>
                  <QuizProvider>
                    <SafeAreaView className="flex-1">
                      <StatusBar style="auto" />

                  {showOnboarding ? (
                    <OnboardingScreen onComplete={handleOnboardingComplete} />
                  ) : (
                    <NavigationContainer>
                      <Stack.Navigator screenOptions={{ headerShown: false }}>
                        {!isLoggedIn ? (
                          <>
                            <Stack.Screen name="Login">
                              {(props) => (
                                <LoginScreen
                                  {...props}
                                  onLogin={handleLogin}
                                />
                              )}
                            </Stack.Screen>

                            <Stack.Screen name="SignUp">
                              {(props) => (
                                <SignUpScreen
                                  {...props}
                                  onSignUp={handleLogin}
                                />
                              )}
                            </Stack.Screen>

                            <Stack.Screen
                              name="EmailVerification"
                              component={EmailVerificationScreen}
                              options={{ headerShown: false }}
                            />
                          </>
                        ) : (
                          <>
                            <Stack.Screen
                              name="Main"
                              component={BottomTabNavigator}
                              options={{
                                headerShown: false,
                              }}
                            />
                            <Stack.Screen
                              name="QuranReader"
                              component={QuranReadingIntegrated}
                              options={{
                                headerShown: false,
                              }}
                            />

                            {/* Quiz Screens */}

                            <Stack.Screen name="QuizQuestion" component={QuizQuestionScreen} />
                            <Stack.Screen
                              name="QuizQuestionSubmit"
                              component={QuizQuestionSubmitScreen}
                            />
                            <Stack.Screen name="QuizResult" component={QuizResultScreen} />
                            <Stack.Screen name="QuizDetails" component={QuizDetailsScreen} />
                            <Stack.Screen
                              name="TopicDetail"
                              component={TopicDetailScreen}
                              options={{ headerShown: false }}
                            />
                            <Stack.Screen name="UserSettings" component={UserSettingScreen} />
                            <Stack.Screen name="EditProfile" component={EditProfile} />
                            <Stack.Screen
                              name="LoginSecurityScreen"
                              component={LoginSecurityScreen}
                            />
                            <Stack.Screen name="DownloadScreen" component={DownloadsScreen} />
                            <Stack.Screen name="ReadingScreen" component={ReadingScreen} />
                            <Stack.Screen name="AppearanceScreen" component={AppearanceScreen} />
                            <Stack.Screen
                              name="TranslatorSelection"
                              component={TranslatorSelectionScreen}
                            />
                          </>
                        )}
                      </Stack.Navigator>
                    </NavigationContainer>
                  )}
                  </SafeAreaView>
                  </QuizProvider>
                </GoalsProvider>
              </SearchHistoryProvider>
            </DailyAyahProvider>
          </SettingsProvider>
        </LanguageProvider>
      </ThemeProvider>
    </CustomAlertProvider>
  );
}