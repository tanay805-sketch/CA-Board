import { AppState, StudySession, Subject, SubjectStats } from '@/types';
import { getCurrentWeekDates, getTodayIsoDate, getLastNDaysDates } from './dates';

export function calculateSubjectTotalMinutes(subjectId: string, sessions: StudySession[]): number {
  return sessions
    .filter((s) => s.subjectId === subjectId)
    .reduce((acc, curr) => acc + (curr.durationMinutes || 0), 0);
}

export function calculateSubjectStats(subject: Subject, sessions: StudySession[]): SubjectStats {
  const subjectSessions = sessions.filter((s) => s.subjectId === subject.id);
  const totalMinutes = subjectSessions.reduce((acc, curr) => acc + (curr.durationMinutes || 0), 0);
  const totalHours = totalMinutes / 60;
  const targetMinutes = (subject.targetHours || 1) * 60;
  const progressPercentage = Math.min(100, Math.round((totalMinutes / targetMinutes) * 100));
  
  const sessionCount = subjectSessions.length;
  const averageSessionMinutes = sessionCount > 0 ? Math.round(totalMinutes / sessionCount) : 0;
  
  const longestSessionMinutes = subjectSessions.reduce((max, s) => Math.max(max, s.durationMinutes || 0), 0);

  // Find last studied date
  let lastStudiedDate: string | null = null;
  if (subjectSessions.length > 0) {
    const sorted = [...subjectSessions].sort((a, b) => b.date.localeCompare(a.date));
    lastStudiedDate = sorted[0].date;
  }

  // Calculate subject streak
  const subjectStreakDays = calculateSubjectStreak(subject.id, sessions);

  return {
    subject,
    totalMinutes,
    totalHours,
    progressPercentage,
    sessionCount,
    averageSessionMinutes,
    longestSessionMinutes,
    lastStudiedDate,
    subjectStreakDays,
  };
}

export function calculateOverallProgress(subjects: Subject[], sessions: StudySession[]): {
  totalTargetHours: number;
  totalCompletedHours: number;
  totalCompletedMinutes: number;
  percentage: number;
} {
  if (!subjects.length) {
    return { totalTargetHours: 0, totalCompletedHours: 0, totalCompletedMinutes: 0, percentage: 0 };
  }

  const totalTargetHours = subjects.reduce((acc, s) => acc + (s.targetHours || 0), 0);
  const totalCompletedMinutes = sessions.reduce((acc, s) => acc + (s.durationMinutes || 0), 0);
  const totalCompletedHours = totalCompletedMinutes / 60;

  const totalTargetMinutes = totalTargetHours * 60;
  const percentage = totalTargetMinutes > 0 ? Math.min(100, Math.round((totalCompletedMinutes / totalTargetMinutes) * 100)) : 0;

  return {
    totalTargetHours,
    totalCompletedHours,
    totalCompletedMinutes,
    percentage,
  };
}

export function calculateDailyStudyTime(dateStr: string, sessions: StudySession[]): {
  totalMinutes: number;
  sessionsCount: number;
  sessions: StudySession[];
} {
  const daySessions = sessions.filter((s) => s.date === dateStr);
  const totalMinutes = daySessions.reduce((acc, s) => acc + (s.durationMinutes || 0), 0);
  return {
    totalMinutes,
    sessionsCount: daySessions.length,
    sessions: daySessions,
  };
}

export function calculateWeeklyStudyTime(sessions: StudySession[]): {
  totalMinutes: number;
  totalHours: number;
  dailyBreakdown: { dayName: string; shortDay: string; date: string; minutes: number; hours: number; sessionsCount: number }[];
} {
  const weekDates = getCurrentWeekDates();
  let totalMinutes = 0;

  const dailyBreakdown = weekDates.map((w) => {
    const { totalMinutes: dayMins, sessionsCount } = calculateDailyStudyTime(w.date, sessions);
    totalMinutes += dayMins;
    return {
      dayName: w.dayName,
      shortDay: w.shortDay,
      date: w.date,
      minutes: dayMins,
      hours: dayMins / 60,
      sessionsCount,
    };
  });

  return {
    totalMinutes,
    totalHours: totalMinutes / 60,
    dailyBreakdown,
  };
}

export function calculateWeeklyStatus(weeklyTargetMinutes: number, currentWeeklyMinutes: number): {
  status: 'ahead' | 'on_track' | 'behind';
  deltaMinutes: number;
  deltaHoursText: string;
  message: string;
  percentage: number;
} {
  const now = new Date();
  const currentDayOfWeek = now.getDay(); // 0 is Sun, 1 is Mon, etc.
  const daysPassed = currentDayOfWeek === 0 ? 7 : currentDayOfWeek;
  
  // Pro-rated target for elapsed days in the week
  const expectedPaceMinutes = (weeklyTargetMinutes / 7) * daysPassed;
  const deltaMinutes = currentWeeklyMinutes - expectedPaceMinutes;
  const deltaHoursAbs = Math.abs(deltaMinutes / 60).toFixed(1).replace('.0', '');
  
  const percentage = weeklyTargetMinutes > 0 ? Math.min(100, Math.round((currentWeeklyMinutes / weeklyTargetMinutes) * 100)) : 0;

  if (Math.abs(deltaMinutes) <= 30) {
    return {
      status: 'on_track',
      deltaMinutes,
      deltaHoursText: `${deltaHoursAbs}h`,
      message: "You're right on track with your weekly target.",
      percentage,
    };
  } else if (deltaMinutes > 30) {
    return {
      status: 'ahead',
      deltaMinutes,
      deltaHoursText: `${deltaHoursAbs}h`,
      message: `You're ${deltaHoursAbs} ${deltaHoursAbs === '1' ? 'hour' : 'hours'} ahead of your weekly target.`,
      percentage,
    };
  } else {
    return {
      status: 'behind',
      deltaMinutes,
      deltaHoursText: `${deltaHoursAbs}h`,
      message: `You're ${deltaHoursAbs} ${deltaHoursAbs === '1' ? 'hour' : 'hours'} behind this week's target pace.`,
      percentage,
    };
  }
}

