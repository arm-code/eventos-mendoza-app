// @/components/finanzas/CategoriesTab.tsx
'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { Loader2, RotateCw, Tags } from 'lucide-react'
import { toast } from 'sonner'

import { financeApi } from '@/lib/api/finance'
import { cn } from '@/lib/utils'

import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { AppBottomSheet } from '@/components/ui/app-bottom-sheet'
import { MobileFab } from '@/components/ui/mobile-fab'
import { TOUCH, LABEL } from '@/components/ui/detail'

/* ─── Esquema ───────────────────────────────────────────────────────────── */

const categorySchema = yup.object().shape({
  code: yup.string().required('El código es obligatorio').max(20, 'Máximo 20 caracteres'),
  name: yup.string().required('El nombre es obligatorio').max(100, 'Máximo 100 caracteres'),
  description: yup.string().max(255, 'Máximo 255 caracteres'),
})

type CategoryFormData = yup.InferType<typeof categorySchema>

/* ─── Pestaña Principal ─────────────────────────────────────────────────── */

export default function CategoriesTab() {
  const queryClient = useQueryClient()
  const [isOpen, setIsOpen] = useState(false)

  const { data: categories = [], isLoading, isError, refetch } = useQuery({
    queryKey: ['transactionCategories'],
    queryFn: () => financeApi.getCategories(),
  })

  const createMutation = useMutation({
    mutationFn: (data: any) => financeApi.createCategory(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactionCategories'] })
      toast.success('Categoría creada')
      setIsOpen(false)
      reset()
    },
    onError: () => {
      toast.error('No se pudo guardar', {
        description: 'Revisa tu conexión e intenta de nuevo.',
      })
    },
  })

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<CategoryFormData>({
    resolver: yupResolver(categorySchema) as any,
  })

  const onSubmit = (data: CategoryFormData) => {
    // Se mantiene la lógica de negocio (guardar en mayúsculas si la API lo espera)
    createMutation.mutate({
      ...data,
      code: data.code.toUpperCase(),
      isActive: true,
    })
  }

  const safeCategories = Array.isArray(categories) ? categories : []

  return (
    <div className="space-y-8">
      {/* Lista */}
      <section aria-labelledby="categories-title" className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 id="categories-title" className="text-base font-semibold">
            Categorías activas
          </h2>
          <Button onClick={() => setIsOpen(true)} variant="outline" size="sm" className="hidden sm:inline-flex">
            Nueva categoría
          </Button>
        </div>

        {isLoading ? (
          <ListSkeleton />
        ) : isError ? (
          <InlineError message="No se pudieron cargar las categorías." onRetry={() => refetch()} />
        ) : safeCategories.length === 0 ? (
          <Card className="items-center gap-3 px-6 py-10 text-center">
            <Tags className="size-8 text-muted-foreground/60" aria-hidden />
            <p className="font-medium">No hay categorías</p>
            <p className="text-sm text-muted-foreground">Crea tu primera categoría para organizar los movimientos.</p>
            <Button onClick={() => setIsOpen(true)} className="mt-2" variant="outline">
              Nueva categoría
            </Button>
          </Card>
        ) : (
          <Card className="gap-0 overflow-hidden py-0">
            <ul className="divide-y">
              {safeCategories.map((cat: any) => (
                <li
                  key={cat.id}
                  className="flex min-h-16 flex-col justify-center px-4 py-3 transition-colors hover:bg-accent/60"
                >
                  <p className="truncate text-base font-medium">{cat.name}</p>
                  <p className="truncate text-[15px] text-muted-foreground">
                    <span className="font-medium text-foreground/70">{cat.code || 'S/N'}</span>
                    {cat.description ? ` · ${cat.description}` : ''}
                  </p>
                </li>
              ))}
            </ul>
          </Card>
        )}
      </section>

      {/* FAB móvil */}
      <MobileFab onClick={() => setIsOpen(true)} title="Nueva" aria-label="Crear categoría" />

      {/* Formulario */}
      <AppBottomSheet
        open={isOpen}
        onOpenChange={setIsOpen}
        title="Crear categoría"
        footer={
          <div className="grid grid-cols-2 gap-2">
            <Button
              type="button"
              variant="outline"
              className={TOUCH}
              onClick={() => setIsOpen(false)}
              disabled={createMutation.isPending}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              form="category-form"
              className={TOUCH}
              disabled={createMutation.isPending}
            >
              {createMutation.isPending && <Loader2 className="animate-spin" aria-hidden />}
              Guardar
            </Button>
          </div>
        }
      >
        <form id="category-form" onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-1.5">
            <Label htmlFor="code" className={LABEL}>
              Código
            </Label>
            <Input
              id="code"
              placeholder="Ej. RENTA"
              className={cn('h-12 rounded-xl text-base', errors.code && 'border-destructive')}
              {...register('code')}
            />
            {errors.code && <p className="text-xs text-destructive">{errors.code.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="name" className={LABEL}>
              Nombre
            </Label>
            <Input
              id="name"
              placeholder="Ej. Renta de mobiliario"
              className={cn('h-12 rounded-xl text-base', errors.name && 'border-destructive')}
              {...register('name')}
            />
            {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="description" className={LABEL}>
              Descripción (Opcional)
            </Label>
            <Input
              id="description"
              placeholder="Detalle adicional..."
              className={cn('h-12 rounded-xl text-base', errors.description && 'border-destructive')}
              {...register('description')}
            />
            {errors.description && <p className="text-xs text-destructive">{errors.description.message}</p>}
          </div>
        </form>
      </AppBottomSheet>
    </div>
  )
}

/* ─── Subcomponentes ────────────────────────────────────────────────────── */

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

function ListSkeleton() {
  return (
    <Card className="gap-0 py-0" aria-busy="true" aria-label="Cargando categorías">
      <div className="divide-y">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex min-h-16 flex-col justify-center gap-1.5 px-4 py-3">
            <Skeleton className="h-4 w-3/5" />
            <Skeleton className="h-3.5 w-1/3" />
          </div>
        ))}
      </div>
    </Card>
  )
}