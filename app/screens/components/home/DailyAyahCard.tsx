import React from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, Image, StyleSheet } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useTheme } from '../../../context/ThemeContext';
import { useSettings } from '../../../context/SettingsContext';

interface DailyAyah {
  id: number;
  text: string;
  translation: string;
  surahName: string;
  surahNumber: number;
  ayahNumber: number;
  date: string;
}

interface DailyAyahCardProps {
  dailyAyah: DailyAyah | null;
  loading: boolean;
  error: string | null;
  onRefresh: () => void;
}

export default function DailyAyahCard({
  dailyAyah,
  loading,
  error,
  onRefresh,
}: DailyAyahCardProps) {
  const { colors } = useTheme();
  const { quranAppearance } = useSettings();

  return (
    <View style={styles.VerseContainer}>
      <View style={[styles.verseCard, { backgroundColor: colors.surface }]}>
        <View style={styles.verseHeader}>
          <View style={styles.verseHeaderLeft}>
            <Image
              source={require('../../../../assets/QuranIllustration.png')}
              className="h-5 w-5"
            />
            <View>
              <Text style={[styles.verseTitle, { color: colors.text }]}>Verse of the Day</Text>
              {dailyAyah ? (
                <Text style={[styles.verseSurah, { color: colors.textSecondary }]}>
                  {dailyAyah.surahName} - Verse {dailyAyah.ayahNumber}
                </Text>
              ) : (
                <Text style={[styles.verseSurah, { color: colors.textSecondary }]}>Loading...</Text>
              )}
            </View>
          </View>
          <View style={styles.verseActions}>
            <TouchableOpacity style={styles.verseActionButton}>
              <Ionicons name="bookmark-outline" size={20} color={colors.primary} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.verseActionButton}>
              <Ionicons name="share-outline" size={20} color={colors.primary} />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.verseActionButton}
              onPress={onRefresh}
              disabled={loading}>
              <Ionicons name="refresh-outline" size={20} color={colors.primary} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.verseContent}>
          {loading ? (
            <ActivityIndicator size="small" color={colors.primary} />
          ) : error ? (
            <Text style={[styles.translationText, { color: colors.error }]}>{error}</Text>
          ) : dailyAyah ? (
            <>
              <Text style={[styles.arabicText, { color: colors.text, fontFamily: quranAppearance.arabicFont }]}>{dailyAyah.text}</Text>
              <Text style={[styles.translationText, { color: colors.textSecondary }]}>
                {dailyAyah.translation}
              </Text>
            </>
          ) : (
            <Text style={[styles.translationText, { color: colors.textSecondary }]}>
              No verse available
            </Text>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  VerseContainer: {
    paddingHorizontal: 16,
    marginTop: 20,
  },
  verseCard: {
    borderRadius: 16,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  verseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  verseHeaderLeft: {
    flexDirection: 'row',
    gap: 12,
    flex: 1,
  },
  verseTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  verseSurah: {
    fontSize: 12,
    marginTop: 2,
  },
  verseActions: {
    flexDirection: 'row',
    gap: 8,
  },
  verseActionButton: {
    padding: 4,
  },
  verseContent: {
    gap: 12,
  },
  arabicText: {
    fontSize: 20,
    lineHeight: 36,
    textAlign: 'right',
    fontFamily: 'AmiriQuran',
  },
  translationText: {
    fontSize: 14,
    lineHeight: 22,
  },
});
