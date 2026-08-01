'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Phone, Mail, MapPin, Clock, Shield, Users, Truck, CheckCircle,
  ChevronDown, Star, CreditCard, Building2
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { businessApi } from '@/lib/api/business';
import { getBusinessSlugFromHostname } from '@/lib/subdomain';
import ProductCarousel from '@/components/products/ProductCarousel';
import ShareButtons from '@/components/ShareButtons';
import { cn } from '@/lib/utils';
import { defaultBusinessConfig } from '@/lib/config';

// ─── Componentes estáticos auxiliares ─────────────────────────────────────────
const VALUES = [
  { icon: Clock, title: 'Responsabilidad', text: 'Cumplimos horarios y lo acordado en tu pedido.' },
  { icon: Shield, title: 'Higiene', text: 'Mobiliario limpio, sanitizado y en buen estado.' },
  { icon: Users, title: 'Trato humano', text: 'Atención clara, honesta y cercana.' },
];

const DEFAULT_SERVICES = [
  { emoji: '🪑', label: 'Sillas plegables' },
  { emoji: '🧺', label: 'Mesas rectangulares' },
  { emoji: '⛺', label: 'Carpas abiertas y cerradas' },
  { emoji: '🧵', label: 'Manteles y fundas' },
  { emoji: '🎈', label: 'Arcos y mamparas' },
  { emoji: '🚚', label: 'Entrega y montaje' },
  { emoji: '📦', label: 'Paquetes para eventos' },
  { emoji: '🧾', label: 'Facturación incluida' },
];

const STATS = [
  { value: '+500', label: 'eventos atendidos' },
  { value: '4+', label: 'años de experiencia' },
  { value: '8+', label: 'rutas de entrega' },
];

const TESTIMONIALS = [
  { text: 'Llegaron puntual y el montaje quedó perfecto para el bautizo.', author: 'María P.', rating: 5 },
  { text: 'Todo limpio y como nuevo. Buen precio por paquete de 100 personas.', author: 'César R.', rating: 5 },
  { text: 'Nos salvaron con una carpa extra por la lluvia. ¡Gracias!', author: 'Lupita G.', rating: 5 },
];

const FAQS = [
  {
    question: '¿Con cuánto tiempo debo reservar?',
    answer: 'Para fines de semana, sugerimos 1–2 semanas antes. En temporada alta, cuanto antes mejor.',
  },
  {
    question: '¿Requieren anticipo?',
    answer: 'NO, apartamos fecha con teléfono y dirección, y se liquida a la entrega.',
  },
  {
    question: '¿Hacen entrega y montaje?',
    answer: 'Sí. Entregamos, montamos y recogemos el mobiliario sin costo extra dentro de nuestra zona de cobertura.',
  },
];

function FaqItem({ question, answer }: { question: string; answer: string }) {
  return (
    <details className="group border border-violet-200 rounded-xl bg-white overflow-hidden">
      <summary className="flex items-center justify-between gap-4 p-4 cursor-pointer list-none hover:bg-violet-50/50 active:bg-violet-100/50 transition-colors">
        <span className="font-semibold text-violet-900 text-sm">{question}</span>
        <ChevronDown className="w-4 h-4 text-violet-500 shrink-0 transition-transform group-open:rotate-180" />
      </summary>
      <div className="px-4 pb-4 text-violet-600 text-sm border-t border-violet-100 pt-3">
        {answer}
      </div>
    </details>
  );
}

