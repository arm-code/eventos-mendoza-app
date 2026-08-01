import React, { useState, useEffect } from 'react';
import { AppBottomSheet } from '@/components/ui/app-bottom-sheet';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Warehouse, DoorOpen, Truck, Loader2 } from 'lucide-react';
import { inventarioApi } from '@/lib/inventario/api';
import type { InventoryLocation, InventoryLocationType, UpdateInventoryLocationDto } from '@/lib/inventario/types';

interface EditLocationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpdated: () => void;
  location: InventoryLocation | null;
}

const LOCATION_TYPES: { id: InventoryLocationType; icon: React.ElementType; label: string }[] = [
  { id: 'warehouse', icon: Warehouse, label: 'Bodega' },
  { id: 'room', icon: DoorOpen, label: 'Sala' },
  { id: 'vehicle', icon: Truck, label: 'Vehículo' },
];

export default function EditLocationModal({ isOpen, onClose, onUpdated, location }: EditLocationModalProps) {
  const [name, setName] = useState('');
  const [type, setType] = useState<InventoryLocationType>('warehouse');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (location && isOpen) {
      setName(location.name);
      setType(location.type);
      setError(null);
    }
  }, [location, isOpen]);

  const handleClose = () => {
    onClose();
  };

  const handleSubmit = async () => {
    if (!location) return;
    if (!name.trim()) {
      setError('El nombre de la ubicación es obligatorio.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    const payload: UpdateInventoryLocationDto = {
      name: name.trim(),
      type,
    };

    try {
      await inventarioApi.updateLocation(location.id, payload);
      onUpdated();
    } catch (err: any) {
      setError(err.message || 'Error al actualizar la ubicación.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!location) return null;

  return (
    <AppBottomSheet
      open={isOpen}
      onOpenChange={handleClose}
      title="Editar Ubicación"
      description="Actualiza la información de la bodega, sala o vehículo."
    >
      <div className="space-y-6 pb-8 px-1">
        <div className="space-y-5">
          <div className="space-y-2.5">
            <Label htmlFor="edit-loc-name" className="text-violet-900 text-sm font-semibold">
              Nombre <span className="text-red-500">*</span>
            </Label>
            <Input
              id="edit-loc-name"
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
                Actualizando...
              </>
            ) : (
              'Guardar Cambios'
            )}
          </Button>
        </div>
      </div>
    </AppBottomSheet>
  );
}