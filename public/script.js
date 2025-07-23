// Estado global de la aplicación (expuesto globalmente para el filtro)
window.appState = {
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

const SUPABASE_URL = 'https://ixvn1234567890abcdef.supabase.co'; // Tu Project URL
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'; // Tu anon public key

const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);


// Renderizar productos (expuesto globalmente para el filtro)
window.renderizarProductos = function renderizarProductos(productos) {
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
      `<div class='product-card'>
        <div class='product-image-container'>
          <img src='${producto.image}' alt='${producto.name}' class='product-image' loading='lazy' onerror="this.onerror=null; this.src='/images/default-product.html';">
          ${producto.badge ? `<span class="product-badge">${producto.badge}</span>` : ''}
        </div>
        <div class='product-info'>
          <h3 class='product-title'>${producto.name}</h3>
          ${producto.description ? `<p class='product-description'>${producto.description}</p>` : ''}
          <div class='product-price'>$${producto.price.toLocaleString()}</div>
          <button class='add-to-cart' data-id='${producto.id}' data-name='${producto.name}' data-price='${producto.price}'>
            Agregar al carrito
          </button>
        </div>
      </div>`
    )).join('');

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
    contenedor.innerHTML = `<p class='error-message'>Error al mostrar los productos: ${error.message}</p>`;
  }
}

// Mostrar carrito
function mostrarCarrito() {
  const modal = document.getElementById('carrito-modal');
  const lista = modal.querySelector('.cart-items');
  const total = modal.querySelector('.total-amount');

  if (!modal || !lista || !total) return;

  lista.innerHTML = '';

  if (appState.cart.items.length === 0) {
    lista.innerHTML = '<p class="empty-cart">Tu carrito está vacío</p>';
    total.textContent = '$0';
  } else {
    appState.cart.items.forEach(item => {
      const itemDiv = document.createElement('div');
      itemDiv.className = 'cart-item';
      itemDiv.innerHTML = `
        <span class="item-name">${item.name}</span>
        <span class="item-quantity">x${item.quantity}</span>
        <span class="item-price">$${(item.price * item.quantity).toLocaleString()}</span>
      `;
      lista.appendChild(itemDiv);
    });
    total.textContent = `$${appState.cart.getTotal().toLocaleString()}`;
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

// Actualizar contador del carrito
function actualizarContadorCarrito() {
  const count = appState.cart.items.reduce((sum, item) => sum + item.quantity, 0);
  const countElement = document.getElementById('cart-count');
  if (countElement) {
    countElement.textContent = count;
    countElement.style.display = count ? 'inline-block' : 'none';
  }
}

// Cargar productos
function cargarProductos() {
  console.log('🔄 Cargando productos...');
  
  // Cargar directamente desde el JSON local para evitar problemas CORS
  try {
    cargarProductosCompletos();
  } catch (e) {
    console.error('Error al cargar productos:', e);
    // Mostrar mensaje de error
    const contenedor = document.getElementById('product-list');
    if (contenedor) {
      contenedor.innerHTML = "<p class='error-message'>Error al cargar productos. Por favor, intenta recargar la página.</p>";
    }
  }
}

// Cargar productos completos directamente (expuesto globalmente para el filtro)
window.cargarProductosCompletos = async function cargarProductosCompletos() {
  console.log('🔄 Cargando productos desde Supabase...');

  try {
    const { data: productos, error } = await supabase
      .from('products')
      .select('*')
      .order('id');

    if (error) {
      throw error;
    }

    if (productos && productos.length > 0) {
      appState.productos = productos;
      console.log('✅ Productos cargados desde Supabase:', productos.length);
      renderizarProductos(productos);
      setupFilters();
      return;
    }
  } catch (error) {
    console.error('❌ Error al cargar productos desde Supabase:', error);
    const contenedor = document.getElementById('product-list');
    if (contenedor) {
      contenedor.innerHTML = "<p class='error-message'>Error al cargar productos desde Supabase.</p>";
    }
  }
}

// Configurar filtros
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
      appState.cart.clear();
      actualizarContadorCarrito();
      mostrarCarrito();
    });
  }

  if (finalizarCompraBtn) {
    finalizarCompraBtn.addEventListener('click', mostrarFormularioPedido);
  }
}

