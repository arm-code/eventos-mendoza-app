// app/tools/finanzas/page.tsx
import Link from 'next/link'
import { Settings2 } from 'lucide-react'
import { PageHeader } from '@/components/admin/page-header'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import TransactionsTab from '@/components/finanzas/TransactionsTab'

export default function FinanzasPage() {
  return (
    <div className="space-y-8 pb-8">
      <PageHeader
        title="Movimientos"
        description="Lo que entra y sale de tu negocio."
        // En móvil el engrane queda arriba a la derecha, no debajo del título
        className="flex-row items-start justify-between"
        action={<SettingsMenu />}
      />
      <TransactionsTab />
    </div>
  )
}

function SettingsMenu() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="size-11 rounded-full text-muted-foreground hover:text-foreground"
          aria-label="Ajustes de movimientos"
        >
          <Settings2 className="size-5" aria-hidden />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56 rounded-xl">
        <DropdownMenuLabel className="text-sm font-medium text-muted-foreground">Ajustes</DropdownMenuLabel>
        <DropdownMenuItem asChild className="min-h-11 rounded-lg text-[15px]">
          <Link href="/tools/finanzas/categorias">Categorías</Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild className="min-h-11 rounded-lg text-[15px]">
          <Link href="/tools/finanzas/formas-de-pago">Formas de pago</Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}