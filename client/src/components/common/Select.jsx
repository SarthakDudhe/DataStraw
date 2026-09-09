import React from 'react';

const Select = ({
  label,
  name,
  options = [],
  value,
  onChange,
  error = '',
  required = false,
  id,
  className = '',
  ...props
}) => {
  const selectId = id || name;

  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={selectId}
          className="block text-xs font-medium text-zinc-300 mb-1.5"
        >
          {label}
          {required && <span className="text-red-400 ml-1">*</span>}
        </label>
      )}
      <div className="relative">
        <select
          id={selectId}
          name={name}
          value={value}
          onChange={onChange}
          required={required}
          aria-invalid={!!error}
          aria-describedby={error ? `${selectId}-error` : undefined}
          className={`w-full appearance-none px-3 py-2 pr-9 bg-zinc-950/80 border rounded-lg text-sm text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500/80 transition-colors shadow-subtle cursor-pointer ${
            error
              ? 'border-red-500/80 focus:ring-red-500/40 focus:border-red-500'
              : 'border-zinc-800 hover:border-zinc-700'
          } ${className}`}
          {...props}
        >
          {options.map((opt) => {
            const optionValue = typeof opt === 'object' ? opt.value : opt;
            const optionLabel = typeof opt === 'object' ? opt.label : opt;
            return (
              <option key={optionValue} value={optionValue} className="bg-[#111113] text-zinc-100">
                {optionLabel}
              </option>
            );
          })}
        </select>
        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-zinc-500">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
      {error && (
        <p id={`${selectId}-error`} className="mt-1.5 text-xs text-red-400">
          {error}
        </p>
      )}
    </div>
  );
};

export default Select;
