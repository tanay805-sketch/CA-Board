import { AppState, Profile, Settings, Subject, StudySession, Task } from '@/types';
import { getTodayIsoDate } from './dates';

const STORAGE_KEY = 'ca_study_os_v1';
const CURRENT_SCHEMA_VERSION = 1;

export const DEFAULT_SUBJECTS: Subject[] = [
  {
    id: 'sub_acc',
    name: 'Advanced Accounting',
    color: '#3B82F6', // Blue
    targetHours: 40,
    createdAt: '2026-08-01',
    order: 1,
    icon: 'Calculator',
  },
  {
    id: 'sub_law',
    name: 'Corporate & Other Laws',
    color: '#8B5CF6', // Purple
    targetHours: 35,
    createdAt: '2026-08-01',
    order: 2,
    icon: 'Scale',
  },
  {
    id: 'sub_tax',
    name: 'Taxation',
    color: '#EC4899', // Pink
    targetHours: 45,
    createdAt: '2026-08-01',
    order: 3,
    icon: 'FileText',
  },
  {
    id: 'sub_cost',
    name: 'Cost & Management Accounting',
    color: '#10B981', // Emerald
    targetHours: 40,
    createdAt: '2026-08-01',
    order: 4,
    icon: 'PieChart',
  },
  {
    id: 'sub_audit',
    name: 'Auditing & Ethics',
    color: '#F59E0B', // Amber
    targetHours: 35,
    createdAt: '2026-08-01',
    order: 5,
    icon: 'ShieldCheck',
  },
  {
    id: 'sub_fmsm',
    name: 'FM & Strategic Management',
    color: '#06B6D4', // Cyan
    targetHours: 40,
    createdAt: '2026-08-01',
    order: 6,
    icon: 'TrendingUp',
  },
];

export const DEFAULT_PROFILE: Profile = {
  name: 'CA Aspirant',
  preparationStartDate: '2026-07-20',
  examName: 'CA Intermediate (May 2027)',
  examDate: '2027-05-02',
};

export const DEFAULT_SETTINGS: Settings = {
  dailyTargetMinutes: 360, // 6 hours
  weeklyTargetMinutes: 2520, // 42 hours
  theme: 'system',
  onboardingCompleted: false,
};

export function getInitialState(): AppState {
  const today = getTodayIsoDate();

  // Create a few realistic starter study sessions so dashboard isn't stark empty on demo
  const starterSessions: StudySession[] = [
    {
      id: 'sess_1',
      subjectId: 'sub_acc',
      date: today,
      startTime: '09:00',
      endTime: '11:15',
      durationMinutes: 135,
      topic: 'AS 14 - Accounting for Amalgamations',
      notes: 'Completed practice illustrations 1 to 12. Clarified purchase method vs merger method.',
      difficulty: 'medium',
      focusRating: 5,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'sess_2',
      subjectId: 'sub_tax',
      date: today,
      startTime: '14:00',
      endTime: '15:30',
      durationMinutes: 90,
      topic: 'Income from Salary & Allowances',
      notes: 'Revised HRA exemption rules and standard deduction limits under new tax regime.',
      difficulty: 'easy',
      focusRating: 4,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];

  const starterTasks: Task[] = [
    {
      id: 'task_1',
      title: 'Complete Accounting Chapter 4 illustrations',
      subjectId: 'sub_acc',
      dueDate: today,
      priority: 'high',
      completed: false,
      createdAt: new Date().toISOString(),
    },
    {
      id: 'task_2',
      title: 'Revise Companies Act 2013 - Board Meetings',
      subjectId: 'sub_law',
      dueDate: today,
      priority: 'medium',
      completed: false,
      createdAt: new Date().toISOString(),
    },
    {
      id: 'task_3',
      title: 'Solve 20 GST numerical problems',
      subjectId: 'sub_tax',
      dueDate: undefined,
      priority: 'medium',
      completed: true,
      createdAt: new Date().toISOString(),
      completedAt: new Date().toISOString(),
    },
  ];

  return {
    schemaVersion: CURRENT_SCHEMA_VERSION,
    profile: DEFAULT_PROFILE,
    settings: DEFAULT_SETTINGS,
    subjects: DEFAULT_SUBJECTS,
    studySessions: starterSessions,
    tasks: starterTasks,
  };
}

export function loadState(): AppState {
  if (typeof window === 'undefined') {
    return getInitialState();
  }

  try {
    const rawData = localStorage.getItem(STORAGE_KEY);
    if (!rawData || !rawData.trim() || rawData === 'undefined' || rawData === 'null') {
      const initialState = getInitialState();
      saveState(initialState);
      return initialState;
    }

    const parsed = JSON.parse(rawData);
    
    // Validate schema basic structure
    if (!parsed || typeof parsed !== 'object' || !parsed.subjects || !parsed.studySessions) {
      const fallback = getInitialState();
      saveState(fallback);
      return fallback;
    }

    return {
      schemaVersion: parsed.schemaVersion || CURRENT_SCHEMA_VERSION,
      profile: { ...DEFAULT_PROFILE, ...parsed.profile },
      settings: { ...DEFAULT_SETTINGS, ...parsed.settings },
      subjects: Array.isArray(parsed.subjects) ? parsed.subjects : DEFAULT_SUBJECTS,
      studySessions: Array.isArray(parsed.studySessions) ? parsed.studySessions : [],
      tasks: Array.isArray(parsed.tasks) ? parsed.tasks : [],
    };
  } catch {
    const fallback = getInitialState();
    saveState(fallback);
    return fallback;
  }
}

export function saveState(state: AppState): boolean {
  if (typeof window === 'undefined') return false;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    return true;
  } catch {
    return false;
  }
}

export function resetState(): AppState {
  const fresh = getInitialState();
  fresh.settings.onboardingCompleted = true; // keep onboarding completed if reset
  saveState(fresh);
  return fresh;
}

export function exportState(state: AppState): void {
  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(state, null, 2));
  const downloadAnchor = document.createElement('a');
  const today = getTodayIsoDate();
  downloadAnchor.setAttribute("href", dataStr);
  downloadAnchor.setAttribute("download", `ca-study-os-backup-${today}.json`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
}

export function importState(jsonString: string): { success: boolean; state?: AppState; error?: string } {
  try {
    const parsed = JSON.parse(jsonString);

    if (!parsed || typeof parsed !== 'object') {
      return { success: false, error: 'Invalid JSON file structure.' };
    }

    if (!Array.isArray(parsed.subjects) || !Array.isArray(parsed.studySessions)) {
      return { success: false, error: 'Missing subjects or study sessions data.' };
    }

    const validatedState: AppState = {
      schemaVersion: parsed.schemaVersion || 1,
      profile: { ...DEFAULT_PROFILE, ...parsed.profile },
      settings: { ...DEFAULT_SETTINGS, ...parsed.settings },
      subjects: parsed.subjects,
      studySessions: parsed.studySessions,
      tasks: Array.isArray(parsed.tasks) ? parsed.tasks : [],
    };

    saveState(validatedState);
    return { success: true, state: validatedState };
  } catch (err) {
    return { success: false, error: 'Failed to parse JSON backup file.' };
  }
}
