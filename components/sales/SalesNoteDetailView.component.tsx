'use client';

import React, { useRef, useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    Printer, Calendar, User, Phone, MapPin, FileText,
    Download, Image as ImageIcon, Loader2, Receipt, Hash, ChevronRight
} from "lucide-react";
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { motion } from 'framer-motion';
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

function formatCurrency(value: number) {
    return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(value);
}

// ─────────────────────────────────────────────────────────────────────────────
// Nodo off-screen de exportación: siempre 794px, nunca visible en pantalla.
// ─────────────────────────────────────────────────────────────────────────────
function PrintNode({ note, printRef }: { note: SaleNoteDetail; printRef: React.RefObject<HTMLDivElement | null> }) {
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
                style={{
                    width: 794,
                    backgroundColor: '#ffffff',
                    color: '#1a1626',
                    fontFamily: 'Arial, sans-serif',
                    padding: 40,
                    boxSizing: 'border-box',
                    fontSize: 13,
                }}
            >
                {/* Encabezado */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '2px solid #7c3aed', paddingBottom: 20, marginBottom: 24 }}>
                    <div>
                        <div style={{ fontSize: 24, fontWeight: 800, color: '#5b21b6' }}>Nota de Venta</div>
                        <div style={{ fontSize: 15, fontWeight: 700, color: '#7c3aed', marginTop: 4 }}>#{note.note_number}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: 13, color: '#6b6577' }}>
                            {new Date(note.created_at).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}
                        </div>
                        <div style={{ fontSize: 13, color: '#6b6577', marginTop: 4 }}>Expedido por: {note.issued_by}</div>
                    </div>
                </div>

                {/* Datos del cliente */}
                <div style={{ marginBottom: 24 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: '#7c3aed', textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 8 }}>Datos del Cliente</div>
                    <div style={{ fontSize: 15, fontWeight: 600, textTransform: 'uppercase' }}>{note.client_name}</div>
                    {note.client_phone && <div style={{ fontSize: 13, color: '#6b6577', marginTop: 4 }}>Tel: {note.client_phone}</div>}
                    {note.client_address && <div style={{ fontSize: 13, color: '#6b6577', textTransform: 'uppercase', marginTop: 2 }}>{note.client_address}</div>}
                </div>

                {/* Tabla */}
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                    <thead>
                        <tr style={{ backgroundColor: '#f5f3ff' }}>
                            <th style={{ textAlign: 'center', padding: '10px 12px', fontSize: 11, fontWeight: 700, color: '#5b21b6', textTransform: 'uppercase', width: 60 }}>Cant.</th>
                            <th style={{ textAlign: 'left', padding: '10px 12px', fontSize: 11, fontWeight: 700, color: '#5b21b6', textTransform: 'uppercase' }}>Concepto</th>
                            <th style={{ textAlign: 'right', padding: '10px 12px', fontSize: 11, fontWeight: 700, color: '#5b21b6', textTransform: 'uppercase', width: 110 }}>P. Unitario</th>
                            <th style={{ textAlign: 'right', padding: '10px 12px', fontSize: 11, fontWeight: 700, color: '#5b21b6', textTransform: 'uppercase', width: 120 }}>Importe</th>
                        </tr>
                    </thead>
                    <tbody>
                        {note.items.map((item) => (
                            <tr key={item.id} style={{ borderBottom: '1px solid #ececf2' }}>
                                <td style={{ textAlign: 'center', padding: '10px 12px', verticalAlign: 'top' }}>{item.quantity}</td>
                                <td style={{ textAlign: 'left', padding: '10px 12px', verticalAlign: 'top', textTransform: 'uppercase' }}>{item.description}</td>
                                <td style={{ textAlign: 'right', padding: '10px 12px', verticalAlign: 'top' }}>{formatCurrency(item.unit_price)}</td>
                                <td style={{ textAlign: 'right', padding: '10px 12px', verticalAlign: 'top' }}>{formatCurrency(item.amount)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {/* Totales */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 24 }}>
                    <div style={{ width: 280 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, padding: '4px 0', color: '#453f52' }}>
                            <span>Subtotal</span><span>{formatCurrency(note.subtotal)}</span>
                        </div>
                        {Number(note.tax_amount) > 0 && (
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, padding: '4px 0', color: '#453f52' }}>
                                <span>IVA (16%)</span><span>{formatCurrency(note.tax_amount)}</span>
                            </div>
                        )}
                        <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '2px solid #7c3aed', marginTop: 8, paddingTop: 10, fontSize: 20, fontWeight: 700, color: '#5b21b6' }}>
                            <span>Total</span><span>{formatCurrency(note.total)}</span>
                        </div>
                    </div>
                </div>

                <div style={{ marginTop: 48, textAlign: 'center', fontSize: 11, color: '#9b95a8' }}>Gracias por su preferencia</div>
            </div>
        </div>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// Vista en pantalla: cards legibles en mobile, tabla completa en desktop.
