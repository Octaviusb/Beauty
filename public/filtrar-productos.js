// Script para filtrar productos problemáticos
document.addEventListener('DOMContentLoaded', () => {
  // Ejecutar después de que se carguen los productos
  setTimeout(() => {
    console.log('🔍 Filtrando productos problemáticos...');
    
    // IDs y nombres de productos a eliminar
    const idsProblematicos = [10, 40, 49, "10", "40", "49"];
    const nombresProblematicos = ["Lima de Uñas Eléctrica", "Jabón Antibacterial", "Crema Nutritiva"];
    
    // Filtrar productos del estado global
    if (window.appState && window.appState.productos) {
      const cantidadAntes = window.appState.productos.length;
      
      // Filtrar productos problemáticos
      window.appState.productos = window.appState.productos.filter(p => {
        return !idsProblematicos.includes(p.id) && !nombresProblematicos.includes(p.name);
      });
      
      console.log(`✅ Productos filtrados: ${cantidadAntes} → ${window.appState.productos.length}`);
      
      // Volver a renderizar los productos
      if (window.renderizarProductos) {
        window.renderizarProductos(window.appState.productos);
      }
    }
  }, 1000); // Esperar 1 segundo para asegurar que los productos se hayan cargado
});
