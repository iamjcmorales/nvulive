import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import styled, { css } from 'styled-components';
import { 
  MdHome, 
  MdCalendarToday, 
  MdPeople, 
  MdSchool, 
  MdOutlineNewspaper, 
  MdWork,
  MdArrowBack,
  MdQrCodeScanner,
  MdMenu,
  MdChevronLeft,
  MdShowChart
} from 'react-icons/md';
import { FaInstagram, FaTelegram, FaHome, FaGraduationCap, FaChalkboardTeacher, FaNewspaper, FaChartLine, FaQrcode, FaBook, FaCalendarAlt, FaVideo, FaMobileAlt, FaUserPlus } from 'react-icons/fa';
import SidebarItem from '../ui/SidebarItem';
import AppDownloadModal from '../ui/AppDownloadModal';
import { useTranslation } from 'react-i18next';

const SIDEBAR_WIDTH = 250;
const SIDEBAR_WIDTH_COLLAPSED = 70;

const SidebarContainer = styled.aside`
  position: fixed;
  top: 64px;
  left: 0;
  width: ${SIDEBAR_WIDTH}px;
  height: calc(100vh - 64px);
  background: rgb(0,0,0);
  box-shadow: 1px 0 3px rgba(0, 0, 0, 0.2);
  display: flex;
  flex-direction: column;
  z-index: 900;
  transition: transform 0.3s ease, width 0.3s ease;
  overflow-y: auto;

  &::after {
    content: '';
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    width: 1px;
    background: linear-gradient(to bottom, 
      rgba(0,150,136,0.2),
      rgba(0,150,136,0.1) 50%,
      rgba(0,150,136,0.05) 100%
    );
    box-shadow: 1px 0 2px rgba(0,150,136,0.1);
  }

  transform: translateX(0);
  
  ${props => props.$isCollapsed && css`
    width: ${SIDEBAR_WIDTH_COLLAPSED}px;
  `}

  @media (max-width: 991px) {
    width: ${SIDEBAR_WIDTH}px;
    transform: translateX(${props => props.$isOpen ? '0' : '-100%'});
    top: 64px;
    height: calc(100vh - 64px);
    position: fixed;
  }
`;

const CollapseButton = styled.button`
  position: absolute;
  top: 15px;
  right: 10px;
  background: none;
  border: none;
  color: rgb(0,150,136);
  font-size: 1.5rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
  transition: all 0.3s ease;
  
  &:hover {
    color: rgb(0,200,180);
  }
  
  @media (max-width: 991px) {
    display: none;
  }
`;

const MenuSection = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 10px 0;
  margin-top: 10px;
`;

const SocialSection = styled.div`
  margin-top: auto;
  padding: 20px;
  border-top: 1px solid rgb(30,30,30);
  opacity: ${props => props.$isCollapsed ? '0' : '1'};
  visibility: ${props => props.$isCollapsed ? 'hidden' : 'visible'};
  transition: opacity 0.3s ease, visibility 0.3s ease;

  @media (max-width: 991px) {
    opacity: 1;
    visibility: visible;
  }
`;

const SocialLinks = styled.ul`
  list-style: none;
  padding: 0;
  margin: 10px 0 0 0;
  display: flex;
  flex-direction: column;
  gap: 15px;
`;

const SocialLinkItem = styled.li`
  a {
    display: flex;
    align-items: center;
    gap: 12px;
    color: rgb(158,158,158);
    text-decoration: none;
    font-size: 14px;
    
    &:hover {
      color: rgb(0,150,136);
    }

    svg {
      font-size: 1.5rem;
      min-width: 24px;
    }
  }
`;

const Sidebar = ({ isOpen, isCollapsed, onClose, onToggleCollapse }) => {
  const location = useLocation();
  const { t, i18n } = useTranslation();
  const [isAppModalOpen, setIsAppModalOpen] = useState(false);
  
  const menuItems = [
    { path: '/', icon: <FaHome />, label: t('sidebar.home') },
    // { path: '/new-members', icon: <FaUserPlus />, label: t('sidebar.newMembers') },
    { path: '/academia', icon: <FaGraduationCap />, label: t('sidebar.academy') },
    { path: '/educadores', icon: <FaChalkboardTeacher />, label: t('sidebar.educators') },
    { path: '/calendario', icon: <FaCalendarAlt />, label: t('sidebar.calendar') },
    { path: '/tnt-training', icon: <FaGraduationCap />, label: t('sidebar.tntTraining') },
    // { path: '/news', icon: <FaNewspaper />, label: t('sidebar.news') },
    { path: '/markups', icon: <FaChartLine />, label: t('sidebar.markups') },
    { path: '/scanner', icon: <FaQrcode />, label: t('sidebar.scanner') },
    { path: '/trading-journal', icon: <FaBook />, label: t('sidebar.tradingJournal') },
  ];
  
  const actuallyCollapsed = isCollapsed && window.innerWidth >= 992;

  // Enlaces de Telegram según el idioma
  const telegramLink = i18n.language.startsWith('es') 
    ? 'https://t.me/+PdwdBLEt3xNkNzcx'  // Español
    : 'https://t.me/+BCoD1D3xmiU4MGEx'; // Inglés/Francés

  return (
    <SidebarContainer $isOpen={isOpen} $isCollapsed={actuallyCollapsed}>
      <CollapseButton 
        onClick={onToggleCollapse}
        style={{ position: 'absolute', top: '10px', right: '10px' }}
      >
        {actuallyCollapsed ? <MdMenu /> : <MdChevronLeft />}
      </CollapseButton>
      
      <MenuSection>
        {menuItems.map((item) => (
          <SidebarItem 
            key={item.path}
            to={item.path}
            icon={item.icon}
            label={item.label}
            isActive={location.pathname === item.path}
            isCollapsed={actuallyCollapsed}
            onClick={onClose}
          />
        ))}
      </MenuSection>
      
      <SocialSection $isCollapsed={actuallyCollapsed}>
        <SocialLinks>
          <SocialLinkItem>
            <button 
              onClick={() => setIsAppModalOpen(true)}
              style={{ 
                background: 'none', 
                border: 'none', 
                color: 'inherit', 
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                fontSize: '14px',
                width: '100%',
                padding: 0
              }}
            >
              <FaMobileAlt style={{ color: '#009688', fontSize: '1.5rem', minWidth: '24px' }} />
              <span>TNT - APP</span>
            </button>
          </SocialLinkItem>
          <SocialLinkItem>
            <a href="https://www.instagram.com/nvulive/" target="_blank" rel="noopener noreferrer">
              <FaInstagram style={{ color: '#E1306C' }} />
              <span>{t('sidebar.social.instagram')}</span>
            </a>
          </SocialLinkItem>
          <SocialLinkItem>
            <a href={telegramLink} target="_blank" rel="noopener noreferrer">
              <FaTelegram style={{ color: '#0088cc' }} />
              <span>{t('sidebar.social.telegram')}</span>
            </a>
          </SocialLinkItem>
        </SocialLinks>
      </SocialSection>
      
      <AppDownloadModal 
        isOpen={isAppModalOpen} 
        onClose={() => setIsAppModalOpen(false)} 
      />
    </SidebarContainer>
  );
};

export default Sidebar; 