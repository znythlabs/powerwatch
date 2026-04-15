'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslation } from '@/lib/i18n';
import { useState } from 'react';
import { LanguageToggle } from '@/components/ui/LanguageToggle';
import { ThemeToggle } from '@/components/ui/ThemeToggle';

const navItems = [
    { href: '/', icon: 'home', labelKey: 'nav.home' },
    { href: '/announcements', icon: 'notifications', labelKey: 'nav.alerts' },
    { href: '/my-areas', icon: 'location_on', labelKey: 'nav.myAreas' },
    { href: '/calculator', icon: 'calculate', labelKey: 'nav.calculator' },
    { href: '/rates', icon: 'bar_chart', labelKey: 'nav.rates' },
    { href: '/history', icon: 'history', labelKey: 'nav.history' },
    { href: '/settings', icon: 'settings', labelKey: 'nav.settings' },
];

export function Sidebar() {
    const pathname = usePathname();
    const { t } = useTranslation();
    const [collapsed, setCollapsed] = useState(false);

    return (
        <aside
            className={`hidden lg:flex flex-col fixed left-0 top-0 h-screen z-50 bg-background border-r border-border/50 transition-all duration-300 ${collapsed ? 'w-[72px]' : 'w-[280px]'
                }`}
            role="navigation"
            aria-label="Sidebar navigation"
        >
            {/* Logo */}
            <div className="flex items-center gap-3 px-5 h-16 border-b border-border/50">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0">
                    <span className="material-icons-round w-full h-full text-transparent bg-clip-text bg-gradient-to-tr from-amber-400 to-orange-500 drop-shadow flex items-center justify-center text-[24px]">electric_bolt</span>
                </div>
                {!collapsed && (
                    <span className="font-heading font-bold text-lg tracking-tight">
                        Power<span className="text-brand">Watch</span>
                    </span>
                )}
            </div>

            {/* Nav Items */}
            <div className="flex-1 flex flex-col gap-1 px-3 py-4">
                {navItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group ${isActive
                                ? 'bg-brand/10 text-brand'
                                : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                                }`}
                            aria-label={t(item.labelKey)}
                            aria-current={isActive ? 'page' : undefined}
                        >
                            <span className="material-icons-round text-xl shrink-0 leading-none" style={{ fontWeight: isActive ? 600 : 400 }}>{item.icon}</span>
                            {!collapsed && (
                                <span className="text-sm font-medium">{t(item.labelKey)}</span>
                            )}
                        </Link>
                    );
                })}
            </div>

            {/* Bottom Controls */}
            <div className="px-3 py-4 border-t border-border/50 flex flex-col gap-3">
                {!collapsed && (
                    <>
                        <LanguageToggle />
                        <ThemeToggle />
                    </>
                )}
                <button
                    onClick={() => setCollapsed(!collapsed)}
                    className="flex items-center gap-3 px-3 py-2 rounded-xl text-muted-foreground hover:bg-secondary hover:text-foreground transition-all duration-200"
                    aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                >
                    {collapsed ? (
                        <span className="material-icons-round text-xl">keyboard_double_arrow_right</span>
                    ) : (
                        <>
                            <span className="material-icons-round text-xl">keyboard_double_arrow_left</span>
                            <span className="text-sm font-medium">Collapse</span>
                        </>
                    )}
                </button>
            </div>
        </aside>
    );
}
