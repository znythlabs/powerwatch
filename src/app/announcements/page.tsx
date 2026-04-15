'use client';

import { useState, useMemo } from 'react';
import { useAppStore } from '@/lib/store';
import { useTranslation } from '@/lib/i18n';
import { AnnouncementCard } from '@/components/AnnouncementCard';
import type { AnnouncementType } from '@/lib/types';

const filterTabs: { key: AnnouncementType | 'all'; labelKey: string }[] = [
    { key: 'all', labelKey: 'announcements.all' },
    { key: 'scheduled', labelKey: 'announcements.scheduled' },
    { key: 'emergency', labelKey: 'announcements.emergency' },
    { key: 'restoration', labelKey: 'announcements.restoration' },
    { key: 'rate_update', labelKey: 'announcements.rateUpdate' },
];

export default function AnnouncementsPage() {
    const { t } = useTranslation();
    const announcements = useAppStore((s) => s.announcements);
    const [activeFilter, setActiveFilter] = useState<AnnouncementType | 'all'>('all');
    const [searchQuery, setSearchQuery] = useState('');

    const filtered = useMemo(() => {
        let result = announcements;
        if (activeFilter !== 'all') {
            result = result.filter((a) => a.type === activeFilter);
        }
        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase();
            result = result.filter(
                (a) =>
                    a.summary_en.toLowerCase().includes(q) ||
                    a.summary_fil.toLowerCase().includes(q) ||
                    a.affected_areas.some((area) => area.barangay.toLowerCase().includes(q))
            );
        }
        return result;
    }, [announcements, activeFilter, searchQuery]);

    return (
        <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-gray-900 tracking-tight">{t('announcements.title')}</h1>
                <p className="text-xs text-gray-500 font-medium mt-1">{t('announcements.subtitle')}</p>
            </div>

            {/* Search */}
            <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <span className="material-icons-round text-gray-400 group-focus-within:text-primary transition-colors">search</span>
                </div>
                <input
                    type="text"
                    placeholder={t('announcements.search')}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="block w-full pl-11 pr-4 py-3.5 bg-white border-none rounded-2xl text-sm shadow-soft placeholder-gray-400 focus:ring-2 focus:ring-primary/20 focus:bg-white transition-all outline-none"
                    aria-label="Search announcements"
                />
            </div>

            {/* Filter Tabs */}
            <div className="flex gap-3 overflow-x-auto pb-5 mb-2 -mx-1 px-1 hide-scrollbar">
                {filterTabs.map((tab) => (
                    <button
                        key={tab.key}
                        onClick={() => setActiveFilter(tab.key)}
                        className={`shrink-0 px-5 py-2 rounded-full text-sm font-semibold transition-all duration-200 active:scale-95 ${activeFilter === tab.key
                            ? 'bg-gradient-to-br from-amber-500 to-orange-500 text-white shadow-lg shadow-orange-500/30'
                            : 'bg-white text-gray-500 shadow-sm border border-white/50 hover:bg-gray-50'
                            }`}
                        aria-pressed={activeFilter === tab.key}
                    >
                        {t(tab.labelKey)}
                    </button>
                ))}
            </div>

            {/* Announcements List */}
            <div className="space-y-5">
                {filtered.length > 0 ? (
                    filtered.map((a, i) => (
                        <AnnouncementCard key={a.id} announcement={a} index={i} />
                    ))
                ) : (
                    <div className="bg-white rounded-[2rem] p-8 text-center shadow-soft border border-white/60 space-y-3">
                        <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto">
                            <span className="material-icons-round text-[28px] text-gray-400">search</span>
                        </div>
                        <p className="font-bold text-lg text-gray-900">{t('announcements.noResults')}</p>
                        <p className="text-sm text-gray-500">{t('announcements.noResultsSub')}</p>
                    </div>
                )}
            </div>
        </div>
    );
}
