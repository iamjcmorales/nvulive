import React, { useState } from 'react';
import styled from 'styled-components';
// import { FaBitcoin, FaEthereum } from 'react-icons/fa'; // Ya no se usan aquí
import TradingViewWidget from '../widgets/TradingViewWidget'; // Importar el nuevo widget
import { useTranslation } from 'react-i18next'; // Importar hook
import { Link, useNavigate } from 'react-router-dom'; // Asegurar que Link y useNavigate estén importados
import educatorsData from '../../data/educatorsData'; // Importar datos reales
import { FaWifi, FaUserClock } from 'react-icons/fa'; // Importar iconos de estado
import i18n from 'i18next'; // Importar i18n para acceder al idioma actual

// --- Helper para obtener los primeros N educadores (REINTRODUCIDO) ---
const getFirstNEducators = (data, n) => {
  const allEducators = [];
  if (!data || typeof data !== 'object') {
      console.error("[getFirstNEducators] educatorsData no es un objeto válido:", data);
      return []; 
  }
  for (const category in data) {
    if (Object.prototype.hasOwnProperty.call(data, category)) {
        if (Array.isArray(data[category])) {
           allEducators.push(...data[category]);
        } else {
            console.warn(`[getFirstNEducators] La categoría "${category}" no es un array.`);
        }
    }
  }
  // Verificar si allEducators es un array antes de slice
  if (!Array.isArray(allEducators)) {
      console.error("[getFirstNEducators] Error interno, allEducators no es un array.", allEducators);
      return [];
  }
  return allEducators.slice(0, n);
};

// Nueva función para filtrar por idioma
const getFirstNEducatorsByLanguage = (data, n, lang) => {
  const allEducators = [];
  for (const category in data) {
    if (Array.isArray(data[category])) {
      allEducators.push(...data[category].filter(edu => edu.language && edu.language.startsWith(lang)));
    }
  }
  return allEducators.slice(0, n);
};

const getTopEducatorsByVisits = (data, n) => {
  // Top educadores por visitas (mixto español/inglés)
  const topEducatorIds = [
    'richard-hall-pops',    // Pops - 13,600 visitas (en)
    'arin-long',            // Arin - 9,419 visitas (en)
    'lucas-longmire',       // Lucas L - 6,320 visitas (en)
    'henry-tyson',          // Andre Tyson - 5,527 visitas (en)
    'corey-williams',       // Corey Williams - 916 visitas (en)
    'seb-garcia',           // Sebastian Garcia - 81 visitas (es)
    'abi-belity',           // Abi Belilty - 20 visitas (es)
    'frank-araujo'          // Franklin Araujo - 33 visitas (es)
  ];
  
  const allEducators = [];
  for (const category in data) {
    if (Array.isArray(data[category])) {
      allEducators.push(...data[category]);
    }
  }
  
  // Obtener educadores sin filtrar por idioma, mostrando mix de ambos idiomas
  const topEducators = topEducatorIds
    .map(id => allEducators.find(edu => edu.id === id))
    .filter(edu => edu);
  
  return topEducators.slice(0, n);
};

const getTopEducatorsByLanguage = (data, n, lang) => {
  const allEducators = [];
  for (const category in data) {
    if (Array.isArray(data[category])) {
      allEducators.push(...data[category].filter(edu => edu.language && edu.language.startsWith(lang)));
    }
  }
  
  // Ordenamiento especial para educadores destacados
  if (lang === 'en') {
    // Para inglés: Pops primero, Andre al final, excluir Lucas
    const pops = allEducators.find(edu => edu.id === 'richard-hall-pops');
    const andre = allEducators.find(edu => edu.id === 'henry-tyson');
    const others = allEducators.filter(edu => 
      edu.id !== 'richard-hall-pops' && 
      edu.id !== 'henry-tyson' &&
      edu.id !== 'lucas-longmire' // Excluir Lucas específicamente
    );
    
    const ordered = [];
    if (pops) ordered.push(pops);
    ordered.push(...others);
    if (andre) ordered.push(andre);
    
    return ordered.slice(0, n);
  }
  
  return allEducators.slice(0, n);
};

