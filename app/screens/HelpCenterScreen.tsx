import React from 'react';
import { View, ScrollView, TouchableOpacity, StatusBar, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import StyledText from '../components/StyledText';

export default function HelpCenterScreen({ navigation }: any) {
  const { colors, isDark } = useTheme();
  const { t } = useLanguage();

  const helpTopics = [
    {
      id: 1,
      icon: 'book-outline',
      title: 'Getting Started',
      description: 'Learn the basics of using Noor-ul-Quran app',
      action: () => {},
    },
    {
      id: 2,
      icon: 'reader-outline',
      title: 'Reading Quran',
      description: 'How to read Quran with translations and word-by-word',
      action: () => {},
    },
    {
      id: 3,
      icon: 'trophy-outline',
      title: 'Taking Quizzes',
      description: 'Learn how to take quizzes and track your progress',
      action: () => {},
    },
    {
      id: 4,
      icon: 'color-palette-outline',
      title: 'Customizing Appearance',
      description: 'Change themes, fonts, and text sizes',
      action: () => {},
    },
    {
      id: 5,
      icon: 'cloud-download-outline',
      title: 'Downloads & Offline Mode',
      description: 'Download content for offline reading',
      action: () => {},
    },
    {
      id: 6,
      icon: 'mail-outline',
      title: 'Contact Support',
      description: 'Need more help? Get in touch with our team',
      action: () => navigation.navigate('CustomerSupport'),
    },
  ];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['top']}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

      {/* Header */}
      <View
        style={{
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
          backgroundColor: colors.surface,
          paddingHorizontal: 20,
          paddingVertical: 16,
        }}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginRight: 16 }}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <StyledText style={{ fontSize: 20, fontWeight: 'bold', color: colors.text }}>
            Help Center
          </StyledText>
        </View>
      </View>

      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
        {/* Welcome Message */}
        <View
          style={{
            marginHorizontal: 20,
            marginTop: 20,
            marginBottom: 12,
            padding: 20,
            borderRadius: 12,
            backgroundColor: colors.primary + '15',
            borderWidth: 1,
            borderColor: colors.primary + '30',
          }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
            <Ionicons name="information-circle" size={24} color={colors.primary} />
            <StyledText
              style={{ marginLeft: 8, fontSize: 16, fontWeight: '600', color: colors.primary }}>
              Welcome to Help Center
            </StyledText>
          </View>
          <StyledText style={{ fontSize: 14, lineHeight: 22, color: colors.text }}>
            Find answers to common questions and learn how to make the most of Noor-ul-Quran app.
          </StyledText>
        </View>

        {/* Help Topics */}
        <View style={{ paddingHorizontal: 20, paddingBottom: 24 }}>
          {helpTopics.map((topic, index) => (
            <TouchableOpacity
              key={topic.id}
              onPress={topic.action}
              style={{
                marginBottom: 12,
                padding: 16,
                borderRadius: 12,
                backgroundColor: colors.surface,
                borderWidth: 1,
                borderColor: colors.border,
                flexDirection: 'row',
                alignItems: 'center',
              }}
              activeOpacity={0.7}>
              <View
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 24,
                  backgroundColor: colors.primary + '15',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: 16,
                }}>
                <Ionicons name={topic.icon} size={24} color={colors.primary} />
              </View>

              <View style={{ flex: 1 }}>
                <StyledText style={{ fontSize: 16, fontWeight: '600', color: colors.text, marginBottom: 4 }}>
                  {topic.title}
                </StyledText>
                <StyledText style={{ fontSize: 13, color: colors.textSecondary, lineHeight: 18 }}>
                  {topic.description}
                </StyledText>
              </View>

              <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          ))}
        </View>

        <View style={{ height: 20 }} />
      </ScrollView>
    </SafeAreaView>
  );
}
