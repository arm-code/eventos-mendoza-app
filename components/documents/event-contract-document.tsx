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

// Documento imprimible de Contrato y Nota de Evento (794px de ancho para exportación fiel a PDF / PNG)
export const EventContractDocument = forwardRef<HTMLDivElement, EventContractDocumentProps>(
  function EventContractDocument({ event, business }, ref) {
    const statusLabels: Record<string, { label: string; bg: string; color: string }> = {
      pending: { label: 'Pendiente', bg: '#fef3c7', color: '#b45309' },
      delivered: { label: 'Entregado', bg: '#dbeafe', color: '#1d4ed8' },
      collected: { label: 'Recogido / Finalizado', bg: '#dcfce7', color: '#15803d' },
      cancelled: { label: 'Cancelado', bg: '#fee2e2', color: '#b91c1c' },
    }

    const currentStatus = statusLabels[event.status] || { label: event.status, bg: '#f5f3ff', color: '#5b21b6' }
    const clientName = event.customer?.name || event.clientName || 'Cliente no especificado'
    const clientPhone = event.customer?.phone || event.clientPhone

    return (
      <div
        ref={ref}
        style={{
          width: '100%',
          maxWidth: 794,
          height: 'auto',
          backgroundColor: '#ffffff',
          color: '#1a1626',
          fontFamily: 'Geist, Arial, sans-serif',
          padding: 'clamp(20px, 4vw, 40px)',
          boxSizing: 'border-box',
          fontSize: 13,
        }}
      >
        {/* Encabezado */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            borderBottom: '2px solid #7c3aed',
            paddingBottom: 20,
            marginBottom: 24,
          }}
        >
          <div>
            <div style={{ fontSize: 22, fontWeight: 700, color: '#5b21b6' }}>{business.name}</div>
            <div style={{ fontSize: 13, color: '#6b6577', marginTop: 4 }}>
              Renta de Mobiliario para Eventos · Contrato y Nota de Servicio
            </div>
            {business.phone && (
              <div style={{ fontSize: 13, color: '#6b6577' }}>Tel / WhatsApp: {business.phone}</div>
            )}
            <div style={{ fontSize: 13, color: '#6b6577' }}>Ciudad Juárez, Chihuahua</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div
              style={{
                display: 'inline-block',
                backgroundColor: currentStatus.bg,
                color: currentStatus.color,
                borderRadius: 8,
                padding: '4px 12px',
                fontSize: 12,
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: 0.5,
              }}
            >
              {currentStatus.label}
            </div>
            <div style={{ fontSize: 18, fontWeight: 700, marginTop: 10, color: '#1a1626' }}>
              {event.folio || `EVT-${event.id.slice(0, 6)}`}
            </div>
            <div style={{ fontSize: 13, color: '#6b6577' }}>
              Fecha: {event.date ? formatDate(event.date) : 'Por definir'}
            </div>
          </div>
        </div>

        {/* Datos del cliente y evento */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 24 }}>
          <div style={{ backgroundColor: '#faf9fc', borderRadius: 8, padding: 16 }}>
            <div
              style={{
                fontSize: 11,
                fontWeight: 700,
                color: '#7c3aed',
                textTransform: 'uppercase',
                letterSpacing: 0.6,
                marginBottom: 8,
              }}
            >
              Datos del Cliente
            </div>
            <div style={{ fontSize: 15, fontWeight: 600, color: '#1a1626' }}>
              {clientName}
            </div>
            {clientPhone && (
              <div style={{ fontSize: 13, color: '#6b6577', marginTop: 4 }}>
                Teléfono: {clientPhone}
              </div>
            )}
            {event.noteFolio && (
              <div style={{ fontSize: 13, color: '#7c3aed', fontWeight: 600, marginTop: 6 }}>
                Nota vinculada: {event.noteFolio}
              </div>
            )}
          </div>

          <div style={{ backgroundColor: '#faf9fc', borderRadius: 8, padding: 16 }}>
            <div
              style={{
                fontSize: 11,
                fontWeight: 700,
                color: '#7c3aed',
                textTransform: 'uppercase',
                letterSpacing: 0.6,
                marginBottom: 8,
              }}
            >
              Ubicación y Servicio
            </div>
            <div style={{ fontSize: 13, color: '#1a1626', fontWeight: 600 }}>
              {event.eventAddress || 'Dirección de evento no especificada'}
            </div>
            <div style={{ fontSize: 13, color: '#6b6577', marginTop: 6 }}>
              <span style={{ fontWeight: 600, color: '#453f52' }}>Garantía:</span>{' '}
              {event.guaranteeDocument || event.contract?.guaranteeDocument || 'INE / Credencial de Elector'}
            </div>
          </div>
        </div>

        {/* Detalle del servicio */}
        <div style={{ marginBottom: 24 }}>
          <div
            style={{
              fontSize: 11,
              fontWeight: 700,
              color: '#7c3aed',
              textTransform: 'uppercase',
              letterSpacing: 0.6,
              marginBottom: 8,
            }}
          >
            Descripción del Servicio Prestado
          </div>
          <div
            style={{
              border: '1px solid #ececf2',
              borderRadius: 8,
              padding: 16,
              fontSize: 14,
              lineHeight: 1.5,
              color: '#1a1626',
              minHeight: 80,
              backgroundColor: '#ffffff',
            }}
          >
            {event.serviceDescription || event.name || event.notes || 'Renta de mobiliario y equipo para evento.'}
          </div>
        </div>

        {/* Resumen del Costo */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 32 }}>
          <div style={{ width: 280, backgroundColor: '#f5f3ff', borderRadius: 8, padding: 16 }}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: 16,
                fontWeight: 700,
                color: '#5b21b6',
              }}
            >
              <span>Costo Total</span>
              <span>{formatCurrency(event.cost || 0)}</span>
            </div>
          </div>
        </div>

        {/* Cláusula del Contrato de Responsabilidad */}
        <div
          style={{
            backgroundColor: '#faf9fc',
            border: '1px solid #e9d5ff',
            borderRadius: 8,
            padding: 16,
            marginBottom: 40,
            fontSize: 11,
            lineHeight: 1.6,
            color: '#4b5563',
          }}
        >
          <div style={{ fontWeight: 700, color: '#5b21b6', marginBottom: 6, fontSize: 12 }}>
            CLÁUSULA DE RESPONSABILIDAD Y GARANTÍA DE MOBILIARIO
          </div>
          El cliente manifiesta recibir el mobiliario y equipo en óptimas condiciones de uso y funcionamiento.
          El cliente se compromete a cuidar y devolver el equipo en la fecha convenida. En caso de daño, pérdida,
          destrucción o extravío del mobiliario, el cliente se obliga a cubrir el costo total de reparación o reposición
          inmediata. Para garantía del cumplimiento de este contrato, el cliente hace entrega en custodia del documento
          de identificación o garantía señalado anteriormente.
        </div>

        {/* Firmas de Conformidad */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 60, marginTop: 60, textAlign: 'center' }}>
          <div>
            <div style={{ borderTop: '1px solid #a78bfa', paddingTop: 8, fontSize: 12, fontWeight: 600, color: '#1a1626' }}>
              Firma de Conformidad del Cliente
            </div>
            <div style={{ fontSize: 11, color: '#6b6577', marginTop: 2 }}>
              {clientName}
            </div>
          </div>
          <div>
            <div style={{ borderTop: '1px solid #a78bfa', paddingTop: 8, fontSize: 12, fontWeight: 600, color: '#1a1626' }}>
              Por Eventos Mendoza
            </div>
            <div style={{ fontSize: 11, color: '#6b6577', marginTop: 2 }}>Firma Autorizada</div>
          </div>
        </div>

        {/* Pie de página */}
        <div
          style={{
            marginTop: 48,
            textAlign: 'center',
            fontSize: 11,
            color: '#9b95a8',
          }}
        >
          ¡Gracias por confiar en Eventos Mendoza! · Renta de Mobiliario para Eventos
        </div>
      </div>
    )
  },
)
