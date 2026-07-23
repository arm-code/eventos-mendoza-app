import type { BusinessConfig } from '@/types/finance';

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
  email: 'contacto@eventosmendoza.com',
  address: 'Ciudad Juárez, Chih.',
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
  termsAndConditions: 'El cliente se compromete a entregar el mobiliario en buen estado.',
};
