'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { financeApi } from '@/lib/api/finance';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, Tags, Loader2, Hash } from "lucide-react";
import { useToast } from "@/hooks/useToast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

const categorySchema = yup.object().shape({
  code: yup.string().required("El código es obligatorio").max(20, "Máximo 20 caracteres"),
  name: yup.string().required("El nombre es obligatorio").max(100, "Máximo 100 caracteres"),
  description: yup.string().max(255, "Máximo 255 caracteres"),
});

type CategoryFormData = yup.InferType<typeof categorySchema>;

export default function CategoriesTab() {
  const { showError, showSuccess } = useToast();
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);

  const { data: categories = [], isLoading, error } = useQuery({
    queryKey: ['transactionCategories'],
    queryFn: () => financeApi.getCategories(),
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => financeApi.createCategory(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactionCategories'] });
      showSuccess("Categoría creada exitosamente");
      setIsOpen(false);
      reset();
    },
    onError: (err: any) => {
      showError(err.message || "Error al crear la categoría");
    }
  });

  const { register, handleSubmit, formState: { errors }, reset } = useForm<CategoryFormData>({
    resolver: yupResolver(categorySchema) as any,
  });

  const onSubmit = (data: CategoryFormData) => {
    createMutation.mutate({
      ...data,
      code: data.code.toUpperCase(),
      isActive: true
    });
  };

  if (error) {
    showError(error.message || "No se pudieron cargar las categorías.");
  }

  const safeCategories = Array.isArray(categories) ? categories : [];

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Lista de categorías */}
      <Card className="border-violet-100 shadow-sm">
        <CardHeader className="pb-3 sm:pb-4">
          <CardTitle className="text-base sm:text-lg">Listado de Categorías</CardTitle>
          <CardDescription className="text-xs sm:text-sm">
            Categorías activas en el sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12 gap-3 text-violet-400">
              <Loader2 className="h-6 w-6 animate-spin" />
              <p className="text-sm">Cargando categorías...</p>
            </div>
          ) : safeCategories.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-violet-400">
              <div className="p-4 rounded-full bg-violet-50 mb-3">
                <Tags className="h-6 w-6 text-violet-300" />
              </div>
              <p className="text-sm font-medium">No hay categorías</p>
              <p className="text-xs mt-1">Crea tu primera categoría</p>
            </div>
          ) : (
            <div className="space-y-1">
              <AnimatePresence>
                {safeCategories.map((cat, index) => (
                  <motion.div
                    key={cat.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.03 }}
                    whileTap={{ scale: 0.995, backgroundColor: "rgba(139, 92, 246, 0.04)" }}
                    className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-xl active:bg-violet-50/50 transition-colors touch-manipulation cursor-pointer"
                  >
                    <div className="flex-shrink-0 p-2.5 sm:p-3 rounded-xl bg-violet-100">
                      <Tags className="h-4 w-4 sm:h-5 sm:w-5 text-violet-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm sm:text-base font-medium text-violet-950 truncate">
                          {cat.name}
                        </p>
                        <span className="flex-shrink-0 text-[10px] sm:text-xs px-2 py-0.5 bg-violet-100 text-violet-700 rounded-full font-medium">
                          {cat.code || 'N/A'}
                        </span>
                      </div>
                      {cat.description && (
                        <p className="text-xs sm:text-sm text-violet-500 mt-0.5 truncate">
                          {cat.description}
                        </p>
                      )}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </CardContent>
      </Card>

      {/* FAB móvil - posicionado arriba del bottom nav */}
      <div className="sm:hidden fixed bottom-[72px] right-4 z-30">
        <motion.button
          whileTap={{ scale: 0.88 }}
          onClick={() => setIsOpen(true)}
          className="flex items-center justify-center w-14 h-14 rounded-full bg-violet-600 text-white shadow-xl shadow-violet-600/30 active:bg-violet-700 touch-manipulation"
        >
          <PlusCircle className="h-6 w-6" />
        </motion.button>
      </div>

      {/* Botón desktop */}
      <div className="hidden sm:flex justify-end">
        <Button
          onClick={() => setIsOpen(true)}
          className="bg-violet-600 hover:bg-violet-700 text-white h-11 px-6 rounded-xl shadow-lg shadow-violet-600/20 active:scale-[0.98] transition-all touch-manipulation"
        >
          <PlusCircle className="mr-2 h-4 w-4" />
          Nueva Categoría
        </Button>
      </div>

      {/* Bottom Sheet móvil */}
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetContent
          side="bottom"
          className="sm:hidden h-[80vh] rounded-t-3xl border-t border-violet-100 bg-white p-0"
        >
          <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-sm px-4 pt-3 pb-2 border-b border-violet-100/50">
            <div className="w-10 h-1 rounded-full bg-violet-200 mx-auto mb-3" />
            <SheetHeader className="text-left space-y-1">
              <SheetTitle className="text-lg font-bold text-violet-950">Crear Categoría</SheetTitle>
              <SheetDescription className="text-sm text-violet-500">
                Añade una nueva categoría
              </SheetDescription>
            </SheetHeader>
          </div>
          <div className="px-4 py-4 overflow-y-auto h-full pb-8">
            <CategoryForm
              onSubmit={handleSubmit(onSubmit)}
              register={register}
              errors={errors}
              isPending={createMutation.isPending}
              onCancel={() => setIsOpen(false)}
            />
          </div>
        </SheetContent>
      </Sheet>

      {/* Dialog desktop */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="hidden sm:block sm:max-w-[425px] rounded-2xl p-6">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-violet-950">Crear Categoría</DialogTitle>
            <DialogDescription className="text-sm text-violet-500">
              Añade una nueva categoría para clasificar transacciones.
            </DialogDescription>
          </DialogHeader>
          <CategoryForm
            onSubmit={handleSubmit(onSubmit)}
            register={register}
            errors={errors}
            isPending={createMutation.isPending}
            onCancel={() => setIsOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}

function CategoryForm({
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
          <Hash className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-violet-400" />
          <Input
            id="code"
            placeholder="Ej. RENTA"
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
          placeholder="Ej. Renta de mobiliario"
          {...register("name")}
          className="min-h-[48px] rounded-xl border-violet-200 focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500"
        />
        {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="description" className="text-sm font-medium text-violet-900">Descripción (Opcional)</Label>
        <Input
          id="description"
          placeholder="Detalle adicional..."
          {...register("description")}
          className="min-h-[48px] rounded-xl border-violet-200 focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500"
        />
        {errors.description && <p className="text-xs text-red-500">{errors.description.message}</p>}
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