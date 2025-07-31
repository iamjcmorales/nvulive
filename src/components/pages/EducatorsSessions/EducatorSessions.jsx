import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { FaStar, FaList, FaCog } from 'react-icons/fa';
import educatorsData from '../../../data/educatorsData'; // Importar datos para buscar IDs
import { currentUserCanManageFavorites } from '../../../utils/permissions';
import { getEducatorFavoriteSessions } from '../../../services/favoriteSessions';
import FavoriteSessionsModal from '../../ui/FavoriteSessionsModal';

// --- Styled Components ---
const EducatorSessionsContainer = styled.div`
  padding-left: 0;
  padding-right: 0;
  padding-bottom: 30px;
`;

const BannerImage = styled.img`
  width: 100%;
  height: 360px;
  object-fit: cover;
  display: block;
  margin-bottom: -20px;
  position: relative; 
  z-index: 0;
  @media (max-width: 600px) {
    height: 90px;
  }
`;

const ContentWrapper = styled.div`
    padding: 0;
    position: relative;
    z-index: 1; 
`;

const ProfileSection = styled.div`
  display: flex;
  gap: 24px;
  background-color: rgb(24,24,24);
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.12);
  margin: 0 24px 32px 24px;
`;

const SocialLinksColumn = styled.div`
  flex: 0 0 auto; 
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  background-color: rgb(18,18,18);
  padding: 20px 15px;
  border-radius: 8px;
`;

const SocialIconLink = styled.a`
  color: rgb(0,150,136); 
  font-size: 20px;
  transition: color 0.2s ease;
  &:hover { color: rgb(0,200,180); }
`;

const BioColumn = styled.div`
  flex: 1; 
`;

const BioHeader = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 12px;
  gap: 12px;
`;

const EducatorName = styled.h2`
  font-size: 22px;
  font-weight: 600;
  margin: 0;
  color: rgb(255,255,255);
`;

const BioText = styled.p`
  font-size: 14px;
  color: rgb(158,158,158);
  line-height: 1.6;
  margin: 0;
`;

const SessionsSection = styled.div`
  padding: 0 24px;
`;

const SectionTitle = styled.h2`
  font-size: 20px;
  font-weight: 600;
  color: rgb(0,150,136);
  margin-bottom: 20px;
`;

const SessionsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 20px;
`;

const SessionCard = styled.div`
  background-color: rgb(24,24,24);
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0,150,136,0.08);
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  position: relative;
  
  &:hover {
      transform: translateY(-4px);
      box-shadow: 0 4px 16px rgba(0, 150, 136, 0.18);
  }
`;

const FavoriteButton = styled.button`
  position: absolute;
  top: 8px;
  right: 8px;
  background: rgba(0,0,0,0.7);
  border: none;
  border-radius: 50%;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: ${props => props.$isFavorite ? '#FFD700' : 'rgba(255,255,255,0.7)'};
  font-size: 14px;
  transition: all 0.2s ease;
  z-index: 2;
  
  &:hover {
    background: rgba(0,0,0,0.9);
    color: #FFD700;
    transform: scale(1.1);
  }
`;

const SessionThumbnail = styled.img`
  width: 100%;
  height: 140px;
  object-fit: cover;
  display: block;
`;

const SessionInfo = styled.div`
  padding: 12px;
`;

const SessionTitle = styled.h3`
  font-size: 15px;
  font-weight: 600;
  margin: 0 0 6px 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  color: rgb(255,255,255);
`;

const SessionEducator = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: rgb(158,158,158);
`;

const EducatorAvatarSmall = styled.img`
  width: 20px;
  height: 20px;
  border-radius: 50%;
`;

const LoadingMessage = styled.p`
  color: rgb(158,158,158);
  text-align: center;
  padding: 20px;
`;
const ErrorMessage = styled.p`
  color: red;
  text-align: center;
  padding: 20px;
`;
const NoDataMessage = styled.p`
  color: rgb(158,158,158);
  text-align: center;
  padding: 20px;
`;

// TabBar Styles
const TabBarContainer = styled.div`
  margin-bottom: 24px;
  display: flex;
  justify-content: flex-start;
  border-bottom: 2px solid rgb(40,40,40);
`;

const TabButton = styled.button`
  background: none;
  border: none;
  color: ${props => props.$isActive ? 'rgb(0,150,136)' : 'rgb(158,158,158)'};
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 16px 24px;
  position: relative;
  transition: all 0.3s ease;
  
  &:hover {
    color: ${props => props.$isActive ? 'rgb(0,150,136)' : 'rgb(255,255,255)'};
  }
  
  &::after {
    content: '';
    position: absolute;
    bottom: -2px;
    left: 0;
    right: 0;
    height: 2px;
    background: rgb(0,150,136);
    transform: scaleX(${props => props.$isActive ? '1' : '0'});
    transition: transform 0.3s ease;
  }
  
  svg {
    font-size: 16px;
  }
