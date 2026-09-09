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
          className="block text-sm font-medium text-slate-700 mb-1"
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <select
        id={selectId}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        aria-invalid={!!error}
        aria-describedby={error ? `${selectId}-error` : undefined}
        className={`w-full px-3 py-2 bg-white border rounded-md text-sm text-slate-900 focus:outline-none focus:ring-2 focus:border-transparent transition-colors ${
          error
            ? 'border-red-500 focus:ring-red-500'
            : 'border-slate-300 focus:ring-blue-500'
        } ${className}`}
        {...props}
      >
        {options.map((opt) => {
          const optionValue = typeof opt === 'object' ? opt.value : opt;
          const optionLabel = typeof opt === 'object' ? opt.label : opt;
          return (
            <option key={optionValue} value={optionValue}>
              {optionLabel}
            </option>
          );
        })}
      </select>
      {error && (
        <p id={`${selectId}-error`} className="mt-1 text-xs text-red-600">
          {error}
        </p>
      )}
    </div>
  );
};

export default Select;
