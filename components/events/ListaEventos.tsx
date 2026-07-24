'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
    Calendar, MapPin, User, CheckCircle2, Clock, XCircle, Loader2, Eye,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import type { BusinessEvent, EventStatus } from '@/types/finance'
import { formatCurrency, formatDate } from '@/lib/format'
import { financeApi } from '@/lib/api/finance'
import { Loader } from '../Loaders/Loader.component'
import { Button } from '../ui/button'

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
        bg: 'bg-amber-50', text: 'text-amber-800', border: 'border-amber-200',
        icon: Clock, dot: 'bg-amber-500',
    },
    delivered: {
        label: 'Entregado', shortLabel: 'Entr.',
        bg: 'bg-blue-50', text: 'text-blue-800', border: 'border-blue-200',
        icon: CheckCircle2, dot: 'bg-blue-500',
    },
    collected: {
        label: 'Recogido', shortLabel: 'Rec.',
        bg: 'bg-emerald-50', text: 'text-emerald-800', border: 'border-emerald-200',
        icon: CheckCircle2, dot: 'bg-emerald-500',
    },
    cancelled: {
        label: 'Cancelado', shortLabel: 'Canc.',
        bg: 'bg-red-50', text: 'text-red-800', border: 'border-red-200',
        icon: XCircle, dot: 'bg-red-500',
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
        onError: (err: any) => {
            toast.error(err.message || 'Error al actualizar el estado')
        },
    })

    function quickAdvanceStatus(evt: BusinessEvent, e: React.MouseEvent) {
        e.stopPropagation()
        const flow: EventStatus[] = ['pending', 'delivered', 'collected']
        const idx = flow.indexOf(evt.status || 'pending')
        if (idx >= 0 && idx < flow.length - 1) {
            statusMutation.mutate({ id: evt.id, status: flow[idx + 1] })
        }
    }

    /* ── Render ── */
    return (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <AnimatePresence mode="popLayout">
                {filteredEvents.map((evt) => {
                    const meta = STATUS_META[evt.status || 'pending']
                    const StatusIcon = meta.icon
                    const canAdvance = evt.status === 'pending' || evt.status === 'delivered'

                    return (
                        <motion.div
                            key={evt.id}
                            layout
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.96 }}
                            transition={{ duration: 0.2 }}
                        >
                            <Card
                                className="border-violet-100/70 bg-white shadow-sm hover:shadow-md hover:border-violet-200 transition-all duration-200 overflow-hidden cursor-pointer active:scale-[0.99]"
                                onClick={() => onSelectEvent(evt)}
                            >
                                <CardContent className="p-0">
                                    {/* ── Color strip según status ── */}
                                    <div className={cn('h-1 w-full', meta.dot)} />

                                    <div className="p-4 space-y-3">
                                        {/* Header: Folio + Status */}
                                        <div className="flex items-start justify-between gap-2">
                                            <div className="min-w-0">
                                                <p className="text-[10px] font-bold text-violet-400 tracking-wider uppercase">
                                                    {evt.folio}
                                                </p>
                                                <h3 className="font-bold text-violet-950 text-[15px] leading-tight truncate mt-0.5 capitalize">
                                                    {evt.name}
                                                </h3>
                                            </div>
                                            <div className={cn('shrink-0 flex items-center gap-1 px-2 py-1 rounded-md border', meta.bg, meta.text, meta.border)}>
                                                <StatusIcon className="w-3 h-3" />
                                                <span className="text-[10px] font-bold  sm:inline">{meta.label}</span>
                                            </div>
                                        </div>

                                        {/* Info minimalista: Cliente + Fecha + Dirección */}
                                        <div className="space-y-1.5">
                                            <div className="flex items-center gap-2 text-[13px] text-violet-900">
                                                <User className="w-3.5 h-3.5 text-violet-400 shrink-0" />
                                                <span className="font-semibold truncate capitalize">{evt.clientName}</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-[12px] text-violet-600">
                                                <Calendar className="w-3.5 h-3.5 text-violet-400 shrink-0" />
                                                <span className='capitalize'>{evt.date ? formatDate(evt.date) : 'Por definir'}</span>
                                            </div>
                                            <div className="flex items-start gap-2 text-[12px] text-violet-500">
                                                <MapPin className="w-3.5 h-3.5 text-violet-400 shrink-0 mt-0.5" />
                                                <span className="line-clamp-1 capitalize">{evt.eventAddress}</span>
                                            </div>
                                        </div>

                                        {/* Footer: Costo + Acciones */}
                                        <div className="flex items-center justify-between pt-2 border-t border-violet-50">
                                            <span className="text-lg font-bold text-violet-950">
                                                {formatCurrency(evt.cost || 0)}
                                            </span>

                                            <div className="flex items-center gap-2">

                                                {/* Botón Ver Detalles */}
                                                <Button
                                                    onClick={(e) => {
                                                        e.stopPropagation()
                                                        onSelectEvent(evt)
                                                    }}
                                                    className={cn(
                                                        'flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold',
                                                        'bg-violet-600 text-white hover:bg-violet-700 active:bg-violet-800',
                                                        'active:scale-90 transition-all shadow-sm'
                                                    )}
                                                >
                                                    <Eye className="w-3.5 h-3.5" />
                                                    <span className="hidden sm:inline">Ver Detalles</span>
                                                    <span className="sm:hidden">Detalles</span>
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    )
                })}
            </AnimatePresence>

            {/* ── Estado vacío ── */}
            {filteredEvents.length === 0 && (
                <Card className="col-span-full border-violet-100 bg-white p-8 text-center">
                    {isLoading ? (
                        <div className="flex items-center justify-center gap-2 text-violet-600 font-semibold py-4">
                            <Loader />
                            <span>Cargando eventos...</span>
                        </div>
                    ) : (
                        <motion.div
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="space-y-3"
                        >
                            <Calendar className="w-12 h-12 text-violet-300 mx-auto opacity-60" />
                            <p className="text-violet-900 font-bold text-base">
                                No hay eventos {activeTab !== 'all' ? 'en esta categoría' : 'guardados'}.
                            </p>
                            <p className="text-sm text-violet-500">
                                Presiona el botón + para agendar el primer servicio.
                            </p>
                        </motion.div>
                    )}
                </Card>
            )}
        </div>
    )
}
