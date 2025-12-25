import { InputHTMLAttributes } from "react";

export interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  label?: string;
}

export function Checkbox({
  label,
  className = "",
  id,
  ...props
}: CheckboxProps) {
  const checkboxId = id || label?.toLowerCase().replace(/\s+/g, "-");

  return (
    <div className="flex items-center gap-2">
      <input
        type="checkbox"
        id={checkboxId}
        className={`
          w-5 h-5 rounded-md border-2 border-zinc-300 text-emerald-600
          focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2
          transition-all duration-200
          checked:bg-emerald-600 checked:border-emerald-600
          hover:border-emerald-400
          disabled:opacity-50 disabled:cursor-not-allowed
          ${className}
        `}
        {...props}
      />
      {label && (
        <label
          htmlFor={checkboxId}
          className="text-sm font-medium text-zinc-700 cursor-pointer select-none"
        >
          {label}
        </label>
      )}
    </div>
  );
}
