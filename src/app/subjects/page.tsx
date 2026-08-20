'use client';

import React, { useState } from 'react';
import { useApp } from '@/lib/context';
import { calculateSubjectStats } from '@/lib/calculations';
import { formatFriendlyDate, formatMinutesToDecimalHours } from '@/lib/dates';
import { IconHelper } from '@/components/ui/IconHelper';
import { Plus, BookOpen, Search, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { AddEditSubjectModal } from '@/components/modals/AddEditSubjectModal';

export default function SubjectsPage() {
  const { state } = useApp();
  const [search, setSearch] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const filteredSubjects = state.subjects.filter((sub) =>
    sub.name.toLowerCase().includes(search.trim().toLowerCase())
  );

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100">
            CA Subjects
          </h1>
          <p className="text-sm text-slate-500 font-medium mt-1">
            Manage your CA Intermediate modules, target hours, and progress.
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-base shadow-lg shadow-blue-500/25 transition-all w-fit"
        >
          <Plus className="w-5 h-5" />
          <span>Add Subject</span>
        </button>
      </div>

      {/* Filter / Search Bar */}
      <div className="relative max-w-md">
        <Search className="w-5 h-5 text-slate-400 absolute left-4 top-3.5" />
        <input
          type="text"
          placeholder="Filter subjects..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-12 pr-4 py-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-slate-900 dark:text-slate-100 text-base"
        />
      </div>

      {/* Empty State */}
      {filteredSubjects.length === 0 ? (
        <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800 space-y-3">
          <BookOpen className="w-12 h-12 mx-auto text-slate-400" />
          <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200">No subjects found</h3>
          <p className="text-sm text-slate-500 max-w-sm mx-auto">
            {search ? 'Try clearing your search query.' : 'Add your CA subjects to start tracking your preparation.'}
          </p>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-5 py-2.5 rounded-xl bg-blue-600 text-white font-bold text-sm hover:bg-blue-700 transition-colors shadow-md"
          >
            Add Subject
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredSubjects.map((subject) => {
            const stats = calculateSubjectStats(subject, state.studySessions);
            const lastStudiedText = stats.lastStudiedDate ? formatFriendlyDate(stats.lastStudiedDate) : 'Never';

            return (
              <Link
                key={subject.id}
                href={`/subjects/${subject.id}`}
                className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-subtle hover:shadow-card-hover transition-all duration-200 group flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-md"
                        style={{ backgroundColor: subject.color }}
                      >
                        <IconHelper name={subject.icon} className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="font-bold text-lg text-slate-900 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                          {subject.name}
                        </h3>
                        <p className="text-xs text-slate-500 font-medium">Target: {subject.targetHours} hours</p>
                      </div>
                    </div>
                  </div>

                  {/* Progress % Big */}
                  <div className="flex items-baseline justify-between mb-2">
                    <span className="text-3xl font-black text-slate-900 dark:text-slate-100">
                      {stats.progressPercentage}%
                    </span>
                    <span className="text-sm font-bold text-slate-600 dark:text-slate-400">
                      {formatMinutesToDecimalHours(stats.totalMinutes)} / {subject.targetHours} hrs
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full bg-slate-100 dark:bg-slate-800 h-3 rounded-full overflow-hidden mb-4">
                    <div
                      className="h-full rounded-full progress-bar-animated"
                      style={{
                        width: `${stats.progressPercentage}%`,
                        backgroundColor: subject.color,
                      }}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs font-semibold text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-2xl mb-4">
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">Sessions</span>
                      <span className="text-slate-900 dark:text-slate-100 text-sm font-black">{stats.sessionCount}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">Avg Session</span>
                      <span className="text-slate-900 dark:text-slate-100 text-sm font-black">
                        {stats.averageSessionMinutes ? `${stats.averageSessionMinutes}m` : '-'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-between text-xs font-medium">
                  <span className="text-slate-500">Last studied: <strong className="text-slate-700 dark:text-slate-300">{lastStudiedText}</strong></span>
                  <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            );
          })}
        </div>
      )}

      <AddEditSubjectModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} />
    </div>
  );
}
