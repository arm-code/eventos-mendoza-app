'use client';

import React, { useState } from 'react';
import { CreditCard, Building2, User, Copy, CheckCircle2, Banknote, ArrowRight, Phone } from 'lucide-react';
import Link from 'next/link';

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

export default function PaymentInfoPage() {
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const copyToClipboard = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text.replace(/\s/g, ''));
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    } catch {
      // fallback para navegadores sin clipboard API
      const el = document.createElement('textarea');
      el.value = text.replace(/\s/g, '');
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    }
  };

  const CopyButton = ({ text, fieldId }: { text: string; fieldId: string }) => {
    const copied = copiedField === fieldId;
    return (
      <button
        onClick={() => copyToClipboard(text, fieldId)}
        title="Copiar"
        className={`flex items-center justify-center gap-1.5 text-[11px] sm:text-xs px-2 sm:px-3 py-1.5 rounded-lg font-medium transition-all duration-200 flex-shrink-0 min-w-[76px] sm:min-w-[84px] ${copied
          ? 'bg-green-100 text-green-700 border border-green-300'
          : 'bg-violet-100 text-violet-700 border border-violet-200 hover:bg-violet-200'
          }`}
      >
        {copied ? (
          <>
            <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" />
            <span>Copiado</span>
          </>
        ) : (
          <>
            <Copy className="w-3.5 h-3.5 flex-shrink-0" />
            <span>Copiar</span>
          </>
        )}
      </button>
    );
  };

  return (
    <div className="min-h-screen py-10 px-4 sm:px-6 lg:px-8 mt-8">
      {/* Hero */}
      <div className="max-w-2xl mx-auto text-center mb-10">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-violet-100 rounded-2xl mb-4">
          <Banknote className="w-8 h-8 text-violet-600" />
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-violet-900 mb-3">
          Datos para transferencia
        </h1>
        <p className="text-violet-600 text-lg max-w-xl mx-auto">
          Realiza tu pago de forma rápida y segura directamente a nuestra cuenta bancaria.
        </p>
      </div>

      {/* Cards */}
      <div className="max-w-xl mx-auto space-y-6">
        {bankAccounts.map((account) => (
          <div
            key={account.id}
            className="bg-white rounded-2xl shadow-sm border border-violet-100 overflow-hidden"
          >
            {/* Tarjeta decorativa */}
            <div className={`bg-gradient-to-br ${account.color} p-6 text-white relative overflow-hidden`}>
              {/* Círculos decorativos de fondo */}
              <div className="absolute -top-8 -right-8 w-32 h-32 bg-white/10 rounded-full" />
              <div className="absolute -bottom-6 -left-6 w-24 h-24 bg-white/10 rounded-full" />

              <div className="relative z-10">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2">
                    <CreditCard className="w-6 h-6 text-white/80" />
                    <span className="font-bold text-xl tracking-wide">{account.bank}</span>
                  </div>
                  <span className="text-3xl">{account.logo}</span>
                </div>

                {/* Número de tarjeta */}
                <div className="mb-4">
                  <p className="text-white/60 text-xs uppercase tracking-wider mb-1">
                    Número de tarjeta
                  </p>
                  <p className="text-xl sm:text-2xl font-mono font-semibold tracking-wider sm:tracking-widest break-all">
                    {account.cardNumber}
                  </p>
                </div>

                {/* Beneficiario */}
                <div>
                  <p className="text-white/60 text-xs uppercase tracking-wider mb-1">
                    Titular / Beneficiario
                  </p>
                  <p className="font-semibold text-base sm:text-lg leading-tight sm:leading-normal">
                    {account.beneficiary}
                  </p>
                </div>
              </div>
            </div>

            {/* Detalles copiables */}
            <div className="p-6 space-y-4">
              {/* Banco */}
              <div className="flex items-center justify-between p-2.5 sm:p-3 bg-violet-50 rounded-xl border border-violet-100 gap-2">
                <div className="flex items-center gap-2.5 sm:gap-3 flex-1 min-w-0">
                  <div className="w-8 h-8 sm:w-9 sm:h-9 bg-violet-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Building2 className="w-4 h-4 sm:w-5 sm:h-5 text-violet-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] sm:text-xs text-violet-500 font-medium uppercase tracking-wider truncate">
                      Banco
                    </p>
                    <p className="font-semibold text-violet-900 text-sm sm:text-base truncate sm:whitespace-normal break-words">{account.bank}</p>
                  </div>
                </div>
                <div className="flex-shrink-0">
                  <CopyButton text={account.bank} fieldId={`${account.id}-bank`} />
                </div>
              </div>

              {/* Número de tarjeta */}
              <div className="flex items-center justify-between p-2.5 sm:p-3 bg-violet-50 rounded-xl border border-violet-100 gap-2">
                <div className="flex items-center gap-2.5 sm:gap-3 flex-1 min-w-0">
                  <div className="w-8 h-8 sm:w-9 sm:h-9 bg-violet-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <CreditCard className="w-4 h-4 sm:w-5 sm:h-5 text-violet-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] sm:text-xs text-violet-500 font-medium uppercase tracking-wider truncate">
                      Número de tarjeta
                    </p>
                    <p className="font-mono font-semibold text-violet-900 text-sm sm:text-base truncate sm:whitespace-normal break-all">
                      {account.cardNumber}
                    </p>
                  </div>
                </div>
                <div className="flex-shrink-0">
                  <CopyButton text={account.cardNumber} fieldId={`${account.id}-card`} />
                </div>
              </div>

              {/* CLABE (si existe) */}
              {account.clabe && (
                <div className="flex items-center justify-between p-2.5 sm:p-3 bg-violet-50 rounded-xl border border-violet-100 gap-2">
                  <div className="flex items-center gap-2.5 sm:gap-3 flex-1 min-w-0">
                    <div className="w-8 h-8 sm:w-9 sm:h-9 bg-violet-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Banknote className="w-4 h-4 sm:w-5 sm:h-5 text-violet-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] sm:text-xs text-violet-500 font-medium uppercase tracking-wider truncate">
                        CLABE interbancaria
                      </p>
                      <p className="font-mono font-semibold text-violet-900 text-xs sm:text-sm truncate sm:whitespace-normal break-all">
                        {account.clabe}
                      </p>
                    </div>
                  </div>
                  <div className="flex-shrink-0">
                    <CopyButton text={account.clabe} fieldId={`${account.id}-clabe`} />
                  </div>
                </div>
              )}

              {/* Beneficiario */}
              <div className="flex items-center justify-between p-2.5 sm:p-3 bg-violet-50 rounded-xl border border-violet-100 gap-2">
                <div className="flex items-center gap-2.5 sm:gap-3 flex-1 min-w-0">
                  <div className="w-8 h-8 sm:w-9 sm:h-9 bg-violet-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <User className="w-4 h-4 sm:w-5 sm:h-5 text-violet-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] sm:text-xs text-violet-500 font-medium uppercase tracking-wider truncate">
                      Beneficiario
                    </p>
                    <p className="font-semibold text-violet-900 text-sm sm:text-base leading-tight truncate sm:whitespace-normal break-words">{account.beneficiary}</p>
                  </div>
                </div>
                <div className="flex-shrink-0">
                  <CopyButton text={account.beneficiary} fieldId={`${account.id}-beneficiary`} />
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Aviso importante */}
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5">
          <div className="flex items-start gap-3">
            <span className="text-2xl flex-shrink-0">⚠️</span>
            <div>
              <p className="font-semibold text-amber-800 mb-1">Importante</p>
              <ul className="text-amber-700 text-sm space-y-1 list-disc list-inside">
                <li>Envía tu comprobante de transferencia por WhatsApp para confirmar tu reserva.</li>
                <li>Verifica bien el número antes de realizar la transferencia.</li>
                <li>Solo transferencias bancarias, no depósitos en efectivo a cuenta.</li>
              </ul>
            </div>
          </div>
        </div>

        {/* CTA WhatsApp */}
        <div className="bg-white border border-violet-100 rounded-2xl p-6 text-center shadow-sm">
          <p className="text-violet-700 font-medium mb-4">
            ¿Hiciste tu transferencia? Envíanos el comprobante 📲
          </p>
          <Link
            href={`https://wa.me/${WHATS}?text=Hola,%20realicé%20mi%20transferencia%20y%20quiero%20confirmar%20mi%20reserva`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 bg-green-600 text-white px-4 sm:px-6 py-3 w-full sm:w-auto rounded-xl font-semibold hover:bg-green-700 transition-colors text-sm sm:text-base"
          >
            <Phone className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
            <span className="truncate sm:whitespace-normal">Enviar comprobante por WhatsApp</span>
            <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
          </Link>
        </div>
      </div>
    </div>
  );
}
