'use client';

import { useAppStore } from '@/lib/store';

export function LanguageToggle() {
    const language = useAppStore((s) => s.language);
    const setLanguage = useAppStore((s) => s.setLanguage);

    return (
        <button
            onClick={() => setLanguage(language === 'en' ? 'fil' : 'en')}
            className="flex items-center gap-2 px-3 py-2 rounded-xl transition-all duration-200 hover:bg-secondary text-sm font-medium text-muted-foreground hover:text-foreground"
            aria-label={`Switch to ${language === 'en' ? 'Filipino' : 'English'}`}
        >
            <span className="text-base">{language === 'en' ? '🇺🇸' : '🇵🇭'}</span>
            <span>{language === 'en' ? 'English' : 'Filipino'}</span>
        </button>
    );
}
