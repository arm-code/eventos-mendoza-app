'use client'

import { useEffect, useId, useState } from 'react'
import Link from 'next/link'
import { Check, Loader2, MapPin, MessageCircle, Pencil, Phone } from 'lucide-react'
import { toast } from 'sonner'
import { useMutation, useQueryClient } from '@tanstack/react-query'

import { financeApi } from '@/lib/api/finance'
import { formatCurrency } from '@/lib/format'
import type { BusinessConfig, BusinessEvent, EventStatus } from '@/types/finance'
import { AppBottomSheet } from '@/components/ui/app-bottom-sheet'
import { Button } from '@/components/ui/button'
import { DocumentActions } from '@/components/documents/document-actions'
import { PrintEventContractDocument, type EventContractData } from '@/components/documents/event-contract-document'
import { cn } from '@/lib/utils'

/* ─── Constantes ────────────────────────────────────────────────────────── */

// Estados de avance normales. "Cancelado" va aparte porque es destructivo.
const PROGRESS_STATUSES: readonly { value: EventStatus; label: string }[] = [
    { value: 'pending' as EventStatus, label: 'Pendiente' },
    { value: 'delivered' as EventStatus, label: 'Entregado' },
    { value: 'collected' as EventStatus, label: 'Terminado' },
]

const KNOWN_STATUSES = new Set(['pending', 'delivered', 'collected', 'cancelled'])

const longDateFmt = new Intl.DateTimeFormat('es-MX', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
})

/* ─── Utilidades ────────────────────────────────────────────────────────── */

/** Construye fechas YYYY-MM-DD en hora local (evita que se muestre un día antes). */
function parseLocalDate(value?: string | null): Date | null {
    if (!value) return null
    const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(value)
    const date = m ? new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3])) : new Date(value)
    return Number.isNaN(date.getTime()) ? null : date
}

function formatLongDate(value?: string | null): string | null {
    const date = parseLocalDate(value)
    if (!date) return null
    const text = longDateFmt.format(date)
    return text.charAt(0).toUpperCase() + text.slice(1)
}

/**
 * Normaliza un teléfono mexicano a 10 dígitos.
 * Acepta "656 123 4567", "+52 656…", "52656…" y el antiguo "521…".
 * Devuelve null si no es un número válido (así no se generan enlaces rotos).
 */
function toMxPhone(raw?: string | null): string | null {
    if (!raw) return null
    let digits = raw.replace(/\D/g, '')
    if (digits.length === 13 && digits.startsWith('521')) digits = digits.slice(3)
    else if (digits.length === 12 && digits.startsWith('52')) digits = digits.slice(2)
    return digits.length === 10 ? digits : null
}

function formatMxPhone(digits: string): string {
    return `${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6)}`
}

/** Nombre de archivo seguro: sin acentos, espacios ni caracteres especiales. */
function toSlug(value?: string | null, fallback = 'evento'): string {
    const slug = (value ?? '')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .slice(0, 60)
    return slug || fallback
}

