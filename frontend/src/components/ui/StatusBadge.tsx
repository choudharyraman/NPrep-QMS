// src/components/ui/StatusBadge.tsx
import React from 'react';
import { Clock, CheckCircle2, MessageSquare, CheckCheck } from 'lucide-react';
import { TicketStatus } from '../../lib/mockData';

const CONFIG: Record<TicketStatus, { label: string; classes: string; Icon: React.ElementType }> = {
  pending: {
    label: 'Pending',
    classes: 'bg-amber-50 text-amber-700 border-amber-200',
    Icon: Clock,
  },
  in_progress: {
    label: 'In Progress',
    classes: 'bg-blue-50 text-blue-700 border-blue-200',
    Icon: MessageSquare,
  },
  answered: {
    label: 'Answered',
    classes: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    Icon: CheckCircle2,
  },
  resolved: {
    label: 'Resolved',
    classes: 'bg-slate-100 text-slate-600 border-slate-200',
    Icon: CheckCheck,
  },
};

interface StatusBadgeProps {
  status: TicketStatus;
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'sm' }) => {
  const { label, classes, Icon } = CONFIG[status];
  return (
    <span
      className={`inline-flex items-center gap-1 font-semibold border rounded-full ${classes} ${
        size === 'sm' ? 'text-[10px] px-2 py-0.5' : 'text-xs px-2.5 py-1'
      }`}
    >
      <Icon size={size === 'sm' ? 10 : 12} />
      {label}
    </span>
  );
};
