import type { BusinessConfig } from './types';

// Configuración predeterminada de la empresa "Eventos Mendoza"
// Utilizada para la generación de documentos (PDF, PNG, contratos) mientras se integra el endpoint de /configuracion.

export const defaultBusinessConfig: BusinessConfig = {
  name: 'Eventos Mendoza',
  services: [
    'Renta de mobiliario',
    'Sillas y mesas',
    'Carpas',
    'Mantelería',
    'Montaje para eventos'
  ],
  phone: '656 123 4567',
  whatsapp: '526561234567',
  paymentCards: [
    {
      id: 'card-1',
      bank: 'BBVA',
      cardNumber: '0000 0000 0000 0000',
      clabe: '012180000000000000',
      beneficiary: 'Eventos Mendoza',
    },
  ],
  coverageAreas: ['Ciudad Juárez', 'Chihuahua'],
};
