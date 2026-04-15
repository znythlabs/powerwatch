'use client';

import { useMemo, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { useAppStore } from '@/lib/store';
import { useTranslation } from '@/lib/i18n';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isToday } from 'date-fns';

interface OutageEvent {
    id: string;
    summary: string;
    scheduledStart: Date;
    scheduledEnd: Date;
    durationHours: number;
    affectedAreas: string[];
    type: string;
}

export default function HistoryPage() {
    const { t } = useTranslation();
    const announcements = useAppStore((s) => s.announcements);
    const monitoredAreas = useAppStore((s) => s.monitoredAreas);
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [selectedDay, setSelectedDay] = useState<Date | null>(null);

    const monitoredNames = useMemo(() => monitoredAreas.map((a) => a.name), [monitoredAreas]);

    // Parse all outage events for monitored areas
    const allOutages = useMemo((): OutageEvent[] => {
        const results: OutageEvent[] = [];
        for (const a of announcements) {
            if (a.type !== 'scheduled' && a.type !== 'emergency') continue;
            if (!a.scheduled_start || !a.scheduled_end) continue;
            const affectsMonitored = a.affected_areas.some((aa) =>
                monitoredNames.includes(aa.barangay)
            );
            if (!affectsMonitored) continue;

            const start = new Date(a.scheduled_start);
            const end = new Date(a.scheduled_end);
            const hours = Math.round((end.getTime() - start.getTime()) / 3600000 * 10) / 10;
            if (hours <= 0 || hours > 48) continue;

            results.push({
                id: a.id,
                summary: a.summary_en ?? '',
                scheduledStart: start,
                scheduledEnd: end,
                durationHours: hours,
                affectedAreas: a.affected_areas.map((aa) => aa.barangay),
                type: a.type as string,
            });
        }
        return results.sort((a, b) => b.scheduledStart.getTime() - a.scheduledStart.getTime());
    }, [announcements, monitoredNames]);

    // Month stats
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);

    const monthOutages = useMemo(() => {
        return allOutages.filter(
            (e) => e.scheduledStart >= monthStart && e.scheduledStart <= monthEnd
        );
    }, [allOutages, monthStart, monthEnd]);

    const monthStats = useMemo(() => {
        const totalHours = monthOutages.reduce((sum, e) => sum + e.durationHours, 0);
        const avgDuration = monthOutages.length > 0 ? totalHours / monthOutages.length : 0;
        return {
            count: monthOutages.length,
            totalHours: Math.round(totalHours * 10) / 10,
            avgDuration: Math.round(avgDuration * 10) / 10,
        };
    }, [monthOutages]);

    // Calendar days
    const calendarDays = useMemo(() => {
        const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
        // Pad start to align with weekday (Sunday = 0)
        const startPad = monthStart.getDay();
        const padded: (Date | null)[] = Array(startPad).fill(null).concat(days);
        return padded;
    }, [monthStart, monthEnd]);

    // Outage days set
    const outageDaySet = useMemo(() => {
        const set = new Set<string>();
        monthOutages.forEach((e) => {
            set.add(format(e.scheduledStart, 'yyyy-MM-dd'));
        });
        return set;
    }, [monthOutages]);

    // Outages for selected day
    const selectedDayOutages = useMemo(() => {
        if (!selectedDay) return [];
        return monthOutages.filter((e) => isSameDay(e.scheduledStart, selectedDay));
    }, [selectedDay, monthOutages]);

    const prevMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
    const nextMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));

    return (
        <div className="max-w-2xl mx-auto space-y-6 animate-fade-in pb-24">
            {/* Header */}
            <div className="flex items-center justify-between mb-2 px-1">
                <div>
                    <h1 className="text-xl font-bold text-gray-900">Outage History</h1>
                    <p className="text-sm text-gray-500 mt-0.5 font-medium">
                        Track power outage patterns for your areas
                    </p>
                </div>
            </div>

            {/* Monthly Stats */}
            <div className="grid grid-cols-3 gap-3">
                <div className="bg-white rounded-3xl p-4 flex flex-col items-center text-center shadow-sm border border-white/60">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center mb-2 shadow-sm">
                        <span className="material-icons-round text-white text-xl">bolt</span>
                    </div>
                    <span className="text-[10px] uppercase tracking-wider font-bold text-gray-400 mb-0.5">Outages</span>
                    <span className="text-xl font-bold text-gray-900">{monthStats.count}</span>
                </div>
                <div className="bg-white rounded-3xl p-4 flex flex-col items-center text-center shadow-sm border border-white/60">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center mb-2 shadow-sm">
                        <span className="material-icons-round text-white text-xl">schedule</span>
                    </div>
                    <span className="text-[10px] uppercase tracking-wider font-bold text-gray-400 mb-0.5">Downtime</span>
                    <span className="text-xl font-bold text-gray-900">{monthStats.totalHours}h</span>
                </div>
                <div className="bg-white rounded-3xl p-4 flex flex-col items-center text-center shadow-sm border border-white/60">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center mb-2 shadow-sm">
                        <span className="material-icons-round text-white text-xl">timer</span>
                    </div>
                    <span className="text-[10px] uppercase tracking-wider font-bold text-gray-400 mb-0.5">Avg Dur</span>
                    <span className="text-xl font-bold text-gray-900">{monthStats.avgDuration}h</span>
                </div>
            </div>

            {/* Calendar */}
            <div className="bg-white rounded-[2rem] p-6 shadow-soft border border-white/60 relative overflow-hidden">
                {/* Background accent */}
                <div className="absolute -top-10 -right-10 w-32 h-32 bg-gradient-to-br from-amber-500 to-orange-500 rounded-full blur-3xl opacity-30 pointer-events-none"></div>

                {/* Month Header */}
                <div className="flex items-center justify-between mb-6 relative z-10">
                    <button
                        onClick={prevMonth}
                        className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors text-gray-500"
                        aria-label="Previous month"
                    >
                        <span className="material-icons-round text-[20px]">chevron_left</span>
                    </button>
                    <h3 className="font-bold text-base text-gray-900">
                        {format(currentMonth, 'MMMM yyyy')}
                    </h3>
                    <button
                        onClick={nextMonth}
                        className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors text-gray-500"
                        aria-label="Next month"
                    >
                        <span className="material-icons-round text-[20px]">chevron_right</span>
                    </button>
                </div>

                {/* Weekday Headers */}
                <div className="grid grid-cols-7 gap-y-2 mb-2 relative z-10">
                    {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, index) => (
                        <div key={`head-${index}`} className="text-center text-[10px] font-bold text-gray-400 uppercase">
                            {d}
                        </div>
                    ))}
                </div>

                {/* Calendar Grid */}
                <div className="grid grid-cols-7 gap-y-2 relative z-10">
                    {calendarDays.map((day, i) => {
                        if (!day) {
                            return <div key={`pad-${i}`} className="h-10" />;
                        }

                        const dateKey = format(day, 'yyyy-MM-dd');
                        const hasOutage = outageDaySet.has(dateKey);
                        const isSelected = selectedDay ? isSameDay(day, selectedDay) : false;
                        const isTodayDate = isToday(day);

                        return (
                            <button
                                key={dateKey}
                                onClick={() => setSelectedDay(isSelected ? null : day)}
                                className={`h-10 flex items-center justify-center text-sm transition-all relative mx-auto w-10 
                                    ${isSelected
                                        ? 'font-bold bg-gradient-to-br from-amber-500 to-orange-500 text-white rounded-xl shadow-md'
                                        : isTodayDate
                                            ? 'font-bold text-transparent bg-clip-text bg-gradient-to-br from-amber-500 to-orange-500 bg-amber-50 rounded-xl ring-1 ring-amber-500/20'
                                            : 'font-medium text-gray-700 hover:bg-gray-100 rounded-xl'
                                    }`}
                                aria-label={`${format(day, 'MMMM d')}${hasOutage ? ' - has outage' : ''}`}
                            >
                                {day.getDate()}
                                {hasOutage && !isSelected && (
                                    <span className="absolute bottom-1.5 w-1 h-1 bg-gradient-to-br from-amber-500 to-orange-500 rounded-full" />
                                )}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Selected Day Detail */}
            {selectedDay && selectedDayOutages.length > 0 && (
                <div className="space-y-3 animate-slide-up">
                    <h3 className="text-sm font-bold text-gray-500 uppercase tracking-widest px-1">
                        {format(selectedDay, 'MMM d, yyyy')} Outages
                    </h3>
                    {selectedDayOutages.map((event) => (
                        <div key={`sel-${event.id}`} className="bg-white rounded-[2rem] p-5 shadow-sm border border-white/60 flex flex-col gap-3">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-semibold text-gray-500">
                                    {format(event.scheduledStart, 'hh:mm a')} — {format(event.scheduledEnd, 'hh:mm a')}
                                </span>
                                <span className="bg-gradient-to-br from-amber-500 to-orange-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow-sm border border-amber-600/20">
                                    {event.durationHours}h
                                </span>
                            </div>
                            <p className="text-sm font-bold text-gray-900 leading-snug">{event.summary}</p>
                            <div className="flex items-center gap-1.5 flex-wrap mt-1">
                                <span className="material-icons-round text-[14px] text-gray-400">location_on</span>
                                {event.affectedAreas.slice(0, 3).map((area) => (
                                    <span key={`area-${area}`} className="text-[11px] font-medium text-gray-600 bg-gray-50 px-2 py-0.5 rounded-md border border-gray-100">
                                        {area}
                                    </span>
                                ))}
                                {event.affectedAreas.length > 3 && (
                                    <span className="text-[11px] font-medium text-gray-500">
                                        +{event.affectedAreas.length - 3} more
                                    </span>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Recent Outages List */}
            <section className="space-y-4 pt-2">
                <h3 className="text-sm font-bold text-gray-500 uppercase tracking-widest px-1">Recent Outages</h3>

                {allOutages.length > 0 ? (
                    <div className="space-y-3">
                        {allOutages.slice(0, 10).map((event, i) => (
                            <div
                                key={`rec-${event.id}`}
                                className="bg-white rounded-[2rem] p-5 shadow-sm border border-white/60 flex items-center gap-4 animate-stagger-in"
                                style={{ animationDelay: `${i * 50}ms` }}
                            >
                                {/* Date Column */}
                                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 flex flex-col items-center justify-center shrink-0 shadow-sm text-white">
                                    <span className="text-[10px] font-bold uppercase tracking-wide opacity-90">
                                        {format(event.scheduledStart, 'MMM')}
                                    </span>
                                    <span className="text-xl font-bold leading-none mt-0.5">
                                        {format(event.scheduledStart, 'dd')}
                                    </span>
                                </div>

                                {/* Info */}
                                <div className="flex-1 min-w-0 flex flex-col justify-center">
                                    <div className="flex items-center justify-between mb-1.5">
                                        <span className="text-xs font-semibold text-gray-500 flex items-center gap-1.5">
                                            {format(event.scheduledStart, 'hh:mm a')} — {format(event.scheduledEnd, 'hh:mm a')}
                                        </span>
                                        <span className="bg-gradient-to-br from-amber-500 to-orange-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap shadow-sm border border-amber-600/20">
                                            {event.durationHours}h
                                        </span>
                                    </div>
                                    <p className="text-sm font-bold text-gray-900 truncate">{event.summary}</p>
                                    <p className="text-xs font-medium text-gray-500 truncate mt-0.5">
                                        {event.affectedAreas.slice(0, 2).join(', ')}
                                        {event.affectedAreas.length > 2 ? ` +${event.affectedAreas.length - 2}` : ''}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="bg-white rounded-[2rem] p-8 text-center space-y-3 shadow-soft border border-white/60">
                        <div className="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center mx-auto">
                            <span className="material-icons-round text-[24px] text-gray-400">history</span>
                        </div>
                        <div>
                            <p className="text-gray-900 font-bold text-sm">No outage history</p>
                            <p className="text-xs text-gray-500 mt-1 font-medium">Your monitored areas have been clear</p>
                        </div>
                    </div>
                )}
            </section>
        </div>
    );
}
