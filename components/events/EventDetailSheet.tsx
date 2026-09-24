'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Loader2, MapPin, Pencil } from 'lucide-react'
import { toast } from 'sonner'
import { useMutation, useQueryClient } from '@tanstack/react-query'

import { financeApi } from '@/lib/api/finance'
import { formatMxPhone, toMxPhone, toNumber, toSlug } from '@/lib/display'
import type { BusinessConfig, BusinessEvent, EventStatus } from '@/types/finance'
import { AppBottomSheet } from '@/components/ui/app-bottom-sheet'
import { Button } from '@/components/ui/button'
import {
    ContactButtons,
    DetailAmountRow,
    DetailDateRow,
    DetailSection,
    DetailSummary,
    TOUCH,
} from '@/components/ui/detail'
import { DocumentActions } from '@/components/documents/document-actions'
import { PrintEventContractDocument, type EventContractData } from '@/components/documents/event-contract-document'
import { cn } from '@/lib/utils'

// Estados de avance normales. "Cancelado" va aparte porque es destructivo.
const PROGRESS_STATUSES: readonly { value: EventStatus; label: string }[] = [
    { value: 'pending' as EventStatus, label: 'Pendiente' },
    { value: 'delivered' as EventStatus, label: 'Entregado' },
    { value: 'collected' as EventStatus, label: 'Terminado' },
]

const KNOWN_STATUSES = new Set(['pending', 'delivered', 'collected', 'cancelled'])

interface EventDetailSheetProps {
    event: BusinessEvent | null
    open: boolean
    onOpenChange: (open: boolean) => void
    onUpdate?: (updatedEvent: BusinessEvent) => void
    businessConfig: BusinessConfig
}