// --- Styled Components --- (Podrías moverlos a archivos separados si crecen mucho)

const PageContainer = styled.div`
  padding: 15px 24px 24px 24px;
  display: flex;
  flex-direction: column;
  gap: 24px;
  background-color: rgb(0,0,0);
  @media (max-width: 768px) {
    padding: 15px 16px 16px 16px;
    gap: 20px;
  }
`;

// Simplificar media query para TopRowContainer
const TopRowContainer = styled.div`
  display: flex;
  gap: 24px;
  align-items: stretch;
  width: 100%;
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 20px;
  }
`;

const Banner = styled.div`
  background: ${props => props.bgColor || 'rgb(0,0,0)'};
  color: rgb(255,255,255);
  border-radius: 24px;
  text-align: center;
  background-size: cover;
  background-position: left center;
  background-image: url('${props => props.$imageUrl}');
  width: 100vw;
  max-width: 100vw;
  aspect-ratio: 16 / 4;
  height: auto;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  margin: 0 calc(-1 * (100vw - 100%) / 2);
  padding-left: 0;
  padding-right: 0;
  @media (max-width: 768px) {
    border-radius: 0;
    aspect-ratio: 2146 / 966;
    width: 100vw;
    max-width: 100vw;
    margin: 0;
    padding: 0;
    flex: unset;
  }
  h1 {
    margin: 0;
    font-size: 4rem;
    text-shadow: 1px 1px 3px rgba(0,0,0,0.3);
    color: rgb(0,150,136);
  }
  @media (max-width: 768px) {
    h1 {
      font-size: 2.5rem;
    }
  }
`;

const HalfHeightBanner = styled(Banner)`
  aspect-ratio: 2146 / 338;
  @media (max-width: 768px) {
    aspect-ratio: 2146 / 966;
  }
`;

const TradingViewContainer = styled.div`
  flex: 1 1 0%;
  min-width: 100px;
  max-width: 200px;
  @media (max-width: 768px) {
    width: 100%;
    max-width: 100%;
    flex: unset;
  }
`;

const Section = styled.section`
  background: rgb(24,24,24);
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.12);
  min-width: 0;
  overflow: hidden;
  width: 100%;
  margin-left: 0;
  margin-right: 0;
  @media (max-width: 768px) {
    padding: 16px;
  }
`;

const SectionTitle = styled.h2`
  font-size: 20px;
  margin-bottom: 16px;
  color: rgb(255,255,255); /* Texto blanco */
  display: flex;
  justify-content: space-between;
  align-items: center;
  a {
    font-size: 14px;
    color: rgb(0,150,136);
    text-decoration: none;
    &:hover { text-decoration: underline; color: rgb(0,200,180); }
  }
  @media (max-width: 768px) {
    font-size: 18px;
    margin-bottom: 12px;
    a { font-size: 13px; }
  }
`;

// Simplificar media query para GridContainer
const GridContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 20px;
  width: 100%;
  margin-left: 0;
  margin-right: 0;

  @media (max-width: 768px) { // Solo un breakpoint principal
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 16px;
  }
  @media (max-width: 480px) {
    grid-template-columns: 1fr; // Mantener este para muy pequeños
  }
`;

// Volver a flex para el scroll horizontal
const TopEducatorsContainer = styled.div`
  display: flex;
  gap: 20px;
  overflow-x: auto;
  flex-wrap: nowrap;
  padding-bottom: 15px;
  width: 100%;
  margin-left: 0;
  margin-right: 0;

  /* Estilos de scrollbar opcionales */
  &::-webkit-scrollbar {
    height: 8px; 
  }
  &::-webkit-scrollbar-thumb {
    background: #ccc; 
    border-radius: 4px;
  }

  @media (min-width: 992px) {
    overflow-x: hidden;
    justify-content: space-around;
    /* flex-wrap: wrap; // Consider if needed if space-around isn't enough */
  }
