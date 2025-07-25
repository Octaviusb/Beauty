// Este archivo contiene correcciones específicas para el despliegue en Vercel

// Función para corregir rutas de API en entorno de producción
(function() {
  // Verificar si estamos en producción (Vercel)
  const isProduction = window.location.hostname !== 'localhost' && 
                      window.location.hostname !== '127.0.0.1';
  
  if (isProduction) {
    // Sobrescribir fetch para redirigir las llamadas a la API
    const originalFetch = window.fetch;
    
    window.fetch = function(url, options) {
      // Si la URL comienza con /api/, asegurarse de que use la URL base correcta
      if (typeof url === 'string' && url.startsWith('/api/')) {
        // Usar la URL de la API de Vercel
        return originalFetch(`${window.location.origin}${url}`, options);
      }
      
      // Para otras solicitudes, usar fetch normal
      return originalFetch(url, options);
    };
    
    console.log('✅ Vercel API routes fix applied');
  }
})();