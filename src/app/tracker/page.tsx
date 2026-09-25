'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ClipboardCheck, RotateCcw, ChevronDown, ChevronUp, Trophy, ArrowRight } from 'lucide-react';

// ─── Data Definitions ───────────────────────────────────────────────

interface TrackerSubject {
  id: string;
  name: string;
  shortLabel: string;
  marks: string;
  focusLine: string;
  color: string;
  columns: string[];
  topics: string[];
}

const TRACKER_SUBJECTS: TrackerSubject[] = [
  {
    id: 'adv_acc',
    name: 'Advanced Accounting',
    shortLabel: 'P1 · Adv. Accounts',
    marks: '100 Marks',
    focusLine: 'Focus: AS + High-Yield Problems',
    color: '#3B82F6',
    columns: ['SM Qs', 'PYQ / RTP', 'Rev 1'],
    topics: [
      '01. Framework & AS 1, 2, 3',
      '02. AS 4, 5, 10 (PPE)',
      '03. AS 11, 12, 13 (Investments)',
      '04. AS 16 (Borrowing), AS 19 (Leases)',
      '05. AS 20 (EPS), AS 22 (Taxes)',
      '06. AS 26 (Intangibles), AS 28 (Impair.)',
      '07. AS 29 (Provisions, Contingencies)',
      '08. AS 7, 9 (Rev Recognition & Const.)',
      '09. AS 14 (Amalgamation & Internal Recon)',
      '10. AS 21, 23, 27 (Consolidated FS)',
      '11. Financial Statements of Companies',
      '12. Buyback & Accounting for ESOPs',
      '13. Branch Accounting (incl. Foreign)',
    ],
  },
  {
    id: 'corp_law',
    name: 'Corporate & Other Laws',
    shortLabel: 'P2 · Corp. Laws',
    marks: '100 Marks',
    focusLine: 'Focus: Section Nos. + Key Drafting',
    color: '#8B5CF6',
    columns: ['MCQ Bk', 'Concept Writing', 'Rev 1'],
    topics: [
      '01. Preliminary (Sec 1-2)',
      '02. Incorporation & Matters (Sec 3-22)',
      '03. Prospectus & Allotment (Sec 23-42)',
      '04. Share Capital & Debentures (Sec 43-72)',
      '05. Acceptance of Deposits (Sec 73-76A)',
      '06. Registration of Charges (Sec 77-87)',
      '07. Management & Admin (Sec 88-122)',
      '08. Declaration of Dividend (Sec 123-127)',
      '09. Accounts of Companies (Sec 128-137)',
      '10. Audit and Auditors (Sec 139-148)',
      '11. Cos. Incorporated Outside India',
      '12. General Clauses Act, 1897',
      '13. Interpretation of Statutes',
      '14. FEMA, 1999 (Basic Provisions)',
    ],
  },
  {
    id: 'income_tax',
    name: 'Income Tax Law',
    shortLabel: 'P3A · Income Tax',
    marks: '50 Marks',
    focusLine: 'Focus: Total Income Concept',
    color: '#EC4899',
    columns: ['Provisions', 'SM Qs', 'Rev 1'],
    topics: [
      '01. Basic Concepts & Rates of Tax',
      '02. Residential Status & Scope',
      '03. Incomes Exempt from Tax',
      '04. Salaries (Sec 15-17)',
      '05. Income from House Property',
      '06. Profits & Gains of Business/Prof. (PGBP)',
      '07. Capital Gains',
      '08. Income from Other Sources',
      '09. Clubbing of Income',
      '10. Set-off & Carry Forward of Losses',
      '11. Deductions under Chapter VI-A',
      '12. Advance Tax, TDS & TCS',
      '13. Return of Income & Sec 115BAC',
      '14. Computation of Total Income & Tax',
    ],
  },
  {
    id: 'gst',
    name: 'Goods & Services Tax',
    shortLabel: 'P3B · GST',
    marks: '50 Marks',
    focusLine: 'Focus: ITC Rules + Time/Value',
    color: '#06B6D4',
    columns: ['Provisions', 'SM Qs', 'Rev 1'],
    topics: [
      '01. GST in India: An Introduction',
      '02. Supply under GST (Sec 7-8)',
      '03. Charge of GST (Sec 9, Composition)',
      '04. Place of Supply (POS-Core IGST)',
      '05. Exemptions from GST',
      '06. Time and Value of Supply',
      '07. Input Tax Credit (ITC-Sec 16, 17, 18)',
      '08. Registration under GST (Sec 22-30)',
      '09. Tax Invoice, Credit & Debit Notes',
      '10. Accounts and Records & E-Way Bill',
      '11. Payment of Tax (Electronic Ledgers)',
      '12. Returns under GST',
    ],
  },
];

