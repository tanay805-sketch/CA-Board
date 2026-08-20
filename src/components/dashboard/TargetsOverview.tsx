'use client';

import React from 'react';
import { useApp } from '@/lib/context';
import { calculateDailyStudyTime, calculateWeeklyStudyTime, calculateWeeklyStatus } from '@/lib/calculations';
import { getTodayIsoDate, formatMinutesToHours } from '@/lib/dates';
import { Sun, Calendar, CheckCircle2 } from 'lucide-react';

export function TargetsOverview() {
  const { state } = useApp();

  const todayStr = getTodayIsoDate();
  const daily = calculateDailyStudyTime(todayStr, state.studySessions);
  const dailyTargetMins = state.settings.dailyTargetMinutes || 360;
  const dailyPct = Math.min(100, Math.round((daily.totalMinutes / dailyTargetMins) * 100));
  const dailyRemainingMins = Math.max(0, dailyTargetMins - daily.totalMinutes);

  const weekly = calculateWeeklyStudyTime(state.studySessions);
  const weeklyTargetMins = state.settings.weeklyTargetMinutes || 2520;
  const weeklyStatus = calculateWeeklyStatus(weeklyTargetMins, weekly.totalMinutes);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Daily Target Card */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-subtle flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-amber-100 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
                <Sun className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">Today&apos;s Target</h3>
                <p className="text-xs text-slate-500 font-medium">Daily study goal</p>
              </div>
            </div>
            <span className="text-xl font-extrabold text-slate-900 dark:text-slate-100">
              {dailyPct}%
            </span>
          </div>

          <div className="flex items-baseline justify-between text-sm mb-2">
            <span className="font-extrabold text-2xl text-slate-900 dark:text-slate-100">
              {formatMinutesToHours(daily.totalMinutes)}
            </span>
            <span className="text-slate-500 font-semibold">
              / {formatMinutesToHours(dailyTargetMins)} target
            </span>
          </div>

          <div className="w-full bg-slate-100 dark:bg-slate-800 h-3 rounded-full overflow-hidden mb-3">
            <div
              className="h-full bg-gradient-to-r from-amber-400 to-amber-500 rounded-full progress-bar-animated"
              style={{ width: `${dailyPct}%` }}
            />
          </div>
        </div>

        <div className="text-xs font-semibold text-slate-600 dark:text-slate-400 flex items-center gap-1.5 pt-1 border-t border-slate-100 dark:border-slate-800/60">
          {dailyPct >= 100 ? (
            <>
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span className="text-emerald-600 dark:text-emerald-400 font-bold">Daily target complete! Great job!</span>
            </>
          ) : (
            <span>{formatMinutesToHours(dailyRemainingMins)} remaining to reach today&apos;s goal</span>
          )}
        </div>
      </div>

      {/* Weekly Target Card */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-subtle flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-indigo-100 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">Weekly Target</h3>
                <p className="text-xs text-slate-500 font-medium">This week&apos;s progress</p>
              </div>
            </div>
            <span
              className={`text-xs font-bold px-2.5 py-1 rounded-full capitalize ${
                weeklyStatus.status === 'ahead'
                  ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300'
                  : weeklyStatus.status === 'on_track'
                  ? 'bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300'
                  : 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300'
              }`}
            >
              {weeklyStatus.status.replace('_', ' ')}
            </span>
          </div>

          <div className="flex items-baseline justify-between text-sm mb-2">
            <span className="font-extrabold text-2xl text-slate-900 dark:text-slate-100">
              {formatMinutesToHours(weekly.totalMinutes)}
            </span>
            <span className="text-slate-500 font-semibold">
              / {formatMinutesToHours(weeklyTargetMins)} target
            </span>
          </div>

          <div className="w-full bg-slate-100 dark:bg-slate-800 h-3 rounded-full overflow-hidden mb-3">
            <div
              className="h-full bg-gradient-to-r from-indigo-500 to-blue-500 rounded-full progress-bar-animated"
              style={{ width: `${weeklyStatus.percentage}%` }}
            />
          </div>
        </div>

        <div className="text-xs font-semibold text-slate-600 dark:text-slate-400 flex items-center gap-1.5 pt-1 border-t border-slate-100 dark:border-slate-800/60">
          <span>{weeklyStatus.message}</span>
        </div>
      </div>
    </div>
  );
}
