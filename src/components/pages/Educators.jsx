import React, { useState } from 'react';
import styled from 'styled-components';
import TabBar from '../ui/TabBar';
import EducatorsContainer from '../educators/EducatorsContainer';
import educatorsData from '../../data/educatorsData';
import { useTranslation } from 'react-i18next';
import EducatorCard from '../educators/EducatorCard';

const PageContainer = styled.div`
  background-color: rgb(0,0,0);
`;

const PageTitle = styled.h1`
  font-size: 28px;
  color: rgb(255,255,255);
  margin: 0;
  padding: 24px 24px 0 24px;
`;

const TabBarAndFilterContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  margin-bottom: 24px;
  flex-wrap: wrap;
`;

const FilterContainer = styled.div`
  margin-left: 16px;
`;

const LanguageFilter = styled.select`
  padding: 8px 16px;
  border-radius: 6px;
  border: 1.5px solid #009688;
  background-color: #181818;
  color: #fff;
  font-size: 16px;
  font-weight: 500;
  outline: none;
  transition: border-color 0.2s, box-shadow 0.2s;
  box-shadow: 0 2px 8px rgba(0,150,136,0.08);

  &:focus {
    border-color: #00bfae;
    box-shadow: 0 0 0 2px rgba(0,191,174,0.15);
  }

  option {
    background: #23272a;
    color: #fff;
  }
`;

// Definir las claves de las pestañas
const TAB_KEYS = [
  'forex', 
  'futures',
  'stock',
  'crypto', 
  'financial-literacy',
  'marketing-digital',
  'mindset',
];

const Educators = () => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState(TAB_KEYS[0]);
  const [selectedLanguage, setSelectedLanguage] = useState('all');

  // Crear las pestañas con etiquetas traducidas
  const tabs = TAB_KEYS.map(key => ({
    key: key,
    label: t(`categories.${key.replace('-', '_')}`),
  }));

  // Obtener los educadores para la pestaña activa
  const currentEducators = educatorsData[activeTab] || [];

  // Filtrar educadores por idioma
  let filteredEducators = [];
  if (selectedLanguage === 'all') {
    // Ordenar: primero inglés, luego español, luego el resto
    const en = currentEducators.filter(edu => edu.language && edu.language.startsWith('en'));
    const es = currentEducators.filter(edu => edu.language && edu.language.startsWith('es'));
    const other = currentEducators.filter(edu => edu.language && !['en','es'].includes(edu.language.slice(0,2)));
    filteredEducators = [...en, ...es, ...other];
  } else {
    filteredEducators = currentEducators.filter(edu => edu.language === selectedLanguage);
  }

  // Obtener la categoría actual para pasarla a las cards
  const currentCategoryKey = activeTab;

  return (
    <PageContainer>
      <PageTitle>{t('educators.pageTitle')}</PageTitle>
      
      <TabBarAndFilterContainer>
        <TabBar 
          tabs={tabs}
          activeTab={activeTab}
          onTabClick={setActiveTab}
        />
        <FilterContainer>
          <LanguageFilter 
            value={selectedLanguage} 
            onChange={(e) => setSelectedLanguage(e.target.value)}
          >
            <option value="all">{t('filterAllLanguages', 'Todos los idiomas')}</option>
            <option value="en">{t('academy.tabbar.en', 'Inglés')}</option>
            <option value="es">{t('academy.tabbar.es', 'Español')}</option>
            <option value="fr">{t('academy.tabbar.fr', 'Francés')}</option>
          </LanguageFilter>
        </FilterContainer>
      </TabBarAndFilterContainer>

      {/* Renderizar las cards manualmente para pasar la categoría */}
      <EducatorsContainer 
        educators={filteredEducators.map(edu => ({ ...edu, category: currentCategoryKey }))}
      />
    </PageContainer>
  );
};

export default Educators;