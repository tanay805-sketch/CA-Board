'use client';

import React, { useState, useRef } from 'react';
import { useApp } from '@/lib/context';
import { Modal } from '@/components/ui/Modal';
import { AddEditSubjectModal } from '@/components/modals/AddEditSubjectModal';
import { Subject } from '@/types';
import {
  User,
  Target,
  BookOpen,
  Sun,
  Moon,
  Laptop,
  Download,
  Upload,
  RotateCcw,
  ShieldCheck,
  Plus,
  Edit2,
  Trash2,
  AlertTriangle,
} from 'lucide-react';

export default function SettingsPage() {
  const {
    state,
    updateProfile,
    updateSettings,
    setTheme,
    deleteSubject,
    exportBackup,
    importBackup,
    resetAllData,
  } = useApp();

  // Profile Form State
  const [name, setName] = useState(state.profile.name);
  const [examName, setExamName] = useState(state.profile.examName || 'CA Intermediate (May 2027)');
  const [prepStartDate, setPrepStartDate] = useState(state.profile.preparationStartDate);
  const [examDate, setExamDate] = useState(state.profile.examDate || '2027-05-02');

  // Targets State
  const [dailyHours, setDailyHours] = useState(state.settings.dailyTargetMinutes / 60);
  const [weeklyHours, setWeeklyHours] = useState(state.settings.weeklyTargetMinutes / 60);

  // Subject Modal State
  const [isAddEditSubjectOpen, setIsAddEditSubjectOpen] = useState(false);
  const [subjectToEdit, setSubjectToEdit] = useState<Subject | null>(null);

  // Import Confirmation State
  const [importJsonPending, setImportJsonPending] = useState<string | null>(null);
  const [isImportConfirmOpen, setIsImportConfirmOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Reset Confirmation State
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({
      name: name.trim(),
      examName: examName.trim(),
      preparationStartDate: prepStartDate,
      examDate: examDate,
    });
  };

  const handleSaveTargets = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings({
      dailyTargetMinutes: Math.round(dailyHours * 60),
      weeklyTargetMinutes: Math.round(weeklyHours * 60),
    });
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        setImportJsonPending(content);
        setIsImportConfirmOpen(true);
      }
    };
    reader.readAsText(file);
    // Reset file input value so re-selecting same file works
    e.target.value = '';
  };

  const handleConfirmImport = () => {
    if (importJsonPending) {
      importBackup(importJsonPending);
    }
    setIsImportConfirmOpen(false);
    setImportJsonPending(null);
  };

  return (
    <div className="space-y-8 pb-16 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100">Settings</h1>
        <p className="text-sm font-semibold text-slate-500 mt-1">
          Customize your student profile, targets, subjects, themes, and local backups.
        </p>
      </div>

      {/* 1. Profile Section */}
      <div className="p-6 sm:p-7 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-subtle space-y-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-blue-100 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
            <User className="w-5 h-5" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">Student Profile</h2>
        </div>

        <form onSubmit={handleSaveProfile} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Full Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-700 text-base"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Exam / Attempt Name
              </label>
              <input
                type="text"
                value={examName}
                onChange={(e) => setExamName(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-700 text-base"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Preparation Start Date
              </label>
              <input
                type="date"
                value={prepStartDate}
                onChange={(e) => setPrepStartDate(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-700 text-base"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Target Exam Date (Countdown Timer)
              </label>
              <input
                type="date"
                value={examDate}
                onChange={(e) => setExamDate(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-700 text-base"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md transition-all"
          >
            Save Profile
          </button>
        </form>
      </div>

      {/* 2. Study Targets */}
      <div className="p-6 sm:p-7 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-subtle space-y-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-100 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
            <Target className="w-5 h-5" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">Study Targets</h2>
        </div>

        <form onSubmit={handleSaveTargets} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Daily Study Target (Hours)
              </label>
              <input
                type="number"
                step="0.5"
                min="1"
                max="24"
                value={dailyHours}
                onChange={(e) => setDailyHours(parseFloat(e.target.value) || 6)}
                className="w-full px-4 py-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-700 text-base"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Weekly Target Pace (Hours)
              </label>
              <input
                type="number"
                step="1"
                min="5"
                max="168"
                value={weeklyHours}
                onChange={(e) => setWeeklyHours(parseInt(e.target.value) || 42)}
                className="w-full px-4 py-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-700 text-base"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md transition-all"
          >
            Save Targets
          </button>
        </form>
      </div>

      {/* 3. Subjects Management */}
      <div className="p-6 sm:p-7 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-subtle space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-purple-100 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold">
              <BookOpen className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">Subjects Manager</h2>
          </div>

          <button
            onClick={() => {
              setSubjectToEdit(null);
              setIsAddEditSubjectOpen(true);
            }}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md"
          >
            <Plus className="w-4 h-4" /> Add Subject
          </button>
        </div>

        <div className="space-y-2">
          {state.subjects.map((sub) => (
            <div
              key={sub.id}
              className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60"
            >
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 rounded-full" style={{ backgroundColor: sub.color }} />
                <span className="font-bold text-slate-900 dark:text-slate-100 text-base">{sub.name}</span>
                <span className="text-xs text-slate-500">({sub.targetHours}h target)</span>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => {
                    setSubjectToEdit(sub);
                    setIsAddEditSubjectOpen(true);
                  }}
                  className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => deleteSubject(sub.id)}
                  className="p-2 rounded-xl text-slate-400 hover:text-rose-600 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 4. Appearance */}
      <div className="p-6 sm:p-7 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-subtle space-y-5">
        <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">Appearance</h2>

        <div className="grid grid-cols-3 gap-3">
          <button
            onClick={() => setTheme('light')}
            className={`p-4 rounded-2xl border flex flex-col items-center gap-2 transition-all ${
              state.settings.theme === 'light'
                ? 'bg-blue-50 dark:bg-blue-950/40 border-blue-600 text-blue-600 font-bold shadow-sm'
                : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
            }`}
          >
            <Sun className="w-6 h-6 text-amber-500" />
            <span className="text-sm">Light</span>
          </button>

          <button
            onClick={() => setTheme('dark')}
            className={`p-4 rounded-2xl border flex flex-col items-center gap-2 transition-all ${
              state.settings.theme === 'dark'
                ? 'bg-blue-50 dark:bg-blue-950/40 border-blue-600 text-blue-600 font-bold shadow-sm'
                : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
            }`}
          >
            <Moon className="w-6 h-6 text-indigo-400" />
            <span className="text-sm">Dark</span>
          </button>

          <button
            onClick={() => setTheme('system')}
            className={`p-4 rounded-2xl border flex flex-col items-center gap-2 transition-all ${
              state.settings.theme === 'system'
                ? 'bg-blue-50 dark:bg-blue-950/40 border-blue-600 text-blue-600 font-bold shadow-sm'
                : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
            }`}
          >
            <Laptop className="w-6 h-6 text-slate-500" />
            <span className="text-sm">System</span>
          </button>
        </div>
      </div>

      {/* 5. Data Backup & Privacy (Rules #21, #22, #51) */}
      <div className="p-6 sm:p-7 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-subtle space-y-5">
        <div>
          <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold text-sm">
            <ShieldCheck className="w-5 h-5" />
            <span>100% Private & Local Storage</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mt-1">
            Data Portability & Backup
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Your study data is stored securely inside this browser&apos;s localStorage. Export regular JSON backups to keep your preparation safe across devices or browser clears.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 pt-2">
          {/* Export Button */}
          <button
            onClick={exportBackup}
            className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md transition-all"
          >
            <Download className="w-5 h-5" />
            <span>Export Data (JSON)</span>
          </button>

          {/* Import Button */}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-sm transition-colors"
          >
            <Upload className="w-5 h-5" />
            <span>Import Data Backup</span>
          </button>
          <input
            type="file"
            ref={fileInputRef}
            accept=".json"
            onChange={handleFileSelect}
            className="hidden"
          />

          {/* Reset Button */}
          <button
            onClick={() => setIsResetConfirmOpen(true)}
            className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/60 text-rose-600 dark:text-rose-400 font-bold text-sm transition-colors ml-auto"
          >
            <RotateCcw className="w-5 h-5" />
            <span>Reset Data</span>
          </button>
        </div>
      </div>

      {/* Modals */}
      <AddEditSubjectModal
        isOpen={isAddEditSubjectOpen}
        onClose={() => setIsAddEditSubjectOpen(false)}
        subjectToEdit={subjectToEdit}
      />

      {/* Import Backup Confirmation Modal (Rule #22) */}
      <Modal
        isOpen={isImportConfirmOpen}
        onClose={() => setIsImportConfirmOpen(false)}
        title="Confirm Backup Import"
        maxWidth="md"
      >
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 text-amber-900 dark:text-amber-200 flex items-start gap-3">
            <AlertTriangle className="w-6 h-6 text-amber-500 flex-shrink-0 mt-0.5" />
            <p className="text-sm font-medium">
              Importing this backup will replace your current subjects, study history, and task data.
            </p>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3">
            <button
              onClick={() => setIsImportConfirmOpen(false)}
              className="px-5 py-2.5 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold text-sm"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirmImport}
              className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md"
            >
              Import Backup
            </button>
          </div>
        </div>
      </Modal>

      {/* Reset Data Confirmation Modal */}
      <Modal
        isOpen={isResetConfirmOpen}
        onClose={() => setIsResetConfirmOpen(false)}
        title="Reset All Data?"
        maxWidth="md"
      >
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-800 dark:text-rose-300 flex items-start gap-3">
            <AlertTriangle className="w-6 h-6 text-rose-500 flex-shrink-0 mt-0.5" />
            <p className="text-sm font-medium">
              Are you sure? This will delete all your logged study sessions, custom subjects, and tasks, restoring default CA Inter settings.
            </p>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3">
            <button
              onClick={() => setIsResetConfirmOpen(false)}
              className="px-5 py-2.5 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold text-sm"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                resetAllData();
                setIsResetConfirmOpen(false);
              }}
              className="px-6 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-sm shadow-md"
            >
              Reset Data
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
