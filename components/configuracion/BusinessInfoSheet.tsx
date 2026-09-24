// components/configuracion/BusinessInfoSheet.tsx
'use client'

import { useEffect } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { toast } from 'sonner'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { formatMxPhone, toMxPhone } from '@/lib/display'
import type { BusinessConfig } from '@/types/finance'
import { cn } from '@/lib/utils'
import { EditorSheet, FormField, INPUT_CLASS } from './EditorSheet'
import { useBusinessConfig } from './useBusinessConfig'

const FORM_ID = 'business-info-form'
const validPhone = (v?: string) => !v?.trim() || toMxPhone(v) !== null

const schema = yup.object({
    name: yup.string().trim().required('Escribe el nombre de tu negocio').max(100, 'Máximo 100 caracteres'),
    phone: yup.string().trim().max(20).test('phone', 'Escribe un teléfono de 10 dígitos', validPhone),
    sameWhatsapp: yup.boolean().required(),
    whatsapp: yup
        .string()
        .trim()
        .max(20)
        .when('sameWhatsapp', {
            is: false,
            then: (s) => s.test('wa', 'Escribe un WhatsApp de 10 dígitos', validPhone),
        }),
    address: yup.string().trim().max(200, 'Máximo 200 caracteres'),
    openingHours: yup.string().trim().max(100, 'Máximo 100 caracteres'),
    email: yup.string().trim().email('Revisa el correo, por ejemplo contacto@minegocio.com').max(120),
    logoUrl: yup
        .string()
        .trim()
        .max(500)
        .test('url', 'El enlace debe empezar con https://', (v) => !v || /^https:\/\/\S+$/i.test(v)),
})

function toFormValues(c?: BusinessConfig) {
    const phone = toMxPhone(c?.phone)
    const wa = toMxPhone(c?.whatsapp)
    return {
        name: c?.name ?? '',
        phone: phone ? formatMxPhone(phone) : c?.phone ?? '',
        sameWhatsapp: !c?.whatsapp || (wa !== null && wa === phone),
        whatsapp: wa ? formatMxPhone(wa) : c?.whatsapp ?? '',
        address: c?.address ?? '',
        openingHours: c?.openingHours ?? '',
        email: c?.email ?? '',
        logoUrl: c?.logoUrl ?? '',
    }
}

export function BusinessInfoSheet({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
    const { config, save } = useBusinessConfig()

    const {
        register,
        control,
        handleSubmit,
        reset,
        watch,
        formState: { errors, isDirty },
    } = useForm({ resolver: yupResolver(schema), defaultValues: toFormValues(config) })

    // Se llena solo al abrir: una recarga en segundo plano no borra lo que se está escribiendo
    useEffect(() => {
        if (open) reset(toFormValues(config))
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open, reset])

    const sameWhatsapp = watch('sameWhatsapp')

    const onSubmit = handleSubmit((v) => {
        if (!isDirty) return onOpenChange(false)
        const phone = toMxPhone(v.phone)
        const wa = v.sameWhatsapp ? phone : toMxPhone(v.whatsapp)
        save.mutate(
            {
                name: v.name,
                phone: phone ?? '',
                whatsapp: wa ? `52${wa}` : '', // formato que usan los enlaces wa.me
                address: v.address ?? '',
                openingHours: v.openingHours ?? '',
                email: v.email ?? '',
                logoUrl: v.logoUrl ?? '',
            },
            {
                onSuccess: () => {
                    toast.success('Datos del negocio guardados')
                    onOpenChange(false)
                },
                onError: () => toast.error('No se pudo guardar', { description: 'Revisa tu conexión e intenta de nuevo.' }),
            }
        )
    })

    const invalid = (field: keyof typeof errors) => ({
        'aria-invalid': Boolean(errors[field]),
        'aria-describedby': errors[field] ? `${field}-error` : undefined,
        className: cn(INPUT_CLASS, errors[field] && 'border-destructive'),
    })

    return (
        <EditorSheet
            open={open}
            onOpenChange={onOpenChange}
            title="Datos del negocio"
            description="Aparecen en tus notas y contratos. Solo el nombre es obligatorio."
            formId={FORM_ID}
            saveLabel="Guardar datos"
            isDirty={isDirty}
            isPending={save.isPending}
        >
            <form id={FORM_ID} noValidate onSubmit={onSubmit} className="space-y-6">
                <FormField id="name" label="Nombre del negocio" error={errors.name?.message}>
                    <Input id="name" autoComplete="organization" maxLength={100} placeholder="Ej. Eventos Mendoza" {...invalid('name')} {...register('name')} />
                </FormField>

                <div className="space-y-3">
                    <FormField id="phone" label="Teléfono" error={errors.phone?.message}>
                        <Input id="phone" type="tel" inputMode="tel" autoComplete="tel" maxLength={20} placeholder="656 123 4567" {...invalid('phone')} {...register('phone')} />
                    </FormField>

                    <label htmlFor="sameWhatsapp" className="flex min-h-11 items-center justify-between gap-3 text-[15px]">
                        Mi WhatsApp es el mismo número
                        <Controller
                            control={control}
                            name="sameWhatsapp"
                            render={({ field }) => <Switch id="sameWhatsapp" checked={field.value} onCheckedChange={field.onChange} />}
                        />
                    </label>

                    {!sameWhatsapp && (
                        <FormField id="whatsapp" label="WhatsApp" error={errors.whatsapp?.message}>
                            <Input id="whatsapp" type="tel" inputMode="tel" maxLength={20} placeholder="656 123 4567" {...invalid('whatsapp')} {...register('whatsapp')} />
                        </FormField>
                    )}
                </div>

                <FormField id="address" label="Dirección" error={errors.address?.message}>
                    <Input id="address" autoComplete="street-address" maxLength={200} placeholder="Ej. Av. Juárez 123, Col. Centro" {...invalid('address')} {...register('address')} />
                </FormField>

                <FormField id="openingHours" label="Horario" error={errors.openingHours?.message}>
                    <Input id="openingHours" maxLength={100} placeholder="Ej. Lunes a sábado, 9 a 8" {...invalid('openingHours')} {...register('openingHours')} />
                </FormField>

                <FormField id="email" label="Correo" error={errors.email?.message}>
                    <Input id="email" type="email" inputMode="email" autoComplete="email" autoCapitalize="none" maxLength={120} placeholder="contacto@minegocio.com" {...invalid('email')} {...register('email')} />
                </FormField>

                <FormField id="logoUrl" label="Enlace del logotipo" hint="Si tu logo está publicado en internet, pega aquí su enlace." error={errors.logoUrl?.message}>
                    <Input id="logoUrl" type="url" inputMode="url" autoCapitalize="none" maxLength={500} placeholder="https://" {...invalid('logoUrl')} {...register('logoUrl')} />
                </FormField>
            </form>
        </EditorSheet>
    )
}