export function calculateCurrentStreak(sessions: StudySession[]): number {
  if (!sessions.length) return 0;

  // Unique dates with at least 1 study session
  const dates = Array.from(new Set(sessions.map((s) => s.date))).sort().reverse();
  if (!dates.length) return 0;

  const today = getTodayIsoDate();
  const yesterdayDate = new Date();
  yesterdayDate.setDate(yesterdayDate.getDate() - 1);
  const yesterday = `${yesterdayDate.getFullYear()}-${String(yesterdayDate.getMonth() + 1).padStart(2, '0')}-${String(yesterdayDate.getDate()).padStart(2, '0')}`;

  let streak = 0;
  let checkDate = dates.includes(today) ? today : (dates.includes(yesterday) ? yesterday : null);

  if (!checkDate) return 0;

  let currentPtr = new Date(checkDate.split('-')[0] as any, parseInt(checkDate.split('-')[1]) - 1, parseInt(checkDate.split('-')[2]));

  while (true) {
    const formatted = `${currentPtr.getFullYear()}-${String(currentPtr.getMonth() + 1).padStart(2, '0')}-${String(currentPtr.getDate()).padStart(2, '0')}`;
    if (dates.includes(formatted)) {
      streak++;
      currentPtr.setDate(currentPtr.getDate() - 1);
    } else {
      break;
    }
  }

  return streak;
}

export function calculateLongestStreak(sessions: StudySession[]): number {
  if (!sessions.length) return 0;

  const dates = Array.from(new Set(sessions.map((s) => s.date))).sort();
  if (!dates.length) return 0;

  let maxStreak = 0;
  let currentStreak = 0;
  let prevDate: Date | null = null;

  for (const dStr of dates) {
    const parts = dStr.split('-');
    const curDate = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));

    if (!prevDate) {
      currentStreak = 1;
    } else {
      const diffTime = curDate.getTime() - prevDate.getTime();
      const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 1) {
        currentStreak++;
      } else {
        currentStreak = 1;
      }
    }

    if (currentStreak > maxStreak) {
      maxStreak = currentStreak;
    }
    prevDate = curDate;
  }

  return maxStreak;
}

export function calculateSubjectStreak(subjectId: string, sessions: StudySession[]): number {
  const subjectSessions = sessions.filter((s) => s.subjectId === subjectId);
  return calculateCurrentStreak(subjectSessions);
}

export function calculateStudyDistribution(subjects: Subject[], sessions: StudySession[]): {
  subjectId: string;
  name: string;
  color: string;
  minutes: number;
  hours: number;
  percentage: number;
}[] {
  const totalMinutes = sessions.reduce((acc, s) => acc + (s.durationMinutes || 0), 0);

  return subjects.map((sub) => {
    const subMinutes = sessions
      .filter((s) => s.subjectId === sub.id)
      .reduce((acc, s) => acc + (s.durationMinutes || 0), 0);

    const percentage = totalMinutes > 0 ? Math.round((subMinutes / totalMinutes) * 100) : 0;

    return {
      subjectId: sub.id,
      name: sub.name,
      color: sub.color,
      minutes: subMinutes,
      hours: subMinutes / 60,
      percentage,
    };
  }).sort((a, b) => b.minutes - a.minutes);
}

export function calculateActivityHeatmap(sessions: StudySession[], daysCount: number = 90): {
  date: string;
  minutes: number;
  hours: number;
  sessionCount: number;
  intensity: 0 | 1 | 2 | 3; // 0: empty, 1: low (<2h), 2: medium (2-4h), 3: high (>4h)
  subjectsList: string[];
}[] {
  const dates = getLastNDaysDates(daysCount);
  
  return dates.map((dateStr) => {
    const daySessions = sessions.filter((s) => s.date === dateStr);
    const minutes = daySessions.reduce((acc, s) => acc + (s.durationMinutes || 0), 0);
    const hours = minutes / 60;
    
    let intensity: 0 | 1 | 2 | 3 = 0;
    if (minutes > 0 && minutes < 120) intensity = 1;
    else if (minutes >= 120 && minutes <= 240) intensity = 2;
    else if (minutes > 240) intensity = 3;

    const subjectsList = Array.from(new Set(daySessions.map((s) => s.subjectId)));

    return {
      date: dateStr,
      minutes,
      hours,
      sessionCount: daySessions.length,
      intensity,
      subjectsList,
    };
  });
}
