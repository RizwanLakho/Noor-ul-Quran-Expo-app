import React, { useState } from 'react';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

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
  ImageSourcePropType,
  ActivityIndicator,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import Ionicons from '@expo/vector-icons/Ionicons';
import { api } from '../../utils/api';
import { useCustomAlert } from '../../context/CustomAlertContext';
import { useLanguage } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';
import StyledText from '../../components/StyledText';

const bg = require('../../../assets/bg.png');
const logo = require('../../../assets/logo1.png');
const gimg = require('../../../assets/Google.png');

type RootStackParamList = {
  Login: undefined;
  SignUp: undefined;
  EmailVerification: { email: string };
};

type LoginScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Login'>;

interface LoginScreenProps {
  navigation: LoginScreenNavigationProp;
  logoSource?: ImageSourcePropType;
  onLogin?: () => void;
  onGoogleSignIn?: () => void;
  onFacebookSignIn?: () => void;
  onSkip?: () => void;
}

export default function LoginScreen({
  navigation,
  logoSource,
  onLogin,
  onGoogleSignIn,
  onFacebookSignIn,
  onSkip,
}: LoginScreenProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { showAlert } = useCustomAlert();
  const { t } = useLanguage();
  const { colors, isDark } = useTheme();

  const handleSignIn = async () => {
    // Validation
    if (!email.trim()) {
      showAlert(t('missingInformation'), t('enterEmailPrompt'), 'error');
      return;
    }
    if (!password.trim()) {
      showAlert(t('missingInformation'), t('enterPasswordPrompt'), 'error');
      return;
    }

    setLoading(true);
    try {
      const response = await api.login({ email, password });

      if (response.success) {
        showAlert(t('success'), response.message || t('loginSuccessful'), 'success');
        setTimeout(() => {
          if (onLogin) {
            onLogin();
          }
        }, 1500);
      } else {
        showAlert(t('loginFailed'), response.message || t('invalidCredentials'), 'error');
      }
    } catch (error) {
      showAlert(t('error'), t('unexpectedError'), 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleResendVerification = () => {
    if (!email.trim()) {
      showAlert(
        t('emailRequired'),
        t('enterEmailForVerification'),
        'warning'
      );
      return;
    }

    showAlert(
      t('resendVerificationEmail'),
      t('sendVerificationLinkToEmail').replace('{email}', email),
      'info',
      [
        { text: t('cancel'), style: 'cancel' },
        {
          text: t('send'),
          onPress: async () => {
            setLoading(true);
            try {
              const response = await api.resendVerification(email);
              if (response.success) {
                navigation.navigate('EmailVerification', { email });
              } else {
                showAlert(t('failed'), response.message || t('failedToSendEmail'), 'error');
              }
            } catch (error) {
              showAlert(t('error'), t('unexpectedError'), 'error');
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  return (
    <ImageBackground source={bg} resizeMode="cover" className="flex-1 items-center justify-center">
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} backgroundColor={colors.background} />
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
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
            {/* Welcome Card */}
            <View style={[styles.card, { backgroundColor: colors.card }]}>
              {/* Header */}
              <View style={styles.header}>
                <StyledText style={[styles.welcomeText, { color: colors.text }]}>{t('welcomeBackLogin')}</StyledText>
                <StyledText style={[styles.subtitle, { color: colors.textSecondary }]}>{t('enterCredentialsToSignIn')}</StyledText>
              </View>

              {/* Email Input */}
              <View style={[styles.inputContainer, { backgroundColor: isDark ? colors.surface : '#F9F9F9', borderColor: colors.border }]}>
                <View style={styles.iconContainer}>
                  <MaterialCommunityIcons name="email-outline" size={24} color={colors.textSecondary} />
                </View>
                <TextInput
                  style={[styles.input, { color: colors.text }]}
                  placeholder={t('enterEmailPlaceholder')}
                  placeholderTextColor={colors.textSecondary}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>

              {/* Password Input */}
              <View style={[styles.inputContainer, { backgroundColor: isDark ? colors.surface : '#F9F9F9', borderColor: colors.border }]}>
                <View style={styles.iconContainer}>
                  <Ionicons name="lock-closed-outline" size={24} color={colors.textSecondary} />
                </View>
                <TextInput
                  style={[styles.input, { color: colors.text }]}
                  placeholder={t('enterPasswordPlaceholder')}
                  placeholderTextColor={colors.textSecondary}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                <TouchableOpacity
                  style={styles.eyeButton}
                  onPress={() => setShowPassword(!showPassword)}>
                  <StyledText style={styles.eyeIcon}>{showPassword ? '👁️' : '👁️‍🗨️'}</StyledText>
                </TouchableOpacity>
              </View>

              {/* Forgot Password */}
              <TouchableOpacity style={styles.forgotPassword} onPress={() => showAlert(t('forgotPassword'), t('featureSoon'), 'info')}>
                <StyledText style={[styles.forgotPasswordText, { color: colors.text }]}>{t('forgotPassword')}?</StyledText>
              </TouchableOpacity>

              {/* Sign In Button */}
              <TouchableOpacity
                style={[styles.signUpButton, { backgroundColor: colors.primary }, loading && styles.buttonDisabled]}
                onPress={handleSignIn}
                disabled={loading}>
                {loading ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <StyledText style={styles.signUpButtonText}>{t('signIn')}</StyledText>
                )}
              </TouchableOpacity>

              {/* Divider */}
              <View style={[styles.divider, { backgroundColor: colors.border }]} />

              {/* Google Sign In */}
              <TouchableOpacity style={[styles.socialButton, { backgroundColor: colors.card, borderColor: colors.primary }]} onPress={onGoogleSignIn}>
                <View style={[styles.googleIcon, { backgroundColor: colors.card }]}>
                  <Image source={gimg} resizeMode="contain" />
                </View>
                <StyledText style={[styles.socialButtonText, { color: colors.primary }]}>{t('continueWithGoogle')}</StyledText>
              </TouchableOpacity>

              {/* Facebook Sign In */}
              <TouchableOpacity style={[styles.socialButton, { backgroundColor: colors.card, borderColor: colors.primary }]} onPress={onFacebookSignIn}>
                <View style={styles.facebookIcon}>
                  <StyledText style={styles.fText}>f</StyledText>
                </View>
                <StyledText style={[styles.socialButtonText, { color: colors.primary }]}>{t('continueWithFacebook')}</StyledText>
              </TouchableOpacity>

              {/* Sign Up Link */}
              <View style={styles.signUpContainer}>
                <StyledText style={[styles.signUpPrompt, { color: colors.textSecondary }]}>{t('noAccountPrompt')}</StyledText>
                <TouchableOpacity onPress={() => navigation.navigate('SignUp')}>
                  <StyledText style={[styles.signUpLink, { color: colors.text }]}>{t('signUp')}</StyledText>
                </TouchableOpacity>
              </View>

              {/* Resend Verification Link */}
              <TouchableOpacity
                style={styles.resendVerificationContainer}
                onPress={handleResendVerification}>
                <Ionicons name="mail-outline" size={16} color={colors.textSecondary} />
                <StyledText style={[styles.resendVerificationText, { color: colors.textSecondary }]}>
                  {t('didNotReceiveVerificationEmail')}
                </StyledText>
              </TouchableOpacity>

              {/* Skip Button */}
              <TouchableOpacity
                style={[styles.signUpButton, { backgroundColor: isDark ? colors.surface : '#F0F0F0', marginTop: 10 }]}
                onPress={onSkip}>
                <StyledText style={[styles.signUpButtonText, { color: isDark ? colors.text : '#000' }]}>{t('skipForNow')}</StyledText>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 16,
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 30,
  },
  logo: {
    width: 220,
    height: 240,
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
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E8E8E8',
  },
  iconContainer: {
    marginRight: 12,
  },
  emailIcon: {
    fontSize: 20,
  },
  lockIcon: {
    fontSize: 20,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: '#1A1A1A',
    paddingVertical: 14,
  },
  eyeButton: {
    padding: 8,
  },
  eyeIcon: {
    fontSize: 18,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: 24,
  },
  forgotPasswordText: {
    fontSize: 14,
    color: '#1A1A1A',
    fontWeight: '500',
  },
  signUpButton: {
    backgroundColor: '#2EBBC3',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
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
  signUpButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  divider: {
    height: 1,
    backgroundColor: '#E8E8E8',
    marginBottom: 24,
  },
  socialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: '#2EBBC3',
  },
  googleIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  gText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4285F4',
  },
  facebookIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#1877F2',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  fText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  socialButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#2EBBC3',
    flex: 1,
    textAlign: 'center',
    marginRight: 32,
  },
  signUpContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  signUpPrompt: {
    fontSize: 14,
    color: '#666',
  },
  signUpLink: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1A1A1A',
  },
  resendVerificationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 12,
    paddingVertical: 8,
  },
  resendVerificationText: {
    fontSize: 13,
    color: '#666',
    marginLeft: 6,
    textDecorationLine: 'underline',
  },
});