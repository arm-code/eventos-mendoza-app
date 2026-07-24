'use client';

import React, { useState } from 'react';
import {
  CreditCard, Building2, User, Copy, CheckCircle2, Banknote,
  ArrowRight, Phone, Share2
} from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

const WHATS = '526567788565';

interface BankAccount {
  id: string;
  bank: string;
  cardNumber: string;
  beneficiary: string;
  clabe?: string;
  color: string;
  logo: string;
}

const bankAccounts: BankAccount[] = [
  {
    id: 'bancoppel',
    bank: 'Bancoppel',
    cardNumber: '4169 1606 2171 8411',
    beneficiary: 'Keila Adilene Torres Diaz',
    clabe: 'no disponible',
    color: 'from-yellow-600 to-yellow-800',
    logo: '🏦',
  },
];

/* ────────────────────────────────────────────────────────────────────────────
   COMPONENTE: CopyField
   Campo copiable con feedback táctil y accesibilidad.
   ─────────────────────────────────────────────────────────────────────────── */
function CopyField({
  label,
  value,
  icon: Icon,
  fieldId,
  copiedField,
  onCopy,
  monospace = false,
}: {
  label: string;
  value: string;
  icon: React.ElementType;
  fieldId: string;
  copiedField: string | null;
  onCopy: (text: string, field: string) => void;
  monospace?: boolean;
}) {
  const copied = copiedField === fieldId;
  const isUnavailable = value.toLowerCase().includes('no disponible');

  return (
    <div
      className={cn(
        'flex items-center gap-3 p-3.5 rounded-xl border transition-all',
        isUnavailable
          ? 'bg-gray-50 border-gray-100 opacity-60'
          : 'bg-violet-50/60 border-violet-100'
      )}
    >
      <div className={cn(
        'flex h-10 w-10 items-center justify-center rounded-lg shrink-0',
        isUnavailable ? 'bg-gray-100 text-gray-400' : 'bg-violet-100 text-violet-600'
      )}>
        <Icon className="w-5 h-5" />
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-[10px] font-bold text-violet-400 uppercase tracking-wider">
          {label}
        </p>
        <p className={cn(
          'font-semibold text-violet-950 text-sm truncate',
          monospace && 'font-mono'
        )}>
          {value}
        </p>
      </div>

      {!isUnavailable && (
        <motion.button
          whileTap={{ scale: 0.92 }}
          onClick={() => onCopy(value, fieldId)}
          className={cn(
            'flex items-center justify-center gap-1.5 h-10 px-3 rounded-lg text-xs font-bold transition-all duration-200 shrink-0',
            'active:scale-95 touch-manipulation min-w-[80px]',
            copied
              ? 'bg-green-100 text-green-700 border border-green-300'
              : 'bg-white text-violet-700 border border-violet-200 hover:bg-violet-50 shadow-sm'
          )}
        >
          <AnimatePresence mode="wait">
            {copied ? (
              <motion.span
                key="check"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                className="flex items-center gap-1"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Listo</span>
              </motion.span>
            ) : (
              <motion.span
                key="copy"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                className="flex items-center gap-1"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>Copiar</span>
              </motion.span>
            )}
          </AnimatePresence>
        </motion.button>
      )}
    </div>
  );
}

/* ────────────────────────────────────────────────────────────────────────────
   COMPONENTE: PaymentInfoPage
   ─────────────────────────────────────────────────────────────────────────── */
