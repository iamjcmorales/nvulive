import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import { collection, getDocs, query, orderBy, updateDoc, doc } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { updateExistingRecords, checkRecordsStatus } from '../../utils/updateExistingRecords';

const PageContainer = styled.div`
  padding: 24px;
  min-height: calc(100vh - 64px);
  background: linear-gradient(135deg, #0f2027 0%, #2c5364 100%);
  position: relative;
  overflow: hidden;
`;

const FuturisticBg = styled.div`
  position: absolute;
  inset: 0;
  z-index: 0;
  pointer-events: none;
  background: radial-gradient(ellipse at 20% 30%, rgba(0,188,212,0.12) 0%, transparent 70%),
              radial-gradient(ellipse at 80% 70%, rgba(0,255,247,0.10) 0%, transparent 70%),
              linear-gradient(120deg, rgba(0,150,136,0.08) 0%, transparent 100%);
  animation: bgMove 12s linear infinite alternate;
  @keyframes bgMove {
    0% { background-position: 0% 0%, 100% 100%, 0% 100%; }
    100% { background-position: 100% 100%, 0% 0%, 100% 0%; }
  }
`;

const PageTitle = styled.h1`
  font-size: 2rem;
  font-weight: 700;
  color: rgb(255,255,255);
  margin-bottom: 24px;
  text-align: center;
  background: linear-gradient(90deg, #00fff7 0%, #a259ff 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
`;

const StatsContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-bottom: 32px;
`;

const StatCard = styled.div`
  background: rgba(24,24,24,0.9);
  border-radius: 12px;
  padding: 20px;
  border: 1px solid rgba(0,188,212,0.2);
  text-align: center;
`;

const StatNumber = styled.div`
  font-size: 2rem;
  font-weight: 700;
  color: #00bcd4;
  margin-bottom: 8px;
`;

const StatLabel = styled.div`
  color: rgba(255,255,255,0.8);
  font-size: 0.9rem;
`;

const SearchContainer = styled.div`
  margin-bottom: 24px;
  display: flex;
  gap: 16px;
  align-items: center;
  flex-wrap: wrap;
`;

const SearchInput = styled.input`
  background: rgba(24,24,24,0.9);
  border: 1px solid rgba(0,188,212,0.3);
  border-radius: 8px;
  padding: 12px 16px;
  color: #fff;
  font-size: 0.9rem;
  min-width: 300px;
  
  &:focus {
    outline: none;
    border-color: #00bcd4;
    box-shadow: 0 0 0 2px rgba(0,188,212,0.2);
  }
  
  &::placeholder {
    color: rgba(255,255,255,0.4);
  }
`;

const FilterSelect = styled.select`
  background: rgba(24,24,24,0.9);
  border: 1px solid rgba(0,188,212,0.3);
  border-radius: 8px;
  padding: 12px 16px;
  color: #fff;
  font-size: 0.9rem;
  cursor: pointer;
  
  &:focus {
    outline: none;
    border-color: #00bcd4;
  }
  
  option {
    background: #1a1a1a;
    color: #fff;
  }
`;

const TableContainer = styled.div`
  background: rgba(24,24,24,0.9);
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid rgba(0,188,212,0.2);
  position: relative;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
`;

const TableHeader = styled.thead`
  background: rgba(0,188,212,0.1);
`;

const TableHeaderCell = styled.th`
  padding: 16px 12px;
  text-align: left;
  color: #00bcd4;
  font-weight: 600;
  font-size: 0.9rem;
  border-bottom: 1px solid rgba(0,188,212,0.2);
  cursor: pointer;
  transition: background-color 0.2s;
  
  &:hover {
    background: rgba(0,188,212,0.05);
  }
`;

const TableBody = styled.tbody``;

const TableRow = styled.tr`
  border-bottom: 1px solid rgba(255,255,255,0.05);
  transition: background-color 0.2s;
  cursor: pointer;
  
  &:hover {
    background: rgba(0,188,212,0.05);
  }
