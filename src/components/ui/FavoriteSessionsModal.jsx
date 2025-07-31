import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import { FaTimes, FaStar, FaCheck, FaSpinner } from 'react-icons/fa';
import { 
  getEducatorFavoriteSessions, 
  saveEducatorFavoriteSessions 
} from '../../services/favoriteSessions';

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
`;

const ModalContent = styled.div`
  background: rgb(24, 24, 24);
  border-radius: 12px;
  padding: 24px;
  max-width: 800px;
  max-height: 80vh;
  overflow-y: auto;
  width: 100%;
  position: relative;
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid rgb(40, 40, 40);
`;

const ModalTitle = styled.h2`
  color: rgb(255, 255, 255);
  font-size: 20px;
  font-weight: 600;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: rgb(158, 158, 158);
  font-size: 20px;
  cursor: pointer;
  padding: 4px;
  
  &:hover {
    color: rgb(255, 255, 255);
  }
`;

const SessionGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
`;

const SessionItem = styled.div`
  background: rgb(32, 32, 32);
  border-radius: 8px;
  padding: 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 2px solid ${props => props.$isFavorite ? 'rgb(0, 150, 136)' : 'transparent'};
  
  &:hover {
    background: rgb(40, 40, 40);
    transform: translateY(-2px);
  }
`;

const SessionThumbnail = styled.img`
  width: 80px;
  height: 45px;
  object-fit: cover;
  border-radius: 4px;
  flex-shrink: 0;
`;

const SessionInfo = styled.div`
  flex: 1;
  min-width: 0;
`;

const SessionTitle = styled.h4`
  color: rgb(255, 255, 255);
  font-size: 14px;
  font-weight: 500;
  margin: 0 0 4px 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const SessionDescription = styled.p`
  color: rgb(158, 158, 158);
  font-size: 12px;
  margin: 0;
  line-height: 1.4;
`;

const FavoriteIndicator = styled.div`
  color: ${props => props.$isFavorite ? '#FFD700' : 'rgb(100, 100, 100)'};
  font-size: 18px;
  flex-shrink: 0;
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  border-top: 1px solid rgb(40, 40, 40);
  padding-top: 16px;
`;

const Button = styled.button`
  padding: 10px 20px;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: all 0.2s ease;
  
  ${props => props.$primary ? `
    background: rgb(0, 150, 136);
    color: white;
    
    &:hover {
      background: rgb(0, 180, 160);
    }
    
    &:disabled {
      background: rgb(60, 60, 60);
      cursor: not-allowed;
    }
  ` : `
    background: rgb(60, 60, 60);
    color: rgb(200, 200, 200);
    
    &:hover {
      background: rgb(80, 80, 80);
    }
  `}
`;

const LoadingSpinner = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px;
  color: rgb(158, 158, 158);
  gap: 8px;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 40px 20px;
  color: rgb(158, 158, 158);
`;

const FavoriteSessionsModal = ({ 
  isOpen, 
  onClose, 
  educatorId, 
  sessions = [], 
  onSave 
}) => {
  const { t } = useTranslation();
  const [selectedSessions, setSelectedSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isOpen && educatorId) {
      loadFavoriteSessions();
    }
  }, [isOpen, educatorId]);

  const loadFavoriteSessions = async () => {
    setLoading(true);
    try {
      const favorites = await getEducatorFavoriteSessions(educatorId);
      setSelectedSessions(favorites);
    } catch (error) {
      console.error('Error loading favorite sessions:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleSession = (sessionId) => {
    setSelectedSessions(prev => 
      prev.includes(sessionId)
        ? prev.filter(id => id !== sessionId)
        : [...prev, sessionId]
    );
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const success = await saveEducatorFavoriteSessions(educatorId, selectedSessions);
      if (success) {
        onSave && onSave(selectedSessions);
        onClose();
      } else {
        alert('Error guardando las sesiones favoritas');
      }
    } catch (error) {
      console.error('Error saving favorite sessions:', error);
      alert('Error guardando las sesiones favoritas');
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <ModalOverlay onClick={onClose}>
      <ModalContent onClick={e => e.stopPropagation()}>
        <ModalHeader>
          <ModalTitle>
            <FaStar />
            Gestionar Sesiones Favoritas
          </ModalTitle>
          <CloseButton onClick={onClose}>
            <FaTimes />
          </CloseButton>
        </ModalHeader>

        {loading ? (
          <LoadingSpinner>
            <FaSpinner className="fa-spin" />
            Cargando sesiones...
          </LoadingSpinner>
        ) : sessions.length === 0 ? (
          <EmptyState>
            <p>No hay sesiones disponibles para este educador.</p>
          </EmptyState>
        ) : (
          <>
            <SessionGrid>
              {sessions.map(session => (
                <SessionItem
                  key={session.vimeoId}
                  $isFavorite={selectedSessions.includes(session.vimeoId)}
                  onClick={() => toggleSession(session.vimeoId)}
                >
                  <SessionThumbnail
                    src={session.thumbnailUrl || `https://vumbnail.com/${session.vimeoId}.jpg`}
                    alt={session.title}
                  />
                  <SessionInfo>
                    <SessionTitle>{session.title || 'Sin título'}</SessionTitle>
                    <SessionDescription>
                      {session.description ? 
                        session.description.substring(0, 100) + (session.description.length > 100 ? '...' : '')
                        : 'Sin descripción'
                      }
                    </SessionDescription>
                  </SessionInfo>
                  <FavoriteIndicator $isFavorite={selectedSessions.includes(session.vimeoId)}>
                    <FaStar />
                  </FavoriteIndicator>
                </SessionItem>
              ))}
            </SessionGrid>

            <ActionButtons>
              <Button onClick={onClose}>
                Cancelar
              </Button>
              <Button 
                $primary 
                onClick={handleSave} 
                disabled={saving}
              >
                {saving ? (
                  <>
                    <FaSpinner className="fa-spin" />
                    Guardando...
                  </>
                ) : (
                  <>
                    <FaCheck />
                    Guardar Cambios
                  </>
                )}
              </Button>
            </ActionButtons>
          </>
        )}
      </ModalContent>
    </ModalOverlay>
  );
};

export default FavoriteSessionsModal;