import { cn } from '@/lib/utils'

interface PageHeaderProps {
    title: string
    description?: string
    action?: React.ReactNode
    className?: string
}

/**
 * Encabezado de página. Sin animación ni 'use client': funciona tanto en
 * Server Components como en Client Components y no retrasa el primer render.
 */
export function PageHeader({ title, description, action, className }: PageHeaderProps) {
    return (
        <header
            className={cn(
                'mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between',
                className
            )}
        >
            <div className="min-w-0 flex-1 space-y-1">
                <h1 className="text-2xl font-semibold leading-tight tracking-tight text-foreground text-balance sm:text-3xl">
                    {title}
                </h1>
                {description && (
                    <p className="max-w-prose text-[15px] leading-relaxed text-muted-foreground text-pretty">
                        {description}
                    </p>
                )}
            </div>

            {action && <div className="flex shrink-0 items-center gap-2">{action}</div>}
        </header>
    )
}