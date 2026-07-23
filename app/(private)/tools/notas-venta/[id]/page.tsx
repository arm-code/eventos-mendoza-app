'use client';

import { useState, useEffect, use } from 'react';
import { useApi } from '@/hooks/useApi';
import { Button } from "@/components/ui/button";
import { ArrowLeft, FileText, Loader2 } from "lucide-react";
import Link from 'next/link';
import { Loader } from '@/components/Loaders/Loader.component';
import SalesNoteDetailView from '@/components/sales/SalesNoteDetailView.component';

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

export default function SaleNoteDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = use(params);
    const { request, loading, error } = useApi();
    const [note, setNote] = useState<SaleNoteDetail | null>(null);

    useEffect(() => {
        request(`/sales-notes/${resolvedParams.id}`).then((res) => {
            if (res.data) setNote(res.data);
        });
    }, [resolvedParams.id]);

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
                    <Button variant="outline" className="rounded-xl border-violet-200 text-violet-700 hover:bg-violet-50 h-11 touch-manipulation gap-2">
                        <ArrowLeft className="h-4 w-4" />
                        Volver al historial
                    </Button>
                </Link>
            </div>
        </div>
    );

    if (!note) return null;

    return (
        <div className="space-y-4 sm:space-y-6">
            {/* Encabezado de página con botón volver (desktop) */}
            <div className="flex items-center gap-3">
                <Link href="/tools/notas-venta" className="hidden sm:block">
                    <Button variant="outline" className="rounded-xl border-violet-200 text-violet-700 hover:bg-violet-50 h-10 touch-manipulation gap-2">
                        <ArrowLeft className="h-4 w-4" />
                        Volver
                    </Button>
                </Link>
                <div>
                    <h1 className="text-xl sm:text-2xl font-bold text-violet-950">
                        Nota {note.note_number}
                    </h1>
                </div>
            </div>

            {/* Contenido principal */}
            <SalesNoteDetailView note={note} />

            {/* Botón volver en mobile */}
            <div className="sm:hidden pb-4">
                <Link href="/tools/notas-venta">
                    <Button variant="outline" className="w-full rounded-xl border-violet-200 text-violet-700 hover:bg-violet-50 h-12 touch-manipulation gap-2">
                        <ArrowLeft className="h-4 w-4" />
                        Volver al historial
                    </Button>
                </Link>
            </div>
        </div>
    );
}