`;

const TableCell = styled.td`
  padding: 12px;
  color: rgba(255,255,255,0.9);
  font-size: 0.85rem;
  position: relative;
  max-width: 150px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const CopyButton = styled.button`
  background: transparent;
  border: 1px solid rgba(0,188,212,0.3);
  border-radius: 4px;
  color: #00bcd4;
  padding: 4px 8px;
  font-size: 0.75rem;
  cursor: pointer;
  margin-left: 8px;
  transition: all 0.2s;
  
  &:hover {
    background: rgba(0,188,212,0.1);
    border-color: #00bcd4;
  }
  
  &:active {
    transform: scale(0.95);
  }
`;

const StatusBadge = styled.span`
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  
  &.pending {
    background: rgba(255,193,7,0.2);
    color: #ffc107;
    border: 1px solid rgba(255,193,7,0.3);
  }
  
  &.approved {
    background: rgba(76,175,80,0.2);
    color: #4caf50;
    border: 1px solid rgba(76,175,80,0.3);
  }
  
  &.rejected {
    background: rgba(244,67,54,0.2);
    color: #f44336;
    border: 1px solid rgba(244,67,54,0.3);
  }
`;

const ActionButton = styled.button`
  background: linear-gradient(135deg, ${props => 
    props.approve ? '#4caf50, #66bb6a' : '#f44336, #ef5350'});
  color: white;
  border: none;
  border-radius: 4px;
  padding: 6px 12px;
  font-size: 0.75rem;
  cursor: pointer;
  margin: 2px;
  transition: all 0.2s;
  
  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 2px 8px rgba(0,0,0,0.3);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 40px;
  color: rgba(255,255,255,0.6);
`;

const PaginationContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 16px;
  margin-top: 24px;
