/**
 * Date utility functions for CA Study OS
 * Formats dates safely, handles local timezone, and calculates prep day counts.
 */

export function getTodayIsoDate(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function formatFriendlyDate(dateString: string): string {
  if (!dateString) return '';
  const today = getTodayIsoDate();
  
  const d = new Date();
  d.setDate(d.getDate() - 1);
  const yesterday = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

  if (dateString === today) return 'Today';
  if (dateString === yesterday) return 'Yesterday';

  // Parse YYYY-MM-DD
  const parts = dateString.split('-');
  if (parts.length === 3) {
    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1;
    const day = parseInt(parts[2], 10);
    const dateObj = new Date(year, month, day);
    
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${day} ${monthNames[month]}`;
  }

  return dateString;
}

export function formatFullDate(dateString: string): string {
  if (!dateString) return '';
  const parts = dateString.split('-');
  if (parts.length === 3) {
    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1;
    const day = parseInt(parts[2], 10);
    const dateObj = new Date(year, month, day);
    
    return dateObj.toLocaleDateString(undefined, {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }
  return dateString;
}

export function getPreparationDayCount(startDateString: string): number {
  if (!startDateString) return 1;
  const startParts = startDateString.split('-');
  if (startParts.length !== 3) return 1;

  const start = new Date(parseInt(startParts[0]), parseInt(startParts[1]) - 1, parseInt(startParts[2]));
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const diffTime = Math.max(0, today.getTime() - start.getTime());
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;
  return diffDays;
}

export function getTimeOfDayGreeting(name: string): { greeting: string; subtext: string } {
  const hour = new Date().getHours();
  let timeGreeting = 'Good morning';

  if (hour >= 12 && hour < 17) {
    timeGreeting = 'Good afternoon';
  } else if (hour >= 17 && hour < 22) {
    timeGreeting = 'Good evening';
  } else if (hour >= 22 || hour < 5) {
    timeGreeting = 'Good night';
  }

  const nameText = name ? `, ${name}` : '';
  return {
    greeting: `${timeGreeting}${nameText}`,
    subtext: 'Your CA Inter preparation dashboard',
  };
}

export function formatMinutesToHours(minutes: number): string {
  if (!minutes || minutes <= 0) return '0h';
  const hours = Math.floor(minutes / 60);
  const remainingMins = minutes % 60;
  if (hours === 0) return `${remainingMins}m`;
  if (remainingMins === 0) return `${hours}h`;
  return `${hours}h ${remainingMins}m`;
}

export function formatMinutesToDecimalHours(minutes: number): string {
  const hours = (minutes / 60).toFixed(1);
  return hours.endsWith('.0') ? hours.replace('.0', '') : hours;
}

/**
 * Returns the last 7 days (Mon to Sun of current week) ISO dates
 */
export function getCurrentWeekDates(): { dayName: string; shortDay: string; date: string }[] {
  const now = new Date();
  const currentDay = now.getDay(); // 0 is Sunday
  const distanceToMon = currentDay === 0 ? -6 : 1 - currentDay;
  
  const monday = new Date(now);
  monday.setDate(now.getDate() + distanceToMon);
  monday.setHours(0, 0, 0, 0);

  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const fullDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  return days.map((shortDay, idx) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + idx);
    const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    return {
      dayName: fullDays[idx],
      shortDay,
      date: dateStr,
    };
  });
}

/**
 * Generates last N days ISO dates for activity heatmap
 */
export function getLastNDaysDates(n: number = 90): string[] {
  const result: string[] = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    result.push(dateStr);
  }

  return result;
}

export function getDaysUntilExam(examDateString?: string): {
  days: number;
  formattedText: string;
  isExamToday: boolean;
  isPast: boolean;
} {
  const targetDateStr = examDateString || '2027-05-02';
  const parts = targetDateStr.split('-');
  
  if (parts.length !== 3) {
    return { days: 0, formattedText: 'Set Exam Date', isExamToday: false, isPast: false };
  }

  const examDate = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  examDate.setHours(0, 0, 0, 0);

  const diffTime = examDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return { days: 0, formattedText: 'Exam Today! All the best! 🎉', isExamToday: true, isPast: false };
  } else if (diffDays < 0) {
    return { days: Math.abs(diffDays), formattedText: 'Exam Completed', isExamToday: false, isPast: true };
  }

  return {
    days: diffDays,
    formattedText: `${diffDays} ${diffDays === 1 ? 'Day' : 'Days'} Left`,
    isExamToday: false,
    isPast: false,
  };
}
