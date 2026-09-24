// components/finanzas/TransactionFormSheet.tsx
'use client'

import { useEffect, useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'

import { financeApi } from '@/lib/api/finance'
import { formatCurrency } from '@/lib/format'
import { describeDate, parseAmount, toLocalDateInput } from '@/lib/display'
import { cn } from '@/lib/utils'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { AppBottomSheet } from '@/components/ui/app-bottom-sheet'
import { LABEL, TOUCH } from '@/components/ui/detail'

/* ─── Tipos y catálogos ─────────────────────────────────────────────────── */

type TxType = 'INPUT' | 'OUTPUT'

interface CatalogItem {
  id: string
  name: string
  /** Si la categoría indica 'INPUT' u 'OUTPUT', solo se muestra para ese tipo. */
  type: string | null
}

const TX_TYPES: readonly { value: TxType; label: string; selected: string }[] = [
  {
    value: 'INPUT',
    label: 'Entró',
    selected: 'border-success bg-success/10 text-success hover:bg-success/15 hover:text-success',
  },
  {
    value: 'OUTPUT',
    label: 'Salió',
    selected: 'border-destructive bg-destructive/10 text-destructive hover:bg-destructive/15 hover:text-destructive',
  },
]

const VISIBLE_CATEGORIES = 6

/** Solo acepta elementos con id y nombre de texto; ignora lo demás. */
function toCatalog(data: unknown): CatalogItem[] {
  if (!Array.isArray(data)) return []
  const items: CatalogItem[] = []
  for (const raw of data) {
    if (!raw || typeof raw !== 'object') continue
    const { id, name, type } = raw as Record<string, unknown>
    if (typeof id === 'string' && typeof name === 'string') {
      items.push({ id, name, type: typeof type === 'string' ? type : null })
    }
  }
  return items
}

/* ─── Preferencias locales (solo ids, nada sensible) ────────────────────── */

const PREFS_KEY = 'tx-form-prefs:v1'

interface Prefs {
  paymentMethodId?: string
  recent?: Partial<Record<TxType, string[]>>
}

function readPrefs(): Prefs {
  try {
    const parsed: unknown = JSON.parse(localStorage.getItem(PREFS_KEY) ?? '{}')
    return parsed && typeof parsed === 'object' ? (parsed as Prefs) : {}
  } catch {
    return {}
  }
}

function rememberUse(type: TxType, categoryId: string, paymentMethodId: string) {
  try {
    const prefs = readPrefs()
    const recent = (prefs.recent?.[type] ?? []).filter((id) => id !== categoryId)
    const next: Prefs = {
      paymentMethodId,
      recent: { ...prefs.recent, [type]: [categoryId, ...recent].slice(0, VISIBLE_CATEGORIES) },
    }
    localStorage.setItem(PREFS_KEY, JSON.stringify(next))
  } catch {
    // Sin almacenamiento (modo privado): el formulario funciona igual, sin recordar
  }
}

/* ─── Validación ────────────────────────────────────────────────────────── */

const transactionSchema = yup.object({
  type: yup.string().oneOf(['INPUT', 'OUTPUT']).required('Elige si entró o salió dinero'),
  amount: yup
    .number()
    .transform((_, original) => parseAmount(original))
    .typeError('Escribe una cantidad, por ejemplo 150 o 150.50')
    .positive('La cantidad debe ser mayor a 0')
    .max(10_000_000, 'Revisa la cantidad, parece demasiado alta')
    .required('Escribe cuánto fue'),
  categoryId: yup.string().uuid('Elige una categoría').required('Elige una categoría'),
  paymentMethodId: yup.string().uuid('Elige cómo se pagó').required('Elige cómo se pagó'),
  transactionDate: yup.string().required('Elige la fecha'),
  description: yup.string().trim().max(255, 'Máximo 255 caracteres').optional(),
  businessEventId: yup.string().uuid().nullable().optional(),
})

type TransactionFormData = yup.InferType<typeof transactionSchema>

/* ─── Componente ────────────────────────────────────────────────────────── */

interface TransactionFormSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** Tipo con el que abre (ej. un botón "Registrar gasto" puede abrir en 'OUTPUT'). */
  defaultType?: TxType
}

