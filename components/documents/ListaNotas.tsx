'use client'

import Link from 'next/link'
import { FileText, RotateCw, Trash2, ChevronRight } from 'lucide-react'
import { noteTotal } from '@/lib/calculations'
import { formatCurrency } from '@/lib/format'
import type { Note } from '@/lib/types'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

interface ListaNotasProps {
  notes: Note[]
  isLoading: boolean
  isError: boolean
  onRetry: () => void
  onSelect: (note: Note) => void
}

const dateFmt = new Intl.DateTimeFormat('es-MX', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
})

function safeDate(d?: string | null) {
  if (!d) return ''
  try {
    return dateFmt.format(new Date(d))
  } catch {
    return ''
  }
}

export function ListaNotas({
  notes,
  isLoading,
  isError,
  onRetry,
  onSelect,
}: ListaNotasProps) {
  if (isLoading) {
    return <NotesSkeleton />
  }

  if (isError) {
    return <InlineError message="No se pudieron cargar tus notas." onRetry={onRetry} />
  }

  if (notes.length === 0) {
    return <EmptyNotes />
  }

  return (
    <Card className="gap-0 overflow-hidden py-0">
      <ul className="divide-y">
        {notes.map((note) => (
          <li key={note.id}>
            <Button
              variant="ghost"
              onClick={() => onSelect(note)}
              className={cn(
                'flex w-full h-auto min-h-16 items-center justify-start gap-3 px-4 py-3 text-left font-normal rounded-none',
                'transition-colors hover:bg-accent/60 active:bg-accent',
                'outline-none focus-visible:bg-accent'
              )}
            >
              {/* Icon / Avatar */}
              <div className="flex size-12 shrink-0 flex-col items-center justify-center rounded-lg bg-muted leading-none">
                <FileText className="size-5 text-muted-foreground" aria-hidden />
              </div>

              {/* Principal Info */}
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium text-[15px] text-foreground capitalize">
                  {note.customer.name}
                </p>
                <div className="mt-0.5 flex items-center gap-1.5 text-[13px] text-muted-foreground">
                  <span className="font-mono uppercase">{note.folio}</span>
                  <span aria-hidden>&bull;</span>
                  <span className="capitalize">{safeDate(note.createdAt)}</span>
                </div>
              </div>

              {/* Total & Status */}
              <div className="flex shrink-0 flex-col items-end gap-0.5 sm:mr-4">
                <span className="font-medium tabular-nums text-[15px] text-foreground">
                  {formatCurrency(noteTotal(note))}
                </span>
                <span
                  className={cn(
                    'text-xs',
                    note.status === 'quote' ? 'text-muted-foreground' : 'text-success'
                  )}
                >
                  {note.status === 'quote' ? 'Cotización' : 'Nota'}
                </span>
              </div>

              {/* Actions */}
              <div className="flex items-center text-muted-foreground/40 sm:mr-2">
                <ChevronRight className="size-5" aria-hidden />
              </div>
            </Button>
          </li>
        ))}
      </ul>
    </Card>
  )
}

/* ─── Subcomponentes ────────────────────────────────────────────────────── */

function EmptyNotes() {
  return (
    <Card className="flex flex-col items-center gap-3 px-6 py-12 text-center">
      <div className="flex size-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
        <FileText className="size-6" aria-hidden />
      </div>
      <p className="text-[15px] font-medium">Aún no tienes notas registradas</p>
      <Button asChild className="mt-2">
        <Link href="/tools/notas-venta/crear-nota-venta">Crear nota</Link>
      </Button>
    </Card>
  )
}

function InlineError({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <Card className="flex flex-col items-center justify-between gap-4 p-5 sm:flex-row">
      <p className="text-[15px] text-muted-foreground">{message} Revisa tu conexión.</p>
      <Button variant="outline" onClick={onRetry} className="w-full sm:w-auto">
        <RotateCw className="mr-2 size-4" aria-hidden />
        Reintentar
      </Button>
    </Card>
  )
}

function NotesSkeleton() {
  return (
    <Card className="gap-0 py-0" aria-busy="true" aria-label="Cargando notas">
      <div className="divide-y">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="flex min-h-16 items-center gap-3 px-4 py-3 text-left"
          >
            <Skeleton className="size-12 shrink-0 rounded-lg" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-3/5" />
              <Skeleton className="h-3.5 w-2/5" />
            </div>
            <div className="flex shrink-0 flex-col items-end gap-2">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-3 w-10" />
            </div>
            <Skeleton className="size-9 rounded-md shrink-0 ml-1 sm:ml-4" />
          </div>
        ))}
      </div>
    </Card>
  )
}