// ─────────────────────────────────────────────────────────────────────────────
export default function SalesNoteDetailView({ note }: Props) {
    const printRef = useRef<HTMLDivElement>(null);
    const [isExporting, setIsExporting] = useState<'image' | 'pdf' | null>(null);

    const handlePrint = () => window.print();

    const exportToImage = async () => {
        if (!printRef.current) return;
        setIsExporting('image');
        try {
            const canvas = await html2canvas(printRef.current, { scale: 2, logging: false, useCORS: true, backgroundColor: '#ffffff' });
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
            const canvas = await html2canvas(printRef.current, { scale: 2, logging: false, useCORS: true, backgroundColor: '#ffffff' });
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

    const formattedDate = new Date(note.created_at).toLocaleDateString('es-ES', {
        day: 'numeric', month: 'long', year: 'numeric',
    });

    return (
        <div className="relative space-y-4 pb-6">
            {/* Nodo off-screen solo para captura */}
            <PrintNode note={note} printRef={printRef} />

            {/* ── Barra de acciones ── */}
            <div className="sticky top-[49px] sm:top-0 z-20 -mx-3 px-3 sm:mx-0 sm:px-0 py-2 bg-white/80 backdrop-blur-sm sm:bg-transparent sm:backdrop-blur-none print:hidden">
                <div className="flex gap-2">
                    <motion.div whileTap={{ scale: 0.95 }} className="flex-1 sm:flex-none">
                        <Button
                            onClick={exportToImage}
                            disabled={isExporting !== null}
                            variant="outline"
                            className="w-full sm:w-auto h-11 rounded-xl border-violet-200 text-violet-700 hover:bg-violet-50 touch-manipulation gap-2 text-xs sm:text-sm"
                        >
                            {isExporting === 'image' ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImageIcon className="h-4 w-4" />}
                            Imagen
                        </Button>
                    </motion.div>
                    <motion.div whileTap={{ scale: 0.95 }} className="flex-1 sm:flex-none">
                        <Button
                            onClick={exportToPDF}
                            disabled={isExporting !== null}
                            className="w-full sm:w-auto h-11 rounded-xl bg-violet-600 hover:bg-violet-700 text-white shadow-md shadow-violet-600/20 touch-manipulation gap-2 text-xs sm:text-sm font-bold"
                        >
                            {isExporting === 'pdf' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                            PDF
                        </Button>
                    </motion.div>
                    <motion.div whileTap={{ scale: 0.95 }} className="hidden sm:flex">
                        <Button
                            onClick={handlePrint}
                            variant="outline"
                            className="h-11 rounded-xl border-violet-200 text-violet-700 hover:bg-violet-50 touch-manipulation gap-2"
                        >
                            <Printer className="h-4 w-4" />
                            Imprimir
                        </Button>
                    </motion.div>
                </div>
            </div>

            {/* ── VISTA MOBILE: tarjetas legibles ── */}
            <div className="sm:hidden space-y-3">
                {/* Encabezado de la nota */}
                <div className="bg-gradient-to-br from-violet-600 to-violet-800 rounded-2xl p-4 text-white">
                    <div className="flex items-center justify-between mb-1">
                        <span className="text-violet-200 text-xs font-semibold uppercase tracking-wide">Nota de Venta</span>
                        <span className="bg-white/20 text-white text-xs font-bold px-2.5 py-1 rounded-lg">
                            #{note.note_number}
                        </span>
                    </div>
                    <div className="flex items-center gap-1.5 mt-2 text-violet-200 text-xs">
                        <Calendar className="h-3 w-3" />
                        {formattedDate}
                    </div>
                    {note.issued_by && (
                        <div className="text-violet-300 text-xs mt-1">Expedido por: {note.issued_by}</div>
                    )}
                </div>

                {/* Info del cliente */}
                <Card className="border-violet-100 shadow-sm rounded-2xl overflow-hidden">
                    <CardContent className="p-0">
                        <div className="px-4 py-3 border-b border-violet-50 bg-violet-50/50">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-violet-400 flex items-center gap-1.5">
                                <User className="h-3 w-3" />
                                Cliente
                            </span>
                        </div>
                        <div className="px-4 py-3 space-y-2.5">
                            <div className="font-semibold text-violet-950 uppercase text-sm">{note.client_name}</div>
                            {note.client_phone && (
                                <div className="flex items-center gap-2 text-violet-600 text-sm">
                                    <Phone className="h-3.5 w-3.5 text-violet-400 flex-shrink-0" />
                                    {note.client_phone}
                                </div>
                            )}
                            {note.client_address && (
                                <div className="flex items-start gap-2 text-violet-600 text-sm">
                                    <MapPin className="h-3.5 w-3.5 text-violet-400 flex-shrink-0 mt-0.5" />
                                    <span className="uppercase">{note.client_address}</span>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Conceptos en tarjetas */}
                <Card className="border-violet-100 shadow-sm rounded-2xl overflow-hidden">
                    <CardContent className="p-0">
                        <div className="px-4 py-3 border-b border-violet-50 bg-violet-50/50">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-violet-400 flex items-center gap-1.5">
                                <FileText className="h-3 w-3" />
                                Conceptos ({note.items.length})
                            </span>
                        </div>
                        <div className="divide-y divide-violet-50">
                            {note.items.map((item, idx) => (
                                <div key={item.id} className="px-4 py-3 flex items-start gap-3">
                                    <div className="bg-violet-100 text-violet-700 text-xs font-bold rounded-lg w-7 h-7 flex items-center justify-center flex-shrink-0 mt-0.5">
                                        {item.quantity}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="text-sm font-medium text-violet-950 uppercase leading-tight">{item.description}</div>
                                        <div className="text-xs text-violet-400 mt-0.5">{formatCurrency(item.unit_price)} c/u</div>
                                    </div>
                                    <div className="text-sm font-bold text-violet-700 flex-shrink-0">
                                        {formatCurrency(item.amount)}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Totales */}
                <Card className="border-violet-100 shadow-sm rounded-2xl overflow-hidden">
                    <CardContent className="p-4 space-y-2">
                        <div className="flex justify-between text-sm text-violet-600">
                            <span>Subtotal</span>
                            <span className="font-semibold">{formatCurrency(note.subtotal)}</span>
                        </div>
                        {Number(note.tax_amount) > 0 && (
                            <div className="flex justify-between text-sm text-violet-600">
                                <span>IVA (16%)</span>
                                <span className="font-semibold">{formatCurrency(note.tax_amount)}</span>
                            </div>
                        )}
                        <div className="flex justify-between pt-2 border-t-2 border-violet-700 mt-1">
                            <span className="text-base font-black text-violet-950">TOTAL</span>
                            <span className="text-xl font-black text-violet-700">{formatCurrency(note.total)}</span>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* ── VISTA DESKTOP: documento completo ── */}
            <div className="hidden sm:block bg-white border border-violet-100 rounded-2xl overflow-hidden shadow-sm">
                {/* Header */}
                <div className="p-6 md:p-10 border-b border-violet-50 bg-violet-50/30">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div className="min-w-0">
                            <div className="flex items-center gap-2 mb-2">
                                <Receipt className="h-5 w-5 text-violet-600 flex-shrink-0" />
                                <h1 className="text-3xl md:text-4xl font-extrabold text-violet-900">Nota de Venta</h1>
                            </div>
                            <div className="flex items-center gap-2 text-violet-600 font-bold text-lg">
                                <Hash className="h-4 w-4" />
                                <span className="font-mono">{note.note_number}</span>
                            </div>
                        </div>
                        <div className="text-right">
                            <div className="flex items-center justify-end gap-2 text-violet-900 font-medium text-sm">
                                <Calendar className="h-4 w-4 flex-shrink-0" />
                                {formattedDate}
                            </div>
                            <p className="text-violet-500 mt-1 text-sm">Expedido por: {note.issued_by}</p>
                        </div>
                    </div>
                </div>

                <div className="p-6 md:p-10 space-y-8">
                    {/* Customer Info */}
                    <div className="space-y-3">
                        <h3 className="text-xs font-bold uppercase tracking-wider text-violet-400 flex items-center gap-1.5">
                            <User className="h-3.5 w-3.5" />
                            Datos del Cliente
                        </h3>
                        <div className="space-y-2.5">
                            <div className="flex items-start gap-3">
                                <div className="p-1.5 rounded-lg bg-violet-100 flex-shrink-0 mt-0.5">
                                    <User className="h-4 w-4 text-violet-600" />
                                </div>
                                <span className="text-violet-900 font-semibold text-lg uppercase">{note.client_name}</span>
                            </div>
                            {note.client_phone && (
                                <div className="flex items-center gap-3 text-violet-600">
                                    <div className="p-1.5 rounded-lg bg-violet-100 flex-shrink-0">
                                        <Phone className="h-4 w-4 text-violet-600" />
                                    </div>
                                    <span className="text-sm">{note.client_phone}</span>
                                </div>
                            )}
                            {note.client_address && (
                                <div className="flex items-start gap-3 text-violet-600">
                                    <div className="p-1.5 rounded-lg bg-violet-100 flex-shrink-0 mt-0.5">
                                        <MapPin className="h-4 w-4 text-violet-600" />
                                    </div>
                                    <span className="text-sm flex-1 uppercase">{note.client_address}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Tabla */}
                    <div className="w-full overflow-x-auto">
                        <table className="w-full min-w-[400px]">
                            <thead className="border-b border-violet-200">
                                <tr className="text-violet-400 text-xs font-bold uppercase tracking-tighter">
                                    <th className="py-4 text-left font-semibold w-14">Cant.</th>
                                    <th className="py-4 text-left font-semibold">Concepto</th>
                                    <th className="py-4 text-right font-semibold">Precio</th>
                                    <th className="py-4 text-right font-semibold">Importe</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-violet-50">
                                {note.items.map((item) => (
                                    <tr key={item.id} className="text-violet-900">
                                        <td className="py-4 font-medium text-sm">{item.quantity}</td>
                                        <td className="py-4 text-sm uppercase">{item.description}</td>
                                        <td className="py-4 text-right text-sm">{formatCurrency(item.unit_price)}</td>
                                        <td className="py-4 text-right font-bold text-violet-700 text-sm">{formatCurrency(item.amount)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Totals */}
                    <div className="flex justify-end pt-6 border-t border-violet-100">
                        <div className="w-full sm:w-2/3 md:w-1/3 space-y-2.5">
                            <div className="flex justify-between text-sm text-violet-600">
                                <span>Subtotal</span>
                                <span className="font-semibold">{formatCurrency(note.subtotal)}</span>
                            </div>
                            {Number(note.tax_amount) > 0 && (
                                <div className="flex justify-between text-sm text-violet-600">
                                    <span>IVA (16%)</span>
                                    <span className="font-semibold">{formatCurrency(note.tax_amount)}</span>
                                </div>
                            )}
                            <div className="flex justify-between text-2xl font-black pt-3 border-t-2 border-violet-900 text-violet-900">
                                <span>TOTAL</span>
                                <span>{formatCurrency(note.total)}</span>
                            </div>
                        </div>
                    </div>

                    <div className="pt-16 text-center text-violet-300 text-xs print:block hidden">
                        Gracias por su preferencia
                    </div>
                </div>
            </div>
        </div>
    );
}