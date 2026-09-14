'use client';

import React from 'react';
import Link from 'next/link';
import {
  Github, Youtube, Mail, Code2, ArrowLeft, Store,
  GraduationCap, MapPin, Sparkles, Phone, ExternalLink, Award
} from 'lucide-react';

const SAAS_NAME = 'NegocioFácil';
const SAAS_EMAIL = 'alexis.rm162917@gmail.com';
const SAAS_WHATSAPP = '526567788565';

const TECHS = [
  'TypeScript', 'React', 'Next.js', 'NestJS', 'MySQL',
  'Sybase ASE', 'Linux', 'Docker', 'Tailwind CSS', 'Supabase',
  'TypeORM', 'Ubuntu Server', 'REST APIs', 'Git'
];

export default function DeveloperPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col justify-between">
      {/* ── Navbar superior ───────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 bg-slate-950/90 backdrop-blur-md border-b border-white/10 px-4 sm:px-6 h-16 flex items-center justify-between">
        <Link
          href="/"
          className="flex items-center gap-2 text-slate-300 hover:text-white font-medium text-sm transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span>Volver a {SAAS_NAME}</span>
        </Link>

        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-500 to-purple-700 flex items-center justify-center">
            <Store className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="font-bold text-white text-sm tracking-tight hidden sm:inline">
            {SAAS_NAME}
          </span>
        </div>
      </header>

      {/* ── Contenido Principal ──────────────────────────────────────── */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-12 flex items-center">
        <div className="w-full bg-white/5 border border-white/10 rounded-3xl p-6 sm:p-12 backdrop-blur-sm relative overflow-hidden shadow-2xl">
          {/* Ambient Glow */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-violet-600/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col items-center text-center">
            {/* Foto con Aura */}
            <div className="relative mb-6">
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-violet-500 via-purple-500 to-violet-500 animate-pulse blur-lg opacity-60 scale-110" />
              <img
                src="/profiles/square-alro.jpg"
                alt="Alexis Romero Mendoza"
                className="relative w-32 h-32 sm:w-40 sm:h-40 rounded-full object-cover border-4 border-violet-500/50 shadow-2xl"
              />
            </div>

            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-violet-500/15 border border-violet-500/30 text-violet-300 text-xs font-semibold px-4 py-1.5 rounded-full mb-4">
              <Sparkles className="w-3.5 h-3.5" />
              Creador y Desarrollador Principal
            </div>

            {/* Nombre y Título */}
            <h1 className="text-3xl sm:text-4xl font-black text-white mb-2 tracking-tight">
              Alexis Romero Mendoza
            </h1>
            <p className="flex items-center justify-center gap-2 text-violet-400 font-semibold text-base mb-1">
              <GraduationCap className="w-5 h-5" />
              Ingeniero en Sistemas Computacionales
            </p>
            <p className="flex items-center justify-center gap-1.5 text-slate-400 text-sm mb-8">
              <MapPin className="w-4 h-4 text-slate-500" />
              Egresado de la Universidad Autónoma de Ciudad Juárez (UACJ)
            </p>

            {/* Breve descripción del proyecto */}
            <div className="max-w-2xl bg-white/5 border border-white/10 rounded-2xl p-6 mb-8 text-left">
              <h2 className="text-sm font-bold text-violet-300 uppercase tracking-wider mb-2 flex items-center gap-2">
                <Award className="w-4 h-4 text-violet-400" />
                Propósito del SaaS
              </h2>
              <p className="text-slate-300 text-sm leading-relaxed">
                <strong className="text-white">NegocioFácil</strong> nace con el objetivo de brindar una plataforma moderna, ágil y accesible para los pequeños negocios de Ciudad Juárez. Diseñado para simplificar inventarios, notas de venta, cotizaciones y finanzas sin la complejidad de sistemas tradicionales.
              </p>
            </div>

            {/* Stack Tecnológico */}
            <div className="w-full max-w-2xl mb-8">
              <div className="flex items-center justify-center gap-2 mb-4">
                <Code2 className="w-4 h-4 text-violet-400" />
                <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400">
                  Tecnologías y Herramientas
                </h3>
              </div>
              <div className="flex flex-wrap justify-center gap-2">
                {TECHS.map((tech) => (
                  <span
                    key={tech}
                    className="bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 text-xs font-medium px-3.5 py-1.5 rounded-xl transition-all"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>

            {/* Canales y Enlaces */}
            <div className="w-full max-w-2xl pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <a
                href="https://github.com/arm-code"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 bg-white/10 hover:bg-white/15 border border-white/20 text-white text-sm font-semibold px-5 py-3 rounded-2xl transition-all w-full sm:w-auto justify-center active:scale-95"
              >
                <Github className="w-4 h-4" />
                GitHub
                <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
              </a>

              <a
                href="https://youtube.com/@arm_code"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 bg-white/10 hover:bg-white/15 border border-white/20 text-white text-sm font-semibold px-5 py-3 rounded-2xl transition-all w-full sm:w-auto justify-center active:scale-95"
              >
                <Youtube className="w-4 h-4 text-red-400" />
                YouTube
                <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
              </a>

              <a
                href={`mailto:${SAAS_EMAIL}`}
                className="flex items-center gap-2 bg-violet-600 hover:bg-violet-500 text-white text-sm font-bold px-5 py-3 rounded-2xl transition-all w-full sm:w-auto justify-center shadow-lg shadow-violet-600/30 active:scale-95"
              >
                <Mail className="w-4 h-4" />
                Contacto directo
              </a>
            </div>
          </div>
        </div>
      </main>

      {/* ── Footer ───────────────────────────────────────────────────── */}
      <footer className="border-t border-white/10 py-6 px-4 text-center text-slate-500 text-xs">
        <p>&copy; {new Date().getFullYear()} {SAAS_NAME} · Desarrollado con 💜 en Ciudad Juárez, Chihuahua</p>
      </footer>
    </div>
  );
}
