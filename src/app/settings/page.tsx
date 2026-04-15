'use client';

import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useAppStore } from '@/lib/store';
import { useTranslation } from '@/lib/i18n';
import type { ThemeMode } from '@/lib/types';
import { useEffect } from 'react';

const themes: { key: ThemeMode; icon: string; labelKey: string }[] = [
    { key: 'dark', icon: 'dark_mode', labelKey: 'settings.dark' },
    { key: 'light', icon: 'light_mode', labelKey: 'settings.light' },
    { key: 'system', icon: 'desktop_windows', labelKey: 'settings.system' },
];

export default function SettingsPage() {
    const { t } = useTranslation();
    const language = useAppStore((s) => s.language);
    const setLanguage = useAppStore((s) => s.setLanguage);
    const theme = useAppStore((s) => s.theme);
    const setTheme = useAppStore((s) => s.setTheme);
    const tier = useAppStore((s) => s.tier);
    const setTier = useAppStore((s) => s.setTier);
    const isAuthenticated = useAppStore((s) => s.isAuthenticated);
    const setAuthenticated = useAppStore((s) => s.setAuthenticated);

    // Apply theme class
    useEffect(() => {
        const root = document.documentElement;
        root.classList.remove('dark', 'light');
        if (theme === 'system') {
            root.classList.add(
                window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
            );
        } else {
            root.classList.add(theme);
        }
    }, [theme]);

    return (
        <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
            {/* Header */}
            <div>
                <h1 className="font-heading text-2xl font-bold">{t('settings.title')}</h1>
            </div>

            {/* Language */}
            <section className="glass rounded-xl p-5 space-y-3">
                <div className="flex items-center gap-2 text-sm font-medium">
                    <span className="material-icons-round text-[16px] text-muted-foreground">language</span>
                    {t('settings.language')}
                </div>
                <div className="flex gap-3">
                    {[
                        { key: 'en', flag: '🇺🇸', label: 'English' },
                        { key: 'fil', flag: '🇵🇭', label: 'Filipino' },
                    ].map((lang) => (
                        <button
                            key={lang.key}
                            onClick={() => setLanguage(lang.key as 'en' | 'fil')}
                            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${language === lang.key
                                ? 'bg-gradient-to-br from-amber-500 to-orange-500 text-white border-0'
                                : 'bg-secondary text-muted-foreground hover:text-foreground'
                                }`}
                        >
                            <span>{lang.flag}</span>
                            {lang.label}
                        </button>
                    ))}
                </div>
            </section>

            {/* Theme */}
            <section className="glass rounded-xl p-5 space-y-3">
                <div className="flex items-center gap-2 text-sm font-medium">
                    <span className="material-icons-round text-[16px] text-muted-foreground">dark_mode</span>
                    {t('settings.theme')}
                </div>
                <div className="flex gap-2">
                    {themes.map((th) => {
                        const Icon = th.icon;
                        return (
                            <button
                                key={th.key}
                                onClick={() => setTheme(th.key)}
                                className={`flex-1 flex flex-col items-center gap-1.5 py-3 rounded-xl text-xs font-medium transition-all duration-200 ${theme === th.key
                                    ? 'bg-gradient-to-br from-amber-500 to-orange-500 text-white border-0'
                                    : 'bg-secondary text-muted-foreground hover:text-foreground'
                                    }`}
                            >
                                <span className="material-icons-round text-[16px]">{th.icon}</span>
                                {t(th.labelKey)}
                            </button>
                        );
                    })}
                </div>
            </section>

            {/* Notifications */}
            <section className="glass rounded-xl p-5 space-y-4">
                <div className="flex items-center gap-2 text-sm font-medium">
                    <span className="material-icons-round text-[16px] text-muted-foreground">notifications</span>
                    {t('settings.notifications')}
                </div>
                {[
                    { key: 'notifScheduled', default: true },
                    { key: 'notifEmergency', default: true },
                    { key: 'notifRates', default: true },
                    { key: 'notifReminders', default: false },
                ].map((notif) => (
                    <div key={notif.key} className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">
                            {t(`settings.${notif.key}`)}
                        </span>
                        <Switch defaultChecked={notif.default} aria-label={t(`settings.${notif.key}`)} />
                    </div>
                ))}
            </section>

            {/* Subscription */}
            <section className="glass rounded-xl p-5 space-y-3">
                <div className="flex items-center gap-2 text-sm font-medium">
                    <span className="material-icons-round text-[16px] text-muted-foreground">credit_card</span>
                    {t('settings.subscription')}
                </div>
                <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">{t('settings.currentPlan')}</span>
                    <Badge
                        variant="outline"
                        className={
                            tier === 'premium'
                                ? 'bg-brand/10 text-brand border-brand/20'
                                : 'bg-secondary text-muted-foreground'
                        }
                    >
                        {tier === 'premium' ? '⚡ Premium' : 'Free'}
                    </Badge>
                </div>
                {tier === 'free' && (
                    <Button
                        onClick={() => setTier('premium')}
                        className="w-full bg-gradient-to-r from-brand to-brand-secondary text-black hover:opacity-90 font-heading font-bold"
                        size="lg"
                    >
                        <span className="material-icons-round text-[16px] mr-2">electric_bolt</span>
                        {t('common.upgrade')} — ₱49/mo
                    </Button>
                )}
                {tier === 'premium' && (
                    <Button
                        onClick={() => setTier('free')}
                        variant="outline"
                        className="w-full text-xs"
                        size="sm"
                    >
                        Cancel Subscription (Demo)
                    </Button>
                )}
            </section>

            {/* About */}
            <section className="glass rounded-xl p-5 space-y-3">
                <div className="flex items-center gap-2 text-sm font-medium">
                    <span className="material-icons-round text-[16px] text-muted-foreground">info</span>
                    {t('settings.about')}
                </div>
                <div className="space-y-2 text-sm text-muted-foreground">
                    <div className="flex justify-between">
                        <span>{t('settings.version')}</span>
                        <span className="font-mono">1.0.0</span>
                    </div>
                    <p className="text-xs">{t('settings.dataSource')}</p>
                </div>
            </section>

            {/* Auth Button */}
            <Button
                onClick={() => setAuthenticated(!isAuthenticated)}
                variant={isAuthenticated ? 'destructive' : 'default'}
                className="w-full font-heading font-bold"
                size="lg"
            >
                {isAuthenticated ? (
                    <>
                        <span className="material-icons-round text-[16px] mr-2">logout</span>
                        {t('settings.signOut')}
                    </>
                ) : (
                    <>
                        <span className="material-icons-round text-[16px] mr-2">login</span>
                        {t('settings.signIn')}
                    </>
                )}
            </Button>
        </div>
    );
}
