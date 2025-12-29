import React, { useState } from 'react';
import { View, ScrollView, TouchableOpacity, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import StyledText from '../components/StyledText';

interface FAQ {
  id: number;
  question: string;
  answer: string;
  category: string;
}

export default function FAQsScreen({ navigation }: any) {
  const { colors, isDark } = useTheme();
  const { t } = useLanguage();
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const faqs: FAQ[] = [
    {
      id: 1,
      category: 'General',
      question: 'What is Noor-ul-Quran?',
      answer:
        'Noor-ul-Quran is a comprehensive Islamic app that provides you with Quran reading, translations in multiple languages, word-by-word translation, quizzes, and more to help you learn and understand the Quran better.',
    },
    {
      id: 2,
      category: 'General',
      question: 'Is the app free to use?',
      answer:
        'Yes, Noor-ul-Quran is completely free to download and use. We believe in making Quranic knowledge accessible to everyone.',
    },
    {
      id: 3,
      category: 'Reading',
      question: 'How do I change the translation?',
      answer:
        'Go to Settings > Appearance > Select Translator. You can choose from multiple translators in different languages including English, Urdu, and more.',
    },
    {
      id: 4,
      category: 'Reading',
      question: 'Can I read the Quran offline?',
      answer:
        'Yes! Once you download the Quran data, you can read it offline anytime. Go to Settings > Downloads to manage your offline content.',
    },
    {
      id: 5,
      category: 'Reading',
      question: 'What is word-by-word translation?',
      answer:
        'Word-by-word translation shows the meaning of each Arabic word individually below the word itself. This helps you understand the Quran at a deeper level and learn Arabic vocabulary.',
    },
    {
      id: 6,
      category: 'Features',
      question: 'How do I bookmark an ayah?',
      answer:
        'When reading the Quran, tap on any ayah and select the bookmark icon. You can access all your bookmarks from the Bookmarks section in the menu.',
    },
    {
      id: 7,
      category: 'Features',
      question: 'How do quizzes work?',
      answer:
        'Quizzes test your knowledge of Islamic topics. Each quiz has multiple questions, and you can only take each quiz once. Your score is saved and you can review your answers after completion.',
    },
    {
      id: 8,
      category: 'Settings',
      question: 'Can I change the font size?',
      answer:
        'Yes! Go to Settings > Appearance > Arabic Text Size or Translation Text Size. You can adjust the size from 9px to 18px to suit your reading preference.',
    },
    {
      id: 9,
      category: 'Settings',
      question: 'How do I enable dark mode?',
      answer:
        'Go to Settings > General Settings > Theme. You can choose between Light, Dark, or Auto mode. Auto mode will follow your device system settings.',
    },
    {
      id: 10,
      category: 'Account',
      question: 'How do I reset my password?',
      answer:
        'On the login screen, tap "Forgot Password". Enter your email address and we will send you a password reset link.',
    },
    {
      id: 11,
      category: 'Account',
      question: 'Can I use the app without creating an account?',
      answer:
        'Yes, you can read the Quran without an account. However, creating an account allows you to sync your progress, bookmarks, and quiz scores across devices.',
    },
    {
      id: 12,
      category: 'Technical',
      question: 'The app is running slowly. What should I do?',
      answer:
        'Try closing other apps running in the background. If the issue persists, clear the app cache from Settings > Downloads, or reinstall the app.',
    },
  ];

  const toggleFAQ = (id: number) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const categories = Array.from(new Set(faqs.map((faq) => faq.category)));

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
            Frequently Asked Questions
          </StyledText>
        </View>
      </View>

      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
        {/* Info Banner */}
        <View
          style={{
            marginHorizontal: 20,
            marginTop: 20,
            marginBottom: 12,
            padding: 16,
            borderRadius: 12,
            backgroundColor: colors.primary + '15',
            borderWidth: 1,
            borderColor: colors.primary + '30',
          }}>
          <StyledText style={{ fontSize: 14, lineHeight: 22, color: colors.text }}>
            Can't find what you're looking for? Contact our{' '}
            <StyledText
              style={{ color: colors.primary, fontWeight: '600' }}
              onPress={() => navigation.navigate('CustomerSupport')}>
              Customer Support
            </StyledText>
          </StyledText>
        </View>

        {/* FAQs by Category */}
        <View style={{ paddingHorizontal: 20, paddingBottom: 24 }}>
          {categories.map((category) => (
            <View key={category} style={{ marginBottom: 20 }}>
              {/* Category Header */}
              <StyledText
                style={{
                  fontSize: 16,
                  fontWeight: '600',
                  color: colors.text,
                  marginBottom: 12,
                  marginTop: 8,
                }}>
                {category}
              </StyledText>

              {/* FAQs in Category */}
              {faqs
                .filter((faq) => faq.category === category)
                .map((faq) => (
                  <TouchableOpacity
                    key={faq.id}
                    onPress={() => toggleFAQ(faq.id)}
                    style={{
                      marginBottom: 8,
                      borderRadius: 12,
                      backgroundColor: colors.surface,
                      borderWidth: 1,
                      borderColor: expandedId === faq.id ? colors.primary : colors.border,
                      overflow: 'hidden',
                    }}
                    activeOpacity={0.8}>
                    {/* Question */}
                    <View
                      style={{
                        padding: 16,
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}>
                      <StyledText
                        style={{
                          flex: 1,
                          fontSize: 15,
                          fontWeight: '600',
                          color: expandedId === faq.id ? colors.primary : colors.text,
                          marginRight: 12,
                        }}>
                        {faq.question}
                      </StyledText>
                      <Ionicons
                        name={expandedId === faq.id ? 'chevron-up' : 'chevron-down'}
                        size={20}
                        color={expandedId === faq.id ? colors.primary : colors.textSecondary}
                      />
                    </View>

                    {/* Answer */}
                    {expandedId === faq.id && (
                      <View
                        style={{
                          paddingHorizontal: 16,
                          paddingBottom: 16,
                          borderTopWidth: 1,
                          borderTopColor: colors.border,
                          paddingTop: 12,
                        }}>
                        <StyledText style={{ fontSize: 14, lineHeight: 22, color: colors.text }}>
                          {faq.answer}
                        </StyledText>
                      </View>
                    )}
                  </TouchableOpacity>
                ))}
            </View>
          ))}
        </View>

        <View style={{ height: 20 }} />
      </ScrollView>
    </SafeAreaView>
  );
}