// Mostrar formulario de pedido
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

// Procesar pedido
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
    
    // Validar específicamente el campo referidor
    if (!referidor) {
      alert('Por favor indica quién te refirió. Este campo es obligatorio.');
      document.getElementById('referidor').focus();
      return;
    }
    
    // Calcular totales
    const subtotal = appState.cart.getTotal();
    const shipping = subtotal > 200000 ? 0 : 12000;
    const total = subtotal + shipping;
    
    // Generar número de pedido
    const orderNumber = `BL-${Date.now().toString().slice(-6)}`;
    
    // Preparar datos del carrito para el correo
    const carrito = appState.cart.items.map(item => `${item.quantity}x ${item.name} ($${item.price.toLocaleString()})`).join(", ");
    
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
        carrito,
        referencia: orderNumber
      }, "Cqwg1EyqFLvPg7ULx")
      .then(function(response) {
        console.log("📧 Pedido enviado correctamente");
        
        // Cerrar formulario de checkout
        const checkoutForm = document.getElementById('checkoutForm');
        checkoutForm.classList.remove('active');
        checkoutForm.classList.add('hidden');
        
        try {
          // Mostrar modal de Wompi
          mostrarModalWompi(total, orderNumber);
        } catch (e) {
          console.error('Error al mostrar modal de Wompi:', e);
          // Abrir Wompi directamente si hay error
          window.open("https://checkout.wompi.co/l/VPOS_nJo3xk", '_blank');
          // Mostrar confirmación
          mostrarConfirmacionPedido(orderNumber);
          // Limpiar carrito
          appState.cart.clear();
          actualizarContadorCarrito();
        }
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
  
  // URL directa de Wompi
  const urlWompi = "https://checkout.wompi.co/l/VPOS_nJo3xk";
  
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
          <a href="${urlWompi}" target="_blank" id="btnIrAWompi" class="btn-submit-order">Ir a Wompi</a>
        </div>
      </div>
    </div>
  `;
  
  document.body.appendChild(wompiModal);
  
  // Configurar el botón para ir a Wompi
  document.getElementById('btnIrAWompi').addEventListener('click', () => {
    // Cerrar el modal y mostrar confirmación
    setTimeout(() => {
      document.getElementById('wompiModal').remove();
      mostrarConfirmacionPedido(orderNumber);
      
      // Limpiar carrito
      appState.cart.clear();
      actualizarContadorCarrito();
    }, 500);
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

// Mostrar confirmación de pedido
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

// Inicialización
document.addEventListener('DOMContentLoaded', () => {
  console.log('🚀 Inicializando aplicación...');
  
  // Agregar botón para limpiar caché (solo visible en desarrollo)
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    const limpiarBtn = document.createElement('button');
    limpiarBtn.textContent = 'Limpiar Caché';
    limpiarBtn.style.position = 'fixed';
    limpiarBtn.style.bottom = '10px';
    limpiarBtn.style.right = '10px';
    limpiarBtn.style.zIndex = '9999';
    limpiarBtn.style.padding = '5px 10px';
    limpiarBtn.style.backgroundColor = '#d63384';
    limpiarBtn.style.color = 'white';
    limpiarBtn.style.border = 'none';
    limpiarBtn.style.borderRadius = '4px';
    limpiarBtn.style.cursor = 'pointer';
    limpiarBtn.style.fontSize = '12px';
    
    limpiarBtn.addEventListener('click', () => {
      localStorage.removeItem('productos');
      localStorage.removeItem('productosCache');
      localStorage.removeItem('lastUpdate');
      window.location.reload(true);
    });
    
    document.body.appendChild(limpiarBtn);
  }
  
  // Cargar productos desde la API primero
  configurarCarrito();
  actualizarContadorCarrito();
  cargarProductosCompletos()
  
  // Actualizar año en el footer
  document.getElementById('current-year').textContent = new Date().getFullYear();
});
