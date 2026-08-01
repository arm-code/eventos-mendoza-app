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
  '#6b7280', '#ef4444', '#f97316', '#f59e0b', '#10b981',
  '#06b6d4', '#3b82f6', '#7c3aed', '#ec4899',
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
      <div className="space-y-6 pb-8 px-1">
        <div className="space-y-5">
          <div className="space-y-2.5">
            <Label htmlFor="category-name" className="text-violet-900 text-sm font-semibold">
              Nombre de Categoría <span className="text-red-500">*</span>
            </Label>
            <Input
              id="category-name"
              placeholder="Ej. Sillas, Audio, Mantelería"
              value={name}
              onChange={e => setName(e.target.value)}
              className="h-12 sm:h-10 border-violet-200 rounded-xl text-base sm:text-sm focus-visible:ring-violet-500"
            />
          </div>

          <div className="space-y-2.5">
            <Label className="text-violet-900 text-sm font-semibold">Color Distintivo</Label>
            <div className="flex flex-wrap gap-3">
              {COLOR_PRESETS.map(c => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`w-11 h-11 sm:w-9 sm:h-9 rounded-full border-[3px] transition-all active:scale-90 duration-150 shadow-sm ${color === c ? 'border-violet-950 scale-110 shadow-md' : 'border-transparent'
                    }`}
                  style={{ backgroundColor: c }}
                  aria-label={`Seleccionar color ${c}`}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-violet-100 pb-3">
            <h4 className="text-sm font-bold text-violet-950">Atributos Dinámicos</h4>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleAddAttribute}
              className="h-10 sm:h-8 px-3 text-violet-600 hover:bg-violet-50 rounded-lg active:scale-95 transition-all"
            >
              <Plus className="w-4 h-4 mr-1.5" />
              Agregar
            </Button>
          </div>

          <p className="text-xs text-violet-500 leading-relaxed">
            Define propiedades específicas que tendrán los ítems de esta categoría (Ej. Material, Voltaje, Color).
          </p>

          <div className="space-y-3">
            {attributes.map((attr, index) => (
              <div key={index} className="flex flex-col gap-3 bg-violet-50/60 p-4 rounded-2xl border border-violet-100">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-[11px] uppercase tracking-wider text-violet-500 font-bold">Nombre</Label>
                    <Input
                      placeholder="Ej. Capacidad (Kg)"
                      value={attr.name}
                      onChange={e => handleAttributeChange(index, 'name', e.target.value)}
                      className="h-12 sm:h-9 border-violet-200 bg-white rounded-xl text-base sm:text-sm"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[11px] uppercase tracking-wider text-violet-500 font-bold">Tipo</Label>
                    <Select value={attr.type} onValueChange={(val: InventoryAttributeType) => handleAttributeChange(index, 'type', val)}>
                      <SelectTrigger className="h-12 sm:h-9 border-violet-200 bg-white rounded-xl text-base sm:text-sm">
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
                </div>
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-3 cursor-pointer text-sm text-violet-700 h-11">
                    <Checkbox
                      checked={attr.required}
                      onCheckedChange={(checked) => handleAttributeChange(index, 'required', !!checked)}
                      className="h-5 w-5 border-violet-300 data-[state=checked]:bg-violet-600 rounded-md"
                    />
                    <span>Requerido</span>
                  </label>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemoveAttribute(index)}
                    className="h-11 w-11 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-xl active:scale-90 transition-all"
                  >
                    <X className="w-5 h-5" />
                  </Button>
                </div>
              </div>
            ))}

            {attributes.length === 0 && (
              <div className="text-center py-8 border-2 border-dashed border-violet-200 rounded-2xl bg-violet-50/30">
                <p className="text-sm text-violet-400 font-medium">Sin atributos configurados</p>
                <p className="text-xs text-violet-300 mt-1">Toca "Agregar" para crear uno</p>
              </div>
            )}
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
              'Crear Categoría'
            )}
          </Button>
        </div>
      </div>
    </AppBottomSheet>
  );
}