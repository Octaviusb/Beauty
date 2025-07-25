// Aplicación completa de BeautyLine - Versión simplificada

// Variable para almacenar productos
let productos = [];

// Función para cargar productos
function cargarProductos() {
  console.log('🔄 Cargando productos...');
  
  // Usar productos precargados en productos-completo.js
  if (window.productosCompletos && window.productosCompletos.length > 0) {
    console.log(`✅ ${window.productosCompletos.length} productos cargados desde productosCompletos`);
    productos = window.productosCompletos;
  } else {
    // Usar productos de respaldo si no hay productos completos
    console.warn('⚠️ Usando productos de respaldo');
    productos = window.productosRespaldo || [];
  }
  
  renderizarProductos();
  return productos;
}

// Estado de la aplicación
const carrito = {
  items: [],
  
  addItem(item) {
    const index = this.items.findIndex(p => p.id === item.id);
    if (index >= 0) {
      this.items[index].quantity += 1;
    } else {
      this.items.push({ ...item, quantity: 1 });
    }
    this.showFeedback(item.name);
    this.updateCount();
  },
  
  removeItem(id) {
    this.items = this.items.filter(item => item.id !== id);
    this.updateCount();
  },
  
  clear() {
    this.items = [];
    this.updateCount();
  },
  
  getTotal() {
    return this.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  },
  
  showFeedback(productName) {
    const feedback = document.createElement('div');
    feedback.className = 'cart-feedback';
    feedback.textContent = "✓ " + productName + " agregado";
    document.body.appendChild(feedback);
    setTimeout(() => feedback.remove(), 2000);
  },
  
  updateCount() {
    const count = this.items.reduce((sum, item) => sum + item.quantity, 0);
    const countElement = document.getElementById('cart-count');
    if (countElement) {
      countElement.textContent = count;
      countElement.style.display = count ? 'inline-block' : 'none';
    }
  }
};

// Filtro actual
let currentFilter = 'all';

// Renderizar productos
function renderizarProductos() {
  console.log('📊 Renderizando productos:', productos.length);
  const contenedor = document.getElementById('product-list');
  if (!contenedor) {
    console.error('❌ Contenedor de productos no encontrado');
    return;
  }

  const productosFiltrados = currentFilter === 'all' 
    ? productos 
    : productos.filter(p => p.category === currentFilter);
  
  console.log('🔍 Productos filtrados:', productosFiltrados.length, 'Filtro actual:', currentFilter);

  try {
    contenedor.innerHTML = productosFiltrados.map(producto => (
      "<div class='product-card'>" +
        "<div class='product-image-container'>" +
          "<img src='" + producto.image + "' alt='" + producto.name + "' class='product-image' loading='lazy'>" +
        "</div>" +
        "<div class='product-info'>" +
          "<h3 class='product-title'>" + producto.name + "</h3>" +
          (producto.description ? "<p class='product-description'>" + producto.description + "</p>" : "") +
          "<div class='product-price'>$" + producto.price.toLocaleString() + "</div>" +
          "<button class='add-to-cart' data-id='" + producto.id + "' data-name='" + producto.name + "' data-price='" + producto.price + "'>Agregar al carrito</button>" +
        "</div>" +
      "</div>"
    )).join('');

    console.log('✅ HTML de productos generado correctamente');

    document.querySelectorAll('.add-to-cart').forEach(btn => {
      btn.addEventListener('click', () => {
        const productData = {
          id: btn.dataset.id,
          name: btn.dataset.name,
          price: Number(btn.dataset.price)
        };
        carrito.addItem(productData);
      });
    });
    
    console.log('✅ Eventos de botones configurados');
  } catch (error) {
    console.error('❌ Error al renderizar productos:', error);
    contenedor.innerHTML = "<p class='error-message'>Error al mostrar los productos: " + error.message + "</p>";
  }
}

// Mostrar carrito
function mostrarCarrito() {
  const modal = document.getElementById('carrito-modal');
  const lista = modal.querySelector('.cart-items');
  const total = modal.querySelector('.total-amount');

  if (!modal || !lista || !total) return;

  lista.innerHTML = '';

  if (carrito.items.length === 0) {
    lista.innerHTML = '<p class="empty-cart">Tu carrito está vacío</p>';
    total.textContent = '$0.00';
  } else {
    carrito.items.forEach(item => {
      const itemDiv = document.createElement('div');
      itemDiv.className = 'cart-item';
      itemDiv.innerHTML = `
        <span class="item-name">${item.name}</span>
        <span class="item-quantity">x${item.quantity}</span>
        <span class="item-price">$${(item.price * item.quantity).toLocaleString()}</span>
      `;
      lista.appendChild(itemDiv);
    });
    total.textContent = `$${carrito.getTotal().toLocaleString()}`;
  }

  modal.classList.remove('hidden');
  modal.classList.add('active');
  modal.setAttribute('aria-modal', 'true');
}

