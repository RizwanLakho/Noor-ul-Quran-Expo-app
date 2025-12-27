/**
 * Goal Types and Interfaces
 */

export type GoalItemType = 'surah' | 'juz' | 'topic';

export interface GoalItem {
  type: GoalItemType;
  id: number;
  name: string;
  arabicName?: string; // Arabic name for surahs
  completed?: boolean;
  // Detailed tracking for surahs/juz
  totalAyahs?: number; // Total ayahs in this surah/juz
  readAyahs?: number; // How many ayahs have been read
  lastReadAyah?: number; // Last ayah number read
  lastReadAt?: number; // Timestamp of last read
}

export interface GoalTarget {
  surahs: GoalItem[];
  juz: GoalItem[];
  topics: GoalItem[];
}

export interface Goal {
  id: string;
  title: string;
  description?: string;
  targets: GoalTarget;
  duration: {
    value: number;
    unit: 'days' | 'weeks' | 'months' | 'year';
  };
  startDate: number; // timestamp
  endDate: number; // timestamp
  progress: {
    surahs: number; // completed count
    juz: number;
    topics: number;
  };
  completed: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface GoalFormData {
  title: string;
  description?: string;
  selectedSurahs: GoalItem[];
  selectedJuz: GoalItem[];
  selectedTopics: GoalItem[];
  durationValue: number;
  durationUnit: 'days' | 'weeks' | 'months' | 'year';
}
