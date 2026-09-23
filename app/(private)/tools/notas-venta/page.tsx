// app/tools/notas-venta/page.tsx
'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  Eye,
  FilePlus2,
  Trash2,
  FileText,
  Pencil,
  Plus,
  RotateCw,
} from 'lucide-react'
import { toast } from 'sonner'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { financeApi } from '@/lib/api/finance'
import { noteTotal } from '@/lib/calculations'
import { formatCurrency } from '@/lib/format'
import { defaultBusinessConfig } from '@/lib/config'
import type { Note } from '@/lib/types'
import type { SalesNote, BusinessConfig } from '@/types/finance'
import { PageHeader } from '@/components/admin/page-header'
import { PrintSaleNoteDocument } from '@/components/documents/sale-note-document'
import { NoteCardPreview } from '@/components/documents/note-card-preview'
import { DocumentActions } from '@/components/documents/document-actions'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { MobileFab } from '@/components/ui/mobile-fab'
import { SearchInput } from '@/components/ui/search-input'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { AppBottomSheet } from '@/components/ui/app-bottom-sheet'
import { cn } from '@/lib/utils'

/* ─── Utilidades ────────────────────────────────────────────────────────── */

const dateFmt = new Intl.DateTimeFormat('es-MX', {
  year: 'numeric',
  month: 'short',
  day: 'numeric',
})

function safeDate(iso?: string) {
  if (!iso) return 'Sin fecha'
  const d = new Date(iso)
  return Number.isNaN(d.getTime()) ? 'Fecha inválida' : dateFmt.format(d)
}

/* ─── Página ────────────────────────────────────────────────────────────── */

