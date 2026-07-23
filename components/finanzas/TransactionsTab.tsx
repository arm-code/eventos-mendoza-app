'use client';

import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { financeApi } from '@/lib/api/finance';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  PlusCircle, ArrowUpRight, ArrowDownRight, Wallet,
  CalendarDays, Loader2, X, ChevronDown, Filter
} from "lucide-react";
import { useToast } from "@/hooks/useToast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetTrigger } from "@/components/ui/sheet";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PaginationControls } from "@/components/ui/pagination-controls";
import { Loader } from "@/components/Loaders/Loader.component";
import { motion, AnimatePresence } from "framer-motion";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

// Utilidad para clases condicionales
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

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

// Componente Select nativo estilizado para móvil
const TouchSelect = ({
  id,
  label,
  error,
  children,
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement> & { label: string; error?: string }) => (
  <div className="space-y-2">
    <Label htmlFor={id} className="text-sm font-medium text-violet-900">{label}</Label>
    <div className="relative">
      <select
        id={id}
        className={cn(
          "flex min-h-[48px] w-full items-center rounded-xl border border-violet-200 bg-white px-4 pr-10 text-sm shadow-sm",
          "focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500",
          "active:bg-violet-50 transition-all duration-150 appearance-none touch-manipulation",
          error && "border-red-300 focus:border-red-500 focus:ring-red-500/20"
        )}
        {...props}
      >
        {children}
      </select>
      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-violet-400 pointer-events-none" />
    </div>
    {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
  </div>
);

export default function TransactionsTab() {
  const { showError, showSuccess } = useToast();
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [limit] = useState(10);

  const { data: paginatedData, isLoading, error } = useQuery({
    queryKey: ['transactions', currentPage, limit],
    queryFn: () => financeApi.getTransactions(currentPage, limit),
  });

  const { data: summary, isLoading: isLoadingSummary } = useQuery({
    queryKey: ['transactionsSummary'],
    queryFn: () => financeApi.getSummary(),
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
      queryClient.invalidateQueries({ queryKey: ['transactionsSummary'] });
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

  const { register, handleSubmit, formState: { errors }, reset, watch } = useForm<TransactionFormData>({
    resolver: yupResolver(transactionSchema) as any,
    defaultValues: {
      transactionDate: new Date().toISOString().split('T')[0],
      type: 'INPUT',
    }
  });

  const watchType = watch("type");

  const onSubmit = (data: TransactionFormData) => {
    createMutation.mutate(data);
  };

  if (error) {
    showError(error.message || "No se pudieron cargar las transacciones.");
  }

  const transactions = paginatedData?.items || [];
  const meta = paginatedData?.meta || { page: 1, limit: 10, totalPages: 1, hasNextPage: false, hasPreviousPage: false };
  const safeTransactions = Array.isArray(transactions) ? transactions : [];
  const totalInputs = summary?.totalInputs || 0;
  const totalOutputs = summary?.totalOutputs || 0;
  const balance = summary?.balance || 0;

  const safeCategories = Array.isArray(categories) ? categories : [];
  const safeMethods = Array.isArray(paymentMethods) ? paymentMethods : [];
  const safeEvents = Array.isArray(events) ? events : [];

  return (
    <div className="space-y-4 sm:space-y-6 pb-24 sm:pb-6">
      {/* Header compacto para móvil */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-violet-950">Transacciones</h2>
          <p className="text-sm text-violet-600/70 mt-0.5">
            Gestiona tus ingresos y gastos
          </p>
        </div>
      </div>

      {/* Tarjetas de resumen optimizadas para touch */}
      <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-3">
        <motion.div whileTap={{ scale: 0.98 }} className="touch-manipulation">
          <Card className="border-violet-100 bg-gradient-to-br from-white to-violet-50/50 shadow-sm active:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 sm:pb-3">
              <CardTitle className="text-xs sm:text-sm font-semibold text-violet-700">Balance Total</CardTitle>
              <div className="p-1.5 rounded-lg bg-violet-100">
                <Wallet className="h-4 w-4 text-violet-600" />
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-xl sm:text-2xl font-bold text-violet-950">${balance.toFixed(2)}</div>
              <p className="text-[11px] sm:text-xs text-violet-500 mt-0.5">Disponible actual</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div whileTap={{ scale: 0.98 }} className="touch-manipulation">
          <Card className="border-green-100 bg-gradient-to-br from-white to-green-50/30 shadow-sm active:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 sm:pb-3">
              <CardTitle className="text-xs sm:text-sm font-semibold text-green-700">Ingresos</CardTitle>
              <div className="p-1.5 rounded-lg bg-green-100">
                <ArrowUpRight className="h-4 w-4 text-green-600" />
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-xl sm:text-2xl font-bold text-green-700">${totalInputs.toFixed(2)}</div>
              <p className="text-[11px] sm:text-xs text-green-600/70 mt-0.5">Total histórico</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div whileTap={{ scale: 0.98 }} className="touch-manipulation">
          <Card className="border-red-100 bg-gradient-to-br from-white to-red-50/30 shadow-sm active:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 sm:pb-3">
              <CardTitle className="text-xs sm:text-sm font-semibold text-red-700">Gastos</CardTitle>
              <div className="p-1.5 rounded-lg bg-red-100">
                <ArrowDownRight className="h-4 w-4 text-red-600" />
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-xl sm:text-2xl font-bold text-red-700">${totalOutputs.toFixed(2)}</div>
              <p className="text-[11px] sm:text-xs text-red-600/70 mt-0.5">Total histórico</p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Lista de transacciones con items táctiles */}
      <Card className="border-violet-100 shadow-sm">
        <CardHeader className="pb-3 sm:pb-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base sm:text-lg">Movimientos Recientes</CardTitle>
              <CardDescription className="text-xs sm:text-sm mt-0.5">
                Últimas transacciones registradas
              </CardDescription>
            </div>
            <div className="p-2 rounded-lg bg-violet-50 sm:hidden">
              <Filter className="h-4 w-4 text-violet-600" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12 gap-3 text-violet-400">
              <Loader />
              <p className="text-sm">Cargando movimientos...</p>
            </div>
          ) : safeTransactions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-violet-400">
              <div className="p-4 rounded-full bg-violet-50 mb-3">
                <CalendarDays className="h-6 w-6 text-violet-300" />
              </div>
              <p className="text-sm font-medium">No hay movimientos</p>
              <p className="text-xs mt-1">Registra tu primera transacción</p>
            </div>
          ) : (
            <div className="space-y-1">
              {safeTransactions.map((tx, index) => (
                <motion.div
                  key={tx.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  whileTap={{ scale: 0.995, backgroundColor: "rgba(139, 92, 246, 0.04)" }}
                  className="flex items-center justify-between p-3 sm:p-4 rounded-xl active:bg-violet-50/50 transition-colors touch-manipulation cursor-pointer"
                >
                  <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                    <div className={cn(
                      "flex-shrink-0 p-2.5 sm:p-3 rounded-xl",
                      tx.type === 'INPUT' ? 'bg-green-100' : 'bg-red-100'
                    )}>
                      {tx.type === 'INPUT' ? (
                        <ArrowUpRight className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
                      ) : (
                        <ArrowDownRight className="h-4 w-4 sm:h-5 sm:w-5 text-red-600" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm sm:text-base font-medium text-violet-950 truncate">
                        {tx.description || tx.category?.name || 'Movimiento'}
                      </p>
                      <p className="text-xs sm:text-sm text-violet-500 mt-0.5 flex items-center gap-1.5">
                        <span>{new Date(tx.transactionDate).toLocaleDateString('es-ES', {
                          day: 'numeric',
                          month: 'short',
                          year: '2-digit'
                        })}</span>
                        <span className="w-1 h-1 rounded-full bg-violet-300" />
                        <span className="truncate">{tx.paymentMethod?.name || 'Otro'}</span>
                      </p>
                    </div>
                  </div>
                  <div className={cn(
                    "text-sm sm:text-base font-bold flex-shrink-0 ml-2",
                    tx.type === 'INPUT' ? 'text-green-600' : 'text-red-600'
                  )}>
                    {tx.type === 'INPUT' ? '+' : '-'}${Number(tx.amount).toFixed(2)}
                  </div>
                </motion.div>
              ))}

              <div className="pt-4 mt-2 border-t border-violet-100">
                <PaginationControls
                  currentPage={meta.page}
                  totalPages={meta.totalPages}
                  onPageChange={setCurrentPage}
                  hasNextPage={meta.hasNextPage}
                  hasPreviousPage={meta.hasPreviousPage}
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* FAB para móvil / Botón desktop */}
      <div className="sm:hidden fixed bottom-6 right-4 z-40">
        <motion.button
          whileTap={{ scale: 0.92 }}
          onClick={() => setIsOpen(true)}
          className="flex items-center justify-center w-14 h-14 rounded-full bg-violet-600 text-white shadow-xl shadow-violet-600/30 active:bg-violet-700 touch-manipulation"
        >
          <PlusCircle className="h-6 w-6" />
        </motion.button>
      </div>

      <div className="hidden sm:flex justify-end">
        <Button
          onClick={() => setIsOpen(true)}
          className="bg-violet-600 hover:bg-violet-700 text-white h-11 px-6 rounded-xl shadow-lg shadow-violet-600/20 active:scale-[0.98] transition-all"
        >
          <PlusCircle className="mr-2 h-4 w-4" />
          Nuevo Movimiento
        </Button>
      </div>

      {/* Bottom Sheet para móvil / Dialog para desktop */}
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetContent
          side="bottom"
          className="sm:hidden h-[85vh] rounded-t-3xl border-t border-violet-100 bg-white p-0"
        >
          <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-sm px-4 pt-3 pb-2 border-b border-violet-100/50">
            <div className="w-12 h-1.5 rounded-full bg-violet-200 mx-auto mb-4" />
            <SheetHeader className="text-left space-y-1">
              <SheetTitle className="text-lg font-bold text-violet-950">Registrar Transacción</SheetTitle>
              <SheetDescription className="text-sm text-violet-500">
                Añade un nuevo ingreso o gasto
              </SheetDescription>
            </SheetHeader>
          </div>
          <div className="px-4 py-4 overflow-y-auto h-full pb-8">
            <TransactionForm
              onSubmit={handleSubmit(onSubmit)}
              register={register}
              errors={errors}
              isPending={createMutation.isPending}
              watchType={watchType}
              categories={safeCategories}
              paymentMethods={safeMethods}
              events={safeEvents}
              onCancel={() => setIsOpen(false)}
            />
          </div>
        </SheetContent>
      </Sheet>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="hidden sm:block sm:max-w-[480px] max-h-[85vh] overflow-y-auto rounded-2xl p-6">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-violet-950">Registrar Transacción</DialogTitle>
            <DialogDescription className="text-sm text-violet-500">
              Añade un nuevo ingreso o gasto a las finanzas.
            </DialogDescription>
          </DialogHeader>
          <TransactionForm
            onSubmit={handleSubmit(onSubmit)}
            register={register}
            errors={errors}
            isPending={createMutation.isPending}
            watchType={watchType}
            categories={safeCategories}
            paymentMethods={safeMethods}
            events={safeEvents}
            onCancel={() => setIsOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Sub-componente del formulario extraído para reutilización
function TransactionForm({
  onSubmit,
  register,
  errors,
  isPending,
  watchType,
  categories,
  paymentMethods,
  events,
  onCancel
}: {
  onSubmit: () => void;
  register: any;
  errors: any;
  isPending: boolean;
  watchType: string;
  categories: any[];
  paymentMethods: any[];
  events: any[];
  onCancel: () => void;
}) {
  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <div className="grid grid-cols-2 gap-3 sm:gap-4">
        <TouchSelect
          id="type"
          label="Tipo"
          error={errors.type?.message}
          {...register("type")}
        >
          <option value="INPUT">💰 Ingreso</option>
          <option value="OUTPUT">💸 Gasto</option>
        </TouchSelect>

        <div className="space-y-2">
          <Label htmlFor="transactionDate" className="text-sm font-medium text-violet-900">Fecha</Label>
          <Input
            id="transactionDate"
            type="date"
            {...register("transactionDate")}
            className="min-h-[48px] rounded-xl border-violet-200 focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500"
          />
          {errors.transactionDate && <p className="text-xs text-red-500">{errors.transactionDate.message}</p>}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="amount" className="text-sm font-medium text-violet-900">Monto ($)</Label>
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-violet-400 font-medium">$</span>
          <Input
            id="amount"
            type="number"
            step="0.01"
            placeholder="0.00"
            {...register("amount")}
            className="min-h-[48px] rounded-xl border-violet-200 pl-8 text-lg font-semibold focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500"
          />
        </div>
        {errors.amount && <p className="text-xs text-red-500">{errors.amount.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="description" className="text-sm font-medium text-violet-900">Descripción (Opcional)</Label>
        <Input
          id="description"
          placeholder="Ej. Pago de Renta..."
          {...register("description")}
          className="min-h-[48px] rounded-xl border-violet-200 focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500"
        />
        {errors.description && <p className="text-xs text-red-500">{errors.description.message}</p>}
      </div>

      <TouchSelect
        id="categoryId"
        label="Categoría"
        error={errors.categoryId?.message}
        {...register("categoryId")}
      >
        <option value="">Seleccionar...</option>
        {categories.map((cat) => (
          <option key={cat.id} value={cat.id}>{cat.name}</option>
        ))}
      </TouchSelect>

      <TouchSelect
        id="paymentMethodId"
        label="Método de Pago"
        error={errors.paymentMethodId?.message}
        {...register("paymentMethodId")}
      >
        <option value="">Seleccionar...</option>
        {paymentMethods.map((pm) => (
          <option key={pm.id} value={pm.id}>{pm.name}</option>
        ))}
      </TouchSelect>

      <TouchSelect
        id="businessEventId"
        label="Evento (Opcional)"
        error={errors.businessEventId?.message}
        {...register("businessEventId")}
      >
        <option value="">Ninguno</option>
        {events.map((evt) => (
          <option key={evt.id} value={evt.id}>{evt.name}</option>
        ))}
      </TouchSelect>

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
          className={cn(
            "flex-1 h-12 rounded-xl text-white font-semibold shadow-lg active:scale-[0.98] transition-all touch-manipulation",
            watchType === 'OUTPUT' ? 'bg-red-600 hover:bg-red-700 shadow-red-600/20' : 'bg-green-600 hover:bg-green-700 shadow-green-600/20'
          )}
          disabled={isPending}
        >
          {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Guardar
        </Button>
      </div>
    </form>
  );
}