import { 
  collection, 
  addDoc, 
  getDocs, 
  doc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  onSnapshot,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../firebase/config';

const TRADES_COLLECTION = 'trades';
const EDUCATORS_COLLECTION = 'educators';

// Crear un nuevo trade
export const createTrade = async (tradeData) => {
  try {
    const docRef = await addDoc(collection(db, TRADES_COLLECTION), {
      ...tradeData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    return { id: docRef.id, ...tradeData };
  } catch (error) {
    console.error('Error creating trade:', error);
    throw error;
  }
};

// Obtener todos los trades de un educador
export const getEducatorTrades = async (educatorId) => {
  try {
    // Versión sin orderBy para evitar el índice compuesto
    const q = query(
      collection(db, TRADES_COLLECTION), 
      where('educatorId', '==', educatorId)
    );
    const querySnapshot = await getDocs(q);
    const trades = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    // Ordenar manualmente por fecha
    return trades.sort((a, b) => {
      const dateA = a.createdAt?.toDate?.() || new Date(a.date || 0);
      const dateB = b.createdAt?.toDate?.() || new Date(b.date || 0);
      return dateB - dateA;
    });
  } catch (error) {
    console.error('Error getting educator trades:', error);
    throw error;
  }
};

// Obtener todos los trades
export const getAllTrades = async () => {
  try {
    // Versión sin orderBy para evitar problemas de índices
    const q = query(collection(db, TRADES_COLLECTION));
    const querySnapshot = await getDocs(q);
    const trades = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    // Ordenar manualmente por fecha
    return trades.sort((a, b) => {
      const dateA = a.createdAt?.toDate?.() || new Date(a.date || 0);
      const dateB = b.createdAt?.toDate?.() || new Date(b.date || 0);
      return dateB - dateA;
    });
  } catch (error) {
    console.error('Error getting all trades:', error);
    throw error;
  }
};

// Actualizar un trade
export const updateTrade = async (tradeId, updateData) => {
  try {
    const tradeRef = doc(db, TRADES_COLLECTION, tradeId);
    await updateDoc(tradeRef, {
      ...updateData,
      updatedAt: serverTimestamp()
    });
    return { id: tradeId, ...updateData };
  } catch (error) {
    console.error('Error updating trade:', error);
    throw error;
  }
};

// Eliminar un trade
export const deleteTrade = async (tradeId) => {
  try {
    await deleteDoc(doc(db, TRADES_COLLECTION, tradeId));
    return tradeId;
  } catch (error) {
    console.error('Error deleting trade:', error);
    throw error;
  }
};

// Escuchar cambios en tiempo real de los trades de un educador
export const subscribeToEducatorTrades = (educatorId, callback) => {
  const q = query(
    collection(db, TRADES_COLLECTION), 
    where('educatorId', '==', educatorId)
  );
  
  return onSnapshot(q, (querySnapshot) => {
    const trades = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    // Ordenar manualmente por fecha
    const sortedTrades = trades.sort((a, b) => {
      const dateA = a.createdAt?.toDate?.() || new Date(a.date || 0);
      const dateB = b.createdAt?.toDate?.() || new Date(b.date || 0);
      return dateB - dateA;
    });
    
    callback(sortedTrades);
  });
};

// Escuchar cambios en tiempo real de todos los trades
export const subscribeToAllTrades = (callback) => {
  const q = query(collection(db, TRADES_COLLECTION));
  
  return onSnapshot(q, (querySnapshot) => {
    const trades = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    // Ordenar manualmente por fecha
    const sortedTrades = trades.sort((a, b) => {
      const dateA = a.createdAt?.toDate?.() || new Date(a.date || 0);
      const dateB = b.createdAt?.toDate?.() || new Date(b.date || 0);
      return dateB - dateA;
    });
    
    callback(sortedTrades);
  });
};

// Calcular estadísticas de un educador basadas en sus trades
export const calculateEducatorStats = (trades) => {
  if (!trades || trades.length === 0) {
    return {
      profitability: '+0%',
      totalTrades: 0,
      winRate: '0%'
    };
  }

  const totalTrades = trades.length;
  const winningTrades = trades.filter(trade => {
    const result = trade.result || trade.pips;
    if (typeof result === 'string') {
      return result.includes('+') && !result.includes('Pendiente');
    }
    return result > 0;
  });

  const winRate = Math.round((winningTrades.length / totalTrades) * 100);
  
  // Calcular profitabilidad basada en pips
  const totalPips = trades.reduce((acc, trade) => {
    const result = trade.result || trade.pips;
    if (typeof result === 'string') {
      const pipsMatch = result.match(/([+-]?\d+)/);
      return acc + (pipsMatch ? parseInt(pipsMatch[1]) : 0);
    }
    return acc + (result || 0);
  }, 0);

  const profitability = totalPips > 0 ? `+${totalPips}%` : `${totalPips}%`;

  return {
    profitability,
    totalTrades,
    winRate: `${winRate}%`
  };
};

// Obtener estadísticas de todos los educadores
export const getEducatorsStats = async () => {
  try {
    const trades = await getAllTrades();
    const educatorGroups = trades.reduce((acc, trade) => {
      if (!acc[trade.educatorId]) {
        acc[trade.educatorId] = [];
      }
      acc[trade.educatorId].push(trade);
      return acc;
    }, {});

    const stats = {};
    Object.keys(educatorGroups).forEach(educatorId => {
      stats[educatorId] = calculateEducatorStats(educatorGroups[educatorId]);
    });

    return stats;
  } catch (error) {
    console.error('Error getting educators stats:', error);
    throw error;
  }
}; 