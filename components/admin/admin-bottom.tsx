// components/admin/admin-bottom-nav.tsx
'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { isActive, primaryNav } from '@/lib/nav'

export function AdminBottomNav() {
    const pathname = usePathname()

    return (
        <nav className="fixed inset-x-0 bottom-0 z-50 border-t bg-background/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl md:hidden">
            <ul className="mx-auto flex h-16 max-w-lg items-stretch justify-around px-2">
                {primaryNav.map((item) => {
                    const active = isActive(pathname, item)
                    const Icon = item.icon

                    return (
                        <li key={item.href} className="flex flex-1">
                            <Link
                                href={item.href}
                                className={cn(
                                    'flex flex-1 flex-col items-center justify-center gap-1 min-h-[44px] text-xs font-medium transition-all touch-manipulation select-none active:scale-95',
                                    active ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
                                )}
                            >
                                <span
                                    className={cn(
                                        'flex size-8 items-center justify-center rounded-lg transition-colors',
                                        active ? 'bg-primary/10 text-primary' : 'bg-transparent'
                                    )}
                                >
                                    <Icon className="size-5" strokeWidth={active ? 2.5 : 2} aria-hidden />
                                </span>
                                <span className={cn(active && "font-semibold")}>
                                    {item.shortLabel}
                                </span>
                            </Link>
                        </li>
                    )
                })}
            </ul>
        </nav>
    )
}