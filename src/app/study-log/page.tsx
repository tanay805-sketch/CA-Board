'use client';

import React, { useState } from 'react';
import { useApp } from '@/lib/context';
import { formatFriendlyDate, formatMinutesToHours, getTodayIsoDate } from '@/lib/dates';
import { LogSessionModal } from '@/components/modals/LogSessionModal';
import { StudySession } from '@/types';
import { Clock, Plus, Filter, ArrowUpDown, Star, Edit2, Trash2, BookOpen } from 'lucide-react';

export default function StudyLogPage() {
  const { state, deleteSession } = useApp();

  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<'all' | 'week' | 'month'>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'longest'>('newest');

  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const [editingSession, setEditingSession] = useState<StudySession | null>(null);

  // Filter logic
  let filteredSessions = state.studySessions.filter((s) => {
    if (selectedSubjectId !== 'all' && s.subjectId !== selectedSubjectId) return false;

    if (dateFilter === 'week') {
      const sessDate = new Date(s.date);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      if (sessDate < weekAgo) return false;
    } else if (dateFilter === 'month') {
      const sessDate = new Date(s.date);
      const monthAgo = new Date();
      monthAgo.setMonth(monthAgo.getMonth() - 1);
      if (sessDate < monthAgo) return false;
    }

    return true;
  });

  // Sorting logic
  filteredSessions.sort((a, b) => {
    if (sortBy === 'newest') return b.date.localeCompare(a.date);
    if (sortBy === 'oldest') return a.date.localeCompare(b.date);
    if (sortBy === 'longest') return b.durationMinutes - a.durationMinutes;
    return 0;
  });

  const totalFilteredMinutes = filteredSessions.reduce((acc, s) => acc + (s.durationMinutes || 0), 0);

  return (
    <div className="space-y-6 pb-16">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100">Study Log</h1>
          <p className="text-sm font-semibold text-blue-600 dark:text-blue-400 mt-1">
            {filteredSessions.length} {filteredSessions.length === 1 ? 'session' : 'sessions'} · {formatMinutesToHours(totalFilteredMinutes)} total
          </p>
        </div>

        <button
          onClick={() => {
            setEditingSession(null);
            setIsLogModalOpen(true);
          }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-base shadow-lg shadow-blue-500/25 transition-all w-fit"
        >
          <Plus className="w-5 h-5" />
          <span>Log Study Session</span>
        </button>
      </div>

      {/* Filter & Toolbar Bar */}
      <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-subtle flex flex-wrap items-center justify-between gap-4">
        {/* Subject Filter */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 text-xs font-bold uppercase text-slate-400">
            <Filter className="w-4 h-4" />
            <span>Filter</span>
          </div>

          <select
            value={selectedSubjectId}
            onChange={(e) => setSelectedSubjectId(e.target.value)}
            className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-semibold text-sm border-0 focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Subjects</option>
            {state.subjects.map((sub) => (
              <option key={sub.id} value={sub.id}>
                {sub.name}
              </option>
            ))}
          </select>

          {/* Date Filter */}
          <div className="flex gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
            {(['all', 'week', 'month'] as const).map((df) => (
              <button
                key={df}
                onClick={() => setDateFilter(df)}
                className={`px-3 py-1 rounded-lg text-xs font-bold capitalize transition-all ${
                  dateFilter === df
                    ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                {df === 'all' ? 'All Time' : df === 'week' ? 'This Week' : 'This Month'}
              </button>
            ))}
          </div>
        </div>

        {/* Sort Filter */}
        <div className="flex items-center gap-2">
          <ArrowUpDown className="w-4 h-4 text-slate-400" />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-semibold text-sm border-0 focus:ring-2 focus:ring-blue-500"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="longest">Longest Duration</option>
          </select>
        </div>
      </div>

      {/* Log List / Rows */}
      {filteredSessions.length === 0 ? (
        <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800 space-y-3">
          <Clock className="w-12 h-12 mx-auto text-slate-400" />
          <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200">No study sessions yet.</h3>
          <p className="text-sm text-slate-500 max-w-sm mx-auto">
            Start by logging your first session to build your study history.
          </p>
          <button
            onClick={() => {
              setEditingSession(null);
              setIsLogModalOpen(true);
            }}
            className="px-5 py-2.5 rounded-xl bg-blue-600 text-white font-bold text-sm hover:bg-blue-700 transition-colors shadow-md"
          >
            Log Study Session
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredSessions.map((session) => {
            const sub = state.subjects.find((s) => s.id === session.subjectId);

            return (
              <div
                key={session.id}
                className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-subtle hover:shadow-md transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1.5 min-w-0">
                  <div className="flex flex-wrap items-center gap-3">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: sub?.color || '#3b82f6' }}
                      />
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                        {sub?.name || 'Subject'}
                      </span>
                    </div>
                    <span className="text-xs text-slate-400">•</span>
                    <span className="text-xs font-bold text-slate-500">
                      {formatFriendlyDate(session.date)}
                    </span>
                  </div>

                  <h3 className="text-lg font-extrabold text-slate-900 dark:text-slate-100">
                    {session.topic}
                  </h3>

                  {session.notes && (
                    <p className="text-xs text-slate-600 dark:text-slate-400 italic">
                      &quot;{session.notes}&quot;
                    </p>
                  )}
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-4 flex-shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-slate-800">
                  {/* Focus & Difficulty */}
                  <div className="flex items-center gap-3">
                    {session.focusRating && (
                      <div className="flex items-center gap-1 text-xs text-amber-500 font-bold">
                        <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                        <span>{session.focusRating}/5</span>
                      </div>
                    )}
                    {session.difficulty && (
                      <span
                        className={`text-[11px] font-bold uppercase px-2.5 py-0.5 rounded-full ${
                          session.difficulty === 'easy'
                            ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300'
                            : session.difficulty === 'medium'
                            ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300'
                            : 'bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300'
                        }`}
                      >
                        {session.difficulty}
                      </span>
                    )}
                    <span className="text-sm font-black px-3.5 py-1 rounded-xl bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400">
                      {formatMinutesToHours(session.durationMinutes)}
                    </span>
                  </div>

                  {/* Edit/Delete Actions */}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => {
                        setEditingSession(session);
                        setIsLogModalOpen(true);
                      }}
                      className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      title="Edit session"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => deleteSession(session.id)}
                      className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                      title="Delete session"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Log Modal */}
      <LogSessionModal
        isOpen={isLogModalOpen}
        onClose={() => setIsLogModalOpen(false)}
        sessionToEdit={editingSession}
      />
    </div>
  );
}
