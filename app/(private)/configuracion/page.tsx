import { Settings } from 'lucide-react'
import { PageHeader } from '@/components/admin/page-header'
import { Card, CardContent } from '@/components/ui/card'

export default function ConfigurationPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Configuración"
        description="Aquí podrás editar la información del sitio público: nombre, logo, servicios, tarjetas de pago, catálogo y áreas de cobertura."
      />
      <Card className="border-violet-100 bg-white shadow-sm">
        <CardContent className="flex flex-col items-center gap-3 py-16 text-center">
          <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-violet-100 text-violet-700 shadow-sm">
            <Settings className="h-8 w-8" />
          </span>
          <p className="text-xl font-bold text-violet-950">Próximamente</p>
          <p className="max-w-md text-sm leading-relaxed text-violet-600/80">
            Esta sección estará disponible en una fase posterior, junto con el portal del sitio público de Eventos Mendoza.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
