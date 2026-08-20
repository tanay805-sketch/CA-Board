'use client';

import React, { useState } from 'react';
import { useApp } from '@/lib/context';
import { calculateDailyStudyTime } from '@/lib/calculations';
import { getTodayIsoDate, formatMinutesToHours } from '@/lib/dates';
import { Clock, Plus, Star, BookOpen, Trash2, Edit2 } from 'lucide-react';
import { LogSessionModal } from '@/components/modals/LogSessionModal';
import { StudySession } from '@/types';

export function TodaysStudySection() {
  const { state, deleteSession } = useApp();
  const todayStr = getTodayIsoDate();
  const daily = calculateDailyStudyTime(todayStr, state.studySessions);
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const [editingSession, setEditingSession] = useState<StudySession | null>(null);

  const handleEdit = (session: StudySession) => {
    setEditingSession(session);
    setIsLogModalOpen(true);
  };

  return (
    <>
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-subtle space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-100 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">Today&apos;s Study</h2>
              <p className="text-xs text-slate-500 font-medium">
                Total today: <span className="font-bold text-blue-600 dark:text-blue-400">{formatMinutesToHours(daily.totalMinutes)}</span>
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              setEditingSession(null);
              setIsLogModalOpen(true);
            }}
            className="flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md shadow-blue-500/20 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Log Session</span>
          </button>
        </div>

        {daily.sessions.length === 0 ? (
          <div className="p-8 text-center bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 space-y-3">
            <BookOpen className="w-10 h-10 mx-auto text-slate-400" />
            <div className="text-base font-semibold text-slate-700 dark:text-slate-300">
              You haven&apos;t logged any study time today.
            </div>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Start building your streak! Log your first study session when you finish a chapter or illustration.
            </p>
            <button
              onClick={() => {
                setEditingSession(null);
                setIsLogModalOpen(true);
              }}
              className="px-5 py-2.5 rounded-xl bg-blue-600 text-white font-bold text-sm hover:bg-blue-700 transition-colors shadow-md"
            >
              Log your first session
            </button>
          </div>
        ) : (
          <div className="space-y-2.5">
            {daily.sessions.map((sess) => {
              const sub = state.subjects.find((s) => s.id === sess.subjectId);
              return (
                <div
                  key={sess.id}
                  className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 hover:bg-slate-100 dark:bg-slate-800/60 dark:hover:bg-slate-800 border border-slate-200/50 dark:border-slate-700/50 transition-all group"
                >
                  <div
                    onClick={() => handleEdit(sess)}
                    className="flex items-center gap-3.5 min-w-0 flex-1 cursor-pointer"
                  >
                    <div
                      className="w-3.5 h-3.5 rounded-full flex-shrink-0"
                      style={{ backgroundColor: sub?.color || '#3b82f6' }}
                    />
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-base text-slate-900 dark:text-slate-100 truncate">
                          {sess.topic}
                        </span>
                        <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-slate-200/80 dark:bg-slate-700 text-slate-700 dark:text-slate-300 flex-shrink-0">
                          {sub?.name || 'Subject'}
                        </span>
                      </div>
                      {sess.startTime && (
                        <span className="text-xs text-slate-500 font-medium">
                          {sess.startTime} {sess.endTime ? `– ${sess.endTime}` : ''}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                    {sess.focusRating && (
                      <div className="hidden sm:flex items-center gap-0.5 text-xs text-amber-500 font-bold mr-1">
                        <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                        <span>{sess.focusRating}/5</span>
                      </div>
                    )}
                    <span className="font-extrabold text-sm px-3 py-1 rounded-xl bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 mr-1">
                      {formatMinutesToHours(sess.durationMinutes)}
                    </span>

                    {/* Edit Action Button */}
                    <button
                      onClick={() => handleEdit(sess)}
                      className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                      title="Edit Session"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>

                    {/* Direct Delete Session Action Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteSession(sess.id);
                      }}
                      className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-100 dark:hover:bg-rose-950/60 transition-colors"
                      title="Delete Session"
                    >
                      <Trash2 className="w-4 h-4 text-rose-500" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <LogSessionModal
        isOpen={isLogModalOpen}
        onClose={() => setIsLogModalOpen(false)}
        sessionToEdit={editingSession}
      />
    </>
  );
}
