import { useState, useEffect } from 'react';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import { api } from '../utils/api';

// This is required for expo-auth-session to work properly on web
WebBrowser.maybeCompleteAuthSession();

/**
 * Google Sign-In Hook
 *
 * Setup Instructions:
 * 1. Get Google OAuth credentials from: https://console.cloud.google.com/
 * 2. Create OAuth 2.0 Client ID for:
 *    - Android (if building for Android)
 *    - iOS (if building for iOS)
 *    - Web (for Expo Go and web builds)
 * 3. Add your client IDs below
 * 4. For Android: Add SHA-1 certificate fingerprint
 * 5. For iOS: Add bundle identifier
 */

// TODO: Replace these with your actual Google OAuth Client IDs
const GOOGLE_WEB_CLIENT_ID = 'YOUR_WEB_CLIENT_ID.apps.googleusercontent.com';
const GOOGLE_IOS_CLIENT_ID = 'YOUR_IOS_CLIENT_ID.apps.googleusercontent.com';
const GOOGLE_ANDROID_CLIENT_ID = 'YOUR_ANDROID_CLIENT_ID.apps.googleusercontent.com';

export const useGoogleSignIn = (onSuccess?: () => void, onError?: (error: string) => void) => {
  const [loading, setLoading] = useState(false);

  // Configure Google Auth Request
  const [request, response, promptAsync] = Google.useAuthRequest({
    webClientId: GOOGLE_WEB_CLIENT_ID,
    iosClientId: GOOGLE_IOS_CLIENT_ID,
    androidClientId: GOOGLE_ANDROID_CLIENT_ID,
  });

  // Handle authentication response
  useEffect(() => {
    if (response?.type === 'success') {
      const { authentication } = response;
      handleGoogleSignIn(authentication?.idToken || '');
    } else if (response?.type === 'error') {
      console.error('Google Sign-In Error:', response.error);
      onError?.('Google Sign-In failed. Please try again.');
      setLoading(false);
    } else if (response?.type === 'dismiss' || response?.type === 'cancel') {
      setLoading(false);
    }
  }, [response]);

  const handleGoogleSignIn = async (idToken: string) => {
    try {
      setLoading(true);

      // Get user info from Google
      const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: { Authorization: `Bearer ${idToken}` },
      });

      if (!userInfoResponse.ok) {
        throw new Error('Failed to get user info from Google');
      }

      const userInfo = await userInfoResponse.json();

      // Authenticate with backend
      const response = await api.googleSignIn({
        idToken,
        email: userInfo.email,
        firstName: userInfo.given_name || '',
        lastName: userInfo.family_name || '',
        profilePicture: userInfo.picture || undefined,
      });

      if (response.success) {
        onSuccess?.();
      } else {
        onError?.(response.message || 'Google Sign-In failed');
      }
    } catch (error: any) {
      console.error('Google Sign-In error:', error);
      onError?.(error.message || 'An error occurred during Google Sign-In');
    } finally {
      setLoading(false);
    }
  };

  const signInWithGoogle = async () => {
    if (!request) {
      onError?.('Google Sign-In is not ready. Please try again.');
      return;
    }

    setLoading(true);
    try {
      await promptAsync();
    } catch (error: any) {
      console.error('Error prompting Google Sign-In:', error);
      onError?.('Failed to open Google Sign-In. Please try again.');
      setLoading(false);
    }
  };

  return {
    signInWithGoogle,
    loading,
    isReady: !!request,
  };
};

/**
 * Setup Guide for Google OAuth
 *
 * 1. Go to Google Cloud Console: https://console.cloud.google.com/
 * 2. Create a new project or select existing
 * 3. Enable Google+ API
 * 4. Go to Credentials → Create Credentials → OAuth 2.0 Client ID
 *
 * For Web:
 *   - Application type: Web application
 *   - Authorized JavaScript origins: http://localhost:19006 (for Expo web)
 *   - Authorized redirect URIs: https://auth.expo.io/@YOUR_USERNAME/YOUR_APP_SLUG
 *
 * For Android:
 *   - Application type: Android
 *   - Package name: From app.json (e.g., com.yourcompany.quranapp)
 *   - SHA-1: Run `keytool -list -v -keystore ~/.android/debug.keystore -alias androiddebugkey`
 *   - Password: android
 *
 * For iOS:
 *   - Application type: iOS
 *   - Bundle ID: From app.json (e.g., com.yourcompany.quranapp)
 *
 * 5. Copy the Client IDs and replace the constants above
 * 6. Add to app.json:
 *    "expo": {
 *      "scheme": "your-app-scheme",
 *      "ios": {
 *        "bundleIdentifier": "com.yourcompany.quranapp"
 *      },
 *      "android": {
 *        "package": "com.yourcompany.quranapp"
 *      }
 *    }
 */
