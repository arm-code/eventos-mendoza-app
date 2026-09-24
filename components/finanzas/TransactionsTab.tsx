// components/finanzas/TransactionsTab.tsx
'use client'

import { useMemo, useRef, useState } from 'react'
import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { Minus, Plus } from 'lucide-react'
import { financeApi } from '@/lib/api/finance'
import { formatCurrency } from '@/lib/format'
import { describeDate, parseDate, toLocalDateInput, toNumber } from '@/lib/display'
import { cn } from '@/lib/utils'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { LABEL, TOUCH } from '@/components/ui/detail'
import { EmptyState, InlineError, ListSkeleton } from '@/components/ui/states'
import { PaginationControls } from '@/components/ui/pagination-controls'
import { TransactionFormSheet } from '@/components/finanzas/TransactionFormSheet'

const PAGE_SIZE = 10

type TxType = 'INPUT' | 'OUTPUT'

interface Transaction {
  id: string
  type: TxType
  amount: number
  title: string
  subtitle: string
  date: string
}

interface PageMeta {
  page: number
  totalPages: number
  hasNextPage: boolean
  hasPreviousPage: boolean
}

/* ─── Normalización (datos de la API como no confiables) ───────────────── */

/** Lee una propiedad de un valor desconocido sin romper si no es objeto. */
const get = (obj: unknown, key: string): unknown =>
  obj && typeof obj === 'object' ? (obj as Record<string, unknown>)[key] : undefined

const str = (value: unknown) => (typeof value === 'string' ? value.trim() : '')

function toTransactions(data: unknown): Transaction[] {
  const items = (data as { items?: unknown })?.items
  if (!Array.isArray(items)) return []

  return items.flatMap<Transaction>((raw) => {
    if (!raw || typeof raw !== 'object') return []
    const category = str(get(get(raw, 'category'), 'name'))
    const method = str(get(get(raw, 'paymentMethod'), 'name'))
    const description = str(get(raw, 'description'))

    return [
      {
        id: String(get(raw, 'id')),
        type: get(raw, 'type') === 'INPUT' ? 'INPUT' : 'OUTPUT',
        amount: toNumber(get(raw, 'amount')),
        // Si hay nota, la nota es el título y la categoría pasa a la segunda línea
        title: description || category || 'Movimiento',
        subtitle: [description ? category : '', method].filter(Boolean).join(' · '),
        date: str(get(raw, 'transactionDate')),
      },
    ]
  })
}

function toMeta(data: unknown): PageMeta {
  const m = (data as { meta?: Record<string, unknown> })?.meta ?? {}
  return {
    page: toNumber(m.page) || 1,
    totalPages: toNumber(m.totalPages) || 1,
    hasNextPage: Boolean(m.hasNextPage),
    hasPreviousPage: Boolean(m.hasPreviousPage),
  }
}

/** Agrupa por día conservando el orden que manda la API. */
function groupByDay(list: Transaction[]) {
  const groups: { key: string; label: string; items: Transaction[] }[] = []
  for (const tx of list) {
    const date = parseDate(tx.date, { dateOnly: true })
    const key = date ? toLocalDateInput(date) : 'sin-fecha'
    let group = groups.find((g) => g.key === key)
    if (!group) {
      const info = describeDate(tx.date, { dateOnly: true })
      const label = info ? (Math.abs(info.days) <= 1 ? info.relative : info.label) : 'Sin fecha'
      group = { key, label, items: [] }
      groups.push(group)
    }
    group.items.push(tx)
  }
  return groups
}

/* ─── Componente ────────────────────────────────────────────────────────── */

