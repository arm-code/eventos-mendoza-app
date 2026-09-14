'use client';

import { PublicLandingView } from '@/components/public/PublicLandingView';
import { useTenant } from '@/components/providers/TenantProvider';

export default function NegocioLandingPage() {
  const { negocio } = useTenant();
  return <PublicLandingView negocio={negocio} />;
}
