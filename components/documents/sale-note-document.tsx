// components/documents/sale-note-document.tsx
'use client'

import { forwardRef } from 'react'
import { computeNoteTotals, itemAmount } from '@/lib/calculations'
import { formatCurrency, formatDate } from '@/lib/format'
import type { BusinessConfig, Note } from '@/lib/types'
import { cn } from '@/lib/utils'

interface SaleNoteDocumentProps {
  note: Note
  business: BusinessConfig
}

// ─────────────────────────────────────────────────────────────────────────────
// VISTA PREVIA RESPONSIVA (Móvil/Desktop)
// ─────────────────────────────────────────────────────────────────────────────
export const SaleNoteDocument = forwardRef<HTMLDivElement, SaleNoteDocumentProps>(
  function SaleNoteDocument({ note, business }, ref) {
    const totals = computeNoteTotals(note.items, note.applyIva, note.ivaRate)

    return (
      <div
        ref={ref}
        className="bg-background text-foreground space-y-6 p-4 sm:p-6"
      >
        {/* Encabezado */}
        <header className="flex flex-col gap-4 border-b pb-5 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-1">
            <h1 className="text-xl font-semibold tracking-tight">{business.name}</h1>
            <p className="text-sm text-muted-foreground">Nota de venta / Servicio</p>
            {business.phone && (
              <p className="text-sm text-muted-foreground">{business.phone}</p>
            )}
          </div>
          <div className="flex flex-col items-start gap-2 sm:items-end">
            <span className={cn(
              'rounded-lg border px-2.5 py-1 text-xs font-medium',
              note.status === 'quote' ? 'bg-muted text-muted-foreground' : 'bg-success/10 text-success border-success/20'
            )}>
              {note.status === 'quote' ? 'Cotización' : 'Nota de venta'}
            </span>
            <div className="text-lg font-semibold">{note.folio}</div>
            <div className="text-sm text-muted-foreground">
              {formatDate(note.createdAt)}
            </div>
          </div>
        </header>

        {/* Cliente */}
        <section className="rounded-xl border bg-card p-4">
          <h2 className="text-sm font-semibold text-muted-foreground">Cliente</h2>
          <p className="mt-1 font-medium capitalize">{note.customer.name}</p>
          {note.customer.phone && <p className="mt-1 text-sm">{note.customer.phone}</p>}
          {note.customer.address && <p className="mt-1 text-sm capitalize">{note.customer.address}</p>}
        </section>

        {/* Conceptos */}
        <div className="overflow-x-auto rounded-xl border bg-card">
          <table className="w-full text-left text-[15px]">
            <thead className="border-b bg-muted/50 text-sm font-semibold text-muted-foreground">
              <tr>
                <th className="p-4">Descripción</th>
                <th className="p-4 text-center">Cant.</th>
                <th className="p-4 text-right">P. Unitario</th>
                <th className="p-4 text-right">Importe</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {note.items.map((item) => (
                <tr key={item.id}>
                  <td className="p-4 capitalize">{item.description}</td>
                  <td className="p-4 text-center">{item.quantity}</td>
                  <td className="p-4 text-right tabular-nums">{formatCurrency(item.unitPrice)}</td>
                  <td className="p-4 text-right font-medium tabular-nums">{formatCurrency(itemAmount(item))}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totales */}
        <section className="flex justify-end">
          <div className="w-full space-y-2 rounded-xl border bg-muted/30 p-5 sm:w-72">
            <div className="flex justify-between text-[15px] text-muted-foreground">
              <span>Subtotal</span>
              <span className="tabular-nums">{formatCurrency(totals.subtotal)}</span>
            </div>
            {note.applyIva && (
              <div className="flex justify-between text-[15px] text-muted-foreground">
                <span>IVA ({Math.round(note.ivaRate * 100)}%)</span>
                <span className="tabular-nums">{formatCurrency(totals.iva)}</span>
              </div>
            )}
            <div className="flex justify-between border-t pt-3 font-semibold">
              <span>Total</span>
              <span className="text-lg tabular-nums text-primary">
                {formatCurrency(totals.total)}
              </span>
            </div>
          </div>
        </section>

        {/* Notas adicionales */}
        {note.notes && (
          <section className="rounded-xl border bg-muted/20 p-5 text-sm">
            <h2 className="font-semibold text-muted-foreground">Notas</h2>
            <p className="mt-2 leading-relaxed first-letter:uppercase">{note.notes}</p>
          </section>
        )}
      </div>
    )
  }
)

// ─────────────────────────────────────────────────────────────────────────────
// NODO DE EXPORTACIÓN (PDF/PNG)
// ─────────────────────────────────────────────────────────────────────────────
export function PrintSaleNoteDocument({ note, business }: SaleNoteDocumentProps) {
  const totals = computeNoteTotals(note.items, note.applyIva, note.ivaRate)

  return (
    <div
      className="bg-background text-foreground p-10"
      style={{ width: 794, fontSize: '14px', lineHeight: '1.5' }}
    >
      <header className="mb-8 flex items-start justify-between border-b pb-6">
        <div>
          <h1 className="text-2xl font-semibold">{business.name}</h1>
          <p className="mt-1 text-muted-foreground">Nota de venta / Servicio</p>
          {business.phone && <p className="text-muted-foreground">{business.phone}</p>}
        </div>
        <div className="flex flex-col items-end gap-2">
          <span className={cn(
            'rounded-md border px-3 py-1 text-xs font-semibold',
            note.status === 'quote' ? 'bg-muted text-muted-foreground' : 'bg-success/10 text-success border-success/20'
          )}>
            {note.status === 'quote' ? 'Cotización' : 'Nota de venta'}
          </span>
          <div className="mt-2 text-xl font-semibold">{note.folio}</div>
          <div className="text-muted-foreground">{formatDate(note.createdAt)}</div>
        </div>
      </header>

      <section className="mb-8 rounded-xl border p-5">
        <h2 className="text-sm font-semibold text-muted-foreground">Cliente</h2>
        <p className="mt-2 font-medium capitalize">{note.customer.name}</p>
        {note.customer.phone && <p className="mt-1">{note.customer.phone}</p>}
        {note.customer.address && <p className="mt-1 capitalize">{note.customer.address}</p>}
      </section>

      <table className="mb-8 w-full border-collapse text-left text-sm">
        <thead className="bg-muted/50 text-muted-foreground">
          <tr>
            <th className="border-b p-3 font-semibold">Descripción</th>
            <th className="w-16 border-b p-3 text-center font-semibold">Cant.</th>
            <th className="w-28 border-b p-3 text-right font-semibold">P. Unitario</th>
            <th className="w-32 border-b p-3 text-right font-semibold">Importe</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {note.items.map((item) => (
            <tr key={item.id}>
              <td className="p-3 capitalize">{item.description}</td>
              <td className="p-3 text-center">{item.quantity}</td>
              <td className="p-3 text-right tabular-nums">{formatCurrency(item.unitPrice)}</td>
              <td className="p-3 text-right font-medium tabular-nums">{formatCurrency(itemAmount(item))}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <section className="mb-10 flex justify-end">
        <div className="w-72 space-y-2 rounded-xl border bg-muted/30 p-5">
          <div className="flex justify-between text-muted-foreground">
            <span>Subtotal</span>
            <span className="tabular-nums">{formatCurrency(totals.subtotal)}</span>
          </div>
          {note.applyIva && (
            <div className="flex justify-between text-muted-foreground">
              <span>IVA ({Math.round(note.ivaRate * 100)}%)</span>
              <span className="tabular-nums">{formatCurrency(totals.iva)}</span>
            </div>
          )}
          <div className="flex justify-between border-t pt-3 font-semibold">
            <span>Total</span>
            <span className="text-lg tabular-nums text-primary">{formatCurrency(totals.total)}</span>
          </div>
        </div>
      </section>

      {note.notes && (
        <section className="rounded-xl border bg-muted/20 p-5 text-sm">
          <h2 className="font-semibold text-muted-foreground">Notas</h2>
          <p className="mt-2 leading-relaxed first-letter:uppercase">{note.notes}</p>
        </section>
      )}

      <footer className="mt-12 text-center text-sm text-muted-foreground">
        Gracias por su preferencia · {business.name}
      </footer>
    </div>
  )
}