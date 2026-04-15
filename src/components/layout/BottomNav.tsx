'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslation } from '@/lib/i18n';

const navItems = [
    { href: '/', icon: 'home', labelKey: 'nav.home' },
    { href: '/announcements', icon: 'notifications', labelKey: 'nav.alerts' },
    { href: '/my-areas', icon: 'location_on', labelKey: 'nav.myAreas' },
    { href: '/calculator', icon: 'calculate', labelKey: 'nav.calculator' },
    { href: '/history', icon: 'history', labelKey: 'nav.history' },
];

export function BottomNav() {
    const pathname = usePathname();
    const { t } = useTranslation();

    // Reorder/filter items for the left and right sides of the elevated center button
    const leftItems = navItems.filter((i) => i.href === '/' || i.href === '/announcements');
    const rightItems = navItems.filter((i) => i.href === '/calculator' || i.href === '/history');
    const centerItem = navItems.find((i) => i.href === '/my-areas');

    return (
        <nav
            className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-sm bg-white rounded-[2.5rem] px-6 py-3 flex items-center justify-between z-50 lg:hidden shadow-xl border border-gray-100"
            role="navigation"
            aria-label="Main navigation"
        >
            {/* Left Items */}
            {leftItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                    <Link
                        key={item.href}
                        href={item.href}
                        className={`flex flex-col items-center gap-1 group transition-colors ${isActive ? 'text-brand' : 'text-muted-foreground hover:text-foreground'}`}
                        aria-label={t(item.labelKey)}
                    >
                        <span className={`material-icons-round text-2xl group-active:scale-95 transition-transform ${isActive ? 'drop-shadow-sm' : ''}`} style={{ fontWeight: isActive ? 600 : 400 }}>{item.icon}</span>
                        <span className="text-[10px] font-medium tracking-wide">{t(item.labelKey)}</span>
                    </Link>
                );
            })}

            {/* Center Action Button (My Areas) */}
            {centerItem && (
                <Link
                    href={centerItem.href}
                    className="relative -top-6 bg-gradient-to-br from-brand to-orange-600 w-14 h-14 rounded-full flex items-center justify-center text-white shadow-lg shadow-brand/30 active:scale-95 transition-transform border-4 border-background"
                    aria-label={t(centerItem.labelKey)}
                >
                    <span className="material-icons-round text-[28px] drop-shadow-sm">{centerItem.icon as string}</span>
                </Link>
            )}

            {/* Right Items */}
            {rightItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                    <Link
                        key={item.href}
                        href={item.href}
                        className={`flex flex-col items-center gap-1 group transition-colors ${isActive ? 'text-brand' : 'text-muted-foreground hover:text-foreground'}`}
                        aria-label={t(item.labelKey)}
                    >
                        <span className={`material-icons-round text-2xl group-active:scale-95 transition-transform ${isActive ? 'drop-shadow-sm' : ''}`} style={{ fontWeight: isActive ? 600 : 400 }}>{item.icon}</span>
                        <span className="text-[10px] font-medium tracking-wide">{t(item.labelKey)}</span>
                    </Link>
                );
            })}
        </nav>
    );
}
