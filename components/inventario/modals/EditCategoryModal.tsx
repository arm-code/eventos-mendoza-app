'use client';

import React, { useState, useEffect } from 'react';
import { AppBottomSheet } from '@/components/ui/app-bottom-sheet';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus, X, Loader2 } from 'lucide-react';
import { inventarioApi } from '@/lib/inventario/api';
import type { InventoryCategory, UpdateInventoryCategoryDto, CategoryAttribute, InventoryAttributeType } from '@/lib/inventario/types';

interface EditCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpdated: () => void;
  category: InventoryCategory | null;
}

export default function EditCategoryModal({ isOpen, onClose, onUpdated, category }: EditCategoryModalProps) {
  const [name, setName] = useState('');
  const [color, setColor] = useState('#8B5CF6');
  const [attributes, setAttributes] = useState<CategoryAttribute[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (category && isOpen) {
      setName(category.name);
      setColor(category.color || '#8B5CF6');
      setAttributes(category.attributes ? [...category.attributes] : []);
      setError(null);
    }
  }, [category, isOpen]);

  const handleClose = () => {
    onClose();
  };

  const handleAddAttribute = () => {
    setAttributes([...attributes, { name: '', type: 'string', required: false }]);
  };

  const handleRemoveAttribute = (index: number) => {
    const newAttrs = [...attributes];
    newAttrs.splice(index, 1);
    setAttributes(newAttrs);
  };

  const handleAttributeChange = (index: number, field: keyof CategoryAttribute, value: any) => {
    const newAttrs = [...attributes];
    newAttrs[index] = { ...newAttrs[index], [field]: value };
    setAttributes(newAttrs);
  };

  const handleSubmit = async () => {
    if (!category) return;
    if (!name.trim()) {
      setError('El nombre de la categoría es obligatorio.');
      return;
    }

    const hasEmptyAttributeNames = attributes.some(a => !a.name.trim());
    if (hasEmptyAttributeNames) {
      setError('Todos los atributos dinámicos deben tener un nombre.');
      return;
    }

    const attrNames = attributes.map(a => a.name.trim().toLowerCase());
    const hasDuplicates = new Set(attrNames).size !== attrNames.length;
    if (hasDuplicates) {
      setError('No puede haber dos atributos con el mismo nombre.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    const payload: UpdateInventoryCategoryDto = {
      name: name.trim(),
      color,
      attributes: attributes.map(a => ({ ...a, name: a.name.trim() }))
    };

    try {
      await inventarioApi.updateCategory(category.id, payload);
      onUpdated();
    } catch (err: any) {
      setError(err.message || 'Error al actualizar la categoría.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!category) return null;

  return (
    <AppBottomSheet
      open={isOpen}
      onOpenChange={handleClose}
      title="Editar Categoría"
      description="Actualiza la información de la categoría y sus atributos dinámicos."
    >
      <div className="space-y-6 pb-8 px-1">

        <div className="space-y-5">
          <div className="space-y-2.5">
            <Label htmlFor="cat-edit-name" className="text-violet-900 text-sm font-semibold">
              Nombre <span className="text-red-500">*</span>
            </Label>
            <Input
              id="cat-edit-name"
              value={name}
              onChange={e => setName(e.target.value)}
              className="h-12 sm:h-10 border-violet-200 rounded-xl text-base sm:text-sm"
            />
          </div>

          <div className="space-y-2.5">
            <Label htmlFor="cat-edit-color" className="text-violet-900 text-sm font-semibold">Color (opcional)</Label>
            <div className="flex gap-4 items-center">
              <Input
                id="cat-edit-color"
                type="color"
                value={color}
                onChange={e => setColor(e.target.value)}
                className="w-14 h-14 sm:w-12 sm:h-12 p-1.5 border-violet-200 cursor-pointer rounded-2xl shadow-sm touch-manipulation"
              />
              <span className="text-sm text-violet-600 font-mono bg-violet-50 px-3 py-2 rounded-xl border border-violet-100">{color}</span>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex justify-between items-center border-b border-violet-100 pb-3">
            <div>
              <h4 className="font-bold text-violet-950 text-sm">Atributos Dinámicos</h4>
              <p className="text-xs text-violet-400 mt-0.5">Campos extra para los artículos de esta categoría.</p>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-10 sm:h-8 px-3 text-xs border-violet-200 text-violet-600 hover:bg-violet-50 rounded-xl active:scale-95 transition-all"
              onClick={handleAddAttribute}
            >
              <Plus className="w-4 h-4 mr-1.5" />
              Añadir
            </Button>
          </div>

          {attributes.length === 0 ? (
            <div className="text-center py-8 border-2 border-dashed border-violet-200 rounded-2xl bg-violet-50/30">
              <p className="text-sm text-violet-400 font-medium">No hay atributos adicionales</p>
              <p className="text-xs text-violet-300 mt-1">Ej. Material, Color, Voltaje, Dimensiones</p>
            </div>
          ) : (
            <div className="space-y-3">
              {attributes.map((attr, idx) => (
                <div key={idx} className="flex gap-3 items-start p-4 bg-violet-50/60 rounded-2xl border border-violet-100">
                  <div className="flex-1 space-y-3 min-w-0">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <Label className="text-[11px] uppercase tracking-wider text-violet-500 font-bold">Nombre del campo</Label>
                        <Input
                          placeholder="Ej. Material"
                          value={attr.name}
                          onChange={e => handleAttributeChange(idx, 'name', e.target.value)}
                          className="h-12 sm:h-9 text-base sm:text-sm bg-white border-violet-200 rounded-xl"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-[11px] uppercase tracking-wider text-violet-500 font-bold">Tipo de dato</Label>
                        <Select value={attr.type} onValueChange={(val: InventoryAttributeType) => handleAttributeChange(idx, 'type', val)}>
                          <SelectTrigger className="h-12 sm:h-9 text-base sm:text-sm bg-white border-violet-200 rounded-xl">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="string" className="h-11 text-base sm:text-sm">Texto (String)</SelectItem>
                            <SelectItem value="number" className="h-11 text-base sm:text-sm">Número</SelectItem>
                            <SelectItem value="boolean" className="h-11 text-base sm:text-sm">Checkbox (Sí/No)</SelectItem>
                            <SelectItem value="date" className="h-11 text-base sm:text-sm">Fecha</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3 h-11 sm:h-auto">
                      <Checkbox
                        id={`edit-req-${idx}`}
                        checked={attr.required}
                        onCheckedChange={(checked) => handleAttributeChange(idx, 'required', !!checked)}
                        className="h-6 w-6 sm:h-5 sm:w-5 border-violet-300 data-[state=checked]:bg-violet-600 rounded-md"
                      />
                      <Label htmlFor={`edit-req-${idx}`} className="text-sm text-violet-700 cursor-pointer font-medium">
                        Dato obligatorio
                      </Label>
                    </div>
                  </div>

                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-11 w-11 text-violet-300 hover:text-red-500 hover:bg-red-50 rounded-xl active:scale-90 transition-all flex-shrink-0"
                    onClick={() => handleRemoveAttribute(idx)}
                  >
                    <X className="w-5 h-5" />
                  </Button>
                </div>
              ))}
            </div>
          )}
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