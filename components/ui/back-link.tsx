// components/ui/back-link.tsx
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'

/** Enlace de regreso para páginas secundarias (ajustes, catálogos). */
export function BackLink({ href, label }: { href: string; label: string }) {
    return (
        <Link
            href={href}
            className="-ml-2 inline-flex h-11 items-center gap-1 rounded-lg px-2 text-[15px] text-muted-foreground transition-colors outline-none hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50"
        >
            <ChevronLeft className="size-5" aria-hidden />
            {label}
        </Link>
    )
}