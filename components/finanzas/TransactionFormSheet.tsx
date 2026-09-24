// @/components/finanzas/TransactionFormSheet.tsx
'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm, Controller } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'

import { financeApi } from '@/lib/api/finance'
import { cn } from '@/lib/utils'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { AppBottomSheet } from '@/components/ui/app-bottom-sheet'
import { TOUCH, LABEL } from '@/components/ui/detail'

const transactionSchema = yup.object().shape({
  transactionDate: yup.string().required('La fecha es obligatoria'),
  type: yup.string().oneOf(['INPUT', 'OUTPUT']).required('El tipo es obligatorio'),
  description: yup.string().max(255, 'Máximo 255 caracteres').optional(),
  amount: yup
    .number()
    .typeError('Debe ser un número')
    .positive('Debe ser mayor a 0')
    .required('El monto es obligatorio'),
  categoryId: yup.string().uuid('Categoría inválida').required('La categoría es obligatoria'),
  paymentMethodId: yup.string().uuid('Método de pago inválido').required('El método de pago es obligatorio'),
  businessEventId: yup
    .string()
    .uuid('ID de evento inválido')
    .optional()
    .nullable()
    .transform((v) => (v === '' || v === 'none' ? null : v)),
})

type TransactionFormData = yup.InferType<typeof transactionSchema>

interface TransactionFormSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function TransactionFormSheet({ open, onOpenChange }: TransactionFormSheetProps) {
  const queryClient = useQueryClient()

  // Precargar catálogos para el formulario
  const categoriesQuery = useQuery({
    queryKey: ['transactionCategories'],
    queryFn: () => financeApi.getCategories(),
  })
  const methodsQuery = useQuery({
    queryKey: ['paymentMethods'],
    queryFn: () => financeApi.getPaymentMethods(),
  })
  const eventsQuery = useQuery({
    queryKey: ['businessEvents'],
    queryFn: () => financeApi.getBusinessEvents(),
  })

  const createMutation = useMutation({
    mutationFn: (data: TransactionFormData) => financeApi.createTransaction(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] })
      queryClient.invalidateQueries({ queryKey: ['transactionsSummary'] })
      toast.success('Movimiento registrado')
      onOpenChange(false)
      reset({
        transactionDate: new Date().toISOString().split('T')[0],
        type: 'INPUT',
      })
    },
    onError: () => {
      toast.error('No se pudo guardar', {
        description: 'Revisa tu conexión e intenta de nuevo.',
      })
    },
  })

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<TransactionFormData>({
    resolver: yupResolver(transactionSchema) as any,
    defaultValues: {
      transactionDate: new Date().toISOString().split('T')[0],
      type: 'INPUT',
    },
  })

  return (
    <AppBottomSheet
      open={open}
      onOpenChange={onOpenChange}
      title="Registrar movimiento"
      footer={
        <div className="grid grid-cols-2 gap-2">
          <Button
            type="button"
            variant="outline"
            className={TOUCH}
            onClick={() => onOpenChange(false)}
            disabled={createMutation.isPending}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            form="tx-form"
            className={TOUCH}
            disabled={createMutation.isPending}
          >
            {createMutation.isPending && <Loader2 className="animate-spin" aria-hidden />}
            Guardar
          </Button>
        </div>
      }
    >
      <form id="tx-form" onSubmit={handleSubmit((d) => createMutation.mutate(d))} className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label className={LABEL}>Tipo</Label>
            <Controller
              control={control}
              name="type"
              render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value || ''}>
                  <SelectTrigger className={cn('h-12 rounded-xl text-base', errors.type && 'border-destructive')}>
                    <SelectValue placeholder="Seleccionar..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="INPUT">Entró</SelectItem>
                    <SelectItem value="OUTPUT">Salió</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
            {errors.type && <p className="text-xs text-destructive">{errors.type.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="transactionDate" className={LABEL}>Fecha</Label>
            <Input
              id="transactionDate"
              type="date"
              className={cn('h-12 rounded-xl text-base', errors.transactionDate && 'border-destructive')}
              {...register('transactionDate')}
            />
            {errors.transactionDate && <p className="text-xs text-destructive">{errors.transactionDate.message}</p>}
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="amount" className={LABEL}>Monto ($)</Label>
          <Input
            id="amount"
            type="number"
            step="0.01"
            inputMode="decimal"
            placeholder="0.00"
            className={cn('h-12 rounded-xl text-base tabular-nums', errors.amount && 'border-destructive')}
            {...register('amount')}
          />
          {errors.amount && <p className="text-xs text-destructive">{errors.amount.message}</p>}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="description" className={LABEL}>Concepto (Opcional)</Label>
          <Input
            id="description"
            placeholder="Ej. Pago de renta..."
            className="h-12 rounded-xl text-base"
            {...register('description')}
          />
          {errors.description && <p className="text-xs text-destructive">{errors.description.message}</p>}
        </div>

        <div className="space-y-1.5">
          <Label className={LABEL}>Categoría</Label>
          <Controller
            control={control}
            name="categoryId"
            render={({ field }) => (
              <Select onValueChange={field.onChange} value={field.value || ''}>
                <SelectTrigger className={cn('h-12 rounded-xl text-base', errors.categoryId && 'border-destructive')}>
                  <SelectValue placeholder="Seleccionar..." />
                </SelectTrigger>
                <SelectContent>
                  {(categoriesQuery.data || []).map((cat: any) => (
                    <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {errors.categoryId && <p className="text-xs text-destructive">{errors.categoryId.message}</p>}
        </div>

        <div className="space-y-1.5">
          <Label className={LABEL}>Método de Pago</Label>
          <Controller
            control={control}
            name="paymentMethodId"
            render={({ field }) => (
              <Select onValueChange={field.onChange} value={field.value || ''}>
                <SelectTrigger className={cn('h-12 rounded-xl text-base', errors.paymentMethodId && 'border-destructive')}>
                  <SelectValue placeholder="Seleccionar..." />
                </SelectTrigger>
                <SelectContent>
                  {(methodsQuery.data || []).map((pm: any) => (
                    <SelectItem key={pm.id} value={pm.id}>{pm.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {errors.paymentMethodId && <p className="text-xs text-destructive">{errors.paymentMethodId.message}</p>}
        </div>

        <div className="space-y-1.5">
          <Label className={LABEL}>Evento (Opcional)</Label>
          <Controller
            control={control}
            name="businessEventId"
            render={({ field }) => (
              <Select onValueChange={(val) => field.onChange(val === 'none' ? '' : val)} value={field.value || 'none'}>
                <SelectTrigger className="h-12 rounded-xl text-base">
                  <SelectValue placeholder="Ninguno" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Ninguno</SelectItem>
                  {(eventsQuery.data || [])
                    .filter((evt: any) => evt.status === 'pending' || evt.id === field.value)
                    .map((evt: any) => (
                      <SelectItem key={evt.id} value={evt.id}>{evt.name}</SelectItem>
                    ))}
                </SelectContent>
              </Select>
            )}
          />
        </div>
      </form>
    </AppBottomSheet>
  )
}
