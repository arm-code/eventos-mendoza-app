// components/documents/event-contract-document.tsx
'use client'

import { forwardRef } from 'react'
import { formatCurrency, formatDate } from '@/lib/format'
import type { BusinessConfig } from '@/lib/types'
import { cn } from '@/lib/utils'

export interface EventContractData {
  id: string
  folio?: string
  name?: string
  serviceDescription?: string
  cost?: number
  date?: string
  clientName?: string
  clientPhone?: string
  eventAddress?: string
  status: string
  noteFolio?: string | null
  guaranteeDocument?: string
  notes?: string
  customer?: { name: string; phone?: string; address?: string }
  contract?: { guaranteeDocument?: string }
}

interface EventContractDocumentProps {
  event: EventContractData
  business: BusinessConfig
}

const STATUS_CLASSES: Record<string, string> = {
  pending: 'bg-muted text-muted-foreground border-transparent',
  delivered: 'bg-primary/10 text-primary border-primary/20',
  collected: 'bg-success/10 text-success border-success/20',
  cancelled: 'bg-destructive/10 text-destructive border-destructive/20',
}

const STATUS_LABELS: Record<string, string> = {
  pending: 'Pendiente',
  delivered: 'Entregado',
  collected: 'Finalizado',
  cancelled: 'Cancelado',
}

// ─────────────────────────────────────────────────────────────────────────────
// VISTA PREVIA RESPONSIVA (Móvil)
// ─────────────────────────────────────────────────────────────────────────────
export const EventContractDocument = forwardRef<HTMLDivElement, EventContractDocumentProps>(
  function EventContractDocument({ event, business }, ref) {
    const statusClass = STATUS_CLASSES[event.status] || STATUS_CLASSES.pending
    const statusLabel = STATUS_LABELS[event.status] || event.status

    const clientName = event.customer?.name || event.clientName || 'Cliente sin nombre'
    const clientPhone = event.customer?.phone || event.clientPhone
    const guarantee = event.guaranteeDocument || event.contract?.guaranteeDocument || 'INE / Credencial de Elector'
    const serviceDesc = event.serviceDescription || event.name || event.notes || 'Renta de mobiliario y equipo para evento.'
    const folio = event.folio || `EVT-${event.id.slice(0, 6)}`

    return (
      <div ref={ref} className="bg-background text-foreground space-y-6 p-4 sm:p-6">
        {/* Encabezado */}
        <header className="flex flex-col gap-4 border-b pb-5 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-1">
            <h1 className="text-xl font-semibold tracking-tight">{business.name}</h1>
            <p className="text-sm text-muted-foreground">Contrato de servicio</p>
            {business.phone && (
              <p className="text-sm text-muted-foreground">{business.phone}</p>
            )}
          </div>
          <div className="flex flex-col items-start gap-2 sm:items-end">
            <span className={cn('rounded-lg border px-2.5 py-1 text-xs font-medium', statusClass)}>
              {statusLabel}
            </span>
            <div className="text-lg font-semibold">{folio}</div>
            <div className="text-sm text-muted-foreground">
              {event.date ? formatDate(event.date) : 'Fecha por definir'}
            </div>
          </div>
        </header>

        {/* Datos y Ubicación */}
        <div className="grid gap-4 sm:grid-cols-2">
          <section className="rounded-xl border bg-card p-4">
            <h2 className="text-sm font-semibold text-muted-foreground">Cliente</h2>
            <p className="mt-1 font-medium">{clientName}</p>
            {clientPhone && <p className="mt-1 text-sm">{clientPhone}</p>}
            {event.noteFolio && (
              <p className="mt-2 text-sm text-muted-foreground">Nota vinculada: {event.noteFolio}</p>
            )}
          </section>

          <section className="rounded-xl border bg-card p-4">
            <h2 className="text-sm font-semibold text-muted-foreground">Ubicación</h2>
            <p className="mt-1 font-medium">{event.eventAddress || 'Sin dirección registrada'}</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Garantía: {guarantee}
            </p>
          </section>
        </div>

        {/* Descripción */}
        <section className="rounded-xl border bg-card p-4">
          <h2 className="text-sm font-semibold text-muted-foreground">Servicio</h2>
          <p className="mt-2 text-[15px] leading-relaxed">{serviceDesc}</p>
        </section>

        {/* Total */}
        <section className="flex justify-end">
          <div className="w-full rounded-xl border bg-muted/50 p-4 sm:w-72">
            <div className="flex items-center justify-between font-semibold">
              <span>Total</span>
              <span className="text-lg tabular-nums">{formatCurrency(event.cost || 0)}</span>
            </div>
          </div>
        </section>

        {/* Cláusula */}
        <section className="rounded-xl border bg-muted/30 p-5">
          <h3 className="text-sm font-semibold">Términos de responsabilidad</h3>
          <p className="mt-2 text-[13px] leading-relaxed text-muted-foreground">
            El cliente recibe el mobiliario en óptimas condiciones y se compromete a devolverlo
            en la fecha convenida. En caso de daño o pérdida, el cliente cubrirá el costo de reparación
            o reposición. Se entrega en custodia el documento de garantía señalado.
          </p>
        </section>
      </div>
    )
  }
)

