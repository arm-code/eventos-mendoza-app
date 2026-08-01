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
  const [color, setColor] = useState('#8B5CF6'); // violet-500 default
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

    // Validar atributos: todos deben tener nombre
    const hasEmptyAttributeNames = attributes.some(a => !a.name.trim());
    if (hasEmptyAttributeNames) {
      setError('Todos los atributos dinámicos deben tener un nombre, o debes eliminarlos.');
      return;
    }

    // Comprobar nombres duplicados
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
      <div className="space-y-6 pb-6">
        
        {/* Información Básica */}
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="cat-edit-name" className="text-violet-900">Nombre de la Categoría <span className="text-red-500">*</span></Label>
            <Input
              id="cat-edit-name"
              value={name}
              onChange={e => setName(e.target.value)}
              className="border-violet-200"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="cat-edit-color" className="text-violet-900">Color (opcional)</Label>
            <div className="flex gap-3 items-center">
              <Input
                id="cat-edit-color"
                type="color"
                value={color}
                onChange={e => setColor(e.target.value)}
                className="w-12 h-10 p-1 border-violet-200 cursor-pointer rounded-lg"
              />
              <span className="text-sm text-violet-600 font-mono">{color}</span>
            </div>
          </div>
        </div>

        {/* Atributos Dinámicos */}
        <div className="space-y-3">
          <div className="flex justify-between items-center border-b border-violet-100 pb-2">
            <div>
              <h4 className="font-semibold text-violet-950 text-sm">Atributos Dinámicos</h4>
              <p className="text-xs text-violet-400">Campos extra que tendrán los artículos de esta categoría.</p>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-8 text-xs border-violet-200 text-violet-600 hover:bg-violet-50"
              onClick={handleAddAttribute}
            >
              <Plus className="w-3 h-3 mr-1" />
              Añadir Atributo
            </Button>
          </div>

          {attributes.length === 0 ? (
            <p className="text-xs text-center py-4 text-violet-300 italic">No hay atributos adicionales. (Ej. Material, Color, Voltaje, Dimensiones)</p>
          ) : (
            <div className="space-y-3">
              {attributes.map((attr, idx) => (
                <div key={idx} className="flex gap-2 items-start p-3 bg-violet-50/50 rounded-xl border border-violet-100">
                  
                  <div className="flex-1 space-y-3">
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <Label className="text-[10px] uppercase tracking-wider text-violet-500">Nombre del campo</Label>
                        <Input
                          placeholder="Ej. Material"
                          value={attr.name}
                          onChange={e => handleAttributeChange(idx, 'name', e.target.value)}
                          className="h-8 text-sm bg-white border-violet-200"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-[10px] uppercase tracking-wider text-violet-500">Tipo de dato</Label>
                        <Select
                          value={attr.type}
                          onValueChange={(val: InventoryAttributeType) => handleAttributeChange(idx, 'type', val)}
                        >
                          <SelectTrigger className="h-8 text-sm bg-white border-violet-200">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="string">Texto (String)</SelectItem>
                            <SelectItem value="number">Número</SelectItem>
                            <SelectItem value="boolean">Checkbox (Sí/No)</SelectItem>
                            <SelectItem value="date">Fecha</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id={`edit-req-${idx}`}
                        checked={attr.required}
                        onCheckedChange={(checked) => handleAttributeChange(idx, 'required', !!checked)}
                        className="border-violet-300 data-[state=checked]:bg-violet-600"
                      />
                      <Label htmlFor={`edit-req-${idx}`} className="text-xs text-violet-700 cursor-pointer">
                        Dato obligatorio
                      </Label>
                    </div>
                  </div>

                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-violet-300 hover:text-red-500 hover:bg-red-50 rounded-lg flex-shrink-0"
                    onClick={() => handleRemoveAttribute(idx)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>

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
