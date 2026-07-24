'use client'

import { useState, useMemo, useEffect, ChangeEvent } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Search, Clock, CheckCircle2, XCircle, X, Filter } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { financeApi } from '@/lib/api/finance'
import { defaultBusinessConfig } from '@/lib/config'
import { useIsMobile } from '@/hooks/useIsMobile'
import { PageHeader } from '@/components/admin/page-header'
import { EventDetailSheet } from '@/components/events/EventDetailSheet'
import { ListaEventos } from '@/components/events/ListaEventos'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import type { EventStatus, BusinessEvent, BusinessConfig } from '@/types/finance'
import { motion } from 'framer-motion'
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



/* ────────────────────────────────────────────────────────────────────────────
   COMPONENTE: EventosPage (Listado)
   ─────────────────────────────────────────────────────────────────────────── */
export default function EventosPage() {
  const router = useRouter()
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
      <ListaEventos
        filteredEvents={filteredEvents}
        isLoading={isLoading}
        activeTab={activeTab}
        onSelectEvent={setDetailEvent}
      />

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