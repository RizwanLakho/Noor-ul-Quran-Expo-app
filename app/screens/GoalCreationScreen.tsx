import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useGoals } from '../context/GoalsContext';
import { useCustomAlert } from '../context/CustomAlertContext';
import StyledText from '../components/StyledText';
import { GoalFormData, GoalItem } from '../types/goals.types';
import { apiService } from '../services/ApiService';

interface GoalCreationScreenProps {
  navigation: any;
  route?: {
    params?: {
      goalId?: string;
      isEdit?: boolean;
    };
  };
}

export default function GoalCreationScreen({ navigation, route }: GoalCreationScreenProps) {
  const { colors, isDark } = useTheme();
  const { showAlert } = useCustomAlert();
  const { goals, createGoal, updateGoal, canCreateNewGoal } = useGoals();

  const isEdit = route?.params?.isEdit || false;
  const editingGoalId = route?.params?.goalId;
  const existingGoal = isEdit && editingGoalId ? goals.find(g => g.id === editingGoalId) : null;

  // Form state
  const [title, setTitle] = useState(existingGoal?.title || '');
  const [description, setDescription] = useState(existingGoal?.description || '');

  // Selection states
  const [selectedSurahs, setSelectedSurahs] = useState<GoalItem[]>(existingGoal?.targets.surahs || []);
  const [selectedJuz, setSelectedJuz] = useState<GoalItem[]>(existingGoal?.targets.juz || []);
  const [selectedTopics, setSelectedTopics] = useState<GoalItem[]>(existingGoal?.targets.topics || []);

  // Duration
  const [durationValue, setDurationValue] = useState<string>(existingGoal?.duration.value.toString() || '1');
  const [durationUnit, setDurationUnit] = useState<'days' | 'weeks' | 'months' | 'year'>(
    existingGoal?.duration.unit || 'days'
  );

  // Available items for selection
  const [availableSurahs, setAvailableSurahs] = useState<any[]>([]);
  const [availableJuz, setAvailableJuz] = useState<any[]>([]);
  const [availableTopics, setAvailableTopics] = useState<any[]>([]);

  // UI states
  const [loading, setLoading] = useState(false);
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadAvailableItems();
  }, []);

  const loadAvailableItems = async () => {
    try {
      setLoading(true);

      // Load Surahs
      const surahsData = await apiService.getSurahs(1, 114);
      setAvailableSurahs(surahsData.surahs || []);

      // Load Juz (1-30) with Arabic names
      const juzData = [
        { id: 1, juz_number: 1, juz_name_english: 'Juz 1', juz_name_arabic: 'الٓمٓ' },
        { id: 2, juz_number: 2, juz_name_english: 'Juz 2', juz_name_arabic: 'سَيَقُولُ' },
        { id: 3, juz_number: 3, juz_name_english: 'Juz 3', juz_name_arabic: 'تِلْكَ ٱلرُّسُلُ' },
        { id: 4, juz_number: 4, juz_name_english: 'Juz 4', juz_name_arabic: 'لَن تَنَالُوا۟' },
        { id: 5, juz_number: 5, juz_name_english: 'Juz 5', juz_name_arabic: 'وَٱلْمُحْصَنَـٰتُ' },
        { id: 6, juz_number: 6, juz_name_english: 'Juz 6', juz_name_arabic: 'لَا يُحِبُّ ٱللَّهُ' },
        { id: 7, juz_number: 7, juz_name_english: 'Juz 7', juz_name_arabic: 'وَإِذَا سَمِعُوا۟' },
        { id: 8, juz_number: 8, juz_name_english: 'Juz 8', juz_name_arabic: 'وَلَوْ أَنَّنَا' },
        { id: 9, juz_number: 9, juz_name_english: 'Juz 9', juz_name_arabic: 'قَالَ ٱلْمَلَأُ' },
        { id: 10, juz_number: 10, juz_name_english: 'Juz 10', juz_name_arabic: 'وَٱعْلَمُوا۟' },
        { id: 11, juz_number: 11, juz_name_english: 'Juz 11', juz_name_arabic: 'يَعْتَذِرُونَ' },
        { id: 12, juz_number: 12, juz_name_english: 'Juz 12', juz_name_arabic: 'وَمَا مِنْ دَآبَّةٍ' },
        { id: 13, juz_number: 13, juz_name_english: 'Juz 13', juz_name_arabic: 'وَمَا أُبَرِّئُ' },
        { id: 14, juz_number: 14, juz_name_english: 'Juz 14', juz_name_arabic: 'رُبَمَا' },
        { id: 15, juz_number: 15, juz_name_english: 'Juz 15', juz_name_arabic: 'سُبْحَـٰنَ ٱلَّذِى' },
        { id: 16, juz_number: 16, juz_name_english: 'Juz 16', juz_name_arabic: 'قَالَ أَلَمْ' },
        { id: 17, juz_number: 17, juz_name_english: 'Juz 17', juz_name_arabic: 'ٱقْتَرَبَ لِلنَّاسِ' },
        { id: 18, juz_number: 18, juz_name_english: 'Juz 18', juz_name_arabic: 'قَدْ أَفْلَحَ' },
        { id: 19, juz_number: 19, juz_name_english: 'Juz 19', juz_name_arabic: 'وَقَالَ ٱلَّذِينَ' },
        { id: 20, juz_number: 20, juz_name_english: 'Juz 20', juz_name_arabic: 'أَمَّنْ خَلَقَ' },
        { id: 21, juz_number: 21, juz_name_english: 'Juz 21', juz_name_arabic: 'أُتْلُ مَآ أُوحِىَ' },
        { id: 22, juz_number: 22, juz_name_english: 'Juz 22', juz_name_arabic: 'وَمَن يَقْنُتْ' },
        { id: 23, juz_number: 23, juz_name_english: 'Juz 23', juz_name_arabic: 'وَمَآ لِىَ' },
        { id: 24, juz_number: 24, juz_name_english: 'Juz 24', juz_name_arabic: 'فَمَنْ أَظْلَمُ' },
        { id: 25, juz_number: 25, juz_name_english: 'Juz 25', juz_name_arabic: 'إِلَيْهِ يُرَدُّ' },
        { id: 26, juz_number: 26, juz_name_english: 'Juz 26', juz_name_arabic: 'حمٓ' },
        { id: 27, juz_number: 27, juz_name_english: 'Juz 27', juz_name_arabic: 'قَالَ فَمَا خَطْبُكُم' },
        { id: 28, juz_number: 28, juz_name_english: 'Juz 28', juz_name_arabic: 'قَدْ سَمِعَ ٱللَّهُ' },
        { id: 29, juz_number: 29, juz_name_english: 'Juz 29', juz_name_arabic: 'تَبَـٰرَكَ ٱلَّذِى' },
        { id: 30, juz_number: 30, juz_name_english: 'Juz 30', juz_name_arabic: 'عَمَّ' },
      ];
      setAvailableJuz(juzData);

      // Load Topics
      try {
        const topicsData = await apiService.getAllTopics();
        setAvailableTopics(topicsData || []);
      } catch (e) {
        console.log('Topics not available');
      }
    } catch (error) {
      console.error('Error loading items:', error);
      showAlert('Error', 'Failed to load available items', 'error');
    } finally {
      setLoading(false);
    }
  };

  const toggleItemSelection = (
    type: 'surah' | 'juz' | 'topic',
    item: any
  ) => {
    const itemData: GoalItem = {
      type,
      id: item.id || item.surah_number || item.juz_number,
      name: item.title || item.surah_name_english || item.juz_name_english || item.name || `${type} ${item.id}`,
      arabicName: item.surah_name_arabic || item.juz_name_arabic || undefined, // Store Arabic name for surahs and juz
      completed: false,
      // Initialize ayah tracking data for surahs and juz
      totalAyahs: item.total_ayahs || undefined,
      readAyahs: 0,
      lastReadAyah: 0,
    };

    switch (type) {
      case 'surah':
        if (selectedSurahs.some(s => s.id === itemData.id)) {
          setSelectedSurahs(selectedSurahs.filter(s => s.id !== itemData.id));
        } else {
          setSelectedSurahs([...selectedSurahs, itemData]);
        }
        break;
      case 'juz':
        if (selectedJuz.some(j => j.id === itemData.id)) {
          setSelectedJuz(selectedJuz.filter(j => j.id !== itemData.id));
        } else {
          setSelectedJuz([...selectedJuz, itemData]);
        }
        break;
      case 'topic':
        if (selectedTopics.some(t => t.id === itemData.id)) {
          setSelectedTopics(selectedTopics.filter(t => t.id !== itemData.id));
        } else {
          setSelectedTopics([...selectedTopics, itemData]);
        }
        break;
    }
  };

  const isItemSelected = (type: 'surah' | 'juz' | 'topic', itemId: number): boolean => {
    switch (type) {
      case 'surah':
        return selectedSurahs.some(s => s.id === itemId);
      case 'juz':
        return selectedJuz.some(j => j.id === itemId);
      case 'topic':
        return selectedTopics.some(t => t.id === itemId);
      default:
        return false;
    }
  };

  const handleSave = async () => {
    try {
      // Validation
      if (!title.trim()) {
        showAlert('Missing Title', 'Please enter a goal title', 'warning');
        return;
      }

      if (
        selectedSurahs.length === 0 &&
        selectedJuz.length === 0 &&
        selectedTopics.length === 0
      ) {
        showAlert('No Targets', 'Please select at least one target (Surah, Juz, or Topic)', 'warning');
        return;
      }

      const durationNum = parseInt(durationValue);
      if (isNaN(durationNum) || durationNum < 1) {
        showAlert('Invalid Duration', 'Please enter a valid duration (minimum 1)', 'warning');
        return;
      }

      // Check max duration limits
      if (durationUnit === 'days' && durationNum > 365) {
        showAlert('Duration Too Long', 'Maximum duration is 365 days', 'warning');
        return;
      }
      if (durationUnit === 'weeks' && durationNum > 52) {
        showAlert('Duration Too Long', 'Maximum duration is 52 weeks', 'warning');
        return;
      }
      if (durationUnit === 'months' && durationNum > 12) {
        showAlert('Duration Too Long', 'Maximum duration is 12 months', 'warning');
        return;
      }
      if (durationUnit === 'year' && durationNum > 1) {
        showAlert('Duration Too Long', 'Maximum duration is 1 year', 'warning');
        return;
      }

      if (!isEdit && !canCreateNewGoal()) {
        showAlert(
          'Goal Limit Reached',
          'You can only have 3 active goals. Please complete or delete an existing goal to create a new one.',
          'warning'
        );
        return;
      }

      setSaving(true);

      const formData: GoalFormData = {
        title: title.trim(),
        description: description.trim(),
        selectedSurahs,
        selectedJuz,
        selectedTopics,
        durationValue: durationNum,
        durationUnit,
      };

      if (isEdit && editingGoalId) {
        await updateGoal(editingGoalId, formData);
        showAlert('Success', 'Goal updated successfully!', 'success', [
          { text: 'OK', onPress: () => navigation.goBack() },
        ]);
      } else {
        await createGoal(formData);
        showAlert('Success', 'Goal created successfully!', 'success', [
          { text: 'OK', onPress: () => navigation.goBack() },
        ]);
      }
    } catch (error: any) {
      showAlert('Error', error.message || 'Failed to save goal', 'error');
    } finally {
      setSaving(false);
    }
  };

  const renderSelectionSection = (
    title: string,
    icon: string,
    type: 'surah' | 'juz' | 'topic',
    items: any[],
    selectedItems: GoalItem[]
  ) => {
    const isExpanded = expandedSection === type;
    const count = selectedItems.length;

    return (
      <View style={[styles.section, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <TouchableOpacity
          style={styles.sectionHeader}
          onPress={() => setExpandedSection(isExpanded ? null : type)}>
          <View style={styles.sectionHeaderLeft}>
            <Ionicons name={icon as any} size={24} color={colors.primary} />
            <View style={{ marginLeft: 12 }}>
              <StyledText style={[styles.sectionTitle, { color: colors.text }]}>{title}</StyledText>
              <StyledText style={[styles.sectionCount, { color: colors.textSecondary }]}>
                {count} selected
              </StyledText>
            </View>
          </View>
          <Ionicons
            name={isExpanded ? 'chevron-up' : 'chevron-down'}
            size={20}
            color={colors.textSecondary}
          />
        </TouchableOpacity>

        {isExpanded && (
          <View style={styles.itemsList}>
            {items.length === 0 ? (
              <StyledText style={[styles.emptyText, { color: colors.textSecondary }]}>
                No items available
              </StyledText>
            ) : (
              items.map((item, index) => {
                const itemId = item.id || item.surah_number || item.juz_number;
                const isSelected = isItemSelected(type, itemId);

                return (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.item,
                      {
                        backgroundColor: isSelected ? colors.primary + '15' : colors.background,
                        borderColor: isSelected ? colors.primary : colors.border,
                      },
                    ]}
                    onPress={() => toggleItemSelection(type, item)}>
                    <StyledText
                      style={[
                        styles.itemText,
                        { color: isSelected ? colors.primary : colors.text },
                      ]}>
                      {item.title || item.surah_name_english || item.juz_name_english || item.name || `Item ${itemId}`}
                    </StyledText>
                    {isSelected && (
                      <Ionicons name="checkmark-circle" size={20} color={colors.primary} />
                    )}
                  </TouchableOpacity>
                );
              })
            )}
          </View>
        )}
      </View>
    );
  };

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <StyledText style={[styles.loadingText, { color: colors.textSecondary }]}>
          Loading...
        </StyledText>
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <StyledText style={[styles.headerTitle, { color: colors.text }]}>
          {isEdit ? 'Edit Goal' : 'Create New Goal'}
        </StyledText>
        <View style={{ width: 40 }} />
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled">
        {/* Title Input */}
        <View style={styles.inputGroup}>
          <StyledText style={[styles.label, { color: colors.text }]}>Goal Title *</StyledText>
          <TextInput
            style={[
              styles.input,
              { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border },
            ]}
            placeholder="e.g., Complete 5 Surahs this week"
            placeholderTextColor={colors.textSecondary}
            value={title}
            onChangeText={setTitle}
          />
        </View>

        {/* Description Input */}
        <View style={styles.inputGroup}>
          <StyledText style={[styles.label, { color: colors.text }]}>Description (Optional)</StyledText>
          <TextInput
            style={[
              styles.textArea,
              { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border },
            ]}
            placeholder="Add a description for your goal..."
            placeholderTextColor={colors.textSecondary}
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={3}
          />
        </View>

        {/* Selection Sections */}
        <StyledText style={[styles.sectionMainTitle, { color: colors.text }]}>
          Select Your Targets *
        </StyledText>

        {renderSelectionSection('Surahs', 'book-outline', 'surah', availableSurahs, selectedSurahs)}
        {renderSelectionSection('Juz', 'albums-outline', 'juz', availableJuz, selectedJuz)}
        {renderSelectionSection('Topics', 'bulb-outline', 'topic', availableTopics, selectedTopics)}

        {/* Duration */}
        <View style={styles.inputGroup}>
          <StyledText style={[styles.label, { color: colors.text }]}>Duration *</StyledText>
          <View style={styles.durationContainer}>
            <TextInput
              style={[
                styles.durationInput,
                { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border },
              ]}
              placeholder="1"
              placeholderTextColor={colors.textSecondary}
              value={durationValue}
              onChangeText={setDurationValue}
              keyboardType="number-pad"
            />

            <View style={styles.durationUnitContainer}>
              {(['days', 'weeks', 'months', 'year'] as const).map((unit) => (
                <TouchableOpacity
                  key={unit}
                  style={[
                    styles.unitButton,
                    {
                      backgroundColor: durationUnit === unit ? colors.primary : colors.surface,
                      borderColor: durationUnit === unit ? colors.primary : colors.border,
                    },
                  ]}
                  onPress={() => setDurationUnit(unit)}>
                  <StyledText
                    style={[
                      styles.unitText,
                      { color: durationUnit === unit ? '#fff' : colors.text },
                    ]}>
                    {unit.charAt(0).toUpperCase() + unit.slice(1)}
                  </StyledText>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        {/* Save Button */}
        <TouchableOpacity
          style={[
            styles.saveButton,
            { backgroundColor: colors.primary },
            saving && styles.saveButtonDisabled,
          ]}
          onPress={handleSave}
          disabled={saving}>
          {saving ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <StyledText style={styles.saveButtonText}>
              {isEdit ? 'Update Goal' : 'Create Goal'}
            </StyledText>
          )}
        </TouchableOpacity>

          <View style={{ height: 40 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  scrollContent: {
    padding: 16,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    fontSize: 14,
  },
  textArea: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    fontSize: 14,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  sectionMainTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  section: {
    borderWidth: 1,
    borderRadius: 12,
    marginBottom: 12,
    overflow: 'hidden',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  sectionHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  sectionCount: {
    fontSize: 12,
    marginTop: 2,
  },
  itemsList: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 8,
  },
  itemText: {
    fontSize: 14,
    flex: 1,
  },
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
    paddingVertical: 20,
  },
  durationContainer: {
    gap: 12,
  },
  durationInput: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    fontSize: 14,
  },
  durationUnitContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  unitButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
  },
  unitText: {
    fontSize: 12,
    fontWeight: '600',
  },
  saveButton: {
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 20,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
