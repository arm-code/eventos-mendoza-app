'use client'

import { Armchair, LogOut, User, Menu } from 'lucide-react'
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
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { AdminSidebarContent } from './admin-sidebar'
import { useState } from 'react'
import { motion } from 'framer-motion'

export function AdminHeader() {
    const { user, signOut } = useAuth()
    const [menuOpen, setMenuOpen] = useState(false)

    return (
        <header className="sticky top-0 z-40 flex items-center justify-between border-b border-violet-100/80 bg-white/90 backdrop-blur-xl px-3 sm:px-4 py-2.5 md:hidden safe-area-top">
            <div className="flex items-center gap-2.5">
                <motion.div
                    whileTap={{ scale: 0.92 }}
                    className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-600 text-white shadow-lg shadow-violet-600/20"
                >
                    <Armchair className="h-[18px] w-[18px]" />
                </motion.div>
                <span className="font-bold text-violet-950 text-sm tracking-tight">Eventos Mendoza</span>
            </div>

            <div className="flex items-center gap-1">
                {/* Menu hamburguesa para navegación rápida en móvil */}
                <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
                    <SheetTrigger asChild>
                        <Button
                            variant="ghost"
                            size="icon"
                            aria-label="Menú"
                            className="h-10 w-10 rounded-xl text-violet-700 hover:bg-violet-50 active:bg-violet-100 touch-manipulation"
                        >
                            <Menu className="h-5 w-5" />
                        </Button>
                    </SheetTrigger>
                    <SheetContent side="left" className="w-[280px] p-0 border-r border-violet-100">
                        <div className="flex flex-col h-full">
                            <SheetHeader className="px-5 py-4 border-b border-violet-100">
                                <SheetTitle className="flex items-center gap-3 text-left">
                                    <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-600 text-white shadow-md shadow-violet-200">
                                        <Armchair className="h-[18px] w-[18px]" />
                                    </span>
                                    <div className="leading-tight">
                                        <p className="text-sm font-bold text-violet-950">Eventos Mendoza</p>
                                        <p className="text-xs text-violet-600 font-medium">Gestión de Renta</p>
                                    </div>
                                </SheetTitle>
                            </SheetHeader>
                            <div className="flex-1 overflow-y-auto">
                                <AdminSidebarContent onNavigate={() => setMenuOpen(false)} />
                            </div>
                        </div>
                    </SheetContent>
                </Sheet>

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button
                            variant="ghost"
                            size="icon"
                            aria-label="Cuenta"
                            className="h-10 w-10 rounded-xl text-violet-700 hover:bg-violet-50 active:bg-violet-100 touch-manipulation"
                        >
                            <User className="h-5 w-5" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-64 border-violet-100 rounded-xl shadow-xl">
                        <DropdownMenuLabel className="flex flex-col gap-1 p-4">
                            <span className="font-semibold text-violet-950 text-sm">{user?.name || 'Usuario'}</span>
                            <span className="text-xs font-normal text-violet-500">{user?.email || 'admin@eventosmendoza.com'}</span>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator className="bg-violet-100" />
                        <DropdownMenuItem
                            onClick={signOut}
                            className="text-red-600 focus:bg-red-50 focus:text-red-700 cursor-pointer mx-2 mb-2 rounded-lg h-11 touch-manipulation"
                        >
                            <LogOut className="h-4 w-4 mr-2" />
                            Cerrar sesión
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </header>
    )
}