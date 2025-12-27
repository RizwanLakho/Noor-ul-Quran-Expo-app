import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiService } from '../services/ApiService';
import { Goal, GoalFormData, GoalItem } from '../types/goals.types';

export interface DailyGoal {
  id: number;
  title: string;
  description: string;
  target_value: number;
  current_value: number;
  goal_type: 'topic_read' | 'quiz_complete' | 'time_spent' | 'verses_read' | 'custom';
  completed: boolean;
  created_at: string;
  expires_at: string;
}

interface GoalsContextType {
  goals: Goal[];
  loading: boolean;
  error: string | null;
  loadGoals: () => Promise<void>;
  createGoal: (formData: GoalFormData) => Promise<void>;
  updateGoal: (goalId: string, formData: GoalFormData) => Promise<void>;
  deleteGoal: (goalId: string) => Promise<void>;
  markItemCompleted: (goalId: string, type: 'surah' | 'juz' | 'topic', itemId: number) => Promise<void>;
  trackSurahRead: (surahNumber: number, lastAyahRead?: number, totalAyahsInSurah?: number) => Promise<void>;
  trackJuzRead: (juzNumber: number, lastAyahRead?: number, totalAyahsInJuz?: number) => Promise<void>;
  trackTopicRead: (topicId: number) => Promise<void>;
  canCreateNewGoal: () => boolean;
}

const GoalsContext = createContext<GoalsContextType | undefined>(undefined);

const GOALS_STORAGE_KEY = '@user_goals';
const MAX_ACTIVE_GOALS = 3;