// ─────────────────────────────────────────────────────────────────────────────
// NODO DE EXPORTACIÓN (PDF/PNG) - Renderiza con clases Tailwind estáticas
// ─────────────────────────────────────────────────────────────────────────────
export function PrintEventContractDocument({ event, business }: EventContractDocumentProps) {
  const statusClass = STATUS_CLASSES[event.status] || STATUS_CLASSES.pending
  const statusLabel = STATUS_LABELS[event.status] || event.status

  const clientName = event.customer?.name || event.clientName || 'Cliente sin nombre'
  const clientPhone = event.customer?.phone || event.clientPhone
  const guarantee = event.guaranteeDocument || event.contract?.guaranteeDocument || 'INE / Credencial de Elector'
  const serviceDesc = event.serviceDescription || event.name || event.notes || 'Renta de mobiliario y equipo para evento.'
  const folio = event.folio || `EVT-${event.id.slice(0, 6)}`

  return (
    <div
      className="bg-background text-foreground p-8"
      style={{ width: 794, fontSize: '14px', lineHeight: '1.5' }}
    >
      <header className="mb-6 flex items-start justify-between border-b pb-6">
        <div>
          <h1 className="text-2xl font-semibold">{business.name}</h1>
          <p className="mt-1 text-muted-foreground">Contrato de servicio de mobiliario</p>
          {business.phone && <p className="text-muted-foreground">{business.phone}</p>}
        </div>
        <div className="flex flex-col items-end gap-2">
          <span className={cn('rounded-md border px-3 py-1 text-xs font-semibold', statusClass)}>
            {statusLabel}
          </span>
          <div className="mt-2 text-xl font-semibold">{folio}</div>
          <div className="text-muted-foreground">
            {event.date ? formatDate(event.date) : 'Fecha por definir'}
          </div>
        </div>
      </header>

      <div className="mb-6 grid grid-cols-2 gap-6">
        <section className="rounded-xl border p-5">
          <h2 className="text-sm font-semibold text-muted-foreground">Cliente</h2>
          <p className="mt-2 font-medium">{clientName}</p>
          {clientPhone && <p className="mt-1">{clientPhone}</p>}
          {event.noteFolio && (
            <p className="mt-3 text-sm text-muted-foreground">Nota vinculada: {event.noteFolio}</p>
          )}
        </section>
        <section className="rounded-xl border p-5">
          <h2 className="text-sm font-semibold text-muted-foreground">Ubicación</h2>
          <p className="mt-2 font-medium">{event.eventAddress || 'Sin dirección registrada'}</p>
          <p className="mt-3 text-sm text-muted-foreground">Garantía: {guarantee}</p>
        </section>
      </div>

      <section className="mb-6 rounded-xl border p-5">
        <h2 className="text-sm font-semibold text-muted-foreground">Servicio</h2>
        <p className="mt-2 leading-relaxed">{serviceDesc}</p>
      </section>

      <section className="mb-8 flex justify-end">
        <div className="w-80 rounded-xl border bg-muted/50 p-5">
          <div className="flex items-center justify-between font-semibold">
            <span>Total</span>
            <span className="text-xl tabular-nums">{formatCurrency(event.cost || 0)}</span>
          </div>
        </div>
      </section>

      <section className="mb-12 rounded-xl border bg-muted/30 p-5 text-sm text-muted-foreground">
        <h3 className="font-semibold text-foreground">Términos de responsabilidad</h3>
        <p className="mt-2 text-justify leading-relaxed">
          El cliente recibe el mobiliario en óptimas condiciones y se compromete a devolverlo
          en la fecha convenida. En caso de daño o pérdida, el cliente cubrirá el costo de reparación
          o reposición. Se entrega en custodia el documento de garantía señalado.
        </p>
      </section>

      <section className="mt-16 grid grid-cols-2 gap-16 text-center">
        <div className="border-t pt-4">
          <p className="font-semibold">Firma de conformidad del cliente</p>
          <p className="mt-1 text-sm text-muted-foreground">{clientName}</p>
        </div>
        <div className="border-t pt-4">
          <p className="font-semibold">Por {business.name}</p>
          <p className="mt-1 text-sm text-muted-foreground">Firma autorizada</p>
        </div>
      </section>
    </div>
  )
}