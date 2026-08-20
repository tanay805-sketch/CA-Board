'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '@/lib/context';
import { Modal } from '@/components/ui/Modal';
import { Difficulty, StudySession } from '@/types';
import { getTodayIsoDate } from '@/lib/dates';
import { Star, Clock, Sparkles, Trash2 } from 'lucide-react';

interface LogSessionModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialSubjectId?: string;
  sessionToEdit?: StudySession | null;
}

export function LogSessionModal({ isOpen, onClose, initialSubjectId, sessionToEdit }: LogSessionModalProps) {
  const { state, logSession, updateSession, deleteSession } = useApp();

  const [subjectId, setSubjectId] = useState<string>('');
  const [date, setDate] = useState<string>(getTodayIsoDate());
  const [startTime, setStartTime] = useState<string>('');
  const [endTime, setEndTime] = useState<string>('');
  const [durationMinutes, setDurationMinutes] = useState<number>(60);
  const [topic, setTopic] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [difficulty, setDifficulty] = useState<Difficulty>('medium');
  const [focusRating, setFocusRating] = useState<number>(4);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (isOpen) {
      if (sessionToEdit) {
        setSubjectId(sessionToEdit.subjectId);
        setDate(sessionToEdit.date);
        setStartTime(sessionToEdit.startTime || '');
        setEndTime(sessionToEdit.endTime || '');
        setDurationMinutes(sessionToEdit.durationMinutes);
        setTopic(sessionToEdit.topic);
        setNotes(sessionToEdit.notes || '');
        setDifficulty(sessionToEdit.difficulty || 'medium');
        setFocusRating(sessionToEdit.focusRating || 4);
      } else {
        setSubjectId(initialSubjectId || (state.subjects[0]?.id ?? ''));
        setDate(getTodayIsoDate());
        setStartTime('');
        setEndTime('');
        setDurationMinutes(60);
        setTopic('');
        setNotes('');
        setDifficulty('medium');
        setFocusRating(4);
      }
      setError('');
    }
  }, [isOpen, sessionToEdit, initialSubjectId, state.subjects]);

  // Calculate duration from start and end time if entered
  useEffect(() => {
    if (startTime && endTime) {
      const [startH, startM] = startTime.split(':').map(Number);
      const [endH, endM] = endTime.split(':').map(Number);
      
      let startTotal = startH * 60 + startM;
      let endTotal = endH * 60 + endM;
      if (endTotal < startTotal) {
        endTotal += 24 * 60; // Next day fallback
      }
      const diff = endTotal - startTotal;
      if (diff > 0) {
        setDurationMinutes(diff);
      }
    }
  }, [startTime, endTime]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subjectId) {
      setError('Please select a subject.');
      return;
    }
    if (!topic.trim()) {
      setError('Topic or chapter title is required.');
      return;
    }
    if (!durationMinutes || durationMinutes <= 0) {
      setError('Duration must be greater than zero.');
      return;
    }
    if (!date) {
      setError('Date is required.');
      return;
    }

    if (sessionToEdit) {
      updateSession(sessionToEdit.id, {
        subjectId,
        date,
        startTime,
        endTime,
        durationMinutes,
        topic: topic.trim(),
        notes: notes.trim(),
        difficulty,
        focusRating,
      });
    } else {
      logSession({
        subjectId,
        date,
        startTime,
        endTime,
        durationMinutes,
        topic: topic.trim(),
        notes: notes.trim(),
        difficulty,
        focusRating,
      });
    }

    onClose();
  };

  const presetDurations = [
    { label: '30m', mins: 30 },
    { label: '1h', mins: 60 },
    { label: '1h 30m', mins: 90 },
    { label: '2h', mins: 120 },
    { label: '3h', mins: 180 },
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={sessionToEdit ? 'Edit Study Session' : 'Log Study Session'}
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 text-sm font-medium">
            {error}
          </div>
        )}

        {/* Subject Select */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
            Subject <span className="text-rose-500">*</span>
          </label>
          <select
            value={subjectId}
            onChange={(e) => setSubjectId(e.target.value)}
            className="w-full px-4 py-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-blue-500 text-base"
            required
          >
            {state.subjects.map((sub) => (
              <option key={sub.id} value={sub.id}>
                {sub.name}
              </option>
            ))}
          </select>
        </div>

        {/* Topic Title */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
            Topic / Chapter <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            placeholder="e.g. AS 14 Amalgamation, Salary Allowances, Audit Risk"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            className="w-full px-4 py-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-blue-500 text-base"
            required
          />
        </div>

        {/* Quick Duration Buttons & Custom Input */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
            Study Duration <span className="text-rose-500">*</span>
          </label>
          <div className="flex flex-wrap gap-2 mb-2.5">
            {presetDurations.map((p) => (
              <button
                type="button"
                key={p.mins}
                onClick={() => setDurationMinutes(p.mins)}
                className={`px-3.5 py-2 rounded-xl text-sm font-semibold transition-all ${
                  durationMinutes === p.mins
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <input
                type="number"
                min="1"
                max="1440"
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(parseInt(e.target.value) || 0)}
                className="w-full pl-10 pr-12 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-blue-500 text-base"
              />
              <Clock className="w-5 h-5 text-slate-400 absolute left-3 top-3" />
              <span className="absolute right-3 top-3 text-sm text-slate-400 font-medium">mins</span>
            </div>
            <div className="text-sm font-semibold text-slate-500 dark:text-slate-400 whitespace-nowrap">
              (= {(durationMinutes / 60).toFixed(1).replace('.0', '')} hrs)
            </div>
          </div>
        </div>

        {/* Date & Optional Start/End Times */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-700 text-sm"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Start Time (Optional)</label>
            <input
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-700 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">End Time (Optional)</label>
            <input
              type="time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-700 text-sm"
            />
          </div>
        </div>

        {/* Difficulty & Focus Rating */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Difficulty</label>
            <div className="flex gap-2">
              {(['easy', 'medium', 'hard'] as Difficulty[]).map((d) => (
                <button
                  type="button"
                  key={d}
                  onClick={() => setDifficulty(d)}
                  className={`flex-1 py-2 capitalize rounded-xl text-xs font-bold transition-all ${
                    difficulty === d
                      ? d === 'easy'
                        ? 'bg-emerald-600 text-white'
                        : d === 'medium'
                        ? 'bg-amber-600 text-white'
                        : 'bg-rose-600 text-white'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Focus Rating (1–5 Stars)
            </label>
            <div className="flex gap-1 items-center py-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  type="button"
                  key={star}
                  onClick={() => setFocusRating(star)}
                  className="p-1 text-amber-400 hover:scale-110 transition-transform"
                >
                  <Star className={`w-6 h-6 ${star <= focusRating ? 'fill-amber-400' : 'text-slate-300 dark:text-slate-700'}`} />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Notes & Key Takeaways</label>
          <textarea
            rows={3}
            placeholder="Key concepts revised, doubts, questions solved..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full px-4 py-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-blue-500 text-base"
          />
        </div>

        {/* Form Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
          {sessionToEdit ? (
            <button
              type="button"
              onClick={() => {
                deleteSession(sessionToEdit.id);
                onClose();
              }}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/60 text-rose-600 dark:text-rose-400 font-bold text-sm transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              <span>Delete Session</span>
            </button>
          ) : <div />}

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold text-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-base shadow-lg shadow-blue-500/25 transition-all flex items-center gap-2"
            >
              <Sparkles className="w-5 h-5" />
              {sessionToEdit ? 'Save Changes' : 'Log Session'}
            </button>
          </div>
        </div>
      </form>
    </Modal>
  );
}
