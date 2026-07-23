'use client';

import React, { useRef, useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    Printer, Calendar, User, Phone, MapPin, FileText,
    Download, Image as ImageIcon, Loader2, Receipt, Hash
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

export default function SalesNoteDetailView({ note }: Props) {
    const printRef = useRef<HTMLDivElement>(null);
    const [isExporting, setIsExporting] = useState<'image' | 'pdf' | null>(null);

    const handlePrint = () => {
        window.print();
    };

    const exportToImage = async () => {
        if (!printRef.current) return;
        setIsExporting('image');
        try {
            const canvas = await html2canvas(printRef.current, {
                scale: 2,
                logging: false,
                useCORS: true,
                backgroundColor: '#ffffff'
            });
            const image = canvas.toDataURL("image/png");
            const link = document.createElement('a');
            link.href = image;
            link.download = `Nota-${note.note_number}.png`;
            link.click();
        } catch (error) {
            console.error("Error exporting to image:", error);
        } finally {
            setIsExporting(null);
        }
    };

    const exportToPDF = async () => {
        if (!printRef.current) return;
        setIsExporting('pdf');
        try {
            const canvas = await html2canvas(printRef.current, {
                scale: 2,
                logging: false,
                useCORS: true,
                backgroundColor: '#ffffff'
            });
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: 'a4'
            });

            const imgProps = pdf.getImageProperties(imgData);
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
            pdf.save(`Nota-${note.note_number}.pdf`);
        } catch (error) {
            console.error("Error exporting to PDF:", error);
        } finally {
            setIsExporting(null);
        }
    };

    return (
        <div className="space-y-4 sm:space-y-6 max-w-4xl mx-auto pb-6">
            {/* Barra de acciones sticky en móvil */}
            <div className="sticky top-[49px] sm:top-0 z-20 -mx-3 px-3 sm:mx-0 sm:px-0 py-2 bg-gray-50/80 backdrop-blur-sm sm:bg-transparent sm:backdrop-blur-none print:hidden">
                <div className="flex flex-wrap gap-2">
                    <motion.div whileTap={{ scale: 0.95 }} className="flex-1 sm:flex-none">
                        <Button
                            onClick={exportToImage}
                            disabled={isExporting !== null}
                            variant="outline"
                            className="w-full sm:w-auto h-11 rounded-xl border-violet-200 text-violet-700 hover:bg-violet-50 active:bg-violet-100 touch-manipulation gap-2"
                        >
                            {isExporting === 'image' ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                <ImageIcon className="h-4 w-4" />
                            )}
                            <span className="hidden sm:inline">Imagen</span>
                            <span className="sm:hidden">IMG</span>
                        </Button>
                    </motion.div>

                    <motion.div whileTap={{ scale: 0.95 }} className="flex-1 sm:flex-none">
                        <Button
                            onClick={exportToPDF}
                            disabled={isExporting !== null}
                            variant="outline"
                            className="w-full sm:w-auto h-11 rounded-xl border-violet-200 text-violet-700 hover:bg-violet-50 active:bg-violet-100 touch-manipulation gap-2"
                        >
                            {isExporting === 'pdf' ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                <Download className="h-4 w-4" />
                            )}
                            <span className="hidden sm:inline">PDF</span>
                            <span className="sm:hidden">PDF</span>
                        </Button>
                    </motion.div>

                    <motion.div whileTap={{ scale: 0.95 }} className="flex-1 sm:flex-none">
                        <Button
                            onClick={handlePrint}
                            className="w-full sm:w-auto h-11 rounded-xl bg-violet-600 hover:bg-violet-700 text-white shadow-md shadow-violet-200 active:scale-[0.98] transition-all touch-manipulation gap-2"
                        >
                            <Printer className="h-4 w-4" />
                            <span className="hidden sm:inline">Imprimir</span>
                            <span className="sm:hidden">Print</span>
                        </Button>
                    </motion.div>
                </div>
            </div>

            {/* Documento */}
            <div
                ref={printRef}
                className="bg-white border border-violet-100 rounded-2xl overflow-hidden shadow-sm"
            >
                {/* Header */}
                <div className="p-4 sm:p-6 md:p-10 border-b border-violet-50 bg-violet-50/30">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div className="min-w-0">
                            <div className="flex items-center gap-2 mb-2">
                                <Receipt className="h-5 w-5 text-violet-600 flex-shrink-0" />
                                <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-violet-900">
                                    Nota de Venta
                                </h1>
                            </div>
                            <div className="flex items-center gap-2 text-violet-600 font-bold text-lg">
                                <Hash className="h-4 w-4" />
                                <span className="font-mono">{note.note_number}</span>
                            </div>
                        </div>
                        <div className="text-left md:text-right">
                            <div className="flex items-center md:justify-end gap-2 text-violet-900 font-medium text-sm">
                                <Calendar className="h-4 w-4 flex-shrink-0" />
                                {new Date(note.created_at).toLocaleDateString('es-ES', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                })}
                            </div>
                            <p className="text-violet-500 mt-1 text-sm">
                                Expedido por: {note.issued_by}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="p-4 sm:p-6 md:p-10 space-y-6 sm:space-y-10">
                    {/* Customer Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
                        <div className="space-y-3 sm:space-y-4">
                            <h3 className="text-xs font-bold uppercase tracking-wider text-violet-400 flex items-center gap-1.5">
                                <User className="h-3.5 w-3.5" />
                                Datos del Cliente
                            </h3>
                            <div className="space-y-2.5">
                                <div className="flex items-start gap-3">
                                    <div className="p-1.5 rounded-lg bg-violet-100 flex-shrink-0 mt-0.5">
                                        <User className="h-4 w-4 text-violet-600" />
                                    </div>
                                    <span className="text-violet-900 font-semibold text-base sm:text-lg">
                                        {note.client_name}
                                    </span>
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
                                        <span className="text-sm flex-1">{note.client_address}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="hidden md:flex items-center justify-end opacity-5">
                            <FileText size={100} className="text-violet-900" />
                        </div>
                    </div>

                    {/* Items Table - Responsive */}
                    <div className="w-full overflow-x-auto -mx-2 px-2 sm:mx-0 sm:px-0">
                        <table className="w-full min-w-[400px]">
                            <thead className="border-b border-violet-200">
                                <tr className="text-violet-400 text-[10px] sm:text-xs font-bold uppercase tracking-tighter">
                                    <th className="py-3 sm:py-4 text-left font-semibold">Cant.</th>
                                    <th className="py-3 sm:py-4 text-left font-semibold">Concepto</th>
                                    <th className="py-3 sm:py-4 text-right font-semibold">Precio</th>
                                    <th className="py-3 sm:py-4 text-right font-semibold">Importe</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-violet-50">
                                {note.items.map((item) => (
                                    <tr key={item.id} className="text-violet-900">
                                        <td className="py-3 sm:py-4 font-medium text-sm">
                                            {item.quantity}
                                        </td>
                                        <td className="py-3 sm:py-4 text-sm">
                                            {item.description}
                                        </td>
                                        <td className="py-3 sm:py-4 text-right text-sm">
                                            ${Number(item.unit_price).toFixed(2)}
                                        </td>
                                        <td className="py-3 sm:py-4 text-right font-bold text-violet-700 text-sm">
                                            ${Number(item.amount).toFixed(2)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Totals */}
                    <div className="flex justify-end pt-6 sm:pt-10 border-t border-violet-100">
                        <div className="w-full sm:w-2/3 md:w-1/2 lg:w-1/3 space-y-2.5">
                            <div className="flex justify-between text-sm text-violet-600">
                                <span>Subtotal</span>
                                <span className="font-semibold">${Number(note.subtotal).toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-sm text-violet-600">
                                <span>IVA (16%)</span>
                                <span className="font-semibold">${Number(note.tax_amount).toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-xl sm:text-2xl font-black pt-3 border-t-2 border-violet-900 text-violet-900">
                                <span>TOTAL</span>
                                <span>${Number(note.total).toFixed(2)}</span>
                            </div>
                        </div>
                    </div>

                    <div className="pt-10 sm:pt-20 text-center text-violet-300 text-xs print:block hidden">
                        Gracias por su preferencia
                    </div>
                </div>
            </div>
        </div>
    );
}