export const GoalsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Only load goals if user is logged in (has auth token)
    const checkAndLoadGoals = async () => {
      try {
        const authToken = await AsyncStorage.getItem('@auth_token');
        if (authToken) {
          loadGoals();
        } else {
          console.log('⏭️ Skipping goals load - user not logged in');
        }
      } catch (error) {
        console.log('Error checking auth status:', error);
      }
    };

    checkAndLoadGoals();
  }, []);

  const loadGoals = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch from backend
      const response = await apiService.getReadingGoals();

      if (response.success && response.data) {
        setGoals(response.data);
        // Cache locally for offline access
        await AsyncStorage.setItem(GOALS_STORAGE_KEY, JSON.stringify(response.data));
        console.log('📋 Loaded', response.data.length, 'active goals from backend');
      } else {
        // Fallback to local storage if backend fails
        const stored = await AsyncStorage.getItem(GOALS_STORAGE_KEY);
        if (stored) {
          const parsedGoals: Goal[] = JSON.parse(stored);
          const now = Date.now();
          const activeGoals = parsedGoals.filter(g => g.endDate > now);
          setGoals(activeGoals);
          console.log('📋 Loaded', activeGoals.length, 'active goals from cache');
        }
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to load goals');
      console.error('Error loading goals:', err);

      // Fallback to local storage on error
      try {
        const stored = await AsyncStorage.getItem(GOALS_STORAGE_KEY);
        if (stored) {
          const parsedGoals: Goal[] = JSON.parse(stored);
          const now = Date.now();
          const activeGoals = parsedGoals.filter(g => g.endDate > now);
          setGoals(activeGoals);
          console.log('📋 Loaded', activeGoals.length, 'active goals from cache (fallback)');
        }
      } catch (cacheErr) {
        console.error('Failed to load from cache:', cacheErr);
      }
    } finally {
      setLoading(false);
    }
  };

  const calculateEndDate = (startDate: number, value: number, unit: 'days' | 'weeks' | 'months' | 'year'): number => {
    const date = new Date(startDate);

    switch (unit) {
      case 'days':
        date.setDate(date.getDate() + value);
        break;
      case 'weeks':
        date.setDate(date.getDate() + (value * 7));
        break;
      case 'months':
        date.setMonth(date.getMonth() + value);
        break;
      case 'year':
        date.setFullYear(date.getFullYear() + value);
        break;
    }

    return date.getTime();
  };

  const createGoal = async (formData: GoalFormData) => {
    try {
      setError(null);

      if (goals.length >= MAX_ACTIVE_GOALS) {
        throw new Error(`You can only have ${MAX_ACTIVE_GOALS} active goals. Please complete or delete an existing goal first.`);
      }

      // Create goal on backend
      const response = await apiService.createReadingGoal({
        title: formData.title,
        description: formData.description,
        durationValue: formData.durationValue,
        durationUnit: formData.durationUnit,
        selectedSurahs: formData.selectedSurahs,
        selectedJuz: formData.selectedJuz,
        selectedTopics: formData.selectedTopics,
      });

      if (response.success) {
        // Reload goals from backend to get the complete data
        await loadGoals();
        console.log('✅ Goal created:', formData.title);
      } else {
        throw new Error(response.message || 'Failed to create goal');
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to create goal');
      console.error('Error creating goal:', err);
      throw err;
    }
  };

  const updateGoal = async (goalId: string, formData: GoalFormData) => {
    try {
      setError(null);

      // Update goal on backend
      const response = await apiService.updateReadingGoal(goalId, {
        title: formData.title,
        description: formData.description,
        durationValue: formData.durationValue,
        durationUnit: formData.durationUnit,
        selectedSurahs: formData.selectedSurahs,
        selectedJuz: formData.selectedJuz,
        selectedTopics: formData.selectedTopics,
      });

      if (response.success) {
        // Reload goals from backend to get the complete updated data
        await loadGoals();
        console.log('✅ Goal updated:', formData.title);
      } else {
        throw new Error(response.message || 'Failed to update goal');
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to update goal');
      console.error('Error updating goal:', err);
      throw err;
    }
  };

  const deleteGoal = async (goalId: string) => {
    try {
      setError(null);

      // Delete goal from backend
      const response = await apiService.deleteReadingGoal(goalId);

      if (response.success) {
        // Reload goals from backend
        await loadGoals();
        console.log('🗑️ Goal deleted:', goalId);
      } else {
        throw new Error(response.message || 'Failed to delete goal');
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to delete goal');
      console.error('Error deleting goal:', err);
      throw err;
    }
  };

  const markItemCompleted = async (goalId: string, type: 'surah' | 'juz' | 'topic', itemId: number) => {
    try {
      // Mark item completed on backend
      const response = await apiService.markTargetCompleted(goalId, {
        type,
        itemId,
      });

      if (response.success) {
        // Reload goals from backend to get updated progress
        await loadGoals();
      }
    } catch (err: any) {
      console.error('Error marking item completed:', err);
    }
  };

  /**
   * AUTO-TRACKING: Track when user reads a Surah (from anywhere in app)
   * Now supports ayah-level progress tracking
   */
  const trackSurahRead = async (surahNumber: number, lastAyahRead?: number, totalAyahsInSurah?: number) => {
    try {
      // Find goals that include this surah
      for (const goal of goals) {
        const surahItem = goal.targets.surahs.find(s => s.id === surahNumber);

        if (surahItem && !surahItem.completed) {
          // Check if surah is completed
          if (lastAyahRead !== undefined && totalAyahsInSurah !== undefined) {
            if (lastAyahRead >= totalAyahsInSurah) {
              // Mark as completed on backend
              await markItemCompleted(goal.id, 'surah', surahNumber);
              console.log(`✅ Goal "${goal.title}": Surah ${surahNumber} completed (${lastAyahRead}/${totalAyahsInSurah} ayahs)`);
            } else {
              console.log(`📖 Goal "${goal.title}": Surah ${surahNumber} progress: ${lastAyahRead}/${totalAyahsInSurah} ayahs`);
            }
          } else {
            // Mark as completed if no ayah data provided
            await markItemCompleted(goal.id, 'surah', surahNumber);
            console.log(`✅ Goal "${goal.title}": Surah ${surahNumber} marked complete`);
          }
        }
      }
    } catch (err: any) {
      console.error('Error tracking surah read:', err);
    }
  };

  /**
   * AUTO-TRACKING: Track when user reads a Juz (from anywhere in app)
   * Now supports ayah-level progress tracking
   */
  const trackJuzRead = async (juzNumber: number, lastAyahRead?: number, totalAyahsInJuz?: number) => {
    try {
      // Find goals that include this juz
      for (const goal of goals) {
        const juzItem = goal.targets.juz.find(j => j.id === juzNumber);

        if (juzItem && !juzItem.completed) {
          // Check if juz is completed
          if (lastAyahRead !== undefined && totalAyahsInJuz !== undefined) {
            if (lastAyahRead >= totalAyahsInJuz) {
              // Mark as completed on backend
              await markItemCompleted(goal.id, 'juz', juzNumber);
              console.log(`✅ Goal "${goal.title}": Juz ${juzNumber} completed (${lastAyahRead}/${totalAyahsInJuz} ayahs)`);
            } else {
              console.log(`📖 Goal "${goal.title}": Juz ${juzNumber} progress: ${lastAyahRead}/${totalAyahsInJuz} ayahs`);
            }
          } else {
            // Mark as completed if no ayah data provided
            await markItemCompleted(goal.id, 'juz', juzNumber);
            console.log(`✅ Goal "${goal.title}": Juz ${juzNumber} marked complete`);
          }
        }
      }
    } catch (err: any) {
      console.error('Error tracking juz read:', err);
    }
  };

  /**
   * AUTO-TRACKING: Track when user reads a Topic (from anywhere in app)
   */
  const trackTopicRead = async (topicId: number) => {
    try {
      // Find goals that include this topic
      for (const goal of goals) {
        const topicItem = goal.targets.topics.find(t => t.id === topicId);

        if (topicItem && !topicItem.completed) {
          // Mark as completed on backend
          await markItemCompleted(goal.id, 'topic', topicId);
          console.log(`✅ Goal "${goal.title}": Topic ${topicId} marked complete`);
        }
      }
    } catch (err: any) {
      console.error('Error tracking topic read:', err);
    }
  };

  const canCreateNewGoal = (): boolean => {
    return goals.length < MAX_ACTIVE_GOALS;
  };

  const value: GoalsContextType = {
    goals,
    loading,
    error,
    loadGoals,
    createGoal,
    updateGoal,
    deleteGoal,
    markItemCompleted,
    trackSurahRead,
    trackJuzRead,
    trackTopicRead,
    canCreateNewGoal,
  };

  return <GoalsContext.Provider value={value}>{children}</GoalsContext.Provider>;
};

export const useGoals = () => {
  const context = useContext(GoalsContext);
  if (context === undefined) {
    throw new Error('useGoals must be used within a GoalsProvider');
  }
  return context;
};
