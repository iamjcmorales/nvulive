import { useState, useEffect } from 'react';
import { db } from '../firebase/config';
import { collection, query, where, onSnapshot } from 'firebase/firestore';

/**
 * Hook para obtener el número de suscriptores de un educador en tiempo real
 * @param {string} educatorId - ID del educador
 * @returns {object} - {count: number, loading: boolean, error: any}
 */
export const useSubscriberCount = (educatorId) => {
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!educatorId) {
      setCount(0);
      setLoading(false);
      return;
    }

    try {
      // Crear query para obtener todas las suscripciones que incluyen este educador
      const subscriptionsRef = collection(db, 'userSubscriptions');
      const q = query(subscriptionsRef, where('educatorIds', 'array-contains', educatorId));

      // Suscribirse a cambios en tiempo real
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const subscriberCount = snapshot.size; // Número de documentos que contienen este educatorId
        setCount(subscriberCount);
        setLoading(false);
      }, (err) => {
        console.error('Error al obtener conteo de suscriptores:', err);
        setError(err);
        setLoading(false);
      });

      return () => unsubscribe();
    } catch (err) {
      console.error('Error al configurar listener de suscriptores:', err);
      setError(err);
      setLoading(false);
    }
  }, [educatorId]);

  return { count, loading, error };
};

/**
 * Hook para obtener los conteos de suscriptores de múltiples educadores
 * @param {array} educatorIds - Array de IDs de educadores
 * @returns {object} - {counts: {educatorId: count}, loading: boolean, error: any}
 */
export const useMultipleSubscriberCounts = (educatorIds) => {
  const [counts, setCounts] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!educatorIds || educatorIds.length === 0) {
      setCounts({});
      setLoading(false);
      return;
    }

    const unsubscribers = [];
    const newCounts = {};

    // Configurar listener para cada educador
    educatorIds.forEach(educatorId => {
      try {
        const subscriptionsRef = collection(db, 'userSubscriptions');
        const q = query(subscriptionsRef, where('educatorIds', 'array-contains', educatorId));

        const unsubscribe = onSnapshot(q, (snapshot) => {
          newCounts[educatorId] = snapshot.size;
          setCounts({ ...newCounts });
          
          // Marcar como cargado cuando todos los educadores tengan conteo
          if (Object.keys(newCounts).length === educatorIds.length) {
            setLoading(false);
          }
        }, (err) => {
          console.error(`Error al obtener conteo para educador ${educatorId}:`, err);
          setError(err);
          setLoading(false);
        });

        unsubscribers.push(unsubscribe);
      } catch (err) {
        console.error(`Error al configurar listener para educador ${educatorId}:`, err);
        setError(err);
        setLoading(false);
      }
    });

    return () => {
      unsubscribers.forEach(unsubscribe => unsubscribe());
    };
  }, [educatorIds]);

  return { counts, loading, error };
}; 