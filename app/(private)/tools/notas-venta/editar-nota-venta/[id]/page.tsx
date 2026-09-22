// app/tools/notas-venta/editar-nota-venta/[id]/page.tsx
'use client'

import { use, useMemo, useState, ChangeEvent, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Save, Trash2, ArrowLeft, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { financeApi } from '@/lib/api/finance'
import { computeNoteTotals, itemAmount } from '@/lib/calculations'
import { formatCurrency, genId } from '@/lib/format'
import { defaultBusinessConfig } from '@/lib/config'
import type { Note, NoteItem } from '@/lib/types'
import type { CreateSalesNoteDto, SalesNoteStatus, BusinessConfig } from '@/types/finance'
import { PageHeader } from '@/components/admin/page-header'
import { PrintSaleNoteDocument } from '@/components/documents/sale-note-document'
import { NoteCardPreview } from '@/components/documents/note-card-preview'
import { DocumentActions } from '@/components/documents/document-actions'
import { AppBottomSheet } from '@/components/ui/app-bottom-sheet'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

const IVA_RATE = 0.16

function emptyItem(): NoteItem {
  return { id: genId('it'), description: '', quantity: 1, unitPrice: 0 }
}

export default function EditarNotaVentaPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const router = useRouter()
  const queryClient = useQueryClient()

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

  const { data: existingNote, isLoading: isLoadingNote, isError: isErrorNote } = useQuery({
    queryKey: ['salesNote', resolvedParams.id],
    queryFn: () => financeApi.getSalesNoteById(resolvedParams.id),
    enabled: !!resolvedParams.id,
  })

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

    const mappedItems = (Array.isArray(existingNote.items) ? existingNote.items : []).map(
      (it: { id?: string; concept?: string; description?: string; quantity: number | string; unitPrice: number | string }) => ({
        id: it.id || genId('it'),
        description: it.concept || it.description || '',
        quantity: Number(it.quantity) || 1,
        unitPrice: Number(it.unitPrice) || 0,
      })
    )
    setItems(mappedItems.length > 0 ? mappedItems : [emptyItem()])
    setIsLoaded(true)
  }, [existingNote, isLoaded])

  const updateMutation = useMutation({
    mutationFn: (dto: CreateSalesNoteDto) => financeApi.updateSalesNote(resolvedParams.id, dto),
    onSuccess: (apiNote) => {
      queryClient.invalidateQueries({ queryKey: ['salesNotes'] })
      queryClient.invalidateQueries({ queryKey: ['salesNote', resolvedParams.id] })
      toast.success('Nota actualizada')

      const mappedNote: Note = {
        id: apiNote.id,
        folio: apiNote.folio || `NV-${apiNote.id.slice(0, 4)}`,
        customer: {
          name: apiNote.customerName || apiNote.customer?.name || customerName.trim(),
          phone: apiNote.customerPhone || apiNote.customer?.phone || customerPhone.trim() || undefined,
          address: apiNote.customerAddress || apiNote.customer?.address || customerAddress.trim() || undefined,
        },
        items: (apiNote.items || []).map((it: { id?: string; concept?: string; description?: string; quantity: number; unitPrice: number | string }, idx: number) => ({
          id: it.id || `it_${idx}`,
          description: it.concept || it.description || '',
          quantity: it.quantity,
          unitPrice: Number(it.unitPrice),
        })),
        applyIva: Boolean(apiNote.applyIva),
        ivaRate: Number(apiNote.ivaRate || IVA_RATE),
        notes: apiNote.notes || notes.trim() || undefined,
        status: (apiNote.status as 'issued' | 'note' | 'quote') === 'issued' || (apiNote.status as 'issued' | 'note' | 'quote') === 'note' ? 'issued' : 'quote',
        eventId: apiNote.eventId || (eventId === 'none' ? null : eventId),
        createdAt: apiNote.createdAt || new Date().toISOString(),
      }
      setSavedNote(mappedNote)
    },
    onError: () => {
      toast.error('No se pudo actualizar la nota. Revisa tu conexión.')
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
      toast.error('Falta el nombre del cliente')
      return
    }
    const validItems = items.filter((it) => it.description.trim() !== '')
    if (validItems.length === 0) {
      toast.error('Agrega al menos un concepto')
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

  if (isLoadingNote) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3">
        <Loader2 className="size-6 animate-spin text-muted-foreground" aria-hidden />
        <p className="text-sm text-muted-foreground">Cargando nota...</p>
      </div>
    )
  }

  if (isErrorNote) {
    return (
      <Card className="flex flex-col items-center gap-4 p-8 text-center">
        <p className="text-[15px] font-medium text-destructive">
          No se pudo cargar la nota solicitada.
        </p>
        <Button onClick={() => router.push('/tools/notas-venta')}>Volver a tus notas</Button>
      </Card>
    )
  }

  return (
    <div className="space-y-8 pb-28 sm:pb-8">
      <PageHeader
        title="Editar nota"
        action={
          <Button
            variant="ghost"
            onClick={() => router.push('/tools/notas-venta')}
            className="h-11 px-4 sm:h-10"
          >
            <ArrowLeft className="mr-2 size-4" aria-hidden />
            Cancelar
          </Button>
        }
      />

      {/* Datos del cliente */}
      <section aria-labelledby="client-title" className="space-y-3">
        <h2 id="client-title" className="text-base font-semibold">Datos del cliente</h2>
        <Card className="gap-0 py-0">
          <div className="space-y-4 p-4 sm:p-5">
            <div className="space-y-2">
              <Label htmlFor="cname">
                Nombre <span className="text-destructive">*</span>
              </Label>
              <Input
                id="cname"
                value={customerName}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setCustomerName(e.target.value)}
                placeholder="Nombre completo o negocio"
                className="h-11 text-base"
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="cphone">Teléfono</Label>
                <Input
                  id="cphone"
                  inputMode="tel"
                  value={customerPhone}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setCustomerPhone(e.target.value)}
                  placeholder="Ej. 656 123 4567"
                  className="h-11 text-base"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="caddr">Dirección</Label>
                <Input
                  id="caddr"
                  value={customerAddress}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setCustomerAddress(e.target.value)}
                  placeholder="Dirección de entrega"
                  className="h-11 text-base"
                />
              </div>
            </div>
          </div>
        </Card>
      </section>

      {/* Conceptos */}
      <section aria-labelledby="concepts-title" className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 id="concepts-title" className="text-base font-semibold">Conceptos</h2>
          <Button variant="outline" size="sm" onClick={addItem} className="-mr-2 text-primary">
            <Plus className="mr-2 size-4" aria-hidden />
            Nuevo concepto
          </Button>
        </div>
        <Card className="gap-0 py-0">
          <ul className="divide-y">
            {items.map((item, index) => (
              <li key={item.id} className="space-y-4 p-4 sm:p-5">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-muted-foreground">
                    Concepto {index + 1}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-11 text-muted-foreground hover:text-destructive"
                    onClick={() => removeItem(item.id)}
                    disabled={items.length === 1}
                    aria-label={`Eliminar concepto ${index + 1}`}
                  >
                    <Trash2 className="size-4" aria-hidden />
                  </Button>
                </div>

                <div className="grid gap-4 sm:grid-cols-12">
                  <div className="space-y-2 sm:col-span-6">
                    <Label>Descripción</Label>
                    <Input
                      value={item.description}
                      onChange={(e: ChangeEvent<HTMLInputElement>) => updateItem(item.id, { description: e.target.value })}
                      placeholder="Ej. Renta de mesa y sillas"
                      className="h-11 text-base"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4 sm:col-span-4">
                    <div className="space-y-2">
                      <Label>Cant.</Label>
                      <Input
                        type="number"
                        inputMode="numeric"
                        min={1}
                        value={item.quantity === 0 ? '' : item.quantity}
                        onChange={(e: ChangeEvent<HTMLInputElement>) =>
                          updateItem(item.id, { quantity: Number(e.target.value) || 0 })
                        }
                        className="h-11 text-base tabular-nums"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Precio ($)</Label>
                      <Input
                        type="number"
                        inputMode="numeric"
                        min={0}
                        value={item.unitPrice === 0 ? '' : item.unitPrice}
                        onChange={(e: ChangeEvent<HTMLInputElement>) =>
                          updateItem(item.id, { unitPrice: Number(e.target.value) || 0 })
                        }
                        className="h-11 text-base tabular-nums"
                      />
                    </div>
                  </div>

                  <div className="space-y-2 sm:col-span-2">
                    <Label>Importe</Label>
                    <div className="flex h-11 items-center justify-end rounded-md bg-muted px-3 text-base font-semibold tabular-nums">
                      {formatCurrency(itemAmount(item))}
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </Card>
      </section>

      {/* Ajustes y Totales */}
      <section aria-labelledby="settings-title" className="space-y-3">
        <h2 id="settings-title" className="text-base font-semibold">Detalles y cobro</h2>
        <Card className="gap-0 py-0">
          <div className="grid gap-6 p-4 sm:p-5 lg:grid-cols-2">

            {/* Opciones */}
            <div className="space-y-5">
              <div className="space-y-2">
                <Label>Tipo de documento</Label>
                <Select value={status} onValueChange={(v) => setStatus(v as 'quote' | 'issued')}>
                  <SelectTrigger className="h-11 text-base sm:text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="quote">Cotización</SelectItem>
                    <SelectItem value="issued">Nota de venta</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Vincular a evento (opcional)</Label>
                <Select value={eventId} onValueChange={setEventId}>
                  <SelectTrigger className="h-11 text-base sm:text-sm">
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

              <label className="flex items-center gap-3 rounded-xl border bg-muted/30 p-4 active:bg-muted/50">
                <input
                  type="checkbox"
                  checked={applyIva}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setApplyIva(e.target.checked)}
                  className="size-5 rounded border-primary text-primary focus:ring-primary"
                />
                <span className="text-[15px] font-medium">Incluir IVA (16%)</span>
              </label>

              <div className="space-y-2">
                <Label htmlFor="obs">Notas / observaciones</Label>
                <textarea
                  id="obs"
                  value={notes}
                  onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setNotes(e.target.value)}
                  placeholder="Condiciones de pago, validez..."
                  className="flex min-h-[100px] w-full resize-none rounded-md border border-input bg-background px-3 py-3 text-base ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                />
              </div>
            </div>

            {/* Resumen */}
            <div className="flex flex-col justify-end space-y-4 rounded-xl border bg-muted/20 p-5">
              <div className="flex justify-between text-[15px] text-muted-foreground">
                <span>Subtotal</span>
                <span className="font-medium tabular-nums">{formatCurrency(totals.subtotal)}</span>
              </div>
              {applyIva && (
                <div className="flex justify-between text-[15px] text-muted-foreground">
                  <span>IVA (16%)</span>
                  <span className="font-medium tabular-nums">{formatCurrency(totals.iva)}</span>
                </div>
              )}
              <div className="flex justify-between border-t pt-4">
                <span className="text-lg font-semibold">Total</span>
                <span className="text-xl font-semibold text-primary tabular-nums">
                  {formatCurrency(totals.total)}
                </span>
              </div>
            </div>
          </div>

          <div className="border-t p-4 sm:p-5">
            <Button
              size="lg"
              disabled={updateMutation.isPending}
              className="h-14 w-full text-base font-semibold"
              onClick={handleSave}
            >
              {updateMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 size-5 animate-spin" aria-hidden />
                  Guardando cambios...
                </>
              ) : (
                <>
                  <Save className="mr-2 size-5" aria-hidden />
                  Guardar cambios
                </>
              )}
            </Button>
          </div>
        </Card>
      </section>

      {/* Visor Post-Guardado */}
      <AppBottomSheet
        open={savedNote !== null}
        onOpenChange={(o) => !o && setSavedNote(null)}
        title={savedNote ? `Nota ${savedNote.folio}` : ''}
        mobileHeight="h-[92vh] max-h-[92dvh]"
      >
        {savedNote && (
          <DocumentActions
            filename={`nota-${savedNote.folio}`}
            exportNode={<PrintSaleNoteDocument note={savedNote} business={businessConfig} />}
            extraActions={
              <Button
                variant="outline"
                onClick={() => {
                  setSavedNote(null)
                  router.push('/tools/notas-venta')
                }}
                className="h-11 w-full px-4 sm:w-auto"
              >
                <ArrowLeft className="mr-2 size-4" aria-hidden />
                Volver a tus notas
              </Button>
            }
          >
            <NoteCardPreview note={savedNote} business={businessConfig} />
          </DocumentActions>
        )}
      </AppBottomSheet>
    </div>
  )
}