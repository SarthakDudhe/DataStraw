import React from 'react';

const variantClasses = {
  primary: 'bg-[#142a43] hover:bg-[#203a58] text-white shadow-sm focus:ring-cyan-500/40',
  secondary: 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 focus:ring-cyan-500/30',
  danger: 'bg-rose-600 hover:bg-rose-700 text-white focus:ring-rose-500/30',
  ghost: 'bg-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100 focus:ring-slate-300',
};

const Button = ({
  children,
  type = 'button',
  variant = 'primary',
  disabled = false,
  onClick,
  className = '',
  ...props
}) => {
  const baseClasses =
    'inline-flex items-center justify-center gap-2 px-3.5 py-2 text-xs sm:text-sm font-semibold rounded-md transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-offset-[#f4f7fb] disabled:opacity-50 disabled:cursor-not-allowed select-none';
  const selectedVariant = variantClasses[variant] || variantClasses.primary;

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`${baseClasses} ${selectedVariant} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
