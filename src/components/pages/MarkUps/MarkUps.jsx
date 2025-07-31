import React, { useState } from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import { FaUserPlus, FaUserCheck, FaUsers, FaChartLine } from 'react-icons/fa';
import educatorsData from '../../../data/educatorsData';
import EducatorProfile from './EducatorProfile';
import { useAllTrades, useFollowedTrades, useEducatorsStats } from '../../../hooks/useTrades';
import { useSubscriptions } from '../../../hooks/useSubscriptions';
import { seedFirebaseWithTrades } from '../../../utils/seedFirebase';

// Styled Components
const MarkUpsContainer = styled.div`
  min-height: 100vh;
  background: #0a0e1a;
  color: white;
`;

const Header = styled.header`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px;
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
`;

const Title = styled.h1`
  font-size: 24px;
  font-weight: 600;
  margin: 0;
  color: white;
`;

const TabsContainer = styled.div`
  display: flex;
  gap: 16px;
  padding: 0 24px;
  margin-top: 20px;
`;

const Tab = styled.button`
  background: ${props => props.$active ? '#00968a' : 'transparent'};
  color: ${props => props.$active ? 'white' : 'rgba(255, 255, 255, 0.7)'};
  border: 1px solid ${props => props.$active ? '#00968a' : 'rgba(255, 255, 255, 0.2)'};
  border-radius: 8px;
  padding: 12px 20px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 8px;
  
  &:hover {
    background: ${props => props.$active ? '#007a6e' : 'rgba(255, 255, 255, 0.05)'};
    color: ${props => props.$active ? 'white' : 'white'};
  }
`;

const Content = styled.main`
  padding: 24px;
  max-width: 1200px;
  margin: 0 auto;
`;

const EducatorsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-top: 24px;
`;

const EducatorCard = styled.div`
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 20px;
  cursor: pointer;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 20px rgba(0, 150, 138, 0.15);
    border-color: rgba(0, 150, 138, 0.3);
    background: rgba(255, 255, 255, 0.08);
  }
  
  @media (max-width: 768px) {
    flex-direction: column;
    text-align: center;
    gap: 16px;
  }
`;

const EducatorAvatarSection = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  flex: 1;
  
  @media (max-width: 768px) {
    justify-content: center;
  }
`;

const EducatorAvatar = styled.div`
  width: 60px;
  height: 60px;
  border-radius: 50%;
  overflow: hidden;
  border: 2px solid #00968a;
  flex-shrink: 0;
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const AvatarPlaceholder = styled.div`
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: #00968a;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: bold;
  font-size: 18px;
  border: 2px solid #00968a;
  flex-shrink: 0;
`;

const EducatorInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
`;

const EducatorName = styled.h3`
  font-size: 18px;
  font-weight: 600;
  margin: 0;
  color: white;
`;

const EducatorCategory = styled.p`
  font-size: 14px;
  color: #00968a;
  margin: 0;
  font-weight: 500;
`;

const EducatorStatus = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.7);
  margin-top: 4px;
`;

const StatusDot = styled.div`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: ${props => props.$status === 'En vivo' ? '#4caf50' : '#666'};
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 12px;
  align-items: center;
  flex-shrink: 0;
  margin-left: auto;
  
  @media (max-width: 768px) {
    justify-content: center;
    margin-left: 0;
  }
`;

const FollowButton = styled.button`
  background: ${props => props.$following ? '#4caf50' : '#00968a'};
  color: white;
  border: none;
  border-radius: 8px;
  padding: 10px 16px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 6px;
  min-width: 100px;
  justify-content: center;
  
  &:hover {
    background: ${props => props.$following ? '#45a049' : '#007a6e'};
    transform: translateY(-1px);
  }
  
  &:active {
    transform: translateY(0);
  }
`;

const ViewProfileButton = styled.button`
  background: transparent;
  color: rgba(255, 255, 255, 0.8);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  padding: 10px 16px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: rgba(255, 255, 255, 0.05);
    color: white;
    border-color: rgba(255, 255, 255, 0.3);
  }
