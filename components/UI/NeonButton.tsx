import React from 'react';

interface NeonButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'warning';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
}

export const NeonButton: React.FC<NeonButtonProps> = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  className = '', 
  fullWidth = false,
  ...props 
}) => {
  
  // Aligning with the 3D "Physical Keycap" look
  const baseStyles = "relative font-bold uppercase tracking-wider transition-all duration-75 flex items-center justify-center focus:outline-none active:translate-y-1 active:border-b-0 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:translate-y-0 disabled:active:border-b-4";
  
  const variants = {
    primary: "bg-slate-800 text-blue-400 border-x border-t border-blue-500/50 border-b-4 border-b-blue-900 hover:bg-blue-900/30 hover:text-blue-300 shadow-[0_0_10px_rgba(59,130,246,0.1)]",
    secondary: "bg-slate-800 text-slate-400 border-x border-t border-slate-600 border-b-4 border-b-slate-900 hover:bg-slate-700 hover:text-white",
    danger: "bg-slate-800 text-red-400 border-x border-t border-red-500/50 border-b-4 border-b-red-900 hover:bg-red-900/30 hover:text-red-300",
    success: "bg-slate-800 text-emerald-400 border-x border-t border-emerald-500/50 border-b-4 border-b-emerald-900 hover:bg-emerald-900/30 hover:text-emerald-300",
    warning: "bg-slate-800 text-amber-400 border-x border-t border-amber-500/50 border-b-4 border-b-amber-900 hover:bg-amber-900/30 hover:text-amber-300",
  };

  const sizes = {
    sm: "px-3 py-1 text-xs h-7",
    md: "px-5 py-2 text-sm h-10",
    lg: "px-8 py-3 text-base h-12",
  };

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${fullWidth ? 'w-full' : ''} ${className}`}
      style={{ clipPath: 'polygon(8px 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%, 0 8px)' }} // Larger chamfer for Neon Buttons
      {...props}
    >
      {children}
    </button>
  );
};