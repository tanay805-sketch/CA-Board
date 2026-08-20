'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { AppState, Profile, Settings, StudySession, Subject, Task } from '@/types';
import { loadState, saveState, resetState, exportState, importState, getInitialState, DEFAULT_SETTINGS } from './storage';
import { showToast } from './toast';
import confetti from 'canvas-confetti';

interface AppContextType {
  state: AppState;
  isLoaded: boolean;
  // Subject actions
  addSubject: (subject: Omit<Subject, 'id' | 'createdAt' | 'order'>) => void;
  updateSubject: (id: string, updates: Partial<Omit<Subject, 'id'>>) => void;
  deleteSubject: (id: string) => void;
  // Session actions
  logSession: (session: Omit<StudySession, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateSession: (id: string, updates: Partial<Omit<StudySession, 'id'>>) => void;
  deleteSession: (id: string) => void;
  // Task actions
  addTask: (task: Omit<Task, 'id' | 'createdAt' | 'completed'>) => void;
  updateTask: (id: string, updates: Partial<Omit<Task, 'id'>>) => void;
  toggleTask: (id: string) => void;
  deleteTask: (id: string) => void;
  // Profile & Settings
  updateProfile: (profile: Partial<Profile>) => void;
  updateSettings: (settings: Partial<Settings>) => void;
  completeOnboarding: (name: string, examName: string, prepStartDate: string, dailyMins: number, weeklyMins: number, subjects: Subject[], examDate?: string) => void;
  // Data actions
  exportBackup: () => void;
  importBackup: (jsonString: string) => boolean;
  resetAllData: () => void;
  // Theme
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AppState>(getInitialState);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const loaded = loadState();
    setState(loaded);
    setIsLoaded(true);
  }, []);

  // Theme effect
  const [activeTheme, setActiveTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    if (!isLoaded) return;
    const themeChoice = state.settings.theme || 'system';
    const root = document.documentElement;

    const applyTheme = (isDark: boolean) => {
      if (isDark) {
        root.classList.add('dark');
        setActiveTheme('dark');
      } else {
        root.classList.remove('dark');
        setActiveTheme('light');
      }
    };

    if (themeChoice === 'dark') {
      applyTheme(true);
    } else if (themeChoice === 'light') {
      applyTheme(false);
    } else {
      // System theme
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      applyTheme(mediaQuery.matches);

      const handleChange = (e: MediaQueryListEvent) => applyTheme(e.matches);
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
  }, [state.settings.theme, isLoaded]);

  const updateAndSaveState = (updater: (prev: AppState) => AppState) => {
    setState((prev) => {
      const next = updater(prev);
      saveState(next);
      return next;
    });
  };

  // 1. Subjects
  const addSubject = (subjectData: Omit<Subject, 'id' | 'createdAt' | 'order'>) => {
    const newSubject: Subject = {
      ...subjectData,
      id: 'sub_' + Math.random().toString(36).substring(2, 9),
      createdAt: new Date().toISOString().split('T')[0],
      order: state.subjects.length + 1,
    };
    updateAndSaveState((prev) => ({
      ...prev,
      subjects: [...prev.subjects, newSubject],
    }));
    showToast('Subject added', `${newSubject.name} created successfully.`);
  };

  const updateSubject = (id: string, updates: Partial<Omit<Subject, 'id'>>) => {
    updateAndSaveState((prev) => ({
      ...prev,
      subjects: prev.subjects.map((s) => (s.id === id ? { ...s, ...updates } : s)),
    }));
    showToast('Subject updated');
  };

  const deleteSubject = (id: string) => {
    const targetSubject = state.subjects.find((s) => s.id === id);
    updateAndSaveState((prev) => ({
      ...prev,
      subjects: prev.subjects.filter((s) => s.id !== id),
      // Clean cascade references: remove sessions and tasks associated with deleted subject (Rule #50)
      studySessions: prev.studySessions.filter((s) => s.subjectId !== id),
      tasks: prev.tasks.filter((t) => t.subjectId !== id),
    }));
    showToast('Subject deleted', `${targetSubject?.name || 'Subject'} and its history removed.`, 'warning');
  };

  // 2. Study Sessions
  const logSession = (sessionData: Omit<StudySession, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newSession: StudySession = {
      ...sessionData,
      id: 'sess_' + Math.random().toString(36).substring(2, 9),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    updateAndSaveState((prev) => ({
      ...prev,
      studySessions: [newSession, ...prev.studySessions],
    }));

    showToast('Study session logged!', `${sessionData.durationMinutes}m logged for topic "${sessionData.topic}".`);

    // Celebration confetti if user hits milestone target
    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.8 },
      });
    } catch (e) {
      // ignore if confetti fails
    }
  };

  const updateSession = (id: string, updates: Partial<Omit<StudySession, 'id'>>) => {
    updateAndSaveState((prev) => ({
      ...prev,
      studySessions: prev.studySessions.map((s) =>
        s.id === id ? { ...s, ...updates, updatedAt: new Date().toISOString() } : s
      ),
    }));
    showToast('Study session updated');
  };

  const deleteSession = (id: string) => {
    updateAndSaveState((prev) => ({
      ...prev,
      studySessions: prev.studySessions.filter((s) => s.id !== id),
    }));
    showToast('Session deleted', undefined, 'info');
  };

  // 3. Tasks
  const addTask = (taskData: Omit<Task, 'id' | 'createdAt' | 'completed'>) => {
    const newTask: Task = {
      ...taskData,
      id: 'task_' + Math.random().toString(36).substring(2, 9),
      completed: false,
      createdAt: new Date().toISOString(),
    };
    updateAndSaveState((prev) => ({
      ...prev,
      tasks: [newTask, ...prev.tasks],
    }));
    showToast('Task added');
  };

  const updateTask = (id: string, updates: Partial<Omit<Task, 'id'>>) => {
    updateAndSaveState((prev) => ({
      ...prev,
      tasks: prev.tasks.map((t) => (t.id === id ? { ...t, ...updates } : t)),
    }));
    showToast('Task updated');
  };

  const toggleTask = (id: string) => {
    updateAndSaveState((prev) => ({
      ...prev,
      tasks: prev.tasks.map((t) => {
        if (t.id === id) {
          const nextCompleted = !t.completed;
          if (nextCompleted) {
            showToast('Task completed! 🎉');
          }
          return {
            ...t,
            completed: nextCompleted,
            completedAt: nextCompleted ? new Date().toISOString() : null,
          };
        }
        return t;
      }),
    }));
  };

  const deleteTask = (id: string) => {
    updateAndSaveState((prev) => ({
      ...prev,
      tasks: prev.tasks.filter((t) => t.id !== id),
    }));
    showToast('Task removed', undefined, 'info');
  };

  // 4. Settings & Profile
  const updateProfile = (profileUpdates: Partial<Profile>) => {
    updateAndSaveState((prev) => ({
      ...prev,
      profile: { ...prev.profile, ...profileUpdates },
    }));
    showToast('Profile updated');
  };

  const updateSettings = (settingUpdates: Partial<Settings>) => {
    updateAndSaveState((prev) => ({
      ...prev,
      settings: { ...prev.settings, ...settingUpdates },
    }));
    showToast('Settings saved');
  };

  const setTheme = (mode: 'light' | 'dark' | 'system') => {
    updateSettings({ theme: mode });
  };

  const completeOnboarding = (
    name: string,
    examName: string,
    prepStartDate: string,
    dailyMins: number,
    weeklyMins: number,
    subjects: Subject[],
    examDate?: string
  ) => {
    updateAndSaveState((prev) => ({
      ...prev,
      profile: {
        name: name || prev.profile.name,
        preparationStartDate: prepStartDate || prev.profile.preparationStartDate,
        examName: examName || prev.profile.examName,
        examDate: examDate || prev.profile.examDate || '2027-05-02',
      },
      settings: {
        ...prev.settings,
        dailyTargetMinutes: dailyMins,
        weeklyTargetMinutes: weeklyMins,
        onboardingCompleted: true,
      },
      subjects: subjects.length ? subjects : prev.subjects,
    }));
    showToast('Welcome to CA Study OS!', 'Your personal command center is ready.');
  };

  // 5. Data Export & Import
  const exportBackup = () => {
    exportState(state);
    showToast('Backup exported', 'ca-study-os-backup.json downloaded.');
  };

  const importBackup = (jsonString: string): boolean => {
    const res = importState(jsonString);
    if (res.success && res.state) {
      setState(res.state);
      showToast('Backup imported', 'Your study data was successfully restored.');
      return true;
    } else {
      showToast('Import failed', res.error || 'Invalid backup file format.', 'error');
      return false;
    }
  };

  const resetAllData = () => {
    const reset = resetState();
    setState(reset);
    showToast('Data reset', 'All study data has been reset to default.', 'warning');
  };

  return (
    <AppContext.Provider
      value={{
        state,
        isLoaded,
        addSubject,
        updateSubject,
        deleteSubject,
        logSession,
        updateSession,
        deleteSession,
        addTask,
        updateTask,
        toggleTask,
        deleteTask,
        updateProfile,
        updateSettings,
        completeOnboarding,
        exportBackup,
        importBackup,
        resetAllData,
        theme: activeTheme,
        setTheme,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
