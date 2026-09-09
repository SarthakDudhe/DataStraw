import React from 'react';

const LoadingState = ({ message = 'Loading...', className = '' }) => {
  return (
    <div className={`flex flex-col items-center justify-center py-12 px-4 ${className}`} role="status">
      <div className="w-8 h-8 border-3 border-slate-200 border-t-blue-600 rounded-full animate-spin"></div>
      <p className="mt-3 text-sm text-slate-500 font-medium">{message}</p>
      <span className="sr-only">{message}</span>
    </div>
  );
};

export default LoadingState;