/* ─── Componente ────────────────────────────────────────────────────────── */

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
    const queryClient = useQueryClient()
    const statusLabelId = useId()
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
            // El detalle va a consola; al usuario, un mensaje claro sin datos internos
            console.error('[EventDetailSheet] updateBusinessEvent', err)
            toast.error('No se pudo cambiar el estado. Revisa tu conexión e intenta de nuevo.')
        },
    })

    if (!event) return null

    const status = KNOWN_STATUSES.has(String(event.status)) ? String(event.status) : 'pending'
    const isCancelled = status === 'cancelled'
    const cost = Number.isFinite(Number(event.cost)) ? Number(event.cost) : 0
    const phone = toMxPhone(event.clientPhone)
    // Verifica el nombre del campo: en el dashboard se usa `eventDate`
    const dateText = formatLongDate(event.eventDate || event.date)
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
        >
            <div className="space-y-6 px-4 pb-8 sm:px-6">
                {/* Lo más consultado primero: cuándo y cuánto */}
                <dl className="grid grid-cols-2 gap-4 rounded-xl bg-muted/60 p-4">
                    <div className="min-w-0">
                        <dt className="text-sm text-muted-foreground">Fecha</dt>
                        <dd className="mt-1 text-[15px] font-medium leading-snug text-pretty">
                            {dateText ?? 'Por definir'}
                        </dd>
                    </div>
                    <div className="text-right">
                        <dt className="text-sm text-muted-foreground">Total</dt>
                        <dd className="mt-1 text-2xl font-semibold tracking-tight tabular-nums">
                            {formatCurrency(cost)}
                        </dd>
                    </div>
                </dl>

                {/* Estado: botones grandes en vez de un Select dentro del sheet */}
                <section className="space-y-3">
                    <h3 id={statusLabelId} className="text-sm font-medium text-muted-foreground">
                        Estado
                    </h3>

                    {isCancelled && (
                        <p className="text-[15px] text-destructive">
                            Este evento está cancelado. Elige un estado para reactivarlo.
                        </p>
                    )}

                    <div role="radiogroup" aria-labelledby={statusLabelId} className="grid grid-cols-3 gap-2">
                        {PROGRESS_STATUSES.map(({ value, label }) => {
                            const selected = status === value
                            const loading = pendingStatus === value
                            return (
                                <Button
                                    key={value}
                                    type="button"
                                    role="radio"
                                    aria-checked={selected}
                                    disabled={statusMutation.isPending}
                                    onClick={() => changeStatus(value)}
                                    variant={selected ? 'default' : 'outline'}
                                    className="h-12 rounded-xl text-[15px]"
                                >
                                    {loading ? (
                                        <Loader2 className="size-4 animate-spin" aria-hidden />
                                    ) : (
                                        selected && <Check className="size-4" aria-hidden />
                                    )}
                                    {label}
                                </Button>
                            )
                        })}
                    </div>
                </section>

                {/* Cliente */}
                <section className="space-y-3 border-t pt-6">
                    <h3 className="text-sm font-medium text-muted-foreground">Cliente</h3>
                    <div>
                        <p className="text-base font-medium">{event.clientName || 'Sin cliente'}</p>
                        {event.clientPhone && (
                            <p className="text-[15px] tabular-nums text-muted-foreground">
                                {phone ? formatMxPhone(phone) : event.clientPhone}
                            </p>
                        )}
                    </div>

                    {phone && (
                        <div className="grid grid-cols-2 gap-3">
                            <Button asChild variant="outline" className="h-12 text-[15px]">
                                <a href={`tel:+52${phone}`}>
                                    <Phone aria-hidden />
                                    Llamar
                                </a>
                            </Button>
                            <Button asChild variant="outline" className="h-12 text-[15px]">
                                <a href={`https://wa.me/52${phone}`} target="_blank" rel="noopener noreferrer">
                                    <MessageCircle aria-hidden />
                                    WhatsApp
                                </a>
                            </Button>
                        </div>
                    )}
                </section>

                {/* Dirección */}
                {event.eventAddress && (
                    <section className="space-y-3 border-t pt-6">
                        <h3 className="text-sm font-medium text-muted-foreground">Dirección</h3>
                        <p className="text-[15px] leading-relaxed text-pretty">{event.eventAddress}</p>
                        <Button asChild variant="outline" className="h-12 w-full text-[15px]">
                            <a
                                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(event.eventAddress)}`}
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                <MapPin aria-hidden />
                                Ver en el mapa
                            </a>
                        </Button>
                    </section>
                )}

                {/* Observaciones */}
                {(event.notes || event.noteFolio) && (
                    <section className="space-y-2 border-t pt-6">
                        <h3 className="text-sm font-medium text-muted-foreground">Observaciones</h3>
                        {event.notes && (
                            <p className="whitespace-pre-line text-[15px] leading-relaxed text-pretty">{event.notes}</p>
                        )}
                        {event.noteFolio && (
                            <p className="text-[15px] text-muted-foreground">
                                Viene de la nota <span className="font-medium text-foreground">{event.noteFolio}</span>
                            </p>
                        )}
                    </section>
                )}

                {/* Contrato y Cancelar */}
                <div className="border-t pt-6">
                    <DocumentActions
                        title="Contrato de servicio"
                        filename={`contrato-${toSlug(event.clientName)}`}
                        exportNode={
                            <PrintEventContractDocument event={event as EventContractData} business={businessConfig} />
                        }
                    >
                        {!isCancelled && (
                            <div className="mt-2 border-t pt-6">
                                {confirmCancel ? (
                                    <div className="space-y-3 rounded-xl border border-destructive/30 p-4">
                                        <p className="text-[15px] font-medium">¿Cancelar este evento?</p>
                                        <p className="text-sm text-muted-foreground">Podrás reactivarlo después si te equivocas.</p>
                                        <div className="grid grid-cols-2 gap-3">
                                            <Button
                                                variant="outline"
                                                className="h-12 text-[15px]"
                                                onClick={() => setConfirmCancel(false)}
                                                disabled={statusMutation.isPending}
                                            >
                                                No, volver
                                            </Button>
                                            <Button
                                                variant="destructive"
                                                className="h-12 text-[15px]"
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
                                        className="h-12 w-full text-[15px] text-destructive hover:bg-destructive/10 hover:text-destructive"
                                        onClick={() => setConfirmCancel(true)}
                                        disabled={statusMutation.isPending}
                                    >
                                        Cancelar evento
                                    </Button>
                                )}
                            </div>
                        )}
                    </DocumentActions>
                </div>
            </div>
        </AppBottomSheet>
    )
}