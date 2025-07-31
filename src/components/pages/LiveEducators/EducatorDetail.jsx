import React, { useState } from 'react';
import styled from 'styled-components';
import { useParams, Link } from 'react-router-dom';
import educatorsData from '../../../data/educatorsData'; // Ajustar ruta relativa
import { FaArrowLeft, FaInstagram, FaLinkedin, FaFacebookF, FaUserClock, FaWifi, FaComments, FaTimes } from 'react-icons/fa';
import { useTranslation } from 'react-i18next'; // Importar hook
import LiveChat from '../../ui/LiveChat';

// --- Styled Components (Restaurados) --- 

const EducatorDetailContainer = styled.div`
  /* Estilos del contenedor si son necesarios */
  padding-bottom: 30px; 
`;

const BackLinkContainer = styled.div`
  padding: 0 24px 16px 24px; // Añadir padding lateral
  margin-bottom: 16px;
  border-bottom: 1px solid #e9ecef;
`;

const BackLink = styled(Link)`
    display: inline-flex;
    align-items: center;
    gap: 8px;
    color: #666;
    text-decoration: none;
    font-size: 14px;
    &:hover { color: #333; }
`;

const ContentWrapper = styled.div`
    padding: 20px 24px 0 24px; // 20px arriba, 24px laterales, 0 abajo
`;

const StreamChatContainer = styled.div`
  display: ${props => props.$showChat ? 'flex' : 'block'};
  gap: 20px;
  align-items: stretch;
  
  @media (max-width: 1200px) {
    flex-direction: column;
  }
`;

const StreamSection = styled.div`
  flex: ${props => props.$showChat ? '1' : 'none'};
  min-width: 0;
`;

const ChatSection = styled.div`
  width: ${props => props.$showChat ? '350px' : '0'};
  height: ${props => props.$showChat ? '600px' : '0'};
  overflow: hidden;
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  
  @media (max-width: 1200px) {
    width: 100%;
    height: ${props => props.$showChat ? '600px' : '0'};
  }
`;

const ChatToggleButton = styled.button`
  position: absolute;
  top: 12px;
  right: 12px;
  background: rgba(0, 0, 0, 0.7);
  border: 1px solid rgba(0, 150, 136, 0.5);
  border-radius: 8px;
  color: #00d4aa;
  padding: 8px 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  transition: all 0.2s ease;
  z-index: 10;
  backdrop-filter: blur(4px);
  
  &:hover {
    background: rgba(0, 150, 136, 0.1);
    border-color: #00d4aa;
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(0, 212, 170, 0.2);
  }
`;

const StreamArea = styled.div`
  position: relative;
  padding-bottom: 56.25%; // 16:9
  height: 0;
  overflow: hidden;
  background-color: #000;
  border-radius: 8px;
  margin-bottom: 24px; // Espacio antes del link a favoritas

  iframe {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
  }
`;

const InfoSection = styled.div`
    background-color: white;
    padding: 24px;
    margin-top: 24px; 
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.05);
`;
const EducatorName = styled.h1`
    font-size: 24px;
    margin: 0 0 8px 0; 
`;
const EducatorTitle = styled.p`
    font-size: 16px;
    color: #666;
    margin: 0; 
`;

// Link/Banner para Sesiones Favoritas
const FavoritesLink = styled(Link)`
  display: block;
  margin: 32px 0;
  padding: 32px 24px;
  background: rgb(0,150,136); /* Cyan principal */
  color: rgb(255,255,255);
  border-radius: 12px;
  text-align: center;
  box-shadow: 0 4px 16px rgba(0,150,136,0.15);
  text-decoration: none;
  font-weight: 600;
  font-size: 20px;
  letter-spacing: 0.5px;
  transition: background 0.2s, color 0.2s, box-shadow 0.2s, transform 0.1s;

  &:hover {
    background: rgb(0,200,180);
    color: rgb(0,0,0);
    box-shadow: 0 6px 20px rgba(0,200,180,0.18);
    transform: translateY(-2px);
  }
`;

const FavoritesTitle = styled.h2`
  font-size: 22px;
  margin: 0;
  font-weight: 700;
  color: inherit;
`;

// ProfileSection y sus componentes (adaptados de EducatorSessions)
const ProfileSection = styled.div`
  display: flex;
  gap: 24px;
  background-color: rgb(24,24,24);
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.12);
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

  &:hover {
    color: rgb(0,200,180); 
  }
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

// Renombrar StatusBadge a LanguageBadge y estilo actualizado
const LanguageBadge = styled.div`
  display: inline-flex; 
  align-items: center;
  gap: 5px;
  padding: 5px 10px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  color: rgb(255,255,255);
  background-color: rgb(0,150,136);
  border: none;
  text-transform: uppercase;
`;

const BioText = styled.p`
  font-size: 14px;
  color: rgb(158,158,158);
  line-height: 1.6;
  margin: 0;
  white-space: pre-wrap;
