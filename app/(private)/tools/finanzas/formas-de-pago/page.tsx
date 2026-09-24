// app/tools/finanzas/formas-de-pago/page.tsx
'use client'

import { financeApi } from '@/lib/api/finance'
import { PageHeader } from '@/components/admin/page-header'
import { BackLink } from '@/components/ui/back-link'
import { CatalogManager } from '@/components/finanzas/CatalogoManager'

export default function FormasDePagoPage() {
    return (
        <div className="space-y-2 pb-28 sm:pb-8">
            <BackLink href="/tools/finanzas" label="Movimientos" />
            <PageHeader title="Formas de pago" description="Cómo te pagan o cómo pagas tú." />
            <CatalogManager
                queryKey="paymentMethods"
                fetchItems={() => financeApi.getPaymentMethods()}
                createItem={(data) => financeApi.createPaymentMethod(data)}
                text={{
                    newItem: 'Nueva forma de pago',
                    save: 'Guardar forma de pago',
                    created: 'Forma de pago creada',
                    duplicate: 'Ya tienes una forma de pago con ese nombre',
                    namePlaceholder: 'Ej. Efectivo, Transferencia, Tarjeta',
                    emptyTitle: 'Aún no tienes formas de pago',
                    emptyDescription: 'Agrega Efectivo, Transferencia o Tarjeta para registrar tus movimientos.',
                    loadError: 'No se pudieron cargar tus formas de pago.',
                }}
            />
        </div>
    )
}