import { SelectHTMLAttributes } from "react";

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export function Select({
  label,
  error,
  helperText,
  className = "",
  id,
  children,
  ...props
}: SelectProps) {
  const selectId = id || label?.toLowerCase().replace(/\s+/g, "-");

  const baseStyles = "w-full rounded-xl px-4 py-3 text-base transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed appearance-none bg-no-repeat bg-right pr-10";

  const normalStyles = "border border-zinc-300 bg-white text-zinc-900 focus:border-emerald-500 focus:ring-emerald-500/20";

  const errorStyles = "border-2 border-red-500 bg-red-50 text-zinc-900 focus:border-red-500 focus:ring-red-500/20";

  const selectStyles = error ? errorStyles : normalStyles;

  // Custom dropdown arrow
  const bgImage = 'url("data:image/svg+xml,%3csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 20 20\'%3e%3cpath stroke=\'%236b7280\' stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'1.5\' d=\'M6 8l4 4 4-4\'/%3e%3c/svg%3e")';

  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={selectId}
          className="block text-sm font-medium text-zinc-700 mb-1.5"
        >
          {label}
        </label>
      )}

      <div className="relative">
        <select
          id={selectId}
          className={`${baseStyles} ${selectStyles} ${className}`}
          style={{ backgroundImage: bgImage, backgroundPosition: 'right 0.75rem center', backgroundSize: '1.5em 1.5em' }}
          {...props}
        >
          {children}
        </select>
      </div>

      {error && (
        <p className="mt-1.5 text-sm text-red-600 flex items-center gap-1">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {error}
        </p>
      )}

      {helperText && !error && (
        <p className="mt-1.5 text-sm text-zinc-500">{helperText}</p>
      )}
    </div>
  );
}
