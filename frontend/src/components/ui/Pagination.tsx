import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '../../lib/utils';

interface PaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (p: number) => void;
  className?: string;
}

export default function Pagination({ page, totalPages, onPageChange, className }: PaginationProps) {
  if (totalPages <= 1) return null;

  const pages: (number | '...')[] = [];
  for (let i = 0; i < totalPages; i++) {
    if (i === 0 || i === totalPages - 1 || (i >= page - 1 && i <= page + 1)) {
      pages.push(i);
    } else if (pages[pages.length - 1] !== '...') {
      pages.push('...');
    }
  }

  return (
    <div className={cn('flex items-center gap-1', className)}>
      <button
        onClick={() => onPageChange(page - 1)}
        disabled={page === 0}
        className="rounded-lg p-1.5 text-gray-500 hover:bg-gray-100 disabled:opacity-30 dark:hover:bg-gray-700"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>
      {pages.map((p, i) =>
        p === '...' ? (
          <span key={i} className="px-1 text-sm text-gray-400">…</span>
        ) : (
          <button
            key={p}
            onClick={() => onPageChange(p as number)}
            className={cn(
              'h-8 w-8 rounded-lg text-sm font-medium transition-colors',
              p === page
                ? 'bg-green-600 text-white'
                : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
            )}
          >
            {(p as number) + 1}
          </button>
        )
      )}
      <button
        onClick={() => onPageChange(page + 1)}
        disabled={page === totalPages - 1}
        className="rounded-lg p-1.5 text-gray-500 hover:bg-gray-100 disabled:opacity-30 dark:hover:bg-gray-700"
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  );
}

