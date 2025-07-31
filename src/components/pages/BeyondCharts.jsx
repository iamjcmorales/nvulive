import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FaPlay } from 'react-icons/fa';

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
  background: url('/images/beyondnewlogo.jpg') center/cover;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 0;
  padding: 0;
  @media (max-width: 768px) {
    height: 90px;
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
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
  margin-top: 20px;
`;

const SessionCard = styled.div`
  background: #1a1a1a;
  border-radius: 8px;
  overflow: hidden;
  transition: all 0.3s ease;
  border: 1px solid rgba(255,255,255,0.1);
  cursor: pointer;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 4px 20px rgba(0,0,0,0.3);
    border-color: rgba(0,150,136,0.3);
  }
`;

const ThumbnailContainer = styled.div`
  position: relative;
  padding-top: 56.25%;
  background: #000;

  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0,0,0,0.3);
    opacity: 0;
    transition: opacity 0.3s ease;
  }

  &:hover::after {
    opacity: 1;
  }
`;

const PlayButton = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: white;
  font-size: 48px;
  opacity: 0;
  transition: opacity 0.3s ease;
  z-index: 2;

  ${SessionCard}:hover & {
    opacity: 1;
  }
`;

const ThumbnailImage = styled.img`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const CardBody = styled.div`
  padding: 15px;
`;

const SessionTitle = styled.h3`
  color: white;
  margin: 0;
  font-size: 16px;
  font-weight: 500;
  line-height: 1.4;
`;

const SessionDescription = styled.p`
  color: #888;
  font-size: 14px;
  margin: 5px 0 0 0;
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

const BeyondCharts = () => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedVimeoId, setSelectedVimeoId] = useState(null);
  const VIMEO_USER_ID = "221550365";
  const FOLDER_ID = "24833856";
  const VIMEO_ACCESS_TOKEN = "99b1a15a9f21cc8f4ffdb1e925103e99"; // ¡Visible en frontend, solo para pruebas!

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
      setVideos(videos);
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
        {/* <SectionTitle>Últimas Sesiones</SectionTitle> */}
        {loading && <LoadingMessage>Cargando sesiones...</LoadingMessage>}
        {error && <ErrorMessage>{error}</ErrorMessage>}
        {!loading && !error && (
          <SessionsGrid>
            {videos.length > 0 ? (
              videos.map(video => (
                <SessionCard key={video.id} onClick={() => handleVideoClick(video.id)}>
                  <ThumbnailContainer>
                    <ThumbnailImage src={video.thumbnail || '/images/placeholder_course.jpg'} alt={video.title} />
                    <PlayButton>
                      <FaPlay />
                    </PlayButton>
                  </ThumbnailContainer>
                  <CardBody>
                    <SessionTitle>{video.title || 'Video sin título'}</SessionTitle>
                    <SessionDescription>{video.description}</SessionDescription>
                  </CardBody>
                </SessionCard>
              ))
            ) : (
              <NoDataMessage>No hay sesiones disponibles.</NoDataMessage>
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
                frameBorder="0"
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

export default BeyondCharts; 