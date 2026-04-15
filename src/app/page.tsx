'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useAppStore } from '@/lib/store';
import { useTranslation } from '@/lib/i18n';
import { AreaStatusCard } from '@/components/AreaStatusCard';
import { CompactAreaWidget } from '@/components/CompactAreaWidget';
import { AnnouncementCard } from '@/components/AnnouncementCard';
import { Badge } from '@/components/ui/badge';
import type { AlertStatus, Announcement, Barangay } from '@/lib/types';

interface AreaStatus {
  area: Barangay;
  status: AlertStatus;
  nextBrownout: Announcement | null;
  activeBrownout: Announcement | null;
}

function getAreaStatus(area: Barangay, announcements: Announcement[]): AreaStatus {
  const now = Date.now();
  const relevant = announcements.filter(
    (a) =>
      (a.type === 'scheduled' || a.type === 'emergency') &&
      a.affected_areas.some((aa) => aa.barangay === area.name)
  );

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
  const lastFetched = useAppStore((s) => s.lastFetched);

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

  const recentAnnouncements = announcements.slice(0, 3);
  const rateChange = currentRate?.previous_rate
    ? currentRate.rate_per_kwh - currentRate.previous_rate
    : null;

  // Offline/stale indicator
  const staleMins = lastFetched
    ? Math.floor((Date.now() - lastFetched) / 60000)
    : null;
  const isStale = staleMins !== null && staleMins > 5;

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
      {/* Compact Area Widget — top priority alert */}
      {monitoredAreas.length > 0 && (
        <CompactAreaWidget areaStatuses={areaStatuses} />
      )}

      {/* Summary Bar */}
      <div className="flex items-center justify-between mb-4 px-1">
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-bold text-gray-900">{t('dashboard.monitoredAreas')}</h2>
          <span className={`flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full ${isStale ? 'bg-amber-50 text-amber-500' : 'bg-green-50 text-green-500'}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${isStale ? 'bg-amber-400' : 'bg-green-400 animate-pulse'}`}></span>
            {isStale
              ? `${staleMins < 60 ? `${staleMins}m` : `${Math.floor(staleMins / 60)}h`} ago`
              : 'Live'
            }
          </span>
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
          {displayedStatuses.length > 0 ? (
            displayedStatuses.map((as, i) => (
              <AreaStatusCard
                key={as.area.id}
                area={as.area}
                status={as.status}
                nextBrownout={as.nextBrownout}
                activeBrownout={as.activeBrownout}
                index={i}
              />
            ))
          ) : (
            <div className="bg-white rounded-[2rem] p-6 text-center shadow-soft relative overflow-hidden mb-6 z-0">
              <p className="text-sm text-gray-500 font-medium">All your areas are clear — no outages scheduled</p>
            </div>
          )}
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
        <div className="bg-white p-5 rounded-3xl shadow-sm border border-white/60 flex flex-col justify-between h-32 relative overflow-hidden group">
          <div className="flex items-center gap-2 text-gray-500 mb-1 relative z-10">
            <span className="material-icons-round text-[20px] text-primary">payments</span>
            <span className="text-xs font-bold tracking-wide">RATE</span>
          </div>
          <div className="relative z-10">
            <div className="text-2xl font-bold text-gray-900">
              ₱{currentRate?.rate_per_kwh?.toFixed(2) ?? '—'}
              {rateChange !== null && (
                <span className={`text-[10px] ml-2 font-medium ${rateChange > 0 ? 'text-red-500' : 'text-green-500'}`}>
                  {rateChange > 0 ? '+' : ''}₱{rateChange.toFixed(2)}
                </span>
              )}
            </div>
            <div className="text-[10px] text-gray-400 font-medium">per kWh</div>
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
