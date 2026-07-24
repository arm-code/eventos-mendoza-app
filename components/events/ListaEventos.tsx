import { AnimatePresence, motion } from 'framer-motion'
import React from 'react'
import { Card, CardContent } from '../ui/card'
import { Calendar, Edit2, FileDown, FileText, MapPin, Phone, User, CheckCircle2, Clock, XCircle } from 'lucide-react'
import { Button } from '../ui/button'
import { Loader } from '../Loaders/Loader.component'
import { cn } from '@/lib/utils'
import type { BusinessEvent } from '@/types/finance'
import { formatCurrency, formatDate } from '@/lib/format'

interface ListaEventosProps {
    filteredEvents: BusinessEvent[]
    STATUS_META: Record<string, { label: string; bg: string; text: string; border: string; icon: any }>
    cycleStatus: (event: BusinessEvent) => void
    setContractEvent: (event: BusinessEvent) => void
    openEditModal: (event: BusinessEvent) => void
    isLoading: boolean
    activeTab: 'upcoming' | 'finished' | 'cancelled' | 'all'
}

export const ListaEventos = ({
    filteredEvents,
    STATUS_META,
    cycleStatus,
    setContractEvent,
    openEditModal,
    isLoading,
    activeTab,
}: ListaEventosProps) => {
    return (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <AnimatePresence mode="popLayout">
                {filteredEvents.map((evt) => {
                    const meta = STATUS_META[evt.status || 'pending']
                    const StatusIcon = meta.icon

                    return (
                        <motion.div
                            key={evt.id}
                            layout
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.96 }}
                            transition={{ duration: 0.2 }}
                        >
                            <Card className="border-violet-100/80 bg-white shadow-sm hover:shadow-md hover:border-violet-200 transition-all duration-200 active:scale-[0.99] overflow-hidden">
                                <CardContent className="p-0">
                                    {/* ── Header: Folio + Status ── */}
                                    <div className="flex items-center justify-between gap-2 px-4 pt-4 pb-2">
                                        <div className="min-w-0">
                                            <div className="text-[11px] font-bold text-violet-500 tracking-wider uppercase">
                                                {evt.folio}
                                            </div>
                                            <h3 className="font-bold text-violet-950 text-[15px] leading-tight truncate">
                                                {evt.name}
                                            </h3>
                                        </div>
                                        <button
                                            onClick={() => cycleStatus(evt)}
                                            className={cn(
                                                'shrink-0 flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-bold uppercase tracking-wide border transition-all duration-150',
                                                'active:scale-90 min-h-[36px]',
                                                meta.bg, meta.text, meta.border
                                            )}
                                            title={`Clic para cambiar estado (actual: ${meta.label})`}
                                        >
                                            <StatusIcon className="w-3 h-3" />
                                            <span className="hidden sm:inline">{meta.label}</span>
                                        </button>
                                    </div>

                                    {/* ── Info clave ── */}
                                    <div className="px-4 space-y-1.5 pb-3">
                                        <div className="flex items-center gap-2 text-[13px] text-violet-900">
                                            <User className="w-3.5 h-3.5 text-violet-400 shrink-0" />
                                            <span className="font-semibold truncate">{evt.clientName}</span>
                                        </div>
                                        {evt.clientPhone && (
                                            <div className="flex items-center gap-2 text-[13px] text-violet-700">
                                                <Phone className="w-3.5 h-3.5 text-violet-400 shrink-0" />
                                                <a
                                                    href={`tel:${evt.clientPhone}`}
                                                    className="hover:text-violet-900 hover:underline active:text-violet-950"
                                                >
                                                    {evt.clientPhone}
                                                </a>
                                            </div>
                                        )}
                                        <div className="flex items-center gap-2 text-[13px] text-violet-700">
                                            <Calendar className="w-3.5 h-3.5 text-violet-400 shrink-0" />
                                            <span className="font-medium">
                                                {evt.date ? formatDate(evt.date) : 'Por definir'}
                                            </span>
                                        </div>
                                        <div className="flex items-start gap-2 text-[12px] text-violet-600">
                                            <MapPin className="w-3.5 h-3.5 text-violet-400 shrink-0 mt-0.5" />
                                            <span className="line-clamp-2">{evt.eventAddress}</span>
                                        </div>
                                        {evt.noteFolio && (
                                            <div className="flex items-center gap-2 text-[12px] text-violet-700 font-semibold pt-0.5">
                                                <FileText className="w-3.5 h-3.5 text-violet-500 shrink-0" />
                                                <span>Nota: {evt.noteFolio}</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* ── Costo + Acciones ── */}
                                    <div className="border-t border-violet-50 px-4 py-3">
                                        <div className="flex items-center justify-between mb-3">
                                            <div>
                                                <span className="text-[11px] text-violet-400 font-medium block">Costo total</span>
                                                <span className="text-xl font-bold text-violet-950">
                                                    {formatCurrency(evt.cost || 0)}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Botones de acción: apilados en móvil, lado a lado en desktop */}
                                        <div className="flex flex-col sm:flex-row gap-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => setContractEvent(evt)}
                                                className="w-full sm:w-auto h-11 rounded-xl border-violet-200 text-violet-700 hover:bg-violet-50 active:bg-violet-100 active:scale-[0.97] text-sm font-semibold gap-2 transition-all"
                                            >
                                                <FileDown className="w-4 h-4 text-violet-600" />
                                                Ver Contrato
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => openEditModal(evt)}
                                                className="w-full sm:w-auto h-11 rounded-xl text-violet-600 hover:bg-violet-50 active:bg-violet-100 active:scale-[0.97] text-sm font-semibold gap-2 transition-all"
                                            >
                                                <Edit2 className="w-4 h-4" />
                                                Editar
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    )
                })}
            </AnimatePresence>

            {filteredEvents.length === 0 && (
                <Card className="col-span-full border-violet-100 bg-white p-8 text-center">
                    {isLoading ? (
                        <div className="flex items-center justify-center gap-2 text-violet-600 font-semibold py-4">
                            <Loader />
                            <span>Cargando eventos...</span>
                        </div>
                    ) : (
                        <motion.div
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="space-y-3"
                        >
                            <Calendar className="w-12 h-12 text-violet-300 mx-auto opacity-60" />
                            <p className="text-violet-900 font-bold text-base">
                                No hay eventos {activeTab !== 'all' ? 'en esta categoría' : 'guardados'}.
                            </p>
                            <p className="text-sm text-violet-500">
                                Presiona "Nuevo Evento" para agendar el primer servicio.
                            </p>
                        </motion.div>
                    )}
                </Card>
            )}
        </div>
    )
}
