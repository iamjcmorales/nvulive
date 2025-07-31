import React, { useState } from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import TradingViewWidget from './ScannerWidget';
import { db } from '../../firebase/config';
import { collection, addDoc } from 'firebase/firestore';

const PageContainer = styled.div`
  padding: 24px;
  min-height: calc(100vh - 64px);
  background: linear-gradient(135deg, #0f2027 0%, #2c5364 100%);
  position: relative;
  overflow: hidden;
`;

// Futuristic animated background layer
const FuturisticBg = styled.div`
  position: absolute;
  inset: 0;
  z-index: 0;
  pointer-events: none;
  background: radial-gradient(ellipse at 20% 30%, rgba(0,188,212,0.12) 0%, transparent 70%),
              radial-gradient(ellipse at 80% 70%, rgba(0,255,247,0.10) 0%, transparent 70%),
              linear-gradient(120deg, rgba(0,150,136,0.08) 0%, transparent 100%);
  animation: bgMove 12s linear infinite alternate;
  @keyframes bgMove {
    0% { background-position: 0% 0%, 100% 100%, 0% 100%; }
    100% { background-position: 100% 100%, 0% 0%, 100% 0%; }
  }
`;

const PageTitle = styled.h1`
  font-size: 2rem;
  font-weight: 700;
  color: rgb(255,255,255);
  margin-bottom: 10px;
`;

const ContentContainer = styled.div`
  display: flex;
  gap: 20px;
  width: 100%;

  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const SidebarContainer = styled.div`
  background-color: rgb(24,24,24);
  border-radius: 10px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  padding: 0;
  width: 160px;
  flex-shrink: 0;

  @media (max-width: 768px) {
    width: 100%;
    flex-direction: row;
    display: flex;
    justify-content: center;
    align-items: center;
    margin-bottom: 16px;
    min-height: 160px;
  }
`;

const WidgetContainer = styled.div`
  background-color: rgb(24,24,24);
  border-radius: 10px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  flex-grow: 1;
  height: calc(100vh - 150px);
  overflow: hidden;
`;

const ScannerLogosContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 32px;
  margin-top: 24px;
  @media (max-width: 768px) {
    flex-direction: row;
    gap: 32px;
    margin-top: 0;
  }
`;

const ScannerLogo = styled.img`
  width: 120px;
  height: 120px;
  object-fit: contain;
  border-radius: 16px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.15);
  background: #181818;
  cursor: pointer;
  border: 2px solid transparent;
  transition: border-color 0.2s, transform 0.2s, opacity 0.2s;
  outline: none;
  opacity: 0.6;
  &:hover, &:focus {
    border-color: #00bcd4;
    transform: scale(1.07);
    opacity: 1;
  }
  &.active {
    border-color: #00bcd4;
    box-shadow: 0 4px 16px rgba(0,188,212,0.15);
    opacity: 1;
  }
  @media (max-width: 768px) {
    width: 90px;
    height: 90px;
  }
`;

const SectionTitle = styled.h3`
  font-size: 16px;
  font-weight: 600;
  color: rgb(255,255,255);
  margin-bottom: 15px;
`;

const TabBarContainer = styled.div`
  padding: 0 24px;
  margin-bottom: 24px;
`;

const ComingSoonOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 10;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(8px) brightness(0.7);
  background: rgba(0,0,0,0.35);
  pointer-events: none;
