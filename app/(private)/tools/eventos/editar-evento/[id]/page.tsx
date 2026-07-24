'use client'

import { useState, ChangeEvent, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Plus, Loader2, Save, ArrowLeft, Pencil } from 'lucide-react'
import { motion } from 'framer-motion'

import { financeApi } from '@/lib/api/finance'
import { noteTotal } from '@/lib/calculations'
import { defaultBusinessConfig } from '@/lib/config'
import type { BusinessEvent, UpdateBusinessEventDto, EventStatus, BusinessConfig } from '@/types/finance'
import { useIsMobile } from '@/hooks/useIsMobile'

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { PageHeader } from '@/components/admin/page-header'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { DocumentActions } from '@/components/documents/document-actions'
import { EventContractDocument, PrintEventContractDocument, EventContractData } from '@/components/documents/event-contract-document'

export default function EditarEventoPage({ params }: { params: Promise<{ id: string }> }) {
    const { id: eventId } = use(params)
    const router = useRouter()
    const queryClient = useQueryClient()
    const isMobile = useIsMobile()

    // Form State
    const [formName, setFormName] = useState('')
    const [formClientName, setFormClientName] = useState('')
    const [formClientPhone, setFormClientPhone] = useState('')
    const [formAddress, setFormAddress] = useState('')
    const [formDate, setFormDate] = useState(new Date().toISOString().split('T')[0])
    const [formCost, setFormCost] = useState('')
    const [formStatus, setFormStatus] = useState<EventStatus>('pending')
    const [formNoteId, setFormNoteId] = useState('none')
    const [formGuarantee, setFormGuarantee] = useState('INE / Credencial de Elector')
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

    // State for the saved event (triggers the export bottom sheet)
    const [savedEvent, setSavedEvent] = useState<BusinessEvent | null>(null)

    // Load available notes from localStorage
    const [availableNotes, setAvailableNotes] = useState<any[]>([])
    useEffect(() => {
        try {
            const stored = localStorage.getItem('v-notes')
            if (stored) setAvailableNotes(JSON.parse(stored))
        } catch { }
    }, [])

    // Business Config for Document Generation
    const { data: apiConfig } = useQuery({
        queryKey: ['businessConfig'],
        queryFn: () => financeApi.getConfig(),
    })
    const businessConfig: BusinessConfig = apiConfig || defaultBusinessConfig

    // Update Mutation
    const updateMutation = useMutation({
        mutationFn: (dto: UpdateBusinessEventDto) => financeApi.updateBusinessEvent(eventId, dto),
        onSuccess: (apiEvent) => {
            queryClient.invalidateQueries({ queryKey: ['businessEvents'] })
            toast.success('Evento actualizado exitosamente')

            // Format the saved event for the document preview
            const mappedEvent: BusinessEvent = {
                ...apiEvent,
                id: String(apiEvent.id),
                folio: apiEvent.folio || `EV-${String(apiEvent.id).slice(0, 4)}`,
                name: apiEvent.name || apiEvent.serviceDescription || formName,
                serviceDescription: apiEvent.serviceDescription || apiEvent.name || formName,
                cost: Number(apiEvent.cost) || Number(formCost) || 0,
                date: apiEvent.eventDate || apiEvent.date || formDate,
                clientName: apiEvent.clientName || formClientName,
                clientPhone: apiEvent.clientPhone || formClientPhone,
                eventAddress: apiEvent.eventAddress || formAddress,
                status: (apiEvent.status as EventStatus) || formStatus,
                guaranteeDocument: apiEvent.guaranteeDocument || formGuarantee,
                notes: apiEvent.notes || formNotes
            }
            setSavedEvent(mappedEvent)
        },
        onError: (err: any) => {
            toast.error(err.message || 'Error al guardar el evento')
        },
    })

    function handleFormSubmit() {
        if (!formName.trim() || !formClientName.trim()) {
            toast.error('Nombre del evento y del cliente son requeridos')
            return
        }
        updateMutation.mutate({
            name: formName.trim(),
            cost: Number(formCost) || 0,
            eventDate: formDate,
            clientName: formClientName.trim(),
            clientPhone: formClientPhone.trim() || undefined,
            eventAddress: formAddress.trim() || undefined,
            status: formStatus,
            noteId: formNoteId === 'none' ? undefined : formNoteId,
            guaranteeDocument: formGuarantee,
            notes: formNotes.trim() || undefined,
        })
    }

    return (
        <div className="space-y-4 sm:space-y-6 pb-24 sm:pb-0">
            <PageHeader
                title="Editar Evento"
                description="Modifica los detalles del evento y regenera el contrato si es necesario."
                action={
                    <Button
                        variant="outline"
                        onClick={() => router.push('/tools/eventos')}
                        className="w-full sm:w-auto h-11 border-violet-200 text-violet-700 hover:bg-violet-50 touch-manipulation gap-2 rounded-xl"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Volver a eventos
                    </Button>
                }
            />

            <div className="max-w-4xl mx-auto">
                <Card className="border-violet-100 bg-white shadow-sm p-4 sm:p-6 rounded-2xl">
                    <div className="space-y-5">
                        {/* Nombre del evento */}
                        <div className="space-y-1.5">
                            <Label className="text-sm font-semibold text-violet-900">
                                Nombre del Evento / Servicio <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                value={formName}
                                onChange={(e: ChangeEvent<HTMLInputElement>) => setFormName(e.target.value)}
                                placeholder="Ej. Renta Mobiliario Fiesta Cumpleaños"
                                className="h-12 border-violet-100 focus:border-violet-500 text-base"
                            />
                        </div>

                        {/* Cliente + Teléfono */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <Label className="text-sm font-semibold text-violet-900">
                                    Nombre del Cliente <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    value={formClientName}
                                    onChange={(e: ChangeEvent<HTMLInputElement>) => setFormClientName(e.target.value)}
                                    placeholder="Nombre completo"
                                    className="h-12 border-violet-100 focus:border-violet-500 text-base"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-sm font-semibold text-violet-900">Teléfono</Label>
                                <Input
                                    inputMode="tel"
                                    value={formClientPhone}
                                    onChange={(e: ChangeEvent<HTMLInputElement>) => setFormClientPhone(e.target.value)}
                                    placeholder="656 123 4567"
                                    className="h-12 border-violet-100 focus:border-violet-500 text-base"
                                />
                            </div>
                        </div>

                        {/* Dirección */}
                        <div className="space-y-1.5">
                            <Label className="text-sm font-semibold text-violet-900">Dirección del Evento</Label>
                            <Input
                                value={formAddress}
                                onChange={(e: ChangeEvent<HTMLInputElement>) => setFormAddress(e.target.value)}
                                placeholder="Calle, número, colonia, referencias..."
                                className="h-12 border-violet-100 focus:border-violet-500 text-base"
                            />
                        </div>

                        {/* Fecha + Costo */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <Label className="text-sm font-semibold text-violet-900">Fecha del Evento</Label>
                                <Input
                                    type="date"
                                    value={formDate}
                                    onChange={(e: ChangeEvent<HTMLInputElement>) => setFormDate(e.target.value)}
                                    className="h-12 border-violet-100 focus:border-violet-500 text-base"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-sm font-semibold text-violet-900">Costo Total ($)</Label>
                                <Input
                                    type="number"
                                    inputMode="decimal"
                                    min="0"
                                    step="0.01"
                                    value={formCost}
                                    onChange={(e: ChangeEvent<HTMLInputElement>) => setFormCost(e.target.value)}
                                    placeholder="0.00"
                                    className="h-12 border-violet-100 focus:border-violet-500 text-base font-semibold"
                                />
                            </div>
                        </div>

                        {/* Estado + Nota vinculada */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <Label className="text-sm font-semibold text-violet-900">Estado</Label>
                                <Select value={formStatus} onValueChange={(val) => setFormStatus(val as EventStatus)}>
                                    <SelectTrigger className="h-12 border-violet-100 bg-white text-base">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="pending">Pendiente</SelectItem>
                                        <SelectItem value="delivered">Entregado</SelectItem>
                                        <SelectItem value="collected">Recogido (Finalizado)</SelectItem>
                                        <SelectItem value="cancelled">Cancelado</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-sm font-semibold text-violet-900">Vincular Nota (Opcional)</Label>
                                <Select value={formNoteId} onValueChange={setFormNoteId}>
                                    <SelectTrigger className="h-12 border-violet-100 bg-white text-base">
                                        <SelectValue placeholder="Sin nota vinculada" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="none">Sin nota</SelectItem>
                                        {availableNotes.map((note) => (
                                            <SelectItem key={note.id} value={note.id}>
                                                {note.folio} — {note.customer?.name} (${noteTotal(note)})
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {/* Garantía */}
                        <div className="space-y-1.5">
                            <Label className="text-sm font-semibold text-violet-900">Documento de Garantía</Label>
                            <Select value={formGuarantee} onValueChange={setFormGuarantee}>
                                <SelectTrigger className="h-12 border-violet-100 bg-white text-base">
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

                        {/* Notas */}
                        <div className="space-y-1.5">
                            <Label className="text-sm font-semibold text-violet-900">Notas / Términos de entrega</Label>
                            <Input
                                value={formNotes}
                                onChange={(e: ChangeEvent<HTMLInputElement>) => setFormNotes(e.target.value)}
                                placeholder="Detalles sobre horario de entrega o recolección..."
                                className="h-12 border-violet-100 focus:border-violet-500 text-base"
                            />
                        </div>

                        {/* Botones */}
                        <div className="pt-4 flex flex-col-reverse sm:flex-row justify-end gap-3 border-t border-violet-50 mt-6 pt-6">
                            <Button
                                variant="outline"
                                onClick={() => router.push('/tools/eventos')}
                                className="h-12 border-violet-100 text-base font-semibold active:scale-[0.97] transition-all rounded-xl"
                            >
                                Cancelar
                            </Button>
                            <Button
                                onClick={handleFormSubmit}
                                disabled={updateMutation.isPending}
                                className="h-12 bg-violet-600 hover:bg-violet-700 active:bg-violet-800 text-white font-bold px-8 text-base active:scale-[0.97] transition-all rounded-xl shadow-lg shadow-violet-600/20"
                            >
                                {updateMutation.isPending ? (
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                ) : (
                                    <Save className="mr-2 h-4 w-4" />
                                )}
                                Actualizar Evento
                            </Button>
                        </div>
                    </div>
                </Card>
            </div>

            {/* ── Sheet mobile: evento guardado ── */}
            {isMobile && (
                <Sheet open={savedEvent !== null} onOpenChange={(o) => {
                    if (!o) {
                        setSavedEvent(null)
                        router.push('/tools/eventos')
                    }
                }}>
                    <SheetContent
                        side="bottom"
                        className="h-[92vh] max-h-[92dvh] rounded-t-3xl border-t border-violet-100 bg-white p-0 flex flex-col overflow-hidden"
                    >
                        <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-sm px-4 pt-3 pb-2 border-b border-violet-100/50 flex-shrink-0">
                            <div className="w-10 h-1 rounded-full bg-violet-200 mx-auto mb-3" />
                            <SheetHeader className="text-left">
                                <SheetTitle className="text-lg font-bold text-violet-950">Evento Guardado: {savedEvent?.folio}</SheetTitle>
                            </SheetHeader>
                        </div>
                        <div className="px-4 py-4 overflow-y-auto flex-1 pb-4">
                            {savedEvent && (
                                <DocumentActions
                                    filename={`contrato-evento-${savedEvent.folio}`}
                                    exportNode={<PrintEventContractDocument event={savedEvent as EventContractData} business={businessConfig} />}
                                    extraActions={
                                        <motion.div whileTap={{ scale: 0.94 }} className="flex-1 sm:flex-none">
                                            <Button
                                                variant="outline"
                                                onClick={() => setSavedEvent(null)}
                                                className="w-full sm:w-auto h-11 rounded-xl border-violet-200 text-violet-700 hover:bg-violet-50 touch-manipulation gap-2 text-xs sm:text-sm font-semibold px-4"
                                            >
                                                <Pencil className="h-4 w-4 text-violet-500" />
                                                Seguir Editando
                                            </Button>
                                        </motion.div>
                                    }
                                >
                                    <EventContractDocument event={savedEvent as EventContractData} business={businessConfig} />
                                </DocumentActions>
                            )}
                        </div>
                    </SheetContent>
                </Sheet>
            )}

            {/* ── Dialog desktop: evento guardado ── */}
            {!isMobile && (
                <Dialog open={savedEvent !== null} onOpenChange={(o) => {
                    if (!o) {
                        setSavedEvent(null)
                        router.push('/tools/eventos')
                    }
                }}>
                    <DialogContent className="max-h-[90dvh] max-w-4xl overflow-y-auto rounded-2xl border-violet-100 bg-white p-4 sm:p-6">
                        <DialogHeader>
                            <DialogTitle className="text-xl font-bold text-violet-950">Evento Guardado: {savedEvent?.folio}</DialogTitle>
                        </DialogHeader>
                        {savedEvent && (
                            <DocumentActions
                                filename={`contrato-evento-${savedEvent.folio}`}
                                exportNode={<PrintEventContractDocument event={savedEvent as EventContractData} business={businessConfig} />}
                                extraActions={
                                    <motion.div whileTap={{ scale: 0.94 }}>
                                        <Button
                                            variant="outline"
                                            onClick={() => setSavedEvent(null)}
                                            className="h-11 rounded-xl border-violet-200 text-violet-700 hover:bg-violet-50 touch-manipulation gap-2 text-xs sm:text-sm font-semibold px-4"
                                        >
                                            <Pencil className="h-4 w-4 text-violet-500" />
                                            Seguir Editando
                                        </Button>
                                    </motion.div>
                                }
                            >
                                <EventContractDocument event={savedEvent as EventContractData} business={businessConfig} />
                            </DocumentActions>
                        )}
                    </DialogContent>
                </Dialog>
            )}
        </div>
    )
}