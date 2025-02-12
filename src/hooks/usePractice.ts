// hooks/usePractice.ts
import { useEffect, useState } from 'react';
import { Practice } from '@/types/practice';

interface UsePracticeReturn {
  practice: Practice | null;
  loading: boolean;
  error: string | null;
}

export function usePractice(practiceId?: string): UsePracticeReturn {
  const [practice, setPractice] = useState<Practice | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!practiceId) {
      setPractice(null);
      return;
    }

    async function fetchPractice() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/practice/${practiceId}`);
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || 'Failed to fetch practice');
        }
        const data = await res.json();
        setPractice(data.practice);
      } catch (err: any) {
        setError(err.message);
        setPractice(null);
      } finally {
        setLoading(false);
      }
    }

    fetchPractice();
  }, [practiceId]);

  return { practice, loading, error };
}