`;

const ComingSoonText = styled.h2`
  color: #fff;
  font-size: 2.5rem;
  font-weight: 800;
  letter-spacing: 2px;
  text-shadow: 0 4px 24px #00fff7, 0 1px 8px #000;
  margin-bottom: 12px;
  background: linear-gradient(90deg, #00fff7 0%, #a259ff 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
`;

// Estilos para la sección de Early npmess
const EarlyAccessSection = styled.div`
  background: linear-gradient(135deg, rgba(24,24,24,0.9), rgba(0,188,212,0.1));
  border-radius: 12px;
  padding: 24px;
  margin-top: 24px;
  border: 1px solid rgba(0,188,212,0.2);
  text-align: center;
  backdrop-filter: blur(10px);
`;

const EarlyAccessTitle = styled.h2`
  color: #fff;
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 12px;
  background: linear-gradient(90deg, #00fff7 0%, #a259ff 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
`;

const EarlyAccessDescription = styled.p`
  color: rgba(255,255,255,0.8);
  font-size: 1rem;
  line-height: 1.5;
  margin-bottom: 20px;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
`;

const EarlyAccessButton = styled.button`
  background: linear-gradient(135deg, #00bcd4 0%, #a259ff 100%);
  color: white;
  border: none;
  border-radius: 8px;
  padding: 12px 32px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 16px rgba(0,188,212,0.3);
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(0,188,212,0.4);
  }
  
  &:active {
    transform: translateY(0);
  }
`;

// Estilos para el Modal
const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0,0,0,0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(5px);
`;

const ModalContent = styled.div`
  background: #1a1a1a;
  border-radius: 12px;
  padding: 32px;
  max-width: 800px;
  max-height: 90vh;
  width: 90%;
  border: 1px solid rgba(0,188,212,0.3);
  position: relative;
  overflow-y: auto;
`;

const CloseButton = styled.button`
  position: absolute;
  top: 12px;
  right: 12px;
  background: transparent;
  border: none;
  color: #fff;
  font-size: 24px;
  cursor: pointer;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  
  &:hover {
    background: rgba(255,255,255,0.1);
  }
`;

// Estilos para el formulario
const FormContainer = styled.div`
  width: 100%;
`;

// Estilos para el video de YouTube
const VideoSection = styled.div`
  margin-bottom: 32px;
  text-align: center;
`;

const VideoTitle = styled.h3`
  color: #00bcd4;
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: 16px;
`;

const VideoContainer = styled.div`
  position: relative;
  width: 100%;
  height: 0;
  padding-bottom: 56.25%; /* 16:9 aspect ratio */
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 16px rgba(0,0,0,0.3);
  
  iframe {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    border: none;
  }
`;

const ModalTitle = styled.h2`
  color: #fff;
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 24px;
  text-align: center;
  background: linear-gradient(90deg, #00fff7 0%, #a259ff 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
`;

const StepsContainer = styled.div`
  margin-bottom: 32px;
`;

const StepItem = styled.div`
  margin-bottom: 20px;
  padding: 16px;
  background: rgba(0,188,212,0.05);
  border-radius: 8px;
  border-left: 3px solid #00bcd4;
`;

const StepTitle = styled.h3`
  color: #00bcd4;
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: 8px;
`;

const StepDescription = styled.p`
  color: rgba(255,255,255,0.8);
  font-size: 0.9rem;
  line-height: 1.4;
  margin: 0;
`;

const FormGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-bottom: 24px;
  
  @media (max-width: 600px) {
    grid-template-columns: 1fr;
  }
`;

const FormField = styled.div`
  display: flex;
  flex-direction: column;
  
  &.full-width {
    grid-column: 1 / -1;
  }
`;

const FormLabel = styled.label`
  color: #fff;
  font-size: 0.9rem;
  font-weight: 500;
  margin-bottom: 8px;
`;

const FormInput = styled.input`
  background: rgba(255,255,255,0.05);
  border: 1px solid rgba(0,188,212,0.3);
  border-radius: 6px;
  padding: 12px;
  color: #fff;
  font-size: 0.9rem;
  transition: border-color 0.3s ease;
  
  &:focus {
    outline: none;
    border-color: #00bcd4;
    box-shadow: 0 0 0 2px rgba(0,188,212,0.2);
  }
  
  &::placeholder {
    color: rgba(255,255,255,0.4);
  }
  
  &.error {
    border-color: #ff5722;
  }
`;

const ErrorMessage = styled.span`
  color: #ff5722;
  font-size: 0.8rem;
  margin-top: 4px;
`;

const SubmitButton = styled.button`
  background: linear-gradient(135deg, #00bcd4 0%, #a259ff 100%);
  color: white;
  border: none;
  border-radius: 8px;
  padding: 14px 32px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  width: 100%;
  box-shadow: 0 4px 16px rgba(0,188,212,0.3);
  
  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(0,188,212,0.4);
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const SuccessMessage = styled.div`
  background: rgba(76,175,80,0.1);
  border: 1px solid #4caf50;
  border-radius: 8px;
  padding: 16px;
  color: #4caf50;
  text-align: center;
  margin-top: 16px;
`;

const ErrorMessageContainer = styled.div`
  background: rgba(244,67,54,0.1);
  border: 1px solid #f44336;
  border-radius: 8px;
  padding: 16px;
  color: #f44336;
  text-align: center;
  margin-top: 16px;
`;

const scannerLogos = [
  {
    key: 'gold',
    src: '/images/scanner/Helios.png',
    alt: 'Helios Scanner',
    label: 'Helios'
  },
  {
    key: 'abi',
    src: '/images/scanner/Cronos.png',
    alt: 'Cronos Scanner',
    label: 'Cronos'
  },
  {
    key: 'pops',
    src: '/images/scanner/olympus.png',
    alt: 'Olympus Scanner',
    label: 'Olympus'
  }
];

const Scanner = () => {
  const { t } = useTranslation();
  const [activeScanner, setActiveScanner] = useState('gold');
  const [showModal, setShowModal] = useState(false);
  const [scannerType, setScannerType] = useState(''); // Nuevo estado para tipo de scanner
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    nvisionId: '',
    tradingViewUsername: ''
  });
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null); // 'success', 'error', null

  const handleScannerChange = (scanner) => {
    setActiveScanner(scanner);
  };

  const handleEarlyAccessClick = (type) => {
    setScannerType(type);
    setShowModal(true);
    setSubmitStatus(null);
    setFormErrors({});
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setScannerType('');
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      nvisionId: '',
      tradingViewUsername: ''
    });
    setFormErrors({});
    setSubmitStatus(null);
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Limpiar error del campo cuando el usuario empiece a escribir
    if (formErrors[field]) {
      setFormErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const validateForm = () => {
    const errors = {};
    
    if (!formData.firstName.trim()) {
      errors.firstName = t('scanner.earlyAccess.modal.form.requiredField');
    }
    
    if (!formData.lastName.trim()) {
      errors.lastName = t('scanner.earlyAccess.modal.form.requiredField');
    }
    
    if (!formData.email.trim()) {
      errors.email = t('scanner.earlyAccess.modal.form.requiredField');
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = t('scanner.earlyAccess.modal.form.emailInvalid');
    }
    
    if (!formData.nvisionId.trim()) {
      errors.nvisionId = t('scanner.earlyAccess.modal.form.requiredField');
    }
    
    if (!formData.tradingViewUsername.trim()) {
      errors.tradingViewUsername = t('scanner.earlyAccess.modal.form.requiredField');
    }
    
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    
    setIsSubmitting(true);
    setSubmitStatus(null);
    
    try {
      await addDoc(collection(db, 'scannerForm'), {
        ...formData,
        scannerType: scannerType, // Agregar el tipo de scanner
        timestamp: new Date(),
        status: 'pending'
      });
      
      setSubmitStatus('success');
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        nvisionId: '',
        tradingViewUsername: ''
      });
    } catch (error) {
      console.error('Error submitting form:', error);
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <PageContainer>
      <FuturisticBg />
      <PageTitle>{t('sidebar.scanner')}</PageTitle>
      
      <ContentContainer>
        <SidebarContainer>
          <ScannerLogosContainer>
            {scannerLogos.map(scanner => (
              <div key={scanner.key} style={{display:'flex',flexDirection:'column',alignItems:'center'}}>
                <ScannerLogo
                  src={scanner.src}
                  alt={scanner.alt}
                  className={activeScanner === scanner.key ? 'active' : ''}
                  tabIndex={0}
                  onClick={() => handleScannerChange(scanner.key)}
                  onKeyPress={e => { if (e.key === 'Enter') handleScannerChange(scanner.key); }}
                />
                <span style={{color:'#fff',marginTop:8,fontSize:15,fontWeight:500}}>{scanner.label}</span>
              </div>
            ))}
          </ScannerLogosContainer>
        </SidebarContainer>
        
        <WidgetContainer style={{position:'relative'}}>
          <ComingSoonOverlay>
            <ComingSoonText>Coming Soon</ComingSoonText>
          </ComingSoonOverlay>
          <TradingViewWidget scannerType={activeScanner} />
        </WidgetContainer>
      </ContentContainer>

      {/* Sección de Early Access */}
      <EarlyAccessSection>
        <EarlyAccessTitle>{t('scanner.earlyAccess.title')}</EarlyAccessTitle>
        <EarlyAccessDescription>{t('scanner.earlyAccess.description')}</EarlyAccessDescription>
        
        {/* Contenedor para los dos botones */}
        <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <EarlyAccessButton onClick={() => handleEarlyAccessClick('Olympus')}>
            {t('scanner.earlyAccess.olympusButton')}
          </EarlyAccessButton>
          <EarlyAccessButton onClick={() => handleEarlyAccessClick('Skywalker')}>
            {t('scanner.earlyAccess.skywalkerButton')}
          </EarlyAccessButton>
        </div>
      </EarlyAccessSection>

      {/* Modal */}
      {showModal && (
        <ModalOverlay onClick={handleCloseModal}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <CloseButton onClick={handleCloseModal}>×</CloseButton>
            <FormContainer>
              <ModalTitle>
                {scannerType === 'Olympus' 
                  ? t('scanner.earlyAccess.modal.title') 
                  : t('scanner.earlyAccess.skywalker.title')
                }
              </ModalTitle>
              
              {/* Video de YouTube */}
              <VideoSection>
                <VideoTitle>{t('scanner.earlyAccess.modal.videoTitle')}</VideoTitle>
                <VideoContainer>
                  <iframe
                    src="https://www.youtube.com/embed/bDcJLUZajcU"
                    title="How to Create a TradingView Account"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                  />
                </VideoContainer>
              </VideoSection>
              
              {/* Steps */}
              <StepsContainer>
                <StepItem>
                  <StepTitle>
                    {scannerType === 'Olympus' 
                      ? t('scanner.earlyAccess.modal.step1.title') 
                      : t('scanner.earlyAccess.skywalker.step1.title')
                    }
                  </StepTitle>
                  <StepDescription>
                    {scannerType === 'Olympus' 
                      ? t('scanner.earlyAccess.modal.step1.description') 
                      : t('scanner.earlyAccess.skywalker.step1.description')
                    }
                  </StepDescription>
                </StepItem>
                
                <StepItem>
                  <StepTitle>
                    {scannerType === 'Olympus' 
                      ? t('scanner.earlyAccess.modal.step2.title') 
                      : t('scanner.earlyAccess.skywalker.step2.title')
                    }
                  </StepTitle>
                  <StepDescription>
                    {scannerType === 'Olympus' 
                      ? t('scanner.earlyAccess.modal.step2.description') 
                      : t('scanner.earlyAccess.skywalker.step2.description')
                    }
                  </StepDescription>
                </StepItem>
                
                <StepItem>
                  <StepTitle>
                    {scannerType === 'Olympus' 
                      ? t('scanner.earlyAccess.modal.step3.title') 
                      : t('scanner.earlyAccess.skywalker.step3.title')
                    }
                  </StepTitle>
                  <StepDescription>
                    {scannerType === 'Olympus' 
                      ? t('scanner.earlyAccess.modal.step3.description') 
                      : t('scanner.earlyAccess.skywalker.step3.description')
                    }
                  </StepDescription>
                </StepItem>
                
                <StepItem>
                  <StepTitle>
                    {scannerType === 'Olympus' 
                      ? t('scanner.earlyAccess.modal.step4.title') 
                      : t('scanner.earlyAccess.skywalker.step4.title')
                    }
                  </StepTitle>
                  <StepDescription>
                    {scannerType === 'Olympus' 
                      ? t('scanner.earlyAccess.modal.step4.description') 
                      : t('scanner.earlyAccess.skywalker.step4.description')
                    }
                  </StepDescription>
                </StepItem>
              </StepsContainer>

              {/* Form */}
              <form onSubmit={handleSubmit}>
                {/* Mostrar tipo de scanner seleccionado */}
                <div style={{ 
                  background: 'rgba(0,188,212,0.1)', 
                  border: '1px solid rgba(0,188,212,0.3)', 
                  borderRadius: '8px', 
                  padding: '12px', 
                  marginBottom: '24px',
                  textAlign: 'center'
                }}>
                  <span style={{ color: '#00bcd4', fontWeight: '600' }}>
                    {t('scanner.earlyAccess.modal.form.requestFor')} Scanner {scannerType}
                  </span>
                </div>

                <FormGrid>
                  <FormField>
                    <FormLabel>{t('scanner.earlyAccess.modal.form.firstName')} *</FormLabel>
                    <FormInput
                      type="text"
                      value={formData.firstName}
                      onChange={(e) => handleInputChange('firstName', e.target.value)}
                      className={formErrors.firstName ? 'error' : ''}
                      disabled={isSubmitting}
                    />
                    {formErrors.firstName && <ErrorMessage>{formErrors.firstName}</ErrorMessage>}
                  </FormField>

                  <FormField>
                    <FormLabel>{t('scanner.earlyAccess.modal.form.lastName')} *</FormLabel>
                    <FormInput
                      type="text"
                      value={formData.lastName}
                      onChange={(e) => handleInputChange('lastName', e.target.value)}
                      className={formErrors.lastName ? 'error' : ''}
                      disabled={isSubmitting}
                    />
                    {formErrors.lastName && <ErrorMessage>{formErrors.lastName}</ErrorMessage>}
                  </FormField>

                  <FormField className="full-width">
                    <FormLabel>{t('scanner.earlyAccess.modal.form.email')} *</FormLabel>
                    <FormInput
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className={formErrors.email ? 'error' : ''}
                      disabled={isSubmitting}
                    />
                    {formErrors.email && <ErrorMessage>{formErrors.email}</ErrorMessage>}
                  </FormField>

                  <FormField>
                    <FormLabel>{t('scanner.earlyAccess.modal.form.nvisionId')} *</FormLabel>
                    <FormInput
                      type="text"
                      value={formData.nvisionId}
                      onChange={(e) => handleInputChange('nvisionId', e.target.value)}
                      className={formErrors.nvisionId ? 'error' : ''}
                      disabled={isSubmitting}
                    />
                    {formErrors.nvisionId && <ErrorMessage>{formErrors.nvisionId}</ErrorMessage>}
                  </FormField>

                  <FormField>
                    <FormLabel>{t('scanner.earlyAccess.modal.form.tradingViewUsername')} *</FormLabel>
                    <FormInput
                      type="text"
                      value={formData.tradingViewUsername}
                      onChange={(e) => handleInputChange('tradingViewUsername', e.target.value)}
                      className={formErrors.tradingViewUsername ? 'error' : ''}
                      disabled={isSubmitting}
                    />
                    {formErrors.tradingViewUsername && <ErrorMessage>{formErrors.tradingViewUsername}</ErrorMessage>}
                  </FormField>
                </FormGrid>

                <SubmitButton type="submit" disabled={isSubmitting}>
                  {isSubmitting ? t('scanner.earlyAccess.modal.form.submitting') : t('scanner.earlyAccess.modal.form.submitButton')}
                </SubmitButton>

                {submitStatus === 'success' && (
                  <SuccessMessage>
                    {t('scanner.earlyAccess.modal.form.successMessage')}
                  </SuccessMessage>
                )}

                {submitStatus === 'error' && (
                  <ErrorMessageContainer>
                    {t('scanner.earlyAccess.modal.form.errorMessage')}
                  </ErrorMessageContainer>
                )}
              </form>
            </FormContainer>
          </ModalContent>
        </ModalOverlay>
      )}
    </PageContainer>
  );
};

export default Scanner; 