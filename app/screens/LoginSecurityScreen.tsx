import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  TextInput,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { useCustomAlert } from '../context/CustomAlertContext';
import { apiService } from '../services/ApiService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import StyledText from '../components/StyledText';

export default function LoginSecurityScreen({ navigation }) {
  const { colors } = useTheme();
  const { t } = useLanguage();
  const { showAlert } = useCustomAlert();
  // State for password section
  const [isPasswordExpanded, setIsPasswordExpanded] = useState(false);
  const [passwordData, setPasswordData] = useState({
    lastUpdated: 'Loading...', 
  });
  const [loading, setLoading] = useState(true);

  // State for password inputs
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // State for password visibility
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // State for delete/deactivate modals
  const [deletePasswordInput, setDeletePasswordInput] = useState('');
  const [deactivatePasswordInput, setDeactivatePasswordInput] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showDeactivateModal, setShowDeactivateModal] = useState(false);
  const [processing, setProcessing] = useState(false);

  // Password validation states
  const [validations, setValidations] = useState({
    minLength: false,
    hasLetterAndNumber: false,
    hasUpperLower: false,
    hasSpecialChar: false,
  });

  // Load password update date on mount
  useEffect(() => {
    loadPasswordData();
  }, []);

  // Load password update date
  const loadPasswordData = async () => {
    try {
      const profile = await apiService.getUserProfile();
      if (profile.password_updated_at) {
        const updatedDate = new Date(profile.password_updated_at);
        const now = new Date();
        const diffTime = Math.abs(now.getTime() - updatedDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        let timeAgo = '';
        if (diffDays === 0) {
          timeAgo = t('dateToday');
        } else if (diffDays === 1) {
          timeAgo = t('dateYesterday');
        } else if (diffDays < 30) {
          timeAgo = `${diffDays} ${t('dateDaysAgo')}`;
        } else if (diffDays < 365) {
          const months = Math.floor(diffDays / 30);
          timeAgo = `${months} ${months === 1 ? t('dateMonth') : t('dateMonths')} ago`;
        } else {
          const years = Math.floor(diffDays / 365);
          timeAgo = `${years} ${years === 1 ? t('dateYear') : t('dateYears')} ago`;
        }

        setPasswordData({ lastUpdated: timeAgo });
      } else {
        setPasswordData({ lastUpdated: t('dateNever') });
      }
    } catch (error) {
      setPasswordData({ lastUpdated: t('dateUnknown') });
    } finally {
      setLoading(false);
    }
  };

  // Validate password
  const validatePassword = (password) => {
    const validations = {
      minLength: password.length >= 8,
      hasLetterAndNumber: /[a-zA-Z]/.test(password) && /[0-9]/.test(password),
      hasUpperLower: /[a-z]/.test(password) && /[A-Z]/.test(password),
      hasSpecialChar: /[!@#$%^&*(),.?":{}|<>\]\-=_+[\]\/'`~;]/.test(password),
    };
    setValidations(validations);
    return validations;
  };

  // Handle new password change
  const handleNewPasswordChange = (text) => {
    setNewPassword(text);
    validatePassword(text);
  };

  // Handle password update
  const handleUpdatePassword = async () => {
    // Check if all validations pass
    const allValid = Object.values(validations).every((v) => v === true);

    if (!allValid) {
      showAlert(t('error'), t('passwordRequirementsError'), 'error');
      return;
    }

    if (newPassword !== confirmPassword) {
      showAlert(t('error'), t('passwordsDoNotMatch'), 'error');
      return;
    }

    if (!currentPassword) {
      showAlert(t('error'), t('enterCurrentPasswordPrompt'), 'error');
      return;
    }

    try {
      await apiService.updateUserPassword(currentPassword, newPassword);

      setIsPasswordExpanded(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');

      // Reload password data to show updated timestamp
      await loadPasswordData();

      showAlert(t('success'), t('passwordUpdatedSuccess'), 'success');
    } catch (error: any) {
      showAlert(t('error'), error.message || t('failedToUpdatePassword'), 'error');
    }
  };

  // Handle cancel
  const handleCancel = () => {
    setIsPasswordExpanded(false);
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setValidations({
      minLength: false,
      hasLetterAndNumber: false,
      hasUpperLower: false,
      hasSpecialChar: false,
    });
  };

  // Handle delete account
  const handleDeleteAccount = () => {
    setShowDeleteModal(true);
  };

  // Confirm delete account
  const confirmDeleteAccount = async () => {
    if (!deletePasswordInput) {
      showAlert(t('error'), t('enterPasswordPrompt'), 'error');
      return;
    }

    try {
      setProcessing(true);
      await apiService.deleteUserAccount(deletePasswordInput);
      await AsyncStorage.clear();
      apiService.clearAuthToken();
      setShowDeleteModal(false);
      showAlert(t('accountDeleted'), t('accountDeletedMessage'), 'success');
      setTimeout(() => {
        navigation.reset({
          index: 0,
          routes: [{ name: 'Login' }],
        });
      }, 1500);
    } catch (error: any) {
      showAlert(t('error'), error.message || t('failedToDeleteAccount'), 'error');
    } finally {
      setProcessing(false);
    }
  };

  // Handle deactivate account
  const handleDeactivateAccount = () => {
    setShowDeactivateModal(true);
  };

  // Confirm deactivate account
  const confirmDeactivateAccount = async () => {
    if (!deactivatePasswordInput) {
      showAlert(t('error'), t('enterPasswordPrompt'), 'error');
      return;
    }

    try {
      setProcessing(true);
      await apiService.deactivateUserAccount(deactivatePasswordInput);
      await AsyncStorage.clear();
      apiService.clearAuthToken();
      setShowDeactivateModal(false);
      showAlert(t('accountDeactivated'), t('accountDeactivatedMessage'), 'success');
      setTimeout(() => {
        navigation.reset({
          index: 0,
          routes: [{ name: 'Login' }],
        });
      }, 1500);
    } catch (error: any) {
      showAlert(t('error'), error.message || t('failedToDeactivateAccount'), 'error');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />

      {/* Header */}
      <View className="flex-row items-center border-b border-gray-100 bg-white px-4 py-4">
        <TouchableOpacity
          className="h-10 w-10 items-center justify-center"
          onPress={() => navigation?.goBack()}>
          <Ionicons name="chevron-back" size={28} color="#333" />
        </TouchableOpacity>
        <StyledText className="ml-2 text-lg font-bold text-gray-900">
          {t('loginAndSecurity')}
        </StyledText>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Login Section */}
        <View className="mt-6 px-6">
          {/* Section Header */}
          <View className="mb-4 flex-row items-center">
            <Ionicons name="shield-checkmark-outline" size={20} color="#6B7280" />
            <StyledText className="ml-2 text-base font-bold text-gray-900">
              {t('login')}
            </StyledText>
          </View>

          {/* Password Card */}
          <View className="overflow-hidden rounded-xl border border-gray-200 bg-white">
            {!isPasswordExpanded ? (
              // Collapsed View
              <View className="flex-row items-center justify-between px-4 py-4">
                <View className="flex-1">
                  <StyledText className="mb-1 text-base font-semibold text-gray-900">
                    {t('password')}
                  </StyledText>
                  <StyledText className="text-sm text-gray-500">
                    {t('lastUpdated')} {passwordData.lastUpdated}
                  </StyledText>
                </View>
                <TouchableOpacity onPress={() => setIsPasswordExpanded(true)} className="ml-4">
                  <StyledText className="text-sm font-semibold text-blue-600">
                    {t('update')}
                  </StyledText>
                </TouchableOpacity>
              </View>
            ) : (
              // Expanded View
              <View className="px-4 py-4">
                <View className="mb-4 flex-row items-center justify-between">
                  <StyledText className="text-base font-semibold text-gray-900">
                    {t('password')}
                  </StyledText>
                  <TouchableOpacity onPress={handleCancel}>
                    <StyledText className="text-sm font-semibold text-blue-600">
                      {t('cancel')}
                    </StyledText>
                  </TouchableOpacity>
                </View>

                <StyledText className="mb-4 text-sm text-gray-500">
                  {t('passwordSecurityMessage')}
                </StyledText>

                {/* Current Password */}
                <View className="mb-4">
                  <StyledText className="mb-2 text-sm font-semibold text-gray-700">
                    {t('enterOldPassword')}
                  </StyledText>
                  <View className="flex-row items-center rounded-lg border border-gray-200 bg-gray-50 px-4 py-3">
                    <TextInput
                      className="flex-1 text-base text-gray-900"
                      placeholder="••••••••"
                      value={currentPassword}
                      onChangeText={setCurrentPassword}
                      secureTextEntry={!showCurrentPassword}
                      placeholderTextColor="#9CA3AF"
                    />
                    <TouchableOpacity onPress={() => setShowCurrentPassword(!showCurrentPassword)}>
                      <Ionicons
                        name={showCurrentPassword ? 'eye-off-outline' : 'eye-outline'}
                        size={20}
                        color="#9CA3AF"
                      />
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Forgot Password */}
                <TouchableOpacity className="mb-4">
                  <StyledText className="text-sm font-medium text-blue-600">
                    {t('forgotPassword')}
                  </StyledText>
                </TouchableOpacity>

                {/* New Password */}
                <View className="mb-4">
                  <StyledText className="mb-2 text-sm font-semibold text-gray-700">
                    {t('enterNewPassword')}
                  </StyledText>
                  <View className="flex-row items-center rounded-lg border border-gray-200 bg-gray-50 px-4 py-3">
                    <TextInput
                      className="flex-1 text-base text-gray-900"
                      placeholder="••••••••"
                      value={newPassword}
                      onChangeText={handleNewPasswordChange}
                      secureTextEntry={!showNewPassword}
                      placeholderTextColor="#9CA3AF"
                    />
                    <TouchableOpacity onPress={() => setShowNewPassword(!showNewPassword)}>
                      <Ionicons
                        name={showNewPassword ? 'eye-off-outline' : 'eye-outline'}
                        size={20}
                        color="#9CA3AF"
                      />
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Password Validation Rules */}
                <View className="mb-4 space-y-2">
                  <ValidationItem
                    isValid={validations.minLength}
                    text={t('passwordRule8Chars')}
                  />
                  <ValidationItem
                    isValid={validations.hasLetterAndNumber}
                    text={t('passwordRuleAlphaNumeric')}
                  />
                  <ValidationItem
                    isValid={validations.hasUpperLower}
                    text={t('mustHaveUpperLower')}
                  />
                  <ValidationItem
                    isValid={validations.hasSpecialChar}
                    text={t('useSpecialCharacters')}
                  />
                </View>

                {/* Confirm Password */}
                <View className="mb-4">
                  <StyledText className="mb-2 text-sm font-semibold text-gray-700">
                    {t('confirmNewPassword')}
                  </StyledText>
                  <View className="flex-row items-center rounded-lg border border-gray-200 bg-gray-50 px-4 py-3">
                    <TextInput
                      className="flex-1 text-base text-gray-900"
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChangeText={setConfirmPassword}
                      secureTextEntry={!showConfirmPassword}
                      placeholderTextColor="#9CA3AF"
                    />
                    <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                      <Ionicons
                        name={showConfirmPassword ? 'eye-off-outline' : 'eye-outline'}
                        size={20}
                        color="#9CA3AF"
                      />
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Update Button */}
                <TouchableOpacity
                  className="items-center rounded-lg bg-cyan-500 py-4 active:bg-cyan-600"
                  onPress={handleUpdatePassword}>
                  <StyledText className="text-base font-bold text-white">
                    {t('updatePassword')}
                  </StyledText>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>

        {/* Account Settings Section */}
        <View className="mt-8 px-6 pb-8">
          {/* Section Header */}
          <View className="mb-4 flex-row items-center">
            <Ionicons name="settings-outline" size={20} color="#6B7280" />
            <StyledText className="ml-2 text-base font-bold text-gray-900">
              {t('accountSettings')}
            </StyledText>
          </View>

          {/* Delete Account */}
          <TouchableOpacity
            className="mb-3 flex-row items-center justify-between rounded-xl border border-gray-200 bg-white px-4 py-4"
            onPress={handleDeleteAccount}>
            <StyledText className="text-base font-medium text-gray-900">
              {t('deleteYourAccount')}
            </StyledText>
            <StyledText className="text-sm font-semibold text-red-600">
              {t('delete')}
            </StyledText>
          </TouchableOpacity>

          {/* Deactivate Account */}
          <TouchableOpacity
            className="flex-row items-center justify-between rounded-xl border border-gray-200 bg-white px-4 py-4"
            onPress={handleDeactivateAccount}>
            <StyledText className="text-base font-medium text-gray-900">
              {t('deactivateYourAccount')}
            </StyledText>
            <StyledText className="text-sm font-semibold text-red-600">
              {t('deactivate')}
            </StyledText>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Delete Account Modal */}
      <Modal
        visible={showDeleteModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowDeleteModal(false)}>
        <View className="flex-1 items-center justify-center bg-black/50 px-6">
          <View className="w-full max-w-sm rounded-2xl bg-white p-6">
            <View className="mb-4 items-center">
              <View className="mb-3 h-16 w-16 items-center justify-center rounded-full bg-red-100">
                <Ionicons name="trash-outline" size={32} color="#EF4444" />
              </View>
              <StyledText className="mb-2 text-xl font-bold text-gray-900">{t('deleteAccountTitle')}</StyledText>
              <StyledText className="text-center text-sm text-gray-600">
                {t('deleteAccountMessage')}
              </StyledText>
            </View>

            <View className="mb-4">
              <StyledText className="mb-2 text-sm font-semibold text-gray-700">
                {t('enterPasswordToConfirm')}
              </StyledText>
              <TextInput
                className="rounded-lg border border-gray-300 bg-gray-50 px-4 py-3 text-base text-gray-900"
                placeholder={t('password')}
                value={deletePasswordInput}
                onChangeText={setDeletePasswordInput}
                secureTextEntry
                placeholderTextColor="#9CA3AF"
              />
            </View>

            <View className="flex-row space-x-3">
              <TouchableOpacity
                className="flex-1 rounded-lg border border-gray-300 bg-white py-3"
                onPress={() => {
                  setShowDeleteModal(false);
                  setDeletePasswordInput('');
                }}
                disabled={processing}>
                <StyledText className="text-center font-semibold text-gray-700">{t('cancel')}</StyledText>
              </TouchableOpacity>

              <TouchableOpacity
                className="flex-1 rounded-lg bg-red-600 py-3"
                onPress={confirmDeleteAccount}
                disabled={processing}>
                {processing ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <StyledText className="text-center font-bold text-white">{t('delete')}</StyledText>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Deactivate Account Modal */}
      <Modal
        visible={showDeactivateModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowDeactivateModal(false)}>
        <View className="flex-1 items-center justify-center bg-black/50 px-6">
          <View className="w-full max-w-sm rounded-2xl bg-white p-6">
            <View className="mb-4 items-center">
              <View className="mb-3 h-16 w-16 items-center justify-center rounded-full bg-orange-100">
                <Ionicons name="pause-circle-outline" size={32} color="#F59E0B" />
              </View>
              <StyledText className="mb-2 text-xl font-bold text-gray-900">{t('deactivateAccountTitle')}</StyledText>
              <StyledText className="text-center text-sm text-gray-600">
                {t('deactivateAccountMessage')}
              </StyledText>
            </View>

            <View className="mb-4">
              <StyledText className="mb-2 text-sm font-semibold text-gray-700">
                {t('enterPasswordToConfirm')}
              </StyledText>
              <TextInput
                className="rounded-lg border border-gray-300 bg-gray-50 px-4 py-3 text-base text-gray-900"
                placeholder={t('password')}
                value={deactivatePasswordInput}
                onChangeText={setDeactivatePasswordInput}
                secureTextEntry
                placeholderTextColor="#9CA3AF"
              />
            </View>

            <View className="flex-row space-x-3">
              <TouchableOpacity
                className="flex-1 rounded-lg border border-gray-300 bg-white py-3"
                onPress={() => {
                  setShowDeactivateModal(false);
                  setDeactivatePasswordInput('');
                }}
                disabled={processing}>
                <StyledText className="text-center font-semibold text-gray-700">{t('cancel')}</StyledText>
              </TouchableOpacity>

              <TouchableOpacity
                className="flex-1 rounded-lg bg-orange-600 py-3"
                onPress={confirmDeactivateAccount}
                disabled={processing}>
                {processing ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <StyledText className="text-center font-bold text-white">{t('deactivate')}</StyledText>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

// Validation Item Component
const ValidationItem = ({ isValid, text, isError = false }) => {
  return (
    <View className="mb-2 flex-row items-start">
      <View className="mr-2 mt-0.5">
        {isError ? (
          <Ionicons name="close-circle" size={16} color="#EF4444" />
        ) : (
          <Ionicons
            name={isValid ? 'checkmark-circle' : 'ellipse-outline'}
            size={16}
            color={isValid ? '#2EBBC3' : '#9CA3AF'}
          />
        )}
      </View>
      <StyledText
        className={`flex-1 text-sm ${isError ? 'text-red-600' : isValid ? 'text-green-600' : 'text-gray-600'}`}>
        {text}
      </StyledText>
    </View>
  );
};