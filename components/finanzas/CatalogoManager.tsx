// components/finanzas/CatalogManager.tsx
'use client'

import { useEffect, useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'

import { normalizeSearch, toSlug } from '@/lib/display'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { AppBottomSheet } from '@/components/ui/app-bottom-sheet'
import { MobileFab } from '@/components/ui/mobile-fab'
import { LABEL, TOUCH } from '@/components/ui/detail'
import { EmptyState, InlineError, ListSkeleton } from '@/components/ui/states'

export interface CatalogCreateInput {
    code: string
    name: string
    description?: string
    isActive: boolean
}

interface CatalogItem {
    id: string
    name: string
    description: string
}

export interface CatalogManagerProps {
    queryKey: string
    fetchItems: () => Promise<unknown>
    createItem: (data: CatalogCreateInput) => Promise<unknown>
    withDescription?: boolean
    text: {
        newItem: string // "Nueva categoría"
        save: string // "Guardar categoría"
        created: string // "Categoría creada"
        duplicate: string // "Ya tienes una categoría con ese nombre"
        namePlaceholder: string
        emptyTitle: string
        emptyDescription: string
        loadError: string
    }
}

function toItems(data: unknown): CatalogItem[] {
    if (!Array.isArray(data)) return []
    return data.flatMap<CatalogItem>((raw) => {
        if (!raw || typeof raw !== 'object') return []
        const { id, name, description } = raw as Record<string, unknown>
        if (typeof name !== 'string') return []
        return [{ id: String(id), name, description: typeof description === 'string' ? description : '' }]
    })
}

/** El código lo genera el sistema a partir del nombre: "Renta de sillas" → "RENTA_DE_SILLAS". */
function codeFromName(name: string): string {
    return toSlug(name, 'item').toUpperCase().replace(/-/g, '_').slice(0, 20)
}

const schema = yup.object({
    name: yup.string().trim().required('Escribe un nombre').max(100, 'Máximo 100 caracteres'),
    description: yup.string().trim().max(255, 'Máximo 255 caracteres').optional(),
})

/**
 * Lista + alta de un catálogo simple (categorías, formas de pago).
 * La página pone el encabezado; este componente, la lista y el formulario.
 */
export function CatalogManager({ queryKey, fetchItems, createItem, withDescription = false, text }: CatalogManagerProps) {
    const queryClient = useQueryClient()
    const [isOpen, setIsOpen] = useState(false)

    const { data, isLoading, isError, refetch } = useQuery({ queryKey: [queryKey], queryFn: fetchItems })
    const items = useMemo(() => toItems(data), [data])

    const {
        register,
        handleSubmit,
        reset,
        setError,
        formState: { errors },
    } = useForm({ resolver: yupResolver(schema) })

    useEffect(() => {
        if (isOpen) reset({ name: '', description: '' })
    }, [isOpen, reset])

    const createMutation = useMutation({
        mutationFn: createItem,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [queryKey] })
            toast.success(text.created)
            setIsOpen(false)
        },
        onError: (err: unknown) => {
            console.error(`[CatalogManager:${queryKey}] create`, err)
            toast.error('No se pudo guardar', { description: 'Revisa tu conexión e intenta de nuevo.' })
        },
    })

    const onSubmit = handleSubmit(({ name, description }) => {
        const exists = items.some((i) => normalizeSearch(i.name.trim()) === normalizeSearch(name))
        if (exists) {
            setError('name', { message: text.duplicate })
            return
        }
        createMutation.mutate({
            code: codeFromName(name),
            name,
            ...(withDescription && description ? { description } : {}),
            isActive: true,
        })
    })

    return (
        <>
            {isLoading ? (
                <ListSkeleton />
            ) : isError ? (
                <InlineError message={text.loadError} onRetry={() => refetch()} />
            ) : items.length === 0 ? (
                <EmptyState
                    title={text.emptyTitle}
                    description={text.emptyDescription}
                    action={
                        <Button className={TOUCH} onClick={() => setIsOpen(true)}>
                            {text.newItem}
                        </Button>
                    }
                />
            ) : (
                <div className="space-y-3">
                    <Card className="gap-0 overflow-hidden py-0">
                        <ul className="divide-y">
                            {items.map((item) => (
                                <li key={item.id} className="flex min-h-14 flex-col justify-center px-4 py-3">
                                    <p className="truncate text-base font-medium">{item.name}</p>
                                    {item.description && (
                                        <p className="truncate text-[15px] text-muted-foreground">{item.description}</p>
                                    )}
                                </li>
                            ))}
                        </ul>
                    </Card>
                    <Button variant="outline" className={cn(TOUCH, 'hidden w-full sm:inline-flex')} onClick={() => setIsOpen(true)}>
                        {text.newItem}
                    </Button>
                </div>
            )}

            <MobileFab onClick={() => setIsOpen(true)} title={text.newItem} aria-label={text.newItem} />

            <AppBottomSheet
                open={isOpen}
                onOpenChange={setIsOpen}
                title={text.newItem}
                footer={
                    <Button type="submit" form={`${queryKey}-form`} className={cn(TOUCH, 'w-full')} disabled={createMutation.isPending}>
                        {createMutation.isPending ? (
                            <>
                                <Loader2 className="animate-spin" aria-hidden />
                                Guardando…
                            </>
                        ) : (
                            text.save
                        )}
                    </Button>
                }
            >
                <form id={`${queryKey}-form`} noValidate onSubmit={onSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <label htmlFor={`${queryKey}-name`} className={LABEL}>
                            Nombre
                        </label>
                        <Input
                            id={`${queryKey}-name`}
                            autoFocus
                            autoComplete="off"
                            maxLength={100}
                            placeholder={text.namePlaceholder}
                            aria-invalid={Boolean(errors.name)}
                            className={cn('h-12 rounded-xl text-base', errors.name && 'border-destructive')}
                            {...register('name')}
                        />
                        {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
                    </div>

                    {withDescription && (
                        <div className="space-y-2">
                            <label htmlFor={`${queryKey}-description`} className={LABEL}>
                                Descripción <span className="font-normal">(opcional)</span>
                            </label>
                            <Input
                                id={`${queryKey}-description`}
                                autoComplete="off"
                                maxLength={255}
                                className="h-12 rounded-xl text-base"
                                {...register('description')}
                            />
                            {errors.description && <p className="text-sm text-destructive">{errors.description.message}</p>}
                        </div>
                    )}
                </form>
            </AppBottomSheet>
        </>
    )
}