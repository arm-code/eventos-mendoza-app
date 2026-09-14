'use client';

import React, { createContext, useContext, ReactNode } from 'react';
import { useQuery } from '@tanstack/react-query';
import { businessApi } from '@/lib/api/business';
import { defaultBusinessConfig } from '@/lib/config';
import type { PublicBusinessResponse } from '@/types/finance';

interface TenantContextValue {
  negocio: string;
  publicBusiness: PublicBusinessResponse | undefined;
  isLoading: boolean;
}

const TenantContext = createContext<TenantContextValue | null>(null);

/**
 * TenantProvider — envuelve las rutas de un negocio específico.
 * Lee el slug de la URL (params.negocio) y obtiene la configuración pública
 * del backend sin necesidad de autenticación.
 */
export function TenantProvider({
  children,
  negocio,
}: {
  children: ReactNode;
  negocio: string;
}) {
  const { data: publicBusiness, isLoading } = useQuery({
    queryKey: ['publicBusiness', negocio],
    queryFn: () => businessApi.getPublicBusinessBySlug(negocio),
    staleTime: 1000 * 60 * 10, // 10 min cache
    retry: 1,
  });

  return (
    <TenantContext.Provider value={{ negocio, publicBusiness, isLoading }}>
      {children}
    </TenantContext.Provider>
  );
}

/**
 * Hook para consumir el contexto del negocio en cualquier componente hijo.
 * Devuelve los datos del negocio y un objeto `config` con fallbacks seguros.
 */
export function useTenant() {
  const ctx = useContext(TenantContext);
  if (!ctx) {
    throw new Error('useTenant debe usarse dentro de un <TenantProvider>');
  }

  const { negocio, publicBusiness, isLoading } = ctx;

  const config = publicBusiness?.config ?? defaultBusinessConfig;
  const businessName = publicBusiness?.name ?? config.name ?? 'Negocio';
  const logoUrl = publicBusiness?.logoUrl ?? config.logoUrl ?? '/images/eventos-mendoza.png';
  const whatsapp = config.whatsapp ?? '526566031549';
  const phone = config.phone ?? '';
  const email = config.email ?? '';
  const address = config.address ?? '';
  const paymentCards = config.paymentCards ?? [];

  return {
    negocio,
    publicBusiness,
    isLoading,
    config,
    businessName,
    logoUrl,
    whatsapp,
    phone,
    email,
    address,
    paymentCards,
  };
}
