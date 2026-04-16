'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useAppStore } from '@/lib/store';
import { useTranslation } from '@/lib/i18n';
import { AreaStatusCard } from '@/components/AreaStatusCard';
import { AnnouncementCard } from '@/components/AnnouncementCard';

import { Badge } from '@/components/ui/badge';
import { CountdownTimer } from '@/components/CountdownTimer';

import type { AlertStatus, Announcement, Barangay } from '@/lib/types';

interface AreaStatus {
  area: Barangay;
  status: AlertStatus;
  nextBrownout: Announcement | null;
  activeBrownout: Announcement | null;
}

function getAreaStatus(area: Barangay, announcements: Announcement[]): AreaStatus {
  const now = Date.now();
  const relevant = announcements.filter((a) => {
    // 1. If it's a standard alert, check if the area is in the affected_areas list
    const isAffected = a.affected_areas.some((aa) => aa.barangay === area.name);

    // 2. If it's a custom/manual alert, check if the area name is mentioned in the summary text
    const isMentionedInCustom = a.id.startsWith('custom-') && (
      a.summary_en.toLowerCase().includes(area.name.toLowerCase()) ||
      a.summary_fil.toLowerCase().includes(area.name.toLowerCase())
    );

    return (a.type === 'scheduled' || a.type === 'emergency') && (isAffected || isMentionedInCustom);
  });

  // Active brownout
  const active = relevant.find((a) => {
    if (!a.scheduled_end) return false;
    const start = new Date(a.scheduled_start).getTime();
    const end = new Date(a.scheduled_end).getTime();
    return now >= start && now <= end;
  });

  if (active) {
    return { area, status: 'danger', nextBrownout: null, activeBrownout: active };
  }

  // Upcoming
  const upcoming = relevant
    .filter((a) => new Date(a.scheduled_start).getTime() > now)
    .sort((a, b) => new Date(a.scheduled_start).getTime() - new Date(b.scheduled_start).getTime());

  if (upcoming.length > 0) {
    const next = upcoming[0];
    const hoursUntil = (new Date(next.scheduled_start).getTime() - now) / 3600000;

    // If it's within 24 hours, show WARNING. If further away, show CLEAR but keep the schedule attached
    // This allows us to hide the countdown for far-away dates
    return {
      area,
      status: hoursUntil <= 24 ? 'warning' : 'clear',
      nextBrownout: next,
      activeBrownout: null,
    };
  }

  return { area, status: 'clear', nextBrownout: null, activeBrownout: null };
}

