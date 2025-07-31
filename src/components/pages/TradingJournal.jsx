import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { collection, addDoc, getDocs, query, where, deleteDoc, doc, orderBy, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { FaFolder, FaTrash, FaPlus, FaChartLine, FaCalendarAlt, FaMoneyBillWave, FaTag } from 'react-icons/fa';
import { Tooltip } from 'react-tooltip';

const PageContainer = styled.div`
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
`;

const PageTitle = styled.h1`
  color: white;
  margin-bottom: 30px;
  font-size: 28px;
  font-weight: 600;
`;

const JournalContainer = styled.div`
  display: flex;
  gap: 20px;
  @media (max-width: 900px) {
    flex-direction: column;
    gap: 12px;
  }
`;

const Sidebar = styled.div`
  width: 250px;
  background: #1a1a1a;
  padding: 20px;
  border-radius: 8px;
  border: 1px solid rgba(255,255,255,0.1);
  @media (max-width: 900px) {
    width: 100%;
    margin-bottom: 12px;
  }
`;

const MainContent = styled.div`
  flex: 1;
  background: #1a1a1a;
  padding: 20px;
  border-radius: 8px;
  border: 1px solid rgba(255,255,255,0.1);
  @media (max-width: 900px) {
    width: 100%;
    padding: 12px;
  }
`;

const FolderList = styled.div`
  margin-bottom: 20px;
`;

const FolderItem = styled.div`
  display: flex;
  align-items: center;
  padding: 10px;
  color: white;
  cursor: pointer;
  border-radius: 4px;
  margin-bottom: 5px;
  &:hover {
    background: #2a2a2a;
  }
  &.active {
    background: #2a2a2a;
    border-left: 3px solid #00bcd4;
  }
`;

const NoteList = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
  @media (max-width: 600px) {
    grid-template-columns: 1fr;
    gap: 12px;
  }
`;

const NoteCard = styled.div`
  background: #2a2a2a;
  padding: 20px;
  border-radius: 8px;
  color: white;
  border: 1px solid rgba(255,255,255,0.1);
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0,0,0,0.2);
  }
