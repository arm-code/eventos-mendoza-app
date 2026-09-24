// components/ui/states.tsx
// Estados de datos compartidos: error, vacío y carga de listas.

import { RotateCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

export function InlineError({ message, onRetry }: { message: string; onRetry: () => void }) {
    return (
        <Card className="flex-row items-center justify-between gap-3 px-4 py-3">
            <p className="text-[15px] text-muted-foreground">{message} Revisa tu conexión.</p>
            <Button variant="outline" onClick={onRetry}>
                <RotateCw aria-hidden />
                Reintentar
            </Button>
        </Card>
    )
}

export function EmptyState({
    title,
    description,
    action,
}: {
    title: string
    description?: string
    action?: React.ReactNode
}) {
    return (
        <Card className="items-center gap-2 px-6 py-10 text-center">
            <p className="text-base font-medium">{title}</p>
            {description && <p className="max-w-xs text-[15px] text-muted-foreground text-pretty">{description}</p>}
            {action && <div className="mt-2">{action}</div>}
        </Card>
    )
}

export function ListSkeleton({ rows = 4, label = 'Cargando' }: { rows?: number; label?: string }) {
    return (
        <Card className="gap-0 py-0" aria-busy="true" aria-label={label}>
            <div className="divide-y">
                {Array.from({ length: rows }).map((_, i) => (
                    <div key={i} className="flex min-h-16 items-center justify-between gap-4 px-4 py-3">
                        <div className="flex-1 space-y-2">
                            <Skeleton className="h-4 w-3/5" />
                            <Skeleton className="h-3.5 w-2/5" />
                        </div>
                        <Skeleton className="h-5 w-20" />
                    </div>
                ))}
            </div>
        </Card>
    )
}