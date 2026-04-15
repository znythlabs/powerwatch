'use client';

import { useMemo } from 'react';
import { useAppStore } from '@/lib/store';
import { useTranslation } from '@/lib/i18n';
import { Badge } from '@/components/ui/badge';
import {
    ResponsiveContainer,
    LineChart,
    Line,
    XAxis,
    YAxis,
    Tooltip,
    CartesianGrid,
} from 'recharts';

export default function RatesPage() {
    const { t } = useTranslation();
    const currentRate = useAppStore((s) => s.currentRate);
    const rateHistory = useAppStore((s) => s.rateHistory);

    const rateChange = currentRate?.previous_rate
        ? currentRate.rate_per_kwh - currentRate.previous_rate
        : null;

    const chartData = useMemo(
        () =>
            rateHistory.map((r) => ({
                date: new Date(r.effective_date).toLocaleDateString('en-PH', {
                    month: 'short',
                    year: '2-digit',
                }),
                rate: r.rate_per_kwh,
            })),
        [rateHistory]
    );

    return (
        <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
            {/* Header */}
            <div>
                <h1 className="font-heading text-2xl font-bold">{t('rates.title')}</h1>
                <p className="text-sm text-muted-foreground mt-1">{t('rates.subtitle')}</p>
            </div>

            {/* Current Rate Card */}
            <div className="glass rounded-xl p-6 animate-pulse-brand">
                <div className="flex items-center justify-between">
                    <div className="space-y-1">
                        <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">
                            {t('rates.current')}
                        </p>
                        <p className="font-heading text-4xl font-bold text-brand">
                            ₱{currentRate?.rate_per_kwh?.toFixed(2) ?? '—'}
                        </p>
                        <p className="text-xs text-muted-foreground">
                            {t('rates.effective')}{' '}
                            {currentRate?.effective_date
                                ? new Date(currentRate.effective_date).toLocaleDateString('en-PH', {
                                    month: 'long',
                                    day: 'numeric',
                                    year: 'numeric',
                                })
                                : '—'}
                        </p>
                    </div>

                    <div className="flex flex-col items-end gap-2">
                        <div className="w-14 h-14 rounded-2xl bg-brand/10 flex items-center justify-center">
                            <span className="material-icons-round text-[28px] text-brand">bar_chart</span>
                        </div>
                        {rateChange !== null && (
                            <Badge
                                variant="outline"
                                className={`text-xs font-medium ${rateChange > 0
                                    ? 'bg-status-danger/10 text-status-danger border-status-danger/20'
                                    : 'bg-status-clear/10 text-status-clear border-status-clear/20'
                                    }`}
                            >
                                {rateChange > 0 ? <span className="material-icons-round text-[12px] mr-1">trending_up</span> : <span className="material-icons-round text-[12px] mr-1">trending_down</span>}
                                {rateChange > 0 ? '+' : ''}₱{rateChange.toFixed(2)}
                            </Badge>
                        )}
                    </div>
                </div>
            </div>

            {/* Rate History Chart */}
            <div className="glass rounded-xl p-5 space-y-4">
                <h2 className="font-heading text-base font-bold">{t('rates.history')}</h2>
                <div className="h-[250px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={chartData} margin={{ top: 5, right: 10, bottom: 5, left: -10 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.1)" />
                            <XAxis
                                dataKey="date"
                                tick={{ fontSize: 10, fill: '#64748B' }}
                                axisLine={{ stroke: 'rgba(148,163,184,0.1)' }}
                                tickLine={false}
                            />
                            <YAxis
                                tick={{ fontSize: 10, fill: '#64748B' }}
                                axisLine={{ stroke: 'rgba(148,163,184,0.1)' }}
                                tickLine={false}
                                domain={['auto', 'auto']}
                                tickFormatter={(v) => `₱${v}`}
                            />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: '#12121A',
                                    border: '1px solid rgba(148,163,184,0.1)',
                                    borderRadius: '12px',
                                    fontSize: '12px',
                                    color: '#F1F5F9',
                                }}
                                formatter={(value) => [`₱${Number(value ?? 0).toFixed(2)}`, 'Rate']}
                                labelStyle={{ color: '#64748B' }}
                            />
                            <Line
                                type="monotone"
                                dataKey="rate"
                                stroke="#FACC15"
                                strokeWidth={2.5}
                                dot={{ fill: '#FACC15', r: 4, strokeWidth: 0 }}
                                activeDot={{ fill: '#FACC15', r: 6, strokeWidth: 2, stroke: '#0A0A0F' }}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Rate Breakdown */}
            {currentRate && (
                <div className="glass rounded-xl p-5 space-y-3">
                    <h2 className="font-heading text-base font-bold">{t('rates.breakdown')}</h2>
                    <div className="space-y-2">
                        {[
                            { label: t('calculator.generation'), value: currentRate.generation_charge },
                            { label: t('calculator.transmission'), value: currentRate.transmission_charge },
                            { label: t('calculator.distribution'), value: currentRate.distribution_charge },
                            { label: t('calculator.vat'), value: currentRate.others.vat },
                            { label: t('calculator.systemLoss'), value: currentRate.others.system_loss },
                            { label: t('calculator.universal'), value: currentRate.others.universal_charges },
                        ].map((item) => {
                            const pct = ((item.value / currentRate.rate_per_kwh) * 100).toFixed(1);
                            return (
                                <div key={item.label} className="space-y-1">
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-muted-foreground">{item.label}</span>
                                        <span className="font-mono text-xs">₱{item.value.toFixed(2)} ({pct}%)</span>
                                    </div>
                                    <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-brand/60 rounded-full transition-all duration-500"
                                            style={{ width: `${pct}%` }}
                                        />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}
