# 🔵 Google Sign-In Setup Guide

## Overview

This guide will help you implement Google Sign-In in your Quran app. The backend is already configured and ready to accept Google authentication!

## 📦 Step 1: Install Required Packages

```bash
cd /home/rizwan/Desktop/my-expo-app

# Install Google OAuth packages
npx expo install expo-auth-session expo-web-browser expo-crypto

# Verify installation
npm list expo-auth-session expo-web-browser
```

## 🔧 Step 2: Get Google OAuth Credentials

### 2.1 Go to Google Cloud Console

1. Visit: https://console.cloud.google.com/
2. Create a new project or select your existing project
3. Project name: "Quran App" (or your preferred name)

### 2.2 Enable Google+ API

1. Go to: **APIs & Services** → **Library**
2. Search for "Google+ API"
3. Click **Enable**

### 2.3 Create OAuth Consent Screen

1. Go to: **APIs & Services** → **OAuth consent screen**
2. Select **External** (unless you have Google Workspace)
3. Fill in the required fields:
   - **App name**: Quran App
   - **User support email**: your-email@gmail.com
   - **Developer contact email**: your-email@gmail.com
4. Add scopes:
   - `email`
   - `profile`
5. Click **Save and Continue**

### 2.4 Create OAuth 2.0 Credentials

You need to create **THREE** separate OAuth Client IDs:

#### For Web (Required for Expo Go and Web):

1. Go to: **APIs & Services** → **Credentials**
2. Click **Create Credentials** → **OAuth 2.0 Client ID**
3. Application type: **Web application**
4. Name: "Quran App - Web"
5. **Authorized JavaScript origins**:
   ```
   http://localhost
   http://localhost:19006
   https://auth.expo.io
   ```
6. **Authorized redirect URIs**:
   ```
   https://auth.expo.io/@YOUR_EXPO_USERNAME/YOUR_APP_SLUG
   http://localhost:19006
   ```

   To find your redirect URI:
   - Your Expo username: Check at https://expo.dev/
   - Your app slug: Look in `app.json` → `"slug"` field

   Example: `https://auth.expo.io/@johndoe/quran-app`

7. Click **Create**
8. **Copy the Web Client ID** (format: `xxxxx.apps.googleusercontent.com`)

#### For Android (if building APK):

1. Click **Create Credentials** → **OAuth 2.0 Client ID**
2. Application type: **Android**
3. Name: "Quran App - Android"
4. **Package name**: Get from `app.json`:
   ```json
   {
     "expo": {
       "android": {
         "package": "com.yourcompany.quranapp"
       }
     }
   }
   ```

5. **SHA-1 certificate fingerprint**:

   For debug builds:
   ```bash
   # On macOS/Linux:
   keytool -list -v -keystore ~/.android/debug.keystore -alias androiddebugkey -storepass android -keypass android

   # On Windows:
   keytool -list -v -keystore %USERPROFILE%\.android\debug.keystore -alias androiddebugkey -storepass android -keypass android
   ```

   Copy the SHA-1 fingerprint (format: `AB:CD:EF:12:34:...`)

6. Click **Create**
7. **Copy the Android Client ID**

#### For iOS (if building for iOS):

1. Click **Create Credentials** → **OAuth 2.0 Client ID**
2. Application type: **iOS**
3. Name: "Quran App - iOS"
4. **Bundle ID**: Get from `app.json`:
   ```json
   {
     "expo": {
       "ios": {
         "bundleIdentifier": "com.yourcompany.quranapp"
       }
     }
   }
   ```

5. Click **Create**
6. **Copy the iOS Client ID**

## 📝 Step 3: Update Configuration Files

### 3.1 Update `app.json`

Add the Google configuration:

```json
{
  "expo": {
    "name": "Quran App",
    "slug": "quran-app",
    "scheme": "quranapp",
    "ios": {
      "bundleIdentifier": "com.yourcompany.quranapp",
      "supportsTablet": true
    },
    "android": {
      "package": "com.yourcompany.quranapp",
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#FFFFFF"
      }
    },
    "web": {
      "bundler": "metro"
    },
    "plugins": [
      "expo-auth-session"
    ]
  }
}
```

### 3.2 Update `useGoogleSignIn.ts`

Replace the placeholder Client IDs in `/home/rizwan/Desktop/my-expo-app/app/hooks/useGoogleSignIn.ts`:

```typescript
// Replace these with your actual Google OAuth Client IDs
const GOOGLE_WEB_CLIENT_ID = 'YOUR_WEB_CLIENT_ID.apps.googleusercontent.com';
const GOOGLE_IOS_CLIENT_ID = 'YOUR_IOS_CLIENT_ID.apps.googleusercontent.com';
const GOOGLE_ANDROID_CLIENT_ID = 'YOUR_ANDROID_CLIENT_ID.apps.googleusercontent.com';
```

With your actual IDs:

