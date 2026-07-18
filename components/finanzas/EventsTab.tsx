'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { financeApi } from '@/lib/api/finance';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, CalendarDays, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/useToast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const eventSchema = yup.object().shape({
  name: yup.string().required("El nombre es obligatorio").max(150, "Máximo 150 caracteres"),
  clientName: yup.string().max(100, "Máximo 100 caracteres").optional(),
  eventDate: yup.string().optional(),
  notes: yup.string().max(500, "Máximo 500 caracteres").optional(),
});

type EventFormData = yup.InferType<typeof eventSchema>;

export default function EventsTab() {
  const { showError, showSuccess } = useToast();
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  
  const { data: events = [], isLoading, error } = useQuery({
    queryKey: ['businessEvents'],
    queryFn: () => financeApi.getBusinessEvents(),
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => financeApi.createBusinessEvent(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['businessEvents'] });
      showSuccess("Evento creado exitosamente");
      setIsOpen(false);
      reset();
    },
    onError: (err: any) => {
      showError(err.message || "Error al crear el evento");
    }
  });

  const { register, handleSubmit, formState: { errors }, reset } = useForm<EventFormData>({
    resolver: yupResolver(eventSchema) as any,
  });

  const onSubmit = (data: EventFormData) => {
    createMutation.mutate(data);
  };

  if (error) {
    showError(error.message || "No se pudieron cargar los eventos.");
  }

  const safeEvents = Array.isArray(events) ? events : [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Eventos de Negocio</h2>
          <p className="text-violet-900">
            Administra los eventos a los que se asocian tus finanzas.
          </p>
        </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button className="bg-violet-600 hover:bg-violet-700 text-white">
              <PlusCircle className="mr-2 h-4 w-4" />
              Nuevo Evento
            </Button>
          </DialogTrigger>
          <DialogContent className="w-[95vw] sm:max-w-[425px] max-h-[90vh] overflow-y-auto p-4 sm:p-6">
            <DialogHeader>
              <DialogTitle>Crear Evento de Negocio</DialogTitle>
              <DialogDescription>
                Registra un nuevo evento para asociarle transacciones.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nombre del Evento</Label>
                <Input id="name" placeholder="Ej. Boda Civil Juan y María" {...register("name")} />
                {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="clientName">Nombre del Cliente (Opcional)</Label>
                <Input id="clientName" placeholder="Juan Pérez" {...register("clientName")} />
                {errors.clientName && <p className="text-sm text-red-500">{errors.clientName.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="eventDate">Fecha del Evento (Opcional)</Label>
                <Input id="eventDate" type="date" {...register("eventDate")} />
                {errors.eventDate && <p className="text-sm text-red-500">{errors.eventDate.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">Notas (Opcional)</Label>
                <Input id="notes" placeholder="Detalles extra..." {...register("notes")} />
                {errors.notes && <p className="text-sm text-red-500">{errors.notes.message}</p>}
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
          <CardTitle>Listado de Eventos</CardTitle>
          <CardDescription>
            Eventos registrados en el sistema.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-4 text-violet-500">Cargando eventos...</div>
          ) : safeEvents.length === 0 ? (
            <div className="text-center py-8 text-violet-400">
              <CalendarDays className="mx-auto h-8 w-8 mb-2 opacity-50" />
              <p>No hay eventos registrados.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {safeEvents.map((event) => (
                <div key={event.id} className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
                  <div className="flex items-center gap-4">
                    <div className="p-2 rounded-full bg-violet-100">
                      <CalendarDays className="h-4 w-4 text-violet-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-violet-950">
                        {event.name}
                      </p>
                      {(event.date || event.eventDate) && (
                        <p className="text-xs text-violet-500">
                          {new Date(event.date || event.eventDate!).toLocaleDateString()}
                        </p>
                      )}
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
