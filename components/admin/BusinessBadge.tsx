'use client';

import React from 'react';
import Image from 'next/image';
import { Building2 } from 'lucide-react';
import { useBusiness } from '@/lib/business';

export function BusinessBadge({ compact = false }: { compact?: boolean }) {
  const { business, loading } = useBusiness();

  const businessName = business?.name || 'Eventos Mendoza';
  const logoUrl = business?.logoUrl || '/images/eventos-mendoza.png';

  if (compact) {
    return (
      <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl border border-violet-100 bg-violet-50/50">
        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-white border border-violet-200 overflow-hidden shrink-0 shadow-sm">
          {logoUrl ? (
            <Image src={logoUrl} alt={businessName} width={22} height={22} className="object-contain" />
          ) : (
            <Building2 className="w-3.5 h-3.5 text-violet-600" />
          )}
        </span>
        <span className="text-xs font-bold text-violet-950 truncate max-w-[130px]">
          {loading ? 'Cargando...' : businessName}
        </span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3 px-3 py-3 rounded-xl border border-violet-100 bg-white shadow-sm">
      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white border border-violet-200 overflow-hidden shrink-0 shadow-sm">
        {logoUrl ? (
          <Image src={logoUrl} alt={businessName} width={30} height={30} className="object-contain" />
        ) : (
          <span className="font-bold text-violet-700 text-sm">{businessName.charAt(0).toUpperCase()}</span>
        )}
      </span>
      <div className="leading-tight min-w-0">
        <p className="text-sm font-bold text-violet-950 truncate">
          {loading ? 'Cargando...' : businessName}
        </p>
        <p className="text-xs text-violet-600 font-medium truncate">Gestión de Renta</p>
      </div>
    </div>
  );
}
