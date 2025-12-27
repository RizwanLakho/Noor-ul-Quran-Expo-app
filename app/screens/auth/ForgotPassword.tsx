import React, { useState } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ImageBackground,
  ActivityIndicator,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import Ionicons from '@expo/vector-icons/Ionicons';
import { api } from '../../utils/api';
import { useCustomAlert } from '../../context/CustomAlertContext';
import { useLanguage } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';
import StyledText from '../../components/StyledText';

const bg = require('../../../assets/bg.png');
const logo = require('../../../assets/logo1.png');

type RootStackParamList = {
  Login: undefined;
  ForgotPassword: undefined;
  ResetPassword: { email: string };
};

type ForgotPasswordScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'ForgotPassword'
>;

interface ForgotPasswordScreenProps {
  navigation: ForgotPasswordScreenNavigationProp;
}

export default function ForgotPasswordScreen({ navigation }: ForgotPasswordScreenProps) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const { showAlert } = useCustomAlert();
  const { t } = useLanguage();
  const { colors, isDark } = useTheme();

  const handleSendResetCode = async () => {
    // Validation
    if (!email.trim()) {
      showAlert(
        t('missingInformation') || 'Missing Information',
        t('enterEmailPrompt') || 'Please enter your email address',
        'error'
      );
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      showAlert(
        t('invalidEmail') || 'Invalid Email',
        t('enterValidEmail') || 'Please enter a valid email address',
        'error'
      );
      return;
    }

    setLoading(true);
    try {
      const response = await api.forgotPassword(email);

      if (response.success) {
        showAlert(
          t('success') || 'Success',
          response.message || 'Password reset code sent to your email',
          'success'
        );
        // Navigate to reset password screen with email
        setTimeout(() => {
          navigation.navigate('ResetPassword', { email });
        }, 1500);
      } else {
        showAlert(
          t('failed') || 'Failed',
          response.message || 'Failed to send reset code',
          'error'
        );
      }
    } catch (error) {
      showAlert(
        t('error') || 'Error',
        t('unexpectedError') || 'An unexpected error occurred',
        'error'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <ImageBackground source={bg} resizeMode="cover" style={styles.background}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      <SafeAreaView style={[styles.container, { backgroundColor: 'transparent' }]}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}>
          {/* Logo Section */}
          <View style={styles.logoContainer}>
            {logo ? (
              <Image source={logo} style={styles.logo} resizeMode="contain" />
            ) : (
              <View style={styles.logoPlaceholder}>
                <StyledText style={styles.logoText}>LOGO</StyledText>
              </View>
            )}
          </View>

          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled">
            {/* Forgot Password Card */}
            <View style={[styles.card, { backgroundColor: colors.card }]}>
              {/* Back Button */}
              <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                <Ionicons name="arrow-back" size={24} color={colors.text} />
              </TouchableOpacity>

              {/* Header */}
              <View style={styles.header}>
                <StyledText style={[styles.welcomeText, { color: colors.text }]}>
                  {t('forgotPassword') || 'Forgot Password'}
                </StyledText>
                <StyledText style={[styles.subtitle, { color: colors.textSecondary }]}>
                  Enter your email address and we will send you a code to reset your password
                </StyledText>
              </View>

              {/* Email Input */}
              <View
                style={[
                  styles.inputContainer,
                  {
                    backgroundColor: isDark ? colors.surface : '#F9F9F9',
                    borderColor: colors.border,
                  },
                ]}>
                <View style={styles.iconContainer}>
                  <MaterialCommunityIcons
                    name="email-outline"
                    size={24}
                    color={colors.textSecondary}
                  />
                </View>
                <TextInput
                  style={[styles.input, { color: colors.text }]}
                  placeholder={t('enterEmailPlaceholder') || 'Enter your email'}
                  placeholderTextColor={colors.textSecondary}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  editable={!loading}
                />
              </View>

              {/* Send Code Button */}
              <TouchableOpacity
                style={[
                  styles.submitButton,
                  { backgroundColor: colors.primary },
                  loading && styles.buttonDisabled,
                ]}
                onPress={handleSendResetCode}
                disabled={loading}>
                {loading ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <StyledText style={styles.submitButtonText}>Send Reset Code</StyledText>
                )}
              </TouchableOpacity>

              {/* Back to Login */}
              <View style={styles.backToLoginContainer}>
                <StyledText style={[styles.backToLoginText, { color: colors.textSecondary }]}>
                  {t('rememberPassword') || 'Remember your password?'}
                </StyledText>
                <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                  <StyledText style={[styles.backToLoginLink, { color: colors.text }]}>
                    {t('signIn') || 'Sign In'}
                  </StyledText>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 16,
    marginTop: 100,
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 30,
  },
  logo: {
    width: 180,
    height: 120,
  },
  logoPlaceholder: {
    width: 180,
    height: 120,
    backgroundColor: '#E0E0E0',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#999',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    marginBottom: 24,
  },
  backButton: {
    marginBottom: 16,
    width: 40,
    height: 40,
    justifyContent: 'center',
  },
  header: {
    marginBottom: 24,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#B0B0B0',
    lineHeight: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9F9F9',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 4,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#E8E8E8',
  },
  iconContainer: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: '#1A1A1A',
    paddingVertical: 8,
  },
  submitButton: {
    backgroundColor: '#2EBBC3',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 24,
    shadowColor: '#2EBBC3',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  buttonDisabled: {
    backgroundColor: '#A0D9DC',
    opacity: 0.7,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  backToLoginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  backToLoginText: {
    fontSize: 14,
    color: '#666',
  },
  backToLoginLink: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1A1A1A',
  },
});
