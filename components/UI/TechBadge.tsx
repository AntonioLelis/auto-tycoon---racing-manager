import React from 'react';

interface TechBadgeProps {
  children: React.ReactNode;
  variant?: 'neutral' | 'active' | 'success' | 'warning' | 'danger';
  className?: string;
}

export const TechBadge: React.FC<TechBadgeProps> = ({ children, variant = 'neutral', className = '' }) => {
  const variants = {
    neutral: "bg-slate-800 text-slate-400 border-slate-600",
    active: "bg-blue-900/30 text-blue-300 border-blue-500/50 shadow-[0_0_8px_rgba(59,130,246,0.2)]",
    success: "bg-emerald-900/30 text-emerald-300 border-emerald-500/50 shadow-[0_0_8px_rgba(16,185,129,0.2)]",
    warning: "bg-amber-900/30 text-amber-300 border-amber-500/50 shadow-[0_0_8px_rgba(245,158,11,0.2)]",
    danger: "bg-red-900/30 text-red-300 border-red-500/50 shadow-[0_0_8px_rgba(239,68,68,0.2)]",
  };

  return (
    <span className={`px-2 py-0.5 rounded text-[10px] font-tech font-bold uppercase tracking-wider border ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
};