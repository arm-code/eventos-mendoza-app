import React, { useState } from 'react';
import { AppBottomSheet } from '@/components/ui/app-bottom-sheet';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { inventarioApi } from '@/lib/inventario/api';
import type { CategoryAttribute, InventoryAttributeType, CreateInventoryCategoryDto } from '@/lib/inventario/types';
import { Plus, X, Loader2 } from 'lucide-react';

interface CreateCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: () => void;
}

const COLOR_PRESETS = [
  '#6b7280', // gray
  '#ef4444', // red
  '#f97316', // orange
  '#f59e0b', // amber
  '#10b981', // emerald
  '#06b6d4', // cyan
  '#3b82f6', // blue
  '#7c3aed', // violet
  '#ec4899', // pink
];

export default function CreateCategoryModal({ isOpen, onClose, onCreated }: CreateCategoryModalProps) {
  const [name, setName] = useState('');
  const [color, setColor] = useState('#7c3aed');
  const [attributes, setAttributes] = useState<CategoryAttribute[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const resetForm = () => {
    setName('');
    setColor('#7c3aed');
    setAttributes([]);
    setError(null);
  };

  const handleClose = () => {
    resetForm();
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
    if (!name.trim()) {
      setError('El nombre de la categoría es obligatorio.');
      return;
    }

    // Validate attributes
    for (const attr of attributes) {
      if (!attr.name.trim()) {
        setError('Todos los atributos deben tener un nombre.');
        return;
      }
    }

    setIsSubmitting(true);
    setError(null);

    const payload: CreateInventoryCategoryDto = {
      name: name.trim(),
      color,
      attributes: attributes.filter(a => a.name.trim() !== ''),
    };

    try {
      await inventarioApi.createCategory(payload);
      resetForm();
      onCreated();
    } catch (err: any) {
      setError(err.message || 'Error al crear la categoría.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AppBottomSheet
      open={isOpen}
      onOpenChange={handleClose}
      title="Nueva Categoría"
      description="Crea una agrupación lógica y define sus atributos dinámicos."
    >
      <div className="space-y-6 pb-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="category-name" className="text-violet-900">Nombre de Categoría <span className="text-red-500">*</span></Label>
            <Input
              id="category-name"
              placeholder="Ej. Sillas, Audio, Mantelería"
              value={name}
              onChange={e => setName(e.target.value)}
              className="border-violet-200"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-violet-900">Color Distintivo</Label>
            <div className="flex flex-wrap gap-2">
              {COLOR_PRESETS.map(c => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`w-8 h-8 rounded-full border-2 transition-transform ${color === c ? 'scale-110 border-violet-950 shadow-md' : 'border-transparent'}`}
                  style={{ backgroundColor: c }}
                  aria-label={`Seleccionar color ${c}`}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-violet-100 pb-2">
            <h4 className="text-sm font-semibold text-violet-950">Atributos Dinámicos</h4>
            <Button type="button" variant="ghost" size="sm" onClick={handleAddAttribute} className="h-8 text-violet-600 hover:bg-violet-50">
              <Plus className="w-4 h-4 mr-1" />
              Agregar Atributo
            </Button>
          </div>

          <p className="text-xs text-violet-500">
            Define propiedades específicas que tendrán los ítems de esta categoría (Ej. Material, Voltaje, Color).
          </p>

          <div className="space-y-3">
            {attributes.map((attr, index) => (
              <div key={index} className="flex flex-col sm:flex-row gap-3 items-start sm:items-center bg-violet-50/50 p-3 rounded-xl border border-violet-100">
                <div className="w-full sm:flex-1 space-y-1">
                  <Label className="text-[10px] uppercase tracking-wider text-violet-500">Nombre</Label>
                  <Input
                    placeholder="Ej. Capacidad (Kg)"
                    value={attr.name}
                    onChange={e => handleAttributeChange(index, 'name', e.target.value)}
                    className="h-9 border-violet-200 bg-white"
                  />
                </div>
                <div className="w-full sm:w-32 space-y-1">
                  <Label className="text-[10px] uppercase tracking-wider text-violet-500">Tipo</Label>
                  <Select value={attr.type} onValueChange={(val: InventoryAttributeType) => handleAttributeChange(index, 'type', val)}>
                    <SelectTrigger className="h-9 border-violet-200 bg-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="string">Texto</SelectItem>
                      <SelectItem value="number">Número</SelectItem>
                      <SelectItem value="boolean">Sí/No</SelectItem>
                      <SelectItem value="date">Fecha</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="w-full sm:w-auto flex items-center justify-between sm:justify-start gap-3 mt-2 sm:mt-0 sm:pt-5">
                  <label className="flex items-center gap-2 cursor-pointer text-sm text-violet-700">
                    <Checkbox
                      checked={attr.required}
                      onCheckedChange={(checked) => handleAttributeChange(index, 'required', !!checked)}
                      className="border-violet-300 data-[state=checked]:bg-violet-600"
                    />
                    Requerido
                  </label>
                  <Button type="button" variant="ghost" size="icon" onClick={() => handleRemoveAttribute(index)} className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50 shrink-0">
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}

            {attributes.length === 0 && (
              <div className="text-center py-6 border border-dashed border-violet-200 rounded-xl bg-violet-50/30">
                <p className="text-sm text-violet-400">Sin atributos configurados</p>
              </div>
            )}
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
              'Crear Categoría'
            )}
          </Button>
        </div>
      </div>
    </AppBottomSheet>
  );
}
