import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiService } from '../services/ApiService';

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
  goals: DailyGoal[];
  loading: boolean;
  error: string | null;
  loadGoals: () => Promise<void>;
  createGoal: (data: {
    title: string;
    description?: string;
    target_value?: number;
    goal_type: string;
  }) => Promise<void>;
  updateGoalProgress: (goalId: number, current_value: number) => Promise<void>;
  deleteGoal: (goalId: number) => Promise<void>;
}

const GoalsContext = createContext<GoalsContextType | undefined>(undefined);

export const GoalsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [goals, setGoals] = useState<DailyGoal[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const loadGoals = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiService.getDailyGoals();
      setGoals(data);
    } catch (err: any) {
      setError(err?.message || 'Failed to load goals');
      console.error('Error loading goals:', err);
    } finally {
      setLoading(false);
    }
  };

  const createGoal = async (data: {
    title: string;
    description?: string;
    target_value?: number;
    goal_type: string;
  }) => {
    try {
      setError(null);
      await apiService.createGoal(data as any);
      await loadGoals(); // Refresh goals list
    } catch (err: any) {
      setError(err?.message || 'Failed to create goal');
      console.error('Error creating goal:', err);
      throw err;
    }
  };

  const updateGoalProgress = async (goalId: number, current_value: number) => {
    try {
      setError(null);
      await apiService.updateGoalProgress(goalId, { current_value });
      await loadGoals(); // Refresh goals list
    } catch (err: any) {
      setError(err?.message || 'Failed to update goal');
      console.error('Error updating goal:', err);
    }
  };

  const deleteGoal = async (goalId: number) => {
    try {
      setError(null);
      await apiService.deleteGoal(goalId);
      await loadGoals(); // Refresh goals list
    } catch (err: any) {
      setError(err?.message || 'Failed to delete goal');
      console.error('Error deleting goal:', err);
    }
  };

  const value: GoalsContextType = {
    goals,
    loading,
    error,
    loadGoals,
    createGoal,
    updateGoalProgress,
    deleteGoal,
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
