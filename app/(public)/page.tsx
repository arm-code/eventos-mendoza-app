import type { Metadata } from 'next';
import { PublicLandingView } from '@/components/public/PublicLandingView';

// ─── SEO Metadata ─────────────────────────────────────────────────────────────
export const metadata: Metadata = {
  title: 'Eventos Mendoza – Renta de Mobiliario para Eventos en Ciudad Juárez',
  description:
    'Renta de mesas, sillas, carpas, mantelería y artículos para fiestas. Entrega puntual, montaje cuidado y precios justos. ¡Cotiza por WhatsApp!',
};

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function HomePage() {
  return <PublicLandingView />;
}