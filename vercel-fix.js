// Script para corregir problemas específicos en Vercel
(function() {
  console.log('🔧 Aplicando correcciones para Vercel...');
  
  // Lista de productos problemáticos que deben ser eliminados
  window.productosProblematicos = {
    ids: [10, 40, 49, "10", "40", "49"],
    nombres: ["Lima de Uñas Eléctrica", "Jabón Antibacterial", "Crema Nutritiva"]
  };
  
  // Función para filtrar productos
  window.filtrarProductosProblematicos = function(productos) {
    if (!productos || !Array.isArray(productos)) return productos;
    
    return productos.filter(p => {
      return !window.productosProblematicos.ids.includes(p.id) && 
             !window.productosProblematicos.nombres.includes(p.name);
    });
  };
  
  // Sobreescribir fetch para interceptar respuestas de productos
  const originalFetch = window.fetch;
  window.fetch = function(...args) {
    return originalFetch.apply(this, args).then(response => {
      // Clonar la respuesta para no consumirla
      const clonedResponse = response.clone();
      
      // Si la URL contiene 'productos.json' o '/api/products'
      if (args[0] && 
          (args[0].toString().includes('productos.json') || 
           args[0].toString().includes('/api/products'))) {
        
        return clonedResponse.json().then(data => {
          // Filtrar productos problemáticos
          const filteredData = window.filtrarProductosProblematicos(data);
          
          // Crear una nueva respuesta con los datos filtrados
          const filteredResponse = new Response(JSON.stringify(filteredData), {
            status: response.status,
            statusText: response.statusText,
            headers: response.headers
          });
          
          return filteredResponse;
        }).catch(() => {
          // Si hay error al procesar JSON, devolver la respuesta original
          return response;
        });
      }
      
      // Para otras URLs, devolver la respuesta original
      return response;
    });
  };
  
  console.log('✅ Correcciones para Vercel aplicadas');
})();
