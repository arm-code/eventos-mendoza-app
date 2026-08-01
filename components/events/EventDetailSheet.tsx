'use client'

import { useState } from 'react'
import {
    X, Calendar, MapPin, User, Phone, FileText, Clock, CheckCircle2,
    Loader2, ArrowLeftRight, ReceiptText, Edit2, ChevronRight, MessageCircle, ExternalLink, Map
} from 'lucide-react'
import { toast } from 'sonner'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'

import { financeApi } from '@/lib/api/finance'
import { formatCurrency, formatDate } from '@/lib/format'
import { defaultBusinessConfig } from '@/lib/config'
import type { EventStatus, BusinessEvent, BusinessConfig } from '@/types/finance'

import { Button } from '@/components/ui/button'
import { AppBottomSheet } from '@/components/ui/app-bottom-sheet'
import { Select, SelectContent, SelectItem, SelectTrigger } from '@/components/ui/select'
import { DocumentActions } from '@/components/documents/document-actions'
import { PrintEventContractDocument, EventContractData } from '@/components/documents/event-contract-document'
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
    const router = useRouter()

    const config = businessConfig || defaultBusinessConfig

    const statusMutation = useMutation({
        mutationFn: ({ id, status }: { id: string; status: EventStatus }) =>
            financeApi.updateEventStatus(id, status),
        onSuccess: (updatedEvent) => {
            queryClient.invalidateQueries({ queryKey: ['businessEvents'] })
            toast.success('Estado actualizado')
            if (onUpdate) onUpdate(updatedEvent)
        },
        onError: (err: any) => {
            toast.error(err.message || 'Error al actualizar el estado')
        },
    })

    if (!event) return null

    const meta = STATUS_META[event.status || 'pending']
    const StatusIcon = meta.icon



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
            <div className="rounded-xl bg-violet-50/60 border border-violet-100 p-4 space-y-3">
                <h3 className="text-[11px] font-bold text-violet-600 uppercase tracking-wider">
                    Datos del Cliente
                </h3>
                <div className="flex items-center gap-2.5">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-violet-100 text-violet-600 shrink-0">
                        <User className="w-4 h-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-violet-950 truncate">{event.clientName}</p>
                        {event.clientPhone && (
                            <p className="text-xs text-violet-500">{event.clientPhone}</p>
                        )}
                    </div>
                </div>
                {event.clientPhone && (
                    <div className="flex gap-2 mt-2">
                        <a 
                            href={`tel:${event.clientPhone.replace(/\D/g, '')}`}
                            className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg bg-white border border-violet-200 text-violet-700 text-xs font-semibold hover:bg-violet-50 transition-colors"
                        >
                            <Phone className="w-3.5 h-3.5" />
                            Llamar
                        </a>
                        <a 
                            href={`https://wa.me/${event.clientPhone.replace(/\D/g, '')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg bg-green-50 border border-green-200 text-green-700 text-xs font-semibold hover:bg-green-100 transition-colors"
                        >
                            <MessageCircle className="w-3.5 h-3.5" />
                            WhatsApp
                        </a>
                    </div>
                )}
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
                    <div className="flex flex-col gap-2">
                        <div className="flex items-start gap-2.5 text-sm text-violet-800">
                            <MapPin className="w-4 h-4 text-violet-400 shrink-0 mt-0.5" />
                            <span className="leading-relaxed flex-1">{event.eventAddress}</span>
                        </div>
                        {event.eventAddress && (
                            <a
                                href={`https://maps.google.com/?q=${encodeURIComponent(event.eventAddress)}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="ml-6 flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-white border border-violet-200 text-violet-700 text-xs font-semibold hover:bg-violet-50 transition-colors"
                            >
                                <Map className="w-3.5 h-3.5" />
                                Ver en Google Maps
                                <ExternalLink className="w-3 h-3 ml-auto opacity-50" />
                            </a>
                        )}
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

            {/* ── Cambio de Estado (Select nativo) ── */}
            <Select
                value={event.status || 'pending'}
                onValueChange={(val: EventStatus) => {
                    if (val !== event.status) {
                        statusMutation.mutate({ id: event.id, status: val })
                    }
                }}
                disabled={statusMutation.isPending}
            >
                <SelectTrigger className="w-full h-auto p-4 rounded-xl border border-violet-100 bg-white hover:bg-violet-50/50 outline-none focus:ring-2 focus:ring-violet-500">
                    <div className="flex items-center gap-2.5">
                        <div className={cn('flex h-9 w-9 items-center justify-center rounded-full', meta.bg)}>
                            {statusMutation.isPending ? (
                                <Loader2 className={cn('w-4 h-4 animate-spin', meta.text)} />
                            ) : (
                                <StatusIcon className={cn('w-4 h-4', meta.text)} />
                            )}
                        </div>
                        <div className="text-left">
                            <p className="text-sm font-semibold text-violet-900">Estado: <span className="font-bold">{meta.label}</span></p>
                            <p className="text-xs text-violet-500">Haz clic para cambiar el estado</p>
                        </div>
                    </div>
                </SelectTrigger>
                <SelectContent>
                    {STATUS_FLOW.map(status => {
                        const sMeta = STATUS_META[status]
                        const SIcon = sMeta.icon
                        return (
                            <SelectItem key={status} value={status}>
                                <div className="flex items-center gap-2 py-1">
                                    <SIcon className={cn('w-4 h-4', sMeta.text)} />
                                    <div className="flex flex-col">
                                        <span className="font-medium">{sMeta.label}</span>
                                    </div>
                                </div>
                            </SelectItem>
                        )
                    })}
                    <div className="h-px bg-violet-100 my-1 mx-2" />
                    <SelectItem value={event.status === 'cancelled' ? 'pending' : 'cancelled'}>
                        <div className="flex items-center gap-2 py-1">
                            {event.status === 'cancelled' ? (
                                <Clock className="w-4 h-4 text-amber-600" />
                            ) : (
                                <X className="w-4 h-4 text-red-600" />
                            )}
                            <div className="flex flex-col">
                                <span className={event.status === 'cancelled' ? "font-medium text-amber-700" : "font-medium text-red-700"}>
                                    {event.status === 'cancelled' ? 'Reactivar Evento' : 'Cancelar Evento'}
                                </span>
                            </div>
                        </div>
                    </SelectItem>
                </SelectContent>
            </Select>

            {/* ── Contrato Exportable ── */}
            <div className="pt-2 pb-24 sm:pb-0">
                <DocumentActions
                    title="Imprimir Contrato de Servicio"
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

    /* ── Render ── */
    return (
        <AppBottomSheet
            open={open}
            onOpenChange={onOpenChange}
            title="Detalles del Evento"
        >
            <AnimatePresence mode="wait">
                {Content}
            </AnimatePresence>
        </AppBottomSheet>
    )
}