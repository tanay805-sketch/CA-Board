'use client';

import React from 'react';
import { useApp } from '@/lib/context';
import { calculateOverallProgress, calculateWeeklyStudyTime, calculateWeeklyStatus, calculateCurrentStreak } from '@/lib/calculations';
import { formatMinutesToDecimalHours, formatMinutesToHours, getDaysUntilExam } from '@/lib/dates';
import { Flame, Trophy, Clock, Target, ArrowUpRight, Timer } from 'lucide-react';
import Link from 'next/link';

export function HeroProgressCard() {
  const { state } = useApp();

  const overall = calculateOverallProgress(state.subjects, state.studySessions);
  const weekly = calculateWeeklyStudyTime(state.studySessions);
  const weeklyStatus = calculateWeeklyStatus(state.settings.weeklyTargetMinutes, weekly.totalMinutes);
  const currentStreak = calculateCurrentStreak(state.studySessions);
  const totalSessions = state.studySessions.length;
  const examCountdown = getDaysUntilExam(state.profile.examDate);

  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 via-indigo-600 to-slate-900 text-white p-6 sm:p-8 shadow-xl shadow-blue-500/15 border border-blue-500/20">
      {/* Background ambient glowing shapes */}
      <div className="absolute -right-12 -top-12 w-64 h-64 bg-blue-400/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -left-12 -bottom-12 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        {/* Left Stats Section */}
        <div className="space-y-4 flex-1">
          <div className="flex items-center gap-2 text-blue-200 font-semibold text-sm tracking-wide uppercase">
            <Trophy className="w-4 h-4 text-amber-300" />
            <span>Overall Preparation Status</span>
          </div>

          <div className="flex items-baseline gap-4">
            <span className="text-5xl sm:text-6xl font-black tracking-tight">{overall.percentage}%</span>
            <div className="text-blue-100 text-base sm:text-lg font-medium">
              <span className="font-bold text-white">{formatMinutesToDecimalHours(overall.totalCompletedMinutes)}</span> / {overall.totalTargetHours} hours
            </div>
          </div>

          {/* Animated Progress Bar */}
          <div className="w-full bg-blue-950/60 backdrop-blur-sm h-4 rounded-full overflow-hidden p-0.5 border border-blue-400/30">
            <div
              className="h-full bg-gradient-to-r from-blue-400 via-indigo-300 to-amber-300 rounded-full progress-bar-animated shadow-lg"
              style={{ width: `${overall.percentage}%` }}
            />
          </div>

          {/* Supportive Pace Status Message */}
          <div className="flex items-center gap-2 text-sm font-semibold text-blue-100 bg-white/10 backdrop-blur-md px-4 py-2.5 rounded-2xl w-fit border border-white/10">
            <Target className="w-4 h-4 text-amber-300" />
            <span>{weeklyStatus.message}</span>
          </div>
        </div>

        {/* Right Stats Quick Pill Cards */}
        <div className="grid grid-cols-3 gap-3 w-full md:w-auto">
          {/* Total Study Sessions */}
          <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/15 min-w-[110px]">
            <div className="flex items-center gap-1.5 text-blue-200 text-xs font-bold uppercase">
              <Clock className="w-3.5 h-3.5 text-blue-300" />
              <span>Sessions</span>
            </div>
            <div className="text-2xl font-black mt-1 text-white">{totalSessions}</div>
            <div className="text-[11px] text-blue-200 mt-0.5 font-medium">Logged</div>
          </div>

          {/* Current Streak */}
          <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/15 min-w-[110px]">
            <div className="flex items-center gap-1.5 text-amber-200 text-xs font-bold uppercase">
              <Flame className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
              <span>Streak</span>
            </div>
            <div className="text-2xl font-black mt-1 text-white">{currentStreak} Days</div>
            <div className="text-[11px] text-amber-200/80 mt-0.5 font-medium">Active</div>
          </div>

          {/* Exam Timer */}
          <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/15 min-w-[110px]">
            <div className="flex items-center gap-1.5 text-indigo-200 text-xs font-bold uppercase">
              <Timer className="w-3.5 h-3.5 text-indigo-300" />
              <span>Exam</span>
            </div>
            <div className="text-2xl font-black mt-1 text-white">{examCountdown.days} Days</div>
            <div className="text-[11px] text-indigo-200/80 mt-0.5 font-medium truncate" title={state.profile.examName}>
              Remaining
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
