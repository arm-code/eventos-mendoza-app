// @/app/tools/configuracion/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { Loader2, Plus, RotateCw, Trash2, X } from 'lucide-react'
import { toast } from 'sonner'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

import { financeApi } from '@/lib/api/finance'
import { defaultBusinessConfig } from '@/lib/config'
import type { BusinessConfig, PaymentCard, CreatePaymentCardDto } from '@/types/finance'
import { cn } from '@/lib/utils'

import { PageHeader } from '@/components/admin/page-header'
import { AppBottomSheet } from '@/components/ui/app-bottom-sheet'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { TOUCH, LABEL } from '@/components/ui/detail'

export default function ConfigurationPage() {
  const queryClient = useQueryClient()

  const { data: apiConfig, isLoading, isError, refetch } = useQuery({
    queryKey: ['businessConfig'],
    queryFn: () => financeApi.getConfig(),
  })

  // Estado local
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [whatsapp, setWhatsapp] = useState('')
  const [email, setEmail] = useState('')
  const [address, setAddress] = useState('')
  const [logoUrl, setLogoUrl] = useState('')
  const [terms, setTerms] = useState('')
  const [description, setDescription] = useState('')
  const [history, setHistory] = useState('')
  const [mission, setMission] = useState('')
  const [vision, setVision] = useState('')
  const [openingHours, setOpeningHours] = useState('')
  const [services, setServices] = useState<string[]>([])
  const [coverageAreas, setCoverageAreas] = useState<string[]>([])

  const [newService, setNewService] = useState('')
  const [newCoverage, setNewCoverage] = useState('')

  const [isCardModalOpen, setIsCardModalOpen] = useState(false)
  const [bank, setBank] = useState('')
  const [cardNumber, setCardNumber] = useState('')
  const [clabe, setClabe] = useState('')
  const [beneficiary, setBeneficiary] = useState('')

  useEffect(() => {
    if (!apiConfig) return
    const config = apiConfig
    setName(config.name || '')
    setPhone(config.phone || '')
    setWhatsapp(config.whatsapp || '')
    setEmail(config.email || '')
    setAddress(config.address || '')
    setLogoUrl(config.logoUrl || '')
    setTerms(config.termsAndConditions || '')
    setDescription(config.description || '')
    setHistory(config.history || '')
    setMission(config.mission || '')
    setVision(config.vision || '')
    setOpeningHours(config.openingHours || '')
    setServices(config.services || defaultBusinessConfig.services)
    setCoverageAreas(config.coverageAreas || defaultBusinessConfig.coverageAreas)
  }, [apiConfig])

  const updateMutation = useMutation({
    mutationFn: (data: Partial<BusinessConfig>) => financeApi.updateConfig(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['businessConfig'] })
      toast.success('Configuración guardada')
    },
    onError: () => {
      toast.error('No se pudo guardar la configuración', { description: 'Revisa tu conexión.' })
    },
  })

  const addCardMutation = useMutation({
    mutationFn: (data: CreatePaymentCardDto) => financeApi.addPaymentCard(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['businessConfig'] })
      toast.success('Cuenta bancaria agregada')
      setIsCardModalOpen(false)
      setBank('')
      setCardNumber('')
      setClabe('')
      setBeneficiary('')
    },
    onError: () => {
      toast.error('No se pudo agregar la cuenta bancaria', { description: 'Revisa tu conexión.' })
    },
  })

  const handleSaveGeneral = () => {
    if (!name.trim()) {
      toast.error('El nombre comercial es obligatorio')
      return
    }
    updateMutation.mutate({
      name,
      phone,
      whatsapp,
      email,
      address,
      logoUrl,
      services,
      coverageAreas,
      termsAndConditions: terms,
      description,
      history,
      mission,
      vision,
      openingHours,
    })
  }

  const handleAddTag = (
    value: string,
    list: string[],
    setList: (l: string[]) => void,
    clearVal: () => void
  ) => {
    const trimmed = value.trim()
    if (trimmed && !list.includes(trimmed)) {
      setList([...list, trimmed])
      clearVal()
    }
  }

  const handleRemoveTag = (item: string, list: string[], setList: (l: string[]) => void) => {
    setList(list.filter((x) => x !== item))
  }

  const handleAddCardSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!bank.trim() || !beneficiary.trim()) {
      toast.error('Banco y titular son obligatorios')
      return
    }
    addCardMutation.mutate({ bank, cardNumber, clabe, beneficiary })
  }

  const activeCards: PaymentCard[] = apiConfig?.paymentCards || []

  if (isLoading) return <ConfigSkeleton />
  if (isError) return (
    <div className="space-y-6">
      <PageHeader title="Configuración" />
      <InlineError message="No se pudo cargar la configuración." onRetry={() => refetch()} />
    </div>
  )

  const inputClass = 'h-12 rounded-xl text-base'
  const textareaClass = 'w-full min-h-[100px] rounded-xl border bg-transparent p-3 text-base outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 resize-y'

  return (
    <div className="space-y-12">
      <PageHeader
        title="Configuración"
        description="Administra la información de tu negocio, cuentas bancarias y cláusulas."
      />

      {/* Información principal */}
      <section aria-labelledby="general-title" className="space-y-4">
        <h2 id="general-title" className="text-base font-semibold">
          Información principal
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5 sm:col-span-2 lg:col-span-1">
            <Label htmlFor="bname" className={LABEL}>Nombre comercial *</Label>
            <Input
              id="bname"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej. Eventos Mendoza"
              className={inputClass}
            />
          </div>
          <div className="space-y-1.5 lg:col-span-1">
            <Label htmlFor="blogo" className={LABEL}>Enlace del logotipo (Opcional)</Label>
            <Input
              id="blogo"
              value={logoUrl}
              onChange={(e) => setLogoUrl(e.target.value)}
              placeholder="https://..."
              className={inputClass}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="bphone" className={LABEL}>Teléfono</Label>
            <Input
              id="bphone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="656 123 4567"
              className={inputClass}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="bws" className={LABEL}>WhatsApp</Label>
            <Input
              id="bws"
              value={whatsapp}
              onChange={(e) => setWhatsapp(e.target.value)}
              placeholder="526561234567"
              className={inputClass}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="bemail" className={LABEL}>Correo electrónico</Label>
            <Input
              id="bemail"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="contacto@ejemplo.com"
              className={inputClass}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="bhours" className={LABEL}>Horarios</Label>
            <Input
              id="bhours"
              value={openingHours}
              onChange={(e) => setOpeningHours(e.target.value)}
              placeholder="Lun a Dom 08:00 - 21:00"
              className={inputClass}
            />
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="baddr" className={LABEL}>Dirección</Label>
            <Input
              id="baddr"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Av. Principal #123..."
              className={inputClass}
            />
          </div>
        </div>
      </section>

      {/* Cuentas Bancarias */}
      <section aria-labelledby="cards-title" className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 id="cards-title" className="text-base font-semibold">
            Cuentas bancarias
          </h2>
          <Button onClick={() => setIsCardModalOpen(true)} variant="outline" size="sm" className="hidden sm:inline-flex">
            Agregar cuenta
          </Button>
        </div>

        {activeCards.length === 0 ? (
          <Card className="items-center gap-3 px-6 py-10 text-center">
            <p className="font-medium">No hay cuentas registradas</p>
            <p className="text-sm text-muted-foreground">Añade cuentas para recibir anticipos o pagos.</p>
            <Button onClick={() => setIsCardModalOpen(true)} className="mt-2" variant="outline">
              Agregar cuenta
            </Button>
          </Card>
        ) : (
          <Card className="gap-0 overflow-hidden py-0">
            <ul className="divide-y">
              {activeCards.map((card) => (
                <li key={card.id} className="flex min-h-16 items-center justify-between gap-4 px-4 py-3">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-base font-medium">{card.bank} · {card.beneficiary}</p>
                    <p className="truncate text-[15px] tabular-nums text-muted-foreground">
                      {card.clabe ? `CLABE: ${card.clabe}` : card.cardNumber ? `Tarjeta: ${card.cardNumber}` : 'Sin números'}
                    </p>
                  </div>
                  <DeleteCardAction card={card} />
                </li>
              ))}
            </ul>
          </Card>
        )}
      </section>

      {/* Catálogos / Listas */}
      <section aria-labelledby="tags-title" className="space-y-4">
        <h2 id="tags-title" className="text-base font-semibold">
          Catálogo y Cobertura
        </h2>
        <div className="grid gap-8 sm:grid-cols-2">
          <div className="space-y-3">
            <Label className={LABEL}>Servicios que ofreces</Label>
            <div className="flex gap-2">
              <Input
                value={newService}
                onChange={(e) => setNewService(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag(newService, services, setServices, () => setNewService('')))}
                placeholder="Ej. Sillas, Mesas..."
                className={inputClass}
              />
              <Button
                type="button"
                variant="outline"
                className={cn(TOUCH, 'px-4')}
                onClick={() => handleAddTag(newService, services, setServices, () => setNewService(''))}
              >
                <Plus aria-hidden />
                <span className="sr-only">Agregar servicio</span>
              </Button>
            </div>
            {services.length > 0 && (
              <ul className="flex flex-wrap gap-2">
                {services.map((s) => (
                  <li key={s} className="flex h-10 items-center gap-2 rounded-lg bg-muted pl-3 pr-2 text-[15px]">
                    {s}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(s, services, setServices)}
                      className="rounded-full p-1 text-muted-foreground transition-colors hover:bg-background hover:text-foreground"
                      aria-label={`Quitar ${s}`}
                    >
                      <X className="size-4" aria-hidden />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="space-y-3">
            <Label className={LABEL}>Zonas de cobertura</Label>
            <div className="flex gap-2">
              <Input
                value={newCoverage}
                onChange={(e) => setNewCoverage(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag(newCoverage, coverageAreas, setCoverageAreas, () => setNewCoverage('')))}
                placeholder="Ej. Zona Centro..."
                className={inputClass}
              />
              <Button
                type="button"
                variant="outline"
                className={cn(TOUCH, 'px-4')}
                onClick={() => handleAddTag(newCoverage, coverageAreas, setCoverageAreas, () => setNewCoverage(''))}
              >
                <Plus aria-hidden />
                <span className="sr-only">Agregar zona</span>
              </Button>
            </div>
            {coverageAreas.length > 0 && (
              <ul className="flex flex-wrap gap-2">
                {coverageAreas.map((area) => (
                  <li key={area} className="flex h-10 items-center gap-2 rounded-lg bg-muted pl-3 pr-2 text-[15px]">
                    {area}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(area, coverageAreas, setCoverageAreas)}
                      className="rounded-full p-1 text-muted-foreground transition-colors hover:bg-background hover:text-foreground"
                      aria-label={`Quitar ${area}`}
                    >
                      <X className="size-4" aria-hidden />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </section>

      {/* Textos Públicos y Contratos */}
      <section aria-labelledby="texts-title" className="space-y-4">
        <h2 id="texts-title" className="text-base font-semibold">
          Textos y Cláusulas
        </h2>
        <div className="space-y-1.5">
          <Label className={LABEL}>Eslogan / Descripción corta</Label>
          <Input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Renta de mobiliario para eventos..."
            className={inputClass}
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label className={LABEL}>Misión</Label>
            <textarea
              value={mission}
              onChange={(e) => setMission(e.target.value)}
              className={textareaClass}
            />
          </div>
          <div className="space-y-1.5">
            <Label className={LABEL}>Visión</Label>
            <textarea
              value={vision}
              onChange={(e) => setVision(e.target.value)}
              className={textareaClass}
            />
          </div>
        </div>
        <div className="space-y-1.5">
          <Label className={LABEL}>Historia de la empresa</Label>
          <textarea
            value={history}
            onChange={(e) => setHistory(e.target.value)}
            className={textareaClass}
          />
        </div>
        <div className="space-y-1.5">
          <Label className={LABEL}>Términos y Condiciones (Para contratos)</Label>
          <textarea
            value={terms}
            onChange={(e) => setTerms(e.target.value)}
            placeholder="El cliente se compromete a..."
            className={textareaClass}
          />
        </div>
      </section>

      {/* Botón de guardado estático */}
      <div className="pt-4">
        <Button
          onClick={handleSaveGeneral}
          disabled={updateMutation.isPending}
          className={cn(TOUCH, 'w-full sm:w-auto sm:px-8')}
        >
          {updateMutation.isPending ? 'Guardando...' : 'Guardar configuración'}
        </Button>
      </div>

      {/* Formulario Sheet */}
      <AppBottomSheet
        open={isCardModalOpen}
        onOpenChange={setIsCardModalOpen}
        title="Agregar cuenta bancaria"
        footer={
          <div className="grid grid-cols-2 gap-2">
            <Button
              type="button"
              variant="outline"
              className={TOUCH}
              onClick={() => setIsCardModalOpen(false)}
              disabled={addCardMutation.isPending}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              form="card-form"
              className={TOUCH}
              disabled={addCardMutation.isPending}
            >
              {addCardMutation.isPending && <Loader2 className="animate-spin" aria-hidden />}
              Guardar
            </Button>
          </div>
        }
      >
        <form id="card-form" onSubmit={handleAddCardSubmit} className="space-y-6">
          <div className="space-y-1.5">
            <Label htmlFor="bank" className={LABEL}>Banco *</Label>
            <Input
              id="bank"
              value={bank}
              onChange={(e) => setBank(e.target.value)}
              placeholder="Ej. BBVA"
              className={inputClass}
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="beneficiary" className={LABEL}>Titular *</Label>
            <Input
              id="beneficiary"
              value={beneficiary}
              onChange={(e) => setBeneficiary(e.target.value)}
              placeholder="Nombre de quien recibe"
              className={inputClass}
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="clabe" className={LABEL}>CLABE (18 dígitos)</Label>
            <Input
              id="clabe"
              value={clabe}
              onChange={(e) => setClabe(e.target.value)}
              placeholder="012180000000000000"
              className={cn(inputClass, 'tabular-nums')}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="cardNumber" className={LABEL}>Número de Tarjeta</Label>
            <Input
              id="cardNumber"
              value={cardNumber}
              onChange={(e) => setCardNumber(e.target.value)}
              placeholder="4152 3138 0000 0000"
              className={cn(inputClass, 'tabular-nums')}
            />
          </div>
        </form>
      </AppBottomSheet>
    </div>
  )
}

/* ─── Subcomponentes ────────────────────────────────────────────────────── */

function DeleteCardAction({ card }: { card: PaymentCard }) {
  const queryClient = useQueryClient()
  const [confirm, setConfirm] = useState(false)

  const deleteMutation = useMutation({
    mutationFn: (id: string) => financeApi.deletePaymentCard(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['businessConfig'] })
      toast.success('Cuenta eliminada')
    },
    onError: () => toast.error('No se pudo eliminar la cuenta'),
  })

  if (confirm) {
    return (
      <div className="flex shrink-0 items-center gap-2">
        <Button variant="outline" size="sm" onClick={() => setConfirm(false)}>No</Button>
        <Button
          variant="destructive"
          size="sm"
          disabled={deleteMutation.isPending}
          onClick={() => card.id && deleteMutation.mutate(card.id)}
        >
          {deleteMutation.isPending ? <Loader2 className="animate-spin" aria-hidden /> : 'Sí, borrar'}
        </Button>
      </div>
    )
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      className="size-11 shrink-0 rounded-full text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
      onClick={() => setConfirm(true)}
      aria-label="Eliminar cuenta"
    >
      <Trash2 className="size-5" aria-hidden />
    </Button>
  )
}

function InlineError({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <Card className="flex-row items-center justify-between gap-3 px-5 py-4">
      <p className="text-sm text-muted-foreground">{message}</p>
      <Button variant="outline" size="sm" onClick={onRetry}>
        <RotateCw aria-hidden />
        Reintentar
      </Button>
    </Card>
  )
}

function ConfigSkeleton() {
  return (
    <div className="space-y-12" aria-busy="true" aria-label="Cargando configuración">
      <div className="space-y-2">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-3/4 max-w-sm" />
      </div>
      <div className="space-y-4">
        <Skeleton className="h-5 w-40" />
        <div className="grid gap-4 sm:grid-cols-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-12 w-full rounded-xl" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}