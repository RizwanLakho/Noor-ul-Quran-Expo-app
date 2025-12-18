import React, { useState } from 'react';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import {
  View,
  TouchableOpacity,
  Image,
  StyleSheet,
  ImageBackground,
  ActivityIndicator,
  Alert,
  TextInput,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
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
  EmailVerification: { email: string };
};

type EmailVerificationScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'EmailVerification'
>;

interface EmailVerificationScreenProps {
  navigation: EmailVerificationScreenNavigationProp;
  route: {
    params: {
      email: string;
    };
  };
}

export default function EmailVerificationScreen({
  navigation,
  route,
}: EmailVerificationScreenProps) {
  const { email } = route.params;
  const [loading, setLoading] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [verifying, setVerifying] = useState(false);
  const { showAlert } = useCustomAlert();
  const { t } = useLanguage();
  const { colors, isDark } = useTheme();

  const handleVerifyCode = async () => {
    if (verificationCode.length !== 6) {
      showAlert(t('invalidCode'), t('enter6DigitCode'), 'error');
      return;
    }

    setVerifying(true);
    try {
      const response = await api.verifyEmail(verificationCode.toUpperCase());

      if (response.success) {
        showAlert(
          t('success'),
          t('emailVerifiedLogin'),
          'success'
        );
        // Navigate to login after a short delay
        setTimeout(() => {
          navigation.navigate('Login');
        }, 1500);
      } else {
        showAlert(t('verificationFailed'), response.message || t('invalidOrExpiredCode'), 'error');
      }
    } catch (error) {
      showAlert(t('error'), t('unexpectedError'), 'error');
    } finally {
      setVerifying(false);
    }
  };

  const handleResendEmail = async () => {
    setLoading(true);
    try {
      const response = await api.resendVerification(email);

      if (response.success) {
        showAlert(
          t('emailSent'),
          t('verificationEmailResent'),
          'success'
        );
      } else {
        showAlert(t('failed'), response.message || t('failedToSendEmail'), 'error');
      }
    } catch (error) {
      showAlert(t('error'), t('unexpectedError'), 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleBackToLogin = () => {
    navigation.navigate('Login');
  };

  return (
    <ImageBackground source={bg} resizeMode="cover" style={styles.background}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} backgroundColor={colors.background} />
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.content}>
          {/* Logo */}
          <View style={styles.logoContainer}>
            <Image source={logo} style={styles.logo} resizeMode="contain" />
          </View>

          {/* Main Card */}
          <View style={[styles.card, { backgroundColor: colors.card }]}>
            {/* Icon */}
            <View style={styles.iconContainer}>
              <View style={[styles.iconCircle, { backgroundColor: isDark ? colors.surface : '#E0F5F6', borderColor: colors.primary }]}>
                <Ionicons name="mail-outline" size={60} color={colors.primary} />
              </View>
            </View>

            {/* Header */}
            <StyledText style={[styles.title, { color: colors.text }]}>{t('checkYourEmail')}</StyledText>
            <StyledText style={[styles.subtitle, { color: colors.textSecondary }]}>
              {t('sentVerificationCodeTo')}{'\n'}
              <StyledText style={[styles.email, { color: colors.primary }]}>{email}</StyledText>
            </StyledText>

            {/* Code Input */}
            <View style={styles.codeInputContainer}>
              <StyledText style={[styles.codeInputLabel, { color: colors.text }]}>{t('enterVerificationCode')}</StyledText>
              <TextInput
                style={[styles.codeInput, { backgroundColor: isDark ? colors.surface : '#F9FAFB', borderColor: colors.border, color: colors.text }]}
                value={verificationCode}
                onChangeText={(text) => setVerificationCode(text.toUpperCase())}
                placeholder={t('verificationCodePlaceholder')}
                placeholderTextColor={colors.textSecondary}
                maxLength={6}
                autoCapitalize="characters"
                keyboardType="default"
                autoComplete="off"
                autoCorrect={false}
              />
            </View>

            {/* Verify Button */}
            <TouchableOpacity
              style={[styles.verifyButton, { backgroundColor: colors.primary }, (verifying || verificationCode.length !== 6) && styles.buttonDisabled]}
              onPress={handleVerifyCode}
              disabled={verifying || verificationCode.length !== 6}>
              {verifying ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <>
                  <Ionicons name="checkmark-circle" size={20} color="#FFFFFF" />
                  <StyledText style={styles.verifyButtonText}>{t('verifyEmail')}</StyledText>
                </>
              )}
            </TouchableOpacity>

            {/* Instructions */}
            <View style={[styles.instructionsContainer, { backgroundColor: isDark ? colors.surface : '#F0F9FF', borderColor: isDark ? colors.border : '#BFDBFE' }]}>
              <View style={styles.instructionRow}>
                <Ionicons name="mail" size={20} color={colors.success} />
                <StyledText style={[styles.instructionText, { color: colors.text }]}>
                  {t('checkEmailForCode')}
                </StyledText>
              </View>

              <View style={styles.instructionRow}>
                <Ionicons name="time" size={20} color={colors.success} />
                <StyledText style={[styles.instructionText, { color: colors.text }]}>
                  {t('codeExpiresIn24Hours')}
                </StyledText>
              </View>

              <View style={styles.instructionRow}>
                <Ionicons name="alert-circle" size={20} color={colors.success} />
                <StyledText style={[styles.instructionText, { color: colors.text }]}>
                  {t('checkSpamFolder')}
                </StyledText>
              </View>
            </View>

            {/* Resend Button */}
            <TouchableOpacity
              style={[styles.resendButton, { backgroundColor: colors.card, borderColor: colors.primary }, loading && styles.buttonDisabled]}
              onPress={handleResendEmail}
              disabled={loading}>
              {loading ? (
                <ActivityIndicator color={colors.primary} />
              ) : (
                <>
                  <Ionicons name="refresh" size={20} color={colors.primary} />
                  <StyledText style={[styles.resendButtonText, { color: colors.primary }]}>{t('resendCode')}</StyledText>
                </>
              )}
            </TouchableOpacity>

            {/* Back to Login */}
            <TouchableOpacity style={[styles.loginButton, { backgroundColor: colors.primary }]} onPress={handleBackToLogin}>
              <StyledText style={styles.loginButtonText}>{t('backToLogin')}</StyledText>
            </TouchableOpacity>
          </View>

          {/* Info Box */}
          <View style={[styles.infoBox, { backgroundColor: isDark ? colors.surface : '#DBEAFE', borderColor: isDark ? colors.border : '#93C5FD' }]}>
            <Ionicons name="information-circle" size={20} color={colors.info} />
            <StyledText style={[styles.infoText, { color: isDark ? colors.info : '#1E40AF' }]}>
              {t('postVerificationInfo')}
            </StyledText>
          </View>
        </View>
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
  content: {
    flex: 1,
    paddingHorizontal: 16,
    justifyContent: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  logo: {
    width: 180,
    height: 120,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 32,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  iconCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#E0F5F6',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#2EBBC3',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1A1A1A',
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  email: {
    fontWeight: 'bold',
    color: '#2EBBC3',
  },
  codeInputContainer: {
    marginBottom: 20,
  },
  codeInputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  codeInput: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    letterSpacing: 8,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    color: '#1A1A1A',
  },
  verifyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2EBBC3',
    borderRadius: 12,
    paddingVertical: 16,
    marginBottom: 20,
    shadowColor: '#2EBBC3',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  verifyButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginLeft: 8,
  },
  instructionsContainer: {
    backgroundColor: '#F0F9FF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  instructionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  instructionText: {
    fontSize: 14,
    color: '#374151',
    marginLeft: 12,
    flex: 1,
    lineHeight: 20,
  },
  resendButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingVertical: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#2EBBC3',
  },
  resendButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2EBBC3',
    marginLeft: 8,
  },
  loginButton: {
    backgroundColor: '#2EBBC3',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: '#2EBBC3',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  loginButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DBEAFE',
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
    borderWidth: 1,
    borderColor: '#93C5FD',
  },
  infoText: {
    fontSize: 13,
    color: '#1E40AF',
    marginLeft: 12,
    flex: 1,
    lineHeight: 18,
  },
});