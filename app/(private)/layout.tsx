'use client'

import SidebarLayout from '@/components/sidebar/Sidebar'
import { View } from '@/types/View.types'
import { usePathname, useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'

export default function PrivateLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [currentView, setCurrentView] = useState<View>('principal')

  useEffect(() => {
    // sincróniza currentView según la ruta actual
    if (pathname.includes('categorias')) setCurrentView('categorias')
    else if (pathname.includes('crear-producto')) setCurrentView('crear-producto')
    else if (pathname.includes('tipos-productos')) setCurrentView('tipos-productos')
    else if (pathname.includes('productos')) setCurrentView('productos')
    else if (pathname.includes('configuracion')) setCurrentView('configuracion')
    else if (pathname.includes('tools/finanzas')) setCurrentView('finanzas')
    else if (pathname.includes('tools/crear-nota-venta')) setCurrentView('crear-nota-venta')
    else if (pathname.includes('tools/notas-venta')) setCurrentView('notas-venta')
    else if (pathname.includes('tools')) setCurrentView('tools')
    else setCurrentView('principal')
  }, [pathname])

  return (
    <SidebarLayout currentView={currentView} onViewChange={(view) => {
      // navegación real en lugar de useState
      const paths: Record<string, string> = {
        'principal': '/dashboard',
        'productos': '/gestion-productos/productos',
        'categorias': '/gestion-productos/categorias',
        'crear-producto': '/gestion-productos/crear-producto',
        'tipos-productos': '/gestion-productos/tipos-productos',
        'configuracion': '/configuracion',
        'tools': '/tools',
        'finanzas': '/tools/finanzas',
        'crear-nota-venta': '/tools/crear-nota-venta',
        'notas-venta': '/tools/notas-venta',
      }
      router.push(paths[view] || '/dashboard')
    }}>
      {children}
    </SidebarLayout>
  )
}
