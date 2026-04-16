import { useState } from 'react';
import { Badge } from '@/components/ui/badge';

import { CountdownTimer } from '@/components/CountdownTimer';
import type { AlertStatus, Announcement, Barangay } from '@/lib/types';
import { format } from 'date-fns';

interface AreaStatusCardProps {
    area: Barangay;
    status: AlertStatus;
    nextBrownout: Announcement | null;
    activeBrownout: Announcement | null;
    index?: number;
}

const statusConfig = {
    clear: {
        icon: 'check_circle',
        dotClass: 'bg-status-clear',
        bgClass: 'border-status-clear/15',
        gradientClass: '',
    },
    warning: {
        icon: 'warning',
        dotClass: 'bg-status-warning animate-pulse',
        bgClass: 'border-status-warning/20',
        gradientClass: 'bg-gradient-to-b from-status-warning/5 to-transparent',
    },
    danger: {
        icon: 'electric_bolt',
        dotClass: 'bg-status-danger animate-pulse',
        bgClass: 'border-status-danger/20',
        gradientClass: 'bg-gradient-to-b from-status-danger/8 to-transparent',
    },
};

export function AreaStatusCard({ area, status, nextBrownout, activeBrownout, index = 0 }: AreaStatusCardProps) {
    const [isExpanded, setIsExpanded] = useState(false);
    const config = statusConfig[status];


    const brownout = activeBrownout ?? nextBrownout;

    const scheduledInfo = (() => {
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
                if (hours > 0 && hours <= 48) duration = `${hours} ${hours > 1 ? 'hrs' : 'hr'}`;
            }

            return { dateStr, timeStr, endStr, duration };
        } catch {
            return null;
        }
    })();

    return (
        <div
            className={`bg-white rounded-[2rem] p-6 shadow-soft relative overflow-hidden pt-5 mb-3 z-0 animate-stagger-in border-t border-white/60`}
            style={{ animationDelay: `${index * 60}ms` }}
        >
            {/* Blurred ambient orbs */}
            {status === 'warning' && (
                <>
                    <div className="absolute -top-10 -right-10 w-32 h-32 bg-amber-100 rounded-full blur-3xl opacity-60"></div>
                    <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-orange-50 rounded-full blur-3xl opacity-60"></div>
                </>
            )}
            {status === 'danger' && (
                <>
                    <div className="absolute -top-10 -right-10 w-32 h-32 bg-red-100 rounded-full blur-3xl opacity-60"></div>
                    <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-rose-50 rounded-full blur-3xl opacity-60"></div>
                </>
            )}
            {status === 'clear' && (
                <div className="absolute inset-0 bg-gradient-to-r from-teal-50/50 to-transparent pointer-events-none"></div>
            )}

            <div className="relative z-10">
                {/* Area header */}
                <div className={`flex justify-between items-start ${(nextBrownout && status !== 'danger' && isExpanded) ? 'mb-6' : 'mb-1'}`}>
                    <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg ${status === 'danger' ? 'bg-gradient-to-br from-red-500 to-rose-600 shadow-red-200' :
                            'bg-gradient-to-br from-amber-500 to-orange-500 shadow-orange-200'
                            }`}>
                            {status === 'clear' ? <span className="material-icons-round text-xl">location_on</span> : <span className="material-icons-round text-2xl">electric_bolt</span>}
                        </div>
                        <div>
                            <h3 className="font-bold text-xl text-gray-900">{area.name}</h3>
                            <p className="text-xs text-gray-500 font-medium">
                                {status === 'clear' && !nextBrownout ? area.district : status === 'danger' ? 'Active Brownout' : area.district}
                            </p>
                        </div>
                    </div>

                    {/* Status badge */}
                    {status === 'danger' ? (
                        <span className="px-3 py-1 rounded-full text-xs font-bold border bg-red-100 text-red-700 border-red-200">
                            Active
                        </span>
                    ) : nextBrownout ? (
                        <span className="px-3 py-1 rounded-full text-xs font-bold border bg-amber-100 text-amber-700 border-amber-200">
                            Scheduled
                        </span>
                    ) : (
                        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 border border-teal-100">
                            <span className="w-2 h-2 rounded-full bg-teal-500"></span>
                            <span className="text-xs font-bold text-teal-700">Clear</span>
                        </div>
                    )}
                </div>

                {/* Active brownout banner */}
                {status === 'danger' && activeBrownout && (
                    <div className="flex items-center gap-2 bg-status-danger/10 border border-status-danger/20 rounded-lg px-3 py-2.5 mb-4">
                        <span className="material-icons-round text-[16px] text-status-danger shrink-0">electric_bolt</span>
                        <span className="text-sm font-bold text-status-danger">BROWNOUT NOW</span>
                        {scheduledInfo?.endStr && (
                            <span className="text-xs text-muted-foreground ml-auto">
                                Restoration: {scheduledInfo.endStr}
                            </span>
                        )}
                    </div>
                )}

                {/* COLLAPSIBLE COUNTDOWN SECTION */}
                {nextBrownout && status !== 'danger' && (
                    <div className="group/countdown cursor-pointer select-none" onClick={() => setIsExpanded(!isExpanded)}>
                        {/* Summary Line (Always Visible) */}
                        {!isExpanded && (
                            <div className="flex items-center justify-between mb-4 bg-slate-50/50 rounded-2xl px-4 py-3 border border-slate-100 hover:border-amber-200 transition-all">
                                <div className="flex items-center gap-2">
                                    <span className="material-icons-round text-[18px] text-amber-500">timer</span>
                                    <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">Show Countdown</span>
                                </div>
                                <span className="material-icons-round text-slate-300 group-hover/countdown:text-amber-500 transition-colors">keyboard_arrow_down</span>
                            </div>
                        )}

                        {/* Full Countdown (Expanded) */}
                        <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isExpanded ? 'max-h-[200px] mb-6 opacity-100' : 'max-h-0 opacity-0'}`}>
                            <div className="flex justify-end mb-2">
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1">
                                    Click to hide <span className="material-icons-round text-sm">keyboard_arrow_up</span>
                                </span>
                            </div>
                            <CountdownTimer targetDate={nextBrownout.scheduled_start} />
                        </div>
                    </div>
                )}

                {/* Footer: Date/Time Range & Duration */}
                {nextBrownout && scheduledInfo && status !== 'danger' && (
                    <div className="flex justify-between items-center text-sm border-t border-gray-100 pt-4">
                        <div className="flex items-center gap-2">
                            <span className="material-icons-round text-[15px] text-gray-500">schedule</span>
                            <span className="text-gray-500 font-bold uppercase tracking-wide">{scheduledInfo.dateStr}</span>
                            <span className="text-gray-500 text-lg leading-none">•</span>
                            <span className="text-gray-500 font-medium">
                                {scheduledInfo.timeStr}
                                {scheduledInfo.endStr && ` — ${scheduledInfo.endStr}`}
                            </span>
                        </div>
                        {scheduledInfo.duration && (
                            <span className="bg-gray-900 text-white text-xs font-bold px-2 py-1 rounded-md">
                                {scheduledInfo.duration}
                            </span>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
