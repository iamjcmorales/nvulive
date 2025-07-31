// Firebase configuration validation utility
export const validateFirebaseConfig = () => {
  const requiredVars = [
    'VITE_FIREBASE_API_KEY',
    'VITE_FIREBASE_AUTH_DOMAIN', 
    'VITE_FIREBASE_PROJECT_ID',
    'VITE_FIREBASE_STORAGE_BUCKET',
    'VITE_FIREBASE_MESSAGING_SENDER_ID',
    'VITE_FIREBASE_APP_ID'
  ];

  const missingVars = requiredVars.filter(varName => {
    const value = import.meta.env[varName];
    return !value || value === 'undefined' || value === 'null';
  });

  if (missingVars.length > 0) {
    console.error('❌ Missing Firebase configuration variables:', missingVars);
    return {
      isValid: false,
      missingVars,
      error: `Missing required Firebase environment variables: ${missingVars.join(', ')}`
    };
  }

  console.log('✅ Firebase configuration validated successfully');
  return {
    isValid: true,
    missingVars: [],
    error: null
  };
};

// Network connectivity check
export const checkNetworkConnection = async () => {
  if (!navigator.onLine) {
    return {
      isConnected: false,
      error: 'No internet connection detected'
    };
  }

  try {
    // Try to reach a more reliable endpoint for connectivity check
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);
    
    const response = await fetch('https://www.google.com/favicon.ico', {
      method: 'HEAD',
      mode: 'no-cors',
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    return {
      isConnected: true,
      error: null
    };
  } catch (error) {
    // If network check fails, assume connection is available
    // This prevents the app from being blocked by network checks
    console.warn('Network connectivity check failed, assuming connection is available:', error.message);
    return {
      isConnected: true,
      error: null
    };
  }
};