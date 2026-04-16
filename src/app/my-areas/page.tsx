'use client';

import { useState, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAppStore } from '@/lib/store';
import { useTranslation } from '@/lib/i18n';
import type { Barangay } from '@/lib/types';
import { CountdownTimer } from '@/components/CountdownTimer';

export default function MyAreasPage() {
    const { t } = useTranslation();
    const monitoredAreas = useAppStore((s) => s.monitoredAreas);
    const allBarangays = useAppStore((s) => s.allBarangays);
    const addArea = useAppStore((s) => s.addArea);
    const removeArea = useAppStore((s) => s.removeArea);
    const tier = useAppStore((s) => s.tier);
    const announcements = useAppStore((s) => s.announcements);
    const [searchQuery, setSearchQuery] = useState('');
    const [dialogOpen, setDialogOpen] = useState(false);
    const [showPremium, setShowPremium] = useState(false);

    const maxAreas = tier === 'premium' ? 10 : 1;
    const canAdd = monitoredAreas.length < maxAreas;

    const filteredBarangays = useMemo(() => {
        const q = searchQuery.toLowerCase();
        return allBarangays
            .filter((b) => !monitoredAreas.some((m) => m.id === b.id))
            .filter((b) => !q || b.name.toLowerCase().includes(q) || b.district.toLowerCase().includes(q));
    }, [allBarangays, monitoredAreas, searchQuery]);

    const groupedBarangays = useMemo(() => {
        const groups: Record<string, Barangay[]> = {};
        filteredBarangays.forEach((b) => {
            if (!groups[b.district]) groups[b.district] = [];
            groups[b.district].push(b);
        });
        return groups;
    }, [filteredBarangays]);

    const handleAdd = (barangay: Barangay) => {
        addArea(barangay);
        setDialogOpen(false);
        setSearchQuery('');
    };

    const handleAddClick = () => {
        if (canAdd) {
            setDialogOpen(true);
        } else {
            setShowPremium(true);
        }
    };

    // Get per-area next brownout
    function getAreaNextBrownout(areaName: string) {
        const now = Date.now();
        return announcements
            .filter(
                (a) =>
                    (a.type === 'scheduled' || a.type === 'emergency') &&
                    a.affected_areas.some((aa) => aa.barangay === areaName) &&
                    new Date(a.scheduled_start).getTime() > now
            )
            .sort((a, b) => new Date(a.scheduled_start).getTime() - new Date(b.scheduled_start).getTime())[0];
    }

    return (
        <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
            {/* Header */}
            <div>
                <h1 className="font-heading text-2xl font-bold text-slate-900">{t('areas.title')}</h1>
                <p className="text-sm text-slate-500 mt-1 font-medium">{t('areas.subtitle')}</p>
            </div>

            {/* Area Count */}
            <div className="flex items-center justify-between">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    {t('areas.areasCount')
                        .replace('{count}', monitoredAreas.length.toString())
                        .replace('{max}', maxAreas.toString())}
                </p>
                <Badge variant="secondary" className="text-[10px] bg-slate-100 text-slate-500 border-0 font-bold px-2 py-0.5">
                    {tier === 'premium' ? t('areas.premium') : t('areas.free').toUpperCase()}
                </Badge>
            </div>

            {/* Area List */}
            {monitoredAreas.length > 0 ? (
                <div className="space-y-4">
                    {monitoredAreas.map((area) => {
                        const nextBrownout = getAreaNextBrownout(area.name);
                        return (
                            <div
                                key={area.id}
                                className="bg-white rounded-3xl p-5 shadow-soft border border-white/60 animate-slide-up"
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500/10 to-orange-500/10 flex items-center justify-center">
                                            <span className="material-icons-round text-[24px] text-amber-500">location_on</span>
                                        </div>
                                        <div>
                                            <p className="font-heading font-extrabold text-slate-900 text-base">{area.name}</p>
                                            <p className="text-xs text-slate-400 font-bold uppercase tracking-tight">{area.district}</p>
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => removeArea(area.id)}
                                        className="text-slate-200 hover:text-red-500 transition-colors p-2"
                                        aria-label={`${t('areas.remove')} ${area.name}`}
                                    >
                                        <span className="material-icons-round text-[20px]">delete_outline</span>
                                    </button>
                                </div>

                                {nextBrownout && (
                                    <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                                        <div className="flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 rounded-full">
                                            <span className="material-icons-round text-[12px] text-amber-500">schedule</span>
                                            <span className="text-[10px] text-amber-700 font-bold uppercase tracking-wide">Next Brownout</span>
                                        </div>
                                        <CountdownTimer targetDate={nextBrownout.scheduled_start} compact label="" />
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div className="text-center py-16 space-y-3">
                    <div className="w-16 h-16 rounded-3xl bg-slate-50 flex items-center justify-center mx-auto">
                        <span className="material-icons-round text-[32px] text-slate-300">location_off</span>
                    </div>
                    <p className="font-heading font-extrabold text-lg text-slate-800">{t('areas.noAreas')}</p>
                    <p className="text-sm text-slate-400 font-medium">{t('areas.noAreasSub')}</p>
                </div>
            )}

            {/* Add Area Button */}
            <Button
                onClick={handleAddClick}
                className="w-full bg-gradient-to-br from-amber-500 to-orange-500 text-white hover:opacity-90 border-0 font-heading font-bold"
                size="lg"
            >
                {canAdd ? (
                    <>
                        <span className="material-icons-round text-[16px] mr-2">add</span>
                        {t('areas.addArea')}
                    </>
                ) : (
                    <>
                        <span className="material-icons-round text-[16px] mr-2">lock</span>
                        {t('common.upgrade')}
                    </>
                )}
            </Button>

            {/* Add Area Dialog */}
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent className="max-w-md bg-card border-border/50">
                    <DialogHeader>
                        <DialogTitle className="font-heading">{t('areas.addAreaTitle')}</DialogTitle>
                    </DialogHeader>

                    <div className="relative mb-2">
                        <span className="material-icons-round absolute left-3 top-1/2 -translate-y-1/2 text-[16px] text-muted-foreground">search</span>
                        <Input
                            placeholder={t('areas.searchBarangay')}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10 bg-secondary/50"
                            aria-label="Search barangay"
                        />
                    </div>

                    <ScrollArea className="h-[350px]">
                        <div className="space-y-4 pr-4">
                            {Object.entries(groupedBarangays).map(([district, barangays]) => (
                                <div key={district}>
                                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
                                        {district}
                                    </p>
                                    <div className="space-y-1">
                                        {barangays.map((b) => (
                                            <button
                                                key={b.id}
                                                onClick={() => handleAdd(b)}
                                                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-secondary transition-colors text-left"
                                            >
                                                <span className="material-icons-round text-[16px] text-muted-foreground shrink-0">location_on</span>
                                                <div>
                                                    <p className="text-sm font-medium">{b.name}</p>
                                                    <p className="text-[10px] text-muted-foreground">{b.district}</p>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </ScrollArea>
                </DialogContent>
            </Dialog>

            {/* Premium Prompt Dialog */}
            <Dialog open={showPremium} onOpenChange={setShowPremium}>
                <DialogContent className="max-w-sm bg-card border-border/50 text-center">
                    <DialogTitle className="sr-only">{t('areas.premiumRequired')}</DialogTitle>
                    <div className="space-y-4 py-2">
                        <div className="w-16 h-16 rounded-2xl bg-brand/10 flex items-center justify-center mx-auto">
                            <span className="material-icons-round text-[32px] text-brand">auto_awesome</span>
                        </div>
                        <div>
                            <h3 className="font-heading font-bold text-xl">{t('areas.premiumRequired')}</h3>
                            <p className="text-sm text-muted-foreground mt-2">{t('areas.premiumPrompt')}</p>
                        </div>
                        <ul className="text-sm text-left space-y-2 px-4">
                            <li className="flex items-center gap-2">
                                <span className="text-brand">✓</span> Monitor up to 10 areas
                            </li>
                            <li className="flex items-center gap-2">
                                <span className="text-brand">✓</span> Priority push alerts
                            </li>
                            <li className="flex items-center gap-2">
                                <span className="text-brand">✓</span> Ad-free experience
                            </li>
                            <li className="flex items-center gap-2">
                                <span className="text-brand">✓</span> Outage history export
                            </li>
                        </ul>
                        <Button className="w-full bg-gradient-to-br from-amber-500 to-orange-500 text-white hover:opacity-90 border-0 font-heading font-bold" size="lg">
                            {t('areas.upgradeBtn')}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
