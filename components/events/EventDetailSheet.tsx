'use client'

import { MapPin, Pencil } from 'lucide-react'
import { toast } from 'sonner'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'

import { financeApi } from '@/lib/api/finance'
import { formatCurrency, formatDate } from '@/lib/format'
import type { BusinessConfig, BusinessEvent, EventStatus } from '@/types/finance'
import { AppBottomSheet } from '@/components/ui/app-bottom-sheet'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { DocumentActions } from '@/components/documents/document-actions'
import { PrintEventContractDocument, type EventContractData } from '@/components/documents/event-contract-document'

/* ── CONSTANTES Y FORMATO ── */
const STATUS_LABEL: Record<string, string> = {
    pending: 'Pendiente',
    delivered: 'Entregado',
    collected: 'Terminado',
    cancelled: 'Cancelado',
}

interface EventDetailSheetProps {
    event: BusinessEvent | null
    open: boolean
    onOpenChange: (open: boolean) => void
    onUpdate?: (updatedEvent: BusinessEvent) => void
    businessConfig: BusinessConfig
}

export function EventDetailSheet({
    event,
    open,
    onOpenChange,
    onUpdate,
    businessConfig,
}: EventDetailSheetProps) {
    const router = useRouter()
    const queryClient = useQueryClient()

    const statusMutation = useMutation({
        mutationFn: async ({ id, status }: { id: string | number; status: EventStatus }) => {
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

    const status = event.status || 'pending'
    const cost = Number.isFinite(Number(event.cost)) ? Number(event.cost) : 0

    return (
        <AppBottomSheet
            open={open}
            onOpenChange={onOpenChange}
            title={event.name || 'Evento sin nombre'}
            headerAction={
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                        const id = event.id
                        onOpenChange(false)
                        router.push(`/tools/eventos/editar-evento/${id}`)
                    }}
                    className="size-11 rounded-full text-muted-foreground hover:bg-accent hover:text-foreground"
                    aria-label="Editar evento"
                >
                    <Pencil className="size-5" aria-hidden />
                </Button>
            }
        >
            <div className="space-y-8 px-4 pb-8 sm:px-6">

                {/* Sección: Cliente */}
                <section aria-labelledby="client-info-title" className="space-y-2">
                    <h3 id="client-info-title" className="text-sm font-semibold text-muted-foreground">
                        Cliente
                    </h3>
                    <p className="text-base font-medium text-foreground">
                        {event.clientName || 'Sin cliente'}
                    </p>

                    {event.clientPhone && (
                        <>
                            <p className="text-[15px] text-muted-foreground">{event.clientPhone}</p>
                            <div className="mt-4 grid grid-cols-2 gap-3">
                                <Button asChild variant="outline" className="h-11 w-full text-[15px]">
                                    <a href={`tel:${event.clientPhone.replace(/\D/g, '')}`}>Llamar</a>
                                </Button>
                                <Button asChild variant="outline" className="h-11 w-full text-[15px] text-primary hover:text-primary">
                                    <a
                                        href={`https://wa.me/52${event.clientPhone.replace(/\D/g, '')}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        WhatsApp
                                    </a>
                                </Button>
                            </div>
                        </>
                    )}
                </section>

                {/* Sección: Ubicación y Fecha */}
                <section className="space-y-6 border-t pt-6">
                    <div className="space-y-1">
                        <h3 className="text-sm font-semibold text-muted-foreground">Fecha</h3>
                        <p className="text-base font-medium text-foreground">
                            {event.date ? formatDate(event.date) : 'Por definir'}
                        </p>
                    </div>

                    {event.eventAddress && (
                        <div className="space-y-3">
                            <h3 className="text-sm font-semibold text-muted-foreground">Dirección</h3>
                            <p className="text-[15px] leading-relaxed text-foreground text-pretty">
                                {event.eventAddress}
                            </p>
                            <Button asChild variant="secondary" className="h-11 w-full text-[15px]">
                                <a
                                    href={`https://maps.google.com/?q=${encodeURIComponent(event.eventAddress)}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    <MapPin className="mr-2 size-4" aria-hidden />
                                    Abrir en Google Maps
                                </a>
                            </Button>
                        </div>
                    )}
                </section>

                {/* Sección: Cobro y Estado */}
                <section className="space-y-6 border-t pt-6">
                    <div className="flex items-center justify-between">
                        <h3 className="text-[15px] text-muted-foreground">Total del servicio</h3>
                        <p className="text-2xl font-semibold tracking-tight tabular-nums text-foreground">
                            {formatCurrency(cost)}
                        </p>
                    </div>

                    <div className="space-y-2">
                        <h3 className="text-sm font-semibold text-muted-foreground">Estado</h3>
                        <Select
                            value={status}
                            onValueChange={(val: EventStatus) => {
                                if (val !== status) {
                                    statusMutation.mutate({ id: event.id, status: val })
                                }
                            }}
                            disabled={statusMutation.isPending}
                        >
                            <SelectTrigger className="h-12 w-full text-[15px]">
                                <SelectValue>
                                    {statusMutation.isPending ? 'Actualizando...' : STATUS_LABEL[status]}
                                </SelectValue>
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="pending">Pendiente</SelectItem>
                                <SelectItem value="delivered">Entregado</SelectItem>
                                <SelectItem value="collected">Terminado</SelectItem>
                                <SelectItem value="cancelled" className="text-destructive focus:text-destructive">
                                    Cancelado
                                </SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </section>

                {/* Sección: Observaciones y Documentos */}
                {(event.notes || event.noteFolio) && (
                    <section className="space-y-3 border-t pt-6">
                        <h3 className="text-sm font-semibold text-muted-foreground">Observaciones</h3>
                        {event.notes && (
                            <p className="text-[15px] leading-relaxed text-foreground text-pretty">
                                {event.notes}
                            </p>
                        )}
                        {event.noteFolio && (
                            <p className="text-[15px] text-muted-foreground">
                                Viene de la nota: <span className="font-medium text-foreground">{event.noteFolio}</span>
                            </p>
                        )}
                    </section>
                )}

                <div className="border-t pt-6">
                    <DocumentActions
                        title="Contrato de Servicio"
                        filename={`contrato-${event.clientName?.replace(/\s+/g, '-').toLowerCase() || 'evento'}`}
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