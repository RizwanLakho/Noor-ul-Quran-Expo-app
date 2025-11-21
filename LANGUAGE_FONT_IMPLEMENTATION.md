# 🌍 Language & UI Font Switching - Implementation Guide

## ✅ What's Implemented:

### 1. **Language Context with UI Font Support**
- Added `uiFont` property to LanguageContext
- `uiFont = 'urdu'` when language is Urdu
- `uiFont = 'System'` when language is English
- Saved to AsyncStorage automatically

### 2. **AppearanceScreen - Fully Functional**
- Connected to LanguageContext
- Language options: **English** and **اردو**
- Real-time language switching
- Shows success alert after changing language
- Preview of font in language options

### 3. **Fonts Available**
```
assets/fonts/
├── quranic.ttf  - Quran font option 1
├── uthman.ttf   - Quran font option 2
└── urdu.ttf     - UI font for Urdu language
```

---

## 🎯 How It Works:

### User Flow:
1. User opens: **Profile → Settings → Appearance**
2. Selects language: **English** or **اردو**
3. Alert confirms language change
4. All UI text with `uiFont` applied will change font
5. Setting persists across app restarts

---

## 📝 How to Use UI Font in Your Components:

### Method 1: Using the hook
```typescript
import { useLanguage } from '../context/LanguageContext';

function MyComponent() {
  const { uiFont, language, t } = useLanguage();

  return (
    <Text style={{ fontFamily: uiFont }}>
      {t('someKey')}
    </Text>
  );
}
```

### Method 2: Direct inline
```typescript
import { useLanguage } from '../context/LanguageContext';

function MyComponent() {
  const { uiFont } = useLanguage();

  return (
    <View>
      <Text style={{ fontFamily: uiFont }}>Hello</Text>
      <Text style={{ fontFamily: uiFont, fontSize: 20 }}>مرحبا</Text>
    </View>
  );
}
```

### Method 3: With className (TailwindCSS)
```typescript
<Text
  className="text-lg font-bold text-gray-900"
  style={{ fontFamily: uiFont }}>
  {t('title')}
</Text>
```

---

## 🔧 Files Modified:

### 1. **LanguageContext.tsx**
```typescript
interface LanguageContextType {
  language: AppLanguage;
  translations: Translations;
  setLanguage: (lang: AppLanguage) => void;
  t: (key: keyof Translations) => string;
  uiFont: string; // ✅ NEW - Font for UI text
}

// Get UI font based on language
const uiFont = language === 'ur' ? 'urdu' : 'System';
```

### 2. **AppearanceScreen.tsx**
- ✅ Removed local state
- ✅ Connected to LanguageContext
- ✅ Language switching with font preview
- ✅ Success alerts
- ✅ AsyncStorage persistence

### 3. **settings.types.ts**
- Already had URDU_TRANSLATIONS
- Already had AppLanguage type: 'en' | 'ur'

---

## 🎨 Example Screens to Update:

### Home Screen
```typescript
import { useLanguage } from '../context/LanguageContext';

export default function HomeScreen() {
  const { uiFont, t } = useLanguage();

  return (
    <View>
      <Text style={{ fontFamily: uiFont, fontSize: 24 }}>
        {t('home')}
      </Text>
      <Text style={{ fontFamily: uiFont }}>
        {t('settingsTitle')}
      </Text>
    </View>
  );
}
```

### Settings Screen
```typescript
<Text
  className="text-lg font-bold"
  style={{ fontFamily: uiFont }}>
  {t('settings')}
</Text>
```

### Quiz Screen
```typescript
<Text
  className="text-2xl font-bold"
  style={{ fontFamily: uiFont }}>
  {t('quiz')}
</Text>
```

---

## 🚀 Testing Instructions:

### 1. Rebuild App
```bash
cd ~/Desktop/my-expo-app
npx expo prebuild --clean
npx expo run:android
```

Or for development:
```bash
npx expo start --clear
```

### 2. Test Language Switching
1. Open app → Profile → Settings → **Appearance**
2. Current language is shown (English or اردو)
3. Tap on **اردو** → See alert → Language changes
4. Text in AppearanceScreen uses Urdu font
5. Tap on **English** → See alert → Back to System font
6. Restart app → Language preference persists

### 3. Apply to Other Screens
- Import `useLanguage` hook
- Add `const { uiFont } = useLanguage();`
- Add `style={{ fontFamily: uiFont }}` to Text components

---

## 📊 Language vs Font Mapping:

| Language | Code | UI Font | Quran Font (User Choice) |
|----------|------|---------|--------------------------|
| English  | en   | System  | quranic OR uthman        |
| اردو     | ur   | urdu    | quranic OR uthman        |

**Note:** Quran font is separate from UI font and selected in Reading Settings

---

## 🔄 State Management:

### Language State (LanguageContext):
```typescript
✓ language: 'en' | 'ur'
✓ uiFont: 'System' | 'urdu'
✓ translations: ENGLISH_TRANSLATIONS | URDU_TRANSLATIONS
✓ t(key): Translation function
✓ Saved to: AsyncStorage '@app_language'
```

### Quran Font State (SettingsContext):
```typescript
✓ quranAppearance.arabicFont: 'quranic' | 'uthman'
✓ quranAppearance.textSize: 20-48
✓ Saved to: AsyncStorage '@app_settings'
```

---

## ✨ Summary:

| Feature | Status | Storage |
|---------|--------|---------|
| Language Switching (EN/UR) | ✅ | AsyncStorage |
| UI Font Switching | ✅ | Auto (based on language) |
| Urdu Font (urdu.ttf) | ✅ | Loaded |
| Quran Font Selection | ✅ | AsyncStorage |
| Translation Support | ✅ | Built-in |
| Persistence | ✅ | Survives restart |

---

## 📝 Next Steps (Optional):

1. **Apply `uiFont` to all screens** - Add to Home, Profile, Quiz, etc.
2. **Add more translations** - Update URDU_TRANSLATIONS in settings.types.ts
3. **Add RTL support** - Uncomment RTL code in LanguageContext (requires restart)

---

**Everything is ready! Users can now switch between English and Urdu with proper fonts!** 🎉
