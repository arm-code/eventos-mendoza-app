// components/ui/detail.tsx
// Piezas compartidas para vistas de detalle (sheets de evento, nota, etc.).
// Úsalas en lugar de repetir clases: así todas las vistas se ven iguales.

import { MessageCircle, Phone } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { formatCurrency } from '@/lib/format'
import { describeDate } from '@/lib/display'
import { cn } from '@/lib/utils'

/** Etiqueta única: títulos de sección y nombres de dato. */
export const LABEL = 'text-sm font-medium text-muted-foreground'
/** Botón táctil único: mismo alto, radio y texto en todas las vistas. */
export const TOUCH = 'h-12 rounded-xl text-[15px]'

export function DetailSection({
    title,
    children,
    className,
}: {
    title: string
    children: React.ReactNode
    className?: string
}) {
    return (
        <section className={cn('space-y-3', className)}>
            <h3 className={LABEL}>{title}</h3>
            {children}
        </section>
    )
}

/** Bloque resumen con fondo: lo más consultado de la vista. Úsalo una sola vez por vista. */
export function DetailSummary({ children }: { children: React.ReactNode }) {
    return <dl className="divide-y divide-border/60 rounded-xl bg-muted/60">{children}</dl>
}

export function DetailDateRow({
    label = 'Fecha',
    value,
    dateOnly = false,
    highlightUpcoming = false,
    emptyText = 'Por definir',
}: {
    label?: string
    value?: string | null
    /** true para fechas de calendario (eventos); false para instantes (createdAt). */
    dateOnly?: boolean
    /** Pinta en violeta la distancia cuando la fecha aún no llega. */
    highlightUpcoming?: boolean
    emptyText?: string
}) {
    const date = describeDate(value, { dateOnly })

    return (
        <div className="flex items-start justify-between gap-4 px-4 py-3.5">
            <dt className={cn(LABEL, 'pt-0.5')}>{label}</dt>
            <dd className="min-w-0 text-right">
                {date ? (
                    <>
                        <p className="text-base font-medium leading-snug text-pretty">{date.label}</p>
                        <p
                            className={cn(
                                'text-sm',
                                highlightUpcoming && date.days >= 0 ? 'font-medium text-primary' : 'text-muted-foreground'
                            )}
                        >
                            {date.relative}
                        </p>
                    </>
                ) : (
                    <p className="text-base text-muted-foreground">{emptyText}</p>
                )}
            </dd>
        </div>
    )
}

export function DetailAmountRow({ label = 'Total', amount }: { label?: string; amount: number }) {
    return (
        <div className="flex items-baseline justify-between gap-4 px-4 py-3.5">
            <dt className={LABEL}>{label}</dt>
            <dd className="text-2xl font-semibold tracking-tight tabular-nums">{formatCurrency(amount)}</dd>
        </div>
    )
}

/** Llamar + WhatsApp. `phone` debe venir normalizado a 10 dígitos (toMxPhone). */
export function ContactButtons({ phone, message }: { phone: string; message?: string }) {
    const waUrl = `https://wa.me/52${phone}${message ? `?text=${encodeURIComponent(message)}` : ''}`

    return (
        <div className="grid grid-cols-2 gap-2">
            <Button asChild variant="outline" className={TOUCH}>
                <a href={`tel:+52${phone}`}>
                    <Phone aria-hidden />
                    Llamar
                </a>
            </Button>
            <Button asChild variant="outline" className={TOUCH}>
                <a href={waUrl} target="_blank" rel="noopener noreferrer">
                    <MessageCircle aria-hidden />
                    WhatsApp
                </a>
            </Button>
        </div>
    )
}