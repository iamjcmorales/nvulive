import React, { useState } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import i18n from '../../i18n';
import LoginScanlinesBackground from './LoginScanlinesBackground';

// --- Styled Components ---

const LoginRow = styled.div`
  display: flex;
  min-height: 100vh;
  @media (max-width: 900px) {
    flex-direction: column;
  }
`;

const LeftCol = styled.div`
  flex: 1.2;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
  min-width: 320px;
  background: linear-gradient(120deg, #00fff7 0%, #00bcd4 50%, #000 100%);
  animation: gradientMove 8s ease-in-out infinite alternate;

  @keyframes gradientMove {
    0% { background-position: 0% 50%; }
    100% { background-position: 100% 50%; }
  }
`;

const LogoContainer = styled.div`
  width: 320px;
  height: 320px;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
`;

const Slogan = styled.h2`
  color: #fff;
  font-size: 2rem;
  font-weight: 600;
  text-align: center;
  margin-bottom: 0;
  z-index: 2;
  text-shadow: 0 2px 16px rgba(0,0,0,0.18);
`;

const RightCol = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgb(0,0,0);
  min-width: 320px;
`;

const LoginFormCard = styled.div`
  padding: 40px 32px 32px 32px;
  background: rgb(18,18,18);
  border-radius: 18px;
  box-shadow: 0 6px 32px rgba(0,255,255,0.08);
  width: 100%;
  max-width: 400px;
  text-align: center;
  position: relative;
  z-index: 1;
  border: 1.5px solid rgba(0,255,255,0.10);
`;

const Title = styled.h1`
  margin-bottom: 30px;
  color: #fff;
  font-size: 2rem;
  font-weight: 700;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const Input = styled.input`
  padding: 15px;
  border: 1.5px solid rgb(40,40,40);
  border-radius: 10px;
  font-size: 16px;
  color: #fff;
  background: rgb(24,24,24);
  outline: none;
  transition: border-color 0.2s;

  &:focus {
    border-color: #00fff7;
  }
`;

const Button = styled.button`
  padding: 15px;
  border: none;
  border-radius: 10px;
  background: linear-gradient(90deg, #00fff7 0%, #00bcd4 100%);
  color: #000;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  transition: background 0.2s;

  &:hover {
    background: linear-gradient(90deg, #00e6e0 0%, #00acc1 100%);
  }

  &:disabled {
    background: rgb(40,40,40);
    color: rgb(158,158,158);
    cursor: not-allowed;
  }
`;

const ErrorMessage = styled.p`
  color: #ff5252;
  margin-top: 15px;
  font-size: 14px;
`;

const ResetLink = styled.p`
  margin-top: 20px;
  font-size: 14px;
  color: #aaa;
  a {
    color: #00fff7;
    text-decoration: none;
    &:hover {
      text-decoration: underline;
    }
  }
`;

const LanguageSelector = styled.select`
  margin-top: 32px;
  padding: 10px 16px;
  border-radius: 8px;
  border: 1.5px solid rgb(40,40,40);
  background: rgb(24,24,24);
  color: #fff;
  font-size: 15px;
  outline: none;
  transition: border-color 0.2s;
  width: 100%;
  max-width: 220px;
  align-self: center;
  &:focus {
    border-color: #00fff7;
  }
`;

// --- Component ---

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');

    const api_url = 'https://trading-middleware.nvu-dev.com/api/user-login-api';
    const body_data = { 
      EmailAddress: email, 
      Password: password 
    };

    try {
      const response = await fetch(api_url, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'AccessToken': 'aiTsv5jjy3XdbmM9fRalWP5oOcJbLPpXPFdEmu6kG7H7JHAFAxXtixlMKpORo307'
        },
        body: JSON.stringify(body_data),
      });

      const data = await response.json();

      if (response.ok && data?.status === true) {
        console.log('Login successful:', data);
        
        // Guardar datos del usuario con la nueva estructura
        const userData = {
          name: data.Name,
          id: data.CustomerId,
          email: data.Email,
          replicateSite: data.ReplicateSite,
          services: data.Services || []
        };
        
        localStorage.setItem('nvuUserData', JSON.stringify(userData));
        localStorage.setItem('userName', data.Name);
        navigate('/'); 
      } else {
        const apiErrorMessage = data?.Message || 'Invalid credentials or login failed.';
        console.error('Login failed:', apiErrorMessage, data);
        let translatedError = t('login.error.generic');
        if (apiErrorMessage.includes('Invalid credentials') || apiErrorMessage.includes('login failed')) {
          translatedError = t('login.error.invalidCredentials');
        }
        setError(translatedError);
      }
    } catch (err) {
      console.error('API connection error:', err);
      setError(t('login.error.connection'));
    } finally {
      setLoading(false);
    }
  };

  const handleLanguageChange = (e) => {
    i18n.changeLanguage(e.target.value);
  };

  return (
    <>
      <LoginRow>
        <LeftCol>
          <LoginScanlinesBackground />
          <LogoContainer style={{zIndex: 1, position: 'relative'}}>
            <img src="/logo%20login.png" alt="NVU Login Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
          </LogoContainer>
        </LeftCol>
        <RightCol>
          <LoginFormCard>
            <Title>{t('login.title')}</Title>
            <Form onSubmit={handleSubmit}>
              <Input
                type="email"
                placeholder={t('login.emailPlaceholder')}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
              <Input
                type="password"
                placeholder={t('login.passwordPlaceholder')}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
              <Button type="submit" disabled={loading}>
                {loading ? t('login.loadingButton') : t('login.loginButton')}
              </Button>
              {error && <ErrorMessage>{error}</ErrorMessage>}
            </Form>
            <ResetLink>
              {t('login.resetPasswordPrompt')} <a href="https://nvisionu.com/en-us/forgot-password" target="_blank" rel="noopener noreferrer">{t('login.resetPasswordLink')}</a>
            </ResetLink>
            <LanguageSelector value={i18n.language} onChange={handleLanguageChange}>
              <option value="es">Español</option>
              <option value="en">English</option>
              <option value="fr">Français</option>
            </LanguageSelector>
          </LoginFormCard>
        </RightCol>
      </LoginRow>
    </>
  );
};

export default LoginPage; 