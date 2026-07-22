'use client'

import { Armchair, LogOut, User } from 'lucide-react'
import { useAuth } from '@/lib/auth'
import { Button } from '@/components/ui/button'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export function AdminHeader() {
    const { user, signOut } = useAuth()

    return (
        <header className="sticky top-0 z-30 flex items-center justify-between border-b border-violet-100 bg-white/95 px-4 py-3 backdrop-blur md:hidden">
            <div className="flex items-center gap-2.5">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-600 text-white shadow-sm shadow-violet-200">
                    <Armchair className="h-4 w-4" />
                </span>
                <span className="font-bold text-violet-950 text-sm">Eventos Mendoza</span>
            </div>

            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" aria-label="Cuenta" className="text-violet-700 hover:bg-violet-50">
                        <User className="h-5 w-5" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 border-violet-100">
                    <DropdownMenuLabel className="flex flex-col">
                        <span className="font-semibold text-violet-950">{user?.name || 'Usuario'}</span>
                        <span className="text-xs font-normal text-violet-500">{user?.email || 'admin@eventosmendoza.com'}</span>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator className="bg-violet-100" />
                    <DropdownMenuItem onClick={signOut} className="text-red-600 focus:bg-red-50 focus:text-red-700 cursor-pointer">
                        <LogOut className="h-4 w-4 mr-2" />
                        Cerrar sesión
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </header>
    )
}
