'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '@/lib/context';
import { Modal } from '@/components/ui/Modal';
import { Subject } from '@/types';
import { IconHelper } from '@/components/ui/IconHelper';

interface AddEditSubjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  subjectToEdit?: Subject | null;
}

const AVAILABLE_COLORS = [
  '#3B82F6', // Blue
  '#8B5CF6', // Purple
  '#EC4899', // Pink
  '#10B981', // Emerald
  '#F59E0B', // Amber
  '#06B6D4', // Cyan
  '#EF4444', // Red
  '#6366F1', // Indigo
];

const AVAILABLE_ICONS = [
  'Calculator',
  'Scale',
  'FileText',
  'PieChart',
  'ShieldCheck',
  'TrendingUp',
  'BookOpen',
  'Brain',
  'FileSpreadsheet',
  'Award',
];

export function AddEditSubjectModal({ isOpen, onClose, subjectToEdit }: AddEditSubjectModalProps) {
  const { addSubject, updateSubject } = useApp();

  const [name, setName] = useState('');
  const [color, setColor] = useState(AVAILABLE_COLORS[0]);
  const [targetHours, setTargetHours] = useState(40);
  const [icon, setIcon] = useState('BookOpen');
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      if (subjectToEdit) {
        setName(subjectToEdit.name);
        setColor(subjectToEdit.color);
        setTargetHours(subjectToEdit.targetHours);
        setIcon(subjectToEdit.icon || 'BookOpen');
      } else {
        setName('');
        setColor(AVAILABLE_COLORS[Math.floor(Math.random() * AVAILABLE_COLORS.length)]);
        setTargetHours(40);
        setIcon('BookOpen');
      }
      setError('');
    }
  }, [isOpen, subjectToEdit]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Subject name is required.');
      return;
    }
    if (!targetHours || targetHours <= 0) {
      setError('Target hours must be greater than zero.');
      return;
    }

    if (subjectToEdit) {
      updateSubject(subjectToEdit.id, {
        name: name.trim(),
        color,
        targetHours,
        icon,
      });
    } else {
      addSubject({
        name: name.trim(),
        color,
        targetHours,
        icon,
      });
    }

    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={subjectToEdit ? 'Edit Subject' : 'Add New Subject'}
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <div className="p-3.5 rounded-xl bg-rose-50 text-rose-600 text-sm font-medium">{error}</div>
        )}

        <div>
          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
            Subject Name <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            placeholder="e.g. Advanced Accounting, Taxation, Corporate Law"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-700 text-base"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
            Target Preparation Hours <span className="text-rose-500">*</span>
          </label>
          <input
            type="number"
            min="1"
            max="300"
            value={targetHours}
            onChange={(e) => setTargetHours(parseInt(e.target.value) || 0)}
            className="w-full px-4 py-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-700 text-base"
            required
          />
        </div>

        {/* Color Accent Picker */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
            Accent Color
          </label>
          <div className="flex flex-wrap gap-3">
            {AVAILABLE_COLORS.map((c) => (
              <button
                type="button"
                key={c}
                onClick={() => setColor(c)}
                className={`w-9 h-9 rounded-full transition-transform ${
                  color === c ? 'scale-125 ring-4 ring-blue-500/30' : 'hover:scale-110'
                }`}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
        </div>

        {/* Icon Selector */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
            Subject Icon
          </label>
          <div className="flex flex-wrap gap-2">
            {AVAILABLE_ICONS.map((ic) => (
              <button
                type="button"
                key={ic}
                onClick={() => setIcon(ic)}
                className={`p-2.5 rounded-xl border transition-all ${
                  icon === ic
                    ? 'bg-blue-600 text-white border-blue-600 shadow-md'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                }`}
              >
                <IconHelper name={ic} className="w-5 h-5" />
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold text-sm"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-base shadow-lg shadow-blue-500/25 transition-all"
          >
            {subjectToEdit ? 'Save Changes' : 'Create Subject'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
