import React, { useState } from 'react';
import { AppBottomSheet } from '@/components/ui/app-bottom-sheet';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowDown, ArrowUp, RefreshCcw, AlertTriangle, Loader2 } from 'lucide-react';
import { inventarioApi } from '@/lib/inventario/api';
import type { InventoryItem, InventoryLocation, InventoryMovementType, CreateInventoryMovementDto } from '@/lib/inventario/types';

interface CreateMovementModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: () => void;
  items: InventoryItem[];
  locations: InventoryLocation[];
}

const MOVEMENT_TYPES: { id: InventoryMovementType; icon: React.ElementType; label: string; color: string }[] = [
  { id: 'in', icon: ArrowDown, label: 'Entrada', color: 'text-emerald-600 bg-emerald-50 border-emerald-200' },
  { id: 'out', icon: ArrowUp, label: 'Salida', color: 'text-blue-600 bg-blue-50 border-blue-200' },
  { id: 'transfer', icon: RefreshCcw, label: 'Traspaso', color: 'text-violet-600 bg-violet-50 border-violet-200' },
  { id: 'adjustment', icon: AlertTriangle, label: 'Ajuste', color: 'text-amber-600 bg-amber-50 border-amber-200' },
];

export default function CreateMovementModal({ isOpen, onClose, onCreated, items, locations }: CreateMovementModalProps) {
  const [type, setType] = useState<InventoryMovementType>('in');
  const [itemId, setItemId] = useState('');
  const [quantity, setQuantity] = useState('');
  const [originLocationId, setOriginLocationId] = useState('');
  const [destinationLocationId, setDestinationLocationId] = useState('');
  const [reason, setReason] = useState('');
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const resetForm = () => {
    setType('in');
    setItemId('');
    setQuantity('');
    setOriginLocationId('');
    setDestinationLocationId('');
    setReason('');
    setError(null);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = async () => {
    if (!itemId) {
      setError('Debes seleccionar un artículo.');
      return;
    }
    if (!quantity || Number(quantity) <= 0) {
      setError('La cantidad debe ser mayor a 0.');
      return;
    }
    if (!reason.trim()) {
      setError('Debes especificar un motivo para el movimiento.');
      return;
    }

    if (type === 'out' || type === 'transfer' || type === 'adjustment') {
      if (!originLocationId) {
        setError('Debes seleccionar la ubicación de origen.');
        return;
      }
    }

    if (type === 'in' || type === 'transfer') {
      if (!destinationLocationId) {
        setError('Debes seleccionar la ubicación de destino.');
        return;
      }
    }

    setIsSubmitting(true);
    setError(null);

    const payload: CreateInventoryMovementDto = {
      itemId,
      type,
      quantity: Number(quantity),
      reason: reason.trim(),
    };

    if (type === 'out' || type === 'transfer' || type === 'adjustment') {
      payload.originLocationId = originLocationId;
    }
    if (type === 'in' || type === 'transfer') {
      payload.destinationLocationId = destinationLocationId;
    }

    try {
      await inventarioApi.createMovement(payload);
      resetForm();
      onCreated();
    } catch (err: any) {
      setError(err.message || 'Error al registrar el movimiento.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AppBottomSheet
      open={isOpen}
      onOpenChange={handleClose}
      title="Registrar Movimiento"
      description="Registra una entrada, salida, traspaso o ajuste de stock."
    >
      <div className="space-y-6 pb-6">
        
        {/* Tipo de Movimiento */}
        <div className="space-y-2">
          <Label className="text-violet-900">Tipo de Movimiento</Label>
          <div className="grid grid-cols-2 gap-2">
            {MOVEMENT_TYPES.map(mov => {
              const Icon = mov.icon;
              const isActive = type === mov.id;
              return (
                <button
                  key={mov.id}
                  type="button"
                  onClick={() => setType(mov.id)}
                  className={`flex flex-col items-center justify-center gap-1.5 p-3 rounded-xl border transition-all ${
                    isActive
                      ? `${mov.color} shadow-sm font-semibold`
                      : 'bg-white border-gray-200 text-gray-500 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="text-xs">{mov.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Artículo y Cantidad */}
        <div className="space-y-4">
          <div className="space-y-2">
            <Label className="text-violet-900">Artículo <span className="text-red-500">*</span></Label>
            <Select value={itemId} onValueChange={setItemId}>
              <SelectTrigger className="border-violet-200">
                <SelectValue placeholder="Selecciona un artículo..." />
              </SelectTrigger>
              <SelectContent>
                {items.map(item => (
                  <SelectItem key={item.id} value={item.id}>
                    {item.name} <span className="text-gray-400 text-xs ml-1">({item.sku})</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-violet-900">Cantidad <span className="text-red-500">*</span></Label>
            <Input
              type="number"
              placeholder="Ej. 10"
              value={quantity}
              onChange={e => setQuantity(e.target.value)}
              className="border-violet-200"
            />
            {type === 'adjustment' && (
              <p className="text-[10px] text-amber-600 font-medium leading-tight">
                * Importante: Al hacer un ajuste, esta cantidad reemplazará y será el nuevo stock total exacto del artículo.
              </p>
            )}
          </div>
        </div>

        {/* Ubicaciones (Dinámico según el tipo) */}
        <div className="space-y-4 p-4 rounded-xl border border-violet-100 bg-violet-50/50">
          {(type === 'out' || type === 'transfer' || type === 'adjustment') && (
            <div className="space-y-2">
              <Label className="text-violet-900">Ubicación de Origen <span className="text-red-500">*</span></Label>
              <Select value={originLocationId} onValueChange={setOriginLocationId}>
                <SelectTrigger className="border-violet-200 bg-white">
                  <SelectValue placeholder="¿De dónde sale?" />
                </SelectTrigger>
                <SelectContent>
                  {locations.map(loc => (
                    <SelectItem key={loc.id} value={loc.id}>{loc.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {(type === 'in' || type === 'transfer') && (
            <div className="space-y-2">
              <Label className="text-violet-900">Ubicación de Destino <span className="text-red-500">*</span></Label>
              <Select value={destinationLocationId} onValueChange={setDestinationLocationId}>
                <SelectTrigger className="border-violet-200 bg-white">
                  <SelectValue placeholder="¿A dónde entra?" />
                </SelectTrigger>
                <SelectContent>
                  {locations.map(loc => (
                    <SelectItem key={loc.id} value={loc.id}>{loc.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        {/* Motivo */}
        <div className="space-y-2">
          <Label htmlFor="mov-reason" className="text-violet-900">Motivo / Descripción <span className="text-red-500">*</span></Label>
          <Input
            id="mov-reason"
            placeholder="Ej. Compra a proveedor, Inventario inicial, Avería..."
            value={reason}
            onChange={e => setReason(e.target.value)}
            className="border-violet-200"
          />
        </div>

        {/* Error */}
        {error && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-2">{error}</p>
        )}

        {/* Acciones */}
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
                Procesando...
              </>
            ) : (
              'Confirmar Movimiento'
            )}
          </Button>
        </div>
      </div>
    </AppBottomSheet>
  );
}
