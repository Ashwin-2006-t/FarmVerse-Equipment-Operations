import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?:
    | 'default'
    | 'success'
    | 'warning'
    | 'danger'
    | 'info'
    | 'outline'
    | 'neutral';
  size?: 'sm' | 'md';
}

export const Badge: React.FC<BadgeProps> = ({
  className,
  variant = 'default',
  size = 'md',
  children,
  ...props
}) => {
  const baseStyles = 'inline-flex items-center font-medium rounded-full';

  const variants = {
    default: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300',
    success: 'bg-green-100 text-green-800 dark:bg-green-950/60 dark:text-green-300',
    warning: 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300',
    danger: 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300',
    info: 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300',
    neutral: 'bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-300',
    outline: 'border border-zinc-300 text-zinc-700 dark:border-zinc-700 dark:text-zinc-300',
  };

  const sizes = {
    sm: 'text-[11px] px-2 py-0.5',
    md: 'text-xs px-2.5 py-0.5',
  };

  return (
    <span className={twMerge(clsx(baseStyles, variants[variant], sizes[size], className))} {...props}>
      {children}
    </span>
  );
};

export default Badge;

export const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  switch (status) {
    case 'AVAILABLE':
      return <Badge variant="success">Available</Badge>;
    case 'BOOKED':
      return <Badge variant="info">Booked</Badge>;
    case 'IN_USE':
      return <Badge variant="warning">In Use</Badge>;
    case 'UNDER_MAINTENANCE':
      return <Badge variant="danger">Under Maintenance</Badge>;
    case 'OUT_OF_SERVICE':
      return <Badge variant="danger">Out of Service</Badge>;
    case 'INACTIVE':
      return <Badge variant="neutral">Inactive</Badge>;

    // Booking statuses
    case 'PENDING':
      return <Badge variant="warning">Pending Approval</Badge>;
    case 'APPROVED':
      return <Badge variant="success">Approved</Badge>;
    case 'REJECTED':
      return <Badge variant="danger">Rejected</Badge>;
    case 'CANCELLED':
      return <Badge variant="neutral">Cancelled</Badge>;
    case 'COMPLETED':
      return <Badge variant="default">Completed</Badge>;
    case 'IN_PROGRESS':
      return <Badge variant="info">In Progress</Badge>;

    // Maintenance statuses
    case 'SCHEDULED':
      return <Badge variant="info">Scheduled</Badge>;
    case 'OVERDUE':
      return <Badge variant="danger">Overdue</Badge>;

    default:
      return <Badge variant="neutral">{status.replace(/_/g, ' ')}</Badge>;
  }
};
