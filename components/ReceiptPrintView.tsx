import React from 'react';

interface SalesItem {
  id: string;
  quantity: number;
  description: string;
  unit_price: number;
  amount: number;
}

interface ReceiptPrintViewProps {
  clientInfo: {
    name: string;
    phone: string;
    address: string;
    noteNumber: string;
    date: string;
  };
  items: SalesItem[];
  subtotal: number;
  tax: number;
  total: number;
}

export const ReceiptPrintView = React.forwardRef<HTMLDivElement, ReceiptPrintViewProps>(
  ({ clientInfo, items, subtotal, tax, total }, ref) => {
    return (
      <div
        ref={ref}
        style={{
          width: '800px',
          padding: '40px',
          backgroundColor: '#ffffff',
          color: '#000000',
          fontFamily: 'sans-serif',
        }}
        className="bg-white"
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid #6d28d9', paddingBottom: '20px', marginBottom: '20px' }}>
          <div>
            <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#4c1d95', margin: 0 }}>EVENTOS MENDOZA</h1>
            <p style={{ margin: '4px 0', fontSize: '14px', color: '#4b5563' }}>Renta de Mobiliario para Eventos</p>
            <p style={{ margin: '4px 0', fontSize: '14px', color: '#4b5563' }}>Ciudad Juárez, Chihuahua</p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <h2 style={{ fontSize: '20px', fontWeight: 'bold', margin: 0 }}>NOTA DE VENTA</h2>
            <p style={{ margin: '4px 0', fontSize: '16px', fontWeight: 'bold' }}>{clientInfo.noteNumber}</p>
            <p style={{ margin: '4px 0', fontSize: '14px' }}>Fecha: {clientInfo.date}</p>
          </div>
        </div>

        {/* Client Info */}
        <div style={{ marginBottom: '30px', padding: '15px', backgroundColor: '#f9fafb', borderRadius: '8px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 'bold', borderBottom: '1px solid #e5e7eb', paddingBottom: '8px', margin: '0 0 10px 0', color: '#4c1d95' }}>
            Datos del Cliente
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '14px' }}>
            <div><span style={{ fontWeight: 'bold' }}>Nombre:</span> {clientInfo.name || '---'}</div>
            <div><span style={{ fontWeight: 'bold' }}>Teléfono:</span> {clientInfo.phone || '---'}</div>
            <div style={{ gridColumn: 'span 2' }}><span style={{ fontWeight: 'bold' }}>Dirección:</span> {clientInfo.address || '---'}</div>
          </div>
        </div>

        {/* Items Table */}
        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '30px', fontSize: '14px' }}>
          <thead>
            <tr style={{ backgroundColor: '#f3f4f6', borderBottom: '2px solid #e5e7eb' }}>
              <th style={{ padding: '10px', textAlign: 'left', width: '80px' }}>Cant.</th>
              <th style={{ padding: '10px', textAlign: 'left' }}>Descripción</th>
              <th style={{ padding: '10px', textAlign: 'right', width: '120px' }}>Precio Unit.</th>
              <th style={{ padding: '10px', textAlign: 'right', width: '120px' }}>Importe</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, index) => (
              <tr key={item.id || index} style={{ borderBottom: '1px solid #e5e7eb' }}>
                <td style={{ padding: '10px' }}>{item.quantity}</td>
                <td style={{ padding: '10px' }}>{item.description || '---'}</td>
                <td style={{ padding: '10px', textAlign: 'right' }}>${Number(item.unit_price).toFixed(2)}</td>
                <td style={{ padding: '10px', textAlign: 'right', fontWeight: 'bold' }}>${Number(item.amount).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Totals */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', fontSize: '14px' }}>
          <div style={{ width: '300px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 10px', borderBottom: '1px solid #e5e7eb' }}>
              <span>Subtotal:</span>
              <span style={{ fontWeight: 'bold' }}>${subtotal.toFixed(2)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 10px', borderBottom: '1px solid #e5e7eb' }}>
              <span>IVA (16%):</span>
              <span style={{ fontWeight: 'bold' }}>${tax.toFixed(2)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 10px', backgroundColor: '#f3f4f6', marginTop: '4px', fontSize: '16px' }}>
              <span style={{ fontWeight: 'bold' }}>Total:</span>
              <span style={{ fontWeight: 'bold', color: '#4c1d95' }}>${total.toFixed(2)}</span>
            </div>
          </div>
        </div>
        
        <div style={{ marginTop: '50px', textAlign: 'center', fontSize: '12px', color: '#6b7280' }}>
          ¡Gracias por su preferencia!
        </div>
      </div>
    );
  }
);

ReceiptPrintView.displayName = 'ReceiptPrintView';