`;

const SectionDescription = styled.p`
  font-size: 16px;
  color: rgba(255, 255, 255, 0.8);
  margin-bottom: 8px;
  text-align: center;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 40px 20px;
  color: rgba(255, 255, 255, 0.6);
  
  .icon {
    font-size: 48px;
    margin-bottom: 16px;
    color: rgba(255, 255, 255, 0.3);
  }
  
  h3 {
    font-size: 18px;
    margin: 0 0 8px 0;
    color: rgba(255, 255, 255, 0.8);
  }
  
  p {
    font-size: 14px;
    margin: 0;
  }
`;

const TradesContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-top: 24px;
`;

const TradeCard = styled.div`
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 20px;
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;
  border-left: 4px solid ${props => props.$direction === 'Buy' ? '#4caf50' : '#f44336'};
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 20px rgba(0, 150, 138, 0.15);
    background: rgba(255, 255, 255, 0.08);
  }
`;

const TradeHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
`;

const TradeInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const TradeEducator = styled.span`
  color: #00968a;
  font-weight: 600;
  font-size: 14px;
`;

const TradeInstrument = styled.span`
  color: white;
  font-weight: 600;
  font-size: 16px;
`;

const TradeDirection = styled.span`
  background: ${props => props.$direction === 'Buy' ? 'rgba(76, 175, 80, 0.2)' : 'rgba(244, 67, 54, 0.2)'};
  color: ${props => props.$direction === 'Buy' ? '#4caf50' : '#f44336'};
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 600;
`;

const TradeStatus = styled.span`
  background: ${props => props.$status === 'Open' ? 'rgba(255, 193, 7, 0.2)' : 'rgba(76, 175, 80, 0.2)'};
  color: ${props => props.$status === 'Open' ? '#ffc107' : '#4caf50'};
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 600;
`;

const TradeDetails = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 16px;
  margin-bottom: 12px;
`;

const TradeDetail = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  
  label {
    font-size: 12px;
    color: rgba(255, 255, 255, 0.6);
    font-weight: 500;
  }
  
  span {
    font-size: 14px;
    color: white;
    font-weight: 600;
  }
`;

const TradeResult = styled.span`
  color: ${props => props.$isProfit ? '#4caf50' : '#f44336'};
  font-weight: 700;
`;

const TradeDate = styled.div`
  color: rgba(255, 255, 255, 0.5);
  font-size: 12px;
  margin-top: 8px;
