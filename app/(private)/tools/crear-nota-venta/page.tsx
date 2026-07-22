'use client'

import { useMemo, useState, ChangeEvent } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Save, Trash2, ArrowLeft } from 'lucide-react'
import { toast } from 'sonner'
import { useQuery } from '@tanstack/react-query'
import { useData } from '@/lib/data-store'
import { financeApi } from '@/lib/api/finance'
import { computeNoteTotals, itemAmount } from '@/lib/calculations'
import { formatCurrency, genId } from '@/lib/format'
import { seedBusinessConfig } from '@/lib/mock-data'
import type { Note, NoteItem } from '@/lib/types'
import { PageHeader } from '@/components/admin/page-header'
import { SaleNoteDocument } from '@/components/documents/sale-note-document'
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

const IVA_RATE = 0.16

function emptyItem(): NoteItem {
  return { id: genId('it'), description: '', quantity: 1, unitPrice: 0 }
}

export default function CreateNotePage() {
  const router = useRouter()
  const { createNote, events: localEvents } = useData()

  // Form states
  const [customerName, setCustomerName] = useState('')
  const [customerPhone, setCustomerPhone] = useState('')
  const [customerAddress, setCustomerAddress] = useState('')
  const [items, setItems] = useState<NoteItem[]>([emptyItem()])
  const [applyIva, setApplyIva] = useState(false)
  const [notes, setNotes] = useState('')
  const [status, setStatus] = useState<'quote' | 'issued'>('quote')
  const [eventId, setEventId] = useState<string>('none')

  const [savedNote, setSavedNote] = useState<Note | null>(null)

  // API events fetch
  const { data: apiEvents = [] } = useQuery({
    queryKey: ['businessEvents'],
    queryFn: () => financeApi.getBusinessEvents(),
  })

  // Combine events for dropdown
  const safeApiEvents = Array.isArray(apiEvents) ? apiEvents : []
  const availableEvents = safeApiEvents.length > 0 ? safeApiEvents : localEvents

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

    const note = createNote({
      customer: {
        name: customerName.trim(),
        phone: customerPhone.trim() || undefined,
        address: customerAddress.trim() || undefined,
      },
      items: validItems,
      applyIva,
      ivaRate: IVA_RATE,
      notes: notes.trim() || undefined,
      status,
      eventId: eventId === 'none' ? null : eventId,
    })

    // Persistir en localStorage
    try {
      const existing: Note[] = JSON.parse(localStorage.getItem('eventos_mendoza_notes') || '[]')
      const updated = [note, ...existing.filter((n) => n.id !== note.id)]
      localStorage.setItem('eventos_mendoza_notes', JSON.stringify(updated))
    } catch (e) {
      console.warn('No se pudo guardar en localStorage:', e)
    }

    setSavedNote(note)
    toast.success(`Nota ${note.folio} generada correctamente`)
  }

  if (savedNote) {
    return (
      <div className="space-y-6">
        <PageHeader
          title={`Nota ${savedNote.folio}`}
          description="Previsualiza y exporta la nota de venta o cotización a PDF / Imagen para enviarla a tu cliente."
          action={
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" className="border-violet-200 text-violet-700 hover:bg-violet-50" onClick={() => setSavedNote(null)}>
                <ArrowLeft className="mr-1.5 h-4 w-4" />
                Editar datos
              </Button>
              <Button className="bg-violet-600 hover:bg-violet-700 text-white" onClick={() => router.push('/tools/notas-venta')}>
                Ver historial
              </Button>
            </div>
          }
        />
        <Card className="border-violet-100 bg-white shadow-sm p-4 sm:p-6">
          <DocumentActions filename={`nota-${savedNote.folio}`}>
            <SaleNoteDocument note={savedNote} business={seedBusinessConfig} />
          </DocumentActions>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Crear nota de venta"
        description="Genera notas de venta o cotizaciones profesionales optimizadas para exportar a PDF o Imagen."
      />

      <div className="flex flex-col gap-6">
        {/* Datos del cliente */}
        <Card className="border-violet-100 bg-white shadow-sm">
          <CardHeader className="pb-3 border-b border-violet-50">
            <CardTitle className="text-base font-bold text-violet-950">Datos del cliente</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2 pt-4">
            <div className="flex flex-col gap-2 sm:col-span-2">
              <Label htmlFor="cname" className="text-xs font-semibold text-violet-900">
                Nombre del cliente *
              </Label>
              <Input
                id="cname"
                value={customerName}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setCustomerName(e.target.value)}
                placeholder="Nombre completo o empresa"
                className="h-11 border-violet-100 focus:border-violet-500 focus:ring-violet-500"
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="cphone" className="text-xs font-semibold text-violet-900">
                Teléfono
              </Label>
              <Input
                id="cphone"
                inputMode="tel"
                value={customerPhone}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setCustomerPhone(e.target.value)}
                placeholder="656 123 4567"
                className="h-11 border-violet-100 focus:border-violet-500 focus:ring-violet-500"
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="caddr" className="text-xs font-semibold text-violet-900">
                Dirección / Ubicación
              </Label>
              <Input
                id="caddr"
                value={customerAddress}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setCustomerAddress(e.target.value)}
                placeholder="Dirección de entrega u opcional"
                className="h-11 border-violet-100 focus:border-violet-500 focus:ring-violet-500"
              />
            </div>
          </CardContent>
        </Card>

        {/* Conceptos / Artículos */}
        <Card className="border-violet-100 bg-white shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 border-b border-violet-50 pb-3">
            <CardTitle className="text-base font-bold text-violet-950">Conceptos / Productos</CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={addItem}
              className="border-violet-200 text-violet-700 hover:bg-violet-50 font-semibold"
            >
              <Plus className="mr-1.5 h-4 w-4 text-violet-600" />
              Agregar concepto
            </Button>
          </CardHeader>
          <CardContent className="flex flex-col gap-4 pt-4">
            {items.map((item, index) => (
              <div
                key={item.id}
                className="rounded-xl border border-violet-100 bg-violet-50/40 p-4 transition-all hover:border-violet-200"
              >
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-violet-700 bg-violet-100/80 px-2.5 py-1 rounded-md">
                    Concepto {index + 1}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-red-500 hover:bg-red-50 hover:text-red-700"
                    onClick={() => removeItem(item.id)}
                    disabled={items.length === 1}
                    aria-label="Eliminar concepto"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                <div className="grid gap-3 sm:grid-cols-12">
                  <div className="flex flex-col gap-1.5 sm:col-span-6">
                    <Label className="text-xs font-semibold text-violet-900">Descripción / Producto</Label>
                    <Input
                      value={item.description}
                      onChange={(e: ChangeEvent<HTMLInputElement>) => updateItem(item.id, { description: e.target.value })}
                      placeholder="Ej. Renta de Silla Tiffany Blanca"
                      className="h-11 bg-white border-violet-100 focus:border-violet-500"
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
                      className="h-11 bg-white border-violet-100 text-center font-semibold"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5 sm:col-span-2">
                    <Label className="text-xs font-semibold text-violet-900">P. Unitario ($)</Label>
                    <Input
                      type="number"
                      inputMode="decimal"
                      min={0}
                      step="0.01"
                      value={item.unitPrice === 0 ? '' : item.unitPrice}
                      onChange={(e: ChangeEvent<HTMLInputElement>) =>
                        updateItem(item.id, { unitPrice: Number(e.target.value) || 0 })
                      }
                      className="h-11 bg-white border-violet-100 text-right font-semibold"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5 sm:col-span-2">
                    <Label className="text-xs font-semibold text-violet-900">Importe</Label>
                    <div className="flex h-11 items-center justify-end rounded-md bg-violet-100/60 px-3 text-sm font-bold text-violet-950 border border-violet-200/50">
                      {formatCurrency(itemAmount(item))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Opciones y Resumen */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Opciones */}
          <Card className="border-violet-100 bg-white shadow-sm">
            <CardHeader className="pb-3 border-b border-violet-50">
              <CardTitle className="text-base font-bold text-violet-950">Opciones del documento</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4 pt-4">
              <div className="flex flex-col gap-2">
                <Label className="text-xs font-semibold text-violet-900">Tipo de documento</Label>
                <Select value={status} onValueChange={(v) => setStatus(v as 'quote' | 'issued')}>
                  <SelectTrigger className="h-11 border-violet-100 bg-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="quote">Cotización</SelectItem>
                    <SelectItem value="issued">Nota de venta</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-col gap-2">
                <Label className="text-xs font-semibold text-violet-900">Vincular a evento (opcional)</Label>
                <Select value={eventId} onValueChange={setEventId}>
                  <SelectTrigger className="h-11 border-violet-100 bg-white">
                    <SelectValue placeholder="Sin evento vinculado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Sin evento</SelectItem>
                    {availableEvents.map((ev: any) => (
                      <SelectItem key={ev.id} value={ev.id}>
                        {ev.name || ev.serviceDescription || `Evento #${ev.id.slice(0, 6)}`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <label className="flex items-center gap-3 rounded-xl border border-violet-100 bg-violet-50/40 p-3.5 cursor-pointer hover:bg-violet-50 transition-colors">
                <input
                  type="checkbox"
                  checked={applyIva}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setApplyIva(e.target.checked)}
                  className="h-4 w-4 rounded border-violet-300 accent-violet-600 cursor-pointer"
                />
                <span className="text-sm font-semibold text-violet-950">Aplicar IVA (16%)</span>
              </label>

              <div className="flex flex-col gap-2">
                <Label htmlFor="obs" className="text-xs font-semibold text-violet-900">
                  Notas / observaciones
                </Label>
                <textarea
                  id="obs"
                  value={notes}
                  onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setNotes(e.target.value)}
                  placeholder="Condiciones de pago, fecha de validez o comentarios adicionales..."
                  className="w-full min-h-[90px] rounded-lg border border-violet-100 p-3 text-sm focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
                />
              </div>
            </CardContent>
          </Card>

          {/* Resumen & Acción */}
          <Card className="border-violet-100 bg-white shadow-sm flex flex-col justify-between">
            <div>
              <CardHeader className="pb-3 border-b border-violet-50">
                <CardTitle className="text-base font-bold text-violet-950">Resumen de totales</CardTitle>
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
                <div className="flex justify-between border-t border-violet-100 pt-3 text-xl font-extrabold text-violet-700">
                  <span>Total</span>
                  <span>{formatCurrency(totals.total)}</span>
                </div>
              </CardContent>
            </div>
            <CardContent className="pt-4 pb-6">
              <Button
                size="lg"
                className="w-full h-12 bg-violet-600 hover:bg-violet-700 text-white font-bold text-base shadow-md shadow-violet-200 transition-all gap-2"
                onClick={handleSave}
              >
                <Save className="h-5 w-5" />
                Guardar y generar documento
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
