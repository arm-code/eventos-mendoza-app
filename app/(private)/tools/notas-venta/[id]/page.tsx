// app/tools/notas-venta/[id]/page.tsx
'use client'

import { useState, useEffect, use } from 'react'
import Link from 'next/link'
import { ArrowLeft, RotateCw } from 'lucide-react'
import { useApi } from '@/hooks/useApi'
import { PageHeader } from '@/components/admin/page-header'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import SalesNoteDetailView from '@/components/sales/SalesNoteDetailView.component'

interface SaleNoteItem {
    id: number
    product_id?: number
    quantity: number
    description: string
    unit_price: number
    amount: number
}

interface SaleNoteDetail {
    id: number
    note_number: string
    client_name: string
    client_phone: string
    client_address: string
    subtotal: number
    tax_amount: number
    total: number
    issued_by: string
    created_at: string
    items: SaleNoteItem[]
}

export default function SaleNoteDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = use(params)
    const { request, loading, error } = useApi()
    const [note, setNote] = useState<SaleNoteDetail | null>(null)

    const loadNote = () => {
        request(`/sales-notes/${resolvedParams.id}`).then((res) => {
            if (res?.data) setNote(res.data)
        })
    }

    useEffect(() => {
        loadNote()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [resolvedParams.id])

    return (
        <div className="space-y-8 pb-28 sm:pb-8">
            <PageHeader
                title={note ? `Nota ${note.note_number}` : 'Detalle de nota'}
                action={
                    <Button asChild variant="ghost" className="h-11 px-4 sm:h-10">
                        <Link href="/tools/notas-venta">
                            <ArrowLeft className="mr-2 size-4" aria-hidden />
                            Volver
                        </Link>
                    </Button>
                }
            />

            <section aria-label="Detalle de la nota">
                {loading ? (
                    <NoteDetailSkeleton />
                ) : error ? (
                    <InlineError message={error || 'No se pudo cargar la nota.'} onRetry={loadNote} />
                ) : note ? (
                    <SalesNoteDetailView note={note} />
                ) : null}
            </section>
        </div>
    )
}

/* ─── Subcomponentes ────────────────────────────────────────────────────── */

function InlineError({ message, onRetry }: { message: string; onRetry: () => void }) {
    return (
        <Card className="flex flex-col items-center justify-between gap-4 p-5 sm:flex-row">
            <p className="text-[15px] text-muted-foreground">{message} Revisa tu conexión.</p>
            <Button variant="outline" onClick={onRetry} className="w-full sm:w-auto h-11 sm:h-10">
                <RotateCw className="mr-2 size-4" aria-hidden />
                Reintentar
            </Button>
        </Card>
    )
}

function NoteDetailSkeleton() {
    return (
        <div className="space-y-4" aria-busy="true" aria-label="Cargando detalle de la nota">
            <Card className="p-5 space-y-4">
                <div className="flex justify-between">
                    <Skeleton className="h-6 w-32" />
                    <Skeleton className="h-6 w-24" />
                </div>
                <div className="space-y-2">
                    <Skeleton className="h-4 w-48" />
                    <Skeleton className="h-4 w-32" />
                </div>
            </Card>
            <Card className="p-5">
                <Skeleton className="h-6 w-40 mb-4" />
                <div className="space-y-3">
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                </div>
            </Card>
        </div>
    )
}