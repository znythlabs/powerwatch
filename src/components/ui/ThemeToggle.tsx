'use client';

import { useAppStore } from '@/lib/store';
import type { ThemeMode } from '@/lib/types';
import { useEffect } from 'react';

const themeIcons: Record<ThemeMode, string> = {
    dark: 'dark_mode',
    light: 'light_mode',
    system: 'desktop_windows',
};

const themeLabels: Record<ThemeMode, string> = {
    dark: 'Dark',
    light: 'Light',
    system: 'System',
};

const themeOrder: ThemeMode[] = ['dark', 'light', 'system'];

export function ThemeToggle() {
    const theme = useAppStore((s) => s.theme);
    const setTheme = useAppStore((s) => s.setTheme);

    useEffect(() => {
        const root = document.documentElement;
        root.classList.remove('dark', 'light');

        if (theme === 'system') {
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            root.classList.add(prefersDark ? 'dark' : 'light');
        } else {
            root.classList.add(theme);
        }
    }, [theme]);

    const nextTheme = () => {
        const idx = themeOrder.indexOf(theme);
        setTheme(themeOrder[(idx + 1) % themeOrder.length]);
    };

    const Icon = themeIcons[theme];

    return (
        <button
            onClick={nextTheme}
            className="flex items-center gap-2 px-3 py-2 rounded-xl transition-all duration-200 hover:bg-secondary text-sm font-medium text-muted-foreground hover:text-foreground"
            aria-label={`Current theme: ${themeLabels[theme]}. Click to change.`}
        >
            <span className="material-icons-round text-[16px]">{Icon}</span>
            <span>{themeLabels[theme]}</span>
        </button>
    );
}
