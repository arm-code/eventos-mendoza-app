'use client'

import { useState } from 'react'
import {
    X, Calendar, MapPin, User, Phone, FileText, Clock, CheckCircle2,
    Loader2, Download, ImageIcon, ArrowLeftRight, ReceiptText,
    Edit2
} from 'lucide-react'
import { toast } from 'sonner'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'

import { financeApi } from '@/lib/api/finance'
import { formatCurrency, formatDate } from '@/lib/format'
import { defaultBusinessConfig } from '@/lib/config'
import type { EventStatus, BusinessEvent, BusinessConfig } from '@/types/finance'
import { useIsMobile } from '@/hooks/useIsMobile'

import { Button } from '@/components/ui/button'
import { Sheet, SheetContent } from '@/components/ui/sheet'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { DocumentActions } from '@/components/documents/document-actions'
import { EventContractDocument, PrintEventContractDocument, EventContractData } from '@/components/documents/event-contract-document'
import { cn } from '@/lib/utils'
import { useRouter } from 'next/navigation'

/* ────────────────────────────────────────────────────────────────────────────
   CONSTANTES
   ─────────────────────────────────────────────────────────────────────────── */
const STATUS_META: Record<EventStatus, {
    label: string
    shortLabel: string
    bg: string
    text: string
    border: string
    ring: string
    icon: typeof Clock
    description: string
}> = {
    pending: {
        label: 'Pendiente',
        shortLabel: 'Pend.',
        bg: 'bg-amber-50',
        text: 'text-amber-800',
        border: 'border-amber-200',
        ring: 'ring-amber-300',
        icon: Clock,
        description: 'El evento está programado pero aún no se ha entregado el mobiliario.',
    },
    delivered: {
        label: 'Entregado',
        shortLabel: 'Entr.',
        bg: 'bg-blue-50',
        text: 'text-blue-800',
        border: 'border-blue-200',
        ring: 'ring-blue-300',
        icon: CheckCircle2,
        description: 'El mobiliario fue entregado en el domicilio del cliente.',
    },
    collected: {
        label: 'Recogido',
        shortLabel: 'Rec.',
        bg: 'bg-emerald-50',
        text: 'text-emerald-800',
        border: 'border-emerald-200',
        ring: 'ring-emerald-300',
        icon: CheckCircle2,
        description: 'El mobiliario fue devuelto y el evento está finalizado.',
    },
    cancelled: {
        label: 'Cancelado',
        shortLabel: 'Canc.',
        bg: 'bg-red-50',
        text: 'text-red-800',
        border: 'border-red-200',
        ring: 'ring-red-300',
        icon: X,
        description: 'El evento fue cancelado.',
    },
}

const STATUS_FLOW: EventStatus[] = ['pending', 'delivered', 'collected']

interface EventDetailSheetProps {
    event: BusinessEvent | null
    open: boolean
    onOpenChange: (open: boolean) => void
    businessConfig?: BusinessConfig
}

/* ────────────────────────────────────────────────────────────────────────────
   COMPONENTE: EventDetailSheet
   Sheet en móvil / Dialog en desktop.
   Muestra TODA la info del evento + contrato exportable + cambio de estado.
   ─────────────────────────────────────────────────────────────────────────── */
