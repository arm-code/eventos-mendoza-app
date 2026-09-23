'use client'

import Image from 'next/image'
import { LogOut, User, Menu } from 'lucide-react'
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
import { useState } from 'react'
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from '@/components/ui/drawer'
import { AdminSidebarContent } from './admin-sidebar'
import { BusinessSwitcher } from './BusinessSwitcher'

export function AdminHeader() {
    const { user, signOut } = useAuth()
    const [menuOpen, setMenuOpen] = useState(false)

    return (
        <header className="sticky top-0 z-40 flex items-center justify-between border-b border-violet-100/80 bg-white/90 backdrop-blur-xl px-3 sm:px-4 py-2.5 md:hidden safe-area-top">
            <div className="flex items-center gap-2 max-w-[65%] min-w-0">
                <BusinessSwitcher compact />
            </div>

            <div className="flex items-center gap-1">
                {/* Menu hamburguesa para navegación rápida en móvil */}
                <Drawer open={menuOpen} onOpenChange={setMenuOpen}>
                    <DrawerTrigger asChild>
                        <Button
                            variant="ghost"
                            size="icon"
                            aria-label="Menú"
                            className="h-10 w-10 rounded-xl text-violet-700 hover:bg-violet-50 active:bg-violet-100 touch-manipulation"
                        >
                            <Menu className="h-5 w-5" />
                        </Button>
                    </DrawerTrigger>
                    <DrawerContent className="p-0 border-t border-violet-100 rounded-t-2xl max-h-[85vh]">
                        <div className="flex flex-col h-full overflow-hidden">
                            <DrawerHeader className="sr-only">
                                <DrawerTitle>Menú principal</DrawerTitle>
                            </DrawerHeader>
                            <div className="flex-1 overflow-y-auto pb-6">
                                <AdminSidebarContent onNavigate={() => setMenuOpen(false)} />
                            </div>
                        </div>
                    </DrawerContent>
                </Drawer>

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