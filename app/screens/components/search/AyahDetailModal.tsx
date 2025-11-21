import React from 'react';
import { View, Text, Modal, Pressable, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useTheme } from '../../../context/ThemeContext';

interface SearchResult {
  ayahId: number;
  text: string;
  translation: string;
  surahName: string;
  surahNumber: number;
  ayahNumber: number;
}

interface AyahDetailModalProps {
  visible: boolean;
  ayah: SearchResult | null;
  onClose: () => void;
  onShare: () => void;
  onRemove: () => void;
}

export default function AyahDetailModal({
  visible,
  ayah,
  onClose,
  onShare,
  onRemove,
}: AyahDetailModalProps) {
  const { colors } = useTheme();

  return (
    <Modal animationType="slide" transparent={true} visible={visible} onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <Pressable style={styles.modalBackdrop} onPress={onClose} />
        <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
          {/* Modal Header */}
          <View style={styles.modalHeader}>
            <View style={styles.modalHeaderLeft}>
              <Ionicons name="book" size={24} color={colors.primary} />
              <View style={styles.modalHeaderText}>
                <Text style={[styles.modalTitle, { color: colors.text }]}>{ayah?.surahName}</Text>
                <Text style={[styles.modalSubtitle, { color: colors.textSecondary }]}>
                  Verse {ayah?.ayahNumber}
                </Text>
              </View>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close-circle" size={28} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Modal Body */}
          <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
            {/* Arabic Text */}
            <View style={[styles.arabicContainer, { backgroundColor: colors.surface }]}>
              <Text style={[styles.modalArabicText, { color: colors.text }]}>{ayah?.text}</Text>
            </View>

            {/* Translation */}
            <View style={styles.translationContainer}>
              <Text style={[styles.translationLabel, { color: colors.textSecondary }]}>
                Translation
              </Text>
              <Text style={[styles.modalTranslationText, { color: colors.text }]}>
                {ayah?.translation}
              </Text>
            </View>

            {/* Ayah Info */}
            <View style={[styles.ayahInfoCard, { backgroundColor: colors.surface }]}>
              <View style={styles.ayahInfoRow}>
                <Ionicons name="library-outline" size={18} color={colors.primary} />
                <Text style={[styles.ayahInfoLabel, { color: colors.textSecondary }]}>Surah:</Text>
                <Text style={[styles.ayahInfoValue, { color: colors.text }]}>
                  {ayah?.surahName} (#{ayah?.surahNumber})
                </Text>
              </View>
              <View style={styles.ayahInfoRow}>
                <Ionicons name="bookmark-outline" size={18} color={colors.primary} />
                <Text style={[styles.ayahInfoLabel, { color: colors.textSecondary }]}>Verse:</Text>
                <Text style={[styles.ayahInfoValue, { color: colors.text }]}>
                  {ayah?.ayahNumber}
                </Text>
              </View>
            </View>
          </ScrollView>

          {/* Modal Actions */}
          <View style={[styles.modalActions, { borderTopColor: colors.border }]}>
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: colors.surface }]}
              onPress={() => {
              }}>
              <Ionicons name="bookmark-outline" size={22} color={colors.primary} />
              <Text style={[styles.actionButtonText, { color: colors.text }]}>Bookmark</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: colors.surface }]}
              onPress={onShare}>
              <Ionicons name="share-social-outline" size={22} color={colors.primary} />
              <Text style={[styles.actionButtonText, { color: colors.text }]}>Share</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: colors.surface }]}
              onPress={onRemove}>
              <Ionicons name="trash-outline" size={22} color={colors.error} />
              <Text style={[styles.actionButtonText, { color: colors.error }]}>Remove</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
  },
  modalHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  modalHeaderText: {
    flex: 1,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  modalSubtitle: {
    fontSize: 14,
    marginTop: 2,
  },
  closeButton: {
    padding: 4,
  },
  modalBody: {
    padding: 20,
  },
  arabicContainer: {
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
  },
  modalArabicText: {
    fontSize: 24,
    fontFamily: 'AmiriQuran',
    lineHeight: 42,
    textAlign: 'right',
  },
  translationContainer: {
    marginBottom: 20,
  },
  translationLabel: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  modalTranslationText: {
    fontSize: 16,
    lineHeight: 24,
  },
  ayahInfoCard: {
    padding: 16,
    borderRadius: 12,
    gap: 12,
  },
  ayahInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  ayahInfoLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  ayahInfoValue: {
    fontSize: 14,
    flex: 1,
  },
  modalActions: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
    borderTopWidth: 1,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    gap: 6,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
});
