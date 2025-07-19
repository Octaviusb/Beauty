// 📦 script.js cargado con defer
console.log("📦 script.js cargado con defer");

// 1. Estado global
const appState = {
  cart: {
    items: [],

    addItem(item) {
      const index = this.items.findIndex(p => p.id === item.id);
      if (index >= 0) {
        this.items[index].quantity += 1;
      } else {
        this.items.push({ ...item, quantity: 1 });
      }
      this.showFeedback(item.name);
    },

    removeItem(id) {
      this.items = this.items.filter(item => item.id !== id);
    },

    clear() {
      this.items = [];
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
    }
  },
  productos: [],
  currentFilter: 'all'
};

// 2. Renderizar productos
function renderizarProductos(productos) {
  console.log('📊 Renderizando productos:', productos?.length || 0);
  const contenedor = document.getElementById('product-list');
  if (!contenedor) {
    console.error('❌ Contenedor de productos no encontrado');
    return;
  }

  if (!productos || productos.length === 0) {
    console.warn('⚠️ No hay productos para mostrar');
    contenedor.innerHTML = "<p class='info-message'>No hay productos disponibles en este momento.</p>";
    return;
  }

  const productosFiltrados = appState.currentFilter === 'all' 
    ? productos 
    : productos.filter(p => p.category === appState.currentFilter);
  
  console.log('🔍 Productos filtrados:', productosFiltrados.length, 'Filtro actual:', appState.currentFilter);

  try {
    contenedor.innerHTML = productosFiltrados.map(producto => (
      "<div class='product-card'>" +
        "<div class='product-image-container'>" +
          "<img src='" + producto.image + "' alt='" + producto.name + "' class='product-image' loading='lazy'>" +
        "</div>" +
        "<div class='product-info'>" +
          "<h3 class='product-title'>" + producto.name + "</h3>" +
          (producto.description ? "<p class='product-description'>" + producto.description + "</p>" : "") +
          "<div class='product-price'>$" + producto.price.toFixed(2) + "</div>" +
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
        appState.cart.addItem(productData);
        actualizarContadorCarrito();
      });
    });
    
    console.log('✅ Eventos de botones configurados');
  } catch (error) {
    console.error('❌ Error al renderizar productos:', error);
    contenedor.innerHTML = "<p class='error-message'>Error al mostrar los productos: " + error.message + "</p>";
  }
}

function mostrarCarrito() {
  const modal = document.getElementById('carrito-modal');
  const lista = modal.querySelector('.cart-items');
  const total = modal.querySelector('.total-amount');

  if (!modal || !lista || !total) return;

  lista.innerHTML = '';

  if (appState.cart.items.length === 0) {
    lista.innerHTML = '<p class="empty-cart">Tu carrito está vacío</p>';
    total.textContent = '$0.00';
  } else {
    appState.cart.items.forEach(item => {
      const itemDiv = document.createElement('div');
      itemDiv.className = 'cart-item';
      itemDiv.innerHTML = `
        <span class="item-name">${item.name}</span>
        <span class="item-quantity">x${item.quantity}</span>
        <span class="item-price">$${(item.price * item.quantity).toFixed(2)}</span>
      `;
      lista.appendChild(itemDiv);
    });
    total.textContent = `$${appState.cart.getTotal().toLocaleString()}`;
  }

  modal.classList.remove('hidden');
  modal.classList.add('active');
  modal.setAttribute('aria-modal', 'true');
}

function cerrarCarrito() {
  const modal = document.getElementById('carrito-modal');
  if (modal) {
    modal.classList.remove('active');
    modal.classList.add('hidden');
    modal.setAttribute('aria-modal', 'false');
  }
}

function actualizarContadorCarrito() {
  const count = appState.cart.items.reduce((sum, item) => sum + item.quantity, 0);
  const countElement = document.getElementById('cart-count');
  if (countElement) {
    countElement.textContent = count;
    countElement.style.display = count ? 'inline-block' : 'none';
  }
}