`;

const TopEducatorAvatar = styled.div` 
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  flex-shrink: 0;
  min-width: 80px;

  img {
    width: 65px;
    height: 65px;
    border-radius: 50%;
    margin-bottom: 6px;
    object-fit: cover;
    border: 2px solid #eee;
    box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  }
  span {
    font-size: 12px;
    color: rgb(200,200,200);
    font-weight: 500;
    white-space: nowrap;
  }

  @media (min-width: 992px) {
    min-width: 120px; /* Adjusted min-width for larger content */
    img {
      width: 90px;
      height: 90px;
      margin-bottom: 8px; /* Slightly more margin */
    }
    span {
      font-size: 14px;
      white-space: normal; /* Allow text to wrap if names are long */
    }
  }
`;

const CategoryFilters = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px; // Menos gap
  margin-bottom: 16px;
`;

const CategoryButton = styled.button`
  padding: 7px 14px;
  border-radius: 20px;
  border: 1px solid ${props => props.active ? 'transparent' : '#ddd'};
  background-color: ${props => props.active ? '#333' : 'white'};
  color: ${props => props.active ? 'white' : '#333'};
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s ease;
  &:hover {
    background-color: ${props => props.active ? '#555' : '#f0f0f0'};
  }
`;

const EducatorCard = styled(Link)` 
  text-decoration: none;
  color: inherit;
  background-color: rgb(24,24,24);
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.18);
  position: relative; 
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  display: flex;
  flex-direction: column;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 4px 10px rgba(0, 150, 136, 0.18);
  }
`;

const EducatorImage = styled.img`
  width: 100%;
  height: 190px;
  object-fit: cover;
  object-position: top center;
  display: block;
`;

const EducatorCardInfo = styled.div`
  padding: 12px;
  flex-grow: 1;
`;

const EducatorCardName = styled.h3`
  font-size: 15px;
  font-weight: 600;
  margin: 0 0 4px 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const EducatorCardTitle = styled.p`
  font-size: 12px;
  color: rgb(158,158,158);
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const StatusBadge = styled.div`
  position: absolute;
  top: 8px;
  right: 8px;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 3px 7px;
  border-radius: 12px;
  font-size: 10px;
  font-weight: 500;
  color: white;
  background-color: ${props => props.live ? 'rgb(0,150,136)' : 'rgb(158,158,158)'}; 
  z-index: 1;
  
  svg {
      font-size: 11px;
  }
`;

const ViewMoreButton = styled(Link)`
  display: block;
  width: max-content;
  margin: 0 auto; 
  padding: 10px 25px;
  background-color: rgb(0,150,136); 
  color: white;
  border: none;
  border-radius: 20px;
  font-weight: 500;
  text-decoration: none;
  text-align: center;
  transition: background-color 0.2s ease;

  &:hover {
      background-color: rgb(0,180,160);
  }
`;

// --- Componentes para la nueva sección de educadores preview ---

const EducatorsPreviewGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(5, 1fr); 
  gap: 20px;
  margin-bottom: 24px; 
  width: 100%;

  @media (max-width: 1200px) {
    grid-template-columns: repeat(4, 1fr);
  }
  @media (max-width: 992px) {
    grid-template-columns: repeat(3, 1fr);
  }
  @media (max-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;
  }
  @media (max-width: 480px) {
    grid-template-columns: 1fr;
  }
`;

const BeyondBanner = styled.div`
  width: 100%;
  max-width: 100%;
  margin: 0 auto 24px auto;
  border-radius: 24px;
  background: url('/images/beyondnewlogo.jpg') center/cover no-repeat;
  aspect-ratio: 4455 / 846;
  min-height: 120px;
  height: auto;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  @media (max-width: 768px) {
    border-radius: 16px;
    aspect-ratio: 16 / 4;
    min-height: 50px;
  }
`;

const TelegramBanner = styled(Banner)`
  @media (max-width: 768px) {
    display: none;
  }
