'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { Eye, FilePlus2, Search, Trash2, Loader2, FileText, Calendar, User } from 'lucide-react'
import { toast } from 'sonner'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { financeApi } from '@/lib/api/finance'
import { noteTotal } from '@/lib/calculations'
import { formatCurrency, formatDate } from '@/lib/format'
import { defaultBusinessConfig } from '@/lib/config'
import type { Note } from '@/lib/types'
import type { SalesNote, BusinessConfig } from '@/types/finance'
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
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { Loader } from '@/components/Loaders/Loader.component'

export default function NotesHistoryPage() {
  const queryClient = useQueryClient()
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState<Note | null>(null)

  const { data: rawNotes = [], isLoading } = useQuery({
    queryKey: ['salesNotes', query],
    queryFn: () => financeApi.getSalesNotes({ search: query }),
  })

  const { data: rawEvents = [] } = useQuery({
    queryKey: ['businessEvents'],
    queryFn: () => financeApi.getBusinessEvents(),
  })
  const eventsList = Array.isArray(rawEvents) ? rawEvents : []

  const { data: apiConfig } = useQuery({
    queryKey: ['businessConfig'],
    queryFn: () => financeApi.getConfig(),
  })
  const businessConfig: BusinessConfig = apiConfig || defaultBusinessConfig

  const deleteMutation = useMutation({
    mutationFn: (id: string) => financeApi.deleteSalesNote(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['salesNotes'] })
      toast.success('Nota eliminada correctamente')
    },
    onError: (err: any) => {
      toast.error(err.message || 'Error al eliminar la nota')
    },
  })

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
    <div className="space-y-4 sm:space-y-6">
      <PageHeader
        title="Historial de notas"
        description="Consulta, exporta a PDF/Imagen o administra las notas de venta y cotizaciones."
        action={
          <Button
            asChild
            className="hidden sm:inline-flex bg-violet-600 hover:bg-violet-700 text-white gap-2 font-semibold h-11 rounded-xl shadow-lg shadow-violet-600/20 active:scale-[0.98] transition-all touch-manipulation"
          >
            <Link href="/tools/crear-nota-venta">
              <FilePlus2 className="h-4 w-4" />
              <span>Nueva nota</span>
            </Link>
          </Button>
        }
      />

      {/* Buscador */}
      <div className="relative">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-violet-400" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar por folio o cliente..."
          className="h-12 pl-10 rounded-xl border-violet-200 bg-white focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 shadow-sm text-sm"
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
                <TableRow
                  key={note.id}
                  className="hover:bg-violet-50/40 border-b border-violet-100/60 transition-colors"
                >
                  <TableCell className="font-bold text-violet-950">{note.folio}</TableCell>
                  <TableCell className="font-medium text-violet-900">{note.customer.name}</TableCell>
                  <TableCell>
                    <Badge
                      variant="secondary"
                      className={cn(
                        "rounded-full px-2.5 py-0.5 text-xs font-medium",
                        note.status === 'quote'
                          ? 'bg-violet-100 text-violet-700 border-violet-200'
                          : 'bg-green-100 text-green-700 border-green-200'
                      )}
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
                      <motion.div whileTap={{ scale: 0.9 }}>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setSelected(note)}
                          className="text-violet-600 hover:bg-violet-100 hover:text-violet-900 h-9 w-9 rounded-lg touch-manipulation"
                          aria-label="Ver nota"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </motion.div>
                      <motion.div whileTap={{ scale: 0.9 }}>
                        <Button
                          variant="ghost"
                          size="icon"
                          disabled={deleteMutation.isPending}
                          className="text-red-500 hover:bg-red-50 hover:text-red-700 h-9 w-9 rounded-lg touch-manipulation"
                          onClick={() => handleDelete(note.id)}
                          aria-label="Eliminar nota"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </motion.div>
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
                        <span>Cargando notas...</span>
                      </div>
                    ) : (
                      'No hay notas guardadas.'
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
        <AnimatePresence>
          {filtered.map((note, index) => {
            const ef = eventFolio(note.eventId)
            return (
              <motion.div
                key={note.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.03 }}
                whileTap={{ scale: 0.995, backgroundColor: "rgba(139, 92, 246, 0.04)" }}
              >
                <Card className="border-violet-100 bg-white shadow-sm active:shadow-md transition-shadow touch-manipulation">
                  <CardContent className="flex flex-col gap-3 p-4">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <User className="h-3.5 w-3.5 text-violet-400 flex-shrink-0" />
                          <p className="font-bold text-violet-950 truncate text-sm">{note.customer.name}</p>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-violet-500">
                          <FileText className="h-3 w-3 flex-shrink-0" />
                          <span className="font-mono">{note.folio}</span>
                          <span className="w-1 h-1 rounded-full bg-violet-300" />
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {formatDate(note.createdAt)}
                          </span>
                        </div>
                      </div>
                      <Badge
                        variant="secondary"
                        className={cn(
                          "rounded-full px-2.5 py-0.5 text-[10px] font-medium flex-shrink-0",
                          note.status === 'quote'
                            ? 'bg-violet-100 text-violet-700 border-violet-200'
                            : 'bg-green-100 text-green-700 border-green-200'
                        )}
                      >
                        {note.status === 'quote' ? 'Cotización' : 'Nota'}
                      </Badge>
                    </div>

                    {ef && (
                      <span className="text-xs text-violet-500 font-medium bg-violet-50 px-2 py-1 rounded-lg inline-block w-fit">
                        Evento {ef}
                      </span>
                    )}

                    <div className="flex items-center justify-between pt-2 border-t border-violet-50">
                      <span className="text-lg font-extrabold text-violet-950">
                        {formatCurrency(noteTotal(note))}
                      </span>
                      <div className="flex gap-2">
                        <motion.div whileTap={{ scale: 0.9 }}>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelected(note)}
                            className="border-violet-200 text-violet-700 hover:bg-violet-50 font-semibold h-10 rounded-xl touch-manipulation gap-1.5"
                          >
                            <Eye className="h-4 w-4 text-violet-600" />
                            Ver
                          </Button>
                        </motion.div>
                        <motion.div whileTap={{ scale: 0.9 }}>
                          <Button
                            variant="ghost"
                            size="icon"
                            disabled={deleteMutation.isPending}
                            className="text-red-500 hover:bg-red-50 hover:text-red-700 h-10 w-10 rounded-xl touch-manipulation"
                            onClick={() => handleDelete(note.id)}
                            aria-label="Eliminar nota"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </motion.div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )
          })}
        </AnimatePresence>

        {filtered.length === 0 && (
          <Card className="border-violet-100 bg-white">
            <CardContent className="py-12 text-center text-violet-400 flex flex-col items-center gap-3">
              {isLoading ? (
                <>
                  <Loader />
                  <p className="text-sm font-medium">Cargando notas...</p>
                </>
              ) : (
                <>
                  <div className="p-4 rounded-full bg-violet-50">
                    <FileText className="h-6 w-6 text-violet-300" />
                  </div>
                  <p className="text-sm font-medium">No hay notas registradas</p>
                  <p className="text-xs">Crea tu primera nota de venta</p>
                </>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* FAB móvil (posicionado arriba del bottom nav) */}
      <div className="sm:hidden fixed bottom-[72px] right-4 z-30">
        <Link href="/tools/crear-nota-venta">
          <motion.button
            whileTap={{ scale: 0.88 }}
            className="flex items-center justify-center w-14 h-14 rounded-full bg-violet-600 text-white shadow-xl shadow-violet-600/30 active:bg-violet-700 touch-manipulation"
            aria-label="Nueva nota"
          >
            <FilePlus2 className="h-6 w-6" />
          </motion.button>
        </Link>
      </div>

      {/* Dialog de vista/exportación - Desktop */}
      <Dialog open={selected !== null} onOpenChange={(o) => !o && setSelected(null)}>
        <DialogContent className="hidden sm:block max-h-[90dvh] max-w-4xl overflow-y-auto rounded-2xl border-violet-100 bg-white p-4 sm:p-6">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-violet-950">Nota {selected?.folio}</DialogTitle>
          </DialogHeader>
          {selected && (
            <DocumentActions filename={`nota-${selected.folio}`}>
              <SaleNoteDocument note={selected} business={businessConfig} />
            </DocumentActions>
          )}
        </DialogContent>
      </Dialog>

      {/* Sheet de vista/exportación - Móvil */}
      <Sheet open={selected !== null} onOpenChange={(o) => !o && setSelected(null)}>
        <SheetContent
          side="bottom"
          className="sm:hidden h-[92vh] max-h-[92dvh] rounded-t-3xl border-t border-violet-100 bg-white p-0 flex flex-col overflow-hidden"
        >
          <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-sm px-4 pt-3 pb-2 border-b border-violet-100/50 flex-shrink-0">
            <div className="w-10 h-1 rounded-full bg-violet-200 mx-auto mb-3" />
            <SheetHeader className="text-left">
              <SheetTitle className="text-lg font-bold text-violet-950">Nota {selected?.folio}</SheetTitle>
            </SheetHeader>
          </div>
          <div className="px-4 py-4 overflow-y-auto flex-1 pb-4">
            {selected && (
              <DocumentActions filename={`nota-${selected.folio}`}>
                <SaleNoteDocument note={selected} business={businessConfig} />
              </DocumentActions>
            )}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}