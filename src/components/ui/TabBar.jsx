import React from 'react';
import styled from 'styled-components';

const TabContainer = styled.div`
  display: flex;
  gap: 12px;
  margin-bottom: 24px;
  flex-wrap: wrap; // Para que bajen en pantallas pequeñas
  padding-top: 15px;
`;

const TabButton = styled.button`
  padding: 8px 20px;
  border-radius: 20px;
  border: 1px solid transparent;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: background-color 0.2s, color 0.2s, border-color 0.2s;
  background-color: ${props => props.$active ? 'rgb(0,150,136)' : 'rgb(24,24,24)'};
  color: ${props => props.$active ? 'white' : 'rgb(200,200,200)'};
  border-color: ${props => props.$active ? 'rgb(0,150,136)' : 'rgb(40,40,40)'};

  &:hover {
    background-color: ${props => props.$active ? 'rgb(0,200,180)' : 'rgb(40,40,40)'};
    border-color: ${props => props.$active ? 'rgb(0,200,180)' : 'rgb(60,60,60)'};
    color: white;
  }
`;

const TabBar = ({ tabs, activeTab, onTabClick }) => {
  return (
    <TabContainer>
      {tabs.map(tab => (
        <TabButton 
          key={tab.key} 
          $active={tab.key === activeTab}
          onClick={() => onTabClick(tab.key)}
        >
          {tab.label}
        </TabButton>
      ))}
    </TabContainer>
  );
};

export default TabBar; 