`;

const PaginationButton = styled.button`
  background: rgba(0,188,212,0.1);
  border: 1px solid rgba(0,188,212,0.3);
  border-radius: 6px;
  color: #00bcd4;
  padding: 8px 16px;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover:not(:disabled) {
    background: rgba(0,188,212,0.2);
    border-color: #00bcd4;
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  
  &.active {
    background: #00bcd4;
    color: #000;
  }
`;

// Estilos para el modal de detalles
const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0,0,0,0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(5px);
`;

const ModalContent = styled.div`
  background: #1a1a1a;
  border-radius: 12px;
  padding: 32px;
  max-width: 600px;
  width: 90%;
  max-height: 90vh;
  border: 1px solid rgba(0,188,212,0.3);
  position: relative;
  overflow-y: auto;
`;

const ModalCloseButton = styled.button`
  position: absolute;
  top: 16px;
  right: 16px;
  background: transparent;
  border: none;
  color: #fff;
  font-size: 24px;
  cursor: pointer;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  
  &:hover {
    background: rgba(255,255,255,0.1);
  }
`;

const ModalTitle = styled.h2`
  color: #fff;
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 24px;
  text-align: center;
  background: linear-gradient(90deg, #00fff7 0%, #a259ff 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
`;

const DetailGrid = styled.div`
  display: grid;
  gap: 20px;
`;

const DetailSection = styled.div`
  background: rgba(0,188,212,0.05);
  border-radius: 8px;
  padding: 20px;
  border-left: 3px solid #00bcd4;
`;

const DetailLabel = styled.div`
  color: #00bcd4;
  font-size: 0.9rem;
  font-weight: 600;
  margin-bottom: 8px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const DetailValue = styled.div`
  color: #fff;
  font-size: 1rem;
  word-break: break-word;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const DetailCopyButton = styled.button`
  background: linear-gradient(135deg, #00bcd4 0%, #a259ff 100%);
  color: white;
  border: none;
  border-radius: 6px;
  padding: 8px 16px;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  margin-left: 12px;
  transition: all 0.2s;
  
  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(0,188,212,0.3);
  }
`;

const StatusSection = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 24px;
  padding-top: 20px;
  border-top: 1px solid rgba(0,188,212,0.2);
`;

const ModalActionButton = styled.button`
  background: linear-gradient(135deg, ${props => 
    props.approve ? '#4caf50, #66bb6a' : '#f44336, #ef5350'});
  color: white;
  border: none;
  border-radius: 8px;
  padding: 12px 24px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  margin: 0 8px;
  transition: all 0.2s;
  
  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 4px 16px rgba(0,0,0,0.3);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const UpdateButton = styled.button`
  background: linear-gradient(135deg, #ff9800 0%, #f57c00 100%);
  color: white;
  border: none;
  border-radius: 8px;
  padding: 12px 24px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-left: 16px;
  
  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 4px 16px rgba(255,152,0,0.3);
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const AlertBanner = styled.div`
  background: rgba(255,152,0,0.1);
  border: 1px solid rgba(255,152,0,0.3);
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 24px;
  color: #ff9800;
  text-align: center;
  
  &.success {
    background: rgba(76,175,80,0.1);
    border-color: rgba(76,175,80,0.3);
    color: #4caf50;
  }
  
  &.error {
    background: rgba(244,67,54,0.1);
    border-color: rgba(244,67,54,0.3);
    color: #f44336;
  }
`;

const CRM = () => {
  const { t } = useTranslation();
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [scannerTypeFilter, setScannerTypeFilter] = useState('all'); // Nuevo filtro
  const [sortField, setSortField] = useState('timestamp');
  const [sortDirection, setSortDirection] = useState('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [selectedItem, setSelectedItem] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateAlert, setUpdateAlert] = useState(null);
  const [recordsStatus, setRecordsStatus] = useState(null);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
    olympus: 0,
    skywalker: 0
  });

  useEffect(() => {
    fetchData();
    checkRecords();
  }, []);

  useEffect(() => {
    filterAndSortData();
  }, [data, searchTerm, statusFilter, scannerTypeFilter, sortField, sortDirection]);

  const fetchData = async () => {
    try {
      const q = query(collection(db, 'scannerForm'), orderBy('timestamp', 'desc'));
      const querySnapshot = await getDocs(q);
      const formData = [];
      
      querySnapshot.forEach((doc) => {
        formData.push({
          id: doc.id,
          ...doc.data()
        });
      });
      
      setData(formData);
      calculateStats(formData);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (data) => {
    const stats = {
      total: data.length,
      pending: data.filter(item => item.status === 'pending').length,
      approved: data.filter(item => item.status === 'approved').length,
      rejected: data.filter(item => item.status === 'rejected').length,
      olympus: data.filter(item => item.scannerType === 'Olympus' || !item.scannerType).length,
      skywalker: data.filter(item => item.scannerType === 'Skywalker').length,
    };
    setStats(stats);
  };

  const filterAndSortData = () => {
    let filtered = [...data];

    // Filtro por búsqueda
    if (searchTerm) {
      filtered = filtered.filter(item =>
        item.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.nvisionId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.tradingViewUsername?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtro por status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(item => item.status === statusFilter);
    }

    // Filtro por tipo de scanner
    if (scannerTypeFilter !== 'all') {
      if (scannerTypeFilter === 'Olympus') {
        filtered = filtered.filter(item => item.scannerType === 'Olympus' || !item.scannerType);
      } else {
        filtered = filtered.filter(item => item.scannerType === scannerTypeFilter);
      }
    }

    // Ordenamiento
    filtered.sort((a, b) => {
      let aValue = a[sortField];
      let bValue = b[sortField];

      if (sortField === 'timestamp') {
        aValue = aValue?.toDate ? aValue.toDate() : new Date(aValue);
        bValue = bValue?.toDate ? bValue.toDate() : new Date(bValue);
      }

      if (sortDirection === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    setFilteredData(filtered);
    setCurrentPage(1);
  };

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      // Opcional: mostrar notificación de éxito
    } catch (err) {
      console.error('Error copying to clipboard:', err);
    }
  };

  const updateStatus = async (id, newStatus) => {
    try {
      await updateDoc(doc(db, 'scannerForm', id), {
        status: newStatus,
        updatedAt: new Date()
      });
      
      // Actualizar el estado local
      setData(prevData =>
        prevData.map(item =>
          item.id === id ? { ...item, status: newStatus } : item
        )
      );
      
      // Actualizar el item seleccionado si está abierto
      if (selectedItem && selectedItem.id === id) {
        setSelectedItem(prev => ({ ...prev, status: newStatus }));
      }
      
      // Recalcular estadísticas
      const updatedData = data.map(item =>
        item.id === id ? { ...item, status: newStatus } : item
      );
      calculateStats(updatedData);
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  const handleRowClick = (item) => {
    setSelectedItem(item);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedItem(null);
  };

  const getPaginationItems = () => {
    const totalNumbers = 5; // Total de números de página a mostrar (ej: 1, ..., 4, 5, 6, ..., 10)
    const totalBlocks = totalNumbers + 2; // Incluye los '...'

    if (totalPages <= totalBlocks) {
      return [...Array(totalPages)].map((_, i) => i + 1);
    }

    const startPage = Math.max(2, currentPage - 2);
    const endPage = Math.min(totalPages - 1, currentPage + 2);

    let pages = [1];

    if (startPage > 2) {
      pages.push('...');
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    if (endPage < totalPages - 1) {
      pages.push('...');
    }

    pages.push(totalPages);
    
    // Ajuste para cuando currentPage está cerca del inicio o final
    if (currentPage < 4) {
      pages = [1, 2, 3, 4, '...', totalPages];
    } else if (currentPage > totalPages - 3) {
      pages = [1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
    }
    
    // Caso especial para evitar duplicados si totalPages es pequeño
    if (totalPages <= 7) {
       return [...Array(totalPages)].map((_, i) => i + 1);
    }

    return pages;
  };

  // Paginación
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  const checkRecords = async () => {
    const status = await checkRecordsStatus();
    setRecordsStatus(status);
  };

  const handleUpdateRecords = async () => {
    setIsUpdating(true);
    setUpdateAlert(null);
    
    try {
      const result = await updateExistingRecords();
      
      if (result.success) {
        setUpdateAlert({
          type: 'success',
          message: `✅ ${t('crm.update.successMessage', { count: result.updatedCount })}`
        });
        
        // Recargar datos y verificar estado
        await fetchData();
        await checkRecords();
      } else {
        setUpdateAlert({
          type: 'error',
          message: `❌ ${t('crm.update.errorMessage', { error: result.error })}`
        });
      }
    } catch (error) {
      setUpdateAlert({
        type: 'error',
        message: `❌ ${t('crm.update.errorMessage', { error: error.message })}`
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const getScannerTypeDisplay = (item) => {
    if (!item.scannerType) {
      return t('crm.scannerTypes.olympusLegacy');
    }
    return item.scannerType;
  };

  if (loading) {
    return (
      <PageContainer>
        <FuturisticBg />
        <LoadingContainer>{t('crm.loading')}</LoadingContainer>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <FuturisticBg />
      <PageTitle>{t('crm.title')}</PageTitle>

      {/* Alert Banner */}
      {updateAlert && (
        <AlertBanner className={updateAlert.type}>
          {updateAlert.message}
        </AlertBanner>
      )}

      {/* Banner para registros sin scannerType */}
      {recordsStatus && recordsStatus.withoutScannerType > 0 && (
        <AlertBanner>
          ⚠️ {t('crm.update.alertTitle', { count: recordsStatus.withoutScannerType })} {' '}
          {t('crm.update.alertDescription')}
          <UpdateButton 
            onClick={handleUpdateRecords}
            disabled={isUpdating}
            style={{ marginLeft: '16px' }}
          >
            {isUpdating ? t('crm.update.buttonUpdating') : t('crm.update.buttonText', { count: recordsStatus.withoutScannerType })}
          </UpdateButton>
        </AlertBanner>
      )}

      {/* Estadísticas */}
      <StatsContainer>
        <StatCard>
          <StatNumber>{stats.total}</StatNumber>
          <StatLabel>{t('crm.stats.totalRequests')}</StatLabel>
        </StatCard>
        <StatCard>
          <StatNumber>{stats.pending}</StatNumber>
          <StatLabel>{t('crm.stats.pending')}</StatLabel>
        </StatCard>
        <StatCard>
          <StatNumber>{stats.approved}</StatNumber>
          <StatLabel>{t('crm.stats.approved')}</StatLabel>
        </StatCard>
        <StatCard>
          <StatNumber>{stats.rejected}</StatNumber>
          <StatLabel>{t('crm.stats.rejected')}</StatLabel>
        </StatCard>
        <StatCard>
          <StatNumber>{stats.olympus}</StatNumber>
          <StatLabel>{t('crm.stats.olympus')}</StatLabel>
        </StatCard>
        <StatCard>
          <StatNumber>{stats.skywalker}</StatNumber>
          <StatLabel>{t('crm.stats.skywalker')}</StatLabel>
        </StatCard>
      </StatsContainer>

      {/* Búsqueda y filtros */}
      <SearchContainer>
        <SearchInput
          type="text"
          placeholder={t('crm.search.placeholder')}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <FilterSelect
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="all">{t('crm.search.allStatuses')}</option>
          <option value="pending">{t('crm.search.pending')}</option>
          <option value="approved">{t('crm.search.approved')}</option>
          <option value="rejected">{t('crm.search.rejected')}</option>
        </FilterSelect>
        <FilterSelect
          value={scannerTypeFilter}
          onChange={(e) => setScannerTypeFilter(e.target.value)}
        >
          <option value="all">{t('crm.search.allScannerTypes')}</option>
          <option value="Olympus">Olympus</option>
          <option value="Skywalker">Skywalker</option>
        </FilterSelect>
      </SearchContainer>

      {/* Tabla */}
      <TableContainer>
        <Table>
          <TableHeader>
            <tr>
              <TableHeaderCell onClick={() => handleSort('firstName')}>
                {t('crm.table.firstName')} {sortField === 'firstName' && (sortDirection === 'asc' ? '↑' : '↓')}
              </TableHeaderCell>
              <TableHeaderCell onClick={() => handleSort('lastName')}>
                {t('crm.table.lastName')} {sortField === 'lastName' && (sortDirection === 'asc' ? '↑' : '↓')}
              </TableHeaderCell>
              <TableHeaderCell onClick={() => handleSort('email')}>
                {t('crm.table.email')} {sortField === 'email' && (sortDirection === 'asc' ? '↑' : '↓')}
              </TableHeaderCell>
              <TableHeaderCell onClick={() => handleSort('nvisionId')}>
                {t('crm.table.nvisionId')} {sortField === 'nvisionId' && (sortDirection === 'asc' ? '↑' : '↓')}
              </TableHeaderCell>
              <TableHeaderCell onClick={() => handleSort('tradingViewUsername')}>
                {t('crm.table.tradingView')} {sortField === 'tradingViewUsername' && (sortDirection === 'asc' ? '↑' : '↓')}
              </TableHeaderCell>
              <TableHeaderCell onClick={() => handleSort('scannerType')}>
                {t('crm.table.scannerType')} {sortField === 'scannerType' && (sortDirection === 'asc' ? '↑' : '↓')}
              </TableHeaderCell>
              <TableHeaderCell onClick={() => handleSort('timestamp')}>
                {t('crm.table.date')} {sortField === 'timestamp' && (sortDirection === 'asc' ? '↑' : '↓')}
              </TableHeaderCell>
              <TableHeaderCell>{t('crm.table.status')}</TableHeaderCell>
              <TableHeaderCell>{t('crm.table.actions')}</TableHeaderCell>
            </tr>
          </TableHeader>
          <TableBody>
            {currentItems.map((item) => (
              <TableRow key={item.id} onClick={() => handleRowClick(item)}>
                <TableCell>
                  {item.firstName}
                  <CopyButton onClick={(e) => {
                    e.stopPropagation();
                    copyToClipboard(item.firstName);
                  }}>
                    {t('crm.table.copy')}
                  </CopyButton>
                </TableCell>
                <TableCell>
                  {item.lastName}
                  <CopyButton onClick={(e) => {
                    e.stopPropagation();
                    copyToClipboard(item.lastName);
                  }}>
                    {t('crm.table.copy')}
                  </CopyButton>
                </TableCell>
                <TableCell>
                  {item.email}
                  <CopyButton onClick={(e) => {
                    e.stopPropagation();
                    copyToClipboard(item.email);
                  }}>
                    {t('crm.table.copy')}
                  </CopyButton>
                </TableCell>
                <TableCell>
                  {item.nvisionId}
                  <CopyButton onClick={(e) => {
                    e.stopPropagation();
                    copyToClipboard(item.nvisionId);
                  }}>
                    {t('crm.table.copy')}
                  </CopyButton>
                </TableCell>
                <TableCell>
                  {item.tradingViewUsername}
                  <CopyButton onClick={(e) => {
                    e.stopPropagation();
                    copyToClipboard(item.tradingViewUsername);
                  }}>
                    {t('crm.table.copy')}
                  </CopyButton>
                </TableCell>
                <TableCell>
                  {getScannerTypeDisplay(item)}
                  <CopyButton onClick={(e) => {
                    e.stopPropagation();
                    copyToClipboard(getScannerTypeDisplay(item));
                  }}>
                    {t('crm.table.copy')}
                  </CopyButton>
                </TableCell>
                <TableCell>
                  {formatDate(item.timestamp)}
                  <CopyButton onClick={(e) => {
                    e.stopPropagation();
                    copyToClipboard(formatDate(item.timestamp));
                  }}>
                    {t('crm.table.copy')}
                  </CopyButton>
                </TableCell>
                <TableCell>
                  <StatusBadge className={item.status || 'pending'}>
                    {item.status || 'pending'}
                  </StatusBadge>
                </TableCell>
                <TableCell>
                  {item.status !== 'approved' && (
                    <ActionButton
                      approve
                      onClick={(e) => {
                        e.stopPropagation();
                        updateStatus(item.id, 'approved');
                      }}
                    >
                      {t('crm.table.approve')}
                    </ActionButton>
                  )}
                  {item.status !== 'rejected' && (
                    <ActionButton
                      onClick={(e) => {
                        e.stopPropagation();
                        updateStatus(item.id, 'rejected');
                      }}
                    >
                      {t('crm.table.reject')}
                    </ActionButton>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Paginación */}
      {totalPages > 1 && (
        <PaginationContainer>
          <PaginationButton
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
          >
            {t('crm.pagination.previous')}
          </PaginationButton>
          
          {getPaginationItems().map((item, index) =>
            item === '...' ? (
              <span key={index} style={{ color: '#00bcd4', padding: '0 8px' }}>...</span>
            ) : (
              <PaginationButton
                key={index}
                className={currentPage === item ? 'active' : ''}
                onClick={() => setCurrentPage(item)}
              >
                {item}
              </PaginationButton>
            )
          )}
          
          <PaginationButton
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
          >
            {t('crm.pagination.next')}
          </PaginationButton>
        </PaginationContainer>
      )}

      {/* Modal de detalles */}
      {showModal && selectedItem && (
        <ModalOverlay onClick={handleCloseModal}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <ModalCloseButton onClick={handleCloseModal}>{t('crm.modal.close')}</ModalCloseButton>
            <ModalTitle>{t('crm.modal.title')}</ModalTitle>
            
            <DetailGrid>
              <DetailSection>
                <DetailLabel>{t('crm.modal.fullName')}</DetailLabel>
                <DetailValue>
                  {selectedItem.firstName} {selectedItem.lastName}
                  <DetailCopyButton onClick={() => copyToClipboard(`${selectedItem.firstName} ${selectedItem.lastName}`)}>
                    {t('crm.modal.copy')}
                  </DetailCopyButton>
                </DetailValue>
              </DetailSection>

              <DetailSection>
                <DetailLabel>{t('crm.modal.email')}</DetailLabel>
                <DetailValue>
                  {selectedItem.email}
                  <DetailCopyButton onClick={() => copyToClipboard(selectedItem.email)}>
                    {t('crm.modal.copy')}
                  </DetailCopyButton>
                </DetailValue>
              </DetailSection>

              <DetailSection>
                <DetailLabel>{t('crm.modal.nvisionId')}</DetailLabel>
                <DetailValue>
                  {selectedItem.nvisionId}
                  <DetailCopyButton onClick={() => copyToClipboard(selectedItem.nvisionId)}>
                    {t('crm.modal.copy')}
                  </DetailCopyButton>
                </DetailValue>
              </DetailSection>

              <DetailSection>
                <DetailLabel>{t('crm.modal.tradingViewUsername')}</DetailLabel>
                <DetailValue>
                  {selectedItem.tradingViewUsername}
                  <DetailCopyButton onClick={() => copyToClipboard(selectedItem.tradingViewUsername)}>
                    {t('crm.modal.copy')}
                  </DetailCopyButton>
                </DetailValue>
              </DetailSection>

              <DetailSection>
                <DetailLabel>{t('crm.modal.scannerType')}</DetailLabel>
                <DetailValue>
                  {getScannerTypeDisplay(selectedItem)}
                  <DetailCopyButton onClick={() => copyToClipboard(getScannerTypeDisplay(selectedItem))}>
                    {t('crm.modal.copy')}
                  </DetailCopyButton>
                </DetailValue>
              </DetailSection>

              <DetailSection>
                <DetailLabel>{t('crm.modal.requestDate')}</DetailLabel>
                <DetailValue>
                  {formatDate(selectedItem.timestamp)}
                  <DetailCopyButton onClick={() => copyToClipboard(formatDate(selectedItem.timestamp))}>
                    {t('crm.modal.copy')}
                  </DetailCopyButton>
                </DetailValue>
              </DetailSection>

              <StatusSection>
                <div>
                  <DetailLabel>{t('crm.modal.currentStatus')}</DetailLabel>
                  <StatusBadge className={selectedItem.status || 'pending'}>
                    {selectedItem.status || 'pending'}
                  </StatusBadge>
                </div>
                
                <div>
                  {selectedItem.status !== 'approved' && (
                    <ModalActionButton
                      approve
                      onClick={() => {
                        updateStatus(selectedItem.id, 'approved');
                        handleCloseModal();
                      }}
                    >
                      {t('crm.modal.approve')}
                    </ModalActionButton>
                  )}
                  {selectedItem.status !== 'rejected' && (
                    <ModalActionButton
                      onClick={() => {
                        updateStatus(selectedItem.id, 'rejected');
                        handleCloseModal();
                      }}
                    >
                      {t('crm.modal.reject')}
                    </ModalActionButton>
                  )}
                </div>
              </StatusSection>
            </DetailGrid>
          </ModalContent>
        </ModalOverlay>
      )}
    </PageContainer>
  );
};

export default CRM; 