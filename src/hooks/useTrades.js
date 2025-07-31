import { useState, useEffect, useCallback } from 'react';
import {
  createTrade,
  getEducatorTrades,
  getAllTrades,
  updateTrade,
  deleteTrade,
  subscribeToEducatorTrades,
  subscribeToAllTrades,
  calculateEducatorStats,
  getEducatorsStats
} from '../services/tradesService';

// Hook para manejar trades de un educador específico
export const useEducatorTrades = (educatorId) => {
  const [trades, setTrades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    profitability: '+0%',
    totalTrades: 0,
    winRate: '0%'
  });

  // Cargar trades iniciales
  useEffect(() => {
    if (!educatorId) return;

    const loadTrades = async () => {
      try {
        setLoading(true);
        const educatorTrades = await getEducatorTrades(educatorId);
        setTrades(educatorTrades);
        setStats(calculateEducatorStats(educatorTrades));
      } catch (err) {
        setError(err);
        console.error('Error loading educator trades:', err);
      } finally {
        setLoading(false);
      }
    };

    loadTrades();
  }, [educatorId]);

  // Suscribirse a cambios en tiempo real
  useEffect(() => {
    if (!educatorId) return;

    const unsubscribe = subscribeToEducatorTrades(educatorId, (updatedTrades) => {
      setTrades(updatedTrades);
      setStats(calculateEducatorStats(updatedTrades));
      setLoading(false);
    });

    return () => unsubscribe();
  }, [educatorId]);

  // Agregar un nuevo trade
  const addTrade = useCallback(async (tradeData) => {
    try {
      const newTrade = await createTrade({
        ...tradeData,
        educatorId
      });
      return newTrade;
    } catch (err) {
      setError(err);
      console.error('Error adding trade:', err);
      throw err;
    }
  }, [educatorId]);

  // Actualizar un trade
  const editTrade = useCallback(async (tradeId, updateData) => {
    try {
      const updatedTrade = await updateTrade(tradeId, updateData);
      return updatedTrade;
    } catch (err) {
      setError(err);
      console.error('Error updating trade:', err);
      throw err;
    }
  }, []);

  // Eliminar un trade
  const removeTrade = useCallback(async (tradeId) => {
    try {
      await deleteTrade(tradeId);
      return tradeId;
    } catch (err) {
      setError(err);
      console.error('Error deleting trade:', err);
      throw err;
    }
  }, []);

  return {
    trades,
    loading,
    error,
    stats,
    addTrade,
    editTrade,
    removeTrade
  };
};

// Hook para manejar todos los trades
export const useAllTrades = () => {
  const [trades, setTrades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Cargar trades iniciales
  useEffect(() => {
    const loadTrades = async () => {
      try {
        setLoading(true);
        const allTrades = await getAllTrades();
        setTrades(allTrades);
      } catch (err) {
        setError(err);
        console.error('Error loading all trades:', err);
      } finally {
        setLoading(false);
      }
    };

    loadTrades();
  }, []);

  // Suscribirse a cambios en tiempo real
  useEffect(() => {
    const unsubscribe = subscribeToAllTrades((updatedTrades) => {
      setTrades(updatedTrades);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return {
    trades,
    loading,
    error
  };
};

// Hook para manejar estadísticas de educadores
export const useEducatorsStats = () => {
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadStats = async () => {
      try {
        setLoading(true);
        const educatorsStats = await getEducatorsStats();
        setStats(educatorsStats);
      } catch (err) {
        setError(err);
        console.error('Error loading educators stats:', err);
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, []);

  return {
    stats,
    loading,
    error
  };
};

// Hook para filtrar trades por educadores seguidos
export const useFollowedTrades = (followedEducators) => {
  const { trades, loading, error } = useAllTrades();
  const [followedTrades, setFollowedTrades] = useState([]);

  useEffect(() => {
    if (followedEducators && followedEducators.size > 0) {
      const filtered = trades.filter(trade => 
        followedEducators.has(trade.educatorId)
      );
      setFollowedTrades(filtered);
    } else {
      setFollowedTrades([]);
    }
  }, [trades, followedEducators]);

  return {
    trades: followedTrades,
    loading,
    error
  };
}; 