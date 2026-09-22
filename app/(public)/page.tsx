'use client';

import { PublicLandingView } from '@/components/public/PublicLandingView';
import { getBusinessSlugFromHostname } from '@/lib/subdomain';

export default function HomePage() {
  const slug = getBusinessSlugFromHostname();
  return <PublicLandingView negocio={slug} />;
}