const STORAGE_KEY = 'ca_study_os_group1_tracker';
const TAB_STORAGE_KEY = 'ca_study_os_group1_active_tab';

const TOPIC_COL_LABELS: Record<string, string> = {
  adv_acc: 'Topic / Module Unit',
  corp_law: 'Chapter / Act Unit',
  income_tax: 'Income Tax Head / Topic',
  gst: 'GST Core Chapter',
};

const PAPER_LABELS: Record<string, string> = {
  adv_acc: 'Paper 1',
  corp_law: 'Paper 2',
  income_tax: 'Paper 3A',
  gst: 'Paper 3B',
};

// ─── Types ──────────────────────────────────────────────────────────

type CheckboxState = Record<string, boolean>;

function makeKey(subjectId: string, topicIdx: number, colIdx: number): string {
  return `${subjectId}__${topicIdx}__${colIdx}`;
}

// ─── SVG Progress Ring ──────────────────────────────────────────────

function ProgressRing({
  percentage,
  color,
  size = 56,
  strokeWidth = 5,
  isComplete,
}: {
  percentage: number;
  color: string;
  size?: number;
  strokeWidth?: number;
  isComplete?: boolean;
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-slate-100 dark:text-slate-800"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-500"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        {isComplete ? (
          <Trophy className="w-5 h-5 text-amber-500" />
        ) : (
          <span className="text-xs font-extrabold text-slate-800 dark:text-slate-200">
            {percentage}%
          </span>
        )}
      </div>
    </div>
  );
}

// ─── Stats Calculator ───────────────────────────────────────────────

function getSubjectStats(subject: TrackerSubject, checks: CheckboxState) {
  const totalCells = subject.topics.length * subject.columns.length;
  let checked = 0;
  const colCounts: number[] = subject.columns.map(() => 0);
  let topicsDone = 0;

  subject.topics.forEach((_, tIdx) => {
    let allCols = true;
    subject.columns.forEach((_, cIdx) => {
      if (checks[makeKey(subject.id, tIdx, cIdx)]) {
        checked++;
        colCounts[cIdx]++;
      } else {
        allCols = false;
      }
    });
    if (allCols) topicsDone++;
  });

  return {
    totalCells,
    checked,
    percentage: totalCells > 0 ? Math.round((checked / totalCells) * 100) : 0,
    colCounts,
    topicsDone,
    totalTopics: subject.topics.length,
    isComplete: checked === totalCells && totalCells > 0,
  };
}

function getFirstIncompleteTopic(subject: TrackerSubject, checks: CheckboxState): number {
  for (let tIdx = 0; tIdx < subject.topics.length; tIdx++) {
    const allChecked = subject.columns.every((_, cIdx) => checks[makeKey(subject.id, tIdx, cIdx)]);
    if (!allChecked) return tIdx;
  }
  return -1;
}

// ─── Main Page Component ────────────────────────────────────────────

