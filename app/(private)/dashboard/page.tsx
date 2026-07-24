'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
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
  Plus,
  PartyPopper,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  MapPin,
  User,
} from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { useAuth } from '@/lib/auth'
import { financeApi } from '@/lib/api/finance'
import { formatCurrency, formatDate } from '@/lib/format'
import { PageHeader } from '@/components/admin/page-header'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { useIsMobile } from '@/hooks/useIsMobile'

/* ────────────────────────────────────────────────────────────────────────────
   CONSTANTES
   ─────────────────────────────────────────────────────────────────────────── */
const quickActions = [
  {
    label: 'Crear nota',
    shortLabel: 'Nota',
    description: 'Nueva nota de venta',
    href: '/tools/notas-venta/crear-nota-venta',
    icon: FilePlus2,
    color: 'bg-violet-100 text-violet-700',
  },
  {
    label: 'Nuevo evento',
    shortLabel: 'Evento',
    description: 'Agendar renta',
    href: '/tools/eventos/crear-evento',
    icon: PartyPopper,
    color: 'bg-amber-100 text-amber-700',
  },
  {
    label: 'Transacción',
    shortLabel: 'Movimiento',
    description: 'Ingreso o egreso',
    href: '/tools/finanzas',
    icon: PlusCircle,
    color: 'bg-emerald-100 text-emerald-700',
  },
  {
    label: 'Historial',
    shortLabel: 'Notas',
    description: 'Ver notas emitidas',
    href: '/tools/notas-venta',
    icon: FileText,
    color: 'bg-blue-100 text-blue-700',
  },
] as const

/* ────────────────────────────────────────────────────────────────────────────
   COMPONENTE: SkeletonCard
   ─────────────────────────────────────────────────────────────────────────── */
function SkeletonCard() {
  return (
    <Card className="border-violet-100/60 bg-white shadow-sm">
      <CardContent className="p-5 space-y-3">
        <div className="flex items-center gap-2">
          <div className="h-4 w-4 rounded-full bg-violet-200 animate-pulse" />
          <div className="h-3.5 w-24 rounded bg-violet-200 animate-pulse" />
        </div>
        <div className="h-8 w-32 rounded bg-violet-200 animate-pulse" />
      </CardContent>
    </Card>
  )
}

/* ────────────────────────────────────────────────────────────────────────────
   COMPONENTE: PrincipalPage
   ─────────────────────────────────────────────────────────────────────────── */
