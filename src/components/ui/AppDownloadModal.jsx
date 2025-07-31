import React from 'react';
import styled from 'styled-components';
import { FaApple, FaGooglePlay, FaTimes } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(5px);
  padding: 20px;
  box-sizing: border-box;
`;

const ModalContent = styled.div`
  background: rgb(24, 24, 24);
  border-radius: 16px;
  padding: 32px;
  max-width: 400px;
  width: 100%;
  position: relative;
  border: 1px solid rgba(0, 150, 136, 0.2);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
  transform: translateY(0);

  @media (max-width: 480px) {
    padding: 24px;
    max-width: 90%;
  }
`;

const CloseButton = styled.button`
  position: absolute;
  top: 16px;
  right: 16px;
  background: none;
  border: none;
  color: rgb(158, 158, 158);
  font-size: 1.5rem;
  cursor: pointer;
  padding: 8px;
  border-radius: 50%;
  transition: all 0.2s ease;

  &:hover {
    color: rgb(255, 255, 255);
    background: rgba(255, 255, 255, 0.1);
  }
`;

const ModalTitle = styled.h2`
  color: rgb(255, 255, 255);
  margin: 0 0 8px 0;
  font-size: 24px;
  font-weight: 600;
  text-align: center;

  @media (max-width: 480px) {
    font-size: 20px;
  }
`;

const ModalSubtitle = styled.p`
  color: rgb(158, 158, 158);
  margin: 0 0 32px 0;
  text-align: center;
  font-size: 14px;
  line-height: 1.5;

  @media (max-width: 480px) {
    margin-bottom: 24px;
  }
`;

const DownloadButtons = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;

  @media (max-width: 480px) {
    gap: 12px;
  }
`;

const DownloadButton = styled.a`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 16px 24px;
  border-radius: 12px;
  text-decoration: none;
  font-weight: 600;
  font-size: 16px;
  transition: all 0.2s ease;
  border: 2px solid transparent;

  &.apple {
    background: linear-gradient(135deg, #007AFF, #0051D5);
    color: white;

    &:hover {
      background: linear-gradient(135deg, #0051D5, #003BA3);
      transform: translateY(-2px);
      box-shadow: 0 8px 20px rgba(0, 122, 255, 0.3);
    }
  }

  &.google {
    background: linear-gradient(135deg, #34A853, #137333);
    color: white;

    &:hover {
      background: linear-gradient(135deg, #137333, #0F5132);
      transform: translateY(-2px);
      box-shadow: 0 8px 20px rgba(52, 168, 83, 0.3);
    }
  }

  svg {
    font-size: 24px;
    min-width: 24px;
  }

  @media (max-width: 480px) {
    padding: 14px 20px;
    font-size: 14px;

    svg {
      font-size: 20px;
    }
  }
`;

const AppDownloadModal = ({ isOpen, onClose }) => {
  const { t } = useTranslation();
  
  if (!isOpen) return null;

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <ModalOverlay onClick={handleOverlayClick}>
      <ModalContent>
        <CloseButton onClick={onClose}>
          <FaTimes />
        </CloseButton>
        
        <ModalTitle>{t('sidebar.appModal.title')}</ModalTitle>
        <ModalSubtitle>
          {t('sidebar.appModal.subtitle')}
        </ModalSubtitle>
        
        <DownloadButtons>
          <DownloadButton
            href="https://apps.apple.com/ar/app/tnt-trade-and-travel/id6740091165"
            target="_blank"
            rel="noopener noreferrer"
            className="apple"
          >
            <FaApple />
            <span>{t('sidebar.appModal.downloadIOS')}</span>
          </DownloadButton>
          
          <DownloadButton
            href="https://play.google.com/store/apps/details?id=com.oranaviv.nvutnt&pcampaignid=web_share"
            target="_blank"
            rel="noopener noreferrer"
            className="google"
          >
            <FaGooglePlay />
            <span>{t('sidebar.appModal.downloadAndroid')}</span>
          </DownloadButton>
        </DownloadButtons>
      </ModalContent>
    </ModalOverlay>
  );
};

export default AppDownloadModal;