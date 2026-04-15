'use client';

import { useAppStore } from './store';
import en from './messages/en.json';
import fil from './messages/fil.json';

type Messages = typeof en;

const messages: Record<string, Messages> = { en, fil };

/**
 * Simple i18n hook that reads language from Zustand store.
 * Returns a `t` function for nested key access like t('dashboard.clear').
 */
export function useTranslation() {
    const language = useAppStore((s) => s.language);
    const m = messages[language] ?? en;

    function t(key: string): string {
        const keys = key.split('.');
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let result: any = m;
        for (const k of keys) {
            result = result?.[k];
            if (result === undefined) return key;
        }
        return typeof result === 'string' ? result : key;
    }

    return { t, language };
}