// Cargar productos simplificado
function cargarProductos() {
  console.log('🔄 Cargando productos...');
  
  // Usar directamente los productos de respaldo primero
  if (window.productosRespaldo && window.productosRespaldo.length > 0) {
    appState.productos = window.productosRespaldo;
    console.log('✅ Productos de respaldo cargados:', window.productosRespaldo.length);
    renderizarProductos(window.productosRespaldo);
    setupFilters();
  } else {
    cargarProductosRespaldo();
  }
  
  // Intentar cargar productos desde la API en segundo plano
  fetch('/api/products')
    .then(response => {
      if (!response.ok) throw new Error(`Error: ${response.status}`);
      return response.json();
    })
    .then(productos => {
      if (Array.isArray(productos) && productos.length > 0) {
        appState.productos = productos;
        console.log('✅ Productos de API cargados:', productos.length);
        renderizarProductos(productos);
        setupFilters();
      }
    })
    .catch(error => {
      console.error('❌ Error al cargar productos de API:', error);
    });
}

// Función de respaldo para cargar productos
function cargarProductosRespaldo() {
  console.log('🚨 Cargando productos de respaldo...');
  
  // Datos de productos de respaldo
  const productosRespaldo = [
    {
      id: "1",
      name: "Crema Hidratante",
      price: 45000,
      description: "Crema hidratante para todo tipo de piel",
      category: "skincare",
      image: "/images/skincare/crema-de-da.jpg"
    },
    {
      id: "2",
      name: "Serum Facial",
      price: 65000,
      description: "Serum antioxidante con vitamina C",
      category: "skincare",
      image: "/images/skincare/serum-antioxidante.jpg"
    },
    {
      id: "3",
      name: "Esmalte de Uñas",
      price: 18000,
      description: "Esmalte de larga duración",
      category: "esmaltes",
      image: "/images/esmaltes/img1.jpg"
    },
    {
      id: "4",
      name: "Set de Brochas",
      price: 85000,
      description: "Set de 10 brochas profesionales",
      category: "accesorios",
      image: "/images/accesorios/set-de-brochas-10-piezas.jpg"
    },
    {
      id: "5",
      name: "Gel de Baño",
      price: 28000,
      description: "Gel de baño con aroma a lavanda",
      category: "higiene",
      image: "/images/higiene/gel-de-bao.jpg"
    },
    {
      id: "6",
      name: "Base de Maquillaje",
      price: 55000,
      description: "Base de maquillaje de larga duración",
      category: "maquillaje",
      image: "/images/maquillaje/img70.jpg"
    }
  ];
  
  appState.productos = productosRespaldo;
  console.log('✅ Productos de respaldo cargados:', appState.productos.length);
  renderizarProductos(productosRespaldo);
  setupFilters();
}

