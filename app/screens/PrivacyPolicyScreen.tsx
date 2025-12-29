import React from 'react';
import { View, ScrollView, TouchableOpacity, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import StyledText from '../components/StyledText';

export default function PrivacyPolicyScreen({ navigation }: any) {
  const { colors, isDark } = useTheme();
  const { t } = useLanguage();

  const sections = [
    {
      title: '1. Information We Collect',
      subsections: [
        {
          subtitle: 'Personal Information',
          content:
            'When you create an account, we collect your name, email address, and optionally your profile picture. This information is used to personalize your experience and sync your data across devices.',
        },
        {
          subtitle: 'Usage Data',
          content:
            'We automatically collect information about how you use the App, including your reading progress, quiz scores, bookmarks, and app settings. This helps us improve the App and provide you with a better experience.',
        },
        {
          subtitle: 'Device Information',
          content:
            'We may collect information about your device, including device type, operating system, and app version. This helps us optimize the App for different devices and troubleshoot technical issues.',
        },
      ],
    },
    {
      title: '2. How We Use Your Information',
      content:
        'We use the information we collect to: (a) provide and maintain the App; (b) personalize your experience; (c) sync your data across devices; (d) send you important notifications; (e) improve the App and develop new features; (f) respond to your support requests; (g) ensure security and prevent fraud.',
    },
    {
      title: '3. Information Sharing',
      content:
        'We do not sell, trade, or rent your personal information to third parties. We may share your information only in the following circumstances: (a) with your consent; (b) to comply with legal obligations; (c) to protect our rights and property; (d) with service providers who help us operate the App (under strict confidentiality agreements).',
    },
    {
      title: '4. Data Security',
      content:
        'We implement industry-standard security measures to protect your personal information from unauthorized access, alteration, disclosure, or destruction. This includes encryption of sensitive data, secure servers, and regular security audits. However, no method of transmission over the internet is 100% secure.',
    },
    {
      title: '5. Your Rights',
      content:
        'You have the right to: (a) access your personal information; (b) correct inaccurate data; (c) delete your account and associated data; (d) export your data; (e) opt-out of non-essential communications; (f) restrict how we process your data. To exercise these rights, contact us at support@noorulquran.app.',
    },
    {
      title: '6. Data Retention',
      content:
        'We retain your personal information for as long as your account is active or as needed to provide you services. If you delete your account, we will delete your personal information within 30 days, except where we are required to retain it for legal purposes.',
    },
    {
      title: '7. Children\'s Privacy',
      content:
        'Our App is intended for users of all ages. We do not knowingly collect personal information from children under 13 without parental consent. If you believe we have collected information from a child under 13, please contact us immediately.',
    },
    {
      title: '8. Cookies and Tracking',
      content:
        'The App may use cookies and similar tracking technologies to enhance your experience. You can control cookie settings through your device settings, but disabling cookies may limit some App functionality.',
    },
    {
      title: '9. Third-Party Services',
      content:
        'The App may integrate with third-party services (e.g., authentication providers, analytics). These services have their own privacy policies, and we encourage you to review them. We are not responsible for the privacy practices of third parties.',
    },
    {
      title: '10. International Data Transfers',
      content:
        'Your information may be transferred to and processed in countries other than your own. We ensure that appropriate safeguards are in place to protect your data in accordance with this Privacy Policy.',
    },
    {
      title: '11. Changes to Privacy Policy',
      content:
        'We may update this Privacy Policy from time to time. We will notify you of any significant changes by posting the new Privacy Policy in the App and updating the "Last Updated" date. Your continued use of the App after such changes constitutes your acceptance.',
    },
    {
      title: '12. Contact Us',
      content:
        'If you have any questions, concerns, or requests regarding this Privacy Policy or our data practices, please contact us at:\n\nEmail: support@noorulquran.app\nWebsite: www.noorulquran.app',
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
            Privacy Policy
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
            At Noor-ul-Quran, we are committed to protecting your privacy and personal information.
            This Privacy Policy explains how we collect, use, disclose, and safeguard your
            information when you use our mobile application.
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

              {section.content && (
                <StyledText style={{ fontSize: 14, lineHeight: 22, color: colors.text }}>
                  {section.content}
                </StyledText>
              )}

              {section.subsections &&
                section.subsections.map((sub, subIndex) => (
                  <View key={subIndex} style={{ marginTop: 12 }}>
                    <StyledText
                      style={{
                        fontSize: 14,
                        fontWeight: '600',
                        color: colors.text,
                        marginBottom: 6,
                      }}>
                      {sub.subtitle}
                    </StyledText>
                    <StyledText style={{ fontSize: 14, lineHeight: 22, color: colors.text }}>
                      {sub.content}
                    </StyledText>
                  </View>
                ))}
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
          <View style={{ flexDirection: 'row', alignItems: 'flex-start', marginBottom: 12 }}>
            <Ionicons name="shield-checkmark" size={24} color={colors.primary} style={{ marginRight: 12 }} />
            <View style={{ flex: 1 }}>
              <StyledText style={{ fontSize: 15, fontWeight: '600', color: colors.text, marginBottom: 4 }}>
                Your Privacy Matters
              </StyledText>
              <StyledText style={{ fontSize: 13, lineHeight: 20, color: colors.text }}>
                We are committed to protecting your personal information and being transparent about
                our data practices.
              </StyledText>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
