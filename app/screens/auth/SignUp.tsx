import React, { useState, useEffect } from 'react';
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

type SignUpScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'SignUp'>;

interface SignUpScreenProps {
  navigation: SignUpScreenNavigationProp;
  onGoogleSignIn?: () => void;
  onFacebookSignIn?: () => void;
  onSignUp?: () => void;
}

export default function SignUpScreen({
  navigation,
  onGoogleSignIn,
  onFacebookSignIn,
  onSignUp,
}: SignUpScreenProps) {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { showAlert } = useCustomAlert();
  const { t } = useLanguage();
  const { colors, isDark } = useTheme();

  // Password validation state
  const [passwordRequirements, setPasswordRequirements] = useState({
    minLength: false,
    hasNumber: false,
    hasUpperCase: false,
    hasSymbol: false,
  });

  // Validate password in real-time
  useEffect(() => {
    setPasswordRequirements({
      minLength: password.length >= 8,
      hasNumber: /\d/.test(password),
      hasUpperCase: /[A-Z]/.test(password),
      hasSymbol: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    });
  }, [password]);

  // Check if all password requirements are met
  const isPasswordValid = () => {
    return Object.values(passwordRequirements).every((req) => req === true);
  };

  const handleSignUp = async () => {
    // Validation
    if (!firstName.trim()) {
      showAlert(t('missingInformation'), t('enterFirstNamePrompt'));
      return;
    }
    if (!lastName.trim()) {
      showAlert(t('missingInformation'), t('enterLastNamePrompt'));
      return;
    }
    if (!email.trim()) {
      showAlert(t('missingInformation'), t('enterEmailPrompt'));
      return;
    }
    if (!password.trim()) {
      showAlert(t('missingInformation'), t('enterPasswordPrompt'));
      return;
    }
    if (!isPasswordValid()) {
      showAlert(t('weakPassword'), t('passwordRequirementsBelow'));
      return;
    }
    if (password !== confirmPassword) {
      showAlert(t('passwordMismatch'), t('passwordsDoNotMatch'));
      return;
    }

    setLoading(true);
    try {
      const response = await api.signUp({ firstName, lastName, email, password });

      if (response.success) {
        // Navigate to email verification screen
        setTimeout(() => {
          navigation.navigate('EmailVerification', { email });
        }, 500);
      } else {
        showAlert(t('registrationFailed'), response.message || t('unableToCreateAccount'), 'error');
      }
    } catch (error) {
      showAlert(t('error'), t('unexpectedError'), 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ImageBackground source={bg} resizeMode="cover" style={styles.background}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} backgroundColor={colors.background} />
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}>
          <View style={styles.logoContainer}>
            <Image source={logo} style={styles.logo} resizeMode="contain" />
          </View>

          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled">
            {/* Logo Section */}

            {/* Sign Up Card */}
            <View style={[styles.card, { backgroundColor: colors.card }]}>
              {/* Header */}
              <View style={styles.header}>
                <StyledText style={[styles.welcomeText, { color: colors.text }]}>{t('createAccount')}</StyledText>
                <StyledText style={[styles.subtitle, { color: colors.textSecondary }]}>{t('connectWithQuran')}</StyledText>
              </View>

              {/* First Name Input */}
              <View style={[styles.inputContainer, { backgroundColor: isDark ? colors.surface : '#F9F9F9', borderColor: colors.border }]}>
                <View style={styles.iconContainer}>
                  <FontAwesome6 name="user" size={24} color={colors.textSecondary} />
                </View>
                <TextInput
                  style={[styles.input, { color: colors.text }]}
                  placeholder={t('firstName')}
                  placeholderTextColor={colors.textSecondary}
                  value={firstName}
                  onChangeText={setFirstName}
                  autoCapitalize="words"
                  autoCorrect={false}
                />
              </View>

              {/* Last Name Input */}
              <View style={[styles.inputContainer, { backgroundColor: isDark ? colors.surface : '#F9F9F9', borderColor: colors.border }]}>
                <View style={styles.iconContainer}>
                  <FontAwesome6 name="user" size={24} color={colors.textSecondary} />
                </View>
                <TextInput
                  style={[styles.input, { color: colors.text }]}
                  placeholder={t('lastName')}
                  placeholderTextColor={colors.textSecondary}
                  value={lastName}
                  onChangeText={setLastName}
                  autoCapitalize="words"
                  autoCorrect={false}
                />
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

              {/* Password Requirements */}
              {password.length > 0 && (
                <View style={[styles.requirementsContainer, { backgroundColor: isDark ? colors.surface : '#F0F9FF', borderColor: isDark ? colors.border : '#BFDBFE' }]}>
                  <StyledText style={[styles.requirementsTitle, { color: isDark ? colors.info : '#1E40AF' }]}>{t('passwordRequirementsTitle')}</StyledText>

                  <View style={styles.requirementRow}>
                    <Ionicons
                      name={passwordRequirements.minLength ? 'checkmark-circle' : 'close-circle'}
                      size={18}
                      color={passwordRequirements.minLength ? colors.success : colors.error}
                    />
                    <StyledText style={[
                      styles.requirementText,
                      { color: passwordRequirements.minLength ? colors.success : colors.textSecondary },
                      passwordRequirements.minLength && styles.requirementMet
                    ]}>
                      {t('passwordRule8Chars')}
                    </StyledText>
                  </View>

                  <View style={styles.requirementRow}>
                    <Ionicons
                      name={passwordRequirements.hasNumber ? 'checkmark-circle' : 'close-circle'}
                      size={18}
                      color={passwordRequirements.hasNumber ? colors.success : colors.error}
                    />
                    <StyledText style={[
                      styles.requirementText,
                      { color: passwordRequirements.hasNumber ? colors.success : colors.textSecondary },
                      passwordRequirements.hasNumber && styles.requirementMet
                    ]}>
                      {t('passwordRule1Number')}
                    </StyledText>
                  </View>

                  <View style={styles.requirementRow}>
                    <Ionicons
                      name={passwordRequirements.hasUpperCase ? 'checkmark-circle' : 'close-circle'}
                      size={18}
                      color={passwordRequirements.hasUpperCase ? colors.success : colors.error}
                    />
                    <StyledText style={[
                      styles.requirementText,
                      { color: passwordRequirements.hasUpperCase ? colors.success : colors.textSecondary },
                      passwordRequirements.hasUpperCase && styles.requirementMet
                    ]}>
                      {t('passwordRule1CapitalLetter')}
                    </StyledText>
                  </View>

                  <View style={styles.requirementRow}>
                    <Ionicons
                      name={passwordRequirements.hasSymbol ? 'checkmark-circle' : 'close-circle'}
                      size={18}
                      color={passwordRequirements.hasSymbol ? colors.success : colors.error}
                    />
                    <StyledText style={[
                      styles.requirementText,
                      { color: passwordRequirements.hasSymbol ? colors.success : colors.textSecondary },
                      passwordRequirements.hasSymbol && styles.requirementMet
                    ]}>
                      {t('passwordRule1Symbol')}
                    </StyledText>
                  </View>
                </View>
              )}

              {/* Confirm Password Input */}
              <View style={[styles.inputContainer, { backgroundColor: isDark ? colors.surface : '#F9F9F9', borderColor: colors.border }]}>
                <View style={styles.iconContainer}>
                  <Ionicons name="lock-closed-outline" size={24} color={colors.textSecondary} />
                </View>
                <TextInput
                  style={[styles.input, { color: colors.text }]}
                  placeholder={t('confirmNewPassword')}
                  placeholderTextColor={colors.textSecondary}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry={!showConfirmPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                <TouchableOpacity
                  style={styles.eyeButton}
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                  <StyledText style={styles.eyeIcon}>{showConfirmPassword ? '👁️' : '👁️‍🗨️'}</StyledText>
                </TouchableOpacity>
              </View>

              {/* Sign Up Button */}
              <TouchableOpacity
                style={[styles.signUpButton, { backgroundColor: colors.primary }, loading && styles.buttonDisabled]}
                onPress={handleSignUp}
                disabled={loading}>
                {loading ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <StyledText style={styles.signUpButtonText}>{t('signUp')}</StyledText>
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

              {/* Sign In Link */}
              <View style={styles.signInContainer}>
                <StyledText style={[styles.signInPrompt, { color: colors.textSecondary }]}>{t('alreadyHaveAccountPrompt')}</StyledText>
                <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                  <StyledText style={[styles.signInLink, { color: colors.text }]}>{t('signIn')}</StyledText>
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
  userIcon: {
    fontSize: 20,
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
  signUpButton: {
    backgroundColor: '#2EBBC3',
    borderRadius: 12,
    paddingVertical: 16,
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
  signInContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  signInPrompt: {
    fontSize: 14,
    color: '#666',
  },
  signInLink: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1A1A1A',
  },
  // Password Requirements Styles
  requirementsContainer: {
    backgroundColor: '#F0F9FF',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  requirementsTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1E40AF',
    marginBottom: 8,
  },
  requirementRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  requirementText: {
    fontSize: 13,
    color: '#6B7280',
    marginLeft: 8,
  },
  requirementMet: {
    color: '#10B981',
    fontWeight: '500',
  },
});