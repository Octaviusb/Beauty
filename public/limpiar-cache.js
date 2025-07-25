// Script para limpiar la caché y forzar la recarga de productos
document.addEventListener('DOMContentLoaded', () => {
  // Limpiar caché de localStorage
  console.log('🧹 Limpiando caché...');
  
  // Eliminar cualquier dato de productos en localStorage
  localStorage.removeItem('productos');
  localStorage.removeItem('productosCache');
  localStorage.removeItem('lastUpdate');
  
  // Forzar recarga de la página sin caché
  const reloadButton = document.createElement('button');
  reloadButton.textContent = 'Recargar sin caché';
  reloadButton.style.position = 'fixed';
  reloadButton.style.top = '10px';
  reloadButton.style.right = '10px';
  reloadButton.style.zIndex = '9999';
  reloadButton.style.padding = '8px 16px';
  reloadButton.style.backgroundColor = '#d63384';
  reloadButton.style.color = 'white';
  reloadButton.style.border = 'none';
  reloadButton.style.borderRadius = '4px';
  reloadButton.style.cursor = 'pointer';
  
  reloadButton.addEventListener('click', () => {
    // Forzar recarga sin caché
    window.location.reload(true);
  });
  
  document.body.appendChild(reloadButton);
  
  // Mostrar mensaje
  const message = document.createElement('div');
  message.textContent = 'Caché limpiada. Haz clic en "Recargar sin caché" para ver los cambios.';
  message.style.position = 'fixed';
  message.style.top = '50px';
  message.style.right = '10px';
  message.style.zIndex = '9999';
  message.style.padding = '8px';
  message.style.backgroundColor = '#f8d7da';
  message.style.color = '#721c24';
  message.style.borderRadius = '4px';
  message.style.maxWidth = '300px';
  
  document.body.appendChild(message);
});