function setupFilters() {
  const filterButtons = document.querySelectorAll('.filter-btn');
  filterButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      appState.currentFilter = btn.dataset.filter;
      renderizarProductos(appState.productos);
      filterButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    });
  });
}

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
      appState.cart.clear();
      actualizarContadorCarrito();
      mostrarCarrito();
    });
  }

  if (finalizarCompraBtn) {
    finalizarCompraBtn.addEventListener('click', mostrarFormularioPedido);
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
  
  // Cerrar el modal del carrito
  cerrarCarrito();
  
  // Llenar el resumen del pedido
  summaryItems.innerHTML = '';
  appState.cart.items.forEach(item => {
    const itemDiv = document.createElement('div');
    itemDiv.className = 'summary-item';
    itemDiv.innerHTML = `
      <span class="item-name">${item.name} x${item.quantity}</span>
      <span class="item-price">$${(item.price * item.quantity).toLocaleString()}</span>
    `;
    summaryItems.appendChild(itemDiv);
  });
  
  // Calcular totales
  const subtotal = appState.cart.getTotal();
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
    const metodoPago = formulario.querySelector('input[name="payment-method"]:checked').value;
    
    // Validar datos básicos
    if (!nombre || !email || !telefono || !direccion || !ciudad) {
      alert('Por favor completa todos los campos obligatorios.');
      return;
    }
    
    // Crear objeto con datos del cliente
    const cliente = {
      nombre,
      email,
      telefono,
      direccion: `${direccion}, ${ciudad}`,
      referidor
    };
    
    // Calcular totales
    const subtotal = appState.cart.getTotal();
    const shipping = subtotal > 200000 ? 0 : 12000;
    const total = subtotal + shipping;
    
    // Generar número de pedido
    const orderNumber = `BL-${Date.now().toString().slice(-6)}`;
    
    // Preparar datos del carrito para el correo
    const carrito = appState.cart.items.map(item => `${item.quantity}x ${item.name} ($${item.price})`).join(", ");
    
    // Verificar que EmailJS esté disponible
    if (typeof emailjs === 'undefined') {
      console.error('❌ EmailJS no está disponible');
      alert("Error al procesar el pedido: El servicio de correo no está disponible. Por favor, intenta nuevamente.");
      return;
    }
    
    // Enviar correo con los datos del pedido
    emailjs.send("service_owxur5f", "template_sck7rdl", {
      nombre,
      email,
      telefono,
      direccion: `${direccion}, ${ciudad}`,
      referidor,
      metodo_pago: metodoPago,
      total: total.toFixed(2),
      carrito,
      referencia: orderNumber
    }, "Cqwg1EyqFLvPg7ULx")
    .then(function(response) {
      console.log("📧 Pedido enviado correctamente");
      
      // Cerrar formulario de checkout
      const checkoutForm = document.getElementById('checkoutForm');
      checkoutForm.classList.remove('active');
      checkoutForm.classList.add('hidden');
      
      // Procesar según el método de pago seleccionado
      if (metodoPago === 'wompi') {
        procesarPagoWompi(total, orderNumber, cliente, carrito);
      } else if (metodoPago === 'pse') {
        procesarPagoPSE(total, orderNumber, cliente, carrito);
      }
    })
    .catch(function(error) {
      console.error("❌ Error al enviar correo:", error);
      alert("Hubo un error al procesar el pedido. Por favor, intenta nuevamente.");
    });
  } catch (error) {
    console.error('❌ Error en procesarPedido:', error);
    alert("Ocurrió un error inesperado. Por favor, intenta nuevamente.");
  }
}

// Función para procesar pago con Wompi
function procesarPagoWompi(total, orderNumber, cliente, carrito) {
  console.log('💳 Procesando pago con Wompi...');
  
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
          <p class="important-note">IMPORTANTE: Por favor ingresa exactamente el monto indicado arriba.</p>
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
    appState.cart.clear();
    actualizarContadorCarrito();
  });
}

