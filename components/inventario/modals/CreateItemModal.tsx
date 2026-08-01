'use client';

import React, { useState } from 'react';
import { AppBottomSheet } from '@/components/ui/app-bottom-sheet';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Box, Hash, Layers, Zap, Clock, Loader2 } from 'lucide-react';
import { inventarioApi } from '@/lib/inventario/api';
import type { InventoryCategory, CreateInventoryItemDto, InventoryItemType } from '@/lib/inventario/types';

interface CreateItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: () => void;
  categories: InventoryCategory[];
  locations: import('@/lib/inventario/types').InventoryLocation[];
}

const ITEM_TYPES: { id: InventoryItemType; icon: React.ElementType; label: string }[] = [
  { id: 'product', icon: Box, label: 'Producto' },
  { id: 'serialized', icon: Hash, label: 'Serializado' },
  { id: 'combo', icon: Layers, label: 'Combo' },
  { id: 'consumable', icon: Zap, label: 'Consumible' },
  { id: 'service', icon: Clock, label: 'Servicio' },
];

export default function CreateItemModal({ isOpen, onClose, onCreated, categories, locations }: CreateItemModalProps) {
  const [itemType, setItemType] = useState<InventoryItemType>('product');
  const [name, setName] = useState('');
  const [sku, setSku] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [locationId, setLocationId] = useState('');
  const [initialStock, setInitialStock] = useState('');
  const [rentPrice, setRentPrice] = useState('');
  const [salePrice, setSalePrice] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const resetForm = () => {
    setName('');
    setSku('');
    setCategoryId('');
    setLocationId('');
    setInitialStock('');
    setRentPrice('');
    setSalePrice('');
    setItemType('product');
    setError(null);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = async () => {
    if (!name.trim() || !sku.trim() || !categoryId) {
      setError('Nombre, SKU y categoría son obligatorios.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    const payload: CreateInventoryItemDto = {
      name: name.trim(),
      sku: sku.trim(),
      type: itemType,
      categoryId,
      locationId: locationId || undefined,
      initialStock: initialStock ? parseFloat(initialStock) : undefined,
      rentPrice: rentPrice ? parseFloat(rentPrice) : undefined,
      salePrice: salePrice ? parseFloat(salePrice) : undefined,
    };

    try {
      await inventarioApi.createItem(payload);
      resetForm();
      onCreated();
    } catch (err: any) {
      setError(err.message || 'Error al crear el ítem.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AppBottomSheet
      open={isOpen}
      onOpenChange={handleClose}
      title="Nuevo Ítem de Inventario"
      description="Agrega un nuevo producto, combo o servicio al catálogo."
    >
      <div className="space-y-6 pb-6">
        {/* Información Básica */}
        <div className="space-y-4">
          <h4 className="text-sm font-semibold text-violet-950 border-b border-violet-100 pb-1">Información Básica</h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="item-name" className="text-violet-900">Nombre del artículo <span className="text-red-500">*</span></Label>
              <Input
                id="item-name"
                placeholder="Ej. Silla Tiffany Blanca"
                value={name}
                onChange={e => setName(e.target.value)}
                className="border-violet-200"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="item-sku" className="text-violet-900">SKU / Código <span className="text-red-500">*</span></Label>
              <Input
                id="item-sku"
                placeholder="Ej. ST-001"
                value={sku}
                onChange={e => setSku(e.target.value)}
                className="border-violet-200"
              />
            </div>
          </div>

          {/* Tipo de Ítem */}
          <div className="space-y-2">
            <Label className="text-violet-900">Tipo de Ítem</Label>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {ITEM_TYPES.map(type => (
                <button
                  key={type.id}
                  type="button"
                  onClick={() => setItemType(type.id)}
                  className={`flex flex-col items-center justify-center gap-1.5 p-2 rounded-xl border transition-all ${
                    itemType === type.id
                      ? 'bg-violet-50 border-violet-500 text-violet-700 shadow-sm'
                      : 'bg-white border-violet-100 text-violet-400 hover:border-violet-300'
                  }`}
                >
                  <type.icon className="w-5 h-5" />
                  <span className="text-xs font-medium">{type.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Categoría */}
          <div className="space-y-2">
            <Label className="text-violet-900">Categoría <span className="text-red-500">*</span></Label>
            <Select value={categoryId} onValueChange={setCategoryId}>
              <SelectTrigger className="border-violet-200">
                <SelectValue placeholder="Selecciona una categoría" />
              </SelectTrigger>
              <SelectContent>
                {categories.map(cat => (
                  <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Precios */}
        <div className="space-y-4">
          <h4 className="text-sm font-semibold text-violet-950 border-b border-violet-100 pb-1">Precios</h4>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-violet-900">Precio de Renta ($)</Label>
              <Input
                type="number"
                placeholder="0.00"
                value={rentPrice}
                onChange={e => setRentPrice(e.target.value)}
                className="border-violet-200"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-violet-900">Precio de Venta ($)</Label>
              <Input
                type="number"
                placeholder="0.00"
                value={salePrice}
                onChange={e => setSalePrice(e.target.value)}
                className="border-violet-200"
              />
            </div>
          </div>
        </div>

        {/* Stock y Ubicación (Condicional) */}
        {(itemType === 'product' || itemType === 'consumable' || itemType === 'serialized') && (
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-violet-950 border-b border-violet-100 pb-1">Inventario Inicial</h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-violet-900">Stock Inicial</Label>
                <Input
                  type="number"
                  placeholder="0"
                  value={initialStock}
                  onChange={e => setInitialStock(e.target.value)}
                  className="border-violet-200"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-violet-900">Ubicación de origen</Label>
                <Select value={locationId} onValueChange={setLocationId}>
                  <SelectTrigger className="border-violet-200">
                    <SelectValue placeholder="Selecciona" />
                  </SelectTrigger>
                  <SelectContent>
                    {locations.map(loc => (
                      <SelectItem key={loc.id} value={loc.id}>{loc.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <p className="text-xs text-violet-400">
              * El sistema creará un movimiento de entrada por esta cantidad automáticamente.
            </p>
          </div>
        )}

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
                Guardando...
              </>
            ) : (
              'Guardar Ítem'
            )}
          </Button>
        </div>
      </div>
    </AppBottomSheet>
  );
}
