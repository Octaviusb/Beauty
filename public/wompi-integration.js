// Integración con Wompi para BeautyLine

// Configuración de Wompi
const WOMPI_PUBLIC_KEY = 'pub_test_Q5yDA9xoKdePzhSGeVe9HAez7HgGORGf'; // Reemplaza con tu clave pública de Wompi

/**
 * Inicializa el formulario de pago de Wompi
 * @param {number} amount - Monto a pagar en centavos (ej: 25000 para $250.00)
 * @param {string} reference - Referencia única del pedido
 * @param {string} customerEmail - Email del cliente
 * @param {string} customerName - Nombre del cliente
 * @param {Function} onSuccess - Función a ejecutar cuando el pago es exitoso
 * @param {Function} onError - Función a ejecutar cuando hay un error en el pago
 */
function initWompiCheckout(amount, reference, customerEmail, customerName, onSuccess, onError) {
  // Verificar si el script de Wompi ya está cargado
  if (typeof window.WidgetCheckout !== 'function') {
    loadWompiScript(() => {
      createWompiWidget(amount, reference, customerEmail, customerName, onSuccess, onError);
    });
  } else {
    createWompiWidget(amount, reference, customerEmail, customerName, onSuccess, onError);
  }
}

/**
 * Carga el script de Wompi
 * @param {Function} callback - Función a ejecutar cuando el script está cargado
 */
function loadWompiScript(callback) {
  const script = document.createElement('script');
  script.src = 'https://checkout.wompi.co/widget.js';
  script.onload = callback;
  document.head.appendChild(script);
}

/**
 * Crea el widget de Wompi
 */
function createWompiWidget(amount, reference, customerEmail, customerName, onSuccess, onError) {
  try {
    // Crear contenedor para el widget
    const wompiContainer = document.createElement('div');
    wompiContainer.id = 'wompi-container';
    wompiContainer.style.position = 'fixed';
    wompiContainer.style.top = '0';
    wompiContainer.style.left = '0';
    wompiContainer.style.width = '100%';
    wompiContainer.style.height = '100%';
    wompiContainer.style.zIndex = '9999';
    wompiContainer.style.backgroundColor = 'rgba(0,0,0,0.5)';
    wompiContainer.style.display = 'flex';
    wompiContainer.style.justifyContent = 'center';
    wompiContainer.style.alignItems = 'center';
    
    document.body.appendChild(wompiContainer);
    
    // Crear el widget de Wompi
    const checkout = new WidgetCheckout({
      currency: 'COP',
      amountInCents: amount * 100, // Convertir a centavos
      reference: reference,
      publicKey: WOMPI_PUBLIC_KEY,
      redirectUrl: window.location.href, // Redirigir a la misma página
      customerData: {
        email: customerEmail,
        fullName: customerName
      }
    });
    
    // Configurar eventos
    checkout.on('success', (data) => {
      console.log('Pago exitoso:', data);
      removeWompiContainer();
      if (onSuccess) onSuccess(data);
    });
    
    checkout.on('error', (error) => {
      console.error('Error en el pago:', error);
      removeWompiContainer();
      if (onError) onError(error);
    });
    
    checkout.on('close', () => {
      console.log('Widget cerrado');
      removeWompiContainer();
    });
    
    // Abrir el widget
    checkout.open(wompiContainer);
    
  } catch (error) {
    console.error('Error al inicializar Wompi:', error);
    if (onError) onError(error);
  }
}

/**
 * Elimina el contenedor de Wompi
 */
function removeWompiContainer() {
  const container = document.getElementById('wompi-container');
  if (container) {
    container.remove();
  }
}

// Exportar funciones
window.wompiCheckout = {
  init: initWompiCheckout
};