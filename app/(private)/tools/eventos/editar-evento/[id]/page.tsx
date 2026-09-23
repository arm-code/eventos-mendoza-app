// app/tools/eventos/editar-evento/[id]/page.tsx
'use client'

import { useState, ChangeEvent, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Loader2, Save, ArrowLeft, ArrowRight } from 'lucide-react'

import { financeApi } from '@/lib/api/finance'
import type { UpdateBusinessEventDto, EventStatus } from '@/types/finance'

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card } from "@/components/ui/card"
import { PageHeader } from '@/components/admin/page-header'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { cn } from '@/lib/utils'

export default function EditarEventoPage({ params }: { params: Promise<{ id: string }> }) {
    const { id: eventId } = use(params)
    const router = useRouter()
    const queryClient = useQueryClient()

    const [step, setStep] = useState<1 | 2 | 3>(1)

    // Step 1: General Info
    const [formName, setFormName] = useState('')
    const [formClientName, setFormClientName] = useState('')
    const [formClientPhone, setFormClientPhone] = useState('')
    const [formAddress, setFormAddress] = useState('')

    // Step 2: Fechas, Finanzas y Contrato
    const [formDate, setFormDate] = useState(new Date().toISOString().split('T')[0])
    const [formCost, setFormCost] = useState('')
    const [formNoteId, setFormNoteId] = useState('none')
    const [formGuarantee, setFormGuarantee] = useState('INE / Credencial de Elector')

    // Step 3: Detalles finales
    const [formStatus, setFormStatus] = useState<EventStatus>('pending')
    const [formNotes, setFormNotes] = useState('')

    // Fetch existing event
    const { data: rawEvents } = useQuery({
        queryKey: ['businessEvents', 'all', ''],
        queryFn: () => financeApi.getBusinessEvents({ tab: 'all', search: '' }),
    })

    useEffect(() => {
        if (!rawEvents || !Array.isArray(rawEvents)) return
        const event = rawEvents.find(e => String(e.id) === eventId)
        if (event) {
            setFormName(event.name || event.serviceDescription || '')
            setFormClientName(event.clientName || '')
            setFormClientPhone(event.clientPhone || '')
            setFormAddress(event.eventAddress || '')
            setFormDate(
                event.date || event.eventDate
                    ? (event.date || event.eventDate)!.split('T')[0]
                    : new Date().toISOString().split('T')[0]
            )
            setFormCost(String(event.cost || ''))
            setFormStatus(event.status || 'pending')
            setFormNoteId(event.noteId || 'none')
            setFormGuarantee(event.guaranteeDocument || 'INE / Credencial de Elector')
            setFormNotes(event.notes || '')
        }
    }, [rawEvents, eventId])

    // Load available notes from API
    const { data: availableNotesData } = useQuery({
        queryKey: ['salesNotes'],
        queryFn: () => financeApi.getSalesNotes(),
    })
    const availableNotes = availableNotesData || []

    // Update Mutation
    const updateMutation = useMutation({
        mutationFn: (dto: UpdateBusinessEventDto) => financeApi.updateBusinessEvent(eventId, dto),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['businessEvents'] })
            toast.success('Evento actualizado exitosamente')
            router.push('/tools/eventos')
        },
        onError: (err: any) => {
            toast.error(err.message || 'Error al guardar el evento')
        },
    })

    function handleNextStep1() {
        if (!formName.trim()) {
            toast.error('Falta el nombre del evento')
            return
        }
        if (!formClientName.trim()) {
            toast.error('Falta el nombre del cliente')
            return
        }
        setStep(2)
    }

    function handleNextStep2() {
        if (!formDate) {
            toast.error('Falta la fecha del evento')
            return
        }
        setStep(3)
    }

    function handleSave() {
        updateMutation.mutate({
            name: formName.trim(),
            cost: Number(formCost) || 0,
            eventDate: formDate,
            clientName: formClientName.trim(),
            clientPhone: formClientPhone.trim() || undefined,
            eventAddress: formAddress.trim() || undefined,
            status: formStatus,
            noteId: formNoteId === 'none' ? null : formNoteId,
            guaranteeDocument: formGuarantee,
            notes: formNotes.trim() || undefined,
        })
    }

    const renderWizardFooter = (primaryAction: () => void, primaryLabel: string, showBack = true) => (
        <div className="flex flex-col-reverse gap-3 border-t bg-muted/20 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
            <Button
                variant="ghost"
                onClick={() => router.push('/tools/eventos')}
                className="text-muted-foreground hover:text-destructive h-11"
            >
                Cancelar y salir
            </Button>
            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center">
                {showBack && (
                    <Button variant="outline" onClick={() => setStep((s) => (s - 1) as 1 | 2 | 3)} className="h-11 w-full sm:w-auto px-4">
                        <ArrowLeft className="mr-2 size-4" aria-hidden />
                        Atrás
                    </Button>
                )}
                <Button
                    onClick={primaryAction}
                    disabled={updateMutation.isPending}
                    className="h-11 w-full sm:w-auto px-8"
                >
                    {updateMutation.isPending ? (
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
            <PageHeader title="Editar evento" />

            <div aria-hidden="true" className="flex items-center gap-2 px-1">
                <div className={cn("h-1.5 flex-1 rounded-full transition-colors", step >= 1 ? "bg-primary" : "bg-muted")} />
                <div className={cn("h-1.5 flex-1 rounded-full transition-colors", step >= 2 ? "bg-primary" : "bg-muted")} />
                <div className={cn("h-1.5 flex-1 rounded-full transition-colors", step >= 3 ? "bg-primary" : "bg-muted")} />
            </div>

            {/* ─── PASO 1 ──────────────────────────────────────────────── */}
            {step === 1 && (
                <section aria-labelledby="step-1-title" className="animate-in fade-in slide-in-from-right-4 duration-300">
                    <div className="mb-4">
                        <h2 id="step-1-title" className="text-lg font-semibold">Datos generales</h2>
                        <p className="text-sm text-muted-foreground">Paso 1 de 3: Registra el evento y el cliente</p>
                    </div>
                    <Card className="gap-0 py-0">
                        <div className="space-y-5 p-4 sm:p-5">
                            <div className="space-y-2">
                                <Label htmlFor="ename">
                                    Nombre del Evento / Servicio <span className="text-destructive">*</span>
                                </Label>
                                <Input
                                    id="ename"
                                    value={formName}
                                    onChange={(e: ChangeEvent<HTMLInputElement>) => setFormName(e.target.value)}
                                    placeholder="Ej. Renta Mobiliario Boda"
                                    className="h-11 text-base capitalize"
                                    autoFocus
                                />
                            </div>

                            <div className="grid gap-5 sm:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="cname">
                                        Nombre del Cliente <span className="text-destructive">*</span>
                                    </Label>
                                    <Input
                                        id="cname"
                                        value={formClientName}
                                        onChange={(e: ChangeEvent<HTMLInputElement>) => setFormClientName(e.target.value)}
                                        placeholder="Nombre completo"
                                        className="h-11 text-base capitalize"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="cphone">Teléfono (opcional)</Label>
                                    <Input
                                        id="cphone"
                                        inputMode="tel"
                                        value={formClientPhone}
                                        onChange={(e: ChangeEvent<HTMLInputElement>) => setFormClientPhone(e.target.value)}
                                        placeholder="656 123 4567"
                                        className="h-11 text-base"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="caddr">Dirección del Evento (opcional)</Label>
                                <Input
                                    id="caddr"
                                    value={formAddress}
                                    onChange={(e: ChangeEvent<HTMLInputElement>) => setFormAddress(e.target.value)}
                                    placeholder="Lugar de entrega..."
                                    className="h-11 text-base capitalize"
                                />
                            </div>
                        </div>
                        {renderWizardFooter(handleNextStep1, 'Siguiente', false)}
                    </Card>
                </section>
            )}

            {/* ─── PASO 2 ────────────────────────────────────────────── */}
            {step === 2 && (
                <section aria-labelledby="step-2-title" className="animate-in fade-in slide-in-from-right-4 duration-300">
                    <div className="mb-4">
                        <h2 id="step-2-title" className="text-lg font-semibold">Finanzas y Contrato</h2>
                        <p className="text-sm text-muted-foreground">Paso 2 de 3: Define la fecha, costos y garantías</p>
                    </div>

                    <Card className="gap-0 py-0">
                        <div className="space-y-5 p-4 sm:p-5">
                            <div className="grid gap-5 sm:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="edate">
                                        Fecha del Evento <span className="text-destructive">*</span>
                                    </Label>
                                    <Input
                                        id="edate"
                                        type="date"
                                        value={formDate}
                                        onChange={(e: ChangeEvent<HTMLInputElement>) => setFormDate(e.target.value)}
                                        className="h-11 text-base"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="ecost">Costo Total ($)</Label>
                                    <Input
                                        id="ecost"
                                        type="number"
                                        inputMode="decimal"
                                        min="0"
                                        step="0.01"
                                        value={formCost}
                                        onChange={(e: ChangeEvent<HTMLInputElement>) => setFormCost(e.target.value)}
                                        placeholder="0.00"
                                        className="h-11 text-base font-semibold tabular-nums"
                                    />
                                </div>
                            </div>

                            <div className="grid gap-5 sm:grid-cols-2">
                                <div className="space-y-2">
                                    <Label>Documento de Garantía</Label>
                                    <Select value={formGuarantee} onValueChange={setFormGuarantee}>
                                        <SelectTrigger className="h-11 text-base bg-background">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="INE / Credencial de Elector">INE / Credencial de Elector</SelectItem>
                                            <SelectItem value="Licencia de Conducir">Licencia de Conducir</SelectItem>
                                            <SelectItem value="Depósito de Garantía en Efectivo">Depósito de Garantía en Efectivo</SelectItem>
                                            <SelectItem value="Pasaporte">Pasaporte</SelectItem>
                                            <SelectItem value="Ninguno">Ninguno</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label>Vincular Nota de Venta (Opcional)</Label>
                                    <Select value={formNoteId} onValueChange={setFormNoteId}>
                                        <SelectTrigger className="h-11 text-base bg-background">
                                            <SelectValue placeholder="Sin nota vinculada" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="none">Sin nota</SelectItem>
                                            {availableNotes.map((note: any) => (
                                                <SelectItem key={note.id} value={note.id}>
                                                    {note.folio} — {note.customerName || note.customer?.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
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
                        <p className="text-sm text-muted-foreground">Paso 3 de 3: Estado del evento y observaciones</p>
                    </div>

                    <Card className="gap-0 py-0">
                        <div className="grid gap-6 p-4 sm:p-5 lg:grid-cols-2">
                            <div className="space-y-6">
                                <div className="space-y-3">
                                    <Label className="text-sm font-semibold">Estado del Evento</Label>
                                    <RadioGroup
                                        value={formStatus}
                                        onValueChange={(v) => setFormStatus(v as EventStatus)}
                                        className="grid grid-cols-2 gap-3"
                                    >
                                        <div>
                                            <RadioGroupItem value="pending" id="pending" className="peer sr-only" />
                                            <Label
                                                htmlFor="pending"
                                                className="flex h-full cursor-pointer flex-col items-center justify-between rounded-xl border-2 border-muted bg-transparent p-4 hover:bg-muted/50 peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 active:scale-[0.98] transition-all"
                                            >
                                                <span className="text-[14px] font-semibold">Pendiente</span>
                                            </Label>
                                        </div>
                                        <div>
                                            <RadioGroupItem value="delivered" id="delivered" className="peer sr-only" />
                                            <Label
                                                htmlFor="delivered"
                                                className="flex h-full cursor-pointer flex-col items-center justify-between rounded-xl border-2 border-muted bg-transparent p-4 hover:bg-muted/50 peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 active:scale-[0.98] transition-all"
                                            >
                                                <span className="text-[14px] font-semibold">Entregado</span>
                                            </Label>
                                        </div>
                                        <div>
                                            <RadioGroupItem value="collected" id="collected" className="peer sr-only" />
                                            <Label
                                                htmlFor="collected"
                                                className="flex h-full cursor-pointer flex-col items-center justify-between rounded-xl border-2 border-muted bg-transparent p-4 hover:bg-muted/50 peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 active:scale-[0.98] transition-all"
                                            >
                                                <span className="text-[14px] font-semibold text-center">Recogido (Fin)</span>
                                            </Label>
                                        </div>
                                        <div>
                                            <RadioGroupItem value="cancelled" id="cancelled" className="peer sr-only" />
                                            <Label
                                                htmlFor="cancelled"
                                                className="flex h-full cursor-pointer flex-col items-center justify-between rounded-xl border-2 border-muted bg-transparent p-4 hover:bg-muted/50 peer-data-[state=checked]:border-destructive peer-data-[state=checked]:bg-destructive/5 active:scale-[0.98] transition-all text-destructive"
                                            >
                                                <span className="text-[14px] font-semibold">Cancelado</span>
                                            </Label>
                                        </div>
                                    </RadioGroup>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="obs">Notas / Términos de entrega</Label>
                                    <textarea
                                        id="obs"
                                        value={formNotes}
                                        onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setFormNotes(e.target.value)}
                                        placeholder="Detalles sobre horario de entrega o recolección..."
                                        className="flex min-h-[120px] w-full resize-none rounded-xl border border-input bg-background px-4 py-3 text-base ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 first-letter:uppercase"
                                    />
                                </div>
                            </div>
                        </div>

                        {renderWizardFooter(handleSave, 'Guardar Cambios')}
                    </Card>
                </section>
            )}
        </div>
    )
}