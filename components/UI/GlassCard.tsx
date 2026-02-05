import React from 'react';

interface GlassCardProps {
  children: React.ReactNode;
  title?: string;
  className?: string;
  action?: React.ReactNode;
  variant?: 'default' | 'metal';
}

export const GlassCard: React.FC<GlassCardProps> = ({ children, title, className = '', action, variant = 'default' }) => {
  // We are pivoting from "Glass" to "HUD/Tech" style, but keeping the component name for compatibility.
  // Using hud-clip and hud-panel logic.
  
  return (
    <div className={`hud-panel hud-clip ${className}`}>
      
      {/* Decorative Technical Markers */}
      <div className="absolute top-2 right-2 flex gap-1 pointer-events-none opacity-50">
          <div className="w-1 h-1 bg-cyan-500"></div>
          <div className="w-1 h-1 bg-slate-600"></div>
          <div className="w-1 h-1 bg-slate-600"></div>
      </div>

      {(title || action) && (
        <div className={`px-5 py-4 flex justify-between items-center border-b border-slate-800 ${variant === 'default' ? 'bg-slate-900/50' : 'bg-gradient-to-r from-slate-800 to-slate-900'}`}>
          {title && (
              <h3 className="text-white font-bold text-lg tracking-widest uppercase flex items-center gap-2">
                  <span className="w-1 h-4 bg-cyan-500 rounded-sm inline-block"></span>
                  {title}
              </h3>
          )}
          {action && <div>{action}</div>}
        </div>
      )}
      <div className="p-5">
        {children}
      </div>
    </div>
  );
};