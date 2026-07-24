'use client'

import { forwardRef } from 'react'
import { formatCurrency, formatDate } from '@/lib/format'
import type { BusinessConfig } from '@/lib/types'

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

// ─────────────────────────────────────────────────────────────────────────────
// STATUS CONFIGURATION
// ─────────────────────────────────────────────────────────────────────────────
const STATUS_CONFIG: Record<string, { label: string; bg: string; color: string }> = {
  pending: { label: 'Pendiente', bg: '#fef3c7', color: '#b45309' },
  delivered: { label: 'Entregado', bg: '#dbeafe', color: '#1d4ed8' },
  collected: { label: 'Recogido / Finalizado', bg: '#dcfce7', color: '#15803d' },
  cancelled: { label: 'Cancelado', bg: '#fee2e2', color: '#b91c1c' },
}

// ─────────────────────────────────────────────────────────────────────────────
// RESPONSIVE PREVIEW — Optimized for mobile PWA experience
// ─────────────────────────────────────────────────────────────────────────────
export const EventContractDocument = forwardRef<HTMLDivElement, EventContractDocumentProps>(
  function EventContractDocument({ event, business }, ref) {
    const status = STATUS_CONFIG[event.status] || {
      label: event.status,
      bg: '#f5f3ff',
      color: '#5b21b6'
    }

    const clientName = event.customer?.name || event.clientName || 'Cliente no especificado'
    const clientPhone = event.customer?.phone || event.clientPhone
    const guarantee = event.guaranteeDocument || event.contract?.guaranteeDocument || 'INE / Credencial de Elector'
    const serviceDesc = event.serviceDescription || event.name || event.notes || 'Renta de mobiliario y equipo para evento.'
    const folio = event.folio || `EVT-${event.id.slice(0, 6)}`

    return (
      <div
        ref={ref}
        className="w-full h-auto bg-white text-[#1a1626] font-sans p-4 sm:p-6 md:p-8 box-border"
        style={{ fontFamily: 'Geist, Arial, sans-serif' }}
      >
        {/* ── Header ── */}
        <header className="flex flex-col sm:flex-row justify-between items-start gap-4 border-b-2 border-violet-600 pb-5 mb-6">
          <div className="min-w-0 flex-1">
            <h1 className="text-lg sm:text-xl md:text-[22px] font-bold text-violet-800 uppercase tracking-tight leading-tight">
              {business.name}
            </h1>
            <p className="text-xs sm:text-sm text-violet-500 mt-1 leading-relaxed">
              Renta de Mobiliario para Eventos · Contrato y Nota de Servicio
            </p>
            {business.phone && (
              <p className="text-xs sm:text-sm text-violet-500 mt-0.5">
                Tel / WhatsApp: {business.phone}
              </p>
            )}
            <p className="text-xs sm:text-sm text-violet-500">Ciudad Juárez, Chihuahua</p>
          </div>

          <div className="flex flex-col items-start sm:items-end gap-2 shrink-0">
            <span
              className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wide"
              style={{ backgroundColor: status.bg, color: status.color }}
            >
              {status.label}
            </span>
            <div className="text-base sm:text-lg font-bold text-violet-950">
              {folio}
            </div>
            <div className="text-xs sm:text-sm text-violet-500">
              Fecha: {event.date ? formatDate(event.date) : 'Por definir'}
            </div>
          </div>
        </header>

        {/* ── Client & Location Cards ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-5 mb-6">
          {/* Client Card */}
          <section className="bg-violet-50/60 rounded-xl p-4 border border-violet-100">
            <h2 className="text-[10px] sm:text-xs font-bold text-violet-600 uppercase tracking-wider mb-2">
              Datos del Cliente
            </h2>
            <p className="text-sm sm:text-base font-semibold text-violet-950 break-words leading-snug">
              {clientName}
            </p>
            {clientPhone && (
              <p className="text-xs sm:text-sm text-violet-600 mt-1.5 flex items-center gap-1.5">
                <span className="shrink-0">📱</span>
                <span className="break-all">{clientPhone}</span>
              </p>
            )}
            {event.noteFolio && (
              <p className="text-xs sm:text-sm text-violet-700 font-semibold mt-2.5 bg-violet-100/50 inline-flex items-center px-2.5 py-1 rounded-md">
                Nota vinculada: {event.noteFolio}
              </p>
            )}
          </section>

          {/* Location Card */}
          <section className="bg-violet-50/60 rounded-xl p-4 border border-violet-100">
            <h2 className="text-[10px] sm:text-xs font-bold text-violet-600 uppercase tracking-wider mb-2">
              Ubicación y Servicio
            </h2>
            <p className="text-xs sm:text-sm text-violet-950 font-semibold break-words leading-snug">
              {event.eventAddress || 'Dirección de evento no especificada'}
            </p>
            <div className="mt-2.5 text-xs sm:text-sm text-violet-600">
              <span className="font-semibold text-violet-800">Garantía:</span>{' '}
              <span className="break-words">{guarantee}</span>
            </div>
          </section>
        </div>

        {/* ── Service Description ── */}
        <section className="mb-6">
          <h2 className="text-[10px] sm:text-xs font-bold text-violet-600 uppercase tracking-wider mb-2">
            Descripción del Servicio Prestado
          </h2>
          <div className="border border-violet-100 rounded-xl p-4 bg-white min-h-[80px]">
            <p className="text-sm sm:text-[14px] leading-relaxed text-violet-950 break-words">
              {serviceDesc}
            </p>
          </div>
        </section>

        {/* ── Total Cost ── */}
        <section className="flex justify-end mb-8">
          <div className="w-full sm:w-auto sm:min-w-[280px] bg-violet-50 rounded-xl p-4 border border-violet-100">
            <div className="flex justify-between items-center text-base sm:text-lg font-bold text-violet-800">
              <span>Costo Total</span>
              <span>{formatCurrency(event.cost || 0)}</span>
            </div>
          </div>
        </section>

        {/* ── Liability Clause ── */}
        <section className="bg-violet-50/40 border border-violet-200 rounded-xl p-4 sm:p-5 mb-10">
          <h3 className="font-bold text-violet-800 mb-2 text-xs sm:text-sm uppercase tracking-wide">
            Cláusula de Responsabilidad y Garantía de Mobiliario
          </h3>
          <p className="text-[11px] sm:text-xs leading-relaxed text-violet-700 text-justify">
            El cliente manifiesta recibir el mobiliario y equipo en óptimas condiciones de uso y funcionamiento.
            El cliente se compromete a cuidar y devolver el equipo en la fecha convenida. En caso de daño, pérdida,
            destrucción o extravío del mobiliario, el cliente se obliga a cubrir el costo total de reparación o reposición
            inmediata. Para garantía del cumplimiento de este contrato, el cliente hace entrega en custodia del documento
            de identificación o garantía señalado anteriormente.
          </p>
        </section>

        {/* ── Signatures ── */}
        <section className="grid grid-cols-1 sm:grid-cols-2 gap-8 sm:gap-16 mt-12 sm:mt-16 text-center">
          <div className="pt-4 border-t border-violet-300">
            <p className="text-xs sm:text-sm font-semibold text-violet-900">
              Firma de Conformidad del Cliente
            </p>
            <p className="text-[10px] sm:text-xs text-violet-500 mt-1 break-words">
              {clientName}
            </p>
          </div>
          <div className="pt-4 border-t border-violet-300">
            <p className="text-xs sm:text-sm font-semibold text-violet-900">
              Por {business.name}
            </p>
            <p className="text-[10px] sm:text-xs text-violet-500 mt-1">
              Firma Autorizada
            </p>
          </div>
        </section>

        {/* ── Footer ── */}
        <footer className="mt-10 sm:mt-12 text-center text-[10px] sm:text-xs text-violet-400">
          ¡Gracias por confiar en {business.name}! · Renta de Mobiliario para Eventos
        </footer>
      </div>
    )
  },
)

