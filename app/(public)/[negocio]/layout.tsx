import { TenantProvider } from '@/components/providers/TenantProvider';
import TenantNavbar from '@/components/navbar/TenantNavbar';
import { TenantFooter } from '@/components/footer/TenantFooter';
import type { ReactNode } from 'react';

interface NegocioLayoutProps {
  children: ReactNode;
  params: Promise<{ negocio: string }>;
}

export default async function NegocioLayout({ children, params }: NegocioLayoutProps) {
  const { negocio } = await params;

  return (
    <TenantProvider negocio={negocio}>
      <div className="min-h-screen bg-violet-50 flex flex-col">
        <div className="flex justify-end p-4 fixed top-0 right-0 w-full z-40 bg-violet-50/90 backdrop-blur-sm border-b border-violet-100">
          <TenantNavbar />
        </div>
        <div className="pt-20 flex-grow">
          {children}
        </div>
        <TenantFooter />
      </div>
    </TenantProvider>
  );
}
