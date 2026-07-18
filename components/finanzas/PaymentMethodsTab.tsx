'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { financeApi } from '@/lib/api/finance';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, CreditCard, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/useToast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const paymentMethodSchema = yup.object().shape({
  code: yup.string().required("El código es obligatorio").max(20, "Máximo 20 caracteres"),
  name: yup.string().required("El nombre es obligatorio").max(100, "Máximo 100 caracteres"),
});

type PaymentMethodFormData = yup.InferType<typeof paymentMethodSchema>;

export default function PaymentMethodsTab() {
  const { showError, showSuccess } = useToast();
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  
  const { data: methods = [], isLoading, error } = useQuery({
    queryKey: ['paymentMethods'],
    queryFn: () => financeApi.getPaymentMethods(),
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => financeApi.createPaymentMethod(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['paymentMethods'] });
      showSuccess("Método de pago creado exitosamente");
      setIsOpen(false);
      reset();
    },
    onError: (err: any) => {
      showError(err.message || "Error al crear el método de pago");
    }
  });

  const { register, handleSubmit, formState: { errors }, reset } = useForm<PaymentMethodFormData>({
    resolver: yupResolver(paymentMethodSchema) as any,
  });

  const onSubmit = (data: PaymentMethodFormData) => {
    createMutation.mutate({
      ...data,
      code: data.code.toUpperCase(),
      isActive: true
    });
  };

  if (error) {
    showError(error.message || "No se pudieron cargar los métodos de pago.");
  }

  const safeMethods = Array.isArray(methods) ? methods : [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Métodos de Pago</h2>
          <p className="text-violet-900">
            Catálogo de formas de pago aceptadas o utilizadas.
          </p>
        </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button className="bg-violet-600 hover:bg-violet-700 text-white">
              <PlusCircle className="mr-2 h-4 w-4" />
              Nuevo Método
            </Button>
          </DialogTrigger>
          <DialogContent className="w-[95vw] sm:max-w-[425px] max-h-[90vh] overflow-y-auto p-4 sm:p-6">
            <DialogHeader>
              <DialogTitle>Crear Método de Pago</DialogTitle>
              <DialogDescription>
                Añade una nueva forma de pago para clasificar las transacciones.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="code">Código</Label>
                <Input id="code" placeholder="Ej. TRANSFER" {...register("code")} className="uppercase" />
                {errors.code && <p className="text-sm text-red-500">{errors.code.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="name">Nombre</Label>
                <Input id="name" placeholder="Ej. Transferencia Bancaria" {...register("name")} />
                {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
              </div>
              <div className="flex justify-end pt-4">
                <Button type="submit" className="bg-violet-600 hover:bg-violet-700 text-white" disabled={createMutation.isPending}>
                  {createMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Guardar
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="border-violet-100">
        <CardHeader>
          <CardTitle>Listado de Métodos de Pago</CardTitle>
          <CardDescription>
            Métodos activos en el sistema.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-4 text-violet-500">Cargando métodos...</div>
          ) : safeMethods.length === 0 ? (
            <div className="text-center py-8 text-violet-400">
              <CreditCard className="mx-auto h-8 w-8 mb-2 opacity-50" />
              <p>No hay métodos de pago registrados.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {safeMethods.map((method) => (
                <div key={method.id} className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
                  <div className="flex items-center gap-4">
                    <div className="p-2 rounded-full bg-violet-100">
                      <CreditCard className="h-4 w-4 text-violet-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-violet-950">
                        {method.name}
                      </p>
                    </div>
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
