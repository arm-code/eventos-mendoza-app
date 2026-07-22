'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Armchair, LogOut } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuth } from '@/lib/auth'
import { createNoteNav, isActive, primaryNav } from '@/lib/nav'
import { Button } from '@/components/ui/button'

export function AdminSidebar() {
    const pathname = usePathname()
    const { user, signOut } = useAuth()
    const items = [...primaryNav]
    // Insertar "Crear nota" después de Principal
    items.splice(1, 0, createNoteNav)

    return (
        <aside className="hidden w-64 shrink-0 flex-col border-r border-violet-100 bg-white md:flex">
            <div className="flex items-center gap-3 px-5 py-5 border-b border-violet-100">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-600 text-white shadow-md shadow-violet-200">
                    <Armchair className="h-5 w-5" />
                </span>
                <div className="leading-tight">
                    <p className="text-sm font-bold text-violet-950">Eventos Mendoza</p>
                    <p className="text-xs text-violet-600 font-medium">Gestión de Renta</p>
                </div>
            </div>

            <nav className="flex flex-1 flex-col gap-1.5 px-3 py-4">
                {items.map((item) => {
                    const active = isActive(pathname, item)
                    const Icon = item.icon
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                'flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all duration-200',
                                active
                                    ? 'bg-violet-600 text-white shadow-sm shadow-violet-200 font-semibold'
                                    : 'text-violet-800 hover:bg-violet-50 hover:text-violet-950',
                            )}
                        >
                            <Icon className={cn("h-[18px] w-[18px]", active ? "text-white" : "text-violet-600")} />
                            {item.label}
                        </Link>
                    )
                })}
            </nav>

            <div className="border-t border-violet-100 p-3 bg-violet-50/50">
                <div className="mb-2 px-2">
                    <p className="truncate text-sm font-semibold text-violet-950">{user?.name || 'Usuario'}</p>
                    <p className="truncate text-xs text-violet-600">{user?.email || 'admin@eventosmendoza.com'}</p>
                </div>
                <Button
                    variant="ghost"
                    className="w-full justify-start gap-3 text-violet-700 hover:bg-violet-100 hover:text-violet-900"
                    onClick={signOut}
                >
                    <LogOut className="h-[18px] w-[18px]" />
                    Cerrar sesión
                </Button>
            </div>
        </aside>
    )
}
