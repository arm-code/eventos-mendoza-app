'use client';

import { Share2, Link as LinkIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { Button } from './ui/button';

export default function ShareButtons() {
  const [copied, setCopied] = useState<string | null>(null);

  const handleShare = async (path: string, title: string) => {
    const fullUrl = `${window.location.origin}${path}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title,
          url: fullUrl
        });
      } catch (err) {
        console.error('Error sharing:', err);
      }
    } else {
      await navigator.clipboard.writeText(fullUrl);
      setCopied(path);
      setTimeout(() => setCopied(null), 2000);
    }
  };

  return (
    <div className="mt-4 flex flex-col sm:flex-row justify-center gap-3">
      <Button
        onClick={() => handleShare('/', 'Eventos Mendoza')}
        className={cn(
          'inline-flex items-center justify-center gap-2 h-10 px-4 rounded-xl font-semibold text-sm',
          'bg-violet-100 text-violet-700 hover:bg-violet-200 active:bg-violet-300',
          'transition-colors'
        )}
      >
        <Share2 className="w-4 h-4" />
        {copied === '/' ? '¡Copiado!' : 'Compartir Página'}
      </Button>
      <Button
        onClick={() => handleShare('/payment-info', 'Información de Pago - Eventos Mendoza')}
        className={cn(
          'inline-flex items-center justify-center gap-2 h-10 px-4 rounded-xl font-semibold text-sm',
          'bg-violet-100 text-violet-700 hover:bg-violet-200 active:bg-violet-300',
          'transition-colors'
        )}
      >
        <Share2 className="w-4 h-4" />
        {copied === '/payment-info' ? '¡Copiado!' : 'Compartir Información de Pago'}
      </Button>
    </div>
  );
}
