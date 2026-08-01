import React from 'react';
import { AppBottomSheet } from '@/components/ui/app-bottom-sheet';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/inventario/StatusBadge';
import { ItemTypeIcon } from '@/components/inventario/ItemTypeIcon';
import { StockIndicator } from '@/components/inventario/StockIndicator';
import { Edit2, Package, MapPin, DollarSign, ArrowLeftRight, Trash2 } from 'lucide-react';
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
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-12 h-12 sm:w-10 sm:h-10 rounded-2xl sm:rounded-xl bg-violet-100 flex items-center justify-center shrink-0">
            <ItemTypeIcon type={item.type} />
          </div>
          <div className="min-w-0">
            <span className="block truncate text-lg sm:text-xl font-bold text-violet-950">{item.name}</span>
            <span className="text-xs sm:text-sm font-normal text-violet-500 uppercase tracking-wider font-mono">{item.sku}</span>
          </div>
        </div>
      }
    >
      <div className="space-y-6 pb-8 px-1 mt-2">
        {/* Status */}
        <div className="flex justify-between items-center bg-violet-50 p-3 rounded-2xl border border-violet-100">
          <StatusBadge status={item.status} />
          <span className="text-xs text-violet-400 font-medium px-2">Creado recientemente</span>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-3 gap-2">
          <Button
            variant="outline"
            onClick={onEditClick}
            className="h-12 sm:h-10 border-violet-200 text-violet-700 hover:bg-violet-50 rounded-xl active:scale-95 transition-all font-semibold flex flex-col sm:flex-row gap-1 sm:gap-2 justify-center items-center px-1"
          >
            <Edit2 className="w-4 h-4 sm:w-4 sm:h-4" />
            <span className="text-[10px] sm:text-xs">Editar</span>
          </Button>
        </div>

        {/* KPIs Stock & Precios */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-4 sm:p-3 bg-white rounded-2xl border border-violet-100 shadow-sm active:scale-[0.98] transition-transform duration-150">
            <div className="flex items-center gap-2 text-violet-500 mb-2">
              <Package className="w-4 h-4" />
              <span className="text-xs font-bold uppercase tracking-wider">Stock</span>
            </div>
            <div className="flex items-end justify-between">
              <span className="text-3xl sm:text-2xl font-bold text-violet-950">{item.stock.total}</span>
              <span className="text-xs text-violet-400 mb-1.5 font-medium">Unidades</span>
            </div>
            <div className="mt-4 sm:mt-3">
              <StockIndicator total={item.stock.total} available={item.stock.available} reserved={item.stock.reserved} />
            </div>
          </div>

          <div className="space-y-3">
            <div className="p-4 sm:p-3 bg-white rounded-2xl border border-violet-100 shadow-sm flex items-center justify-between active:scale-[0.98] transition-transform duration-150">
              <div className="flex items-center gap-2 text-violet-500">
                <DollarSign className="w-4 h-4" />
                <span className="text-xs font-bold uppercase tracking-wider">Renta</span>
              </div>
              <span className="font-bold text-violet-900 text-lg sm:text-base">{item.rentPrice ? `$${item.rentPrice}` : '—'}</span>
            </div>
            <div className="p-4 sm:p-3 bg-white rounded-2xl border border-violet-100 shadow-sm flex items-center justify-between active:scale-[0.98] transition-transform duration-150">
              <div className="flex items-center gap-2 text-violet-500">
                <MapPin className="w-4 h-4" />
                <span className="text-xs font-bold uppercase tracking-wider">Ubicación</span>
              </div>
              <span className="font-bold text-violet-900 text-right text-sm truncate max-w-[50%]">
                {item.locationName ?? 'No asignada'}
              </span>
            </div>
          </div>
        </div>

        {/* Categoría y Atributos */}
        <div className="space-y-3">
          <h4 className="text-sm font-bold text-violet-950 border-b border-violet-100 pb-2">Detalles de Categoría</h4>
          <div className="bg-white border border-violet-100 rounded-2xl p-4 sm:p-3 shadow-sm space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-xs text-violet-500 font-bold uppercase tracking-wider">Categoría asignada</span>
              <span className="inline-flex px-3 py-1 rounded-lg text-xs font-bold bg-violet-100 text-violet-700">
                {item.categoryName}
              </span>
            </div>

            {Object.keys(item.attributes || {}).length > 0 && (
              <div className="pt-3 border-t border-violet-50">
                <p className="text-xs text-violet-500 font-bold uppercase tracking-wider mb-3">Atributos</p>
                <div className="grid grid-cols-2 gap-2.5">
                  {Object.entries(item.attributes).map(([key, val]) => (
                    <div key={key} className="bg-violet-50/70 p-3 rounded-xl border border-violet-100">
                      <p className="text-[10px] text-violet-400 uppercase tracking-wider font-bold mb-1">{key}</p>
                      <p className="text-sm font-bold text-violet-900 break-words">{String(val)}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Seriales */}
        {item.type === 'serialized' && (
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-violet-950 border-b border-violet-100 pb-2">Números de Serie</h4>
            {item.serials && item.serials.length > 0 ? (
              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {item.serials.map(serial => (
                  <div key={serial.id} className="flex items-center justify-between p-3.5 sm:p-3 rounded-xl bg-white border border-violet-100 shadow-sm active:bg-violet-50 transition-colors">
                    <span className="font-bold text-violet-950 text-sm font-mono">{serial.serialNumber}</span>
                    <StatusBadge status={serial.status} />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 border-2 border-dashed border-violet-200 rounded-2xl bg-violet-50/30">
                <p className="text-sm text-violet-500 font-medium">No hay números de serie registrados.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </AppBottomSheet>
  );
}