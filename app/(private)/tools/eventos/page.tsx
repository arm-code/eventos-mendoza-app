// app/tools/eventos/page.tsx
'use client'

import { useState, useMemo, ChangeEvent } from 'react'
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
    <div className="space-y-6 pb-28 sm:pb-8">
      {/* ═══════════════════════════════════════════════════════════════════
          HEADER
          ═══════════════════════════════════════════════════════════════════ */}
      <PageHeader
        title="Gestión de Eventos"
        description="Agenda, contratos y control de entregas."
        action={
          !isMobile ? (
            <Button
              onClick={() => router.push('/tools/eventos/crear-evento')}
              className="h-11 font-semibold gap-2"
            >
              <Plus className="size-5" aria-hidden />
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
        <div className="relative max-w-md">
          <Search className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
          <Input
            value={searchQuery}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
            placeholder="Buscar evento, cliente o dirección..."
            className="h-12 pl-10 pr-10 text-base"
          />
          {searchQuery && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSearchQuery('')}
              className="absolute right-1 top-1/2 size-10 -translate-y-1/2 rounded-full text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              aria-label="Limpiar búsqueda"
            >
              <X className="size-4" aria-hidden />
            </Button>
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
                <Button
                  key={tab.key}
                  variant={isActive ? 'default' : 'outline'}
                  onClick={() => setActiveTab(tab.key)}
                  className={cn(
                    'snap-start flex items-center gap-1.5 shrink-0 rounded-full px-4 text-sm font-medium transition-all duration-150',
                    'min-h-[44px] active:scale-95',
                    isActive ? 'shadow-sm' : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  <tab.icon className="size-3.5" aria-hidden />
                  <span className="hidden sm:inline">{tab.label}</span>
                  <span className="sm:hidden">{tab.short}</span>
                  <span
                    className={cn(
                      'ml-1 text-[11px] px-1.5 py-0.5 rounded-full font-bold',
                      isActive ? 'bg-primary-foreground/20 text-primary-foreground' : 'bg-muted text-muted-foreground'
                    )}
                  >
                    {count}
                  </span>
                </Button>
              )
            })}
          </div>
          <div className="sm:hidden absolute right-0 top-0 bottom-1 w-8 bg-gradient-to-l from-background to-transparent pointer-events-none" />
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════
          LISTA DE EVENTOS
          ═══════════════════════════════════════════════════════════════════ */}
      <ListaEventos
        filteredEvents={filteredEvents}
        isLoading={isLoading}
        activeTab={activeTab}
        onSelectEvent={setDetailEvent}
      />

      {/* ═══════════════════════════════════════════════════════════════════
          FAB (Floating Action Button) — Móvil únicamente
          ═══════════════════════════════════════════════════════════════════ */}
      {isMobile && (
        <button
          onClick={() => router.push('/tools/eventos/crear-evento')}
          className={cn(
            'fixed right-4 z-40 flex size-14 items-center justify-center rounded-full',
            'bottom-[calc(5rem+env(safe-area-inset-bottom))]',
            'bg-primary text-primary-foreground shadow-lg shadow-primary/25',
            'transition-transform active:scale-95',
            'outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50'
          )}
          aria-label="Nuevo Evento"
        >
          <Plus className="size-6" strokeWidth={2.5} aria-hidden />
        </button>
      )}

      {/* ═══════════════════════════════════════════════════════════════════
          SHEET / DIALOG DE DETALLES
          ═══════════════════════════════════════════════════════════════════ */}
      <EventDetailSheet
        event={detailEvent}
        open={detailEvent !== null}
        onOpenChange={(o) => !o && setDetailEvent(null)}
        businessConfig={businessConfig}
        onUpdate={(updatedEvent) => setDetailEvent(updatedEvent)}
      />
    </div>
  )
}