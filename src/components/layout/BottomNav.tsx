'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslation } from '@/lib/i18n';

const navItems = [
    { href: '/', icon: 'home', labelKey: '' },
    { href: '/announcements', icon: 'notifications', labelKey: '' },
    { href: '/my-areas', icon: 'location_on', labelKey: '' },
    { href: '/calculator', icon: 'calculate', labelKey: '' },
    { href: '/history', icon: 'history', labelKey: '' },
];

export function BottomNav() {
    const pathname = usePathname();
    const { t } = useTranslation();

    // Reorder/filter items for the left and right sides of the elevated center button
    const leftItems = navItems.filter((i) => i.href === '/' || i.href === '/announcements');
    const rightItems = navItems.filter((i) => i.href === '/calculator' || i.href === '/history');
    const centerItem = navItems.find((i) => i.href === '/my-areas');

    return (
        <>
            {/* Linear Blur Overlay - Fades from bottom to top */}
            <div
                className="fixed bottom-0 left-0 right-0 h-40 pointer-events-none z-40 lg:hidden"
                style={{
                    background: 'linear-gradient(to top, rgba(235, 235, 242, 0.9) 0%, rgba(235, 235, 242, 0.4) 50%, transparent 100%)',
                    backdropFilter: 'blur(5px)',
                    WebkitBackdropFilter: 'blur(5px)',
                    maskImage: 'linear-gradient(to top, black 50%, transparent 100%)',
                    WebkitMaskImage: 'linear-gradient(to top, black 50%, transparent 100%)',
                }}
            />

            <nav
                className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-sm bg-white/95 backdrop-blur-md rounded-[2.5rem] px-6 py-4 flex items-center justify-between z-50 lg:hidden shadow-2xl shadow-black/5 border border-white/20"
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
                            className={`flex flex-col items-center group transition-all duration-300 ${isActive ? 'text-brand' : 'text-muted-foreground hover:text-foreground'}`}
                            aria-label={t(item.labelKey)}
                        >
                            <span
                                className={`material-icons-round group-active:scale-90 transition-transform ${isActive ? 'drop-shadow-sm' : ''}`}
                                style={{
                                    fontSize: '34px',
                                    fontWeight: isActive ? 600 : 400
                                }}
                            >
                                {item.icon}
                            </span>
                        </Link>
                    );
                })}

                {/* Center Action Button (My Areas) */}
                {centerItem && (
                    <div className="relative flex flex-col items-center">
                        <Link
                            href={centerItem.href}
                            className="bg-gradient-to-br from-brand to-orange-600 w-16 h-16 rounded-full flex items-center justify-center text-white shadow-lg shadow-brand/40 active:scale-90 transition-all duration-300 border-0 border-white -mt-12"
                            aria-label={t(centerItem.labelKey)}
                        >
                            <span
                                className="material-icons-round drop-shadow-md"
                                style={{ fontSize: '30px' }}
                            >
                                {centerItem.icon as string}
                            </span>
                        </Link>
                    </div>
                )}

                {/* Right Items */}
                {rightItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`flex flex-col items-center group transition-all duration-300 ${isActive ? 'text-brand' : 'text-muted-foreground hover:text-foreground'}`}
                            aria-label={t(item.labelKey)}
                        >
                            <span
                                className={`material-icons-round group-active:scale-90 transition-transform ${isActive ? 'drop-shadow-sm' : ''}`}
                                style={{
                                    fontSize: '34px',
                                    fontWeight: isActive ? 600 : 400
                                }}
                            >
                                {item.icon}
                            </span>
                        </Link>
                    );
                })}

            </nav>

        </>
    );
}

