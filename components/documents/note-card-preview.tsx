// components/documents/note-card-preview.tsx
'use client'

import { computeNoteTotals, itemAmount } from '@/lib/calculations'
import { formatCurrency, formatDate } from '@/lib/format'
import type { BusinessConfig, Note } from '@/lib/types'
import { User, Phone, MapPin } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

interface NoteCardPreviewProps {
  note: Note
  business: BusinessConfig
}

export function NoteCardPreview({ note, business }: NoteCardPreviewProps) {
  const totals = computeNoteTotals(note.items, note.applyIva, note.ivaRate)

  return (
    <div className="space-y-6 px-1">
      <div className="flex items-start justify-between">
        <Badge variant="secondary" className="font-medium text-muted-foreground">
          {note.status === 'quote' ? 'Cotización' : 'Nota de venta'}
        </Badge>
        <div className="text-right">
          <span className="block font-mono text-[15px] font-semibold">{note.folio}</span>
          <span className="text-[13px] text-muted-foreground">{formatDate(note.createdAt)}</span>
        </div>
      </div>

      {/* Cliente */}
      <section className="rounded-xl border bg-muted/10 p-4">
        <h3 className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          <User className="size-4" aria-hidden />
          Cliente
        </h3>
        <p className="font-medium capitalize">{note.customer.name}</p>
        {note.customer.phone && (
          <p className="mt-1.5 flex items-center gap-2 text-sm text-muted-foreground">
            <Phone className="size-3.5 shrink-0" aria-hidden />
            {note.customer.phone}
          </p>
        )}
        {note.customer.address && (
          <p className="mt-1.5 flex items-start gap-2 text-sm text-muted-foreground">
            <MapPin className="size-3.5 shrink-0" aria-hidden />
            <span className='capitalize'>{note.customer.address}</span>
          </p>
        )}
      </section>

      {/* Conceptos */}
      <section>
        <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Conceptos
        </h3>
        <ul className="divide-y border-y">
          {note.items.map((item) => (
            <li key={item.id} className="flex items-start justify-between gap-4 py-3">
              <div className="min-w-0 flex-1">
                <p className="text-[15px] font-medium leading-snug capitalize">{item.description}</p>
                <p className="mt-1 text-[13px] text-muted-foreground">
                  {item.quantity} x {formatCurrency(item.unitPrice)}
                </p>
              </div>
              <div className="shrink-0 font-medium tabular-nums">
                {formatCurrency(itemAmount(item))}
              </div>
            </li>
          ))}
        </ul>
      </section>

      {note.notes && (
        <section className="rounded-xl border bg-muted/20 p-4">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Observaciones</h3>
          <p className="mt-2 text-[15px] leading-relaxed">{note.notes}</p>
        </section>
      )}

      <section className="space-y-2 pt-2 text-right">
        <div className="flex justify-between text-[15px] text-muted-foreground">
          <span>Subtotal</span>
          <span className="font-medium tabular-nums">{formatCurrency(totals.subtotal)}</span>
        </div>
        {note.applyIva && (
          <div className="flex justify-between text-[15px] text-muted-foreground">
            <span>IVA (16%)</span>
            <span className="font-medium tabular-nums">{formatCurrency(totals.iva)}</span>
          </div>
        )}
        <div className="flex justify-between border-t pt-3 font-semibold text-primary">
          <span className="text-lg">Total</span>
          <span className="text-xl tabular-nums">{formatCurrency(totals.total)}</span>
        </div>
      </section>
    </div>
  )
}