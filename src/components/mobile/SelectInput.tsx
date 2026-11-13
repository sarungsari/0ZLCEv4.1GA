import React from 'react';
import { ChevronDown } from 'lucide-react';

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectInputProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: SelectOption[];
  helperText?: string;
}

export const SelectInput: React.FC<SelectInputProps> = ({
  label,
  options,
  helperText,
  className = '',
  id,
  value,
  onChange,
  disabled,
  ...props
}) => {
  const selectId = id || (label ? `select-${label.toLowerCase().replace(/\s+/g, '-')}` : undefined);

  return (
    <div className="flex flex-col gap-1.5 w-full">
      {label && (
        <label htmlFor={selectId} className="text-sm font-semibold text-slate-200">
          {label}
        </label>
      )}

      <div className="relative w-full">
        <select
          id={selectId}
          value={value}
          onChange={onChange}
          disabled={disabled}
          className={`w-full touch-target-44 min-h-[44px] appearance-none pl-3.5 pr-10 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-sm font-medium text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
          {...props}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value} className="bg-slate-900 text-slate-100 text-sm py-1.5">
              {opt.label}
            </option>
          ))}
        </select>

        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3.5 text-slate-400">
          <ChevronDown className="w-4 h-4" />
        </div>
      </div>

      {helperText && (
        <p className="text-xs text-slate-400 leading-normal">
          {helperText}
        </p>
      )}
    </div>
  );
};