export default function TransactionsTab() {
  const [formType, setFormType] = useState<TxType | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const listTopRef = useRef<HTMLHeadingElement>(null)

  const summaryQuery = useQuery({
    queryKey: ['transactionsSummary'],
    queryFn: () => financeApi.getSummary(),
  })

  const listQuery = useQuery({
    queryKey: ['transactions', currentPage, PAGE_SIZE],
    queryFn: () => financeApi.getTransactions(currentPage, PAGE_SIZE),
    placeholderData: keepPreviousData, // la lista no parpadea al cambiar de página
  })

  const transactions = useMemo(() => toTransactions(listQuery.data), [listQuery.data])
  const groups = useMemo(() => groupByDay(transactions), [transactions])
  const meta = toMeta(listQuery.data)

  const goToPage = (page: number) => {
    setCurrentPage(page)
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    listTopRef.current?.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' })
  }

  return (
    <div className="space-y-8">
      {/* Resumen + acciones principales */}
      <section aria-label="Resumen de dinero" className="space-y-3">
        {summaryQuery.isLoading ? (
          <SummarySkeleton />
        ) : summaryQuery.isError ? (
          <InlineError message="No se pudo cargar tu resumen." onRetry={() => summaryQuery.refetch()} />
        ) : (
          <SummaryCard
            balance={toNumber(summaryQuery.data?.balance)}
            inputs={toNumber(summaryQuery.data?.totalInputs)}
            outputs={toNumber(summaryQuery.data?.totalOutputs)}
          />
        )}

        <div className="grid grid-cols-2 gap-2">
          <Button variant="outline" className={cn(TOUCH, 'text-base')} onClick={() => setFormType('INPUT')}>
            <Plus className="text-success" aria-hidden />
            Registrar entrada
          </Button>
          <Button variant="outline" className={cn(TOUCH, 'text-base')} onClick={() => setFormType('OUTPUT')}>
            <Minus className="text-destructive" aria-hidden />
            Registrar salida
          </Button>
        </div>
      </section>

      {/* Movimientos */}
      <section aria-labelledby="transactions-title" className="scroll-mt-4 space-y-4">
        <h2 id="transactions-title" ref={listTopRef} className="scroll-mt-4 text-base font-semibold">
          Últimos movimientos
        </h2>

        {listQuery.isLoading ? (
          <ListSkeleton label="Cargando movimientos" />
        ) : listQuery.isError ? (
          <InlineError message="No se pudieron cargar tus movimientos." onRetry={() => listQuery.refetch()} />
        ) : transactions.length === 0 ? (
          <EmptyState
            title="Aún no hay movimientos"
            description="Usa los botones de arriba para anotar lo que entra y sale de tu negocio."
          />
        ) : (
          <div
            className={cn('space-y-6 transition-opacity', listQuery.isPlaceholderData && 'opacity-60')}
            aria-busy={listQuery.isPlaceholderData}
          >
            {groups.map((group) => (
              <div key={group.key} className="space-y-2">
                <h3 className={LABEL}>{group.label}</h3>
                <Card className="gap-0 overflow-hidden py-0">
                  <ul className="divide-y">
                    {group.items.map((tx) => (
                      <TransactionRow key={tx.id} tx={tx} />
                    ))}
                  </ul>
                </Card>
              </div>
            ))}

            <PaginationControls
              currentPage={meta.page}
              totalPages={meta.totalPages}
              onPageChange={goToPage}
              hasNextPage={meta.hasNextPage}
              hasPreviousPage={meta.hasPreviousPage}
            />
          </div>
        )}
      </section>

      <TransactionFormSheet
        open={formType !== null}
        onOpenChange={(open) => !open && setFormType(null)}
        defaultType={formType ?? 'INPUT'}
      />
    </div>
  )
}

/* ─── Subcomponentes ────────────────────────────────────────────────────── */

function TransactionRow({ tx }: { tx: Transaction }) {
  const isInput = tx.type === 'INPUT'
  return (
    <li className="flex min-h-16 items-center gap-3 px-4 py-3">
      <div className="min-w-0 flex-1">
        <p className="truncate text-base font-medium">{tx.title}</p>
        {tx.subtitle && <p className="truncate text-[15px] text-muted-foreground">{tx.subtitle}</p>}
      </div>
      <p className={cn('shrink-0 text-base font-semibold tabular-nums', isInput && 'text-success')}>
        <span className="sr-only">{isInput ? 'Entró' : 'Salió'} </span>
        <span aria-hidden>{isInput ? '+' : '−'}</span>
        {formatCurrency(tx.amount)}
      </p>
    </li>
  )
}

function SummaryCard({ balance, inputs, outputs }: { balance: number; inputs: number; outputs: number }) {
  return (
    <Card className="gap-0 py-0">
      <div className="p-5">
        <p className="text-sm text-muted-foreground">Te queda</p>
        <p className={cn('mt-1 text-4xl font-semibold tracking-tight tabular-nums', balance < 0 && 'text-destructive')}>
          {formatCurrency(balance)}
        </p>
      </div>
      <dl className="grid grid-cols-2 border-t">
        <div className="px-5 py-4">
          <dt className="flex items-center gap-2 text-sm text-muted-foreground">
            <span className="size-2 rounded-full bg-success" aria-hidden />
            Entró
          </dt>
          <dd className="mt-1 text-lg font-medium tabular-nums">{formatCurrency(inputs)}</dd>
        </div>
        <div className="border-l px-5 py-4">
          <dt className="flex items-center gap-2 text-sm text-muted-foreground">
            <span className="size-2 rounded-full bg-destructive" aria-hidden />
            Salió
          </dt>
          <dd className="mt-1 text-lg font-medium tabular-nums">{formatCurrency(outputs)}</dd>
        </div>
      </dl>
    </Card>
  )
}

function SummarySkeleton() {
  return (
    <Card className="gap-0 py-0" aria-busy="true" aria-label="Cargando resumen">
      <div className="space-y-2 p-5">
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-10 w-44" />
      </div>
      <div className="grid grid-cols-2 border-t">
        <div className="space-y-2 px-5 py-4">
          <Skeleton className="h-4 w-14" />
          <Skeleton className="h-6 w-24" />
        </div>
        <div className="space-y-2 border-l px-5 py-4">
          <Skeleton className="h-4 w-14" />
          <Skeleton className="h-6 w-24" />
        </div>
      </div>
    </Card>
  )
}