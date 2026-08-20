'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '@/lib/context';
import { Modal } from '@/components/ui/Modal';
import { Search, BookOpen, Clock, CheckSquare, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { formatMinutesToHours, formatFriendlyDate } from '@/lib/dates';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function GlobalSearchModal({ isOpen, onClose }: GlobalSearchModalProps) {
  const { state } = useApp();
  const [query, setQuery] = useState('');

  useEffect(() => {
    if (isOpen) setQuery('');
  }, [isOpen]);

  const q = query.trim().toLowerCase();

  const matchingSubjects = q
    ? state.subjects.filter((s) => s.name.toLowerCase().includes(q))
    : [];

  const matchingSessions = q
    ? state.studySessions.filter(
        (s) => s.topic.toLowerCase().includes(q) || (s.notes && s.notes.toLowerCase().includes(q))
      )
    : [];

  const matchingTasks = q
    ? state.tasks.filter((t) => t.title.toLowerCase().includes(q))
    : [];

  const hasResults = matchingSubjects.length > 0 || matchingSessions.length > 0 || matchingTasks.length > 0;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Global Search" maxWidth="xl">
      <div className="space-y-4">
        {/* Search Bar Input */}
        <div className="relative">
          <Search className="w-5 h-5 text-slate-400 absolute left-4 top-3.5" />
          <input
            type="text"
            autoFocus
            placeholder="Search subjects, study topics, notes, or tasks... (e.g. Accounting, Contract Act)"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-700 text-base focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Search Results */}
        {!query.trim() ? (
          <div className="py-8 text-center text-slate-500 dark:text-slate-400 text-sm">
            Type a keyword to instantly search across subjects, study logs, notes, and tasks.
          </div>
        ) : !hasResults ? (
          <div className="py-8 text-center text-slate-500 dark:text-slate-400 text-sm">
            No results found matching &quot;{query}&quot;
          </div>
        ) : (
          <div className="max-h-[60vh] overflow-y-auto space-y-4 pr-1">
            {/* Subjects */}
            {matchingSubjects.length > 0 && (
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Subjects</h3>
                <div className="space-y-1.5">
                  {matchingSubjects.map((sub) => (
                    <Link
                      key={sub.id}
                      href={`/subjects/${sub.id}`}
                      onClick={onClose}
                      className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: sub.color }} />
                        <span className="font-semibold text-slate-900 dark:text-slate-100">{sub.name}</span>
                      </div>
                      <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Sessions */}
            {matchingSessions.length > 0 && (
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Study Sessions</h3>
                <div className="space-y-2">
                  {matchingSessions.slice(0, 5).map((sess) => {
                    const sub = state.subjects.find((s) => s.id === sess.subjectId);
                    return (
                      <div
                        key={sess.id}
                        className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/50 dark:border-slate-700/50"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-semibold text-slate-900 dark:text-slate-100">{sess.topic}</span>
                          <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400">
                            {formatMinutesToHours(sess.durationMinutes)}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 mt-1 text-xs text-slate-500">
                          <span>{sub?.name || 'Subject'}</span>
                          <span>•</span>
                          <span>{formatFriendlyDate(sess.date)}</span>
                        </div>
                        {sess.notes && (
                          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 line-clamp-1 italic">
                            &quot;{sess.notes}&quot;
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Tasks */}
            {matchingTasks.length > 0 && (
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Tasks</h3>
                <div className="space-y-1.5">
                  {matchingTasks.map((t) => (
                    <div
                      key={t.id}
                      className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60"
                    >
                      <CheckSquare
                        className={`w-4 h-4 ${
                          t.completed ? 'text-emerald-500' : 'text-slate-400'
                        }`}
                      />
                      <span
                        className={`text-sm ${
                          t.completed
                            ? 'line-through text-slate-400 dark:text-slate-500'
                            : 'text-slate-800 dark:text-slate-200 font-medium'
                        }`}
                      >
                        {t.title}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </Modal>
  );
}
