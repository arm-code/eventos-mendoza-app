'use client'

import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import {
  ArrowLeftRight,
  CalendarPlus,
  CalendarX2,
  ChevronRight,
  FilePlus2,
  FileText,
  Plus,
  RotateCw,
  type LucideIcon,
} from 'lucide-react'
import { useAuth } from '@/lib/auth'
import { financeApi } from '@/lib/api/finance'
import { formatCurrency } from '@/lib/format'
import { PageHeader } from '@/components/admin/page-header'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

/* ─── Tipos ─────────────────────────────────────────────────────────────── */

interface BusinessEvent {
  id: string | number
  name?: string | null
  clientName?: string | null
  eventAddress?: string | null
  eventDate?: string | null
  cost?: number | string | null
  status?: string | null
}

interface QuickAction {
  label: string
  href: string
  icon: LucideIcon
}

/* ─── Constantes ────────────────────────────────────────────────────────── */

const QUICK_ACTIONS: readonly QuickAction[] = [
  { label: 'Nueva nota', href: '/tools/notas-venta/crear-nota-venta', icon: FilePlus2 },
  { label: 'Nuevo evento', href: '/tools/eventos/crear-evento', icon: CalendarPlus },
  { label: 'Registrar movimiento', href: '/tools/finanzas', icon: ArrowLeftRight },
  { label: 'Ver notas', href: '/tools/notas-venta', icon: FileText },
]

// Allowlist: solo estos estados se muestran como "próximos"
const STATUS_LABEL: Record<string, string> = {
  pending: 'Pendiente',
  delivered: 'Entregado',
}

const MAX_UPCOMING = 5

const dayFmt = new Intl.DateTimeFormat('es-MX', { day: 'numeric' })
const monthFmt = new Intl.DateTimeFormat('es-MX', { month: 'short' })

/* ─── Utilidades ────────────────────────────────────────────────────────── */

function toNumber(value: unknown): number {
  const n = Number(value)
  return Number.isFinite(n) ? n : 0
}

/**
 * "2026-09-25" con new Date() se interpreta en UTC y en México se muestra
 * como el día anterior. Aquí se construye en hora local.
 */
function parseEventDate(value?: string | null): Date | null {
  if (!value) return null
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value)
  const date = m ? new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3])) : new Date(value)
  return Number.isNaN(date.getTime()) ? null : date
}

function getUpcoming(events: unknown): BusinessEvent[] {
  if (!Array.isArray(events)) return []
  return (events as BusinessEvent[])
    .filter((e) => e && typeof e.status === 'string' && e.status in STATUS_LABEL)
    .sort((a, b) => {
      const da = parseEventDate(a.eventDate)?.getTime() ?? Infinity
      const db = parseEventDate(b.eventDate)?.getTime() ?? Infinity
      return da - db
    })
    .slice(0, MAX_UPCOMING)
}

/* ─── Página ────────────────────────────────────────────────────────────── */

