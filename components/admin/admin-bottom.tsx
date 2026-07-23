'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { isActive, primaryNav } from '@/lib/nav'
import { motion } from 'framer-motion'

export function AdminBottomNav() {
    const pathname = usePathname()

    return (
        <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-violet-100/80 bg-white/95 backdrop-blur-xl md:hidden safe-area-bottom">
            <ul className="mx-auto flex max-w-lg items-stretch justify-around px-1">
                {primaryNav.map((item) => {
                    const active = isActive(pathname, item)
                    const Icon = item.icon
                    return (
                        <li key={item.href} className="flex-1">
                            <Link
                                href={item.href}
                                className={cn(
                                    'flex flex-col items-center justify-center gap-0.5 min-h-[56px] px-1 py-1 text-[10px] font-medium transition-colors touch-manipulation select-none',
                                    active ? 'text-violet-700' : 'text-violet-400 hover:text-violet-600',
                                )}
                            >
                                <motion.span
                                    whileTap={{ scale: 0.85 }}
                                    className={cn(
                                        'flex h-8 w-8 items-center justify-center rounded-xl transition-all duration-200',
                                        active ? 'bg-violet-600 text-white shadow-md shadow-violet-200' : 'hover:bg-violet-50',
                                    )}
                                >
                                    <Icon className="h-[18px] w-[18px]" strokeWidth={active ? 2.5 : 2} />
                                </motion.span>
                                <span className={cn("mt-0.5", active && "font-semibold")}>
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