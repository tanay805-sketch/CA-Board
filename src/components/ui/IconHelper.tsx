'use client';

import React from 'react';
import {
  BookOpen,
  Scale,
  Calculator,
  FileText,
  ShieldCheck,
  TrendingUp,
  PieChart,
  Brain,
  FileSpreadsheet,
  Award,
  LucideProps,
} from 'lucide-react';

const ICON_MAP: Record<string, React.FC<LucideProps>> = {
  Calculator,
  Scale,
  FileText,
  PieChart,
  ShieldCheck,
  TrendingUp,
  BookOpen,
  Brain,
  FileSpreadsheet,
  Award,
};

interface IconHelperProps extends LucideProps {
  name?: string;
  defaultIcon?: React.FC<LucideProps>;
}

export function IconHelper({ name, className = 'w-6 h-6', defaultIcon = BookOpen, ...props }: IconHelperProps) {
  if (name && ICON_MAP[name]) {
    const Component = ICON_MAP[name];
    return <Component className={className} {...props} />;
  }
  const DefaultComp = defaultIcon;
  return <DefaultComp className={className} {...props} />;
}