export function EventDetailSheet({ event, open, onOpenChange, businessConfig }: EventDetailSheetProps) {
    const queryClient = useQueryClient()
    const isMobile = useIsMobile()
    const [showStatusPicker, setShowStatusPicker] = useState(false)

    const router = useRouter()


    const config = businessConfig || defaultBusinessConfig

    const statusMutation = useMutation({
        mutationFn: ({ id, status }: { id: string; status: EventStatus }) =>
            financeApi.updateEventStatus(id, status),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['businessEvents'] })
            toast.success('Estado actualizado')
            setShowStatusPicker(false)
        },
        onError: (err: any) => {
            toast.error(err.message || 'Error al actualizar el estado')
        },
    })

    if (!event) return null

    const meta = STATUS_META[event.status || 'pending']
    const StatusIcon = meta.icon

    /* ── Contenido compartido entre Sheet y Dialog ── */
    const Content = (
        <div className="space-y-5">
            {/* ── Header: Folio + Status actual ── */}
            <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                    <p className="text-[11px] font-bold text-violet-500 tracking-wider uppercase">
                        {event.folio}
                    </p>
                    <h2 className="text-lg font-bold text-violet-950 leading-tight mt-0.5">
                        {event.name}
                    </h2>
                </div>
                <div className={cn('shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg border', meta.bg, meta.text, meta.border)}>
                    <StatusIcon className="w-3.5 h-3.5" />
                    <span className="text-xs font-bold">{meta.label}</span>
                </div>
            </div>

            {/* ── Info del Cliente ── */}
            <div className="rounded-xl bg-violet-50/60 border border-violet-100 p-4 space-y-2.5">
                <h3 className="text-[11px] font-bold text-violet-600 uppercase tracking-wider">
                    Datos del Cliente
                </h3>
                <div className="flex items-center gap-2.5">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-violet-100 text-violet-600 shrink-0">
                        <User className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                        <p className="text-sm font-semibold text-violet-950 truncate">{event.clientName}</p>
                        {event.clientPhone && (
                            <a
                                href={`tel:${event.clientPhone}`}
                                className="text-xs text-violet-600 hover:text-violet-800 hover:underline flex items-center gap-1"
                            >
                                <Phone className="w-3 h-3" />
                                {event.clientPhone}
                            </a>
                        )}
                    </div>
                </div>
            </div>

            {/* ── Info del Evento ── */}
            <div className="rounded-xl bg-violet-50/60 border border-violet-100 p-4 space-y-2.5">
                <h3 className="text-[11px] font-bold text-violet-600 uppercase tracking-wider">
                    Detalles del Evento
                </h3>
                <div className="space-y-2">
                    <div className="flex items-center gap-2.5 text-sm text-violet-900">
                        <Calendar className="w-4 h-4 text-violet-400 shrink-0" />
                        <span className="font-medium">{event.date ? formatDate(event.date) : 'Por definir'}</span>
                    </div>
                    <div className="flex items-start gap-2.5 text-sm text-violet-800">
                        <MapPin className="w-4 h-4 text-violet-400 shrink-0 mt-0.5" />
                        <span className="leading-relaxed">{event.eventAddress}</span>
                    </div>
                    {event.noteFolio && (
                        <div className="flex items-center gap-2.5 text-sm text-violet-700 font-semibold pt-1">
                            <FileText className="w-4 h-4 text-violet-500 shrink-0" />
                            <span>Nota vinculada: {event.noteFolio}</span>
                        </div>
                    )}
                </div>
            </div>

            {/* ── Costo ── */}
            <div className="rounded-xl bg-violet-600 p-4 flex items-center justify-between">
                <span className="text-violet-100 text-sm font-medium">Costo Total</span>
                <span className="text-white text-2xl font-bold">{formatCurrency(event.cost || 0)}</span>
            </div>

            {/* ── Acciones del evento ── */}
            <div className="flex flex-col gap-2 pt-2">
                <button
                    onClick={() => {
                        onOpenChange(false)
                        router.push(`/tools/eventos/editar-evento/${event.id}`)
                    }}
                    className="w-full flex items-center justify-center gap-2 h-12 rounded-xl border border-violet-200 text-violet-700 font-semibold text-sm hover:bg-violet-50 active:bg-violet-100 active:scale-[0.97] transition-all"
                >
                    <Edit2 className="w-4 h-4" />
                    Editar Evento
                </button>
            </div>

            {/* ── Cambio de Estado (Accordion) ── */}
            <div className="rounded-xl border border-violet-100 overflow-hidden">
                <button
                    onClick={() => setShowStatusPicker((p) => !p)}
                    className="w-full flex items-center justify-between p-4 hover:bg-violet-50/50 active:bg-violet-100/50 transition-colors"
                >
                    <div className="flex items-center gap-2.5">
                        <ArrowLeftRight className="w-4 h-4 text-violet-500" />
                        <span className="text-sm font-semibold text-violet-900">Cambiar Estado</span>
                    </div>
                    <div className={cn('flex items-center gap-1.5 px-2.5 py-1 rounded-md border text-xs font-bold', meta.bg, meta.text, meta.border)}>
                        <StatusIcon className="w-3 h-3" />
                        {meta.label}
                    </div>
                </button>

                <AnimatePresence>
                    {showStatusPicker && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="overflow-hidden"
                        >
                            <div className="p-3 space-y-2 border-t border-violet-50">
                                <p className="text-[11px] text-violet-500 font-medium px-1">
                                    Selecciona el nuevo estado:
                                </p>
                                {STATUS_FLOW.map((status) => {
                                    const sMeta = STATUS_META[status]
                                    const SIcon = sMeta.icon
                                    const isCurrent = event.status === status
                                    return (
                                        <button
                                            key={status}
                                            onClick={() => {
                                                if (!isCurrent) {
                                                    statusMutation.mutate({ id: event.id, status })
                                                }
                                            }}
                                            disabled={statusMutation.isPending || isCurrent}
                                            className={cn(
                                                'w-full flex items-center gap-3 p-3 rounded-xl border transition-all duration-150',
                                                'active:scale-[0.98] touch-manipulation',
                                                isCurrent
                                                    ? 'bg-violet-600 text-white border-violet-600 shadow-md'
                                                    : 'bg-white hover:bg-violet-50 active:bg-violet-100 border-violet-100'
                                            )}
                                        >
                                            <SIcon className={cn('w-4 h-4 shrink-0', isCurrent ? 'text-white' : sMeta.text)} />
                                            <div className="text-left flex-1 min-w-0">
                                                <p className={cn('text-sm font-semibold', isCurrent ? 'text-white' : 'text-violet-900')}>
                                                    {sMeta.label}
                                                </p>
                                                <p className={cn('text-[11px] leading-tight', isCurrent ? 'text-violet-100' : 'text-violet-500')}>
                                                    {sMeta.description}
                                                </p>
                                            </div>
                                            {isCurrent && (
                                                <span className="text-[10px] font-bold bg-white/20 px-2 py-0.5 rounded-full text-white">
                                                    Actual
                                                </span>
                                            )}
                                            {statusMutation.isPending && !isCurrent && (
                                                <Loader2 className="w-4 h-4 animate-spin text-violet-400" />
                                            )}
                                        </button>
                                    )
                                })}

                                {/* Cancelado siempre disponible como opción separada */}
                                {event.status !== 'cancelled' && (
                                    <button
                                        onClick={() => statusMutation.mutate({ id: event.id, status: 'cancelled' })}
                                        disabled={statusMutation.isPending}
                                        className={cn(
                                            'w-full flex items-center gap-3 p-3 rounded-xl border transition-all duration-150',
                                            'bg-red-50 hover:bg-red-100 active:bg-red-200 border-red-200',
                                            'active:scale-[0.98] touch-manipulation'
                                        )}
                                    >
                                        <X className="w-4 h-4 shrink-0 text-red-600" />
                                        <div className="text-left flex-1">
                                            <p className="text-sm font-semibold text-red-800">Cancelar Evento</p>
                                            <p className="text-[11px] text-red-500 leading-tight">
                                                Marcar como cancelado permanentemente
                                            </p>
                                        </div>
                                    </button>
                                )}

                                {event.status === 'cancelled' && (
                                    <button
                                        onClick={() => statusMutation.mutate({ id: event.id, status: 'pending' })}
                                        disabled={statusMutation.isPending}
                                        className={cn(
                                            'w-full flex items-center gap-3 p-3 rounded-xl border transition-all duration-150',
                                            'bg-amber-50 hover:bg-amber-100 active:bg-amber-200 border-amber-200',
                                            'active:scale-[0.98] touch-manipulation'
                                        )}
                                    >
                                        <Clock className="w-4 h-4 shrink-0 text-amber-600" />
                                        <div className="text-left flex-1">
                                            <p className="text-sm font-semibold text-amber-800">Reactivar Evento</p>
                                            <p className="text-[11px] text-amber-500 leading-tight">
                                                Volver a estado Pendiente
                                            </p>
                                        </div>
                                    </button>
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* ── Contrato Exportable ── */}
            <DocumentActions
                filename={`contrato-evento-${event.folio}`}
                exportNode={
                    <PrintEventContractDocument
                        event={event as EventContractData}
                        business={config}
                    />
                }
            />
        </div>
    )

    /* ── Render: Sheet (móvil) vs Dialog (desktop) ── */
    if (isMobile) {
        return (
            <Sheet open={open} onOpenChange={onOpenChange}>
                <SheetContent
                    side="bottom"
                    className="max-h-[92dvh] h-auto rounded-t-3xl border-t border-violet-100 bg-white p-0 flex flex-col overflow-hidden"
                >
                    {/* Handle nativo iOS-style */}
                    <div className="sticky top-0 z-10 bg-white px-4 pt-3 pb-2 flex-shrink-0">
                        <div className="w-10 h-1 rounded-full bg-violet-200 mx-auto mb-3" />
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-bold text-violet-950">Detalles del Evento</h2>
                            <button
                                onClick={() => onOpenChange(false)}
                                className="p-2 rounded-full hover:bg-violet-50 active:bg-violet-100 transition-colors"
                                aria-label="Cerrar"
                            >
                                <X className="w-5 h-5 text-violet-500" />
                            </button>
                        </div>
                    </div>
                    <div className="flex-1 overflow-y-auto px-4 pb-8">
                        {Content}
                    </div>
                </SheetContent>
            </Sheet>
        )
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-h-[90dvh] max-w-2xl overflow-y-auto rounded-2xl border-violet-100 bg-white p-5 sm:p-6">
                <DialogHeader>
                    <DialogTitle className="text-xl font-bold text-violet-950">
                        Detalles del Evento
                    </DialogTitle>
                </DialogHeader>
                {Content}
            </DialogContent>
        </Dialog>
    )
}