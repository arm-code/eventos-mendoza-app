// components/configuracion/PublicPageSheet.tsx
'use client'

import { useEffect, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { X } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { LABEL, TOUCH } from '@/components/ui/detail'
import { defaultBusinessConfig } from '@/lib/config'
import { normalizeSearch } from '@/lib/display'
import type { BusinessConfig } from '@/types/finance'
import { cn } from '@/lib/utils'
import { EditorSheet, FormField, INPUT_CLASS, TEXTAREA_CLASS } from './EditorSheet'
import { useBusinessConfig } from './useBusinessConfig'

const FORM_ID = 'public-page-form'
const MAX_TAGS = 30
const MAX_TAG_LENGTH = 50

const schema = yup.object({
    description: yup.string().trim().max(160, 'Máximo 160 caracteres'),
    services: yup.array(yup.string().required()).required(),
    coverageAreas: yup.array(yup.string().required()).required(),
    mission: yup.string().trim().max(1000, 'Máximo 1,000 caracteres'),
    vision: yup.string().trim().max(1000, 'Máximo 1,000 caracteres'),
    history: yup.string().trim().max(3000, 'Máximo 3,000 caracteres'),
})

function toFormValues(c?: BusinessConfig) {
    return {
        description: c?.description ?? '',
        services: c?.services ?? defaultBusinessConfig.services ?? [],
        coverageAreas: c?.coverageAreas ?? defaultBusinessConfig.coverageAreas ?? [],
        mission: c?.mission ?? '',
        vision: c?.vision ?? '',
        history: c?.history ?? '',
    }
}

export function PublicPageSheet({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
    const { config, save } = useBusinessConfig()

    const {
        register,
        control,
        handleSubmit,
        reset,
        formState: { errors, isDirty },
    } = useForm({ resolver: yupResolver(schema), defaultValues: toFormValues(config) })

    useEffect(() => {
        if (open) reset(toFormValues(config))
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open, reset])

    const onSubmit = handleSubmit((v) => {
        if (!isDirty) return onOpenChange(false)
        save.mutate(
            {
                description: v.description ?? '',
                services: v.services,
                coverageAreas: v.coverageAreas,
                mission: v.mission ?? '',
                vision: v.vision ?? '',
                history: v.history ?? '',
            },
            {
                onSuccess: () => {
                    toast.success('Tu página se guardó')
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
            title="Tu página"
            description="Lo que ven tus clientes sobre tu negocio."
            formId={FORM_ID}
            saveLabel="Guardar tu página"
            isDirty={isDirty}
            isPending={save.isPending}
            tall
        >
            <form id={FORM_ID} noValidate onSubmit={onSubmit} className="space-y-8">
                <FormField id="description" label="Frase corta" hint="Una línea que diga qué haces." error={errors.description?.message}>
                    <Input id="description" maxLength={160} placeholder="Ej. Renta de mobiliario para fiestas en Juárez" className={INPUT_CLASS} {...register('description')} />
                </FormField>

                <Controller
                    control={control}
                    name="services"
                    render={({ field }) => (
                        <TagListField id="services" label="Servicios que ofreces" placeholder="Ej. Sillas" value={field.value} onChange={field.onChange} />
                    )}
                />

                <Controller
                    control={control}
                    name="coverageAreas"
                    render={({ field }) => (
                        <TagListField id="coverage" label="Zonas donde das servicio" placeholder="Ej. Zona Centro" value={field.value} onChange={field.onChange} />
                    )}
                />

                <FormField id="mission" label="Misión" error={errors.mission?.message}>
                    <Textarea id="mission" maxLength={1000} className={TEXTAREA_CLASS} {...register('mission')} />
                </FormField>

                <FormField id="vision" label="Visión" error={errors.vision?.message}>
                    <Textarea id="vision" maxLength={1000} className={TEXTAREA_CLASS} {...register('vision')} />
                </FormField>

                <FormField id="history" label="Historia del negocio" error={errors.history?.message}>
                    <Textarea id="history" maxLength={3000} className={TEXTAREA_CLASS} {...register('history')} />
                </FormField>
            </form>
        </EditorSheet>
    )
}

/* ─── Lista de etiquetas ────────────────────────────────────────────────── */

function TagListField({
    id,
    label,
    placeholder,
    value,
    onChange,
}: {
    id: string
    label: string
    placeholder: string
    value: string[]
    onChange: (value: string[]) => void
}) {
    const [draft, setDraft] = useState('')
    const [notice, setNotice] = useState('')

    const add = () => {
        const tag = draft.trim().slice(0, MAX_TAG_LENGTH)
        if (!tag) return
        if (value.some((v) => normalizeSearch(v) === normalizeSearch(tag))) {
            setNotice(`"${tag}" ya está en la lista`)
            setDraft('')
            return
        }
        if (value.length >= MAX_TAGS) {
            setNotice(`Puedes agregar hasta ${MAX_TAGS}`)
            return
        }
        onChange([...value, tag])
        setDraft('')
        setNotice('')
    }

    return (
        <div className="space-y-3">
            <label htmlFor={id} className={LABEL}>
                {label}
            </label>
            <div className="flex gap-2">
                <Input
                    id={id}
                    value={draft}
                    maxLength={MAX_TAG_LENGTH}
                    placeholder={placeholder}
                    autoComplete="off"
                    className={INPUT_CLASS}
                    onChange={(e) => setDraft(e.target.value)}
                    onKeyDown={(e) => {
                        // Enter agrega la etiqueta, no envía el formulario
                        if (e.key === 'Enter') {
                            e.preventDefault()
                            add()
                        }
                    }}
                />
                <Button type="button" variant="outline" className={cn(TOUCH, 'shrink-0 px-4')} onClick={add} disabled={!draft.trim()}>
                    Agregar
                </Button>
            </div>
            {notice && (
                <p className="text-sm text-muted-foreground" role="status">
                    {notice}
                </p>
            )}
            {value.length > 0 && (
                <ul className="flex flex-wrap gap-2" aria-label={label}>
                    {value.map((item) => (
                        <li key={item} className="flex h-11 items-center rounded-xl bg-muted pl-3 text-[15px]">
                            {item}
                            <button
                                type="button"
                                onClick={() => onChange(value.filter((v) => v !== item))}
                                aria-label={`Quitar ${item}`}
                                className="flex size-11 items-center justify-center rounded-xl text-muted-foreground transition-colors outline-none hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50"
                            >
                                <X className="size-4" aria-hidden />
                            </button>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    )
}