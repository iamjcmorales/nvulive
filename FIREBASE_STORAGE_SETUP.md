# Configuración de Firebase Storage - Guía de Solución

## Problema: Las imágenes no se pueden subir en el TradingForm

### Causa Probable
El error de subida de imágenes se debe a que las reglas de seguridad de Firebase Storage están bloqueando las operaciones de escritura.

### Solución: Configurar Reglas de Firebase Storage

#### Opción 1: Reglas de Desarrollo (TEMPORALES - Solo para testing)

1. Ve a la [Consola de Firebase](https://console.firebase.google.com/)
2. Selecciona tu proyecto "nvu-live"
3. Ve a **Storage** en el menú lateral
4. Ve a la pestaña **Rules**
5. Reemplaza las reglas existentes con:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // REGLAS TEMPORALES PARA DESARROLLO - ¡CAMBIAR ANTES DE PRODUCCIÓN!
    match /{allPaths=**} {
      allow read, write: if true;
    }
  }
}
```

#### Opción 2: Reglas de Producción (RECOMENDADAS)

Para un entorno más seguro, usa estas reglas:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Permitir subida de imágenes en la carpeta trades/ 
    match /trades/{filename} {
      // Permitir escritura a cualquier usuario (puedes agregar autenticación después)
      allow write: if resource == null // Solo crear archivos nuevos
                   && request.resource.size < 5 * 1024 * 1024 // Máximo 5MB
                   && request.resource.contentType.matches('image/.*'); // Solo imágenes
      
      // Permitir lectura a cualquier usuario
      allow read: if true;
    }
    
    // Permitir archivos de prueba de conexión
    match /test/{filename} {
      allow read, write: if true;
    }
  }
}
```

#### Opción 3: Reglas con Autenticación (MÁS SEGURAS)

Si tienes Firebase Authentication configurado:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Requiere autenticación para todas las operaciones
    match /trades/{filename} {
      allow write: if request.auth != null
                   && resource == null
                   && request.resource.size < 5 * 1024 * 1024
                   && request.resource.contentType.matches('image/.*');
      
      allow read: if request.auth != null;
    }
    
    // Archivos de prueba (solo para desarrollo)
    match /test/{filename} {
      allow read, write: if request.auth != null;
    }
  }
}
```

### Pasos para Aplicar las Reglas

1. Copia las reglas que prefieras
2. Pégalas en el editor de reglas de Firebase Storage
3. Haz clic en **"Publicar"**
4. Espera unos minutos para que se propaguen los cambios

### Verificación

1. Abre la consola del navegador (F12)
2. Intenta subir una imagen en el TradingForm
3. Verifica que aparezcan los logs de conexión exitosa
4. Si aún hay errores, revisa los mensajes específicos en la consola

### Notas Importantes

- **¡NUNCA uses las reglas de desarrollo en producción!** Son completamente abiertas.
- Las reglas pueden tardar hasta 10 minutos en propagarse completamente.
- Si usas las reglas con autenticación, asegúrate de que los usuarios estén logueados.

### Comandos de Depuración

En la consola del navegador, puedes ejecutar esto para probar la conectividad:

```javascript
// Verificar que Firebase Storage esté disponible
console.log('Firebase Storage:', firebase.storage());

// Verificar configuración actual
console.log('Storage bucket:', firebase.app().options.storageBucket);
```

### Reglas Recomendadas para Producción Final

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Imágenes de trading - solo usuarios autenticados
    match /trades/{userId}/{filename} {
      allow write: if request.auth != null 
                   && request.auth.uid == userId
                   && resource == null
                   && request.resource.size < 5 * 1024 * 1024
                   && request.resource.contentType.matches('image/.*');
      
      allow read: if request.auth != null;
    }
    
    // Imágenes de perfil de educadores
    match /images/perfil/{filename} {
      allow read: if true; // Acceso público a imágenes de perfil
      allow write: if request.auth != null
                   && request.resource.size < 10 * 1024 * 1024
                   && request.resource.contentType.matches('image/.*');
    }
  }
}
``` 