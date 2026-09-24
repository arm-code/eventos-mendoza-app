// @/components/finanzas/PaymentMethodsTab.tsx
'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { CreditCard, Loader2, RotateCw } from 'lucide-react'
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

const paymentMethodSchema = yup.object().shape({
  code: yup.string().required('El código es obligatorio').max(20, 'Máximo 20 caracteres'),
  name: yup.string().required('El nombre es obligatorio').max(100, 'Máximo 100 caracteres'),
})

type PaymentMethodFormData = yup.InferType<typeof paymentMethodSchema>

/* ─── Pestaña Principal ─────────────────────────────────────────────────── */

export default function PaymentMethodsTab() {
  const queryClient = useQueryClient()
  const [isOpen, setIsOpen] = useState(false)

  const { data: methods = [], isLoading, isError, refetch } = useQuery({
    queryKey: ['paymentMethods'],
    queryFn: () => financeApi.getPaymentMethods(),
  })

  const createMutation = useMutation({
    mutationFn: (data: any) => financeApi.createPaymentMethod(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['paymentMethods'] })
      toast.success('Método de pago creado')
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
  } = useForm<PaymentMethodFormData>({
    resolver: yupResolver(paymentMethodSchema) as any,
  })

  const onSubmit = (data: PaymentMethodFormData) => {
    createMutation.mutate({
      ...data,
      code: data.code.toUpperCase(),
      isActive: true,
    })
  }

  const safeMethods = Array.isArray(methods) ? methods : []

  return (
    <div className="space-y-8">
      {/* Lista */}
      <section aria-labelledby="methods-title" className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 id="methods-title" className="text-base font-semibold">
            Formas de pago
          </h2>
          <Button onClick={() => setIsOpen(true)} variant="outline" size="sm" className="hidden sm:inline-flex">
            Nuevo método
          </Button>
        </div>

        {isLoading ? (
          <ListSkeleton />
        ) : isError ? (
          <InlineError message="No se pudieron cargar los métodos de pago." onRetry={() => refetch()} />
        ) : safeMethods.length === 0 ? (
          <Card className="items-center gap-3 px-6 py-10 text-center">
            <CreditCard className="size-8 text-muted-foreground/60" aria-hidden />
            <p className="font-medium">No hay métodos registrados</p>
            <p className="text-sm text-muted-foreground">Añade tu primera forma de pago (ej. Efectivo, Transferencia).</p>
            <Button onClick={() => setIsOpen(true)} className="mt-2" variant="outline">
              Nuevo método
            </Button>
          </Card>
        ) : (
          <Card className="gap-0 overflow-hidden py-0">
            <ul className="divide-y">
              {safeMethods.map((method: any) => (
                <li
                  key={method.id}
                  className="flex min-h-16 flex-col justify-center px-4 py-3 transition-colors hover:bg-accent/60"
                >
                  <p className="truncate text-base font-medium">{method.name}</p>
                  <p className="truncate text-[15px] text-muted-foreground">
                    Código: <span className="font-medium text-foreground/70">{method.code}</span>
                  </p>
                </li>
              ))}
            </ul>
          </Card>
        )}
      </section>

      {/* FAB móvil */}
      <MobileFab onClick={() => setIsOpen(true)} title="Nuevo" aria-label="Crear método de pago" />

      {/* Formulario */}
      <AppBottomSheet
        open={isOpen}
        onOpenChange={setIsOpen}
        title="Crear método de pago"
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
              form="payment-form"
              className={TOUCH}
              disabled={createMutation.isPending}
            >
              {createMutation.isPending && <Loader2 className="animate-spin" aria-hidden />}
              Guardar
            </Button>
          </div>
        }
      >
        <form id="payment-form" onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-1.5">
            <Label htmlFor="code" className={LABEL}>
              Código
            </Label>
            <Input
              id="code"
              placeholder="Ej. TRANSFER"
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
              placeholder="Ej. Transferencia Bancaria"
              className={cn('h-12 rounded-xl text-base', errors.name && 'border-destructive')}
              {...register('name')}
            />
            {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
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
    <Card className="gap-0 py-0" aria-busy="true" aria-label="Cargando métodos de pago">
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