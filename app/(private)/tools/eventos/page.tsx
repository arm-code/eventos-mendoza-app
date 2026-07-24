'use client'

import { useState, useMemo, useEffect, ChangeEvent } from 'react'
import { useRouter } from 'next/navigation'
import {
  Plus, Search, Calendar, MapPin, User, Phone, FileText, Edit2,
  CheckCircle2, Clock, XCircle, Loader2, X, Filter, Eye
} from 'lucide-react'
import { toast } from 'sonner'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { financeApi } from '@/lib/api/finance'
import { formatCurrency, formatDate } from '@/lib/format'
import { defaultBusinessConfig } from '@/lib/config'
import { useIsMobile } from '@/hooks/useIsMobile'
import { PageHeader } from '@/components/admin/page-header'
import { EventDetailSheet } from '@/components/events/EventDetailSheet'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import type { EventStatus, BusinessEvent, BusinessConfig } from '@/types/finance'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'

/* ────────────────────────────────────────────────────────────────────────────
   CONSTANTES UX
   ─────────────────────────────────────────────────────────────────────────── */
const TABS = [
  { key: 'upcoming' as const, label: 'Próximos', short: 'Próx.', icon: Clock },
  { key: 'finished' as const, label: 'Terminados', short: 'Fin.', icon: CheckCircle2 },
  { key: 'cancelled' as const, label: 'Cancelados', short: 'Canc.', icon: XCircle },
  { key: 'all' as const, label: 'Todos', short: 'Todos', icon: Filter },
] as const

const STATUS_META: Record<EventStatus, {
  label: string
  shortLabel: string
  bg: string
  text: string
  border: string
  icon: typeof Clock
  dot: string
}> = {
  pending: {
    label: 'Pendiente', shortLabel: 'Pend.',
    bg: 'bg-amber-50', text: 'text-amber-800', border: 'border-amber-200',
    icon: Clock, dot: 'bg-amber-500'
  },
  delivered: {
    label: 'Entregado', shortLabel: 'Entr.',
    bg: 'bg-blue-50', text: 'text-blue-800', border: 'border-blue-200',
    icon: CheckCircle2, dot: 'bg-blue-500'
  },
  collected: {
    label: 'Recogido', shortLabel: 'Rec.',
    bg: 'bg-emerald-50', text: 'text-emerald-800', border: 'border-emerald-200',
    icon: CheckCircle2, dot: 'bg-emerald-500'
  },
  cancelled: {
    label: 'Cancelado', shortLabel: 'Canc.',
    bg: 'bg-red-50', text: 'text-red-800', border: 'border-red-200',
    icon: XCircle, dot: 'bg-red-500'
  },
}

/* ────────────────────────────────────────────────────────────────────────────
   COMPONENTE: EventosPage (Listado)
   ─────────────────────────────────────────────────────────────────────────── */
