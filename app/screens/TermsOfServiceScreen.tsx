import React from 'react';
import { View, ScrollView, TouchableOpacity, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import StyledText from '../components/StyledText';

export default function TermsOfServiceScreen({ navigation }: any) {
  const { colors, isDark } = useTheme();
  const { t } = useLanguage();

  const sections = [
    {
      title: '1. Acceptance of Terms',
      content:
        'By downloading, installing, or using the Noor-ul-Quran mobile application ("App"), you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use the App.',
    },
    {
      title: '2. Use of the App',
      content:
        'The App is provided for educational and religious purposes. You may use the App to read the Quran, access translations, take quizzes, and utilize other features. You agree to use the App in accordance with all applicable laws and regulations.',
    },
    {
      title: '3. User Accounts',
      content:
        'You may be required to create an account to access certain features. You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You agree to notify us immediately of any unauthorized use of your account.',
    },
    {
      title: '4. Intellectual Property',
      content:
        'All content, features, and functionality of the App, including but not limited to text, graphics, logos, icons, and software, are the property of Noor-ul-Quran or its content suppliers and are protected by copyright, trademark, and other intellectual property laws.',
    },
    {
      title: '5. Quran Content',
      content:
        'The Quran text and translations provided in the App are for personal, non-commercial use only. We strive to provide accurate translations, but we recommend consulting with Islamic scholars for interpretation and understanding.',
    },
    {
      title: '6. User Conduct',
      content:
        'You agree not to: (a) use the App for any unlawful purpose; (b) attempt to gain unauthorized access to the App or its systems; (c) interfere with or disrupt the App or servers; (d) transmit any viruses or malicious code; (e) impersonate any person or entity.',
    },
    {
      title: '7. Privacy',
      content:
        'Your privacy is important to us. Please review our Privacy Policy to understand how we collect, use, and protect your personal information.',
    },
    {
      title: '8. Disclaimer of Warranties',
      content:
        'The App is provided "as is" and "as available" without warranties of any kind, either express or implied. We do not warrant that the App will be uninterrupted, error-free, or free of viruses or other harmful components.',
    },
    {
      title: '9. Limitation of Liability',
      content:
        'To the fullest extent permitted by law, Noor-ul-Quran shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use or inability to use the App.',
    },
    {
      title: '10. Third-Party Links',
      content:
        'The App may contain links to third-party websites or services. We are not responsible for the content, privacy policies, or practices of any third-party sites.',
    },
    {
      title: '11. Modifications to Terms',
      content:
        'We reserve the right to modify these Terms of Service at any time. We will notify you of any changes by posting the new Terms within the App. Your continued use of the App after such modifications constitutes your acceptance of the updated terms.',
    },
    {
      title: '12. Termination',
      content:
        'We may terminate or suspend your access to the App immediately, without prior notice, for any reason, including if you breach these Terms of Service.',
    },
    {
      title: '13. Governing Law',
      content:
        'These Terms shall be governed by and construed in accordance with the laws of the jurisdiction in which we operate, without regard to its conflict of law provisions.',
    },
    {
      title: '14. Contact Us',
      content:
        'If you have any questions about these Terms of Service, please contact us at support@noorulquran.app.',
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
            Terms of Service
          </StyledText>
        </View>
      </View>

      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
        {/* Last Updated */}
        <View
          style={{
            marginHorizontal: 20,
            marginTop: 20,
            marginBottom: 16,
            padding: 16,
            borderRadius: 12,
            backgroundColor: colors.surface,
            borderWidth: 1,
            borderColor: colors.border,
          }}>
          <StyledText style={{ fontSize: 12, color: colors.textSecondary }}>
            Last Updated: December 28, 2025
          </StyledText>
        </View>

        {/* Introduction */}
        <View style={{ paddingHorizontal: 20, marginBottom: 20 }}>
          <StyledText style={{ fontSize: 15, lineHeight: 24, color: colors.text }}>
            Please read these Terms of Service carefully before using the Noor-ul-Quran mobile
            application. These terms govern your use of our App and constitute a legally binding
            agreement between you and Noor-ul-Quran.
          </StyledText>
        </View>

        {/* Sections */}
        <View style={{ paddingHorizontal: 20, paddingBottom: 32 }}>
          {sections.map((section, index) => (
            <View key={index} style={{ marginBottom: 24 }}>
              <StyledText
                style={{ fontSize: 16, fontWeight: '600', color: colors.text, marginBottom: 8 }}>
                {section.title}
              </StyledText>
              <StyledText style={{ fontSize: 14, lineHeight: 22, color: colors.text }}>
                {section.content}
              </StyledText>
            </View>
          ))}
        </View>

        {/* Footer */}
        <View
          style={{
            marginHorizontal: 20,
            marginBottom: 32,
            padding: 20,
            borderRadius: 12,
            backgroundColor: colors.primary + '10',
            borderWidth: 1,
            borderColor: colors.primary + '30',
          }}>
          <StyledText style={{ fontSize: 14, lineHeight: 22, color: colors.text, textAlign: 'center' }}>
            By using Noor-ul-Quran, you acknowledge that you have read, understood, and agree to be
            bound by these Terms of Service.
          </StyledText>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
