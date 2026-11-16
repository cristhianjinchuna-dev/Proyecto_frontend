import type { TextareaHTMLAttributes } from 'react';

interface TextAreaFieldProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  value: string;
  maxLength: number;
  error?: string;
  hint?: string;
}

// Multiline text with a character counter (descriptions and messages)
export function TextAreaField({
  label,
  error,
  hint,
  id,
  name,
  value,
  maxLength,
  rows = 4,
  className = '',
  ...textareaProps
}: TextAreaFieldProps) {
  const inputId = id ?? name;
  const nearLimit = value.length > maxLength * 0.9;

  return (
    <div className="space-y-1">
      <label htmlFor={inputId} className="block text-sm font-medium text-gray-700">
        {label}
      </label>
      <textarea
        id={inputId}
        name={name}
        value={value}
        maxLength={maxLength}
        rows={rows}
        aria-invalid={Boolean(error)}
        className={`w-full resize-y rounded-lg border px-3 py-2 transition focus:outline-none focus:ring-2 ${
          error ? 'border-red-500 focus:ring-red-300' : 'border-gray-300 focus:ring-blue-500'
        } ${className}`}
        {...textareaProps}
      />
      <div className="flex items-start justify-between gap-3">
        {error ? (
          <p className="text-sm text-red-600">{error}</p>
        ) : (
          <p className="text-xs text-gray-500">{hint}</p>
        )}
        <p className={`shrink-0 text-xs ${nearLimit ? 'font-medium text-amber-700' : 'text-gray-400'}`}>
          {value.length}/{maxLength}
        </p>
      </div>
    </div>
  );
}
