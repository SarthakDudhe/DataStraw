import React from 'react';

const variantClasses = {
  primary: 'bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white shadow-sm border border-blue-500/30 focus:ring-blue-500/40',
  secondary: 'bg-zinc-800 hover:bg-zinc-700 active:bg-zinc-800 text-zinc-200 border border-zinc-700/60 focus:ring-zinc-600/40',
  danger: 'bg-red-600/90 hover:bg-red-500 text-white border border-red-500/30 focus:ring-red-500/40',
  ghost: 'bg-transparent text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/60 focus:ring-zinc-700',
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
    'inline-flex items-center justify-center gap-2 px-3.5 py-2 text-xs sm:text-sm font-medium rounded-lg transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-offset-[#09090B] disabled:opacity-50 disabled:cursor-not-allowed select-none';
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
