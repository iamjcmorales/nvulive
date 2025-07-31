import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FaArrowLeft, FaUserPlus, FaCheck, FaPlus, FaTimes, FaEdit, FaTrash } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import TradingForm from './TradingForm';
import EditTradeModal from './EditTradeModal';
import { useEducatorTrades } from '../../../hooks/useTrades';
import { currentUserCanCreateTrades } from '../../../utils/permissions';
import { useSubscriberCount } from '../../../hooks/useSubscriptionCount';

// Styled Components
const ProfileContainer = styled.div`
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

const BackButton = styled.button`
  background: none;
  border: none;
  color: white;
  font-size: 18px;
  cursor: pointer;
  padding: 8px;
  border-radius: 50%;
  transition: background-color 0.2s;
  
  &:hover {
    background: rgba(255, 255, 255, 0.1);
  }
`;

const Title = styled.h1`
  font-size: 20px;
  font-weight: 600;
  margin: 0;
  color: white;
`;

const Content = styled.main`
  padding: 24px;
  max-width: 1200px;
  margin: 0 auto;
`;

const ProfileHeader = styled.div`
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 30px;
  margin-bottom: 24px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(10px);
`;

const ProfileTop = styled.div`
  display: flex;
  align-items: center;
  gap: 24px;
  margin-bottom: 24px;
  
  @media (max-width: 768px) {
    flex-direction: column;
    text-align: center;
    gap: 16px;
  }
`;

const ProfileAvatar = styled.img`
  width: 120px;
  height: 120px;
  border-radius: 50%;
  object-fit: cover;
  border: 4px solid #00968a;
`;

const AvatarPlaceholder = styled.div`
  width: 120px;
  height: 120px;
  border-radius: 50%;
  background: #00968a;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: bold;
  font-size: 36px;
  border: 4px solid #00968a;
`;

const ProfileInfo = styled.div`
  flex: 1;
`;

const ProfileName = styled.h1`
  font-size: 28px;
  font-weight: 700;
  margin: 0 0 8px 0;
  color: white;
`;

const ProfileMarket = styled.p`
  font-size: 18px;
  color: #00968a;
  font-weight: 600;
  margin: 0 0 8px 0;
`;

const ProfileSubscribers = styled.p`
  font-size: 16px;
  color: rgba(255, 255, 255, 0.7);
  margin: 0 0 16px 0;
`;

const SubscribeButton = styled.button`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 24px;
  border: 2px solid #00968a;
  border-radius: 25px;
  background: ${props => props.$subscribed ? '#00968a' : 'transparent'};
  color: ${props => props.$subscribed ? 'white' : '#00968a'};
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: ${props => props.$subscribed ? '#007a6e' : '#00968a'};
    color: white;
  }
`;

const Biography = styled.p`
  font-size: 16px;
  line-height: 1.6;
  color: rgba(255, 255, 255, 0.8);
  margin: 0;
`;

const StatsContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 32px;
`;

const StatCard = styled.div`
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 20px;
  text-align: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(10px);
`;

const StatValue = styled.div`
  font-size: 24px;
  font-weight: 700;
  color: #00968a;
  margin-bottom: 8px;
`;

const StatLabel = styled.div`
  font-size: 14px;
  color: rgba(255, 255, 255, 0.7);
  font-weight: 500;
`;

const TradesSection = styled.div`
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 32px;
  margin-bottom: 24px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(10px);
`;

const SectionTitle = styled.h2`
  font-size: 20px;
  font-weight: 600;
  color: white;
  margin: 0 0 24px 0;
`;

const TradesGrid = styled.div`
  display: grid;
  gap: 16px;
`;

const TradeCard = styled.div`
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  padding: 20px;
  border-left: 4px solid ${props => props.direction === 'Buy' ? '#4caf50' : '#f44336'};
  backdrop-filter: blur(5px);
  position: relative;
`;

const TradeHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
`;

const EditButton = styled.button`
  position: absolute;
  top: 16px;
  right: 16px;
  background: rgba(0, 150, 138, 0.2);
  border: 1px solid rgba(0, 150, 138, 0.5);
  color: #00968a;
  border-radius: 8px;
  padding: 8px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s ease;
  
  &:hover {
    background: rgba(0, 150, 138, 0.3);
    color: white;
  }