`;

const Button = styled.button`
  background: linear-gradient(90deg, #00bcd4 0%, #009688 100%);
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 500;
  transition: all 0.3s ease;

  &:hover {
    background: linear-gradient(90deg, #00acc1 0%, #00897b 100%);
    transform: translateY(-1px);
  }

  &:disabled {
    background: #666;
    cursor: not-allowed;
  }
`;

const Input = styled.input`
  background: #2a2a2a;
  border: 1px solid rgba(255,255,255,0.1);
  padding: 10px;
  border-radius: 6px;
  color: white;
  width: 100%;
  margin-bottom: 15px;
  font-size: 14px;

  &:focus {
    outline: none;
    border-color: #00bcd4;
  }
`;

const TextArea = styled.textarea`
  background: #2a2a2a;
  border: 1px solid rgba(255,255,255,0.1);
  padding: 10px;
  border-radius: 6px;
  color: white;
  width: 100%;
  min-height: 100px;
  margin-bottom: 15px;
  font-size: 14px;
  resize: vertical;

  &:focus {
    outline: none;
    border-color: #00bcd4;
  }
`;

const Select = styled.select`
  background: #2a2a2a;
  border: 1px solid rgba(255,255,255,0.1);
  padding: 10px;
  border-radius: 6px;
  color: white;
  width: 100%;
  margin-bottom: 15px;
  font-size: 14px;

  &:focus {
    outline: none;
    border-color: #00bcd4;
  }
`;

const FormGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 15px;
  margin-bottom: 20px;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 5px;
`;

const Label = styled.label`
  color: #888;
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const StatsContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  margin-bottom: 30px;
  @media (max-width: 900px) {
    grid-template-columns: 1fr;
    gap: 12px;
  }
`;

const StatCard = styled.div`
  background: #2a2a2a;
  padding: 20px;
  border-radius: 8px;
  text-align: center;
  border: 1px solid rgba(255,255,255,0.1);

  h3 {
    color: #888;
    font-size: 14px;
    margin-bottom: 10px;
  }

  p {
    color: white;
    font-size: 24px;
    font-weight: 600;
  }
`;

const InfoIcon = styled.span`
  display: inline-block;
  margin-left: 8px;
  color: #00bcd4;
  font-size: 1.1em;
  cursor: pointer;
`;

const TradingJournal = () => {
  const { t } = useTranslation();
  const [folders, setFolders] = useState([]);
  const [notes, setNotes] = useState([]);
  const [selectedFolder, setSelectedFolder] = useState(null);
  const [editingFolder, setEditingFolder] = useState(null);
  const [newFolderName, setNewFolderName] = useState('');
  const [isFormMinimized, setIsFormMinimized] = useState(false);
  const [newNote, setNewNote] = useState({
    title: '',
    pair: '',
    type: 'buy',
    entryPrice: '',
    exitPrice: '',
    lotSize: '',
    profitLoss: '',
    strategy: '',
    notes: '',
    date: new Date().toISOString().split('T')[0]
  });
  const [newFolder, setNewFolder] = useState('');
  const [stats, setStats] = useState({
    totalTrades: 0,
    winRate: 0,
    totalProfit: 0
  });

  // Obtener usuario autenticado
  const userData = React.useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem('nvuUserData')) || null;
    } catch {
      return null;
    }
  }, []);
  const userId = userData?.id;

  useEffect(() => {
    if (userId) {
      loadFolders();
      loadNotes();
    }
    // eslint-disable-next-line
  }, [selectedFolder, userId]);

  useEffect(() => {
    calculateStats();
    // eslint-disable-next-line
  }, [notes]);

  const calculateStats = () => {
    const totalTrades = notes.length;
    const winningTrades = notes.filter(note => parseFloat(note.profitLoss) > 0).length;
    const totalProfit = notes.reduce((sum, note) => sum + parseFloat(note.profitLoss || 0), 0);
    setStats({
      totalTrades,
      winRate: totalTrades > 0 ? (winningTrades / totalTrades) * 100 : 0,
      totalProfit
    });
  };

  const loadFolders = async () => {
    if (!userId) return;
    const foldersQuery = query(collection(db, 'folders'), where('userId', '==', userId));
    const querySnapshot = await getDocs(foldersQuery);
    const foldersList = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    setFolders(foldersList);
  };

  const loadNotes = async () => {
    try {
      if (!userId) return;
      
      let notesQuery;
      try {
        if (selectedFolder) {
          // Primero intentamos con la consulta completa
          notesQuery = query(
            collection(db, 'notes'),
            where('userId', '==', userId),
            where('folderId', '==', selectedFolder),
            orderBy('date', 'desc')
          );
        } else {
          notesQuery = query(
            collection(db, 'notes'),
            where('userId', '==', userId),
            orderBy('date', 'desc')
          );
        }
        const querySnapshot = await getDocs(notesQuery);
        const notesList = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setNotes(notesList);
      } catch (error) {
        if (error.code === 'failed-precondition') {
          // Si falla por falta de índices, usamos una consulta más simple
          console.warn('Using fallback query due to missing indexes');
          const fallbackQuery = query(
            collection(db, 'notes'),
            where('userId', '==', userId)
          );
          const querySnapshot = await getDocs(fallbackQuery);
          let notesList = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          
          // Filtramos por folderId y ordenamos por fecha en el cliente
          if (selectedFolder) {
            notesList = notesList.filter(note => note.folderId === selectedFolder);
          }
          notesList.sort((a, b) => new Date(b.date) - new Date(a.date));
          
          setNotes(notesList);
          
          // Mostrar mensaje al usuario sobre los índices necesarios
          const indexUrls = {
            simple: 'https://console.firebase.google.com/v1/r/project/nvu-live/firestore/indexes?create_composite=CkZwcm9qZWN0cy9udnUtbGl2ZS9kYXRhYmFzZXMvKGRlZmF1bHQpL2NvbGxlY3Rpb25Hcm91cHMvbm90ZXMvaW5kZXhlcy9fEAEaCgoGdXNlcklkEAEaCAoEZGF0ZRACGgwKCF9fbmFtZV9fEAI',
            folder: 'https://console.firebase.google.com/v1/r/project/nvu-live/firestore/indexes?create_composite=CkZwcm9qZWN0cy9udnUtbGl2ZS9kYXRhYmFzZXMvKGRlZmF1bHQpL2NvbGxlY3Rpb25Hcm91cHMvbm90ZXMvaW5kZXhlcy9fEAEaDAoIZm9sZGVySWQQARoKCgZ1c2VySWQQARoICgRkYXRlEAIaDAoIX19uYW1lX18QAg'
          };
          
          console.log('Please create the following indexes in Firebase Console:');
          console.log('1. For simple queries:', indexUrls.simple);
          console.log('2. For folder queries:', indexUrls.folder);
        } else {
          throw error;
        }
      }
    } catch (error) {
      console.error('Error loading notes:', error);
      alert('Error loading trades. Please refresh the page.');
    }
  };

  const createFolder = async () => {
    if (!newFolder.trim() || !userId) return;
    await addDoc(collection(db, 'folders'), {
      name: newFolder,
      userId,
      createdAt: new Date()
    });
    setNewFolder('');
    loadFolders();
  };

  const createNote = async () => {
    try {
      if (!userId) {
        alert('Please log in to create trades');
        return;
      }
      
      if (!selectedFolder) {
        alert('Please select a folder first to organize your trade');
        return;
      }

      if (!newNote.title.trim()) {
        alert('Please enter a title for your trade');
        return;
      }

      if (!newNote.pair.trim()) {
        alert('Please enter a trading pair (e.g., EUR/USD)');
        return;
      }

      // Crear el documento en Firestore
      const noteData = {
        ...newNote,
        folderId: selectedFolder,
        userId,
        createdAt: new Date(),
        // Asegurarse de que los valores numéricos sean números
        entryPrice: parseFloat(newNote.entryPrice) || 0,
        exitPrice: parseFloat(newNote.exitPrice) || 0,
        lotSize: parseFloat(newNote.lotSize) || 0,
        profitLoss: parseFloat(newNote.profitLoss) || 0
      };

      const docRef = await addDoc(collection(db, 'notes'), noteData);
      console.log('Trade saved with ID:', docRef.id);

      // Limpiar el formulario
      setNewNote({
        title: '',
        pair: '',
        type: 'buy',
        entryPrice: '',
        exitPrice: '',
        lotSize: '',
        profitLoss: '',
        strategy: '',
        notes: '',
        date: new Date().toISOString().split('T')[0]
      });

      // Recargar las notas
      await loadNotes();
      
      // Mostrar mensaje de éxito
      alert('Trade saved successfully!');
    } catch (error) {
      console.error('Error saving trade:', error);
      alert('Error saving trade. Please try again.');
    }
  };

  const deleteNote = async (noteId) => {
    await deleteDoc(doc(db, 'notes', noteId));
    loadNotes();
  };

  // Función para editar carpeta
  const handleEditFolder = async (folderId, newName) => {
    try {
      const folderRef = doc(db, 'folders', folderId);
      await updateDoc(folderRef, {
        name: newName
      });
      
      setFolders(folders.map(folder => 
        folder.id === folderId ? { ...folder, name: newName } : folder
      ));
      setEditingFolder(null);
    } catch (error) {
      console.error('Error editing folder:', error);
    }
  };

  // Función para eliminar carpeta
  const handleDeleteFolder = async (folderId) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar esta carpeta? Se eliminarán todas las notas dentro de ella.')) {
      try {
        // Primero eliminar todas las notas en la carpeta
        const notesQuery = query(
          collection(db, 'notes'),
          where('folderId', '==', folderId)
        );
        const notesSnapshot = await getDocs(notesQuery);
        
        const deletePromises = notesSnapshot.docs.map(doc => 
          deleteDoc(doc.ref)
        );
        await Promise.all(deletePromises);

        // Luego eliminar la carpeta
        await deleteDoc(doc(db, 'folders', folderId));
        
        setFolders(folders.filter(folder => folder.id !== folderId));
        if (selectedFolder === folderId) {
          setSelectedFolder(null);
        }
      } catch (error) {
        console.error('Error deleting folder:', error);
      }
    }
  };

  if (!userId) {
    return <PageContainer><PageTitle>{t('journal.title')}</PageTitle><p style={{color:'white'}}>{t('journal.loginRequired', 'Please log in to use your trading journal.')}</p></PageContainer>;
  }

  return (
    <PageContainer>
      <PageTitle>{t('journal.title')}</PageTitle>
      
      <StatsContainer>
        <StatCard>
          <h3>
            Total Trades
            <InfoIcon data-tooltip-id="tt-total-trades">&#9432;</InfoIcon>
            <Tooltip id="tt-total-trades" place="top">Número total de operaciones registradas en tu diario.</Tooltip>
          </h3>
          <p>{stats.totalTrades}</p>
        </StatCard>
        <StatCard>
          <h3>
            Win Rate
            <InfoIcon data-tooltip-id="tt-win-rate">&#9432;</InfoIcon>
            <Tooltip id="tt-win-rate" place="top">Porcentaje de operaciones ganadoras sobre el total.</Tooltip>
          </h3>
          <p>{stats.winRate.toFixed(1)}%</p>
        </StatCard>
        <StatCard>
          <h3>
            Total Profit/Loss
            <InfoIcon data-tooltip-id="tt-profit-loss">&#9432;</InfoIcon>
            <Tooltip id="tt-profit-loss" place="top">Suma total de ganancias y pérdidas de todas tus operaciones.</Tooltip>
          </h3>
          <p style={{ color: stats.totalProfit >= 0 ? '#4caf50' : '#f44336' }}>
            ${stats.totalProfit.toFixed(2)}
          </p>
        </StatCard>
      </StatsContainer>

      <JournalContainer>
        <Sidebar>
          <h3>
            {t('journal.folders', 'Folders')}
            <InfoIcon data-tooltip-id="tt-folders">&#9432;</InfoIcon>
            <Tooltip id="tt-folders" place="top">Organiza tus operaciones en carpetas temáticas o por estrategia.</Tooltip>
          </h3>
          <Input
            placeholder={t('journal.newFolder', 'New folder name')}
            value={newFolder}
            onChange={(e) => setNewFolder(e.target.value)}
          />
          <Button onClick={createFolder}>
            <FaPlus /> {t('journal.createFolder', 'Create Folder')}
          </Button>
          <FolderList>
            {folders.map(folder => (
              <div key={folder.id} className="folder-item">
                {editingFolder === folder.id ? (
                  <div className="edit-folder">
                    <input
                      type="text"
                      value={newFolderName}
                      onChange={(e) => setNewFolderName(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          handleEditFolder(folder.id, newFolderName);
                        }
                      }}
                    />
                    <button onClick={() => handleEditFolder(folder.id, newFolderName)}>
                      ✓
                    </button>
                    <button onClick={() => setEditingFolder(null)}>✕</button>
                  </div>
                ) : (
                  <>
                    <div 
                      className={`folder ${selectedFolder === folder.id ? 'selected' : ''}`}
                      onClick={() => setSelectedFolder(folder.id)}
                    >
                      <FaFolder style={{ marginRight: '8px' }} />
                      {folder.name}
                    </div>
                    <div className="folder-actions">
                      <button onClick={() => {
                        setEditingFolder(folder.id);
                        setNewFolderName(folder.name);
                      }}>
                        ✎
                      </button>
                      <button onClick={() => handleDeleteFolder(folder.id)}>
                        🗑
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </FolderList>
        </Sidebar>
        <MainContent>
          <div className="form-header">
            <h3>
              {t('journal.newTrade')}
              <InfoIcon data-tooltip-id="tt-new-trade">&#9432;</InfoIcon>
              <Tooltip id="tt-new-trade" place="top">Completa este formulario para registrar una nueva operación en tu diario.</Tooltip>
            </h3>
            <button 
              className="minimize-button"
              onClick={() => setIsFormMinimized(!isFormMinimized)}
            >
              {isFormMinimized ? '▼' : '▲'}
            </button>
          </div>
          
          {!isFormMinimized && (
            <>
              <FormGrid>
                <FormGroup>
                  <Label>{t('journal.date')}</Label>
                  <Input
                    type="date"
                    value={newNote.date}
                    onChange={(e) => setNewNote({ ...newNote, date: e.target.value })}
                  />
                </FormGroup>
                <FormGroup>
                  <Label>{t('journal.tradeTitle')}</Label>
                  <Input
                    placeholder={t('journal.tradeTitlePlaceholder')}
                    value={newNote.title}
                    onChange={(e) => setNewNote({ ...newNote, title: e.target.value })}
                  />
                </FormGroup>
                <FormGroup>
                  <Label>{t('journal.pair')}</Label>
                  <Input
                    placeholder={t('journal.pairPlaceholder')}
                    value={newNote.pair}
                    onChange={(e) => setNewNote({ ...newNote, pair: e.target.value })}
                  />
                </FormGroup>
                <FormGroup>
                  <Label>{t('journal.type')}</Label>
                  <Select
                    value={newNote.type}
                    onChange={(e) => setNewNote({ ...newNote, type: e.target.value })}
                  >
                    <option value="buy">{t('journal.buy')}</option>
                    <option value="sell">{t('journal.sell')}</option>
                  </Select>
                </FormGroup>
                <FormGroup>
                  <Label>{t('journal.entryPrice')}</Label>
                  <Input
                    type="number"
                    step="any"
                    placeholder={t('journal.entryPricePlaceholder')}
                    value={newNote.entryPrice}
                    onChange={(e) => setNewNote({ ...newNote, entryPrice: e.target.value })}
                  />
                </FormGroup>
                <FormGroup>
                  <Label>{t('journal.exitPrice')}</Label>
                  <Input
                    type="number"
                    step="any"
                    placeholder={t('journal.exitPricePlaceholder')}
                    value={newNote.exitPrice}
                    onChange={(e) => setNewNote({ ...newNote, exitPrice: e.target.value })}
                  />
                </FormGroup>
                <FormGroup>
                  <Label>{t('journal.lotSize')}</Label>
                  <Input
                    type="number"
                    step="any"
                    placeholder={t('journal.lotSizePlaceholder')}
                    value={newNote.lotSize}
                    onChange={(e) => setNewNote({ ...newNote, lotSize: e.target.value })}
                  />
                </FormGroup>
                <FormGroup>
                  <Label>{t('journal.profitLoss')}</Label>
                  <Input
                    type="number"
                    step="any"
                    placeholder={t('journal.profitLossPlaceholder')}
                    value={newNote.profitLoss}
                    onChange={(e) => setNewNote({ ...newNote, profitLoss: e.target.value })}
                  />
                </FormGroup>
              </FormGrid>
              <FormGroup>
                <Label>{t('journal.strategy')}</Label>
                <Input
                  placeholder={t('journal.strategyPlaceholder')}
                  value={newNote.strategy}
                  onChange={(e) => setNewNote({ ...newNote, strategy: e.target.value })}
                />
              </FormGroup>
              <FormGroup>
                <Label>{t('journal.notes')}</Label>
                <TextArea
                  placeholder={t('journal.notesPlaceholder')}
                  value={newNote.notes}
                  onChange={(e) => setNewNote({ ...newNote, notes: e.target.value })}
                />
              </FormGroup>
              <Button 
                onClick={createNote}
                style={{
                  opacity: !selectedFolder ? 0.7 : 1,
                  cursor: !selectedFolder ? 'not-allowed' : 'pointer'
                }}
              >
                <FaPlus /> {t('journal.createTrade', 'Create Trade')}
              </Button>
            </>
          )}

          <h3 style={{ marginTop: '30px' }}>
            {t('journal.trades', 'Trades')}
            <InfoIcon data-tooltip-id="tt-trades-list">&#9432;</InfoIcon>
            <Tooltip id="tt-trades-list" place="top">Aquí verás el historial de todas tus operaciones guardadas.</Tooltip>
          </h3>
          <NoteList>
            {notes.map(note => (
              <NoteCard key={note.id}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                  <h4>{note.title}</h4>
                  <span style={{ 
                    color: note.type === 'buy' ? '#4caf50' : '#f44336',
                    fontWeight: '500'
                  }}>
                    {note.type.toUpperCase()}
                  </span>
                </div>
                <p style={{ color: '#888', fontSize: '14px', marginBottom: '10px' }}>
                  {new Date(note.date).toLocaleDateString()}
                </p>
                <div style={{ marginBottom: '10px' }}>
                  <strong>Pair:</strong> {note.pair}
                </div>
                <div style={{ marginBottom: '10px' }}>
                  <strong>Entry:</strong> {note.entryPrice}
                </div>
                <div style={{ marginBottom: '10px' }}>
                  <strong>Exit:</strong> {note.exitPrice}
                </div>
                <div style={{ marginBottom: '10px' }}>
                  <strong>Lot Size:</strong> {note.lotSize}
                </div>
                <div style={{ 
                  marginBottom: '10px',
                  color: parseFloat(note.profitLoss) >= 0 ? '#4caf50' : '#f44336'
                }}>
                  <strong>P/L:</strong> ${note.profitLoss}
                </div>
                {note.strategy && (
                  <div style={{ marginBottom: '10px' }}>
                    <strong>Strategy:</strong> {note.strategy}
                  </div>
                )}
                {note.notes && (
                  <div style={{ marginBottom: '10px' }}>
                    <strong>Notes:</strong> {note.notes}
                  </div>
                )}
                <Button 
                  onClick={() => deleteNote(note.id)}
                  style={{ 
                    background: '#f44336',
                    marginTop: '10px',
                    padding: '8px 16px'
                  }}
                >
                  <FaTrash /> Delete
                </Button>
              </NoteCard>
            ))}
          </NoteList>
        </MainContent>
      </JournalContainer>
    </PageContainer>
  );
};

// Actualizar los estilos
const styles = `
  .folder-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 8px;
    padding: 8px;
    border-radius: 4px;
    transition: all 0.2s ease;
  }

  .folder {
    display: flex;
    align-items: center;
    padding: 8px 12px;
    border-radius: 4px;
    cursor: pointer;
    flex: 1;
    transition: all 0.2s ease;
  }

  .folder:hover {
    background: rgba(255, 255, 255, 0.1);
  }

  .folder.selected {
    background: #00bcd4;
    color: white;
  }

  .folder-actions {
    display: flex;
    gap: 8px;
    opacity: 0;
    transition: opacity 0.2s ease;
  }

  .folder-item:hover .folder-actions {
    opacity: 1;
  }

  .folder-actions button {
    background: none;
    border: none;
    cursor: pointer;
    font-size: 16px;
    padding: 4px;
    color: #666;
  }

  .folder-actions button:hover {
    color: #333;
  }

  .edit-folder {
    display: flex;
    gap: 8px;
    align-items: center;
    width: 100%;
  }

  .edit-folder input {
    padding: 4px 8px;
    border: 1px solid #ddd;
    border-radius: 4px;
    flex: 1;
  }

  .edit-folder button {
    background: none;
    border: none;
    cursor: pointer;
    font-size: 16px;
    padding: 4px;
  }

  .form-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
  }

  .minimize-button {
    background: none;
    border: none;
    color: #666;
    cursor: pointer;
    font-size: 16px;
    padding: 4px 8px;
    border-radius: 4px;
  }

  .minimize-button:hover {
    background: rgba(255, 255, 255, 0.1);
  }
`;

// Agregar los estilos al documento
const styleSheet = document.createElement("style");
styleSheet.innerText = styles;
document.head.appendChild(styleSheet);

export default TradingJournal; 