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
  cargarProductosRespaldo();
  
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
    
    // Procesar según el método de pago seleccionado
    switch(metodoPago) {
      case 'tarjeta':
        mostrarModalPagoTarjeta(total, orderNumber, cliente, carrito);
        break;
      case 'pse':
        mostrarModalPagoPSE(total, orderNumber, cliente, carrito);
        break;
      case 'nequi':
        mostrarModalPagoNequi(total, orderNumber, cliente, carrito);
        break;
      case 'daviplata':
        mostrarModalPagoDaviplata(total, orderNumber, cliente, carrito);
        break;
      case 'bancolombia':
        mostrarModalPagoBancolombia(total, orderNumber, cliente, carrito);
        break;
      case 'transferencia':
        mostrarModalTransferencia(total, orderNumber, cliente, carrito);
        break;
      default: // Efectivo o contraentrega
        // Enviar correo con los datos del pedido
        emailjs.send("service_owxur5f", "template_sck7rdl", {
          nombre,
          email,
          telefono,
          direccion: `${direccion}, ${ciudad}`,
          referidor,
          metodo_pago: metodoPago,
          total: total.toFixed(2),
          carrito
        }, "Cqwg1EyqFLvPg7ULx")
        .then(function(response) {
          console.log("📧 Pedido enviado correctamente");
          
          // Mostrar confirmación
          mostrarConfirmacionPedido(orderNumber);
          
          // Limpiar carrito
          appState.cart.clear();
          actualizarContadorCarrito();
          
          // Cerrar formulario
          const checkoutForm = document.getElementById('checkoutForm');
          checkoutForm.classList.remove('active');
          checkoutForm.classList.add('hidden');
        })
        .catch(function(error) {
          console.error("❌ Error al enviar correo:", error);
          alert("Hubo un error al enviar tu pedido. Por favor, intenta nuevamente.");
        });
    }
  } catch (error) {
    console.error('❌ Error en procesarPedido:', error);
    alert("Ocurrió un error inesperado. Por favor, intenta nuevamente.");
  }
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

// Función para mostrar modal de pago con tarjeta
function mostrarModalPagoTarjeta(total, orderNumber, cliente, carrito) {
  // Crear modal de pago con tarjeta si no existe
  let modalPagoTarjeta = document.getElementById('modalPagoTarjeta');
  
  if (!modalPagoTarjeta) {
    modalPagoTarjeta = document.createElement('div');
    modalPagoTarjeta.id = 'modalPagoTarjeta';
    modalPagoTarjeta.className = 'modal hidden';
    modalPagoTarjeta.setAttribute('role', 'dialog');
    modalPagoTarjeta.setAttribute('aria-modal', 'true');
    
    modalPagoTarjeta.innerHTML = `
      <div class="modal-content payment-modal">
        <button class="close-modal" aria-label="Cerrar">&times;</button>
        <h2>Pago con Tarjeta</h2>
        <div class="payment-info">
          <p>Total a pagar: <strong>$${total.toLocaleString()}</strong></p>
          <p>Número de pedido: <strong>${orderNumber}</strong></p>
          
          <form id="formPagoTarjeta" class="payment-form">
            <div class="form-group">
              <label for="cardNumber">Número de Tarjeta</label>
              <input type="text" id="cardNumber" placeholder="1234 5678 9012 3456" required>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label for="cardExpiry">Fecha de Expiración</label>
                <input type="text" id="cardExpiry" placeholder="MM/AA" required>
              </div>
              <div class="form-group">
                <label for="cardCVC">CVC</label>
                <input type="text" id="cardCVC" placeholder="123" required>
              </div>
            </div>
            <div class="form-group">
              <label for="cardName">Nombre en la Tarjeta</label>
              <input type="text" id="cardName" placeholder="NOMBRE APELLIDO" required>
            </div>
            <button type="submit" class="btn-submit-payment">Pagar Ahora</button>
          </form>
        </div>
      </div>
    `;
    
    document.body.appendChild(modalPagoTarjeta);
    
    // Configurar eventos
    const closeBtn = modalPagoTarjeta.querySelector('.close-modal');
    const form = modalPagoTarjeta.querySelector('#formPagoTarjeta');
    
    closeBtn.addEventListener('click', () => {
      modalPagoTarjeta.classList.remove('active');
      modalPagoTarjeta.classList.add('hidden');
    });
    
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      procesarPagoTarjeta(total, orderNumber, cliente, carrito);
    });
  }
  
  // Mostrar modal
  modalPagoTarjeta.classList.remove('hidden');
  modalPagoTarjeta.classList.add('active');
}

