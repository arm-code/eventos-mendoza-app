// app/tools/notas-venta/page.tsx
'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { FilePlus2, Pencil, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { financeApi } from '@/lib/api/finance'
import { defaultBusinessConfig } from '@/lib/config'
import { toSlug } from '@/lib/display'
import type { Note } from '@/lib/types'
import type { BusinessConfig, SalesNote } from '@/types/finance'
import { PageHeader } from '@/components/admin/page-header'
import { PrintSaleNoteDocument } from '@/components/documents/sale-note-document'
import { NoteCardPreview } from '@/components/documents/note-card-preview'
import { DocumentActions } from '@/components/documents/document-actions'
import { ListaNotas } from '@/components/documents/ListaNotas'
import { Button } from '@/components/ui/button'
import { TOUCH } from '@/components/ui/detail'
import { MobileFab } from '@/components/ui/mobile-fab'
import { SearchInput } from '@/components/ui/search-input'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { AppBottomSheet } from '@/components/ui/app-bottom-sheet'
import { cn } from '@/lib/utils'
import { useDebouncedValue } from '@/hooks/useDebouncedValue'

export default function NotesHistoryPage() {
  const queryClient = useQueryClient()
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState<Note | null>(null)
  const [noteToDelete, setNoteToDelete] = useState<Note | null>(null)

  const debouncedQuery = useDebouncedValue(query.trim(), 300)

  const { data: rawNotes, isLoading, isError, refetch } = useQuery({
    queryKey: ['salesNotes', debouncedQuery],
    queryFn: () => financeApi.getSalesNotes({ search: debouncedQuery }),
    placeholderData: keepPreviousData, // mantiene la lista mientras llega la nueva
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

  const selectedKind = selected?.status === 'quote' ? 'Cotización' : 'Nota'

  return (
    <div className="space-y-8 pb-28 sm:pb-8">
      <PageHeader
        title="Tus notas"
        description="Busca, comparte o administra tus notas y cotizaciones."
        action={
          <Button asChild className="hidden sm:inline-flex">
            <Link href="/tools/notas-venta/crear-nota-venta">
              <FilePlus2 aria-hidden />
              Crear nota
            </Link>
          </Button>
        }
      />

      <section aria-label="Buscar notas">
        <SearchInput value={query} onChange={setQuery} placeholder="Buscar por folio o cliente" />
      </section>

      <section aria-label="Lista de notas">
        <ListaNotas
          notes={filtered}
          isLoading={isLoading}
          isError={isError}
          onRetry={refetch}
          onSelect={setSelected}
        />
      </section>

      <MobileFab href="/tools/notas-venta/crear-nota-venta" aria-label="Nueva nota de venta" title="Nueva nota" />

      {/* Detalle de la nota */}
      <AppBottomSheet
        open={selected !== null}
        onOpenChange={(o) => !o && setSelected(null)}
        title={selected ? `${selectedKind} ${selected.folio}` : ''}
        mobileHeight="h-[92dvh] max-h-[92dvh]"
        headerAction={
          selected && (
            <Button
              asChild
              variant="ghost"
              size="icon"
              className="size-11 rounded-full text-muted-foreground hover:text-foreground"
            >
              <Link
                href={`/tools/notas-venta/editar-nota-venta/${encodeURIComponent(selected.id)}`}
                onClick={() => setSelected(null)}
                aria-label={`Editar ${selectedKind.toLowerCase()}`}
              >
                <Pencil className="size-5" aria-hidden />
              </Link>
            </Button>
          )
        }
        footer={
          selected && (
            <DocumentActions
              placement="inline"
              filename={`${selectedKind.toLowerCase()}-${toSlug(selected.folio, 'nota')}`}
              exportNode={<PrintSaleNoteDocument note={selected} business={businessConfig} />}
            />
          )
        }
      >
        {selected && (
          <div className="space-y-8">
            <NoteCardPreview note={selected} business={businessConfig} />

            {/* Eliminar: al final y separado, igual que "Cancelar evento" */}
            <div className="border-t pt-6">
              <Button
                variant="ghost"
                className={cn(TOUCH, 'w-full text-destructive hover:bg-destructive/10 hover:text-destructive')}
                onClick={() => {
                  setNoteToDelete(selected)
                  setSelected(null)
                }}
              >
                <Trash2 aria-hidden />
                Eliminar {selectedKind.toLowerCase()}
              </Button>
            </div>
          </div>
        )}
      </AppBottomSheet>

      <ConfirmDialog
        open={noteToDelete !== null}
        onOpenChange={(isOpen) => !isOpen && setNoteToDelete(null)}
        title={`¿Eliminar la ${noteToDelete?.status === 'quote' ? 'cotización' : 'nota'} ${noteToDelete?.folio ?? ''}?`}
        description="Se borrará por completo y no podrás recuperarla."
        confirmText="Sí, eliminar"
        onConfirm={() => noteToDelete && deleteMutation.mutate(noteToDelete.id)}
        isPending={deleteMutation.isPending}
      />
    </div>
  )
}