export function TransactionFormSheet({ open, onOpenChange, defaultType = 'INPUT' }: TransactionFormSheetProps) {
  const queryClient = useQueryClient()
  const [prefs, setPrefs] = useState<Prefs>({})
  const [showAllCategories, setShowAllCategories] = useState(false)
  const [editingDate, setEditingDate] = useState(false)

  const categoriesQuery = useQuery({
    queryKey: ['transactionCategories'],
    queryFn: () => financeApi.getCategories(),
  })
  const methodsQuery = useQuery({
    queryKey: ['paymentMethods'],
    queryFn: () => financeApi.getPaymentMethods(),
  })

  const categories = useMemo(() => toCatalog(categoriesQuery.data), [categoriesQuery.data])
  const methods = useMemo(() => toCatalog(methodsQuery.data), [methodsQuery.data])

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(transactionSchema),
    defaultValues: { type: defaultType, transactionDate: toLocalDateInput(), businessEventId: null },
  })

  const type = watch('type') as TxType
  const categoryId = watch('categoryId')
  const paymentMethodId = watch('paymentMethodId')
  const transactionDate = watch('transactionDate')
  const amountValue = parseAmount(watch('amount'))

  // Cada vez que se abre: formulario limpio y preferencias frescas
  useEffect(() => {
    if (!open) return
    reset({ type: defaultType, transactionDate: toLocalDateInput(), businessEventId: null })
    setPrefs(readPrefs())
    setShowAllCategories(false)
    setEditingDate(false)
  }, [open, defaultType, reset])

  // Método de pago preseleccionado: el último usado o el primero de la lista
  useEffect(() => {
    if (!open || paymentMethodId || methods.length === 0) return
    const remembered = methods.find((m) => m.id === prefs.paymentMethodId)
    setValue('paymentMethodId', (remembered ?? methods[0]).id)
  }, [open, paymentMethodId, methods, prefs.paymentMethodId, setValue])

  // Categorías del tipo elegido, las usadas recientemente primero
  const orderedCategories = useMemo(() => {
    const forType = categories.filter((c) => (c.type === 'INPUT' || c.type === 'OUTPUT' ? c.type === type : true))
    const recentIds = prefs.recent?.[type] ?? []
    const recent = recentIds
      .map((id) => forType.find((c) => c.id === id))
      .filter((c): c is CatalogItem => Boolean(c))
    return [...recent, ...forType.filter((c) => !recentIds.includes(c.id))]
  }, [categories, type, prefs.recent])

  // Si la categoría elegida no aplica al nuevo tipo, se limpia
  useEffect(() => {
    if (categoryId && !orderedCategories.some((c) => c.id === categoryId)) {
      setValue('categoryId', undefined as unknown as string)
    }
  }, [categoryId, orderedCategories, setValue])

  const visibleCategories = useMemo(() => {
    if (showAllCategories) return orderedCategories
    const firsts = orderedCategories.slice(0, VISIBLE_CATEGORIES)
    const selected = orderedCategories.find((c) => c.id === categoryId)
    return selected && !firsts.includes(selected) ? [...firsts.slice(0, -1), selected] : firsts
  }, [orderedCategories, showAllCategories, categoryId])

  const createMutation = useMutation({
    mutationFn: (data: TransactionFormData) => financeApi.createTransaction(data),
    onSuccess: (_, data) => {
      rememberUse(data.type as TxType, data.categoryId, data.paymentMethodId)
      queryClient.invalidateQueries({ queryKey: ['transactions'] })
      queryClient.invalidateQueries({ queryKey: ['transactionsSummary'] })
      toast.success(data.type === 'INPUT' ? 'Entrada guardada' : 'Salida guardada')
      onOpenChange(false)
    },
    onError: (err: unknown) => {
      console.error('[TransactionFormSheet] createTransaction', err)
      toast.error('No se pudo guardar', { description: 'Revisa tu conexión e intenta de nuevo.' })
    },
  })

  const today = toLocalDateInput()
  const dateInfo = describeDate(transactionDate, { dateOnly: true })
  const dateText = dateInfo ? (Math.abs(dateInfo.days) <= 1 ? dateInfo.relative : dateInfo.label) : 'Sin fecha'
  const verb = type === 'INPUT' ? 'entrada' : 'salida'
  const saveLabel =
    Number.isFinite(amountValue) && amountValue > 0
      ? `Guardar ${verb} de ${formatCurrency(amountValue)}`
      : `Guardar ${verb}`

  return (
    <AppBottomSheet
      open={open}
      onOpenChange={onOpenChange}
      title="Registrar movimiento"
      footer={
        <Button type="submit" form="tx-form" className={cn(TOUCH, 'w-full')} disabled={createMutation.isPending}>
          {createMutation.isPending ? (
            <>
              <Loader2 className="animate-spin" aria-hidden />
              Guardando…
            </>
          ) : (
            saveLabel
          )}
        </Button>
      }
    >
      <form
        id="tx-form"
        noValidate
        onSubmit={handleSubmit((data) => createMutation.mutate(data))}
        className="space-y-8"
      >
        {/* 1. ¿Entró o salió? */}
        <div role="group" aria-label="Tipo de movimiento" className="grid grid-cols-2 gap-2">
          {TX_TYPES.map((t) => {
            const selected = type === t.value
            return (
              <Button
                key={t.value}
                type="button"
                variant="outline"
                aria-pressed={selected}
                onClick={() => setValue('type', t.value, { shouldValidate: Boolean(errors.type) })}
                className={cn(TOUCH, 'text-base font-medium', selected && t.selected)}
              >
                {t.label}
              </Button>
            )
          })}
        </div>

        {/* 2. ¿Cuánto? — el único dato que siempre cambia */}
        <div className="rounded-xl bg-muted/60 px-4 py-4 focus-within:ring-[3px] focus-within:ring-ring/50">
          <label htmlFor="amount" className={LABEL}>
            ¿Cuánto {type === 'INPUT' ? 'entró' : 'salió'}?
          </label>
          <div className="mt-1 flex items-baseline gap-1">
            <span className="text-3xl font-semibold text-muted-foreground" aria-hidden>
              $
            </span>
            <input
              id="amount"
              type="text"
              inputMode="decimal"
              enterKeyHint="done"
              autoComplete="off"
              autoFocus
              placeholder="0"
              maxLength={13}
              aria-invalid={Boolean(errors.amount)}
              aria-describedby={errors.amount ? 'amount-error' : undefined}
              className="w-full min-w-0 bg-transparent text-4xl font-semibold tabular-nums tracking-tight outline-none placeholder:text-muted-foreground/40"
              {...register('amount')}
              onKeyDown={(e) => {
                // Enter cierra el teclado para ver las categorías; no guarda por accidente
                if (e.key === 'Enter') {
                  e.preventDefault()
                  e.currentTarget.blur()
                }
              }}
            />
          </div>
          {errors.amount && (
            <p id="amount-error" className="mt-2 text-sm text-destructive">
              {errors.amount.message}
            </p>
          )}
        </div>

        {/* 3. ¿De qué? */}
        <section className="space-y-3">
          <h3 className={LABEL}>Categoría</h3>
          {categoriesQuery.isLoading ? (
            <ChipsSkeleton />
          ) : categoriesQuery.isError ? (
            <CatalogError label="las categorías" onRetry={() => categoriesQuery.refetch()} />
          ) : orderedCategories.length === 0 ? (
            <p className="text-[15px] text-muted-foreground">No hay categorías para este tipo de movimiento.</p>
          ) : (
            <>
              <div role="group" aria-label="Categoría" className="flex flex-wrap gap-2">
                {visibleCategories.map((c) => (
                  <Chip
                    key={c.id}
                    label={c.name}
                    selected={categoryId === c.id}
                    onClick={() => setValue('categoryId', c.id, { shouldValidate: Boolean(errors.categoryId) })}
                  />
                ))}
              </div>
              {orderedCategories.length > VISIBLE_CATEGORIES && (
                <Button
                  type="button"
                  variant="ghost"
                  className="-ml-3 h-11 rounded-xl px-3 text-[15px] text-primary hover:text-primary"
                  onClick={() => setShowAllCategories((v) => !v)}
                >
                  {showAllCategories ? 'Ver menos' : `Ver todas (${orderedCategories.length})`}
                </Button>
              )}
            </>
          )}
          {errors.categoryId && <p className="text-sm text-destructive">{errors.categoryId.message}</p>}
        </section>

        {/* 4. ¿Cómo se pagó? — preseleccionado */}
        <section className="space-y-3">
          <h3 className={LABEL}>Forma de pago</h3>
          {methodsQuery.isLoading ? (
            <ChipsSkeleton count={3} />
          ) : methodsQuery.isError ? (
            <CatalogError label="las formas de pago" onRetry={() => methodsQuery.refetch()} />
          ) : (
            <div
              role="group"
              aria-label="Forma de pago"
              className="grid grid-cols-[repeat(auto-fit,minmax(6.5rem,1fr))] gap-2"
            >
              {methods.map((m) => (
                <Chip
                  key={m.id}
                  label={m.name}
                  selected={paymentMethodId === m.id}
                  onClick={() => setValue('paymentMethodId', m.id, { shouldValidate: Boolean(errors.paymentMethodId) })}
                />
              ))}
            </div>
          )}
          {errors.paymentMethodId && <p className="text-sm text-destructive">{errors.paymentMethodId.message}</p>}
        </section>

        {/* 5. Fecha — hoy por defecto, se cambia solo si hace falta */}
        <section className="space-y-3">
          <div className="flex min-h-11 items-center justify-between gap-3">
            <h3 className={LABEL}>Fecha</h3>
            {!editingDate && (
              <div className="flex items-center gap-1">
                <span className="text-base font-medium">{dateText}</span>
                <Button
                  type="button"
                  variant="ghost"
                  className="h-11 rounded-xl px-3 text-[15px] text-primary hover:text-primary"
                  onClick={() => setEditingDate(true)}
                >
                  Cambiar
                </Button>
              </div>
            )}
          </div>
          {editingDate && (
            <Input
              type="date"
              max={today}
              aria-label="Fecha del movimiento"
              className={cn('h-12 rounded-xl text-base', errors.transactionDate && 'border-destructive')}
              {...register('transactionDate')}
            />
          )}
          {errors.transactionDate && <p className="text-sm text-destructive">{errors.transactionDate.message}</p>}
        </section>

        {/* 6. Nota — opcional, al final */}
        <section className="space-y-3">
          <label htmlFor="description" className={LABEL}>
            Nota <span className="font-normal">(opcional)</span>
          </label>
          <Input
            id="description"
            placeholder={type === 'INPUT' ? 'Ej. Venta de la mañana' : 'Ej. Compra de refrescos'}
            maxLength={255}
            autoComplete="off"
            className="h-12 rounded-xl text-base"
            {...register('description')}
          />
          {errors.description && <p className="text-sm text-destructive">{errors.description.message}</p>}
        </section>
      </form>
    </AppBottomSheet>
  )
}

/* ─── Subcomponentes ────────────────────────────────────────────────────── */

function Chip({ label, selected, onClick }: { label: string; selected: boolean; onClick: () => void }) {
  return (
    <Button
      type="button"
      variant={selected ? 'default' : 'outline'}
      aria-pressed={selected}
      onClick={onClick}
      className={cn(TOUCH, 'px-4')}
    >
      <span className="truncate">{label}</span>
    </Button>
  )
}

function ChipsSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="flex flex-wrap gap-2" aria-busy="true" aria-label="Cargando opciones">
      {Array.from({ length: count }).map((_, i) => (
        <Skeleton key={i} className="h-12 w-24 rounded-xl" />
      ))}
    </div>
  )
}

function CatalogError({ label, onRetry }: { label: string; onRetry: () => void }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border px-4 py-3">
      <p className="text-[15px] text-muted-foreground">No se pudieron cargar {label}.</p>
      <Button type="button" variant="outline" onClick={onRetry}>
        Reintentar
      </Button>
    </div>
  )
}