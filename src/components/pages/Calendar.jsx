import React from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import educatorsData from '../../data/educatorsData';
import { DateTime } from 'luxon';

const MAX_WIDTH = '1400px';

const BannerContainer = styled.div`
  width: 100%;
  max-width: ${MAX_WIDTH};
  height: 180px;
  background: url('/images/PORTADAS/Banner TNT.jpg') center/cover no-repeat;
  display: block;
  margin: 0 auto 24px auto;
  border-radius: 18px 18px 0 0;
  overflow: hidden;
`;

const CalendarWrapper = styled.div`
  background: #181a1b;
  border-radius: 20px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.10);
  overflow: hidden;
  max-width: ${MAX_WIDTH};
  margin: 0 auto;
  border: 1px solid rgba(0,188,212,0.18);
  @media (max-width: 600px) { display: none; }
`;

const CalendarHeader = styled.div`
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  background: #181a1b;
  border-bottom: 1px solid #23272a;
  @media (max-width: 900px) {
    grid-template-columns: repeat(2, 1fr);
  }
  @media (max-width: 600px) {
    grid-template-columns: 1fr;
  }
`;

const HeaderCell = styled.div`
  padding: 18px 0 12px 0;
  text-align: center;
  font-size: 1.08rem;
  font-weight: 600;
  color: ${props => props.$sunday ? '#e53935' : '#f5f6fa'};
  letter-spacing: 0.5px;
  background: #181a1b;
`;

const CalendarGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  min-height: 500px;
  background: #181a1b;
  @media (max-width: 900px) {
    grid-template-columns: repeat(2, 1fr);
  }
  @media (max-width: 600px) {
    grid-template-columns: 1fr;
  }
`;

const DayColumn = styled.div`
  border-right: 1px solid #23272a;
  min-height: 500px;
  padding: 0 8px;
  &:last-child {
    border-right: none;
  }
  @media (max-width: 900px) {
    min-height: 350px;
    padding: 0 4px;
  }
`;

const DayCellContent = styled.div`
  padding: 18px 0 0 0;
`;

const SessionCardWrapper = styled.div`
  margin-bottom: 18px;
  display: flex;
  flex-direction: column;
  align-items: center;
  @media (max-width: 600px) {
    margin-bottom: 12px;
  }
`;

const EducatorAvatar = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background-color: #23272a;
  border: 2px solid #23272a;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 6px;
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  @media (max-width: 600px) {
    width: 36px;
    height: 36px;
  }
`;

const SessionInfo = styled.div`
  background: #23272a;
  border-radius: 6px;
  padding: 6px 10px;
  color: #f5f6fa;
  font-size: 0.97rem;
  text-align: center;
  width: 100%;
`;
const SessionTime = styled.div`
  color: #00bcd4;
  font-size: 13px;
  font-weight: 700;
  margin-bottom: 2px;
`;
const SessionTitle = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: #f5f6fa;
`;

const ButtonRow = styled.div`
  width: 100%;
  max-width: ${MAX_WIDTH};
  margin: 0 auto 12px auto;
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 12px;
`;

const ToggleViewButton = styled.button`
  background: #181a1b;
  color: #00bcd4;
  border: 1px solid #23272a;
  padding: 6px 18px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 600;
  height: 38px;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: background 0.2s, color 0.2s, border 0.2s;
  &:hover {
    background: #23272a;
    color: #fff;
    border: 1px solid #00bcd4;
  }
  @media (max-width: 600px) {
    display: none;
  }
