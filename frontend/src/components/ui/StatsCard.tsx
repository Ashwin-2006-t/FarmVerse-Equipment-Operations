import React from 'react';
import { cn } from '../../lib/utils';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color?: 'green' | 'blue' | 'amber' | 'red' | 'purple' | 'zinc';
  trend?: string;
  trendUp?: boolean;
  subtitle?: string;
  className?: string;
}

const colorMap = {
  green: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400',
  blue: 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
  amber: 'bg-amber-50 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400',
  red: 'bg-rose-50 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400',
  purple: 'bg-purple-50 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400',
  zinc: 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400',
};

export default function StatsCard({
  title,
  value,
  icon,
  color = 'green',
  trend,
  trendUp,
  subtitle,
  className,
}: StatsCardProps) {
  return (
    <div
      className={cn(
        'rounded-2xl border border-gray-100 bg-white p-5 shadow-sm hover:shadow-md transition-shadow dark:border-gray-700 dark:bg-gray-900',
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
          <p className="mt-1 text-2xl font-bold tracking-tight text-gray-800 dark:text-white">{value}</p>
          {subtitle && <p className="mt-0.5 text-xs text-gray-400">{subtitle}</p>}
        </div>
        <div className={cn('rounded-xl p-3', colorMap[color])}>{icon}</div>
      </div>
      {trend && (
        <p
          className={cn(
            'mt-3 text-xs font-medium',
            trendUp ? 'text-emerald-600' : 'text-rose-500'
          )}
        >
          {trend}
        </p>
      )}
    </div>
  );
}

