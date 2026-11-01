import React from 'react';

interface StatusBadgeProps {
  status: string;
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className = '' }) => {
  const getStyle = (s: string) => {
    switch (s?.toLowerCase()) {
      case 'registration open':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'upcoming':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'registration closed':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'full':
        return 'bg-rose-100 text-rose-800 border-rose-200';
      case 'completed':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'draft':
        return 'bg-slate-100 text-slate-700 border-slate-300';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'confirmed':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getStyle(
        status
      )} ${className}`}
    >
      <span className="w-1.5 h-1.5 mr-1.5 rounded-full bg-current opacity-75"></span>
      {status}
    </span>
  );
};