export function EventDetailSheet({ event, open, onOpenChange, onUpdate, businessConfig }: EventDetailSheetProps) {
    const queryClient = useQueryClient()
    const [confirmCancel, setConfirmCancel] = useState(false)

    // Al cerrar o cambiar de evento, se descarta la confirmación pendiente
    useEffect(() => {
        setConfirmCancel(false)
    }, [event?.id, open])

    const statusMutation = useMutation({
        mutationFn: ({ id, status }: { id: string | number; status: EventStatus }) =>
            financeApi.updateBusinessEvent(String(id), { status }),
        onSuccess: (updatedEvent, { status }) => {
            queryClient.invalidateQueries({ queryKey: ['businessEvents'] })
            toast.success(status === 'cancelled' ? 'Evento cancelado' : 'Estado actualizado')
            setConfirmCancel(false)
            onUpdate?.(updatedEvent)
        },
        onError: (err: unknown) => {
            console.error('[EventDetailSheet] updateBusinessEvent', err)
            toast.error('No se pudo cambiar el estado. Revisa tu conexión e intenta de nuevo.')
        },
    })

    if (!event) return null

    const status = KNOWN_STATUSES.has(String(event.status)) ? String(event.status) : 'pending'
    const isCancelled = status === 'cancelled'
    const phone = toMxPhone(event.clientPhone)
    const pendingStatus = statusMutation.isPending ? statusMutation.variables?.status : undefined

    const changeStatus = (next: EventStatus) => {
        if (next === status || statusMutation.isPending) return
        statusMutation.mutate({ id: event.id, status: next })
    }

    return (
        <AppBottomSheet
            open={open}
            onOpenChange={onOpenChange}
            title={event.name || 'Evento sin nombre'}
            headerAction={
                <Button
                    asChild
                    variant="ghost"
                    size="icon"
                    className="size-11 rounded-full text-muted-foreground hover:text-foreground"
                >
                    <Link
                        href={`/tools/eventos/editar-evento/${encodeURIComponent(String(event.id))}`}
                        onClick={() => onOpenChange(false)}
                        aria-label="Editar evento"
                    >
                        <Pencil className="size-5" aria-hidden />
                    </Link>
                </Button>
            }
            footer={
                <DocumentActions
                    placement="inline"
                    title="Contrato de servicio"
                    filename={`contrato-${toSlug(event.clientName, 'evento')}`}
                    exportNode={<PrintEventContractDocument event={event as EventContractData} business={businessConfig} />}
                />
            }
        >
            <div className="space-y-8">
                <DetailSummary>
                    <DetailDateRow value={event.date || event.eventDate} dateOnly highlightUpcoming />
                    <DetailAmountRow amount={toNumber(event.cost)} />
                </DetailSummary>

                <DetailSection title="Estado">
                    {isCancelled && (
                        <p className="text-[15px] text-destructive">
                            Este evento está cancelado. Elige un estado para reactivarlo.
                        </p>
                    )}

                    <div role="group" aria-label="Estado del evento" className="grid grid-cols-3 gap-2">
                        {PROGRESS_STATUSES.map(({ value, label }) => {
                            const selected = status === value
                            const loading = pendingStatus === value
                            return (
                                <Button
                                    key={value}
                                    type="button"
                                    aria-pressed={selected}
                                    aria-busy={loading}
                                    disabled={statusMutation.isPending}
                                    onClick={() => changeStatus(value)}
                                    variant={selected ? 'default' : 'outline'}
                                    className={cn(TOUCH, 'px-2')}
                                >
                                    {loading ? (
                                        <>
                                            <Loader2 className="animate-spin" aria-hidden />
                                            <span className="sr-only">Cambiando a {label}</span>
                                        </>
                                    ) : (
                                        label
                                    )}
                                </Button>
                            )
                        })}
                    </div>
                </DetailSection>

                <DetailSection title="Cliente">
                    <div>
                        <p className="text-base font-medium">{event.clientName || 'Sin cliente'}</p>
                        {event.clientPhone && (
                            <p className="text-[15px] tabular-nums text-muted-foreground">
                                {phone ? formatMxPhone(phone) : event.clientPhone}
                            </p>
                        )}
                    </div>
                    {phone && <ContactButtons phone={phone} />}
                </DetailSection>

                {event.eventAddress && (
                    <DetailSection title="Dirección">
                        <p className="text-base leading-relaxed text-pretty">{event.eventAddress}</p>
                        <Button asChild variant="outline" className={cn(TOUCH, 'w-full')}>
                            <a
                                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(event.eventAddress)}`}
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                <MapPin aria-hidden />
                                Ver en el mapa
                            </a>
                        </Button>
                    </DetailSection>
                )}

                {(event.notes || event.noteFolio) && (
                    <DetailSection title="Observaciones">
                        {event.notes && (
                            <p className="whitespace-pre-line text-base leading-relaxed text-pretty">{event.notes}</p>
                        )}
                        {event.noteFolio && (
                            <p className="text-[15px] text-muted-foreground">
                                Viene de la nota <span className="font-medium text-foreground">{event.noteFolio}</span>
                            </p>
                        )}
                    </DetailSection>
                )}

                {/* Única línea del contenido: separa lo rutinario de lo delicado */}
                {!isCancelled && (
                    <div className="border-t pt-6">
                        {confirmCancel ? (
                            <div className="space-y-3 rounded-xl border border-destructive/30 p-4">
                                <div>
                                    <p className="text-base font-medium">¿Cancelar este evento?</p>
                                    <p className="text-sm text-muted-foreground">Podrás reactivarlo después si te equivocas.</p>
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                    <Button
                                        variant="outline"
                                        className={TOUCH}
                                        onClick={() => setConfirmCancel(false)}
                                        disabled={statusMutation.isPending}
                                    >
                                        No, volver
                                    </Button>
                                    <Button
                                        variant="destructive"
                                        className={TOUCH}
                                        onClick={() => changeStatus('cancelled' as EventStatus)}
                                        disabled={statusMutation.isPending}
                                    >
                                        {pendingStatus === 'cancelled' && <Loader2 className="animate-spin" aria-hidden />}
                                        Sí, cancelar
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            <Button
                                variant="ghost"
                                className={cn(TOUCH, 'w-full text-destructive hover:bg-destructive/10 hover:text-destructive')}
                                onClick={() => setConfirmCancel(true)}
                                disabled={statusMutation.isPending}
                            >
                                Cancelar evento
                            </Button>
                        )}
                    </div>
                )}
            </div>
        </AppBottomSheet>
    )
}