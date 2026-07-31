'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { financeApi } from '@/lib/api/finance';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, CreditCard, Loader2, Wallet } from "lucide-react";
import { useToast } from "@/hooks/useToast";
import { AppBottomSheet } from "@/components/ui/app-bottom-sheet";
import { FabButton } from "@/components/ui/fab-button";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useForm } from 'react-hook-form';

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
    <div className="space-y-4 sm:space-y-6">
      <Card className="border-violet-100 shadow-sm">
        <CardHeader className="pb-3 sm:pb-4">
          <CardTitle className="text-base sm:text-lg">Listado de Métodos</CardTitle>
          <CardDescription className="text-xs sm:text-sm">
            Métodos activos en el sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12 gap-3 text-violet-400">
              <Loader2 className="h-6 w-6 animate-spin" />
              <p className="text-sm">Cargando métodos...</p>
            </div>
          ) : safeMethods.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-violet-400">
              <div className="p-4 rounded-full bg-violet-50 mb-3">
                <CreditCard className="h-6 w-6 text-violet-300" />
              </div>
              <p className="text-sm font-medium">No hay métodos registrados</p>
              <p className="text-xs mt-1">Añade tu primera forma de pago</p>
            </div>
          ) : (
            <div className="space-y-1">
              <AnimatePresence>
                {safeMethods.map((method, index) => (
                  <motion.div
                    key={method.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.03 }}
                    whileTap={{ scale: 0.995, backgroundColor: "rgba(139, 92, 246, 0.04)" }}
                    className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-xl active:bg-violet-50/50 transition-colors touch-manipulation cursor-pointer"
                  >
                    <div className="flex-shrink-0 p-2.5 sm:p-3 rounded-xl bg-violet-100">
                      <CreditCard className="h-4 w-4 sm:h-5 sm:w-5 text-violet-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm sm:text-base font-medium text-violet-950">
                        {method.name}
                      </p>
                      <p className="text-xs sm:text-sm text-violet-500 mt-0.5">
                        Código: <span className="font-mono text-violet-600 bg-violet-50 px-1.5 py-0.5 rounded text-[11px]">{method.code}</span>
                      </p>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </CardContent>
      </Card>

      {/* FAB móvil */}
      <FabButton
        icon={<PlusCircle className="h-6 w-6" />}
        title="Crear nuevo método de pago"
        onClick={() => setIsOpen(true)}
      />

      {/* Botón desktop */}
      <div className="hidden sm:flex justify-end">
        <Button
          onClick={() => setIsOpen(true)}
          className="bg-violet-600 hover:bg-violet-700 text-white h-11 px-6 rounded-xl shadow-lg shadow-violet-600/20 active:scale-[0.98] transition-all touch-manipulation"
        >
          <PlusCircle className="mr-2 h-4 w-4" />
          Nuevo Método
        </Button>
      </div>

      {/* Conditional Rendering for Mobile/Desktop */}
      <AppBottomSheet
        open={isOpen}
        onOpenChange={setIsOpen}
        title="Crear Método de Pago"
        description="Añade una nueva forma de pago"
      >
        <PaymentMethodForm
          onSubmit={handleSubmit(onSubmit)}
          register={register}
          errors={errors}
          isPending={createMutation.isPending}
          onCancel={() => setIsOpen(false)}
        />
      </AppBottomSheet>
    </div>
  );
}

function PaymentMethodForm({
  onSubmit,
  register,
  errors,
  isPending,
  onCancel
}: {
  onSubmit: () => void;
  register: any;
  errors: any;
  isPending: boolean;
  onCancel: () => void;
}) {
  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <div className="space-y-1.5">
        <Label htmlFor="code" className="text-sm font-medium text-violet-900">Código</Label>
        <div className="relative">
          <Wallet className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-violet-400" />
          <Input
            id="code"
            placeholder="Ej. TRANSFER"
            {...register("code")}
            className="min-h-[48px] rounded-xl border-violet-200 pl-10 uppercase font-medium tracking-wide focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500"
          />
        </div>
        {errors.code && <p className="text-xs text-red-500">{errors.code.message}</p>}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="name" className="text-sm font-medium text-violet-900">Nombre</Label>
        <Input
          id="name"
          placeholder="Ej. Transferencia Bancaria"
          {...register("name")}
          className="min-h-[48px] rounded-xl border-violet-200 focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500"
        />
        {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
      </div>

      <div className="flex gap-3 pt-2 sticky bottom-0 bg-white/80 backdrop-blur-sm pb-2">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          className="flex-1 h-12 rounded-xl border-violet-200 text-violet-700 active:bg-violet-50 touch-manipulation"
        >
          Cancelar
        </Button>
        <Button
          type="submit"
          className="flex-1 h-12 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-semibold shadow-lg shadow-violet-600/20 active:scale-[0.98] transition-all touch-manipulation"
          disabled={isPending}
        >
          {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Guardar
        </Button>
      </div>
    </form>
  );
}