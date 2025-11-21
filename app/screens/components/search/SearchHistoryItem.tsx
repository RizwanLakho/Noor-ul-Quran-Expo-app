import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useTheme } from '../../../context/ThemeContext';
import { SearchHistoryItem as HistoryItemType } from '../../../context/SearchHistoryContext';

interface SearchHistoryItemProps {
  item: HistoryItemType;
  onPress: () => void;
  onRemove: (id: string) => void;
}

/**
 * Get time ago string
 */
const getTimeAgo = (timestamp: number): string => {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);

  if (seconds < 60) return 'Just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
  return new Date(timestamp).toLocaleDateString();
};

export default function SearchHistoryItem({ item, onPress, onRemove }: SearchHistoryItemProps) {
  const { colors } = useTheme();
  const timeAgo = getTimeAgo(item.timestamp);

  return (
    <TouchableOpacity
      style={[styles.historyCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
      onPress={onPress}
      activeOpacity={0.7}>
      <View style={styles.historyHeader}>
        <View style={styles.historyHeaderLeft}>
          <Ionicons name="time-outline" size={18} color={colors.primary} />
          <Text style={[styles.historySurah, { color: colors.primary }]}>
            {item.surahName} {item.ayahNumber}
          </Text>
        </View>
        <TouchableOpacity
          onPress={() => onRemove(item.id)}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Ionicons name="close-circle" size={20} color={colors.error} />
        </TouchableOpacity>
      </View>

      <Text style={[styles.arabicTextSmall, { color: colors.text }]} numberOfLines={1}>
        {item.text}
      </Text>

      <Text style={[styles.translationTextSmall, { color: colors.textSecondary }]} numberOfLines={2}>
        {item.translation}
      </Text>

      <View style={styles.historyFooter}>
        {item.searchQuery && (
          <Text style={[styles.searchQueryText, { color: colors.textSecondary }]}>
            <Ionicons name="search" size={12} /> {item.searchQuery}
          </Text>
        )}
        <Text style={[styles.timeAgoText, { color: colors.textSecondary }]}>{timeAgo}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  historyCard: {
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  historyHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  historySurah: {
    fontSize: 13,
    fontWeight: '600',
  },
  arabicTextSmall: {
    fontSize: 16,
    fontFamily: 'AmiriQuran',
    lineHeight: 28,
    textAlign: 'right',
    marginBottom: 6,
  },
  translationTextSmall: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 8,
  },
  historyFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  searchQueryText: {
    fontSize: 11,
    flex: 1,
  },
  timeAgoText: {
    fontSize: 11,
  },
});
