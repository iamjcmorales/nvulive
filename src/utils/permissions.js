// Lista de IDs de usuarios autorizados para crear trades en Markups
const AUTHORIZED_TRADE_CREATORS = [
  1037070, // MAURICIO GAYTAN ESTRADA
  1028214, // ANA PAULINA
  1073317, // COREY WILLIAMS
  1085493, // FRANKLIN ARAUJO
  1029954, // ABI BELILTY
  1063672, // ANDRE TYSON
  1086642, // JAVIER PEREZ
  1037254, // CHEYENNE ARITUA
  1030225, // ARIN LONG
  1029917, // JC MORALES
  1072168, // RAQUEL CURTIS
  1085559, // NICOLE RICHARDS
  1086538, // LUCAS LONGMIRE
  // Agregar otros IDs según sea necesario
];

/**
 * Verifica si un usuario está autorizado para crear trades
 * @param {number|string} userId - ID del usuario a verificar
 * @returns {boolean} - true si está autorizado, false si no
 */
export const canCreateTrades = (userId) => {
  if (!userId && userId !== 0) return false;
  
  // Convertir a número para comparación
  const numericUserId = typeof userId === 'string' ? parseInt(userId, 10) : userId;
  
  return AUTHORIZED_TRADE_CREATORS.includes(numericUserId);
};

/**
 * Obtiene el usuario actual desde localStorage
 * @returns {object|null} - Datos del usuario o null si no está autenticado
 */
export const getCurrentUser = () => {
  try {
    const userData = localStorage.getItem('nvuUserData');
    return userData ? JSON.parse(userData) : null;
  } catch (error) {
    console.error('Error al obtener datos del usuario:', error);
    return null;
  }
};

/**
 * Verifica si el usuario actual puede crear trades
 * @returns {boolean} - true si puede crear trades, false si no
 */
export const currentUserCanCreateTrades = () => {
  const user = getCurrentUser();
  return user ? canCreateTrades(user.id) : false;
};

/**
 * Verifica si el usuario actual puede gestionar sesiones favoritas
 * @returns {boolean} - true si puede gestionar favoritas, false si no
 */
export const currentUserCanManageFavorites = () => {
  const user = getCurrentUser();
  return user ? canCreateTrades(user.id) : false;
}; 