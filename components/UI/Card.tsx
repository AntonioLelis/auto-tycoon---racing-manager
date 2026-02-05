import React from 'react';

interface CardProps {
  children: React.ReactNode;
  title?: string;
  className?: string;
  action?: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({ children, title, className = '', action }) => {
  return (
    // Applied .hud-clip for geometric shape and .hud-panel for background/borders
    <div className={`hud-panel hud-clip ${className}`}>
      {(title || action) && (
        <div className="bg-slate-900/80 px-5 py-3 border-b border-slate-700/50 flex justify-between items-center bg-metal">
          {title && <h3 className="text-slate-100 font-bold text-lg tracking-wide uppercase">{title}</h3>}
          {action && <div>{action}</div>}
        </div>
      )}
      <div className="p-5">
        {children}
      </div>
    </div>
  );
};