`;

const weekDays = [
  'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'
];

const nameToId = {
  'Abi Belilty': 'abi-belity',
  'Franklin Araujo': 'frank-araujo',
  'Richard Hall Pops': 'richard-hall-pops',
  'Ana Paulina': 'paulina',
  'Stephon Royal': 'stephon-r',
  'Raquel Curtis': 'dani-curtis',
  'Mauricio Gaytán': 'maur-gaytan',
  'Angie Toney': 'angie-toney',
  'Jorge Damelines': 'jorge-d',
  'Sebastian Garcia': 'seb-garcia',
  'Javier Perez': 'javier-perez',
  'Raphael Msica': 'raphael-msica',
  'Andre Tyson': 'henry-tyson',
  'Arin Long': 'arin-long',
  'Corey Williams': 'corey-williams',
  'Lucas Longmire': 'lucas-longmire',
  'Tamara Minto': 'tamara-minto'
};

const sessionsByDay = {
  Sunday: [
    // Inglés
    { time: '21:00', educator: 'Andre Tyson', title: 'Talk yo pips', lang: 'English' },
    // Español
    { time: '14:00', educator: 'Sebastian Garcia', title: 'Market open', lang: 'Español' },
  ],
  Monday: [
    // Inglés
    { time: '14:00', educator: 'Ana Paulina', title: '', lang: 'English' },
    { time: '21:00', educator: 'Tamara Minto', title: 'Onboarding For Beginners', lang: 'English' },
    // Español
    { time: '11:00', educator: 'Franklin Araujo', title: 'Análisis del Mercado', lang: 'Español' },
    { time: '20:00', educator: 'Mauricio Gaytán', title: 'GOLDEN HOUR', lang: 'Español' },
  ],
  Tuesday: [
    // Inglés
    { time: '08:00', educator: 'Lucas Longmire', title: '', lang: 'English' },
    { time: '14:00', educator: 'Ana Paulina', title: '', lang: 'English' },
    { time: '19:00', educator: 'Angie Toney', title: '', lang: 'English' },
    { time: '20:00', educator: 'Arin Long', title: 'Forex Basics and Market Bully Strategy', lang: 'English' },
    { time: '23:00', educator: 'Richard Hall Pops', title: '', lang: 'English' },
    // Español
    { time: '10:00', educator: 'Jorge Damelines', title: 'Mentalidad Visionaria', lang: 'Español' },
  ],
  Wednesday: [
    // Inglés
    { time: '08:00', educator: 'Lucas Longmire', title: '', lang: 'English' },
    { time: '10:00', educator: 'Richard Hall Pops', title: '', lang: 'English' },
    { time: '15:00', educator: 'Andre Tyson', title: 'Talk yo pips', lang: 'English' },
    { time: '16:00', educator: 'Raphael Msica', title: 'Générer des Revenus avec le Trading Forex', lang: 'Français' },
    { time: '19:00', educator: 'Arin Long', title: 'Forex Basics and Market Bully Strategy', lang: 'English' },
    { time: '20:00', educator: 'Corey Williams', title: 'Crypto and Coffee', lang: 'English' },
    { time: '21:00', educator: 'Stephon Royal', title: 'VVS', lang: 'English' },
    // Español
    { time: '10:00', educator: 'Abi Belilty', title: 'TRADING INSTITUCIONAL', lang: 'Español' },
    { time: '20:00', educator: 'Mauricio Gaytán', title: 'GOLDEN HOUR', lang: 'Español' },
  ],
  Thursday: [
    // Inglés
    { time: '08:00', educator: 'Lucas Longmire', title: '', lang: 'English' },
    { time: '19:00', educator: 'Raquel Curtis', title: 'Stocks 101', lang: 'English' },
    { time: '20:00', educator: 'Andre Tyson', title: 'Talk yo pips', lang: 'English' },
    { time: '23:00', educator: 'Richard Hall Pops', title: '', lang: 'English' },
    // Español
    { time: '11:00', educator: 'Franklin Araujo', title: 'Educación y Formación Completa', lang: 'Español' },
    { time: '22:00', educator: 'Abi Belilty', title: 'TRADING INSTITUCIONAL', lang: 'Español' },
  ],
  Friday: [
    // Francés
    { time: '16:00', educator: 'Raphael Msica', title: 'Générer des Revenus avec le Trading Forex', lang: 'Français' },
  ],
  Saturday: [],
};

function findEducatorById(id) {
  for (const category in educatorsData) {
    const educator = educatorsData[category].find(edu => edu.id === id);
    if (educator) return educator;
  }
  return null;
}

// Lista de ciudades y zonas horarias
const timezones = [
  { label: 'New York (EST)', value: 'America/New_York' },
  { label: 'London', value: 'Europe/London' },
  { label: 'Madrid', value: 'Europe/Madrid' },
  { label: 'Buenos Aires', value: 'America/Argentina/Buenos_Aires' },
  { label: 'Mexico City', value: 'America/Mexico_City' },
  { label: 'Los Angeles', value: 'America/Los_Angeles' },
  { label: 'Tokyo', value: 'Asia/Tokyo' },
];

// Lista de zonas horarias válidas
const validTimezones = timezones.map(tz => tz.value);

// --- MOBILE AGENDA STYLED COMPONENTS FUERA DEL COMPONENTE ---
const MobileAgendaWrapper = styled.div`
  display: none;
  @media (max-width: 600px) {
    display: block;
    padding: 0 6px 24px 6px;
  }
