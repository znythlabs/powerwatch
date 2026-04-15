'use client';

import type { AlertStatus } from '@/lib/types';
import { useTranslation } from '@/lib/i18n';

interface StatusHeroProps {
    status: AlertStatus;
    countdownText?: string;
    restorationTime?: string;
}

const statusConfig = {
    clear: {
        icon: 'check_circle',
        gradient: 'from-status-clear/5 via-transparent to-transparent',
        iconColor: 'text-status-clear',
        animClass: 'animate-pulse-green',
        iconBg: 'bg-status-clear/10',
    },
    warning: {
        icon: 'warning',
        gradient: 'from-status-warning/10 via-transparent to-transparent',
        iconColor: 'text-status-warning',
        animClass: 'animate-pulse-amber',
        iconBg: 'bg-status-warning/10',
    },
    danger: {
        icon: 'electric_bolt',
        gradient: 'from-status-danger/10 via-transparent to-transparent',
        iconColor: 'text-status-danger',
        animClass: 'animate-pulse-red',
        iconBg: 'bg-status-danger/10',
    },
};

export function StatusHero({ status, countdownText, restorationTime }: StatusHeroProps) {
    const { t } = useTranslation();
    const config = statusConfig[status];
    const Icon = config.icon;

    const titleKey = `dashboard.${status === 'clear' ? 'clear' : status === 'warning' ? 'warning' : 'danger'}`;
    const subKey = `dashboard.${status === 'clear' ? 'clearSub' : status === 'warning' ? 'warningSub' : 'dangerSub'}`;

    return (
        <div
            className={`relative overflow-hidden rounded-2xl p-6 md:p-8 bg-gradient-to-br ${config.gradient} ${config.animClass}`}
            role="status"
            aria-live="polite"
        >
            {/* Decorative background circles */}
            <div className="absolute -right-8 -top-8 w-40 h-40 rounded-full bg-gradient-to-br from-transparent to-current opacity-[0.03]" />
            <div className="absolute -left-4 -bottom-4 w-24 h-24 rounded-full bg-gradient-to-br from-transparent to-current opacity-[0.03]" />

            <div className="flex flex-col items-center text-center gap-4 relative z-10">
                <div className={`w-16 h-16 rounded-2xl ${config.iconBg} flex items-center justify-center`}>
                    <span className={`material-icons-round text-[32px] ${config.iconColor}`}>{Icon}</span>
                </div>

                <div>
                    <h1 className="font-heading text-2xl md:text-3xl font-bold">
                        {t(titleKey)}
                        {status === 'warning' && countdownText && (
                            <span className="text-status-warning"> {countdownText}</span>
                        )}
                    </h1>
                    <p className="text-muted-foreground text-sm mt-1.5">{t(subKey)}</p>
                </div>

                {status === 'danger' && restorationTime && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground bg-secondary/50 px-4 py-2 rounded-xl">
                        <span>{t('dashboard.restorationEta')}:</span>
                        <span className="font-medium text-foreground">{restorationTime}</span>
                    </div>
                )}
            </div>
        </div>
    );
}
