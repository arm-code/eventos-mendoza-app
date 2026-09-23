// components/events/ListaEventos.tsx
'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
    Calendar, MapPin, User, CheckCircle2, Clock, XCircle, Eye,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import type { BusinessEvent, EventStatus } from '@/types/finance'
import { formatCurrency, formatDate } from '@/lib/format'
import { financeApi } from '@/lib/api/finance'
import { Button } from '@/components/ui/button'

/* ────────────────────────────────────────────────────────────────────────────
   CONSTANTES
   ─────────────────────────────────────────────────────────────────────────── */
const STATUS_META: Record<EventStatus, {
    label: string
    shortLabel: string
    bg: string
    text: string
    border: string
    icon: typeof Clock
    dot: string
}> = {
    pending: {
        label: 'Pendiente', shortLabel: 'Pend.',
        bg: 'bg-amber-500/10', text: 'text-amber-700', border: 'border-amber-500/20',
        icon: Clock, dot: 'bg-amber-500',
    },
    delivered: {
        label: 'Entregado', shortLabel: 'Entr.',
        bg: 'bg-primary/10', text: 'text-primary', border: 'border-primary/20',
        icon: CheckCircle2, dot: 'bg-primary',
    },
    collected: {
        label: 'Recogido', shortLabel: 'Rec.',
        bg: 'bg-success/10', text: 'text-success', border: 'border-success/20',
        icon: CheckCircle2, dot: 'bg-success',
    },
    cancelled: {
        label: 'Cancelado', shortLabel: 'Canc.',
        bg: 'bg-destructive/10', text: 'text-destructive', border: 'border-destructive/20',
        icon: XCircle, dot: 'bg-destructive',
    },
}

/* ────────────────────────────────────────────────────────────────────────────
   PROPS
   ─────────────────────────────────────────────────────────────────────────── */
interface ListaEventosProps {
    filteredEvents: BusinessEvent[]
    isLoading: boolean
    activeTab: 'upcoming' | 'finished' | 'cancelled' | 'all'
    onSelectEvent: (event: BusinessEvent) => void
}

/* ────────────────────────────────────────────────────────────────────────────
   COMPONENTE
   ─────────────────────────────────────────────────────────────────────────── */
export function ListaEventos({ filteredEvents, isLoading, activeTab, onSelectEvent }: ListaEventosProps) {
    const queryClient = useQueryClient()

    /* ── Mutación de cambio rápido de estado ── */
    const statusMutation = useMutation({
        mutationFn: ({ id, status }: { id: string; status: EventStatus }) =>
            financeApi.updateEventStatus(id, status),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['businessEvents'] })
            toast.success('Estado actualizado')
        },
        onError: (err: unknown) => {
            const error = err as { message?: string }
            toast.error(error.message || 'Error al actualizar el estado')
        },
    })

    /* ── Render ── */
    return (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {isLoading ? (
                Array.from({ length: 4 }).map((_, i) => (
                    <Card key={i} className="gap-0 py-0 overflow-hidden" aria-busy="true">
                        <div className="h-1 w-full bg-muted" />
                        <CardContent className="p-4 space-y-3">
                            <div className="flex justify-between">
                                <Skeleton className="h-5 w-3/5" />
                                <Skeleton className="h-5 w-20 rounded-md" />
                            </div>
                            <div className="space-y-2">
                                <Skeleton className="h-4 w-4/5" />
                                <Skeleton className="h-4 w-3/5" />
                                <Skeleton className="h-4 w-full" />
                            </div>
                            <div className="flex justify-between pt-2 border-t">
                                <Skeleton className="h-6 w-24" />
                                <Skeleton className="h-9 w-28 rounded-lg" />
                            </div>
                        </CardContent>
                    </Card>
                ))
            ) : filteredEvents.length === 0 ? (
                <Card className="col-span-full flex flex-col items-center gap-3 p-8 text-center">
                    <Calendar className="size-12 text-muted-foreground/60" aria-hidden />
                    <p className="font-medium text-foreground">
                        No hay eventos {activeTab !== 'all' ? 'en esta categoría' : 'guardados'}.
                    </p>
                    <p className="text-sm text-muted-foreground">
                        Presiona el botón + para agendar el primer servicio.
                    </p>
                </Card>
            ) : (
                filteredEvents.map((evt) => {
                    const meta = STATUS_META[evt.status || 'pending']
                    const StatusIcon = meta.icon

                    return (
                        <div key={evt.id} className="min-w-0">
                            <Card
                                className={cn(
                                    'gap-0 py-0 overflow-hidden cursor-pointer transition-colors',
                                    'hover:bg-accent/40 active:bg-accent',
                                    'outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50'
                                )}
                                onClick={() => onSelectEvent(evt)}
                            >
                                <CardContent className="p-0">
                                    {/* ── Color strip según status ── */}
                                    <div className={cn('h-1 w-full', meta.dot)} aria-hidden />

                                    <div className="p-4 space-y-3">
                                        {/* Header: Folio + Status */}
                                        <div className="flex items-start justify-between gap-2">
                                            <div className="min-w-0 flex-1">
                                                <h3 className="font-semibold text-foreground text-[15px] leading-tight truncate">
                                                    {evt.name}
                                                </h3>
                                            </div>
                                            <div className={cn('shrink-0 flex items-center gap-1 px-2 py-1 rounded-md border text-xs font-semibold', meta.bg, meta.text, meta.border)}>
                                                <StatusIcon className="size-3" aria-hidden />
                                                <span>{meta.label}</span>
                                            </div>
                                        </div>

                                        {/* Info minimalista: Cliente + Fecha + Dirección */}
                                        <div className="space-y-1.5 text-sm text-muted-foreground">
                                            <div className="flex items-center gap-2 min-w-0">
                                                <User className="size-3.5 text-muted-foreground shrink-0" aria-hidden />
                                                <span className="font-medium text-foreground truncate">{evt.clientName}</span>
                                            </div>
                                            <div className="flex items-center gap-2 min-w-0">
                                                <Calendar className="size-3.5 text-muted-foreground shrink-0" aria-hidden />
                                                <span>{evt.date ? formatDate(evt.date) : 'Por definir'}</span>
                                            </div>
                                            <div className="flex items-start gap-2 min-w-0">
                                                <MapPin className="size-3.5 text-muted-foreground shrink-0 mt-0.5" aria-hidden />
                                                <span className="truncate">{evt.eventAddress}</span>
                                            </div>
                                        </div>

                                        {/* Footer: Costo + Acciones */}
                                        <div className="flex items-center justify-between pt-2 border-t">
                                            <span className="text-base font-semibold tabular-nums text-foreground">
                                                {formatCurrency(evt.cost || 0)}
                                            </span>

                                            <div className="flex items-center gap-2">
                                                <Button
                                                    size="sm"
                                                    onClick={(e) => {
                                                        e.stopPropagation()
                                                        onSelectEvent(evt)
                                                    }}
                                                    className="h-9 gap-1.5 px-3 text-xs"
                                                >
                                                    <Eye className="size-3.5" aria-hidden />
                                                    <span>Detalles</span>
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    )
                })
            )}
        </div>
    )
}