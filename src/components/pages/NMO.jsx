import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FaPlay } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';

const PageContainer = styled.div`
  padding: 0;
  max-width: 100%;
  margin: 0 auto;
  min-height: 100vh;
  background: #000;
`;

const BannerContainer = styled.div`
  position: relative;
  width: 100%;
  height: 250px;
  background: url('/images/New Members Orientation.jpg') center/cover no-repeat, #000;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 0;
  padding: 0;
  @media (max-width: 768px) {
    height: 90px;
  }

  /* Optional subtle overlay to improve contrast if needed */
  &::after {
    content: '';
    position: absolute;
    inset: 0;
    background: rgba(0, 0, 0, 0.25);
  }
`;

const BannerTitle = styled.h1`
  color: white;
  font-size: 48px;
  font-weight: bold;
  text-align: center;
  margin: 0;
  text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
  
  @media (max-width: 768px) {
    font-size: 32px;
  }
`;

const ContentContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding-left: 0px;
  padding-right: 0;
  @media (max-width: 768px) {
    padding: 0 12px;
  }
`;

const SectionTitle = styled.h2`
  color: white;
  font-size: 24px;
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 2px solid rgba(0,150,136,0.2);
  padding-top: 24px;
  @media (max-width: 768px) {
    padding-top: 16px;
  }
`;

const SessionsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 20px;
  padding: 20px 0;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 16px;
    padding: 16px 0;
  }
`;

const SessionCard = styled.div`
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 1px solid rgba(0,150,136,0.1);

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 10px 30px rgba(0,212,170,0.2);
    border-color: rgba(0,150,136,0.3);
  }
`;

const Thumbnail = styled.div`
  position: relative;
  height: 160px;
  background: ${props => props.$bgColor || 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'};
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0,0,0,0.3);
  }
`;

const PlayButton = styled.div`
  position: absolute;
  z-index: 2;
  width: 50px;
  height: 50px;
  background: rgba(0,212,170,0.9);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 18px;
  transition: all 0.3s ease;

  ${SessionCard}:hover & {
    background: rgba(0,212,170,1);
    transform: scale(1.1);
  }
`;

const SessionInfo = styled.div`
  padding: 16px;
`;

const SessionTitle = styled.h3`
  color: white;
  font-size: 16px;
  font-weight: 600;
  margin: 0 0 8px 0;
  line-height: 1.3;
`;

const SessionDescription = styled.p`
  color: rgba(255, 255, 255, 0.7);
  font-size: 13px;
  line-height: 1.4;
  margin: 0;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const ThumbnailImage = styled.img`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const VideoContainer = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0,0,0,0.85);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const VideoPlayer = styled.div`
  background: #000;
  border-radius: 8px;
  overflow: hidden;
  width: 90vw;
  max-width: 800px;
  box-shadow: 0 4px 32px rgba(0,0,0,0.7);
  position: relative;
`;

const CloseButton = styled.button`
  position: absolute;
  top: 10px;
  right: 10px;
  background: none;
  border: none;
  color: white;
  font-size: 24px;
  cursor: pointer;
  z-index: 1001;
`;

const LoadingMessage = styled.div`
  color: white;
  text-align: center;
  padding: 20px;
  font-size: 18px;
`;

const ErrorMessage = styled.div`
  color: #f44336;
  text-align: center;
  padding: 20px;
  font-size: 18px;
`;

const NoDataMessage = styled.div`
  color: #888;
  text-align: center;
  padding: 20px;
  font-size: 16px;
`;

const NMO = () => {
  const { t } = useTranslation();

  // Estados para manejar videos de Vimeo
  const [videosData, setVideosData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedVimeoId, setSelectedVimeoId] = useState(null);
  
  const VIMEO_USER_ID = "221550365";
  const FOLDER_ID = "26540787"; // NMO folder ID
  const VIMEO_ACCESS_TOKEN = "99b1a15a9f21cc8f4ffdb1e925103e99";

  useEffect(() => {
    fetchVideos();
  }, []);

  const fetchVideos = async () => {
    setLoading(true);
    setError(null);
    try {
      let videos = [];
      let apiUrl = `https://api.vimeo.com/users/${VIMEO_USER_ID}/folders/${FOLDER_ID}/videos?fields=uri,name,description,duration,pictures,stats,link&per_page=50`;
      
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
            id: video.uri.replace("/videos/", ""),
            title: video.name,
            description: video.description || "",
            thumbnail: video.pictures?.base_link || "",
            link: video.link,
          })));
        }
        
        apiUrl = data.paging && data.paging.next ? `https://api.vimeo.com${data.paging.next}` : null;
      }
      
      setVideosData(videos.reverse());
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVideoClick = (videoId) => {
    setSelectedVimeoId(videoId);
  };

  const handleCloseVideo = () => {
    setSelectedVimeoId(null);
  };

  return (
    <PageContainer>
      <BannerContainer />
      
      <ContentContainer>
        <SectionTitle>{t('nmo.onboardingSessions')}</SectionTitle>
        
        {loading && <LoadingMessage>{t('nmo.loadingSessions')}</LoadingMessage>}
        {error && <ErrorMessage>{error}</ErrorMessage>}
        
        {!loading && !error && (
          <SessionsGrid>
            {videosData.length > 0 ? (
              videosData.map(video => (
                <SessionCard key={video.id} onClick={() => handleVideoClick(video.id)}>
                  <Thumbnail>
                    <ThumbnailImage src={video.thumbnail || '/images/placeholder_course.jpg'} alt={video.title} />
                    <PlayButton>
                      <FaPlay />
                    </PlayButton>
                  </Thumbnail>
                  <SessionInfo>
                    <SessionTitle>{video.title || t('nmo.videoUntitled')}</SessionTitle>
                    <SessionDescription>{video.description}</SessionDescription>
                  </SessionInfo>
                </SessionCard>
              ))
            ) : (
              <NoDataMessage>{t('nmo.noSessionsAvailable')}</NoDataMessage>
            )}
          </SessionsGrid>
        )}
        
        {selectedVimeoId && (
          <VideoContainer onClick={handleCloseVideo}>
            <VideoPlayer onClick={e => e.stopPropagation()}>
              <CloseButton onClick={handleCloseVideo}>&times;</CloseButton>
              <iframe
                src={`https://player.vimeo.com/video/${selectedVimeoId}?autoplay=1`}
                width="100%"
                height="450"
                frameborder="0"
                allow="autoplay; fullscreen; picture-in-picture"
                allowFullScreen
                title="Vimeo video player"
              />
            </VideoPlayer>
          </VideoContainer>
        )}
      </ContentContainer>
    </PageContainer>
  );
};

export default NMO;
