import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAnalytics } from 'firebase/analytics';
import { getStorage } from 'firebase/storage';

// Configuración de Firebase - NVU Live
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase only if no apps exist
let app;
if (getApps().length === 0) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp();
}

// Initialize Firebase services
let db;
let analytics;
let storage;

try {
  db = getFirestore(app);
  console.log('✅ Firestore initialized successfully');
  
  // Initialize Analytics only in browser environment
  if (typeof window !== 'undefined') {
    try {
      analytics = getAnalytics(app);
      console.log('✅ Analytics initialized successfully');
    } catch (analyticsError) {
      console.warn('⚠️ Analytics initialization failed:', analyticsError.message);
    }
  }
  
  // Initialize Storage with error handling
  try {
    storage = getStorage(app);
    console.log('✅ Storage initialized successfully');
  } catch (storageError) {
    console.warn('⚠️ Storage initialization failed:', storageError.message);
    console.warn('Storage features will be disabled');
    storage = null;
  }
  
} catch (error) {
  if (error.code === 'app/duplicate-app') {
    console.log('Firebase app already initialized, using existing instance');
    const existingApp = getApp();
    
    try {
      db = getFirestore(existingApp);
      console.log('✅ Firestore initialized from existing app');
    } catch (dbError) {
      console.error('❌ Failed to initialize Firestore:', dbError);
      throw dbError;
    }
    
    if (typeof window !== 'undefined') {
      try {
        analytics = getAnalytics(existingApp);
        console.log('✅ Analytics initialized from existing app');
      } catch (analyticsError) {
        console.warn('⚠️ Analytics initialization failed:', analyticsError.message);
      }
    }
    
    try {
      storage = getStorage(existingApp);
      console.log('✅ Storage initialized from existing app');
    } catch (storageError) {
      console.warn('⚠️ Storage initialization failed:', storageError.message);
      storage = null;
    }
  } else {
    console.error('Error initializing Firebase services:', error);
    // Don't throw error if only storage fails
    if (error.message.includes('storage')) {
      console.warn('Storage service unavailable, continuing without it');
      storage = null;
    } else {
      throw error;
    }
  }
}

export { app, db, analytics, storage }; 