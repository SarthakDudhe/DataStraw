import React from 'react';
import { AlertCircle, RotateCcw } from 'lucide-react';
import Button from './Button';

const ErrorState = ({
  title = 'Unable to load tickets',
  message = 'Something went wrong while retrieving your support tickets.',
  onRetry,
  className = '',
}) => {
  return (
    <div
      role="alert"
      className={`flex flex-col items-center justify-center text-center p-8 border border-red-900/30 rounded-xl bg-red-950/20 shadow-subtle ${className}`}
    >
      <div className="w-10 h-10 rounded-full bg-red-900/30 border border-red-800/40 flex items-center justify-center text-red-400 mb-3">
        <AlertCircle className="w-5 h-5" />
      </div>
      <h3 className="text-sm font-semibold text-red-200">{title}</h3>
      {message && (
        <p className="mt-1 text-xs text-red-400/80 max-w-sm">{message}</p>
      )}
      {onRetry && (
        <div className="mt-4">
          <Button variant="secondary" onClick={onRetry}>
            <RotateCcw className="w-3.5 h-3.5 mr-1" />
            Try again
          </Button>
        </div>
      )}
    </div>
  );
};

export default ErrorState;
