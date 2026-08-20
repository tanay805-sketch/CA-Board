'use client';

import React from 'react';
import { Modal } from '@/components/ui/Modal';
import { Clock, CheckSquare, BookPlus } from 'lucide-react';

interface QuickAddModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectAction: (action: 'log_session' | 'add_task' | 'add_subject') => void;
}

export function QuickAddModal({ isOpen, onClose, onSelectAction }: QuickAddModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Quick Action" maxWidth="sm">
      <div className="grid grid-cols-1 gap-3 py-2">
        <button
          onClick={() => {
            onClose();
            onSelectAction('log_session');
          }}
          className="flex items-center gap-4 p-4 rounded-2xl bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/40 dark:hover:bg-blue-900/60 text-blue-900 dark:text-blue-100 border border-blue-200/60 dark:border-blue-800/60 transition-all text-left group"
        >
          <div className="w-12 h-12 rounded-xl bg-blue-600 text-white flex items-center justify-center flex-shrink-0 shadow-md group-hover:scale-105 transition-transform">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <div className="font-bold text-base">Log Study Session</div>
            <div className="text-xs text-blue-700 dark:text-blue-300">Record study hours, topic & focus rating</div>
          </div>
        </button>

        <button
          onClick={() => {
            onClose();
            onSelectAction('add_task');
          }}
          className="flex items-center gap-4 p-4 rounded-2xl bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:hover:bg-emerald-900/60 text-emerald-900 dark:text-emerald-100 border border-emerald-200/60 dark:border-emerald-800/60 transition-all text-left group"
        >
          <div className="w-12 h-12 rounded-xl bg-emerald-600 text-white flex items-center justify-center flex-shrink-0 shadow-md group-hover:scale-105 transition-transform">
            <CheckSquare className="w-6 h-6" />
          </div>
          <div>
            <div className="font-bold text-base">Add Study Task</div>
            <div className="text-xs text-emerald-700 dark:text-emerald-300">Create a task or revision goal</div>
          </div>
        </button>

        <button
          onClick={() => {
            onClose();
            onSelectAction('add_subject');
          }}
          className="flex items-center gap-4 p-4 rounded-2xl bg-purple-50 hover:bg-purple-100 dark:bg-purple-950/40 dark:hover:bg-purple-900/60 text-purple-900 dark:text-purple-100 border border-purple-200/60 dark:border-purple-800/60 transition-all text-left group"
        >
          <div className="w-12 h-12 rounded-xl bg-purple-600 text-white flex items-center justify-center flex-shrink-0 shadow-md group-hover:scale-105 transition-transform">
            <BookPlus className="w-6 h-6" />
          </div>
          <div>
            <div className="font-bold text-base">Add New Subject</div>
            <div className="text-xs text-purple-700 dark:text-purple-300">Create a custom CA subject</div>
          </div>
        </button>
      </div>
    </Modal>
  );
}
