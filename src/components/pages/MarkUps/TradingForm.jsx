import React, { useState } from 'react';
import styled from 'styled-components';
import { FaTimes, FaUpload, FaCalendarAlt } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';
import { storage } from '../../../firebase/config';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';

// Styled Components
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
  z-index: 2000;
  padding: 20px;
`;

const ModalContent = styled.div`
  background: #1a1f2e;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  width: 100%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
  position: relative;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.5);
`;

const ModalHeader = styled.div`
  padding: 24px 24px 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: sticky;
  top: 0;
  background: #1a1f2e;
  border-radius: 16px 16px 0 0;
`;

const ModalTitle = styled.h2`
  font-size: 22px;
  font-weight: 600;
  color: white;
  margin: 0;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 20px;
  color: rgba(255, 255, 255, 0.7);
  cursor: pointer;
  padding: 8px;
  border-radius: 50%;
  transition: all 0.2s ease;
  
  &:hover {
    background: rgba(255, 255, 255, 0.1);
    color: white;
  }
`;

const FormContent = styled.div`
  padding: 24px;
`;

const FormGroup = styled.div`
  margin-bottom: 20px;
`;

const FormRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const Label = styled.label`
  display: block;
  font-size: 14px;
  font-weight: 500;
  color: white;
  margin-bottom: 6px;
`;

const Input = styled.input`
  width: 100%;
  padding: 12px 16px;
  border: 2px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  font-size: 14px;
  background: rgba(255, 255, 255, 0.05);
  color: white;
  transition: border-color 0.2s ease;
  
  &:focus {
    outline: none;
    border-color: #00968a;
    box-shadow: 0 0 0 3px rgba(0, 150, 138, 0.2);
  }
  
  &::placeholder {
    color: rgba(255, 255, 255, 0.5);
  }
`;

const Select = styled.select`
  width: 100%;
  padding: 12px 16px;
  border: 2px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  font-size: 14px;
  background: rgba(255, 255, 255, 0.05);
  color: white;
  transition: border-color 0.2s ease;
  cursor: pointer;
  
  &:focus {
    outline: none;
    border-color: #00968a;
    box-shadow: 0 0 0 3px rgba(0, 150, 138, 0.2);
  }
  
  option {
    background: #1a1f2e;
    color: white;
  }
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 12px 16px;
  border: 2px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  font-size: 14px;
  background: rgba(255, 255, 255, 0.05);
  color: white;
  resize: vertical;
  min-height: 80px;
  font-family: inherit;
  transition: border-color 0.2s ease;
  
  &:focus {
    outline: none;
    border-color: #00968a;
    box-shadow: 0 0 0 3px rgba(0, 150, 138, 0.2);
  }
  
  &::placeholder {
    color: rgba(255, 255, 255, 0.5);
  }
`;

const FileUpload = styled.div`
  border: 2px dashed rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  padding: 20px;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s ease;
  background: rgba(255, 255, 255, 0.02);
  position: relative;
  
  &:hover {
    border-color: #00968a;
    background: rgba(0, 150, 138, 0.05);
  }
  
  input[type="file"] {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    opacity: 0;
    cursor: pointer;
  }
