import React, { useState } from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import { FaPlay, FaUsers, FaGraduationCap, FaChartLine, FaHandshake, FaLightbulb, FaRocket } from 'react-icons/fa';

const NewMembersContainer = styled.div`
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
  color: white;
`;

const WelcomeHeader = styled.div`
  text-align: center;
  margin-bottom: 40px;
  padding: 40px 20px;
  background: linear-gradient(135deg, rgb(0,150,136) 0%, rgb(0,100,90) 100%);
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0,150,136,0.2);
`;

const WelcomeTitle = styled.h1`
  font-size: 3rem;
  font-weight: 700;
  margin: 0 0 16px 0;
  background: linear-gradient(45deg, #ffffff, #e0f2f1);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  
  @media (max-width: 768px) {
    font-size: 2.2rem;
  }
`;

const WelcomeSubtitle = styled.p`
  font-size: 1.3rem;
  color: rgba(255,255,255,0.9);
  margin: 0;
  line-height: 1.6;
  
  @media (max-width: 768px) {
    font-size: 1.1rem;
  }
`;

const WelcomeIcon = styled.div`
  font-size: 4rem;
  color: rgba(255,255,255,0.9);
  margin-bottom: 20px;
`;

const ContentSection = styled.div`
  margin-bottom: 40px;
`;

const SectionTitle = styled.h2`
  font-size: 2rem;
  font-weight: 600;
  color: rgb(0,150,136);
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 12px;
`;

const VideoGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 24px;
  margin-bottom: 40px;
`;

const VideoCard = styled.div`
  background: rgb(24,24,24);
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 16px rgba(0,0,0,0.3);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 24px rgba(0,150,136,0.2);
  }
`;

const VideoThumbnail = styled.div`
  position: relative;
  padding-bottom: 56.25%; // 16:9 aspect ratio
  background: rgb(40,40,40);
  cursor: pointer;
  overflow: hidden;
`;

const VideoFrame = styled.iframe`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border: none;
`;

const VideoPlaceholder = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, rgb(40,40,40) 0%, rgb(60,60,60) 100%);
  color: rgb(0,150,136);
  font-size: 3rem;
  transition: all 0.3s ease;
  
  &:hover {
    background: linear-gradient(135deg, rgb(0,150,136) 0%, rgb(0,120,110) 100%);
    color: white;
  }
`;

const VideoInfo = styled.div`
  padding: 20px;
`;

const VideoTitle = styled.h3`
  font-size: 1.2rem;
  font-weight: 600;
  color: white;
  margin: 0 0 8px 0;
  line-height: 1.4;
`;

const VideoDescription = styled.p`
  font-size: 0.9rem;
  color: rgb(158,158,158);
  margin: 0;
  line-height: 1.5;
`;

const FeaturesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 24px;
  margin-bottom: 40px;
`;

const FeatureCard = styled.div`
  background: rgb(24,24,24);
  border-radius: 12px;
  padding: 24px;
  text-align: center;
  border: 1px solid rgb(40,40,40);
  transition: all 0.3s ease;
  
  &:hover {
    border-color: rgb(0,150,136);
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(0,150,136,0.1);
  }
`;

const FeatureIcon = styled.div`
  font-size: 2.5rem;
  color: rgb(0,150,136);
  margin-bottom: 16px;
`;

const FeatureTitle = styled.h3`
  font-size: 1.3rem;
  font-weight: 600;
  color: white;
  margin: 0 0 12px 0;
`;

const FeatureDescription = styled.p`
  font-size: 0.95rem;
  color: rgb(158,158,158);
  margin: 0;
  line-height: 1.6;
`;

const GetStartedSection = styled.div`
  background: rgb(24,24,24);
  border-radius: 16px;
  padding: 40px;
  text-align: center;
  border: 2px solid rgb(0,150,136);
  margin-top: 40px;
`;

const GetStartedTitle = styled.h2`
  font-size: 2rem;
  font-weight: 600;
  color: rgb(0,150,136);
  margin: 0 0 16px 0;
`;

const GetStartedText = styled.p`
  font-size: 1.1rem;
  color: rgb(200,200,200);
  margin: 0 0 24px 0;
  line-height: 1.6;
`;

const StartButton = styled.button`
  background: rgb(0,150,136);
  color: white;
  border: none;
  padding: 16px 32px;
  font-size: 1.1rem;
  font-weight: 600;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  
  &:hover {
    background: rgb(0,180,160);
    transform: translateY(-2px);
    box-shadow: 0 8px 16px rgba(0,150,136,0.3);
  }
