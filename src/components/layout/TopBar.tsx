'use client';

import { useState } from 'react';
import { SettingsSheet } from '@/components/SettingsSheet';
import { useAppStore } from '@/lib/store';

export function TopBar() {
    const [settingsOpen, setSettingsOpen] = useState(false);
    const fetchAll = useAppStore((s) => s.fetchAll);
    const isLoading = useAppStore((s) => s.isLoading);

    const handleRefresh = async () => {
        await fetchAll();
    };

    return (
        <>
            <header className="sticky top-0 z-40 bg-white shadow-sm border-b border-gray-100">
                <div className="flex items-center justify-between h-14 px-4 md:px-6 lg:px-8 max-w-6xl mx-auto w-full">
                    {/* Logo */}
                    <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center">
                            <span className="material-icons-round w-full h-full text-transparent bg-clip-text bg-gradient-to-tr from-amber-400 to-orange-500 drop-shadow flex items-center justify-center text-[22px]">electric_bolt</span>
                        </div>
                        <span className="font-heading font-bold text-base tracking-tight text-slate-900">
                            Power<span className="text-brand">Watch</span>
                        </span>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                        <button
                            onClick={handleRefresh}
                            disabled={isLoading}
                            className={`w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:text-brand hover:bg-orange-50 transition-all ${isLoading ? 'animate-spin' : 'active:scale-95'}`}
                            aria-label="Refresh data"
                        >
                            <span className="material-icons-round text-[20px]">refresh</span>
                        </button>
                        <button
                            onClick={() => setSettingsOpen(true)}
                            className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:text-slate-900 hover:bg-slate-200 transition-colors"
                            aria-label="Open settings"
                        >
                            <span className="material-icons-round text-[20px]">settings</span>
                        </button>
                    </div>

                </div>
            </header>


            <SettingsSheet open={settingsOpen} onClose={() => setSettingsOpen(false)} />
        </>
    );
}
