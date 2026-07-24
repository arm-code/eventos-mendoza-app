import {
    Calendar,
    FilePlus2,
    FileText,
    LayoutDashboard,
    Settings,
    Wallet,
    type LucideIcon,
} from 'lucide-react'

export interface NavItem {
    label: string
    shortLabel: string
    href: string
    icon: LucideIcon
    // Para resaltar la ruta activa cuando hay subrutas
    matchPrefix?: string
}

// Elementos principales (usados en barra inferior móvil, máx. 5)
export const primaryNav: NavItem[] = [
    { label: 'Principal', shortLabel: 'Inicio', href: '/dashboard', icon: LayoutDashboard },
    {
        label: 'Notas de venta',
        shortLabel: 'Notas',
        href: '/tools/notas-venta',
        icon: FileText,
        matchPrefix: '/tools/notas-venta',
    },
    {
        label: 'Finanzas',
        shortLabel: 'Finanzas',
        href: '/tools/finanzas',
        icon: Wallet,
        matchPrefix: '/tools/finanzas',
    },
    {
        label: 'Eventos',
        shortLabel: 'Eventos',
        href: '/tools/eventos',
        icon: Calendar,
        matchPrefix: '/tools/eventos',
    },
    { label: 'Configuración', shortLabel: 'Ajustes', href: '/configuracion', icon: Settings },
]

// Acceso rápido adicional para crear nota (destacado)
export const createNoteNav: NavItem = {
    label: 'Crear nota',
    shortLabel: 'Crear',
    href: '/tools/notas-venta/crear-nota-venta',
    icon: FilePlus2,
    matchPrefix: '/tools/notas-venta/crear-nota-venta',
}

export function isActive(pathname: string, item: NavItem): boolean {
    if (item.matchPrefix) return pathname.startsWith(item.matchPrefix)
    return pathname === item.href
}
