import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export const cn = (...inputs) => twMerge(clsx(inputs));

export const Button = React.forwardRef(({ className, variant = 'primary', size = 'md', ...props }, ref) => {
  const variants = {
    primary: 'bg-emerald-600 text-white hover:bg-emerald-500 shadow-lg shadow-emerald-500/20 active:scale-95 transition-all duration-300 ring-offset-2 ring-offset-slate-950 focus:ring-2 focus:ring-emerald-500',
    secondary: 'bg-slate-800 text-slate-100 hover:bg-slate-700 border border-slate-700/50 active:scale-95 transition-all duration-300',
    ghost: 'bg-transparent text-slate-400 hover:bg-slate-800/80 hover:text-emerald-400 transition-all duration-300',
    outline: 'bg-transparent border border-emerald-500/30 text-emerald-500 hover:bg-emerald-500 hover:text-white transition-all duration-300',
    danger: 'bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white border border-red-500/20 active:scale-95 transition-all duration-300',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm font-medium rounded-lg',
    md: 'px-6 py-2.5 text-base font-semibold rounded-xl',
    lg: 'px-8 py-3.5 text-lg font-bold rounded-2xl',
  };

  return (
    <button
      ref={ref}
      className={cn(
        'inline-flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed select-none',
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    />
  );
});

export const Card = ({ children, className, hover = false }) => (
  <div className={cn(
    'glass-card rounded-2xl p-6 transition-all duration-500 group',
    hover && 'hover:translate-y-[-4px] hover:border-emerald-500/30 hover:shadow-[0_20px_40px_-20px_rgba(16,185,129,0.2)]',
    className
  )}>
    {children}
  </div>
);

export const Input = React.forwardRef(({ label, error, className, icon: Icon, ...props }, ref) => (
  <div className="space-y-2 w-full group/input">
    {label && (
      <label className="block text-sm font-semibold text-slate-400 transition-colors group-focus-within/input:text-emerald-400 ml-1">
        {label}
      </label>
    )}
    <div className="relative">
      {Icon && (
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within/input:text-emerald-500 transition-colors">
          <Icon size={18} />
        </div>
      )}
      <input
        ref={ref}
        className={cn(
          'w-full bg-slate-900/40 border border-slate-700/50 text-white rounded-xl py-3 px-4 transition-all duration-300 focus:outline-none focus:border-emerald-500/50 focus:ring-4 focus:ring-emerald-500/10 placeholder:text-slate-600',
          Icon && 'pl-11',
          error && 'border-red-500/50 focus:ring-red-500/10 focus:border-red-500',
          className
        )}
        {...props}
      />
    </div>
    {error && (
      <p className="text-xs text-red-400 mt-1 ml-1 font-medium animate-in fade-in slide-in-from-top-1 duration-300">
        {error}
      </p>
    )}
  </div>
));

export const Badge = ({ children, variant = 'info', className }) => {
  const variants = {
    info: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
    warning: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
    error: 'bg-red-500/10 text-red-500 border-red-500/20',
    neutral: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
  };

  return (
    <span className={cn(
      'px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border',
      variants[variant],
      className
    )}>
      {children}
    </span>
  );
};
