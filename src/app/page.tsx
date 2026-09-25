'use client';

import React from 'react';
import { useApp } from '@/lib/context';
import { HeroProgressCard } from '@/components/dashboard/HeroProgressCard';
import { TargetsOverview } from '@/components/dashboard/TargetsOverview';
import { TodaysStudySection } from '@/components/dashboard/TodaysStudySection';
import { SubjectOverviewGrid } from '@/components/dashboard/SubjectOverviewGrid';
import { WeeklyStudyChart } from '@/components/dashboard/WeeklyStudyChart';
import { StudyTimeDistribution } from '@/components/dashboard/StudyTimeDistribution';
import { ActivityHeatmap } from '@/components/dashboard/ActivityHeatmap';
import { OnboardingWizard } from '@/components/onboarding/OnboardingWizard';
import { CheckSquare, ClipboardCheck, ArrowRight, Sparkles } from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
  const { state, isLoaded } = useApp();

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Show onboarding wizard if not completed
  if (!state.settings.onboardingCompleted) {
    return <OnboardingWizard />;
  }

  const pendingTasks = state.tasks.filter((t) => !t.completed).slice(0, 4);

  return (
    <div className="space-y-6 pb-12">
      {/* Hero Card */}
      <HeroProgressCard />

      {/* Group 1 Syllabus & Chapter Tracker Featured Banner */}
      <Link
        href="/tracker"
        className="block p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-blue-600 via-indigo-600 to-emerald-600 text-white shadow-xl shadow-blue-500/15 hover:shadow-2xl hover:scale-[1.01] transition-all group border border-white/20"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white flex-shrink-0">
              <ClipboardCheck className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-md bg-white/25 text-white font-extrabold text-[10px] uppercase tracking-wider">
                  New Feature
                </span>
                <span className="text-xs font-semibold text-blue-100">4 Papers · 53 Topics</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-black tracking-tight text-white mt-0.5">
                Group 1 Chapter & Revision Tracker
              </h3>
              <p className="text-xs sm:text-sm text-blue-100 font-medium">
                Track Studied, Study Material (SM Qs), Past Exam Questions (PYQs), and Revision progress across all Group 1 subjects.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-white text-blue-700 font-bold text-sm shadow-md flex-shrink-0 group-hover:bg-blue-50 transition-colors self-start sm:self-auto">
            <span>Open Tracker</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </div>
        </div>
      </Link>

      {/* Daily & Weekly Targets */}
      <TargetsOverview />

      {/* Today's Study */}
      <TodaysStudySection />

      {/* Subject Overview */}
      <SubjectOverviewGrid />

      {/* Charts & Distribution Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <WeeklyStudyChart />
        <StudyTimeDistribution />
      </div>

      {/* Heatmap & Quick Pending Tasks */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <ActivityHeatmap />
        </div>

        {/* Quick Pending Tasks Widget */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-subtle flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                  <CheckSquare className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">Tasks Focus</h3>
              </div>
              <Link href="/tasks" className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline">
                View All
              </Link>
            </div>

            {pendingTasks.length === 0 ? (
              <p className="text-xs text-slate-500 py-4 text-center">No pending study tasks! You&apos;re all caught up.</p>
            ) : (
              <div className="space-y-2">
                {pendingTasks.map((t) => (
                  <div
                    key={t.id}
                    className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 text-xs font-semibold text-slate-800 dark:text-slate-200 border border-slate-100 dark:border-slate-800 flex items-center justify-between"
                  >
                    <span className="truncate pr-2">{t.title}</span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] uppercase font-extrabold ${
                        t.priority === 'high'
                          ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300'
                          : 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {t.priority}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