export function PublicLandingView() {
  const slug = getBusinessSlugFromHostname();

  const { data: publicBusiness } = useQuery({
    queryKey: ['publicBusiness', slug],
    queryFn: () => businessApi.getPublicBusinessBySlug(slug),
    staleTime: 1000 * 60 * 10, // 10 min
  });

  const config = publicBusiness?.config || defaultBusinessConfig;
  const businessName = publicBusiness?.name || config.name || 'Eventos Mendoza';
  const logoUrl = publicBusiness?.logoUrl || config.logoUrl || '/images/eventos-mendoza.png';
  const phone = config.phone || '656 603 1549';
  const whatsapp = config.whatsapp || '526566031549';
  const email = config.email || 'contacto@eventosmendoza.com';
  const address = config.address || 'Ciudad Juárez, Chihuahua';
  const description = config.description || 'Renta de mesas, sillas, carpas, mantelería y artículos para fiestas.';
  const historyText = config.history || `Nacimos como un negocio familiar para resolver algo simple: que cada evento en ${address} tenga mobiliario seguro, limpio y a tiempo.`;
  const missionText = config.mission || 'Facilitar eventos memorables con renta confiable de mobiliario y servicio honesto.';
  const visionText = config.vision || `Ser el proveedor de renta de mobiliario más recomendado en ${address}, destacando por puntualidad, limpieza y precio justo.`;
  const services = config.services?.length ? config.services : DEFAULT_SERVICES.map(s => s.label);
  const coverageAreas = config.coverageAreas?.length ? config.coverageAreas : ['Ciudad Juárez', 'Chihuahua', 'Area Talamas', 'Riveras del Bravo'];
  const paymentCards = config.paymentCards || [];

  const phoneRaw = phone.replace(/[^0-9+]/g, '');
  const waClean = whatsapp.replace(/[^0-9]/g, '');
  const waLink = `https://wa.me/${waClean}?text=Hola,%20quiero%20cotizar%20renta%20de%20mobiliario%20para%20mi%20evento`;

  return (
    <div className="min-h-screen">
      {/* ── HERO ──────────────────────────────────────────────────────── */}
      <section className="relative bg-gradient-to-b from-violet-50 to-white pt-8 pb-12 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center">
            {/* Logo */}
            <div className="flex justify-center mb-5">
              <div className="relative w-20 h-20 sm:w-24 sm:h-24">
                <Image
                  src={logoUrl}
                  alt={`Logotipo de ${businessName}`}
                  fill
                  className="object-contain"
                  priority
                />
              </div>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-violet-900 mb-3">
              {businessName}
            </h1>
            <p className="text-base sm:text-lg text-violet-600 max-w-2xl mx-auto leading-relaxed">
              {description}{' '}
              Entrega puntual, montaje cuidado y atención cálida en{' '}
              <strong className="text-violet-700">{address}</strong>.
            </p>

            {/* Trust badges */}
            <div className="mt-6 flex flex-wrap items-center justify-center gap-2 text-xs sm:text-sm">
              {[
                { icon: CheckCircle, label: 'Entrega puntual' },
                { icon: Shield, label: 'Equipo limpio' },
                { icon: Truck, label: 'Montaje y retiro' },
              ].map(({ icon: Icon, label }) => (
                <span
                  key={label}
                  className="flex items-center gap-1.5 bg-white text-violet-700 px-3 py-1.5 rounded-full border border-violet-200 shadow-sm"
                >
                  <Icon className="w-3.5 h-3.5" />
                  {label}
                </span>
              ))}
            </div>

            {/* CTAs */}
            <div className="mt-8 flex flex-col sm:flex-row justify-center gap-3">
              <Link
                href={waLink}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(
                  'inline-flex items-center justify-center gap-2 h-12 px-6 rounded-xl font-bold text-sm',
                  'bg-green-600 text-white hover:bg-green-700 active:bg-green-800',
                  'transition-colors shadow-lg shadow-green-600/20',
                  'active:scale-[0.97]'
                )}
              >
                <Phone className="w-4 h-4" />
                Cotizar por WhatsApp
              </Link>
              <a
                href={`tel:${phoneRaw}`}
                className={cn(
                  'inline-flex items-center justify-center gap-2 h-12 px-6 rounded-xl font-bold text-sm',
                  'bg-violet-600 text-white hover:bg-violet-700 active:bg-violet-800',
                  'transition-colors shadow-lg shadow-violet-600/20',
                  'active:scale-[0.97]'
                )}
              >
                <Phone className="w-4 h-4" />
                Llamar {phone}
              </a>
            </div>

            {/* Share Buttons */}
            <ShareButtons />
          </div>
        </div>
      </section>

      {/* ── CARRUSEL ────────────────────────────────────────────────── */}
      <ProductCarousel />

      {/* ── CONTENT ─────────────────────────────────────────────────── */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pb-16 space-y-8">
        {/* Historia + Misión grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <section className="bg-white rounded-2xl shadow-sm border border-violet-100 p-5 sm:p-6">
            <h2 className="text-xl sm:text-2xl font-bold text-violet-900 mb-3">Nuestra historia</h2>
            <p className="text-violet-600 text-sm leading-relaxed">
              {historyText}
            </p>
          </section>

          <section className="bg-white rounded-2xl shadow-sm border border-violet-100 p-5 sm:p-6">
            <h2 className="text-xl sm:text-2xl font-bold text-violet-900 mb-3">Misión y visión</h2>
            <div className="space-y-2.5">
              <div>
                <h3 className="font-semibold text-violet-700 text-sm">Misión:</h3>
                <p className="text-violet-600 text-sm">
                  {missionText}
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-violet-700 text-sm">Visión:</h3>
                <p className="text-violet-600 text-sm">
                  {visionText}
                </p>
              </div>
            </div>
          </section>
        </div>

        {/* Valores */}
        <section className="bg-white rounded-2xl shadow-sm border border-violet-100 p-5 sm:p-6">
          <h2 className="text-xl sm:text-2xl font-bold text-violet-900 mb-6 text-center">Nuestros valores</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {VALUES.map(({ icon: Icon, title, text }) => (
              <div key={title} className="text-center">
                <div className="w-14 h-14 mx-auto mb-3 rounded-full bg-violet-100 flex items-center justify-center text-violet-600">
                  <Icon className="w-7 h-7" />
                </div>
                <h3 className="font-bold text-violet-900 text-sm mb-1">{title}</h3>
                <p className="text-violet-600 text-sm">{text}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Catálogo de Servicios Dinámico */}
        <section className="bg-white rounded-2xl shadow-sm border border-violet-100 p-5 sm:p-6">
          <h2 className="text-xl sm:text-2xl font-bold text-violet-900 mb-5">¿Qué rentamos?</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {services.map((item, idx) => (
              <div
                key={idx}
                className={cn(
                  'bg-violet-50 border border-violet-200 rounded-xl p-4 text-center',
                  'text-violet-700 font-medium text-sm flex flex-col items-center justify-center gap-1',
                  'hover:bg-violet-100 active:bg-violet-200 active:scale-[0.98]',
                  'transition-all cursor-pointer select-none'
                )}
              >
                <span className="text-2xl block">✨</span>
                {item}
              </div>
            ))}
          </div>
        </section>

        {/* Cuentas Bancarias para Depósito/Anticipo */}
        {paymentCards.length > 0 && (
          <section className="bg-white rounded-2xl shadow-sm border border-violet-100 p-5 sm:p-6">
            <h2 className="text-xl sm:text-2xl font-bold text-violet-900 mb-2 flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-violet-600" />
              Cuentas para anticipos y transferencias
            </h2>
            <p className="text-xs text-violet-500 mb-4">
              Información oficial para liquidación de pedidos o reserva de fecha.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {paymentCards.map((card, idx) => (
                <div key={card.id || idx} className="p-3.5 rounded-xl border border-violet-100 bg-violet-50/50">
                  <p className="text-xs font-bold text-violet-950">{card.bank} — {card.beneficiary}</p>
                  {card.clabe && (
                    <p className="text-xs text-violet-700 font-mono mt-1">CLABE: <strong>{card.clabe}</strong></p>
                  )}
                  {card.cardNumber && (
                    <p className="text-xs text-violet-600 font-mono mt-0.5">Tarjeta: {card.cardNumber}</p>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Métricas + Cobertura */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <section className="bg-white rounded-2xl shadow-sm border border-violet-100 p-5 sm:p-6">
            <h2 className="text-xl sm:text-2xl font-bold text-violet-900 mb-5">En números</h2>
            <dl className="grid grid-cols-3 gap-4 text-center">
              {STATS.map(({ value, label }) => (
                <div key={label}>
                  <dt className="text-2xl sm:text-3xl font-bold text-violet-900">{value}</dt>
                  <dd className="text-violet-600 text-xs sm:text-sm mt-1">{label}</dd>
                </div>
              ))}
            </dl>
          </section>

          <section className="bg-white rounded-2xl shadow-sm border border-violet-100 p-5 sm:p-6">
            <h2 className="text-xl sm:text-2xl font-bold text-violet-900 mb-3">Cobertura</h2>
            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-violet-600 mt-0.5 flex-shrink-0" />
              <p className="text-violet-600 text-sm leading-relaxed">
                <strong className="text-violet-700">{address}</strong>. Cobertura disponible en:{' '}
                <strong className="text-violet-700">
                  {coverageAreas.join(', ')}
                </strong>.
              </p>
            </div>
          </section>
        </div>

        {/* Testimonios */}
        <section className="bg-white rounded-2xl shadow-sm border border-violet-100 p-5 sm:p-6">
          <h2 className="text-xl sm:text-2xl font-bold text-violet-900 mb-5">Lo que dicen nuestros clientes</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {TESTIMONIALS.map(({ text, author, rating }) => (
              <div key={author} className="bg-violet-50 border border-violet-200 rounded-xl p-4">
                <div className="flex gap-0.5 mb-2">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={cn(
                        'w-3.5 h-3.5',
                        i < rating ? 'text-amber-400 fill-amber-400' : 'text-violet-200'
                      )}
                    />
                  ))}
                </div>
                <p className="text-violet-700 text-sm mb-3 italic">&ldquo;{text}&rdquo;</p>
                <p className="text-violet-900 font-bold text-xs">— {author}</p>
              </div>
            ))}
          </div>
        </section>

        {/* FAQ */}
        <section className="bg-white rounded-2xl shadow-sm border border-violet-100 p-5 sm:p-6">
          <h2 className="text-xl sm:text-2xl font-bold text-violet-900 mb-5">Preguntas frecuentes</h2>
          <div className="space-y-2.5">
            {FAQS.map((faq, index) => (
              <FaqItem key={index} {...faq} />
            ))}
          </div>
        </section>
      </div>

      {/* ── CTA FINAL ─────────────────────────────────────────────────── */}
      <section className="bg-gradient-to-br from-violet-600 to-violet-800 px-4 sm:px-6 py-10">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">¿Listo para tu evento?</h2>
          <p className="text-violet-200 mb-6 max-w-xl mx-auto text-sm sm:text-base">
            Escríbenos por WhatsApp o llámanos. Te cotizamos en minutos.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-3">
            <Link
              href={waLink}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                'inline-flex items-center justify-center gap-2 h-12 px-6 rounded-xl font-bold text-sm',
                'bg-green-500 hover:bg-green-400 active:bg-green-600 text-white',
                'transition-colors shadow-lg',
                'active:scale-[0.97]'
              )}
            >
              <Phone className="w-4 h-4" />
              WhatsApp {phone}
            </Link>
            <a
              href={`tel:${phoneRaw}`}
              className={cn(
                'inline-flex items-center justify-center gap-2 h-12 px-6 rounded-xl font-bold text-sm',
                'bg-white text-violet-700 hover:bg-violet-50 active:bg-violet-100',
                'transition-colors shadow-lg',
                'active:scale-[0.97]'
              )}
            >
              <Phone className="w-4 h-4" />
              Llamar {phone}
            </a>
            <a
              href={`mailto:${email}`}
              className={cn(
                'inline-flex items-center justify-center gap-2 h-12 px-6 rounded-xl font-bold text-sm',
                'bg-violet-700 hover:bg-violet-600 active:bg-violet-800 text-white',
                'border border-violet-500',
                'transition-colors shadow-lg',
                'active:scale-[0.97]'
              )}
            >
              <Mail className="w-4 h-4" />
              {email}
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
