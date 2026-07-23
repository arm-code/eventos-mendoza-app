'use client'

import { forwardRef } from 'react'
import { computeNoteTotals, itemAmount } from '@/lib/calculations'
import { formatCurrency, formatDate } from '@/lib/format'
import type { BusinessConfig, Note } from '@/lib/types'

interface SaleNoteDocumentProps {
  note: Note
  business: BusinessConfig
}

// Documento de VISTA PREVIA: se adapta responsivamente al ancho del contenedor.
// Úsalo para mostrar los datos de la nota en pantalla.
export const SaleNoteDocument = forwardRef<HTMLDivElement, SaleNoteDocumentProps>(
  function SaleNoteDocument({ note, business }, ref) {
    const totals = computeNoteTotals(note.items, note.applyIva, note.ivaRate)

    return (
      <div
        ref={ref}
        className="sale-note-document"
        style={{
          width: '100%',
          height: 'auto',
          backgroundColor: '#ffffff',
          color: '#1a1626',
          fontFamily: 'Geist, Arial, sans-serif',
          padding: 'clamp(12px, 3vw, 32px)',
          boxSizing: 'border-box',
          fontSize: 'clamp(10px, 2.5vw, 13px)',
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
            gap: 12,
          }}
        >
          <div style={{ flex: 1, minWidth: 200 }}>
            <div style={{ fontSize: 22, fontWeight: 700, color: '#5b21b6', textTransform: 'uppercase' }}>
              {business.name}
            </div>
            <div style={{ fontSize: 13, color: '#6b6577', marginTop: 4 }}>
              Renta de mobiliario para eventos
            </div>
            {business.phone && (
              <div style={{ fontSize: 13, color: '#6b6577' }}>
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
                fontSize: 12,
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: 0.5,
              }}
            >
              {note.status === 'quote' ? 'Cotización' : 'Nota de venta'}
            </div>
            <div style={{ fontSize: 18, fontWeight: 700, marginTop: 10 }}>
              {note.folio}
            </div>
            <div style={{ fontSize: 13, color: '#6b6577' }}>
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
          <div style={{ fontSize: 15, fontWeight: 600, textTransform: 'uppercase' }}>
            {note.customer.name}
          </div>
          {note.customer.phone && (
            <div style={{ fontSize: 13, color: '#6b6577' }}>
              Tel: {note.customer.phone}
            </div>
          )}
          {note.customer.address && (
            <div style={{ fontSize: 13, color: '#6b6577', textTransform: 'uppercase' }}>
              {note.customer.address}
            </div>
          )}
        </div>

        {/* Tabla de conceptos */}
        <div>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
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
                  <td style={{ ...tdStyle('left'), textTransform: 'uppercase' }}>{item.description}</td>
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
                fontSize: 18,
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
              padding: 16,
              fontSize: 12,
              color: '#6b6577',
            }}
          >
            <div style={{ fontWeight: 600, color: '#1a1626', marginBottom: 4, textTransform: 'uppercase' }}>Notas</div>
            <div style={{ textTransform: 'uppercase' }}>{note.notes}</div>
          </div>
        )}

        <div
          style={{
            marginTop: 40,
            textAlign: 'center',
            fontSize: 12,
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
        fontSize: 14,
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
    fontSize: 11,
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

// ─────────────────────────────────────────────────────────────────────────────
// PrintSaleNoteDocument — Nodo de exportación a imagen/PDF.
// Siempre 794px de ancho con tamaños de fuente fijos (desktop). Nunca visible en
// pantalla; se mantiene off-screen en DocumentActions para la captura.
// ─────────────────────────────────────────────────────────────────────────────
export function PrintSaleNoteDocument({ note, business }: SaleNoteDocumentProps) {
  const totals = computeNoteTotals(note.items, note.applyIva, note.ivaRate)

  return (
    <div
      style={{
        width: 794,
        backgroundColor: '#ffffff',
        color: '#1a1626',
        fontFamily: 'Arial, sans-serif',
        padding: 40,
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
          <div style={{ fontSize: 22, fontWeight: 700, color: '#5b21b6', textTransform: 'uppercase' }}>
            {business.name}
          </div>
          <div style={{ fontSize: 13, color: '#6b6577', marginTop: 4 }}>
            Renta de mobiliario para eventos
          </div>
          {business.phone && (
            <div style={{ fontSize: 13, color: '#6b6577' }}>Tel: {business.phone}</div>
          )}
        </div>
        <div style={{ textAlign: 'right' }}>
          <div
            style={{
              display: 'inline-block',
              backgroundColor: note.status === 'quote' ? '#ede9fe' : '#7c3aed',
              color: note.status === 'quote' ? '#5b21b6' : '#ffffff',
              borderRadius: 8,
              padding: '4px 14px',
              fontSize: 12,
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: 0.5,
            }}
          >
            {note.status === 'quote' ? 'Cotización' : 'Nota de venta'}
          </div>
          <div style={{ fontSize: 18, fontWeight: 700, marginTop: 10, color: '#1a1626' }}>
            {note.folio}
          </div>
          <div style={{ fontSize: 13, color: '#6b6577' }}>{formatDate(note.createdAt)}</div>
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
        <div style={{ fontSize: 15, fontWeight: 600, textTransform: 'uppercase' }}>
          {note.customer.name}
        </div>
        {note.customer.phone && (
          <div style={{ fontSize: 13, color: '#6b6577' }}>Tel: {note.customer.phone}</div>
        )}
        {note.customer.address && (
          <div style={{ fontSize: 13, color: '#6b6577', textTransform: 'uppercase' }}>
            {note.customer.address}
          </div>
        )}
      </div>

      {/* Tabla de conceptos */}
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
        <thead>
          <tr style={{ backgroundColor: '#f5f3ff' }}>
            <th style={{ textAlign: 'left', padding: '10px 12px', fontSize: 11, fontWeight: 700, color: '#5b21b6', textTransform: 'uppercase', letterSpacing: 0.4 }}>Descripción</th>
            <th style={{ textAlign: 'center', padding: '10px 12px', fontSize: 11, fontWeight: 700, color: '#5b21b6', textTransform: 'uppercase', letterSpacing: 0.4, width: 70, whiteSpace: 'nowrap' }}>Cant.</th>
            <th style={{ textAlign: 'right', padding: '10px 12px', fontSize: 11, fontWeight: 700, color: '#5b21b6', textTransform: 'uppercase', letterSpacing: 0.4, width: 110, whiteSpace: 'nowrap' }}>P. Unitario</th>
            <th style={{ textAlign: 'right', padding: '10px 12px', fontSize: 11, fontWeight: 700, color: '#5b21b6', textTransform: 'uppercase', letterSpacing: 0.4, width: 120, whiteSpace: 'nowrap' }}>Importe</th>
          </tr>
        </thead>
        <tbody>
          {note.items.map((item) => (
            <tr key={item.id} style={{ borderBottom: '1px solid #ececf2' }}>
              <td style={{ textAlign: 'left', padding: '10px 12px', verticalAlign: 'top', textTransform: 'uppercase' }}>{item.description}</td>
              <td style={{ textAlign: 'center', padding: '10px 12px', verticalAlign: 'top' }}>{item.quantity}</td>
              <td style={{ textAlign: 'right', padding: '10px 12px', verticalAlign: 'top' }}>{formatCurrency(item.unitPrice)}</td>
              <td style={{ textAlign: 'right', padding: '10px 12px', verticalAlign: 'top' }}>{formatCurrency(itemAmount(item))}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Totales */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 20 }}>
        <div style={{ width: 280 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, padding: '4px 0', color: '#453f52' }}>
            <span>Subtotal</span><span>{formatCurrency(totals.subtotal)}</span>
          </div>
          {note.applyIva && (
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, padding: '4px 0', color: '#453f52' }}>
              <span>IVA ({Math.round(note.ivaRate * 100)}%)</span>
              <span>{formatCurrency(totals.iva)}</span>
            </div>
          )}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              borderTop: '2px solid #7c3aed',
              marginTop: 8,
              paddingTop: 10,
              fontSize: 18,
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
            padding: 16,
            fontSize: 12,
            color: '#6b6577',
          }}
        >
          <div style={{ fontWeight: 600, color: '#1a1626', marginBottom: 4, textTransform: 'uppercase' }}>Notas</div>
          <div style={{ textTransform: 'uppercase' }}>{note.notes}</div>
        </div>
      )}

      <div style={{ marginTop: 40, textAlign: 'center', fontSize: 12, color: '#9b95a8' }}>
        Gracias por su preferencia · {business.name}
      </div>
    </div>
  )
}