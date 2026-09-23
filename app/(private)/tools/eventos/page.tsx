'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { Plus } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { financeApi } from '@/lib/api/finance'
import { defaultBusinessConfig } from '@/lib/config'
import { PageHeader } from '@/components/admin/page-header'
import { EventDetailSheet } from '@/components/events/EventDetailSheet'
import { ListaEventos } from '@/components/events/ListaEventos'
import { EventTabs, type TabKey } from '@/components/events/EventTabs'
import { Button } from '@/components/ui/button'
import { MobileFab } from '@/components/ui/mobile-fab'
import { SearchInput } from '@/components/ui/search-input'
import type { EventStatus, BusinessEvent, BusinessConfig } from '@/types/finance'
import { cn } from '@/lib/utils'

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

        <EventTabs
          activeTab={activeTab}
          onTabChange={setActiveTab}
          tabCounts={tabCounts}
        />
      </section>

      <section aria-label="Lista de eventos">
        <ListaEventos
          filteredEvents={filteredEvents}
          isLoading={isLoading}
          activeTab={activeTab}
          onSelectEvent={setDetailEvent}
        />
      </section>

      <MobileFab
        href="/tools/eventos/crear-evento"
        aria-label="Nuevo evento"
      />

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