`;

// --- Componente Home --- 

const Home = () => {
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language.split('-')[0];
  const navigate = useNavigate(); // Hook para navegación

  // --- DATOS Y LOGS --- 
  console.log("Home Component Rendered");
  console.log("Datos Educadores Importados:", educatorsData);
  
  const topEducators = getTopEducatorsByVisits(educatorsData, 5);
  const previewEducators = getFirstNEducatorsByLanguage(educatorsData, 5, currentLang);
  
  console.log("Top Educators Derivados:", topEducators);
  console.log("Preview Educators Derivados:", previewEducators);
  // --- FIN DATOS Y LOGS ---

  // Determinar la imagen del banner según el idioma
  const bannerImage = currentLang === 'es' 
    ? '/images/Bienvenido.jpg'
    : '/images/Welcome (2).jpg';

  // Determinar la imagen del banner de Telegram según el idioma
  const telegramBanner = currentLang === 'es'
    ? '/images/Únete a Telegram.jpg'
    : '/images/Join Our Telegram.jpg';

  return (
    <PageContainer>
      {/* Fila Superior */}
      <Banner $imageUrl={bannerImage} />

      {/* Sección Educadores Top */}
      <Section>
        <SectionTitle>
          Top Educators
          <Link to="/educadores">View All {'>'}</Link> 
        </SectionTitle>
        <TopEducatorsContainer>
          {Array.isArray(topEducators) && topEducators.length > 0 ? (
            topEducators.map((edu, index) => {
              if (!edu || typeof edu !== 'object') {
                  console.warn(`Elemento inválido en topEducators en índice ${index}:`, edu);
                  return null;
              }
              return (
                <Link key={edu.id || `top-edu-${index}`} to={`/educadores/${edu.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                  <TopEducatorAvatar>
                    <img 
                      src={edu.profileImageFilename ? (edu.id === 'lucas-longmire' ? `/images/perfil/${edu.profileImageFilename}` : `/PERFIL/${edu.profileImageFilename}`) : '/images/placeholder.jpg'} 
                      alt={edu.name || 'Educator'}
                      onError={(e) => { e.target.onerror = null; e.target.src='/images/placeholder.jpg'; }}
                    />
                    <span>{edu.name || 'Educator'}</span>
                  </TopEducatorAvatar>
                </Link>
              );
            })
          ) : (
            <p>No top educators available</p> 
          )}
        </TopEducatorsContainer>
      </Section>

      {/* Banner BeyondCharts arriba de Our Educators */}
      <BeyondBanner onClick={() => navigate('/beyond-charts')} title="Go to Beyond the Charts" />

      {/* Sección Educadores Preview */}
      <Section>
        <SectionTitle>
          {t('home.ourEducators') || 'Our Educators'} 
          <Link to="/educadores">{t('home.viewAll') || 'View All'} {'>'}</Link> 
        </SectionTitle>
        
        <EducatorsPreviewGrid>
            {Array.isArray(previewEducators) && previewEducators.length > 0 ? (
                previewEducators.map((edu, index) => {
                    if (!edu || typeof edu !== 'object') {
                        console.warn(`Elemento inválido en previewEducators en índice ${index}:`, edu);
                        return null;
                    }
                    return (
                        <EducatorCard key={edu.id || `prev-edu-${index}`} to={`/educadores/${edu.id}`}> 
                            <EducatorImage 
                                src={edu.profileImageFilename ? (edu.id === 'lucas-longmire' ? `/images/perfil/${edu.profileImageFilename}` : `/PERFIL/${edu.profileImageFilename}`) : '/images/placeholder.jpg'} 
                                alt={edu.name || 'Educator'} 
                                onError={(e) => { e.target.onerror = null; e.target.src='/images/placeholder.jpg'; }}
                            />
                            <EducatorCardInfo>
                                <EducatorCardName>{edu.name || t('common.nameNotAvailable') || 'Educator'}</EducatorCardName>
                                <EducatorCardTitle>{t(`educators.categories.${edu.category}`) || t('common.specialist') || 'Specialist'}</EducatorCardTitle>
                            </EducatorCardInfo>
                        </EducatorCard>
                    );
                 })
            ) : (
                 <p>{t('home.noEducatorsPreview') || 'No educators available'}</p> 
            )}
        </EducatorsPreviewGrid>

        <ViewMoreButton to="/educadores">
            {t('common.viewMore') || 'View More'}
        </ViewMoreButton>
      </Section>
      
      {/* Banner TELEGRAM */}
      {/* <TelegramBanner 
        imageUrl={telegramBanner} 
      /> */}

    </PageContainer>
  );
};

export default Home;