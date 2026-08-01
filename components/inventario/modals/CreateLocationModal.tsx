import React, { useState } from 'react';
import { AppBottomSheet } from '@/components/ui/app-bottom-sheet';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
  { id: 'room', icon: DoorOpen, label: 'Sala / Cuarto' },
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
      <div className="space-y-6 pb-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="loc-name" className="text-violet-900">Nombre de la Ubicación <span className="text-red-500">*</span></Label>
            <Input
              id="loc-name"
              placeholder="Ej. Bodega Central, Unidad Móvil 01"
              value={name}
              onChange={e => setName(e.target.value)}
              className="border-violet-200"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-violet-900">Tipo de Ubicación</Label>
            <div className="grid grid-cols-3 gap-2">
              {LOCATION_TYPES.map(locType => (
                <button
                  key={locType.id}
                  type="button"
                  onClick={() => setType(locType.id)}
                  className={`flex flex-col items-center justify-center gap-1.5 p-3 rounded-xl border transition-all ${
                    type === locType.id
                      ? 'bg-violet-50 border-violet-500 text-violet-700 shadow-sm'
                      : 'bg-white border-violet-100 text-violet-400 hover:border-violet-300'
                  }`}
                >
                  <locType.icon className="w-5 h-5" />
                  <span className="text-xs font-medium">{locType.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {error && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-2">{error}</p>
        )}

        <div className="pt-4 flex justify-end gap-3 border-t border-violet-100">
          <Button
            variant="outline"
            className="border-violet-200 text-violet-700 hover:bg-violet-50"
            onClick={handleClose}
            disabled={isSubmitting}
          >
            Cancelar
          </Button>
          <Button
            className="bg-violet-600 hover:bg-violet-700 text-white shadow-md"
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
