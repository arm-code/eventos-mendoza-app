'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Trash2, FileDown, Image as ImageIcon } from "lucide-react";
import { ReceiptPrintView } from '@/components/ReceiptPrintView';
import { toPng } from 'html-to-image';
import jsPDF from 'jspdf';
import { toast } from 'sonner';

interface SalesItem {
  id: string;
  quantity: number;
  description: string;
  unit_price: number;
  amount: number;
}

export default function CreateSalesNotePage() {
  const printRef = useRef<HTMLDivElement>(null);

  const [clientInfo, setClientInfo] = useState({
    name: '',
    phone: '',
    address: '',
    noteNumber: '',
    date: '',
  });

  const [items, setItems] = useState<SalesItem[]>([
    { id: 'initial-item', quantity: 1, description: '', unit_price: 0, amount: 0 }
  ]);

  const [applyTax, setApplyTax] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setClientInfo(prev => ({
      ...prev,
      noteNumber: `NV-${Math.floor(1000 + Math.random() * 9000)}`,
      date: new Date().toISOString().split('T')[0],
    }));
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const calculateSubtotal = () => {
    return items.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0);
  };

  const calculateTax = () => {
    return applyTax ? calculateSubtotal() * 0.16 : 0;
  };

  const calculateTotal = () => {
    return calculateSubtotal() + calculateTax();
  };

  const addItem = () => {
    setItems([
      ...items,
      { id: Math.random().toString(36).substr(2, 9), quantity: 1, description: '', unit_price: 0, amount: 0 }
    ]);
  };

  const removeItem = (id: string) => {
    if (items.length > 1) {
      setItems(items.filter(item => item.id !== id));
    }
  };

  const updateItem = (id: string, field: keyof SalesItem, value: any) => {
    setItems(items.map(item => {
      if (item.id === id) {
        const updatedItem = { ...item, [field]: value };
        if (field === 'quantity' || field === 'unit_price') {
          updatedItem.amount = updatedItem.quantity * updatedItem.unit_price;
        }
        return updatedItem;
      }
      return item;
    }));
  };

  const exportToImage = async () => {
    if (!printRef.current) return;
    try {
      toast.info('Generando imagen...');
      const dataUrl = await toPng(printRef.current, { pixelRatio: 2 });
      const link = document.createElement('a');
      link.download = `nota_venta_${clientInfo.noteNumber}.png`;
      link.href = dataUrl;
      link.click();
      toast.success('Imagen exportada correctamente');
    } catch (err) {
      console.error('Error exporting image:', err);
      toast.error('Error al exportar imagen');
    }
  };

  const exportToPDF = async () => {
    if (!printRef.current) return;
    try {
      toast.info('Generando PDF...');
      const dataUrl = await toPng(printRef.current, { pixelRatio: 2 });
      
      // Calculate aspect ratio
      const img = new Image();
      img.src = dataUrl;
      await new Promise((resolve) => { img.onload = resolve; });
      
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (img.height * pdfWidth) / img.width;
      
      pdf.addImage(dataUrl, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`nota_venta_${clientInfo.noteNumber}.pdf`);
      toast.success('PDF exportado correctamente');
    } catch (err) {
      console.error('Error exporting PDF:', err);
      toast.error('Error al exportar PDF');
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-20">
      <div className="flex justify-between items-center print:hidden">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Nueva Nota de Venta</h1>
          <p className="text-muted-foreground">Llena los datos para generar la nota.</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <Button onClick={exportToPDF} variant="outline" className="gap-2">
            <FileDown className="h-4 w-4" />
            PDF
          </Button>
          <Button onClick={exportToImage} variant="outline" className="gap-2">
            <ImageIcon className="h-4 w-4" />
            Imagen
          </Button>
        </div>
      </div>

      <div className="print:p-8 print:max-w-none">
        {/* Header Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Información del Cliente</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Cliente</label>
                <Input
                  value={clientInfo.name}
                  onChange={(e) => setClientInfo({ ...clientInfo, name: e.target.value })}
                  onFocus={(e) => e.target.select()}
                  placeholder="Nombre del cliente"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Teléfono</label>
                <Input
                  value={clientInfo.phone}
                  onChange={(e) => setClientInfo({ ...clientInfo, phone: e.target.value })}
                  onFocus={(e) => e.target.select()}
                  inputMode="tel"
                  placeholder="Número de teléfono"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Dirección</label>
                <Input
                  value={clientInfo.address}
                  onChange={(e) => setClientInfo({ ...clientInfo, address: e.target.value })}
                  onFocus={(e) => e.target.select()}
                  placeholder="Dirección completa"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Detalles de la Nota</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Número de Nota</label>
                <Input
                  value={clientInfo.noteNumber}
                  onChange={(e) => setClientInfo({ ...clientInfo, noteNumber: e.target.value })}
                  onFocus={(e) => e.target.select()}
                  placeholder="Ej. NV-1001"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Fecha</label>
                <Input
                  type="date"
                  value={clientInfo.date}
                  onChange={(e) => setClientInfo({ ...clientInfo, date: e.target.value })}
                  onFocus={(e) => e.target.select()}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Items Table */}
        <Card className="mb-8">
          <CardHeader className="pb-2 flex flex-row justify-between items-center">
            <CardTitle className="text-lg">Conceptos</CardTitle>
            <Button onClick={addItem} size="sm" className="bg-violet-600 hover:bg-violet-700 text-white print:hidden">
              <Plus className="h-4 w-4 mr-2" />
              Agregar
            </Button>
          </CardHeader>
          <CardContent>
            <div className="overflow-visible text-sm">
              {/* Header - Solo visible en desktop y al imprimir */}
              <div className="hidden md:flex print:flex border-b bg-muted/50 py-3 px-2 font-semibold">
                <div className="w-20">Cant.</div>
                <div className="flex-1">Descripción / Producto</div>
                <div className="w-32 text-right">Precio Unit.</div>
                <div className="w-32 text-right">Importe</div>
                <div className="w-10 print:hidden"></div>
              </div>

              {/* Items List */}
              <div className="space-y-4 md:space-y-0 print:space-y-0 mt-4 md:mt-0 print:mt-0">
                {items.map((item, index) => (
                  <div key={item.id} className="flex flex-col md:flex-row md:items-start print:flex-row print:items-start border border-violet-100 rounded-xl md:border-0 md:border-b md:rounded-none p-4 md:p-2 gap-4 md:gap-0 bg-white shadow-sm md:shadow-none print:shadow-none">
                    
                    {/* Header para mobile */}
                    <div className="flex justify-between items-center md:hidden print:hidden border-b border-violet-50 pb-3">
                      <span className="font-semibold text-violet-900">Concepto {index + 1}</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeItem(item.id)}
                        className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
                        disabled={items.length === 1}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>

                    {/* Descripción - en mobile va primero */}
                    <div className="w-full md:flex-1 relative md:px-2 md:order-2 order-2">
                      <label className="text-xs font-medium text-muted-foreground md:hidden print:hidden mb-1.5 block">Descripción / Producto</label>
                      <div className="flex gap-2">
                        <Input
                          value={item.description}
                          onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                          onFocus={(e) => e.target.select()}
                          placeholder="Descripción"
                          className="w-full"
                        />
                      </div>
                    </div>

                    {/* Fila de montos en mobile */}
                    <div className="flex gap-3 md:contents order-3 w-full">
                      <div className="w-20 md:w-20 md:px-2 md:order-1 order-1 flex-shrink-0">
                        <label className="text-xs font-medium text-muted-foreground md:hidden print:hidden mb-1.5 block">Cant.</label>
                        <Input
                          type="number"
                          inputMode="decimal"
                          min="0"
                          step="0.01"
                          value={item.quantity === 0 ? '' : item.quantity}
                          onFocus={(e) => e.target.select()}
                          onChange={(e) => {
                            const val = parseFloat(e.target.value);
                            updateItem(item.id, 'quantity', isNaN(val) ? 0 : Math.max(0, val));
                          }}
                          className="w-full text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        />
                      </div>
                      
                      <div className="flex-1 md:w-32 md:px-2 md:order-3 order-2">
                        <label className="text-xs font-medium text-muted-foreground md:hidden print:hidden mb-1.5 block">Precio Unit.</label>
                        <Input
                          type="number"
                          inputMode="decimal"
                          min="0"
                          step="0.01"
                          value={item.unit_price === 0 ? '' : item.unit_price}
                          onFocus={(e) => e.target.select()}
                          onChange={(e) => {
                            const val = parseFloat(e.target.value);
                            updateItem(item.id, 'unit_price', isNaN(val) ? 0 : Math.max(0, val));
                          }}
                          className="w-full text-right [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        />
                      </div>
                      
                      <div className="w-24 md:w-32 md:px-2 md:order-4 order-3 text-right">
                        <label className="text-xs font-medium text-muted-foreground md:hidden print:hidden mb-1.5 block">Importe</label>
                        <div className="font-semibold text-violet-900 md:text-black md:font-medium py-2 h-full flex items-center justify-end">
                          ${(item.quantity * item.unit_price).toFixed(2)}
                        </div>
                      </div>
                    </div>

                    {/* Botón eliminar desktop */}
                    <div className="hidden md:flex w-10 md:order-5 md:px-2 items-center justify-center print:hidden">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeItem(item.id)}
                        className="h-9 w-9 text-red-500 hover:text-red-700 hover:bg-red-50"
                        disabled={items.length === 1}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Totals */}
        <div className="flex justify-end">
          <div className="w-full md:w-1/3 space-y-3">
            <div className="flex justify-between py-2 border-b">
              <span className="font-medium text-violet-900">Subtotal:</span>
              <span className="font-bold">${calculateSubtotal().toFixed(2)}</span>
            </div>

            <div className="flex justify-between items-center py-2 border-b">
              <div className="flex items-center gap-2">
                <span className="font-medium text-violet-900">IVA (16%):</span>
                <label className="flex items-center gap-2 text-sm text-muted-foreground print:hidden">
                  <input
                    type="checkbox"
                    checked={applyTax}
                    onChange={(e) => setApplyTax(e.target.checked)}
                    className="rounded border-gray-300 accent-violet-600"
                  />
                  Aplicar
                </label>
              </div>
              <span className="font-bold">${calculateTax().toFixed(2)}</span>
            </div>

            <div className="flex justify-between py-4 border-t-2 border-violet-600">
              <span className="text-xl font-bold text-violet-900">Total:</span>
              <span className="text-2xl font-bold text-violet-700">${calculateTotal().toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Hidden layout for PDF/Image export */}
      <div style={{ position: 'absolute', top: '-9999px', left: '-9999px' }}>
        <ReceiptPrintView 
          ref={printRef}
          clientInfo={clientInfo}
          items={items}
          subtotal={calculateSubtotal()}
          tax={calculateTax()}
          total={calculateTotal()}
        />
      </div>

    </div>
  );
}