export default function PaymentInfoPage() {
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const copyToClipboard = async (text: string, field: string) => {
    const clean = text.replace(/\s/g, '');
    try {
      await navigator.clipboard.writeText(clean);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2500);
    } catch {
      const el = document.createElement('textarea');
      el.value = clean;
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2500);
    }
  };

  const sharePaymentInfo = async () => {
    const account = bankAccounts[0];
    const text = `Datos para transferencia — Eventos Mendoza\n\nBanco: ${account.bank}\nTarjeta: ${account.cardNumber}\nBeneficiario: ${account.beneficiary}\nCLABE: ${account.clabe}\n\nEnvía tu comprobante por WhatsApp.`;

    if (navigator.share) {
      try {
        await navigator.share({ title: 'Datos de transferencia', text });
      } catch {
        // User cancelled
      }
    } else {
      await navigator.clipboard.writeText(text);
      setCopiedField('share-all');
      setTimeout(() => setCopiedField(null), 2500);
    }
  };

  return (
    <div className="min-h-screen py-6 px-4 sm:px-6 lg:px-8">
      {/* Header compacto */}
      <div className="max-w-xl mx-auto text-center mb-8">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="inline-flex items-center justify-center w-14 h-14 bg-violet-100 rounded-2xl mb-3"
        >
          <Banknote className="w-7 h-7 text-violet-600" />
        </motion.div>
        <h1 className="text-2xl sm:text-3xl font-bold text-violet-900 mb-2">
          Datos para transferencia
        </h1>
        <p className="text-violet-600 text-sm sm:text-base max-w-md mx-auto">
          Realiza tu pago de forma rápida y segura.
        </p>
      </div>

      <div className="max-w-xl mx-auto space-y-5">
        {bankAccounts.map((account) => (
          <motion.div
            key={account.id}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-2xl shadow-sm border border-violet-100 overflow-hidden"
          >
            {/* Tarjeta decorativa */}
            <div className={`bg-gradient-to-br ${account.color} p-5 sm:p-6 text-white relative overflow-hidden`}>
              <div className="absolute -top-8 -right-8 w-32 h-32 bg-white/10 rounded-full" />
              <div className="absolute -bottom-6 -left-6 w-24 h-24 bg-white/10 rounded-full" />

              <div className="relative z-10">
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-white/80" />
                    <span className="font-bold text-lg tracking-wide">{account.bank}</span>
                  </div>
                  <span className="text-2xl">{account.logo}</span>
                </div>

                <div className="mb-3">
                  <p className="text-white/60 text-[10px] uppercase tracking-wider mb-1">
                    Número de tarjeta
                  </p>
                  <p className="text-xl sm:text-2xl font-mono font-semibold tracking-wider">
                    {account.cardNumber}
                  </p>
                </div>

                <div>
                  <p className="text-white/60 text-[10px] uppercase tracking-wider mb-1">
                    Titular
                  </p>
                  <p className="font-semibold text-base sm:text-lg">
                    {account.beneficiary}
                  </p>
                </div>
              </div>
            </div>

            {/* Campos copiables */}
            <div className="p-4 sm:p-5 space-y-2.5">
              <CopyField
                label="Banco"
                value={account.bank}
                icon={Building2}
                fieldId={`${account.id}-bank`}
                copiedField={copiedField}
                onCopy={copyToClipboard}
              />
              <CopyField
                label="Número de tarjeta"
                value={account.cardNumber}
                icon={CreditCard}
                fieldId={`${account.id}-card`}
                copiedField={copiedField}
                onCopy={copyToClipboard}
                monospace
              />
              {account.clabe && (
                <CopyField
                  label="CLABE interbancaria"
                  value={account.clabe}
                  icon={Banknote}
                  fieldId={`${account.id}-clabe`}
                  copiedField={copiedField}
                  onCopy={copyToClipboard}
                  monospace
                />
              )}
              <CopyField
                label="Beneficiario"
                value={account.beneficiary}
                icon={User}
                fieldId={`${account.id}-beneficiary`}
                copiedField={copiedField}
                onCopy={copyToClipboard}
              />
            </div>

            {/* Botón compartir todo */}
            <div className="px-4 sm:px-5 pb-4 sm:pb-5">
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={sharePaymentInfo}
                className={cn(
                  'w-full flex items-center justify-center gap-2 h-12 rounded-xl font-semibold text-sm',
                  'bg-violet-600 text-white hover:bg-violet-700 active:bg-violet-800',
                  'transition-colors shadow-sm'
                )}
              >
                {copiedField === 'share-all' ? (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>¡Copiado al portapapeles!</span>
                  </>
                ) : (
                  <>
                    <Share2 className="w-4 h-4" />
                    <span>Copiar todos los datos</span>
                  </>
                )}
              </motion.button>
            </div>
          </motion.div>
        ))}

        {/* Aviso importante */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-amber-50 border border-amber-200 rounded-2xl p-4 sm:p-5"
        >
          <div className="flex items-start gap-3">
            <span className="text-xl flex-shrink-0 mt-0.5">⚠️</span>
            <div>
              <p className="font-bold text-amber-800 text-sm mb-1">Importante</p>
              <ul className="text-amber-700 text-xs sm:text-sm space-y-1">
                <li>• Envía tu comprobante por WhatsApp para confirmar tu reserva.</li>
                <li>• Verifica bien el número antes de transferir.</li>
                <li>• Solo transferencias bancarias, no depósitos en efectivo.</li>
              </ul>
            </div>
          </div>
        </motion.div>

        {/* CTA WhatsApp */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="bg-white border border-violet-100 rounded-2xl p-5 sm:p-6 text-center shadow-sm"
        >
          <p className="text-violet-700 font-semibold text-sm mb-4">
            ¿Ya hiciste tu transferencia?
          </p>
          <Link
            href={`https://wa.me/${WHATS}?text=Hola,%20realicé%20mi%20transferencia%20y%20quiero%20confirmar%20mi%20reserva`}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              'flex items-center justify-center gap-2 h-12 rounded-xl font-bold text-sm',
              'bg-green-600 text-white hover:bg-green-700 active:bg-green-800',
              'transition-colors shadow-md shadow-green-600/20',
              'w-full'
            )}
          >
            <Phone className="w-5 h-5" />
            <span>Enviar comprobante por WhatsApp</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>
      </div>
    </div>
  );
}