// Cerrar carrito
function cerrarCarrito() {
  const modal = document.getElementById('carrito-modal');
  if (modal) {
    modal.classList.remove('active');
    modal.classList.add('hidden');
    modal.setAttribute('aria-modal', 'false');
  }
}

// Configurar filtros
function setupFilters() {
  const filterButtons = document.querySelectorAll('.filter-btn');
  filterButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      currentFilter = btn.dataset.filter;
      renderizarProductos();
      filterButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    });
  });
}

// Configurar carrito
function configurarCarrito() {
  const cartButton = document.getElementById('cartButton');
  const finalizarCompraBtn = document.getElementById('finalizarCompra');
  const limpiarCarritoBtn = document.getElementById('limpiarCarrito');
  const closeCartBtn = document.querySelector('.close-cart');

  if (cartButton) {
    cartButton.addEventListener('click', () => {
      mostrarCarrito();
    });
  }

  if (closeCartBtn) {
    closeCartBtn.addEventListener('click', cerrarCarrito);
  }

  if (limpiarCarritoBtn) {
    limpiarCarritoBtn.addEventListener('click', () => {
      carrito.clear();
      mostrarCarrito();
    });
  }

  if (finalizarCompraBtn) {
    finalizarCompraBtn.addEventListener('click', () => {
      cerrarCarrito();
      mostrarFormularioPedido();
    });
  }
}

// Función para mostrar el formulario de pedido
function mostrarFormularioPedido() {
  console.log('🧾 Mostrando formulario de pedido');
  const checkoutForm = document.getElementById('checkoutForm');
  const summaryItems = checkoutForm.querySelector('.summary-items');
  const subtotalElement = checkoutForm.querySelector('.subtotal-amount');
  const shippingElement = checkoutForm.querySelector('.shipping-amount');
  const totalElement = checkoutForm.querySelector('.total-amount');
  
  // Llenar el resumen del pedido
  summaryItems.innerHTML = '';
  carrito.items.forEach(item => {
    const itemDiv = document.createElement('div');
    itemDiv.className = 'summary-item';
    itemDiv.innerHTML = `
      <span class="item-name">${item.name} x${item.quantity}</span>
      <span class="item-price">$${(item.price * item.quantity).toLocaleString()}</span>
    `;
    summaryItems.appendChild(itemDiv);
  });
  
  // Calcular totales
  const subtotal = carrito.getTotal();
  const shipping = subtotal > 200000 ? 0 : 12000; // Envío gratis para compras mayores a $200,000
  const total = subtotal + shipping;
  
  // Actualizar montos en el formulario
  subtotalElement.textContent = `$${subtotal.toLocaleString()}`;
  shippingElement.textContent = shipping === 0 ? 'Gratis' : `$${shipping.toLocaleString()}`;
  totalElement.textContent = `$${total.toLocaleString()}`;
  
  // Mostrar el formulario
  checkoutForm.classList.remove('hidden');
  checkoutForm.classList.add('active');
  checkoutForm.setAttribute('aria-modal', 'true');
  
  // Configurar eventos del formulario
  configurarFormularioPedido();
}

// Configurar eventos del formulario de pedido
function configurarFormularioPedido() {
  const checkoutForm = document.getElementById('checkoutForm');
  const closeFormBtn = checkoutForm.querySelector('.close-form');
  const backToCartBtn = checkoutForm.querySelector('.btn-back-to-cart');
  const formulario = document.getElementById('formularioCompra');
  
  // Cerrar formulario
  if (closeFormBtn) {
    closeFormBtn.addEventListener('click', () => {
      checkoutForm.classList.remove('active');
      checkoutForm.classList.add('hidden');
      checkoutForm.setAttribute('aria-modal', 'false');
    });
  }
  
  // Volver al carrito
  if (backToCartBtn) {
    backToCartBtn.addEventListener('click', () => {
      checkoutForm.classList.remove('active');
      checkoutForm.classList.add('hidden');
      mostrarCarrito();
    });
  }
  
  // Enviar formulario
  if (formulario) {
    formulario.addEventListener('submit', procesarPedido);
  }
}

