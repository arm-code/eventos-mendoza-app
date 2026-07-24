'use client'

import { useState, useMemo, useEffect, ChangeEvent } from 'react'
import {
  Plus, Search, Calendar, MapPin, User, Phone, FileText, Edit2, FileDown,
  CheckCircle2, Clock, XCircle, Loader2, X, ChevronRight, Filter,
  ArrowUpDown, MoreHorizontal
} from 'lucide-react'
import { toast } from 'sonner'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { financeApi } from '@/lib/api/finance'
import { noteTotal } from '@/lib/calculations'
import { formatCurrency, formatDate } from '@/lib/format'
import { defaultBusinessConfig } from '@/lib/config'
import { PageHeader } from '@/components/admin/page-header'
import { DocumentActions } from '@/components/documents/document-actions'
import { EventContractDocument, PrintEventContractDocument, EventContractData } from '@/components/documents/event-contract-document'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import type { EventStatus, CreateBusinessEventDto, UpdateBusinessEventDto, BusinessEvent, BusinessConfig } from '@/types/finance'
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
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { ListaEventos } from '@/components/events/ListaEventos'

/* ────────────────────────────────────────────────────────────────────────────
   CONSTANTES UX
   ─────────────────────────────────────────────────────────────────────────── */
const TABS = [
  { key: 'upcoming' as const, label: 'Próximos', short: 'Próx.', icon: Clock },
  { key: 'finished' as const, label: 'Terminados', short: 'Fin.', icon: CheckCircle2 },
  { key: 'cancelled' as const, label: 'Cancelados', short: 'Canc.', icon: XCircle },
  { key: 'all' as const, label: 'Todos', short: 'Todos', icon: Filter },
] as const

const STATUS_CYCLE: EventStatus[] = ['pending', 'delivered', 'collected', 'cancelled']

const STATUS_META: Record<EventStatus, { label: string; bg: string; text: string; border: string; icon: typeof Clock }> = {
  pending: { label: 'Pendiente', bg: 'bg-amber-50', text: 'text-amber-800', border: 'border-amber-200', icon: Clock },
  delivered: { label: 'Entregado', bg: 'bg-blue-50', text: 'text-blue-800', border: 'border-blue-200', icon: CheckCircle2 },
  collected: { label: 'Recogido', bg: 'bg-emerald-50', text: 'text-emerald-800', border: 'border-emerald-200', icon: CheckCircle2 },
  cancelled: { label: 'Cancelado', bg: 'bg-red-50', text: 'text-red-800', border: 'border-red-200', icon: XCircle },
}

/* ────────────────────────────────────────────────────────────────────────────
   COMPONENTE: EventosPage
   ─────────────────────────────────────────────────────────────────────────── */
