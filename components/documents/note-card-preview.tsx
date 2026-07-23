'use client'

import { computeNoteTotals, itemAmount } from '@/lib/calculations'
import { formatCurrency, formatDate } from '@/lib/format'
import type { BusinessConfig, Note } from '@/lib/types'
import { User, Phone, MapPin, Calendar, FileText } from 'lucide-react'

interface NoteCardPreviewProps {
  note: Note
  business: BusinessConfig
}

/**
 * Vista previa de una nota de venta optimizada para mobile.
 * Muestra los datos en tarjetas apiladas — legibles sin desbordamiento.
 * NO se usa para exportar; para eso está PrintSaleNoteDocument.
 */
export function NoteCardPreview({ note, business }: NoteCardPreviewProps) {
  const totals = computeNoteTotals(note.items, note.applyIva, note.ivaRate)

  return (
    <div className="space-y-3">
      {/* Encabezado: tipo de doc + folio + fecha */}
      <div className="rounded-2xl bg-gradient-to-br from-violet-600 to-violet-800 p-4 text-white">
        <div className="flex items-center justify-between mb-1">
          <span className="text-violet-200 text-[10px] font-bold uppercase tracking-widest">
            {note.status === 'quote' ? 'Cotización' : 'Nota de Venta'}
          </span>
          <span className="bg-white/20 text-white text-xs font-bold px-2.5 py-1 rounded-lg">
            {note.folio}
          </span>
        </div>
        <div className="text-xs text-violet-300 mt-2 flex items-center gap-1.5">
          <Calendar className="h-3 w-3" />
          {formatDate(note.createdAt)}
        </div>
        {business.name && (
          <div className="text-white/90 text-xs mt-1 font-medium uppercase">{business.name}</div>
        )}
      </div>

      {/* Cliente */}
      <div className="rounded-2xl border border-violet-100 bg-white overflow-hidden">
        <div className="px-4 py-2.5 border-b border-violet-50 bg-violet-50/60">
          <span className="text-[10px] font-bold uppercase tracking-wider text-violet-400 flex items-center gap-1.5">
            <User className="h-3 w-3" />
            Cliente
          </span>
        </div>
        <div className="px-4 py-3 space-y-2">
          <div className="font-semibold text-violet-950 uppercase text-sm">{note.customer.name}</div>
          {note.customer.phone && (
            <div className="flex items-center gap-2 text-violet-600 text-sm">
              <Phone className="h-3.5 w-3.5 text-violet-400 flex-shrink-0" />
              {note.customer.phone}
            </div>
          )}
          {note.customer.address && (
            <div className="flex items-start gap-2 text-violet-600 text-sm">
              <MapPin className="h-3.5 w-3.5 text-violet-400 flex-shrink-0 mt-0.5" />
              <span className="uppercase">{note.customer.address}</span>
            </div>
          )}
        </div>
      </div>

      {/* Conceptos */}
      <div className="rounded-2xl border border-violet-100 bg-white overflow-hidden">
        <div className="px-4 py-2.5 border-b border-violet-50 bg-violet-50/60">
          <span className="text-[10px] font-bold uppercase tracking-wider text-violet-400 flex items-center gap-1.5">
            <FileText className="h-3 w-3" />
            Conceptos ({note.items.length})
          </span>
        </div>
        <div className="divide-y divide-violet-50">
          {note.items.map((item) => (
            <div key={item.id} className="px-4 py-3 flex items-start gap-3">
              {/* Cantidad */}
              <div className="bg-violet-100 text-violet-700 text-xs font-bold rounded-lg w-7 h-7 flex items-center justify-center flex-shrink-0 mt-0.5">
                {item.quantity}
              </div>
              {/* Descripción */}
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-violet-950 uppercase leading-snug">{item.description}</div>
                <div className="text-xs text-violet-400 mt-0.5">{formatCurrency(item.unitPrice)} c/u</div>
              </div>
              {/* Importe */}
              <div className="text-sm font-bold text-violet-700 flex-shrink-0">
                {formatCurrency(itemAmount(item))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Notas adicionales */}
      {note.notes && (
        <div className="rounded-2xl border border-violet-100 bg-violet-50/40 px-4 py-3">
          <div className="text-[10px] font-bold uppercase tracking-wider text-violet-400 mb-1">Observaciones</div>
          <div className="text-sm text-violet-700 uppercase">{note.notes}</div>
        </div>
      )}

      {/* Totales */}
      <div className="rounded-2xl border border-violet-100 bg-white px-4 py-3 space-y-2">
        <div className="flex justify-between text-sm text-violet-600">
          <span>Subtotal</span>
          <span className="font-semibold">{formatCurrency(totals.subtotal)}</span>
        </div>
        {note.applyIva && (
          <div className="flex justify-between text-sm text-violet-600">
            <span>IVA ({Math.round(note.ivaRate * 100)}%)</span>
            <span className="font-semibold">{formatCurrency(totals.iva)}</span>
          </div>
        )}
        <div className="flex justify-between pt-2 border-t-2 border-violet-700">
          <span className="text-base font-black text-violet-950">TOTAL</span>
          <span className="text-xl font-black text-violet-700">{formatCurrency(totals.total)}</span>
        </div>
      </div>
    </div>
  )
}
