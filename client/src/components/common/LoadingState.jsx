import React from 'react';

export const TableSkeleton = ({ rows = 5 }) => {
  return (
    <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
      {/* Table Header skeleton */}
      <div className="bg-slate-50 border-b border-slate-100 px-6 py-3.5 flex items-center justify-between">
        <div className="h-3.5 bg-slate-200 rounded w-20 animate-pulse"></div>
        <div className="h-3.5 bg-zinc-800/60 rounded w-36 animate-pulse"></div>
        <div className="h-3.5 bg-zinc-800/60 rounded w-48 animate-pulse hidden sm:block"></div>
        <div className="h-3.5 bg-zinc-800/60 rounded w-20 animate-pulse"></div>
        <div className="h-3.5 bg-zinc-800/60 rounded w-24 animate-pulse"></div>
      </div>
      {/* Rows */}
      <div className="divide-y divide-slate-100">
        {Array.from({ length: rows }).map((_, idx) => (
          <div key={idx} className="px-6 py-4 flex items-center justify-between gap-4 animate-pulse">
            <div className="h-4 bg-zinc-800/50 rounded w-20"></div>
            <div className="space-y-1.5 w-36">
              <div className="h-3.5 bg-zinc-800/60 rounded w-full"></div>
              <div className="h-2.5 bg-zinc-800/40 rounded w-2/3"></div>
            </div>
            <div className="h-3.5 bg-zinc-800/40 rounded w-48 hidden sm:block"></div>
            <div className="h-5 bg-zinc-800/60 rounded-full w-20"></div>
            <div className="h-3.5 bg-zinc-800/40 rounded w-24"></div>
          </div>
        ))}
      </div>
    </div>
  );
};

export const CardSkeleton = ({ count = 3 }) => {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, idx) => (
        <div
          key={idx}
          className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm space-y-3 animate-pulse"
        >
          <div className="flex justify-between items-center">
            <div className="h-4 bg-zinc-800/60 rounded w-20"></div>
            <div className="h-5 bg-zinc-800/60 rounded-full w-16"></div>
          </div>
          <div className="h-4 bg-zinc-800/60 rounded w-3/4"></div>
          <div className="h-3 bg-zinc-800/40 rounded w-1/2"></div>
          <div className="pt-2 border-t border-zinc-800/60 flex justify-between">
            <div className="h-3 bg-zinc-800/40 rounded w-24"></div>
            <div className="h-3 bg-zinc-800/40 rounded w-12"></div>
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
      <div className="w-7 h-7 border-2 border-slate-200 border-t-cyan-600 rounded-full animate-spin"></div>
      <p className="mt-3 text-xs font-medium text-slate-500">{message}</p>
      <span className="sr-only">{message}</span>
    </div>
  );
};

export default LoadingState;