export default function NotesHistoryPage() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState<Note | null>(null)
  const [noteToDelete, setNoteToDelete] = useState<Note | null>(null)

  const { data: rawNotes, isLoading, isError, refetch } = useQuery({
    queryKey: ['salesNotes', query],
    queryFn: () => financeApi.getSalesNotes({ search: query }),
  })

  const { data: apiConfig } = useQuery({
    queryKey: ['businessConfig'],
    queryFn: () => financeApi.getConfig(),
  })
  const businessConfig: BusinessConfig = apiConfig || defaultBusinessConfig

  const deleteMutation = useMutation({
    mutationFn: (id: string) => financeApi.deleteSalesNote(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['salesNotes'] })
      toast.success('Nota eliminada')
      setNoteToDelete(null)
    },
    onError: () => {
      toast.error('No se pudo eliminar la nota. Revisa tu conexión y vuelve a intentar.')
    },
  })

  const notesList = useMemo<Note[]>(() => {
    const list: SalesNote[] = Array.isArray(rawNotes) ? rawNotes : []
    return list
      .map((n) => {
        const items = (Array.isArray(n.items) ? n.items : []).map((it, idx) => ({
          id: it.id || `it_${idx}`,
          description: it.concept || (it as { description?: string }).description || '',
          quantity: Number(it.quantity) || 1,
          unitPrice: Number(it.unitPrice) || 0,
        }))

        return {
          id: String(n.id),
          folio: n.folio || `NV-${String(n.id).slice(0, 4)}`,
          customer: {
            name: n.customerName || n.customer?.name || 'Cliente sin nombre',
            phone: n.customerPhone || n.customer?.phone || undefined,
            address: n.customerAddress || n.customer?.address || undefined,
            email: n.customerEmail || n.customer?.email || undefined,
          },
          items,
          applyIva: Boolean(n.applyIva),
          ivaRate: Number(n.ivaRate) || 0.16,
          notes: n.notes || undefined,
          status: (n.status === 'quote' ? 'quote' : 'issued') as 'quote' | 'issued',
          eventId: n.eventId || null,
          createdAt: n.createdAt || new Date().toISOString(),
        }
      })
      .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt))
  }, [rawNotes])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return notesList
    return notesList.filter(
      (n) => n.folio.toLowerCase().includes(q) || n.customer.name.toLowerCase().includes(q)
    )
  }, [notesList, query])

  return (
    <div className="space-y-8 pb-28 sm:pb-8">
      <PageHeader
        title="Tus notas"
        description="Busca, exporta o administra tus notas y cotizaciones."
        action={
          <Button asChild className="hidden sm:flex">
            <Link href="/tools/notas-venta/crear-nota-venta">
              <FilePlus2 className="mr-2" aria-hidden />
              Crear nota
            </Link>
          </Button>
        }
      />

      {/* Buscador */}
      <section aria-label="Buscar notas">
        <SearchInput
          value={query}
          onChange={setQuery}
          placeholder="Buscar por folio o cliente..."
        />
      </section>

      {/* Lista de notas */}
      <section aria-label="Lista de notas">
        {isLoading ? (
          <NotesSkeleton />
        ) : isError ? (
          <InlineError message="No se pudieron cargar tus notas." onRetry={() => refetch()} />
        ) : filtered.length === 0 ? (
          <EmptyNotes />
        ) : (
          <Card className="gap-0 overflow-hidden py-0">
            <ul className="divide-y">
              {filtered.map((note) => (
                <li
                  key={note.id}
                  className="flex min-h-16 flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex min-w-0 flex-1 flex-col">
                    <p className="truncate font-medium capitalize">{note.customer.name}</p>
                    <div className="mt-0.5 flex items-center gap-1.5 text-[13px] text-muted-foreground">
                      <span className="font-mono">{note.folio}</span>
                      <span aria-hidden>&bull;</span>
                      <span>{safeDate(note.createdAt)}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:w-auto sm:justify-end sm:gap-6">
                    <div className="flex flex-col items-start sm:items-end gap-1">
                      <span className="font-medium tabular-nums">
                        {formatCurrency(noteTotal(note))}
                      </span>
                      <Badge
                        variant="secondary"
                        className={cn(
                          'px-2 py-0.5 text-xs',
                          note.status === 'quote' ? 'text-muted-foreground' : 'bg-success/10 text-success'
                        )}
                      >
                        {note.status === 'quote' ? 'Cotización' : 'Nota'}
                      </Badge>
                    </div>

                    <div className="flex items-center gap-1 sm:ml-4">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-11 text-muted-foreground hover:text-foreground"
                        onClick={() => setSelected(note)}
                        aria-label={`Ver nota ${note.folio}`}
                      >
                        <Eye aria-hidden />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-11 text-destructive hover:bg-destructive/10"
                        onClick={() => setNoteToDelete(note)}
                        aria-label={`Eliminar nota ${note.folio}`}
                      >
                        <Trash2 aria-hidden />
                      </Button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </Card>
        )}
      </section>

      <MobileFab
        href="/tools/notas-venta/crear-nota-venta"
        aria-label="Nueva nota de venta"
        title="Nueva nota"
      />

      {/* Visor y exportación de nota */}
      <AppBottomSheet
        open={selected !== null}
        onOpenChange={(o) => !o && setSelected(null)}
        title={selected ? `Nota ${selected.folio}` : ''}
        mobileHeight="h-[92vh] max-h-[92dvh]"
        headerAction={
          selected ? (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                const id = selected.id
                setSelected(null)
                router.push(`/tools/notas-venta/editar-nota-venta/${id}`)
              }}
              className="size-11 rounded-full text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              aria-label="Editar nota"
            >
              <Pencil className="size-5" aria-hidden />
            </Button>
          ) : null
        }
      >
        {selected && (
          <DocumentActions
            filename={`nota-${selected.folio}`}
            exportNode={<PrintSaleNoteDocument note={selected} business={businessConfig} />}
          >
            <NoteCardPreview note={selected} business={businessConfig} />
          </DocumentActions>
        )}
      </AppBottomSheet>

      {/* Diálogo de eliminación */}
      <Dialog open={noteToDelete !== null} onOpenChange={(o) => !o && setNoteToDelete(null)}>
        <DialogContent className="w-[calc(100%-2rem)] max-w-md rounded-xl sm:w-full">
          <DialogHeader>
            <DialogTitle>¿Eliminar la nota {noteToDelete?.folio}?</DialogTitle>
          </DialogHeader>
          <p className="text-[15px] text-muted-foreground text-pretty">
            El registro se borrará permanentemente. Esta acción no se puede deshacer.
          </p>
          <div className="mt-4 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button
              variant="outline"
              className="h-11 sm:h-10"
              onClick={() => setNoteToDelete(null)}
              disabled={deleteMutation.isPending}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              className="h-11 sm:h-10"
              onClick={() => noteToDelete && deleteMutation.mutate(noteToDelete.id)}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? 'Eliminando...' : 'Eliminar nota'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
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
            className="flex min-h-16 flex-col justify-between gap-4 px-4 py-3 sm:flex-row sm:items-center"
          >
            <div className="space-y-2">
              <Skeleton className="h-5 w-40" />
              <Skeleton className="h-4 w-28" />
            </div>
            <div className="flex items-center justify-between sm:justify-end sm:gap-6">
              <div className="space-y-2">
                <Skeleton className="h-5 w-20" />
                <Skeleton className="h-4 w-14" />
              </div>
              <div className="flex gap-2 sm:ml-4">
                <Skeleton className="size-11 rounded-md" />
                <Skeleton className="size-11 rounded-md" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}