export default function DashboardPage() {
  const { t } = useTranslation();
  const announcements = useAppStore((s) => s.announcements);
  const monitoredAreas = useAppStore((s) => s.monitoredAreas);
  const currentRate = useAppStore((s) => s.currentRate);
  const manualRate = useAppStore((s) => s.manualRate);
  const setManualRate = useAppStore((s) => s.setManualRate);
  const lastFetched = useAppStore((s) => s.lastFetched);

  const [isEditingRate, setIsEditingRate] = useState(false);
  const [tempRate, setTempRate] = useState(manualRate?.toString() ?? '');

  // Per-area status computation
  const areaStatuses = useMemo(() => {
    return monitoredAreas.map((area) => getAreaStatus(area, announcements));
  }, [announcements, monitoredAreas]);

  const affectedCount = areaStatuses.filter((a) => a.status !== 'clear').length;
  const [showAffectedOnly, setShowAffectedOnly] = useState(false);

  // Filter displayed cards based on toggle
  const displayedStatuses = showAffectedOnly
    ? areaStatuses.filter((a) => a.status !== 'clear' || a.nextBrownout !== null)
    : areaStatuses;

  // Ensure manual/custom overrides always appear in Recent Alerts regardless of area
  const recentAnnouncements = useMemo(() => {
    const custom = announcements.filter(a => a.id.startsWith('custom-'));
    const othersRelevant = announcements.filter(a =>
      !a.id.startsWith('custom-') &&
      a.affected_areas.some(aa => monitoredAreas.some(ma => ma.name === aa.barangay))
    );
    // Combine and take top 3, prioritizing custom
    return [...custom, ...othersRelevant].slice(0, 3);
  }, [announcements, monitoredAreas]);


  const displayRate = manualRate !== null ? manualRate : (currentRate?.rate_per_kwh ?? 0);
  const rateChange = manualRate === null && currentRate?.previous_rate
    ? currentRate.rate_per_kwh - currentRate.previous_rate
    : null;

  // Offline/stale indicator
  const staleMins = lastFetched
    ? Math.floor((Date.now() - lastFetched) / 60000)
    : null;
  const isStale = staleMins !== null && staleMins > 5;

  const handleSaveRate = () => {
    const val = parseFloat(tempRate);
    if (!isNaN(val)) {
      setManualRate(val);
    } else {
      setManualRate(null);
    }
    setIsEditingRate(false);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
      {/* Summary Bar */}
      <div className="flex items-center justify-between mb-4 px-1">
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-bold text-gray-900">{t('dashboard.monitoredAreas')}</h2>
          <div className="flex items-center gap-1.5">

          </div>
        </div>

        <div className="flex items-center gap-2">
          {monitoredAreas.length > 0 && (
            <button
              onClick={() => setShowAffectedOnly(!showAffectedOnly)}
              className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full transition-colors ${showAffectedOnly ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
              title="Show only areas with active or scheduled brownouts"
            >
              <span className="material-icons-round text-[16px]">filter_list</span>
              <span className="hidden sm:inline">{showAffectedOnly ? 'Filtered' : 'Filter'}</span>
            </button>
          )}
          <Link href="/my-areas">
            <button className="text-xs font-semibold text-amber-600 bg-amber-50 px-3 py-1.5 rounded-full hover:bg-amber-100 transition-colors">
              Manage
            </button>
          </Link>
        </div>
      </div>

      {/* Per-Area Status Cards */}
      {monitoredAreas.length > 0 ? (
        <div className="space-y-6 mb-8">
          {(() => {
            const warningAreas = displayedStatuses.filter(a => a.status === 'warning' && a.nextBrownout);
            const commonNext = warningAreas.length > 0 ? warningAreas[0].nextBrownout : null;
            const isShared = warningAreas.length > 1 && warningAreas.every(a => a.nextBrownout?.id === commonNext?.id);

            return (
              <div className="space-y-4">
                {isShared && commonNext && (
                  <div className="bg-white rounded-[2rem] p-6 shadow-soft border-t border-white/60 mb-2 animate-slide-up">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <span className="material-icons-round text-amber-500">timer</span>
                        <span className="text-xs font-black text-slate-800 uppercase tracking-widest">Global Countdown</span>
                      </div>
                      <Badge className="bg-amber-100 text-amber-700 border-0 text-[10px] font-black">
                        {warningAreas.length} AREAS AFFECTED
                      </Badge>
                    </div>
                    <CountdownTimer targetDate={commonNext.scheduled_start} />
                  </div>
                )}

                {displayedStatuses.length > 0 ? (
                  displayedStatuses.map((as, i) => (
                    <AreaStatusCard
                      key={as.area.id}
                      area={as.area}
                      status={as.status}
                      nextBrownout={isShared && as.status === 'warning' ? null : as.nextBrownout}
                      activeBrownout={as.activeBrownout}
                      index={i}
                    />
                  ))
                ) : (
                  <div className="bg-white rounded-[2rem] p-6 text-center shadow-soft relative overflow-hidden mb-6 z-0">
                    <p className="text-sm text-gray-500 font-medium">All your areas are clear</p>
                  </div>
                )}
              </div>
            );
          })()}
        </div>
      ) : (

        <Link href="/my-areas" className="block mb-6">
          <div className="bg-white rounded-[2rem] p-6 text-center space-y-3 hover:shadow-md transition-shadow border border-dashed border-gray-200">
            <div className="w-12 h-12 rounded-xl bg-orange-50 flex items-center justify-center mx-auto">
              <span className="material-icons-round text-[20px] text-amber-500">add</span>
            </div>
            <div>
              <p className="text-gray-900 font-bold text-sm">Add your barangay</p>
              <p className="text-xs text-gray-400 mt-0.5 font-medium">Monitor power outages in your area</p>
            </div>
          </div>
        </Link>
      )}

      {/* Quick Actions Grid */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        {/* Current Rate */}
        <div className={`bg-white p-5 rounded-3xl shadow-sm border ${manualRate !== null ? 'border-brand/30 ring-1 ring-brand/10' : 'border-white/60'} flex flex-col justify-between min-h-[128px] relative overflow-hidden group`}>
          <div className="flex items-center justify-between text-gray-500 mb-1 relative z-10">
            <div className="flex items-center gap-2">
              <span className={`material-icons-round text-[20px] ${manualRate !== null ? 'text-brand' : 'text-primary'}`}>
                {manualRate !== null ? 'edit_note' : 'payments'}
              </span>
              <span className="text-xs font-bold tracking-wide">RATE</span>
              {manualRate !== null && (
                <Badge variant="secondary" className="bg-brand/10 text-brand text-[8px] h-4 px-1 border-0">MANUAL</Badge>
              )}
            </div>
            <button
              onClick={() => setIsEditingRate(!isEditingRate)}
              className="w-6 h-6 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-gray-100 transition-all text-gray-400"
            >
              <span className="material-icons-round text-[14px]">edit</span>
            </button>
          </div>

          <div className="relative z-10 flex-1 flex flex-col justify-center">
            {isEditingRate ? (
              <div className="flex flex-col gap-2 animate-fade-in">
                <div className="flex items-center gap-1.5 flex-1">
                  <span className="text-lg font-bold text-gray-400">₱</span>
                  <input
                    type="number"
                    step="0.01"
                    value={tempRate}
                    onChange={(e) => setTempRate(e.target.value)}
                    autoFocus
                    className="w-full bg-gray-50 border border-gray-100 rounded-lg px-2 py-1 text-lg font-bold text-gray-900 focus:outline-none focus:ring-1 focus:ring-brand/30"
                    placeholder="Rate..."
                  />
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={handleSaveRate}
                    className="flex-1 bg-brand text-white text-[10px] font-bold py-1.5 rounded-lg active:scale-95 transition-transform"
                  >
                    SAVE
                  </button>
                  <button
                    onClick={() => {
                      setIsEditingRate(false);
                      setTempRate(manualRate?.toString() ?? '');
                    }}
                    className="px-2 bg-gray-100 text-gray-500 text-[10px] font-bold py-1.5 rounded-lg"
                  >
                    <span className="material-icons-round text-[14px]">close</span>
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="text-2xl font-bold text-gray-900 leading-tight">
                  ₱{displayRate.toFixed(2)}
                  {rateChange !== null && (
                    <span className={`text-[10px] ml-2 font-medium ${rateChange > 0 ? 'text-red-500' : 'text-green-500'}`}>
                      {rateChange > 0 ? '+' : ''}₱{rateChange.toFixed(2)}
                    </span>
                  )}
                </div>
                <div className="text-[10px] text-gray-400 font-medium mt-1 uppercase tracking-wider flex items-center justify-between">
                  <span>per kWh</span>
                  {manualRate !== null && (
                    <button
                      onClick={() => setManualRate(null)}
                      className="text-brand hover:underline font-bold"
                    >
                      RESET
                    </button>
                  )}
                </div>
              </>
            )}
          </div>
        </div>


        {/* Next Brownout (global) */}
        <div className="bg-white p-5 rounded-3xl shadow-sm border border-white/60 flex flex-col justify-between h-32 relative overflow-hidden group">
          <div className="flex items-center gap-2 text-gray-500 mb-1 relative z-10">
            {(() => {
              const nextGlobal = areaStatuses.find((a) => a.nextBrownout)?.nextBrownout;
              return nextGlobal ? <span className="material-icons-round text-[20px] text-red-500">event_busy</span> : <span className="material-icons-round text-[20px] text-green-500">event_available</span>;
            })()}
            <span className="text-xs font-bold tracking-wide">NEXT</span>
          </div>
          <div className="relative z-10">
            {(() => {
              const nextGlobal = areaStatuses.find((a) => a.nextBrownout)?.nextBrownout;
              if (nextGlobal) {
                return (
                  <>
                    <div className="text-2xl font-bold text-gray-900">
                      {new Date(nextGlobal.scheduled_start).toLocaleDateString('en-PH', { month: 'short', day: 'numeric' })}
                    </div>
                    <div className="text-[10px] text-gray-400 font-medium">
                      Scheduled
                    </div>
                  </>
                );
              }
              return (
                <>
                  <div className="text-2xl font-bold text-gray-900">Clear</div>
                  <div className="text-[10px] text-gray-400 font-medium">None Scheduled</div>
                </>
              );
            })()}
          </div>
        </div>
      </div>

      {/* Recent Announcements */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">{t('dashboard.recentAlerts')}</h2>
          <Link
            href="/announcements"
            className="flex items-center gap-1 text-xs text-amber-600 hover:text-amber-700 transition-colors font-semibold bg-amber-50 px-3 py-1.5 rounded-full"
          >
            {t('dashboard.seeAll')}
          </Link>
        </div>
        <div className="space-y-4">
          {recentAnnouncements.map((a, i) => (
            <AnnouncementCard key={a.id} announcement={a} index={i} isDashboard />
          ))}
        </div>
      </section>
    </div>
  );
}
