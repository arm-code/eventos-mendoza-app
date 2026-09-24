// app/tools/finanzas/categorias/page.tsx
'use client'

import { financeApi } from '@/lib/api/finance'
import { PageHeader } from '@/components/admin/page-header'
import { BackLink } from '@/components/ui/back-link'
import { CatalogManager } from '@/components/finanzas/CatalogoManager'

export default function CategoriasPage() {
    return (
        <div className="space-y-2 pb-28 sm:pb-8">
            <BackLink href="/tools/finanzas" label="Movimientos" />
            <PageHeader title="Categorías" description="Sirven para saber en qué entra y en qué se va tu dinero." />
            <CatalogManager
                queryKey="transactionCategories"
                fetchItems={() => financeApi.getCategories()}
                createItem={(data) => financeApi.createCategory(data)}
                withDescription
                text={{
                    newItem: 'Nueva categoría',
                    save: 'Guardar categoría',
                    created: 'Categoría creada',
                    duplicate: 'Ya tienes una categoría con ese nombre',
                    namePlaceholder: 'Ej. Ventas, Renta, Luz',
                    emptyTitle: 'Aún no tienes categorías',
                    emptyDescription: 'Crea algunas como Ventas, Compras o Renta para ordenar tus movimientos.',
                    loadError: 'No se pudieron cargar tus categorías.',
                }}
            />
        </div>
    )
}