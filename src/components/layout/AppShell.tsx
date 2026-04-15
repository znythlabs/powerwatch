'use client';

import { BottomNav } from './BottomNav';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';

export function AppShell({ children }: { children: React.ReactNode }) {
    return (
        <>
            <Sidebar />
            <div className="lg:pl-[280px] transition-all duration-300 min-h-screen bg-[#EBEBF2] flex justify-center">
                <main className="w-full max-w-md bg-gradient-to-br from-[#F2F4F8] to-[#E2E6EE] min-h-[100dvh] relative shadow-2xl overflow-hidden flex flex-col pb-32">
                    <TopBar />
                    <div className="flex-1 overflow-y-auto no-scrollbar px-6 pt-6">
                        {children}
                    </div>
                </main>
            </div>
            <BottomNav />
        </>
    );
}
