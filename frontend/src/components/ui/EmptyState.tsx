import React from 'react';
import { DivideIcon as LucideDivide } from 'lucide-react';
import { cn } from '../../lib/utils';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export default function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center py-16 px-4 text-center', className)}>
      {icon && (
        <div className="mb-4 rounded-full bg-green-50 p-5 text-green-400 dark:bg-green-900/20">
          {icon}
        </div>
      )}
      <h3 className="mb-1 text-lg font-semibold text-gray-800 dark:text-gray-100">{title}</h3>
      {description && (
        <p className="mb-6 max-w-sm text-sm text-gray-500 dark:text-gray-400">{description}</p>
      )}
      {action && <div>{action}</div>}
    </div>
  );
}

