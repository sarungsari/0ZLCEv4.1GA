import React from 'react';

export interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon: React.ReactNode;
  label: string;
  size?: '44' | '48';
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
}

export const IconButton: React.FC<IconButtonProps> = ({
  icon,
  label,
  size = '44',
  variant = 'secondary',
  className = '',
  disabled,
  ...props
}) => {
  const sizeClasses = size === '48'
    ? 'touch-target-48 min-h-[48px] min-w-[48px] p-3'
    : 'touch-target-44 min-h-[44px] min-w-[44px] p-2.5';

  const variantClasses = {
    primary: 'bg-cyan-600 hover:bg-cyan-500 text-white shadow-md active:bg-cyan-700',
    secondary: 'bg-slate-800/90 hover:bg-slate-700 text-slate-200 border border-slate-700 active:bg-slate-900',
    ghost: 'bg-transparent hover:bg-slate-800 text-slate-400 hover:text-white active:bg-slate-800/60',
    danger: 'bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 border border-rose-800/50 active:bg-rose-950'
  }[variant];

  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      disabled={disabled}
      className={`inline-flex items-center justify-center rounded-xl font-medium transition active:scale-95 disabled:opacity-50 disabled:pointer-events-none disabled:active:scale-100 ${sizeClasses} ${variantClasses} ${className}`}
      {...props}
    >
      {icon}
    </button>
  );
};
