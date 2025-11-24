import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import { FaTimes, FaStar, FaCheck, FaSpinner, FaEdit } from 'react-icons/fa';
import { 
  getEducatorFavoriteSessions, 
  saveEducatorFavoriteSessions 
} from '../../services/favoriteSessions';
import { currentUserCanManageFavorites } from '../../utils/permissions';

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

const SessionActions = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
`;

const FavoriteIndicator = styled.div`
  color: ${props => props.$isFavorite ? '#FFD700' : 'rgb(100, 100, 100)'};
  font-size: 18px;
  flex-shrink: 0;
`;

const EditButton = styled.button`
  background: none;
  border: none;
  color: rgb(158, 158, 158);
  font-size: 14px;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  transition: all 0.2s ease;
  
  &:hover {
    color: rgb(0, 150, 136);
    background: rgba(0, 150, 136, 0.1);
  }
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
  const [editingSession, setEditingSession] = useState(null);
  const [newName, setNewName] = useState('');
  const [renaming, setRenaming] = useState(false);
  const canManage = currentUserCanManageFavorites();

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

  const handleEditClick = (session, event) => {
    event.stopPropagation();
    setEditingSession(session.vimeoId);
    setNewName(session.title || '');
  };

  const handleCancelEdit = () => {
    setEditingSession(null);
    setNewName('');
  };

  const handleRenameVideo = async () => {
    if (!newName.trim() || !editingSession) return;
    
    setRenaming(true);
    try {
      // Llamada directa a la API de Vimeo
      const response = await fetch(`https://api.vimeo.com/videos/${editingSession}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_VIMEO_ACCESS_TOKEN}`,
          'Accept': 'application/vnd.vimeo.*+json;version=3.4',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: newName.trim()
        })
      });

      if (response.ok) {
        const updatedVideo = await response.json();
        // Actualizar el título en la lista local
        sessions.forEach(session => {
          if (session.vimeoId === editingSession) {
            session.title = newName.trim();
          }
        });
        
        setEditingSession(null);
        setNewName('');
        alert('Nombre del video actualizado exitosamente');
      } else {
        const errorText = await response.text();
        console.error('Vimeo API Error:', response.status, errorText);
        alert(`Error: ${response.status} - ${errorText}`);
      }
    } catch (error) {
      console.error('Error renaming video:', error);
      alert('Error al renombrar el video: ' + error.message);
    } finally {
      setRenaming(false);
    }
  };

  if (!isOpen) return null;

  return (
    <ModalOverlay onClick={onClose}>
      <ModalContent onClick={e => e.stopPropagation()}>
        <ModalHeader>
          <ModalTitle>
            <FaStar />
            {t('favoriteSessionsModal.title')}
          </ModalTitle>
          <CloseButton onClick={onClose}>
            <FaTimes />
          </CloseButton>
        </ModalHeader>

        {loading ? (
          <LoadingSpinner>
            <FaSpinner className="fa-spin" />
            {t('favoriteSessionsModal.loadingSessions')}
          </LoadingSpinner>
        ) : sessions.length === 0 ? (
          <EmptyState>
            <p>{t('favoriteSessionsModal.noSessionsAvailable')}</p>
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
                    {editingSession === session.vimeoId ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <input
                          type="text"
                          value={newName}
                          onChange={(e) => setNewName(e.target.value)}
                          style={{
                            background: 'rgb(40, 40, 40)',
                            border: '1px solid rgb(60, 60, 60)',
                            borderRadius: '4px',
                            padding: '4px 8px',
                            color: 'white',
                            fontSize: '14px'
                          }}
                          onClick={(e) => e.stopPropagation()}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleRenameVideo();
                            if (e.key === 'Escape') handleCancelEdit();
                          }}
                          autoFocus
                        />
                        <div style={{ display: 'flex', gap: '4px' }}>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRenameVideo();
                            }}
                            disabled={renaming}
                            style={{
                              background: 'rgb(0, 150, 136)',
                              border: 'none',
                              borderRadius: '4px',
                              color: 'white',
                              padding: '4px 8px',
                              fontSize: '12px',
                              cursor: renaming ? 'not-allowed' : 'pointer'
                            }}
                          >
                            {renaming ? <FaSpinner className="fa-spin" /> : 'Guardar'}
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCancelEdit();
                            }}
                            style={{
                              background: 'rgb(60, 60, 60)',
                              border: 'none',
                              borderRadius: '4px',
                              color: 'white',
                              padding: '4px 8px',
                              fontSize: '12px',
                              cursor: 'pointer'
                            }}
                          >
                            {t('favoriteSessionsModal.cancel')}
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <SessionTitle>{session.title || t('favoriteSessionsModal.untitled')}</SessionTitle>
                        <SessionDescription>
                          {session.description ? 
                            session.description.substring(0, 100) + (session.description.length > 100 ? '...' : '')
                            : t('favoriteSessionsModal.noDescription')
                          }
                        </SessionDescription>
                      </>
                    )}
                  </SessionInfo>
                  <SessionActions>
                    {canManage && editingSession !== session.vimeoId && (
                      <EditButton
                        onClick={(e) => handleEditClick(session, e)}
                        title="Editar nombre del video"
                      >
                        <FaEdit />
                      </EditButton>
                    )}
                    <FavoriteIndicator $isFavorite={selectedSessions.includes(session.vimeoId)}>
                      <FaStar />
                    </FavoriteIndicator>
                  </SessionActions>
                </SessionItem>
              ))}
            </SessionGrid>

            <ActionButtons>
              <Button onClick={onClose}>
                {t('favoriteSessionsModal.cancel')}
              </Button>
              <Button 
                $primary 
                onClick={handleSave} 
                disabled={saving}
              >
                {saving ? (
                  <>
                    <FaSpinner className="fa-spin" />
                    {t('favoriteSessionsModal.saving')}
                  </>
                ) : (
                  <>
                    <FaCheck />
                    {t('favoriteSessionsModal.saveChanges')}
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