import { db } from '../firebase/config';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';

/**
 * Servicio para gestionar sesiones favoritas de educadores
 * Solo los educadores autorizados pueden modificar estas sesiones
 */

/**
 * Obtiene las sesiones favoritas de un educador específico
 * @param {string} educatorId - ID del educador
 * @returns {Promise<string[]>} Array de IDs de sesiones favoritas
 */
export const getEducatorFavoriteSessions = async (educatorId) => {
  try {
    const docRef = doc(db, 'educatorFavorites', educatorId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return docSnap.data().sessions || [];
    } else {
      return [];
    }
  } catch (error) {
    console.error('Error obteniendo sesiones favoritas:', error);
    return [];
  }
};

/**
 * Guarda las sesiones favoritas de un educador
 * @param {string} educatorId - ID del educador
 * @param {string[]} sessionIds - Array de IDs de sesiones favoritas
 * @returns {Promise<boolean>} true si se guardó exitosamente
 */
export const saveEducatorFavoriteSessions = async (educatorId, sessionIds) => {
  try {
    const docRef = doc(db, 'educatorFavorites', educatorId);
    await setDoc(docRef, {
      sessions: sessionIds,
      updatedAt: new Date().toISOString(),
      educatorId: educatorId
    }, { merge: true });
    
    return true;
  } catch (error) {
    console.error('Error guardando sesiones favoritas:', error);
    return false;
  }
};

/**
 * Agrega una sesión a favoritas
 * @param {string} educatorId - ID del educador
 * @param {string} sessionId - ID de la sesión a agregar
 * @returns {Promise<boolean>} true si se agregó exitosamente
 */
export const addSessionToFavorites = async (educatorId, sessionId) => {
  try {
    const currentFavorites = await getEducatorFavoriteSessions(educatorId);
    
    if (!currentFavorites.includes(sessionId)) {
      const newFavorites = [...currentFavorites, sessionId];
      return await saveEducatorFavoriteSessions(educatorId, newFavorites);
    }
    
    return true; // Ya está en favoritos
  } catch (error) {
    console.error('Error agregando sesión a favoritos:', error);
    return false;
  }
};

/**
 * Remueve una sesión de favoritas
 * @param {string} educatorId - ID del educador
 * @param {string} sessionId - ID de la sesión a remover
 * @returns {Promise<boolean>} true si se removió exitosamente
 */
export const removeSessionFromFavorites = async (educatorId, sessionId) => {
  try {
    const currentFavorites = await getEducatorFavoriteSessions(educatorId);
    const newFavorites = currentFavorites.filter(id => id !== sessionId);
    
    return await saveEducatorFavoriteSessions(educatorId, newFavorites);
  } catch (error) {
    console.error('Error removiendo sesión de favoritos:', error);
    return false;
  }
};