'use client';

import React, { useState, use } from 'react';
import { useApp } from '@/lib/context';
import { calculateSubjectStats } from '@/lib/calculations';
import { formatFriendlyDate, formatMinutesToDecimalHours, formatMinutesToHours, getTodayIsoDate } from '@/lib/dates';
import { IconHelper } from '@/components/ui/IconHelper';
import { Modal } from '@/components/ui/Modal';
import { AddEditSubjectModal } from '@/components/modals/AddEditSubjectModal';
import { LogSessionModal } from '@/components/modals/LogSessionModal';
import { StudySession, Task } from '@/types';
import {
  Clock,
  Plus,
  Edit2,
  Trash2,
  CheckSquare,
  Star,
  Flame,
  ArrowLeft,
  Calendar,
  AlertTriangle,
  Flame as FlameIcon,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function SubjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const subjectId = resolvedParams.id;

  const { state, deleteSubject, deleteSession, addTask, toggleTask, deleteTask } = useApp();
  const router = useRouter();

  const subject = state.subjects.find((s) => s.id === subjectId);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [editingSession, setEditingSession] = useState<StudySession | null>(null);

  // New Task Inline State
  const [newTaskTitle, setNewTaskTitle] = useState('');

  if (!subject) {
    return (
      <div className="py-12 text-center space-y-4">
        <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200">Subject Not Found</h2>
        <p className="text-slate-500 text-sm">This subject may have been deleted.</p>
        <Link href="/subjects" className="inline-block px-5 py-2.5 rounded-xl bg-blue-600 text-white font-bold text-sm">
          Return to Subjects
        </Link>
      </div>
    );
  }

  const stats = calculateSubjectStats(subject, state.studySessions);
  const subjectSessions = state.studySessions
    .filter((s) => s.subjectId === subjectId)
    .sort((a, b) => b.date.localeCompare(a.date));

  const subjectTasks = state.tasks.filter((t) => t.subjectId === subjectId);
  const completedTasksCount = subjectTasks.filter((t) => t.completed).length;
  const remainingTasksCount = subjectTasks.length - completedTasksCount;

  const handleDeleteSubjectConfirmed = () => {
    deleteSubject(subject.id);
    setIsDeleteConfirmOpen(false);
    router.push('/subjects');
  };

  const handleCreateInlineTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    addTask({
      title: newTaskTitle.trim(),
      subjectId: subject.id,
      priority: 'medium',
      dueDate: getTodayIsoDate(),
    });
    setNewTaskTitle('');
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Back Link */}
      <Link
        href="/subjects"
        className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-blue-600 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Subjects
      </Link>

      {/* Header Card */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-subtle flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div
            className="w-16 h-16 rounded-3xl flex items-center justify-center text-white shadow-lg flex-shrink-0"
            style={{ backgroundColor: subject.color }}
          >
            <IconHelper name={subject.icon} className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100">
              {subject.name}
            </h1>
            <p className="text-sm font-semibold text-slate-500 mt-1">
              Target: {subject.targetHours} hours • Created {formatFriendlyDate(subject.createdAt)}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => {
              setEditingSession(null);
              setIsLogModalOpen(true);
            }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md shadow-blue-500/20 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Log Session</span>
          </button>
          <button
            onClick={() => setIsEditModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-sm transition-colors"
          >
            <Edit2 className="w-4 h-4" />
            <span>Edit</span>
          </button>
          <button
            onClick={() => setIsDeleteConfirmOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/60 text-rose-600 dark:text-rose-400 font-bold text-sm transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            <span>Delete</span>
          </button>
        </div>
      </div>

      {/* Progress Visualization Card */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-subtle space-y-3">
        <div className="flex items-baseline justify-between">
          <span className="text-xl font-bold text-slate-900 dark:text-slate-100">Progress</span>
          <span className="text-2xl font-black text-slate-900 dark:text-slate-100">
            {stats.progressPercentage}% complete
          </span>
        </div>
        <div className="flex items-baseline justify-between text-sm font-semibold text-slate-500">
          <span>{formatMinutesToDecimalHours(stats.totalMinutes)} hrs studied</span>
          <span>{subject.targetHours} hrs total target</span>
        </div>
        <div className="w-full bg-slate-100 dark:bg-slate-800 h-4 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full progress-bar-animated"
            style={{ width: `${stats.progressPercentage}%`, backgroundColor: subject.color }}
          />
        </div>
      </div>

      {/* Statistics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80">
          <div className="text-xs uppercase font-bold text-slate-400">Total Hours</div>
          <div className="text-xl font-black text-slate-900 dark:text-slate-100 mt-1">
            {formatMinutesToDecimalHours(stats.totalMinutes)}h
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80">
          <div className="text-xs uppercase font-bold text-slate-400">Sessions</div>
          <div className="text-xl font-black text-slate-900 dark:text-slate-100 mt-1">
            {stats.sessionCount}
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80">
          <div className="text-xs uppercase font-bold text-slate-400">Avg Length</div>
          <div className="text-xl font-black text-slate-900 dark:text-slate-100 mt-1">
            {stats.averageSessionMinutes ? `${stats.averageSessionMinutes}m` : '-'}
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80">
          <div className="text-xs uppercase font-bold text-slate-400">Longest</div>
          <div className="text-xl font-black text-slate-900 dark:text-slate-100 mt-1">
            {stats.longestSessionMinutes ? formatMinutesToHours(stats.longestSessionMinutes) : '-'}
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80">
          <div className="text-xs uppercase font-bold text-slate-400">Last Studied</div>
          <div className="text-sm font-extrabold text-slate-900 dark:text-slate-100 mt-1 truncate">
            {stats.lastStudiedDate ? formatFriendlyDate(stats.lastStudiedDate) : 'Never'}
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80">
          <div className="text-xs uppercase font-bold text-amber-500 flex items-center gap-1">
            <FlameIcon className="w-3.5 h-3.5 fill-amber-500" />
            <span>Streak</span>
          </div>
          <div className="text-xl font-black text-slate-900 dark:text-slate-100 mt-1">
            {stats.subjectStreakDays} Days
          </div>
        </div>
      </div>

      {/* Subject Tasks Section */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-subtle space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CheckSquare className="w-5 h-5 text-blue-600" />
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">Subject Tasks</h2>
          </div>
          <span className="text-xs font-semibold text-slate-500">
            {remainingTasksCount} remaining · {completedTasksCount} completed
          </span>
        </div>

        {/* Quick Add Task Input */}
        <form onSubmit={handleCreateInlineTask} className="flex gap-2">
          <input
            type="text"
            placeholder={`Add task for ${subject.name}...`}
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
            className="flex-1 px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-700 text-sm focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow"
          >
            Add Task
          </button>
        </form>

        {subjectTasks.length === 0 ? (
          <p className="text-xs text-slate-400 py-3 italic">No tasks created for this subject yet.</p>
        ) : (
          <div className="space-y-2">
            {subjectTasks.map((t) => (
              <div
                key={t.id}
                className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/50 dark:border-slate-700/50"
              >
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={t.completed}
                    onChange={() => toggleTask(t.id)}
                    className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                  />
                  <span
                    className={`text-sm ${
                      t.completed ? 'line-through text-slate-400' : 'text-slate-900 dark:text-slate-100 font-semibold'
                    }`}
                  >
                    {t.title}
                  </span>
                </div>
                <button
                  onClick={() => deleteTask(t.id)}
                  className="text-slate-400 hover:text-rose-500 p-1 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Study History */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-subtle space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">Study History</h2>
          <span className="text-xs font-semibold text-slate-500">{subjectSessions.length} total entries</span>
        </div>

        {subjectSessions.length === 0 ? (
          <div className="py-8 text-center text-slate-400 text-sm">
            No study sessions logged for this subject yet.
          </div>
        ) : (
          <div className="space-y-3">
            {subjectSessions.map((sess) => (
              <div
                key={sess.id}
                className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-3">
                    <span className="font-extrabold text-base text-slate-900 dark:text-slate-100">
                      {sess.topic}
                    </span>
                    <span className="text-xs font-extrabold px-2.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400">
                      {formatMinutesToHours(sess.durationMinutes)}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-slate-500">
                    <span className="font-medium">{formatFriendlyDate(sess.date)}</span>
                    {sess.difficulty && (
                      <span className="capitalize font-bold text-slate-600 dark:text-slate-400">
                        • {sess.difficulty}
                      </span>
                    )}
                    {sess.focusRating && (
                      <span className="flex items-center gap-0.5 text-amber-500 font-bold">
                        <Star className="w-3.5 h-3.5 fill-amber-400" /> {sess.focusRating}/5
                      </span>
                    )}
                  </div>
                  {sess.notes && (
                    <p className="text-xs text-slate-600 dark:text-slate-400 pt-1 italic line-clamp-2">
                      &quot;{sess.notes}&quot;
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center">
                  <button
                    onClick={() => {
                      setEditingSession(sess);
                      setIsLogModalOpen(true);
                    }}
                    className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => deleteSession(sess.id)}
                    className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Delete Subject Confirmation Modal (Rule #26) */}
      <Modal
        isOpen={isDeleteConfirmOpen}
        onClose={() => setIsDeleteConfirmOpen(false)}
        title={`Delete ${subject.name}?`}
        maxWidth="md"
      >
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 text-amber-900 dark:text-amber-200 flex items-start gap-3">
            <AlertTriangle className="w-6 h-6 text-amber-500 flex-shrink-0 mt-0.5" />
            <p className="text-sm font-medium">
              All study sessions and tasks associated with this subject will also be permanently removed.
            </p>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3">
            <button
              onClick={() => setIsDeleteConfirmOpen(false)}
              className="px-5 py-2.5 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold text-sm"
            >
              Cancel
            </button>
            <button
              onClick={handleDeleteSubjectConfirmed}
              className="px-6 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-sm shadow-md"
            >
              Delete Subject
            </button>
          </div>
        </div>
      </Modal>

      {/* Modals */}
      <AddEditSubjectModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        subjectToEdit={subject}
      />

      <LogSessionModal
        isOpen={isLogModalOpen}
        onClose={() => setIsLogModalOpen(false)}
        initialSubjectId={subject.id}
        sessionToEdit={editingSession}
      />
    </div>
  );
}
