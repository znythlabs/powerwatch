'use client';

import { useEffect, useState } from 'react';
import { useTranslation } from '@/lib/i18n';

interface CountdownTimerProps {
    targetDate: string;
    compact?: boolean;
    label?: string;
}

interface TimeLeft {
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
    expired: boolean;
}

function calcTimeLeft(target: string): TimeLeft {
    const diff = new Date(target).getTime() - Date.now();
    if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0, expired: true };

    return {
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((diff / (1000 * 60)) % 60),
        seconds: Math.floor((diff / 1000) % 60),
        expired: false,
    };
}

function pad(n: number): string {
    return n.toString().padStart(2, '0');
}

export function CountdownTimer({ targetDate, compact = false, label }: CountdownTimerProps) {
    const [time, setTime] = useState<TimeLeft>(calcTimeLeft(targetDate));
    const { t } = useTranslation();

    useEffect(() => {
        const interval = setInterval(() => {
            setTime(calcTimeLeft(targetDate));
        }, 1000);
        return () => clearInterval(interval);
    }, [targetDate]);

    if (time.expired) return null;

    if (compact) {
        return (
            <div className="flex items-center gap-2">
                {label && <span className="text-xs font-medium text-muted-foreground truncate max-w-[100px]">{label}</span>}
                <span className="font-mono text-sm font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-orange-500">
                    {time.days > 0 && `${time.days}d `}{pad(time.hours)}:{pad(time.minutes)}:{pad(time.seconds)}
                </span>
            </div>
        );
    }

    const blocks = [
        { value: time.days, label: t('dashboard.days') },
        { value: time.hours, label: t('dashboard.hours') },
        { value: time.minutes, label: t('dashboard.minutes') },
        { value: time.seconds, label: t('dashboard.seconds') },
    ];

    return (
        <div className="grid grid-cols-4 gap-2 w-full" role="timer" aria-label="Brownout countdown">
            {blocks.map((block, i) => {
                const isSeconds = i === 3;
                return (
                    <div key={block.label} className="flex flex-col items-center">
                        <div className={`bg-gray-900 w-full aspect-square rounded-2xl flex items-center justify-center text-2xl font-bold shadow-md relative overflow-hidden ${isSeconds ? 'border border-orange-500/20' : ''}`}>
                            {isSeconds ? (
                                <span className="text-transparent bg-clip-text bg-gradient-to-br from-amber-200 to-orange-500">{pad(block.value)}</span>
                            ) : (
                                <span className="text-white">{pad(block.value)}</span>
                            )}
                            <div className="absolute inset-x-0 bottom-0 h-1/2 bg-white/5 pointer-events-none"></div>
                        </div>
                        <span className="text-[10px] font-semibold text-gray-400 mt-2 uppercase tracking-wide">
                            {block.label}
                        </span>
                    </div>
                );
            })}
        </div>
    );
}