`;

const DeleteButton = styled.button`
  position: absolute;
  top: 16px;
  right: 60px;
  background: rgba(244, 67, 54, 0.2);
  border: 1px solid rgba(244, 67, 54, 0.5);
  color: #f44336;
  border-radius: 8px;
  padding: 8px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s ease;
  
  &:hover {
    background: rgba(244, 67, 54, 0.3);
    color: white;
  }
`;

const TradePair = styled.h3`
  font-size: 18px;
  font-weight: 600;
  color: white;
  margin: 0;
`;

const TradeDirection = styled.span`
  background: ${props => props.direction === 'Buy' ? '#4caf50' : '#f44336'};
  color: white;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
`;

const TradeDetails = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 12px;
  margin-bottom: 12px;
`;

const TradeDetail = styled.div`
  font-size: 14px;
  
  strong {
    color: white;
  }
  
  span {
    color: rgba(255, 255, 255, 0.7);
  }
`;

const TradeResult = styled.div`
  font-size: 16px;
  font-weight: 600;
  color: ${props => props.positive ? '#4caf50' : '#f44336'};
`;

const TradeReason = styled.p`
  font-size: 14px;
  color: rgba(255, 255, 255, 0.6);
  margin: 12px 0 0 0;
  font-style: italic;
`;

const EmptyTrades = styled.div`
  text-align: center;
  padding: 40px;
  color: rgba(255, 255, 255, 0.6);
  
  h3 {
    margin-bottom: 8px;
    color: white;
  }
`;

const AddTraderContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 32px;
  text-align: center;
  border: 2px dashed rgba(0, 150, 138, 0.3);
  border-radius: 12px;
  background: rgba(0, 150, 138, 0.05);
  transition: all 0.3s ease;
  
  &:hover {
    border-color: rgba(0, 150, 138, 0.5);
    background: rgba(0, 150, 138, 0.08);
  }
`;

const AddTraderDescription = styled.p`
  font-size: 16px;
  color: rgba(255, 255, 255, 0.7);
  margin: 0 0 20px 0;
  max-width: 400px;
  line-height: 1.5;
`;

const AddTraderButton = styled.button`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 32px;
  background: #00968a;
  color: white;
  border: none;
  border-radius: 25px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 16px rgba(0, 150, 138, 0.3);
  
  &:hover {
    background: #007a6e;
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(0, 150, 138, 0.4);
  }
  
  &:active {
    transform: translateY(0);
  }
`;

const TradeImage = styled.img`
  width: 100%;
  max-width: 200px;
  height: auto;
  border-radius: 8px;
  margin-top: 12px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  cursor: pointer;
  transition: transform 0.2s ease;
  
  &:hover {
    transform: scale(1.02);
  }
`;

const TradeImageContainer = styled.div`
  margin-top: 12px;
`;

const FloatingButton = styled.button`
  position: fixed;
  bottom: 24px;
  right: 24px;
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: #00968a;
  color: white;
  border: none;
  font-size: 20px;
  cursor: pointer;
  box-shadow: 0 4px 16px rgba(0, 150, 138, 0.3);
  transition: all 0.3s ease;
  z-index: 1000;
  
  &:hover {
    background: #007a6e;
    transform: scale(1.1);
    box-shadow: 0 6px 20px rgba(0, 150, 138, 0.4);
  }
