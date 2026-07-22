'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { FilePlus2, FileText, Calendar, Wallet, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { PageHeader } from '@/components/admin/page-header'

const toolsList = [
  {
    title: 'Crear Nota de Venta',
    description: 'Genera cotizaciones y notas de venta digitales con exportación a PDF o Imagen.',
    href: '/tools/crear-nota-venta',
    icon: FilePlus2,
    btnLabel: 'Crear Nota',
    primary: true,
  },
  {
    title: 'Historial de Notas',
    description: 'Consulta, busca y descarga nuevamente cualquier nota o cotización generada.',
    href: '/tools/notas-venta',
    icon: FileText,
    btnLabel: 'Ver Historial',
    primary: false,
  },
  {
    title: 'Eventos y Agenda',
    description: 'Agenda eventos, controla estatus (entregado/recogido) y emite contratos de garantía.',
    href: '/tools/eventos',
    icon: Calendar,
    btnLabel: 'Gestionar Eventos',
    primary: true,
  },
  {
    title: 'Finanzas y Movimientos',
    description: 'Controla transacciones de ingresos/egresos, categorías y cuentas/métodos de pago.',
    href: '/tools/finanzas',
    icon: Wallet,
    btnLabel: 'Ver Finanzas',
    primary: false,
  },
]

export default function ToolsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Herramientas"
        description="Módulos y herramientas digitales para la gestión operativa en campo y oficina."
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-2">
        {toolsList.map((tool) => {
          const Icon = tool.icon
          return (
            <Card
              key={tool.href}
              className="border-violet-100 bg-white shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 border-b border-violet-50">
                <CardTitle className="text-base font-bold text-violet-950">{tool.title}</CardTitle>
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-100 text-violet-700 shadow-sm">
                  <Icon className="h-5 w-5" />
                </span>
              </CardHeader>
              <CardContent className="pt-4 flex flex-col justify-between flex-1 gap-4">
                <p className="text-xs leading-relaxed text-violet-600/80">{tool.description}</p>
                <Link href={tool.href} className="w-full">
                  <Button
                    className={
                      tool.primary
                        ? 'w-full h-11 bg-violet-600 hover:bg-violet-700 text-white font-bold gap-2 shadow-sm shadow-violet-200'
                        : 'w-full h-11 border-violet-200 text-violet-700 hover:bg-violet-50 font-semibold gap-2'
                    }
                    variant={tool.primary ? 'default' : 'outline'}
                  >
                    {tool.btnLabel}
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
