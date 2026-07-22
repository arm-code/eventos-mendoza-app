'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { isActive, primaryNav } from '@/lib/nav'

export function AdminBottomNav() {
    const pathname = usePathname()

    return (
        <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-violet-100 bg-white/95 backdrop-blur md:hidden">
            <ul className="mx-auto flex max-w-md items-stretch justify-around py-1">
                {primaryNav.map((item) => {
                    const active = isActive(pathname, item)
                    const Icon = item.icon
                    return (
                        <li key={item.href} className="flex-1">
                            <Link
                                href={item.href}
                                className={cn(
                                    'flex flex-col items-center gap-1 px-1 py-1.5 text-[11px] font-medium transition-colors',
                                    active ? 'text-violet-700 font-bold' : 'text-violet-600/70 hover:text-violet-900',
                                )}
                            >
                                <span
                                    className={cn(
                                        'flex h-9 w-9 items-center justify-center rounded-full transition-all',
                                        active ? 'bg-violet-600 text-white shadow-sm shadow-violet-200' : 'hover:bg-violet-50',
                                    )}
                                >
                                    <Icon className="h-[19px] w-[19px]" />
                                </span>
                                {item.shortLabel}
                            </Link>
                        </li>
                    )
                })}
            </ul>
        </nav>
    )
}
