import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import translation files
import translationEN from './locales/en/translation.json';
import translationFR from './locales/fr/translation.json';
import translationES from './locales/es/translation.json';

// i18next configuration
i18n
  // Detect user language
  .use(LanguageDetector)
  // Pass i18n instance to react-i18next
  .use(initReactI18next)
  // Initialize i18next
  .init({
    debug: true, // Enable console logs (useful for development)
    lng: 'en', // Forzar idioma por defecto a inglés
    fallbackLng: 'en', // Default language if detection fails or translation is missing
    supportedLngs: ['en', 'es', 'fr'], // Supported languages
    interpolation: {
      escapeValue: false, // React already escapes values, not needed for it
    },
    resources: {
      en: {
        translation: translationEN
      },
      fr: {
        translation: translationFR
      },
      es: {
        translation: translationES
      }
    },
    // LanguageDetector options
    detection: {
      order: ['querystring', 'localStorage', 'navigator', 'htmlTag'], // Detection order
      lookupQuerystring: 'lng', // Query parameter to look for
      lookupLocalStorage: 'i18nextLng', // LocalStorage key
      caches: ['localStorage'], // Where to store the selected language
    }
  });

// Mantener idioma inglés por defecto
i18n.changeLanguage('en');

export default i18n; 