// ─────────────────────────────────────────────────────────────────────────────
// PRINT EXPORT NODE — Fixed 794px for PDF/PNG generation
// ─────────────────────────────────────────────────────────────────────────────
export function PrintEventContractDocument({ event, business }: EventContractDocumentProps) {
  const status = STATUS_CONFIG[event.status] || {
    label: event.status,
    bg: '#f5f3ff',
    color: '#5b21b6'
  }

  const clientName = event.customer?.name || event.clientName || 'Cliente no especificado'
  const clientPhone = event.customer?.phone || event.clientPhone
  const guarantee = event.guaranteeDocument || event.contract?.guaranteeDocument || 'INE / Credencial de Elector'
  const serviceDesc = event.serviceDescription || event.name || event.notes || 'Renta de mobiliario y equipo para evento.'
  const folio = event.folio || `EVT-${event.id.slice(0, 6)}`

  return (
    <div
      style={{
        width: 794,
        backgroundColor: '#ffffff',
        color: '#1a1626',
        fontFamily: 'Arial, sans-serif',
        padding: 32,
        boxSizing: 'border-box',
        fontSize: 13,
        lineHeight: 1.5,
      }}
    >
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        borderBottom: '2px solid #7c3aed',
        paddingBottom: 20,
        marginBottom: 24,
      }}>
        <div style={{ maxWidth: 400 }}>
          <div style={{ fontSize: 22, fontWeight: 700, color: '#5b21b6', textTransform: 'uppercase', lineHeight: 1.2 }}>
            {business.name}
          </div>
          <div style={{ fontSize: 13, color: '#6b6577', marginTop: 4 }}>
            Renta de Mobiliario para Eventos · Contrato y Nota de Servicio
          </div>
          {business.phone && (
            <div style={{ fontSize: 13, color: '#6b6577' }}>Tel / WhatsApp: {business.phone}</div>
          )}
          <div style={{ fontSize: 13, color: '#6b6577' }}>Ciudad Juárez, Chihuahua</div>
        </div>
        <div style={{ textAlign: 'right', flexShrink: 0 }}>
          <div style={{
            display: 'inline-block',
            backgroundColor: status.bg,
            color: status.color,
            borderRadius: 8,
            padding: '4px 12px',
            fontSize: 12,
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: 0.5,
          }}>
            {status.label}
          </div>
          <div style={{ fontSize: 18, fontWeight: 700, marginTop: 10, color: '#1a1626' }}>
            {folio}
          </div>
          <div style={{ fontSize: 13, color: '#6b6577' }}>
            Fecha: {event.date ? formatDate(event.date) : 'Por definir'}
          </div>
        </div>
      </div>

      {/* Client & Location */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 24 }}>
        <div style={{ backgroundColor: '#faf9fc', borderRadius: 8, padding: 16, border: '1px solid #f3f0ff' }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#7c3aed', textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 8 }}>
            Datos del Cliente
          </div>
          <div style={{ fontSize: 15, fontWeight: 600, color: '#1a1626', wordBreak: 'break-word' }}>
            {clientName}
          </div>
          {clientPhone && (
            <div style={{ fontSize: 13, color: '#6b6577', marginTop: 4, wordBreak: 'break-all' }}>
              Teléfono: {clientPhone}
            </div>
          )}
          {event.noteFolio && (
            <div style={{ fontSize: 13, color: '#7c3aed', fontWeight: 600, marginTop: 6 }}>
              Nota vinculada: {event.noteFolio}
            </div>
          )}
        </div>
        <div style={{ backgroundColor: '#faf9fc', borderRadius: 8, padding: 16, border: '1px solid #f3f0ff' }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#7c3aed', textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 8 }}>
            Ubicación y Servicio
          </div>
          <div style={{ fontSize: 13, color: '#1a1626', fontWeight: 600, wordBreak: 'break-word' }}>
            {event.eventAddress || 'Dirección de evento no especificada'}
          </div>
          <div style={{ fontSize: 13, color: '#6b6577', marginTop: 6 }}>
            <span style={{ fontWeight: 600, color: '#453f52' }}>Garantía:</span>{' '}
            <span style={{ wordBreak: 'break-word' }}>{guarantee}</span>
          </div>
        </div>
      </div>

      {/* Service Description */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: '#7c3aed', textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 8 }}>
          Descripción del Servicio Prestado
        </div>
        <div style={{ border: '1px solid #ececf2', borderRadius: 8, padding: 16, fontSize: 14, lineHeight: 1.6, color: '#1a1626', minHeight: 80, backgroundColor: '#ffffff', wordBreak: 'break-word' }}>
          {serviceDesc}
        </div>
      </div>

      {/* Total */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 32 }}>
        <div style={{ width: 280, backgroundColor: '#f5f3ff', borderRadius: 8, padding: 16, border: '1px solid #e9d5ff' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 16, fontWeight: 700, color: '#5b21b6' }}>
            <span>Costo Total</span>
            <span>{formatCurrency(event.cost || 0)}</span>
          </div>
        </div>
      </div>

      {/* Clause */}
      <div style={{ backgroundColor: '#faf9fc', border: '1px solid #e9d5ff', borderRadius: 8, padding: 16, marginBottom: 40, fontSize: 11, lineHeight: 1.7, color: '#4b5563' }}>
        <div style={{ fontWeight: 700, color: '#5b21b6', marginBottom: 6, fontSize: 12, textTransform: 'uppercase' }}>
          Cláusula de Responsabilidad y Garantía de Mobiliario
        </div>
        <div style={{ textAlign: 'justify' }}>
          El cliente manifiesta recibir el mobiliario y equipo en óptimas condiciones de uso y funcionamiento.
          El cliente se compromete a cuidar y devolver el equipo en la fecha convenida. En caso de daño, pérdida,
          destrucción o extravío del mobiliario, el cliente se obliga a cubrir el costo total de reparación o reposición
          inmediata. Para garantía del cumplimiento de este contrato, el cliente hace entrega en custodia del documento
          de identificación o garantía señalado anteriormente.
        </div>
      </div>

      {/* Signatures */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 60, marginTop: 60, textAlign: 'center' }}>
        <div style={{ paddingTop: 16, borderTop: '1px solid #a78bfa' }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#1a1626' }}>Firma de Conformidad del Cliente</div>
          <div style={{ fontSize: 11, color: '#6b6577', marginTop: 2, wordBreak: 'break-word' }}>{clientName}</div>
        </div>
        <div style={{ paddingTop: 16, borderTop: '1px solid #a78bfa' }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#1a1626' }}>Por {business.name}</div>
          <div style={{ fontSize: 11, color: '#6b6577', marginTop: 2 }}>Firma Autorizada</div>
        </div>
      </div>

      <div style={{ marginTop: 48, textAlign: 'center', fontSize: 11, color: '#9b95a8' }}>
        ¡Gracias por confiar en {business.name}! · Renta de Mobiliario para Eventos
      </div>
    </div>
  )
}