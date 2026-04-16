'use client';

import { useState, useMemo } from 'react';
import { useAppStore } from '@/lib/store';
import { useTranslation } from '@/lib/i18n';

// SOCOTECO 2 Residential Billing Structure (Feb 2026 actual invoice)
const FIXED_CHARGES = {
    metering_retail_customer: 5.0000,
    distribution_fix_vat: 0.6000,
};

export default function CalculatorPage() {
    const { t } = useTranslation();
    const currentRate = useAppStore((s) => s.currentRate);
    const manualRate = useAppStore((s) => s.manualRate);
    const announcements = useAppStore((s) => s.announcements);
    const monitoredAreas = useAppStore((s) => s.monitoredAreas);
    const [kwhInput, setKwhInput] = useState<string>('165');
    const [targetKwhInput, setTargetKwhInput] = useState<string>('145');
    const [showDetailedBreakdown, setShowDetailedBreakdown] = useState(false);

    const kwh = parseFloat(kwhInput) || 0;
    const targetKwh = parseFloat(targetKwhInput) || 0;


    // Calculate monthly outage hours for monitored areas
    const outageImpact = useMemo(() => {
        const now = new Date();
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        const monitoredNames = monitoredAreas.map((a) => a.name);

        let totalHours = 0;
        let outageCount = 0;

        announcements.forEach((a) => {
            if (a.type !== 'scheduled' && a.type !== 'emergency') return;
            if (!a.scheduled_start || !a.scheduled_end) return;

            const start = new Date(a.scheduled_start);
            const end = new Date(a.scheduled_end);
            if (start < monthStart || end <= start) return;

            const affectsMonitored = a.affected_areas.some((aa) =>
                monitoredNames.includes(aa.barangay)
            );
            if (!affectsMonitored) return;

            const hours = (end.getTime() - start.getTime()) / 3600000;
            if (hours > 0 && hours <= 48) {
                totalHours += hours;
                outageCount++;
            }
        });

        const hourlyKwh = kwh / 720;
        const effectiveRate = manualRate ?? currentRate?.rate_per_kwh ?? 0;
        const savings = hourlyKwh * totalHours * effectiveRate;

        return { totalHours: Math.round(totalHours * 10) / 10, outageCount, savings };
    }, [announcements, monitoredAreas, kwh, currentRate, manualRate]);

    // Calculate bill for any kWh amount
    const calculateBill = (consumption: number) => {
        if (!currentRate && manualRate === null) return null;

        const effectiveTotalRate = manualRate ?? currentRate?.rate_per_kwh ?? 0;
        const scale = (manualRate !== null && currentRate)
            ? manualRate / currentRate.rate_per_kwh
            : 1;

        const o = (currentRate?.others ?? {}) as any;


        const generationSystem = (o.generation_system ?? 5.7296) * consumption * scale;
        const pwract = (o.pwract_residential ?? -0.1737) * consumption * scale;
        const transmissionSystem = (o.transmission_system ?? 0.5745) * consumption * scale;
        const systemLoss = (o.system_loss ?? o.system_loss_total ?? 0.7730) * consumption * scale;
        const genTransSubtotal = generationSystem + pwract + transmissionSystem + systemLoss;

        const distributionSystem = (o.distribution_system ?? 0.2748) * consumption * scale;
        const supplySystem = (o.supply_system ?? 0.4140) * consumption * scale;
        const meteringRetail = FIXED_CHARGES.metering_retail_customer * scale;
        const meteringSupply = (o.metering_supply_system ?? 0.3460) * consumption * scale;
        const distributionSubtotal = distributionSystem + supplySystem + meteringRetail + meteringSupply;

        const reinvestmentFund = (o.reinvestment_fund ?? 0.1518) * consumption * scale;

        const scDiscount = (o.sc_discount_subsidy ?? 0.0007) * consumption * scale;
        const lifelineRate = (o.lifeline_rate_subsidy ?? 0.0001) * consumption * scale;
        const otherChargesSubtotal = scDiscount + lifelineRate;

        const missionaryElec = (o.missionary_elec ?? 0.2763) * consumption * scale;
        const environmentalShare = (o.environmental_share ?? 0.0025) * consumption * scale;
        const npcStrandedDebts = (o.npc_stranded_debts ?? 0.0428) * consumption * scale;
        const geaRenewable = (o.gea_all_renewable ?? 0.0371) * consumption * scale;
        const fitAll = (o.fit_all ?? 0.2011) * consumption * scale;
        const universalSubtotal = missionaryElec + environmentalShare + npcStrandedDebts + geaRenewable + fitAll;

        const generationVat = (o.generation_vat ?? 0.6059) * consumption * scale;
        const transmissionVat = (o.transmission_vat ?? 0.0671) * consumption * scale;
        const systemLossVat = (o.system_loss_vat ?? 0.0861) * consumption * scale;
        const distributionFixVat = FIXED_CHARGES.distribution_fix_vat * scale;
        const distributionDemandVat = (o.distribution_system_demand_vat ?? 0.1242) * consumption * scale;
        const vatSubtotal = generationVat + transmissionVat + systemLossVat + distributionFixVat + distributionDemandVat;

        const total = genTransSubtotal + distributionSubtotal + reinvestmentFund + otherChargesSubtotal + universalSubtotal + vatSubtotal;

        return {
            total,
            effectiveRate: effectiveTotalRate,
            genTransSubtotal,
            distributionSubtotal: distributionSubtotal + reinvestmentFund,
            otherChargesSubtotal,
            universalSubtotal,
            vatSubtotal,
            details: {
                generationSystem, pwract, transmissionSystem, systemLoss,
                distributionSystem, supplySystem, meteringRetail, meteringSupply, reinvestmentFund,
                scDiscount, lifelineRate,
                missionaryElec, environmentalShare, npcStrandedDebts, geaRenewable, fitAll,
                generationVat, transmissionVat, systemLossVat, distributionFixVat, distributionDemandVat,
            },
        };
    };

    const result = useMemo(() => calculateBill(kwh), [currentRate, manualRate, kwh]);
    const targetResult = useMemo(() => calculateBill(targetKwh), [currentRate, manualRate, targetKwh]);

    const formatPeso = (val: number) => `₱${Math.abs(val).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

    // Compute savings between current and target
    const savingsAmount = result && targetResult ? result.total - targetResult.total : 0;
    const savingsPercent = result && result.total > 0 ? Math.round((savingsAmount / result.total) * 100) : 0;

    // Ring percentage (target vs current)
    const ringPercent = kwh > 0 ? Math.round((targetKwh / kwh) * 100) : 0;

    // Bar percentages for cost distribution
    const genTransPercent = result && result.total > 0 ? Math.round((result.genTransSubtotal / result.total) * 100) : 0;
    const distPercent = result && result.total > 0 ? Math.round((result.distributionSubtotal / result.total) * 100) : 0;
    const taxOtherPercent = result && result.total > 0 ? Math.round(((result.universalSubtotal + result.vatSubtotal + result.otherChargesSubtotal) / result.total) * 100) : 0;

    const sliderPercent = targetKwh / 500 * 100;

    return (
        <div className="max-w-2xl mx-auto space-y-5 animate-fade-in pb-8">
            {/* Hero Card — Estimated Bill */}
            {result && (
                <section className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-gray-900 to-gray-950 p-6 text-white shadow-xl">
                    <div className="relative z-10 flex items-center justify-between">
                        <div className="space-y-1">
                            <div className="flex items-center gap-2">
                                <p className="text-[10px] font-bold text-amber-400 uppercase tracking-widest">Estimated Bill</p>
                                {manualRate !== null && (
                                    <span className="bg-amber-500 text-[8px] font-black text-gray-950 px-1.5 py-0.5 rounded-sm">MANUAL RATE</span>
                                )}
                            </div>
                            <h2 className="text-4xl font-extrabold tracking-tighter">{formatPeso(result.total)}</h2>
                            {savingsAmount > 0 && (
                                <div className="flex items-center gap-1.5 text-emerald-400 text-xs font-bold">
                                    <span className="material-icons-round text-sm">trending_down</span>
                                    -{formatPeso(savingsAmount)} ({savingsPercent}%) if target met
                                </div>
                            )}
                            <p className="text-[10px] text-white/40 mt-1">{kwh} kWh × ₱{result.effectiveRate.toFixed(4)}/kWh</p>
                        </div>

                        <div className="w-16 h-16 relative shrink-0">
                            <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                                <circle className="stroke-white/10" cx="18" cy="18" fill="none" r="16" strokeWidth="3" />
                                <circle className="stroke-amber-500 transition-all duration-500" cx="18" cy="18" fill="none" r="16"
                                    strokeDasharray={`${ringPercent} 100`} strokeWidth="3" strokeLinecap="round" />
                            </svg>
                            <div className="absolute inset-0 flex items-center justify-center">
                                <span className="text-[10px] font-bold">{ringPercent}%</span>
                            </div>
                        </div>
                    </div>
                    {/* Dot pattern overlay */}
                    <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '16px 16px' }}></div>
                </section>
            )}

            {/* Consumption Adjustment */}
            <section className="bg-white rounded-[2rem] p-5 shadow-soft border border-white/60">
                <div className="flex items-center justify-between mb-5">
                    <h3 className="font-bold text-sm uppercase tracking-wide text-gray-400">Consumption Adjustment</h3>
                    <span className="material-icons-round text-amber-500 text-xl">tune</span>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-5">
                    {/* Current Usage */}
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-gray-400 uppercase px-1">Current usage</label>
                        <div className="relative">
                            <input
                                type="number"
                                value={kwhInput}
                                onChange={(e) => setKwhInput(e.target.value)}
                                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-3 text-lg font-bold text-gray-700 focus:ring-amber-500 focus:border-amber-500 outline-none"
                                min={0}
                                aria-label="Current kWh usage"
                            />
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-gray-400">kWh</span>
                        </div>
                    </div>
                    {/* Target Usage */}
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-amber-500 uppercase px-1">Target usage</label>
                        <div className="relative">
                            <input
                                type="number"
                                value={targetKwhInput}
                                onChange={(e) => setTargetKwhInput(e.target.value)}
                                className="w-full bg-amber-50 border border-amber-200/50 rounded-xl px-3 py-3 text-lg font-bold text-amber-600 focus:ring-amber-500 focus:border-amber-500 outline-none"
                                min={0}
                                aria-label="Target kWh usage"
                            />
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-amber-300">kWh</span>
                        </div>
                    </div>
                </div>

                {/* Slider */}
                <div className="relative h-6 flex items-center mb-2">
                    <div className="absolute w-full h-2 bg-gray-100 rounded-full"></div>
                    <div className="absolute h-2 bg-amber-500/30 rounded-full" style={{ width: `${kwh / 500 * 100}%` }}></div>
                    <div className="absolute h-2 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full" style={{ width: `${sliderPercent}%` }}></div>
                    <input
                        type="range"
                        min={0}
                        max={500}
                        value={targetKwh}
                        onChange={(e) => setTargetKwhInput(e.target.value)}
                        className="absolute w-full h-6 opacity-0 cursor-pointer z-10"
                        aria-label="Target consumption slider"
                    />

                    <div
                        className="absolute -translate-x-1/2 w-6 h-6 bg-white border-2 border-amber-500 rounded-full shadow-lg z-[5] pointer-events-none"
                        style={{ left: `${sliderPercent}%` }}
                    ></div>
                </div>
                <div className="flex justify-between text-[10px] font-medium text-gray-400">
                    <span>0 kWh</span>
                    <span>Target: {targetKwh} kWh</span>
                    <span>500 kWh</span>
                </div>
            </section>

            {/* Visual Cost Distribution */}
            {result && (
                <section className="space-y-3">
                    <div className="flex items-center justify-between px-1">
                        <h3 className="font-bold text-sm uppercase tracking-wide text-gray-400">Cost Distribution</h3>
                        <button
                            onClick={() => setShowDetailedBreakdown(!showDetailedBreakdown)}
                            className="text-xs font-bold text-amber-500 flex items-center gap-1"
                        >
                            {showDetailedBreakdown ? 'HIDE' : 'FULL REPORT'}
                            <span className="material-icons-round text-sm">{showDetailedBreakdown ? 'expand_less' : 'open_in_new'}</span>
                        </button>
                    </div>

                    <div className="bg-white rounded-[2rem] shadow-soft border border-white/60 overflow-hidden">
                        {/* Progress Bars */}
                        <div className="p-5 space-y-4">
                            {[
                                { label: 'Gen & Trans', value: result.genTransSubtotal, percent: genTransPercent, color: 'bg-gradient-to-r from-amber-500 to-orange-500' },
                                { label: 'Distribution', value: result.distributionSubtotal, percent: distPercent, color: 'bg-orange-400' },
                                { label: 'Taxes & Others', value: result.universalSubtotal + result.vatSubtotal + result.otherChargesSubtotal, percent: taxOtherPercent, color: 'bg-gray-400' },
                            ].map((item) => (
                                <div key={item.label} className="space-y-1.5">
                                    <div className="flex justify-between text-xs">
                                        <span className="text-gray-500">{item.label}</span>
                                        <span className="font-bold text-gray-800">{formatPeso(item.value)} ({item.percent}%)</span>
                                    </div>
                                    <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                                        <div className={`h-full ${item.color} rounded-full transition-all duration-500`} style={{ width: `${item.percent}%` }}></div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Expandable Line Items */}
                        <div className="divide-y divide-gray-100 bg-gray-50/50">
                            <button className="w-full flex justify-between p-4 items-center text-xs hover:bg-gray-100/50 transition-colors">
                                <span className="text-gray-500">Universal Charges</span>
                                <span className="font-semibold text-gray-800">{formatPeso(result.universalSubtotal)}</span>
                            </button>
                            <button className="w-full flex justify-between p-4 items-center text-xs hover:bg-gray-100/50 transition-colors">
                                <span className="text-gray-500">Value Added Tax</span>
                                <span className="font-semibold text-gray-800">{formatPeso(result.vatSubtotal)}</span>
                            </button>
                        </div>
                    </div>

                    {/* Detailed Breakdown */}
                    {showDetailedBreakdown && (
                        <div className="bg-white rounded-[2rem] shadow-soft border border-white/60 p-5 space-y-4 text-xs animate-slide-up">
                            {[
                                {
                                    title: 'Generation & Transmission', rows: [
                                        { label: 'Generation System', value: result.details.generationSystem },
                                        { label: 'PWRACT (Residential)', value: result.details.pwract },
                                        { label: 'Transmission System', value: result.details.transmissionSystem },
                                        { label: 'System Loss', value: result.details.systemLoss },
                                    ]
                                },
                                {
                                    title: 'Distribution Revenues', rows: [
                                        { label: 'Distribution System', value: result.details.distributionSystem },
                                        { label: 'Supply System', value: result.details.supplySystem },
                                        { label: 'Metering Retail (fixed)', value: result.details.meteringRetail },
                                        { label: 'Metering Supply System', value: result.details.meteringSupply },
                                        { label: 'Reinvestment Fund', value: result.details.reinvestmentFund },
                                    ]
                                },
                                {
                                    title: 'Universal Charges', rows: [
                                        { label: 'Missionary Elec.', value: result.details.missionaryElec },
                                        { label: 'Environmental Share', value: result.details.environmentalShare },
                                        { label: 'NPC Stranded Debts', value: result.details.npcStrandedDebts },
                                        { label: 'GEA-ALL (Renewable)', value: result.details.geaRenewable },
                                        { label: 'FIT-ALL', value: result.details.fitAll },
                                    ]
                                },
                                {
                                    title: 'Value Added Tax', rows: [
                                        { label: 'Generation VAT', value: result.details.generationVat },
                                        { label: 'Transmission VAT', value: result.details.transmissionVat },
                                        { label: 'System Loss VAT', value: result.details.systemLossVat },
                                        { label: 'Distribution Fix VAT (fixed)', value: result.details.distributionFixVat },
                                        { label: 'Distribution Demand VAT', value: result.details.distributionDemandVat },
                                    ]
                                },
                            ].map((section) => (
                                <div key={section.title} className="space-y-1.5">
                                    <p className="font-bold text-gray-500 text-[10px] uppercase tracking-wider">{section.title}</p>
                                    {section.rows.map((row) => (
                                        <div key={row.label} className="flex justify-between text-gray-500 pl-2">
                                            <span>{row.label}</span>
                                            <span className="font-mono text-gray-800">{row.value < 0 ? `(${formatPeso(row.value)})` : formatPeso(row.value)}</span>
                                        </div>
                                    ))}
                                </div>
                            ))}
                            <div className="flex items-center justify-between font-bold pt-3 border-t border-gray-200 text-sm">
                                <span className="text-gray-800">Total Bill</span>
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-orange-500">{formatPeso(result.total)}</span>
                            </div>
                        </div>
                    )}
                </section>
            )}

            {/* Downtime Credit */}
            {outageImpact.totalHours > 0 && result && (
                <section className="bg-emerald-50/50 rounded-[2rem] p-4 shadow-soft border border-emerald-100 flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center shrink-0">
                        <span className="material-icons-round text-emerald-600 text-xl">verified</span>
                    </div>
                    <div className="flex-1 min-w-0">
                        <h4 className="text-xs font-bold text-gray-800">Downtime Credit</h4>
                        <p className="text-[10px] text-gray-500">{outageImpact.totalHours}h system unavailability ({outageImpact.outageCount} outage{outageImpact.outageCount !== 1 ? 's' : ''})</p>
                    </div>
                    <div className="text-right shrink-0">
                        <p className="text-sm font-bold text-emerald-600">-{formatPeso(outageImpact.savings)}</p>
                    </div>
                </section>
            )}

            {/* Energy Saving Tip */}
            <section className="bg-white rounded-[2rem] p-4 shadow-soft border border-white/60">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-amber-100 rounded-xl shrink-0">
                        <span className="material-icons-round text-amber-500 text-lg">ac_unit</span>
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-gray-800">{t('calculator.tips.tip3title')}</p>
                        <p className="text-[10px] text-gray-500 italic truncate">{t('calculator.tips.tip3')}</p>
                    </div>
                </div>
            </section>

            {/* More Tips */}
            <section className="space-y-3">
                <h3 className="font-bold text-sm uppercase tracking-wide text-gray-400 px-1">Energy Tips</h3>
                {[
                    { icon: 'power', titleKey: 'calculator.tips.tip1title', key: 'calculator.tips.tip1' },
                    { icon: 'lightbulb', titleKey: 'calculator.tips.tip2title', key: 'calculator.tips.tip2' },
                ].map((tip, i) => (
                    <div key={i} className="bg-white rounded-[2rem] p-4 shadow-soft border border-white/60 flex gap-3">
                        <div className="w-10 h-10 rounded-xl bg-teal-500/10 flex items-center justify-center shrink-0">
                            <span className="material-icons-round text-teal-500 text-xl">{tip.icon}</span>
                        </div>
                        <div>
                            <p className="text-xs font-bold text-gray-800">{t(tip.titleKey)}</p>
                            <p className="text-[10px] text-gray-500 mt-0.5 leading-relaxed">{t(tip.key)}</p>
                        </div>
                    </div>
                ))}
            </section>
        </div>
    );
}
