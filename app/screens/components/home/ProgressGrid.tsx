import React from 'react';
import { View, Text, Image, StyleSheet, ImageSourcePropType } from 'react-native';
import { useTheme } from '../../../context/ThemeContext';

interface ProgressItem {
  icon: ImageSourcePropType;
  label: string;
  value: string;
}

interface ProgressGridProps {
  items?: ProgressItem[];
}

export default function ProgressGrid({ items }: ProgressGridProps) {
  const { colors } = useTheme();

  const defaultItems: ProgressItem[] = [
    {
      icon: require('../../../../assets/complete.png'),
      label: 'Completion',
      value: '50 %',
    },
    {
      icon: require('../../../../assets/mamorazation-sec.png'),
      label: 'Memorization',
      value: '10 %',
    },
    {
      icon: require('../../../../assets/engagement.png'),
      label: 'Engagement',
      value: '00:20',
    },
    {
      icon: require('../../../../assets/recited.png'),
      label: 'Verses Recited',
      value: '12',
    },
  ];

  const progressItems = items || defaultItems;

  return (
    <View style={styles.progressGrid}>
      {progressItems.map((item, index) => (
        <View
          key={index}
          style={[
            styles.progressCard,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
          className="flex-row gap-6">
          <Image source={item.icon} />
          <View>
            <Text style={[styles.progressLabel, { color: colors.textSecondary }]}>
              {item.label}
            </Text>
            <Text style={[styles.progressValue, { color: colors.text }]}>{item.value}</Text>
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  progressGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  progressCard: {
    flex: 1,
    minWidth: '45%',
    maxWidth: '48%',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    gap: 12,
  },
  progressLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  progressValue: {
    fontSize: 20,
    fontWeight: 'bold',
  },
});
