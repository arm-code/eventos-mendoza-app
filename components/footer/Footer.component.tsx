'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { businessApi } from '@/lib/api/business';
import { getBusinessSlugFromHostname } from '@/lib/subdomain';

const Footer = () => {
  const slug = getBusinessSlugFromHostname();

  const { data: publicBusiness } = useQuery({
    queryKey: ['publicBusiness', slug],
    queryFn: () => businessApi.getPublicBusinessBySlug(slug),
    staleTime: 1000 * 60 * 10,
  });

  const businessName = publicBusiness?.name || publicBusiness?.config?.name || 'Eventos Mendoza';

  return (
    <footer className="w-full py-6 mt-auto border-t border-violet-100 bg-violet-50/80">
      <div className="container mx-auto px-4 flex flex-col items-center justify-center text-xs text-violet-400">
        <p className="mb-2 md:mb-0 select-none cursor-default">
          &copy; {new Date().getFullYear()} {businessName}. Todos los derechos reservados.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
