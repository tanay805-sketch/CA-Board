'use client';

import React, { useState } from 'react';
import { useApp } from '@/lib/context';
import { calculateWeeklyStudyTime } from '@/lib/calculations';
import { formatMinutesToHours } from '@/lib/dates';
import { BarChart2 } from 'lucide-react';

export function WeeklyStudyChart() {
  const { state } = useApp();
  const [mode, setMode] = useState<'hours' | 'sessions'>('hours');

  const weekly = calculateWeeklyStudyTime(state.studySessions);

  // Find max for bar scaling
  const maxValue = Math.max(
    1,
    ...weekly.dailyBreakdown.map((d) => (mode === 'hours' ? d.hours : d.sessionsCount))
  );

  return (
    <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-subtle space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-indigo-100 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
            <BarChart2 className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">Weekly Study Chart</h2>
            <p className="text-xs text-slate-500 font-medium">This week: {formatMinutesToHours(weekly.totalMinutes)}</p>
          </div>
        </div>

        {/* Toggle Mode */}
        <div className="flex gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
          <button
            onClick={() => setMode('hours')}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
              mode === 'hours'
                ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            Hours
          </button>
          <button
            onClick={() => setMode('sessions')}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
              mode === 'sessions'
                ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            Sessions
          </button>
        </div>
      </div>

      {/* Bar Chart Graphics */}
      <div className="pt-6 pb-2 flex items-end justify-between gap-2 h-48 border-b border-slate-100 dark:border-slate-800">
        {weekly.dailyBreakdown.map((d) => {
          const val = mode === 'hours' ? d.hours : d.sessionsCount;
          const heightPct = Math.max(8, Math.round((val / maxValue) * 100));

          return (
            <div key={d.date} className="flex-1 flex flex-col items-center gap-2 group relative">
              {/* Tooltip on hover */}
              <div className="absolute -top-10 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 text-white text-xs font-bold py-1 px-2.5 rounded-lg whitespace-nowrap z-20 pointer-events-none shadow-md">
                {d.dayName} — {mode === 'hours' ? formatMinutesToHours(d.minutes) : `${d.sessionsCount} sessions`}
              </div>

              {/* Bar Container */}
              <div className="w-full flex items-end justify-center h-36">
                <div
                  className={`w-full max-w-[36px] rounded-2xl transition-all duration-500 ${
                    val > 0
                      ? 'bg-gradient-to-t from-blue-600 to-indigo-500 shadow-md group-hover:brightness-110'
                      : 'bg-slate-100 dark:bg-slate-800'
                  }`}
                  style={{ height: `${val > 0 ? heightPct : 6}%` }}
                />
              </div>

              {/* Day Label */}
              <span className="text-xs font-extrabold text-slate-500 dark:text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                {d.shortDay}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
