import React from 'react';
import styled from 'styled-components';
import EducatorCard from './EducatorCard';
import { useTranslation } from 'react-i18next';

const Container = styled.div`
  padding: 24px;
  background-color: rgb(0,0,0);
`;

const Title = styled.h2`
  font-size: 24px;
  color: rgb(255,255,255);
  margin-bottom: 24px;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 24px;

  @media (max-width: 1200px) {
    grid-template-columns: repeat(3, 1fr);
    gap: 20px;
  }

  @media (max-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;
  }

  @media (max-width: 480px) {
    grid-template-columns: 1fr;
    gap: 16px;
  }
`;

const NoEducatorsMessage = styled.p`
  color: rgb(158,158,158);
  text-align: center;
  padding: 40px 20px;
  font-size: 18px;
  font-weight: 500;
  grid-column: 1 / -1;
  background-color: rgba(255,255,255,0.02);
  border-radius: 8px;
  border: 1px solid rgba(158,158,158,0.2);
`;

const EducatorsContainer = ({ educators, title }) => {
  const { t } = useTranslation();

  return (
    <Container>
      {title && <Title>{title}</Title>}
      <Grid>
        {educators && educators.length > 0 ? (
          educators.map(educator => (
            <EducatorCard key={educator.id} educator={educator} />
          ))
        ) : (
          <NoEducatorsMessage>{t('educators.noEducatorsAvailable')}</NoEducatorsMessage>
        )}
      </Grid>
    </Container>
  );
};

export default EducatorsContainer; 