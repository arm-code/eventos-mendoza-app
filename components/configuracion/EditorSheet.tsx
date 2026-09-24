// components/configuracion/EditorSheet.tsx
'use client'

import { useState } from 'react'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { AppBottomSheet } from '@/components/ui/app-bottom-sheet'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { LABEL, TOUCH } from '@/components/ui/detail'
import { cn } from '@/lib/utils'

export const INPUT_CLASS = 'h-12 rounded-xl text-base'
export const TEXTAREA_CLASS = 'min-h-32 rounded-xl text-base leading-relaxed'

interface EditorSheetProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    title: string
    description?: string
    formId: string
    saveLabel: string
    isDirty: boolean
    isPending: boolean
    tall?: boolean
    children: React.ReactNode
}

/**
 * Sheet de edición con un solo botón de guardar.
 * Si hay cambios sin guardar, pregunta antes de cerrar.
 */
export function EditorSheet({
    open,
    onOpenChange,
    title,
    description,
    formId,
    saveLabel,
    isDirty,
    isPending,
    tall = false,
    children,
}: EditorSheetProps) {
    const [confirmDiscard, setConfirmDiscard] = useState(false)

    const handleOpenChange = (next: boolean) => {
        if (!next && isDirty && !isPending) {
            setConfirmDiscard(true)
            return
        }
        onOpenChange(next)
    }

    return (
        <>
            <AppBottomSheet
                open={open}
                onOpenChange={handleOpenChange}
                title={title}
                description={description}
                mobileHeight={tall ? 'h-[92dvh] max-h-[92dvh]' : undefined}
                footer={
                    <Button type="submit" form={formId} className={cn(TOUCH, 'w-full')} disabled={isPending}>
                        {isPending ? (
                            <>
                                <Loader2 className="animate-spin" aria-hidden />
                                Guardando…
                            </>
                        ) : (
                            saveLabel
                        )}
                    </Button>
                }
            >
                {children}
            </AppBottomSheet>

            <ConfirmDialog
                open={confirmDiscard}
                onOpenChange={setConfirmDiscard}
                title="¿Salir sin guardar?"
                description="Los cambios que hiciste se van a perder."
                confirmText="Salir sin guardar"
                onConfirm={() => {
                    setConfirmDiscard(false)
                    onOpenChange(false)
                }}
                isPending={false}
            />
        </>
    )
}

/** Campo con etiqueta, ayuda opcional y error. */
export function FormField({
    id,
    label,
    hint,
    error,
    children,
}: {
    id: string
    label: string
    hint?: string
    error?: string
    children: React.ReactNode
}) {
    return (
        <div className="space-y-2">
            <label htmlFor={id} className={LABEL}>
                {label}
            </label>
            {children}
            {error ? (
                <p id={`${id}-error`} className="text-sm text-destructive">
                    {error}
                </p>
            ) : (
                hint && <p className="text-sm text-muted-foreground">{hint}</p>
            )}
        </div>
    )
}