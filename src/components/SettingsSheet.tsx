'use client';

import { useState, useEffect } from 'react';
import { useAppStore } from '@/lib/store';
import { useTranslation } from '@/lib/i18n';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import type { ThemeMode } from '@/lib/types';

const themes: { key: ThemeMode; icon: string; labelKey: string }[] = [
    { key: 'dark', icon: 'dark_mode', labelKey: 'settings.dark' },
    { key: 'light', icon: 'light_mode', labelKey: 'settings.light' },
    { key: 'system', icon: 'desktop_windows', labelKey: 'settings.system' },
];

interface SettingsSheetProps {
    open: boolean;
    onClose: () => void;
}

export function SettingsSheet({ open, onClose }: SettingsSheetProps) {
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

    // Close on escape key
    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        if (open) document.addEventListener('keydown', handleEsc);
        return () => document.removeEventListener('keydown', handleEsc);
    }, [open, onClose]);

    // Prevent body scroll when open
    useEffect(() => {
        if (open) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => { document.body.style.overflow = ''; };
    }, [open]);

    if (!open) return null;

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 animate-fade-in"
                onClick={onClose}
                aria-hidden="true"
            />

            {/* Sheet */}
            <div className="fixed inset-x-0 bottom-0 z-50 animate-slide-up max-h-[85vh] flex flex-col">
                <div className="max-w-lg mx-auto w-full bg-white rounded-t-[2rem] shadow-2xl flex flex-col max-h-[85vh]">
                    {/* Handle + Header (sticky) */}
                    <div className="px-6 pt-5 pb-3 shrink-0">
                        <div className="flex justify-center mb-4">
                            <div className="w-10 h-1 rounded-full bg-gray-300"></div>
                        </div>
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-bold text-gray-900">{t('settings.title')}</h2>
                            <button
                                onClick={onClose}
                                className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 transition-colors"
                                aria-label="Close settings"
                            >
                                <span className="material-icons-round text-[18px]">close</span>
                            </button>
                        </div>
                    </div>

                    {/* Scrollable content */}
                    <div className="overflow-y-auto flex-1 px-6 pb-28 space-y-5 hide-scrollbar">
                        {/* Language */}
                        <section className="bg-gray-50 rounded-2xl p-4 space-y-3">
                            <div className="flex items-center gap-2 text-sm font-semibold text-gray-500">
                                <span className="material-icons-round text-[16px]">language</span>
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
                                        className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl text-sm font-semibold transition-all duration-200 ${language === lang.key
                                            ? 'bg-gradient-to-br from-amber-500 to-orange-500 text-white shadow-lg shadow-orange-500/20'
                                            : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-100'
                                            }`}
                                        aria-pressed={language === lang.key}
                                    >
                                        <span className="text-base">{lang.flag}</span>
                                        {lang.label}
                                    </button>
                                ))}
                            </div>
                        </section>

                        {/* Theme */}
                        <section className="bg-gray-50 rounded-2xl p-4 space-y-3">
                            <div className="flex items-center gap-2 text-sm font-semibold text-gray-500">
                                <span className="material-icons-round text-[16px]">palette</span>
                                {t('settings.theme')}
                            </div>
                            <div className="flex gap-2">
                                {themes.map((th) => (
                                    <button
                                        key={th.key}
                                        onClick={() => setTheme(th.key)}
                                        className={`flex-1 flex flex-col items-center gap-1.5 py-3 rounded-2xl text-xs font-semibold transition-all duration-200 ${theme === th.key
                                            ? 'bg-gradient-to-br from-amber-500 to-orange-500 text-white shadow-lg shadow-orange-500/20'
                                            : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-100'
                                            }`}
                                        aria-pressed={theme === th.key}
                                    >
                                        <span className="material-icons-round text-[18px]">{th.icon}</span>
                                        {t(th.labelKey)}
                                    </button>
                                ))}
                            </div>
                        </section>

                        {/* Notifications */}
                        <section className="bg-gray-50 rounded-2xl p-4 space-y-4">
                            <div className="flex items-center gap-2 text-sm font-semibold text-gray-500">
                                <span className="material-icons-round text-[16px]">notifications</span>
                                {t('settings.notifications')}
                            </div>
                            {[
                                { key: 'notifScheduled', default: true },
                                { key: 'notifEmergency', default: true },
                                { key: 'notifRates', default: true },
                                { key: 'notifReminders', default: false },
                            ].map((notif) => (
                                <div key={notif.key} className="flex items-center justify-between">
                                    <span className="text-sm text-gray-600">
                                        {t(`settings.${notif.key}`)}
                                    </span>
                                    <Switch defaultChecked={notif.default} aria-label={t(`settings.${notif.key}`)} />
                                </div>
                            ))}
                        </section>

                        {/* Subscription */}
                        <section className="bg-gray-50 rounded-2xl p-4 space-y-3">
                            <div className="flex items-center gap-2 text-sm font-semibold text-gray-500">
                                <span className="material-icons-round text-[16px]">credit_card</span>
                                {t('settings.subscription')}
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600">{t('settings.currentPlan')}</span>
                                <Badge
                                    variant="outline"
                                    className={
                                        tier === 'premium'
                                            ? 'bg-gradient-to-br from-amber-500 to-orange-500 text-white border-0'
                                            : 'bg-white text-gray-500 border-gray-200'
                                    }
                                >
                                    {tier === 'premium' ? '⚡ Premium' : 'Free'}
                                </Badge>
                            </div>
                            {tier === 'free' && (
                                <button
                                    onClick={() => setTier('premium')}
                                    className="w-full py-3 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 text-white font-bold text-sm shadow-lg shadow-orange-500/20 hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
                                >
                                    <span className="material-icons-round text-[16px]">electric_bolt</span>
                                    {t('common.upgrade')} — ₱49/mo
                                </button>
                            )}
                            {tier === 'premium' && (
                                <button
                                    onClick={() => setTier('free')}
                                    className="w-full py-2.5 rounded-2xl border border-gray-200 text-gray-500 text-xs font-medium hover:bg-gray-100 transition-colors"
                                >
                                    Cancel Subscription (Demo)
                                </button>
                            )}
                        </section>

                        {/* About */}
                        <section className="bg-gray-50 rounded-2xl p-4 space-y-3">
                            <div className="flex items-center gap-2 text-sm font-semibold text-gray-500">
                                <span className="material-icons-round text-[16px]">info</span>
                                {t('settings.about')}
                            </div>
                            <div className="space-y-2 text-sm text-gray-600">
                                <div className="flex justify-between">
                                    <span>{t('settings.version')}</span>
                                    <span className="font-mono text-gray-900">1.0.0</span>
                                </div>
                                <p className="text-xs text-gray-400">{t('settings.dataSource')}</p>
                            </div>
                        </section>

                        {/* Auth Button */}
                        <button
                            onClick={() => setAuthenticated(!isAuthenticated)}
                            className={`w-full py-3.5 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition-all ${isAuthenticated
                                ? 'bg-red-50 text-red-600 border border-red-100 hover:bg-red-100'
                                : 'bg-gradient-to-br from-amber-500 to-orange-500 text-white shadow-lg shadow-orange-500/20 hover:opacity-90'
                                }`}
                        >
                            <span className="material-icons-round text-[18px]">
                                {isAuthenticated ? 'logout' : 'login'}
                            </span>
                            {isAuthenticated ? t('settings.signOut') : t('settings.signIn')}
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}
