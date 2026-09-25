'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useApp } from '@/lib/context';
import { getPreparationDayCount, getDaysUntilExam } from '@/lib/dates';
import {
  LayoutDashboard,
  BookOpen,
  Clock,
  CheckSquare,
  ClipboardCheck,
  Settings,
  ChevronLeft,
  ChevronRight,
  GraduationCap,
  Flame,
  Timer,
} from 'lucide-react';
import { calculateCurrentStreak } from '@/lib/calculations';

export function Sidebar() {
  const pathname = usePathname();
  const { state } = useApp();
  const [collapsed, setCollapsed] = useState(false);

  const prepDay = getPreparationDayCount(state.profile.preparationStartDate);
  const examCountdown = getDaysUntilExam(state.profile.examDate);
  const currentStreak = calculateCurrentStreak(state.studySessions);

  const navItems = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard, shortcut: 'D' },
    { name: 'Subjects', href: '/subjects', icon: BookOpen, shortcut: 'S' },
    { name: 'Study Log', href: '/study-log', icon: Clock, shortcut: 'N' },
    { name: 'Tasks', href: '/tasks', icon: CheckSquare, shortcut: 'T' },
    { name: 'Tracker', href: '/tracker', icon: ClipboardCheck, shortcut: 'G' },
  ];

  return (
    <aside
      className={`hidden md:flex flex-col justify-between h-screen sticky top-0 bg-white dark:bg-slate-900 border-r border-slate-200/80 dark:border-slate-800/80 transition-all duration-300 z-30 select-none ${
        collapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Top Header */}
      <div>
        <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-800/80">
          <Link href="/" className="flex items-center gap-3 overflow-hidden">
            <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-bold text-xl flex-shrink-0 shadow-md shadow-blue-500/20">
              <GraduationCap className="w-6 h-6" />
            </div>
            {!collapsed && (
              <div className="flex flex-col">
                <span className="font-extrabold text-base tracking-tight text-slate-900 dark:text-slate-100 leading-tight">
                  CA STUDY OS
                </span>
                <span className="text-xs text-blue-600 dark:text-blue-400 font-semibold">
                  {state.profile.examName || 'CA Intermediate'}
                </span>
              </div>
            )}
          </Link>

          <button
            onClick={() => setCollapsed(!collapsed)}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          >
            {collapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
          </button>
        </div>

        {/* Primary Navigation */}
        <nav className="p-3 space-y-1.5">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
            const Icon = item.icon;

            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3.5 px-3.5 py-3 rounded-2xl font-semibold text-base transition-all group ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/25'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/80 hover:text-slate-900 dark:hover:text-slate-100'
                }`}
                title={collapsed ? item.name : undefined}
              >
                <Icon className={`w-6 h-6 flex-shrink-0 transition-transform group-hover:scale-105`} />
                {!collapsed && (
                  <div className="flex items-center justify-between w-full">
                    <span>{item.name}</span>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-md font-mono ${
                        isActive
                          ? 'bg-blue-500/40 text-white'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-400 group-hover:text-slate-500'
                      }`}
                    >
                      {item.shortcut}
                    </span>
                  </div>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Bottom Section */}
      <div className="p-3 space-y-2 border-t border-slate-100 dark:border-slate-800/80">
        {/* Streak indicator if active */}
        {currentStreak > 0 && !collapsed && (
          <div className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200/60 dark:border-amber-900/60 text-amber-900 dark:text-amber-200 text-sm font-bold">
            <Flame className="w-5 h-5 text-amber-500 fill-amber-500 animate-pulse" />
            <span>{currentStreak} Day Streak</span>
          </div>
        )}

        <Link
          href="/settings"
          className={`flex items-center gap-3.5 px-3.5 py-3 rounded-2xl font-semibold text-base transition-all ${
            pathname === '/settings'
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/25'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/80 hover:text-slate-900 dark:hover:text-slate-100'
          }`}
          title={collapsed ? 'Settings' : undefined}
        >
          <Settings className="w-6 h-6 flex-shrink-0" />
          {!collapsed && <span>Settings</span>}
        </Link>

        {/* Preparation Day & Exam Countdown Badges */}
        {!collapsed ? (
          <div className="space-y-2">
            <div className="px-3.5 py-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300">
              <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Preparation Day</div>
              <div className="text-base font-black text-slate-900 dark:text-slate-100">Day {prepDay}</div>
            </div>

            <div className="px-3.5 py-2.5 rounded-2xl bg-indigo-50/80 dark:bg-indigo-950/40 border border-indigo-200/50 dark:border-indigo-900/50 text-indigo-950 dark:text-indigo-200">
              <div className="flex items-center justify-between text-[10px] uppercase font-bold tracking-wider text-indigo-600 dark:text-indigo-400">
                <span>CA Inter Exam</span>
                <Timer className="w-3.5 h-3.5 text-indigo-500" />
              </div>
              <div className="text-sm font-extrabold text-slate-900 dark:text-slate-100 mt-0.5">
                {examCountdown.formattedText}
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-1 text-center py-1">
            <div className="text-xs font-black text-slate-500" title={`Day ${prepDay}`}>
              D{prepDay}
            </div>
            <div className="text-[10px] font-black text-indigo-600 dark:text-indigo-400" title={`Exam: ${examCountdown.formattedText}`}>
              {examCountdown.days}d
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