// Función para procesar pago PSE
function procesarPagoPSE(total, orderNumber, cliente, carrito) {
  console.log('🏦 Procesando pago con PSE...');
  
  // Crear un modal con instrucciones para PSE
  const pseModal = document.createElement('div');
  pseModal.className = 'modal active';
  pseModal.id = 'pseModal';
  pseModal.innerHTML = `
    <div class="modal-content payment-modal">
      <button class="close-modal" aria-label="Cerrar">&times;</button>
      <h2>Pago con PSE</h2>
      <div class="payment-info">
        <p>Para completar tu pago con PSE, por favor selecciona tu banco:</p>
        <div class="form-group">
          <select id="pseBank" class="pse-bank-select">
            <option value="">Selecciona tu banco</option>
            <option value="bancolombia">Bancolombia</option>
            <option value="davivienda">Davivienda</option>
            <option value="bbva">BBVA</option>
            <option value="bogota">Banco de Bogotá</option>
            <option value="popular">Banco Popular</option>
          </select>
        </div>
        <div class="payment-details">
          <p><strong>Monto a pagar:</strong> $${total.toLocaleString()}</p>
          <p><strong>Número de pedido:</strong> ${orderNumber}</p>
        </div>
        <div class="form-actions">
          <button id="btnContinuarPSE" class="btn-submit-order">Continuar al Banco</button>
        </div>
      </div>
    </div>
  `;
  
  document.body.appendChild(pseModal);
  
  // Configurar el botón para continuar a PSE
  document.getElementById('btnContinuarPSE').addEventListener('click', () => {
    const bancoSelect = document.getElementById('pseBank');
    const banco = bancoSelect.value;
    
    if (!banco) {
      alert('Por favor selecciona un banco');
      return;
    }
    
    // Cerrar modal de PSE
    document.getElementById('pseModal').remove();
    
    // Mostrar confirmación
    mostrarConfirmacionPedido(orderNumber);
    
    // Limpiar carrito
    appState.cart.clear();
    actualizarContadorCarrito();
    
    // Redirigir a PSE (simulación con URL real)
    let pseUrl;
    
    switch(banco) {
      case 'bancolombia':
        pseUrl = 'https://sucursalpersonas.transaccionesbancolombia.com/mua/USER';
        break;
      case 'davivienda':
        pseUrl = 'https://www.davivienda.com/wps/portal/personas/nuevo';
        break;
      case 'bbva':
        pseUrl = 'https://www.bbva.com.co/personas.html';
        break;
      case 'bogota':
        pseUrl = 'https://www.bancodebogota.com/wps/portal/banco-de-bogota/bogota';
        break;
      default:
        pseUrl = 'https://www.pse.com.co/persona';
    }
    
    // Redirigir al usuario
    window.location.href = pseUrl;
  });
  
  // Configurar el botón de cerrar
  pseModal.querySelector('.close-modal').addEventListener('click', () => {
    document.getElementById('pseModal').remove();
    mostrarConfirmacionPedido(orderNumber);
    
    // Limpiar carrito
    appState.cart.clear();
    actualizarContadorCarrito();
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

// Función para enviar correo con los datos del pedido
function enviarOrdenPorCorreo(cliente, productos, total) {
  // Esta función ya no es necesaria ya que enviamos el correo directamente
  // desde la función procesarPedido, pero la mantenemos por compatibilidad
  console.log('Usando método directo de envío de correo');
}

// Inicialización cuando el DOM está listo
document.addEventListener('DOMContentLoaded', () => {
  console.log('🚀 Inicializando aplicación...');
  cargarProductos();
  configurarCarrito();
  
  // Cargar script de EmailJS si no está ya cargado
  if (typeof emailjs === 'undefined') {
    console.log('📧 EmailJS no está disponible, cargando desde CDN...');
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/@emailjs/browser@3/dist/email.min.js';
    script.onload = () => {
      emailjs.init("Cqwg1EyqFLvPg7ULx");
      console.log('✅ EmailJS cargado correctamente');
    };
    document.head.appendChild(script);
  } else {
    console.log('✅ EmailJS ya está disponible');
  }
  
  // Añadir campo de referidor si no existe
  const columna = document.querySelector(".form-column");
  if (columna && !document.getElementById('referidor')) {
    columna.insertAdjacentHTML("beforeend", `
      <div class="form-group">
        <label for="referidor">Nombre del Referidor</label>
        <input type="text" id="referidor" name="referidor" autocomplete="off">
      </div>
    `);
  }
  
  // Configurar eventos para cerrar modales con Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      cerrarCarrito();
      const checkoutForm = document.getElementById('checkoutForm');
      const confirmationModal = document.getElementById('confirmationModal');
      const wompiModal = document.getElementById('wompiModal');
      const pseModal = document.getElementById('pseModal');
      
      if (checkoutForm && checkoutForm.classList.contains('active')) {
        checkoutForm.classList.remove('active');
        checkoutForm.classList.add('hidden');
      }
      
      if (confirmationModal && confirmationModal.classList.contains('active')) {
        confirmationModal.classList.remove('active');
        confirmationModal.classList.add('hidden');
      }
      
      if (wompiModal) {
        wompiModal.remove();
      }
      
      if (pseModal) {
        pseModal.remove();
      }
    }
  });
});
