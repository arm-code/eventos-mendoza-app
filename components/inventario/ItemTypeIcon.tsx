import React from 'react';
import { InventoryItemType } from '@/lib/inventario/types';
import { Box, Hash, Layers, Zap, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ItemTypeIconProps {
  type: InventoryItemType;
  className?: string;
  showLabel?: boolean;
}

const typeConfig: Record<InventoryItemType, { label: string; icon: React.ElementType }> = {
  product: { label: 'Producto', icon: Box },
  serialized: { label: 'Serializado', icon: Hash },
  combo: { label: 'Combo', icon: Layers },
  consumable: { label: 'Consumible', icon: Zap },
  service: { label: 'Servicio', icon: Clock },
};

export function ItemTypeIcon({ type, className, showLabel = false }: ItemTypeIconProps) {
  const config = typeConfig[type] || typeConfig.product;
  const Icon = config.icon;

  return (
    <div className={cn('flex items-center gap-1.5 text-violet-600', className)} title={config.label}>
      <Icon className="w-4 h-4" />
      {showLabel && <span className="text-xs font-medium">{config.label}</span>}
    </div>
  );
}
