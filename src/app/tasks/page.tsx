'use client';

import React, { useState } from 'react';
import { useApp } from '@/lib/context';
import { Priority, Task } from '@/types';
import { formatFriendlyDate, getTodayIsoDate } from '@/lib/dates';
import { CheckSquare, Plus, Trash2, Calendar, AlertCircle, Edit2, Check } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';

export default function TasksPage() {
  const { state, addTask, updateTask, toggleTask, deleteTask } = useApp();

  const [activeTab, setActiveTab] = useState<'all' | 'today' | 'upcoming' | 'completed'>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<Task | null>(null);

  // Form State
  const [title, setTitle] = useState('');
  const [subjectId, setSubjectId] = useState<string>('');
  const [dueDate, setDueDate] = useState<string>(getTodayIsoDate());
  const [priority, setPriority] = useState<Priority>('medium');
  const [error, setError] = useState('');

  const today = getTodayIsoDate();

  const handleOpenAdd = () => {
    setTaskToEdit(null);
    setTitle('');
    setSubjectId('');
    setDueDate(today);
    setPriority('medium');
    setError('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (task: Task) => {
    setTaskToEdit(task);
    setTitle(task.title);
    setSubjectId(task.subjectId || '');
    setDueDate(task.dueDate || today);
    setPriority(task.priority || 'medium');
    setError('');
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Task title is required.');
      return;
    }

    if (taskToEdit) {
      updateTask(taskToEdit.id, {
        title: title.trim(),
        subjectId: subjectId || null,
        dueDate: dueDate || null,
        priority,
      });
    } else {
      addTask({
        title: title.trim(),
        subjectId: subjectId || null,
        dueDate: dueDate || null,
        priority,
      });
    }

    setIsModalOpen(false);
  };

  // Filter Tasks
  const filteredTasks = state.tasks.filter((t) => {
    if (activeTab === 'completed') return t.completed;
    if (t.completed) return false;

    if (activeTab === 'today') {
      return t.dueDate === today;
    } else if (activeTab === 'upcoming') {
      return t.dueDate && t.dueDate > today;
    }

    return true;
  });

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100">Study Tasks</h1>
          <p className="text-sm font-semibold text-slate-500 mt-1">
            Track daily targets, revision notes, and exam prep to-dos.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-base shadow-lg shadow-blue-500/25 transition-all w-fit"
        >
          <Plus className="w-5 h-5" />
          <span>Add Task</span>
        </button>
      </div>

      {/* Tabs Bar */}
      <div className="flex gap-2 bg-white dark:bg-slate-900 p-1.5 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-subtle w-fit">
        {(['all', 'today', 'upcoming', 'completed'] as const).map((tab) => {
          const count = state.tasks.filter((t) => {
            if (tab === 'completed') return t.completed;
            if (t.completed) return false;
            if (tab === 'today') return t.dueDate === today;
            if (tab === 'upcoming') return t.dueDate && t.dueDate > today;
            return true;
          }).length;

          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-extrabold capitalize transition-all ${
                activeTab === tab
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
              }`}
            >
              {tab} ({count})
            </button>
          );
        })}
      </div>

      {/* Tasks List */}
      {filteredTasks.length === 0 ? (
        <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800 space-y-3">
          <CheckSquare className="w-12 h-12 mx-auto text-slate-400" />
          <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200">Nothing on your list.</h3>
          <p className="text-sm text-slate-500 max-w-sm mx-auto">
            Add a task for your next study session or revision goal.
          </p>
          <button
            onClick={handleOpenAdd}
            className="px-5 py-2.5 rounded-xl bg-blue-600 text-white font-bold text-sm hover:bg-blue-700 transition-colors shadow-md"
          >
            Add Task
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredTasks.map((task) => {
            const sub = state.subjects.find((s) => s.id === task.subjectId);
            const isOverdue = task.dueDate && task.dueDate < today && !task.completed;

            return (
              <div
                key={task.id}
                className={`p-4 sm:p-5 rounded-3xl bg-white dark:bg-slate-900 border transition-all flex items-center justify-between gap-4 ${
                  isOverdue
                    ? 'border-rose-300 dark:border-rose-900 bg-rose-50/20'
                    : 'border-slate-200/80 dark:border-slate-800/80 shadow-subtle'
                }`}
              >
                <div className="flex items-center gap-4 min-w-0">
                  <button
                    onClick={() => toggleTask(task.id)}
                    className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all flex-shrink-0 ${
                      task.completed
                        ? 'bg-emerald-500 border-emerald-500 text-white'
                        : 'border-slate-300 dark:border-slate-600 hover:border-blue-500'
                    }`}
                  >
                    {task.completed && <Check className="w-4 h-4" />}
                  </button>

                  <div className="space-y-1 min-w-0">
                    <span
                      className={`text-base font-extrabold block truncate ${
                        task.completed
                          ? 'line-through text-slate-400 dark:text-slate-500'
                          : 'text-slate-900 dark:text-slate-100'
                      }`}
                    >
                      {task.title}
                    </span>

                    <div className="flex flex-wrap items-center gap-2 text-xs">
                      {sub && (
                        <span
                          className="px-2 py-0.5 rounded-md font-bold text-white text-[10px]"
                          style={{ backgroundColor: sub.color }}
                        >
                          {sub.name}
                        </span>
                      )}
                      {task.dueDate && (
                        <span
                          className={`font-semibold flex items-center gap-1 ${
                            isOverdue
                              ? 'text-rose-600 dark:text-rose-400 font-bold'
                              : 'text-slate-500'
                          }`}
                        >
                          {isOverdue && <AlertCircle className="w-3.5 h-3.5" />}
                          {formatFriendlyDate(task.dueDate)} {isOverdue && '(Overdue)'}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  <span
                    className={`text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full ${
                      task.priority === 'high'
                        ? 'bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300'
                        : task.priority === 'medium'
                        ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    {task.priority}
                  </span>

                  <button
                    onClick={() => handleOpenEdit(task)}
                    className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => deleteTask(task.id)}
                    className="p-2 rounded-xl text-slate-400 hover:text-rose-600 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add/Edit Task Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={taskToEdit ? 'Edit Task' : 'Add Study Task'}
        maxWidth="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-50 text-rose-600 text-sm font-medium">{error}</div>
          )}

          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Task Description <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Complete Accounting Chapter 4, Revise Contract Act"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-700 text-base"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Associated Subject (Optional)
            </label>
            <select
              value={subjectId}
              onChange={(e) => setSubjectId(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-700 text-base"
            >
              <option value="">No Subject Association</option>
              {state.subjects.map((sub) => (
                <option key={sub.id} value={sub.id}>
                  {sub.name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Due Date
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-700 text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Priority
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as Priority)}
                className="w-full px-4 py-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-700 text-sm"
              >
                <option value="low">Low Priority</option>
                <option value="medium">Medium Priority</option>
                <option value="high">High Priority</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-5 py-2.5 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold text-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-base shadow-lg shadow-blue-500/25 transition-all"
            >
              {taskToEdit ? 'Save Task' : 'Add Task'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
