import React from 'react';

interface CharacterCounterProps {
  current: number;
  min?: number;
  max?: number;
  optimal?: { min: number; max: number };
  className?: string;
}

export function CharacterCounter({
  current,
  min,
  max,
  optimal,
  className = ''
}: CharacterCounterProps) {
  const getStatus = (): 'too-short' | 'optimal' | 'too-long' | 'normal' => {
    if (max && current > max) return 'too-long';
    if (min && current < min) return 'too-short';
    if (optimal) {
      if (current >= optimal.min && current <= optimal.max) return 'optimal';
      if (current < optimal.min) return 'too-short';
      if (current > optimal.max) return 'too-long';
    }
    return 'normal';
  };

  const status = getStatus();

  const getColor = () => {
    switch (status) {
      case 'optimal':
        return 'text-green-600 dark:text-green-400';
      case 'too-short':
        return 'text-orange-600 dark:text-orange-400';
      case 'too-long':
        return 'text-red-600 dark:text-red-400';
      default:
        return 'text-zinc-500 dark:text-zinc-400';
    }
  };

  const getMessage = () => {
    if (optimal) {
      return `${current} / ${optimal.max} characters (optimal: ${optimal.min}-${optimal.max})`;
    }
    if (max) {
      return `${current} / ${max} characters`;
    }
    return `${current} characters`;
  };

  return (
    <div className={`flex items-center gap-2 text-xs ${getColor()} ${className}`}>
      <span>{getMessage()}</span>
      {status === 'optimal' && (
        <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
        </svg>
      )}
      {status === 'too-long' && (
        <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
        </svg>
      )}
    </div>
  );
}
