'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Loader2, MapPin, MessageCircle, Pencil, Phone } from 'lucide-react'
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

/* ─── Estilos compartidos ───────────────────────────────────────────────── */

// Una sola etiqueta para todo el sheet: encabezados de sección y datos del resumen
const LABEL = 'text-sm font-medium text-muted-foreground'
// Un solo tamaño y radio para todos los botones táctiles del sheet
const TOUCH = 'h-12 rounded-xl text-[15px]'

/* ─── Constantes ────────────────────────────────────────────────────────── */

// Estados de avance normales. "Cancelado" va aparte porque es destructivo.
const PROGRESS_STATUSES: readonly { value: EventStatus; label: string }[] = [
    { value: 'pending' as EventStatus, label: 'Pendiente' },
    { value: 'delivered' as EventStatus, label: 'Entregado' },
    { value: 'collected' as EventStatus, label: 'Terminado' },
]

const KNOWN_STATUSES = new Set(['pending', 'delivered', 'collected', 'cancelled'])

const dateFmt = new Intl.DateTimeFormat('es-MX', { weekday: 'long', day: 'numeric', month: 'long' })
const dateWithYearFmt = new Intl.DateTimeFormat('es-MX', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
})
const relativeFmt = new Intl.RelativeTimeFormat('es-MX', { numeric: 'auto' })

/* ─── Utilidades ────────────────────────────────────────────────────────── */

const capitalize = (text: string) => text.charAt(0).toUpperCase() + text.slice(1)

/** Construye fechas YYYY-MM-DD en hora local (evita que se muestre un día antes). */
function parseLocalDate(value?: string | null): Date | null {
    if (!value) return null
    const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(value)
    const date = m ? new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3])) : new Date(value)
    return Number.isNaN(date.getTime()) ? null : date
}

/** Fecha legible + distancia en días ("Mañana", "En 3 días", "Hace 2 días"). Solo cliente. */
function describeEventDate(value?: string | null): { label: string; relative: string; days: number } | null {
    const date = parseLocalDate(value)
    if (!date) return null

    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const target = new Date(date)
    target.setHours(0, 0, 0, 0)
    // Math.round compensa los cambios de horario de verano
    const days = Math.round((target.getTime() - today.getTime()) / 86_400_000)

    const fmt = date.getFullYear() === today.getFullYear() ? dateFmt : dateWithYearFmt
    return {
        label: capitalize(fmt.format(date)),
        relative: capitalize(relativeFmt.format(days, 'day')),
        days,
    }
}

/**
 * Normaliza un teléfono mexicano a 10 dígitos.
 * Acepta "656 123 4567", "+52 656…", "52656…" y el antiguo "521…".
 * Devuelve null si no es válido (así no se generan enlaces rotos).
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

/* ─── Sección reutilizable ──────────────────────────────────────────────── */

function Section({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <section className="space-y-3">
            <h3 className={LABEL}>{title}</h3>
            {children}
        </section>
    )
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
    const eventDate = describeEventDate(event.date || event.eventDate)
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
            {/* Ritmo único: space-y-8 entre secciones, sin líneas divisorias */}
            <div className="space-y-8 px-4 pb-8 sm:px-6">
                {/* Resumen: único bloque con fondo, porque es lo más consultado */}
                <dl className="divide-y divide-border/60 rounded-xl bg-muted/60">
                    <div className="flex items-start justify-between gap-4 px-4 py-3.5">
                        <dt className={cn(LABEL, 'pt-0.5')}>Fecha</dt>
                        <dd className="min-w-0 text-right">
                            {eventDate ? (
                                <>
                                    <p className="text-base font-medium leading-snug text-pretty">{eventDate.label}</p>
                                    <p
                                        className={cn(
                                            'text-sm',
                                            eventDate.days >= 0 ? 'font-medium text-primary' : 'text-muted-foreground'
                                        )}
                                    >
                                        {eventDate.relative}
                                    </p>
                                </>
                            ) : (
                                <p className="text-base text-muted-foreground">Por definir</p>
                            )}
                        </dd>
                    </div>

                    <div className="flex items-baseline justify-between gap-4 px-4 py-3.5">
                        <dt className={LABEL}>Total</dt>
                        <dd className="text-2xl font-semibold tracking-tight tabular-nums">{formatCurrency(cost)}</dd>
                    </div>
                </dl>

                <Section title="Estado">
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
                </Section>

                <Section title="Cliente">
                    <div>
                        <p className="text-base font-medium">{event.clientName || 'Sin cliente'}</p>
                        {event.clientPhone && (
                            <p className="text-[15px] tabular-nums text-muted-foreground">
                                {phone ? formatMxPhone(phone) : event.clientPhone}
                            </p>
                        )}
                    </div>

                    {phone && (
                        <div className="grid grid-cols-2 gap-2">
                            <Button asChild variant="outline" className={TOUCH}>
                                <a href={`tel:+52${phone}`}>
                                    <Phone aria-hidden />
                                    Llamar
                                </a>
                            </Button>
                            <Button asChild variant="outline" className={TOUCH}>
                                <a href={`https://wa.me/52${phone}`} target="_blank" rel="noopener noreferrer">
                                    <MessageCircle aria-hidden />
                                    WhatsApp
                                </a>
                            </Button>
                        </div>
                    )}
                </Section>

                {event.eventAddress && (
                    <Section title="Dirección">
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
                    </Section>
                )}

                {(event.notes || event.noteFolio) && (
                    <Section title="Observaciones">
                        {event.notes && (
                            <p className="whitespace-pre-line text-base leading-relaxed text-pretty">{event.notes}</p>
                        )}
                        {event.noteFolio && (
                            <p className="text-[15px] text-muted-foreground">
                                Viene de la nota <span className="font-medium text-foreground">{event.noteFolio}</span>
                            </p>
                        )}
                    </Section>
                )}


                {/* Única línea del sheet: marca la zona de acciones que no son de rutina */}
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
                {/* Barra de contrato: fija abajo en móvil, por eso va al final */}
                <DocumentActions
                    title="Contrato de servicio"
                    filename={`contrato-${toSlug(event.clientName)}`}
                    exportNode={<PrintEventContractDocument event={event as EventContractData} business={businessConfig} />}
                />
            </div>
        </AppBottomSheet>
    )
}