`;

const NewMembers = () => {
  const { t } = useTranslation();
  const [playingVideo, setPlayingVideo] = useState(null);

  const introVideos = [
    {
      id: 'welcome',
      title: 'Bienvenido a NVU Live',
      description: 'Descubre todo lo que puedes hacer en nuestra plataforma de educación financiera.',
      embedId: '1049097007' // Replace with actual Vimeo ID
    },
    {
      id: 'platform-tour',
      title: 'Tour por la Plataforma',
      description: 'Aprende a navegar por todas las secciones y herramientas disponibles.',
      embedId: '1049097007' // Replace with actual Vimeo ID
    },
    {
      id: 'getting-started',
      title: 'Primeros Pasos',
      description: 'Guía completa para comenzar tu experiencia de aprendizaje.',
      embedId: '1049097007' // Replace with actual Vimeo ID
    }
  ];

  const features = [
    {
      icon: <FaChartLine />,
      title: 'Educación de Trading',
      description: 'Aprende de los mejores educadores financieros con sesiones en vivo y contenido exclusivo.'
    },
    {
      icon: <FaUsers />,
      title: 'Comunidad Global',
      description: 'Conecta con traders de todo el mundo y comparte experiencias en nuestra comunidad.'
    },
    {
      icon: <FaGraduationCap />,
      title: 'Academia Completa',
      description: 'Accede a cursos estructurados desde nivel básico hasta avanzado.'
    },
    {
      icon: <FaHandshake />,
      title: 'Mentorías Personalizadas',
      description: 'Recibe orientación directa de nuestros educadores expertos.'
    },
    {
      icon: <FaLightbulb />,
      title: 'Análisis en Tiempo Real',
      description: 'Obtén insights del mercado y análisis técnico actualizado constantemente.'
    },
    {
      icon: <FaRocket />,
      title: 'Herramientas Avanzadas',
      description: 'Utiliza nuestros scanners y herramientas de trading para maximizar tu potencial.'
    }
  ];

  const handleVideoPlay = (videoId) => {
    setPlayingVideo(videoId);
  };

  return (
    <NewMembersContainer>
      <WelcomeHeader>
        <WelcomeIcon>
          <FaUsers />
        </WelcomeIcon>
        <WelcomeTitle>¡Bienvenido a NVU Live!</WelcomeTitle>
        <WelcomeSubtitle>
          Tu plataforma de educación financiera con los mejores traders del mundo
        </WelcomeSubtitle>
      </WelcomeHeader>

      <ContentSection>
        <SectionTitle>
          <FaPlay />
          Videos de Introducción
        </SectionTitle>
        <VideoGrid>
          {introVideos.map((video) => (
            <VideoCard key={video.id}>
              <VideoThumbnail>
                {playingVideo === video.id ? (
                  <VideoFrame
                    src={`https://player.vimeo.com/video/${video.embedId}?autoplay=1`}
                    allowFullScreen
                    title={video.title}
                  />
                ) : (
                  <VideoPlaceholder onClick={() => handleVideoPlay(video.id)}>
                    <FaPlay />
                  </VideoPlaceholder>
                )}
              </VideoThumbnail>
              <VideoInfo>
                <VideoTitle>{video.title}</VideoTitle>
                <VideoDescription>{video.description}</VideoDescription>
              </VideoInfo>
            </VideoCard>
          ))}
        </VideoGrid>
      </ContentSection>

      <ContentSection>
        <SectionTitle>
          <FaLightbulb />
          ¿Qué Encontrarás en NVU Live?
        </SectionTitle>
        <FeaturesGrid>
          {features.map((feature, index) => (
            <FeatureCard key={index}>
              <FeatureIcon>{feature.icon}</FeatureIcon>
              <FeatureTitle>{feature.title}</FeatureTitle>
              <FeatureDescription>{feature.description}</FeatureDescription>
            </FeatureCard>
          ))}
        </FeaturesGrid>
      </ContentSection>

      <GetStartedSection>
        <GetStartedTitle>¿Listo para Comenzar?</GetStartedTitle>
        <GetStartedText>
          Explora nuestra academia, conoce a nuestros educadores y comienza tu viaje 
          hacia el éxito en los mercados financieros.
        </GetStartedText>
        <StartButton onClick={() => window.location.href = '/academia'}>
          <FaRocket />
          Comenzar Ahora
        </StartButton>
      </GetStartedSection>
    </NewMembersContainer>
  );
};

export default NewMembers;