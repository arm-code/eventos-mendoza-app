// app/tools/notas-venta/crear-nota-venta/page.tsx
'use client'

import { useMemo, useState, ChangeEvent } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Save, Trash2, ArrowLeft, ArrowRight, Pencil, Loader2 } from 'lucide-react'
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
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { AppBottomSheet } from '@/components/ui/app-bottom-sheet'
import { cn } from '@/lib/utils'

const IVA_RATE = 0.16

function emptyItem(): NoteItem {
  return { id: genId('it'), description: '', quantity: 1, unitPrice: 0 }
}

export default function CreateNotePage() {
  const router = useRouter()
  const queryClient = useQueryClient()

  const [step, setStep] = useState<1 | 2 | 3>(1)

  const [customerName, setCustomerName] = useState('')
  const [customerPhone, setCustomerPhone] = useState('')
  const [customerAddress, setCustomerAddress] = useState('')

  const [items, setItems] = useState<NoteItem[]>([emptyItem()])
  const [expandedItemId, setExpandedItemId] = useState<string>(items[0].id)

  const [applyIva, setApplyIva] = useState(false)
  const [notes, setNotes] = useState('')
  const [status, setStatus] = useState<'quote' | 'issued'>('quote')

  const [savedNote, setSavedNote] = useState<Note | null>(null)

  const { data: apiConfig } = useQuery({
    queryKey: ['businessConfig'],
    queryFn: () => financeApi.getConfig(),
  })
  const businessConfig: BusinessConfig = apiConfig || defaultBusinessConfig

  const createMutation = useMutation({
    mutationFn: (dto: CreateSalesNoteDto) => financeApi.createSalesNote(dto),
    onSuccess: (apiNote) => {
      queryClient.invalidateQueries({ queryKey: ['salesNotes'] })
      toast.success('Nota guardada')

      const mappedNote: Note = {
        id: apiNote.id,
        folio: apiNote.folio || `NV-${apiNote.id.slice(0, 4)}`,
        customer: {
          name: apiNote.customerName || apiNote.customer?.name || customerName.trim(),
          phone: apiNote.customerPhone || apiNote.customer?.phone || customerPhone.trim() || undefined,
          address: apiNote.customerAddress || apiNote.customer?.address || customerAddress.trim() || undefined,
        },
        items: (apiNote.items || []).map((it, idx) => ({
          id: it.id || `it_${idx}`,
          description: it.concept || (it as { description?: string }).description || '',
          quantity: it.quantity,
          unitPrice: Number(it.unitPrice),
        })),
        applyIva: Boolean(apiNote.applyIva),
        ivaRate: Number(apiNote.ivaRate || IVA_RATE),
        notes: apiNote.notes || notes.trim() || undefined,
        status: (apiNote.status as 'issued' | 'quote') === 'issued' ? 'issued' : 'quote',
        eventId: null,
        createdAt: apiNote.createdAt || new Date().toISOString(),
      }
      setSavedNote(mappedNote)
    },
    onError: () => {
      toast.error('No se pudo guardar la nota. Revisa tu conexión.')
    },
  })

  const totals = useMemo(() => computeNoteTotals(items, applyIva, IVA_RATE), [items, applyIva])

  function handleNextStep1() {
    if (!customerName.trim()) {
      toast.error('Falta el nombre del cliente')
      return
    }
    setStep(2)
  }

  function handleNextStep2() {
    const validItems = items.filter((it) => it.description.trim() !== '')
    if (validItems.length === 0) {
      toast.error('Agrega al menos un concepto con descripción')
      return
    }
    setStep(3)
  }

  function updateItem(id: string, patch: Partial<NoteItem>) {
    setItems((prev) => prev.map((it) => (it.id === id ? { ...it, ...patch } : it)))
  }

  function addItem() {
    const newItem = emptyItem()
    setItems((prev) => [...prev, newItem])
    setExpandedItemId(newItem.id)
  }

  function removeItem(id: string) {
    setItems((prev) => {
      const filtered = prev.filter((it) => it.id !== id)
      if (filtered.length > 0 && expandedItemId === id) {
        setExpandedItemId(filtered[filtered.length - 1].id)
      }
      return filtered.length > 0 ? filtered : [emptyItem()]
    })
  }

  function handleSave() {
    const validItems = items.filter((it) => it.description.trim() !== '')
    const dto: CreateSalesNoteDto = {
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim() || undefined,
      customerAddress: customerAddress.trim() || undefined,
      status: status === 'issued' ? ('note' as SalesNoteStatus) : ('quote' as SalesNoteStatus),
      applyIva,
      ivaRate: IVA_RATE,
      notes: notes.trim() || undefined,
      eventId: undefined,
      items: validItems.map((it) => ({
        concept: it.description.trim(),
        quantity: it.quantity,
        unitPrice: it.unitPrice,
      })),
    }

    createMutation.mutate(dto)
  }

  // Footer unificado para navegación de pasos
  const renderWizardFooter = (primaryAction: () => void, primaryLabel: string, showBack = true) => (
    <div className="flex flex-col-reverse gap-3 border-t bg-muted/20 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
      <Button
        variant="ghost"
        onClick={() => router.push('/tools/notas-venta')}
        className="text-muted-foreground hover:text-destructive h-11"
      >
        Cancelar y salir
      </Button>
      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center">
        {showBack && (
          <Button variant="outline" onClick={() => setStep((s) => (s - 1) as 1 | 2)} className="h-11 w-full sm:w-auto px-4">
            <ArrowLeft className="mr-2 size-4" aria-hidden />
            Atrás
          </Button>
        )}
        <Button
          onClick={primaryAction}
          disabled={createMutation.isPending}
          className="h-11 w-full sm:w-auto px-8"
        >
          {createMutation.isPending ? (
            <Loader2 className="mr-2 size-4 animate-spin" aria-hidden />
          ) : step === 3 ? (
            <Save className="mr-2 size-4" aria-hidden />
          ) : null}
          {primaryLabel}
          {step !== 3 && <ArrowRight className="ml-2 size-4" aria-hidden />}
        </Button>
      </div>
    </div>
  )

  return (
    <div className="space-y-6 pb-28 sm:pb-8">
      <PageHeader title="Nueva nota" />

      <div aria-hidden="true" className="flex items-center gap-2 px-1">
        <div className={cn("h-1.5 flex-1 rounded-full transition-colors", step >= 1 ? "bg-primary" : "bg-muted")} />
        <div className={cn("h-1.5 flex-1 rounded-full transition-colors", step >= 2 ? "bg-primary" : "bg-muted")} />
        <div className={cn("h-1.5 flex-1 rounded-full transition-colors", step >= 3 ? "bg-primary" : "bg-muted")} />
      </div>

      {/* ─── PASO 1 ──────────────────────────────────────────────── */}
      {step === 1 && (
        <section aria-labelledby="step-1-title" className="animate-in fade-in slide-in-from-right-4 duration-300">
          <div className="mb-4">
            <h2 id="step-1-title" className="text-lg font-semibold">Datos del cliente</h2>
            <p className="text-sm text-muted-foreground">Paso 1 de 3: ¿A quién le estás vendiendo o cotizando?</p>
          </div>
          <Card className="gap-0 py-0">
            <div className="space-y-5 p-4 sm:p-5">
              <div className="space-y-2">
                <Label htmlFor="cname">
                  Nombre <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="cname"
                  value={customerName}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setCustomerName(e.target.value)}
                  placeholder="Nombre completo / negocio"
                  className="h-11 text-base capitalize"
                  autoFocus
                />
              </div>
              <div className="grid gap-5 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="cphone">Teléfono (opcional)</Label>
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
                  <Label htmlFor="caddr">Dirección (opcional)</Label>
                  <Input
                    id="caddr"
                    value={customerAddress}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => setCustomerAddress(e.target.value)}
                    placeholder="Lugar de entrega"
                    className="h-11 text-base capitalize"
                  />
                </div>
              </div>
            </div>
            {renderWizardFooter(handleNextStep1, 'Siguiente', false)}
          </Card>
        </section>
      )}

      {/* ─── PASO 2 ────────────────────────────────────────────── */}
      {step === 2 && (
        <section aria-labelledby="step-2-title" className="animate-in fade-in slide-in-from-right-4 duration-300">
          <div className="mb-4 flex items-end justify-between">
            <div>
              <h2 id="step-2-title" className="text-lg font-semibold">Conceptos</h2>
              <p className="text-sm text-muted-foreground">Paso 2 de 3: ¿Qué artículos o servicios incluyes?</p>
            </div>
          </div>

          <Card className="gap-0 py-0">
            <Accordion
              type="single"
              collapsible
              value={expandedItemId}
              onValueChange={setExpandedItemId}
              className="w-full"
            >
              {items.map((item, index) => (
                <AccordionItem key={item.id} value={item.id} className="border-b-0">
                  <AccordionTrigger className="border-b px-4 py-4 hover:bg-muted/30 hover:no-underline sm:px-5">
                    <div className="flex w-full min-w-0 flex-1 items-center justify-between pr-4">
                      <div className="flex min-w-0 flex-col items-start gap-1">
                        <span className="truncate text-[15px] font-semibold text-foreground">
                          {item.description.trim() ? item.description : `Concepto ${index + 1}`}
                        </span>
                        <span className="text-xs font-normal text-muted-foreground">
                          {item.quantity} x {formatCurrency(item.unitPrice)}
                        </span>
                      </div>
                      <span className="shrink-0 font-medium tabular-nums text-primary">
                        {formatCurrency(itemAmount(item))}
                      </span>
                    </div>
                  </AccordionTrigger>

                  <AccordionContent className="border-b bg-muted/10 px-4 pb-5 pt-4 sm:px-5">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>Descripción</Label>
                        <Input
                          value={item.description}
                          onChange={(e: ChangeEvent<HTMLInputElement>) => updateItem(item.id, { description: e.target.value })}
                          placeholder="Ej. Renta de mesa y sillas"
                          className="h-11 text-base bg-background capitalize"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Cantidad</Label>
                          <Input
                            type="number"
                            inputMode="numeric"
                            min={1}
                            value={item.quantity === 0 ? '' : item.quantity}
                            onChange={(e: ChangeEvent<HTMLInputElement>) =>
                              updateItem(item.id, { quantity: Number(e.target.value) || 0 })
                            }
                            className="h-11 text-base tabular-nums bg-background"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Precio unitario ($)</Label>
                          <Input
                            type="number"
                            inputMode="numeric"
                            min={0}
                            value={item.unitPrice === 0 ? '' : item.unitPrice}
                            onChange={(e: ChangeEvent<HTMLInputElement>) =>
                              updateItem(item.id, { unitPrice: Number(e.target.value) || 0 })
                            }
                            className="h-11 text-base tabular-nums bg-background"
                          />
                        </div>
                      </div>

                      <div className="flex justify-end pt-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                          onClick={() => removeItem(item.id)}
                          disabled={items.length === 1}
                        >
                          <Trash2 className="mr-2 size-4" aria-hidden />
                          Eliminar este concepto
                        </Button>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>

            <div className="p-4 sm:p-5">
              <Button variant="outline" onClick={addItem} className="h-11 w-full border-dashed text-primary">
                <Plus className="mr-2 size-4" aria-hidden />
                Agregar otro concepto
              </Button>
            </div>
            {renderWizardFooter(handleNextStep2, 'Siguiente')}
          </Card>
        </section>
      )}

      {/* ─── PASO 3 ───────────────────────────────────────── */}
      {step === 3 && (
        <section aria-labelledby="step-3-title" className="animate-in fade-in slide-in-from-right-4 duration-300">
          <div className="mb-4">
            <h2 id="step-3-title" className="text-lg font-semibold">Detalles finales</h2>
            <p className="text-sm text-muted-foreground">Paso 3 de 3: Ajustes, notas adicionales y guardado.</p>
          </div>

          <Card className="gap-0 py-0">
            <div className="grid gap-6 p-4 sm:p-5 lg:grid-cols-2">
              <div className="space-y-6">

                {/* Opciones en formato Radio Card (Sin Select) */}
                <div className="space-y-3">
                  <Label className="text-sm font-semibold">Tipo de documento</Label>
                  <RadioGroup
                    value={status}
                    onValueChange={(v) => setStatus(v as 'quote' | 'issued')}
                    className="grid grid-cols-2 gap-3"
                  >
                    <div>
                      <RadioGroupItem value="quote" id="quote" className="peer sr-only" />
                      <Label
                        htmlFor="quote"
                        className="flex h-full cursor-pointer flex-col items-center justify-between rounded-xl border-2 border-muted bg-transparent p-4 hover:bg-muted/50 peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 active:scale-[0.98] transition-all"
                      >
                        <span className="text-[15px] font-semibold">Cotización</span>
                        <span className="mt-1 text-center text-xs font-normal text-muted-foreground">No afecta reportes</span>
                      </Label>
                    </div>
                    <div>
                      <RadioGroupItem value="issued" id="issued" className="peer sr-only" />
                      <Label
                        htmlFor="issued"
                        className="flex h-full cursor-pointer flex-col items-center justify-between rounded-xl border-2 border-muted bg-transparent p-4 hover:bg-muted/50 peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 active:scale-[0.98] transition-all"
                      >
                        <span className="text-[15px] font-semibold">Nota de venta</span>
                        <span className="mt-1 text-center text-xs font-normal text-muted-foreground">Venta confirmada</span>
                      </Label>
                    </div>
                  </RadioGroup>
                </div>

                <label className="flex cursor-pointer items-center gap-3 rounded-xl border bg-muted/30 p-4 hover:bg-muted/50 active:bg-muted/70 transition-colors">
                  <input
                    type="checkbox"
                    checked={applyIva}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => setApplyIva(e.target.checked)}
                    className="size-5 rounded border-primary text-primary focus:ring-primary"
                  />
                  <span className="text-[15px] font-medium">Incluir IVA (16%) al total</span>
                </label>

                <div className="space-y-2">
                  <Label htmlFor="obs">Notas u observaciones</Label>
                  <textarea
                    id="obs"
                    value={notes}
                    onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setNotes(e.target.value)}
                    placeholder="Condiciones de pago, validez de la cotización..."
                    className="flex min-h-[100px] w-full resize-none rounded-xl border border-input bg-background px-4 py-3 text-base ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  />
                </div>
              </div>

              {/* Resumen Final */}
              <div className="flex flex-col justify-end space-y-4 rounded-xl border bg-muted/20 p-5">
                <h3 className="text-sm font-semibold text-muted-foreground border-b pb-2">Resumen a cobrar</h3>
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
                  <span className="text-lg font-semibold">Total Neto</span>
                  <span className="text-2xl font-bold text-primary tabular-nums">
                    {formatCurrency(totals.total)}
                  </span>
                </div>
              </div>
            </div>

            {renderWizardFooter(handleSave, 'Finalizar y guardar')}
          </Card>
        </section>
      )}

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
                  router.push(`/tools/notas-venta/editar-nota-venta/${savedNote.id}`)
                }}
                className="h-11 w-full px-4 sm:w-auto"
              >
                <Pencil className="mr-2 size-4" aria-hidden />
                Editar nota
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