`;

const FileUploadText = styled.div`
  color: rgba(255, 255, 255, 0.7);
  font-size: 14px;
  
  .icon {
    font-size: 24px;
    color: #00968a;
    margin-bottom: 8px;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 12px;
  padding: 16px 24px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(0, 0, 0, 0.2);
  border-radius: 0 0 16px 16px;
  position: sticky;
  bottom: 0;
`;

const Button = styled.button`
  flex: 1;
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
`;

const CancelButton = styled(Button)`
  background: rgba(255, 255, 255, 0.05);
  color: rgba(255, 255, 255, 0.8);
  border: 1px solid rgba(255, 255, 255, 0.1);
  
  &:hover {
    background: rgba(255, 255, 255, 0.1);
    color: white;
  }
`;

const SubmitButton = styled(Button)`
  background: #00968a;
  color: white;
  
  &:hover:not(:disabled) {
    background: #007a6e;
  }
  
  &:disabled {
    background: #cccccc;
    cursor: not-allowed;
  }
`;

const ErrorMessage = styled.div`
  color: #ff6b6b;
  font-size: 12px;
  margin-top: 4px;
`;

const ImagePreviewContainer = styled.div`
  margin-top: 12px;
  position: relative;
  border-radius: 8px;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
`;

const ImagePreview = styled.img`
  width: 100%;
  max-height: 200px;
  object-fit: contain;
  display: block;
`;

const RemoveImageButton = styled.button`
  position: absolute;
  top: 8px;
  right: 8px;
  background: rgba(255, 0, 0, 0.8);
  color: white;
  border: none;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  transition: background-color 0.2s ease;
  
  &:hover {
    background: rgba(255, 0, 0, 1);
  }
`;

const ImageUploadArea = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const UploadProgress = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: rgba(0, 150, 138, 0.1);
  border: 1px solid rgba(0, 150, 138, 0.3);
  border-radius: 6px;
  font-size: 12px;
  color: #00968a;
`;

const Spinner = styled.div`
  width: 12px;
  height: 12px;
  border: 2px solid rgba(0, 150, 138, 0.3);
  border-top: 2px solid #00968a;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const TradingForm = ({ onSubmit, onClose }) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    instrument: '',
    direction: 'Buy',
    orderType: 'Market',
    entryPrice: '',
    stopLoss: '',
    reason: '',
    tradeDate: new Date().toISOString().slice(0, 16),
    image: null
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [uploadedImageUrl, setUploadedImageUrl] = useState(null);

  const instruments = [
    // Pares Mayores (Majors)
    'EUR/USD', 'GBP/USD', 'USD/JPY', 'USD/CHF', 'AUD/USD', 'USD/CAD', 'NZD/USD',
    
    // Pares Menores (Cross Currency)
    'EUR/GBP', 'EUR/JPY', 'EUR/CHF', 'EUR/AUD', 'EUR/CAD', 'EUR/NZD',
    'GBP/JPY', 'GBP/CHF', 'GBP/AUD', 'GBP/CAD', 'GBP/NZD',
    'AUD/JPY', 'AUD/CHF', 'AUD/CAD', 'AUD/NZD',
    'CAD/JPY', 'CAD/CHF', 'NZD/JPY', 'NZD/CHF', 'CHF/JPY',
    
    // Pares Exóticos
    'USD/SGD', 'USD/HKD', 'USD/NOK', 'USD/SEK', 'USD/DKK', 'USD/PLN',
    'USD/ZAR', 'USD/MXN', 'USD/TRY', 'USD/CNH', 'USD/THB',
    'EUR/NOK', 'EUR/SEK', 'EUR/DKK', 'EUR/PLN', 'EUR/HUF', 'EUR/CZK',
    'GBP/NOK', 'GBP/SEK', 'GBP/DKK', 'GBP/PLN', 'GBP/SGD',
    
    // Commodities
    'XAU/USD', 'XAG/USD', 'XPD/USD', 'XPT/USD',
    'WTI/USD', 'BRENT/USD', 'NATGAS/USD',
    
    // Criptomonedas
    'BTC/USD', 'ETH/USD', 'LTC/USD', 'XRP/USD', 'ADA/USD', 'DOT/USD',
    'BNB/USD', 'SOL/USD', 'AVAX/USD', 'MATIC/USD',
    
    // Índices
    'SPX500', 'US30', 'NAS100', 'UK100', 'GER40', 'FRA40', 'JPN225', 'AUS200',
    
    // Acciones Populares
    'AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA', 'NVDA', 'META', 'NFLX', 'SPY', 'QQQ'
  ];

  const handleInputChange = async (e) => {
    const { name, value, files } = e.target;
    
    if (name === 'image') {
      const file = files[0];
      
      if (file) {
        // Limpiar errores previos
        setErrors(prev => ({ ...prev, image: '' }));
        
        // Validar tamaño del archivo (máximo 5MB)
        if (file.size > 5 * 1024 * 1024) {
          setErrors(prev => ({ ...prev, image: 'La imagen debe ser menor a 5MB' }));
          return;
        }
        
        // Validar tipo de archivo
        if (!file.type.startsWith('image/')) {
          setErrors(prev => ({ ...prev, image: 'Solo se permiten archivos de imagen' }));
          return;
        }
        
        setFormData(prev => ({ ...prev, [name]: file }));
        
        // Crear vista previa de la imagen
        const reader = new FileReader();
        reader.onload = (e) => {
          setImagePreview(e.target.result);
        };
        reader.readAsDataURL(file);
        
        // Subir imagen automáticamente
        await uploadImage(file);
      } else {
        setFormData(prev => ({ ...prev, [name]: null }));
        setImagePreview(null);
        setUploadedImageUrl(null);
      }
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
    
    // Limpiar error del campo si existe
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const testFirebaseConnection = async () => {
    try {
      // Crear una referencia de prueba para verificar conectividad
      const testRef = ref(storage, 'test/connection-test.txt');
      const testData = new Blob(['Test connection'], { type: 'text/plain' });
      
      console.log('Probando conexión con Firebase Storage...');
      const snapshot = await uploadBytes(testRef, testData);
      console.log('✓ Conexión exitosa con Firebase Storage:', snapshot);
      
      // Limpiar archivo de prueba
      await deleteObject(testRef);
      console.log('✓ Archivo de prueba eliminado');
      
      return true;
    } catch (error) {
      console.error('✗ Error de conexión con Firebase Storage:', error);
      return false;
    }
  };

  const uploadImage = async (file) => {
    if (!file) return null;
    
    setIsUploadingImage(true);
    setErrors(prev => ({ ...prev, image: '' })); // Limpiar errores previos
    
    try {
      // Primero probar la conexión
      const isConnected = await testFirebaseConnection();
      if (!isConnected) {
        throw new Error('No se puede conectar con Firebase Storage');
      }
      
      // Crear un nombre único para el archivo
      const timestamp = Date.now();
      const randomString = Math.random().toString(36).substring(2, 15);
      const fileExtension = file.name.split('.').pop();
      const fileName = `trades/${timestamp}_${randomString}.${fileExtension}`;
      const storageRef = ref(storage, fileName);
      
      console.log('Intentando subir archivo:', fileName);
      console.log('Tamaño del archivo:', file.size, 'bytes');
      console.log('Tipo del archivo:', file.type);
      
      // Subir el archivo
      const snapshot = await uploadBytes(storageRef, file);
      console.log('Archivo subido exitosamente:', snapshot);
      
      // Obtener la URL de descarga
      const downloadURL = await getDownloadURL(snapshot.ref);
      console.log('URL de descarga obtenida:', downloadURL);
      
      setUploadedImageUrl(downloadURL);
      return downloadURL;
    } catch (error) {
      console.error('Error detallado al subir imagen:', error);
      
      // Manejar diferentes tipos de errores
      let errorMessage = 'Error al subir la imagen. ';
      
      if (error.code === 'storage/unauthorized') {
        errorMessage += 'Problema de permisos: Las reglas de Firebase Storage no permiten esta operación. Verifica las reglas de seguridad en la consola de Firebase.';
      } else if (error.code === 'storage/canceled') {
        errorMessage += 'La subida fue cancelada.';
      } else if (error.code === 'storage/quota-exceeded') {
        errorMessage += 'Se ha excedido la cuota de almacenamiento.';
      } else if (error.code === 'storage/unauthenticated') {
        errorMessage += 'Debes iniciar sesión para subir archivos.';
      } else if (error.code === 'storage/retry-limit-exceeded') {
        errorMessage += 'Se excedió el límite de reintentos.';
      } else if (error.code === 'storage/invalid-argument') {
        errorMessage += 'Argumento inválido proporcionado.';
      } else if (error.code === 'storage/no-default-bucket') {
        errorMessage += 'No hay bucket de almacenamiento configurado.';
      } else if (error.message.includes('No se puede conectar')) {
        errorMessage += 'No se puede conectar con Firebase Storage. Verifica tu conexión a internet y la configuración de Firebase.';
      } else {
        errorMessage += `Detalles: ${error.message}. Por favor contacta al soporte técnico.`;
      }
      
      setErrors(prev => ({ ...prev, image: errorMessage }));
      return null;
    } finally {
      setIsUploadingImage(false);
    }
  };

  const removeImage = async () => {
    // Si hay una imagen subida, eliminarla de Firebase Storage
    if (uploadedImageUrl) {
      try {
        // Extraer el path de la URL de Firebase Storage
        const url = new URL(uploadedImageUrl);
        const pathMatch = url.pathname.match(/\/o\/(.+)\?/);
        if (pathMatch) {
          const imagePath = decodeURIComponent(pathMatch[1]);
          const imageRef = ref(storage, imagePath);
          await deleteObject(imageRef);
          console.log('Imagen eliminada de Firebase Storage');
        }
      } catch (error) {
        console.error('Error al eliminar imagen:', error);
        // No mostrar error al usuario ya que es opcional
      }
    }
    
    setFormData(prev => ({ ...prev, image: null }));
    setImagePreview(null);
    setUploadedImageUrl(null);
    setErrors(prev => ({ ...prev, image: '' }));
    
    // Reset input file
    const fileInput = document.querySelector('input[name="image"]');
    if (fileInput) {
      fileInput.value = '';
    }
  };

  const triggerFileInput = () => {
    const fileInput = document.querySelector('input[name="image"]');
    if (fileInput) {
      fileInput.click();
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.instrument.trim()) {
      newErrors.instrument = 'El instrumento es requerido';
    }
    
    if (!formData.entryPrice) {
      newErrors.entryPrice = 'El precio de entrada es requerido';
    } else if (isNaN(formData.entryPrice) || Number(formData.entryPrice) <= 0) {
      newErrors.entryPrice = 'Ingrese un precio válido';
    }
    

    
    if (formData.stopLoss && (isNaN(formData.stopLoss) || Number(formData.stopLoss) <= 0)) {
      newErrors.stopLoss = 'Ingrese un stop loss válido';
    }
    
    if (!formData.tradeDate) {
      newErrors.tradeDate = 'La fecha es requerida';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    // No permitir envío si se está subiendo una imagen
    if (isUploadingImage) {
      setErrors(prev => ({ ...prev, image: 'Esperando a que se suba la imagen...' }));
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const tradeData = {
        ...formData,
        imageUrl: uploadedImageUrl, // Incluir URL de la imagen subida
        id: Date.now(), // ID temporal
        createdAt: new Date().toISOString()
      };
      
      // Remover el archivo de imagen del objeto (ya tenemos la URL)
      delete tradeData.image;
      
      onSubmit(tradeData);
    } catch (error) {
      console.error('Error al enviar el formulario:', error);
      setErrors(prev => ({ ...prev, general: 'Error al guardar la operación' }));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <ModalOverlay onClick={handleOverlayClick}>
      <ModalContent>
        <ModalHeader>
          <ModalTitle>{t('tradingForm.title')}</ModalTitle>
          <CloseButton onClick={onClose}>
            <FaTimes />
          </CloseButton>
        </ModalHeader>

        <form onSubmit={handleSubmit}>
          <FormContent>
            <FormRow>
              <FormGroup>
                <Label htmlFor="instrument">{t('tradingForm.instrument')}</Label>
                <Select
                  id="instrument"
                  name="instrument"
                  value={formData.instrument}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">{t('tradingForm.selectInstrument')}</option>
                  {instruments.map(instrument => (
                    <option key={instrument} value={instrument}>
                      {instrument}
                    </option>
                  ))}
                </Select>
                {errors.instrument && <ErrorMessage>{errors.instrument}</ErrorMessage>}
              </FormGroup>

              <FormGroup>
                <Label htmlFor="direction">{t('tradingForm.direction')}</Label>
                <Select
                  id="direction"
                  name="direction"
                  value={formData.direction}
                  onChange={handleInputChange}
                  required
                >
                  <option value="Buy">{t('tradingForm.buy')}</option>
                  <option value="Sell">{t('tradingForm.sell')}</option>
                </Select>
              </FormGroup>
            </FormRow>

            <FormRow>
              <FormGroup>
                <Label htmlFor="orderType">{t('tradingForm.orderType')}</Label>
                <Select
                  id="orderType"
                  name="orderType"
                  value={formData.orderType}
                  onChange={handleInputChange}
                  required
                >
                  <option value="Market">{t('tradingForm.market')}</option>
                  <option value="Buy Limit">{t('tradingForm.buyLimit')}</option>
                  <option value="Sell Limit">{t('tradingForm.sellLimit')}</option>
                  <option value="Buy Stop">{t('tradingForm.buyStop')}</option>
                  <option value="Sell Stop">{t('tradingForm.sellStop')}</option>
                </Select>
              </FormGroup>
            </FormRow>

            <FormRow>
              <FormGroup>
                <Label htmlFor="entryPrice">{t('tradingForm.entryPrice')}</Label>
                <Input
                  id="entryPrice"
                  name="entryPrice"
                  type="number"
                  step="any"
                  placeholder="0.00"
                  value={formData.entryPrice}
                  onChange={handleInputChange}
                  required
                />
                {errors.entryPrice && <ErrorMessage>{errors.entryPrice}</ErrorMessage>}
              </FormGroup>


            </FormRow>

                        <FormGroup>
              <Label htmlFor="stopLoss">{t('tradingForm.stopLoss')}</Label>
              <Input
                id="stopLoss"
                name="stopLoss"
                type="number"
                step="any"
                placeholder="0.00 (opcional)"
                value={formData.stopLoss}
                onChange={handleInputChange}
              />
              {errors.stopLoss && <ErrorMessage>{errors.stopLoss}</ErrorMessage>}
            </FormGroup>

            <FormGroup>
              <Label htmlFor="tradeDate">{t('tradingForm.dateTime')}</Label>
              <Input
                id="tradeDate"
                name="tradeDate"
                type="datetime-local"
                value={formData.tradeDate}
                onChange={handleInputChange}
                required
              />
              {errors.tradeDate && <ErrorMessage>{errors.tradeDate}</ErrorMessage>}
            </FormGroup>

            <FormGroup>
              <Label htmlFor="reason">{t('tradingForm.tradeReason')}</Label>
              <TextArea
                id="reason"
                name="reason"
                placeholder={t('tradingForm.reasonPlaceholder')}
                value={formData.reason}
                onChange={handleInputChange}
              />
            </FormGroup>

            <FormGroup>
              <Label>{t('tradingForm.attachImage')}</Label>
              <ImageUploadArea>
                <FileUpload onClick={triggerFileInput}>
                  <input
                    type="file"
                    name="image"
                    accept="image/*"
                    onChange={handleInputChange}
                    disabled={isUploadingImage}
                  />
                  <FileUploadText>
                    <div className="icon">
                      <FaUpload />
                    </div>
                    <div>
                      {isUploadingImage 
                        ? 'Subiendo imagen...' 
                        : formData.image 
                          ? formData.image.name 
                          : 'Haz clic para subir una imagen'
                      }
                    </div>
                    <div style={{ fontSize: '12px', marginTop: '4px', color: '#999' }}>
                      PNG, JPG hasta 5MB
                    </div>
                  </FileUploadText>
                </FileUpload>
                
                {isUploadingImage && (
                  <UploadProgress>
                    <Spinner />
                    Subiendo imagen...
                  </UploadProgress>
                )}
                
                {uploadedImageUrl && !isUploadingImage && (
                  <UploadProgress style={{ background: 'rgba(76, 175, 80, 0.1)', borderColor: 'rgba(76, 175, 80, 0.3)', color: '#4caf50' }}>
                    ✓ Imagen subida correctamente
                  </UploadProgress>
                )}
                
                {imagePreview && (
                  <ImagePreviewContainer>
                    <ImagePreview src={imagePreview} alt="Preview" />
                    <RemoveImageButton onClick={removeImage} type="button" disabled={isUploadingImage}>
                      ×
                    </RemoveImageButton>
                  </ImagePreviewContainer>
                )}
                
                {errors.image && <ErrorMessage>{errors.image}</ErrorMessage>}
              </ImageUploadArea>
            </FormGroup>
          </FormContent>

          {errors.general && (
            <div style={{ padding: '16px 24px' }}>
              <ErrorMessage>{errors.general}</ErrorMessage>
            </div>
          )}

          <ButtonGroup>
            <CancelButton type="button" onClick={onClose}>
              {t('tradingForm.cancel')}
            </CancelButton>
            <SubmitButton type="submit" disabled={isSubmitting || isUploadingImage}>
              {isSubmitting ? t('tradingForm.saving') : isUploadingImage ? t('tradingForm.uploading') : t('tradingForm.saveOperation')}
            </SubmitButton>
          </ButtonGroup>
        </form>
      </ModalContent>
    </ModalOverlay>
  );
};

export default TradingForm; 