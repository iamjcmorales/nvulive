# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview
NVU-LIVE is a financial education platform focused on trading education across multiple markets (Forex, Futures, Stocks, Crypto) with live streaming capabilities, educational content, and trading tools.

## Commands

### Development
```bash
npm run dev          # Start development server (Vite)
npm run build        # Build for production
npm run preview      # Preview production build
```

### Testing
```bash
npm test             # Run Jest tests
npm test -- --watch # Run tests in watch mode
```

## Technology Stack
- **React 18.2.0** with Vite 5.3.5 (migrated from Create React App)
- **React Router DOM 6.25.1** for routing
- **Styled Components 6.1.17** for CSS-in-JS
- **Firebase 11.7.3** for backend services
- **i18next** for internationalization (English, Spanish, French)
- **Netlify Functions** for serverless API endpoints
- **Vimeo API** for video streaming

## Architecture

### Authentication
- Simple localStorage-based authentication via `RequireAuth` component
- All main routes are protected and require authentication
- Login check: `localStorage.getItem('isAuthenticated') === 'true'`

### Routing Structure
- `/` - Home page (protected)
- `/educators` - Educator profiles (protected)
- `/calendar` - Event calendar (protected)
- `/academy` - Educational content (protected)
- `/scanner` - Trading scanner tool (protected)
- `/trading-journal` - Trading journal (protected)
- `/beyond-charts` - Educational content (protected)
- `/crm` - Customer relationship management (protected)

### Component Organization
```
src/components/
├── layout/           # Header, Sidebar, Layout components
├── pages/            # Page-level components
├── educators/        # Educator-specific components
├── ui/              # Reusable UI components
└── widgets/         # TradingView widgets
```

### Data Management
- **Firebase Firestore** for data persistence
- **Firebase Storage** for file uploads
- **Static data** in `src/data/educatorsData.js`
- **API services** in `src/services/`

### Internationalization
- **i18next** configuration in `src/i18n.js`
- Translation files in `src/locales/` (en, es, fr)
- Use `useTranslation` hook for translations

## Environment Variables
Required for deployment:
```
VIMEO_ACCESS_TOKEN
VIMEO_USER_ID  
VIMEO_FOLDER_ID
```

## Firebase Configuration
- Firebase config in `src/firebase.js`
- Firestore indexes in `firestore.indexes.json`
- Storage rules and security rules should be configured in Firebase console

## Deployment (Netlify)
- Build command: `npm run build`
- Publish directory: `dist`
- Functions directory: `netlify/functions`
- SPA routing with catch-all redirect configured in `netlify.toml`

## Development Notes
- **Vite proxy** configured for `/api` routes to `localhost:4000`
- **CSS Modules** used alongside styled-components
- **Functional components** with hooks pattern throughout
- **Image assets** stored in `public/images/` directory
- **Protected routes** implemented via `RequireAuth` wrapper component

## Key Features
- Multi-language support with i18next
- Live streaming integration with Vimeo
- Educator session management
- Trading tools (Scanner, Trading Journal)
- Calendar system for scheduling
- Social media integration
- Firebase-based data persistence