`;

const MarkUps = () => {
  const { t } = useTranslation();
  const [selectedEducator, setSelectedEducator] = useState(null);
  const [activeTab, setActiveTab] = useState('tracking'); // 'tracking', 'all', or 'following'

  // Combinar todos los educadores de todas las categorías, excluyendo Stephon R y Jorge D
  const allEducators = Object.values(educatorsData).flat().filter(educator => 
    educator.id && educator.id !== 'stephon-r' && educator.id !== 'jorge-d'
  );
  
  // Usar hook personalizado para manejar suscripciones con Firebase
  const { 
    subscribedEducators, 
    loading: subscriptionsLoading, 
    error: subscriptionsError,
    toggleSubscription,
    isSubscribed 
  } = useSubscriptions();
  
  // Usar Firebase para obtener trades y estadísticas
  const { trades: allTrades, loading: allTradesLoading } = useAllTrades();
  const { trades: followedTrades, loading: followedTradesLoading } = useFollowedTrades(subscribedEducators);
  const { stats: educatorsStats, loading: statsLoading } = useEducatorsStats();



  
  // Filtrar educadores según la pestaña activa
  const displayedEducators = activeTab === 'following' 
    ? allEducators.filter(educator => subscribedEducators.has(educator.id))
    : activeTab === 'all'
    ? allEducators
    : []; // Para 'tracking' no mostramos educadores, sino trades

  const getInitials = (name) => {
    return name.split(' ').map(word => word[0]).join('').toUpperCase();
  };

  const getCategoryName = (category) => {
    const categoryMap = {
      'forex': 'Forex',
      'crypto': 'Crypto',
      'futures': 'Futuros',
      'stock': 'Acciones',
      'financial-literacy': 'Educación Financiera',
      'marketing-digital': 'Marketing Digital'
    };
    return categoryMap[category] || category;
  };

  const handleEducatorClick = (educator) => {
    // Crear un educador con datos reales del sistema
    const educatorProfile = {
      id: educator.id,
      name: educator.name,
      avatar: educator.profileImageFilename ? (educator.id === 'lucas-longmire' ? `/images/perfil/${educator.profileImageFilename}` : `/PERFIL/${educator.profileImageFilename}`) : null,
      market: getCategoryName(educator.category),
      subscribers: Math.floor(Math.random() * 5000) + 1000, // Esto se puede mover a Firebase también
      biography: educator.description || 'Educador experto comprometido con el éxito de los estudiantes.'
    };
    
    setSelectedEducator(educatorProfile);
  };

  const handleFollow = async (educatorId, event) => {
    event.stopPropagation(); // Prevenir que se abra el perfil al hacer click en seguir
    
    // Verificar si hay usuario autenticado
    const userData = localStorage.getItem('nvuUserData');
    if (!userData) {
      alert(t('markups.loginRequired', 'Por favor, inicia sesión para seguir educadores'));
      return;
    }

    try {
      await toggleSubscription(educatorId);
    } catch (error) {
      console.error('Error al cambiar suscripción:', error);
      if (error.message.includes('Usuario no autenticado')) {
        alert(t('markups.loginRequired', 'Por favor, inicia sesión para seguir educadores'));
      } else {
        alert(t('markups.subscriptionError', 'Error al cambiar suscripción. Inténtalo de nuevo.'));
      }
    }
  };

  const handleViewProfile = (educator, event) => {
    event.stopPropagation();
    handleEducatorClick(educator);
  };

  const handleBackToMarkups = () => {
    setSelectedEducator(null);
  };

  if (selectedEducator) {
    return (
      <EducatorProfile
        educator={selectedEducator}
        onBack={handleBackToMarkups}
        isSubscribed={isSubscribed(selectedEducator.id)}
        onSubscribe={() => handleFollow(selectedEducator.id, { stopPropagation: () => {} })}
      />
    );
  }

  // Mostrar loading mientras cargan las suscripciones
  if (subscriptionsLoading) {
    return (
      <MarkUpsContainer>
        <Header>
          <Title>{t('markups.pageTitle')}</Title>
        </Header>
        <Content>
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <p>{t('markups.loadingSubscriptions')}</p>
          </div>
        </Content>
      </MarkUpsContainer>
    );
  }

  // Mostrar error si hay problemas con las suscripciones
  if (subscriptionsError) {
    console.error('Error de suscripciones:', subscriptionsError);
  }

  return (
    <MarkUpsContainer>
      <Header>
        <Title>{t('markups.pageTitle')}</Title>
      </Header>

            <TabsContainer>
        <Tab 
          $active={activeTab === 'tracking'} 
          onClick={() => setActiveTab('tracking')}
        >
          <FaChartLine />
          {t('markups.tracking')}
        </Tab>
        <Tab 
          $active={activeTab === 'all'} 
          onClick={() => setActiveTab('all')}
        >
          <FaUsers />
          {t('markups.allEducators')} ({allEducators.length})
        </Tab>
        <Tab 
          $active={activeTab === 'following'} 
          onClick={() => setActiveTab('following')}
        >
          <FaUserCheck />
          {t('markups.following')} ({subscribedEducators.size})
        </Tab>
      </TabsContainer>

      <Content>
        <SectionDescription>
          {activeTab === 'tracking'
            ? t('markups.trackingDescription')
            : activeTab === 'all' 
            ? t('markups.selectEducator') 
            : t('markups.followingEducators')
          }
        </SectionDescription>

        {activeTab === 'tracking' ? (
          // Mostrar trades de seguimiento
          followedTradesLoading ? (
            <div style={{ textAlign: 'center', padding: '40px' }}>
              <p>{t('markups.loadingTrades')}</p>
            </div>
          ) : followedTrades.length === 0 ? (
            <EmptyState>
              <div className="icon">
                <FaChartLine />
              </div>
              <h3>{t('markups.noTrackedTrades')}</h3>
              <p>{t('markups.startFollowingEducators')}</p>
            </EmptyState>
          ) : (
            <TradesContainer>
              {followedTrades.map(trade => (
                <TradeCard key={trade.id} $direction={trade.direction}>
                  <TradeHeader>
                    <TradeInfo>
                      <TradeEducator>{trade.educatorName}</TradeEducator>
                      <TradeInstrument>{trade.instrument}</TradeInstrument>
                      <TradeDirection $direction={trade.direction}>
                        {trade.direction}
                      </TradeDirection>
                    </TradeInfo>
                    <TradeStatus $status={trade.status}>
                      {trade.status}
                    </TradeStatus>
                  </TradeHeader>
                  
                  <TradeDetails>
                    <TradeDetail>
                      <label>{t('markups.entryPrice')}</label>
                      <span>{trade.entryPrice}</span>
                    </TradeDetail>
                    <TradeDetail>
                      <label>{t('markups.exitPrice')}</label>
                      <span>{trade.exitPrice}</span>
                    </TradeDetail>
                    <TradeDetail>
                      <label>{t('markups.result')}</label>
                      <TradeResult $isProfit={trade.result && trade.result.includes && trade.result.includes('+')}>
                        {trade.result || t('markups.pending')}
                      </TradeResult>
                    </TradeDetail>
                    <TradeDetail>
                      <label>{t('markups.reason')}</label>
                      <span>{trade.reason}</span>
                    </TradeDetail>
                  </TradeDetails>
                  
                  <TradeDate>
                    {new Date(trade.date).toLocaleDateString()} - {new Date(trade.date).toLocaleTimeString()}
                  </TradeDate>
                </TradeCard>
              ))}
            </TradesContainer>
          )
        ) : displayedEducators.length === 0 && activeTab === 'following' ? (
          <EmptyState>
            <div className="icon">
              <FaUsers />
            </div>
            <h3>{t('markups.notFollowingAny')}</h3>
            <p>{t('markups.clickFollowInstruction')}</p>
          </EmptyState>
        ) : activeTab !== 'tracking' ? (
          <EducatorsList>
            {displayedEducators.map(educator => (
              <EducatorCard 
                key={educator.id}
                onClick={() => handleEducatorClick(educator)}
              >
                <EducatorAvatarSection>
                  {educator.profileImageFilename ? (
                    <EducatorAvatar>
                      <img 
                        src={educator.id === 'lucas-longmire' ? `/images/perfil/${educator.profileImageFilename}` : `/PERFIL/${educator.profileImageFilename}`}
                        alt={educator.name}
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.parentNode.style.display = 'none';
                          e.target.parentNode.nextSibling.style.display = 'flex';
                        }}
                      />
                    </EducatorAvatar>
                  ) : null}
                  <AvatarPlaceholder style={{ display: educator.profileImageFilename ? 'none' : 'flex' }}>
                    {getInitials(educator.name)}
                  </AvatarPlaceholder>
                  
                  <EducatorInfo>
                    <EducatorName>{educator.name}</EducatorName>
                    <EducatorCategory>{getCategoryName(educator.category)}</EducatorCategory>
                    {educator.status && (
                      <EducatorStatus>
                        <StatusDot $status={educator.status} />
                        {educator.status}
                      </EducatorStatus>
                    )}
                  </EducatorInfo>
                </EducatorAvatarSection>

                <ActionButtons onClick={(e) => e.stopPropagation()}>
                  <FollowButton
                    $following={isSubscribed(educator.id)}
                    onClick={(e) => handleFollow(educator.id, e)}
                  >
                    {isSubscribed(educator.id) ? (
                      <>
                        <FaUserCheck />
                        {t('markups.followingButton')}
                      </>
                    ) : (
                      <>
                        <FaUserPlus />
                        {t('markups.followButton')}
                      </>
                    )}
                  </FollowButton>
                  
                  <ViewProfileButton onClick={(e) => handleViewProfile(educator, e)}>
                    {t('markups.viewProfile')}
                  </ViewProfileButton>
                </ActionButtons>
              </EducatorCard>
            ))}
          </EducatorsList>
        ) : null}
      </Content>
    </MarkUpsContainer>
  );
};

export default MarkUps; 