// Función para procesar pago con tarjeta
function procesarPagoTarjeta(total, orderNumber, cliente, carrito) {
  // Simular procesamiento de pago
  console.log('💳 Procesando pago con tarjeta...');
  
  // Enviar correo con los datos del pedido
  emailjs.send("service_owxur5f", "template_sck7rdl", {
    nombre: cliente.nombre,
    email: cliente.email,
    telefono: cliente.telefono,
    direccion: cliente.direccion,
    referidor: cliente.referidor,
    metodo_pago: 'Tarjeta de crédito/débito',
    total: total.toFixed(2),
    carrito: carrito
  }, "Cqwg1EyqFLvPg7ULx")
  .then(function(response) {
    console.log("📧 Pedido con pago de tarjeta enviado correctamente");
    
    // Cerrar modal de pago
    const modalPagoTarjeta = document.getElementById('modalPagoTarjeta');
    modalPagoTarjeta.classList.remove('active');
    modalPagoTarjeta.classList.add('hidden');
    
    // Cerrar formulario de checkout
    const checkoutForm = document.getElementById('checkoutForm');
    checkoutForm.classList.remove('active');
    checkoutForm.classList.add('hidden');
    
    // Mostrar confirmación
    mostrarConfirmacionPedido(orderNumber);
    
    // Limpiar carrito
    appState.cart.clear();
    actualizarContadorCarrito();
  })
  .catch(function(error) {
    console.error("❌ Error al enviar correo:", error);
    alert("Hubo un error al procesar el pago. Por favor, intenta nuevamente.");
  });
}

// Función para mostrar modal de pago PSE
function mostrarModalPagoPSE(total, orderNumber, cliente, carrito) {
  // Crear modal de pago PSE si no existe
  let modalPagoPSE = document.getElementById('modalPagoPSE');
  
  if (!modalPagoPSE) {
    modalPagoPSE = document.createElement('div');
    modalPagoPSE.id = 'modalPagoPSE';
    modalPagoPSE.className = 'modal hidden';
    modalPagoPSE.setAttribute('role', 'dialog');
    modalPagoPSE.setAttribute('aria-modal', 'true');
    
    modalPagoPSE.innerHTML = `
      <div class="modal-content payment-modal">
        <button class="close-modal" aria-label="Cerrar">&times;</button>
        <h2>Pago con PSE</h2>
        <div class="payment-info">
          <p>Total a pagar: <strong>$${total.toLocaleString()}</strong></p>
          <p>Número de pedido: <strong>${orderNumber}</strong></p>
          
          <form id="formPagoPSE" class="payment-form">
            <div class="form-group">
              <label for="pseBank">Selecciona tu banco</label>
              <select id="pseBank" required>
                <option value="">Selecciona un banco</option>
                <option value="bancolombia">Bancolombia</option>
                <option value="davivienda">Davivienda</option>
                <option value="bbva">BBVA</option>
                <option value="bogota">Banco de Bogotá</option>
                <option value="popular">Banco Popular</option>
              </select>
            </div>
            <div class="form-group">
              <label for="pseType">Tipo de persona</label>
              <select id="pseType" required>
                <option value="natural">Persona Natural</option>
                <option value="juridica">Persona Jurídica</option>
              </select>
            </div>
            <div class="form-group">
              <label for="pseDocument">Número de documento</label>
              <input type="text" id="pseDocument" required>
            </div>
            <button type="submit" class="btn-submit-payment">Continuar al Banco</button>
          </form>
        </div>
      </div>
    `;
    
    document.body.appendChild(modalPagoPSE);
    
    // Configurar eventos
    const closeBtn = modalPagoPSE.querySelector('.close-modal');
    const form = modalPagoPSE.querySelector('#formPagoPSE');
    
    closeBtn.addEventListener('click', () => {
      modalPagoPSE.classList.remove('active');
      modalPagoPSE.classList.add('hidden');
    });
    
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      procesarPagoPSE(total, orderNumber, cliente, carrito);
    });
  }
  
  // Mostrar modal
  modalPagoPSE.classList.remove('hidden');
  modalPagoPSE.classList.add('active');
}

