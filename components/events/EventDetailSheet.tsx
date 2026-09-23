// components/events/EventDetailSheet.tsx
'use client'

import {
    Calendar, MapPin, User, Phone, FileText, Clock, CheckCircle2,
    Loader2, MessageCircle, ExternalLink, Map, X, Pencil
} from 'lucide-react'
import { toast } from 'sonner'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'

import { financeApi } from '@/lib/api/finance'
import { formatCurrency, formatDate } from '@/lib/format'
import type { BusinessConfig, BusinessEvent, EventStatus } from '@/types/finance'
import { AppBottomSheet } from '@/components/ui/app-bottom-sheet'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger } from '@/components/ui/select'
import { DocumentActions } from '@/components/documents/document-actions'
import { PrintEventContractDocument, type EventContractData } from '@/components/documents/event-contract-document'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'

/* ── CONSTANTES ── */
const STATUS_FLOW: EventStatus[] = ['pending', 'delivered', 'collected']

const STATUS_META: Record<string, { label: string; shortLabel: string; bg: string; text: string; border: string; icon: React.ElementType; description: string }> = {
    pending: {
        label: 'Pendiente',
        shortLabel: 'Pend.',
        bg: 'bg-amber-500/10',
        text: 'text-amber-700',
        border: 'border-amber-500/20',
        icon: Clock,
        description: 'Programado, sin entregar',
    },
    delivered: {
        label: 'Entregado',
        shortLabel: 'Entr.',
        bg: 'bg-primary/10',
        text: 'text-primary',
        border: 'border-primary/20',
        icon: CheckCircle2,
        description: 'Mobiliario entregado',
    },
    collected: {
        label: 'Recogido',
        shortLabel: 'Rec.',
        bg: 'bg-success/10',
        text: 'text-success',
        border: 'border-success/20',
        icon: CheckCircle2,
        description: 'Finalizado y recogido',
    },
    cancelled: {
        label: 'Cancelado',
        shortLabel: 'Canc.',
        bg: 'bg-destructive/10',
        text: 'text-destructive',
        border: 'border-destructive/20',
        icon: X,
        description: 'Evento cancelado',
    },
}

/* ── COMPONENTE PRINCIPAL ── */
interface EventDetailSheetProps {
    event: BusinessEvent | null
    open: boolean
    onOpenChange: (open: boolean) => void
    onUpdate?: (updatedEvent: BusinessEvent) => void
    businessConfig: BusinessConfig
}

