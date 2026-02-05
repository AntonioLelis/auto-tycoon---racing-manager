import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'success';
  size?: 'sm' | 'md' | 'lg';
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  className = '', 
  ...props 
}) => {
  // 3D Physical Button Styles
  // - No rounded corners (slight chamfer handled by clip-path or simple sharp edges)
  // - Thick bottom border to create "Height"
  // - Active state removes border-bottom and translates Y to simulate pressing
  
  const baseStyles = "relative font-bold uppercase tracking-wider transition-all duration-75 flex items-center justify-center focus:outline-none active:translate-y-1 active:border-b-0";
  
  const variants = {
    primary: "bg-gradient-to-b from-blue-600 to-blue-700 border-x border-t border-blue-500 border-b-4 border-b-blue-900 text-white hover:from-blue-500 hover:to-blue-600 shadow-lg shadow-blue-900/20",
    secondary: "bg-gradient-to-b from-slate-700 to-slate-800 border-x border-t border-slate-600 border-b-4 border-b-slate-950 text-slate-200 hover:from-slate-600 hover:to-slate-700",
    danger: "bg-gradient-to-b from-red-600 to-red-700 border-x border-t border-red-500 border-b-4 border-b-red-900 text-white hover:from-red-500 hover:to-red-600",
    success: "bg-gradient-to-b from-emerald-600 to-emerald-700 border-x border-t border-emerald-500 border-b-4 border-b-emerald-900 text-white hover:from-emerald-500 hover:to-emerald-600",
  };

  const sizes = {
    sm: "px-3 py-1 text-xs h-8 min-w-[80px]",
    md: "px-5 py-2 text-sm h-10 min-w-[100px]",
    lg: "px-8 py-3 text-base h-12 min-w-[120px]",
  };

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className} disabled:opacity-50 disabled:cursor-not-allowed disabled:active:translate-y-0 disabled:active:border-b-4`}
      style={{ clipPath: 'polygon(5px 0, 100% 0, 100% calc(100% - 5px), calc(100% - 5px) 100%, 0 100%, 0 5px)' }} // Micro-chamfer
      {...props}
    >
      {children}
    </button>
  );
};