import React from 'react';

const Textarea = ({
  label,
  name,
  value,
  onChange,
  placeholder = '',
  error = '',
  required = false,
  helperText = '',
  rows = 4,
  id,
  className = '',
  ...props
}) => {
  const textareaId = id || name;

  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={textareaId}
          className="block text-xs font-medium text-zinc-300 mb-1.5"
        >
          {label}
          {required && <span className="text-red-400 ml-1">*</span>}
        </label>
      )}
      <textarea
        id={textareaId}
        name={name}
        rows={rows}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        aria-invalid={!!error}
        aria-describedby={error ? `${textareaId}-error` : undefined}
        className={`w-full px-3 py-2 bg-zinc-950/80 border rounded-lg text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500/80 transition-colors shadow-subtle resize-y ${
          error
            ? 'border-red-500/80 focus:ring-red-500/40 focus:border-red-500'
            : 'border-zinc-800 hover:border-zinc-700'
        } ${className}`}
        {...props}
      />
      {helperText && !error && (
        <p className="mt-1.5 text-xs text-zinc-500">{helperText}</p>
      )}
      {error && (
        <p id={`${textareaId}-error`} className="mt-1.5 text-xs text-red-400">
          {error}
        </p>
      )}
    </div>
  );
};

export default Textarea;
