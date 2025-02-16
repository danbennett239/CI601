// hooks/usePractice.ts
"use client";

import { useEffect, useState } from 'react';
import { Practice } from '@/types/practice';

interface UsePracticeReturn {
  practice: Practice | null;
  loading: boolean;
  error: string | null;
  refreshPractice: () => Promise<void>;
}

export function usePractice(practiceId?: string): UsePracticeReturn {
  const [practice, setPractice] = useState<Practice | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPractice = async () => {
    if (!practiceId) {
      setPractice(null);
      return;
    }
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/practice/${practiceId}`);
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to fetch practice');
      }
      const data = await res.json();
      setPractice(data.practice);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to fetch practice';
      setError(message);
      setPractice(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPractice();
  }, [practiceId]);

  // Expose a refresh function to re-fetch manually
  const refreshPractice = async () => {
    await fetchPractice();
  };

  return { practice, loading, error, refreshPractice };
}
