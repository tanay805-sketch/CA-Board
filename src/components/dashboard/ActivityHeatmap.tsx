'use client';

import React, { useState } from 'react';
import { useApp } from '@/lib/context';
import { calculateActivityHeatmap } from '@/lib/calculations';
import { formatFullDate, formatMinutesToHours } from '@/lib/dates';
import { Calendar, Info } from 'lucide-react';

export function ActivityHeatmap() {
  const { state } = useApp();
  const heatmapData = calculateActivityHeatmap(state.studySessions, 91); // 13 weeks = 91 days
  const [selectedDay, setSelectedDay] = useState<typeof heatmapData[0] | null>(null);

  const intensityColors = {
    0: 'bg-slate-100 dark:bg-slate-800 border-transparent',
    1: 'bg-emerald-200 dark:bg-emerald-900/60 border-emerald-300 dark:border-emerald-700',
    2: 'bg-emerald-400 dark:bg-emerald-600 border-emerald-500',
    3: 'bg-emerald-600 dark:bg-emerald-400 border-emerald-700',
  };

  return (
    <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-subtle space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">Study Activity Heatmap</h2>
            <p className="text-xs text-slate-500 font-medium">Last 90 days consistency map</p>
          </div>
        </div>

        {/* Intensity Legend */}
        <div className="flex items-center gap-1.5 text-xs text-slate-500 font-semibold">
          <span>Less</span>
          <span className="w-3.5 h-3.5 rounded bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700" />
          <span className="w-3.5 h-3.5 rounded bg-emerald-200 dark:bg-emerald-900/60" />
          <span className="w-3.5 h-3.5 rounded bg-emerald-400 dark:bg-emerald-600" />
          <span className="w-3.5 h-3.5 rounded bg-emerald-600 dark:bg-emerald-400" />
          <span>More</span>
        </div>
      </div>

      {/* Grid of 91 squares (13 columns x 7 rows) */}
      <div className="overflow-x-auto pb-2">
        <div className="grid grid-flow-col grid-rows-7 gap-1.5 min-w-[640px]">
          {heatmapData.map((day) => (
            <button
              key={day.date}
              onClick={() => setSelectedDay(day)}
              className={`w-4 h-4 rounded-md border transition-transform hover:scale-125 focus:ring-2 focus:ring-emerald-500 ${
                intensityColors[day.intensity]
              }`}
              title={`${formatFullDate(day.date)}: ${formatMinutesToHours(day.minutes)} (${day.sessionCount} sessions)`}
            />
          ))}
        </div>
      </div>

      {/* Selected Day Details Panel */}
      {selectedDay && (
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between text-xs sm:text-sm">
          <div>
            <div className="font-extrabold text-slate-900 dark:text-slate-100">
              {formatFullDate(selectedDay.date)}
            </div>
            <div className="text-slate-500 mt-0.5">
              {selectedDay.minutes > 0
                ? `${formatMinutesToHours(selectedDay.minutes)} studied across ${selectedDay.sessionCount} session(s)`
                : 'No study session logged on this date.'}
            </div>
          </div>
          <button
            onClick={() => setSelectedDay(null)}
            className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline"
          >
            Close
          </button>
        </div>
      )}
    </div>
  );
}
