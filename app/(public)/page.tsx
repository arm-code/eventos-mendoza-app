'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { businessApi } from '@/lib/api/business';
import type { PublicBusinessResponse } from '@/types/finance';
import {
  Building2, Package, FileText, CreditCard, ChevronDown,
  Github, Youtube, Mail, Code2, Menu, X, MapPin, Phone,
  Sparkles, ArrowRight, Store, Users, Zap, Shield, Clock, Star
} from 'lucide-react';
import { cn } from '@/lib/utils';

// ─── Datos del SaaS ─────────────────────────────────────────────────────────
const SAAS_NAME = 'NegocioFácil';
const SAAS_TAGLINE = 'Administra tu negocio desde el celular';
const SAAS_DESCRIPTION = 'Sin complicaciones, en español, para los negocios de Ciudad Juárez.';
const SAAS_WHATSAPP = '526567788565';
const SAAS_EMAIL = 'alexis.rm162917@gmail.com';

const NAV_ITEMS = [
  { label: 'Inicio', href: '#inicio' },
  { label: 'Negocios', href: '#negocios' },
  { label: 'Funciones', href: '#funciones' },
  { label: 'Desarrollador', href: '#desarrollador' },
  { label: 'Contacto', href: '#contacto' },
];

const FEATURES = [
  {
    icon: Package,
    title: 'Inventario',
    desc: 'Controla lo que entra y lo que sale de tu tienda sin necesidad de hojas de papel.',
    color: 'from-violet-500 to-purple-600',
  },
  {
    icon: FileText,
    title: 'Cotizaciones',
    desc: 'Genera notas y cotizaciones en segundos. Compártelas por WhatsApp.',
    color: 'from-blue-500 to-cyan-600',
  },
  {
    icon: CreditCard,
    title: 'Finanzas',
    desc: 'Registra ingresos y gastos. Siempre sabe cuánto dinero tiene tu negocio.',
    color: 'from-emerald-500 to-teal-600',
  },
  {
    icon: Users,
    title: 'Clientes',
    desc: 'Guarda datos de tus clientes y da seguimiento a tus ventas fácilmente.',
    color: 'from-amber-500 to-orange-600',
  },
  {
    icon: Zap,
    title: 'Rápido',
    desc: 'Diseñado para que cualquier persona lo use desde el primer día, sin capacitación.',
    color: 'from-pink-500 to-rose-600',
  },
  {
    icon: Shield,
    title: 'Seguro',
    desc: 'Tus datos siempre respaldados en la nube. No pierdas información nunca más.',
    color: 'from-slate-500 to-slate-700',
  },
];

const TECHS = [
  'TypeScript', 'React', 'Next.js', 'NestJS', 'MySQL',
  'Docker', 'Tailwind', 'Supabase', 'TypeORM', 'Ubuntu Server',
];

// ─── Componente Navbar del SaaS ──────────────────────────────────────────────
function SaasNavbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handler);
    return () => window.removeEventListener('scroll', handler);
  }, []);

  const handleAnchor = (href: string) => {
    setIsMenuOpen(false);
    const el = document.querySelector(href);
    el?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
        scrolled
          ? 'bg-slate-950/95 backdrop-blur-md border-b border-white/10 shadow-xl'
          : 'bg-transparent'
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <button
          onClick={() => handleAnchor('#inicio')}
          className="flex items-center gap-2 group"
        >
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-purple-700 flex items-center justify-center shadow-lg shadow-violet-500/30">
            <Store className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-white text-lg tracking-tight">
            {SAAS_NAME}
          </span>
        </button>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-1">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.label}
              onClick={() => handleAnchor(item.href)}
              className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white hover:bg-white/10 rounded-lg transition-all"
            >
              {item.label}
            </button>
          ))}
        </nav>

        {/* CTA */}
        <div className="hidden md:flex items-center gap-3">
          <Link
            href="/auth/login"
            className="flex items-center gap-1.5 bg-violet-600 hover:bg-violet-500 text-white text-sm font-bold px-4 py-2 rounded-xl transition-all shadow-lg shadow-violet-600/30 active:scale-95"
          >
            Iniciar sesión
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Mobile toggle */}
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="md:hidden p-2 text-slate-300 hover:text-white hover:bg-white/10 rounded-lg transition-all"
        >
          {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-slate-950/98 border-t border-white/10 px-4 py-4 space-y-1">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.label}
              onClick={() => handleAnchor(item.href)}
              className="block w-full text-left px-4 py-3 text-sm font-medium text-slate-300 hover:text-white hover:bg-white/10 rounded-xl transition-all"
            >
              {item.label}
            </button>
          ))}
          <Link
            href="/auth/login"
            className="flex items-center justify-center gap-2 w-full mt-3 bg-violet-600 hover:bg-violet-500 text-white text-sm font-bold px-4 py-3 rounded-xl transition-all"
            onClick={() => setIsMenuOpen(false)}
          >
            Iniciar sesión <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      )}
    </header>
  );
}