export function EventDetailSheet({
    event, open, onOpenChange, onUpdate, businessConfig
}: EventDetailSheetProps) {
    const router = useRouter()
    const queryClient = useQueryClient()

    const statusMutation = useMutation({
        mutationFn: async ({ id, status }: { id: string | number, status: EventStatus }) => {
            const result = await financeApi.updateBusinessEvent(id.toString(), { status })
            return result
        },
        onSuccess: (updatedEvent) => {
            queryClient.invalidateQueries({ queryKey: ['businessEvents'] })
            toast.success('Estado actualizado')
            if (onUpdate) onUpdate(updatedEvent)
        },
        onError: (err: unknown) => {
            const error = err as { message?: string }
            toast.error(error.message || 'Error al actualizar el estado')
        },
    })

    if (!event) return null

    const meta = STATUS_META[event.status || 'pending']
    const StatusIcon = meta.icon

    return (
        <AppBottomSheet
            open={open}
            onOpenChange={onOpenChange}
            title={event.name || 'Detalles del evento'}
            headerAction={
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                        const id = event.id
                        onOpenChange(false)
                        router.push(`/tools/eventos/editar-evento/${id}`)
                    }}
                    className="size-11 rounded-full text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                    aria-label="Editar evento"
                >
                    <Pencil className="size-5" aria-hidden />
                </Button>
            }
        >
            <div className="space-y-6 px-1 pb-6">
                {/* ── Header: Folio + Status actual ── */}
                <div className="flex items-start justify-between">
                    <Badge variant="secondary" className="font-medium text-muted-foreground">
                        Evento / Servicio
                    </Badge>
                    <div className="text-right">
                        <span className="block font-mono text-[15px] font-semibold">
                            {event.folio || `EV-${String(event.id).slice(0, 4)}`}
                        </span>
                        <div className={cn('mt-1 inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md border text-xs font-semibold', meta.bg, meta.text, meta.border)}>
                            <StatusIcon className="size-3" aria-hidden />
                            <span>{meta.label}</span>
                        </div>
                    </div>
                </div>

                {/* ── Info del Cliente ── */}
                <section className="rounded-xl border bg-muted/10 p-4">
                    <h3 className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        <User className="size-4" aria-hidden />
                        Cliente
                    </h3>
                    <p className="font-medium capitalize">{event.clientName}</p>
                    {event.clientPhone && (
                        <p className="mt-1.5 flex items-center gap-2 text-sm text-muted-foreground">
                            <Phone className="size-3.5 shrink-0" aria-hidden />
                            {event.clientPhone}
                        </p>
                    )}
                    {event.clientPhone && (
                        <div className="flex gap-2 pt-3">
                            <Button
                                asChild
                                variant="outline"
                                className="h-10 flex-1 text-xs font-medium"
                            >
                                <a href={`tel:${event.clientPhone.replace(/\D/g, '')}`}>
                                    Llamar
                                </a>
                            </Button>
                            <Button
                                asChild
                                variant="outline"
                                className="h-10 flex-1 text-xs font-medium border-success/30 text-success hover:bg-success/10 hover:text-success"
                            >
                                <a
                                    href={`https://wa.me/52${event.clientPhone.replace(/\D/g, '')}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    WhatsApp
                                </a>
                            </Button>
                        </div>
                    )}
                </section>

                {/* ── Info del Evento ── */}
                <section className="rounded-xl border bg-muted/10 p-4">
                    <h3 className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        <Calendar className="size-4" aria-hidden />
                        Detalles del Evento
                    </h3>
                    <div className="space-y-3 text-sm">
                        <div className="flex items-center gap-2.5 text-foreground">
                            <span className="font-medium">{event.date ? formatDate(event.date) : 'Por definir'}</span>
                        </div>
                        {event.eventAddress && (
                            <div className="flex flex-col gap-2">
                                <div className="flex items-start gap-2.5 text-foreground">
                                    <MapPin className="size-4 shrink-0 text-muted-foreground mt-0.5" aria-hidden />
                                    <span className="leading-relaxed flex-1 capitalize">{event.eventAddress}</span>
                                </div>
                                <Button
                                    asChild
                                    variant="outline"
                                    className="ml-6 h-9 text-xs font-medium"
                                >
                                    <a
                                        href={`https://maps.google.com/?q=${encodeURIComponent(event.eventAddress)}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        <Map className="mr-2 size-3" aria-hidden />
                                        Ver en Google Maps
                                        <ExternalLink className="ml-auto size-3 opacity-50" aria-hidden />
                                    </a>
                                </Button>
                            </div>
                        )}
                        {event.noteFolio && (
                            <div className="flex items-center gap-2.5 font-medium text-foreground pt-1 border-t">
                                <FileText className="size-4 text-muted-foreground shrink-0" aria-hidden />
                                <span>Nota vinculada: {event.noteFolio}</span>
                            </div>
                        )}
                    </div>
                </section>

                {/* ── Observaciones ── */}
                {event.notes && (
                    <section className="rounded-xl border bg-muted/20 p-4">
                        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Observaciones</h3>
                        <p className="mt-2 text-[15px] leading-relaxed capitalize">{event.notes}</p>
                    </section>
                )}

                {/* ── Costo ── */}
                <section className="space-y-2 pt-2 text-right">
                    <div className="flex justify-between border-t pt-3 font-semibold text-primary">
                        <span className="text-lg">Costo Total</span>
                        <span className="text-xl tabular-nums">{formatCurrency(event.cost || 0)}</span>
                    </div>
                </section>

                {/* ── Cambio de Estado ── */}
                <section className="pt-2">
                    <Select
                        value={event.status || 'pending'}
                        onValueChange={(val: EventStatus) => {
                            if (val !== event.status) {
                                statusMutation.mutate({ id: event.id, status: val })
                            }
                        }}
                        disabled={statusMutation.isPending}
                    >
                        <SelectTrigger className="w-full h-auto p-4 rounded-xl border bg-card">
                            <div className="flex items-center gap-3">
                                <div className={cn('flex size-9 items-center justify-center rounded-full', meta.bg)}>
                                    {statusMutation.isPending ? (
                                        <Loader2 className={cn('size-4 animate-spin', meta.text)} aria-hidden />
                                    ) : (
                                        <StatusIcon className={cn('size-4', meta.text)} aria-hidden />
                                    )}
                                </div>
                                <div className="text-left">
                                    <p className="text-sm font-semibold text-foreground">Estado: <span className="font-bold">{meta.label}</span></p>
                                    <p className="text-xs text-muted-foreground">Toca para cambiar el estado</p>
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
                                            <SIcon className={cn('size-4', sMeta.text)} aria-hidden />
                                            <span className="font-medium">{sMeta.label}</span>
                                        </div>
                                    </SelectItem>
                                )
                            })}
                            <div className="h-px bg-border my-1 mx-2" />
                            <SelectItem value={event.status === 'cancelled' ? 'pending' : 'cancelled'}>
                                <div className="flex items-center gap-2 py-1">
                                    {event.status === 'cancelled' ? (
                                        <Clock className="size-4 text-amber-500" aria-hidden />
                                    ) : (
                                        <X className="size-4 text-destructive" aria-hidden />
                                    )}
                                    <span className={event.status === 'cancelled' ? "font-medium text-amber-600" : "font-medium text-destructive"}>
                                        {event.status === 'cancelled' ? 'Reactivar Evento' : 'Cancelar Evento'}
                                    </span>
                                </div>
                            </SelectItem>
                        </SelectContent>
                    </Select>
                </section>

                {/* ── Contrato Exportable ── */}
                <div className="pt-2">
                    <DocumentActions
                        title="Contrato de Servicio"
                        filename={`contrato-evento-${event.folio || event.id}`}
                        exportNode={
                            <PrintEventContractDocument
                                event={event as EventContractData}
                                business={businessConfig}
                            />
                        }
                    />
                </div>
            </div>
        </AppBottomSheet>
    )
}