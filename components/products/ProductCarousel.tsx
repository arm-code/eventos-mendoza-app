'use client';

import Image from 'next/image';
import { useEffect, useCallback, useRef } from 'react';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from '@/components/ui/carousel';
import { useState } from 'react';
import { cn } from '@/lib/utils';

const products = [
  {
    src: '/products/IMG-20260411-WA0028.jpg',
    alt: 'Sillas y mesas para evento',
    label: 'Mesas y sillas',
  },
  {
    src: '/products/IMG-20260425-WA0023.jpg',
    alt: 'Montaje de mobiliario para fiesta',
    label: 'Montaje profesional',
  },
  {
    src: '/products/IMG-20260501-WA0000.jpg',
    alt: 'Decoración y mantelería para eventos',
    label: 'Mantelería y decoración',
  },
  {
    src: '/products/IMG-20260501-WA0001.jpg',
    alt: 'Carpas y mobiliario exterior',
    label: 'Carpas y mobiliario',
  },
  {
    src: '/products/1775921919650.png',
    alt: 'Paquete completo para eventos',
    label: 'Paquetes completos',
  },
  {
    src: '/products/2.png',
    alt: 'Artículos para fiestas',
    label: 'Artículos para fiestas',
  },
  {
    src: '/products/bolos.png',
    alt: 'Bolos para fiestas',
    label: 'Bolos para fiestas',
  },
];

export default function ProductCarousel() {
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const [count, setCount] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const touchStartX = useRef(0);

  useEffect(() => {
    if (!api) return;
    setCount(api.scrollSnapList().length);
    setCurrent(api.selectedScrollSnap());
    api.on('select', () => setCurrent(api.selectedScrollSnap()));
  }, [api]);

  // Autoplay every 4 seconds, pausable
  const autoplay = useCallback(() => {
    if (!api || isPaused) return;
    if (api.canScrollNext()) {
      api.scrollNext();
    } else {
      api.scrollTo(0);
    }
  }, [api, isPaused]);

  useEffect(() => {
    const timer = setInterval(autoplay, 4000);
    return () => clearInterval(timer);
  }, [autoplay]);

  // Touch swipe support for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) {
      if (diff > 0) {
        api?.scrollNext();
      } else {
        api?.scrollPrev();
      }
    }
  };

  return (
    <section className="w-full py-8 sm:py-10">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-6 sm:mb-8">
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-violet-900 mb-2">
            Nuestro mobiliario
          </h2>
          <p className="text-violet-600 max-w-xl mx-auto text-sm sm:text-base">
            Equipo limpio, en buen estado y listo para tu evento.
          </p>
        </div>

        <div
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          <Carousel
            setApi={setApi}
            opts={{ align: 'start', loop: true }}
            className="w-full"
          >
            <CarouselContent className="-ml-2 md:-ml-4">
              {products.map((product, index) => (
                <CarouselItem
                  key={index}
                  className="pl-2 md:pl-4 basis-full sm:basis-1/2 lg:basis-1/3"
                >
                  <div className="relative overflow-hidden rounded-2xl border border-violet-100 shadow-sm bg-white group active:scale-[0.98] transition-transform">
                    <div className="relative h-48 sm:h-56 lg:h-64 w-full">
                      <Image
                        src={product.src}
                        alt={product.alt}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      />
                      {/* Gradient overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-violet-900/60 via-transparent to-transparent" />
                      {/* Label */}
                      <div className="absolute bottom-3 left-3 right-3">
                        <span className="inline-block bg-white/90 backdrop-blur-sm text-violet-800 text-xs sm:text-sm font-bold px-3 py-1.5 rounded-full shadow-sm">
                          {product.label}
                        </span>
                      </div>
                    </div>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>

            {/* Flechas visibles en desktop, ocultas en móvil (swipe reemplaza) */}
            <CarouselPrevious className="hidden sm:flex -left-3 lg:-left-4 h-10 w-10 border-violet-200 text-violet-700 hover:bg-violet-50 hover:border-violet-300 active:scale-90 transition-all" />
            <CarouselNext className="hidden sm:flex -right-3 lg:-right-4 h-10 w-10 border-violet-200 text-violet-700 hover:bg-violet-50 hover:border-violet-300 active:scale-90 transition-all" />
          </Carousel>
        </div>

        {/* Dots mejorados — más grandes y táctiles */}
        <div className="flex justify-center gap-2.5 mt-5">
          {Array.from({ length: count }).map((_, i) => (
            <button
              key={i}
              onClick={() => api?.scrollTo(i)}
              className={cn(
                'h-2.5 rounded-full transition-all duration-300',
                'active:scale-90 touch-manipulation',
                i === current
                  ? 'bg-violet-600 w-6'
                  : 'bg-violet-200 w-2.5 hover:bg-violet-400'
              )}
              aria-label={`Ir a imagen ${i + 1}`}
              aria-current={i === current ? 'true' : 'false'}
            />
          ))}
        </div>
      </div>
    </section>
  );
}