// ─── Card de Negocio ─────────────────────────────────────────────────────────
function BusinessCard({ business }: { business: PublicBusinessResponse }) {
  const logo = business.logoUrl || business.config?.logoUrl;
  const address = business.config?.address;
  const initials = business.name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('');

  return (
    <Link
      href={`/${business.slug || business.id}`}
      className="group relative bg-white/5 hover:bg-white/10 border border-white/10 hover:border-violet-500/50 rounded-2xl p-6 flex flex-col justify-between gap-4 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-violet-500/10"
    >
      {/* Logo / Iniciales */}
      <div className="flex items-center gap-4">
        {logo ? (
          <img
            src={logo}
            alt={business.name}
            className="w-14 h-14 rounded-2xl object-cover border border-white/10"
          />
        ) : (
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-600 to-purple-800 flex items-center justify-center text-white text-xl font-bold shadow-lg shadow-violet-500/20">
            {initials}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-white text-base leading-tight truncate">
            {business.name}
          </h3>
          {address && (
            <p className="flex items-center gap-1 text-slate-400 text-xs mt-1 truncate">
              <MapPin className="w-3 h-3 flex-shrink-0" />
              {address}
            </p>
          )}
        </div>
      </div>

      {/* Servicios destacables si existen */}
      {business.config?.services && business.config.services.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {business.config.services.slice(0, 3).map((service, idx) => (
            <span
              key={idx}
              className="bg-white/5 border border-white/10 text-slate-300 text-[11px] px-2 py-0.5 rounded-md"
            >
              {service}
            </span>
          ))}
        </div>
      )}

      {/* CTA */}
      <div className="flex items-center justify-between pt-2 border-t border-white/5">
        <span className="inline-flex items-center gap-1 text-xs text-emerald-400 font-semibold">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          Activo
        </span>
        <span className="flex items-center gap-1 text-violet-400 group-hover:text-violet-300 text-xs font-semibold transition-colors">
          Ver negocio <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </span>
      </div>
    </Link>
  );
}

// ─── Página principal del SaaS ───────────────────────────────────────────────
export default function SaasLandingPage() {
  const { data: businesses = [], isLoading } = useQuery({
    queryKey: ['publicBusinesses'],
    queryFn: () => businessApi.getPublicBusinesses(),
    staleTime: 1000 * 60 * 5,
  });

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <SaasNavbar />

      {/* ── HERO ─────────────────────────────────────────────────────── */}
      <section
        id="inicio"
        className="relative min-h-screen flex items-center justify-center px-4 sm:px-6 overflow-hidden"
      >
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-violet-600/20 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-purple-800/15 rounded-full blur-3xl" />
          {/* Subtle grid */}
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: `linear-gradient(rgba(139,92,246,1) 1px, transparent 1px), linear-gradient(90deg, rgba(139,92,246,1) 1px, transparent 1px)`,
              backgroundSize: '60px 60px',
            }}
          />
        </div>

        <div className="relative max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-violet-500/15 border border-violet-500/30 text-violet-300 text-xs font-semibold px-4 py-2 rounded-full mb-8">
            <Sparkles className="w-3.5 h-3.5" />
            Hecho en Ciudad Juárez, para Ciudad Juárez
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black text-white mb-6 leading-tight">
            {SAAS_NAME}
          </h1>
          <p className="text-2xl sm:text-3xl font-bold text-violet-300 mb-4">
            {SAAS_TAGLINE}
          </p>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto mb-12 leading-relaxed">
            {SAAS_DESCRIPTION}
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <button
              onClick={() => document.querySelector('#negocios')?.scrollIntoView({ behavior: 'smooth' })}
              className="flex items-center gap-2 bg-violet-600 hover:bg-violet-500 text-white font-bold text-base px-8 py-4 rounded-2xl transition-all shadow-xl shadow-violet-600/30 active:scale-95"
            >
              <Building2 className="w-5 h-5" />
              Ver negocios registrados
            </button>
            <Link
              href="/auth/login"
              className="flex items-center gap-2 bg-white/10 hover:bg-white/15 border border-white/20 text-white font-bold text-base px-8 py-4 rounded-2xl transition-all active:scale-95"
            >
              Iniciar sesión
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Scroll indicator */}
          <button
            onClick={() => document.querySelector('#negocios')?.scrollIntoView({ behavior: 'smooth' })}
            className="inline-flex flex-col items-center gap-2 text-slate-500 hover:text-slate-300 transition-colors"
          >
            <span className="text-xs font-medium">Explorar</span>
            <ChevronDown className="w-5 h-5 animate-bounce" />
          </button>
        </div>
      </section>

      {/* ── NEGOCIOS ──────────────────────────────────────────────────── */}
      <section id="negocios" className="py-20 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-black text-white mb-3">
              Negocios registrados
            </h2>
            <p className="text-slate-400 max-w-xl mx-auto">
              Haz clic en cualquier negocio para ver su catálogo, datos de contacto y cuentas bancarias.
            </p>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  className="h-36 rounded-2xl bg-white/5 border border-white/10 animate-pulse"
                />
              ))}
            </div>
          ) : businesses.length === 0 ? (
            <div className="text-center py-16 bg-white/5 border border-white/10 rounded-2xl">
              <Store className="w-12 h-12 text-slate-600 mx-auto mb-4" />
              <p className="text-slate-400 font-medium">
                Aún no hay negocios registrados públicamente.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {businesses.map((b) => (
                <BusinessCard key={b.id} business={b} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── FUNCIONES ─────────────────────────────────────────────────── */}
      <section id="funciones" className="py-20 px-4 sm:px-6 border-t border-white/5">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-black text-white mb-3">
              ¿Qué puedes hacer con NegocioFácil?
            </h2>
            <p className="text-slate-400 max-w-xl mx-auto">
              Todo lo que tu negocio necesita, en un solo lugar, desde tu celular.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {FEATURES.map(({ icon: Icon, title, desc, color }) => (
              <div
                key={title}
                className="group bg-white/5 hover:bg-white/8 border border-white/10 hover:border-white/20 rounded-2xl p-6 transition-all duration-300 hover:-translate-y-0.5"
              >
                <div className={cn(
                  'w-12 h-12 rounded-xl bg-gradient-to-br flex items-center justify-center mb-4 shadow-lg',
                  color
                )}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-bold text-white text-lg mb-2">{title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── ESTADÍSTICAS ──────────────────────────────────────────────── */}
      <section className="py-16 px-4 sm:px-6 border-t border-white/5">
        <div className="max-w-4xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-8 text-center">
          {[
            { value: '100%', label: 'En español' },
            { value: '24/7', label: 'Disponible' },
            { value: '☁️', label: 'En la nube' },
            { value: '📱', label: 'Desde el celular' },
          ].map(({ value, label }) => (
            <div key={label}>
              <p className="text-3xl sm:text-4xl font-black text-violet-400 mb-1">{value}</p>
              <p className="text-slate-400 text-sm font-medium">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── DESARROLLADOR ─────────────────────────────────────────────── */}
      <section
        id="desarrollador"
        className="py-20 px-4 sm:px-6 border-t border-white/5"
      >
        <div className="max-w-3xl mx-auto">
          <div className="bg-white/5 border border-white/10 rounded-3xl p-8 sm:p-12">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-8">
              {/* Foto */}
              <div className="relative shrink-0">
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-violet-500 to-purple-600 blur-md opacity-50 scale-110" />
                <img
                  src="/profiles/square-alro.jpg"
                  alt="Alexis Romero Mendoza"
                  className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-full object-cover border-2 border-violet-500/50"
                />
              </div>

              {/* Info */}
              <div className="flex-1 text-center sm:text-left">
                <p className="text-violet-400 text-sm font-semibold mb-1">Desarrollado por</p>
                <h2 className="text-2xl sm:text-3xl font-black text-white mb-1">
                  Alexis Romero Mendoza
                </h2>
                <p className="text-slate-400 mb-4">
                  Ingeniero en Sistemas Computacionales · UACJ
                </p>

                {/* Tecnologías */}
                <div className="flex flex-wrap justify-center sm:justify-start gap-2 mb-6">
                  {TECHS.map((tech) => (
                    <span
                      key={tech}
                      className="bg-violet-500/15 border border-violet-500/30 text-violet-300 text-xs font-semibold px-3 py-1 rounded-full"
                    >
                      {tech}
                    </span>
                  ))}
                </div>

                {/* Links */}
                <div className="flex flex-wrap justify-center sm:justify-start gap-3">
                  <a
                    href="https://github.com/arm-code"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 bg-white/10 hover:bg-white/15 border border-white/20 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-all"
                  >
                    <Github className="w-4 h-4" /> GitHub
                  </a>
                  <a
                    href="https://youtube.com/@arm_code"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 bg-white/10 hover:bg-white/15 border border-white/20 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-all"
                  >
                    <Youtube className="w-4 h-4" /> YouTube
                  </a>
                  <a
                    href={`mailto:${SAAS_EMAIL}`}
                    className="flex items-center gap-2 bg-white/10 hover:bg-white/15 border border-white/20 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-all"
                  >
                    <Mail className="w-4 h-4" /> Correo
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── CONTACTO ──────────────────────────────────────────────────── */}
      <section
        id="contacto"
        className="py-20 px-4 sm:px-6 border-t border-white/5"
      >
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-black text-white mb-3">
            ¿Quieres registrar tu negocio?
          </h2>
          <p className="text-slate-400 mb-10 max-w-xl mx-auto">
            Escríbenos por WhatsApp o manda un correo. Te explicamos cómo funciona
            sin ningún costo y sin compromiso.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href={`https://wa.me/${SAAS_WHATSAPP}?text=Hola,%20quiero%20registrar%20mi%20negocio%20en%20NegocioFácil`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 bg-green-600 hover:bg-green-500 text-white font-bold text-base px-8 py-4 rounded-2xl transition-all shadow-xl shadow-green-600/20 w-full sm:w-auto justify-center active:scale-95"
            >
              <Phone className="w-5 h-5" />
              WhatsApp
            </a>
            <a
              href={`mailto:${SAAS_EMAIL}?subject=Quiero registrar mi negocio en NegocioFácil`}
              className="flex items-center gap-2 bg-white/10 hover:bg-white/15 border border-white/20 text-white font-bold text-base px-8 py-4 rounded-2xl transition-all w-full sm:w-auto justify-center active:scale-95"
            >
              <Mail className="w-5 h-5" />
              Enviar correo
            </a>
          </div>
        </div>
      </section>

      {/* ── FOOTER ────────────────────────────────────────────────────── */}
      <footer className="border-t border-white/10 py-8 px-4">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-slate-500 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-gradient-to-br from-violet-500 to-purple-700 flex items-center justify-center">
              <Store className="w-3 h-3 text-white" />
            </div>
            <span className="font-semibold text-slate-400">{SAAS_NAME}</span>
          </div>
          <p>&copy; {new Date().getFullYear()} {SAAS_NAME} · dejuarez.mx</p>
          <p className="flex items-center gap-1">
            Hecho con 💜 en Ciudad Juárez
          </p>
        </div>
      </footer>
    </div>
  );
}