export default function EventosPage() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const isMobile = useIsMobile()

  const [activeTab, setActiveTab] = useState<'upcoming' | 'finished' | 'cancelled' | 'all'>('upcoming')
  const [searchQuery, setSearchQuery] = useState('')
  const [detailEvent, setDetailEvent] = useState<BusinessEvent | null>(null)

  /* ── Queries ── */
  const { data: rawEvents = [], isLoading } = useQuery({
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

  /* ── Status mutation (para cambio rápido desde card) ── */
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

  /* ── Quick status advance (solo en cards) ── */
  function quickAdvanceStatus(evt: BusinessEvent, e: React.MouseEvent) {
    e.stopPropagation()
    const flow: EventStatus[] = ['pending', 'delivered', 'collected']
    const idx = flow.indexOf(evt.status || 'pending')
    if (idx >= 0 && idx < flow.length - 1) {
      statusMutation.mutate({ id: evt.id, status: flow[idx + 1] })
    }
  }

  return (
    <div className="space-y-4 pb-6 sm:pb-12">
      {/* ═══════════════════════════════════════════════════════════════════
         HEADER (sin botón de acción — el FAB lo reemplaza en móvil)
         ═══════════════════════════════════════════════════════════════════ */}
      <PageHeader
        title="Gestión de Eventos"
        description="Agenda, contratos y control de entregas."
        action={
          !isMobile ? (
            <Button
              onClick={() => router.push('/tools/eventos/crear-evento')}
              className="bg-violet-600 hover:bg-violet-700 active:bg-violet-800 text-white font-bold h-11 gap-2 shadow-sm shadow-violet-200 active:scale-[0.97] transition-all rounded-xl"
            >
              <Plus className="h-5 w-5" />
              Nuevo Evento
            </Button>
          ) : undefined
        }
      />

      {/* ═══════════════════════════════════════════════════════════════════
         BÚSQUEDA + TABS
         ═══════════════════════════════════════════════════════════════════ */}
      <div className="space-y-3">
        {/* Buscador */}
        <div className="relative">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-violet-400" />
          <Input
            value={searchQuery}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
            placeholder="Buscar evento, cliente o dirección..."
            className="h-12 pl-10 pr-10 border-violet-100 bg-white focus:border-violet-500 shadow-sm text-base rounded-xl"
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

        {/* Tabs con contador y scroll hint */}
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
          <div className="sm:hidden absolute right-0 top-0 bottom-1 w-8 bg-gradient-to-l from-white to-transparent pointer-events-none" />
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════
         LISTA DE EVENTOS — CARDS MINIMALISTAS
         ═══════════════════════════════════════════════════════════════════ */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <AnimatePresence mode="popLayout">
          {filteredEvents.map((evt) => {
            const meta = STATUS_META[evt.status || 'pending']
            const StatusIcon = meta.icon
            const canAdvance = evt.status === 'pending' || evt.status === 'delivered'

            return (
              <motion.div
                key={evt.id}
                layout
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ duration: 0.2 }}
              >
                <Card
                  className="border-violet-100/70 bg-white shadow-sm hover:shadow-md hover:border-violet-200 transition-all duration-200 overflow-hidden cursor-pointer active:scale-[0.99]"
                  onClick={() => setDetailEvent(evt)}
                >
                  <CardContent className="p-0">
                    {/* ── Color strip según status ── */}
                    <div className={cn('h-1 w-full', meta.dot)} />

                    <div className="p-4 space-y-3">
                      {/* Header: Folio + Status */}
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="text-[10px] font-bold text-violet-400 tracking-wider uppercase">
                            {evt.folio}
                          </p>
                          <h3 className="font-bold text-violet-950 text-[15px] leading-tight truncate mt-0.5">
                            {evt.name}
                          </h3>
                        </div>
                        <div className={cn('shrink-0 flex items-center gap-1 px-2 py-1 rounded-md border', meta.bg, meta.text, meta.border)}>
                          <StatusIcon className="w-3 h-3" />
                          <span className="text-[10px] font-bold hidden sm:inline">{meta.label}</span>
                        </div>
                      </div>

                      {/* Info minimalista: Cliente + Fecha + Costo */}
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2 text-[13px] text-violet-900">
                          <User className="w-3.5 h-3.5 text-violet-400 shrink-0" />
                          <span className="font-semibold truncate">{evt.clientName}</span>
                        </div>
                        <div className="flex items-center gap-2 text-[12px] text-violet-600">
                          <Calendar className="w-3.5 h-3.5 text-violet-400 shrink-0" />
                          <span>{evt.date ? formatDate(evt.date) : 'Por definir'}</span>
                        </div>
                        <div className="flex items-start gap-2 text-[12px] text-violet-500">
                          <MapPin className="w-3.5 h-3.5 text-violet-400 shrink-0 mt-0.5" />
                          <span className="line-clamp-1">{evt.eventAddress}</span>
                        </div>
                      </div>

                      {/* Footer: Costo + Acciones */}
                      <div className="flex items-center justify-between pt-2 border-t border-violet-50">
                        <span className="text-lg font-bold text-violet-950">
                          {formatCurrency(evt.cost || 0)}
                        </span>

                        <div className="flex items-center gap-2">
                          {/* Botón avance rápido de estado (solo si aplica) */}
                          {canAdvance && (
                            <button
                              onClick={(e) => quickAdvanceStatus(evt, e)}
                              disabled={statusMutation.isPending}
                              className={cn(
                                'flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-bold border transition-all',
                                'active:scale-90 touch-manipulation',
                                evt.status === 'pending'
                                  ? 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100'
                                  : 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                              )}
                              title={evt.status === 'pending' ? 'Marcar como Entregado' : 'Marcar como Recogido'}
                            >
                              {statusMutation.isPending ? (
                                <Loader2 className="w-3 h-3 animate-spin" />
                              ) : (
                                <CheckCircle2 className="w-3 h-3" />
                              )}
                              <span className="hidden sm:inline">
                                {evt.status === 'pending' ? 'Entregar' : 'Recoger'}
                              </span>
                            </button>
                          )}

                          {/* Botón Ver Detalles */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              setDetailEvent(evt)
                            }}
                            className={cn(
                              'flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold',
                              'bg-violet-600 text-white hover:bg-violet-700 active:bg-violet-800',
                              'active:scale-90 transition-all shadow-sm'
                            )}
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">Ver Detalles</span>
                            <span className="sm:hidden">Detalles</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )
          })}
        </AnimatePresence>

        {filteredEvents.length === 0 && (
          <Card className="col-span-full border-violet-100 bg-white p-8 text-center">
            {isLoading ? (
              <div className="flex items-center justify-center gap-2 text-violet-600 font-semibold py-4">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Cargando eventos...</span>
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-3"
              >
                <Calendar className="w-12 h-12 text-violet-300 mx-auto opacity-60" />
                <p className="text-violet-900 font-bold text-base">
                  No hay eventos {activeTab !== 'all' ? 'en esta categoría' : 'guardados'}.
                </p>
                <p className="text-sm text-violet-500">
                  Presiona el botón + para agendar el primer servicio.
                </p>
              </motion.div>
            )}
          </Card>
        )}
      </div>

      {/* ═══════════════════════════════════════════════════════════════════
         FAB (Floating Action Button) — Móvil únicamente
         Posicionado por encima del bottom nav (bottom-20 = 5rem = 80px)
         El bottom nav tiene 56px + safe-area, así que 80px da margen cómodo.
         ═══════════════════════════════════════════════════════════════════ */}
      {isMobile && (
        <motion.button
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => router.push('/tools/eventos/crear-evento')}
          className={cn(
            'fixed right-4 z-40 flex items-center justify-center',
            'h-14 w-14 rounded-full bg-violet-600 text-white',
            'shadow-xl shadow-violet-600/30',
            'hover:bg-violet-700 active:bg-violet-800',
            'transition-colors duration-150',
            'bottom-20' /* 80px — justo por encima del bottom nav (56px) */
          )}
          aria-label="Nuevo Evento"
        >
          <Plus className="h-6 w-6" strokeWidth={2.5} />
        </motion.button>
      )}

      {/* ═══════════════════════════════════════════════════════════════════
         SHEET / DIALOG DE DETALLES
         ═══════════════════════════════════════════════════════════════════ */}
      <EventDetailSheet
        event={detailEvent}
        open={detailEvent !== null}
        onOpenChange={(o) => !o && setDetailEvent(null)}
        businessConfig={businessConfig}
      />
    </div>
  )
}