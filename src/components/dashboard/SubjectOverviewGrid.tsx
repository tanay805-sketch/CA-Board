'use client';

import React from 'react';
import { useApp } from '@/lib/context';
import { calculateSubjectStats } from '@/lib/calculations';
import { formatFriendlyDate, formatMinutesToDecimalHours } from '@/lib/dates';
import { IconHelper } from '@/components/ui/IconHelper';
import { ArrowUpRight, BookOpen } from 'lucide-react';
import Link from 'next/link';

export function SubjectOverviewGrid() {
  const { state } = useApp();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-extrabold text-slate-900 dark:text-slate-100">Subjects Overview</h2>
        <Link
          href="/subjects"
          className="text-sm font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
        >
          View All <ArrowUpRight className="w-4 h-4" />
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {state.subjects.map((subject) => {
          const stats = calculateSubjectStats(subject, state.studySessions);
          const lastStudiedText = stats.lastStudiedDate ? formatFriendlyDate(stats.lastStudiedDate) : 'Never';

          return (
            <Link
              key={subject.id}
              href={`/subjects/${subject.id}`}
              className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-subtle hover:shadow-card-hover transition-all duration-200 group flex flex-col justify-between"
            >
              <div>
                {/* Header with Icon & Color dot */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-2xl flex items-center justify-center text-white shadow-sm"
                      style={{ backgroundColor: subject.color }}
                    >
                      <IconHelper name={subject.icon} className="w-5 h-5" />
                    </div>
                    <span className="font-bold text-base text-slate-900 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-1">
                      {subject.name}
                    </span>
                  </div>
                  <span className="text-lg font-black text-slate-900 dark:text-slate-100">
                    {stats.progressPercentage}%
                  </span>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden mb-3">
                  <div
                    className="h-full rounded-full progress-bar-animated"
                    style={{
                      width: `${stats.progressPercentage}%`,
                      backgroundColor: subject.color,
                    }}
                  />
                </div>

                <div className="flex items-baseline justify-between text-xs font-semibold text-slate-600 dark:text-slate-400 mb-4">
                  <span>
                    <strong className="text-slate-900 dark:text-slate-100 font-extrabold text-sm">
                      {formatMinutesToDecimalHours(stats.totalMinutes)}
                    </strong>{' '}
                    / {subject.targetHours} hrs
                  </span>
                  <span>{stats.sessionCount} {stats.sessionCount === 1 ? 'session' : 'sessions'}</span>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-between text-xs text-slate-500 font-medium">
                <span>Last studied:</span>
                <span className="font-bold text-slate-700 dark:text-slate-300">{lastStudiedText}</span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
