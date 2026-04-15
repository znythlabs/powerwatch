'use client';

import { useState } from 'react';
import { SettingsSheet } from '@/components/SettingsSheet';

export function TopBar() {
    const [settingsOpen, setSettingsOpen] = useState(false);

    return (
        <>
            <header className="sticky top-0 z-40 bg-white shadow-sm border-b border-gray-100">
                <div className="flex items-center justify-between h-14 px-4 md:px-6 lg:px-8 max-w-6xl mx-auto">
                    {/* Logo */}
                    <div className="flex items-center gap-2.5 lg:hidden">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center">
                            <span className="material-icons-round w-full h-full text-transparent bg-clip-text bg-gradient-to-tr from-amber-400 to-orange-500 drop-shadow flex items-center justify-center text-[22px]">electric_bolt</span>
                        </div>
                        <span className="font-heading font-bold text-base tracking-tight">
                            Power<span className="text-brand">Watch</span>
                        </span>
                    </div>

                    {/* Settings Button */}
                    <div className="ml-auto lg:hidden">
                        <button
                            onClick={() => setSettingsOpen(true)}
                            className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:text-gray-700 hover:bg-gray-200 transition-colors"
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