// Función para procesar pago PSE
function procesarPagoPSE(total, orderNumber, cliente, carrito) {
  // Simular procesamiento de pago
  console.log('🏧 Procesando pago con PSE...');
  
  // Enviar correo con los datos del pedido
  emailjs.send("service_owxur5f", "template_sck7rdl", {
    nombre: cliente.nombre,
    email: cliente.email,
    telefono: cliente.telefono,
    direccion: cliente.direccion,
    referidor: cliente.referidor,
    metodo_pago: 'PSE',
    total: total.toFixed(2),
    carrito: carrito
  }, "Cqwg1EyqFLvPg7ULx")
  .then(function(response) {
    console.log("📧 Pedido con pago PSE enviado correctamente");
    
    // Cerrar modal de pago
    const modalPagoPSE = document.getElementById('modalPagoPSE');
    modalPagoPSE.classList.remove('active');
    modalPagoPSE.classList.add('hidden');
    
    // Cerrar formulario de checkout
    const checkoutForm = document.getElementById('checkoutForm');
    checkoutForm.classList.remove('active');
    checkoutForm.classList.add('hidden');
    
    // Mostrar confirmación
    mostrarConfirmacionPedido(orderNumber);
    
    // Limpiar carrito
    appState.cart.clear();
    actualizarContadorCarrito();
  })
  .catch(function(error) {
    console.error("❌ Error al enviar correo:", error);
    alert("Hubo un error al procesar el pago. Por favor, intenta nuevamente.");
  });
}

// Función para mostrar modal de pago Nequi
function mostrarModalPagoNequi(total, orderNumber, cliente, carrito) {
  // Crear modal de pago Nequi si no existe
  let modalPagoNequi = document.getElementById('modalPagoNequi');
  
  if (!modalPagoNequi) {
    modalPagoNequi = document.createElement('div');
    modalPagoNequi.id = 'modalPagoNequi';
    modalPagoNequi.className = 'modal hidden';
    modalPagoNequi.setAttribute('role', 'dialog');
    modalPagoNequi.setAttribute('aria-modal', 'true');
    
    modalPagoNequi.innerHTML = `
      <div class="modal-content payment-modal">
        <button class="close-modal" aria-label="Cerrar">&times;</button>
        <h2>Pago con Nequi</h2>
        <div class="payment-info">
          <p>Total a pagar: <strong>$${total.toLocaleString()}</strong></p>
          <p>Número de pedido: <strong>${orderNumber}</strong></p>
          
          <div class="qr-payment">
            <p>Escanea el código QR con tu app de Nequi:</p>
            <img src="/assets/qr-placeholder.png" alt="Código QR para pago" class="qr-code">
          </div>
          
          <div class="manual-payment">
            <p>O realiza una transferencia a:</p>
            <p><strong>Número Nequi:</strong> 320 492 9202</p>
            <p><strong>Nombre:</strong> Beauty Line</p>
          </div>
          
          <form id="formPagoNequi" class="payment-form">
            <div class="form-group">
              <label for="nequiPhone">Tu número de teléfono Nequi</label>
              <input type="tel" id="nequiPhone" placeholder="320 492 9202" required>
            </div>
            <button type="submit" class="btn-submit-payment">Confirmar Pago</button>
          </form>
        </div>
      </div>
    `;
    
    document.body.appendChild(modalPagoNequi);
    
    // Configurar eventos
    const closeBtn = modalPagoNequi.querySelector('.close-modal');
    const form = modalPagoNequi.querySelector('#formPagoNequi');
    
    closeBtn.addEventListener('click', () => {
      modalPagoNequi.classList.remove('active');
      modalPagoNequi.classList.add('hidden');
    });
    
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      procesarPagoNequi(total, orderNumber, cliente, carrito);
    });
  }
  
  // Mostrar modal
  modalPagoNequi.classList.remove('hidden');
  modalPagoNequi.classList.add('active');
}

