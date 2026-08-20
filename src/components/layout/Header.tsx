'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '@/lib/context';
import { getTimeOfDayGreeting, getPreparationDayCount, getDaysUntilExam } from '@/lib/dates';
import { Search, Plus, Sun, Moon, GraduationCap, Timer } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { LogSessionModal } from '@/components/modals/LogSessionModal';
import { GlobalSearchModal } from '@/components/modals/GlobalSearchModal';
import { QuickAddModal } from '@/components/modals/QuickAddModal';

interface HeaderProps {
  onOpenAddSubject?: () => void;
  onOpenAddTask?: () => void;
}

export function Header({ onOpenAddSubject, onOpenAddTask }: HeaderProps) {
  const { state, theme, setTheme } = useApp();
  const router = useRouter();

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const [isLogSessionOpen, setIsLogSessionOpen] = useState(false);

  const greetingInfo = getTimeOfDayGreeting(state.profile.name);
  const prepDay = getPreparationDayCount(state.profile.preparationStartDate);
  const examCountdown = getDaysUntilExam(state.profile.examDate);

  // Global Keyboard Shortcuts (Rule #30)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore when typing inside input, textarea, or editable elements
      const target = e.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.tagName === 'SELECT' ||
        target.isContentEditable
      ) {
        return;
      }

      if (e.key === '/') {
        e.preventDefault();
        setIsSearchOpen(true);
      } else if (e.key === 'n' || e.key === 'N') {
        e.preventDefault();
        setIsLogSessionOpen(true);
      } else if (e.key === 't' || e.key === 'T') {
        e.preventDefault();
        router.push('/tasks');
      } else if (e.key === 'd' || e.key === 'D') {
        e.preventDefault();
        router.push('/');
      } else if (e.key === 's' || e.key === 'S') {
        e.preventDefault();
        router.push('/subjects');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [router]);

  const handleQuickAddAction = (action: 'log_session' | 'add_task' | 'add_subject') => {
    if (action === 'log_session') {
      setIsLogSessionOpen(true);
    } else if (action === 'add_task') {
      if (onOpenAddTask) onOpenAddTask();
      else router.push('/tasks');
    } else if (action === 'add_subject') {
      if (onOpenAddSubject) onOpenAddSubject();
      else router.push('/subjects');
    }
  };

  return (
    <>
      <header className="sticky top-0 z-20 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 px-4 sm:px-8 py-4 flex items-center justify-between">
        {/* Dynamic Time Greeting */}
        <div className="flex items-center gap-3">
          <div className="md:hidden w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
              {greetingInfo.greeting}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium">
              Day {prepDay} of your CA Inter preparation
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Exam Countdown Badge */}
          <div
            className="hidden sm:flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200/60 dark:border-indigo-800/60 text-indigo-900 dark:text-indigo-200 text-xs font-bold shadow-sm"
            title={`Target Exam Date: ${state.profile.examDate || 'May 2027'}`}
          >
            <Timer className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <span>{examCountdown.formattedText}</span>
          </div>

          {/* Search Trigger */}
          <button
            onClick={() => setIsSearchOpen(true)}
            className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors text-sm font-medium"
            title="Global Search (/)"
          >
            <Search className="w-4 h-4" />
            <span className="hidden sm:inline">Search...</span>
            <kbd className="hidden sm:inline text-xs px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 font-mono">
              /
            </kbd>
          </button>

          {/* Quick-Add Button */}
          <button
            onClick={() => setIsQuickAddOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md shadow-blue-500/20 transition-all"
            title="Quick Action"
          >
            <Plus className="w-5 h-5" />
            <span className="hidden sm:inline">Log / Add</span>
          </button>

          {/* Theme Switcher */}
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="p-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} mode`}
          >
            {theme === 'dark' ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-slate-700" />}
          </button>
        </div>
      </header>

      {/* Modals */}
      <GlobalSearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
      <QuickAddModal
        isOpen={isQuickAddOpen}
        onClose={() => setIsQuickAddOpen(false)}
        onSelectAction={handleQuickAddAction}
      />
      <LogSessionModal isOpen={isLogSessionOpen} onClose={() => setIsLogSessionOpen(false)} />
    </>
  );
}
