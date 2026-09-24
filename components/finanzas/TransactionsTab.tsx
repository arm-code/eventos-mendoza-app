// @/components/finanzas/TransactionsTab.tsx
'use client'

import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { ArrowLeftRight, RotateCw } from 'lucide-react'
import { financeApi } from '@/lib/api/finance'
import { formatCurrency } from '@/lib/format'
import { parseDate, toNumber } from '@/lib/display'
import { cn } from '@/lib/utils'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { MobileFab } from '@/components/ui/mobile-fab'
import { PaginationControls } from '@/components/ui/pagination-controls'
import { TransactionFormSheet } from '@/components/finanzas/TransactionFormSheet'

const dateFmt = new Intl.DateTimeFormat('es-MX', { day: 'numeric', month: 'short', year: 'numeric' })

/* ─── Pestaña Principal ─────────────────────────────────────────────────── */

export default function TransactionsTab() {
  const queryClient = useQueryClient()
  const [isOpen, setIsOpen] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const limit = 10

  const summaryQuery = useQuery({
    queryKey: ['transactionsSummary'],
    queryFn: () => financeApi.getSummary(),
  })

  const listQuery = useQuery({
    queryKey: ['transactions', currentPage, limit],
    queryFn: () => financeApi.getTransactions(currentPage, limit),
  })

  const transactions = Array.isArray(listQuery.data?.items) ? listQuery.data.items : []
  const meta = listQuery.data?.meta || { page: 1, limit: 10, totalPages: 1, hasNextPage: false, hasPreviousPage: false }

  const balance = toNumber(summaryQuery.data?.balance)
  const inputs = toNumber(summaryQuery.data?.totalInputs)
  const outputs = toNumber(summaryQuery.data?.totalOutputs)

  return (
    <div className="space-y-8">
      {/* Resumen */}
      <section aria-label="Resumen de dinero">
        {summaryQuery.isLoading ? (
          <SummarySkeleton />
        ) : summaryQuery.isError ? (
          <InlineError message="No se pudo cargar el resumen." onRetry={() => summaryQuery.refetch()} />
        ) : (
          <SummaryCard balance={balance} inputs={inputs} outputs={outputs} />
        )}
      </section>

      {/* Movimientos */}
      <section aria-labelledby="transactions-title" className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 id="transactions-title" className="text-base font-semibold">
            Movimientos
          </h2>
          <Button onClick={() => setIsOpen(true)} variant="outline" size="sm" className="hidden sm:inline-flex">
            Registrar movimiento
          </Button>
        </div>

        {listQuery.isLoading ? (
          <ListSkeleton />
        ) : listQuery.isError ? (
          <InlineError message="No se pudieron cargar los movimientos." onRetry={() => listQuery.refetch()} />
        ) : transactions.length === 0 ? (
          <Card className="items-center gap-3 px-6 py-10 text-center">
            <ArrowLeftRight className="size-8 text-muted-foreground/60" aria-hidden />
            <p className="font-medium">No tienes movimientos</p>
            <p className="text-sm text-muted-foreground">Registra tu primer ingreso o gasto.</p>
            <Button onClick={() => setIsOpen(true)} className="mt-2" variant="outline">
              Registrar movimiento
            </Button>
          </Card>
        ) : (
          <>
            <Card className="gap-0 overflow-hidden py-0">
              <ul className="divide-y">
                {transactions.map((tx: any) => {
                  const isInput = tx.type === 'INPUT'
                  const date = parseDate(tx.transactionDate, { dateOnly: true })

                  return (
                    <li key={tx.id} className="flex min-h-16 items-center gap-3 px-4 py-3 transition-colors hover:bg-accent/60">
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-base font-medium">
                          {tx.description || tx.category?.name || 'Movimiento'}
                        </p>
                        <p className="truncate text-[15px] text-muted-foreground">
                          {date ? dateFmt.format(date) : 'Sin fecha'} · {tx.paymentMethod?.name || 'Otro'}
                        </p>
                      </div>
                      <div
                        className={cn(
                          'shrink-0 text-base font-semibold tabular-nums',
                          isInput ? 'text-success' : 'text-foreground'
                        )}
                      >
                        {isInput ? '+' : '-'}{formatCurrency(toNumber(tx.amount))}
                      </div>
                    </li>
                  )
                })}
              </ul>
            </Card>

            {(meta.hasNextPage || meta.hasPreviousPage) && (
              <div className="pt-2">
                <PaginationControls
                  currentPage={meta.page}
                  totalPages={meta.totalPages}
                  onPageChange={setCurrentPage}
                  hasNextPage={meta.hasNextPage}
                  hasPreviousPage={meta.hasPreviousPage}
                />
              </div>
            )}
          </>
        )}
      </section>

      {/* FAB móvil */}
      <MobileFab onClick={() => setIsOpen(true)} title="Registrar" aria-label="Registrar movimiento" />
      {/* Formulario */}
      <TransactionFormSheet open={isOpen} onOpenChange={setIsOpen} />
    </div>
  )
}

/* ─── Subcomponentes ────────────────────────────────────────────────────── */

function SummaryCard({ balance, inputs, outputs }: { balance: number; inputs: number; outputs: number }) {
  return (
    <Card className="gap-0 py-0">
      <div className="p-5">
        <p className="text-sm text-muted-foreground">Balance</p>
        <p
          className={cn(
            'mt-1 text-4xl font-semibold tracking-tight tabular-nums',
            balance < 0 && 'text-destructive'
          )}
        >
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

function InlineError({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <Card className="flex-row items-center justify-between gap-3 px-5 py-4">
      <p className="text-sm text-muted-foreground">{message}</p>
      <Button variant="outline" size="sm" onClick={onRetry}>
        <RotateCw aria-hidden />
        Reintentar
      </Button>
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

function ListSkeleton() {
  return (
    <Card className="gap-0 py-0" aria-busy="true" aria-label="Cargando movimientos">
      <div className="divide-y">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex items-center justify-between gap-4 px-4 py-3">
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-3/5" />
              <Skeleton className="h-3.5 w-2/5" />
            </div>
            <Skeleton className="h-5 w-20" />
          </div>
        ))}
      </div>
    </Card>
  )
}