`;

const AdminButton = styled.button`
  background: rgb(0,150,136);
  border: none;
  color: white;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  margin-left: auto;
  border-radius: 6px;
  transition: all 0.2s ease;
  
  &:hover {
    background: rgb(0,180,160);
    transform: translateY(-1px);
  }
  
  svg {
    font-size: 12px;
  }
`;

// Helper para buscar educador por ID (similar al de EducatorDetail)
const findEducatorById = (id) => {
  for (const category in educatorsData) {
    const educator = educatorsData[category].find(edu => edu.id === id);
    if (educator) return educator;
  }
  return null;
};

// --- Componente ---
const EducatorSessions = () => {
  const { t } = useTranslation();
  const { educatorId } = useParams();
  const educator = findEducatorById(educatorId); // Buscar datos del educador

  const [sessions, setSessions] = useState([]);
  const [selectedVimeoId, setSelectedVimeoId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeFilter, setActiveFilter] = useState('favorites'); // 'favorites' or 'all'
  const [educatorFavoriteSessions, setEducatorFavoriteSessions] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [canManage, setCanManage] = useState(false);


  // Función para manejar la selección de video con scroll automático
  const handleVideoSelect = (vimeoId) => {
    setSelectedVimeoId(vimeoId);
    // Hacer scroll hacia arriba suavemente
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  useEffect(() => {
    if (!educator) return;
    
    // Check if vimeoFolderId is empty or missing
    if (!educator.vimeoFolderId || educator.vimeoFolderId.trim() === '') {
      setLoading(false);
      setError(t('educatorSessions.noSessionsAvailable'));
      return;
    }
    
    const fetchSessions = async () => {
      setLoading(true);
      setError(null);
      try {
        let videos = [];
        let apiUrl = `https://api.vimeo.com/users/${educator.vimeoUserId}/folders/${educator.vimeoFolderId}/videos?fields=uri,name,description,duration,pictures,stats,link&per_page=50`;
        const VIMEO_ACCESS_TOKEN = "99b1a15a9f21cc8f4ffdb1e925103e99";
        while (apiUrl) {
          const response = await fetch(apiUrl, {
            headers: {
              Authorization: `Bearer ${VIMEO_ACCESS_TOKEN}`,
              Accept: "application/vnd.vimeo.*+json;version=3.4",
              "Content-Type": "application/json",
            },
          });
          if (!response.ok) throw new Error(`HTTP error: ${response.status}`);
        const data = await response.json();
          if (data.data && Array.isArray(data.data)) {
            videos = videos.concat(data.data.map(video => ({
              vimeoId: video.uri.replace("/videos/", ""),
              title: video.name,
              description: video.description || "",
              thumbnailUrl: video.pictures?.base_link || '',
              link: video.link,
            })));
          }
          apiUrl = data.paging && data.paging.next ? `https://api.vimeo.com${data.paging.next}` : null;
        }
        setSessions(videos);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchSessions();
  }, [educator]);

  // Mensaje si el educador no existe en los datos
  if (!educator && !loading) {
      return (
          <EducatorSessionsContainer>
            <ErrorMessage>Educador no encontrado.</ErrorMessage>
            <Link to="/educadores">Volver</Link>
          </EducatorSessionsContainer>
      );
  }

  // Preparar datos para la plantilla
  
  // Check if current user can manage favorites
  useEffect(() => {
    setCanManage(currentUserCanManageFavorites());
  }, []);

  // Load educator's favorite sessions from Firebase
  useEffect(() => {
    if (educatorId) {
      loadEducatorFavorites();
    }
  }, [educatorId]);

  const loadEducatorFavorites = async () => {
    try {
      const favorites = await getEducatorFavoriteSessions(educatorId);
      setEducatorFavoriteSessions(favorites);
    } catch (error) {
      console.error('Error loading educator favorites:', error);
    }
  };
  
  // Filter sessions based on active filter
  const sessionsToShow = activeFilter === 'favorites' 
    ? sessions.filter(session => educatorFavoriteSessions.includes(session.vimeoId))
    : sessions;
  
  // Handle tab selection
  const handleTabSelect = (filter) => {
    setActiveFilter(filter);
  };
  
  // Handle favorite sessions modal save
  const handleFavoritesSave = (newFavorites) => {
    setEducatorFavoriteSessions(newFavorites);
  }; 

  // --- Determinar la imagen del banner ---
  // Usar la imagen de portada del educador si existe, sino la imagen general
  const bannerSrc = educator.coverImageFilename 
                    ? `/images/PORTADAS/${educator.coverImageFilename}` 
                    : '/images/banner.png'; // Fallback a la imagen genérica si no hay de portada

  // Función para manejar errores de carga de imagen
  const handleImageError = (e) => {
    console.error('Error loading banner image:', e);
    console.log('Attempted to load:', bannerSrc);
    e.target.src = '/images/banner.png'; // Fallback a la imagen genérica
  };

  // Efecto para precargar la imagen
  useEffect(() => {
    if (educator.coverImageFilename) {
      const img = new Image();
      img.src = bannerSrc;
      img.onload = () => {
        console.log('Banner image loaded successfully:', bannerSrc);
      };
      img.onerror = () => {
        console.error('Failed to load banner image:', bannerSrc);
      };
    }
  }, [educator.coverImageFilename]);

  return (
    <EducatorSessionsContainer>
       {/* Usar la imagen correcta para el banner con manejo de errores */}
       <BannerImage 
         src={bannerSrc} 
         alt={`${educator.name} banner`} 
         onError={handleImageError}
         crossOrigin="anonymous"
       />

       <ContentWrapper>
            {/* Sección Perfil */}
            <ProfileSection>
                <BioColumn>
                    <BioHeader>
                        <EducatorName>{educator.name}</EducatorName>
                    </BioHeader>
                    <BioText>{educator.description || 'Biografía no disponible.'}</BioText>
                </BioColumn>
            </ProfileSection>

            {/* Sección Sesiones */}
            <SessionsSection>
                {/* <SectionTitle>Sesiones</SectionTitle> */}
                {/* --- MOVER EL REPRODUCTOR AQUÍ --- */}
                {selectedVimeoId && (
                    <div style={{ marginBottom: '30px', position: 'relative', paddingBottom: '56.25%', height: 0, overflow: 'hidden', backgroundColor:'#000', borderRadius: '8px' }}>
                    <iframe 
                        src={`https://player.vimeo.com/video/${selectedVimeoId}?autoplay=1`} 
                        style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none' }}
                        allow="autoplay; fullscreen; picture-in-picture" 
                        allowFullScreen
                        title="Vimeo video player">
                        </iframe>
                    </div>
                )}
                {/* --- FIN DEL REPRODUCTOR MOVIDO --- */}

                {/* TabBar */}
                <TabBarContainer>
                    <TabButton 
                        $isActive={activeFilter === 'favorites'}
                        onClick={() => handleTabSelect('favorites')}
                    >
                        <FaStar /> {t('educatorSessions.favoriteSessions') || 'Sesiones Favoritas'}
                    </TabButton>
                    <TabButton 
                        $isActive={activeFilter === 'all'}
                        onClick={() => handleTabSelect('all')}
                    >
                        <FaList /> {t('educatorSessions.allSessions') || 'Todas las Sesiones'}
                    </TabButton>
                    {canManage && (
                        <AdminButton onClick={() => setIsModalOpen(true)}>
                            <FaCog /> Gestionar Favoritas
                        </AdminButton>
                    )}
                </TabBarContainer>

                {/* Mensajes de carga/error y Grid de Sesiones */}
                {loading && <LoadingMessage>Loading sessions...</LoadingMessage>}
                {error && error !== 'Este educador no tiene sesiones configuradas.' && <ErrorMessage>{error}</ErrorMessage>}
                
                {!loading && (
                    <SessionsGrid>
                        {sessionsToShow.length > 0 ? (
                        sessionsToShow.map((session, index) => (
                            <SessionCard key={session.id || session.vimeoId || `session-${index}`} onClick={() => handleVideoSelect(session.vimeoId)}>
                                {activeFilter === 'favorites' && (
                                    <FavoriteButton 
                                        $isFavorite={true}
                                        title="Sesión favorita del educador"
                                    >
                                        <FaStar />
                                    </FavoriteButton>
                                )}
                                <SessionThumbnail src={session.thumbnailUrl || `https://vumbnail.com/${session.vimeoId}.jpg`} alt={session.title} />
                                <SessionInfo>
                                    <SessionTitle>{session.title || 'Video sin título'}</SessionTitle>
                                    <SessionEducator>
                                        <EducatorAvatarSmall 
                                            src={educator.profileImageFilename ? (educator.id === 'lucas-longmire' ? `/images/perfil/${educator.profileImageFilename}` : `/PERFIL/${educator.profileImageFilename}`) : '/images/placeholder.jpg'} 
                                            alt={educator.name}
                                        />
                                        {educator.name} NVU
                                    </SessionEducator>
                                </SessionInfo>
                            </SessionCard>
                        ))
                        ) : (
                        <NoDataMessage>
                            {activeFilter === 'favorites' 
                                ? 'Este educador no ha seleccionado sesiones favoritas aún.'
                                : (error === 'Este educador no tiene sesiones configuradas.' ? error : 'No hay sesiones disponibles.')
                            }
                        </NoDataMessage>
                        )}
                    </SessionsGrid>
                )}

            </SessionsSection>
       </ContentWrapper>
       
       {/* Modal for managing favorite sessions */}
       <FavoriteSessionsModal
         isOpen={isModalOpen}
         onClose={() => setIsModalOpen(false)}
         educatorId={educatorId}
         sessions={sessions}
         onSave={handleFavoritesSave}
       />
    </EducatorSessionsContainer>
  );
};

export default EducatorSessions; 