export default function TrackerPage() {
  const [checks, setChecks] = useState<CheckboxState>({});
  const [loaded, setLoaded] = useState(false);
  const [activeTab, setActiveTab] = useState(TRACKER_SUBJECTS[0].id);
  const [confirmReset, setConfirmReset] = useState<string | null>(null);
  const detailRef = useRef<HTMLDivElement>(null);
  const tabBarRef = useRef<HTMLDivElement>(null);

  // Load from localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw && raw.trim()) {
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === 'object') setChecks(parsed);
      }
    } catch { /* silently ignore */ }

    try {
      const savedTab = localStorage.getItem(TAB_STORAGE_KEY);
      if (savedTab && TRACKER_SUBJECTS.some((s) => s.id === savedTab)) {
        setActiveTab(savedTab);
      }
    } catch { /* silently ignore */ }

    setLoaded(true);
  }, []);

  // Persist checkbox state
  useEffect(() => {
    if (!loaded) return;
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(checks)); } catch { /* ignore */ }
  }, [checks, loaded]);

  // Persist active tab
  useEffect(() => {
    if (!loaded) return;
    try { localStorage.setItem(TAB_STORAGE_KEY, activeTab); } catch { /* ignore */ }
  }, [activeTab, loaded]);

  const toggle = useCallback((key: string) => {
    setChecks((prev) => ({ ...prev, [key]: !prev[key] }));
  }, []);

  const resetSubject = useCallback((subjectId: string) => {
    setChecks((prev) => {
      const next = { ...prev };
      for (const k of Object.keys(next)) {
        if (k.startsWith(`${subjectId}__`)) delete next[k];
      }
      return next;
    });
    setConfirmReset(null);
  }, []);

  const switchTab = useCallback((subjectId: string) => {
    setActiveTab(subjectId);
    // Scroll to the detail area just below the sticky tab bar
    setTimeout(() => {
      tabBarRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 50);
  }, []);

  if (!loaded) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-pulse text-slate-400 dark:text-slate-600 text-lg font-semibold">
          Loading tracker…
        </div>
      </div>
    );
  }

  // Compute all stats
  const allStats = TRACKER_SUBJECTS.map((s) => ({ subject: s, stats: getSubjectStats(s, checks) }));
  const overallTotal = allStats.reduce((a, x) => a + x.stats.totalCells, 0);
  const overallChecked = allStats.reduce((a, x) => a + x.stats.checked, 0);
  const overallPct = overallTotal > 0 ? Math.round((overallChecked / overallTotal) * 100) : 0;

  return (
    <div className="space-y-6 pb-28 md:pb-8">
      {/* ── Page Header ── */}
      <div className="flex items-center gap-3">
        <div className="w-11 h-11 rounded-2xl bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
          <ClipboardCheck className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
            Group 1 Tracker
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
            CA Inter · 4 Papers · {TRACKER_SUBJECTS.reduce((a, s) => a + s.topics.length, 0)} Topics
          </p>
        </div>
      </div>

      {/* ── Overall Progress Strip ── */}
      <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-subtle space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Group 1 Overall
          </span>
          <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-100">
            {overallPct}%
          </span>
        </div>
        <div className="w-full bg-slate-100 dark:bg-slate-800 h-3 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full transition-all duration-500"
            style={{ width: `${overallPct}%` }}
          />
        </div>
        <p className="text-xs text-slate-400 font-medium">
          {overallChecked}/{overallTotal} cells completed across all papers
        </p>

        {/* ── Subject Overview Cards Grid ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {allStats.map(({ subject, stats }) => (
            <button
              key={subject.id}
              onClick={() => switchTab(subject.id)}
              className={`relative text-left p-4 rounded-2xl border transition-all group hover:shadow-md ${
                activeTab === subject.id
                  ? 'border-blue-300 dark:border-blue-700 bg-blue-50/50 dark:bg-blue-950/30 ring-1 ring-blue-400/30'
                  : 'border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700'
              }`}
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="min-w-0">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                    {PAPER_LABELS[subject.id]} · {subject.marks}
                  </div>
                  <div className="text-sm font-extrabold text-slate-900 dark:text-slate-100 truncate mt-0.5">
                    {subject.name}
                  </div>
                </div>
                <ProgressRing
                  percentage={stats.percentage}
                  color={subject.color}
                  size={48}
                  strokeWidth={4}
                  isComplete={stats.isComplete}
                />
              </div>
              <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                {stats.isComplete ? (
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold">✓ Complete</span>
                ) : (
                  <>{stats.topicsDone}/{stats.totalTopics} topics done</>
                )}
              </div>
              {/* Bottom accent bar */}
              <div className="absolute bottom-0 left-0 right-0 h-1 rounded-b-2xl overflow-hidden bg-slate-100 dark:bg-slate-800">
                <div
                  className="h-full rounded-b-2xl transition-all duration-300"
                  style={{ width: `${stats.percentage}%`, backgroundColor: subject.color }}
                />
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* ── Sticky Tab Bar ── */}
      <div
        ref={tabBarRef}
        className="sticky top-[73px] z-10 bg-white/90 dark:bg-slate-950/90 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 -mx-4 sm:-mx-8 px-4 sm:px-8"
      >
        <div className="flex overflow-x-auto scrollbar-hide gap-1 py-2">
          {allStats.map(({ subject, stats }) => (
            <button
              key={subject.id}
              onClick={() => switchTab(subject.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold whitespace-nowrap transition-all flex-shrink-0 ${
                activeTab === subject.id
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/25'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100'
              }`}
            >
              <span
                className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                style={{ backgroundColor: activeTab === subject.id ? 'white' : subject.color }}
              />
              <span>{subject.shortLabel}</span>
              <span
                className={`text-xs px-1.5 py-0.5 rounded-md font-extrabold ${
                  activeTab === subject.id
                    ? 'bg-blue-500/40 text-white'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                }`}
              >
                {stats.percentage}%
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* ── Subject Detail Area ── */}
      <div ref={detailRef}>
        {TRACKER_SUBJECTS.map((subject) => {
          const stats = getSubjectStats(subject, checks);
          const firstIncomplete = getFirstIncompleteTopic(subject, checks);
          const isResetting = confirmReset === subject.id;
          const isVisible = activeTab === subject.id;

          return (
            <div
              key={subject.id}
              className={`transition-all duration-200 ${
                isVisible ? 'block animate-in fade-in slide-in-from-bottom-2 duration-200' : 'hidden'
              }`}
            >
              <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-subtle overflow-hidden">
                {/* Subject Detail Header */}
                <div className="p-5 sm:p-6 space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className="w-3.5 h-3.5 rounded-full flex-shrink-0"
                        style={{ backgroundColor: subject.color }}
                      />
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                            {PAPER_LABELS[subject.id]}
                          </span>
                          <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-slate-100 truncate">
                            {subject.name}
                          </h2>
                          <span className="text-xs font-semibold text-slate-400 dark:text-slate-500">
                            ({subject.marks})
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5 italic">
                          {subject.focusLine}
                        </p>
                      </div>
                    </div>

                    {/* Reset Button */}
                    {isResetting ? (
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        <button
                          onClick={() => resetSubject(subject.id)}
                          className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-colors"
                        >
                          Confirm
                        </button>
                        <button
                          onClick={() => setConfirmReset(null)}
                          className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs font-bold transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setConfirmReset(subject.id)}
                        className="p-2 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors flex-shrink-0"
                        title="Reset progress"
                      >
                        <RotateCcw className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  {/* Progress Bar */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span className="text-slate-500 dark:text-slate-400">
                        {stats.checked}/{stats.totalCells} completed
                      </span>
                      <span className="font-extrabold" style={{ color: subject.color }}>
                        {stats.percentage}%
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-300"
                        style={{ width: `${stats.percentage}%`, backgroundColor: subject.color }}
                      />
                    </div>

                    {/* Per-Column Counts */}
                    <div className="flex flex-wrap gap-2">
                      {subject.columns.map((col, cIdx) => (
                        <span
                          key={col}
                          className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                        >
                          {col}: <span className="font-extrabold">{stats.colCounts[cIdx]}</span>/
                          {subject.topics.length}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto border-t border-slate-100 dark:border-slate-800/80">
                  <table className="w-full min-w-[500px]">
                    <thead>
                      <tr className="bg-slate-50/80 dark:bg-slate-800/40">
                        <th className="text-left px-4 sm:px-5 py-3 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 w-[55%]">
                          {TOPIC_COL_LABELS[subject.id]}
                        </th>
                        {subject.columns.map((col) => (
                          <th
                            key={col}
                            className="text-center px-3 py-3 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 w-[15%]"
                          >
                            {col}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {subject.topics.map((topic, tIdx) => {
                        const allChecked = subject.columns.every((_, cIdx) =>
                          checks[makeKey(subject.id, tIdx, cIdx)]
                        );
                        const isNextUp = tIdx === firstIncomplete;

                        return (
                          <tr
                            key={tIdx}
                            className={`border-t border-slate-100 dark:border-slate-800/60 transition-colors ${
                              allChecked
                                ? 'bg-emerald-50/50 dark:bg-emerald-950/20'
                                : isNextUp
                                ? 'bg-amber-50/40 dark:bg-amber-950/10'
                                : 'hover:bg-slate-50 dark:hover:bg-slate-800/30'
                            }`}
                          >
                            <td className="px-4 sm:px-5 py-3">
                              <div className="flex items-center gap-2">
                                {/* Next-up accent border */}
                                {isNextUp && (
                                  <div
                                    className="w-1 h-8 rounded-full flex-shrink-0"
                                    style={{ backgroundColor: subject.color }}
                                  />
                                )}
                                <span
                                  className={`text-sm font-semibold transition-colors ${
                                    allChecked
                                      ? 'text-emerald-700 dark:text-emerald-400 line-through decoration-emerald-400/50'
                                      : 'text-slate-800 dark:text-slate-200'
                                  }`}
                                >
                                  {topic}
                                </span>
                                {isNextUp && (
                                  <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md text-white flex-shrink-0" style={{ backgroundColor: subject.color }}>
                                    <ArrowRight className="w-3 h-3" />
                                    Next up
                                  </span>
                                )}
                              </div>
                            </td>
                            {subject.columns.map((_, cIdx) => {
                              const key = makeKey(subject.id, tIdx, cIdx);
                              const isChecked = !!checks[key];

                              return (
                                <td key={cIdx} className="text-center px-3 py-3">
                                  <button
                                    onClick={() => toggle(key)}
                                    className={`w-7 h-7 rounded-lg border-2 inline-flex items-center justify-center transition-all duration-150 ${
                                      isChecked
                                        ? 'border-emerald-500 bg-emerald-500 text-white scale-105 shadow-sm shadow-emerald-500/25'
                                        : 'border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 hover:border-slate-400 dark:hover:border-slate-500 hover:bg-slate-50 dark:hover:bg-slate-700'
                                    }`}
                                    aria-label={`Toggle ${topic} - ${subject.columns[cIdx]}`}
                                  >
                                    {isChecked && (
                                      <svg
                                        className="w-4 h-4"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                        strokeWidth={3}
                                      >
                                        <path
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                          d="M5 13l4 4L19 7"
                                        />
                                      </svg>
                                    )}
                                  </button>
                                </td>
                              );
                            })}
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
