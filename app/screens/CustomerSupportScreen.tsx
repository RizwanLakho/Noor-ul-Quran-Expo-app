import React, { useState } from 'react';
import { View, ScrollView, TouchableOpacity, StatusBar, Linking, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { useCustomAlert } from '../context/CustomAlertContext';
import StyledText from '../components/StyledText';

export default function CustomerSupportScreen({ navigation }: any) {
  const { colors, isDark } = useTheme();
  const { t } = useLanguage();
  const { showAlert } = useCustomAlert();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  const supportChannels = [
    {
      id: 1,
      icon: 'mail',
      title: 'Email Support',
      subtitle: 'support@noorulquran.app',
      color: colors.primary,
      action: () => Linking.openURL('mailto:support@noorulquran.app'),
    },
    {
      id: 2,
      icon: 'logo-whatsapp',
      title: 'WhatsApp',
      subtitle: 'Chat with us on WhatsApp',
      color: '#25D366',
      action: () => Linking.openURL('https://wa.me/1234567890'),
    },
    {
      id: 3,
      icon: 'call',
      title: 'Phone Support',
      subtitle: '+1 (234) 567-8900',
      color: '#EF4444',
      action: () => Linking.openURL('tel:+12345678900'),
    },
  ];

  const handleSubmit = () => {
    if (!name.trim() || !email.trim() || !message.trim()) {
      showAlert('Required Fields', 'Please fill in all fields', 'warning');
      return;
    }

    // Simulate sending message
    showAlert(
      'Message Sent',
      'Thank you for contacting us! We will get back to you within 24 hours.',
      'success'
    );
    setName('');
    setEmail('');
    setMessage('');
  };

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
            Customer Support
          </StyledText>
        </View>
      </View>

      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
        {/* Contact Channels */}
        <View style={{ paddingHorizontal: 20, paddingTop: 20 }}>
          <StyledText style={{ fontSize: 16, fontWeight: '600', color: colors.text, marginBottom: 12 }}>
            Get in Touch
          </StyledText>

          {supportChannels.map((channel) => (
            <TouchableOpacity
              key={channel.id}
              onPress={channel.action}
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
                  backgroundColor: channel.color + '15',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: 16,
                }}>
                <Ionicons name={channel.icon} size={24} color={channel.color} />
              </View>

              <View style={{ flex: 1 }}>
                <StyledText style={{ fontSize: 15, fontWeight: '600', color: colors.text, marginBottom: 2 }}>
                  {channel.title}
                </StyledText>
                <StyledText style={{ fontSize: 13, color: colors.textSecondary }}>
                  {channel.subtitle}
                </StyledText>
              </View>

              <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          ))}
        </View>

        {/* Contact Form */}
        <View style={{ paddingHorizontal: 20, paddingTop: 24, paddingBottom: 32 }}>
          <StyledText style={{ fontSize: 16, fontWeight: '600', color: colors.text, marginBottom: 12 }}>
            Send us a Message
          </StyledText>

          <View
            style={{
              padding: 20,
              borderRadius: 12,
              backgroundColor: colors.surface,
              borderWidth: 1,
              borderColor: colors.border,
            }}>
            {/* Name Input */}
            <View style={{ marginBottom: 16 }}>
              <StyledText style={{ fontSize: 14, fontWeight: '500', color: colors.text, marginBottom: 8 }}>
                Name
              </StyledText>
              <TextInput
                value={name}
                onChangeText={setName}
                placeholder="Enter your name"
                placeholderTextColor={colors.textSecondary}
                style={{
                  padding: 12,
                  borderRadius: 8,
                  backgroundColor: colors.background,
                  borderWidth: 1,
                  borderColor: colors.border,
                  color: colors.text,
                  fontSize: 14,
                }}
              />
            </View>

            {/* Email Input */}
            <View style={{ marginBottom: 16 }}>
              <StyledText style={{ fontSize: 14, fontWeight: '500', color: colors.text, marginBottom: 8 }}>
                Email
              </StyledText>
              <TextInput
                value={email}
                onChangeText={setEmail}
                placeholder="Enter your email"
                placeholderTextColor={colors.textSecondary}
                keyboardType="email-address"
                autoCapitalize="none"
                style={{
                  padding: 12,
                  borderRadius: 8,
                  backgroundColor: colors.background,
                  borderWidth: 1,
                  borderColor: colors.border,
                  color: colors.text,
                  fontSize: 14,
                }}
              />
            </View>

            {/* Message Input */}
            <View style={{ marginBottom: 20 }}>
              <StyledText style={{ fontSize: 14, fontWeight: '500', color: colors.text, marginBottom: 8 }}>
                Message
              </StyledText>
              <TextInput
                value={message}
                onChangeText={setMessage}
                placeholder="How can we help you?"
                placeholderTextColor={colors.textSecondary}
                multiline
                numberOfLines={5}
                textAlignVertical="top"
                style={{
                  padding: 12,
                  borderRadius: 8,
                  backgroundColor: colors.background,
                  borderWidth: 1,
                  borderColor: colors.border,
                  color: colors.text,
                  fontSize: 14,
                  minHeight: 120,
                }}
              />
            </View>

            {/* Submit Button */}
            <TouchableOpacity
              onPress={handleSubmit}
              style={{
                padding: 14,
                borderRadius: 8,
                backgroundColor: colors.primary,
                alignItems: 'center',
              }}
              activeOpacity={0.8}>
              <StyledText style={{ fontSize: 15, fontWeight: '600', color: '#FFFFFF' }}>
                Send Message
              </StyledText>
            </TouchableOpacity>
          </View>
        </View>

        <View style={{ height: 20 }} />
      </ScrollView>
    </SafeAreaView>
  );
}
