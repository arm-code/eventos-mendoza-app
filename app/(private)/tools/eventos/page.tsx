'use client'

import { useState, useMemo, useEffect, ChangeEvent } from 'react'
import { Plus, Search, Calendar, MapPin, User, Phone, FileText, Edit2, FileDown, CheckCircle2, Clock, XCircle, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { financeApi } from '@/lib/api/finance'
import { noteTotal } from '@/lib/calculations'
import { formatCurrency, formatDate } from '@/lib/format'
import { seedBusinessConfig } from '@/lib/mock-data'
import { PageHeader } from '@/components/admin/page-header'
import { DocumentActions } from '@/components/documents/document-actions'
import { EventContractDocument, EventContractData } from '@/components/documents/event-contract-document'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import type { EventStatus, CreateBusinessEventDto, UpdateBusinessEventDto, BusinessEvent } from '@/types/finance'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export default function EventosPage() {
  const queryClient = useQueryClient()
  const [activeTab, setActiveTab] = useState<'upcoming' | 'finished' | 'cancelled' | 'all'>('upcoming')
  const [searchQuery, setSearchQuery] = useState('')

  // Modal States
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingEvent, setEditingEvent] = useState<BusinessEvent | null>(null)
  const [contractEvent, setContractEvent] = useState<BusinessEvent | null>(null)

  // Form Fields
  const [formName, setFormName] = useState('')
  const [formClientName, setFormClientName] = useState('')
  const [formClientPhone, setFormClientPhone] = useState('')
  const [formAddress, setFormAddress] = useState('')
  const [formDate, setFormDate] = useState('')
  const [formCost, setFormCost] = useState('')
  const [formStatus, setFormStatus] = useState<EventStatus>('pending')
  const [formNoteId, setFormNoteId] = useState('none')
  const [formGuarantee, setFormGuarantee] = useState('INE / Credencial de Elector')
  const [formNotes, setFormNotes] = useState('')

  // Query events 100% from NestJS API Database
  const { data: rawEvents = [], isLoading, isError } = useQuery({
    queryKey: ['businessEvents', activeTab, searchQuery],
    queryFn: () => financeApi.getBusinessEvents({ tab: activeTab, search: searchQuery }),
  })

  // Normalize API Events list
  const eventsList = useMemo<BusinessEvent[]>(() => {
    const list = Array.isArray(rawEvents) ? rawEvents : []
    return list.map((ev) => ({
      ...ev,
      id: String(ev.id),
      folio: ev.folio || `EV-${String(ev.id).slice(0, 4)}`,
      name: ev.name || ev.serviceDescription || 'Evento de Renta',
      serviceDescription: ev.serviceDescription || ev.name || 'Renta de mobiliario',
      cost: Number(ev.cost) || 0,
      date: ev.eventDate || ev.date || new Date().toISOString(),
      clientName: ev.clientName || 'Cliente',
      clientPhone: ev.clientPhone || '',
      eventAddress: ev.eventAddress || 'Dirección por definir',
      status: (ev.status as EventStatus) || 'pending',
    })).sort((a, b) => +new Date(b.date || 0) - +new Date(a.date || 0))
  }, [rawEvents])

  // Filter local tab/search if backend sends raw array
  const filteredEvents = useMemo(() => {
    let list = eventsList

    if (activeTab === 'upcoming') {
      list = list.filter((e) => e.status === 'pending' || e.status === 'delivered')
    } else if (activeTab === 'finished') {
      list = list.filter((e) => e.status === 'collected')
    } else if (activeTab === 'cancelled') {
      list = list.filter((e) => e.status === 'cancelled')
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      list = list.filter(
        (e) =>
          e.name.toLowerCase().includes(q) ||
          (e.clientName && e.clientName.toLowerCase().includes(q)) ||
          (e.eventAddress && e.eventAddress.toLowerCase().includes(q)) ||
          (e.folio && e.folio.toLowerCase().includes(q))
      )
    }

    return list
  }, [eventsList, activeTab, searchQuery])

  // API Mutations for NestJS backend
  const createMutation = useMutation({
    mutationFn: (dto: CreateBusinessEventDto) => financeApi.createBusinessEvent(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['businessEvents'] })
      toast.success('Evento agendado exitosamente en la base de datos')
      setIsFormOpen(false)
    },
    onError: (err: any) => {
      toast.error(err.message || 'Error al guardar el evento en la API')
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateBusinessEventDto }) =>
      financeApi.updateBusinessEvent(id, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['businessEvents'] })
      toast.success('Evento actualizado exitosamente')
      setIsFormOpen(false)
    },
    onError: (err: any) => {
      toast.error(err.message || 'Error al actualizar el evento')
    },
  })

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: EventStatus }) =>
      financeApi.updateEventStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['businessEvents'] })
      toast.success('Estado del evento actualizado')
    },
    onError: (err: any) => {
      toast.error(err.message || 'Error al actualizar el estado')
    },
  })

  // Notes from localStorage for optional linking
  const [availableNotes, setAvailableNotes] = useState<any[]>([])
  useEffect(() => {
    try {
      const stored = localStorage.getItem('eventos_mendoza_notes')
      if (stored) {
        setAvailableNotes(JSON.parse(stored))
      }
    } catch (e) {
      // ignore
    }
  }, [isFormOpen])

  function resetForm() {
    setFormName('')
    setFormClientName('')
    setFormClientPhone('')
    setFormAddress('')
    setFormDate(new Date().toISOString().split('T')[0])
    setFormCost('')
    setFormStatus('pending')
    setFormNoteId('none')
    setFormGuarantee('INE / Credencial de Elector')
    setFormNotes('')
    setEditingEvent(null)
  }

  function openCreateModal() {
    resetForm()
    setIsFormOpen(true)
  }

  function openEditModal(event: BusinessEvent) {
    setEditingEvent(event)
    setFormName(event.name || '')
    setFormClientName(event.clientName || '')
    setFormClientPhone(event.clientPhone || '')
    setFormAddress(event.eventAddress || '')
    setFormDate(event.date || event.eventDate ? (event.date || event.eventDate)!.split('T')[0] : new Date().toISOString().split('T')[0])
    setFormCost(String(event.cost || ''))
    setFormStatus(event.status || 'pending')
    setFormNoteId(event.noteId || 'none')
    setFormGuarantee(event.guaranteeDocument || 'INE / Credencial de Elector')
    setFormNotes(event.notes || '')
    setIsFormOpen(true)
  }

  function handleFormSubmit() {
    if (!formName.trim()) {
      toast.error('Ingresa el nombre o servicio del evento')
      return
    }
    if (!formClientName.trim()) {
      toast.error('Ingresa el nombre del cliente')
      return
    }

    const eventDateIso = formDate ? new Date(formDate).toISOString() : new Date().toISOString()
    const costNum = Number(formCost) || 0

    const dto: CreateBusinessEventDto = {
      name: formName.trim(),
      clientName: formClientName.trim(),
      clientPhone: formClientPhone.trim() || undefined,
      eventAddress: formAddress.trim() || 'Sin dirección',
      eventDate: eventDateIso,
      cost: costNum,
      status: formStatus,
      guaranteeDocument: formGuarantee,
      noteId: formNoteId === 'none' ? undefined : formNoteId,
      notes: formNotes.trim() || undefined,
    }

    if (editingEvent) {
      updateMutation.mutate({ id: editingEvent.id, dto })
    } else {
      createMutation.mutate(dto)
    }
  }

  function handleStatusChange(event: BusinessEvent, newStatus: EventStatus) {
    statusMutation.mutate({ id: event.id, status: newStatus })
  }

  const getStatusBadge = (status?: EventStatus) => {
    switch (status) {
      case 'pending':
        return <Badge className="bg-amber-100 text-amber-800 border-amber-200 font-semibold gap-1"><Clock className="w-3 h-3" /> Pendiente</Badge>
      case 'delivered':
        return <Badge className="bg-blue-100 text-blue-800 border-blue-200 font-semibold gap-1"><CheckCircle2 className="w-3 h-3" /> Entregado</Badge>
      case 'collected':
        return <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200 font-semibold gap-1"><CheckCircle2 className="w-3 h-3" /> Recogido</Badge>
      case 'cancelled':
        return <Badge className="bg-red-100 text-red-800 border-red-200 font-semibold gap-1"><XCircle className="w-3 h-3" /> Cancelado</Badge>
      default:
        return <Badge className="bg-gray-100 text-gray-800 border-gray-200 font-semibold gap-1">Pendiente</Badge>
    }
  }

  return (
    <div className="space-y-6 pb-12">
      <PageHeader
        title="Gestión de Eventos"
        description="Agenda de eventos en base de datos real, control de entregas y emisión de contratos."
        action={
          <Button onClick={openCreateModal} className="w-full sm:w-auto bg-violet-600 hover:bg-violet-700 text-white font-bold h-11 gap-2 shadow-sm shadow-violet-200">
            <Plus className="h-5 w-5" />
            Nuevo Evento
          </Button>
        }
      />

      {/* Buscador y Filtro Móvil */}
      <div className="space-y-3">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-violet-400" />
          <Input
            value={searchQuery}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
            placeholder="Buscar evento, cliente o dirección en base de datos..."
            className="h-11 pl-10 border-violet-100 bg-white focus:border-violet-500 shadow-sm"
          />
        </div>

        {/* Pestañas de Estado (Filtro Móvil Primero) */}
        <div className="flex overflow-x-auto gap-2 pb-1 no-scrollbar">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setActiveTab('upcoming')}
            className={`rounded-full px-4 text-xs font-semibold shrink-0 transition-all ${
              activeTab === 'upcoming'
                ? 'bg-violet-600 text-white shadow-sm'
                : 'bg-white text-violet-700 border border-violet-100 hover:bg-violet-50'
            }`}
          >
            Próximos (Pendientes)
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setActiveTab('finished')}
            className={`rounded-full px-4 text-xs font-semibold shrink-0 transition-all ${
              activeTab === 'finished'
                ? 'bg-violet-600 text-white shadow-sm'
                : 'bg-white text-violet-700 border border-violet-100 hover:bg-violet-50'
            }`}
          >
            Terminados (Recogidos)
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setActiveTab('cancelled')}
            className={`rounded-full px-4 text-xs font-semibold shrink-0 transition-all ${
              activeTab === 'cancelled'
                ? 'bg-violet-600 text-white shadow-sm'
                : 'bg-white text-violet-700 border border-violet-100 hover:bg-violet-50'
            }`}
          >
            Cancelados
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setActiveTab('all')}
            className={`rounded-full px-4 text-xs font-semibold shrink-0 transition-all ${
              activeTab === 'all'
                ? 'bg-violet-600 text-white shadow-sm'
                : 'bg-white text-violet-700 border border-violet-100 hover:bg-violet-50'
            }`}
          >
            Todos ({eventsList.length})
          </Button>
        </div>
      </div>

      {/* Lista de Eventos - Database Driven */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filteredEvents.map((evt) => (
          <Card key={evt.id} className="border-violet-100 bg-white shadow-sm hover:border-violet-200 transition-all flex flex-col justify-between">
            <CardContent className="p-4 space-y-3">
              {/* Header de la tarjeta */}
              <div className="flex items-start justify-between gap-2 border-b border-violet-50 pb-2.5">
                <div>
                  <div className="text-xs font-bold text-violet-600">{evt.folio}</div>
                  <h3 className="font-bold text-violet-950 text-base leading-tight mt-0.5">{evt.name}</h3>
                </div>
                <div>{getStatusBadge(evt.status)}</div>
              </div>

              {/* Detalles */}
              <div className="space-y-1.5 text-xs text-violet-900">
                <div className="flex items-center gap-2">
                  <User className="w-3.5 h-3.5 text-violet-500 shrink-0" />
                  <span className="font-semibold text-violet-950 truncate">{evt.clientName}</span>
                </div>
                {evt.clientPhone && (
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-violet-500 shrink-0" />
                    <span>{evt.clientPhone}</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Calendar className="w-3.5 h-3.5 text-violet-500 shrink-0" />
                  <span className="font-medium text-violet-700">
                    {evt.date ? formatDate(evt.date) : 'Por definir'}
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <MapPin className="w-3.5 h-3.5 text-violet-500 shrink-0 mt-0.5" />
                  <span className="line-clamp-2 text-violet-600">{evt.eventAddress}</span>
                </div>
                {evt.noteFolio && (
                  <div className="flex items-center gap-2 text-violet-700 font-semibold pt-1">
                    <FileText className="w-3.5 h-3.5 text-violet-600 shrink-0" />
                    <span>Nota: {evt.noteFolio}</span>
                  </div>
                )}
              </div>

              {/* Monto y Selector de Estado */}
              <div className="pt-2 border-t border-violet-50 flex items-center justify-between">
                <div>
                  <span className="text-xs text-violet-500 block">Costo total</span>
                  <span className="text-lg font-bold text-violet-950">{formatCurrency(evt.cost || 0)}</span>
                </div>

                <Select value={evt.status} onValueChange={(val) => handleStatusChange(evt, val as EventStatus)}>
                  <SelectTrigger className="h-8 text-xs border-violet-100 bg-violet-50/50 w-28">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pendiente</SelectItem>
                    <SelectItem value="delivered">Entregado</SelectItem>
                    <SelectItem value="collected">Recogido</SelectItem>
                    <SelectItem value="cancelled">Cancelar</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Botones de acción táctiles */}
              <div className="grid grid-cols-2 gap-2 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setContractEvent(evt)}
                  className="w-full border-violet-200 text-violet-700 hover:bg-violet-50 text-xs font-semibold h-9 gap-1"
                >
                  <FileDown className="w-3.5 h-3.5 text-violet-600" />
                  Contrato
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => openEditModal(evt)}
                  className="w-full text-violet-600 hover:bg-violet-50 text-xs font-semibold h-9 gap-1"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  Editar
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}

        {filteredEvents.length === 0 && (
          <Card className="col-span-full border-violet-100 bg-white p-8 text-center">
            {isLoading ? (
              <div className="flex items-center justify-center gap-2 text-violet-600 font-semibold py-4">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Cargando eventos desde la API...</span>
              </div>
            ) : (
              <>
                <Calendar className="w-12 h-12 text-violet-300 mx-auto mb-3 opacity-60" />
                <p className="text-violet-900 font-bold text-base">No hay eventos guardados en la base de datos.</p>
                <p className="text-xs text-violet-500 mt-1">Presiona "Nuevo Evento" para agendar el primer servicio.</p>
              </>
            )}
          </Card>
        )}
      </div>

      {/* Modal Crear / Editar Evento */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="w-[95vw] max-w-lg max-h-[90vh] overflow-y-auto p-4 sm:p-6 border-violet-100 bg-white">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-violet-950">
              {editingEvent ? 'Editar Evento' : 'Nuevo Evento'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-violet-900">Nombre del Evento / Servicio *</Label>
              <Input
                value={formName}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setFormName(e.target.value)}
                placeholder="Ej. Renta Mobiliario Fiesta Cumpleaños"
                className="h-11 border-violet-100 focus:border-violet-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-violet-900">Nombre del Cliente *</Label>
                <Input
                  value={formClientName}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setFormClientName(e.target.value)}
                  placeholder="Nombre completo"
                  className="h-11 border-violet-100 focus:border-violet-500"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-violet-900">Teléfono de Contacto</Label>
                <Input
                  inputMode="tel"
                  value={formClientPhone}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setFormClientPhone(e.target.value)}
                  placeholder="656 123 4567"
                  className="h-11 border-violet-100 focus:border-violet-500"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-violet-900">Dirección del Evento</Label>
              <Input
                value={formAddress}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setFormAddress(e.target.value)}
                placeholder="Calle, número, colonia, referencias..."
                className="h-11 border-violet-100 focus:border-violet-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-violet-900">Fecha del Evento</Label>
                <Input
                  type="date"
                  value={formDate}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setFormDate(e.target.value)}
                  className="h-11 border-violet-100 focus:border-violet-500"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-violet-900">Costo Total ($)</Label>
                <Input
                  type="number"
                  inputMode="decimal"
                  min="0"
                  step="0.01"
                  value={formCost}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setFormCost(e.target.value)}
                  placeholder="0.00"
                  className="h-11 border-violet-100 focus:border-violet-500 font-semibold"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-violet-900">Estado del Evento</Label>
                <Select value={formStatus} onValueChange={(val) => setFormStatus(val as EventStatus)}>
                  <SelectTrigger className="h-11 border-violet-100 bg-white">
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
                <Label className="text-xs font-semibold text-violet-900">Vincular a Nota de Venta (Opcional)</Label>
                <Select value={formNoteId} onValueChange={setFormNoteId}>
                  <SelectTrigger className="h-11 border-violet-100 bg-white">
                    <SelectValue placeholder="Sin nota vinculada" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Sin nota</SelectItem>
                    {availableNotes.map((note) => (
                      <SelectItem key={note.id} value={note.id}>
                        {note.folio} - {note.customer?.name} (${noteTotal(note)})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-violet-900">Documento de Garantía del Cliente</Label>
              <Select value={formGuarantee} onValueChange={setFormGuarantee}>
                <SelectTrigger className="h-11 border-violet-100 bg-white">
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

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-violet-900">Notas / Términos de entrega</Label>
              <Input
                value={formNotes}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setFormNotes(e.target.value)}
                placeholder="Detalles sobre horario de entrega o recolección..."
                className="h-11 border-violet-100 focus:border-violet-500"
              />
            </div>

            <div className="pt-4 flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsFormOpen(false)} className="h-11 border-violet-100">
                Cancelar
              </Button>
              <Button
                onClick={handleFormSubmit}
                disabled={createMutation.isPending || updateMutation.isPending}
                className="h-11 bg-violet-600 hover:bg-violet-700 text-white font-bold px-6"
              >
                {(createMutation.isPending || updateMutation.isPending) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {editingEvent ? 'Guardar Cambios' : 'Agendar Evento'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal Contrato / Exportación a PDF e Imagen */}
      <Dialog open={contractEvent !== null} onOpenChange={(o) => !o && setContractEvent(null)}>
        <DialogContent className="w-[95vw] max-w-4xl max-h-[90vh] overflow-y-auto p-4 sm:p-6 border-violet-100 bg-white">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-violet-950">
              Contrato de Evento {contractEvent?.folio}
            </DialogTitle>
          </DialogHeader>

          {contractEvent && (
            <div className="space-y-4 pt-2">
              <DocumentActions filename={`contrato-evento-${contractEvent.folio}`}>
                <EventContractDocument event={contractEvent as EventContractData} business={seedBusinessConfig} />
              </DocumentActions>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}