// Procesar el pedido cuando se envía el formulario
function procesarPedido(event) {
  event.preventDefault();
  console.log('🛒 Procesando pedido...');
  
  try {
    // Obtener datos del formulario
    const formulario = document.getElementById('formularioCompra');
    const nombre = formulario.querySelector('#nombre').value;
    const email = formulario.querySelector('#email').value;
    const telefono = formulario.querySelector('#telefono').value;
    const direccion = formulario.querySelector('#direccion').value;
    const ciudad = formulario.querySelector('#ciudad').value;
    const referidor = formulario.querySelector('#referidor')?.value || '';
    
    // Validar datos básicos
    if (!nombre || !email || !telefono || !direccion || !ciudad) {
      alert('Por favor completa todos los campos obligatorios.');
      return;
    }
    
    // Calcular totales
    const subtotal = carrito.getTotal();
    const shipping = subtotal > 200000 ? 0 : 12000;
    const total = subtotal + shipping;
    
    // Generar número de pedido
    const orderNumber = `BL-${Date.now().toString().slice(-6)}`;
    
    // Preparar datos del carrito para el correo
    const carritoItems = carrito.items.map(item => `${item.quantity}x ${item.name} ($${item.price.toLocaleString()})`).join(", ");
    
    // Enviar correo con los datos del pedido usando EmailJS
    if (typeof emailjs !== 'undefined') {
      emailjs.send("service_owxur5f", "template_sck7rdl", {
        nombre,
        email,
        telefono,
        direccion: `${direccion}, ${ciudad}`,
        referidor,
        metodo_pago: 'Wompi',
        total: total.toLocaleString(),
        carrito: carritoItems,
        referencia: orderNumber
      }, "Cqwg1EyqFLvPg7ULx")
      .then(function(response) {
        console.log("📧 Pedido enviado correctamente");
        
        // Cerrar formulario de checkout
        const checkoutForm = document.getElementById('checkoutForm');
        checkoutForm.classList.remove('active');
        checkoutForm.classList.add('hidden');
        
        // Mostrar modal de Wompi
        mostrarModalWompi(total, orderNumber);
      })
      .catch(function(error) {
        console.error("❌ Error al enviar correo:", error);
        alert("Hubo un error al procesar el pedido. Por favor, intenta nuevamente.");
      });
    } else {
      console.error('❌ EmailJS no está disponible');
      alert("Error al procesar el pedido: El servicio de correo no está disponible. Por favor, intenta nuevamente.");
    }
  } catch (error) {
    console.error('❌ Error en procesarPedido:', error);
    alert("Ocurrió un error inesperado. Por favor, intenta nuevamente.");
  }
}

// Mostrar modal de Wompi
function mostrarModalWompi(total, orderNumber) {
  console.log('💳 Preparando pago con Wompi...');
  
  // Crear un modal con instrucciones para Wompi
  const wompiModal = document.createElement('div');
  wompiModal.className = 'modal active';
  wompiModal.id = 'wompiModal';
  wompiModal.innerHTML = `
    <div class="modal-content payment-modal">
      <button class="close-modal" aria-label="Cerrar">&times;</button>
      <h2>Pago con Wompi</h2>
      <div class="payment-info">
        <p>A continuación serás redirigido a Wompi para completar tu pago.</p>
        <div class="payment-details">
          <p><strong>Monto a pagar:</strong> $${total.toLocaleString()}</p>
          <p><strong>Número de pedido:</strong> ${orderNumber}</p>
          <p class="important-note">IMPORTANTE: Por favor ingresa exactamente el monto indicado arriba. Cualquier inconsistencia impedirá que el pedido sea despachado.</p>
        </div>
        <div class="form-actions">
          <button id="btnIrAWompi" class="btn-submit-order">Ir a Wompi</button>
        </div>
      </div>
    </div>
  `;
  
  document.body.appendChild(wompiModal);
  
  // Configurar el botón para ir a Wompi
  document.getElementById('btnIrAWompi').addEventListener('click', () => {
    // Enlace de Wompi proporcionado
    window.location.href = 'https://checkout.wompi.co/l/VPOS_nJo3xk';
  });
  
  // Configurar el botón de cerrar
  wompiModal.querySelector('.close-modal').addEventListener('click', () => {
    document.getElementById('wompiModal').remove();
    mostrarConfirmacionPedido(orderNumber);
    
    // Limpiar carrito
    carrito.clear();
  });
}

// Mostrar modal de confirmación de pedido
function mostrarConfirmacionPedido(orderNumber) {
  const confirmationModal = document.getElementById('confirmationModal');
  const orderNumberElement = document.getElementById('order-number');
  const continuarComprandoBtn = document.getElementById('btn-continue-shopping');
  
  // Actualizar número de pedido
  if (orderNumberElement) {
    orderNumberElement.textContent = orderNumber;
  }
  
  // Mostrar modal
  confirmationModal.classList.remove('hidden');
  confirmationModal.classList.add('active');
  
  // Configurar botón para continuar comprando
  if (continuarComprandoBtn) {
    continuarComprandoBtn.addEventListener('click', () => {
      confirmationModal.classList.remove('active');
      confirmationModal.classList.add('hidden');
    });
  }
}

// Inicializar
document.addEventListener('DOMContentLoaded', () => {
  console.log('🚀 Inicializando aplicación...');
  cargarProductos();
  setupFilters();
  configurarCarrito();
  carrito.updateCount();
  
  // Cargar EmailJS
  const script = document.createElement('script');
  script.src = 'https://cdn.jsdelivr.net/npm/@emailjs/browser@3/dist/email.min.js';
  script.onload = () => {
    window.emailjs.init("Cqwg1EyqFLvPg7ULx");
    console.log('✅ EmailJS cargado correctamente');
  };
  document.head.appendChild(script);
});