import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useTheme } from '../../../context/ThemeContext';
import { useSettings } from '../../../context/SettingsContext';
import StyledText from '../../../components/StyledText';

interface SearchResult {
  ayahId: number;
  text: string;
  translation: string;
  surahName: string;
  surahNumber: number;
  ayahNumber: number;
  highlighted?: string;
}

interface SearchResultItemProps {
  item: SearchResult;
  onPress: (item: SearchResult) => void;
  onBookmark?: (item: SearchResult) => void;
  onShare?: (item: SearchResult) => void;
  isBookmarked?: boolean;
}

export default function SearchResultItem({
  item,
  onPress,
  onBookmark,
  onShare,
  isBookmarked = false
}: SearchResultItemProps) {
  const { colors } = useTheme();
  const { quranAppearance } = useSettings();

  return (
    <TouchableOpacity
      style={[styles.resultCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
      onPress={() => onPress(item)}
      activeOpacity={0.7}>
      <View style={styles.resultHeader}>
        <View style={styles.resultHeaderLeft}>
          <Ionicons name="book-outline" size={20} color={colors.primary} />
          <View>
            <StyledText style={[styles.resultSurah, { color: colors.primary }]}>
              Surah {item.surahName}
            </StyledText>
            <StyledText style={[styles.resultReference, { color: colors.textSecondary }]}>
              ({item.surahNumber}:{item.ayahNumber})
            </StyledText>
          </View>
        </View>
        <View style={styles.resultActions}>
          {onBookmark && (
            <TouchableOpacity
              style={styles.actionButton}
              onPress={(e) => {
                e.stopPropagation();
                onBookmark(item);
              }}>
              <Ionicons
                name={isBookmarked ? "bookmark" : "bookmark-outline"}
                size={20}
                color={colors.primary}
              />
            </TouchableOpacity>
          )}
          {onShare && (
            <TouchableOpacity
              style={styles.actionButton}
              onPress={(e) => {
                e.stopPropagation();
                onShare(item);
              }}>
              <Ionicons name="share-outline" size={20} color={colors.primary} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <Text style={[styles.arabicText, { color: colors.text, fontFamily: quranAppearance.arabicFont }]} numberOfLines={2}>
        {item.text}
      </Text>

      <Text style={[styles.translationText, { color: colors.textSecondary }]} numberOfLines={3}>
        {item.translation}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  resultCard: {
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
  },
  resultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  resultHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  resultSurah: {
    fontSize: 12,
    fontWeight: '600',
  },
  resultReference: {
    fontSize: 10,
    marginTop: 2,
  },
  resultActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  arabicText: {
    fontSize: 20,
    fontFamily: 'uthman',
    lineHeight: 32,
    textAlign: 'right',
    marginBottom: 8,
  },
  translationText: {
    fontSize: 14,
    lineHeight: 20,
  },
});
