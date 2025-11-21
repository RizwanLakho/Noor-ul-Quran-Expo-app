# 🔧 Fix: Clear App Data to Reset

## The Problem:
Your app has stored that onboarding is "complete", but you're not logged in. The app is trying to show the login screen but something is blocking it.

## Quick Fix Options:

### Option 1: Clear App Data on Device (RECOMMENDED)
1. **On Android Device:**
   - Long press the "Expo Go" app
   - Tap "App info"
   - Tap "Storage"
   - Tap "Clear Data" or "Clear Storage"
   - Reopen Expo Go
   - Scan QR code again

2. **Alternative for Android:**
   - Settings → Apps → Expo Go → Storage → Clear Data

### Option 2: Reset Via Code (Do this if Option 1 doesn't work)

I'll add a reset button to your login screen so you can clear data from within the app.

### Option 3: Uninstall & Reinstall Expo Go
1. Uninstall Expo Go app from your device
2. Reinstall from Play Store
3. Scan QR code again

---

## What This Will Reset:
- ✅ Onboarding completion status
- ✅ Login status
- ✅ Stored auth token
- ✅ Any cached data

## What Will NOT Be Lost:
- ✅ Your account in the database (email/password still work)
- ✅ Backend data (topics, quizzes, etc.)

---

## After Clearing Data:

You'll see the onboarding slides again:
1. Swipe through onboarding → Click "Get Started"
2. You'll see the Login screen
3. Login with: `rizwan@rizwan.com` or create new account
4. App should work normally

---

## If Still Stuck:

I can add a "Reset App" button to the login screen that will clear all AsyncStorage data when pressed.

Would you like me to add that?
