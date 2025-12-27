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
import { RouteProp } from '@react-navigation/native';
import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
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

type ResetPasswordScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'ResetPassword'
>;
type ResetPasswordScreenRouteProp = RouteProp<RootStackParamList, 'ResetPassword'>;

interface ResetPasswordScreenProps {
  navigation: ResetPasswordScreenNavigationProp;
  route: ResetPasswordScreenRouteProp;
}

export default function ResetPasswordScreen({ navigation, route }: ResetPasswordScreenProps) {
  const { email } = route.params;
  const [resetCode, setResetCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { showAlert } = useCustomAlert();
  const { t } = useLanguage();
  const { colors, isDark } = useTheme();

  const handleResetPassword = async () => {
    // Validation
    if (!resetCode.trim()) {
      showAlert(
        t('missingInformation') || 'Missing Information',
        t('enterResetCode') || 'Please enter the reset code sent to your email',
        'error'
      );
      return;
    }

    if (!newPassword.trim()) {
      showAlert(
        t('missingInformation') || 'Missing Information',
        t('enterNewPassword') || 'Please enter your new password',
        'error'
      );
      return;
    }

    if (newPassword !== confirmPassword) {
      showAlert(
        t('passwordMismatch') || "Passwords Don't Match",
        t('passwordMismatchMessage') || 'Please make sure your passwords match',
        'error'
      );
      return;
    }

    // Password strength validation
    if (newPassword.length < 8) {
      showAlert(
        t('weakPassword') || 'Weak Password',
        t('passwordLengthError') || 'Password must be at least 8 characters long',
        'error'
      );
      return;
    }

    if (!/\d/.test(newPassword)) {
      showAlert(
        t('weakPassword') || 'Weak Password',
        t('passwordNumberError') || 'Password must contain at least one number',
        'error'
      );
      return;
    }

    if (!/[A-Z]/.test(newPassword)) {
      showAlert(
        t('weakPassword') || 'Weak Password',
        t('passwordUppercaseError') || 'Password must contain at least one uppercase letter',
        'error'
      );
      return;
    }

    if (!/[!@#$%^&*(),.?":{}|<>]/.test(newPassword)) {
      showAlert(
        t('weakPassword') || 'Weak Password',
        t('passwordSpecialCharError') || 'Password must contain at least one special character',
        'error'
      );
      return;
    }

    setLoading(true);
    try {
      const response = await api.resetPassword(resetCode, newPassword, email);

      if (response.success) {
        showAlert(
          t('success') || 'Success',
          response.message ||
            'Password reset successful! You can now login with your new password.',
          'success'
        );
        // Navigate back to login screen
        setTimeout(() => {
          navigation.navigate('Login');
        }, 2000);
      } else {
        showAlert(t('failed') || 'Failed', response.message || 'Failed to reset password', 'error');
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
            {/* Reset Password Card */}
            <View style={[styles.card, { backgroundColor: colors.card }]}>
              {/* Back Button */}
              <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                <Ionicons name="arrow-back" size={24} color={colors.text} />
              </TouchableOpacity>

              {/* Header */}
              <View style={styles.header}>
                <StyledText style={[styles.welcomeText, { color: colors.text }]}>
                  {t('resetPassword')}
                </StyledText>
                <StyledText style={[styles.subtitle, { color: colors.textSecondary }]}>
                  {t('resetPasswordSubtitle')} {email}
                </StyledText>
              </View>

              {/* Reset Code Input */}
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
                    name="shield-key-outline"
                    size={24}
                    color={colors.textSecondary}
                  />
                </View>
                <TextInput
                  style={[styles.input, { color: colors.text }]}
                  placeholder={t('enterResetCode')}
                  placeholderTextColor={colors.textSecondary}
                  value={resetCode}
                  onChangeText={setResetCode}
                  keyboardType="default"
                  autoCapitalize="characters"
                  maxLength={6}
                  editable={!loading}
                />
              </View>

              {/* New Password Input */}
              <View
                style={[
                  styles.inputContainer,
                  {
                    backgroundColor: isDark ? colors.surface : '#F9F9F9',
                    borderColor: colors.border,
                  },
                ]}>
                <View style={styles.iconContainer}>
                  <Ionicons name="lock-closed-outline" size={24} color={colors.textSecondary} />
                </View>
                <TextInput
                  style={[styles.input, { color: colors.text }]}
                  placeholder={t('enterNewPassword')}
                  placeholderTextColor={colors.textSecondary}
                  value={newPassword}
                  onChangeText={setNewPassword}
                  secureTextEntry={!showNewPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                  editable={!loading}
                />
                <TouchableOpacity
                  style={styles.eyeButton}
                  onPress={() => setShowNewPassword(!showNewPassword)}>
                  <StyledText style={styles.eyeIcon}>{showNewPassword ? '👁️' : '👁️‍🗨️'}</StyledText>
                </TouchableOpacity>
              </View>

              {/* Confirm Password Input */}
              <View
                style={[
                  styles.inputContainer,
                  {
                    backgroundColor: isDark ? colors.surface : '#F9F9F9',
                    borderColor: colors.border,
                  },
                ]}>
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
                  editable={!loading}
                />
                <TouchableOpacity
                  style={styles.eyeButton}
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                  <StyledText style={styles.eyeIcon}>
                    {showConfirmPassword ? '👁️' : '👁️‍🗨️'}
                  </StyledText>
                </TouchableOpacity>
              </View>

              {/* Password Requirements */}
              <View style={styles.requirementsContainer}>
                <StyledText style={[styles.requirementsTitle, { color: colors.textSecondary }]}>
                  {t('passwordRequirements')}
                </StyledText>
                <StyledText style={[styles.requirementText, { color: colors.textSecondary }]}>
                  • {t('passwordRequirement8Chars')}
                </StyledText>
                <StyledText style={[styles.requirementText, { color: colors.textSecondary }]}>
                  • {t('passwordRequirementUppercase')}
                </StyledText>
                <StyledText style={[styles.requirementText, { color: colors.textSecondary }]}>
                  • {t('passwordRequirementNumber')}
                </StyledText>
                <StyledText style={[styles.requirementText, { color: colors.textSecondary }]}>
                  • {t('passwordRequirementSpecial')}
                </StyledText>
              </View>

              {/* Reset Password Button */}
              <TouchableOpacity
                style={[
                  styles.submitButton,
                  { backgroundColor: colors.primary },
                  loading && styles.buttonDisabled,
                ]}
                onPress={handleResetPassword}
                disabled={loading}>
                {loading ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <StyledText style={styles.submitButtonText}>{t('resetPassword')}</StyledText>
                )}
              </TouchableOpacity>

              {/* Back to Login */}
              <View style={styles.backToLoginContainer}>
                <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                  <StyledText style={[styles.backToLoginLink, { color: colors.text }]}>
                    {t('backToLogin')}
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
    marginBottom: 16,
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
  eyeButton: {
    padding: 8,
  },
  eyeIcon: {
    fontSize: 18,
  },
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
  requirementText: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },
  submitButton: {
    backgroundColor: '#2EBBC3',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 16,
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
  backToLoginLink: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1A1A1A',
    textDecorationLine: 'underline',
  },
});
