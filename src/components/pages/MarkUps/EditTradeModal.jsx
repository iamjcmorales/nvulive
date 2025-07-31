import React, { useState } from 'react';
import styled from 'styled-components';
import { FaTimes, FaCheck } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';

// Styled Components
const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
`;

const ModalContent = styled.div`
  background: #1a1f2e;
  border-radius: 16px;
  padding: 30px;
  width: 100%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
  border: 1px solid rgba(0, 150, 138, 0.3);
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
`;

const ModalTitle = styled.h2`
  color: white;
  font-size: 24px;
  font-weight: 600;
  margin: 0;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.7);
  font-size: 20px;
  cursor: pointer;
  padding: 8px;
  border-radius: 8px;
  transition: all 0.2s ease;
  
  &:hover {
    color: white;
    background: rgba(255, 255, 255, 0.1);
  }
`;

const TradeInfo = styled.div`
  background: rgba(0, 150, 138, 0.1);
  border: 1px solid rgba(0, 150, 138, 0.3);
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 24px;
`;

const InfoRow = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 12px;
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const InfoLabel = styled.span`
  color: rgba(255, 255, 255, 0.7);
  font-weight: 500;
`;

const InfoValue = styled.span`
  color: white;
  font-weight: 600;
`;

const FormGroup = styled.div`
  margin-bottom: 20px;
`;

const Label = styled.label`
  display: block;
  color: rgba(255, 255, 255, 0.9);
  font-weight: 500;
  margin-bottom: 8px;
  font-size: 14px;
`;

const Input = styled.input`
  width: 100%;
  padding: 12px 16px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  color: white;
  font-size: 16px;
  transition: all 0.2s ease;
  
  &:focus {
    outline: none;
    border-color: #00968a;
    background: rgba(255, 255, 255, 0.1);
  }
  
  &::placeholder {
    color: rgba(255, 255, 255, 0.5);
  }
