import React from 'react';
import { AppBottomSheet } from '@/components/ui/app-bottom-sheet';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/inventario/StatusBadge';
import { ItemTypeIcon } from '@/components/inventario/ItemTypeIcon';
import { StockIndicator } from '@/components/inventario/StockIndicator';
import { Edit2, Package, MapPin, DollarSign } from 'lucide-react';
import type { InventoryItem } from '@/lib/inventario/types';

interface ItemDetailSheetProps {
  isOpen: boolean;
  onClose: () => void;
  item: InventoryItem | null;
  onEditClick: () => void;
}

export default function ItemDetailSheet({ isOpen, onClose, item, onEditClick }: ItemDetailSheetProps) {
  if (!item) return null;

  return (
    <AppBottomSheet
      open={isOpen}
      onOpenChange={(open) => !open && onClose()}
      title={
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-violet-100 flex items-center justify-center shrink-0">
            <ItemTypeIcon type={item.type} />
          </div>
          <div className="truncate">
            <span className="block truncate text-xl">{item.name}</span>
            <span className="text-sm font-normal text-violet-500 uppercase tracking-wider">{item.sku}</span>
          </div>
        </div>
      }
    >
      <div className="space-y-6 pb-6 mt-4">
        {/* Actions & Status */}
        <div className="flex justify-between items-center bg-violet-50 p-3 rounded-xl border border-violet-100">
          <StatusBadge status={item.status} />
          <Button variant="ghost" size="sm" onClick={onEditClick} className="text-violet-600 hover:bg-white hover:shadow-sm">
            <Edit2 className="w-4 h-4 mr-2" />
            Editar Info
          </Button>
        </div>

        {/* KPIs Stock & Precios */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 bg-white rounded-xl border border-violet-100 shadow-sm">
            <div className="flex items-center gap-2 text-violet-500 mb-1">
              <Package className="w-4 h-4" />
              <span className="text-xs font-semibold uppercase tracking-wider">Stock</span>
            </div>
            <div className="flex items-end justify-between">
              <span className="text-2xl font-bold text-violet-950">{item.stock.total}</span>
              <span className="text-xs text-violet-400 mb-1">Unidades</span>
            </div>
            <div className="mt-3">
              <StockIndicator total={item.stock.total} available={item.stock.available} reserved={item.stock.reserved} />
            </div>
          </div>

          <div className="space-y-3">
            <div className="p-3 bg-white rounded-xl border border-violet-100 shadow-sm flex items-center justify-between">
              <div className="flex items-center gap-2 text-violet-500">
                <DollarSign className="w-4 h-4" />
                <span className="text-xs font-semibold uppercase tracking-wider">Renta</span>
              </div>
              <span className="font-bold text-violet-900">{item.rentPrice ? `$${item.rentPrice}` : '—'}</span>
            </div>
            <div className="p-3 bg-white rounded-xl border border-violet-100 shadow-sm flex items-center justify-between">
              <div className="flex items-center gap-2 text-violet-500">
                <MapPin className="w-4 h-4" />
                <span className="text-xs font-semibold uppercase tracking-wider">Ubicación</span>
              </div>
              <span className="font-semibold text-violet-900 text-right text-sm">{item.locationName ?? 'No asignada'}</span>
            </div>
          </div>
        </div>

        {/* Categoría y Atributos */}
        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-violet-950 border-b border-violet-100 pb-1">Detalles de Categoría</h4>
          <div className="bg-white border border-violet-100 rounded-xl p-4 shadow-sm space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-xs text-violet-500 font-medium">Categoría asignada</span>
              <span className="inline-flex px-2 py-0.5 rounded-md text-xs font-bold bg-violet-100 text-violet-700">
                {item.categoryName}
              </span>
            </div>
            
            {Object.keys(item.attributes || {}).length > 0 && (
              <div className="pt-2 border-t border-violet-50">
                <p className="text-xs text-violet-500 font-medium mb-2">Atributos:</p>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(item.attributes).map(([key, val]) => (
                    <div key={key} className="bg-violet-50/50 p-2 rounded-lg border border-violet-50">
                      <p className="text-[10px] text-violet-400 uppercase tracking-wider">{key}</p>
                      <p className="text-sm font-medium text-violet-900">{String(val)}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Seriales (Solo si es serializado) */}
        {item.type === 'serialized' && (
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-violet-950 border-b border-violet-100 pb-1">Números de Serie</h4>
            {item.serials && item.serials.length > 0 ? (
              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {item.serials.map(serial => (
                  <div key={serial.id} className="flex items-center justify-between p-2 rounded-lg bg-white border border-violet-100 shadow-sm">
                    <span className="font-medium text-violet-950 text-sm font-mono">{serial.serialNumber}</span>
                    <StatusBadge status={serial.status} />
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-violet-500 italic">No hay números de serie registrados. Obtén el detalle completo para verlos.</p>
            )}
          </div>
        )}
      </div>
    </AppBottomSheet>
  );
}
