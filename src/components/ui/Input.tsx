import React from 'react';

interface InputBaseProps {
  label: string;
  error?: string;
  id?: string;
}

type InputProps = InputBaseProps & React.InputHTMLAttributes<HTMLInputElement>;

export function Input({ label, error, id, className = '', ...props }: InputProps) {
  const inputId = id || label.toLowerCase().replace(/\s+/g, '-');

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={inputId} className="text-sm font-semibold text-aifi-black">
        {label}
      </label>
      <input
        id={inputId}
        className={`w-full rounded-lg border px-3 py-2.5 text-sm text-aifi-black bg-white placeholder:text-aifi-black-60/50 transition-colors focus:outline-none focus:ring-2 focus:ring-aifi-blue focus:border-aifi-blue ${
          error ? 'border-red-400 focus:ring-red-400 focus:border-red-400' : 'border-aifi-gray'
        } ${className}`}
        aria-invalid={error ? 'true' : undefined}
        aria-describedby={error ? `${inputId}-error` : undefined}
        {...props}
      />
      {error && (
        <p id={`${inputId}-error`} className="text-xs text-red-500" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

type TextAreaProps = InputBaseProps & React.TextareaHTMLAttributes<HTMLTextAreaElement>;

export function TextArea({ label, error, id, className = '', ...props }: TextAreaProps) {
  const inputId = id || label.toLowerCase().replace(/\s+/g, '-');

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={inputId} className="text-sm font-semibold text-aifi-black">
        {label}
      </label>
      <textarea
        id={inputId}
        rows={4}
        className={`w-full rounded-lg border px-3 py-2.5 text-sm text-aifi-black bg-white placeholder:text-aifi-black-60/50 transition-colors resize-y focus:outline-none focus:ring-2 focus:ring-aifi-blue focus:border-aifi-blue ${
          error ? 'border-red-400 focus:ring-red-400 focus:border-red-400' : 'border-aifi-gray'
        } ${className}`}
        aria-invalid={error ? 'true' : undefined}
        aria-describedby={error ? `${inputId}-error` : undefined}
        {...props}
      />
      {error && (
        <p id={`${inputId}-error`} className="text-xs text-red-500" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
