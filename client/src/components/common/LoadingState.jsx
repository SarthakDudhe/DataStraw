import React from 'react';

export const TableSkeleton = ({ rows = 5 }) => {
  return (
    <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden animate-pulse">
      <div className="bg-slate-50 border-b border-slate-200 px-6 py-3.5 flex gap-4">
        <div className="h-4 bg-slate-200 rounded w-20"></div>
        <div className="h-4 bg-slate-200 rounded w-32"></div>
        <div className="h-4 bg-slate-200 rounded flex-1"></div>
        <div className="h-4 bg-slate-200 rounded w-24"></div>
        <div className="h-4 bg-slate-200 rounded w-28"></div>
      </div>
      <div className="divide-y divide-slate-100">
        {Array.from({ length: rows }).map((_, idx) => (
          <div key={idx} className="px-6 py-4 flex items-center gap-4">
            <div className="h-4 bg-slate-200 rounded w-20"></div>
            <div className="h-4 bg-slate-200 rounded w-32"></div>
            <div className="h-4 bg-slate-200 rounded flex-1"></div>
            <div className="h-5 bg-slate-200 rounded-full w-20"></div>
            <div className="h-4 bg-slate-200 rounded w-28"></div>
          </div>
        ))}
      </div>
    </div>
  );
};

export const CardSkeleton = ({ count = 3 }) => {
  return (
    <div className="space-y-3 animate-pulse">
      {Array.from({ length: count }).map((_, idx) => (
        <div
          key={idx}
          className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm space-y-3"
        >
          <div className="flex justify-between items-center">
            <div className="h-4 bg-slate-200 rounded w-16"></div>
            <div className="h-5 bg-slate-200 rounded-full w-20"></div>
          </div>
          <div className="h-5 bg-slate-200 rounded w-3/4"></div>
          <div className="h-4 bg-slate-200 rounded w-1/2"></div>
          <div className="pt-2 border-t border-slate-100 flex justify-between">
            <div className="h-3 bg-slate-200 rounded w-28"></div>
            <div className="h-3 bg-slate-200 rounded w-20"></div>
          </div>
        </div>
      ))}
    </div>
  );
};

const LoadingState = ({ message = 'Loading...', className = '' }) => {
  return (
    <div
      className={`flex flex-col items-center justify-center py-12 px-4 ${className}`}
      role="status"
    >
      <div className="w-8 h-8 border-2 border-slate-200 border-t-blue-600 rounded-full animate-spin"></div>
      <p className="mt-3 text-sm text-slate-500 font-medium">{message}</p>
      <span className="sr-only">{message}</span>
    </div>
  );
};

export default LoadingState;
