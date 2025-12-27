import React, { useState, useEffect } from 'react';
import { View, ScrollView, TouchableOpacity, StatusBar, Image, ActivityIndicator, BackHandler } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as Updates from 'expo-updates';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { useCustomAlert } from '../context/CustomAlertContext';
import { apiService } from '../services/ApiService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import StyledText from '../components/StyledText';

export default function UserSettingScreen({ navigation }) {
  const { colors } = useTheme();
  const { t } = useLanguage();
  const { showAlert } = useCustomAlert();
  const [userName, setUserName] = useState('User');
  const [profilePicture, setProfilePicture] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  // Load user profile
  useEffect(() => {
    loadUserProfile();
  }, []);

  const loadUserProfile = async () => {
    try {
      const profile = await apiService.getUserProfile();
      setUserName(`${profile.first_name || ''} ${profile.last_name || ''}`);
      if (profile.profile_picture) {
        setProfilePicture(profile.profile_picture);
      }
    } catch (error) {
      // Could not load profile
    }
  };

  /**
   * Handle profile picture selection and upload
   */
  const handlePickImage = async () => {
    try {
      // Request permissions
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permissionResult.granted) {
        showAlert(
          t('permissionRequired') || 'Permission Required',
          t('cameraPermissionMessage') || 'Please allow access to your photos to upload a profile picture.',
          'warning'
        );
        return;
      }

      // Show options: Camera or Gallery
      showAlert(
        t('selectImage') || 'Select Profile Picture',
        t('chooseImageSource') || 'Choose image source',
        'info',
        [
          {
            text: t('camera') || 'Camera',
            onPress: () => openCamera(),
          },
          {
            text: t('gallery') || 'Gallery',
            onPress: () => openGallery(),
          },
          {
            text: t('cancel') || 'Cancel',
            style: 'cancel',
          },
        ]
      );
    } catch (error) {
      console.error('Error picking image:', error);
      showAlert(t('error') || 'Error', t('failedToPickImage') || 'Failed to pick image', 'error');
    }
  };

  const openCamera = async () => {
    try {
      const cameraPermission = await ImagePicker.requestCameraPermissionsAsync();
      if (!cameraPermission.granted) {
        showAlert(t('permissionRequired') || 'Permission Required', t('cameraPermissionMessage') || 'Camera permission is required', 'warning');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        await uploadProfilePicture(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error opening camera:', error);
    }
  };

  const openGallery = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        await uploadProfilePicture(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error opening gallery:', error);
    }
  };

  const uploadProfilePicture = async (imageUri) => {
    try {
      setUploadingImage(true);

      // Create form data
      const formData = new FormData();
      const filename = imageUri.split('/').pop();
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : 'image/jpeg';

      formData.append('profile_picture', {
        uri: imageUri,
        name: filename,
        type: type,
      });

      // Upload to backend
      const response = await apiService.uploadProfilePicture(formData);

      if (response.profile_picture) {
        setProfilePicture(response.profile_picture);
        showAlert(t('success') || 'Success', t('profilePictureUpdated') || 'Profile picture updated successfully!', 'success');
      }
    } catch (error) {
      console.error('Error uploading profile picture:', error);
      showAlert(t('error') || 'Error', t('failedToUploadImage') || 'Failed to upload profile picture', 'error');
    } finally {
      setUploadingImage(false);
    }
  };

  const menuSections = [
    {
      title: t('settingsTitle'),
      items: [
        { icon: 'person-outline', label: t('editProfile'), screen: 'EditProfile' },
        {
          icon: 'shield-checkmark-outline',
          label: t('loginAndSecurity'),
          screen: 'LoginSecurityScreen',
        },
        { icon: 'color-palette-outline', label: t('appearance'), screen: 'AppearanceScreen' },
        { icon: 'book-outline', label: t('reading'), screen: 'ReadingScreen' },
        { icon: 'download-outline', label: t('downloads'), screen: 'DownloadScreen' },
      ],
    },
    {
      title: t('support'),
      items: [
        { icon: 'help-circle-outline', label: t('helpCenter'), screen: 'HelpCenter' },
        { icon: 'headset-outline', label: t('customerSupport'), screen: 'CustomerSupport' },
        { icon: 'chatbubble-outline', label: t('faqs'), screen: 'FAQs' },
      ],
    },
    {
      title: t('legal'),
      items: [
        { icon: 'document-text-outline', label: t('termsOfService'), screen: 'Terms' },
        { icon: 'lock-closed-outline', label: t('privacyPolicy'), screen: 'Privacy' },
      ],
    },
  ];

  const handleNavigation = (screen) => {
    if (screen && typeof screen === 'string') {
      navigation.navigate(screen);
    } else {
      // Invalid screen name
    }
  };

  const handleLogout = async () => {
    showAlert(
      t('logout') || 'Logout',
      t('logoutConfirmation') || 'Are you sure you want to logout?',
      'warning',
      [
        {
          text: t('logout') || 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              // Clear all app data
              await AsyncStorage.clear();
              // Clear API token
              apiService.clearAuthToken();

              // Show success message and close app
              showAlert(
                t('success') || 'Success',
                t('loggedOutSuccess') || 'You have been logged out successfully. The app will close now. Please reopen to login.',
                'success',
                [
                  {
                    text: 'OK',
                    onPress: () => {
                      // Close the app after a short delay
                      setTimeout(() => {
                        BackHandler.exitApp();
                      }, 500);
                    },
                  },
                ]
              );
            } catch (error) {
              console.error('Logout error:', error);
              // Even if there's an error, data is cleared
              showAlert(
                t('success') || 'Success',
                t('loggedOutRestart') || 'You have been logged out. Please restart the app.',
                'success',
                [
                  {
                    text: 'OK',
                    onPress: () => {
                      BackHandler.exitApp();
                    },
                  },
                ]
              );
            }
          },
        },
        {
          text: t('cancel') || 'Cancel',
          style: 'cancel',
        },
      ]
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />

      {/* Header */}
      <View className="bg-white px-4 py-3">
        <TouchableOpacity
          className="h-10 w-10 items-center justify-center"
          onPress={() => navigation?.goBack()}>
          <Ionicons name="chevron-back" size={28} color="#333" />
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Profile Section */}
        <View className="items-center bg-white px-6 pb-8">
          {/* Avatar with Edit Button */}
          <View className="mb-4">
            <View className="relative">
              {/* Profile Picture */}
              {profilePicture ? (
                <Image
                  source={{ uri: profilePicture }}
                  className="h-24 w-24 rounded-full bg-gray-300"
                  style={{ borderWidth: 3, borderColor: colors.primary }}
                />
              ) : (
                <View className="h-24 w-24 items-center justify-center rounded-full bg-gray-600 shadow-lg">
                  <Ionicons name="person" size={48} color="#fff" />
                </View>
              )}

              {/* Edit Button */}
              <TouchableOpacity
                onPress={handlePickImage}
                disabled={uploadingImage}
                className="absolute bottom-0 right-0 h-8 w-8 items-center justify-center rounded-full bg-blue-600 shadow-md"
                style={{ borderWidth: 2, borderColor: '#fff' }}>
                {uploadingImage ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Ionicons name="camera" size={16} color="#fff" />
                )}
              </TouchableOpacity>
            </View>
          </View>

          {/* Name */}
          <StyledText className="mb-3 text-2xl font-bold text-gray-900">
            {userName}
          </StyledText>

          {/* Achievement Button */}
          <TouchableOpacity className="rounded border border-blue-600 px-4 py-2">
            <StyledText className="text-sm font-semibold text-blue-600">
              {t('achievements')}
            </StyledText>
          </TouchableOpacity>
        </View>

        {/* Menu Sections */}
        <View className="px-6 pb-8 pt-2">
          {menuSections.map((section, sectionIndex) => (
            <View key={sectionIndex} className="mb-6">
              {/* Section Title */}
              <StyledText className="mb-3 text-base font-bold text-gray-900">
                {section.title}
              </StyledText>

              {/* Menu Card */}
              <View className="overflow-hidden rounded-xl border border-gray-200 bg-white">
                {section.items.map((item, itemIndex) => (
                  <View key={itemIndex}>
                    <TouchableOpacity
                      className="flex-row items-center justify-between px-4 py-4 active:bg-gray-50"
                      onPress={() => handleNavigation(item.screen)}
                      activeOpacity={0.7}>
                      <View className="flex-row items-center gap-3">
                        <Ionicons name={item.icon} size={22} color="#6B7280" />
                        <StyledText className="text-base font-medium text-gray-700">
                          {item.label}
                        </StyledText>
                      </View>
                      <Ionicons name="chevron-forward" size={20} color="#D1D5DB" />
                    </TouchableOpacity>

                    {itemIndex < section.items.length - 1 && (
                      <View className="mx-4 border-t border-gray-100" />
                    )}
                  </View>
                ))}
              </View>
            </View>
          ))}

          {/* Logout Button */}
          <TouchableOpacity
            className="w-full flex-row items-center justify-center gap-2 rounded-xl border border-red-200 bg-white py-4 active:bg-red-50"
            onPress={handleLogout}
            activeOpacity={0.8}>
            <Ionicons name="log-out-outline" size={22} color="#EF4444" />
            <StyledText className="text-base font-bold text-red-600">
              {t('logout')}
            </StyledText>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}