'use client'

import { useState } from 'react'
import {
    X, Calendar, MapPin, User, Phone, FileText, Clock, CheckCircle2,
    Loader2, ArrowLeftRight, ReceiptText, Edit2, ChevronRight
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
    icon: typeof Clock
    description: string
}> = {
    pending: {
        label: 'Pendiente',
        shortLabel: 'Pend.',
        bg: 'bg-amber-50',
        text: 'text-amber-800',
        border: 'border-amber-200',
        icon: Clock,
        description: 'Programado, sin entregar',
    },
    delivered: {
        label: 'Entregado',
        shortLabel: 'Entr.',
        bg: 'bg-blue-50',
        text: 'text-blue-800',
        border: 'border-blue-200',
        icon: CheckCircle2,
        description: 'Mobiliario entregado',
    },
    collected: {
        label: 'Recogido',
        shortLabel: 'Rec.',
        bg: 'bg-emerald-50',
        text: 'text-emerald-800',
        border: 'border-emerald-200',
        icon: CheckCircle2,
        description: 'Finalizado y recogido',
    },
    cancelled: {
        label: 'Cancelado',
        shortLabel: 'Canc.',
        bg: 'bg-red-50',
        text: 'text-red-800',
        border: 'border-red-200',
        icon: X,
        description: 'Evento cancelado',
    },
}

const STATUS_FLOW: EventStatus[] = ['pending', 'delivered', 'collected']

interface EventDetailSheetProps {
    event: BusinessEvent | null
    open: boolean
    onOpenChange: (open: boolean) => void
    businessConfig?: BusinessConfig
    onUpdate?: (updatedEvent: BusinessEvent) => void
}

/* ────────────────────────────────────────────────────────────────────────────
   COMPONENTE: EventDetailSheet
   ─────────────────────────────────────────────────────────────────────────── */
