'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { Plus, CheckCircle2, XCircle, Filter, Clock } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { financeApi } from '@/lib/api/finance'
import { defaultBusinessConfig } from '@/lib/config'
import { PageHeader } from '@/components/admin/page-header'
import { EventDetailSheet } from '@/components/events/EventDetailSheet'
import { ListaEventos } from '@/components/events/ListaEventos'
import { Button } from '@/components/ui/button'
import { SearchInput } from '@/components/ui/search-input'
import type { EventStatus, BusinessEvent, BusinessConfig } from '@/types/finance'
import { cn } from '@/lib/utils'

const TABS = [
  { key: 'upcoming' as const, label: 'Próximos', short: 'Próx.', icon: Clock },
  { key: 'finished' as const, label: 'Terminados', short: 'Fin.', icon: CheckCircle2 },
  { key: 'cancelled' as const, label: 'Cancelados', short: 'Canc.', icon: XCircle },
  { key: 'all' as const, label: 'Todos', short: 'Todos', icon: Filter },
] as const

type TabKey = typeof TABS[number]['key']

export default function EventosPage() {
  const [activeTab, setActiveTab] = useState<TabKey>('upcoming')
  const [searchQuery, setSearchQuery] = useState('')
  const [detailEvent, setDetailEvent] = useState<BusinessEvent | null>(null)

  const { data: rawEvents = [], isLoading } = useQuery({
    queryKey: ['businessEvents', activeTab, searchQuery],
    queryFn: () => financeApi.getBusinessEvents({ tab: activeTab, search: searchQuery }),
  })

  const { data: apiConfig } = useQuery({
    queryKey: ['businessConfig'],
    queryFn: () => financeApi.getConfig(),
  })

  const businessConfig: BusinessConfig = apiConfig || defaultBusinessConfig

  const eventsList = useMemo<BusinessEvent[]>(() => {
    const list = Array.isArray(rawEvents) ? rawEvents : []
    return list
      .map((ev) => {
        const costVal = Number(ev.cost)
        return {
          ...ev,
          id: String(ev.id),
          folio: ev.folio || `EV-${String(ev.id).slice(0, 4)}`,
          name: ev.name || ev.serviceDescription || 'Evento sin nombre',
          serviceDescription: ev.serviceDescription || ev.name || 'Renta de mobiliario',
          cost: Number.isFinite(costVal) ? costVal : 0,
          date: ev.eventDate || ev.date || new Date().toISOString(),
          clientName: ev.clientName || 'Sin cliente',
          clientPhone: ev.clientPhone || '',
          eventAddress: ev.eventAddress || 'Dirección por definir',
          status: (ev.status as EventStatus) || 'pending',
        }
      })
      .sort((a, b) => {
        const dateA = a.date ? new Date(a.date).getTime() : 0
        const dateB = b.date ? new Date(b.date).getTime() : 0
        return dateB - dateA
      })
  }, [rawEvents])

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

  // Precálculo de contadores para no iterar múltiples veces dentro del render
  const tabCounts = useMemo(() => {
    return {
      upcoming: eventsList.filter((e) => e.status === 'pending' || e.status === 'delivered').length,
      finished: eventsList.filter((e) => e.status === 'collected').length,
      cancelled: eventsList.filter((e) => e.status === 'cancelled').length,
      all: eventsList.length,
    }
  }, [eventsList])

  return (
    <div className="space-y-8 pb-28 sm:pb-8">
      <PageHeader
        title="Eventos"
        description="Agenda y control de entregas."
        action={
          <Button asChild className="hidden h-11 gap-2 font-semibold sm:flex">
            <Link href="/tools/eventos/crear-evento">
              <Plus className="size-5" aria-hidden />
              Nuevo evento
            </Link>
          </Button>
        }
      />

      <section aria-label="Búsqueda y filtros" className="space-y-3">
        <SearchInput
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Buscar evento, cliente o dirección..."
          className="h-12 text-base"
        />

        <div className="relative">
          <div className="flex snap-x snap-mandatory gap-2 overflow-x-auto pb-1 no-scrollbar">
            {TABS.map((tab) => {
              const count = tabCounts[tab.key]
              const isActive = activeTab === tab.key

              return (
                <Button
                  key={tab.key}
                  variant={isActive ? 'default' : 'outline'}
                  onClick={() => setActiveTab(tab.key)}
                  className={cn(
                    'flex shrink-0 snap-start items-center gap-1.5 rounded-full px-4 text-sm font-medium transition-all duration-150',
                    'min-h-[44px] active:scale-95',
                    isActive ? 'shadow-sm' : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  <tab.icon className="size-3.5" aria-hidden />
                  <span className="hidden sm:inline">{tab.label}</span>
                  <span className="sm:hidden">{tab.short}</span>
                  <span
                    className={cn(
                      'ml-1 rounded-full px-1.5 py-0.5 text-xs font-semibold tabular-nums',
                      isActive ? 'bg-primary-foreground/20 text-primary-foreground' : 'bg-muted text-muted-foreground'
                    )}
                  >
                    {count}
                  </span>
                </Button>
              )
            })}
          </div>
          <div className="pointer-events-none absolute bottom-1 right-0 top-0 w-8 bg-gradient-to-l from-background to-transparent sm:hidden" aria-hidden="true" />
        </div>
      </section>

      <section aria-label="Lista de eventos">
        <ListaEventos
          filteredEvents={filteredEvents}
          isLoading={isLoading}
          activeTab={activeTab}
          onSelectEvent={setDetailEvent}
        />
      </section>

      <Link
        href="/tools/eventos/crear-evento"
        aria-label="Nuevo evento"
        className={cn(
          'fixed right-4 z-40 flex size-14 items-center justify-center rounded-full sm:hidden',
          'bottom-[calc(5rem+env(safe-area-inset-bottom))]',
          'bg-primary text-primary-foreground shadow-lg shadow-primary/25',
          'transition-transform active:scale-95 motion-reduce:transition-none',
          'outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50'
        )}
      >
        <Plus className="size-6" strokeWidth={2.5} aria-hidden />
      </Link>

      <EventDetailSheet
        event={detailEvent}
        open={detailEvent !== null}
        onOpenChange={(isOpen) => !isOpen && setDetailEvent(null)}
        businessConfig={businessConfig}
        onUpdate={(updatedEvent) => setDetailEvent(updatedEvent)}
      />
    </div>
  )
}