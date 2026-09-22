// components/documents/note-card-preview.tsx
'use client'

import { computeNoteTotals, itemAmount } from '@/lib/calculations'
import { formatCurrency, formatDate } from '@/lib/format'
import type { BusinessConfig, Note } from '@/lib/types'
import { User, Phone, MapPin, Calendar, FileText } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

interface NoteCardPreviewProps {
  note: Note
  business: BusinessConfig
}

export function NoteCardPreview({ note, business }: NoteCardPreviewProps) {
  const totals = computeNoteTotals(note.items, note.applyIva, note.ivaRate)

  return (
    <div className="space-y-4">
      {/* Encabezado */}
      <Card className="flex flex-col gap-2 p-5">
        <div className="flex items-center justify-between">
          <Badge variant="secondary" className="font-medium text-muted-foreground">
            {note.status === 'quote' ? 'Cotización' : 'Nota de venta'}
          </Badge>
          <span className="font-mono text-sm font-semibold">{note.folio}</span>
        </div>
        <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar className="size-4" aria-hidden />
          {formatDate(note.createdAt)}
        </div>
        {business.name && (
          <p className="mt-1 text-[15px] font-semibold">{business.name}</p>
        )}
      </Card>

      {/* Cliente */}
      <Card className="gap-0 py-0">
        <div className="flex items-center gap-2 border-b bg-muted/30 px-5 py-3">
          <User className="size-4 text-muted-foreground" aria-hidden />
          <h2 className="text-sm font-semibold">Cliente</h2>
        </div>
        <div className="space-y-3 p-5">
          <p className="font-medium">{note.customer.name}</p>
          {note.customer.phone && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Phone className="size-4 shrink-0" aria-hidden />
              {note.customer.phone}
            </div>
          )}
          {note.customer.address && (
            <div className="flex items-start gap-2 text-sm text-muted-foreground">
              <MapPin className="size-4 shrink-0" aria-hidden />
              <span>{note.customer.address}</span>
            </div>
          )}
        </div>
      </Card>

      {/* Conceptos */}
      <Card className="gap-0 py-0">
        <div className="flex items-center gap-2 border-b bg-muted/30 px-5 py-3">
          <FileText className="size-4 text-muted-foreground" aria-hidden />
          <h2 className="text-sm font-semibold">Conceptos ({note.items.length})</h2>
        </div>
        <ul className="divide-y">
          {note.items.map((item) => (
            <li key={item.id} className="flex items-start gap-4 p-5">
              <div className="flex size-7 shrink-0 items-center justify-center rounded-md bg-muted text-sm font-medium">
                {item.quantity}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[15px] font-medium leading-snug">{item.description}</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {formatCurrency(item.unitPrice)} c/u
                </p>
              </div>
              <div className="shrink-0 font-medium tabular-nums">
                {formatCurrency(itemAmount(item))}
              </div>
            </li>
          ))}
        </ul>
      </Card>

      {/* Observaciones */}
      {note.notes && (
        <Card className="p-5 bg-muted/20">
          <h2 className="text-sm font-semibold text-muted-foreground">Observaciones</h2>
          <p className="mt-2 text-[15px]">{note.notes}</p>
        </Card>
      )}

      {/* Totales */}
      <Card className="space-y-3 p-5">
        <div className="flex justify-between text-[15px] text-muted-foreground">
          <span>Subtotal</span>
          <span className="font-medium">{formatCurrency(totals.subtotal)}</span>
        </div>
        {note.applyIva && (
          <div className="flex justify-between text-[15px] text-muted-foreground">
            <span>IVA ({Math.round(note.ivaRate * 100)}%)</span>
            <span className="font-medium">{formatCurrency(totals.iva)}</span>
          </div>
        )}
        <div className="flex justify-between border-t pt-3">
          <span className="font-semibold">Total</span>
          <span className="text-lg font-semibold tabular-nums text-primary">
            {formatCurrency(totals.total)}
          </span>
        </div>
      </Card>
    </div>
  )
}