`;
const MobileDayBlock = styled.div`
  background: #181a1b;
  border-radius: 14px;
  margin-bottom: 18px;
  box-shadow: 0 1px 6px rgba(0,0,0,0.10);
  padding: 10px 10px 6px 10px;
`;
const MobileDayTitle = styled.h3`
  color: #00bcd4;
  font-size: 1.1rem;
  font-weight: 700;
  margin: 0 0 10px 0;
  letter-spacing: 0.5px;
`;
const MobileSessionCard = styled.div`
  background: #23272a;
  border-radius: 8px;
  margin-bottom: 10px;
  padding: 8px 10px;
  display: flex;
  align-items: center;
  gap: 10px;
`;
const MobileSessionInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
`;
const MobileSessionTime = styled.div`
  color: #00bcd4;
  font-size: 13px;
  font-weight: 700;
`;
const MobileSessionTitle = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: #f5f6fa;
`;
const MobileSessionEducator = styled.div`
  font-size: 13px;
  color: #00fff7;
`;
const MobileSessionLang = styled.div`
  font-size: 12px;
  color: #b0b0b0;
`;

const Calendar = () => {
  const { t, i18n } = useTranslation();
  const [selectedTimezone, setSelectedTimezone] = React.useState('America/New_York');
  const [horizontalView, setHorizontalView] = React.useState(false);
  const [selectedLang, setSelectedLang] = React.useState('all'); // Filtro de idioma
  const [_, setRerender] = React.useState(0); // Para forzar re-render

  // Forzar re-render cuando cambie el idioma
  React.useEffect(() => {
    setRerender(r => r + 1);
  }, [i18n.language]);

  // Función de depuración para verificar educadores
  React.useEffect(() => {
    console.log('🔍 Verificando educadores en calendario...');
    const allSessionEducators = [];
    Object.values(sessionsByDay).forEach(daySessions => {
      daySessions.forEach(session => {
        if (!allSessionEducators.includes(session.educator)) {
          allSessionEducators.push(session.educator);
        }
      });
    });
    
    allSessionEducators.forEach(educatorName => {
      const educatorId = nameToId[educatorName];
      const educatorObj = findEducatorById(educatorId);
      
      if (!educatorId) {
        console.warn(`❌ Educador sin mapeo ID: "${educatorName}"`);
      } else if (!educatorObj) {
        console.warn(`❌ Educador no encontrado en datos: "${educatorName}" (ID: ${educatorId})`);
      } else {
        console.log(`✅ Educador OK: "${educatorName}" → ${educatorId}`);
      }
    });
  }, []);

  // Opciones de idioma para el filtro
  const langOptions = [
    { value: 'all', label: t('calendar.filterAll') },
    { value: 'Español', label: t('calendar.filterSpanish') },
    { value: 'English', label: t('calendar.filterEnglish') },
    { value: 'Français', label: t('calendar.filterFrench') },
  ];

  // Función para convertir hora EST a la zona seleccionada
  const convertTime = (estTime) => {
    try {
      const [hour, minute] = estTime.split(':');
      // Crear DateTime en EST
      const dt = DateTime.fromObject({
        year: 2024,
        month: 1,
        day: 1,
        hour: parseInt(hour, 10),
        minute: parseInt(minute, 10)
      }, { zone: 'America/New_York' }); // EST es America/New_York

      // Convertir a la zona horaria seleccionada
      const targetZone = validTimezones.includes(selectedTimezone) 
        ? selectedTimezone 
        : 'America/New_York';
      
      // Cambiar el formato a 12 horas con AM/PM
      return dt.setZone(targetZone).toFormat('h:mm a');
    } catch (error) {
      console.error('Error converting time:', error);
      return estTime; // Retornar la hora original si hay error
    }
  };

  // Banner dinámico según idioma
  const bannerImage = i18n.language.startsWith('es')
    ? '/images/PORTADAS/Banner TNT.jpg'
    : '/images/Download our new TNT app.jpg';

  // Obtener lista única de educadores, excluyendo a Jeff
  const allEducators = [];
  Object.values(sessionsByDay).forEach(daySessions => {
    daySessions.forEach(session => {
      if (session.educator !== 'Jeff Beausoleil' && !allEducators.includes(session.educator)) {
        allEducators.push(session.educator);
      }
    });
  });

  // Filtrar sesiones por idioma
  const filterSessions = (sessions) => {
    if (selectedLang === 'all') return sessions;
    return sessions.filter(session => session.lang === selectedLang);
  };

  // Render horizontal view (Educador x Días)
  const renderHorizontalView = () => (
    <CalendarWrapper style={{overflowX:'auto'}}>
      <div style={{width:'100%',overflowX:'auto'}}>
        <table style={{width:'100%',borderCollapse:'collapse',minWidth:'900px',fontSize:'1rem'}}>
          <thead>
            <tr>
              <th style={{background:'#181a1b',color:'#00bcd4',padding:'14px',fontWeight:700,borderBottom:'1px solid rgba(0,188,212,0.10)',fontSize:'1rem'}}>
                Educador
              </th>
              {weekDays.map(day => (
                <th key={day} style={{background:'#181a1b',color:'#f5f6fa',padding:'14px',fontWeight:600,borderBottom:'1px solid rgba(0,188,212,0.10)',fontSize:'1rem'}}>{t(`calendar.${day.toLowerCase()}`)}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {allEducators.map(educator => {
              const educatorId = nameToId[educator];
              const educatorObj = findEducatorById(educatorId);
              // Filtrar por idioma: si el educador no tiene ninguna sesión en el idioma seleccionado, no mostrarlo
              const hasSessionInLang = weekDays.some(day => filterSessions((sessionsByDay[day]||[])).some(s => s.educator === educator));
              if (!hasSessionInLang) return null;
              return (
                <tr key={educator}>
                  <td style={{background:'#23272a',color:'#fff',padding:'12px',textAlign:'center',minWidth:120,borderBottom:'1px solid rgba(0,188,212,0.10)',fontSize:'1rem'}}>
                    <div style={{display:'flex',flexDirection:'column',alignItems:'center',cursor:'pointer'}} onClick={() => window.location.href = `/educadores/${educatorId}`}>
                      <EducatorAvatar>
                        <img 
                          src={
                            educatorObj?.profileImageFilename
                              ? (educatorObj.id === 'lucas-longmire' ? `/images/perfil/${educatorObj.profileImageFilename}` : `/PERFIL/${educatorObj.profileImageFilename}`)
                              : educatorObj?.img || '/images/placeholder.jpg'
                          }
                          alt={educatorObj?.name || educator}
                          onError={e => { e.target.onerror = null; e.target.src='/images/placeholder.jpg'; }}
                        />
                      </EducatorAvatar>
                      <div style={{fontWeight:600,fontSize:15,marginTop:2}}>{educatorObj?.name || educator}</div>
                    </div>
                  </td>
                  {weekDays.map(day => {
                    // Filtrar sesiones por idioma
                    const session = filterSessions((sessionsByDay[day]||[])).find(s => s.educator === educator);
                    return (
                      <td key={day} style={{background:'#23272a',color:'#fff',padding:'12px',minWidth:90,textAlign:'center',borderBottom:'1px solid rgba(0,188,212,0.10)',fontSize:'1rem'}}>
                        {session ? (
                          <div>
                            <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 2 }}>
                              {educatorObj?.name || session.educator}
                            </div>
                            <SessionTime>{convertTime(session.time)}</SessionTime>
                            <SessionTitle>{session.title}</SessionTitle>
                            <div style={{ fontSize: '13px', color: '#00fff7', marginTop: 2 }}>{
                              session.lang === 'English' ? t('calendar.filterEnglish') :
                              session.lang === 'Español' ? t('calendar.filterSpanish') :
                              session.lang === 'Français' ? t('calendar.filterFrench') : session.lang
                            }</div>
                          </div>
                        ) : null}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <style>{`
        @media (max-width: 900px) {
          table { font-size: 0.92rem; }
          th, td { padding: 8px !important; }
        }
        @media (max-width: 600px) {
          table { font-size: 0.85rem; }
          th, td { padding: 5px !important; }
        }
      `}</style>
    </CalendarWrapper>
  );

  // --- Render agenda mobile ---
  const renderMobileAgenda = () => (
    <MobileAgendaWrapper>
      {weekDays.map(day => (
        <MobileDayBlock key={day}>
          <MobileDayTitle>{t(`calendar.${day.toLowerCase()}`)}</MobileDayTitle>
          {(filterSessions(sessionsByDay[day]) && filterSessions(sessionsByDay[day]).length > 0) ? (
            filterSessions(sessionsByDay[day]).map((session, idx) => {
              if (session.educator === 'Jeff Beausoleil') return null;
              
              const educatorId = nameToId[session.educator];
              const educatorObj = findEducatorById(educatorId);
              
              // Si no se encuentra el educador, usar datos por defecto pero aún permitir navegación
              const displayName = educatorObj?.name || session.educator;
              const imageUrl = educatorObj?.profileImageFilename 
                ? (educatorObj.id === 'lucas-longmire' ? `/images/perfil/${educatorObj.profileImageFilename}` : `/PERFIL/${educatorObj.profileImageFilename}`)
                : educatorObj?.img || '/images/placeholder.jpg';
              
              // Solo crear enlace si tenemos un ID válido de educador
              const handleClick = () => {
                if (educatorId && educatorObj) {
                  window.location.href = `/educadores/${educatorId}`;
                } else {
                  console.warn(`Educador no encontrado: ${session.educator}`);
                  // Opcional: mostrar mensaje al usuario
                }
              };
              
              return (
                <MobileSessionCard 
                  key={idx} 
                  onClick={handleClick} 
                  style={{
                    cursor: educatorId && educatorObj ? 'pointer' : 'default',
                    opacity: educatorId && educatorObj ? 1 : 0.7
                  }}
                >
                  <EducatorAvatar style={{width:32,height:32,minWidth:32}}>
                    <img 
                      src={imageUrl}
                      alt={displayName}
                      onError={e => { 
                        e.target.onerror = null; 
                        e.target.src='/images/placeholder.jpg'; 
                      }}
                    />
                  </EducatorAvatar>
                  <MobileSessionInfo>
                    <MobileSessionTime>{convertTime(session.time)}</MobileSessionTime>
                    <MobileSessionTitle>{session.title}</MobileSessionTitle>
                    <MobileSessionEducator>{displayName}</MobileSessionEducator>
                    <MobileSessionLang>{
                      session.lang === 'English' ? t('calendar.filterEnglish') :
                      session.lang === 'Español' ? t('calendar.filterSpanish') :
                      session.lang === 'Français' ? t('calendar.filterFrench') : session.lang
                    }</MobileSessionLang>
                  </MobileSessionInfo>
                </MobileSessionCard>
              );
            })
          ) : (
            <div style={{color:'#888',fontSize:'0.95rem',marginBottom:8}}>{t('calendar.noEvents','No hay eventos programados para este día.')}</div>
          )}
        </MobileDayBlock>
      ))}
    </MobileAgendaWrapper>
  );

  return (
    <>
      <div style={{
        width: '100vw',
        minWidth: '100%',
        height: 240,
        background: `url('${bannerImage}') center/cover no-repeat`,
        display: 'block',
        margin: '0 0 24px 0',
        borderRadius: 0,
        overflow: 'hidden',
        position: 'relative',
        left: '50%',
        right: '50%',
        transform: 'translateX(-50%)',
        maxWidth: '100vw'
      }} 
      className="calendar-banner"
      />
      <style>{`
        .calendar-banner {
          @media (max-width: 768px) {
            height: 80px !important;
          }
        }
      `}</style>
      {/* Dropdown de zonas horarias y botón en la misma fila */}
      <ButtonRow>
        {/* Filtro de idioma a la izquierda */}
        <select
          value={selectedLang}
          onChange={e => setSelectedLang(e.target.value)}
          style={{padding:'6px 12px', borderRadius:8, border:'1px solid #23272a', background:'#181a1b', color:'#fff', fontWeight:500, height:38, marginRight:12}}
        >
          {langOptions.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
        <span style={{color:'#00bcd4', fontWeight:600, marginRight:8}}>Timezone:</span>
        <select
          value={selectedTimezone}
          onChange={e => setSelectedTimezone(e.target.value)}
          style={{padding:'6px 12px', borderRadius:8, border:'1px solid #23272a', background:'#181a1b', color:'#fff', fontWeight:500, height:38}}
        >
          {timezones.map(tz => (
            <option key={tz.value} value={tz.value}>{tz.label}</option>
          ))}
        </select>
        <ToggleViewButton onClick={() => setHorizontalView(v => !v)}>
          {horizontalView ? t('calendar.traditionalView', 'Traditional view') : t('calendar.horizontalView', 'Educator x Days view')}
        </ToggleViewButton>
      </ButtonRow>
      {horizontalView ? renderHorizontalView() : (
        <>
          <CalendarWrapper className="hide-on-mobile">
            <CalendarHeader>
              {weekDays.map((day, idx) => (
                <HeaderCell key={day} $sunday={day === 'Sunday'}>{t(`calendar.${day.toLowerCase()}`)}</HeaderCell>
              ))}
            </CalendarHeader>
            <CalendarGrid>
              {weekDays.map(day => (
                <DayColumn key={day}>
                  <DayCellContent>
                    {filterSessions(sessionsByDay[day]) && filterSessions(sessionsByDay[day]).length > 0 ? (
                      filterSessions(sessionsByDay[day]).map((session, idx) => {
                        if (session.educator === 'Jeff Beausoleil') return null;
                        const educatorId = nameToId[session.educator];
                        const educatorObj = findEducatorById(educatorId);
                        return educatorObj ? (
                          <SessionCardWrapper key={idx} onClick={() => window.location.href = `/educadores/${educatorId}`} style={{cursor:'pointer'}}>
                            <EducatorAvatar>
                              <img 
                                src={educatorObj.profileImageFilename ? (educatorObj.id === 'lucas-longmire' ? `/images/perfil/${educatorObj.profileImageFilename}` : `/PERFIL/${educatorObj.profileImageFilename}`) : educatorObj.img || '/images/placeholder.jpg'}
                                alt={educatorObj.name}
                                onError={e => { e.target.onerror = null; e.target.src='/images/placeholder.jpg'; }}
                              />
                            </EducatorAvatar>
                            <SessionInfo>
                              <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 2 }}>
                                {educatorObj?.name || session.educator}
                              </div>
                              <SessionTime>{convertTime(session.time)}</SessionTime>
                              <SessionTitle>{session.title}</SessionTitle>
                              <div style={{ fontSize: '13px', color: '#00fff7', marginTop: 2 }}>{
                                session.lang === 'English' ? t('calendar.filterEnglish') :
                                session.lang === 'Español' ? t('calendar.filterSpanish') :
                                session.lang === 'Français' ? t('calendar.filterFrench') : session.lang
                              }</div>
                            </SessionInfo>
                          </SessionCardWrapper>
                        ) : null;
                      })
                    ) : null}
                  </DayCellContent>
                </DayColumn>
              ))}
            </CalendarGrid>
          </CalendarWrapper>
          {renderMobileAgenda()}
        </>
      )}
    </>
  );
};

export default Calendar;