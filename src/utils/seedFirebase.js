import { createTrade } from '../services/tradesService';

// Datos de ejemplo para sembrar Firebase
const sampleTrades = [
  {
    educatorId: 'seb-garcia',
    educatorName: 'Sebastian Garcia',
    instrument: 'EUR/USD',
    direction: 'Buy',
    entryPrice: '1.0856',
    exitPrice: '1.0890',
    result: '+34 pips',
    status: 'Closed',
    reason: 'Technical analysis setup with confluence',
    imageUrl: null
  },
  {
    educatorId: 'seb-garcia',
    educatorName: 'Sebastian Garcia',
    instrument: 'GBP/USD',
    direction: 'Sell',
    entryPrice: '1.2743',
    exitPrice: '1.2731',
    result: '+12 pips',
    status: 'Closed',
    reason: 'Resistance level reached',
    imageUrl: null
  },
  {
    educatorId: 'seb-garcia',
    educatorName: 'Sebastian Garcia',
    instrument: 'XAU/USD',
    direction: 'Buy',
    entryPrice: '2045.67',
    exitPrice: null,
    result: 'Pendiente',
    status: 'Open',
    reason: 'Support level bounce',
    imageUrl: null
  },
  {
    educatorId: 'abi-belity',
    educatorName: 'Abi Belity',
    instrument: 'EUR/USD',
    direction: 'Sell',
    entryPrice: '1.0834',
    exitPrice: '1.0812',
    result: '+22 pips',
    status: 'Closed',
    reason: 'Breaking support level',
    imageUrl: null
  },
  {
    educatorId: 'abi-belity',
    educatorName: 'Abi Belity',
    instrument: 'XAU/USD',
    direction: 'Buy',
    entryPrice: '2038.45',
    exitPrice: null,
    result: 'Pendiente',
    status: 'Open',
    reason: 'Gold support level',
    imageUrl: null
  },
  {
    educatorId: 'frank-araujo',
    educatorName: 'Frank Araujo',
    instrument: 'BTC/USD',
    direction: 'Buy',
    entryPrice: '43180.50',
    exitPrice: '43700.50',
    result: '+520 points',
    status: 'Closed',
    reason: 'Crypto momentum',
    imageUrl: null
  }
];

// Función para sembrar datos en Firebase
export const seedFirebaseWithTrades = async () => {
  try {
    console.log('🌱 Sembrando datos de trades en Firebase...');
    
    for (const trade of sampleTrades) {
      await createTrade({
        ...trade,
        date: new Date().toISOString()
      });
      console.log(`✅ Trade creado: ${trade.instrument} - ${trade.educatorName}`);
    }
    
    console.log('🎉 ¡Datos sembrados exitosamente!');
    return true;
  } catch (error) {
    console.error('❌ Error sembrando datos:', error);
    return false;
  }
};

// Ejecutar si es llamado directamente
if (typeof window !== 'undefined' && window.seedFirebase) {
  seedFirebaseWithTrades();
} 