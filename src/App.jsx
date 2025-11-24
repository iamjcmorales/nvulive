import React, { useEffect } from 'react';
import { Routes, Route, useLocation, Navigate } from 'react-router-dom';
import './styles/global.css';
import Home from './components/pages/Home';
import Layout from './components/layout/Layout';
import RequireAuth from './components/RequireAuth';
import LoginPage from './components/pages/LoginPage';
import LanguageSelector from './components/pages/LanguageSelector';
import Calendar from './components/pages/Calendar';
import Educators from './components/pages/Educators';
import EducatorDetail from './components/pages/LiveEducators/EducatorDetail';
import EducatorSessions from './components/pages/EducatorsSessions/EducatorSessions';
import EducatorSessionsLayout from './components/layout/EducatorSessionsLayout';
import Academy from './components/pages/Academy';
import Forum from './components/pages/Forum';
import News from './components/pages/News';
import Scanner from './components/pages/Scanner';
import BackOffice from './components/pages/BackOffice';
import UserProfile from './components/pages/UserProfile';
import MarkUps from './components/pages/MarkUps/MarkUps';
import TradingJournal from './components/pages/TradingJournal';
import BeyondCharts from './components/pages/BeyondCharts';
import TNTTraining from './components/pages/TNTTraining';
import CRM from './components/pages/CRM';
import NewMembers from './components/pages/NewMembers';
import NMO from './components/pages/NMO';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

function AuthenticatedRoute({ children }) {
  const isAuthenticated = Boolean(localStorage.getItem('nvuUserData'));
  return isAuthenticated ? <Navigate to="/" replace /> : children;
}

function App() {
  return (
    <div className="App">
      <ScrollToTop />
      {/* Layout envuelve las rutas que lo usan */}
      {/* La ruta de detalle puede necesitar un layout diferente o ninguno */}
      <Routes>
        {/* Ruta inicial -> Selector de Idioma (sin Layout) */}
        <Route path="/login" element={
          <AuthenticatedRoute>
            <LoginPage />
          </AuthenticatedRoute>
        } />
        <Route path="/language" element={<LanguageSelector />} />
        
        {/* Rutas Protegidas (asumiendo que Layout implica autenticación) */}
        {/* En un caso real, estas rutas estarían dentro de un componente 
            que verifica la autenticación antes de renderizar el Layout */}
        <Route path="/" element={<RequireAuth><Layout><Home /></Layout></RequireAuth>} />
        <Route path="/new-members" element={<RequireAuth><Layout><NewMembers /></Layout></RequireAuth>} />
        <Route path="/calendario" element={<RequireAuth><Layout><Calendar /></Layout></RequireAuth>} />
        <Route path="/educadores" element={<RequireAuth><Layout><Educators /></Layout></RequireAuth>} />
        <Route path="/educadores/:educatorId" element={<RequireAuth><Layout><EducatorDetail /></Layout></RequireAuth>} />
        <Route path="/educadores/:educatorId/sesiones" element={<RequireAuth><EducatorSessionsLayout><EducatorSessions /></EducatorSessionsLayout></RequireAuth>} />
        <Route path="/academia" element={<RequireAuth><Layout><Academy /></Layout></RequireAuth>} />
        <Route path="/foro" element={<RequireAuth><Layout><Forum /></Layout></RequireAuth>} />
        <Route path="/news" element={<RequireAuth><Layout><News /></Layout></RequireAuth>} />
        <Route path="/scanner" element={<RequireAuth><Layout><Scanner /></Layout></RequireAuth>} />
        <Route path="/back-office" element={<RequireAuth><Layout><BackOffice /></Layout></RequireAuth>} />
        <Route path="/perfil" element={<RequireAuth><Layout><UserProfile /></Layout></RequireAuth>} />
        <Route path="/markups" element={<RequireAuth><Layout><MarkUps /></Layout></RequireAuth>} />
        <Route path="/trading-journal" element={<RequireAuth><Layout><TradingJournal /></Layout></RequireAuth>} />
        <Route path="/beyond-charts" element={<RequireAuth><Layout><BeyondCharts /></Layout></RequireAuth>} />
        <Route path="/tnt-training" element={<RequireAuth><Layout><TNTTraining /></Layout></RequireAuth>} />
        <Route path="/nmo" element={<RequireAuth><Layout><NMO /></Layout></RequireAuth>} />
        <Route path="/crm" element={<RequireAuth><Layout><CRM /></Layout></RequireAuth>} />
        
        {/* Puedes añadir una ruta comodín 404 si lo deseas */}
        {/* <Route path="*" element={<NotFound />} /> */}
        <Route path="/:lang(en|es)" element={<Navigate to="/" replace />} />
        <Route path="/:lang(en|es)/*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}

export default App;