export function EventDetailSheet({ event, open, onOpenChange, businessConfig, onUpdate }: EventDetailSheetProps) {
    const queryClient = useQueryClient()
    const isMobile = useIsMobile()
    const router = useRouter()
    const [showStatusPicker, setShowStatusPicker] = useState(false)

    const config = businessConfig || defaultBusinessConfig

    const statusMutation = useMutation({
        mutationFn: ({ id, status }: { id: string; status: EventStatus }) =>
            financeApi.updateEventStatus(id, status),
        onSuccess: (updatedEvent) => {
            queryClient.invalidateQueries({ queryKey: ['businessEvents'] })
            toast.success('Estado actualizado')
            setTimeout(() => setShowStatusPicker(false), 350)
            if (onUpdate) onUpdate(updatedEvent)
        },
        onError: (err: any) => {
            toast.error(err.message || 'Error al actualizar el estado')
        },
    })

    if (!event) return null

    const meta = STATUS_META[event.status || 'pending']
    const StatusIcon = meta.icon

    /* ── Selector de Estado (Vista interna) ── */
    const StatusPicker = (
        <motion.div
            key="status-picker"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            className="flex flex-col h-full"
        >
            <div className="space-y-1 pb-4">
                <div className="flex items-center justify-between py-2">
                    <h3 className="text-base font-bold text-violet-950">Cambiar Estado</h3>
                    <button
                        type="button"
                        onClick={() => setShowStatusPicker(false)}
                        className="p-2 rounded-full hover:bg-violet-50 active:bg-violet-100 transition-colors"
                    >
                        <X className="w-4 h-4 text-violet-500" />
                    </button>
                </div>

                            <p className="text-xs text-violet-500 mb-3">
                                Selecciona el estado que corresponde al evento.
                            </p>
                        </div>

                            {/* Opciones de estado */}
                            <div className="space-y-2">
                                {STATUS_FLOW.map((status) => {
                                    const sMeta = STATUS_META[status]
                                    const SIcon = sMeta.icon
                                    const isCurrent = event.status === status
                                    return (
                                        <button
                                            key={status}
                                            type="button"
                                            onClick={(e) => {
                                                e.preventDefault()
                                                e.stopPropagation()
                                                if (!isCurrent) {
                                                    statusMutation.mutate({ id: event.id, status })
                                                }
                                            }}
                                            disabled={statusMutation.isPending}
                                            className={cn(
                                                'w-full flex items-center gap-3 p-3.5 rounded-xl border-2 transition-all duration-150',
                                                'active:scale-[0.98] touch-manipulation',
                                                isCurrent
                                                    ? 'border-violet-600 bg-violet-50 shadow-sm'
                                                    : 'border-transparent bg-violet-50/40 hover:bg-violet-50 hover:border-violet-200'
                                            )}
                                        >
                                            <div className={cn(
                                                'flex h-10 w-10 items-center justify-center rounded-full shrink-0',
                                                sMeta.bg
                                            )}>
                                                <SIcon className={cn('w-5 h-5', sMeta.text)} />
                                            </div>
                                            <div className="text-left flex-1 min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <p className={cn('text-sm font-bold', isCurrent ? 'text-violet-900' : 'text-violet-950')}>
                                                        {sMeta.label}
                                                    </p>
                                                    {isCurrent && (
                                                        <span className="text-[10px] font-bold bg-violet-600 text-white px-2 py-0.5 rounded-full">
                                                            Actual
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-xs text-violet-500">
                                                    {sMeta.description}
                                                </p>
                                            </div>
                                            {statusMutation.isPending && !isCurrent && (
                                                <Loader2 className="w-4 h-4 animate-spin text-violet-400 shrink-0" />
                                            )}
                                            {!isCurrent && !statusMutation.isPending && (
                                                <ChevronRight className="w-4 h-4 text-violet-300 shrink-0" />
                                            )}
                                        </button>
                                    )
                                })}

                                {/* Separador */}
                                <div className="h-px bg-violet-100 my-2" />

                                {/* Cancelar / Reactivar */}
                                {event.status !== 'cancelled' ? (
                                    <button
                                        type="button"
                                        onClick={(e) => {
                                            e.preventDefault()
                                            e.stopPropagation()
                                            statusMutation.mutate({ id: event.id, status: 'cancelled' })
                                        }}
                                        disabled={statusMutation.isPending}
                                        className={cn(
                                            'w-full flex items-center gap-3 p-3.5 rounded-xl border-2 border-transparent',
                                            'bg-red-50 hover:bg-red-100 hover:border-red-200',
                                            'active:scale-[0.98] touch-manipulation transition-all duration-150'
                                        )}
                                    >
                                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100 shrink-0">
                                            <X className="w-5 h-5 text-red-600" />
                                        </div>
                                        <div className="text-left flex-1">
                                            <p className="text-sm font-bold text-red-800">Cancelar Evento</p>
                                            <p className="text-xs text-red-500">Marcar como cancelado permanentemente</p>
                                        </div>
                                        {statusMutation.isPending && (
                                            <Loader2 className="w-4 h-4 animate-spin text-red-400 shrink-0" />
                                        )}
                                    </button>
                                ) : (
                                    <button
                                        type="button"
                                        onClick={(e) => {
                                            e.preventDefault()
                                            e.stopPropagation()
                                            statusMutation.mutate({ id: event.id, status: 'pending' })
                                        }}
                                        disabled={statusMutation.isPending}
                                        className={cn(
                                            'w-full flex items-center gap-3 p-3.5 rounded-xl border-2 border-transparent',
                                            'bg-amber-50 hover:bg-amber-100 hover:border-amber-200',
                                            'active:scale-[0.98] touch-manipulation transition-all duration-150'
                                        )}
                                    >
                                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100 shrink-0">
                                            <Clock className="w-5 h-5 text-amber-600" />
                                        </div>
                                        <div className="text-left flex-1">
                                            <p className="text-sm font-bold text-amber-800">Reactivar Evento</p>
                                            <p className="text-xs text-amber-500">Volver a estado Pendiente</p>
                                        </div>
                                        {statusMutation.isPending && (
                                            <Loader2 className="w-4 h-4 animate-spin text-amber-400 shrink-0" />
                                        )}
                                    </button>
                                )}
            </div>
        </motion.div>
    )

    /* ── Contenido principal del Sheet/Dialog ── */
    const Content = (
        <motion.div
            key="details-content"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.2 }}
            className="space-y-5 pb-6"
        >
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
                    type="button"
                    onClick={(e) => {
                        e.preventDefault()
                        onOpenChange(false)
                        router.push(`/tools/eventos/editar-evento/${event.id}`)
                    }}
                    className="w-full flex items-center justify-center gap-2 h-12 rounded-xl border border-violet-200 text-violet-700 font-semibold text-sm hover:bg-violet-50 active:bg-violet-100 active:scale-[0.97] transition-all"
                >
                    <Edit2 className="w-4 h-4" />
                    Editar Evento
                </button>
            </div>

            {/* ── Cambio de Estado (botón compacto) ── */}
            <button
                type="button"
                onClick={(e) => {
                    e.preventDefault()
                    setShowStatusPicker(true)
                }}
                className="w-full flex items-center justify-between p-4 rounded-xl border border-violet-100 bg-white hover:bg-violet-50/50 active:bg-violet-100/50 active:scale-[0.98] transition-all touch-manipulation"
            >
                <div className="flex items-center gap-2.5">
                    <div className={cn('flex h-9 w-9 items-center justify-center rounded-full', meta.bg)}>
                        <StatusIcon className={cn('w-4 h-4', meta.text)} />
                    </div>
                    <div className="text-left">
                        <p className="text-sm font-semibold text-violet-900">Estado</p>
                        <p className="text-xs text-violet-500">{meta.description}</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <span className={cn('text-xs font-bold px-2.5 py-1 rounded-md border', meta.bg, meta.text, meta.border)}>
                        {meta.label}
                    </span>
                    <ChevronRight className="w-4 h-4 text-violet-300" />
                </div>
            </button>

            {/* ── Contrato Exportable ── */}
            <div className="space-y-3 pt-2">
                <h3 className="text-[11px] font-bold text-violet-600 uppercase tracking-wider flex items-center gap-2">
                    <ReceiptText className="w-3.5 h-3.5" />
                    Contrato de Servicio
                </h3>
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
        </motion.div>
    )

    /* ── Render: Sheet (móvil) vs Dialog (desktop) ── */
    if (isMobile) {
        return (
            <>
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
                        <div className="flex-1 overflow-y-auto px-4 pb-8 overflow-x-hidden">
                            <AnimatePresence mode="wait">
                                {showStatusPicker ? StatusPicker : Content}
                            </AnimatePresence>
                        </div>
                    </SheetContent>
                </Sheet>
            </>
        )
    }

    return (
        <>
            <Dialog open={open} onOpenChange={onOpenChange}>
                <DialogContent className="max-h-[90dvh] max-w-2xl overflow-y-auto rounded-2xl border-violet-100 bg-white p-5 sm:p-6">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-bold text-violet-950">
                            Detalles del Evento
                        </DialogTitle>
                    </DialogHeader>
                    <div className="overflow-x-hidden">
                        <AnimatePresence mode="wait">
                            {showStatusPicker ? StatusPicker : Content}
                        </AnimatePresence>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    )
}