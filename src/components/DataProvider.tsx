'use client';

import { useEffect, useRef } from 'react';
import { useAppStore } from '@/lib/store';

/**
 * DataProvider — fetches live data from Supabase on mount.
 * Falls back gracefully to mock data if the fetch fails.
 * Stale check: only refetch if last fetch was > 5 minutes ago.
 */
export function DataProvider({ children }: { children: React.ReactNode }) {
    const fetchAll = useAppStore((s) => s.fetchAll);
    const lastFetched = useAppStore((s) => s.lastFetched);
    const hasFetched = useRef(false);

    useEffect(() => {
        const staleMs = 5 * 60 * 1000; // 5 minutes
        const isStale = !lastFetched || Date.now() - lastFetched > staleMs;

        if (!hasFetched.current && isStale) {
            hasFetched.current = true;
            fetchAll();
        }
    }, [fetchAll, lastFetched]);

    return <>{children}</>;
}
