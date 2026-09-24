// app/tools/eventos/page.tsx
'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { Plus } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { financeApi } from '@/lib/api/finance'
import { defaultBusinessConfig } from '@/lib/config'
import { normalizeSearch, parseDate, toNumber } from '@/lib/display'
import { PageHeader } from '@/components/admin/page-header'
import { EventDetailSheet } from '@/components/events/EventDetailSheet'
import { ListaEventos } from '@/components/events/ListaEventos'
import { EventTabs, type TabKey } from '@/components/events/EventTabs'
import { Button } from '@/components/ui/button'
import { MobileFab } from '@/components/ui/mobile-fab'
import { SearchInput } from '@/components/ui/search-input'
import type { BusinessConfig, BusinessEvent, EventStatus } from '@/types/finance'

/* ─── Reglas de negocio ─────────────────────────────────────────────────── */

const TAB_STATUSES: Record<TabKey, readonly string[]> = {
  upcoming: ['pending', 'delivered'],
  finished: ['collected'],
  cancelled: ['cancelled'],
}

const KNOWN_STATUSES = new Set(['pending', 'delivered', 'collected', 'cancelled'])

/** Normaliza un evento de la API. Sin datos inventados: lo que falta se queda vacío. */
function normalizeEvent(ev: BusinessEvent): BusinessEvent {
  const id = String(ev.id)
  return {
    ...ev,
    id,
    folio: ev.folio || `EV-${id.slice(0, 4)}`,
    name: ev.name || ev.serviceDescription || 'Evento sin nombre',
    serviceDescription: ev.serviceDescription || ev.name || 'Renta de mobiliario',
    cost: toNumber(ev.cost),
    // Vacía en lugar de "hoy": la vista muestra "Por definir"
    date: ev.eventDate || ev.date || '',
    clientName: ev.clientName || 'Sin cliente',
    clientPhone: ev.clientPhone || '',
    // Vacía en lugar de "Dirección por definir": así no aparece "Ver en el mapa" con ese texto
    eventAddress: ev.eventAddress || '',
    status: (KNOWN_STATUSES.has(String(ev.status)) ? ev.status : 'pending') as EventStatus,
  }
}

const dateValue = (e: BusinessEvent) => parseDate(e.date, { dateOnly: true })?.getTime() ?? null

/** Ordena por fecha; los eventos sin fecha siempre al final. */
function sortByDate(list: BusinessEvent[], direction: 'asc' | 'desc'): BusinessEvent[] {
  return [...list].sort((a, b) => {
    const da = dateValue(a)
    const db = dateValue(b)
    if (da === null && db === null) return 0
    if (da === null) return 1
    if (db === null) return -1
    return direction === 'asc' ? da - db : db - da
  })
}

/* ─── Página ────────────────────────────────────────────────────────────── */

export default function EventosPage() {
  const [activeTab, setActiveTab] = useState<TabKey>('upcoming')
  const [searchQuery, setSearchQuery] = useState('')
  const [detailEvent, setDetailEvent] = useState<BusinessEvent | null>(null)

  // Todos los eventos en una sola consulta; pestañas y búsqueda se resuelven aquí
  const { data: rawEvents, isLoading, isError, refetch } = useQuery({
    queryKey: ['businessEvents'],
    queryFn: () => financeApi.getBusinessEvents(),
  })

  const { data: apiConfig } = useQuery({
    queryKey: ['businessConfig'],
    queryFn: () => financeApi.getConfig(),
  })
  const businessConfig: BusinessConfig = apiConfig || defaultBusinessConfig

  const events = useMemo<BusinessEvent[]>(
    () => (Array.isArray(rawEvents) ? rawEvents.map(normalizeEvent) : []),
    [rawEvents]
  )

  // Texto de búsqueda precalculado por evento (sin acentos) y teléfono solo en dígitos
  const searchIndex = useMemo(() => {
    const index = new Map<string, { text: string; phone: string }>()
    for (const e of events) {
      index.set(String(e.id), {
        text: normalizeSearch(
          [e.name, e.clientName, e.eventAddress, e.folio, e.serviceDescription].filter(Boolean).join(' ')
        ),
        phone: (e.clientPhone ?? '').replace(/\D/g, ''),
      })
    }
    return index
  }, [events])

  const tabCounts = useMemo(() => {
    const counts: Record<TabKey, number> = { upcoming: 0, finished: 0, cancelled: 0 }
    for (const e of events) {
      for (const tab of Object.keys(TAB_STATUSES) as TabKey[]) {
        if (TAB_STATUSES[tab].includes(String(e.status))) counts[tab]++
      }
    }
    return counts
  }, [events])

  const query = normalizeSearch(searchQuery.trim())
  const searching = query.length > 0

  const visibleEvents = useMemo(() => {
    if (searching) {
      const qDigits = query.replace(/\D/g, '')
      const matches = events.filter((e) => {
        const entry = searchIndex.get(String(e.id))
        if (!entry) return false
        return entry.text.includes(query) || (qDigits.length >= 3 && entry.phone.includes(qDigits))
      })
      return sortByDate(matches, 'desc')
    }

    const inTab = events.filter((e) => TAB_STATUSES[activeTab].includes(String(e.status)))
    // Próximos: el más cercano primero. Terminados y cancelados: el más reciente primero.
    return sortByDate(inTab, activeTab === 'upcoming' ? 'asc' : 'desc')
  }, [events, searchIndex, searching, query, activeTab])

  const resultCount = visibleEvents.length

  return (
    <div className="space-y-8 pb-28 sm:pb-8">
      <PageHeader
        title="Eventos"
        description="Agenda y control de entregas."
        action={
          <Button asChild className="hidden sm:inline-flex">
            <Link href="/tools/eventos/crear-evento">
              <Plus aria-hidden />
              Nuevo evento
            </Link>
          </Button>
        }
      />

      <section aria-label="Búsqueda y filtros" className="space-y-3">
        <SearchInput
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Buscar por cliente, dirección o teléfono"
        />

        {/* Mismo alto que las pestañas para que la pantalla no brinque al escribir */}
        {searching ? (
          <p role="status" className="flex h-12 items-center text-[15px] text-muted-foreground">
            {resultCount === 0
              ? 'Ningún evento coincide con tu búsqueda'
              : `${resultCount} ${resultCount === 1 ? 'resultado' : 'resultados'} en todos los eventos`}
          </p>
        ) : (
          <EventTabs activeTab={activeTab} onTabChange={setActiveTab} tabCounts={tabCounts} />
        )}
      </section>

      <section aria-label="Lista de eventos">
        {isError ? (
          <div className="flex items-center justify-between gap-3 rounded-xl border px-4 py-3">
            <p className="text-[15px] text-muted-foreground">
              No se pudieron cargar tus eventos. Revisa tu conexión.
            </p>
            <Button variant="outline" onClick={() => refetch()}>
              Reintentar
            </Button>
          </div>
        ) : searching && resultCount === 0 ? null : (
          <ListaEventos
            filteredEvents={visibleEvents}
            isLoading={isLoading}
            activeTab={activeTab}
            onSelectEvent={setDetailEvent}
          />
        )}
      </section>

      <MobileFab href="/tools/eventos/crear-evento" aria-label="Nuevo evento" title="Nuevo evento" />

      <EventDetailSheet
        event={detailEvent}
        open={detailEvent !== null}
        onOpenChange={(isOpen) => !isOpen && setDetailEvent(null)}
        businessConfig={businessConfig}
        // Lo que devuelve la API viene sin normalizar
        onUpdate={(updatedEvent) => setDetailEvent(normalizeEvent(updatedEvent))}
      />
    </div>
  )
}