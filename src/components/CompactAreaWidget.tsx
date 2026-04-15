'use client';

import { useState, useRef, useEffect } from 'react';
import { CountdownTimer } from '@/components/CountdownTimer';
import type { AlertStatus, Announcement, Barangay } from '@/lib/types';
import { format } from 'date-fns';

interface AreaData {
    area: Barangay;
    status: AlertStatus;
    nextBrownout: Announcement | null;
    activeBrownout: Announcement | null;
}

interface CompactAreaWidgetProps {
    areaStatuses: AreaData[];
}

export function CompactAreaWidget({ areaStatuses }: CompactAreaWidgetProps) {
    const [selectedIdx, setSelectedIdx] = useState(0);
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Close dropdown on outside click
    useEffect(() => {
        function handleClickOutside(e: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Auto-select most urgent area on mount
    useEffect(() => {
        const dangerIdx = areaStatuses.findIndex(a => a.status === 'danger');
        if (dangerIdx >= 0) { setSelectedIdx(dangerIdx); return; }
        const warningIdx = areaStatuses.findIndex(a => a.status === 'warning');
        if (warningIdx >= 0) { setSelectedIdx(warningIdx); return; }
        const scheduledIdx = areaStatuses.findIndex(a => a.nextBrownout !== null);
        if (scheduledIdx >= 0) { setSelectedIdx(scheduledIdx); return; }
    }, [areaStatuses]);

    if (areaStatuses.length === 0) return null;

    const safeIdx = Math.min(selectedIdx, areaStatuses.length - 1);
    const current = areaStatuses[safeIdx];
    const brownout = current.activeBrownout ?? current.nextBrownout;

    const getScheduleInfo = () => {
        if (!brownout?.scheduled_start) return null;
        try {
            const startDate = new Date(brownout.scheduled_start);
            const dateStr = format(startDate, 'MMM d');
            const timeStr = format(startDate, 'h:mm a');
            const endStr = brownout.scheduled_end
                ? format(new Date(brownout.scheduled_end), 'h:mm a')
                : null;
            let duration: string | null = null;
            if (brownout.scheduled_end) {
                const hours = Math.round(
                    (new Date(brownout.scheduled_end).getTime() - startDate.getTime()) / 3600000
                );
                if (hours > 0 && hours <= 48) duration = `${hours}${hours > 1 ? 'hrs' : 'hr'}`;
            }
            return { dateStr, timeStr, endStr, duration };
        } catch {
            return null;
        }
    };

    const scheduleInfo = getScheduleInfo();

    const statusDot = current.status === 'danger'
        ? 'bg-red-500 animate-pulse'
        : current.status === 'warning'
            ? 'bg-amber-500 animate-pulse'
            : brownout
                ? 'bg-amber-400'
                : 'bg-teal-500';

    const statusLabel = current.status === 'danger'
        ? 'ACTIVE'
        : current.status === 'warning'
            ? 'SOON'
            : brownout
                ? 'SCHEDULED'
                : 'CLEAR';

    const statusColor = current.status === 'danger'
        ? 'text-red-600'
        : current.status === 'warning'
            ? 'text-amber-600'
            : brownout
                ? 'text-amber-500'
                : 'text-teal-600';

    // Subtle background accent
    const bgAccent = current.status === 'danger'
        ? 'from-red-50/80 to-white border-red-100'
        : current.status === 'warning'
            ? 'from-amber-50/60 to-white border-amber-100'
            : brownout
                ? 'from-orange-50/40 to-white border-orange-100/60'
                : 'from-teal-50/40 to-white border-teal-100/40';

    return (
        <div
            className={`relative bg-gradient-to-r ${bgAccent} rounded-2xl px-4 py-3 shadow-sm border overflow-hidden animate-fade-in`}
        >
            <div className="relative z-10 flex items-center gap-3">
                {/* Status dot + Area selector */}
                <div className="relative shrink-0" ref={dropdownRef}>
                    <button
                        onClick={() => areaStatuses.length > 1 && setIsOpen(!isOpen)}
                        className="flex items-center gap-2 group"
                        aria-label="Select area to monitor"
                        aria-expanded={isOpen}
                    >
                        <span className={`w-2.5 h-2.5 rounded-full ${statusDot} shrink-0`} />
                        <span className="font-bold text-sm text-gray-900 truncate max-w-[100px]">
                            {current.area.name}
                        </span>
                        {areaStatuses.length > 1 && (
                            <span className={`material-icons-round text-[16px] text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}>
                                expand_more
                            </span>
                        )}
                    </button>

                    {/* Dropdown */}
                    {isOpen && (
                        <div className="absolute top-full left-0 mt-2 bg-white rounded-xl shadow-lg border border-gray-100 py-1.5 min-w-[160px] z-50 animate-fade-in">
                            {areaStatuses.map((as, i) => {
                                const dot = as.status === 'danger'
                                    ? 'bg-red-500'
                                    : as.status === 'warning'
                                        ? 'bg-amber-500'
                                        : as.nextBrownout
                                            ? 'bg-amber-400'
                                            : 'bg-teal-500';
                                return (
                                    <button
                                        key={as.area.id}
                                        onClick={() => { setSelectedIdx(i); setIsOpen(false); }}
                                        className={`w-full flex items-center gap-2.5 px-3 py-2 text-left text-sm hover:bg-gray-50 transition-colors ${i === safeIdx ? 'bg-gray-50 font-semibold' : 'font-medium'}`}
                                    >
                                        <span className={`w-2 h-2 rounded-full ${dot} shrink-0`} />
                                        <span className="text-gray-800 truncate">{as.area.name}</span>
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Divider */}
                <div className="w-px h-5 bg-gray-200 shrink-0" />

                {/* Main content: countdown or clear status */}
                <div className="flex items-center gap-3 flex-1 min-w-0">
                    {current.status === 'danger' && current.activeBrownout ? (
                        /* Active brownout — show pulsing label + restoration time */
                        <div className="flex items-center gap-2 flex-1">
                            <span className="text-xs font-bold text-red-600 uppercase tracking-wider">Brownout</span>
                            {scheduleInfo?.endStr && (
                                <span className="text-xs text-gray-500 font-medium ml-auto shrink-0">
                                    Until {scheduleInfo.endStr}
                                </span>
                            )}
                        </div>
                    ) : brownout ? (
                        /* Upcoming — show compact countdown + schedule */
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                            <CountdownTimer targetDate={brownout.scheduled_start} compact />
                            {scheduleInfo && (
                                <div className="flex items-center gap-1.5 ml-auto shrink-0">
                                    <span className="text-[10px] text-gray-400 font-bold uppercase">{scheduleInfo.dateStr}</span>
                                    {scheduleInfo.duration && (
                                        <span className="bg-gray-800 text-white text-[9px] font-bold px-1.5 py-0.5 rounded">
                                            {scheduleInfo.duration}
                                        </span>
                                    )}
                                </div>
                            )}
                        </div>
                    ) : (
                        /* Clear */
                        <span className="text-xs font-semibold text-teal-600">No outages scheduled</span>
                    )}
                </div>

                {/* Status label */}
                <span className={`text-[9px] font-extrabold ${statusColor} uppercase tracking-widest shrink-0`}>
                    {statusLabel}
                </span>
            </div>
        </div>
    );
}
