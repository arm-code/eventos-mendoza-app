'use client';

import { useState, useEffect, use } from 'react';
import { useApi } from '@/hooks/useApi';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Printer, ArrowLeft, Calendar, User, Phone, MapPin, FileText } from "lucide-react";
import Link from 'next/link';
import { Loader } from '@/components/Loaders/Loader.component';

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

    const fetchNoteDetail = async () => {
        const res = await request(`/sales-notes/${resolvedParams.id}`);
        if (res.data) {
            setNote(res.data);
        }
    };

    useEffect(() => {
        fetchNoteDetail();
    }, [resolvedParams.id]);

    if (loading) return <Loader />;
    if (error) return (
        <div className="p-8 text-center text-red-600">
            <p>Error: {error}</p>
            <Link href="/tools/notas-venta" className="text-violet-600 hover:underline mt-4 inline-block">
                Volver al listado
            </Link>
        </div>
    );
    if (!note) return null;

    return (
        <div className="p-4">
            <div className="max-w-4xl mx-auto mb-4 print:hidden">
                <Link href="/tools/notas-venta">
                    <Button variant="ghost" className="gap-2 text-violet-600 hover:text-violet-900 border border-violet-100">
                        <ArrowLeft className="h-4 w-4" />
                        Volver al historial
                    </Button>
                </Link>
            </div>
            <SalesNoteDetailView note={note} />
        </div>
    );
}