export default function PrincipalPage() {
  const { user } = useAuth()
  const firstName = user?.name?.trim().split(/\s+/)[0]

  const summaryQuery = useQuery({
    queryKey: ['transactionsSummary'],
    queryFn: () => financeApi.getSummary(),
  })

  const eventsQuery = useQuery({
    queryKey: ['businessEvents'],
    queryFn: () => financeApi.getBusinessEvents(),
  })

  const upcoming = getUpcoming(eventsQuery.data)

  return (
    <div className="space-y-8 pb-28 sm:pb-8">
      <PageHeader
        title={firstName ? `Hola, ${firstName}` : 'Hola'}
        description="Así va tu negocio."
      />

      {/* Resumen */}
      <section aria-label="Resumen de dinero">
        {summaryQuery.isLoading ? (
          <SummarySkeleton />
        ) : summaryQuery.isError ? (
          <InlineError
            message="No se pudo cargar tu resumen."
            onRetry={() => summaryQuery.refetch()}
          />
        ) : (
          <SummaryCard
            balance={toNumber(summaryQuery.data?.balance)}
            inputs={toNumber(summaryQuery.data?.totalInputs)}
            outputs={toNumber(summaryQuery.data?.totalOutputs)}
          />
        )}
      </section>

      {/* Accesos rápidos */}
      <section aria-labelledby="quick-actions-title" className="space-y-3">
        <h2 id="quick-actions-title" className="text-base font-semibold">
          ¿Qué quieres hacer?
        </h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {QUICK_ACTIONS.map(({ label, href, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex min-h-24 flex-col justify-between gap-3 rounded-xl border bg-card p-4',
                'transition-colors hover:bg-accent active:bg-accent',
                'outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50'
              )}
            >
              <span className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Icon className="size-5" aria-hidden />
              </span>
              <span className="text-[15px] font-medium leading-snug">{label}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Próximos eventos */}
      <section aria-labelledby="events-title" className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 id="events-title" className="text-base font-semibold">
            Próximos eventos
          </h2>
          <Button asChild variant="ghost" size="sm" className="-mr-2 text-primary">
            <Link href="/tools/eventos">Ver todos</Link>
          </Button>
        </div>

        {eventsQuery.isLoading ? (
          <EventsSkeleton />
        ) : eventsQuery.isError ? (
          <InlineError
            message="No se pudieron cargar tus eventos."
            onRetry={() => eventsQuery.refetch()}
          />
        ) : upcoming.length === 0 ? (
          <EmptyEvents />
        ) : (
          <Card className="gap-0 overflow-hidden py-0">
            <ul className="divide-y">
              {upcoming.map((evt) => (
                <li key={evt.id}>
                  <EventRow event={evt} />
                </li>
              ))}
            </ul>
          </Card>
        )}
      </section>

      {/* Botón flotante: solo en móvil, vía CSS (sin parpadeo de hidratación) */}
      <Link
        href="/tools/notas-venta/crear-nota-venta"
        aria-label="Nueva nota de venta"
        className={cn(
          'fixed right-4 z-40 flex size-14 items-center justify-center rounded-full sm:hidden',
          'bottom-[calc(5rem+env(safe-area-inset-bottom))]',
          'bg-primary text-primary-foreground shadow-lg shadow-primary/25',
          'transition-transform active:scale-95 motion-reduce:transition-none',
          'outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50'
        )}
      >
        <Plus className="size-6" strokeWidth={2.5} aria-hidden />
      </Link>
    </div>
  )
}

/* ─── Subcomponentes ────────────────────────────────────────────────────── */

function SummaryCard({ balance, inputs, outputs }: { balance: number; inputs: number; outputs: number }) {
  return (
    <Card className="gap-0 py-0">
      <div className="p-5">
        <p className="text-sm text-muted-foreground">Te queda</p>
        <p
          className={cn(
            'mt-1 text-4xl font-semibold tracking-tight tabular-nums',
            balance < 0 && 'text-destructive'
          )}
        >
          {formatCurrency(balance)}
        </p>
      </div>
      <dl className="grid grid-cols-2 border-t">
        <Stat label="Entró" value={inputs} dotClass="bg-success" />
        <Stat label="Salió" value={outputs} dotClass="bg-destructive" className="border-l" />
      </dl>
    </Card>
  )
}

function Stat({
  label,
  value,
  dotClass,
  className,
}: {
  label: string
  value: number
  dotClass: string
  className?: string
}) {
  return (
    <div className={cn('px-5 py-4', className)}>
      <dt className="flex items-center gap-2 text-sm text-muted-foreground">
        <span className={cn('size-2 rounded-full', dotClass)} aria-hidden />
        {label}
      </dt>
      <dd className="mt-1 text-lg font-medium tabular-nums">{formatCurrency(value)}</dd>
    </div>
  )
}

function EventRow({ event }: { event: BusinessEvent }) {
  const date = parseEventDate(event.eventDate)
  const isPending = event.status === 'pending'

  return (
    <Link
      href="/tools/eventos"
      className={cn(
        'flex min-h-16 items-center gap-3 px-4 py-3',
        'transition-colors hover:bg-accent/60 active:bg-accent',
        'outline-none focus-visible:bg-accent'
      )}
    >
      {/* Fecha grande y legible */}
      <div className="flex size-12 shrink-0 flex-col items-center justify-center rounded-lg bg-muted leading-none">
        {date ? (
          <>
            <span className="text-lg font-semibold tabular-nums">{dayFmt.format(date)}</span>
            <span className="mt-0.5 text-xs text-muted-foreground">
              {monthFmt.format(date).replace('.', '')}
            </span>
          </>
        ) : (
          <span className="text-xs text-muted-foreground">—</span>
        )}
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate font-medium">{event.name || 'Evento sin nombre'}</p>
        <p className="truncate text-sm text-muted-foreground">{event.clientName || 'Sin cliente'}</p>
      </div>

      <div className="flex shrink-0 flex-col items-end gap-0.5">
        <span className="font-medium tabular-nums">{formatCurrency(toNumber(event.cost))}</span>
        <span className={cn('text-xs', isPending ? 'text-primary' : 'text-muted-foreground')}>
          {STATUS_LABEL[event.status ?? '']}
        </span>
      </div>

      <ChevronRight className="size-4 shrink-0 text-muted-foreground/60" aria-hidden />
    </Link>
  )
}

function EmptyEvents() {
  return (
    <Card className="items-center gap-3 px-6 py-10 text-center">
      <CalendarX2 className="size-8 text-muted-foreground/60" aria-hidden />
      <p className="font-medium">No tienes eventos próximos</p>
      <Button asChild size="lg" className="mt-1">
        <Link href="/tools/eventos/crear-evento">Agendar evento</Link>
      </Button>
    </Card>
  )
}

function InlineError({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <Card className="flex-row items-center justify-between gap-3 px-5 py-4">
      <p className="text-sm text-muted-foreground">{message} Revisa tu conexión.</p>
      <Button variant="outline" size="sm" onClick={onRetry}>
        <RotateCw aria-hidden />
        Reintentar
      </Button>
    </Card>
  )
}

function SummarySkeleton() {
  return (
    <Card className="gap-0 py-0" aria-busy="true" aria-label="Cargando resumen">
      <div className="space-y-2 p-5">
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-10 w-44" />
      </div>
      <div className="grid grid-cols-2 border-t">
        <div className="space-y-2 px-5 py-4">
          <Skeleton className="h-4 w-14" />
          <Skeleton className="h-6 w-24" />
        </div>
        <div className="space-y-2 border-l px-5 py-4">
          <Skeleton className="h-4 w-14" />
          <Skeleton className="h-6 w-24" />
        </div>
      </div>
    </Card>
  )
}

function EventsSkeleton() {
  return (
    <Card className="gap-0 py-0" aria-busy="true" aria-label="Cargando eventos">
      <div className="divide-y">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3 px-4 py-3">
            <Skeleton className="size-12 rounded-lg" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-3/5" />
              <Skeleton className="h-3.5 w-2/5" />
            </div>
            <Skeleton className="h-4 w-16" />
          </div>
        ))}
      </div>
    </Card>
  )
}