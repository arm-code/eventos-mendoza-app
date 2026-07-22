'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { Eye, FilePlus2, Search, Trash2, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { financeApi } from '@/lib/api/finance'
import { noteTotal } from '@/lib/calculations'
import { formatCurrency, formatDate } from '@/lib/format'
import { seedBusinessConfig } from '@/lib/mock-data'
import type { Note } from '@/lib/types'
import type { SalesNote } from '@/types/finance'
import { PageHeader } from '@/components/admin/page-header'
import { SaleNoteDocument } from '@/components/documents/sale-note-document'
import { DocumentActions } from '@/components/documents/document-actions'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

export default function NotesHistoryPage() {
  const queryClient = useQueryClient()
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState<Note | null>(null)

  // Query SalesNotes 100% from NestJS API Database
  const { data: rawNotes = [], isLoading } = useQuery({
    queryKey: ['salesNotes', query],
    queryFn: () => financeApi.getSalesNotes({ search: query }),
  })

  // Events for folio linking info
  const { data: rawEvents = [] } = useQuery({
    queryKey: ['businessEvents'],
    queryFn: () => financeApi.getBusinessEvents(),
  })
  const eventsList = Array.isArray(rawEvents) ? rawEvents : []

  // Delete Mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => financeApi.deleteSalesNote(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['salesNotes'] })
      toast.success('Nota eliminada correctamente de la base de datos')
    },
    onError: (err: any) => {
      toast.error(err.message || 'Error al eliminar la nota')
    },
  })

  // Normalize API SalesNotes to Note interface
  const notesList = useMemo<Note[]>(() => {
    const list: SalesNote[] = Array.isArray(rawNotes) ? rawNotes : []
    return list.map((n) => {
      const items = (n.items || []).map((it, idx) => ({
        id: it.id || `it_${idx}`,
        description: it.concept || (it as any).description || '',
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
        status: (n.status === 'quote' ? 'quote' : 'issued') as any,
        eventId: n.eventId || null,
        createdAt: n.createdAt || new Date().toISOString(),
      }
    }).sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt))
  }, [rawNotes])

  // Filter notes by search query if client-side filtering needed
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return notesList
    return notesList.filter(
      (n) =>
        n.folio.toLowerCase().includes(q) ||
        n.customer.name.toLowerCase().includes(q)
    )
  }, [notesList, query])

  function handleDelete(id: string) {
    deleteMutation.mutate(id)
  }

  function eventFolio(eventId?: string | null) {
    if (!eventId) return null
    return eventsList.find((e) => String(e.id) === String(eventId))?.folio ?? null
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Historial de notas"
        description="Consulta, exporta a PDF/Imagen o administra las notas de venta y cotizaciones en base de datos real."
        action={
          <Button asChild className="bg-violet-600 hover:bg-violet-700 text-white gap-2 font-semibold">
            <Link href="/tools/crear-nota-venta">
              <FilePlus2 className="h-4 w-4" />
              Nueva nota
            </Link>
          </Button>
        }
      />

      <div className="relative">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-violet-400" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar por folio (ej. NV-0001) o cliente en la base de datos..."
          className="h-11 pl-10 border-violet-100 bg-white focus:border-violet-500 focus:ring-violet-500 shadow-sm"
        />
      </div>

      {/* Vista de tabla (desktop) */}
      <Card className="hidden md:block border-violet-100 bg-white shadow-sm overflow-hidden">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-violet-50/70 hover:bg-violet-50/70 border-b border-violet-100">
                <TableHead className="font-bold text-violet-950">Folio</TableHead>
                <TableHead className="font-bold text-violet-950">Cliente</TableHead>
                <TableHead className="font-bold text-violet-950">Tipo</TableHead>
                <TableHead className="font-bold text-violet-950">Fecha</TableHead>
                <TableHead className="font-bold text-violet-950 text-right">Total</TableHead>
                <TableHead className="font-bold text-violet-950 text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((note) => (
                <TableRow key={note.id} className="hover:bg-violet-50/40 border-b border-violet-100/60 transition-colors">
                  <TableCell className="font-bold text-violet-950">{note.folio}</TableCell>
                  <TableCell className="font-medium text-violet-900">{note.customer.name}</TableCell>
                  <TableCell>
                    <Badge
                      variant="secondary"
                      className={
                        note.status === 'quote'
                          ? 'bg-violet-100 text-violet-700 border-violet-200'
                          : 'bg-green-100 text-green-700 border-green-200'
                      }
                    >
                      {note.status === 'quote' ? 'Cotización' : 'Nota de venta'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-violet-600/80 text-xs font-medium">
                    {formatDate(note.createdAt)}
                  </TableCell>
                  <TableCell className="text-right font-bold text-violet-950">
                    {formatCurrency(noteTotal(note))}
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setSelected(note)}
                        className="text-violet-600 hover:bg-violet-100 hover:text-violet-900 h-8 w-8"
                        aria-label="Ver nota"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        disabled={deleteMutation.isPending}
                        className="text-red-500 hover:bg-red-50 hover:text-red-700 h-8 w-8"
                        onClick={() => handleDelete(note.id)}
                        aria-label="Eliminar nota"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="py-12 text-center text-violet-400">
                    {isLoading ? (
                      <div className="flex items-center justify-center gap-2 font-medium">
                        <Loader2 className="h-5 w-5 animate-spin" />
                        <span>Cargando notas de la base de datos...</span>
                      </div>
                    ) : (
                      'No hay notas guardadas en la base de datos.'
                    )}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Vista de tarjetas (móvil) */}
      <div className="flex flex-col gap-3 md:hidden">
        {filtered.map((note) => {
          const ef = eventFolio(note.eventId)
          return (
            <Card key={note.id} className="border-violet-100 bg-white shadow-sm hover:border-violet-200 transition-all">
              <CardContent className="flex flex-col gap-3 p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="font-bold text-violet-950 truncate">{note.customer.name}</p>
                    <p className="text-xs font-medium text-violet-600/80">
                      {note.folio} · {formatDate(note.createdAt)}
                    </p>
                  </div>
                  <Badge
                    variant="secondary"
                    className={
                      note.status === 'quote'
                        ? 'bg-violet-100 text-violet-700 border-violet-200'
                        : 'bg-green-100 text-green-700 border-green-200'
                    }
                  >
                    {note.status === 'quote' ? 'Cotización' : 'Nota'}
                  </Badge>
                </div>
                {ef && (
                  <span className="text-xs text-violet-500 font-medium">Vinculada a evento {ef}</span>
                )}
                <div className="flex items-center justify-between pt-1 border-t border-violet-50">
                  <span className="text-lg font-extrabold text-violet-950">
                    {formatCurrency(noteTotal(note))}
                  </span>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelected(note)}
                      className="border-violet-200 text-violet-700 hover:bg-violet-50 font-semibold h-9"
                    >
                      <Eye className="mr-1.5 h-4 w-4 text-violet-600" />
                      Ver
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      disabled={deleteMutation.isPending}
                      className="text-red-500 hover:bg-red-50 hover:text-red-700 h-9 w-9"
                      onClick={() => handleDelete(note.id)}
                      aria-label="Eliminar nota"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
        {filtered.length === 0 && (
          <Card className="border-violet-100 bg-white">
            <CardContent className="py-12 text-center text-violet-400">
              {isLoading ? (
                <div className="flex items-center justify-center gap-2 font-medium">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span>Cargando notas...</span>
                </div>
              ) : (
                'No hay notas de venta registradas en la base de datos.'
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Dialog de vista/exportación */}
      <Dialog open={selected !== null} onOpenChange={(o) => !o && setSelected(null)}>
        <DialogContent className="max-h-[90dvh] max-w-4xl overflow-y-auto border-violet-100 bg-white p-4 sm:p-6">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-violet-950">Nota {selected?.folio}</DialogTitle>
          </DialogHeader>
          {selected && (
            <DocumentActions filename={`nota-${selected.folio}`}>
              <SaleNoteDocument note={selected} business={seedBusinessConfig} />
            </DocumentActions>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
