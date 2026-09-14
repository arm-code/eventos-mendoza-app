'use client';

import React from 'react';
import { useTenant } from '@/components/providers/TenantProvider';

/**
 * Footer específico para las rutas de un negocio.
 * Lee el nombre del negocio desde TenantProvider (sin petición extra a la API).
 */
export function TenantFooter() {
  const { businessName } = useTenant();

  return (
    <footer className="w-full py-6 mt-auto border-t border-violet-100 bg-violet-50/80">
      <div className="container mx-auto px-4 flex flex-col items-center justify-center text-xs text-violet-400">
        <p className="mb-2 md:mb-0 select-none cursor-default">
          &copy; {new Date().getFullYear()} {businessName}. Todos los derechos reservados.
        </p>
      </div>
    </footer>
  );
}
