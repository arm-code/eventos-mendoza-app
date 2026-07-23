'use client'

import { useState, useEffect, ChangeEvent } from 'react'
import {
  Building2, Phone, MessageSquare, Mail, MapPin, CreditCard, Plus, Trash2,
  Save, Loader2, FileText, CheckCircle2, ShieldAlert, Tags, Globe
} from 'lucide-react'
import { toast } from 'sonner'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { financeApi } from '@/lib/api/finance'
import { defaultBusinessConfig } from '@/lib/config'
import type { BusinessConfig, PaymentCard, CreatePaymentCardDto } from '@/types/finance'
import { PageHeader } from '@/components/admin/page-header'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet'
import { motion, AnimatePresence } from 'framer-motion'
import { Loader } from '@/components/Loaders/Loader.component'
import { cn } from '@/lib/utils'

export default function ConfigurationPage() {
  const queryClient = useQueryClient()

  // Fetch config from NestJS API
  const { data: apiConfig, isLoading, error } = useQuery({
    queryKey: ['businessConfig'],
    queryFn: () => financeApi.getConfig(),
  })

  // Local Form State initialized with API config or fallback
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [whatsapp, setWhatsapp] = useState('')
  const [email, setEmail] = useState('')
  const [address, setAddress] = useState('')
  const [logoUrl, setLogoUrl] = useState('')
  const [terms, setTerms] = useState('')
  const [services, setServices] = useState<string[]>([])
  const [coverageAreas, setCoverageAreas] = useState<string[]>([])

  // Tags input helpers
  const [newService, setNewService] = useState('')
  const [newCoverage, setNewCoverage] = useState('')

  // Payment Card Modal State
  const [isCardModalOpen, setIsCardModalOpen] = useState(false)
  const [bank, setBank] = useState('')
  const [cardNumber, setCardNumber] = useState('')
  const [clabe, setClabe] = useState('')
  const [beneficiary, setBeneficiary] = useState('')

  // Sync state when API config is fetched
  useEffect(() => {
    const config = apiConfig || defaultBusinessConfig
    setName(config.name || '')
    setPhone(config.phone || '')
    setWhatsapp(config.whatsapp || '')
    setEmail(config.email || '')
    setAddress(config.address || '')
    setLogoUrl(config.logoUrl || '')
    setTerms(config.termsAndConditions || '')
    setServices(config.services || defaultBusinessConfig.services)
    setCoverageAreas(config.coverageAreas || defaultBusinessConfig.coverageAreas)
  }, [apiConfig])

  // Update Config Mutation
  const updateMutation = useMutation({
    mutationFn: (data: Partial<BusinessConfig>) => financeApi.updateConfig(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['businessConfig'] })
      toast.success('Configuración actualizada correctamente')
    },
    onError: (err: any) => {
      toast.error(err.message || 'Error al guardar la configuración')
    },
  })

  // Add Payment Card Mutation
  const addCardMutation = useMutation({
    mutationFn: (data: CreatePaymentCardDto) => financeApi.addPaymentCard(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['businessConfig'] })
      toast.success('Cuenta bancaria agregada exitosamente')
      setIsCardModalOpen(false)
      setBank('')
      setCardNumber('')
      setClabe('')
      setBeneficiary('')
    },
    onError: (err: any) => {
      toast.error(err.message || 'Error al agregar la cuenta bancaria')
    },
  })

  // Delete Payment Card Mutation
  const deleteCardMutation = useMutation({
    mutationFn: (cardId: string) => financeApi.deletePaymentCard(cardId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['businessConfig'] })
      toast.success('Cuenta bancaria eliminada')
    },
    onError: (err: any) => {
      toast.error(err.message || 'Error al eliminar la cuenta bancaria')
    },
  })

  const handleSaveGeneral = () => {
    if (!name.trim()) {
      toast.error('El nombre comercial de la empresa es obligatorio')
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
    })
  }

  const handleAddService = () => {
    const s = newService.trim()
    if (s && !services.includes(s)) {
      setServices([...services, s])
      setNewService('')
    }
  }

  const handleRemoveService = (service: string) => {
    setServices(services.filter((item) => item !== service))
  }

  const handleAddCoverage = () => {
    const c = newCoverage.trim()
    if (c && !coverageAreas.includes(c)) {
      setCoverageAreas([...coverageAreas, c])
      setNewCoverage('')
    }
  }

  const handleRemoveCoverage = (area: string) => {
    setCoverageAreas(coverageAreas.filter((item) => item !== area))
  }

  const handleAddCardSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!bank.trim() || !beneficiary.trim()) {
      toast.error('El banco y el titular beneficiario son obligatorios')
      return
    }
    addCardMutation.mutate({
      bank,
      cardNumber,
      clabe,
      beneficiary,
    })
  }

  const activeCards: PaymentCard[] = apiConfig?.paymentCards || defaultBusinessConfig.paymentCards

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3 text-violet-400">
        <Loader />
        <p className="text-sm font-medium">Cargando configuración...</p>
      </div>
    )
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <PageHeader
        title="Configuración"
        description="Administra la información comercial, teléfonos, cuentas bancarias y cláusulas para cotizaciones y contratos."
      />

      <div className="grid gap-4 sm:gap-6 lg:grid-cols-2">
        {/* Datos Generales */}
        <Card className="border-violet-100 bg-white shadow-sm rounded-2xl overflow-hidden">
          <CardHeader className="pb-3 border-b border-violet-50 bg-violet-50/30">
            <CardTitle className="text-sm font-bold text-violet-950 flex items-center gap-2">
              <Building2 className="h-4 w-4 text-violet-600" />
              Información de la empresa
            </CardTitle>
            <CardDescription className="text-xs text-violet-500">
              Datos que aparecen en las notas, cotizaciones y membrete oficial.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4 pt-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="bname" className="text-sm font-medium text-violet-900 flex items-center gap-1.5">
                <Building2 className="h-3.5 w-3.5 text-violet-400" />
                Nombre comercial <span className="text-red-500">*</span>
              </Label>
              <Input
                id="bname"
                value={name}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
                placeholder="Ej. Eventos Mendoza"
                className="h-12 rounded-xl border-violet-200 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 text-sm font-medium"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="bphone" className="text-sm font-medium text-violet-900 flex items-center gap-1.5">
                  <Phone className="h-3.5 w-3.5 text-violet-400" />
                  Teléfono principal
                </Label>
                <Input
                  id="bphone"
                  value={phone}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setPhone(e.target.value)}
                  placeholder="656 123 4567"
                  className="h-12 rounded-xl border-violet-200 focus:border-violet-500 text-sm"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="bws" className="text-sm font-medium text-violet-900 flex items-center gap-1.5">
                  <MessageSquare className="h-3.5 w-3.5 text-violet-400" />
                  WhatsApp
                </Label>
                <Input
                  id="bws"
                  value={whatsapp}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setWhatsapp(e.target.value)}
                  placeholder="526561234567"
                  className="h-12 rounded-xl border-violet-200 focus:border-violet-500 text-sm"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="bemail" className="text-sm font-medium text-violet-900 flex items-center gap-1.5">
                <Mail className="h-3.5 w-3.5 text-violet-400" />
                Correo electrónico
              </Label>
              <Input
                id="bemail"
                type="email"
                value={email}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                placeholder="contacto@eventosmendoza.com"
                className="h-12 rounded-xl border-violet-200 focus:border-violet-500 text-sm"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="baddr" className="text-sm font-medium text-violet-900 flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5 text-violet-400" />
                Dirección del local / bodega
              </Label>
              <Input
                id="baddr"
                value={address}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setAddress(e.target.value)}
                placeholder="Av. Principal #123, Cd. Juárez, Chih."
                className="h-12 rounded-xl border-violet-200 focus:border-violet-500 text-sm"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="blogo" className="text-sm font-medium text-violet-900 flex items-center gap-1.5">
                <Globe className="h-3.5 w-3.5 text-violet-400" />
                URL del Logotipo (Opcional)
              </Label>
              <Input
                id="blogo"
                value={logoUrl}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setLogoUrl(e.target.value)}
                placeholder="https://eventos-mendoza.com/logo.png"
                className="h-12 rounded-xl border-violet-200 focus:border-violet-500 text-sm"
              />
            </div>
          </CardContent>
        </Card>

        {/* Cuentas Bancarias / CLABEs */}
        <Card className="border-violet-100 bg-white shadow-sm rounded-2xl overflow-hidden flex flex-col justify-between">
          <div>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 border-b border-violet-50 bg-violet-50/30 pb-3">
              <div className="space-y-0.5">
                <CardTitle className="text-sm font-bold text-violet-950 flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-violet-600" />
                  Cuentas para transferencias
                </CardTitle>
                <CardDescription className="text-xs text-violet-500">
                  Aparecen impresas en las notas para depósitos de anticipos.
                </CardDescription>
              </div>
              <motion.div whileTap={{ scale: 0.95 }}>
                <Button
                  onClick={() => setIsCardModalOpen(true)}
                  size="sm"
                  className="bg-violet-600 hover:bg-violet-700 text-white rounded-xl h-10 px-3 font-semibold shadow-md shadow-violet-200 touch-manipulation gap-1.5"
                >
                  <Plus className="h-4 w-4" />
                  <span className="hidden sm:inline">Agregar cuenta</span>
                  <span className="sm:hidden">Agregar</span>
                </Button>
              </motion.div>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="space-y-3">
                <AnimatePresence>
                  {activeCards.map((card, idx) => (
                    <motion.div
                      key={card.id || `card_${idx}`}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      className="p-3.5 rounded-xl border border-violet-100 bg-violet-50/40 flex items-center justify-between gap-3"
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <Badge className="bg-violet-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-md">
                            {card.bank}
                          </Badge>
                          <span className="text-xs font-semibold text-violet-950 truncate">
                            {card.beneficiary}
                          </span>
                        </div>
                        {card.clabe && (
                          <p className="text-xs text-violet-600 font-mono mt-1">
                            CLABE: <span className="font-bold">{card.clabe}</span>
                          </p>
                        )}
                        {card.cardNumber && (
                          <p className="text-xs text-violet-500 font-mono mt-0.5">
                            Tarjeta: {card.cardNumber}
                          </p>
                        )}
                      </div>

                      <motion.div whileTap={{ scale: 0.9 }}>
                        <Button
                          variant="ghost"
                          size="icon"
                          disabled={deleteCardMutation.isPending}
                          onClick={() => card.id && deleteCardMutation.mutate(card.id)}
                          className="h-9 w-9 text-red-500 hover:bg-red-50 hover:text-red-700 rounded-xl touch-manipulation flex-shrink-0"
                          aria-label="Eliminar cuenta"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </motion.div>
                    </motion.div>
                  ))}
                </AnimatePresence>

                {activeCards.length === 0 && (
                  <div className="p-6 text-center text-violet-400 border border-dashed border-violet-100 rounded-xl">
                    <CreditCard className="h-6 w-6 text-violet-300 mx-auto mb-2" />
                    <p className="text-xs font-medium">No hay cuentas bancarias registradas.</p>
                  </div>
                )}
              </div>
            </CardContent>
          </div>
        </Card>
      </div>

      {/* Servicios & Cobertura */}
      <div className="grid gap-4 sm:gap-6 lg:grid-cols-2">
        {/* Servicios */}
        <Card className="border-violet-100 bg-white shadow-sm rounded-2xl overflow-hidden">
          <CardHeader className="pb-3 border-b border-violet-50 bg-violet-50/30">
            <CardTitle className="text-sm font-bold text-violet-950 flex items-center gap-2">
              <Tags className="h-4 w-4 text-violet-600" />
              Catálogo de Servicios
            </CardTitle>
            <CardDescription className="text-xs text-violet-500">
              Etiquetas de servicios ofrecidos en el catálogo comercial.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-4 space-y-4">
            <div className="flex gap-2">
              <Input
                value={newService}
                onChange={(e) => setNewService(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddService())}
                placeholder="Ej. Pistas de baile, Sonido..."
                className="h-11 rounded-xl border-violet-200 text-sm"
              />
              <Button
                onClick={handleAddService}
                type="button"
                className="bg-violet-600 hover:bg-violet-700 text-white rounded-xl h-11 px-4 font-semibold touch-manipulation"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2 pt-1">
              {services.map((serv) => (
                <Badge
                  key={serv}
                  variant="secondary"
                  className="bg-violet-100 text-violet-800 border border-violet-200 px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5"
                >
                  {serv}
                  <button
                    onClick={() => handleRemoveService(serv)}
                    className="hover:text-red-600 transition-colors"
                  >
                    ×
                  </button>
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Áreas de Cobertura */}
        <Card className="border-violet-100 bg-white shadow-sm rounded-2xl overflow-hidden">
          <CardHeader className="pb-3 border-b border-violet-50 bg-violet-50/30">
            <CardTitle className="text-sm font-bold text-violet-950 flex items-center gap-2">
              <MapPin className="h-4 w-4 text-violet-600" />
              Áreas de Cobertura
            </CardTitle>
            <CardDescription className="text-xs text-violet-500">
              Zonas urbanas y municipios donde se brinda servicio de renta.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-4 space-y-4">
            <div className="flex gap-2">
              <Input
                value={newCoverage}
                onChange={(e) => setNewCoverage(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddCoverage())}
                placeholder="Ej. Valle de Juárez, El Paso..."
                className="h-11 rounded-xl border-violet-200 text-sm"
              />
              <Button
                onClick={handleAddCoverage}
                type="button"
                className="bg-violet-600 hover:bg-violet-700 text-white rounded-xl h-11 px-4 font-semibold touch-manipulation"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2 pt-1">
              {coverageAreas.map((area) => (
                <Badge
                  key={area}
                  variant="secondary"
                  className="bg-violet-100 text-violet-800 border border-violet-200 px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5"
                >
                  {area}
                  <button
                    onClick={() => handleRemoveCoverage(area)}
                    className="hover:text-red-600 transition-colors"
                  >
                    ×
                  </button>
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Cláusulas y Términos */}
      <Card className="border-violet-100 bg-white shadow-sm rounded-2xl overflow-hidden">
        <CardHeader className="pb-3 border-b border-violet-50 bg-violet-50/30">
          <CardTitle className="text-sm font-bold text-violet-950 flex items-center gap-2">
            <FileText className="h-4 w-4 text-violet-600" />
            Términos y Cláusulas de Contrato
          </CardTitle>
          <CardDescription className="text-xs text-violet-500">
            Texto de compromiso y responsabilidad de mobiliario impreso en los contratos.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-4 space-y-3">
          <textarea
            value={terms}
            onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setTerms(e.target.value)}
            placeholder="El cliente se compromete a mantener el mobiliario en buen estado..."
            className="w-full min-h-[110px] rounded-xl border border-violet-200 p-3.5 text-sm focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 resize-y"
          />
        </CardContent>
      </Card>

      {/* Botón Guardar Cambios flotante/fijo */}
      <div className="pt-2">
        <motion.div whileTap={{ scale: 0.98 }}>
          <Button
            size="lg"
            disabled={updateMutation.isPending}
            onClick={handleSaveGeneral}
            className="w-full h-14 bg-violet-600 hover:bg-violet-700 text-white font-bold text-base shadow-lg shadow-violet-600/20 transition-all rounded-xl touch-manipulation gap-2"
          >
            {updateMutation.isPending ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Save className="h-5 w-5" />
            )}
            Guardar Configuración
          </Button>
        </motion.div>
      </div>

      {/* Modal Agregar Tarjeta - Desktop */}
      <Dialog open={isCardModalOpen} onOpenChange={setIsCardModalOpen}>
        <DialogContent className="hidden sm:block sm:max-w-[440px] rounded-2xl p-6">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-violet-950">Agregar Cuenta Bancaria</DialogTitle>
            <DialogDescription className="text-sm text-violet-500">
              Registra una tarjeta o CLABE interbancaria para depósitos.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleAddCardSubmit} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label className="text-sm font-medium text-violet-900">Banco *</Label>
              <Input
                value={bank}
                onChange={(e) => setBank(e.target.value)}
                placeholder="Ej. BBVA / Santander"
                className="h-11 rounded-xl border-violet-200 text-sm"
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm font-medium text-violet-900">Beneficiario / Titular *</Label>
              <Input
                value={beneficiary}
                onChange={(e) => setBeneficiary(e.target.value)}
                placeholder="Ej. Eventos Mendoza SA de CV"
                className="h-11 rounded-xl border-violet-200 text-sm"
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm font-medium text-violet-900">CLABE Interbancaria (18 dígitos)</Label>
              <Input
                value={clabe}
                onChange={(e) => setClabe(e.target.value)}
                placeholder="012180000000000000"
                className="h-11 rounded-xl border-violet-200 text-sm font-mono"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm font-medium text-violet-900">Número de Tarjeta (16 dígitos)</Label>
              <Input
                value={cardNumber}
                onChange={(e) => setCardNumber(e.target.value)}
                placeholder="4152 3138 0000 0000"
                className="h-11 rounded-xl border-violet-200 text-sm font-mono"
              />
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsCardModalOpen(false)}
                className="rounded-xl border-violet-200 text-violet-700 h-11"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={addCardMutation.isPending}
                className="bg-violet-600 hover:bg-violet-700 text-white rounded-xl h-11 px-5 font-semibold"
              >
                {addCardMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Guardar Cuenta'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Sheet Agregar Tarjeta - Móvil */}
      <Sheet open={isCardModalOpen} onOpenChange={setIsCardModalOpen}>
        <SheetContent side="bottom" className="sm:hidden h-[85vh] rounded-t-3xl border-t border-violet-100 bg-white p-0">
          <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-sm px-4 pt-3 pb-2 border-b border-violet-100/50">
            <div className="w-10 h-1 rounded-full bg-violet-200 mx-auto mb-3" />
            <SheetHeader className="text-left">
              <SheetTitle className="text-lg font-bold text-violet-950">Agregar Cuenta Bancaria</SheetTitle>
              <SheetDescription className="text-sm text-violet-500">
                Registra una tarjeta o CLABE interbancaria para depósitos.
              </SheetDescription>
            </SheetHeader>
          </div>

          <form onSubmit={handleAddCardSubmit} className="p-4 space-y-4 overflow-y-auto h-full pb-10">
            <div className="space-y-1.5">
              <Label className="text-sm font-medium text-violet-900">Banco *</Label>
              <Input
                value={bank}
                onChange={(e) => setBank(e.target.value)}
                placeholder="Ej. BBVA"
                className="h-12 rounded-xl border-violet-200 text-sm"
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm font-medium text-violet-900">Beneficiario / Titular *</Label>
              <Input
                value={beneficiary}
                onChange={(e) => setBeneficiary(e.target.value)}
                placeholder="Ej. Eventos Mendoza"
                className="h-12 rounded-xl border-violet-200 text-sm"
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm font-medium text-violet-900">CLABE Interbancaria (18 dígitos)</Label>
              <Input
                value={clabe}
                onChange={(e) => setClabe(e.target.value)}
                placeholder="012180000000000000"
                className="h-12 rounded-xl border-violet-200 text-sm font-mono"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm font-medium text-violet-900">Número de Tarjeta (16 dígitos)</Label>
              <Input
                value={cardNumber}
                onChange={(e) => setCardNumber(e.target.value)}
                placeholder="4152 3138 0000 0000"
                className="h-12 rounded-xl border-violet-200 text-sm font-mono"
              />
            </div>

            <div className="pt-4">
              <Button
                type="submit"
                disabled={addCardMutation.isPending}
                className="w-full bg-violet-600 hover:bg-violet-700 text-white rounded-xl h-12 font-bold shadow-md shadow-violet-200 touch-manipulation"
              >
                {addCardMutation.isPending ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Guardar Cuenta'}
              </Button>
            </div>
          </form>
        </SheetContent>
      </Sheet>
    </div>
  )
}
