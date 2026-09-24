// components/documents/note-card-preview.tsx
import { computeNoteTotals, itemAmount } from '@/lib/calculations'
import { formatCurrency } from '@/lib/format'
import { formatMxPhone, toMxPhone } from '@/lib/display'
import type { BusinessConfig, Note } from '@/lib/types'
import {
  ContactButtons,
  DetailAmountRow,
  DetailDateRow,
  DetailSection,
  DetailSummary,
} from '@/components/ui/detail'

interface NoteCardPreviewProps {
  note: Note
  /** Se conserva por compatibilidad; la vista previa no lo usa. */
  business?: BusinessConfig
}

/** Acepta 0.16 o 16 y devuelve "16". */
function ivaPercent(rate: number): string {
  const pct = rate > 1 ? rate : rate * 100
  return Number.isFinite(pct) ? String(Math.round(pct * 100) / 100) : '16'
}

/**
 * Vista de detalle de una nota o cotización. Solo presentación:
 * las acciones (editar, eliminar, compartir) las pone quien la usa.
 */
export function NoteCardPreview({ note }: NoteCardPreviewProps) {
  const totals = computeNoteTotals(note.items, note.applyIva, note.ivaRate)
  const phone = toMxPhone(note.customer.phone)
  const kind = note.status === 'quote' ? 'cotización' : 'nota'

  return (
    <div className="space-y-8">
      <DetailSummary>
        <DetailDateRow value={note.createdAt} emptyText="Sin fecha" />
        <DetailAmountRow amount={totals.total} />
      </DetailSummary>

      <DetailSection title="Cliente">
        <div>
          <p className="text-base font-medium capitalize">{note.customer.name}</p>
          {note.customer.phone && (
            <p className="text-[15px] tabular-nums text-muted-foreground">
              {phone ? formatMxPhone(phone) : note.customer.phone}
            </p>
          )}
          {note.customer.address && (
            <p className="mt-1 text-[15px] leading-relaxed text-muted-foreground text-pretty capitalize">
              {note.customer.address}
            </p>
          )}
        </div>
        {phone && (
          <ContactButtons phone={phone} message={`Hola, te escribo sobre tu ${kind} ${note.folio}.`} />
        )}
      </DetailSection>

      <DetailSection title="Conceptos">
        {note.items.length === 0 ? (
          <p className="text-[15px] text-muted-foreground">Esta {kind} no tiene conceptos.</p>
        ) : (
          <ul className="divide-y rounded-xl border">
            {note.items.map((item) => (
              <li key={item.id} className="flex items-start justify-between gap-4 px-4 py-3">
                <div className="min-w-0 flex-1">
                  <p className="text-base font-medium leading-snug text-pretty capitalize">
                    {item.description || 'Sin descripción'}
                  </p>
                  <p className="mt-0.5 text-sm tabular-nums text-muted-foreground">
                    {item.quantity} × {formatCurrency(item.unitPrice)}
                  </p>
                </div>
                <p className="shrink-0 text-base font-medium tabular-nums">{formatCurrency(itemAmount(item))}</p>
              </li>
            ))}
          </ul>
        )}

        {/* Desglose solo si hay IVA; sin IVA el total del resumen ya lo dice todo */}
        {note.applyIva && note.items.length > 0 && (
          <dl className="space-y-1.5 px-4 text-[15px]">
            <div className="flex justify-between text-muted-foreground">
              <dt>Subtotal</dt>
              <dd className="tabular-nums">{formatCurrency(totals.subtotal)}</dd>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <dt>IVA ({ivaPercent(note.ivaRate)}%)</dt>
              <dd className="tabular-nums">{formatCurrency(totals.iva)}</dd>
            </div>
            <div className="flex justify-between font-medium">
              <dt>Total</dt>
              <dd className="tabular-nums">{formatCurrency(totals.total)}</dd>
            </div>
          </dl>
        )}
      </DetailSection>

      {note.notes && (
        <DetailSection title="Observaciones">
          <p className="whitespace-pre-line text-base leading-relaxed text-pretty">{note.notes}</p>
        </DetailSection>
      )}
    </div>
  )
}