export default function PrincipalPage() {
  const { user } = useAuth()
  const router = useRouter()
  const isMobile = useIsMobile()

  const firstName = user?.name ? user.name.split(' ')[0] : 'Bienvenido'

  /* ── Queries ── */
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
  const upcomingEvents = safeEvents
    .filter((e: any) => e.status === 'pending' || e.status === 'delivered')
    .slice(0, 5)

  /* ── Variantes de animación ── */
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.06 },
    },
  }
  const item = {
    hidden: { opacity: 0, y: 12 },
    show: { opacity: 1, y: 0, transition: { duration: 0.25 } },
  }

  return (
    <div className="space-y-6 pb-6">
      {/* ═══════════════════════════════════════════════════════════════════
         HEADER
         ═══════════════════════════════════════════════════════════════════ */}
      <PageHeader
        title={`Hola, ${firstName}`}
        description="Resumen general de tu negocio."
      />

      {/* ═══════════════════════════════════════════════════════════════════
         RESUMEN FINANCIERO
         Cards apiladas en móvil, con indicadores visuales de tendencia.
         ═══════════════════════════════════════════════════════════════════ */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 gap-3 sm:grid-cols-3"
      >
        {/* Balance */}
        <motion.div variants={item}>
          {isLoadingSummary ? (
            <SkeletonCard />
          ) : (
            <Card
              className={cn(
                'border bg-white shadow-sm transition-all active:scale-[0.99]',
                balance >= 0 ? 'border-emerald-100' : 'border-red-100'
              )}
            >
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={cn(
                      'flex h-8 w-8 items-center justify-center rounded-lg',
                      balance >= 0 ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'
                    )}>
                      <Wallet className="h-4 w-4" />
                    </div>
                    <span className="text-xs font-bold uppercase tracking-wider text-violet-600">
                      Balance
                    </span>
                  </div>
                  {balance >= 0 ? (
                    <ArrowUpRight className="h-4 w-4 text-emerald-500" />
                  ) : (
                    <ArrowDownRight className="h-4 w-4 text-red-500" />
                  )}
                </div>
                <p className={cn(
                  'mt-2 text-2xl font-bold tracking-tight sm:text-3xl',
                  balance >= 0 ? 'text-emerald-700' : 'text-red-700'
                )}>
                  {formatCurrency(balance)}
                </p>
              </CardContent>
            </Card>
          )}
        </motion.div>

        {/* Ingresos */}
        <motion.div variants={item}>
          {isLoadingSummary ? (
            <SkeletonCard />
          ) : (
            <Card className="border-emerald-100 bg-white shadow-sm transition-all active:scale-[0.99]">
              <CardContent className="p-5">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600">
                    <TrendingUp className="h-4 w-4" />
                  </div>
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">
                    Ingresos
                  </span>
                </div>
                <p className="mt-2 text-2xl font-bold tracking-tight text-emerald-700 sm:text-3xl">
                  {formatCurrency(totalInputs)}
                </p>
              </CardContent>
            </Card>
          )}
        </motion.div>

        {/* Gastos */}
        <motion.div variants={item}>
          {isLoadingSummary ? (
            <SkeletonCard />
          ) : (
            <Card className="border-red-100 bg-white shadow-sm transition-all active:scale-[0.99]">
              <CardContent className="p-5">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-100 text-red-600">
                    <TrendingDown className="h-4 w-4" />
                  </div>
                  <span className="text-xs font-bold uppercase tracking-wider text-red-700">
                    Gastos
                  </span>
                </div>
                <p className="mt-2 text-2xl font-bold tracking-tight text-red-700 sm:text-3xl">
                  {formatCurrency(totalOutputs)}
                </p>
              </CardContent>
            </Card>
          )}
        </motion.div>
      </motion.div>

      {/* ═══════════════════════════════════════════════════════════════════
         ACCESOS RÁPIDOS
         Grid 2×2 en móvil con iconos prominentes y targets táctiles amplios.
         ═══════════════════════════════════════════════════════════════════ */}
      <div>
        <h2 className="mb-3 text-xs font-bold uppercase tracking-wider text-violet-500">
          Accesos rápidos
        </h2>
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-2 gap-3 sm:grid-cols-4"
        >
          {quickActions.map((action) => {
            const Icon = action.icon
            return (
              <motion.div key={action.href} variants={item}>
                <Link href={action.href} className="block">
                  <Card className="h-full border-violet-100/70 bg-white transition-all hover:border-violet-300 hover:shadow-md active:scale-[0.97]">
                    <CardContent className="flex h-full flex-col items-center gap-2 p-4 sm:items-start sm:gap-3 sm:p-5">
                      <span className={cn(
                        'flex h-11 w-11 items-center justify-center rounded-xl shadow-sm',
                        action.color
                      )}>
                        <Icon className="h-5 w-5" />
                      </span>
                      <div className="text-center sm:text-left">
                        <p className="text-sm font-bold text-violet-950">
                          {isMobile ? action.shortLabel : action.label}
                        </p>
                        <p className="mt-0.5 hidden text-xs leading-relaxed text-violet-500 sm:block">
                          {action.description}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            )
          })}
        </motion.div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════
         PRÓXIMOS EVENTOS
         Lista con acciones táctiles, formato de fecha legible, y link correcto.
         ═══════════════════════════════════════════════════════════════════ */}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-xs font-bold uppercase tracking-wider text-violet-500">
            Próximos eventos
          </h2>
          <Link
            href="/tools/eventos"
            className="inline-flex items-center gap-1 text-xs font-semibold text-violet-600 hover:text-violet-800 active:text-violet-900 transition-colors"
          >
            Ver todos
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <Card className="border-violet-100/70 bg-white shadow-sm overflow-hidden">
          <div className="divide-y divide-violet-50">
            {isLoadingEvents ? (
              <div className="flex items-center justify-center p-8 text-violet-400 gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm">Cargando eventos...</span>
              </div>
            ) : upcomingEvents.length === 0 ? (
              <div className="flex flex-col items-center p-8 text-center">
                <Calendar className="h-10 w-10 text-violet-200 mb-2" />
                <p className="text-sm font-semibold text-violet-800">
                  No hay eventos próximos
                </p>
                <p className="text-xs text-violet-400 mt-1">
                  Agenda tu primer evento desde el botón +
                </p>
              </div>
            ) : (
              upcomingEvents.map((evt: any) => (
                <button
                  key={evt.id}
                  onClick={() => router.push(`/tools/eventos`)}
                  className="w-full flex items-center gap-3 p-4 text-left transition-colors hover:bg-violet-50/50 active:bg-violet-100/50"
                >
                  {/* Indicador de estado */}
                  <div className={cn(
                    'flex h-10 w-10 shrink-0 items-center justify-center rounded-full',
                    evt.status === 'pending' ? 'bg-amber-100 text-amber-600' : 'bg-blue-100 text-blue-600'
                  )}>
                    {evt.status === 'pending' ? (
                      <Clock className="h-4 w-4" />
                    ) : (
                      <Calendar className="h-4 w-4" />
                    )}
                  </div>

                  {/* Info */}
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-violet-950">
                      {evt.name || 'Evento sin nombre'}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="flex items-center gap-1 text-[11px] text-violet-500">
                        <User className="h-3 w-3" />
                        {evt.clientName || 'Sin cliente'}
                      </span>
                      {evt.eventAddress && (
                        <span className="hidden sm:flex items-center gap-1 text-[11px] text-violet-400">
                          <MapPin className="h-3 w-3" />
                          <span className="truncate max-w-[120px]">{evt.eventAddress}</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Fecha + costo */}
                  <div className="shrink-0 flex flex-col items-end gap-0.5">
                    <Badge
                      variant="secondary"
                      className="bg-violet-50 text-violet-700 border-violet-100 text-[10px] font-bold"
                    >
                      {evt.eventDate ? formatDate(evt.eventDate) : 'Sin fecha'}
                    </Badge>
                    <span className="text-xs font-bold text-violet-900">
                      {formatCurrency(evt.cost || 0)}
                    </span>
                  </div>
                </button>
              ))
            )}
          </div>
        </Card>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════
         FAB — Crear Nota (acción más frecuente)
         Posicionado por encima del bottom nav.
         ═══════════════════════════════════════════════════════════════════ */}
      {isMobile && (
        <motion.button
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => router.push('/tools/notas-venta/crear-nota-venta')}
          className={cn(
            'fixed right-4 z-40 flex items-center justify-center',
            'h-14 w-14 rounded-full bg-violet-600 text-white',
            'shadow-xl shadow-violet-600/30',
            'hover:bg-violet-700 active:bg-violet-800',
            'transition-colors duration-150',
            'bottom-20'
          )}
          aria-label="Crear Nota"
        >
          <FilePlus2 className="h-6 w-6" strokeWidth={2.5} />
        </motion.button>
      )}
    </div>
  )
}