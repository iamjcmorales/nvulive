import { collection, getDocs, updateDoc, doc, query, where } from 'firebase/firestore';
import { db } from '../firebase/config';

export const updateExistingRecords = async () => {
  try {
    console.log('Iniciando actualización de registros existentes...');
    
    // Obtener todos los documentos de scannerForm
    const q = query(collection(db, 'scannerForm'));
    const querySnapshot = await getDocs(q);
    
    let updatedCount = 0;
    const batch = [];
    
    // Revisar cada documento
    querySnapshot.forEach((docSnapshot) => {
      const data = docSnapshot.data();
      
      // Si no tiene scannerType, necesita ser actualizado
      if (!data.scannerType) {
        batch.push({
          id: docSnapshot.id,
          data: data
        });
      }
    });
    
    console.log(`Encontrados ${batch.length} registros sin scannerType`);
    
    // Actualizar cada documento
    for (const item of batch) {
      await updateDoc(doc(db, 'scannerForm', item.id), {
        scannerType: 'Olympus'
      });
      updatedCount++;
      console.log(`Actualizado registro ${item.id} - ${updatedCount}/${batch.length}`);
    }
    
    console.log(`✅ Actualización completada! ${updatedCount} registros actualizados con scannerType: 'Olympus'`);
    return {
      success: true,
      updatedCount: updatedCount,
      message: `${updatedCount} registros actualizados correctamente`
    };
    
  } catch (error) {
    console.error('❌ Error actualizando registros:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Función para verificar el estado actual
export const checkRecordsStatus = async () => {
  try {
    const q = query(collection(db, 'scannerForm'));
    const querySnapshot = await getDocs(q);
    
    let total = 0;
    let withScannerType = 0;
    let withoutScannerType = 0;
    let olympusCount = 0;
    let skywalkerCount = 0;
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      total++;
      
      if (data.scannerType) {
        withScannerType++;
        if (data.scannerType === 'Olympus') olympusCount++;
        if (data.scannerType === 'Skywalker') skywalkerCount++;
      } else {
        withoutScannerType++;
      }
    });
    
    console.log('📊 Estado actual de los registros:');
    console.log(`Total de registros: ${total}`);
    console.log(`Con scannerType: ${withScannerType}`);
    console.log(`Sin scannerType: ${withoutScannerType}`);
    console.log(`Olympus: ${olympusCount}`);
    console.log(`Skywalker: ${skywalkerCount}`);
    
    return {
      total,
      withScannerType,
      withoutScannerType,
      olympusCount,
      skywalkerCount
    };
  } catch (error) {
    console.error('Error verificando estado:', error);
    return null;
  }
}; 