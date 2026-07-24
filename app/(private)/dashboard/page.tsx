'use client'

import Link from 'next/link'
import {
  ArrowRight,
  Calendar,
  FilePlus2,
  FileText,
  PlusCircle,
  TrendingDown,
  TrendingUp,
  Wallet,
  Loader2,
} from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { useAuth } from '@/lib/auth'
import { financeApi } from '@/lib/api/finance'
import { formatCurrency, formatDate } from '@/lib/format'
import { PageHeader } from '@/components/admin/page-header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

const quickActions = [
  {
    label: 'Crear nota',
    description: 'Nueva nota de venta o cotización',
    href: '/tools/notas-venta/crear-nota-venta',
    icon: FilePlus2,
  },
  {
    label: 'Nueva transacción',
    description: 'Registrar ingreso o egreso',
    href: '/tools/finanzas',
    icon: PlusCircle,
  },
  {
    label: 'Historial de notas',
    description: 'Ver notas emitidas',
    href: '/tools/notas-venta',
    icon: FileText,
  },
  {
    label: 'Finanzas',
    description: 'Resumen y catálogo financiero',
    href: '/tools/finanzas',
    icon: Wallet,
  },
]

export default function PrincipalPage() {
  const { user } = useAuth()

  // API calls for summary and business events
  const { data: summary, isLoading: isLoadingSummary } = useQuery({
    queryKey: ['transactionsSummary'],
    queryFn: () => financeApi.getSummary(),
  })

  const { data: events = [], isLoading: isLoadingEvents } = useQuery({
    queryKey: ['businessEvents'],
    queryFn: () => financeApi.getBusinessEvents(),
  })

  const totalInputs = summary?.totalInputs ?? 0
  const totalOutputs = summary?.totalOutputs ?? 0
  const balance = summary?.balance ?? 0

  const safeEvents = Array.isArray(events) ? events : []
  const upcomingEvents = safeEvents.slice(0, 4)

  const firstName = user?.name ? user.name.split(' ')[0] : 'Bienvenido'

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Hola, ${firstName}`}
        description="Resumen general y accesos rápidos a tus herramientas."
      />

      {/* Resumen financiero */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card className="border-violet-100 bg-white shadow-sm transition-all hover:shadow-md">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-semibold text-violet-700">
              <Wallet className="h-4 w-4 text-violet-600" />
              Balance Total
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoadingSummary ? (
              <div className="flex items-center gap-2 py-2 text-violet-400">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm">Cargando...</span>
              </div>
            ) : (
              <p className="text-2xl font-bold tracking-tight text-violet-950 sm:text-3xl">
                {formatCurrency(balance)}
              </p>
            )}
          </CardContent>
        </Card>

        <Card className="border-green-100 bg-white shadow-sm transition-all hover:shadow-md">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-semibold text-green-700">
              <TrendingUp className="h-4 w-4 text-green-600" />
              Ingresos
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoadingSummary ? (
              <div className="flex items-center gap-2 py-2 text-green-400">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm">Cargando...</span>
              </div>
            ) : (
              <p className="text-2xl font-bold tracking-tight text-green-700 sm:text-3xl">
                {formatCurrency(totalInputs)}
              </p>
            )}
          </CardContent>
        </Card>

        <Card className="col-span-1 sm:col-span-2 lg:col-span-1 border-red-100 bg-white shadow-sm transition-all hover:shadow-md">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-semibold text-red-700">
              <TrendingDown className="h-4 w-4 text-red-600" />
              Gastos
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoadingSummary ? (
              <div className="flex items-center gap-2 py-2 text-red-400">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm">Cargando...</span>
              </div>
            ) : (
              <p className="text-2xl font-bold tracking-tight text-red-700 sm:text-3xl">
                {formatCurrency(totalOutputs)}
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Accesos rápidos */}
      <div>
        <h2 className="mb-3 text-sm font-bold uppercase tracking-wider text-violet-900/70">
          Accesos rápidos
        </h2>
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {quickActions.map((action) => {
            const Icon = action.icon
            return (
              <Link key={action.href + action.label} href={action.href}>
                <Card className="h-full border-violet-100 bg-white transition-all hover:border-violet-300 hover:bg-violet-50/50 hover:shadow-md">
                  <CardContent className="flex h-full flex-col gap-3 p-5">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-100 text-violet-700 shadow-sm">
                      <Icon className="h-5 w-5" />
                    </span>
                    <div>
                      <p className="font-bold text-violet-950">{action.label}</p>
                      <p className="mt-1 text-xs leading-relaxed text-violet-600/80">
                        {action.description}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            )
          })}
        </div>
      </div>

      {/* Próximos eventos */}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-bold uppercase tracking-wider text-violet-900/70">
            Próximos eventos
          </h2>
          <Link
            href="/tools/finanzas"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-violet-600 hover:text-violet-800 hover:underline"
          >
            Ver finanzas
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
        <Card className="border-violet-100 bg-white shadow-sm">
          <CardContent className="divide-y divide-violet-100 p-0">
            {isLoadingEvents ? (
              <div className="flex items-center justify-center p-6 text-violet-500 gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm">Cargando eventos...</span>
              </div>
            ) : upcomingEvents.length === 0 ? (
              <p className="p-6 text-center text-sm text-violet-500">
                No hay eventos registrados en el sistema.
              </p>
            ) : (
              upcomingEvents.map((evt) => (
                <div
                  key={evt.id}
                  className="flex items-center justify-between gap-4 p-4 transition-colors hover:bg-violet-50/40"
                >
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-violet-950">{evt.name}</p>
                    <p className="truncate text-xs text-violet-600">
                      Cliente: {evt.clientName || 'Sin especificar'}
                    </p>
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-1">
                    <Badge variant="secondary" className="bg-violet-100 text-violet-700 border-violet-200">
                      {evt.eventDate ? formatDate(evt.eventDate) : 'Por definir'}
                    </Badge>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
