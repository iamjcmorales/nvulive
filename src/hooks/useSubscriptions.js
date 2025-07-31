import React, { useState, useEffect } from 'react';
import { db } from '../firebase/config';
import { 
  collection, 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  arrayUnion, 
  arrayRemove, 
  onSnapshot 
} from 'firebase/firestore';

export const useSubscriptions = () => {
  const [subscribedEducators, setSubscribedEducators] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Obtener usuario autenticado siguiendo el mismo patrón que Trading Journal
  const userData = React.useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem('nvuUserData')) || null;
    } catch (error) {
      console.error('useSubscriptions - Error parsing userData:', error);
      return null;
    }
  }, []);
  const userId = userData?.id;

  // Cargar suscripciones del usuario desde Firebase
  useEffect(() => {
    // Validar que userId exista (puede ser número o cadena)
    if (!userId && userId !== 0) {
      // Usuario no autenticado - esto es normal
      setLoading(false);
      return;
    }

    // Convertir userId a cadena válida para Firebase
    const userIdString = String(userId);
    if (!userIdString || userIdString.trim() === '') {
      setLoading(false);
      return;
    }

    const userSubscriptionsRef = doc(db, 'userSubscriptions', userIdString);
    
    // Listener en tiempo real para las suscripciones
    const unsubscribe = onSnapshot(
      userSubscriptionsRef,
      (docSnapshot) => {
        try {
          if (docSnapshot.exists()) {
            const data = docSnapshot.data();
            const educators = data.educatorIds || [];
            setSubscribedEducators(new Set(educators));
          } else {
            setSubscribedEducators(new Set());
          }
          setLoading(false);
        } catch (err) {
          console.error('Error loading subscriptions:', err);
          setError(err.message);
          setLoading(false);
        }
      },
      (err) => {
        console.error('Error listening to subscriptions:', err);
        setError(err.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [userId]);

  // Función para suscribirse a un educador
  const subscribeToEducator = async (educatorId) => {
    if (!userId && userId !== 0) {
      throw new Error('Usuario no autenticado');
    }

    const userIdString = String(userId);
    if (!userIdString || userIdString.trim() === '') {
      throw new Error('Usuario no autenticado');
    }

    try {
      const userSubscriptionsRef = doc(db, 'userSubscriptions', userIdString);
      const docSnapshot = await getDoc(userSubscriptionsRef);

      if (docSnapshot.exists()) {
        // Si el documento existe, agregar el educador a la lista
        await updateDoc(userSubscriptionsRef, {
          educatorIds: arrayUnion(educatorId),
          lastUpdated: new Date()
        });
      } else {
        // Si no existe, crear el documento
        await setDoc(userSubscriptionsRef, {
          userId: userIdString,
          educatorIds: [educatorId],
          createdAt: new Date(),
          lastUpdated: new Date()
        });
      }

      // Actualizar el estado local inmediatamente
      setSubscribedEducators(prev => new Set([...prev, educatorId]));
      
    } catch (err) {
      console.error('Error subscribing to educator:', err);
      setError(err.message);
      throw err;
    }
  };

  // Función para desuscribirse de un educador
  const unsubscribeFromEducator = async (educatorId) => {
    if (!userId && userId !== 0) {
      throw new Error('Usuario no autenticado');
    }

    const userIdString = String(userId);
    if (!userIdString || userIdString.trim() === '') {
      throw new Error('Usuario no autenticado');
    }

    try {
      const userSubscriptionsRef = doc(db, 'userSubscriptions', userIdString);
      
      await updateDoc(userSubscriptionsRef, {
        educatorIds: arrayRemove(educatorId),
        lastUpdated: new Date()
      });

      // Actualizar el estado local inmediatamente
      setSubscribedEducators(prev => {
        const newSet = new Set(prev);
        newSet.delete(educatorId);
        return newSet;
      });

    } catch (err) {
      console.error('Error unsubscribing from educator:', err);
      setError(err.message);
      throw err;
    }
  };

  // Función para alternar suscripción
  const toggleSubscription = async (educatorId) => {
    if (subscribedEducators.has(educatorId)) {
      await unsubscribeFromEducator(educatorId);
    } else {
      await subscribeToEducator(educatorId);
    }
  };

  // Función para verificar si está suscrito a un educador
  const isSubscribed = (educatorId) => {
    return subscribedEducators.has(educatorId);
  };

  return {
    subscribedEducators,
    loading,
    error,
    subscribeToEducator,
    unsubscribeFromEducator,
    toggleSubscription,
    isSubscribed
  };
}; 