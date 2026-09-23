// app/tools/notas-venta/page.tsx
'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  FilePlus2,
  Pencil,
  Trash2,
} from 'lucide-react'
import { toast } from 'sonner'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { financeApi } from '@/lib/api/finance'
import { defaultBusinessConfig } from '@/lib/config'
import type { Note } from '@/lib/types'
import type { SalesNote, BusinessConfig } from '@/types/finance'
import { PageHeader } from '@/components/admin/page-header'
import { PrintSaleNoteDocument } from '@/components/documents/sale-note-document'
import { NoteCardPreview } from '@/components/documents/note-card-preview'
import { DocumentActions } from '@/components/documents/document-actions'
import { ListaNotas } from '@/components/documents/ListaNotas'
import { Button } from '@/components/ui/button'
import { MobileFab } from '@/components/ui/mobile-fab'
import { SearchInput } from '@/components/ui/search-input'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { AppBottomSheet } from '@/components/ui/app-bottom-sheet'

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
        <ListaNotas
          notes={filtered}
          isLoading={isLoading}
          isError={isError}
          onRetry={refetch}
          onSelect={setSelected}
        />
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
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  setNoteToDelete(selected)
                  setSelected(null)
                }}
                className="size-11 rounded-full text-destructive hover:bg-destructive/10 hover:text-destructive"
                aria-label="Eliminar nota"
              >
                <Trash2 className="size-5" aria-hidden />
              </Button>
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
            </div>
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
      <ConfirmDialog
        open={noteToDelete !== null}
        onOpenChange={(o) => !o && setNoteToDelete(null)}
        title={`¿Eliminar la nota ${noteToDelete?.folio}?`}
        description="El registro se borrará permanentemente. Esta acción no se puede deshacer."
        confirmText={deleteMutation.isPending ? 'Eliminando...' : 'Eliminar nota'}
        onConfirm={() => noteToDelete && deleteMutation.mutate(noteToDelete.id)}
        isPending={deleteMutation.isPending}
        variant="destructive"
      />
    </div>
  )
}