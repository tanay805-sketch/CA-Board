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
import { CheckSquare } from 'lucide-react';
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
