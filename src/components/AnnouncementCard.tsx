'use client';

import type { Announcement } from '@/lib/types';
import { useTranslation } from '@/lib/i18n';
import { formatDistanceToNow, format } from 'date-fns';

interface AnnouncementCardProps {
    announcement: Announcement;
    index?: number;
    isDashboard?: boolean;
}

const typeConfig = {
    scheduled: {
        label: 'announcements.scheduled',
        badgeColor: 'bg-amber-50 text-amber-600 border-amber-100',
        cardTint: 'from-amber-50/50 to-white',
        iconColor: 'text-amber-500',
    },
    emergency: {
        label: 'announcements.emergency',
        badgeColor: 'bg-red-50 text-red-600 border-red-100',
        cardTint: 'from-red-50/50 to-white',
        iconColor: 'text-red-500',
    },
    restoration: {
        label: 'announcements.restoration',
        badgeColor: 'bg-teal-50 text-teal-600 border-teal-100',
        cardTint: 'from-teal-50/40 to-white',
        iconColor: 'text-teal-500',
    },
    rate_update: {
        label: 'announcements.rateUpdate',
        badgeColor: 'bg-blue-50 text-blue-600 border-blue-100',
        cardTint: 'from-blue-50/40 to-white',
        iconColor: 'text-blue-500',
    },
    info: {
        label: 'announcements.info',
        badgeColor: 'bg-blue-50 text-blue-600 border-blue-100',
        cardTint: 'from-blue-50/40 to-white',
        iconColor: 'text-blue-500',
    },
};


export function AnnouncementCard({ announcement, index = 0, isDashboard = false }: AnnouncementCardProps) {
    const { t, language } = useTranslation();
    const config = typeConfig[announcement.type];
    const summary = language === 'fil' ? announcement.summary_fil : announcement.summary_en;
    const maxVisibleAreas = isDashboard ? 2 : 4;
    const areas = announcement.affected_areas;
    const hasMore = areas.length > maxVisibleAreas;

    const timeAgo = (() => {
        try {
            return formatDistanceToNow(new Date(announcement.created_at), { addSuffix: false });
        } catch {
            return '';
        }
    })();

    const hasRealScheduledTime = (() => {
        try {
            if (announcement.scheduled_end) return true;
            const startMs = new Date(announcement.scheduled_start).getTime();
            const createdMs = new Date(announcement.created_at).getTime();
            const diff = Math.abs(startMs - createdMs);
            return diff > 5 * 60 * 1000;
        } catch {
            return false;
        }
    })();

    const timeRange = (() => {
        try {
            if (!hasRealScheduledTime) return null;
            const startDate = new Date(announcement.scheduled_start);
            const start = format(startDate, 'h:mm a');
            const end = announcement.scheduled_end
                ? format(new Date(announcement.scheduled_end), 'h:mm a')
                : null;
            return end ? `${start} — ${end}` : start;
        } catch {
            return null;
        }
    })();

    const postedDate = (() => {
        try {
            return format(new Date(announcement.created_at), 'MMM d, yyyy h:mm a');
        } catch {
            return '';
        }
    })();

    const duration = (() => {
        try {
            if (!announcement.scheduled_end) return null;
            const startMs = new Date(announcement.scheduled_start).getTime();
            const endMs = new Date(announcement.scheduled_end).getTime();
            const hours = Math.round((endMs - startMs) / (1000 * 60 * 60));
            if (hours <= 0 || hours > 48) return null;
            return `${hours} ${hours > 1 ? 'hrs' : 'hr'}`;
        } catch {
            return null;
        }
    })();

    // Extract title from summary (first sentence or first ~60 chars)
    const title = (() => {
        if (!summary) return '';
        // Try to get first sentence
        const firstSentence = summary.split(/[.!]\s/)[0];
        if (firstSentence && firstSentence.length <= 80) return firstSentence;
        // Fallback to first 60 chars at word boundary
        const truncated = summary.slice(0, 60);
        const lastSpace = truncated.lastIndexOf(' ');
        return lastSpace > 30 ? truncated.slice(0, lastSpace) + '...' : truncated + '...';
    })();

    // Remaining summary after title
    const remainingSummary = (() => {
        if (!summary || !title) return '';
        if (summary.startsWith(title)) {
            const rest = summary.slice(title.length).replace(/^[.\s]+/, '').trim();
            return rest;
        }
        return summary;
    })();

    return (
        <a
            href={announcement.source_url}
            target="_blank"
            rel="noopener noreferrer"
            className={`block bg-gradient-to-br ${config.cardTint} rounded-[2rem] p-5 shadow-soft border border-white/60 relative overflow-hidden group cursor-pointer hover:shadow-md transition-shadow duration-300 animate-stagger-in`}
            style={{ animationDelay: `${index * 80}ms` }}
            aria-label={`View original: ${title}`}
        >
            <div className="relative z-10">
                {/* Header: Badge + Time ago */}
                <div className="flex justify-between items-start mb-3">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border ${config.badgeColor}`}>
                        {t(config.label)}
                    </span>
                    <div className="flex items-center gap-1.5 text-[10px] text-gray-400 font-semibold">
                        <span>{timeAgo} {t('common.ago')}</span>
                        <span className="material-icons-round text-[13px] text-gray-300">open_in_new</span>
                    </div>
                </div>

                {/* Title */}
                <h3 className="font-bold text-gray-900 text-[15px] leading-tight mb-1.5">{title}</h3>

                {/* Summary */}
                {remainingSummary && (
                    <p className="text-xs text-gray-500 leading-relaxed line-clamp-2 mb-3">{remainingSummary}</p>
                )}

                {/* Time Range Card — for posts with real scheduled times */}
                {announcement.type !== 'rate_update' && timeRange && (
                    <div className="bg-gray-50 rounded-2xl p-3 flex items-center justify-between border border-gray-100 mb-3">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm text-gray-600">
                                <span className="material-icons-round text-base">schedule</span>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-[9px] uppercase font-bold text-gray-400 tracking-wide">
                                    {(() => { try { return format(new Date(announcement.scheduled_start), 'MMM d, yyyy'); } catch { return ''; } })()}
                                </span>
                                <span className="text-sm font-bold text-gray-800">{timeRange}</span>
                            </div>
                        </div>
                        {duration && (
                            <span className="text-xs font-bold bg-gray-900 text-white px-2 py-1 rounded-md">
                                {duration}
                            </span>
                        )}
                    </div>
                )}

                {/* Posted date — For posts WITHOUT real scheduled times (status updates) */}
                {announcement.type !== 'rate_update' && !timeRange && announcement.type !== 'restoration' && (
                    <div className="flex items-center gap-1.5 text-xs text-gray-500 font-medium mb-3">
                        <span className="material-icons-round text-[14px]">schedule</span>
                        <span>Posted on {postedDate}</span>
                    </div>
                )}

                {/* Affected Areas as pills */}
                {areas.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                        {areas.slice(0, maxVisibleAreas).map((area) => (
                            <div
                                key={area.barangay}
                                className="flex items-center gap-1 px-2 py-1 rounded-md bg-gray-100 text-gray-500 text-[10px] font-medium"
                            >
                                <span className="material-icons-round text-[10px]">location_on</span>
                                {area.barangay}
                                {area.zone && ` (${area.zone})`}
                            </div>
                        ))}
                        {hasMore && (
                            <div className="flex items-center px-2 py-1 rounded-md bg-gray-100 text-gray-400 text-[10px] font-medium">
                                +{areas.length - maxVisibleAreas} {t('announcements.more')}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </a>
    );
}
