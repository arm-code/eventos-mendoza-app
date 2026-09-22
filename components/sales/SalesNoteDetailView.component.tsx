// components/sales/SalesNoteDetailView.component.tsx
'use client';

import React, { useRef, useState } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    Printer, Calendar, User, Phone, MapPin, FileText,
    Download, Image as ImageIcon, Loader2
} from "lucide-react";
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { cn } from '@/lib/utils';

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

interface Props {
    note: SaleNoteDetail;
    onClose?: () => void;
}

const dateFmt = new Intl.DateTimeFormat('es-MX', { day: 'numeric', month: 'long', year: 'numeric' });

function parseDate(value: string): Date {
    const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value.split('T')[0]);
    const date = m ? new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3])) : new Date(value);
    return Number.isNaN(date.getTime()) ? new Date() : date;
}

function formatCurrency(value: number) {
    return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(value);
}

// ─────────────────────────────────────────────────────────────────────────────
// Nodo de exportación (off-screen)
// ─────────────────────────────────────────────────────────────────────────────
function PrintNode({ note, printRef }: { note: SaleNoteDetail; printRef: React.RefObject<HTMLDivElement | null> }) {
    const formattedDate = dateFmt.format(parseDate(note.created_at));

    return (
        <div
            aria-hidden="true"
            style={{
                position: 'absolute',
                left: '-9999px',
                top: 0,
                zIndex: -1,
                width: 794,
                pointerEvents: 'none',
            }}
        >
            <div
                ref={printRef}
                className="bg-background text-foreground p-10"
                style={{
                    width: 794,
                    boxSizing: 'border-box',
                    fontSize: 14,
                    lineHeight: 1.5,
                }}
            >
                {/* Encabezado */}
                <header className="mb-8 flex items-start justify-between border-b pb-6">
                    <div>
                        <h1 className="text-2xl font-semibold text-primary">Nota de venta</h1>
                        <p className="mt-1 font-semibold text-primary">#{note.note_number}</p>
                    </div>
                    <div className="text-right">
                        <p className="text-muted-foreground">{formattedDate}</p>
                        <p className="mt-1 text-muted-foreground">Expedido por: {note.issued_by}</p>
                    </div>
                </header>

                {/* Cliente */}
                <section className="mb-8 rounded-xl border p-5">
                    <h2 className="text-sm font-semibold text-muted-foreground">Cliente</h2>
                    <p className="mt-2 font-medium">{note.client_name}</p>
                    {note.client_phone && <p className="mt-1">{note.client_phone}</p>}
                    {note.client_address && <p className="mt-1">{note.client_address}</p>}
                </section>

                {/* Tabla */}
                <table className="mb-8 w-full border-collapse text-left text-sm">
                    <thead className="bg-muted/50 text-muted-foreground">
                        <tr>
                            <th className="border-b p-3 font-semibold">Concepto</th>
                            <th className="w-16 border-b p-3 text-center font-semibold">Cant.</th>
                            <th className="w-28 border-b p-3 text-right font-semibold">P. Unitario</th>
                            <th className="w-32 border-b p-3 text-right font-semibold">Importe</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y">
                        {note.items.map((item) => (
                            <tr key={item.id}>
                                <td className="p-3">{item.description}</td>
                                <td className="p-3 text-center">{item.quantity}</td>
                                <td className="p-3 text-right tabular-nums">{formatCurrency(item.unit_price)}</td>
                                <td className="p-3 text-right font-medium tabular-nums">{formatCurrency(item.amount)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {/* Totales */}
                <section className="mb-10 flex justify-end">
                    <div className="w-72 space-y-2 rounded-xl border bg-muted/30 p-5">
                        <div className="flex justify-between text-muted-foreground">
                            <span>Subtotal</span>
                            <span className="tabular-nums">{formatCurrency(note.subtotal)}</span>
                        </div>
                        {Number(note.tax_amount) > 0 && (
                            <div className="flex justify-between text-muted-foreground">
                                <span>IVA (16%)</span>
                                <span className="tabular-nums">{formatCurrency(note.tax_amount)}</span>
                            </div>
                        )}
                        <div className="flex justify-between border-t pt-3 font-semibold">
                            <span>Total</span>
                            <span className="text-lg tabular-nums text-primary">{formatCurrency(note.total)}</span>
                        </div>
                    </div>
                </section>

                <footer className="mt-12 text-center text-sm text-muted-foreground">
                    Gracias por su preferencia
                </footer>
            </div>
        </div>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// Vista en pantalla unificada
// ─────────────────────────────────────────────────────────────────────────────
export default function SalesNoteDetailView({ note }: Props) {
    const printRef = useRef<HTMLDivElement>(null);
    const [isExporting, setIsExporting] = useState<'image' | 'pdf' | null>(null);

    const handlePrint = () => window.print();

    const exportToImage = async () => {
        if (!printRef.current) return;
        setIsExporting('image');
        try {
            const canvas = await html2canvas(printRef.current, { scale: 2, logging: false, useCORS: true, backgroundColor: null });
            const link = document.createElement('a');
            link.href = canvas.toDataURL('image/png');
            link.download = `Nota-${note.note_number}.png`;
            link.click();
        } catch (e) {
            console.error('Error exporting image', e);
        } finally {
            setIsExporting(null);
        }
    };

    const exportToPDF = async () => {
        if (!printRef.current) return;
        setIsExporting('pdf');
        try {
            const canvas = await html2canvas(printRef.current, { scale: 2, logging: false, useCORS: true, backgroundColor: null });
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'letter' });
            const margin = 10;
            const pageWidth = pdf.internal.pageSize.getWidth();
            const pageHeight = pdf.internal.pageSize.getHeight();
            const usableWidth = pageWidth - margin * 2;
            const usableHeight = pageHeight - margin * 2;
            const imgProps = pdf.getImageProperties(imgData);
            const imgRatio = imgProps.height / imgProps.width;
            let renderWidth = usableWidth;
            let renderHeight = usableWidth * imgRatio;

            if (renderHeight > usableHeight) {
                const scaleFactor = Math.min(usableWidth / imgProps.width, usableHeight / imgProps.height);
                renderWidth = imgProps.width * scaleFactor;
                renderHeight = imgProps.height * scaleFactor;
            }
            const x = (pageWidth - renderWidth) / 2;
            const y = margin;

            pdf.addImage(imgData, 'PNG', x, y, renderWidth, renderHeight);
            pdf.save(`Nota-${note.note_number}.pdf`);
        } catch (e) {
            console.error('Error exporting PDF', e);
        } finally {
            setIsExporting(null);
        }
    };

    const formattedDate = dateFmt.format(parseDate(note.created_at));

    return (
        <div className="space-y-6 pb-6">
            <PrintNode note={note} printRef={printRef} />

            {/* ── Barra de acciones ── */}
            <div className="flex flex-wrap gap-3 print:hidden">
                <Button
                    onClick={exportToImage}
                    disabled={isExporting !== null}
                    variant="outline"
                    className="h-11 flex-1 sm:flex-none"
                >
                    {isExporting === 'image' ? (
                        <Loader2 className="mr-2 size-4 animate-spin" aria-hidden />
                    ) : (
                        <ImageIcon className="mr-2 size-4" aria-hidden />
                    )}
                    Imagen
                </Button>

                <Button
                    onClick={exportToPDF}
                    disabled={isExporting !== null}
                    className="h-11 flex-1 sm:flex-none"
                >
                    {isExporting === 'pdf' ? (
                        <Loader2 className="mr-2 size-4 animate-spin" aria-hidden />
                    ) : (
                        <Download className="mr-2 size-4" aria-hidden />
                    )}
                    PDF
                </Button>

                <Button
                    onClick={handlePrint}
                    variant="outline"
                    className="hidden h-11 sm:flex"
                >
                    <Printer className="mr-2 size-4" aria-hidden />
                    Imprimir
                </Button>
            </div>

            {/* ── Documento Unificado ── */}
            <Card className="space-y-6 p-4 sm:p-6">
                <header className="flex flex-col gap-4 border-b pb-5 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                        <h2 className="text-xl font-semibold tracking-tight">Nota de venta</h2>
                        <p className="mt-1 font-medium text-muted-foreground">#{note.note_number}</p>
                    </div>
                    <div className="flex flex-col gap-1 sm:items-end">
                        <div className="flex items-center gap-2 text-[15px] font-medium">
                            <Calendar className="size-4 text-muted-foreground" aria-hidden />
                            {formattedDate}
                        </div>
                        <p className="text-sm text-muted-foreground">Expedido por: {note.issued_by}</p>
                    </div>
                </header>

                <section className="rounded-xl border bg-card p-4">
                    <div className="flex items-center gap-2 mb-3">
                        <User className="size-4 text-muted-foreground" aria-hidden />
                        <h3 className="text-sm font-semibold text-muted-foreground">Cliente</h3>
                    </div>
                    <p className="font-medium">{note.client_name}</p>
                    {note.client_phone && (
                        <div className="mt-2 flex items-center gap-2 text-[15px]">
                            <Phone className="size-4 text-muted-foreground" aria-hidden />
                            {note.client_phone}
                        </div>
                    )}
                    {note.client_address && (
                        <div className="mt-2 flex items-start gap-2 text-[15px]">
                            <MapPin className="size-4 shrink-0 text-muted-foreground" aria-hidden />
                            <span>{note.client_address}</span>
                        </div>
                    )}
                </section>

                <section className="overflow-x-auto rounded-xl border bg-card">
                    <table className="w-full text-left text-[15px]">
                        <thead className="border-b bg-muted/50 text-sm font-semibold text-muted-foreground">
                            <tr>
                                <th className="p-4">Concepto</th>
                                <th className="p-4 text-center">Cant.</th>
                                <th className="p-4 text-right">P. Unitario</th>
                                <th className="p-4 text-right">Importe</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {note.items.map((item) => (
                                <tr key={item.id}>
                                    <td className="p-4">{item.description}</td>
                                    <td className="p-4 text-center tabular-nums">{item.quantity}</td>
                                    <td className="p-4 text-right tabular-nums">{formatCurrency(item.unit_price)}</td>
                                    <td className="p-4 text-right font-medium tabular-nums text-primary">{formatCurrency(item.amount)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </section>

                <section className="flex justify-end">
                    <div className="w-full space-y-2 rounded-xl border bg-muted/30 p-5 sm:w-72">
                        <div className="flex justify-between text-[15px] text-muted-foreground">
                            <span>Subtotal</span>
                            <span className="tabular-nums">{formatCurrency(note.subtotal)}</span>
                        </div>
                        {Number(note.tax_amount) > 0 && (
                            <div className="flex justify-between text-[15px] text-muted-foreground">
                                <span>IVA (16%)</span>
                                <span className="tabular-nums">{formatCurrency(note.tax_amount)}</span>
                            </div>
                        )}
                        <div className="flex justify-between border-t pt-3 font-semibold">
                            <span>Total</span>
                            <span className="text-lg tabular-nums text-primary">{formatCurrency(note.total)}</span>
                        </div>
                    </div>
                </section>
            </Card>
        </div>
    );
}