// Función para procesar pago Nequi
function procesarPagoNequi(total, orderNumber, cliente, carrito) {
  // Simular procesamiento de pago
  console.log('📱 Procesando pago con Nequi...');
  
  // Enviar correo con los datos del pedido
  emailjs.send("service_owxur5f", "template_sck7rdl", {
    nombre: cliente.nombre,
    email: cliente.email,
    telefono: cliente.telefono,
    direccion: cliente.direccion,
    referidor: cliente.referidor,
    metodo_pago: 'Nequi',
    total: total.toFixed(2),
    carrito: carrito
  }, "Cqwg1EyqFLvPg7ULx")
  .then(function(response) {
    console.log("📧 Pedido con pago Nequi enviado correctamente");
    
    // Cerrar modal de pago
    const modalPagoNequi = document.getElementById('modalPagoNequi');
    modalPagoNequi.classList.remove('active');
    modalPagoNequi.classList.add('hidden');
    
    // Cerrar formulario de checkout
    const checkoutForm = document.getElementById('checkoutForm');
    checkoutForm.classList.remove('active');
    checkoutForm.classList.add('hidden');
    
    // Mostrar confirmación
    mostrarConfirmacionPedido(orderNumber);
    
    // Limpiar carrito
    appState.cart.clear();
    actualizarContadorCarrito();
  })
  .catch(function(error) {
    console.error("❌ Error al enviar correo:", error);
    alert("Hubo un error al procesar el pago. Por favor, intenta nuevamente.");
  });
}

// Función para mostrar modal de pago Daviplata
function mostrarModalPagoDaviplata(total, orderNumber, cliente, carrito) {
  // Crear modal de pago Daviplata si no existe
  let modalPagoDaviplata = document.getElementById('modalPagoDaviplata');
  
  if (!modalPagoDaviplata) {
    modalPagoDaviplata = document.createElement('div');
    modalPagoDaviplata.id = 'modalPagoDaviplata';
    modalPagoDaviplata.className = 'modal hidden';
    modalPagoDaviplata.setAttribute('role', 'dialog');
    modalPagoDaviplata.setAttribute('aria-modal', 'true');
    
    modalPagoDaviplata.innerHTML = `
      <div class="modal-content payment-modal">
        <button class="close-modal" aria-label="Cerrar">&times;</button>
        <h2>Pago con Daviplata</h2>
        <div class="payment-info">
          <p>Total a pagar: <strong>$${total.toLocaleString()}</strong></p>
          <p>Número de pedido: <strong>${orderNumber}</strong></p>
          
          <div class="manual-payment">
            <p>Realiza una transferencia a:</p>
            <p><strong>Número Daviplata:</strong> 320 492 9202</p>
            <p><strong>Nombre:</strong> Beauty Line</p>
          </div>
          
          <form id="formPagoDaviplata" class="payment-form">
            <div class="form-group">
              <label for="daviplataPhone">Tu número de teléfono Daviplata</label>
              <input type="tel" id="daviplataPhone" placeholder="320 492 9202" required>
            </div>
            <button type="submit" class="btn-submit-payment">Confirmar Pago</button>
          </form>
        </div>
      </div>
    `;
    
    document.body.appendChild(modalPagoDaviplata);
    
    // Configurar eventos
    const closeBtn = modalPagoDaviplata.querySelector('.close-modal');
    const form = modalPagoDaviplata.querySelector('#formPagoDaviplata');
    
    closeBtn.addEventListener('click', () => {
      modalPagoDaviplata.classList.remove('active');
      modalPagoDaviplata.classList.add('hidden');
    });
    
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      procesarPagoDaviplata(total, orderNumber, cliente, carrito);
    });
  }
  
  // Mostrar modal
  modalPagoDaviplata.classList.remove('hidden');
  modalPagoDaviplata.classList.add('active');
}

// Función para procesar pago Daviplata
function procesarPagoDaviplata(total, orderNumber, cliente, carrito) {
  // Simular procesamiento de pago
  console.log('📱 Procesando pago con Daviplata...');
  
  // Enviar correo con los datos del pedido
  emailjs.send("service_owxur5f", "template_sck7rdl", {
    nombre: cliente.nombre,
    email: cliente.email,
    telefono: cliente.telefono,
    direccion: cliente.direccion,
    referidor: cliente.referidor,
    metodo_pago: 'Daviplata',
    total: total.toFixed(2),
    carrito: carrito
  }, "Cqwg1EyqFLvPg7ULx")
  .then(function(response) {
    console.log("📧 Pedido con pago Daviplata enviado correctamente");
    
    // Cerrar modal de pago
    const modalPagoDaviplata = document.getElementById('modalPagoDaviplata');
    modalPagoDaviplata.classList.remove('active');
    modalPagoDaviplata.classList.add('hidden');
    
    // Cerrar formulario de checkout
    const checkoutForm = document.getElementById('checkoutForm');
    checkoutForm.classList.remove('active');
    checkoutForm.classList.add('hidden');
    
    // Mostrar confirmación
    mostrarConfirmacionPedido(orderNumber);
    
    // Limpiar carrito
    appState.cart.clear();
    actualizarContadorCarrito();
  })
  .catch(function(error) {
    console.error("❌ Error al enviar correo:", error);
    alert("Hubo un error al procesar el pago. Por favor, intenta nuevamente.");
  });
}

