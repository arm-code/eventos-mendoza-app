'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { financeApi } from '@/lib/api/finance';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, ArrowUpRight, ArrowDownRight, Wallet, CalendarDays, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/useToast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const transactionSchema = yup.object().shape({
  transactionDate: yup.string().required("La fecha es obligatoria"),
  type: yup.string().oneOf(['INPUT', 'OUTPUT']).required("El tipo es obligatorio"),
  description: yup.string().max(255, "Máximo 255 caracteres").optional(),
  amount: yup.number().typeError("Debe ser un número").positive("Debe ser mayor a 0").required("El monto es obligatorio"),
  categoryId: yup.string().uuid("ID de categoría inválido").required("La categoría es obligatoria"),
  paymentMethodId: yup.string().uuid("ID de método de pago inválido").required("El método de pago es obligatorio"),
  businessEventId: yup.string().uuid("ID de evento inválido").optional().nullable().transform((v) => v === "" ? null : v),
});

type TransactionFormData = yup.InferType<typeof transactionSchema>;

export default function TransactionsTab() {
  const { showError, showSuccess } = useToast();
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  
  const { data: transactions = [], isLoading, error } = useQuery({
    queryKey: ['transactions'],
    queryFn: () => financeApi.getTransactions(),
  });

  const { data: categories = [] } = useQuery({
    queryKey: ['transactionCategories'],
    queryFn: () => financeApi.getCategories(),
  });

  const { data: paymentMethods = [] } = useQuery({
    queryKey: ['paymentMethods'],
    queryFn: () => financeApi.getPaymentMethods(),
  });

  const { data: events = [] } = useQuery({
    queryKey: ['businessEvents'],
    queryFn: () => financeApi.getBusinessEvents(),
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => financeApi.createTransaction(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      showSuccess("Transacción registrada exitosamente");
      setIsOpen(false);
      reset({
        transactionDate: new Date().toISOString().split('T')[0],
        type: 'INPUT',
      });
    },
    onError: (err: any) => {
      showError(err.message || "Error al registrar la transacción");
    }
  });

  const { register, handleSubmit, formState: { errors }, reset } = useForm<TransactionFormData>({
    resolver: yupResolver(transactionSchema) as any,
    defaultValues: {
      transactionDate: new Date().toISOString().split('T')[0],
      type: 'INPUT',
    }
  });

  const onSubmit = (data: TransactionFormData) => {
    createMutation.mutate(data);
  };

  if (error) {
    showError(error.message || "No se pudieron cargar las transacciones.");
  }

  const safeTransactions = Array.isArray(transactions) ? transactions : [];

  const totalInputs = safeTransactions
    .filter(t => t.type === 'INPUT')
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const totalOutputs = safeTransactions
    .filter(t => t.type === 'OUTPUT')
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const balance = totalInputs - totalOutputs;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Transacciones</h2>
          <p className="text-violet-900">
            Gestiona tus ingresos y gastos.
          </p>
        </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button className="bg-violet-600 hover:bg-violet-700 text-white">
              <PlusCircle className="mr-2 h-4 w-4" />
              Nuevo Movimiento
            </Button>
          </DialogTrigger>
          <DialogContent className="w-[95vw] sm:max-w-[425px] max-h-[90vh] overflow-y-auto p-4 sm:p-6">
            <DialogHeader>
              <DialogTitle>Registrar Transacción</DialogTitle>
              <DialogDescription>
                Añade un nuevo ingreso o gasto a las finanzas.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="type">Tipo</Label>
                  <select
                    id="type"
                    className="flex h-9 w-full items-center justify-between whitespace-nowrap rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                    {...register("type")}
                  >
                    <option value="INPUT">Ingreso</option>
                    <option value="OUTPUT">Gasto</option>
                  </select>
                  {errors.type && <p className="text-sm text-red-500">{errors.type.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="transactionDate">Fecha</Label>
                  <Input id="transactionDate" type="date" {...register("transactionDate")} />
                  {errors.transactionDate && <p className="text-sm text-red-500">{errors.transactionDate.message}</p>}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="amount">Monto ($)</Label>
                <Input id="amount" type="number" step="0.01" placeholder="0.00" {...register("amount")} />
                {errors.amount && <p className="text-sm text-red-500">{errors.amount.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Descripción (Opcional)</Label>
                <Input id="description" placeholder="Ej. Pago de Renta..." {...register("description")} />
                {errors.description && <p className="text-sm text-red-500">{errors.description.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="categoryId">Categoría</Label>
                <select
                  id="categoryId"
                  className="flex h-9 w-full items-center justify-between whitespace-nowrap rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                  {...register("categoryId")}
                >
                  <option value="">Seleccionar Categoría</option>
                  {(Array.isArray(categories) ? categories : []).map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
                {errors.categoryId && <p className="text-sm text-red-500">{errors.categoryId.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="paymentMethodId">Método de Pago</Label>
                <select
                  id="paymentMethodId"
                  className="flex h-9 w-full items-center justify-between whitespace-nowrap rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                  {...register("paymentMethodId")}
                >
                  <option value="">Seleccionar Método</option>
                  {(Array.isArray(paymentMethods) ? paymentMethods : []).map((pm) => (
                    <option key={pm.id} value={pm.id}>{pm.name}</option>
                  ))}
                </select>
                {errors.paymentMethodId && <p className="text-sm text-red-500">{errors.paymentMethodId.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="businessEventId">Evento (Opcional)</Label>
                <select
                  id="businessEventId"
                  className="flex h-9 w-full items-center justify-between whitespace-nowrap rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                  {...register("businessEventId")}
                >
                  <option value="">Ninguno</option>
                  {(Array.isArray(events) ? events : []).map((evt) => (
                    <option key={evt.id} value={evt.id}>{evt.name}</option>
                  ))}
                </select>
                {errors.businessEventId && <p className="text-sm text-red-500">{errors.businessEventId.message}</p>}
              </div>

              <div className="flex justify-end pt-4">
                <Button type="submit" className="bg-violet-600 hover:bg-violet-700 text-white" disabled={createMutation.isPending}>
                  {createMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Guardar Transacción
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-violet-100">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-violet-900">Balance Total</CardTitle>
            <Wallet className="h-4 w-4 text-violet-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-violet-950">${balance.toFixed(2)}</div>
            <p className="text-xs text-violet-500">Balance actual disponible</p>
          </CardContent>
        </Card>

        <Card className="border-green-100">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-900">Ingresos Totales</CardTitle>
            <ArrowUpRight className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-700">${totalInputs.toFixed(2)}</div>
            <p className="text-xs text-green-600/70">Histórico de ingresos</p>
          </CardContent>
        </Card>

        <Card className="border-red-100">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-red-900">Gastos Totales</CardTitle>
            <ArrowDownRight className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-700">${totalOutputs.toFixed(2)}</div>
            <p className="text-xs text-red-600/70">Histórico de gastos</p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-violet-100">
        <CardHeader>
          <CardTitle>Movimientos Recientes</CardTitle>
          <CardDescription>
            Últimas transacciones registradas en el sistema.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-4 text-violet-500">Cargando movimientos...</div>
          ) : safeTransactions.length === 0 ? (
            <div className="text-center py-8 text-violet-400">
              <CalendarDays className="mx-auto h-8 w-8 mb-2 opacity-50" />
              <p>No hay movimientos registrados.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {safeTransactions.map((tx) => (
                <div key={tx.id} className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
                  <div className="flex items-center gap-4">
                    <div className={`p-2 rounded-full ${tx.type === 'INPUT' ? 'bg-green-100' : 'bg-red-100'}`}>
                      {tx.type === 'INPUT' ? (
                        <ArrowUpRight className={`h-4 w-4 text-green-600`} />
                      ) : (
                        <ArrowDownRight className={`h-4 w-4 text-red-600`} />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-violet-950">
                        {tx.description || tx.category?.name || 'Movimiento'}
                      </p>
                      <p className="text-xs text-violet-500">
                        {new Date(tx.transactionDate).toLocaleDateString()} • {tx.paymentMethod?.name || 'Otro'}
                      </p>
                    </div>
                  </div>
                  <div className={`text-sm font-bold ${tx.type === 'INPUT' ? 'text-green-600' : 'text-red-600'}`}>
                    {tx.type === 'INPUT' ? '+' : '-'}${Number(tx.amount).toFixed(2)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
