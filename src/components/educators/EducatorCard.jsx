import React, { useState } from 'react';
import styled, { keyframes } from 'styled-components';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const CardLink = styled(Link)`
  display: block;
  text-decoration: none;
  color: inherit;
`;

const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
`;


const CardContainer = styled.div`
  position: relative;
  border-radius: 15px;
  overflow: hidden;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  animation: ${fadeIn} 0.3s ease-out;
  cursor: pointer;

  &:hover {
    transform: translateY(-8px) scale(1.02);
    box-shadow: 0 12px 24px rgba(0, 150, 136, 0.3);
  }
`;

const EducatorImage = styled.img`
  width: 100%;
  aspect-ratio: 1040 / 1600;
  object-fit: cover;
  display: block;
  transition: opacity 0.3s ease, transform 0.3s ease;
  opacity: ${props => props.$loaded ? 1 : 0};

  ${CardContainer}:hover & {
    transform: scale(1.1);
  }
`;

const LoadingPlaceholder = styled.div`
  width: 100%;
  aspect-ratio: 1040 / 1600;
  background: linear-gradient(90deg, #181818 25%, #242424 50%, #181818 75%);
  background-size: 200% 100%;
  animation: loading 1.5s infinite;
  display: ${props => props.$loaded ? 'none' : 'block'};

  @keyframes loading {
    0% {
      background-position: 200% 0;
    }
    100% {
      background-position: -200% 0;
    }
  }
`;

const EducatorName = styled.h3`
  font-size: 1.4rem;
  font-weight: 700;
  margin: 0 0 8px 0;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  opacity: 0;
  transform: translateY(20px);
  transition: all 0.4s ease;
`;

const EducatorCategory = styled.span`
  background: rgba(255, 255, 255, 0.2);
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  backdrop-filter: blur(10px);
  opacity: 0;
  transform: translateY(20px);
  transition: all 0.4s ease;
`;

const ScheduleInfo = styled.div`
  margin: 12px 0;
  opacity: 0;
  transform: translateY(20px);
  transition: all 0.4s ease;
`;

const ScheduleTitle = styled.h4`
  font-size: 1rem;
  font-weight: 600;
  margin: 0 0 8px 0;
  opacity: 0.9;
`;

const SessionItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: rgba(255, 255, 255, 0.15);
  padding: 6px 12px;
  border-radius: 8px;
  margin-bottom: 4px;
  font-size: 0.85rem;
  backdrop-filter: blur(5px);
`;

const SessionDay = styled.span`
  font-weight: 600;
  text-transform: capitalize;
`;

const SessionTime = styled.span`
  background: rgba(255, 255, 255, 0.2);
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
`;

const ViewChannelButton = styled.button`
  background: linear-gradient(45deg, #ffffff, #f0f0f0);
  color: #009688;
  border: none;
  border-radius: 25px;
  padding: 12px 24px;
  font-size: 0.9rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  opacity: 0;
  transform: translateY(20px);

  &:hover {
    background: linear-gradient(45deg, #f8f8f8, #e8e8e8);
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.3);
  }

  &:active {
    transform: translateY(0);
  }
`;

const NoScheduleMessage = styled.p`
  font-style: italic;
  opacity: 0.8;
  font-size: 0.85rem;
  margin: 8px 0;
`;

const HoverOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(
    135deg, 
    rgba(0, 150, 136, 0.9) 0%, 
    rgba(0, 191, 174, 0.85) 50%, 
    rgba(26, 188, 156, 0.9) 100%
  );
  backdrop-filter: blur(8px);
  opacity: 0;
  transition: opacity 0.4s ease;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 20px;
  color: white;

  ${CardContainer}:hover & {
    opacity: 1;
    
    ${EducatorName} {
      opacity: 1;
      transform: translateY(0);
      transition-delay: 0.1s;
    }
    
    ${EducatorCategory} {
      opacity: 1;
      transform: translateY(0);
      transition-delay: 0.15s;
    }
    
    ${ScheduleInfo} {
      opacity: 1;
      transform: translateY(0);
      transition-delay: 0.2s;
    }
    
    ${ViewChannelButton} {
      opacity: 1;
      transform: translateY(0);
      transition-delay: 0.25s;
    }
  }
`;

// Mapeo de horarios de educadores
const educatorScheduleMapping = {
  'abi-belity': {
    schedule: {
      wednesday: [{ time: '10:00', title: 'TRADING INSTITUCIONAL', language: 'Español' }],
      thursday: [{ time: '22:00', title: 'TRADING INSTITUCIONAL', language: 'Español' }]
    }
  },
  'frank-araujo': {
    schedule: {
      monday: [{ time: '11:00', title: 'Análisis del Mercado', language: 'Español' }],
      thursday: [{ time: '11:00', title: 'Educación y Formación Completa', language: 'Español' }]
    }
  },
  'richard-hall-pops': {
    schedule: {
      tuesday: [{ time: '23:00', title: 'Forex Sessions', language: 'English' }],
      wednesday: [{ time: '10:00', title: 'Forex Sessions', language: 'English' }],
      thursday: [{ time: '23:00', title: 'Forex Sessions', language: 'English' }]
    }
  },
  'paulina': {
    schedule: {
      monday: [{ time: '14:00', title: 'Forex Education', language: 'English' }],
      tuesday: [{ time: '14:00', title: 'Forex Education', language: 'English' }]
    }
  },
  'stephon-r': {
    schedule: {
      wednesday: [{ time: '21:00', title: 'VVS', language: 'English' }]
    }
  },
  'dani-curtis': {
    schedule: {
      thursday: [{ time: '19:00', title: 'Stocks 101', language: 'English' }]
    }
  },
  'maur-gaytan': {
    schedule: {
      monday: [{ time: '20:00', title: 'GOLDEN HOUR', language: 'Español' }],
      wednesday: [{ time: '20:00', title: 'GOLDEN HOUR', language: 'Español' }]
    }
  },
  'angie-toney': {
    schedule: {
      tuesday: [{ time: '19:00', title: 'Financial Literacy', language: 'English' }]
    }
  },
  'jorge-d': {
    schedule: {
      tuesday: [{ time: '10:00', title: 'Mentalidad Visionaria', language: 'Español' }]
    }
  },
  'seb-garcia': {
    schedule: {
      sunday: [{ time: '14:00', title: 'Market open', language: 'Español' }]
    }
  },
  'henry-tyson': {
    schedule: {
      sunday: [{ time: '21:00', title: 'Talk yo pips', language: 'English' }],
      wednesday: [{ time: '15:00', title: 'Talk yo pips', language: 'English' }],
      thursday: [{ time: '20:00', title: 'Talk yo pips', language: 'English' }]
    }
  },
  'arin-long': {
    schedule: {
      tuesday: [{ time: '20:00', title: 'Forex Basics and Market Bully Strategy', language: 'English' }],
      wednesday: [{ time: '19:00', title: 'Forex Basics and Market Bully Strategy', language: 'English' }]
    }
  },
  'corey-williams': {
    schedule: {
      wednesday: [{ time: '20:00', title: 'Crypto and Coffee', language: 'English' }]
    }
  },
  'lucas-longmire': {
    schedule: {
      tuesday: [{ time: '08:00', title: 'Morning Sessions', language: 'English' }],
      wednesday: [{ time: '08:00', title: 'Morning Sessions', language: 'English' }],
      thursday: [{ time: '08:00', title: 'Morning Sessions', language: 'English' }]
    }
  },
  'tamara-minto': {
    schedule: {
      monday: [{ time: '21:00', title: 'Onboarding For Beginners', language: 'English' }]
    }
  },
  'raphael-msica': {
    schedule: {
      wednesday: [{ time: '16:00', title: 'Générer des Revenus avec le Trading Forex', language: 'Français' }],
      friday: [{ time: '16:00', title: 'Générer des Revenus avec le Trading Forex', language: 'Français' }]
    }
  }
};


const EducatorCard = ({ educator }) => {
  const { t } = useTranslation();
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  
  // Determinar la ruta de la imagen del educador
  let educatorImgSrc;
  if (educator.id === 'stephon-r') {
    educatorImgSrc = `/nvu live - fotos educadores/Stephon Royal.jpg`;
  } else if (educator.id === 'jorge-d') {
    educatorImgSrc = `/nvu live - fotos educadores/Jorge Damelines.jpg`;
  } else {
    // Mapear nombres de educadores a archivos de imagen
    const imageMap = {
      'seb-garcia': 'sebasg.jpg',
      'abi-belity': 'Abi Belilty.jpg',
      'frank-araujo': 'Franklin Araujo.jpg',
      'maur-gaytan': 'mauriciogaytan.jpg',
      'arin-long': 'Arin Long.jpg',
      'paulina': 'Ana Paulina.jpg',
      'raphael-msica': 'Raphael Msica.jpg',
      'richard-hall-pops': 'Richard Hall.jpg',
      'lucas-longmire': 'Lucas Longmire.jpg',
      'henry-tyson': 'Andre Tyson.jpg',
      'dani-curtis': 'Raquel C.jpg',
      'corey-williams': 'Corey Williams.jpg',
      'angie-toney': 'Angie Toney.jpg',
      'tamara-minto': 'Tamara Minto.jpg'
    };
    
    const imageName = imageMap[educator.id];
    educatorImgSrc = imageName ? `/nvu live - fotos educadores/${imageName}` : educator.img;
  }

  const handleImageLoad = () => {
    setImageLoaded(true);
  };

  const handleImageError = (e) => {
    e.target.onerror = null; 
    e.target.src = educator.img; // Fallback to placeholder
    setImageLoaded(true);
  };

  const handleViewChannel = (e) => {
    e.preventDefault();
    e.stopPropagation();
    // Navigate to educator's live channel
    window.location.href = `/educadores/${educator.id}`;
  };

  // Obtener horarios del educador
  const educatorSchedule = educatorScheduleMapping[educator.id];
  const hasSchedule = educatorSchedule && Object.keys(educatorSchedule.schedule).length > 0;

  return (
    <CardLink to={`/educadores/${educator.id}`}> 
      <CardContainer
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <LoadingPlaceholder $loaded={imageLoaded} />
        <EducatorImage 
          src={educatorImgSrc} 
          alt={`${educator.name}`} 
          $loaded={imageLoaded}
          onLoad={handleImageLoad}
          onError={handleImageError}
        />
        
        <HoverOverlay>
          <div>
            <EducatorName>{educator.name}</EducatorName>
            <EducatorCategory>
              {t(`categories.${educator.category?.replace('-', '_')}`) || educator.category}
            </EducatorCategory>
            
            <ScheduleInfo>
              <ScheduleTitle>📅 {t('educatorCard.schedule', 'Horarios de Clases')}</ScheduleTitle>
              {hasSchedule ? (
                Object.entries(educatorSchedule.schedule).map(([day, sessions]) => (
                  sessions.map((session, index) => (
                    <SessionItem key={`${day}-${index}`}>
                      <div>
                        <SessionDay>{t(`educatorCard.days.${day}`)}</SessionDay>
                        <div style={{ fontSize: '0.75rem', opacity: 0.8, marginTop: '2px' }}>
                          {session.title && `"${session.title}"`}
                        </div>
                      </div>
                      <SessionTime>{session.time} EST</SessionTime>
                    </SessionItem>
                  ))
                ))
              ) : (
                <NoScheduleMessage>
                  {t('educatorCard.comingSoon', 'Próximamente nuevos horarios')}
                </NoScheduleMessage>
              )}
            </ScheduleInfo>
          </div>
          
          <ViewChannelButton onClick={handleViewChannel}>
            {t('educatorCard.viewChannel', 'Ver Canal')}
          </ViewChannelButton>
        </HoverOverlay>
      </CardContainer>
    </CardLink>
  );
};

export default EducatorCard;