// Función para mostrar modal de pago Bancolombia
function mostrarModalPagoBancolombia(total, orderNumber, cliente, carrito) {
  // Crear modal de pago Bancolombia si no existe
  let modalPagoBancolombia = document.getElementById('modalPagoBancolombia');
  
  if (!modalPagoBancolombia) {
    modalPagoBancolombia = document.createElement('div');
    modalPagoBancolombia.id = 'modalPagoBancolombia';
    modalPagoBancolombia.className = 'modal hidden';
    modalPagoBancolombia.setAttribute('role', 'dialog');
    modalPagoBancolombia.setAttribute('aria-modal', 'true');
    
    modalPagoBancolombia.innerHTML = `
      <div class="modal-content payment-modal">
        <button class="close-modal" aria-label="Cerrar">&times;</button>
        <h2>Pago con Bancolombia</h2>
        <div class="payment-info">
          <p>Total a pagar: <strong>$${total.toLocaleString()}</strong></p>
          <p>Número de pedido: <strong>${orderNumber}</strong></p>
          
          <div class="qr-payment">
            <p>Escanea el código QR con tu app de Bancolombia:</p>
            <img src="/assets/qr-placeholder.png" alt="Código QR para pago" class="qr-code">
          </div>
          
          <div class="manual-payment">
            <p>O realiza una transferencia a:</p>
            <p><strong>Cuenta de Ahorros:</strong> 123-456789-00</p>
            <p><strong>Nombre:</strong> Beauty Line</p>
            <p><strong>Teléfono:</strong> 320 492 9202</p>
          </div>
          
          <form id="formPagoBancolombia" class="payment-form">
            <div class="form-group">
              <label for="comprobante">Comprobante de pago (opcional)</label>
              <input type="file" id="comprobante" accept="image/*">
            </div>
            <button type="submit" class="btn-submit-payment">Confirmar Pago</button>
          </form>
        </div>
      </div>
    `;
    
    document.body.appendChild(modalPagoBancolombia);
    
    // Configurar eventos
    const closeBtn = modalPagoBancolombia.querySelector('.close-modal');
    const form = modalPagoBancolombia.querySelector('#formPagoBancolombia');
    
    closeBtn.addEventListener('click', () => {
      modalPagoBancolombia.classList.remove('active');
      modalPagoBancolombia.classList.add('hidden');
    });
    
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      procesarPagoBancolombia(total, orderNumber, cliente, carrito);
    });
  }
  
  // Mostrar modal
  modalPagoBancolombia.classList.remove('hidden');
  modalPagoBancolombia.classList.add('active');
}

// Función para procesar pago Bancolombia
function procesarPagoBancolombia(total, orderNumber, cliente, carrito) {
  // Simular procesamiento de pago
  console.log('🏦 Procesando pago con Bancolombia...');
  
  // Enviar correo con los datos del pedido
  emailjs.send("service_owxur5f", "template_sck7rdl", {
    nombre: cliente.nombre,
    email: cliente.email,
    telefono: cliente.telefono,
    direccion: cliente.direccion,
    referidor: cliente.referidor,
    metodo_pago: 'Bancolombia',
    total: total.toFixed(2),
    carrito: carrito
  }, "Cqwg1EyqFLvPg7ULx")
  .then(function(response) {
    console.log("📧 Pedido con pago Bancolombia enviado correctamente");
    
    // Cerrar modal de pago
    const modalPagoBancolombia = document.getElementById('modalPagoBancolombia');
    modalPagoBancolombia.classList.remove('active');
    modalPagoBancolombia.classList.add('hidden');
    
    // Cerrar formulario de checkout
    const checkoutForm = document.getElementById('checkoutForm');
    checkoutForm.classList.remove('active');
    checkoutForm.classList.add('hidden');
    
    // Mostrar confirmación
    mostrarConfirmacionPedido(orderNumber);
    
    // Limpiar carrito
    appState.cart.clear();
    actualizarContadorCarrito();
  })
  .catch(function(error) {
    console.error("❌ Error al enviar correo:", error);
    alert("Hubo un error al procesar el pago. Por favor, intenta nuevamente.");
  });
}