`;

const Select = styled.select`
  width: 100%;
  padding: 12px 16px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  color: white;
  font-size: 16px;
  transition: all 0.2s ease;
  
  &:focus {
    outline: none;
    border-color: #00968a;
    background: rgba(255, 255, 255, 0.1);
  }
  
  option {
    background: #1a1f2e;
    color: white;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 12px;
  margin-top: 30px;
`;

const Button = styled.button`
  flex: 1;
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  
  ${props => props.$primary ? `
    background: #00968a;
    color: white;
    border: 1px solid #00968a;
    
    &:hover {
      background: #007a6e;
      border-color: #007a6e;
    }
  ` : `
    background: transparent;
    color: rgba(255, 255, 255, 0.7);
    border: 1px solid rgba(255, 255, 255, 0.3);
    
    &:hover {
      color: white;
      border-color: rgba(255, 255, 255, 0.5);
      background: rgba(255, 255, 255, 0.05);
    }
  `}
`;

const StatusBadge = styled.span`
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  
  ${props => props.$status === 'Open' ? `
    background: rgba(255, 193, 7, 0.2);
    color: #ffc107;
    border: 1px solid rgba(255, 193, 7, 0.3);
  ` : `
    background: rgba(76, 175, 80, 0.2);
    color: #4caf50;
    border: 1px solid rgba(76, 175, 80, 0.3);
  `}
`;

const EditTradeModal = ({ trade, onClose, onSave }) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    exitPrice: trade.exitPrice || '',
    result: trade.result === 'Pendiente' || trade.result === 'Pending' || trade.result === 'En attente' ? '' : trade.result,
    status: trade.status || 'Open',
    orderType: trade.orderType || 'Market'
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validar que si está cerrado, tenga precio de salida
    if (formData.status === 'Closed' && !formData.exitPrice) {
      alert(t('markups.exitPriceRequired'));
      return;
    }

    // Calcular resultado automáticamente si se proporciona exit price
    let finalResult = formData.result;
    if (formData.exitPrice && trade.entryPrice) {
      const entry = parseFloat(trade.entryPrice);
      const exit = parseFloat(formData.exitPrice);
      const diff = trade.direction === 'Buy' ? exit - entry : entry - exit;
      const pips = Math.round(diff * (trade.instrument.includes('/') ? 10000 : 100));
      finalResult = `${pips > 0 ? '+' : ''}${pips} pips`;
    }

    onSave(trade.id, {
      exitPrice: formData.exitPrice || null,
      result: finalResult || t('markups.pending'),
      status: formData.status,
      orderType: formData.orderType
    });
  };

  return (
    <ModalOverlay onClick={onClose}>
      <ModalContent onClick={(e) => e.stopPropagation()}>
        <ModalHeader>
          <ModalTitle>{t('markups.editTrade')}</ModalTitle>
          <CloseButton onClick={onClose}>
            <FaTimes />
          </CloseButton>
        </ModalHeader>

        <TradeInfo>
          <InfoRow>
            <InfoLabel>{t('markups.instrument')}:</InfoLabel>
            <InfoValue>{trade.instrument}</InfoValue>
          </InfoRow>
          <InfoRow>
            <InfoLabel>{t('markups.direction')}:</InfoLabel>
            <InfoValue>{trade.direction}</InfoValue>
          </InfoRow>
          <InfoRow>
            <InfoLabel>{t('markups.entryPrice')}:</InfoLabel>
            <InfoValue>{trade.entryPrice}</InfoValue>
          </InfoRow>
          {trade.orderType && (
            <InfoRow>
              <InfoLabel>{t('tradingForm.orderType')}:</InfoLabel>
              <InfoValue>{trade.orderType}</InfoValue>
            </InfoRow>
          )}
          <InfoRow>
            <InfoLabel>{t('markups.currentStatus')}:</InfoLabel>
            <InfoValue>
              <StatusBadge $status={trade.status}>
                {trade.status === 'Open' ? t('markups.open') : trade.status === 'Closed' ? t('markups.closed') : trade.status}
              </StatusBadge>
            </InfoValue>
          </InfoRow>
        </TradeInfo>

        <form onSubmit={handleSubmit}>
          <FormGroup>
            <Label>{t('tradingForm.orderType')}</Label>
            <Select
              name="orderType"
              value={formData.orderType}
              onChange={handleChange}
            >
              <option value="Market">{t('tradingForm.market')}</option>
              <option value="Buy Limit">{t('tradingForm.buyLimit')}</option>
              <option value="Sell Limit">{t('tradingForm.sellLimit')}</option>
              <option value="Buy Stop">{t('tradingForm.buyStop')}</option>
              <option value="Sell Stop">{t('tradingForm.sellStop')}</option>
            </Select>
          </FormGroup>

          <FormGroup>
            <Label>{t('markups.tradeStatus')}</Label>
            <Select
              name="status"
              value={formData.status}
              onChange={handleChange}
            >
              <option value="Open">{t('markups.open')}</option>
              <option value="Closed">{t('markups.closed')}</option>
            </Select>
          </FormGroup>

          {formData.status === 'Closed' && (
            <>
              <FormGroup>
                <Label>{t('markups.exitPriceLabel')}</Label>
                <Input
                  type="number"
                  name="exitPrice"
                  value={formData.exitPrice}
                  onChange={handleChange}
                  step="0.0001"
                  placeholder="Ej: 1.0890"
                  required
                />
              </FormGroup>

              <FormGroup>
                <Label>{t('markups.resultLabel')}</Label>
                <Input
                  type="text"
                  name="result"
                  value={formData.result}
                  onChange={handleChange}
                  placeholder="Ej: +34 pips"
                />
              </FormGroup>
            </>
          )}

          <ButtonGroup>
            <Button type="button" onClick={onClose}>
              {t('markups.cancel')}
            </Button>
            <Button type="submit" $primary>
              <FaCheck />
              {t('markups.saveChanges')}
            </Button>
          </ButtonGroup>
        </form>
      </ModalContent>
    </ModalOverlay>
  );
};

export default EditTradeModal; 