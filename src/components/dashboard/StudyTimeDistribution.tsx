'use client';

import React from 'react';
import { useApp } from '@/lib/context';
import { calculateStudyDistribution } from '@/lib/calculations';
import { formatMinutesToHours } from '@/lib/dates';
import { PieChart } from 'lucide-react';

export function StudyTimeDistribution() {
  const { state } = useApp();

  const distribution = calculateStudyDistribution(state.subjects, state.studySessions);
  const activeDist = distribution.filter((d) => d.minutes > 0);

  return (
    <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-subtle space-y-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-2xl bg-purple-100 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold">
          <PieChart className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">Study Time Distribution</h2>
          <p className="text-xs text-slate-500 font-medium">Actual hours invested per subject</p>
        </div>
      </div>

      {activeDist.length === 0 ? (
        <div className="py-6 text-center text-slate-400 text-sm font-medium">
          No study sessions logged yet to calculate time distribution.
        </div>
      ) : (
        <div className="space-y-4">
          {/* Stacked Bar Distribution */}
          <div className="w-full h-4 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden flex">
            {activeDist.map((item) => (
              <div
                key={item.subjectId}
                className="h-full transition-all duration-500"
                style={{
                  width: `${item.percentage}%`,
                  backgroundColor: item.color,
                }}
                title={`${item.name}: ${item.percentage}% (${formatMinutesToHours(item.minutes)})`}
              />
            ))}
          </div>

          {/* Detailed Legend */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
            {distribution.map((item) => (
              <div
                key={item.subjectId}
                className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/60 text-xs"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <div
                    className="w-3 h-3 rounded-full flex-shrink-0"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="font-semibold text-slate-800 dark:text-slate-200 truncate">
                    {item.name}
                  </span>
                </div>
                <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-slate-100 flex-shrink-0">
                  <span>{formatMinutesToHours(item.minutes)}</span>
                  <span className="text-slate-400 font-normal">({item.percentage}%)</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