// Función para mostrar modal de transferencia bancaria
function mostrarModalTransferencia(total, orderNumber, cliente, carrito) {
  // Crear modal de transferencia si no existe
  let modalTransferencia = document.getElementById('modalTransferencia');
  
  if (!modalTransferencia) {
    modalTransferencia = document.createElement('div');
    modalTransferencia.id = 'modalTransferencia';
    modalTransferencia.className = 'modal hidden';
    modalTransferencia.setAttribute('role', 'dialog');
    modalTransferencia.setAttribute('aria-modal', 'true');
    
    modalTransferencia.innerHTML = `
      <div class="modal-content payment-modal">
        <button class="close-modal" aria-label="Cerrar">&times;</button>
        <h2>Transferencia Bancaria</h2>
        <div class="payment-info">
          <p>Total a pagar: <strong>$${total.toLocaleString()}</strong></p>
          <p>Número de pedido: <strong>${orderNumber}</strong></p>
          
          <div class="bank-details">
            <p>Por favor realiza una transferencia a la siguiente cuenta:</p>
            <ul>
              <li><strong>Banco:</strong> Banco de Bogotá</li>
              <li><strong>Tipo de cuenta:</strong> Ahorros</li>
              <li><strong>Número de cuenta:</strong> 123456789</li>
              <li><strong>Titular:</strong> Beauty Line SAS</li>
              <li><strong>Teléfono:</strong> 320 492 9202</li>
            </ul>
          </div>
          
          <form id="formTransferencia" class="payment-form">
            <div class="form-group">
              <label for="comprobanteTrans">Comprobante de transferencia (opcional)</label>
              <input type="file" id="comprobanteTrans" accept="image/*">
            </div>
            <button type="submit" class="btn-submit-payment">Confirmar Transferencia</button>
          </form>
        </div>
      </div>
    `;
    
    document.body.appendChild(modalTransferencia);
    
    // Configurar eventos
    const closeBtn = modalTransferencia.querySelector('.close-modal');
    const form = modalTransferencia.querySelector('#formTransferencia');
    
    closeBtn.addEventListener('click', () => {
      modalTransferencia.classList.remove('active');
      modalTransferencia.classList.add('hidden');
    });
    
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      procesarTransferencia(total, orderNumber, cliente, carrito);
    });
  }
  
  // Mostrar modal
  modalTransferencia.classList.remove('hidden');
  modalTransferencia.classList.add('active');
}

// Función para procesar transferencia bancaria
function procesarTransferencia(total, orderNumber, cliente, carrito) {
  // Simular procesamiento de transferencia
  console.log('🏦 Procesando transferencia bancaria...');
  
  // Enviar correo con los datos del pedido
  emailjs.send("service_owxur5f", "template_sck7rdl", {
    nombre: cliente.nombre,
    email: cliente.email,
    telefono: cliente.telefono,
    direccion: cliente.direccion,
    referidor: cliente.referidor,
    metodo_pago: 'Transferencia bancaria',
    total: total.toFixed(2),
    carrito: carrito
  }, "Cqwg1EyqFLvPg7ULx")
  .then(function(response) {
    console.log("📧 Pedido con transferencia bancaria enviado correctamente");
    
    // Cerrar modal de transferencia
    const modalTransferencia = document.getElementById('modalTransferencia');
    modalTransferencia.classList.remove('active');
    modalTransferencia.classList.add('hidden');
    
    // Cerrar formulario de checkout
    const checkoutForm = document.getElementById('checkoutForm');
    checkoutForm.classList.remove('active');
    checkoutForm.classList.add('hidden');
    
    // Mostrar confirmación
    mostrarConfirmacionPedido(orderNumber);
    
    // Limpiar carrito
    appState.cart.clear();
    actualizarContadorCarrito();
  })
  .catch(function(error) {
    console.error("❌ Error al enviar correo:", error);
    alert("Hubo un error al procesar el pago. Por favor, intenta nuevamente.");
  });
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
  
  // Verificar que EmailJS esté disponible
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
      
      if (checkoutForm && checkoutForm.classList.contains('active')) {
        checkoutForm.classList.remove('active');
        checkoutForm.classList.add('hidden');
      }
      
      if (confirmationModal && confirmationModal.classList.contains('active')) {
        confirmationModal.classList.remove('active');
        confirmationModal.classList.add('hidden');
      }
    }
  });
});
