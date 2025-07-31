import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { FaBell, FaBars } from 'react-icons/fa';
import { MdKeyboardArrowDown, MdClose } from 'react-icons/md';
import { useTranslation } from 'react-i18next';

const HEADER_HEIGHT = '64px';

const HeaderContainer = styled.header`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: ${HEADER_HEIGHT};
  background-color: rgb(0,0,0);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  z-index: 1000;
  box-shadow: 0 1px 0 rgba(0,150,136,0.2);
  
  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 1px;
    background: linear-gradient(to right, 
      rgba(0,150,136,0.2),
      rgba(0,150,136,0.1) 50%,
      rgba(0,150,136,0.05) 100%
    );
    box-shadow: 0 1px 2px rgba(0,150,136,0.1);
  }

  @media (max-width: 768px) {
    padding: 0 16px;
  }
`;

const MenuToggle = styled.button`
  display: none;
  background: none;
  border: none;
  font-size: 1.5rem;
  color: rgb(0,150,136); /* Cian */
  cursor: pointer;
  padding: 0.5rem;
  margin-right: 0.5rem;

  @media (max-width: 992px) {
    display: block;
  }
`;

const Logo = styled.div`
  a {
    display: block;
  }
  img {
    height: 40px;
    display: block;
    filter: brightness(0) invert(1); /* Logo blanco si es posible */
  }
  @media (max-width: 768px) {
    img { height: 35px; }
  }
`;

const RightSection = styled.div`
  display: flex;
  align-items: center;
  gap: 1.2rem;
  @media (max-width: 768px) {
    gap: 0.8rem;
  }
`;

const UserDropdownContainer = styled.div`
  position: relative;
`;

const UserDropdownMenu = styled.div`
  position: absolute;
  top: 110%;
  right: 0;
  background: rgb(30,30,30);
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.25);
  padding: 8px 0;
  z-index: 30;
  min-width: 150px;
`;

const UserDropdownItem = styled.div`
  padding: 10px 20px;
  font-size: 15px;
  cursor: pointer;
  color: #fff;
  transition: background 0.18s, color 0.18s;
  &:hover {
    background: rgb(0,150,136,0.18);
    color: #00bcd4;
  }
`;

const UserProfile = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  position: relative;
  padding: 4px;
  border-radius: 6px;
  transition: background-color 0.2s ease;

  &:hover {
    background-color: rgb(0,150,136,0.1); /* Sutil cian */
  }
`;

const UserInfo = styled.div`
  font-size: 0.85rem;
  color: rgb(255,255,255);
`;

const UserName = styled.div`
  font-weight: 500;
  color: rgb(255,255,255);
`;

const UserEmail = styled.div`
  color: rgb(158,158,158);
  font-size: 0.75rem;
`;

const LanguageSelectorContainer = styled.div`
  position: relative;
`;

const LanguageSelector = styled.div`
  display: flex;
  align-items: center;
  font-weight: 600;
  cursor: pointer;
  user-select: none;
  color: rgb(255,255,255);
  border: 1px solid rgb(0,255,247);
  border-radius: 8px;
  padding: 8px 18px;
  background: rgb(18,18,18);
  transition: border-color 0.2s;
  font-size: 1rem;
  &:hover {
    border-color: rgb(0,150,136);
  }
`;

const LanguageDropdown = styled.div`
  position: absolute;
  top: 100%;
  right: 0;
  background: rgb(30,30,30); /* Fondo oscuro */
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.25);
  padding: 8px 0;
  margin-top: 4px;
  z-index: 20;
  min-width: 100px;
`;

const DropdownItem = styled.div`
  padding: 8px 16px;
  font-size: 14px;
  cursor: pointer;
  color: rgb(255,255,255);
  &:hover {
    background-color: rgb(0,150,136,0.2);
    color: rgb(0,150,136);
  }
`;

const Header = ({ onToggleSidebar, isSidebarOpen }) => {
  const { i18n, t } = useTranslation();
  const [isLangDropdownOpen, setIsLangDropdownOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const langDropdownRef = useRef(null);
  const userDropdownRef = useRef(null);
  const navigate = useNavigate();
  
  const [userData, setUserData] = useState({ name: 'Usuario', id: '' });

  useEffect(() => {
    const storedData = localStorage.getItem('nvuUserData');
    if (storedData) {
      try {
        setUserData(JSON.parse(storedData));
      } catch (error) {
        console.error("Error parsing user data from localStorage:", error);
        localStorage.removeItem('nvuUserData');
      }
    }
  }, []);

  const handleLanguageSelect = (langCode) => {
    i18n.changeLanguage(langCode);
    setIsLangDropdownOpen(false);
  };

  const handleProfileClick = () => {
    navigate('/perfil');
    setIsUserDropdownOpen(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('nvuUserData');
    navigate('/login');
  };

  useEffect(() => {
    function handleClickOutside(event) {
      if (langDropdownRef.current && !langDropdownRef.current.contains(event.target)) {
        setIsLangDropdownOpen(false);
      }
      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target)) {
        setIsUserDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [langDropdownRef, userDropdownRef]);

  const languageLabels = {
    es: t('calendar.filterSpanish', 'Español'),
    en: t('calendar.filterEnglish', 'Inglés'), 
    fr: t('calendar.filterFrench', 'Francés')
  };
  const currentLanguageLabel = languageLabels[i18n.language.split('-')[0]] || 'Idioma';

  return (
    <HeaderContainer>
      <MenuToggle onClick={onToggleSidebar}>
        {isSidebarOpen ? <MdClose /> : <FaBars />}
      </MenuToggle>
      
      <Logo>
        <Link to="/">
          <img src="/logo%20login.png" alt="NVU Logo" />
        </Link>
      </Logo>
      
      <RightSection>
        <UserDropdownContainer ref={userDropdownRef}>
          <UserProfile onClick={() => setIsUserDropdownOpen(v => !v)}>
            <UserInfo>
              <UserName>{userData.name}</UserName>
              {userData.email && <UserEmail>{userData.email}</UserEmail>}
            </UserInfo>
          </UserProfile>
          {isUserDropdownOpen && (
            <UserDropdownMenu>
              <UserDropdownItem onClick={handleProfileClick}>{t('profile.title')}</UserDropdownItem>
              <UserDropdownItem onClick={handleLogout}>{t('profile.logoutButton')}</UserDropdownItem>
            </UserDropdownMenu>
          )}
        </UserDropdownContainer>
        
        <LanguageSelectorContainer ref={langDropdownRef}>
          <LanguageSelector onClick={() => setIsLangDropdownOpen(!isLangDropdownOpen)}>
            {currentLanguageLabel} <MdKeyboardArrowDown />
          </LanguageSelector>
          {isLangDropdownOpen && (
            <LanguageDropdown>
              <DropdownItem onClick={() => handleLanguageSelect('es')}>{t('calendar.filterSpanish', 'Español')}</DropdownItem>
              <DropdownItem onClick={() => handleLanguageSelect('en')}>{t('calendar.filterEnglish', 'Inglés')}</DropdownItem>
              <DropdownItem onClick={() => handleLanguageSelect('fr')}>{t('calendar.filterFrench', 'Francés')}</DropdownItem>
            </LanguageDropdown>
          )}
        </LanguageSelectorContainer>
      </RightSection>
    </HeaderContainer>
  );
};

export default Header;