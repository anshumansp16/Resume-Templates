import { useEffect, useRef, useState } from 'react';
import { useDebounce } from './useDebounce';

interface AutoSaveOptions {
  key: string;
  data: any;
  delay?: number;
  enabled?: boolean;
}

export function useAutoSave({ key, data, delay = 2000, enabled = true }: AutoSaveOptions) {
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const debouncedData = useDebounce(data, delay);
  const isInitialMount = useRef(true);

  useEffect(() => {
    // Skip saving on initial mount
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    if (!enabled) return;

    const save = async () => {
      setIsSaving(true);
      try {
        localStorage.setItem(key, JSON.stringify(debouncedData));
        setLastSaved(new Date());
      } catch (error) {
        console.error('Failed to save to localStorage:', error);
      } finally {
        setIsSaving(false);
      }
    };

    save();
  }, [debouncedData, key, enabled]);

  const clearSaved = () => {
    localStorage.removeItem(key);
    setLastSaved(null);
  };

  const loadSaved = (): any | null => {
    try {
      const saved = localStorage.getItem(key);
      return saved ? JSON.parse(saved) : null;
    } catch (error) {
      console.error('Failed to load from localStorage:', error);
      return null;
    }
  };

  return {
    lastSaved,
    isSaving,
    clearSaved,
    loadSaved,
  };
}
