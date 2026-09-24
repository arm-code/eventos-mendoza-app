// components/configuracion/TermsSheet.tsx
'use client'

import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { toast } from 'sonner'
import { Textarea } from '@/components/ui/textarea'
import { EditorSheet, FormField, TEXTAREA_CLASS } from './EditorSheet'
import { useBusinessConfig } from './useBusinessConfig'

const FORM_ID = 'terms-form'
const MAX = 5000

const schema = yup.object({
    terms: yup.string().max(MAX, `Máximo ${MAX} caracteres`),
})

export function TermsSheet({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
    const { config, save } = useBusinessConfig()

    const {
        register,
        handleSubmit,
        reset,
        watch,
        formState: { errors, isDirty },
    } = useForm({ resolver: yupResolver(schema), defaultValues: { terms: config?.termsAndConditions ?? '' } })

    useEffect(() => {
        if (open) reset({ terms: config?.termsAndConditions ?? '' })
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open, reset])

    const length = (watch('terms') ?? '').length

    const onSubmit = handleSubmit((v) => {
        if (!isDirty) return onOpenChange(false)
        save.mutate(
            { termsAndConditions: (v.terms ?? '').trim() },
            {
                onSuccess: () => {
                    toast.success('Términos guardados')
                    onOpenChange(false)
                },
                onError: () => toast.error('No se pudo guardar', { description: 'Revisa tu conexión e intenta de nuevo.' }),
            }
        )
    })

    return (
        <EditorSheet
            open={open}
            onOpenChange={onOpenChange}
            title="Términos del contrato"
            description="Se imprimen al final de cada contrato."
            formId={FORM_ID}
            saveLabel="Guardar términos"
            isDirty={isDirty}
            isPending={save.isPending}
            tall
        >
            <form id={FORM_ID} noValidate onSubmit={onSubmit}>
                <FormField id="terms" label="Términos y condiciones" error={errors.terms?.message}>
                    <Textarea
                        id="terms"
                        maxLength={MAX}
                        placeholder="Ej. El cliente se compromete a entregar el mobiliario en las mismas condiciones en que lo recibió."
                        className={`${TEXTAREA_CLASS} min-h-[50dvh]`}
                        {...register('terms')}
                    />
                    <p className="text-right text-sm tabular-nums text-muted-foreground" aria-live="polite">
                        {length.toLocaleString('es-MX')} / {MAX.toLocaleString('es-MX')}
                    </p>
                </FormField>
            </form>
        </EditorSheet>
    )
}