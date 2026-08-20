'use client';

import React, { useState } from 'react';
import { useApp } from '@/lib/context';
import { DEFAULT_SUBJECTS } from '@/lib/storage';
import { getTodayIsoDate } from '@/lib/dates';
import { Sparkles, Check, ArrowRight, ShieldCheck } from 'lucide-react';
import { Subject } from '@/types';

export function OnboardingWizard() {
  const { completeOnboarding } = useApp();
  const [step, setStep] = useState(1);

  const [name, setName] = useState('CA Aspirant');
  const [examName, setExamName] = useState('CA Intermediate');
  const [prepStartDate, setPrepStartDate] = useState(getTodayIsoDate());
  const [dailyHours, setDailyHours] = useState(6);
  const [weeklyHours, setWeeklyHours] = useState(42);
  const [selectedSubjects, setSelectedSubjects] = useState<Subject[]>(DEFAULT_SUBJECTS);

  const toggleSubject = (sub: Subject) => {
    if (selectedSubjects.some((s) => s.id === sub.id)) {
      if (selectedSubjects.length === 1) return; // Keep at least one subject
      setSelectedSubjects(selectedSubjects.filter((s) => s.id !== sub.id));
    } else {
      setSelectedSubjects([...selectedSubjects, sub]);
    }
  };

  const handleFinish = () => {
    completeOnboarding(
      name,
      examName,
      prepStartDate,
      dailyHours * 60,
      weeklyHours * 60,
      selectedSubjects
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="w-full max-w-xl bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-2xl overflow-hidden p-6 sm:p-8">
        {/* Step Indicator */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-sm">
              {step}
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Step {step} of 4</span>
          </div>
          <div className="flex gap-1.5">
            {[1, 2, 3, 4].map((s) => (
              <div
                key={s}
                className={`h-2 rounded-full transition-all ${
                  s === step ? 'w-8 bg-blue-600' : s < step ? 'w-4 bg-blue-400' : 'w-2 bg-slate-200 dark:bg-slate-800'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Step 1: Welcome & Name */}
        {step === 1 && (
          <div className="space-y-6">
            <div className="w-16 h-16 rounded-2xl bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Sparkles className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100">
                Your CA preparation, organized.
              </h1>
              <p className="text-slate-600 dark:text-slate-400 text-base mt-2">
                Welcome to CA Study OS — a calm, clean, personal command center built specifically for CA Intermediate students.
              </p>
            </div>

            <div className="space-y-4 pt-2">
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Your Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Priya Sharma"
                  className="w-full px-4 py-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-700 text-base focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Exam Target
                  </label>
                  <input
                    type="text"
                    value={examName}
                    onChange={(e) => setExamName(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-700 text-base"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Prep Start Date
                  </label>
                  <input
                    type="date"
                    value={prepStartDate}
                    onChange={(e) => setPrepStartDate(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-700 text-base"
                  />
                </div>
              </div>
            </div>

            <button
              onClick={() => setStep(2)}
              className="w-full py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-base shadow-lg shadow-blue-500/25 transition-all flex items-center justify-center gap-2"
            >
              Continue <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Step 2: Subjects Selection */}
        {step === 2 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">What are you studying?</h2>
              <p className="text-slate-600 dark:text-slate-400 text-sm mt-1">
                Select your CA Intermediate subjects. You can rename, reorder, or add custom subjects anytime later.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-[45vh] overflow-y-auto pr-1">
              {DEFAULT_SUBJECTS.map((sub) => {
                const isSelected = selectedSubjects.some((s) => s.id === sub.id);
                return (
                  <button
                    key={sub.id}
                    type="button"
                    onClick={() => toggleSubject(sub)}
                    className={`flex items-center justify-between p-3.5 rounded-xl text-left border transition-all ${
                      isSelected
                        ? 'bg-blue-50 dark:bg-blue-950/40 border-blue-500/80 text-blue-950 dark:text-blue-100 font-semibold'
                        : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-3.5 h-3.5 rounded-full" style={{ backgroundColor: sub.color }} />
                      <span className="text-sm font-semibold">{sub.name}</span>
                    </div>
                    {isSelected && <Check className="w-4 h-4 text-blue-600 dark:text-blue-400" />}
                  </button>
                );
              })}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setStep(1)}
                className="px-5 py-3 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold text-sm"
              >
                Back
              </button>
              <button
                onClick={() => setStep(3)}
                className="flex-1 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-base shadow-lg shadow-blue-500/25 transition-all flex items-center justify-center gap-2"
              >
                Set Targets <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Targets */}
        {step === 3 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Set your study targets</h2>
              <p className="text-slate-600 dark:text-slate-400 text-sm mt-1">
                Establish realistic study goals. CA Study OS helps you keep pace without stress or shaming.
              </p>
            </div>

            <div className="space-y-5">
              <div>
                <label className="flex items-center justify-between text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  <span>Daily Study Target</span>
                  <span className="text-blue-600 dark:text-blue-400 font-bold text-base">{dailyHours} Hours / day</span>
                </label>
                <input
                  type="range"
                  min="2"
                  max="14"
                  step="0.5"
                  value={dailyHours}
                  onChange={(e) => {
                    const d = parseFloat(e.target.value);
                    setDailyHours(d);
                    setWeeklyHours(Math.round(d * 7));
                  }}
                  className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
              </div>

              <div>
                <label className="flex items-center justify-between text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  <span>Weekly Target Pace</span>
                  <span className="text-blue-600 dark:text-blue-400 font-bold text-base">{weeklyHours} Hours / week</span>
                </label>
                <input
                  type="range"
                  min="14"
                  max="84"
                  step="1"
                  value={weeklyHours}
                  onChange={(e) => setWeeklyHours(parseInt(e.target.value) || 42)}
                  className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                onClick={() => setStep(2)}
                className="px-5 py-3 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold text-sm"
              >
                Back
              </button>
              <button
                onClick={() => setStep(4)}
                className="flex-1 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-base shadow-lg shadow-blue-500/25 transition-all flex items-center justify-center gap-2"
              >
                Preview Setup <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {/* Step 4: Ready */}
        {step === 4 && (
          <div className="space-y-6 text-center py-4">
            <div className="w-20 h-20 mx-auto rounded-3xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shadow-lg">
              <ShieldCheck className="w-10 h-10" />
            </div>
            <div>
              <h2 className="text-3xl font-extrabold text-slate-900 dark:text-slate-100">You&apos;re all set!</h2>
              <p className="text-slate-600 dark:text-slate-400 text-base mt-2 max-w-md mx-auto">
                Your study data is 100% private and saved locally in this browser.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 text-left space-y-2 border border-slate-200/60 dark:border-slate-700/60 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-500">Student:</span>
                <span className="font-semibold text-slate-900 dark:text-slate-100">{name} ({examName})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Subjects Selected:</span>
                <span className="font-semibold text-slate-900 dark:text-slate-100">{selectedSubjects.length} subjects</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Daily Target:</span>
                <span className="font-semibold text-slate-900 dark:text-slate-100">{dailyHours} hours</span>
              </div>
            </div>

            <button
              onClick={handleFinish}
              className="w-full py-4 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-lg shadow-xl shadow-blue-500/25 transition-all flex items-center justify-center gap-2"
            >
              Enter CA Study OS <Sparkles className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
