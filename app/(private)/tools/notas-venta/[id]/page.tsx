'use client';

import { useState, useEffect, use } from 'react';
import { useApi } from '@/hooks/useApi';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Printer, ArrowLeft, Calendar, User, Phone, MapPin, FileText, Loader2, Download, ImageIcon } from "lucide-react";
import Link from 'next/link';
import { Loader } from '@/components/Loaders/Loader.component';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { exportNodeToImage, exportNodeToPdf } from '@/lib/export-document'

interface SaleNoteItem {
    id: number;
    product_id?: number;
    quantity: number;
    description: string;
    unit_price: number;
    amount: number;
}

interface SaleNoteDetail {
    id: number;
    note_number: string;
    client_name: string;
    client_phone: string;
    client_address: string;
    subtotal: number;
    tax_amount: number;
    total: number;
    issued_by: string;
    created_at: string;
    items: SaleNoteItem[];
}

import SalesNoteDetailView from '@/components/sales/SalesNoteDetailView.component';

export default function SaleNoteDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = use(params);
    const { request, loading, error } = useApi();
    const [note, setNote] = useState<SaleNoteDetail | null>(null);
    const [exporting, setExporting] = useState<'png' | 'pdf' | null>(null);
    const docRef = useState<HTMLDivElement | null>(null);

    const fetchNoteDetail = async () => {
        const res = await request(`/sales-notes/${resolvedParams.id}`);
        if (res.data) {
            setNote(res.data);
        }
    };

    useEffect(() => {
        fetchNoteDetail();
    }, [resolvedParams.id]);

    async function handleExport(type: 'png' | 'pdf') {
        const node = document.querySelector('.sale-note-detail') as HTMLElement | null;
        if (!node) return;
        setExporting(type);
        try {
            if (type === 'png') {
                await exportNodeToImage(node, `nota-${note?.note_number || 'detalle'}`);
                toast.success('Imagen descargada');
            } else {
                await exportNodeToPdf(node, `nota-${note?.note_number || 'detalle'}`);
                toast.success('PDF descargado');
            }
        } catch (err) {
            toast.error('Error al exportar');
        } finally {
            setExporting(null);
        }
    }

    if (loading) return (
        <div className="flex flex-col items-center justify-center py-20 gap-3 text-violet-400">
            <Loader />
            <p className="text-sm">Cargando detalle...</p>
        </div>
    );

    if (error) return (
        <div className="p-4 sm:p-8 text-center">
            <div className="max-w-md mx-auto">
                <div className="p-4 rounded-full bg-red-50 w-fit mx-auto mb-4">
                    <FileText className="h-8 w-8 text-red-400" />
                </div>
                <p className="text-red-600 font-medium mb-4">{error}</p>
                <Link href="/tools/notas-venta">
                    <Button
                        variant="outline"
                        className="rounded-xl border-violet-200 text-violet-700 hover:bg-violet-50 h-11 touch-manipulation"
                    >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Volver al historial
                    </Button>
                </Link>
            </div>
        </div>
    );

    if (!note) return null;

    return (
        <div className="space-y-4 sm:space-y-6">
            {/* Header con acciones */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                    <h1 className="text-xl sm:text-2xl font-bold text-violet-950">Nota {note.note_number}</h1>
                    <p className="text-sm text-violet-600/70 mt-0.5 flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5" />
                        {new Date(note.created_at).toLocaleDateString('es-ES', {
                            day: 'numeric', month: 'long', year: 'numeric'
                        })}
                    </p>
                </div>
                <div className="flex gap-2">
                    <Link href="/tools/notas-venta" className="hidden sm:block">
                        <Button
                            variant="outline"
                            className="rounded-xl border-violet-200 text-violet-700 hover:bg-violet-50 h-11 touch-manipulation gap-2"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            Volver
                        </Button>
                    </Link>
                    <motion.div whileTap={{ scale: 0.95 }}>
                        <Button
                            variant="outline"
                            className="rounded-xl border-violet-200 text-violet-700 hover:bg-violet-50 h-11 touch-manipulation gap-2"
                            onClick={() => handleExport('png')}
                            disabled={exporting !== null}
                        >
                            {exporting === 'png' ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImageIcon className="h-4 w-4" />}
                            <span className="hidden sm:inline">Imagen</span>
                        </Button>
                    </motion.div>
                    <motion.div whileTap={{ scale: 0.95 }}>
                        <Button
                            className="rounded-xl bg-violet-600 hover:bg-violet-700 text-white h-11 shadow-md shadow-violet-200 touch-manipulation gap-2"
                            onClick={() => handleExport('pdf')}
                            disabled={exporting !== null}
                        >
                            {exporting === 'pdf' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                            <span className="hidden sm:inline">PDF</span>
                        </Button>
                    </motion.div>
                </div>
            </div>

            {/* Info del cliente */}
            <Card className="border-violet-100 shadow-sm">
                <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-semibold text-violet-700 flex items-center gap-2">
                        <User className="h-4 w-4" />
                        Información del Cliente
                    </CardTitle>
                </CardHeader>
                <CardContent className="pt-0 space-y-3">
                    <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-violet-400 flex-shrink-0" />
                        <span className="text-sm font-medium text-violet-950">{note.client_name}</span>
                    </div>
                    {note.client_phone && (
                        <div className="flex items-center gap-2">
                            <Phone className="h-4 w-4 text-violet-400 flex-shrink-0" />
                            <span className="text-sm text-violet-700">{note.client_phone}</span>
                        </div>
                    )}
                    {note.client_address && (
                        <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-violet-400 flex-shrink-0" />
                            <span className="text-sm text-violet-700">{note.client_address}</span>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Detalle de la nota */}
            <div className="sale-note-detail">
                <SalesNoteDetailView note={note} />
            </div>

            {/* Botón volver móvil */}
            <div className="sm:hidden pb-4">
                <Link href="/tools/notas-venta">
                    <Button
                        variant="outline"
                        className="w-full rounded-xl border-violet-200 text-violet-700 hover:bg-violet-50 h-12 touch-manipulation gap-2"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Volver al historial
                    </Button>
                </Link>
            </div>
        </div>
    );
}