`;

const EducatorProfile = ({ educator, onBack, isSubscribed, onSubscribe }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [showTradingForm, setShowTradingForm] = useState(false);
  const [editingTrade, setEditingTrade] = useState(null);
  
  // Usar Firebase para manejar trades y estadísticas
  const { 
    trades: educatorTrades, 
    loading, 
    error, 
    stats: calculatedStats, 
    addTrade,
    editTrade,
    removeTrade
  } = useEducatorTrades(educator.id);

  // Obtener contador de suscriptores en tiempo real
  const { count: subscriberCount, loading: subscriberLoading } = useSubscriberCount(educator.id);

  const getInitials = (name) => {
    return name.split(' ').map(word => word[0]).join('').toUpperCase();
  };

  const handleNewTrade = async (tradeData) => {
    try {
      // Crear el trade en Firebase - siempre como "Open" inicialmente
      await addTrade({
        instrument: tradeData.instrument,
        direction: tradeData.direction,
        entryPrice: tradeData.entryPrice,
        exitPrice: null, // Siempre null al crear
        date: tradeData.tradeDate || new Date().toISOString(),
        result: 'Pendiente', // Siempre pendiente al crear
        reason: tradeData.reason,
        imageUrl: tradeData.imageUrl || null,
        status: 'Open', // Siempre Open al crear
        educatorName: educator.name
      });
      
      console.log('Nuevo trade agregado exitosamente');
      setShowTradingForm(false);
    } catch (error) {
      console.error('Error al agregar el trade:', error);
      // Aquí podrías mostrar un mensaje de error al usuario
    }
  };

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigate(-1);
    }
  };

  const handleEditTrade = (trade) => {
    setEditingTrade(trade);
  };

  const handleSaveTrade = async (tradeId, updateData) => {
    try {
      await editTrade(tradeId, updateData);
      setEditingTrade(null);
      console.log('Trade actualizado exitosamente');
    } catch (error) {
      console.error('Error al actualizar el trade:', error);
      alert('Error al actualizar el trade');
    }
  };

  const handleDeleteTrade = async (tradeId) => {
    // Confirmar eliminación
    if (window.confirm(t('markups.confirmDeleteTrade', '¿Estás seguro de que quieres eliminar este trade?'))) {
      try {
        await removeTrade(tradeId);
        console.log('Trade eliminado exitosamente');
      } catch (error) {
        console.error('Error al eliminar el trade:', error);
        alert(t('markups.errorDeletingTrade', 'Error al eliminar el trade. Inténtalo de nuevo.'));
      }
    }
  };

  return (
    <ProfileContainer>
      <Header>
        <BackButton onClick={handleBack}>
          <FaArrowLeft />
        </BackButton>
        
        <Title>{t('markups.educatorProfile')}</Title>
        
        <div></div>
      </Header>

      <Content>
        <ProfileHeader>
          <ProfileTop>
            {educator.avatar ? (
              <ProfileAvatar 
                src={educator.avatar} 
                alt={educator.name}
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }}
              />
            ) : null}
            <AvatarPlaceholder style={{ display: educator.avatar ? 'none' : 'flex' }}>
              {getInitials(educator.name)}
            </AvatarPlaceholder>
            
            <ProfileInfo>
              <ProfileName>{educator.name}</ProfileName>
              <ProfileMarket>{educator.market}</ProfileMarket>
              <ProfileSubscribers>
                {subscriberLoading ? (
                  <span style={{ color: 'rgba(255, 255, 255, 0.6)' }}>
                    {t('markups.loadingSubscribers', 'Cargando...')}
                  </span>
                ) : (
                  <>
                    {subscriberCount.toLocaleString()} {t('markups.subscribers')}
                  </>
                )}
              </ProfileSubscribers>
              
              <SubscribeButton
                $subscribed={isSubscribed}
                onClick={onSubscribe}
              >
                {isSubscribed ? (
                  <>
                    <FaCheck />
                    {t('markups.subscribed')}
                  </>
                ) : (
                  <>
                    <FaUserPlus />
                    {t('markups.subscribe')}
                  </>
                )}
              </SubscribeButton>
            </ProfileInfo>
          </ProfileTop>
          
          <Biography>{educator.biography}</Biography>
        </ProfileHeader>

        <StatsContainer>
          <StatCard>
            <StatValue>{calculatedStats.profitability}</StatValue>
            <StatLabel>{t('markups.profitability')}</StatLabel>
          </StatCard>
          <StatCard>
            <StatValue>{calculatedStats.totalTrades.toLocaleString()}</StatValue>
            <StatLabel>{t('markups.totalTrades')}</StatLabel>
          </StatCard>
          <StatCard>
            <StatValue>{calculatedStats.winRate}</StatValue>
            <StatLabel>{t('markups.winRate')}</StatLabel>
          </StatCard>
        </StatsContainer>

        {/* Sección Agregar Trader - Solo para usuarios autorizados */}
        {currentUserCanCreateTrades() && (
        <TradesSection>
          <SectionTitle>{t('markups.addTrader')}</SectionTitle>
          <AddTraderContainer>
            <AddTraderDescription>
              {t('markups.addTraderDescription')}
            </AddTraderDescription>
            <AddTraderButton onClick={() => setShowTradingForm(true)}>
              <FaPlus />
              {t('markups.addNewTrade')}
            </AddTraderButton>
          </AddTraderContainer>
        </TradesSection>
        )}

        <TradesSection>
          <SectionTitle>{t('markups.lastTrades')}</SectionTitle>
          
          {loading ? (
            <div style={{ textAlign: 'center', padding: '20px' }}>
              <p>{t('markups.loadingTrades')}</p>
            </div>
          ) : error ? (
            <div style={{ textAlign: 'center', padding: '20px', color: '#ff4444' }}>
              <p>{t('markups.errorLoadingTrades')}: {error.message}</p>
            </div>
          ) : educatorTrades && educatorTrades.length > 0 ? (
            <TradesGrid>
              {educatorTrades.map(trade => (
                <TradeCard key={trade.id} direction={trade.direction}>
                  {currentUserCanCreateTrades() && (
                    <>
                      <DeleteButton onClick={() => handleDeleteTrade(trade.id)}>
                        <FaTrash />
                      </DeleteButton>
                  <EditButton onClick={() => handleEditTrade(trade)}>
                    <FaEdit />
                  </EditButton>
                    </>
                  )}
                  
                  <TradeHeader>
                    <TradePair>{trade.instrument || trade.pair}</TradePair>
                    <TradeDirection direction={trade.direction}>
                      {trade.direction}
                    </TradeDirection>
                  </TradeHeader>
                  
                  <TradeDetails>
                    <TradeDetail>
                      <strong>{t('markups.entryPrice')}:</strong> <span>{trade.entryPrice || trade.entry}</span>
                    </TradeDetail>
                    <TradeDetail>
                      <strong>{t('markups.exitPrice')}:</strong> <span>{trade.exitPrice || trade.exit || t('markups.pending')}</span>
                    </TradeDetail>
                    {trade.orderType && (
                      <TradeDetail>
                        <strong>{t('tradingForm.orderType')}:</strong> <span>{trade.orderType}</span>
                      </TradeDetail>
                    )}
                    <TradeDetail>
                      <strong>{t('markups.date')}:</strong> <span>{trade.date ? new Date(trade.date).toLocaleDateString() : 'N/A'}</span>
                    </TradeDetail>
                    <TradeDetail>
                      <TradeResult positive={trade.result && trade.result.includes && trade.result.includes('+')}>
                        <strong>{t('markups.result')}:</strong> {trade.result || t('markups.pending')}
                      </TradeResult>
                    </TradeDetail>
                    <TradeDetail>
                      <strong>{t('markups.status')}:</strong> <span style={{color: trade.status === 'Open' ? '#ffc107' : '#4caf50'}}>
                        {trade.status === 'Open' ? t('markups.open') : trade.status === 'Closed' ? t('markups.closed') : trade.status || t('markups.open')}
                      </span>
                    </TradeDetail>
                  </TradeDetails>
                  
                  {trade.reason && (
                    <TradeReason>"{trade.reason}"</TradeReason>
                  )}
                  
                  {trade.imageUrl && (
                    <TradeImageContainer>
                      <TradeImage 
                        src={trade.imageUrl} 
                        alt="Trade Chart"
                        onClick={() => window.open(trade.imageUrl, '_blank')}
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                    </TradeImageContainer>
                  )}
                </TradeCard>
              ))}
            </TradesGrid>
          ) : (
            <EmptyTrades>
              <h3>{t('markups.noTradesAvailable')}</h3>
              <p>{t('markups.addFirstTrade')}</p>
            </EmptyTrades>
          )}
        </TradesSection>
      </Content>

      {showTradingForm && currentUserCanCreateTrades() && (
        <TradingForm
          onSubmit={handleNewTrade}
          onClose={() => setShowTradingForm(false)}
        />
      )}
      
      {editingTrade && currentUserCanCreateTrades() && (
        <EditTradeModal
          trade={editingTrade}
          onClose={() => setEditingTrade(null)}
          onSave={handleSaveTrade}
        />
      )}
    </ProfileContainer>
  );
};

export default EducatorProfile; 