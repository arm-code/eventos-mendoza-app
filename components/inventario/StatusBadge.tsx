import React from 'react';
import { InventoryItemStatus } from '@/lib/inventario/types';
import { cn } from '@/lib/utils';
import { CheckCircle2, Wrench, AlertTriangle, AlertCircle, Trash2, CalendarCheck } from 'lucide-react';

interface StatusBadgeProps {
  status: InventoryItemStatus;
  className?: string;
}

const statusConfig: Record<InventoryItemStatus, { label: string; color: string; icon: React.ElementType }> = {
  available: { label: 'Disponible', color: 'bg-emerald-100 text-emerald-700 border-emerald-200', icon: CheckCircle2 },
  rented: { label: 'En renta', color: 'bg-blue-100 text-blue-700 border-blue-200', icon: CalendarCheck },
  maintenance: { label: 'Mantenimiento', color: 'bg-amber-100 text-amber-700 border-amber-200', icon: Wrench },
  damaged: { label: 'Dañado', color: 'bg-red-100 text-red-700 border-red-200', icon: AlertTriangle },
  lost: { label: 'Perdido', color: 'bg-red-100 text-red-700 border-red-200', icon: AlertCircle },
  retired: { label: 'Retirado', color: 'bg-gray-100 text-gray-700 border-gray-200', icon: Trash2 },
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status] || statusConfig.available;
  const Icon = config.icon;

  return (
    <span className={cn('inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border', config.color, className)}>
      <Icon className="w-3.5 h-3.5" />
      {config.label}
    </span>
  );
}