`;

// --- Componente --- 

const findEducatorById = (id) => {
  for (const category in educatorsData) {
    const educator = educatorsData[category].find(edu => edu.id === id);
    if (educator) return educator;
  }
  return null;
};

const EducatorDetail = () => {
  const { educatorId } = useParams();
  const { t } = useTranslation();
  const educator = findEducatorById(educatorId);
  const [showChat, setShowChat] = useState(false);
  
  const handleToggleChat = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setShowChat(!showChat);
  };
  
  // Habilitar chat para todos los educadores
  const shouldShowChatFeature = true;
  
  // Educadores que usan Vimeo interaction tools en lugar de LiveChat
  const vimeoInteractionEducators = ['henry-tyson', 'lucas-longmire', 'richard-hall-pops', 'arin-long', 'paulina'];
  const hasVimeoInteraction = vimeoInteractionEducators.includes(educatorId);
  const shouldShowSideBySide = (showChat && shouldShowChatFeature) || hasVimeoInteraction;

  if (!educator) {
    return (
        <div> 
            <ContentWrapper>
               <p>{t('educatorDetail.notFound')}</p>
            </ContentWrapper>
        </div>
    );
  }

  const liveEmbedSrc = educator.vimeoLiveEmbed || 'https://player.vimeo.com/video/821637631'; // Fallback
  const bioKey = `educatorsBio.${educator.id}`; 

  return (
    <EducatorDetailContainer> 
      <ContentWrapper>
        <StreamChatContainer $showChat={shouldShowSideBySide}>
          <StreamSection $showChat={shouldShowSideBySide}>
            <StreamArea>
          {educatorId === 'corey-williams' ? (
            <div style={{ padding: "56.25% 0 0 0", position: "relative" }}>
              <iframe
                src="https://vimeo.com/event/4839566/embed"
                frameborder="0"
                allow="autoplay; fullscreen; picture-in-picture; web-share"
                referrerPolicy="strict-origin-when-cross-origin"
                allowFullScreen
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  height: "100%"
                }}
                title="Vimeo Live Event"
              />
            </div>
          ) : educatorId === 'arin-long' ? (
            <div style={{ padding: "56.25% 0 0 0", position: "relative" }}>
              <iframe
                src="https://vimeo.com/event/4865934/embed"
                frameborder="0"
                allow="autoplay; fullscreen; picture-in-picture; web-share"
                referrerPolicy="strict-origin-when-cross-origin"
                allowFullScreen
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  height: "100%"
                }}
                title="Vimeo Live Event"
              />
            </div>
          ) : educatorId === 'steph-royal' ? (
            <div style={{ padding: "56.25% 0 0 0", position: "relative" }}>
              <iframe
                src="https://vimeo.com/event/4849959/embed"
                frameborder="0"
                allow="autoplay; fullscreen; picture-in-picture; web-share"
                referrerPolicy="strict-origin-when-cross-origin"
                allowFullScreen
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  height: "100%"
                }}
                title="Vimeo Live Event"
              />
            </div>

          ) : educatorId === 'paulina' ? (
            <div style={{ padding: "56.25% 0 0 0", position: "relative" }}>
              <iframe
                src="https://vimeo.com/event/4879347/embed"
                frameborder="0"
                allow="autoplay; fullscreen; picture-in-picture; web-share"
                referrerPolicy="strict-origin-when-cross-origin"
                allowFullScreen
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  height: "100%"
                }}
                title="Vimeo Live Event"
              />
            </div>
          ) : educatorId === 'maur-gaytan' ? (
            <div style={{ padding: "56.25% 0 0 0", position: "relative" }}>
              <iframe
                src="https://vimeo.com/event/5033739/embed"
                frameborder="0"
                allow="autoplay; fullscreen; picture-in-picture; web-share"
                referrerPolicy="strict-origin-when-cross-origin"
                allowFullScreen
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  height: "100%"
                }}
                title="Vimeo Live Event"
              />
            </div>
          ) : educatorId === 'jorge-damelines' ? (
            <div style={{ padding: "56.25% 0 0 0", position: "relative" }}>
              <iframe
                src="https://vimeo.com/event/5032569/embed"
                frameborder="0"
                allow="autoplay; fullscreen; picture-in-picture; web-share"
                referrerPolicy="strict-origin-when-cross-origin"
                allowFullScreen
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  height: "100%"
                }}
                title="Vimeo Live Event"
              />
            </div>
          ) : educatorId === 'dani-curtis' ? (
            <div style={{ padding: "56.25% 0 0 0", position: "relative" }}>
              <iframe
                src="https://vimeo.com/event/4839563/embed"
                frameborder="0"
                allow="autoplay; fullscreen; picture-in-picture; web-share"
                referrerPolicy="strict-origin-when-cross-origin"
                allowFullScreen
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  height: "100%"
                }}
                title="Vimeo Live Event"
              />
            </div>
          ) : educatorId === 'angie-toney' ? (
            <div style={{ padding: "56.25% 0 0 0", position: "relative" }}>
              <iframe
                src="https://vimeo.com/event/4650197/embed"
                frameborder="0"
                allow="autoplay; fullscreen; picture-in-picture; web-share"
                referrerPolicy="strict-origin-when-cross-origin"
                allowFullScreen
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  height: "100%"
                }}
                title="Vimeo Live Event"
              />
            </div>
          ) : (
            <div style={{ padding: "56.25% 0 0 0", position: "relative" }}>
              <iframe
                src={liveEmbedSrc}
                frameborder="0"
                allow="autoplay; fullscreen; picture-in-picture; web-share"
                referrerPolicy="strict-origin-when-cross-origin"
                allowFullScreen
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  height: "100%"
                }}
                title="Live Stream"
              />
            </div>
          )}
          {shouldShowChatFeature && !showChat && !hasVimeoInteraction && (
            <ChatToggleButton onClick={handleToggleChat}>
              <FaComments />
              {t('liveChat.openChat')}
            </ChatToggleButton>
          )}
        </StreamArea>
        </StreamSection>
        
        {shouldShowChatFeature && !hasVimeoInteraction && (
          <ChatSection $showChat={showChat}>
            {showChat && (
              <LiveChat 
                onClose={() => setShowChat(false)} 
                educatorName={educator.name}
              />
            )}
          </ChatSection>
        )}
        
        {educatorId === 'henry-tyson' && (
          <ChatSection $showChat={true}>
            <iframe 
              src="https://vimeo.com/live/interaction_tools/live_event/4932282?theme=light" 
              width="100%" 
              height="100%" 
              frameborder="0"
              style={{ borderRadius: '8px' }}
              title="Andre Tyson Live Chat"
            />
          </ChatSection>
        )}
        
        {educatorId === 'lucas-longmire' && (
          <ChatSection $showChat={true}>
            <iframe 
              src="https://vimeo.com/live/interaction_tools/live_event/5189586?theme=light" 
              width="100%" 
              height="100%" 
              frameborder="0"
              style={{ borderRadius: '8px' }}
              title="Lucas L Live Chat"
            />
          </ChatSection>
        )}
        
        {educatorId === 'richard-hall-pops' && (
          <ChatSection $showChat={true}>
            <iframe 
              src="https://vimeo.com/live/interaction_tools/live_event/4650337?theme=light" 
              width="100%" 
              height="100%" 
              frameborder="0"
              style={{ borderRadius: '8px' }}
              title="Pops Live Chat"
            />
          </ChatSection>
        )}
        
        {educatorId === 'arin-long' && (
          <ChatSection $showChat={true}>
            <iframe 
              src="https://vimeo.com/live/interaction_tools/live_event/4865934?theme=light" 
              width="100%" 
              height="100%" 
              frameborder="0"
              style={{ borderRadius: '8px' }}
              title="Arin Long Live Chat"
            />
          </ChatSection>
        )}
        
        {educatorId === 'paulina' && (
          <ChatSection $showChat={true}>
            <iframe 
              src="https://vimeo.com/live/interaction_tools/live_event/4650299?theme=light" 
              width="100%" 
              height="100%" 
              frameborder="0"
              style={{ borderRadius: '8px' }}
              title="Ana Paulina Live Chat"
            />
          </ChatSection>
        )}
      </StreamChatContainer>
        {/* Enlace a Sesiones Favoritas */}
        <FavoritesLink to={`/educadores/${educatorId}/sesiones`}>
            <FavoritesTitle>{t('educatorDetail.favoriteSessions')}</FavoritesTitle>
        </FavoritesLink>
        
        {/* Sección de Biografía y Redes Sociales */}
         <ProfileSection>
            <SocialLinksColumn>
                {educator.socialLinks?.instagram && educator.socialLinks.instagram !== '#' && (
                    <SocialIconLink href={educator.socialLinks.instagram} target="_blank" rel="noopener noreferrer">
                        <FaInstagram />
                    </SocialIconLink>
                )}
                {educator.socialLinks?.linkedin && educator.socialLinks.linkedin !== '#' && (
                    <SocialIconLink href={educator.socialLinks.linkedin} target="_blank" rel="noopener noreferrer">
                        <FaLinkedin />
                    </SocialIconLink>
                )}
                {educator.socialLinks?.facebook && educator.socialLinks.facebook !== '#' && (
                    <SocialIconLink href={educator.socialLinks.facebook} target="_blank" rel="noopener noreferrer">
                        <FaFacebookF />
                    </SocialIconLink>
                )}
                {/* Añadir condicional por si no hay ningún link */}
                {(!educator.socialLinks || 
                  (educator.socialLinks.instagram === '#' && educator.socialLinks.linkedin === '#' && educator.socialLinks.facebook === '#')) &&
                   <span style={{fontSize: '12px', color: '#6c757d'}}>N/A</span> }
            </SocialLinksColumn>
            <BioColumn>
                <BioHeader>
                    <EducatorName>{educator.name}</EducatorName>
                    <LanguageBadge>
                        {educator.language || 'N/A'}
                    </LanguageBadge>
                </BioHeader>
                <BioText>{t(bioKey, educator.description || t('common.bioNotAvailable'))}</BioText>
            </BioColumn>
         </ProfileSection>
      </ContentWrapper>
    </EducatorDetailContainer>
  );
};

export default EducatorDetail; 