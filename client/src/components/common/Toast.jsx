import React, { createContext, useContext, useState, useCallback } from 'react';

const ToastContext = createContext(null);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, type = 'success', duration = 3500) => {
    const id = Date.now() + Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, duration);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div
        aria-live="polite"
        className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none"
      >
        {toasts.map((toast) => {
          const isSuccess = toast.type === 'success';
          const isError = toast.type === 'error';
          return (
            <div
              key={toast.id}
              role="alert"
              className={`pointer-events-auto flex items-start justify-between p-4 rounded-lg shadow-lg border text-sm transition-all duration-200 animate-slide-up ${
                isSuccess
                  ? 'bg-white border-emerald-200 text-slate-800'
                  : isError
                  ? 'bg-white border-red-200 text-slate-800'
                  : 'bg-white border-blue-200 text-slate-800'
              }`}
            >
              <div className="flex items-center gap-3">
                <span
                  className={`w-2 h-2 rounded-full shrink-0 ${
                    isSuccess
                      ? 'bg-emerald-500'
                      : isError
                      ? 'bg-red-500'
                      : 'bg-blue-500'
                  }`}
                />
                <p className="font-medium">{toast.message}</p>
              </div>
              <button
                type="button"
                onClick={() => removeToast(toast.id)}
                className="ml-3 text-slate-400 hover:text-slate-600 focus:outline-none"
                aria-label="Dismiss notification"
              >
                &times;
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
