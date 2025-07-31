import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';

const ItemContainer = styled.div`
  position: relative;
`;

const ItemLink = styled(Link)`
  display: flex;
  align-items: center;
  padding: 15px 20px;
  color: ${(props) => (props.$isActive ? 'rgb(0,150,136)' : props.$isDisabled ? 'rgb(100,100,100)' : 'rgb(255,255,255)')};
  text-decoration: none;
  font-weight: ${(props) => (props.$isActive ? '600' : '400')};
  transition: all 0.2s ease;
  border-left: 3px solid ${(props) => (props.$isActive ? 'rgb(0,150,136)' : 'transparent')};
  background-color: ${(props) => (props.$isActive ? 'rgba(0,150,136,0.08)' : 'transparent')};
  cursor: ${(props) => (props.$isDisabled ? 'not-allowed' : 'pointer')};
  opacity: ${(props) => (props.$isDisabled ? 0.6 : 1)};
  
  &:hover {
    background-color: ${(props) => (props.$isDisabled ? 'transparent' : 'rgba(0,150,136,0.12)')};
    color: ${(props) => (props.$isDisabled ? 'rgb(100,100,100)' : 'rgb(0,150,136)')};
    border-left-color: ${(props) => (props.$isDisabled ? 'transparent' : 'rgb(0,150,136)')};
  }
`;

const DisabledOverlay = styled.div`
  display: flex;
  align-items: center;
  padding: 15px 20px;
  color: rgb(100,100,100);
  text-decoration: none;
  font-weight: 400;
  transition: all 0.2s ease;
  border-left: 3px solid transparent;
  background-color: transparent;
  cursor: not-allowed;
  opacity: 0.6;
  
  &:hover {
    background-color: rgba(100,100,100,0.08);
  }
`;

const IconWrapper = styled.div`
  margin-right: ${props => props.$isCollapsed ? '0' : '12px'};
  display: flex;
  align-items: center;
  font-size: 1.2rem;
  min-width: 24px;
  transition: margin-right 0.3s ease;
`;

const ItemLabel = styled.span`
  opacity: ${props => props.$isCollapsed ? '0' : '1'};
  transition: opacity 0.2s ease 0.1s;
  white-space: nowrap;
  color: rgb(158,158,158);
`;

const Tooltip = styled.div`
  position: absolute;
  left: ${props => props.$isCollapsed ? '70px' : '260px'};
  top: 50%;
  transform: translateY(-50%);
  background: #333;
  color: white;
  padding: 8px 12px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  white-space: nowrap;
  z-index: 1000;
  opacity: ${props => props.$show ? 1 : 0};
  visibility: ${props => props.$show ? 'visible' : 'hidden'};
  transition: opacity 0.2s ease, visibility 0.2s ease;
  pointer-events: none;
  
  &::before {
    content: '';
    position: absolute;
    top: 50%;
    left: -5px;
    transform: translateY(-50%);
    border: 5px solid transparent;
    border-right-color: #333;
  }
  
  @media (max-width: 991px) {
    left: 260px;
  }
`;

const SidebarItem = ({ to, icon, label, isActive, isCollapsed, onClick, isDisabled = false }) => {
  const [showTooltip, setShowTooltip] = useState(false);

  const handleClick = (e) => {
    if (isDisabled) {
      e.preventDefault();
      return;
    }
    if (onClick) onClick(e);
  };

  const handleMouseEnter = () => {
    if (isDisabled) {
      setShowTooltip(true);
    }
  };

  const handleMouseLeave = () => {
    setShowTooltip(false);
  };

  if (isDisabled) {
    return (
      <ItemContainer>
        <DisabledOverlay 
          title={label}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          onClick={handleClick}
        >
          <IconWrapper $isCollapsed={isCollapsed}>{icon}</IconWrapper>
          <ItemLabel $isCollapsed={isCollapsed}>{label}</ItemLabel>
        </DisabledOverlay>
        <Tooltip $show={showTooltip} $isCollapsed={isCollapsed}>
          Soon
        </Tooltip>
      </ItemContainer>
    );
  }

  return (
    <ItemLink to={to} $isActive={isActive} title={label} onClick={handleClick}>
      <IconWrapper $isCollapsed={isCollapsed}>{icon}</IconWrapper>
      <ItemLabel $isCollapsed={isCollapsed}>{label}</ItemLabel>
    </ItemLink>
  );
};

export default SidebarItem;