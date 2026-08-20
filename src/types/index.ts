export type Priority = 'low' | 'medium' | 'high';
export type Difficulty = 'easy' | 'medium' | 'hard';
export type ThemeMode = 'light' | 'dark' | 'system';

export interface Subject {
  id: string;
  name: string;
  color: string; // Hex color code (e.g. #3B82F6)
  targetHours: number;
  createdAt: string;
  order: number;
  icon?: string; // Optional Lucide icon name
}

export interface StudySession {
  id: string;
  subjectId: string;
  date: string; // YYYY-MM-DD
  startTime?: string; // HH:mm
  endTime?: string; // HH:mm
  durationMinutes: number;
  topic: string;
  notes: string;
  difficulty: Difficulty;
  focusRating: number; // 1 to 5
  createdAt: string;
  updatedAt: string;
}

export interface Task {
  id: string;
  title: string;
  subjectId?: string | null;
  dueDate?: string | null; // YYYY-MM-DD
  priority: Priority;
  completed: boolean;
  createdAt: string;
  completedAt?: string | null;
}

export interface Profile {
  name: string;
  preparationStartDate: string; // YYYY-MM-DD
  examName?: string;
  examDate?: string; // YYYY-MM-DD (e.g. 2027-05-02)
}

export interface Settings {
  dailyTargetMinutes: number; // e.g. 360 (6 hours)
  weeklyTargetMinutes: number; // e.g. 2520 (42 hours)
  theme: ThemeMode;
  onboardingCompleted: boolean;
}

export interface AppState {
  schemaVersion: number;
  profile: Profile;
  settings: Settings;
  subjects: Subject[];
  studySessions: StudySession[];
  tasks: Task[];
}

export interface SubjectStats {
  subject: Subject;
  totalMinutes: number;
  totalHours: number;
  progressPercentage: number;
  sessionCount: number;
  averageSessionMinutes: number;
  longestSessionMinutes: number;
  lastStudiedDate: string | null;
  subjectStreakDays: number;
}
