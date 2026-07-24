'use client'

import { use, useMemo, useState, ChangeEvent, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Save, Trash2, ArrowLeft, User, Phone, MapPin, FileText, Calculator, Pencil, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { financeApi } from '@/lib/api/finance'
import { computeNoteTotals, itemAmount } from '@/lib/calculations'
import { formatCurrency, genId } from '@/lib/format'
import { defaultBusinessConfig } from '@/lib/config'
import type { Note, NoteItem } from '@/lib/types'
import type { CreateSalesNoteDto, SalesNoteStatus, BusinessConfig } from '@/types/finance'
import { PageHeader } from '@/components/admin/page-header'
import { SaleNoteDocument, PrintSaleNoteDocument } from '@/components/documents/sale-note-document'
import { NoteCardPreview } from '@/components/documents/note-card-preview'
import { useIsMobile } from '@/hooks/useIsMobile'
import { DocumentActions } from '@/components/documents/document-actions'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { motion, AnimatePresence } from 'framer-motion'
import { Loader } from '@/components/Loaders/Loader.component'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

const IVA_RATE = 0.16

function emptyItem(): NoteItem {
  return { id: genId('it'), description: '', quantity: 1, unitPrice: 0 }
}

/* ─────────────────────────────────────────────────────────────────────────────
   Página de edición de nota de venta
   ───────────────────────────────────────────────────────────────────────────── */
export default function EditarNotaVentaPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const router = useRouter()
  const queryClient = useQueryClient()
  const isMobile = useIsMobile()

  /* ── State del formulario ── */
  const [customerName, setCustomerName] = useState('')
  const [customerPhone, setCustomerPhone] = useState('')
  const [customerAddress, setCustomerAddress] = useState('')
  const [items, setItems] = useState<NoteItem[]>([emptyItem()])
  const [applyIva, setApplyIva] = useState(false)
  const [notes, setNotes] = useState('')
  const [status, setStatus] = useState<'quote' | 'issued'>('quote')
  const [eventId, setEventId] = useState<string>('none')
  const [savedNote, setSavedNote] = useState<Note | null>(null)
  const [isLoaded, setIsLoaded] = useState(false)

  /* ── Carga nota existente ── */
  const { data: existingNote, isLoading: isLoadingNote } = useQuery({
    queryKey: ['salesNote', resolvedParams.id],
    queryFn: () => financeApi.getSalesNoteById(resolvedParams.id),
    enabled: !!resolvedParams.id,
  })

  /* ── Carga datos de configuración y eventos ── */
  const { data: apiEvents = [] } = useQuery({
    queryKey: ['businessEvents'],
    queryFn: () => financeApi.getBusinessEvents(),
  })
  const availableEvents = Array.isArray(apiEvents) ? apiEvents : []

  const { data: apiConfig } = useQuery({
    queryKey: ['businessConfig'],
    queryFn: () => financeApi.getConfig(),
  })
  const businessConfig: BusinessConfig = apiConfig || defaultBusinessConfig

  /* ── Precargar formulario con datos de la nota ── */
  useEffect(() => {
    if (!existingNote || isLoaded) return

    setCustomerName(existingNote.customerName || existingNote.customer?.name || '')
    setCustomerPhone(existingNote.customerPhone || existingNote.customer?.phone || '')
    setCustomerAddress(existingNote.customerAddress || existingNote.customer?.address || '')
    setApplyIva(Boolean(existingNote.applyIva))
    setNotes(existingNote.notes || '')
    setEventId(existingNote.eventId ? String(existingNote.eventId) : 'none')

    const statusVal = existingNote.status === 'note' || existingNote.status === 'issued' ? 'issued' : 'quote'
    setStatus(statusVal)

    const mappedItems = (existingNote.items || []).map((it: any, idx: number) => ({
      id: it.id || genId('it'),
      description: it.concept || it.description || '',
      quantity: Number(it.quantity) || 1,
      unitPrice: Number(it.unitPrice) || 0,
    }))
    setItems(mappedItems.length > 0 ? mappedItems : [emptyItem()])
    setIsLoaded(true)
  }, [existingNote, isLoaded])

  /* ── Mutación actualizar ── */
  const updateMutation = useMutation({
    mutationFn: (dto: CreateSalesNoteDto) => financeApi.updateSalesNote(resolvedParams.id, dto),
    onSuccess: (apiNote) => {
      queryClient.invalidateQueries({ queryKey: ['salesNotes'] })
      queryClient.invalidateQueries({ queryKey: ['salesNote', resolvedParams.id] })
      toast.success(`Nota ${apiNote.folio || 'actualizada'} guardada correctamente`)

      const mappedNote: Note = {
        id: apiNote.id,
        folio: apiNote.folio || `NV-${apiNote.id.slice(0, 4)}`,
        customer: {
          name: apiNote.customerName || apiNote.customer?.name || customerName.trim(),
          phone: apiNote.customerPhone || apiNote.customer?.phone || customerPhone.trim() || undefined,
          address: apiNote.customerAddress || apiNote.customer?.address || customerAddress.trim() || undefined,
        },
        items: (apiNote.items || []).map((it: any, idx: number) => ({
          id: it.id || `it_${idx}`,
          description: it.concept || it.description || '',
          quantity: it.quantity,
          unitPrice: Number(it.unitPrice),
        })),
        applyIva: Boolean(apiNote.applyIva),
        ivaRate: Number(apiNote.ivaRate || IVA_RATE),
        notes: apiNote.notes || notes.trim() || undefined,
        status: (apiNote.status as any) === 'issued' || (apiNote.status as any) === 'note' ? 'issued' : 'quote',
        eventId: apiNote.eventId || (eventId === 'none' ? null : eventId),
        createdAt: apiNote.createdAt || new Date().toISOString(),
      }
      setSavedNote(mappedNote)
    },
    onError: (err: any) => {
      toast.error(err.message || 'Error al actualizar la nota')
    },
  })

  const totals = useMemo(() => computeNoteTotals(items, applyIva, IVA_RATE), [items, applyIva])

  function updateItem(id: string, patch: Partial<NoteItem>) {
    setItems((prev) => prev.map((it) => (it.id === id ? { ...it, ...patch } : it)))
  }
  function addItem() {
    setItems((prev) => [...prev, emptyItem()])
  }
  function removeItem(id: string) {
    setItems((prev) => (prev.length > 1 ? prev.filter((it) => it.id !== id) : prev))
  }

  function handleSave() {
    if (!customerName.trim()) {
      toast.error('Ingresa el nombre del cliente')
      return
    }
    const validItems = items.filter((it) => it.description.trim() !== '')
    if (validItems.length === 0) {
      toast.error('Agrega al menos un concepto con descripción')
      return
    }

    const dto: CreateSalesNoteDto = {
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim() || undefined,
      customerAddress: customerAddress.trim() || undefined,
      status: status === 'issued' ? ('note' as SalesNoteStatus) : ('quote' as SalesNoteStatus),
      applyIva,
      ivaRate: IVA_RATE,
      notes: notes.trim() || undefined,
      eventId: eventId === 'none' ? undefined : eventId,
      items: validItems.map((it) => ({
        concept: it.description.trim(),
        quantity: it.quantity,
        unitPrice: it.unitPrice,
      })),
    }

    updateMutation.mutate(dto)
  }

  /* ── Estado de carga ── */
  if (isLoadingNote) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3 text-violet-400">
        <Loader2 className="h-8 w-8 animate-spin" />
        <p className="text-sm font-medium">Cargando nota...</p>
      </div>
    )
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <PageHeader
        title="Editar nota de venta"
        description="Modifica los datos de la nota de venta."
        action={
          <Button
            variant="outline"
            onClick={() => router.push('/tools/notas-venta')}
            className="w-full sm:w-auto h-11 border-violet-200 text-violet-700 hover:bg-violet-50 touch-manipulation gap-2 rounded-xl active:scale-[0.97] transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver
          </Button>
        }
      />

      <div className="flex flex-col gap-4 sm:gap-6">
        {/* Datos del cliente */}
        <Card className="border-violet-100 bg-white shadow-sm rounded-2xl overflow-hidden">
          <CardHeader className="pb-3 border-b border-violet-50 bg-violet-50/30">
            <CardTitle className="text-sm font-bold text-violet-950 flex items-center gap-2">
              <User className="h-4 w-4 text-violet-600" />
              Datos del cliente
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2 pt-4">
            <div className="flex flex-col gap-2 sm:col-span-2">
              <Label htmlFor="cname" className="text-sm font-medium text-violet-900 flex items-center gap-1.5">
                <User className="h-3.5 w-3.5 text-violet-400" />
                Nombre del cliente <span className="text-red-500">*</span>
              </Label>
              <Input
                id="cname"
                value={customerName}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setCustomerName(e.target.value)}
                placeholder="Nombre completo o empresa"
                className="h-12 rounded-xl border-violet-200 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 text-sm uppercase"
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="cphone" className="text-sm font-medium text-violet-900 flex items-center gap-1.5">
                <Phone className="h-3.5 w-3.5 text-violet-400" />
                Teléfono
              </Label>
              <Input
                id="cphone"
                inputMode="tel"
                value={customerPhone}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setCustomerPhone(e.target.value)}
                placeholder="656 123 4567"
                className="h-12 rounded-xl border-violet-200 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 text-sm"
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="caddr" className="text-sm font-medium text-violet-900 flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5 text-violet-400" />
                Dirección
              </Label>
              <Input
                id="caddr"
                value={customerAddress}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setCustomerAddress(e.target.value)}
                placeholder="Dirección de entrega"
                className="h-12 rounded-xl border-violet-200 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 text-sm uppercase"
              />
            </div>
          </CardContent>
        </Card>

        {/* Conceptos */}
        <Card className="border-violet-100 bg-white shadow-sm rounded-2xl overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 border-b border-violet-50 bg-violet-50/30 pb-3">
            <CardTitle className="text-sm font-bold text-violet-950 flex items-center gap-2">
              <FileText className="h-4 w-4 text-violet-600" />
              Conceptos / Productos
            </CardTitle>
            <motion.div whileTap={{ scale: 0.95 }}>
              <Button
                variant="outline"
                size="sm"
                onClick={addItem}
                className="border-violet-200 text-violet-700 hover:bg-violet-50 font-semibold rounded-xl h-10 touch-manipulation gap-1.5"
              >
                <Plus className="h-4 w-4 text-violet-600" />
                <span className="hidden sm:inline">Agregar concepto</span>
                <span className="sm:hidden">Agregar</span>
              </Button>
            </motion.div>
          </CardHeader>
          <CardContent className="flex flex-col gap-4 pt-4">
            <AnimatePresence>
              {items.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10, height: 0 }}
                  transition={{ duration: 0.2 }}
                  className="rounded-xl border border-violet-100 bg-violet-50/30 p-4 transition-all hover:border-violet-200"
                >
                  <div className="mb-3 flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-violet-700 bg-violet-100/80 px-2.5 py-1 rounded-md">
                      Concepto {index + 1}
                    </span>
                    <motion.div whileTap={{ scale: 0.9 }}>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-9 w-9 rounded-lg text-red-500 hover:bg-red-50 hover:text-red-700 touch-manipulation"
                        onClick={() => removeItem(item.id)}
                        disabled={items.length === 1}
                        aria-label="Eliminar concepto"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </motion.div>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-12">
                    <div className="flex flex-col gap-1.5 sm:col-span-6">
                      <Label className="text-xs font-semibold text-violet-900">Descripción / Producto</Label>
                      <Input
                        value={item.description}
                        onChange={(e: ChangeEvent<HTMLInputElement>) => updateItem(item.id, { description: e.target.value })}
                        placeholder="Ej. Renta de Mesa G + 8 sillas"
                        className="h-12 rounded-xl bg-white border-violet-200 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 text-sm uppercase"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5 sm:col-span-2">
                      <Label className="text-xs font-semibold text-violet-900">Cantidad</Label>
                      <Input
                        type="number"
                        inputMode="numeric"
                        min={1}
                        value={item.quantity === 0 ? '' : item.quantity}
                        onChange={(e: ChangeEvent<HTMLInputElement>) =>
                          updateItem(item.id, { quantity: Number(e.target.value) || 0 })
                        }
                        className="h-12 rounded-xl bg-white border-violet-200 text-center font-semibold focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 text-sm"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5 sm:col-span-2">
                      <Label className="text-xs font-semibold text-violet-900">P. Unitario ($)</Label>
                      <Input
                        type="number"
                        inputMode="numeric"
                        min={0}
                        value={item.unitPrice === 0 ? '' : item.unitPrice}
                        onChange={(e: ChangeEvent<HTMLInputElement>) =>
                          updateItem(item.id, { unitPrice: Number(e.target.value) || 0 })
                        }
                        className="h-12 rounded-xl bg-white border-violet-200 text-center font-semibold focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 text-sm"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5 sm:col-span-2">
                      <Label className="text-xs font-semibold text-violet-900">Importe</Label>
                      <div className="flex h-12 items-center justify-end rounded-xl bg-violet-100/60 px-3 text-sm font-bold text-violet-950 border border-violet-200/50">
                        {formatCurrency(itemAmount(item))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </CardContent>
        </Card>

        {/* Opciones y Resumen */}
        <div className="grid gap-4 sm:gap-6 lg:grid-cols-2">
          <Card className="border-violet-100 bg-white shadow-sm rounded-2xl overflow-hidden">
            <CardHeader className="pb-3 border-b border-violet-50 bg-violet-50/30">
              <CardTitle className="text-sm font-bold text-violet-950 flex items-center gap-2">
                <Calculator className="h-4 w-4 text-violet-600" />
                Opciones del documento
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4 pt-4">
              <div className="flex flex-col gap-2">
                <Label className="text-sm font-medium text-violet-900">Tipo de documento</Label>
                <Select value={status} onValueChange={(v) => setStatus(v as 'quote' | 'issued')}>
                  <SelectTrigger className="h-12 rounded-xl border-violet-200 bg-white focus:ring-2 focus:ring-violet-500/20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="quote">Cotización</SelectItem>
                    <SelectItem value="issued">Nota de venta</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-col gap-2">
                <Label className="text-sm font-medium text-violet-900">Vincular a evento (opcional)</Label>
                <Select value={eventId} onValueChange={setEventId}>
                  <SelectTrigger className="h-12 rounded-xl border-violet-200 bg-white focus:ring-2 focus:ring-violet-500/20">
                    <SelectValue placeholder="Sin evento vinculado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Sin evento</SelectItem>
                    {availableEvents.map((ev: any) => (
                      <SelectItem key={ev.id} value={String(ev.id)}>
                        {ev.name || ev.serviceDescription || `Evento #${String(ev.id).slice(0, 6)}`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <label className="flex items-center gap-3 rounded-xl border border-violet-100 bg-violet-50/40 p-4 cursor-pointer hover:bg-violet-50 transition-colors active:bg-violet-100 touch-manipulation">
                <input
                  type="checkbox"
                  checked={applyIva}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setApplyIva(e.target.checked)}
                  className="h-5 w-5 rounded border-violet-300 accent-violet-600 cursor-pointer"
                />
                <span className="text-sm font-semibold text-violet-950">Aplicar IVA (16%)</span>
              </label>

              <div className="flex flex-col gap-2">
                <Label htmlFor="obs" className="text-sm font-medium text-violet-900 flex items-center gap-1.5">
                  <FileText className="h-3.5 w-3.5 text-violet-400" />
                  Notas / observaciones
                </Label>
                <textarea
                  id="obs"
                  value={notes}
                  onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setNotes(e.target.value)}
                  placeholder="Condiciones de pago, fecha de validez o comentarios..."
                  className="w-full min-h-[100px] rounded-xl border border-violet-200 p-4 text-sm focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500/20 resize-none"
                />
              </div>
            </CardContent>
          </Card>

          <Card className="border-violet-100 bg-white shadow-sm rounded-2xl overflow-hidden flex flex-col justify-between">
            <div>
              <CardHeader className="pb-3 border-b border-violet-50 bg-violet-50/30">
                <CardTitle className="text-sm font-bold text-violet-950 flex items-center gap-2">
                  <Calculator className="h-4 w-4 text-violet-600" />
                  Resumen de totales
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-3.5 pt-4">
                <div className="flex justify-between text-sm">
                  <span className="text-violet-700/80 font-medium">Subtotal</span>
                  <span className="font-bold text-violet-950">{formatCurrency(totals.subtotal)}</span>
                </div>
                {applyIva && (
                  <div className="flex justify-between text-sm">
                    <span className="text-violet-700/80 font-medium">IVA (16%)</span>
                    <span className="font-bold text-violet-950">{formatCurrency(totals.iva)}</span>
                  </div>
                )}
                <div className="flex justify-between border-t border-violet-100 pt-3">
                  <span className="text-lg font-extrabold text-violet-700">Total</span>
                  <span className="text-lg font-extrabold text-violet-700">{formatCurrency(totals.total)}</span>
                </div>
              </CardContent>
            </div>
            <CardContent className="pt-4 pb-6">
              <motion.div whileTap={{ scale: 0.98 }}>
                <Button
                  size="lg"
                  disabled={updateMutation.isPending}
                  className="w-full h-14 bg-violet-600 hover:bg-violet-700 text-white font-bold text-base shadow-lg shadow-violet-600/20 transition-all gap-2 rounded-xl touch-manipulation"
                  onClick={handleSave}
                >
                  {updateMutation.isPending ? (
                    <Loader />
                  ) : (
                    <Save className="h-5 w-5" />
                  )}
                  Guardar cambios
                </Button>
              </motion.div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* ── Sheet mobile: nota guardada ── */}
      {isMobile && (
        <Sheet open={savedNote !== null} onOpenChange={(o) => !o && setSavedNote(null)}>
          <SheetContent
            side="bottom"
            className="h-[92vh] max-h-[92dvh] rounded-t-3xl border-t border-violet-100 bg-white p-0 flex flex-col overflow-hidden"
          >
            <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-sm px-4 pt-3 pb-2 border-b border-violet-100/50 flex-shrink-0">
              <div className="w-10 h-1 rounded-full bg-violet-200 mx-auto mb-3" />
              <SheetHeader className="text-left">
                <SheetTitle className="text-lg font-bold text-violet-950">Nota {savedNote?.folio}</SheetTitle>
              </SheetHeader>
            </div>
            <div className="px-4 py-4 overflow-y-auto flex-1 pb-4">
              {savedNote && (
                <DocumentActions
                  filename={`nota-${savedNote.folio}`}
                  exportNode={<PrintSaleNoteDocument note={savedNote} business={businessConfig} />}
                  extraActions={
                    <motion.div whileTap={{ scale: 0.94 }} className="flex-1 sm:flex-none">
                      <Button
                        variant="outline"
                        onClick={() => {
                          setSavedNote(null)
                          router.push('/tools/notas-venta')
                        }}
                        className="w-full sm:w-auto h-11 rounded-xl border-violet-200 text-violet-700 hover:bg-violet-50 touch-manipulation gap-2 text-xs sm:text-sm font-semibold px-4"
                      >
                        <ArrowLeft className="h-4 w-4 text-violet-500" />
                        Volver al listado
                      </Button>
                    </motion.div>
                  }
                >
                  <NoteCardPreview note={savedNote} business={businessConfig} />
                </DocumentActions>
              )}
            </div>
          </SheetContent>
        </Sheet>
      )}

      {/* ── Dialog desktop: nota guardada ── */}
      {!isMobile && (
        <Dialog open={savedNote !== null} onOpenChange={(o) => !o && setSavedNote(null)}>
          <DialogContent className="max-h-[90dvh] max-w-4xl overflow-y-auto rounded-2xl border-violet-100 bg-white p-4 sm:p-6">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold text-violet-950">Nota {savedNote?.folio}</DialogTitle>
            </DialogHeader>
            {savedNote && (
              <DocumentActions
                filename={`nota-${savedNote.folio}`}
                exportNode={<PrintSaleNoteDocument note={savedNote} business={businessConfig} />}
                extraActions={
                  <motion.div whileTap={{ scale: 0.94 }}>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setSavedNote(null)
                        router.push('/tools/notas-venta')
                      }}
                      className="h-11 rounded-xl border-violet-200 text-violet-700 hover:bg-violet-50 touch-manipulation gap-2 text-xs sm:text-sm font-semibold px-4"
                    >
                      <ArrowLeft className="h-4 w-4 text-violet-500" />
                      Volver al listado
                    </Button>
                  </motion.div>
                }
              >
                <SaleNoteDocument note={savedNote} business={businessConfig} />
              </DocumentActions>
            )}
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
