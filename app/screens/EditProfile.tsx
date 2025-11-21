import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  TextInput,
  Modal,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { useCustomAlert } from '../context/CustomAlertContext';
import { apiService } from '../services/ApiService';
import StyledText from '../components/StyledText';

export default function EditProfile({ navigation }) {
  const { colors } = useTheme();
  const { t } = useLanguage();
  const { showAlert } = useCustomAlert();
  // State for user data
  const [userData, setUserData] = useState({
    fullName: '',
    firstName: '',
    lastName: '',
    email: '',
  });

  // State for modals
  const [showNameModal, setShowNameModal] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);

  // Temporary state for editing
  const [tempFirstName, setTempFirstName] = useState('');
  const [tempLastName, setTempLastName] = useState('');
  const [tempEmail, setTempEmail] = useState('');

  // Loading states
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Load user profile on mount
  useEffect(() => {
    loadUserProfile();
  }, []);

  const loadUserProfile = async () => {
    try {
      setLoading(true);
      const profile = await apiService.getUserProfile();
      setUserData({
        firstName: profile.first_name || '',
        lastName: profile.last_name || '',
        fullName: `${profile.first_name || ''} ${profile.last_name || ''}`,
        email: profile.email || '',
      });
    } catch (error) {
      // Could not load profile
    } finally {
      setLoading(false);
    }
  };

  // Open name edit modal
  const handleEditName = () => {
    setTempFirstName(userData.firstName);
    setTempLastName(userData.lastName);
    setShowNameModal(true);
  };

  // Save name changes
  const handleSaveName = async () => {
    try {
      setSaving(true);
      await apiService.updateUserProfile(tempFirstName, tempLastName);

      setUserData({
        ...userData,
        firstName: tempFirstName,
        lastName: tempLastName,
        fullName: `${tempFirstName} ${tempLastName}`,
      });
      setShowNameModal(false);
      showAlert(t('success'), t('profileUpdatedSuccess'), 'success');
    } catch (error: any) {
      showAlert(t('error'), error.message || t('failedToUpdateName'), 'error');
    } finally {
      setSaving(false);
    }
  };

  // Cancel name changes
  const handleCancelName = () => {
    setShowNameModal(false);
    setTempFirstName('');
    setTempLastName('');
  };

  // Open email edit modal
  const handleEditEmail = () => {
    setTempEmail(userData.email);
    setShowEmailModal(true);
  };

  // Verify/Save email changes
  const handleVerifyEmail = async () => {
    try {
      setSaving(true);
      await apiService.updateUserEmail(tempEmail);

      setUserData({
        ...userData,
        email: tempEmail,
      });
      setShowEmailModal(false);
      showAlert(t('success'), t('emailUpdatedSuccess'), 'success');
    } catch (error: any) {
      showAlert(t('error'), error.message || t('failedToUpdateEmail'), 'error');
    } finally {
      setSaving(false);
    }
  };

  // Cancel email changes
  const handleCancelEmail = () => {
    setShowEmailModal(false);
    setTempEmail('');
  };

  // Handle profile picture change
  const handleChangeProfilePicture = () => {
    // TODO: Implement image picker
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />

      {/* Header */}
      <View className="flex-row items-center border-b border-gray-100 bg-white px-4 py-4">
        <TouchableOpacity
          className="h-10 w-10 items-center justify-center"
          onPress={() => navigation?.goBack()}>
          <Ionicons name="chevron-back" size={28} color={colors.text} />
        </TouchableOpacity>
        <StyledText className="ml-2 text-lg font-bold text-gray-900">
          {t('editProfile')}
        </StyledText>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Profile Picture Section */}
        <View className="items-center border-b border-gray-100 bg-white px-6 py-8">
          <View className="relative">
            <View className="h-24 w-24 items-center justify-center rounded-full bg-gray-700">
              <Ionicons name="person" size={48} color={colors.surface} />
            </View>

            {/* Edit Icon */}
            <TouchableOpacity
              className="absolute bottom-0 right-0 h-8 w-8 items-center justify-center rounded-full border-2 border-gray-200 bg-white"
              onPress={handleChangeProfilePicture}>
              <Ionicons name="camera" size={16} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Personal Info Section */}
        <View className="mt-6 px-6">
          {/* Section Header */}
          <View className="mb-4 flex-row items-center">
            <Ionicons name="person-outline" size={20} color={colors.textSecondary} />
            <StyledText className="ml-2 text-base font-bold text-gray-900">
              {t('personalInfo')}
            </StyledText>
          </View>

          {/* Full Name Field */}
          <View className="mb-4 overflow-hidden rounded-xl border border-gray-200 bg-white">
            <View className="flex-row items-center justify-between px-4 py-4">
              <View className="flex-1">
                <StyledText className="mb-1 text-sm text-gray-500">
                  {t('fullName')}
                </StyledText>
                <StyledText className="text-base font-medium text-gray-900">
                  {userData.fullName}
                </StyledText>
              </View>
              <TouchableOpacity onPress={handleEditName} className="ml-4">
                <StyledText className="text-sm font-semibold text-blue-600">
                  {t('edit')}
                </StyledText>
              </TouchableOpacity>
            </View>
          </View>

          {/* Email Address Field */}
          <View className="overflow-hidden rounded-xl border border-gray-200 bg-white">
            <View className="flex-row items-center justify-between px-4 py-4">
              <View className="flex-1">
                <StyledText className="mb-1 text-sm text-gray-500">
                  {t('emailAddress')}
                </StyledText>
                <StyledText className="text-base font-medium text-gray-900">
                  {userData.email}
                </StyledText>
              </View>
              <TouchableOpacity onPress={handleEditEmail} className="ml-4">
                <StyledText className="text-sm font-semibold text-blue-600">
                  {t('edit')}
                </StyledText>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Edit Name Modal */}
      <Modal
        visible={showNameModal}
        transparent={true}
        animationType="fade"
        onRequestClose={handleCancelName}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          className="flex-1 items-center justify-center bg-black/50 px-6">
          <View className="w-full max-w-md rounded-2xl bg-white p-6">
            {/* Modal Header */}
            <View className="mb-4 flex-row items-center justify-between">
              <StyledText className="text-lg font-bold text-gray-900">
                {t('fullName')}
              </StyledText>
              <TouchableOpacity onPress={handleCancelName}>
                <StyledText className="font-semibold text-blue-600">
                  {t('cancel')}
                </StyledText>
              </TouchableOpacity>
            </View>

            {/* Description */}
            <StyledText className="mb-6 text-sm leading-5 text-gray-500">
              {t('nameChangeDescription')}
            </StyledText>

            {/* First Name Input */}
            <View className="mb-4">
              <StyledText className="mb-2 text-sm font-semibold text-gray-700">
                {t('firstName')}
              </StyledText>
              <TextInput
                className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-base text-gray-900"
                placeholder={t('firstNamePlaceholder')}
                value={tempFirstName}
                onChangeText={setTempFirstName}
                placeholderTextColor={colors.textSecondary}
              />
            </View>

            {/* Last Name Input */}
            <View className="mb-6">
              <StyledText className="mb-2 text-sm font-semibold text-gray-700">
                {t('lastName')}
              </StyledText>
              <TextInput
                className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-base text-gray-900"
                placeholder={t('lastNamePlaceholder')}
                value={tempLastName}
                onChangeText={setTempLastName}
                placeholderTextColor={colors.textSecondary}
              />
            </View>

            {/* Save Button */}
            <TouchableOpacity
              className="items-center rounded-lg bg-cyan-500 py-4 active:bg-cyan-600"
              onPress={handleSaveName}>
              <StyledText className="text-base font-bold text-white">
                {t('save')}
              </StyledText>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Edit Email Modal */}
      <Modal
        visible={showEmailModal}
        transparent={true}
        animationType="fade"
        onRequestClose={handleCancelEmail}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          className="flex-1 items-center justify-center bg-black/50 px-6">
          <View className="w-full max-w-md rounded-2xl bg-white p-6">
            {/* Modal Header */}
            <View className="mb-4 flex-row items-center justify-between">
              <StyledText className="text-lg font-bold text-gray-900">
                {t('emailAddress')}
              </StyledText>
              <TouchableOpacity onPress={handleCancelEmail}>
                <StyledText className="font-semibold text-blue-600">
                  {t('cancel')}
                </StyledText>
              </TouchableOpacity>
            </View>

            {/* Description */}
            <StyledText className="mb-6 text-sm leading-5 text-gray-500">
              {t('emailChangeDescription')}
            </StyledText>

            {/* Email Input */}
            <View className="mb-6">
              <StyledText className="mb-2 text-sm font-semibold text-gray-700">
                {t('emailAddress')}
              </StyledText>
              <TextInput
                className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-base text-gray-900"
                placeholder={t('emailPlaceholder')}
                value={tempEmail}
                onChangeText={setTempEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                placeholderTextColor={colors.textSecondary}
              />
            </View>

            {/* Verify Button */}
            <TouchableOpacity
              className="items-center rounded-lg bg-cyan-500 py-4 active:bg-cyan-600"
              onPress={handleVerifyEmail}>
              <StyledText className="text-base font-bold text-white">
                {t('verify')}
              </StyledText>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}