export default function EventosPage() {
  const queryClient = useQueryClient()
  const [activeTab, setActiveTab] = useState<'upcoming' | 'finished' | 'cancelled' | 'all'>('upcoming')
  const [searchQuery, setSearchQuery] = useState('')

  /* ── Modal States ── */
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingEvent, setEditingEvent] = useState<BusinessEvent | null>(null)
  const [contractEvent, setContractEvent] = useState<BusinessEvent | null>(null)

  /* ── Form Fields ── */
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

  /* ── Queries ── */
  const { data: rawEvents = [], isLoading, isError } = useQuery({
    queryKey: ['businessEvents', activeTab, searchQuery],
    queryFn: () => financeApi.getBusinessEvents({ tab: activeTab, search: searchQuery }),
  })

  const { data: apiConfig } = useQuery({
    queryKey: ['businessConfig'],
    queryFn: () => financeApi.getConfig(),
  })
  const businessConfig: BusinessConfig = apiConfig || defaultBusinessConfig

  /* ── Normalize Events ── */
  const eventsList = useMemo<BusinessEvent[]>(() => {
    const list = Array.isArray(rawEvents) ? rawEvents : []
    return list
      .map((ev) => ({
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
      }))
      .sort((a, b) => +new Date(b.date || 0) - +new Date(a.date || 0))
  }, [rawEvents])

  /* ── Filter local ── */
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

  /* ── Mutations ── */
  const createMutation = useMutation({
    mutationFn: (dto: CreateBusinessEventDto) => financeApi.createBusinessEvent(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['businessEvents'] })
      toast.success('Evento agendado exitosamente')
      setIsFormOpen(false)
    },
    onError: (err: any) => {
      toast.error(err.message || 'Error al guardar el evento')
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
      toast.success('Estado actualizado')
    },
    onError: (err: any) => {
      toast.error(err.message || 'Error al actualizar el estado')
    },
  })

  /* ── Notes from localStorage ── */
  const [availableNotes, setAvailableNotes] = useState<any[]>([])
  useEffect(() => {
    try {
      const stored = localStorage.getItem('eventos_mendoza_notes')
      if (stored) setAvailableNotes(JSON.parse(stored))
    } catch {
      // ignore
    }
  }, [isFormOpen])

  /* ── Helpers ── */
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

  function cycleStatus(event: BusinessEvent) {
    const idx = STATUS_CYCLE.indexOf(event.status || 'pending')
    const next = STATUS_CYCLE[(idx + 1) % STATUS_CYCLE.length]
    statusMutation.mutate({ id: event.id, status: next })
  }

  /* ── Render ── */
  return (
    <div className="space-y-5 pb-16 sm:pb-12">
      {/* ═══════════════════════════════════════════════════════════════════
         HEADER
         ═══════════════════════════════════════════════════════════════════ */}
      <PageHeader
        title="Gestión de Eventos"
        description="Agenda, contratos y control de entregas en tiempo real."
        action={
          <Button
            onClick={openCreateModal}
            className="w-full sm:w-auto bg-violet-600 hover:bg-violet-700 active:bg-violet-800 text-white font-bold h-12 gap-2 shadow-sm shadow-violet-200 active:scale-[0.97] transition-all"
          >
            <Plus className="h-5 w-5" />
            <span className="hidden sm:inline">Nuevo Evento</span>
            <span className="sm:hidden">Nuevo</span>
          </Button>
        }
      />

      {/* ═══════════════════════════════════════════════════════════════════
         BÚSQUEDA + TABS
         ═══════════════════════════════════════════════════════════════════ */}
      <div className="space-y-3">
        {/* Buscador con botón limpiar */}
        <div className="relative">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-violet-400" />
          <Input
            value={searchQuery}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
            placeholder="Buscar evento, cliente o dirección..."
            className="h-12 pl-10 pr-10 border-violet-100 bg-white focus:border-violet-500 shadow-sm text-base"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-full hover:bg-violet-50 active:bg-violet-100 transition-colors"
              aria-label="Limpiar búsqueda"
            >
              <X className="h-4 w-4 text-violet-400" />
            </button>
          )}
        </div>

        {/* Tabs con indicador de scroll */}
        <div className="relative">
          <div className="flex overflow-x-auto gap-2 pb-1 no-scrollbar snap-x snap-mandatory">
            {TABS.map((tab) => {
              const count =
                tab.key === 'all'
                  ? eventsList.length
                  : tab.key === 'upcoming'
                    ? eventsList.filter((e) => e.status === 'pending' || e.status === 'delivered').length
                    : tab.key === 'finished'
                      ? eventsList.filter((e) => e.status === 'collected').length
                      : eventsList.filter((e) => e.status === 'cancelled').length

              const isActive = activeTab === tab.key
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={cn(
                    'snap-start flex items-center gap-1.5 shrink-0 rounded-full px-4 py-2.5 text-sm font-semibold transition-all duration-150',
                    'active:scale-95 min-h-[44px]',
                    isActive
                      ? 'bg-violet-600 text-white shadow-sm'
                      : 'bg-white text-violet-700 border border-violet-100 hover:bg-violet-50 active:bg-violet-100'
                  )}
                >
                  <tab.icon className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">{tab.label}</span>
                  <span className="sm:hidden">{tab.short}</span>
                  <span
                    className={cn(
                      'ml-1 text-[11px] px-1.5 py-0.5 rounded-full font-bold',
                      isActive ? 'bg-white/20 text-white' : 'bg-violet-100 text-violet-700'
                    )}
                  >
                    {count}
                  </span>
                </button>
              )
            })}
          </div>
          {/* Indicador de scroll en móvil */}
          <div className="sm:hidden absolute right-0 top-0 bottom-1 w-8 bg-gradient-to-l from-white to-transparent pointer-events-none" />
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════
         LISTA DE EVENTOS — CARDS REDISEÑADAS
         ═══════════════════════════════════════════════════════════════════ */}
      <ListaEventos
        filteredEvents={filteredEvents}
        STATUS_META={STATUS_META}
        cycleStatus={cycleStatus}
        setContractEvent={setContractEvent}
        openEditModal={openEditModal}
        isLoading={isLoading}
        activeTab={activeTab}
      />

      {/* ═══════════════════════════════════════════════════════════════════
         MODAL: CREAR / EDITAR EVENTO
         ═══════════════════════════════════════════════════════════════════ */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="w-[95vw] max-w-lg max-h-[92vh] overflow-y-auto p-4 sm:p-6 border-violet-100 bg-white">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-violet-950">
              {editingEvent ? 'Editar Evento' : 'Nuevo Evento'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-5 pt-2">
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
            <div className="pt-4 flex flex-col-reverse sm:flex-row justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => setIsFormOpen(false)}
                className="h-12 border-violet-100 text-base font-semibold active:scale-[0.97] transition-all"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleFormSubmit}
                disabled={createMutation.isPending || updateMutation.isPending}
                className="h-12 bg-violet-600 hover:bg-violet-700 active:bg-violet-800 text-white font-bold px-8 text-base active:scale-[0.97] transition-all"
              >
                {(createMutation.isPending || updateMutation.isPending) && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                {editingEvent ? 'Guardar Cambios' : 'Agendar Evento'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* ═══════════════════════════════════════════════════════════════════
         MODAL: CONTRATO / EXPORTACIÓN
         ═══════════════════════════════════════════════════════════════════ */}
      <Dialog open={contractEvent !== null} onOpenChange={(o) => !o && setContractEvent(null)}>
        <DialogContent
          onPointerDownOutside={(e) => e.preventDefault()}
          onInteractOutside={(e) => e.preventDefault()}
          className="w-[95vw] max-w-4xl max-h-[92vh] overflow-y-auto p-3 sm:p-6 border-violet-100 bg-white"
        >
          <DialogHeader>
            <DialogTitle className="text-lg sm:text-xl font-bold text-violet-950">
              Contrato {contractEvent?.folio}
            </DialogTitle>
          </DialogHeader>

          {contractEvent && (
            <div className="space-y-4 pt-2">
              <DocumentActions
                filename={`contrato-evento-${contractEvent.folio}`}
                exportNode={
                  <PrintEventContractDocument
                    event={contractEvent as EventContractData}
                    business={businessConfig}
                  />
                }
              >
                <EventContractDocument
                  event={contractEvent as EventContractData}
                  business={businessConfig}
                />
              </DocumentActions>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}