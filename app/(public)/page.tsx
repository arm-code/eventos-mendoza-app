import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'I Am a POS – Plataforma de Gestión para Negocios',
  description: 'Sistema de punto de venta y gestión para negocios locales.',
};

export default function RootPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-violet-50 px-4">
      <div className="text-center max-w-md">
        <h1 className="text-3xl font-bold text-violet-900 mb-3">I Am a POS</h1>
        <p className="text-violet-600 mb-6">
          Accede al sitio de tu negocio usando la URL correspondiente, por ejemplo:
        </p>
        <code className="bg-violet-100 text-violet-800 px-4 py-2 rounded-xl font-mono text-sm">
          /eventos-mendoza
        </code>
      </div>
    </div>
  );
}