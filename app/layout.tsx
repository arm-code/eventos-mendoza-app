import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';
import './globals.css';
import { ToastContainer } from 'react-toastify';
import type { Metadata } from 'next';
import PwaRegistration from '@/components/PwaRegistration';

const BASE_URL = 'https://eventos-mendoza.arm-solutions.com.mx';

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: 'Eventos Mendoza – Renta de Mobiliario para Eventos en Ciudad Juárez',
    template: '%s | Eventos Mendoza',
  },
  description:
    'Renta de mesas, sillas, carpas, mantelería y artículos para fiestas en Ciudad Juárez, Chihuahua. Entrega puntual, montaje cuidado y precios justos.',
  keywords: [
    'renta de mobiliario',
    'renta de sillas',
    'renta de mesas',
    'renta de carpas',
    'eventos Ciudad Juárez',
    'fiesta Ciudad Juárez',
    'renta para eventos',
    'Eventos Mendoza',
    'mantelería renta',
  ],
  authors: [{ name: 'Eventos Mendoza' }],
  creator: 'Eventos Mendoza',
  openGraph: {
    type: 'website',
    locale: 'es_MX',
    url: BASE_URL,
    siteName: 'Eventos Mendoza',
    title: 'Eventos Mendoza – Renta de Mobiliario para Eventos',
    description:
      'Renta de mesas, sillas, carpas y más para tus eventos en Ciudad Juárez. ¡Cotiza ahora por WhatsApp!',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Eventos Mendoza – Renta de Mobiliario',
    description: 'Renta de mesas, sillas, carpas y más para tus eventos en Ciudad Juárez.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  alternates: {
    canonical: BASE_URL,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang='es' className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <body className='min-h-screen bg-gray-50'>
        <PwaRegistration />
        {children}
        <ToastContainer
          position='top-right'
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
        />
      </body>
    </html>
  );
}
