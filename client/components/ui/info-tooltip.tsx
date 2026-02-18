import React, { useState } from 'react';
import { HelpCircle } from 'lucide-react';

interface InfoTooltipProps {
  title: string;
  description: string;
  examples?: string[];
  className?: string;
}

export function InfoTooltip({ title, description, examples, className = '' }: InfoTooltipProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className={`relative inline-block ${className}`}>
      <button
        type="button"
        onMouseEnter={() => setIsOpen(true)}
        onMouseLeave={() => setIsOpen(false)}
        onClick={() => setIsOpen(!isOpen)}
        className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors"
        aria-label="More information"
      >
        <HelpCircle className="h-4 w-4" />
      </button>

      {isOpen && (
        <div className="absolute z-50 left-0 top-6 w-80 rounded-lg border border-zinc-200 bg-white p-4 shadow-xl dark:border-zinc-700 dark:bg-zinc-800 animate-fade-in">
          <div className="absolute -top-1 left-2 h-2 w-2 rotate-45 border-l border-t border-zinc-200 bg-white dark:border-zinc-700 dark:bg-zinc-800"></div>

          <h4 className="font-semibold text-sm text-zinc-900 dark:text-white mb-2">
            {title}
          </h4>

          <p className="text-xs text-zinc-600 dark:text-zinc-300 mb-3">
            {description}
          </p>

          {examples && examples.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                Examples:
              </p>
              <ul className="space-y-1.5">
                {examples.map((example, index) => (
                  <li key={index} className="text-xs text-zinc-600 dark:text-zinc-400 pl-3 relative">
                    <span className="absolute left-0 top-1.5 h-1 w-1 rounded-full bg-zinc-400"></span>
                    {example}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
