'use client'

import { forwardRef } from 'react'
import { computeNoteTotals, itemAmount } from '@/lib/calculations'
import { formatCurrency, formatDate } from '@/lib/format'
import type { BusinessConfig, Note } from '@/lib/types'

interface SaleNoteDocumentProps {
  note: Note
  business: BusinessConfig
}

// Documento imprimible tamaño carta. Usa colores explícitos (no tokens)
// para asegurar una exportación fiel a imagen/PDF.
// En móvil se adapta al ancho de pantalla con escala proporcional.
export const SaleNoteDocument = forwardRef<HTMLDivElement, SaleNoteDocumentProps>(
  function SaleNoteDocument({ note, business }, ref) {
    const totals = computeNoteTotals(note.items, note.applyIva, note.ivaRate)

    return (
      <div
        ref={ref}
        className="sale-note-document"
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
            flexWrap: 'wrap',
            gap: 12,
          }}
        >
          <div style={{ flex: 1, minWidth: 200 }}>
            <div style={{ fontSize: 'clamp(16px, 2.5vw, 22px)', fontWeight: 700, color: '#5b21b6' }}>
              {business.name}
            </div>
            <div style={{ fontSize: 'clamp(11px, 1.5vw, 13px)', color: '#6b6577', marginTop: 4 }}>
              Renta de mobiliario para eventos
            </div>
            {business.phone && (
              <div style={{ fontSize: 'clamp(11px, 1.5vw, 13px)', color: '#6b6577' }}>
                Tel: {business.phone}
              </div>
            )}
          </div>
          <div style={{ textAlign: 'right', minWidth: 140 }}>
            <div
              style={{
                display: 'inline-block',
                backgroundColor: note.status === 'quote' ? '#ede9fe' : '#7c3aed',
                color: note.status === 'quote' ? '#5b21b6' : '#ffffff',
                borderRadius: 8,
                padding: '4px 12px',
                fontSize: 'clamp(10px, 1.2vw, 12px)',
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: 0.5,
              }}
            >
              {note.status === 'quote' ? 'Cotización' : 'Nota de venta'}
            </div>
            <div style={{ fontSize: 'clamp(14px, 2vw, 18px)', fontWeight: 700, marginTop: 10 }}>
              {note.folio}
            </div>
            <div style={{ fontSize: 'clamp(11px, 1.5vw, 13px)', color: '#6b6577' }}>
              {formatDate(note.createdAt)}
            </div>
          </div>
        </div>

        {/* Datos del cliente */}
        <div style={{ marginBottom: 24 }}>
          <div
            style={{
              fontSize: 11,
              fontWeight: 700,
              color: '#7c3aed',
              textTransform: 'uppercase',
              letterSpacing: 0.6,
              marginBottom: 6,
            }}
          >
            Cliente
          </div>
          <div style={{ fontSize: 'clamp(13px, 1.8vw, 15px)', fontWeight: 600 }}>
            {note.customer.name}
          </div>
          {note.customer.phone && (
            <div style={{ fontSize: 'clamp(11px, 1.5vw, 13px)', color: '#6b6577' }}>
              Tel: {note.customer.phone}
            </div>
          )}
          {note.customer.address && (
            <div style={{ fontSize: 'clamp(11px, 1.5vw, 13px)', color: '#6b6577' }}>
              {note.customer.address}
            </div>
          )}
        </div>

        {/* Tabla de conceptos - responsive */}
        <div className="overflow-x-auto -mx-2 px-2">
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 'clamp(11px, 1.4vw, 13px)', minWidth: 400 }}>
            <thead>
              <tr style={{ backgroundColor: '#f5f3ff' }}>
                <th style={thStyle('left')}>Descripción</th>
                <th style={thStyle('center', 70)}>Cant.</th>
                <th style={thStyle('right', 110)}>P. Unitario</th>
                <th style={thStyle('right', 120)}>Importe</th>
              </tr>
            </thead>
            <tbody>
              {note.items.map((item) => (
                <tr key={item.id} style={{ borderBottom: '1px solid #ececf2' }}>
                  <td style={tdStyle('left')}>{item.description}</td>
                  <td style={tdStyle('center')}>{item.quantity}</td>
                  <td style={tdStyle('right')}>{formatCurrency(item.unitPrice)}</td>
                  <td style={tdStyle('right')}>{formatCurrency(itemAmount(item))}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totales */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 20 }}>
          <div style={{ width: '100%', maxWidth: 280 }}>
            <Row label="Subtotal" value={formatCurrency(totals.subtotal)} />
            {note.applyIva && (
              <Row
                label={`IVA (${Math.round(note.ivaRate * 100)}%)`}
                value={formatCurrency(totals.iva)}
              />
            )}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                borderTop: '2px solid #7c3aed',
                marginTop: 8,
                paddingTop: 10,
                fontSize: 'clamp(14px, 2vw, 18px)',
                fontWeight: 700,
                color: '#5b21b6',
              }}
            >
              <span>Total</span>
              <span>{formatCurrency(totals.total)}</span>
            </div>
          </div>
        </div>

        {/* Notas */}
        {note.notes && (
          <div
            style={{
              marginTop: 32,
              backgroundColor: '#faf9fc',
              borderRadius: 8,
              padding: 'clamp(12px, 2vw, 16px)',
              fontSize: 'clamp(11px, 1.4vw, 12px)',
              color: '#6b6577',
            }}
          >
            <div style={{ fontWeight: 600, color: '#1a1626', marginBottom: 4 }}>Notas</div>
            {note.notes}
          </div>
        )}

        <div
          style={{
            marginTop: 40,
            textAlign: 'center',
            fontSize: 'clamp(10px, 1.2vw, 12px)',
            color: '#9b95a8',
          }}
        >
          Gracias por su preferencia · {business.name}
        </div>
      </div>
    )
  },
)

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        fontSize: 'clamp(12px, 1.6vw, 14px)',
        padding: '4px 0',
        color: '#453f52',
      }}
    >
      <span>{label}</span>
      <span>{value}</span>
    </div>
  )
}

function thStyle(align: 'left' | 'center' | 'right', width?: number): React.CSSProperties {
  return {
    textAlign: align,
    padding: '10px 12px',
    fontSize: 'clamp(9px, 1.2vw, 11px)',
    fontWeight: 700,
    color: '#5b21b6',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    width,
    whiteSpace: 'nowrap',
  }
}

function tdStyle(align: 'left' | 'center' | 'right'): React.CSSProperties {
  return {
    textAlign: align,
    padding: '10px 12px',
    verticalAlign: 'top',
    wordBreak: 'break-word',
  }
}