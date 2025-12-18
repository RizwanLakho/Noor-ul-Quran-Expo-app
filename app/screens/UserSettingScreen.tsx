import React, { useState, useEffect } from 'react';
import { View, ScrollView, TouchableOpacity, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { apiService } from '../services/ApiService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import StyledText from '../components/StyledText';

export default function UserSettingScreen({ navigation }) {
  const { colors } = useTheme();
  const { t } = useLanguage();
  const [userName, setUserName] = useState('User');

  // Load user profile
  useEffect(() => {
    loadUserProfile();
  }, []);

  const loadUserProfile = async () => {
    try {
      const profile = await apiService.getUserProfile();
      setUserName(`${profile.first_name || ''} ${profile.last_name || ''}`);
    } catch (error) {
      // Could not load profile
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
    try {
      await AsyncStorage.clear();
      apiService.clearAuthToken();
      navigation.reset({
        index: 0,
        routes: [{ name: 'Login' }],
      });
    } catch (error) {
      // Error logging out
    }
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
          {/* Avatar */}
          <View className="mb-4">
            <View className="h-24 w-24 items-center justify-center rounded-full bg-gray-600 shadow-lg">
              <Ionicons name="person" size={48} color="#fff" />
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