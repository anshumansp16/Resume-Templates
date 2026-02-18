"use client";

import { useState, useEffect } from "react";
import { AlertCircle } from "lucide-react";

interface FormInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  type?: "text" | "email" | "url" | "tel" | "date";
  placeholder?: string;
  required?: boolean;
  error?: string | null;
  validate?: (value: string) => string | null;
  className?: string;
}

export function FormInput({
  label,
  value,
  onChange,
  onBlur,
  type = "text",
  placeholder,
  required = false,
  error: externalError,
  validate,
  className = "",
}: FormInputProps) {
  const [internalError, setInternalError] = useState<string | null>(null);
  const [touched, setTouched] = useState(false);

  const error = externalError || internalError;
  const showError = touched && error;

  const handleBlur = () => {
    setTouched(true);
    if (validate) {
      const validationError = validate(value);
      setInternalError(validationError);
    }
    onBlur?.();
  };

  const handleChange = (newValue: string) => {
    onChange(newValue);
    // Clear error on change if previously touched
    if (touched && validate) {
      const validationError = validate(newValue);
      setInternalError(validationError);
    }
  };

  return (
    <div className={className}>
      <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-2">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => handleChange(e.target.value)}
        onBlur={handleBlur}
        placeholder={placeholder}
        className={`w-full rounded-lg border ${
          showError
            ? "border-red-500 focus:border-red-500 focus:ring-red-500/20"
            : "border-zinc-300 dark:border-zinc-700 focus:border-blue-500 focus:ring-blue-500/20"
        } bg-white dark:bg-zinc-800 px-4 py-2.5 text-zinc-900 dark:text-white placeholder:text-zinc-400 focus:ring-2 outline-none transition-all`}
      />
      {showError && (
        <div className="flex items-center gap-1.5 mt-1.5 text-red-600 dark:text-red-400 text-sm">
          <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
