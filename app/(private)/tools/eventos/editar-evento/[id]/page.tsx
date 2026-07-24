'use client'

import { useState, ChangeEvent, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Loader2, Save, ArrowLeft } from 'lucide-react'

import { financeApi } from '@/lib/api/finance'
import { noteTotal } from '@/lib/calculations'
import { defaultBusinessConfig } from '@/lib/config'
import type { BusinessEvent, UpdateBusinessEventDto, EventStatus, BusinessConfig } from '@/types/finance'

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { PageHeader } from '@/components/admin/page-header'

export default function EditarEventoPage({ params }: { params: Promise<{ id: string }> }) {
    const { id: eventId } = use(params)
    const router = useRouter()
    const queryClient = useQueryClient()

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

    // Load available notes from localStorage
    const [availableNotes, setAvailableNotes] = useState<any[]>([])
    useEffect(() => {
        try {
            const stored = localStorage.getItem('v-notes')
            if (stored) setAvailableNotes(JSON.parse(stored))
        } catch { }
    }, [])

    // Business Config
    const { data: apiConfig } = useQuery({
        queryKey: ['businessConfig'],
        queryFn: () => financeApi.getConfig(),
    })
    const businessConfig: BusinessConfig = apiConfig || defaultBusinessConfig

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
                description="Modifica los detalles del evento."
                action={
                    <Button
                        variant="outline"
                        onClick={() => router.push('/tools/eventos')}
                        className="w-full sm:w-auto h-11 border-violet-200 text-violet-700 hover:bg-violet-50 touch-manipulation gap-2 rounded-xl active:scale-[0.97] transition-all"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Volver
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
                                className="h-12 border-violet-100 focus:border-violet-500 text-base rounded-xl"
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
                                    className="h-12 border-violet-100 focus:border-violet-500 text-base rounded-xl"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-sm font-semibold text-violet-900">Teléfono</Label>
                                <Input
                                    inputMode="tel"
                                    value={formClientPhone}
                                    onChange={(e: ChangeEvent<HTMLInputElement>) => setFormClientPhone(e.target.value)}
                                    placeholder="656 123 4567"
                                    className="h-12 border-violet-100 focus:border-violet-500 text-base rounded-xl"
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
                                className="h-12 border-violet-100 focus:border-violet-500 text-base rounded-xl"
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
                                    className="h-12 border-violet-100 focus:border-violet-500 text-base rounded-xl"
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
                                    className="h-12 border-violet-100 focus:border-violet-500 text-base font-semibold rounded-xl"
                                />
                            </div>
                        </div>

                        {/* Estado + Nota vinculada */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <Label className="text-sm font-semibold text-violet-900">Estado</Label>
                                <Select value={formStatus} onValueChange={(val) => setFormStatus(val as EventStatus)}>
                                    <SelectTrigger className="h-12 border-violet-100 bg-white text-base rounded-xl">
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
                                    <SelectTrigger className="h-12 border-violet-100 bg-white text-base rounded-xl">
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
                                <SelectTrigger className="h-12 border-violet-100 bg-white text-base rounded-xl">
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
                                className="h-12 border-violet-100 focus:border-violet-500 text-base rounded-xl"
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
                                Guardar Cambios
                            </Button>
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    )
}