import React, { useState } from 'react';
import { AppBottomSheet } from '@/components/ui/app-bottom-sheet';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Warehouse, DoorOpen, Truck, Loader2 } from 'lucide-react';
import { inventarioApi } from '@/lib/inventario/api';
import type { InventoryLocationType, CreateInventoryLocationDto } from '@/lib/inventario/types';

interface CreateLocationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: () => void;
}

const LOCATION_TYPES: { id: InventoryLocationType; icon: React.ElementType; label: string }[] = [
  { id: 'warehouse', icon: Warehouse, label: 'Bodega' },
  { id: 'room', icon: DoorOpen, label: 'Sala' },
  { id: 'vehicle', icon: Truck, label: 'Vehículo' },
];

export default function CreateLocationModal({ isOpen, onClose, onCreated }: CreateLocationModalProps) {
  const [name, setName] = useState('');
  const [type, setType] = useState<InventoryLocationType>('warehouse');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const resetForm = () => {
    setName('');
    setType('warehouse');
    setError(null);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = async () => {
    if (!name.trim()) {
      setError('El nombre de la ubicación es obligatorio.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    const payload: CreateInventoryLocationDto = {
      name: name.trim(),
      type,
    };

    try {
      await inventarioApi.createLocation(payload);
      resetForm();
      onCreated();
    } catch (err: any) {
      setError(err.message || 'Error al crear la ubicación.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AppBottomSheet
      open={isOpen}
      onOpenChange={handleClose}
      title="Nueva Ubicación"
      description="Agrega una bodega, sala o vehículo para rastrear dónde están tus artículos."
    >
      <div className="space-y-6 pb-8 px-1">
        <div className="space-y-5">
          <div className="space-y-2.5">
            <Label htmlFor="loc-name" className="text-violet-900 text-sm font-semibold">
              Nombre <span className="text-red-500">*</span>
            </Label>
            <Input
              id="loc-name"
              placeholder="Ej. Bodega Central"
              value={name}
              onChange={e => setName(e.target.value)}
              className="h-12 sm:h-10 border-violet-200 rounded-xl text-base sm:text-sm"
            />
          </div>

          <div className="space-y-2.5">
            <Label className="text-violet-900 text-sm font-semibold">Tipo de Ubicación</Label>
            <div className="grid grid-cols-3 gap-3">
              {LOCATION_TYPES.map(locType => (
                <button
                  key={locType.id}
                  type="button"
                  onClick={() => setType(locType.id)}
                  className={`flex flex-col items-center justify-center gap-2 p-4 sm:p-3 rounded-2xl border-2 transition-all active:scale-95 duration-150 min-h-[80px] ${type === locType.id
                      ? 'bg-violet-50 border-violet-500 text-violet-700 shadow-sm'
                      : 'bg-white border-violet-100 text-violet-400 hover:border-violet-300'
                    }`}
                >
                  <locType.icon className="w-6 h-6 sm:w-5 sm:h-5" />
                  <span className="text-xs font-bold">{locType.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {error && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-3 font-medium">{error}</p>
        )}

        <div className="pt-4 flex flex-col-reverse sm:flex-row justify-end gap-3 border-t border-violet-100">
          <Button
            variant="outline"
            className="h-12 sm:h-10 border-violet-200 text-violet-700 hover:bg-violet-50 rounded-xl font-semibold active:scale-95 transition-all"
            onClick={handleClose}
            disabled={isSubmitting}
          >
            Cancelar
          </Button>
          <Button
            className="h-12 sm:h-10 bg-violet-600 hover:bg-violet-700 active:bg-violet-800 text-white shadow-md rounded-xl font-semibold active:scale-95 transition-all"
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Guardando...
              </>
            ) : (
              'Crear Ubicación'
            )}
          </Button>
        </div>
      </div>
    </AppBottomSheet>
  );
}