```typescript
const GOOGLE_WEB_CLIENT_ID = '123456789-abcdefg.apps.googleusercontent.com';
const GOOGLE_IOS_CLIENT_ID = '123456789-hijklmn.apps.googleusercontent.com';
const GOOGLE_ANDROID_CLIENT_ID = '123456789-opqrstu.apps.googleusercontent.com';
```

## 🔗 Step 4: Integrate with Login/SignUp Screens

The integration is already prepared! Just update the `App.tsx` or main navigation file:

```typescript
import { useGoogleSignIn } from './app/hooks/useGoogleSignIn';
import { useCustomAlert } from './app/context/CustomAlertContext';

function YourAuthNavigator() {
  const { showAlert } = useCustomAlert();

  const { signInWithGoogle, loading: googleLoading } = useGoogleSignIn(
    () => {
      // Success callback
      showAlert('Success!', 'Signed in with Google successfully!', 'success');
      // Navigate to main app
    },
    (error) => {
      // Error callback
      showAlert('Google Sign-In Failed', error, 'error');
    }
  );

  return (
    <Stack.Navigator>
      <Stack.Screen name="Login">
        {(props) => (
          <LoginScreen
            {...props}
            onGoogleSignIn={signInWithGoogle}
            onFacebookSignIn={() => showAlert('Coming Soon', 'Facebook login will be implemented next', 'info')}
          />
        )}
      </Stack.Screen>
      {/* ... other screens */}
    </Stack.Navigator>
  );
}
```

## 🧪 Step 5: Test Google Sign-In

### Test in Expo Go:

```bash
cd /home/rizwan/Desktop/my-expo-app
npm start

# Scan QR code with Expo Go app
# Click "Continue with Google" on Login screen
```

### Test on Android Emulator:

```bash
npm run android

# Click "Continue with Google"
# Select your Google account
```

### Test on Web:

```bash
npm run web

# Click "Continue with Google"
# Complete Google authentication
```

## 🐛 Troubleshooting

### Error: "redirect_uri_mismatch"

**Cause**: The redirect URI doesn't match what's configured in Google Cloud Console.

**Fix**:
1. Check the error message for the actual redirect URI being used
2. Add that exact URI to "Authorized redirect URIs" in Google Cloud Console
3. Common URIs to add:
   - `https://auth.expo.io/@YOUR_USERNAME/YOUR_APP_SLUG`
   - `http://localhost:19006`

### Error: "invalid_client"

**Cause**: Wrong Client ID or Client ID not enabled for this platform.

**Fix**:
1. Verify you're using the correct Client ID for the platform (Web/Android/iOS)
2. Make sure the Client ID is active in Google Cloud Console
3. Check that all required fields are filled in the OAuth consent screen

### Error: "Access blocked: This app's request is invalid"

**Cause**: OAuth consent screen not configured properly.

**Fix**:
1. Complete the OAuth consent screen configuration
2. Add your email to test users (if app is in testing mode)
3. Add all required scopes (`email`, `profile`)

### Google Sign-In button does nothing

**Cause**: Packages not installed or configuration missing.

**Fix**:
```bash
# Reinstall packages
npx expo install expo-auth-session expo-web-browser expo-crypto

# Clear cache and restart
npm start --clear
```

## 📊 Backend Status

✅ **Backend is ready!** The backend already has:
- Google OAuth endpoint: `POST /api/auth/google`
- User creation/login with Google
- Profile picture sync
- No password required
- Email pre-verified

## 🎯 What Happens When User Signs In

1. User clicks "Continue with Google"
2. Google login popup appears
3. User selects their Google account
4. Google returns user info (name, email, photo)
5. Backend creates account or logs in existing user
6. User is logged into the app immediately
7. No email verification needed (Google already verified)

## ✅ Testing Checklist

- [ ] Installed expo-auth-session and expo-web-browser
- [ ] Created Google Cloud project
- [ ] Enabled Google+ API
- [ ] Configured OAuth consent screen
- [ ] Created Web Client ID
- [ ] Created Android Client ID (if building for Android)
- [ ] Created iOS Client ID (if building for iOS)
- [ ] Updated app.json with bundle IDs
- [ ] Updated useGoogleSignIn.ts with Client IDs
- [ ] Integrated with Login/SignUp screens
- [ ] Tested on Expo Go
- [ ] Tested on device/emulator

## 📚 Additional Resources

- [Expo AuthSession Docs](https://docs.expo.dev/versions/latest/sdk/auth-session/)
- [Google OAuth 2.0 Setup](https://support.google.com/cloud/answer/6158849)
- [React Navigation Auth Flow](https://reactnavigation.org/docs/auth-flow/)

## 🆘 Need Help?

If you encounter any issues:

1. Check the console logs for detailed error messages
2. Verify all Client IDs are correct
3. Ensure redirect URIs match exactly
4. Try clearing Expo cache: `npm start --clear`
5. Check that Google+ API is enabled

---

**Made with 💙 for the Quran App**

Once Google Sign-In is working, you can follow the same pattern for Facebook OAuth!
