import React from 'react';
import { cn } from '@/lib/utils';

interface StockIndicatorProps {
  total: number;
  available: number;
  reserved?: number;
  className?: string;
}

export function StockIndicator({ total, available, reserved = 0, className }: StockIndicatorProps) {
  // Protect against division by zero
  const safeTotal = total > 0 ? total : 1;
  const availablePercent = (available / safeTotal) * 100;
  const reservedPercent = (reserved / safeTotal) * 100;
  
  const isLowStock = total > 0 && available === 0;

  if (total === 0) {
    return <div className="text-xs text-gray-400">N/A</div>;
  }

  return (
    <div className={cn("flex flex-col gap-1 w-full min-w-[100px] max-w-[150px]", className)}>
      <div className="flex justify-between items-center text-xs">
        <span className={cn("font-medium", isLowStock ? "text-red-600" : "text-violet-900")}>
          {available} / {total}
        </span>
        {isLowStock && <span className="text-[10px] text-red-500 font-bold bg-red-50 px-1 rounded">Agotado</span>}
      </div>
      <div className="h-2 w-full bg-violet-100 rounded-full overflow-hidden flex">
        <div 
          className={cn("h-full transition-all", isLowStock ? "bg-red-500" : "bg-emerald-500")}
          style={{ width: `${availablePercent}%` }}
        />
        {reservedPercent > 0 && (
          <div 
            className="h-full bg-amber-400 transition-all opacity-70"
            style={{ width: `${reservedPercent}%` }}
          />
        )}
      </div>
    </div>
  );
}
