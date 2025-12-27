import React from 'react';
import { View, FlatList, TouchableOpacity, StyleSheet, Share } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useTheme } from '../context/ThemeContext';
import { useSettings } from '../context/SettingsContext';
import { useBookmarks } from '../context/BookmarksContext';
import { useLanguage } from '../context/LanguageContext';
import { useCustomAlert } from '../context/CustomAlertContext';
import StyledText from '../components/StyledText';

export default function BookmarksScreen({ navigation }: any) {
  const { colors, isDark } = useTheme();
  const { quranAppearance } = useSettings();
  const { t } = useLanguage();
  const { showAlert } = useCustomAlert();
  const { bookmarks, loading, removeBookmark } = useBookmarks();

  /**
   * Handle share bookmark
   */
  const handleShare = async (bookmark: any) => {
    try {
      const message = `${bookmark.arabicText}\n\n${bookmark.translation}\n\n- Surah ${bookmark.surahName} (${bookmark.surahNumber}:${bookmark.ayahNumber})\n\nShared from Noor-ul-Quran App`;

      await Share.share({
        message: message,
      });
    } catch (error) {
      console.error('Error sharing bookmark:', error);
    }
  };

  /**
   * Handle delete bookmark
   */
  const handleDelete = (bookmark: any) => {
    showAlert(
      'Remove Bookmark',
      `Remove "${bookmark.surahName} ${bookmark.ayahNumber}" from bookmarks?`,
      'warning',
      [
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => removeBookmark(bookmark.id),
        },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  /**
   * Handle bookmark press - Navigate to Surah/Juz
   */
  const handleBookmarkPress = (bookmark: any) => {
    // Check if it's a whole Surah/Juz bookmark (ayahNumber === 0)
    if (bookmark.ayahNumber === 0) {
      // Navigate to QuranReader for whole Surah/Juz
      navigation.navigate('QuranReader', {
        type: 'surah',
        surahNumber: bookmark.surahNumber,
        surahName: bookmark.surahName,
        surahNameArabic: bookmark.arabicText,
      });
    } else {
      // For individual ayah, navigate to the Surah at that ayah
      navigation.navigate('QuranReader', {
        type: 'surah',
        surahNumber: bookmark.surahNumber,
        surahName: bookmark.surahName,
        surahNameArabic: bookmark.arabicText,
        scrollToAyah: bookmark.ayahNumber, // Optional: scroll to this ayah
      });
    }
  };

  /**
   * Render bookmark item
   */
  const renderBookmark = ({ item }: any) => (
    <TouchableOpacity activeOpacity={0.7} onPress={() => handleBookmarkPress(item)}>
      <View
        style={[
          styles.bookmarkCard,
          {
            backgroundColor: colors.surface,
            borderColor: colors.border,
          },
        ]}>
        {/* Badge for whole Surah/Juz bookmarks */}
        {item.ayahNumber === 0 && (
          <View style={[styles.wholeSurahBadge, { backgroundColor: colors.primary }]}>
            <Ionicons name="book" size={12} color="#fff" />
            <StyledText style={styles.wholeSurahBadgeText}>
              {t('completeSurah') || 'Complete Surah'}
            </StyledText>
          </View>
        )}

        {/* Header */}
        <View style={styles.bookmarkHeader}>
          <View style={styles.headerLeft}>
            <Ionicons name="bookmark" size={20} color={colors.primary} />
            <StyledText style={[styles.surahName, { color: colors.text }]}>
              {item.surahName}
            </StyledText>
          </View>
          <StyledText style={[styles.reference, { color: colors.textSecondary }]}>
            {item.ayahNumber === 0
              ? t('fullSurah') || 'Full'
              : `${item.surahNumber}:${item.ayahNumber}`}
          </StyledText>
        </View>

        {/* Arabic Text */}
        <StyledText style={[styles.arabicText, { color: colors.text, fontFamily: quranAppearance.arabicFont }]}>
          {item.arabicText}
        </StyledText>

        {/* Translation */}
        <StyledText style={[styles.translation, { color: colors.textSecondary }]}>
          {item.translation}
        </StyledText>

        {/* Actions */}
        <View style={styles.actions}>
          <StyledText style={[styles.timestamp, { color: colors.textSecondary }]}>
            {new Date(item.timestamp).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            })}
          </StyledText>

          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={(e) => {
                e.stopPropagation(); // Prevent card press
                handleShare(item);
              }}>
              <Ionicons name="share-outline" size={18} color={colors.primary} />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={(e) => {
                e.stopPropagation(); // Prevent card press
                handleDelete(item);
              }}>
              <Ionicons name="trash-outline" size={18} color="#ef4444" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Open indicator */}
        {/*<View style={styles.openIndicator}>
          <Ionicons name="chevron-forward" size={16} color={colors.textSecondary} />
        </View>*/}
      </View>
    </TouchableOpacity>
  );

  /**
   * Empty state
   */
  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="bookmark-outline" size={64} color={colors.textSecondary} />
      <StyledText style={[styles.emptyTitle, { color: colors.text }]}>No Bookmarks Yet</StyledText>
      <StyledText style={[styles.emptyText, { color: colors.textSecondary }]}>
        Start bookmarking your favorite ayahs{'\n'}from the Verse of the Day or Quran Reader
      </StyledText>
    </View>
  );

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
      edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <StyledText style={[styles.headerTitle, { color: colors.text }]}>Bookmarks</StyledText>
        <View style={{ width: 40 }} />
      </View>

      {/* Bookmarks Count */}
      {bookmarks.length > 0 && (
        <View style={styles.countContainer}>
          <StyledText style={[styles.countText, { color: colors.textSecondary }]}>
            {bookmarks.length} {bookmarks.length === 1 ? 'bookmark' : 'bookmarks'} saved
          </StyledText>
        </View>
      )}

      {/* Bookmarks List */}
      <FlatList
        data={bookmarks}
        renderItem={renderBookmark}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={renderEmptyState}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  countContainer: {
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  countText: {
    fontSize: 14,
  },
  listContent: {
    padding: 16,
    paddingBottom: 32,
  },
  bookmarkCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  bookmarkHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  surahName: {
    fontSize: 14,
    fontWeight: '600',
  },
  reference: {
    fontSize: 12,
    fontWeight: '500',
  },
  arabicText: {
    fontSize: 18,
    fontFamily: 'uthman',
    textAlign: 'right',
    lineHeight: 30,
    marginBottom: 8,
  },
  translation: {
    fontSize: 13,
    lineHeight: 20,
    marginBottom: 12,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
  },
  timestamp: {
    fontSize: 11,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.03)',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  wholeSurahBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    zIndex: 1,
  },
  wholeSurahBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#fff',
  },
  openIndicator: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(0,0,0,0.05)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
