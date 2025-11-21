import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useTheme } from '../../../context/ThemeContext';

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
}

export default function SearchResultItem({ item, onPress }: SearchResultItemProps) {
  const { colors } = useTheme();

  return (
    <TouchableOpacity
      style={[styles.resultCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
      onPress={() => onPress(item)}
      activeOpacity={0.7}>
      <View style={styles.resultHeader}>
        <View style={styles.resultHeaderLeft}>
          <Ionicons name="book-outline" size={20} color={colors.primary} />
          <Text style={[styles.resultSurah, { color: colors.primary }]}>
            {item.surahName} {item.ayahNumber}
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
      </View>

      <Text style={[styles.arabicText, { color: colors.text }]} numberOfLines={2}>
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
  },
  resultSurah: {
    fontSize: 14,
    fontWeight: '600',
  },
  arabicText: {
    fontSize: 18,
    fontFamily: 'AmiriQuran',
    lineHeight: 32,
    textAlign: 'right',
    marginBottom: 8,
  },
  translationText: {
    fontSize: 14,
    lineHeight: 20,
  },
});
